import { ArrowRight } from 'lucide-react'

const signals = ['입력', '계산', '출력', '학습']

export function SignalFlow() {
  return (
    <div
      className="signal-flow min-w-0 max-w-full rounded-xl focus-visible:outline-3 focus-visible:outline-indigo-600"
      role="region"
      tabIndex={0}
      aria-label="입력에서 계산, 출력, 학습으로 이어지는 딥러닝 흐름"
    >
      {signals.map((signal, index) => (
        <div className="contents" key={signal}>
          <div className="signal-node">
            <span className="signal-node-dot" aria-hidden="true" />
            <span>{signal}</span>
          </div>
          {index < signals.length - 1 && (
            <ArrowRight className="signal-arrow" size={18} aria-hidden="true" />
          )}
        </div>
      ))}
    </div>
  )
}
