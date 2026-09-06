import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { STEP_COUNT } from '../lib/progressStorage'
import { Button } from './ui/Button'

interface BottomLessonNavigationProps {
  currentStep: number
  onPrevious: () => void
  onNext: () => void
  canComplete?: boolean
  lessonCompleted?: boolean
  onComplete?: () => void
}

export function BottomLessonNavigation({
  currentStep,
  onPrevious,
  onNext,
  canComplete = false,
  lessonCompleted = false,
  onComplete,
}: BottomLessonNavigationProps) {
  const isFirst = currentStep === 1
  const isLast = currentStep === STEP_COUNT

  return (
    <div className="mt-10 border-t border-slate-200 bg-white py-3 shadow-[0_-12px_30px_-28px_rgba(30,41,59,0.7)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Button variant="secondary" onClick={onPrevious} disabled={isFirst}>
          <ArrowLeft size={18} aria-hidden="true" />
          이전
        </Button>
        <span className="text-sm font-bold tabular-nums text-slate-700" aria-live="polite">
          {currentStep} / {STEP_COUNT}
        </span>
        {isLast ? (
          <Button
            onClick={onComplete}
            disabled={!canComplete || lessonCompleted}
            aria-label={
              lessonCompleted
                ? '이 차시는 완료되었습니다'
                : canComplete
                  ? 'Lesson 완료하기'
                  : '모든 STEP의 핵심 활동을 마치면 활성화됩니다'
            }
          >
            <Check size={18} aria-hidden="true" />
            {lessonCompleted ? '완료됨' : '완료'}
          </Button>
        ) : (
          <Button onClick={onNext}>
            다음
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  )
}
