import { CONTEXT_SENTENCES } from './lesson11Data'

export default function ContextMeaningActivity({ assignments, onChoose }: { assignments: Record<string, string>; onChoose: (id: string, meaning: string) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {CONTEXT_SENTENCES.map((item, index) => {
        const selected = assignments[item.id]
        const correct = selected === item.answer
        const parts = item.sentence.split(item.target)
        return <fieldset key={item.id} className="rounded-2xl border border-slate-200 p-5"><legend className="px-2 font-black">문맥 {index + 1}</legend><p className="rounded-xl bg-slate-950 p-4 text-lg font-black text-white">{parts[0]}<mark className="rounded bg-amber-300 px-1 text-slate-950">{item.target}</mark>{parts.slice(1).join(item.target)}</p><div className="mt-4 grid gap-2">{item.choices.map((choice) => <button key={choice} type="button" aria-pressed={selected === choice} onClick={() => onChoose(item.id, choice)} className={`min-h-12 rounded-xl border p-3 text-left font-bold ${selected === choice ? 'border-violet-600 bg-violet-50' : 'border-slate-300 bg-white'}`}>{choice}</button>)}</div>{selected ? <p className={`mt-3 text-sm font-bold ${correct ? 'text-emerald-700' : 'text-rose-700'}`} role="status">{correct ? `✓ 주변 단어를 보면 “${item.target}”은 ‘${item.answer}’ 뜻입니다.` : '✕ 강조된 단어 앞뒤의 행동과 상황을 다시 확인하세요.'}</p> : null}</fieldset>
      })}
    </div>
  )
}
