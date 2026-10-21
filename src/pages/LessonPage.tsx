import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { LessonShell } from '../components/LessonShell'
import { pinnedHeaderOffset } from '../lib/viewportLayout'
import { getLesson } from '../data/lessons'
import { useProgress } from '../hooks/useProgress'
import {
  getLessonContent,
  getLessonStepTitles,
  isImplementedLesson,
  type FoundationNavigationState,
} from '../lessons/lessonRegistry'
import { foundationStorageSteps, type FoundationId } from '../lessons/foundations/curriculum'

export function LessonPage() {
  const { lessonId = '' } = useParams()
  const lesson = getLesson(lessonId)
  const { progress, setCurrentStep, markStepComplete } = useProgress()
  const [lessonCompletionReady, setLessonCompletionReady] = useState(false)
  const [foundationNavigation, setFoundationNavigation] = useState<FoundationNavigationState>()
  const foundationMode = ['01', '02', '03', '04', '05', '06'].includes(lessonId)
  const storageSteps = useMemo(() => foundationMode ? foundationStorageSteps(lessonId as FoundationId) : [1, 2, 3, 4, 5, 6, 7], [foundationMode, lessonId])
  const savedProgress = lesson ? progress[lesson.id] : undefined
  // Reordered teaching pages keep their original stored STEP slots.
  const lessonProgress = useMemo(() => savedProgress && foundationMode ? {
    ...savedProgress,
    currentStep: Math.max(1, storageSteps.indexOf(savedProgress.currentStep) + 1),
    completedSteps: storageSteps.flatMap((stored, index) => savedProgress.completedSteps.includes(stored) ? [index + 1] : []),
  } : savedProgress, [savedProgress, foundationMode, storageSteps])
  const currentStep = lessonProgress?.currentStep ?? 1
  const LessonContent = getLessonContent(lessonId)
  const stepTitles = getLessonStepTitles(lessonId)
  const previousStep = useRef(currentStep)

  const goToStep = useCallback(
    (step: number) => {
      if (!lesson) return
      setCurrentStep(lesson.id, storageSteps[Math.min(7, Math.max(1, step)) - 1])
    },
    [lesson, setCurrentStep, storageSteps],
  )

  const completeStep = useCallback(
    (step: number) => {
      if (!lesson) return
      markStepComplete(lesson.id, storageSteps[Math.min(7, Math.max(1, step)) - 1])
    },
    [lesson, markStepComplete, storageSteps],
  )

  useEffect(() => {
    if (previousStep.current === currentStep) return
    previousStep.current = currentStep

    const heading = document.getElementById('lesson-step-title')
    if (!heading) return

    if (foundationMode) heading.style.scrollMarginTop = `${pinnedHeaderOffset() + 16}px`
    heading.scrollIntoView({ behavior: foundationMode && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
    heading.focus({ preventScroll: true })
  }, [currentStep, foundationMode])

  useEffect(() => {
    setLessonCompletionReady(false)
  }, [lessonId])

  if (!lesson || !lessonProgress) {
    return <Navigate to="/" replace />
  }

  const priorStepsComplete = [1, 2, 3, 4, 5, 6].every((step) =>
    lessonProgress.completedSteps.includes(step),
  )
  const canCompleteLesson =
    isImplementedLesson(lesson.id) && lessonCompletionReady && priorStepsComplete

  const completeLesson = () => {
    if (!canCompleteLesson) return
    completeStep(7)
  }

  return (
    <LessonShell
      lesson={lesson}
      progress={lessonProgress}
      currentStep={currentStep}
      onStepChange={goToStep}
      onNextStep={foundationNavigation?.lessonId === lesson.id && foundationNavigation.step === currentStep ? foundationNavigation.advance : undefined}
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
          onStepChange={foundationMode ? goToStep : undefined}
          onFoundationNavigationChange={foundationMode ? setFoundationNavigation : undefined}
        />
      </Suspense>
    </LessonShell>
  )
}
