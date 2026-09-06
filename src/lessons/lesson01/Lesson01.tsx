import type { LessonContentProps } from '../lessonRegistry'
import {
  Lesson01Step1,
  Lesson01Step2,
  Lesson01Step3,
  Lesson01Step4,
  Lesson01Step5,
  Lesson01Step6,
  Lesson01Step7,
} from './Lesson01Steps'

export default function Lesson01({
  currentStep,
  progress,
  onStepComplete,
  onLessonCompletionReadyChange,
}: LessonContentProps) {
  const isComplete = (step: number) => progress.completedSteps.includes(step)
  const priorStepsComplete = [1, 2, 3, 4, 5, 6].every(isComplete)

  return (
    <>
      <Lesson01Step1
        active={currentStep === 1}
        isComplete={isComplete(1)}
        onComplete={() => onStepComplete(1)}
      />
      <Lesson01Step2
        active={currentStep === 2}
        isComplete={isComplete(2)}
        onComplete={() => onStepComplete(2)}
      />
      <Lesson01Step3
        active={currentStep === 3}
        isComplete={isComplete(3)}
        onComplete={() => onStepComplete(3)}
      />
      <Lesson01Step4
        active={currentStep === 4}
        isComplete={isComplete(4)}
        onComplete={() => onStepComplete(4)}
      />
      <Lesson01Step5
        active={currentStep === 5}
        isComplete={isComplete(5)}
        onComplete={() => onStepComplete(5)}
      />
      <Lesson01Step6
        active={currentStep === 6}
        isComplete={isComplete(6)}
        onComplete={() => onStepComplete(6)}
      />
      <Lesson01Step7
        active={currentStep === 7}
        isComplete={isComplete(7)}
        onComplete={() => onStepComplete(7)}
        priorStepsComplete={priorStepsComplete}
        onCompletionReadyChange={onLessonCompletionReadyChange}
      />
    </>
  )
}
