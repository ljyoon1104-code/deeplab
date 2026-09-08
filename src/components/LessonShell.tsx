import { ArrowLeft, FlaskConical } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { LessonMetadata } from '../types/lesson'
import type { LessonProgress } from '../types/progress'
import { BottomLessonNavigation } from './BottomLessonNavigation'
import { ProgressBar } from './ProgressBar'
import { StepNavigation } from './StepNavigation'

interface LessonShellProps {
  lesson: LessonMetadata
  progress: LessonProgress
  currentStep: number
  onStepChange: (step: number) => void
  stepTitles: readonly string[]
  canCompleteLesson?: boolean
  onCompleteLesson?: () => void
  children: ReactNode
}

export function LessonShell({
  lesson,
  progress,
  currentStep,
  onStepChange,
  stepTitles,
  canCompleteLesson = false,
  onCompleteLesson,
  children,
}: LessonShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-bold text-slate-700 hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              전체 차시
            </Link>
            <div className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-indigo-700">
              <FlaskConical size={17} aria-hidden="true" />
              <span className="hidden min-[390px]:inline">Deep Learning Lab</span>
              <span className="min-[390px]:hidden">DL Lab</span>
            </div>
          </div>

          <div className="mt-3 grid gap-3 border-t border-slate-100 pt-3 md:grid-cols-[minmax(0,1fr)_17rem] md:items-end">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-indigo-600">
                LESSON {lesson.id} / 12
              </p>
              <h1 className="mt-1 text-xl font-black leading-snug tracking-tight text-slate-950 sm:text-2xl">
                {lesson.title}
              </h1>
            </div>
            <div>
              <ProgressBar value={progress.progress} label="차시 진행률" size="sm" />
              <p
                className="mt-1.5 text-right text-xs font-semibold tabular-nums text-slate-600"
                aria-live="polite"
              >
                완료한 STEP {progress.completedSteps.length} / {stepTitles.length}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        <StepNavigation
          steps={stepTitles}
          currentStep={currentStep}
          completedSteps={progress.completedSteps}
          onStepChange={onStepChange}
        />
        <div className="mt-8">{children}</div>
      </main>

      <BottomLessonNavigation
        currentStep={currentStep}
        onPrevious={() => onStepChange(currentStep - 1)}
        onNext={() => onStepChange(currentStep + 1)}
        canComplete={canCompleteLesson}
        lessonCompleted={progress.completed}
        onComplete={onCompleteLesson}
      />
    </div>
  )
}
