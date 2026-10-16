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
      <div className="grid gap-3">
        <Pattern values={REAL_PATTERN} label="실제 데이터 패턴 · 비교 기준" position={position} />
        {previous && <Pattern values={previous.generated} label={`이전 생성 결과 · Round ${previous.round}`} position={position} />}
        <Pattern values={current.generated} label={`이번에 공개한 생성 결과 · Round ${current.round}`} position={position} />
      </div>
      <div role="group" aria-label="도형 비교 위치"><p className="text-sm font-bold">비교할 위치를 직접 선택하세요. 위아래의 같은 번호끼리 봅니다.</p><div className="mt-2 grid grid-cols-4 gap-2">{REAL_PATTERN.map((_, index) => <button key={index} type="button" aria-pressed={position === index} onClick={() => setPosition(index)} className={`min-h-11 rounded-lg border-2 text-sm font-bold ${position === index ? 'border-violet-600 bg-violet-50' : 'border-slate-300 bg-white'}`}>{index + 1}번{position === index && ' ✓'}</button>)}</div></div>
      <p className="rounded-xl bg-violet-50 p-3 text-sm leading-6" aria-live="polite">{position === undefined ? '번호를 선택해 이전 결과와 달라진 곳, 실제 패턴과 아직 다른 곳을 비교하세요.' : <><strong>{position + 1}번 비교:</strong> {previous ? `이전 ${previous.generated[position]} → 이번 ${current.generated[position]}. ${previous.generated[position] === current.generated[position] ? '이 위치의 모양은 유지됐습니다.' : '이 위치의 모양이 달라졌습니다.'}` : `이번 모양은 ${current.generated[position]}입니다.`} 실제 패턴의 같은 위치는 {REAL_PATTERN[position]}입니다. {current.generated[position] === REAL_PATTERN[position] ? '같은 모양입니다.' : '모양 또는 채움이 다릅니다.'}</>}</p>
      <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-orange-200 bg-orange-50 p-4"><p className="text-sm font-black text-orange-950">감별자의 판단</p><p className="mt-2 leading-6">{current.judgment}</p></div><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-sm font-black text-emerald-950">생성자가 개선하려는 부분</p><p className="mt-2 leading-6">{showImprovement ? current.improvement : '실제 패턴과 다른 위치를 직접 비교하고 아래에서 개선 방향을 판단하세요. 올바르게 해석하면 설명이 나타납니다.'}</p></div></div>
    </div>
  )
}
