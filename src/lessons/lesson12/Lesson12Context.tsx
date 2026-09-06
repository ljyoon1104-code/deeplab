import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ModelRelation } from './lesson12Data'

type StringMap = Record<string, string>

interface Lesson12Activity {
  sequenceAssignments: StringMap
  sequenceConfirmed: boolean
  currentRnnIndex: number
  rnnWordsViewed: number[]
  rnnFlowConfirmed: boolean
  rnnConceptConfirmed: boolean
  contextsViewed: string[]
  longContextAnswer: string
  longContextSubmitted: boolean
  longContextCorrect: boolean
  rnnLimitConfirmed: boolean
  attentionWords: string[]
  attentionContextConfirmed: boolean
  attentionSimulationConfirmed: boolean
  modelAssignments: StringMap
  rnnVisualConfirmed: boolean
  transformerVisualConfirmed: boolean
  transformerLlmConfirmed: boolean
  frequencyAnswers: StringMap
  frequencySubmitted: string[]
  probabilitiesConfirmed: boolean
  nextFirstChoice: string
  nextSecondChoice: string
  nextWordSelections: string[]
  generationSimulationConfirmed: boolean
  languageModelConfirmed: boolean
  llmConfirmed: boolean
  usesViewed: string[]
  roadmapConfirmed: boolean
  quizAnswers: StringMap
  quizSubmitted: number[]
  quizCorrect: number[]
}

interface Lesson12ContextValue {
  activity: Lesson12Activity
  update: (updater: (current: Lesson12Activity) => Lesson12Activity) => void
  assignModelRelation: (id: string, relation: ModelRelation) => void
}

const STORAGE_KEY = 'deep-learning-lab:lesson12:activity:v1'
const initialActivity: Lesson12Activity = {
  sequenceAssignments: {}, sequenceConfirmed: false,
  currentRnnIndex: -1, rnnWordsViewed: [], rnnFlowConfirmed: false, rnnConceptConfirmed: false,
  contextsViewed: [], longContextAnswer: '', longContextSubmitted: false, longContextCorrect: false, rnnLimitConfirmed: false,
  attentionWords: [], attentionContextConfirmed: false, attentionSimulationConfirmed: false,
  modelAssignments: {}, rnnVisualConfirmed: false, transformerVisualConfirmed: false, transformerLlmConfirmed: false,
  frequencyAnswers: {}, frequencySubmitted: [], probabilitiesConfirmed: false, nextFirstChoice: '', nextSecondChoice: '', nextWordSelections: [], generationSimulationConfirmed: false,
  languageModelConfirmed: false, llmConfirmed: false, usesViewed: [], roadmapConfirmed: false,
  quizAnswers: {}, quizSubmitted: [], quizCorrect: [],
}

function loadActivity(): Lesson12Activity {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return initialActivity
    const value = parsed as Record<string, unknown>
    const text = (item: unknown) => typeof item === 'string' ? item : ''
    const bool = (item: unknown) => item === true
    const stringMap = (item: unknown): StringMap => item && typeof item === 'object' && !Array.isArray(item) ? Object.fromEntries(Object.entries(item).filter(([, entry]) => typeof entry === 'string')) as StringMap : {}
    const strings = (item: unknown) => Array.isArray(item) ? item.filter((entry): entry is string => typeof entry === 'string') : []
    const numbers = (item: unknown) => Array.isArray(item) ? item.filter((entry): entry is number => Number.isInteger(entry)) : []
    const rnnIndex = Number(value.currentRnnIndex)
    return {
      ...initialActivity,
      sequenceAssignments: stringMap(value.sequenceAssignments), sequenceConfirmed: bool(value.sequenceConfirmed),
      currentRnnIndex: Number.isInteger(rnnIndex) && rnnIndex >= -1 && rnnIndex <= 4 ? rnnIndex : -1, rnnWordsViewed: numbers(value.rnnWordsViewed), rnnFlowConfirmed: bool(value.rnnFlowConfirmed), rnnConceptConfirmed: bool(value.rnnConceptConfirmed),
      contextsViewed: strings(value.contextsViewed), longContextAnswer: text(value.longContextAnswer), longContextSubmitted: bool(value.longContextSubmitted), longContextCorrect: bool(value.longContextCorrect), rnnLimitConfirmed: bool(value.rnnLimitConfirmed),
      attentionWords: strings(value.attentionWords), attentionContextConfirmed: bool(value.attentionContextConfirmed), attentionSimulationConfirmed: bool(value.attentionSimulationConfirmed),
      modelAssignments: stringMap(value.modelAssignments), rnnVisualConfirmed: bool(value.rnnVisualConfirmed), transformerVisualConfirmed: bool(value.transformerVisualConfirmed), transformerLlmConfirmed: bool(value.transformerLlmConfirmed),
      frequencyAnswers: stringMap(value.frequencyAnswers), frequencySubmitted: strings(value.frequencySubmitted), probabilitiesConfirmed: bool(value.probabilitiesConfirmed), nextFirstChoice: text(value.nextFirstChoice), nextSecondChoice: text(value.nextSecondChoice), nextWordSelections: strings(value.nextWordSelections), generationSimulationConfirmed: bool(value.generationSimulationConfirmed),
      languageModelConfirmed: bool(value.languageModelConfirmed), llmConfirmed: bool(value.llmConfirmed), usesViewed: strings(value.usesViewed), roadmapConfirmed: bool(value.roadmapConfirmed),
      quizAnswers: stringMap(value.quizAnswers), quizSubmitted: numbers(value.quizSubmitted), quizCorrect: numbers(value.quizCorrect),
    }
  } catch { return initialActivity }
}

const Lesson12Context = createContext<Lesson12ContextValue | null>(null)

export function Lesson12Provider({ children }: { children: ReactNode }) {
  const [activity, setActivity] = useState<Lesson12Activity>(loadActivity)
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(activity)) } catch { /* 현재 세션은 계속 동작합니다. */ } }, [activity])
  const value = useMemo<Lesson12ContextValue>(() => ({
    activity,
    update: setActivity,
    assignModelRelation: (id, relation) => setActivity((current) => ({ ...current, modelAssignments: { ...current.modelAssignments, [id]: relation } })),
  }), [activity])
  return <Lesson12Context.Provider value={value}>{children}</Lesson12Context.Provider>
}

export function useLesson12() {
  const context = useContext(Lesson12Context)
  if (!context) throw new Error('useLesson12 must be used inside Lesson12Provider')
  return context
}
