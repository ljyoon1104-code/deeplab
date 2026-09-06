export const LESSON_IDS = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
] as const

export type LessonId = (typeof LESSON_IDS)[number]

export type LessonGroupId = 'foundations' | 'practice' | 'applications'

export interface LessonMetadata {
  id: LessonId
  title: string
  description: string
  group: LessonGroupId
}

export interface LessonGroup {
  id: LessonGroupId
  title: string
  description: string
}
