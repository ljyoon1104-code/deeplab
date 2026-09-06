import type { LessonContentProps } from '../lessonRegistry'
import { Lesson10Provider } from './Lesson10Context'
import {
  Lesson10Step1,
  Lesson10Step2,
  Lesson10Step3,
  Lesson10Step4,
  Lesson10Step5,
  Lesson10Step6,
  Lesson10Step7,
} from './Lesson10Steps'

function Lesson10Content({
  currentStep,
  progress,
  onStepComplete,
  onLessonCompletionReadyChange,
}: LessonContentProps) {
  const isComplete = (step: number) => progress.completedSteps.includes(step)
  const priorStepsComplete = [1, 2, 3, 4, 5, 6].every(isComplete)
  return (
    <>
      <Lesson10Step1 active={currentStep === 1} isComplete={isComplete(1)} onComplete={() => onStepComplete(1)} />
      <Lesson10Step2 active={currentStep === 2} isComplete={isComplete(2)} onComplete={() => onStepComplete(2)} />
      <Lesson10Step3 active={currentStep === 3} isComplete={isComplete(3)} onComplete={() => onStepComplete(3)} />
      <Lesson10Step4 active={currentStep === 4} isComplete={isComplete(4)} onComplete={() => onStepComplete(4)} />
      <Lesson10Step5 active={currentStep === 5} isComplete={isComplete(5)} onComplete={() => onStepComplete(5)} />
      <Lesson10Step6 active={currentStep === 6} isComplete={isComplete(6)} onComplete={() => onStepComplete(6)} />
      <Lesson10Step7
        active={currentStep === 7}
        isComplete={isComplete(7)}
        onComplete={() => onStepComplete(7)}
        priorStepsComplete={priorStepsComplete}
        onCompletionReadyChange={onLessonCompletionReadyChange}
      />
    </>
  )
}

export default function Lesson10(props: LessonContentProps) {
  return <Lesson10Provider><Lesson10Content {...props} /></Lesson10Provider>
}
