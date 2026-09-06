import type { LessonId } from './lesson'

export interface LessonProgress {
  currentStep: number
  completedSteps: number[]
  progress: number
  completed: boolean
}

export type ProgressRecord = Record<LessonId, LessonProgress>

export interface ProgressSummary {
  completedLessons: number
  totalLessons: number
  percentage: number
}

export type LessonStatus = '미완료' | '진행 중' | '완료'
