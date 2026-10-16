import { CONTEXT_SENTENCES } from './lesson11Data'

function MeaningPicture({ id, meaning }: { id: string; meaning: string }) {
  return <figure className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
    <svg viewBox="0 0 220 100" className="mx-auto h-28 w-full max-w-xs" role="img" aria-label={`정답 확인 뒤 보는 뜻 그림: ${meaning}`}>
      {id === 'pear' ? <g stroke="#476b28" strokeWidth="3"><path d="M110 24 C91 24 97 42 85 53 C63 77 84 91 110 91 C138 91 156 76 135 53 C122 41 130 24 110 24Z" fill="#d9d267" /><path d="M111 25 L115 10" /><path d="M116 17 Q135 3 141 15 Q130 28 116 17Z" fill="#6b9c4a" /></g> : null}
      {id === 'boat' ? <g stroke="#225c7e" strokeWidth="3"><path d="M61 59 H164 L149 80 H78Z" fill="#e0b47c" /><path d="M107 17 V59 M108 19 L144 51 H108Z" fill="#fff" /><path d="M45 87 Q58 78 71 87 T97 87 T123 87 T149 87 T175 87" fill="none" /></g> : null}
      {id === 'snow' ? <g stroke="#42859e" strokeWidth="3" fill="none"><path d="M76 32 Q60 18 79 13 Q96 0 109 16 Q132 8 138 27 Q160 43 139 47 H81 Q65 44 76 32Z" fill="#e2f4fc" />{[78, 110, 142].map((x) => <g key={x}><path d={`M${x} 60 V88 M${x - 12} 67 L${x + 12} 81 M${x - 12} 81 L${x + 12} 67`} /></g>)}</g> : null}
      {id === 'eye' ? <g stroke="#475569" strokeWidth="3"><path d="M54 50 Q110 -1 166 50 Q110 101 54 50Z" fill="#fff" /><circle cx="110" cy="50" r="23" fill="#9b764e" /><circle cx="110" cy="50" r="10" fill="#0f172a" /></g> : null}
    </svg><figcaption className="text-center text-sm font-bold">의미 확인용 삽화 · {meaning}</figcaption>
  </figure>
}

export default function ContextMeaningActivity({ assignments, onChoose }: { assignments: Record<string, string>; onChoose: (id: string, meaning: string) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {CONTEXT_SENTENCES.map((item, index) => {
        const selected = assignments[item.id]
        const correct = selected === item.answer
        const parts = item.sentence.split(item.target)
        return <fieldset key={item.id} className="min-w-0 rounded-2xl border border-slate-200 p-5">
          <legend className="px-2 font-black">문맥 {index + 1}</legend>
          <p className="rounded-xl bg-slate-950 p-4 text-lg font-black text-white">{parts[0]}<mark className="rounded bg-amber-300 px-1 text-slate-950">{item.target}</mark>{parts.slice(1).join(item.target)}</p>
          <p className="mt-3 text-sm leading-6">① “{item.target}” 주변에서 행동·상황을 나타내는 표현을 찾으세요. ② 뜻 버튼을 누르면 선택과 제출이 함께 됩니다. 정답 뒤에 뜻 그림과 근거가 나타납니다.</p>
          <div className="mt-4 grid gap-2">{item.choices.map((choice) => <button key={choice} type="button" aria-pressed={selected === choice} onClick={() => onChoose(item.id, choice)} className={`min-h-12 rounded-xl border p-3 text-left font-bold ${selected === choice ? 'border-violet-600 bg-violet-50' : 'border-slate-300 bg-white'}`}>{choice}<span className="mt-1 block text-xs font-normal">선택·제출</span></button>)}</div>
          {selected ? <p className={`mt-3 text-sm font-bold ${correct ? 'text-emerald-700' : 'text-rose-700'}`} role="status">{correct ? `✓ “${item.target}”은 ‘${item.answer}’ 뜻입니다.` : '✕ 선택한 뜻을 주변 표현과 다시 연결하세요.'} {item.cue}{!correct ? ' 바로 다른 뜻을 선택해 다시 판단할 수 있습니다.' : ''}</p> : null}
          {correct ? <MeaningPicture id={item.id} meaning={item.answer} /> : null}
        </fieldset>
      })}
    </div>
  )
}
