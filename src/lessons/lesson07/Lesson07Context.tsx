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
import type { LessonProgress } from '../../types/progress'
import {
  isMnistDatasetSize,
  loadMnistDataset,
  loadMnistMetadata,
  normalizePixels,
} from './mnistLoader'
import type {
  MnistDataset,
  MnistDatasetSize,
  MnistMetadata,
  MnistSample,
  NormalizedInput,
} from './mnistTypes'

const STORAGE_PREFIX = 'deep-learning-lab:lesson07:'
const DATASET_SIZE_KEY = `${STORAGE_PREFIX}dataset-size`
const SAMPLE_ID_KEY = `${STORAGE_PREFIX}sample-id`
const LABEL_KEY = `${STORAGE_PREFIX}selected-label`
const PIXEL_INDEX_KEY = `${STORAGE_PREFIX}pixel-index`
const DEFAULT_DATASET_SIZE: MnistDatasetSize = 1_000

type LabelFilter = 'all' | number

interface Lesson07LabValue {
  datasetSize: MnistDatasetSize
  loadedDatasetSize: MnistDatasetSize | null
  dataset: MnistDataset | null
  metadata: MnistMetadata | null
  selectedSample: MnistSample | null
  selectedSampleId: string | null
  selectedPixelIndex: number
  selectedLabel: LabelFilter
  normalizedInput: NormalizedInput | null
  exploredLabels: ReadonlySet<number>
  inspectedPixelIndexes: ReadonlySet<number>
  normalizedComparedIndexes: ReadonlySet<number>
  oneHotLabels: ReadonlySet<number>
  loading: boolean
  error: string | null
  setDatasetSize: (size: MnistDatasetSize) => void
  requestDataset: (size?: MnistDatasetSize) => Promise<void>
  retry: () => Promise<void>
  selectSample: (sampleId: string) => void
  selectPixel: (index: number) => void
  setSelectedLabel: (label: LabelFilter) => void
  markExploredLabel: (label: number) => void
  markInspectedPixel: (index: number) => void
  markNormalizedComparison: (index: number) => void
  markOneHotLabel: (label: number) => void
  normalizeCurrentSample: () => void
}

const Lesson07LabContext = createContext<Lesson07LabValue | null>(null)

function readStoredNumber(key: string) {
  try {
    const value = Number(window.localStorage.getItem(key))
    return Number.isFinite(value) ? value : null
  } catch {
    return null
  }
}

function readInitialDatasetSize(): MnistDatasetSize {
  const stored = readStoredNumber(DATASET_SIZE_KEY)
  return stored !== null && isMnistDatasetSize(stored) ? stored : DEFAULT_DATASET_SIZE
}

function readInitialLabel(): LabelFilter {
  try {
    const stored = window.localStorage.getItem(LABEL_KEY)
    if (stored === null) return 'all'
    if (stored === 'all') return 'all'
    const label = Number(stored)
    return Number.isInteger(label) && label >= 0 && label <= 9 ? label : 'all'
  } catch {
    return 'all'
  }
}

function readInitialPixelIndex() {
  const stored = readStoredNumber(PIXEL_INDEX_KEY)
  return stored !== null && Number.isInteger(stored) && stored >= 0 && stored < 784
    ? stored
    : 0
}

function readInitialSampleId() {
  try {
    return window.localStorage.getItem(SAMPLE_ID_KEY)
  } catch {
    return null
  }
}

function saveValue(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // 저장소가 제한되어도 현재 메모리의 Data Lab은 계속 동작합니다.
  }
}

export function Lesson07LabProvider({
  progress,
  children,
}: {
  progress: LessonProgress
  children: ReactNode
}) {
  const [datasetSize, setDatasetSizeState] = useState<MnistDatasetSize>(readInitialDatasetSize)
  const [loadedDatasetSize, setLoadedDatasetSize] = useState<MnistDatasetSize | null>(null)
  const [dataset, setDataset] = useState<MnistDataset | null>(null)
  const [metadata, setMetadata] = useState<MnistMetadata | null>(null)
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(readInitialSampleId)
  const [selectedPixelIndex, setSelectedPixelIndex] = useState(readInitialPixelIndex)
  const [selectedLabel, setSelectedLabelState] = useState<LabelFilter>(readInitialLabel)
  const [normalizedInput, setNormalizedInput] = useState<NormalizedInput | null>(null)
  const [exploredLabels, setExploredLabels] = useState<Set<number>>(new Set())
  const [inspectedPixelIndexes, setInspectedPixelIndexes] = useState<Set<number>>(new Set())
  const [normalizedComparedIndexes, setNormalizedComparedIndexes] = useState<Set<number>>(new Set())
  const [oneHotLabels, setOneHotLabels] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)
  const controller = useRef<AbortController | null>(null)
  const datasetSizeRef = useRef(datasetSize)
  const selectedSampleIdRef = useRef(selectedSampleId)
  const progressRef = useRef(progress)

  useEffect(() => {
    selectedSampleIdRef.current = selectedSampleId
  }, [selectedSampleId])

  useEffect(() => {
    progressRef.current = progress
  }, [progress])

  const requestDataset = useCallback(async (requestedSize?: MnistDatasetSize) => {
    const size = requestedSize ?? datasetSizeRef.current
    const currentRequestId = requestId.current + 1
    requestId.current = currentRequestId
    controller.current?.abort()
    const nextController = new AbortController()
    controller.current = nextController
    setLoading(true)
    setError(null)

    try {
      const [nextDataset, nextMetadata] = await Promise.all([
        loadMnistDataset(size, nextController.signal),
        loadMnistMetadata(nextController.signal),
      ])
      if (requestId.current !== currentRequestId || nextController.signal.aborted) return

      const savedSample = nextDataset.samples.find(
        (sample) => sample.id === selectedSampleIdRef.current,
      )
      const nextSample = savedSample ?? nextDataset.samples[0]
      if (!nextSample) throw new Error('사용할 수 있는 MNIST sample이 없습니다.')

      setDataset(nextDataset)
      setMetadata(nextMetadata)
      setLoadedDatasetSize(size)
      datasetSizeRef.current = size
      setDatasetSizeState(size)
      setSelectedSampleId(nextSample.id)
      saveValue(DATASET_SIZE_KEY, String(size))
      saveValue(SAMPLE_ID_KEY, nextSample.id)

      if (!savedSample) {
        setSelectedPixelIndex(0)
        saveValue(PIXEL_INDEX_KEY, '0')
        setInspectedPixelIndexes(new Set())
        setNormalizedComparedIndexes(new Set())
      }

      if (progressRef.current.completedSteps.includes(5)) {
        setNormalizedInput({
          sampleId: nextSample.id,
          values: normalizePixels(nextSample.pixels),
        })
      } else {
        setNormalizedInput(null)
      }
    } catch (requestError) {
      if (nextController.signal.aborted || requestId.current !== currentRequestId) return
      const message = requestError instanceof Error ? requestError.message : '알 수 없는 오류입니다.'
      setError(message)
      setDataset(null)
      setLoadedDatasetSize(null)
    } finally {
      if (requestId.current === currentRequestId) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void requestDataset(datasetSizeRef.current)
    return () => controller.current?.abort()
  }, [requestDataset])

  const selectedSample = useMemo(
    () => dataset?.samples.find((sample) => sample.id === selectedSampleId) ?? null,
    [dataset, selectedSampleId],
  )

  const setDatasetSize = useCallback((size: MnistDatasetSize) => {
    datasetSizeRef.current = size
    setDatasetSizeState(size)
    saveValue(DATASET_SIZE_KEY, String(size))
  }, [])

  const retry = useCallback(() => requestDataset(datasetSizeRef.current), [requestDataset])

  const selectSample = useCallback(
    (sampleId: string) => {
      const sample = dataset?.samples.find((item) => item.id === sampleId)
      if (!sample) return
      const changed = sampleId !== selectedSampleIdRef.current
      setSelectedSampleId(sampleId)
      selectedSampleIdRef.current = sampleId
      saveValue(SAMPLE_ID_KEY, sampleId)
      if (changed) {
        setSelectedPixelIndex(0)
        saveValue(PIXEL_INDEX_KEY, '0')
        setInspectedPixelIndexes(new Set())
        setNormalizedComparedIndexes(new Set())
      }
      setNormalizedInput(
        progressRef.current.completedSteps.includes(5)
          ? { sampleId, values: normalizePixels(sample.pixels) }
          : null,
      )
    },
    [dataset],
  )

  const selectPixel = useCallback((index: number) => {
    if (!Number.isInteger(index) || index < 0 || index >= 784) return
    setSelectedPixelIndex(index)
    saveValue(PIXEL_INDEX_KEY, String(index))
  }, [])

  const setSelectedLabel = useCallback((label: LabelFilter) => {
    setSelectedLabelState(label)
    saveValue(LABEL_KEY, String(label))
  }, [])

  const markExploredLabel = useCallback((label: number) => {
    setExploredLabels((current) => new Set(current).add(label))
  }, [])

  const markInspectedPixel = useCallback((index: number) => {
    setInspectedPixelIndexes((current) => new Set(current).add(index))
  }, [])

  const markNormalizedComparison = useCallback((index: number) => {
    setNormalizedComparedIndexes((current) => new Set(current).add(index))
  }, [])

  const markOneHotLabel = useCallback((label: number) => {
    setOneHotLabels((current) => new Set(current).add(label))
  }, [])

  const normalizeCurrentSample = useCallback(() => {
    if (!selectedSample) return
    setNormalizedInput({
      sampleId: selectedSample.id,
      values: normalizePixels(selectedSample.pixels),
    })
  }, [selectedSample])

  const value = useMemo<Lesson07LabValue>(
    () => ({
      datasetSize,
      loadedDatasetSize,
      dataset,
      metadata,
      selectedSample,
      selectedSampleId,
      selectedPixelIndex,
      selectedLabel,
      normalizedInput,
      exploredLabels,
      inspectedPixelIndexes,
      normalizedComparedIndexes,
      oneHotLabels,
      loading,
      error,
      setDatasetSize,
      requestDataset,
      retry,
      selectSample,
      selectPixel,
      setSelectedLabel,
      markExploredLabel,
      markInspectedPixel,
      markNormalizedComparison,
      markOneHotLabel,
      normalizeCurrentSample,
    }),
    [
      datasetSize,
      loadedDatasetSize,
      dataset,
      metadata,
      selectedSample,
      selectedSampleId,
      selectedPixelIndex,
      selectedLabel,
      normalizedInput,
      exploredLabels,
      inspectedPixelIndexes,
      normalizedComparedIndexes,
      oneHotLabels,
      loading,
      error,
      setDatasetSize,
      requestDataset,
      retry,
      selectSample,
      selectPixel,
      setSelectedLabel,
      markExploredLabel,
      markInspectedPixel,
      markNormalizedComparison,
      markOneHotLabel,
      normalizeCurrentSample,
    ],
  )

  return <Lesson07LabContext.Provider value={value}>{children}</Lesson07LabContext.Provider>
}

export function useLesson07Lab() {
  const context = useContext(Lesson07LabContext)
  if (!context) throw new Error('useLesson07Lab must be used inside Lesson07LabProvider')
  return context
}

export function useLoadedLesson07Lab() {
  const context = useLesson07Lab()
  if (!context.dataset || !context.metadata || !context.selectedSample) {
    throw new Error('MNIST 데이터가 준비되기 전에 학습 활동을 표시할 수 없습니다.')
  }
  return {
    ...context,
    dataset: context.dataset,
    metadata: context.metadata,
    selectedSample: context.selectedSample,
  }
}
