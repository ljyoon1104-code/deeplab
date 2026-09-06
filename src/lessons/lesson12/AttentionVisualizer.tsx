const words = ['민수', '비', '많이', '우산', '챙겼다'] as const

export default function AttentionVisualizer({ selected, onToggle }: { selected: readonly string[]; onToggle: (word: string) => void }) {
  const correctPair = selected.length === 2 && selected.includes('비') && selected.includes('우산')
  return <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
    <h3 className="font-black text-amber-950">Attention 개념 시뮬레이션</h3>
    <p className="mt-2 text-sm leading-6 text-amber-900">실제 Attention 점수를 계산한 결과가 아니라 중요한 단어 관계를 설명하는 교육용 고정 예시입니다.</p>
    <svg viewBox="0 0 500 170" className="mt-4 w-full rounded-xl border border-amber-200 bg-white" role="img" aria-label="민수, 비, 많이, 우산, 챙겼다를 문장 순서로 표시하고 비와 우산 사이를 중요한 관계로 연결한 그림">
      <path d="M150 92 Q250 15 350 92" fill="none" stroke={correctPair ? '#f97316' : '#cbd5e1'} strokeWidth={correctPair ? 8 : 2} />
      <path d="M50 100 Q250 150 450 100" fill="none" stroke="#e2e8f0" strokeWidth="2" />
      {words.map((word, index) => <g key={word}><circle cx={50 + index * 100} cy="100" r="27" fill={selected.includes(word) ? '#2563eb' : '#f8fafc'} stroke={selected.includes(word) ? '#1d4ed8' : '#94a3b8'} strokeWidth="2" /><text x={50 + index * 100} y="105" textAnchor="middle" fontSize="15" fontWeight="700" fill={selected.includes(word) ? 'white' : '#0f172a'}>{word}</text></g>)}
      <text x="250" y="28" textAnchor="middle" fontSize="14" fontWeight="800" fill="#c2410c">{correctPair ? '중요 관계: 비 ↔ 우산' : '중심 단어 두 개를 선택하세요'}</text>
    </svg>
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5" role="group" aria-label="Attention 중심 단어 선택">{words.map((word) => <button key={word} type="button" aria-pressed={selected.includes(word)} onClick={() => onToggle(word)} className={`min-h-11 rounded-xl border font-bold ${selected.includes(word) ? 'border-blue-700 bg-blue-50 text-blue-900' : 'border-slate-300 bg-white'}`}>{selected.includes(word) ? '✓ ' : ''}{word}</button>)}</div>
    <p className="mt-4 text-sm font-bold" aria-live="polite">{correctPair ? '✓ 중요 관계: “비가 많이 와서” 우산을 챙겼다는 문맥을 연결했습니다.' : `선택한 단어 ${selected.length} / 2개`}</p>
  </div>
}

