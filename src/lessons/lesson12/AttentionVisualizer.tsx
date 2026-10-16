import { ATTENTION_GUIDANCE } from './lesson12Data'

interface AttentionExample {
  id: string
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
  const sentenceParts = example.sentence.split(new RegExp(`(${example.words.join('|')})`, 'g'))
  return <div className="min-w-0 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
    <h3 className="font-black text-amber-950">Attention 관계 선택</h3>
    <p className="mt-2 rounded-xl bg-white p-3 text-sm leading-8 text-amber-900">{sentenceParts.map((part, index) => selected.includes(part) ? <mark key={index} className="inline-block whitespace-nowrap rounded border-2 border-blue-600 bg-blue-50 px-1 font-bold text-blue-950">{part}</mark> : <span key={index}>{part}</span>)}</p>
    <p className="mt-2 font-bold">{example.prompt}</p>
    <p className="mt-2 rounded-xl bg-white p-3 text-sm leading-6">{ATTENTION_GUIDANCE[example.id].guide}</p>
    <div className="mt-4 overflow-x-auto rounded-xl border border-amber-200 bg-white focus-visible:outline-3 focus-visible:outline-amber-600" tabIndex={0} role="region" aria-label="Attention 관계 그림 · 좁은 화면에서는 좌우로 스크롤">
    <svg viewBox={`0 0 ${width} 170`} style={{ minWidth: width }} className="w-full" role="img" aria-label={correctPair ? `${example.important.join('·')} 사이의 중요 관계를 표시하는 교육용 그림` : '문장의 단어들 · 두 단어의 관계를 선택한 뒤 확인하세요'}>
      {correctPair ? <path d={`M${start} 92 Q${(start + end) / 2} 15 ${end} 92`} fill="none" stroke="#f97316" strokeWidth={8} /> : null}
      {example.words.map((word, index) => <g key={word}><circle cx={48 + index * 90} cy="100" r="25" fill={selected.includes(word) ? '#2563eb' : '#f8fafc'} stroke={selected.includes(word) ? '#1d4ed8' : '#94a3b8'} strokeWidth="2" /><text x={48 + index * 90} y="105" textAnchor="middle" fontSize="13" fontWeight="700" fill={selected.includes(word) ? 'white' : '#0f172a'}>{word}</text></g>)}
      <text x={width / 2} y="28" textAnchor="middle" fontSize="14" fontWeight="800" fill="#c2410c">{correctPair ? `중요 관계: ${example.important.join(' ↔ ')}` : `관계 선택 ${selected.length}/2`}</text>
    </svg>
    </div>
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5" role="group" aria-label="Attention 중심 단어 선택">{example.words.map((word) => <button key={word} type="button" aria-pressed={selected.includes(word)} onClick={() => onToggle(word)} className={`min-h-11 rounded-xl border font-bold ${selected.includes(word) ? 'border-blue-700 bg-blue-50 text-blue-900' : 'border-slate-300 bg-white'}`}>{selected.includes(word) ? '✓ ' : ''}{word}</button>)}</div>
    <div className="mt-4 text-sm leading-6" aria-live="polite"><p className="font-bold">선택한 단어: {selected.length ? selected.join(' ↔ ') : '아직 없음'} ({selected.length}/2)</p><p className="mt-2">{correctPair ? `✓ ${ATTENTION_GUIDANCE[example.id].reason}` : selected.length === 2 ? '✕ 이 두 단어로 위 질문에 답할 수 있을까요? 선택을 바꾸어 원인·행동 또는 사람이 누구인지 연결해 보세요.' : '가까운 위치만으로 중요한 관계가 정해지지는 않습니다.'}</p></div>
  </div>
}
