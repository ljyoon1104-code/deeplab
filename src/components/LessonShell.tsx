import { ArrowLeft, FlaskConical } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { LessonId, LessonMetadata } from '../types/lesson'
import type { LessonProgress } from '../types/progress'
import { BottomLessonNavigation } from './BottomLessonNavigation'
import { ProgressBar } from './ProgressBar'
import { StepNavigation } from './StepNavigation'

// 표시 안내만 정의합니다. 답안·완료 판정이나 저장 상태를 변경하지 않습니다.
const partialReviewNotes: Partial<Record<LessonId, Partial<Record<number, string>>>> = {
  '09': {
    5: '선택 연습의 입력·제출 상태는 새로고침하면 초기화됩니다. 필수 활동의 저장 답안은 그대로 복원됩니다.',
  },
  '10': {
    3: 'Round 예측과 한계 판단의 임시 답안은 새로고침하면 초기화됩니다. 저장된 Round 관찰 기록은 유지됩니다.',
    4: '파형 하나의 한계 판단은 임시 답안입니다. 새로고침하면 초기화되지만 저장된 음성 인식 답안은 복원됩니다.',
    5: '단서 구분과 현재 제출 표시는 새로고침하면 초기화됩니다. 저장된 파형·문장 선택은 복원됩니다.',
    6: '세 사례의 방법·한계 판단은 새로고침하면 초기화됩니다. 저장된 비교 카드 답안은 복원됩니다.',
    7: '서비스 적용의 임시 답안은 새로고침하면 초기화됩니다. 역할 연결과 확인 문제의 저장 답안은 복원됩니다.',
  },
  '11': {
    3: '역연결의 현재 선택·제출 표시는 새로고침하면 초기화됩니다. 저장된 인덱스 연결과 역연결 정답 기록은 유지됩니다.',
    4: '값 1의 인덱스 입력·제출 상태는 새로고침하면 초기화됩니다. 길이·오류 벡터 판단의 저장 답안은 복원됩니다.',
  },
}

function temporaryReviewNote(lessonId: LessonId, step: number) {
  if (['01', '02', '03', '04', '05', '06'].includes(lessonId)) {
    return '이 활동의 임시 답안·제출 상태는 새로고침하면 초기화됩니다.'
  }
  if (lessonId === '07') {
    return '문제 답안·확인 상태는 새로고침하면 초기화됩니다. 저장된 표본·픽셀 선택은 복원됩니다.'
  }
  if (lessonId === '08') {
    return '임시 답안·확인 상태는 새로고침하면 초기화됩니다. 실험 기록은 남지만 실제 모델은 다시 학습해야 합니다.'
  }
  return partialReviewNotes[lessonId]?.[step]
}

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
  const reviewNote = progress.completed
    ? temporaryReviewNote(lesson.id, currentStep)
    : undefined
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
        {reviewNote && (
          <aside aria-label="완료 기록과 복습 상태 안내" className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm leading-6 text-indigo-950">
            <p className="font-bold">기존 완료 기록은 유지됩니다. 아래의 ‘남음’·‘미제출’은 현재 복습에서 아직 해결하지 않은 답안 기준입니다.</p>
            <p className="mt-1">{reviewNote}</p>
          </aside>
        )}
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
