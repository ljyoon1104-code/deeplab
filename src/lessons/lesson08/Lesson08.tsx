import type { LessonContentProps } from '../lessonRegistry'
import { Lesson08LabProvider } from './Lesson08Context'
import {
  Lesson08Step1,
  Lesson08Step2,
  Lesson08Step3,
  Lesson08Step4,
  Lesson08Step5,
  Lesson08Step6,
  Lesson08Step7,
} from './Lesson08Steps'

function Lesson08Content({
  currentStep,
  progress,
  onStepComplete,
  onLessonCompletionReadyChange,
}: LessonContentProps) {
  const isComplete = (step: number) => progress.completedSteps.includes(step)
  const priorStepsComplete = [1, 2, 3, 4, 5, 6].every(isComplete)

  return (
    <>
      <Lesson08Step1 active={currentStep === 1} isComplete={isComplete(1)} onComplete={() => onStepComplete(1)} />
      <Lesson08Step2 active={currentStep === 2} isComplete={isComplete(2)} onComplete={() => onStepComplete(2)} />
      <Lesson08Step3 active={currentStep === 3} isComplete={isComplete(3)} onComplete={() => onStepComplete(3)} />
      <Lesson08Step4 active={currentStep === 4} isComplete={isComplete(4)} onComplete={() => onStepComplete(4)} />
      <Lesson08Step5 active={currentStep === 5} isComplete={isComplete(5)} onComplete={() => onStepComplete(5)} />
      <Lesson08Step6 active={currentStep === 6} isComplete={isComplete(6)} onComplete={() => onStepComplete(6)} />
      <Lesson08Step7
        active={currentStep === 7}
        isComplete={isComplete(7)}
        onComplete={() => onStepComplete(7)}
        priorStepsComplete={priorStepsComplete}
        completedSteps={progress.completedSteps}
        onCompletionReadyChange={onLessonCompletionReadyChange}
      />
    </>
  )
}

export default function Lesson08(props: LessonContentProps) {
  return (
    <Lesson08LabProvider>
      <Lesson08Content {...props} />
    </Lesson08LabProvider>
  )
}
