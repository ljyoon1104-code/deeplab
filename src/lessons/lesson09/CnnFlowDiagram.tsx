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
    <p className="mt-2 text-sm leading-6">합성곱 신경망(CNN)은 이웃한 픽셀의 관계를 살펴봅니다. 작은 영역의 값들을 곱하고 더한 뒤, 풀링으로 대표값을 남깁니다. 완전 연결층에서는 그 값들에 가중치를 곱해 더하고 편향을 더하여 분류에 사용할 점수를 계산합니다.</p>
    <p className="mt-2 text-sm leading-6"><strong>픽셀(Pixel)</strong>은 이미지를 이루는 작은 칸이며 밝기나 색상을 숫자로 나타냅니다. <strong>채널(Channel)</strong>은 색상이나 특징값을 구분해 담는 축입니다. 컬러 사진은 보통 빨강·초록·파랑(RGB) 3개 채널을 사용합니다. 아래 사진 실습은 이를 밝기 하나로 바꾼 흑백 1개 채널을 사용합니다.</p>
    <div className="mt-4"><CnnFlowDiagram flow={['합성곱', '풀링', '완전연결층']} /></div>
    <p className="mt-3 text-sm leading-6">지금은 이웃한 픽셀을 살펴보는 이유를 비교합니다. 이어서 합성곱과 풀링을 각각 배우고, STEP 7에서 같은 사진의 전체 처리 결과를 연결합니다.</p>
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
