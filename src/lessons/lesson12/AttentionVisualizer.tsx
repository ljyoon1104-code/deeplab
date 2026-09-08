interface AttentionExample {
  sentence: string
  prompt: string
  words: readonly string[]
  important: readonly string[]
}

export default function AttentionVisualizer({ example, selected, onToggle }: { example: AttentionExample; selected: readonly string[]; onToggle: (word: string) => void }) {
  const correctPair = selected.length === 2 && example.important.every((word) => selected.includes(word))
  const width = Math.max(360, example.words.length * 95)
  const first = example.words.indexOf(example.important[0])
  const second = example.words.indexOf(example.important[1])
  const start = 48 + first * 90
  const end = 48 + second * 90
  return <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
    <h3 className="font-black text-amber-950">Attention 관계 선택</h3>
    <p className="mt-2 text-sm leading-6 text-amber-900">{example.sentence}</p>
    <p className="mt-2 font-bold">{example.prompt}</p>
    <p className="mt-2 text-xs leading-5 text-amber-900">실제 Attention 점수가 아닌, 중요한 관계를 설명하는 교육용 고정 예시입니다.</p>
    <svg viewBox={`0 0 ${width} 170`} className="mt-4 w-full rounded-xl border border-amber-200 bg-white" role="img" aria-label={`${example.important.join('·')} 사이의 중요 관계를 표시하는 교육용 그림`}>
      <path d={`M${start} 92 Q${(start + end) / 2} 15 ${end} 92`} fill="none" stroke={correctPair ? '#f97316' : '#cbd5e1'} strokeWidth={correctPair ? 8 : 2} />
      {example.words.map((word, index) => <g key={word}><circle cx={48 + index * 90} cy="100" r="25" fill={selected.includes(word) ? '#2563eb' : '#f8fafc'} stroke={selected.includes(word) ? '#1d4ed8' : '#94a3b8'} strokeWidth="2" /><text x={48 + index * 90} y="105" textAnchor="middle" fontSize="13" fontWeight="700" fill={selected.includes(word) ? 'white' : '#0f172a'}>{word}</text></g>)}
      <text x={width / 2} y="28" textAnchor="middle" fontSize="14" fontWeight="800" fill="#c2410c">{correctPair ? `중요 관계: ${example.important.join(' ↔ ')}` : '중심 단어 두 개를 선택하세요'}</text>
    </svg>
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5" role="group" aria-label="Attention 중심 단어 선택">{example.words.map((word) => <button key={word} type="button" aria-pressed={selected.includes(word)} onClick={() => onToggle(word)} className={`min-h-11 rounded-xl border font-bold ${selected.includes(word) ? 'border-blue-700 bg-blue-50 text-blue-900' : 'border-slate-300 bg-white'}`}>{selected.includes(word) ? '✓ ' : ''}{word}</button>)}</div>
    <p className="mt-4 text-sm font-bold" aria-live="polite">{correctPair ? `✓ 중요 관계를 선택했습니다: ${example.important.join(' ↔ ')}` : `선택한 단어 ${selected.length} / 2개 · 가까운 단어라도 항상 중요한 것은 아닙니다.`}</p>
  </div>
}
