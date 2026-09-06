import type { LessonContentProps } from '../lessonRegistry'
import { Lesson12Provider } from './Lesson12Context'
import { Lesson12Step1, Lesson12Step2, Lesson12Step3, Lesson12Step4, Lesson12Step5, Lesson12Step6, Lesson12Step7 } from './Lesson12Steps'

function Lesson12Content({ currentStep, progress, onStepComplete, onLessonCompletionReadyChange }: LessonContentProps) {
  const isComplete = (step: number) => progress.completedSteps.includes(step)
  const priorStepsComplete = [1, 2, 3, 4, 5, 6].every(isComplete)
  return <>
    <Lesson12Step1 active={currentStep === 1} isComplete={isComplete(1)} onComplete={() => onStepComplete(1)} />
    <Lesson12Step2 active={currentStep === 2} isComplete={isComplete(2)} onComplete={() => onStepComplete(2)} />
    <Lesson12Step3 active={currentStep === 3} isComplete={isComplete(3)} onComplete={() => onStepComplete(3)} />
    <Lesson12Step4 active={currentStep === 4} isComplete={isComplete(4)} onComplete={() => onStepComplete(4)} />
    <Lesson12Step5 active={currentStep === 5} isComplete={isComplete(5)} onComplete={() => onStepComplete(5)} />
    <Lesson12Step6 active={currentStep === 6} isComplete={isComplete(6)} onComplete={() => onStepComplete(6)} />
    <Lesson12Step7 active={currentStep === 7} isComplete={isComplete(7)} onComplete={() => onStepComplete(7)} priorStepsComplete={priorStepsComplete} onCompletionReadyChange={onLessonCompletionReadyChange} />
  </>
}

export default function Lesson12(props: LessonContentProps) {
  return <Lesson12Provider><Lesson12Content {...props} /></Lesson12Provider>
}

