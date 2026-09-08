import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { CNN_FLOW, type CnnFlowItem, type NetworkMode, type VisionTask } from './lesson09Data'

type StringMap = Record<string, string>

interface Lesson09Activity {
  pixelChoices: string[]
  pixelConfirmed: boolean
  visionAssignments: StringMap
  visionViewed: string[]
  networkAssignments: StringMap
  fullyConnectedConfirmed: boolean
  cnnConfirmed: boolean
  selectedFilterPosition: number
  checkedFilterPositions: number[]
  featureMapConfirmed: boolean
  selectedPoolRegion: number
  checkedPoolRegions: number[]
  poolSelections: Record<string, number>
  poolingConfirmed: boolean
  cnnFlow: CnnFlowItem[]
  flowCorrect: boolean
  quizAnswers: Record<string, string[]>
  quizSubmitted: number[]
  quizCorrect: number[]
}

interface Lesson09ContextValue {
  activity: Lesson09Activity
  update: (updater: (current: Lesson09Activity) => Lesson09Activity) => void
  assignVision: (scenarioId: string, task: VisionTask) => void
  assignNetwork: (statementId: string, mode: NetworkMode) => void
}

const STORAGE_KEY = 'deep-learning-lab:lesson09:activity:v1'
const initialActivity: Lesson09Activity = {
  pixelChoices: [],
  pixelConfirmed: false,
  visionAssignments: {},
  visionViewed: [],
  networkAssignments: {},
  fullyConnectedConfirmed: false,
  cnnConfirmed: false,
  selectedFilterPosition: 0,
  checkedFilterPositions: [],
  featureMapConfirmed: false,
  selectedPoolRegion: 0,
  checkedPoolRegions: [],
  poolSelections: {},
  poolingConfirmed: false,
  cnnFlow: [
    '입력 이미지', '풀링', '합성곱', 'ReLU',
    '완전연결층', 'flatten', 'Softmax', '클래스 예측',
  ],
  flowCorrect: false,
  quizAnswers: {},
  quizSubmitted: [],
  quizCorrect: [],
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function numberArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is number => Number.isInteger(item)) : []
}

function stringMap(value: unknown): StringMap {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(Object.entries(value).filter(([, item]) => typeof item === 'string')) as StringMap
}

function loadActivity(): Lesson09Activity {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return initialActivity
    const saved = raw as Record<string, unknown>
    const savedFlow = stringArray(saved.cnnFlow).filter((item): item is CnnFlowItem =>
      (CNN_FLOW as readonly string[]).includes(item),
    )
    return {
      ...initialActivity,
      pixelChoices: stringArray(saved.pixelChoices),
      pixelConfirmed: saved.pixelConfirmed === true,
      visionAssignments: stringMap(saved.visionAssignments),
      visionViewed: stringArray(saved.visionViewed),
      networkAssignments: stringMap(saved.networkAssignments),
      fullyConnectedConfirmed: saved.fullyConnectedConfirmed === true,
      cnnConfirmed: saved.cnnConfirmed === true,
      selectedFilterPosition: Number.isInteger(saved.selectedFilterPosition) ? Number(saved.selectedFilterPosition) : 0,
      checkedFilterPositions: numberArray(saved.checkedFilterPositions),
      featureMapConfirmed: saved.featureMapConfirmed === true,
      selectedPoolRegion: Number.isInteger(saved.selectedPoolRegion) ? Number(saved.selectedPoolRegion) : 0,
      checkedPoolRegions: numberArray(saved.checkedPoolRegions),
      poolSelections: Object.fromEntries(Object.entries(saved.poolSelections && typeof saved.poolSelections === 'object' ? saved.poolSelections : {}).filter(([, item]) => typeof item === 'number' && Number.isFinite(item))) as Record<string, number>,
      poolingConfirmed: saved.poolingConfirmed === true,
      cnnFlow: savedFlow.length === CNN_FLOW.length && new Set(savedFlow).size === CNN_FLOW.length ? savedFlow : initialActivity.cnnFlow,
      flowCorrect: saved.flowCorrect === true,
      quizAnswers: Object.fromEntries(Object.entries(saved.quizAnswers && typeof saved.quizAnswers === 'object' ? saved.quizAnswers : {}).map(([key, value]) => [key, stringArray(value)])),
      quizSubmitted: numberArray(saved.quizSubmitted),
      quizCorrect: numberArray(saved.quizCorrect),
    }
  } catch {
    return initialActivity
  }
}

const Lesson09Context = createContext<Lesson09ContextValue | null>(null)

export function Lesson09Provider({ children }: { children: ReactNode }) {
  const [activity, setActivity] = useState<Lesson09Activity>(loadActivity)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activity))
    } catch {
      // 저장 공간이 제한되어도 현재 활동은 계속 진행합니다.
    }
  }, [activity])

  const assignVision = (scenarioId: string, task: VisionTask) => {
    setActivity((current) => ({ ...current, visionAssignments: { ...current.visionAssignments, [scenarioId]: task } }))
  }
  const assignNetwork = (statementId: string, mode: NetworkMode) => {
    setActivity((current) => ({ ...current, networkAssignments: { ...current.networkAssignments, [statementId]: mode } }))
  }
  const value = useMemo(() => ({ activity, update: setActivity, assignVision, assignNetwork }), [activity])
  return <Lesson09Context.Provider value={value}>{children}</Lesson09Context.Provider>
}

export function useLesson09() {
  const context = useContext(Lesson09Context)
  if (!context) throw new Error('useLesson09 must be used inside Lesson09Provider')
  return context
}
