import { AlertTriangle, Database, RefreshCcw } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import type { LessonContentProps } from '../lessonRegistry'
import { Lesson07LabProvider, useLesson07Lab } from './Lesson07Context'
import {
  Lesson07Step1,
  Lesson07Step2,
  Lesson07Step3,
  Lesson07Step4,
  Lesson07Step5,
  Lesson07Step6,
  Lesson07Step7,
} from './Lesson07Steps'

function Lesson07Content({
  currentStep,
  progress,
  onStepComplete,
  onLessonCompletionReadyChange,
}: LessonContentProps) {
  const { dataset, metadata, selectedSample, loading, error, retry } = useLesson07Lab()
  const isComplete = (step: number) => progress.completedSteps.includes(step)
  const priorStepsComplete = [1, 2, 3, 4, 5, 6].every(isComplete)

  if (loading) {
    return (
      <Card as="section" className="p-7 sm:p-9" aria-live="polite">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
            <Database className="animate-pulse" size={22} aria-hidden="true" />
          </span>
          <div>
            <h2 id="lesson-step-title" tabIndex={-1} className="step-focus-target text-xl font-black focus:outline-none sm:text-2xl">
              MNIST 데이터를 불러오는 중입니다.
            </h2>
            <p className="mt-2 leading-7 text-slate-600">
              선택한 Train subset과 출처 정보를 확인하고 있습니다.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  if (error || !dataset || !metadata || !selectedSample) {
    return (
      <Card as="section" className="p-7 sm:p-9" aria-live="assertive">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700">
            <AlertTriangle size={22} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id="lesson-step-title" tabIndex={-1} className="step-focus-target text-xl font-black focus:outline-none sm:text-2xl">
              MNIST 데이터를 불러오지 못했습니다.
            </h2>
            <p className="mt-2 break-words leading-7 text-slate-600">
              {error ?? '불러온 데이터에서 사용할 수 있는 sample을 찾지 못했습니다.'}
            </p>
            <Button className="mt-5" onClick={() => void retry()}>
              <RefreshCcw size={18} aria-hidden="true" />
              다시 시도
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Lesson07Step1 active={currentStep === 1} isComplete={isComplete(1)} onComplete={() => onStepComplete(1)} />
      <Lesson07Step2 active={currentStep === 2} isComplete={isComplete(2)} onComplete={() => onStepComplete(2)} />
      <Lesson07Step3 active={currentStep === 3} isComplete={isComplete(3)} onComplete={() => onStepComplete(3)} />
      <Lesson07Step4 active={currentStep === 4} isComplete={isComplete(4)} onComplete={() => onStepComplete(4)} />
      <Lesson07Step5 active={currentStep === 5} isComplete={isComplete(5)} onComplete={() => onStepComplete(5)} />
      <Lesson07Step6 active={currentStep === 6} isComplete={isComplete(6)} onComplete={() => onStepComplete(6)} />
      <Lesson07Step7
        active={currentStep === 7}
        isComplete={isComplete(7)}
        onComplete={() => onStepComplete(7)}
        priorStepsComplete={priorStepsComplete}
        onCompletionReadyChange={onLessonCompletionReadyChange}
      />
    </>
  )
}

export default function Lesson07(props: LessonContentProps) {
  return (
    <Lesson07LabProvider progress={props.progress}>
      <Lesson07Content {...props} />
    </Lesson07LabProvider>
  )
}
