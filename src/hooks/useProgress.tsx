import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { LESSON_IDS, type LessonId } from '../types/lesson'
import type { ProgressRecord, ProgressSummary } from '../types/progress'
import {
  createInitialProgress,
  progressStorage,
  STEP_COUNT,
} from '../lib/progressStorage'

interface ProgressContextValue {
  progress: ProgressRecord
  summary: ProgressSummary
  setCurrentStep: (lessonId: LessonId, step: number) => void
  markStepComplete: (lessonId: LessonId, step: number) => void
  resetProgress: () => void
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressRecord>(() =>
    progressStorage.load(),
  )

  useEffect(() => {
    const syncAcrossTabs = () => setProgress(progressStorage.load())
    window.addEventListener('storage', syncAcrossTabs)
    return () => window.removeEventListener('storage', syncAcrossTabs)
  }, [])

  const updateLesson = useCallback(
    (
      lessonId: LessonId,
      updater: (current: ProgressRecord[LessonId]) => ProgressRecord[LessonId],
    ) => {
      setProgress((current) => {
        const next = { ...current, [lessonId]: updater(current[lessonId]) }
        progressStorage.save(next)
        return next
      })
    },
    [],
  )

  const setCurrentStep = useCallback(
    (lessonId: LessonId, step: number) => {
      const nextStep = Math.min(STEP_COUNT, Math.max(1, step))
      updateLesson(lessonId, (current) => ({
        ...current,
        currentStep: nextStep,
      }))
    },
    [updateLesson],
  )

  const markStepComplete = useCallback(
    (lessonId: LessonId, step: number) => {
      updateLesson(lessonId, (current) => {
        const completedSteps = [
          ...new Set([...current.completedSteps, Math.min(STEP_COUNT, Math.max(1, step))]),
        ].sort((a, b) => a - b)
        return {
          ...current,
          completedSteps,
          progress: Math.round((completedSteps.length / STEP_COUNT) * 100),
          completed: completedSteps.length === STEP_COUNT,
        }
      })
    },
    [updateLesson],
  )

  const resetProgress = useCallback(() => {
    progressStorage.clear()
    setProgress(createInitialProgress())
  }, [])

  const summary = useMemo<ProgressSummary>(() => {
    const completedLessons = LESSON_IDS.filter(
      (lessonId) => progress[lessonId].completed,
    ).length
    return {
      completedLessons,
      totalLessons: LESSON_IDS.length,
      percentage: Math.round((completedLessons / LESSON_IDS.length) * 100),
    }
  }, [progress])

  const value = useMemo(
    () => ({
      progress,
      summary,
      setCurrentStep,
      markStepComplete,
      resetProgress,
    }),
    [progress, summary, setCurrentStep, markStepComplete, resetProgress],
  )

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error('useProgress must be used inside ProgressProvider')
  }
  return context
}
