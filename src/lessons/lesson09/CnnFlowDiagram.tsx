import { ArrowDown, ArrowRight } from 'lucide-react'
import { CNN_FLOW_ROLES, cnnFlowLabel, type CnnFlowItem } from './lesson09Data'

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

export function CnnOverview() {
  return <section className="mb-6 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 sm:p-5" aria-label="CNN 전체 구조 개요">
    <h3 className="font-black text-cyan-950">먼저 전체 보기 · 합성곱층 → 풀링층 → 완전 연결층</h3>
    <p className="mt-2 text-sm leading-6">작은 영역에서 특징을 찾고, 대표 정보를 남기며 공간 크기를 줄인 뒤, 추출한 특징을 종합하여 분류합니다.</p>
    <div className="mt-4"><CnnFlowDiagram flow={['합성곱', '풀링', '완전연결층']} /></div>
    <figure className="mt-4 rounded-xl bg-white p-3">
      <svg viewBox="0 0 300 88" className="w-full" role="img" aria-label="특징 추출 설명용 그림: 경계선, 눈과 코 같은 부분 특징, 부분이 모인 얼굴 모양">
        <g fill="none" stroke="#6d28d9" strokeWidth="3"><path d="M16 57 V18 H55 M65 56 L82 22" /><ellipse cx="125" cy="35" rx="10" ry="6" /><ellipse cx="159" cy="35" rx="10" ry="6" /><path d="M135 53 L142 61 L149 53 M225 29 L229 10 L244 23 L263 23 L280 10 L281 35 Q290 68 254 72 Q217 68 225 29Z" /><path d="M238 39 H244 M266 39 H272 M250 51 L256 56 L262 51" /></g>
        <g fill="#0f172a" fontSize="10" textAnchor="middle"><text x="47" y="84">경계선</text><text x="142" y="84">부분 특징</text><text x="253" y="84">더 큰 특징</text></g>
      </svg>
      <figcaption className="mt-2 text-sm leading-6">교과서 104~105쪽의 특징 추출 설명을 단순화한 예입니다. 여러 합성곱층에서 경계선·부분·더 큰 특징을 연결해 살펴볼 수 있지만, 모든 CNN이 같은 특징을 같은 순서로 찾는 것은 아닙니다.</figcaption>
    </figure>
  </section>
}

export default function CnnFlowDiagram({ flow }: { flow: readonly CnnFlowItem[] }) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-stretch" role="img" aria-label={flow.map((item) => `${cnnFlowLabel(item)}: ${CNN_FLOW_ROLES[item]}`).join(', ')}>
      {flow.map((item, index) => (
        <div className="contents" key={item}>
          <div className={`min-w-0 rounded-2xl border p-3 text-center md:flex-1 ${tone[item]}`}>
            <strong className="block text-sm">{cnnFlowLabel(item)}</strong>
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
