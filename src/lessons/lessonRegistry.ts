import { lazy, type LazyExoticComponent, type ComponentType } from 'react'
import { lessonSteps } from '../data/lessons'
import type { LessonMetadata } from '../types/lesson'
import type { LessonProgress } from '../types/progress'
import { lesson01StepTitles } from './lesson01/lesson01Data'
import { lesson02StepTitles } from './lesson02/lesson02Data'
import { lesson03StepTitles } from './lesson03/lesson03Data'
import { lesson04StepTitles } from './lesson04/lesson04Data'
import { lesson05StepTitles } from './lesson05/lesson05Data'
import { lesson06StepTitles } from './lesson06/lesson06Data'
import { lesson07StepTitles } from './lesson07/lesson07Data'
import { lesson08StepTitles } from './lesson08/lesson08Data'
import { lesson09StepTitles } from './lesson09/lesson09Data'
import { lesson10StepTitles } from './lesson10/lesson10Data'
import { lesson11StepTitles } from './lesson11/lesson11Data'
import { lesson12StepTitles } from './lesson12/lesson12Data'

export interface LessonContentProps {
  lesson: LessonMetadata
  currentStep: number
  progress: LessonProgress
  onStepComplete: (step: number) => void
  onLessonCompletionReadyChange: (ready: boolean) => void
}

const PlaceholderLesson = lazy(() => import('./placeholder/LessonPlaceholder'))
const Lesson01 = lazy(() => import('./lesson01/Lesson01'))
const Lesson02 = lazy(() => import('./lesson02/Lesson02'))
const Lesson03 = lazy(() => import('./lesson03/Lesson03'))
const Lesson04 = lazy(() => import('./lesson04/Lesson04'))
const Lesson05 = lazy(() => import('./lesson05/Lesson05'))
const Lesson06 = lazy(() => import('./lesson06/Lesson06'))
const Lesson07 = lazy(() => import('./lesson07/Lesson07'))
const Lesson08 = lazy(() => import('./lesson08/Lesson08'))
const Lesson09 = lazy(() => import('./lesson09/Lesson09'))
const Lesson10 = lazy(() => import('./lesson10/Lesson10'))
const Lesson11 = lazy(() => import('./lesson11/Lesson11'))
const Lesson12 = lazy(() => import('./lesson12/Lesson12'))

export const isImplementedLesson = (lessonId: string) =>
  lessonId === '01' ||
  lessonId === '02' ||
  lessonId === '03' ||
  lessonId === '04' ||
  lessonId === '05' ||
  lessonId === '06' ||
  lessonId === '07' ||
  lessonId === '08' ||
  lessonId === '09' ||
  lessonId === '10' ||
  lessonId === '11' ||
  lessonId === '12'

export const getLessonContent = (
  lessonId: string,
): LazyExoticComponent<
  ComponentType<LessonContentProps>
> => {
  if (lessonId === '01') return Lesson01
  if (lessonId === '02') return Lesson02
  if (lessonId === '03') return Lesson03
  if (lessonId === '04') return Lesson04
  if (lessonId === '05') return Lesson05
  if (lessonId === '06') return Lesson06
  if (lessonId === '07') return Lesson07
  if (lessonId === '08') return Lesson08
  if (lessonId === '09') return Lesson09
  if (lessonId === '10') return Lesson10
  if (lessonId === '11') return Lesson11
  if (lessonId === '12') return Lesson12
  return PlaceholderLesson
}

export const getLessonStepTitles = (lessonId: string): readonly string[] => {
  if (lessonId === '01') return lesson01StepTitles
  if (lessonId === '02') return lesson02StepTitles
  if (lessonId === '03') return lesson03StepTitles
  if (lessonId === '04') return lesson04StepTitles
  if (lessonId === '05') return lesson05StepTitles
  if (lessonId === '06') return lesson06StepTitles
  if (lessonId === '07') return lesson07StepTitles
  if (lessonId === '08') return lesson08StepTitles
  if (lessonId === '09') return lesson09StepTitles
  if (lessonId === '10') return lesson10StepTitles
  if (lessonId === '11') return lesson11StepTitles
  if (lessonId === '12') return lesson12StepTitles
  return lessonSteps
}
