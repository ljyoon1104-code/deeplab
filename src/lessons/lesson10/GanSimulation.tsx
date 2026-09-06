import { GAN_ROUNDS, REAL_PATTERN } from './lesson10Data'

export default function GanSimulation({ round }: { round: number }) {
  const current = GAN_ROUNDS[Math.max(0, Math.min(GAN_ROUNDS.length - 1, round - 1))]
  const Pattern = ({ values, label, tone }: { values: readonly string[]; label: string; tone: string }) => (
    <div><p className="mb-2 text-sm font-black">{label}</p><div className={`grid grid-cols-4 gap-2 rounded-2xl border p-3 ${tone}`} aria-label={`${label}: ${values.join(', ')}`}>{values.map((shape, index) => <span key={`${shape}-${index}`} className="flex aspect-square items-center justify-center rounded-xl bg-white text-3xl font-black shadow-sm">{shape}</span>)}</div></div>
  )
  return (
    <div className="grid gap-5" aria-live="polite">
      <p className="rounded-full bg-slate-900 px-4 py-2 text-center text-sm font-black text-white">현재 Round {current.round} / 4</p>
      <div className="grid gap-5 sm:grid-cols-2"><Pattern values={REAL_PATTERN} label="실제 데이터 패턴" tone="border-cyan-300 bg-cyan-50" /><Pattern values={current.generated} label="현재 생성 결과" tone="border-violet-300 bg-violet-50" /></div>
      <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-orange-200 bg-orange-50 p-4"><p className="text-sm font-black text-orange-950">감별자의 판단</p><p className="mt-2 leading-6">{current.judgment}</p></div><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-sm font-black text-emerald-950">생성자가 개선하려는 부분</p><p className="mt-2 leading-6">{current.improvement}</p></div></div>
    </div>
  )
}
