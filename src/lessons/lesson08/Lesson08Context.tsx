import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { isMnistDatasetSize, loadMnistDataset, loadMnistMetadata } from '../lesson07/mnistLoader'
import type { MnistDatasetSize, MnistSample } from '../lesson07/mnistTypes'
import { BATCH_SIZE, friendlyErrorMessages } from './lesson08Data'
import { loadExperimentRecords, saveExperimentRecord } from './experimentStorage'
import { loadMnistTestDataset } from './mnistTestLoader'
import {
  createTrainableModel,
  createTrainingTensors,
  evaluateModel,
  fitModel,
  loadTensorFlow,
  predictDrawing as runDrawingPrediction,
  type OwnedOptimizer,
  type TrainableModel,
} from './mnistTrainingEngine'
import type {
  BatchProgress,
  DrawingPrediction,
  EpochMetric,
  EvaluationResult,
  ExperimentRecord,
  Lesson08Epochs,
  Lesson08ModelType,
  OperationError,
  OperationErrorKind,
  TrainingConfig,
  TrainingResult,
  TrainingStatus,
} from './lesson08Types'

const LESSON07_SIZE_KEY = 'deep-learning-lab:lesson07:dataset-size'

export interface SamplePrediction {
  sampleId: string
  prediction: DrawingPrediction
  trained: boolean
  modelType: Lesson08ModelType
  recordId?: string
}

interface Lesson08LabValue {
  datasetSize: MnistDatasetSize
  epochs: Lesson08Epochs
  modelType: Lesson08ModelType
  summaryConfirmed: boolean
  status: TrainingStatus
  backend: string | null
  currentEpoch: number
  elapsedMs: number
  liveMetric: EpochMetric | null
  batchProgress: BatchProgress | null
  trainingResult: TrainingResult | null
  evaluation: EvaluationResult | null
  evaluationRecordId: string | null
  drawingPrediction: DrawingPrediction | null
  drawingRecordId: string | null
  samplePrediction: SamplePrediction | null
  previewBusy: boolean
  previewStatus: 'idle' | 'loading' | 'ready' | 'error'
  previewError: string | null
  experiments: ExperimentRecord[]
  error: OperationError | null
  modelReady: boolean
  isBusy: boolean
  setDatasetSize: (size: MnistDatasetSize) => void
  setEpochs: (epochs: Lesson08Epochs) => void
  setModelType: (type: Lesson08ModelType) => void
  confirmSummary: () => void
  startTraining: () => Promise<void>
  cancelTraining: () => void
  evaluateTest: () => Promise<void>
  previewSample: (sample: MnistSample) => Promise<void>
  predictDrawing: (normalized: number[], previewPixels: number[]) => Promise<void>
  clearDrawingPrediction: () => void
  markEmptyDrawing: () => void
  clearError: () => void
  emptyDrawingMessage: string | null
}

const Lesson08LabContext = createContext<Lesson08LabValue | null>(null)

class OperationFailure extends Error {
  kind: OperationErrorKind

  constructor(kind: OperationErrorKind, cause: unknown) {
    super(cause instanceof Error ? cause.message : String(cause))
    this.kind = kind
  }
}

function initialDatasetSize(): MnistDatasetSize {
  try {
    const value = Number(localStorage.getItem(LESSON07_SIZE_KEY))
    return isMnistDatasetSize(value) ? value : 1_000
  } catch {
    return 1_000
  }
}

function makeOperationError(kind: OperationErrorKind, detail: unknown): OperationError {
  return {
    kind,
    message: friendlyErrorMessages[kind],
    detail: detail instanceof Error ? detail.message : String(detail),
  }
}

function disposeOwned(model: TrainableModel | null, optimizer: OwnedOptimizer | null) {
  try {
    model?.dispose()
  } catch {
    // 이미 정리된 모델은 다시 정리하지 않습니다.
  }
  try {
    optimizer?.dispose()
  } catch {
    // 모델과 함께 정리된 optimizer일 수 있습니다.
  }
}

function readScopedExperiments(key: string): ExperimentRecord[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter((value): value is ExperimentRecord => {
      if (!value || typeof value !== 'object') return false
      const record = value as Partial<ExperimentRecord>
      const finite = (item: unknown): item is number => typeof item === 'number' && Number.isFinite(item)
      const unit = (item: unknown) => finite(item) && item >= 0 && item <= 1
      return typeof record.id === 'string' && typeof record.datasetVersion === 'string' &&
        finite(record.trainSampleCount) && isMnistDatasetSize(record.trainSampleCount) &&
        ['simple', 'textbook', 'wide'].includes(String(record.modelType)) &&
        [1, 3, 5].includes(Number(record.epochs)) && record.batchSize === 32 &&
        finite(record.finalTrainLoss) && unit(record.finalTrainAccuracy) &&
        (record.testAccuracy === null || unit(record.testAccuracy)) &&
        (record.testCorrect === null || (finite(record.testCorrect) && Number.isInteger(record.testCorrect) && record.testCorrect >= 0 && record.testCorrect <= 500)) &&
        (record.testWrong === null || (finite(record.testWrong) && Number.isInteger(record.testWrong) && record.testWrong >= 0 && record.testWrong <= 500)) &&
        finite(record.durationMs) && record.durationMs >= 0 && typeof record.timestamp === 'string'
    })
  } catch { return [] }
}

function loadSessionExperiments(key?: string) {
  const legacy = loadExperimentRecords()
  return key ? [...readScopedExperiments(key), ...legacy] : legacy
}

function saveSessionExperiment(record: ExperimentRecord, key?: string) {
  if (!key) return saveExperimentRecord(record)
  const scoped = [record, ...readScopedExperiments(key).filter((item) => item.id !== record.id)]
  try { localStorage.setItem(key, JSON.stringify(scoped)) } catch { /* Keep the current result in memory when storage is unavailable. */ }
  return [...scoped, ...loadExperimentRecords()]
}

export function Lesson08LabProvider({ children, experimentStorageKey }: { children: ReactNode; experimentStorageKey?: string }) {
  const [datasetSize, setDatasetSizeState] = useState<MnistDatasetSize>(initialDatasetSize)
  const [epochs, setEpochsState] = useState<Lesson08Epochs>(3)
  const [modelType, setModelTypeState] = useState<Lesson08ModelType>('textbook')
  const [summaryConfirmed, setSummaryConfirmed] = useState(false)
  const [status, setStatus] = useState<TrainingStatus>('idle')
  const [backend, setBackend] = useState<string | null>(null)
  const [currentEpoch, setCurrentEpoch] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [liveMetric, setLiveMetric] = useState<EpochMetric | null>(null)
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null)
  const [trainingResult, setTrainingResult] = useState<TrainingResult | null>(null)
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)
  const [evaluationRecordId, setEvaluationRecordId] = useState<string | null>(null)
  const [drawingPrediction, setDrawingPrediction] = useState<DrawingPrediction | null>(null)
  const [drawingRecordId, setDrawingRecordId] = useState<string | null>(null)
  const [samplePrediction, setSamplePrediction] = useState<SamplePrediction | null>(null)
  const [previewBusy, setPreviewBusy] = useState(false)
  const [previewStatus, setPreviewStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [experiments, setExperiments] = useState<ExperimentRecord[]>(() => loadSessionExperiments(experimentStorageKey))
  const [error, setError] = useState<OperationError | null>(null)
  const [modelReady, setModelReady] = useState(false)
  const [emptyDrawingMessage, setEmptyDrawingMessage] = useState<string | null>(null)

  const mountedRef = useRef(true)
  const operationBusyRef = useRef(false)
  const trainingRunRef = useRef(0)
  const cancelRequestedRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const trainingModelRef = useRef<TrainableModel | null>(null)
  const trainingOptimizerRef = useRef<OwnedOptimizer | null>(null)
  const currentModelRef = useRef<TrainableModel | null>(null)
  const currentOptimizerRef = useRef<OwnedOptimizer | null>(null)
  const currentRecordIdRef = useRef<string | null>(null)
  const previewRunRef = useRef(0)
  const untrainedModelsRef = useRef(new Map<Lesson08ModelType, { model: TrainableModel; optimizer: OwnedOptimizer }>())

  const isBusy = previewBusy || [
    'loading-data',
    'loading-engine',
    'converting-data',
    'preparing-model',
    'training',
    'summarizing',
    'evaluating',
    'predicting',
  ].includes(status)

  const setDatasetSize = useCallback((size: MnistDatasetSize) => {
    if (operationBusyRef.current) return
    setDatasetSizeState(size)
    setSummaryConfirmed(false)
  }, [])

  const setEpochs = useCallback((value: Lesson08Epochs) => {
    if (operationBusyRef.current) return
    setEpochsState(value)
    setSummaryConfirmed(false)
  }, [])

  const setModelType = useCallback((value: Lesson08ModelType) => {
    if (operationBusyRef.current) return
    setModelTypeState(value)
    setSummaryConfirmed(false)
  }, [])

  const confirmSummary = useCallback(() => setSummaryConfirmed(true), [])
  const clearError = useCallback(() => setError(null), [])

  const startTraining = useCallback(async () => {
    if (operationBusyRef.current) return
    operationBusyRef.current = true
    const runId = trainingRunRef.current + 1
    trainingRunRef.current = runId
    const isCurrentRun = () => mountedRef.current && trainingRunRef.current === runId
    cancelRequestedRef.current = false
    const controller = new AbortController()
    abortControllerRef.current = controller
    const selected = { datasetSize, epochs, modelType }
    let nextModel: TrainableModel | null = null
    let nextOptimizer: OwnedOptimizer | null = null
    let trainXs: import('@tensorflow/tfjs').Tensor2D | null = null
    let trainYs: import('@tensorflow/tfjs').Tensor2D | null = null

    if (isCurrentRun()) {
      setError(null)
      setStatus('loading-data')
      setCurrentEpoch(0)
      setElapsedMs(0)
      setLiveMetric(null)
      setBatchProgress(null)
      setTrainingResult(null)
      setEvaluation(null)
      setEvaluationRecordId(null)
      setDrawingPrediction(null)
      setDrawingRecordId(null)
      setSamplePrediction(null)
      setModelReady(false)
      setEmptyDrawingMessage(null)
    }

    try {
      let dataset
      let metadata
      try {
        ;[dataset, metadata] = await Promise.all([
          loadMnistDataset(selected.datasetSize, controller.signal),
          loadMnistMetadata(controller.signal),
        ])
      } catch (cause) {
        if (controller.signal.aborted) throw cause
        throw new OperationFailure('data', cause)
      }
      if (!isCurrentRun() || cancelRequestedRef.current || controller.signal.aborted) throw new DOMException('취소됨', 'AbortError')

      if (isCurrentRun()) setStatus('loading-engine')
      let tf
      try {
        tf = await loadTensorFlow()
      } catch (cause) {
        throw new OperationFailure('engine', cause)
      }
      if (!isCurrentRun() || cancelRequestedRef.current) throw new DOMException('취소됨', 'AbortError')

      if (isCurrentRun()) {
        setBackend(tf.getBackend() || 'unknown')
        setStatus('converting-data')
      }
      await tf.nextFrame()
      if (!isCurrentRun() || cancelRequestedRef.current) throw new DOMException('취소됨', 'AbortError')

      disposeOwned(currentModelRef.current, currentOptimizerRef.current)
      currentModelRef.current = null
      currentOptimizerRef.current = null
      currentRecordIdRef.current = null

      try {
        const tensors = createTrainingTensors(tf, dataset)
        trainXs = tensors.trainXs
        trainYs = tensors.trainYs
      } catch (cause) {
        throw new OperationFailure('training', cause)
      }
      if (isCurrentRun()) setStatus('preparing-model')
      await tf.nextFrame()
      if (!isCurrentRun() || cancelRequestedRef.current) throw new DOMException('취소됨', 'AbortError')
      try {
        const created = createTrainableModel(tf, selected.modelType)
        nextModel = created.model
        nextOptimizer = created.optimizer
        trainingModelRef.current = nextModel
        trainingOptimizerRef.current = nextOptimizer
      } catch (cause) {
        throw new OperationFailure('model', cause)
      }

      const backendName = tf.getBackend() || 'unknown'
      if (isCurrentRun()) {
        setBackend(backendName)
        setStatus('training')
      }
      const startedAt = performance.now()
      const elapsedTimer = window.setInterval(() => {
        if (isCurrentRun()) setElapsedMs(performance.now() - startedAt)
      }, 200)
      let history: EpochMetric[]
      try {
        history = await fitModel(
          tf,
          nextModel,
          trainXs,
          trainYs,
          selected.epochs,
          (progress) => {
            if (!isCurrentRun() || cancelRequestedRef.current) return
            setCurrentEpoch(progress.currentEpoch)
            setBatchProgress(progress)
            setLiveMetric({
              epoch: progress.currentEpoch,
              loss: progress.loss,
              accuracy: progress.accuracy,
            })
          },
          (metric) => {
            if (!isCurrentRun() || cancelRequestedRef.current) return
            setCurrentEpoch(metric.epoch)
            setLiveMetric(metric)
          },
        )
      } catch (cause) {
        throw new OperationFailure('training', cause)
      } finally {
        window.clearInterval(elapsedTimer)
      }
      const durationMs = performance.now() - startedAt

      if (isCurrentRun()) setStatus('summarizing')
      await tf.nextFrame()

      if (!isCurrentRun() || cancelRequestedRef.current || history.length !== selected.epochs) {
        throw new DOMException('취소됨', 'AbortError')
      }
      const finalMetric = history.at(-1)
      if (!finalMetric) throw new OperationFailure('training', new Error('완료된 epoch 기록이 없습니다.'))

      const config: TrainingConfig = {
        datasetVersion: metadata.datasetVersion,
        datasetSize: selected.datasetSize,
        epochs: selected.epochs,
        modelType: selected.modelType,
        batchSize: BATCH_SIZE,
      }
      const recordId = `mnist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const result: TrainingResult = {
        config,
        history,
        finalLoss: finalMetric.loss,
        finalAccuracy: finalMetric.accuracy,
        durationMs,
        completedEpochs: history.length,
        backend: backendName,
        recordId,
      }
      const record: ExperimentRecord = {
        id: recordId,
        datasetVersion: config.datasetVersion,
        trainSampleCount: config.datasetSize,
        modelType: config.modelType,
        epochs: config.epochs,
        batchSize: BATCH_SIZE,
        finalTrainLoss: result.finalLoss,
        finalTrainAccuracy: result.finalAccuracy,
        testAccuracy: null,
        testCorrect: null,
        testWrong: null,
        durationMs,
        timestamp: new Date().toISOString(),
      }

      currentModelRef.current = nextModel
      currentOptimizerRef.current = nextOptimizer
      currentRecordIdRef.current = recordId
      trainingModelRef.current = null
      trainingOptimizerRef.current = null
      nextModel = null
      nextOptimizer = null
      if (isCurrentRun()) {
        setTrainingResult(result)
        setElapsedMs(durationMs)
        setExperiments(saveSessionExperiment(record, experimentStorageKey))
        setModelReady(true)
        setStatus('trained')
      }
    } catch (cause) {
      disposeOwned(nextModel, nextOptimizer)
      trainingModelRef.current = null
      trainingOptimizerRef.current = null
      const cancelled = cancelRequestedRef.current || (cause instanceof DOMException && cause.name === 'AbortError')
      if (isCurrentRun()) {
        if (cancelled) {
          setStatus('cancelled')
        } else {
          const failure = cause instanceof OperationFailure ? cause : new OperationFailure('training', cause)
          setError(makeOperationError(failure.kind, failure))
          setStatus('error')
        }
      }
    } finally {
      trainXs?.dispose()
      trainYs?.dispose()
      abortControllerRef.current = null
      operationBusyRef.current = false
    }
  }, [datasetSize, epochs, modelType, experimentStorageKey])

  const cancelTraining = useCallback(() => {
    if (!operationBusyRef.current || status === 'evaluating') return
    cancelRequestedRef.current = true
    abortControllerRef.current?.abort()
    if (trainingModelRef.current) trainingModelRef.current.stopTraining = true
  }, [status])

  const evaluateTest = useCallback(async () => {
    const model = currentModelRef.current
    if (!model || operationBusyRef.current) return
    const recordId = currentRecordIdRef.current
    operationBusyRef.current = true
    const controller = new AbortController()
    abortControllerRef.current = controller
    if (mountedRef.current) {
      setStatus('evaluating')
      setError(null)
    }
    try {
      const testDataset = await loadMnistTestDataset(controller.signal)
      const tf = await loadTensorFlow()
      const result = await evaluateModel(tf, model, testDataset.samples)
      const currentRecord = loadSessionExperiments(experimentStorageKey).find((record) => record.id === recordId)
      if (currentRecord && mountedRef.current) {
        setExperiments(
          saveSessionExperiment({
            ...currentRecord,
            testAccuracy: result.accuracy,
            testCorrect: result.correct,
            testWrong: result.wrong,
          }, experimentStorageKey),
        )
      }
      if (mountedRef.current) {
        setEvaluation(result)
        setEvaluationRecordId(recordId)
        setStatus('ready')
      }
    } catch (cause) {
      if (mountedRef.current && !(cause instanceof DOMException && cause.name === 'AbortError')) {
        setError(makeOperationError('evaluation', cause))
        setStatus('error')
      }
    } finally {
      abortControllerRef.current = null
      operationBusyRef.current = false
    }
  }, [experimentStorageKey])

  const previewSample = useCallback(async (sample: MnistSample) => {
    if (operationBusyRef.current) return
    operationBusyRef.current = true
    const runId = ++previewRunRef.current
    const isCurrentPreview = () => mountedRef.current && previewRunRef.current === runId
    setPreviewBusy(true)
    setPreviewStatus('loading')
    setPreviewError(null)
    setSamplePrediction(null)
    try {
      const tf = await loadTensorFlow()
      if (!isCurrentPreview()) return
      const trainedModel = modelReady ? currentModelRef.current : null
      const recordId = trainedModel ? currentRecordIdRef.current : null
      const selectedType = trainedModel && trainingResult ? trainingResult.config.modelType : modelType
      let model = trainedModel
      if (!model) {
        // A separate, never-fitted model keeps the same weights across sample previews.
        let untrained = untrainedModelsRef.current.get(selectedType)
        if (!untrained) {
          untrained = createTrainableModel(tf, selectedType)
          untrainedModelsRef.current.set(selectedType, untrained)
        }
        model = untrained.model
      }
      const prediction = await runDrawingPrediction(tf, model, sample.pixels.map((pixel) => pixel / 255), [...sample.pixels])
      if (isCurrentPreview()) {
        setSamplePrediction({ sampleId: sample.id, prediction, trained: Boolean(trainedModel), modelType: selectedType, ...(recordId ? { recordId } : {}) })
        setPreviewStatus('ready')
      }
    } catch (cause) {
      if (isCurrentPreview()) {
        setPreviewError(cause instanceof Error ? cause.message : '샘플의 실제 예측을 실행하지 못했습니다.')
        setPreviewStatus('error')
      }
    } finally {
      operationBusyRef.current = false
      if (mountedRef.current) {
        setPreviewBusy(false)
        if (!isCurrentPreview()) setPreviewStatus('idle')
      }
    }
  }, [modelReady, modelType, trainingResult])

  const predictDrawing = useCallback(async (normalized: number[], previewPixels: number[]) => {
    const model = currentModelRef.current
    if (!model) {
      setError({ kind: 'drawing', message: '먼저 현재 세션에서 모델을 학습해 주세요.' })
      return
    }
    if (operationBusyRef.current) return
    operationBusyRef.current = true
    const recordId = currentRecordIdRef.current
    try {
      setError(null)
      setEmptyDrawingMessage(null)
      setStatus('predicting')
      const tf = await loadTensorFlow()
      const prediction = await runDrawingPrediction(tf, model, normalized, previewPixels)
      if (mountedRef.current) {
        setDrawingPrediction(prediction)
        setDrawingRecordId(recordId)
        setStatus(evaluation ? 'ready' : 'trained')
      }
    } catch (cause) {
      if (mountedRef.current) {
        setError(makeOperationError('drawing', cause))
        setStatus('error')
      }
    } finally {
      operationBusyRef.current = false
    }
  }, [evaluation])

  const clearDrawingPrediction = useCallback(() => {
    setDrawingPrediction(null)
    setDrawingRecordId(null)
    setEmptyDrawingMessage(null)
    setError((current) => (current?.kind === 'drawing' ? null : current))
  }, [])

  const markEmptyDrawing = useCallback(() => {
    setDrawingPrediction(null)
    setDrawingRecordId(null)
    setEmptyDrawingMessage('먼저 숫자를 그려 주세요.')
  }, [])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      trainingRunRef.current += 1
      previewRunRef.current += 1
      cancelRequestedRef.current = true
      abortControllerRef.current?.abort()
      for (const owned of untrainedModelsRef.current.values()) disposeOwned(owned.model, owned.optimizer)
      untrainedModelsRef.current.clear()
      if (trainingModelRef.current) {
        trainingModelRef.current.stopTraining = true
      } else {
        disposeOwned(currentModelRef.current, currentOptimizerRef.current)
        currentModelRef.current = null
        currentOptimizerRef.current = null
      }
    }
  }, [])

  const value = useMemo<Lesson08LabValue>(
    () => ({
      datasetSize,
      epochs,
      modelType,
      summaryConfirmed,
      status,
      backend,
      currentEpoch,
      elapsedMs,
      liveMetric,
      batchProgress,
      trainingResult,
      evaluation,
      evaluationRecordId,
      drawingPrediction,
      drawingRecordId,
      samplePrediction,
      previewBusy,
      previewStatus,
      previewError,
      experiments,
      error,
      modelReady,
      isBusy,
      setDatasetSize,
      setEpochs,
      setModelType,
      confirmSummary,
      startTraining,
      cancelTraining,
      evaluateTest,
      previewSample,
      predictDrawing,
      clearDrawingPrediction,
      markEmptyDrawing,
      clearError,
      emptyDrawingMessage,
    }),
    [
      datasetSize,
      epochs,
      modelType,
      summaryConfirmed,
      status,
      backend,
      currentEpoch,
      elapsedMs,
      liveMetric,
      batchProgress,
      trainingResult,
      evaluation,
      evaluationRecordId,
      drawingPrediction,
      drawingRecordId,
      samplePrediction,
      previewBusy,
      previewStatus,
      previewError,
      experiments,
      error,
      modelReady,
      isBusy,
      setDatasetSize,
      setEpochs,
      setModelType,
      confirmSummary,
      startTraining,
      cancelTraining,
      evaluateTest,
      previewSample,
      predictDrawing,
      clearDrawingPrediction,
      markEmptyDrawing,
      clearError,
      emptyDrawingMessage,
    ],
  )

  return <Lesson08LabContext.Provider value={value}>{children}</Lesson08LabContext.Provider>
}

export function useLesson08Lab() {
  const context = useContext(Lesson08LabContext)
  if (!context) throw new Error('useLesson08Lab must be used inside Lesson08LabProvider')
  return context
}
