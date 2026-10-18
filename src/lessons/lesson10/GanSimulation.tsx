import { GAN_ROUNDS, REAL_PATTERN } from './lesson10Data'
import { useState } from 'react'

function Pattern({ values, label, position }: { values: readonly string[]; label: string; position?: number }) {
  return <div><p className="mb-2 text-sm font-black">{label}</p><div className="grid grid-cols-4 gap-2 rounded-xl border border-slate-300 bg-slate-50 p-2" aria-label={`${label}: ${values.join(', ')}`}>
    {values.map((shape, index) => <span key={index} className={`flex min-h-14 flex-col items-center justify-center rounded-lg border-2 bg-white ${position === index ? 'border-violet-600' : 'border-transparent'}`}><span className="text-xs font-bold">{index + 1}번 {position === index && '· 비교'}</span><span className="text-3xl font-black">{shape}</span></span>)}
  </div></div>
}

export function PreviousGanPattern({ round }: { round: number }) {
  const previous = GAN_ROUNDS[round - 2]
  return previous ? <Pattern values={previous.generated} label={`먼저 살펴볼 이전 생성 결과 · Round ${previous.round}`} /> : null
}

export default function GanSimulation({ round, showImprovement = true }: { round: number; showImprovement?: boolean }) {
  const current = GAN_ROUNDS[Math.max(0, Math.min(GAN_ROUNDS.length - 1, round - 1))]
  const previous = GAN_ROUNDS[current.round - 2]
  const [position, setPosition] = useState<number | undefined>()
  return (
    <div className="grid gap-5" aria-live="polite">
      <p className="rounded-full bg-slate-900 px-4 py-2 text-center text-sm font-black text-white">현재 Round {current.round} / 4</p>
      <p className="text-sm leading-6">각 위치에서 <strong>비교 기준 → 이전 결과 → 이번 결과</strong>를 나란히 보세요. 위치 카드를 누르면 바뀐 점과 남은 차이가 그 자리에서 나타납니다.</p>
      <div className="grid items-start gap-3 sm:grid-cols-2" role="group" aria-label="도형 비교 위치">
        {REAL_PATTERN.map((real, index) => <div key={index} className={`min-w-0 rounded-xl border-2 p-3 ${position === index ? 'border-violet-600 bg-violet-50' : 'border-slate-300 bg-white'}`}>
          <button type="button" aria-pressed={position === index} onClick={() => setPosition(index)} className="min-h-11 w-full rounded-lg text-left focus-visible:outline-2 focus-visible:outline-violet-700"><span className="font-black">{index + 1}번 위치{position === index && ' · 비교 중'}</span>
            <span className={`mt-3 grid gap-2 text-center ${previous ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <span><span className="block text-sm">실제 기준</span><span className="mt-1 block text-3xl font-black">{real}</span></span>
              {previous && <span><span className="block text-sm">이전 {previous.round}</span><span className="mt-1 block text-3xl font-black">{previous.generated[index]}</span></span>}
              <span><span className="block text-sm">이번 {current.round}</span><span className="mt-1 block text-3xl font-black">{current.generated[index]}</span></span>
            </span>
          </button>
          {position === index && <p className="mt-3 border-t border-violet-200 pt-3 text-sm leading-6" role="status">{previous ? previous.generated[index] === current.generated[index] ? '이전과 모양이 같습니다. ' : '이전보다 모양 또는 채움이 달라졌습니다. ' : '첫 결과를 기준과 비교합니다. '}{current.generated[index] === real ? '실제 기준과 같은 모양입니다.' : '실제 기준과 모양 또는 채움이 다릅니다.'}</p>}
        </div>)}
      </div>
      <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-orange-200 bg-orange-50 p-4"><p className="text-sm font-black text-orange-950">감별자의 판단</p><p className="mt-2 leading-6">{current.judgment}</p></div><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-sm font-black text-emerald-950">생성자가 개선하려는 부분</p><p className="mt-2 leading-6">{showImprovement ? current.improvement : '실제 패턴과 다른 위치를 직접 비교하고 아래에서 개선 방향을 판단하세요. 올바르게 해석하면 설명이 나타납니다.'}</p></div></div>
    </div>
  )
}
