import type { LessonContentProps } from '../lessonRegistry'
import { Lesson09Provider } from './Lesson09Context'
import {
  Lesson09Step1,
  Lesson09Step2,
  Lesson09Step3,
  Lesson09Step4,
  Lesson09Step5,
  Lesson09Step6,
  Lesson09Step7,
} from './Lesson09Steps'

function Lesson09Content({
  currentStep,
  progress,
  onStepComplete,
  onLessonCompletionReadyChange,
}: LessonContentProps) {
  const isComplete = (step: number) => progress.completedSteps.includes(step)
  const priorStepsComplete = [1, 2, 3, 4, 5, 6].every(isComplete)
  return (
    <>
      <Lesson09Step1 active={currentStep === 1} isComplete={isComplete(1)} onComplete={() => onStepComplete(1)} />
      <Lesson09Step2 active={currentStep === 2} isComplete={isComplete(2)} onComplete={() => onStepComplete(2)} />
      <Lesson09Step3 active={currentStep === 3} isComplete={isComplete(3)} onComplete={() => onStepComplete(3)} />
      <Lesson09Step4 active={currentStep === 4} isComplete={isComplete(4)} onComplete={() => onStepComplete(4)} />
      <Lesson09Step5 active={currentStep === 5} isComplete={isComplete(5)} onComplete={() => onStepComplete(5)} />
      <Lesson09Step6 active={currentStep === 6} isComplete={isComplete(6)} onComplete={() => onStepComplete(6)} />
      <Lesson09Step7
        active={currentStep === 7}
        isComplete={isComplete(7)}
        onComplete={() => onStepComplete(7)}
        priorStepsComplete={priorStepsComplete}
        onCompletionReadyChange={onLessonCompletionReadyChange}
      />
    </>
  )
}

export default function Lesson09(props: LessonContentProps) {
  return <Lesson09Provider><Lesson09Content {...props} /></Lesson09Provider>
}
