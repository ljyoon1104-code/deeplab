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
  const isFirst = currentStep <= 1
  const isLast = currentStep >= STEP_COUNT
  const buttonStyle = 'min-h-12 min-w-0 whitespace-nowrap enabled:active:translate-y-0.5 motion-reduce:transition-none sm:min-w-36'

  return (
    <nav aria-label="전체 STEP 이동" className="mt-10 border-t border-slate-200 bg-white py-4 shadow-[0_-12px_30px_-28px_rgba(30,41,59,0.7)]">
      <div className="mx-auto grid max-w-6xl grid-cols-2 items-center gap-3 px-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:px-6 lg:px-8">
        <Button className={`${buttonStyle} col-start-1`} variant="secondary" onClick={onPrevious} disabled={isFirst}>
          <ArrowLeft className="shrink-0" size={18} aria-hidden="true" />
          이전 STEP
        </Button>
        <div
          id="lesson-navigation-help"
          className="col-span-2 col-start-1 row-start-1 min-w-0 text-center text-sm leading-6 text-slate-700 sm:col-span-1 sm:col-start-2 sm:row-start-auto"
          aria-live="polite"
        >
          <p className="font-bold tabular-nums">STEP {currentStep} / {STEP_COUNT}</p>
          <p>{lessonCompleted ? '차시 완료 기록이 유지됩니다.' : isLast
            ? canComplete ? '필수 활동을 마쳤습니다. 차시 완료를 눌러 주세요.' : '차시 완료를 위해 남은 STEP의 필수 활동을 마쳐 주세요.'
            : 'STEP 이동과 학습 완료는 별개입니다.'}</p>
        </div>
        {isLast ? (
          <Button
            variant="secondary"
            className={`${buttonStyle} col-start-2 enabled:border-emerald-600 enabled:bg-emerald-600 enabled:text-white enabled:hover:bg-emerald-700 disabled:bg-slate-100 sm:col-start-3`}
            onClick={onComplete}
            disabled={!canComplete || lessonCompleted || !onComplete}
            aria-describedby="lesson-navigation-help"
          >
            <Check className="shrink-0" size={18} aria-hidden="true" />
            {lessonCompleted ? '차시 완료됨' : '차시 완료'}
          </Button>
        ) : (
          <Button className={`${buttonStyle} col-start-2 sm:col-start-3`} onClick={onNext}>
            다음 STEP
            <ArrowRight className="shrink-0" size={18} aria-hidden="true" />
          </Button>
        )}
      </div>
    </nav>
  )
}
