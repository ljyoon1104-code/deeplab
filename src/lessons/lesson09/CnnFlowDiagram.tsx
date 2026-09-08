import { ArrowDown, ArrowRight } from 'lucide-react'
import { CNN_FLOW_ROLES, type CnnFlowItem } from './lesson09Data'

const tone: Record<CnnFlowItem, string> = {
  '입력 이미지': 'border-cyan-300 bg-cyan-50 text-cyan-950',
  '합성곱': 'border-violet-300 bg-violet-50 text-violet-950',
  ReLU: 'border-amber-300 bg-amber-50 text-amber-950',
  '풀링': 'border-emerald-300 bg-emerald-50 text-emerald-950',
  flatten: 'border-slate-300 bg-slate-50 text-slate-950',
  '완전연결층': 'border-violet-300 bg-violet-50 text-violet-950',
  Softmax: 'border-cyan-300 bg-cyan-50 text-cyan-950',
  '클래스 예측': 'border-green-300 bg-green-50 text-green-950',
}

export default function CnnFlowDiagram({ flow }: { flow: readonly CnnFlowItem[] }) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-stretch" role="img" aria-label={flow.map((item) => `${item}: ${CNN_FLOW_ROLES[item]}`).join(', ')}>
      {flow.map((item, index) => (
        <div className="contents" key={item}>
          <div className={`min-w-0 rounded-2xl border p-3 text-center md:flex-1 ${tone[item]}`}>
            <strong className="block text-sm">{item}</strong>
            <span className="mt-1 block text-xs leading-5">{CNN_FLOW_ROLES[item]}</span>
          </div>
          {index < flow.length - 1 ? (
            <>
              <ArrowDown className="mx-auto text-slate-500 md:hidden" size={20} aria-hidden="true" />
              <ArrowRight className="my-auto hidden shrink-0 self-center text-slate-500 md:block" size={20} aria-hidden="true" />
            </>
          ) : null}
        </div>
      ))}
    </div>
  )
}
