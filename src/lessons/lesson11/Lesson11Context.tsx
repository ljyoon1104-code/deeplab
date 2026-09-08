import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { NlpActivityType } from './lesson11Data'

type StringMap = Record<string, string>

interface Lesson11Activity {
  step1Answer: string
  step1Submitted: boolean
  step1Correct: boolean
  speechNlpConfirmed: boolean
  nlpAssignments: StringMap
  combinedUseConfirmed: boolean
  indexAssignments: StringMap
  indexReverseCorrect: boolean
  unregisteredWordCorrect: boolean
  indexImportanceConfirmed: boolean
  selectedOneHotWord: string
  oneHotWordsViewed: string[]
  oneHotLengthAnswer: string
  oneHotLengthSubmitted: boolean
  oneHotLengthCorrect: boolean
  oneHotInvalidVectorCorrect: boolean
  oneHotInvalidVectorAnswer: string
  oneHotLimitsConfirmed: boolean
  embeddingViewed: boolean
  embeddingPair: string
  embeddingPairCorrect: boolean
  embeddingAnswer: string
  embeddingSubmitted: boolean
  embeddingCorrect: boolean
  embeddingComparisonConfirmed: boolean
  frequencyTopics: StringMap
  frequencyMeaningAnswer: string
  frequencyMeaningSubmitted: boolean
  frequencyMeaningCorrect: boolean
  frequencyCountAnswer: string
  frequencyCountCorrect: boolean
  frequencyRatioAnswer: string
  frequencyRatioCorrect: boolean
  frequencyConfirmed: boolean
  contextAssignments: StringMap
  contextOrderNegationCorrect: boolean
  contextOrderNegationAnswer: string
  contextFlowConfirmed: boolean
  perspectivesConfirmed: boolean
  representationAssignments: StringMap
  quizAnswers: StringMap
  quizSubmitted: number[]
  quizCorrect: number[]
}

interface Lesson11ContextValue {
  activity: Lesson11Activity
  update: (updater: (current: Lesson11Activity) => Lesson11Activity) => void
  assignNlpActivity: (id: string, type: NlpActivityType) => void
}

const STORAGE_KEY = 'deep-learning-lab:lesson11:activity:v1'
const initialActivity: Lesson11Activity = {
  step1Answer: '', step1Submitted: false, step1Correct: false, speechNlpConfirmed: false,
  nlpAssignments: {}, combinedUseConfirmed: false,
  indexAssignments: {}, indexReverseCorrect: false, unregisteredWordCorrect: false, indexImportanceConfirmed: false,
  selectedOneHotWord: '좋은', oneHotWordsViewed: [], oneHotLengthAnswer: '', oneHotLengthSubmitted: false, oneHotLengthCorrect: false, oneHotInvalidVectorCorrect: false, oneHotInvalidVectorAnswer: '', oneHotLimitsConfirmed: false,
  embeddingViewed: false, embeddingPair: '', embeddingPairCorrect: false, embeddingAnswer: '', embeddingSubmitted: false, embeddingCorrect: false, embeddingComparisonConfirmed: false,
  frequencyTopics: {}, frequencyMeaningAnswer: '', frequencyMeaningSubmitted: false, frequencyMeaningCorrect: false, frequencyCountAnswer: '', frequencyCountCorrect: false, frequencyRatioAnswer: '', frequencyRatioCorrect: false, frequencyConfirmed: false,
  contextAssignments: {}, contextOrderNegationCorrect: false, contextOrderNegationAnswer: '', contextFlowConfirmed: false, perspectivesConfirmed: false, representationAssignments: {},
  quizAnswers: {}, quizSubmitted: [], quizCorrect: [],
}

function loadActivity(): Lesson11Activity {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return initialActivity
    const value = parsed as Record<string, unknown>
    const text = (item: unknown) => typeof item === 'string' ? item : ''
    const bool = (item: unknown) => item === true
    const stringMap = (item: unknown): StringMap => item && typeof item === 'object' && !Array.isArray(item)
      ? Object.fromEntries(Object.entries(item).filter(([, entry]) => typeof entry === 'string')) as StringMap : {}
    const strings = (item: unknown) => Array.isArray(item) ? item.filter((entry): entry is string => typeof entry === 'string') : []
    const numbers = (item: unknown) => Array.isArray(item) ? item.filter((entry): entry is number => Number.isInteger(entry)) : []
    return {
      ...initialActivity,
      step1Answer: text(value.step1Answer), step1Submitted: bool(value.step1Submitted), step1Correct: bool(value.step1Correct), speechNlpConfirmed: bool(value.speechNlpConfirmed),
      nlpAssignments: stringMap(value.nlpAssignments), combinedUseConfirmed: bool(value.combinedUseConfirmed),
      indexAssignments: stringMap(value.indexAssignments), indexReverseCorrect: bool(value.indexReverseCorrect), unregisteredWordCorrect: bool(value.unregisteredWordCorrect), indexImportanceConfirmed: bool(value.indexImportanceConfirmed),
      selectedOneHotWord: text(value.selectedOneHotWord) || '좋은', oneHotWordsViewed: strings(value.oneHotWordsViewed), oneHotLengthAnswer: text(value.oneHotLengthAnswer), oneHotLengthSubmitted: bool(value.oneHotLengthSubmitted), oneHotLengthCorrect: bool(value.oneHotLengthCorrect), oneHotInvalidVectorCorrect: bool(value.oneHotInvalidVectorCorrect), oneHotInvalidVectorAnswer: text(value.oneHotInvalidVectorAnswer), oneHotLimitsConfirmed: bool(value.oneHotLimitsConfirmed),
      embeddingViewed: bool(value.embeddingViewed), embeddingPair: text(value.embeddingPair), embeddingPairCorrect: bool(value.embeddingPairCorrect), embeddingAnswer: text(value.embeddingAnswer), embeddingSubmitted: bool(value.embeddingSubmitted), embeddingCorrect: bool(value.embeddingCorrect), embeddingComparisonConfirmed: bool(value.embeddingComparisonConfirmed),
      frequencyTopics: stringMap(value.frequencyTopics), frequencyMeaningAnswer: text(value.frequencyMeaningAnswer), frequencyMeaningSubmitted: bool(value.frequencyMeaningSubmitted), frequencyMeaningCorrect: bool(value.frequencyMeaningCorrect), frequencyCountAnswer: text(value.frequencyCountAnswer), frequencyCountCorrect: bool(value.frequencyCountCorrect), frequencyRatioAnswer: text(value.frequencyRatioAnswer), frequencyRatioCorrect: bool(value.frequencyRatioCorrect), frequencyConfirmed: bool(value.frequencyConfirmed),
      contextAssignments: stringMap(value.contextAssignments), contextOrderNegationCorrect: bool(value.contextOrderNegationCorrect), contextOrderNegationAnswer: text(value.contextOrderNegationAnswer), contextFlowConfirmed: bool(value.contextFlowConfirmed), perspectivesConfirmed: bool(value.perspectivesConfirmed), representationAssignments: stringMap(value.representationAssignments),
      quizAnswers: stringMap(value.quizAnswers), quizSubmitted: numbers(value.quizSubmitted), quizCorrect: numbers(value.quizCorrect),
    }
  } catch {
    return initialActivity
  }
}

const Lesson11Context = createContext<Lesson11ContextValue | null>(null)

export function Lesson11Provider({ children }: { children: ReactNode }) {
  const [activity, setActivity] = useState<Lesson11Activity>(loadActivity)
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(activity)) } catch { /* 현재 세션은 계속 동작합니다. */ } }, [activity])
  const value = useMemo<Lesson11ContextValue>(() => ({
    activity,
    update: setActivity,
    assignNlpActivity: (id, type) => setActivity((current) => ({ ...current, nlpAssignments: { ...current.nlpAssignments, [id]: type } })),
  }), [activity])
  return <Lesson11Context.Provider value={value}>{children}</Lesson11Context.Provider>
}

export function useLesson11() {
  const context = useContext(Lesson11Context)
  if (!context) throw new Error('useLesson11 must be used inside Lesson11Provider')
  return context
}
