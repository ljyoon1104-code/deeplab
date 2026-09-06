import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { GenerationCategory, GanRole, LanguageProcess, RecognitionMethod } from './lesson10Data'

type StringMap = Record<string, string>

interface Lesson10Activity {
  generationAssignments: StringMap
  generationDefinitionConfirmed: boolean
  ganRelationConfirmed: boolean
  ganRoleAssignments: StringMap
  ganFlowConfirmed: boolean
  currentGanRound: number
  checkedGanRounds: number[]
  ganSimulationConfirmed: boolean
  speechAnswer: string
  speechSubmitted: boolean
  speechCorrect: boolean
  speechFlowConfirmed: boolean
  highWave: string
  lowWave: string
  frequencyCorrect: boolean
  frequencyConfirmed: boolean
  speechStagesViewed: string[]
  sentenceChoice: string
  sentenceCorrect: boolean
  recognitionAssignments: StringMap
  recognitionComparisonConfirmed: boolean
  languageAssignments: StringMap
  speechUsesViewed: string[]
  quizAnswers: StringMap
  quizSubmitted: number[]
  quizCorrect: number[]
}

interface Lesson10ContextValue {
  activity: Lesson10Activity
  update: (updater: (current: Lesson10Activity) => Lesson10Activity) => void
  assignGeneration: (id: string, category: GenerationCategory) => void
  assignGanRole: (id: string, role: GanRole) => void
  assignRecognition: (id: string, method: RecognitionMethod) => void
  assignLanguageProcess: (id: string, process: LanguageProcess) => void
}

const STORAGE_KEY = 'deep-learning-lab:lesson10:activity:v1'
const initialActivity: Lesson10Activity = {
  generationAssignments: {},
  generationDefinitionConfirmed: false,
  ganRelationConfirmed: false,
  ganRoleAssignments: {},
  ganFlowConfirmed: false,
  currentGanRound: 1,
  checkedGanRounds: [],
  ganSimulationConfirmed: false,
  speechAnswer: '',
  speechSubmitted: false,
  speechCorrect: false,
  speechFlowConfirmed: false,
  highWave: '',
  lowWave: '',
  frequencyCorrect: false,
  frequencyConfirmed: false,
  speechStagesViewed: [],
  sentenceChoice: '',
  sentenceCorrect: false,
  recognitionAssignments: {},
  recognitionComparisonConfirmed: false,
  languageAssignments: {},
  speechUsesViewed: [],
  quizAnswers: {},
  quizSubmitted: [],
  quizCorrect: [],
}

function loadActivity(): Lesson10Activity {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return initialActivity
    const value = parsed as Record<string, unknown>
    const stringMap = (item: unknown): StringMap => item && typeof item === 'object' && !Array.isArray(item)
      ? Object.fromEntries(Object.entries(item).filter(([, entry]) => typeof entry === 'string')) as StringMap
      : {}
    const strings = (item: unknown) => Array.isArray(item) ? item.filter((entry): entry is string => typeof entry === 'string') : []
    const numbers = (item: unknown) => Array.isArray(item) ? item.filter((entry): entry is number => Number.isInteger(entry)) : []
    const text = (item: unknown) => typeof item === 'string' ? item : ''
    return {
      ...initialActivity,
      generationAssignments: stringMap(value.generationAssignments),
      generationDefinitionConfirmed: value.generationDefinitionConfirmed === true,
      ganRelationConfirmed: value.ganRelationConfirmed === true,
      ganRoleAssignments: stringMap(value.ganRoleAssignments),
      ganFlowConfirmed: value.ganFlowConfirmed === true,
      currentGanRound: [1, 2, 3, 4].includes(Number(value.currentGanRound)) ? Number(value.currentGanRound) : 1,
      checkedGanRounds: numbers(value.checkedGanRounds),
      ganSimulationConfirmed: value.ganSimulationConfirmed === true,
      speechAnswer: text(value.speechAnswer),
      speechSubmitted: value.speechSubmitted === true,
      speechCorrect: value.speechCorrect === true,
      speechFlowConfirmed: value.speechFlowConfirmed === true,
      highWave: text(value.highWave),
      lowWave: text(value.lowWave),
      frequencyCorrect: value.frequencyCorrect === true,
      frequencyConfirmed: value.frequencyConfirmed === true,
      speechStagesViewed: strings(value.speechStagesViewed),
      sentenceChoice: text(value.sentenceChoice),
      sentenceCorrect: value.sentenceCorrect === true,
      recognitionAssignments: stringMap(value.recognitionAssignments),
      recognitionComparisonConfirmed: value.recognitionComparisonConfirmed === true,
      languageAssignments: stringMap(value.languageAssignments),
      speechUsesViewed: strings(value.speechUsesViewed),
      quizAnswers: stringMap(value.quizAnswers),
      quizSubmitted: numbers(value.quizSubmitted),
      quizCorrect: numbers(value.quizCorrect),
    }
  } catch {
    return initialActivity
  }
}

const Lesson10Context = createContext<Lesson10ContextValue | null>(null)

export function Lesson10Provider({ children }: { children: ReactNode }) {
  const [activity, setActivity] = useState<Lesson10Activity>(loadActivity)
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(activity)) } catch { /* 현재 세션은 계속 동작합니다. */ }
  }, [activity])

  const value = useMemo<Lesson10ContextValue>(() => ({
    activity,
    update: setActivity,
    assignGeneration: (id, category) => setActivity((current) => ({ ...current, generationAssignments: { ...current.generationAssignments, [id]: category } })),
    assignGanRole: (id, role) => setActivity((current) => ({ ...current, ganRoleAssignments: { ...current.ganRoleAssignments, [id]: role } })),
    assignRecognition: (id, method) => setActivity((current) => ({ ...current, recognitionAssignments: { ...current.recognitionAssignments, [id]: method } })),
    assignLanguageProcess: (id, process) => setActivity((current) => ({ ...current, languageAssignments: { ...current.languageAssignments, [id]: process } })),
  }), [activity])
  return <Lesson10Context.Provider value={value}>{children}</Lesson10Context.Provider>
}

export function useLesson10() {
  const context = useContext(Lesson10Context)
  if (!context) throw new Error('useLesson10 must be used inside Lesson10Provider')
  return context
}
