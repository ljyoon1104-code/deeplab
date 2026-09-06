import { Construction, MousePointer2 } from 'lucide-react'
import { lessonSteps } from '../../data/lessons'
import { Card } from '../../components/ui/Card'
import type { LessonContentProps } from '../lessonRegistry'

export default function LessonPlaceholder({
  lesson,
  currentStep,
}: LessonContentProps) {
  const stepTitle = lessonSteps[currentStep - 1]

  return (
    <Card as="section" className="overflow-hidden">
      <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-50 via-white to-cyan-50 px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex items-center gap-3 text-indigo-700">
          <span className="flex size-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-indigo-100">
            <Construction size={21} aria-hidden="true" />
          </span>
          <span className="text-sm font-bold tracking-[0.14em]">STEP {currentStep}</span>
        </div>
        <h2
          id="lesson-step-title"
          tabIndex={-1}
          className="step-focus-target mt-5 text-2xl font-black tracking-tight text-slate-950 focus:outline-none sm:text-3xl"
        >
          {stepTitle}
        </h2>
      </div>
      <div className="px-5 py-8 sm:px-8 sm:py-10">
        <p className="text-lg font-bold text-slate-900">
          이 활동은 다음 구현 단계에서 추가됩니다.
        </p>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">
          현재는 {lesson.id}차시의 공통 화면과 STEP 이동을 확인할 수 있습니다.
          이동한 위치는 이 기기에 저장되지만 학습 완료로 계산되지는 않습니다.
        </p>
        <div className="mt-8 flex items-start gap-3 border-t border-slate-200 pt-6 text-sm leading-6 text-slate-600">
          <MousePointer2 className="mt-0.5 shrink-0 text-cyan-600" size={19} aria-hidden="true" />
          <p>
            위 STEP 목록이나 아래 이전·다음 버튼으로 다른 단계의 자리 표시자를 볼 수
            있습니다.
          </p>
        </div>
      </div>
    </Card>
  )
}
