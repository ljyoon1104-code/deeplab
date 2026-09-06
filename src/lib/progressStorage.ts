import { LESSON_IDS, type LessonId } from '../types/lesson'
import type { LessonProgress, ProgressRecord } from '../types/progress'

const STORAGE_KEY = 'deep-learning-lab:progress:v1'
const STEP_COUNT = 7

const clampStep = (step: number) => Math.min(STEP_COUNT, Math.max(1, step))

const buildLessonProgress = (
  currentStep = 1,
  completedSteps: number[] = [],
): LessonProgress => {
  const uniqueCompletedSteps = [
    ...new Set(
      completedSteps
        .filter((step) => Number.isInteger(step))
        .map(clampStep),
    ),
  ].sort((a, b) => a - b)

  return {
    currentStep: clampStep(currentStep),
    completedSteps: uniqueCompletedSteps,
    progress: Math.round((uniqueCompletedSteps.length / STEP_COUNT) * 100),
    completed: uniqueCompletedSteps.length === STEP_COUNT,
  }
}

export const createInitialProgress = (): ProgressRecord =>
  Object.fromEntries(
    LESSON_IDS.map((lessonId) => [lessonId, buildLessonProgress()]),
  ) as ProgressRecord

const sanitizeProgress = (value: unknown): ProgressRecord => {
  const initial = createInitialProgress()

  if (!value || typeof value !== 'object') {
    return initial
  }

  const source = value as Partial<Record<LessonId, Partial<LessonProgress>>>

  for (const lessonId of LESSON_IDS) {
    const item = source[lessonId]
    if (!item) continue

    initial[lessonId] = buildLessonProgress(
      Number(item.currentStep) || 1,
      Array.isArray(item.completedSteps) ? item.completedSteps : [],
    )
  }

  return initial
}

export const progressStorage = {
  load(): ProgressRecord {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      return saved ? sanitizeProgress(JSON.parse(saved)) : createInitialProgress()
    } catch {
      return createInitialProgress()
    }
  },

  save(progress: ProgressRecord) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch {
      // 저장소가 제한된 브라우저에서도 현재 화면의 학습은 계속할 수 있습니다.
    }
  },

  clear() {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // 저장소가 제한된 브라우저에서는 메모리 상태만 초기화합니다.
    }
  },
}

export { STEP_COUNT }
