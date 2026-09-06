import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { LessonShell } from '../components/LessonShell'
import { getLesson } from '../data/lessons'
import { useProgress } from '../hooks/useProgress'
import {
  getLessonContent,
  getLessonStepTitles,
  isImplementedLesson,
} from '../lessons/lessonRegistry'

export function LessonPage() {
  const { lessonId = '' } = useParams()
  const lesson = getLesson(lessonId)
  const { progress, setCurrentStep, markStepComplete } = useProgress()
  const [lessonCompletionReady, setLessonCompletionReady] = useState(false)

  const currentStep = lesson ? progress[lesson.id].currentStep : 1
  const LessonContent = getLessonContent(lessonId)
  const stepTitles = getLessonStepTitles(lessonId)
  const previousStep = useRef(currentStep)

  const goToStep = useCallback(
    (step: number) => {
      if (!lesson) return
      setCurrentStep(lesson.id, step)
    },
    [lesson, setCurrentStep],
  )

  const completeStep = useCallback(
    (step: number) => {
      if (!lesson) return
      markStepComplete(lesson.id, step)
    },
    [lesson, markStepComplete],
  )

  useEffect(() => {
    if (previousStep.current === currentStep) return
    previousStep.current = currentStep

    const heading = document.getElementById('lesson-step-title')
    if (!heading) return

    heading.scrollIntoView({ behavior: 'smooth', block: 'start' })
    heading.focus({ preventScroll: true })
  }, [currentStep])

  useEffect(() => {
    setLessonCompletionReady(false)
  }, [lessonId])

  if (!lesson) {
    return <Navigate to="/" replace />
  }

  const lessonProgress = progress[lesson.id]
  const priorStepsComplete = [1, 2, 3, 4, 5, 6].every((step) =>
    lessonProgress.completedSteps.includes(step),
  )
  const canCompleteLesson =
    isImplementedLesson(lesson.id) && lessonCompletionReady && priorStepsComplete

  const completeLesson = () => {
    if (!canCompleteLesson) return
    markStepComplete(lesson.id, 7)
  }

  return (
    <LessonShell
      lesson={lesson}
      progress={lessonProgress}
      currentStep={currentStep}
      onStepChange={goToStep}
      stepTitles={stepTitles}
      canCompleteLesson={canCompleteLesson}
      onCompleteLesson={completeLesson}
    >
      <Suspense
        fallback={
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600">
            학습 화면을 준비하고 있습니다.
          </div>
        }
      >
        <LessonContent
          lesson={lesson}
          currentStep={currentStep}
          progress={lessonProgress}
          onStepComplete={completeStep}
          onLessonCompletionReadyChange={setLessonCompletionReady}
        />
      </Suspense>
    </LessonShell>
  )
}
