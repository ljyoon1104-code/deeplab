import { LESSON_IDS, type LessonId } from '../types/lesson'
import type { LessonProgress, ProgressRecord } from '../types/progress'

const STORAGE_KEY = 'deep-learning-lab:progress:v1'
const COMPLETION_VERSION_KEY = 'deep-learning-lab:completion-versions:v1'
const STEP_COUNT = 7

/**
 * 완료 조건이 달라진 차시만 버전을 올립니다. 한 곳에서 관리하여 이전
 * 완료 기록을 선택적으로 초기화하고, 다른 차시와 실험 기록은 보존합니다.
 */
export const LESSON_COMPLETION_VERSIONS = {
  '01': 2,
  '02': 2,
  '03': 2,
  '04': 2,
  '05': 2,
  '06': 2,
  '07': 2,
  '09': 2,
  '10': 2,
  '11': 2,
  '12': 2,
} as const satisfies Partial<Record<LessonId, number>>

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

const migrateCompletionVersions = (progress: ProgressRecord): ProgressRecord => {
  let savedVersions: Partial<Record<LessonId, number>> = {}

  try {
    const raw = window.localStorage.getItem(COMPLETION_VERSION_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        savedVersions = parsed as Partial<Record<LessonId, number>>
      }
    }
  } catch {
    savedVersions = {}
  }

  let migrated = progress
  let changed = false

  for (const [lessonId, version] of Object.entries(LESSON_COMPLETION_VERSIONS) as Array<
    [keyof typeof LESSON_COMPLETION_VERSIONS, number]
  >) {
    if (savedVersions[lessonId] === version) continue
    if (!changed) migrated = { ...progress }
    migrated[lessonId] = buildLessonProgress()
    changed = true
  }

  if (changed) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
      window.localStorage.setItem(
        COMPLETION_VERSION_KEY,
        JSON.stringify(LESSON_COMPLETION_VERSIONS),
      )
    } catch {
      // 저장소가 제한된 브라우저에서도 현재 화면의 학습은 계속할 수 있습니다.
    }
  }

  return migrated
}

export const progressStorage = {
  load(): ProgressRecord {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      const progress = saved
        ? sanitizeProgress(JSON.parse(saved))
        : createInitialProgress()
      return migrateCompletionVersions(progress)
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
      window.localStorage.removeItem(COMPLETION_VERSION_KEY)
    } catch {
      // 저장소가 제한된 브라우저에서는 메모리 상태만 초기화합니다.
    }
  },
}

export { STEP_COUNT }
