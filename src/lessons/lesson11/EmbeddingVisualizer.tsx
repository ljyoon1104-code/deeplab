import { useState } from 'react'
import { EMBEDDING_POINTS } from './lesson11Data'

export default function EmbeddingVisualizer({ onConfirm, confirmed }: { onConfirm: () => void; confirmed: boolean }) {
  const [selectedWord, setSelectedWord] = useState<string>(EMBEDDING_POINTS[0].word)
  const selected = EMBEDDING_POINTS.find((point) => point.word === selectedWord)!
  return (
    <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
      <h3 className="font-black text-amber-950">임베딩 개념 시뮬레이션</h3>
      <p className="mt-2 text-sm leading-6 text-amber-900">단어 사이의 의미 관계를 이해하기 위한 단순화된 예시이며, 실제 학습된 모델의 좌표가 아닙니다.</p>
      <svg viewBox="0 0 100 100" className="mt-4 aspect-[4/3] w-full rounded-xl border border-amber-200 bg-white" role="img" aria-label="친구와 우정은 가깝고, 사람은 조금 떨어져 있으며, 냉장고는 멀리 있는 교육용 2차원 의미 공간">
        <line x1="10" y1="90" x2="94" y2="90" stroke="#94a3b8" strokeWidth="0.8" />
        <line x1="10" y1="90" x2="10" y2="8" stroke="#94a3b8" strokeWidth="0.8" />
        <line x1={EMBEDDING_POINTS[0].x} y1={EMBEDDING_POINTS[0].y} x2={EMBEDDING_POINTS[1].x} y2={EMBEDDING_POINTS[1].y} stroke="#7c3aed" strokeWidth="1.2" strokeDasharray="2 2" />
        {EMBEDDING_POINTS.map((point, index) => <g key={point.word}>
          {selected.word === point.word && <circle cx={point.x} cy={point.y} r="6" fill="none" stroke="#0f172a" strokeWidth="1" />}
          <circle cx={point.x} cy={point.y} r="3.5" fill={index < 2 ? '#7c3aed' : index === 2 ? '#0891b2' : '#f97316'} />
          <text x={index === 0 ? point.x : point.x > 70 ? point.x - 8 : point.x + 8} y={index === 0 ? point.y + 13 : point.y + 1.5} textAnchor={index === 0 ? 'middle' : point.x > 70 ? 'end' : 'start'} fontSize="6" fontWeight="700" fill="#0f172a">{point.word}</text>
        </g>)}
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-2" role="group" aria-label="교육용 좌표의 단어 선택">
        {EMBEDDING_POINTS.map((point) => <button key={point.word} type="button" aria-pressed={selectedWord === point.word} onClick={() => setSelectedWord(point.word)} className={`min-h-11 min-w-0 rounded-xl border-2 p-2 text-sm font-bold focus-visible:outline-3 focus-visible:outline-violet-600 ${selectedWord === point.word ? 'border-violet-600 bg-violet-50' : 'border-amber-200 bg-white'}`}>
          {selectedWord === point.word ? '✓ ' : ''}{point.word}<span className="block font-mono">({point.x}, {point.y})</span>
        </button>)}
      </div>
      <p className="mt-3 text-sm leading-6" aria-live="polite">선택한 점: {selected.word}, 좌표 [{selected.x}, {selected.y}] · 두 숫자로 나타낸 교육용 2차원 표현입니다. 친구·우정은 가깝고 냉장고는 멀게 배치했습니다.</p>
      <button type="button" aria-pressed={confirmed} onClick={onConfirm} className={`mt-4 min-h-11 rounded-xl border px-4 text-sm font-bold ${confirmed ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-amber-600 bg-white'}`}>{confirmed ? '✓ 의미 공간 확인 완료' : '의미 공간의 위치 확인'}</button>
    </div>
  )
}

