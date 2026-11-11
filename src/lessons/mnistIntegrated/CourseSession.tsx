import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useProgress } from '../../hooks/useProgress'
import { loadMnistDataset, loadMnistMetadata } from '../lesson07/mnistLoader'
import type { MnistDataset, MnistMetadata, MnistSample } from '../lesson07/mnistTypes'
import { Lesson08LabProvider, useLesson08Lab } from '../lesson08/Lesson08Context'
import type { TestPrediction } from '../lesson08/lesson08Types'
import {
  COURSE_STORAGE_KEY, answerReady as isAnswerReady, appendDrawing, chooseNormalizationTarget, courseRequirements, evidenceKey,
  loadCourseRecord, saveCourseRecord,
  type AnswerId, type CourseRecord, type CourseRequirement, type CourseScene,
} from './courseState'

export type { AnswerId, CourseRecord, CourseScene } from './courseState'

export interface MnistCourseValue {
  record: CourseRecord
  dataset: MnistDataset | null
  metadata: MnistMetadata | null
  selectedSample: MnistSample | null
  selectedPixelIndex: number
  loading: boolean
  error: string | null
  retry: () => Promise<void>
  selectSample: (id: string) => void
  selectPixel: (index: number) => void
  setScene: (scene: CourseScene) => void
  setAnswer: (id: AnswerId, value: string) => void
  submitAnswer: (id: AnswerId, value?: string) => void
  answerReady: (id: AnswerId) => boolean
  requirements: CourseRequirement[]
  readyToComplete: boolean
  complete: () => boolean
  selectRepresentative: (prediction: TestPrediction) => void
}

const CourseContext = createContext<MnistCourseValue | null>(null)

function CourseStateProvider({ children }: { children: ReactNode }) {
  const lab = useLesson08Lab()
  const { pathname } = useLocation()
  const active = /^\/lesson\/(07|08)(?:\/|$)/.test(pathname)
  const [record, setRecord] = useState<CourseRecord>(loadCourseRecord)
  const [dataset, setDataset] = useState<MnistDataset | null>(null)
  const [metadata, setMetadata] = useState<MnistMetadata | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recordRef = useRef(record)
  recordRef.current = record
  const requestRef = useRef(0)
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => { saveCourseRecord(record) }, [record])

  const requestDataset = useCallback(async () => {
    if (!active) return
    const requestId = ++requestRef.current
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setLoading(true)
    setError(null)
    try {
      const [nextDataset, nextMetadata] = await Promise.all([
        loadMnistDataset(lab.datasetSize, controller.signal),
        loadMnistMetadata(controller.signal),
      ])
      if (controller.signal.aborted || requestId !== requestRef.current) return
      const sample = nextDataset.samples.find((item) => item.id === recordRef.current.sampleId) ?? nextDataset.samples[0]
      if (!sample) throw new Error('사용할 수 있는 MNIST 이미지가 없습니다.')
      setDataset(nextDataset)
      setMetadata(nextMetadata)
      setRecord((current) => {
        const previous = current.normalizationTarget
        const target = previous?.sampleId === sample.id && sample.pixels[previous.index] === previous.value
          ? previous : chooseNormalizationTarget(sample)
        return { ...current, sampleId: sample.id, pixelIndex: current.sampleId === sample.id ? current.pixelIndex : 0, normalizationTarget: target }
      })
    } catch (cause) {
      if (controller.signal.aborted || requestId !== requestRef.current) return
      setDataset(null)
      setError(cause instanceof Error ? cause.message : 'MNIST 데이터를 불러오지 못했습니다.')
    } finally {
      if (requestId === requestRef.current) setLoading(false)
    }
  }, [active, lab.datasetSize])

  useEffect(() => {
    if (active) void requestDataset()
    else setLoading(false)
    return () => { controllerRef.current?.abort(); requestRef.current += 1 }
  }, [active, requestDataset])

  // Only actual, completed runtime results enter the integrated course record.
  useEffect(() => {
    const result = lab.trainingResult
    if (!result) return
    setRecord((current) => current.training?.recordId === result.recordId ? current : {
      ...current, training: result, evaluation: null, drawings: [],
    })
  }, [lab.trainingResult])

  useEffect(() => {
    const result = lab.evaluation
    const recordId = lab.evaluationRecordId
    if (!result || !recordId) return
    const representative = result.predictions.find((item) => item.actualLabel !== item.predictedLabel) ?? result.predictions[0] ?? null
    setRecord((current) => current.training?.recordId !== recordId ? current : {
      ...current,
      evaluation: { recordId, sampleCount: result.sampleCount, correct: result.correct, wrong: result.wrong, accuracy: result.accuracy, representative },
    })
  }, [lab.evaluation, lab.evaluationRecordId])

  useEffect(() => {
    const prediction = lab.drawingPrediction
    const recordId = lab.drawingRecordId
    if (!prediction || !recordId) return
    setRecord((current) => current.training?.recordId !== recordId ? current : {
      ...current, drawings: appendDrawing(current.drawings, { ...prediction, previewPixels: [...prediction.previewPixels], recordId }),
    })
  }, [lab.drawingPrediction, lab.drawingRecordId])

  const selectSample = useCallback((id: string) => {
    const sample = dataset?.samples.find((item) => item.id === id)
    if (!sample) return
    setRecord((current) => current.sampleId === id ? current : {
      ...current, sampleId: id, pixelIndex: 0, normalizationTarget: chooseNormalizationTarget(sample),
    })
  }, [dataset])
  const selectPixel = useCallback((index: number) => {
    if (Number.isInteger(index) && index >= 0 && index < 784) setRecord((current) => ({ ...current, pixelIndex: index }))
  }, [])
  const setScene = useCallback((scene: CourseScene) => {
    if (Number.isInteger(scene) && scene >= 1 && scene <= 7) setRecord((current) => current.scene === scene ? current : { ...current, scene })
  }, [])
  const setAnswer = useCallback((id: AnswerId, value: string) => {
    setRecord((current) => ({ ...current, answers: { ...current.answers, [id]: { value, submitted: false } } }))
  }, [])
  const submitAnswer = useCallback((id: AnswerId, value?: string) => {
    setRecord((current) => ({ ...current, answers: { ...current.answers, [id]: {
      value: value ?? current.answers[id].value, submitted: true, evidenceKey: evidenceKey(current, id),
    } } }))
  }, [])
  const answerReady = useCallback((id: AnswerId) => isAnswerReady(record, id), [record])
  const requirements = useMemo(() => courseRequirements(record), [record])
  const readyToComplete = requirements.every((item) => item.ready) && !lab.isBusy
  const complete = useCallback(() => {
    if (!readyToComplete) return false
    setRecord((current) => current.completedAt ? current : { ...current, completedAt: new Date().toISOString() })
    return true
  }, [readyToComplete])
  const selectRepresentative = useCallback((prediction: TestPrediction) => {
    const actual = lab.evaluation?.predictions.find((item) => item.sample.id === prediction.sample.id)
    if (!actual || !lab.evaluation || !lab.evaluationRecordId) return
    if (lab.evaluation.wrong > 0 && actual.actualLabel === actual.predictedLabel) return
    const recordId = lab.evaluationRecordId
    setRecord((current) => current.evaluation?.recordId !== recordId ? current : {
      ...current, evaluation: { ...current.evaluation, representative: actual },
    })
  }, [lab.evaluation, lab.evaluationRecordId])
  const selectedSample = useMemo(() => dataset?.samples.find((item) => item.id === record.sampleId) ?? null, [dataset, record.sampleId])
  const value = useMemo<MnistCourseValue>(() => ({
    record, dataset, metadata, selectedSample, selectedPixelIndex: record.pixelIndex, loading, error, retry: requestDataset,
    selectSample, selectPixel, setScene, setAnswer, submitAnswer, answerReady, requirements, readyToComplete, complete, selectRepresentative,
  }), [record, dataset, metadata, selectedSample, loading, error, requestDataset, selectSample, selectPixel, setScene, setAnswer, submitAnswer, answerReady, requirements, readyToComplete, complete, selectRepresentative])

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
}

export function CourseSessionProvider({ children }: { children: ReactNode }) {
  const { resetRevision } = useProgress()
  const [externalResetRevision, setExternalResetRevision] = useState(0)
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea === window.localStorage && event.newValue === null && (event.key === COURSE_STORAGE_KEY || event.key === null)) {
        setExternalResetRevision((revision) => revision + 1)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])
  // Only an explicit storage reset replaces this session. Ordinary navigation keeps its model alive.
  return <Lesson08LabProvider key={`${resetRevision}:${externalResetRevision}`} experimentStorageKey={`${COURSE_STORAGE_KEY}:experiments`}><CourseStateProvider>{children}</CourseStateProvider></Lesson08LabProvider>
}

export function useMnistCourse() {
  const context = useContext(CourseContext)
  if (!context) throw new Error('useMnistCourse must be used inside CourseSessionProvider')
  return context
}
