import { useState } from 'react'
import { EMBEDDING_POINTS } from './lesson11Data'
import OneHotVisualizer from './OneHotVisualizer'

export default function EmbeddingVisualizer({ onConfirm, confirmed }: { onConfirm: () => void; confirmed: boolean }) {
  const [selectedWord, setSelectedWord] = useState<string>(EMBEDDING_POINTS[0].word)
  const selected = EMBEDDING_POINTS.find((point) => point.word === selectedWord)!
  return (
    <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-3 sm:p-5">
      <h3 className="font-black text-amber-950">임베딩 개념 시뮬레이션</h3>
      <p className="mt-2 text-sm leading-6">앞의 여섯 단어와 다른 비교 예제입니다. 목록 순서: {EMBEDDING_POINTS.map((point) => point.word).join(' → ')}.</p>
      <div className="mt-4 grid items-start gap-4 lg:grid-cols-2"><section className="min-w-0 rounded-xl bg-white p-3"><h4 className="font-black">표현 A · 목록에서 구별하는 원-핫</h4><div className="mt-3"><OneHotVisualizer vocabulary={EMBEDDING_POINTS.map((point) => point.word)} selectedWord={selectedWord} /></div></section><section className="min-w-0 rounded-xl bg-white p-3"><h4 className="font-black">표현 B · 임베딩 위치</h4><p className="mt-2 font-mono font-bold" aria-live="polite">{selected.word}: [{selected.x}, {selected.y}]</p><p className="mt-2 text-sm leading-6">두 숫자는 실제 학습 결과가 아닌 교육용 2차원 좌표입니다. 확률·중요도가 아니며, 축에 특정 의미를 붙이지 않았습니다.</p>
      <svg viewBox="0 0 100 100" className="mx-auto mt-4 aspect-square w-full max-w-sm rounded-xl border border-amber-200 bg-white" role="img" aria-label="친구와 우정은 가깝고, 사람은 조금 떨어져 있으며, 냉장고는 멀리 있는 교육용 2차원 의미 공간">
        <line x1="10" y1="90" x2="94" y2="90" stroke="#94a3b8" strokeWidth="0.8" />
        <line x1="10" y1="90" x2="10" y2="8" stroke="#94a3b8" strokeWidth="0.8" />
        <line x1={EMBEDDING_POINTS[0].x} y1={EMBEDDING_POINTS[0].y} x2={EMBEDDING_POINTS[1].x} y2={EMBEDDING_POINTS[1].y} stroke="#7c3aed" strokeWidth="1.2" strokeDasharray="2 2" />
        {EMBEDDING_POINTS.map((point, index) => <g key={point.word}>
          {selected.word === point.word && <circle cx={point.x} cy={point.y} r="6" fill="none" stroke="#0f172a" strokeWidth="1" />}
          <circle cx={point.x} cy={point.y} r="3.5" fill={index < 2 ? '#7c3aed' : index === 2 ? '#0891b2' : '#f97316'} />
          <text x={index === 0 ? point.x : point.x > 70 ? point.x - 8 : point.x + 8} y={index === 0 ? point.y + 13 : point.y + 1.5} textAnchor={index === 0 ? 'middle' : point.x > 70 ? 'end' : 'start'} fontSize="6" fontWeight="700" fill="#0f172a">{point.word}</text>
        </g>)}
      </svg>
      </section></div>
      <div className="mt-3 grid grid-cols-2 gap-2" role="group" aria-label="교육용 좌표의 단어 선택">
        {EMBEDDING_POINTS.map((point) => <button key={point.word} type="button" aria-pressed={selectedWord === point.word} onClick={() => setSelectedWord(point.word)} className={`min-h-11 min-w-0 rounded-xl border-2 p-2 text-sm font-bold focus-visible:outline-3 focus-visible:outline-violet-600 ${selectedWord === point.word ? 'border-violet-600 bg-violet-50' : 'border-amber-200 bg-white'}`}>
          {selectedWord === point.word ? '✓ ' : ''}{point.word}<span className="block font-mono">({point.x}, {point.y})</span>
        </button>)}
      </div>
      <details className="mt-2 text-sm leading-6"><summary className="min-h-11 cursor-pointer py-2 font-bold">보충 · 의미 관계의 한계</summary><p>실제 관계는 학습 자료에 따라 달라질 수 있으며, 한 단어의 여러 뜻을 이 점 하나로 모두 설명하지는 못합니다.</p></details>
      <button type="button" aria-pressed={confirmed} onClick={onConfirm} className={`mt-4 min-h-11 rounded-xl border px-4 text-sm font-bold ${confirmed ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-amber-600 bg-white'}`}>{confirmed ? '✓ 의미 공간 확인 완료' : '의미 공간의 위치 확인'}</button>
    </div>
  )
}

