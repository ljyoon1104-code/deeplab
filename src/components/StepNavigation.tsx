import { Check, Circle } from 'lucide-react'
interface StepNavigationProps {
  steps: readonly string[]
  currentStep: number
  completedSteps: number[]
  onStepChange: (step: number) => void
}

export function StepNavigation({
  steps,
  currentStep,
  completedSteps,
  onStepChange,
}: StepNavigationProps) {
  return (
    <nav aria-label="차시 STEP" className="step-navigation">
      <ol className="step-list">
        {steps.map((label, index) => {
          const step = index + 1
          const isCurrent = step === currentStep
          const isComplete = completedSteps.includes(step)

          return (
            <li className="step-item" key={label}>
              <button
                type="button"
                className={`step-button ${isCurrent ? 'step-button-current' : ''}`}
                onClick={() => onStepChange(step)}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span className="step-number" aria-hidden="true">
                  {isComplete ? <Check size={15} /> : <Circle size={12} />}
                </span>
                <span>
                  <span className="block text-xs font-bold tracking-wider text-slate-500">
                    STEP {step}
                  </span>
                  <span className="mt-1 block font-semibold text-slate-800">
                    {label}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
