import { EMBEDDING_POINTS } from './lesson11Data'

export default function EmbeddingVisualizer({ onConfirm, confirmed }: { onConfirm: () => void; confirmed: boolean }) {
  return (
    <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
      <h3 className="font-black text-amber-950">임베딩 개념 시뮬레이션</h3>
      <p className="mt-2 text-sm leading-6 text-amber-900">단어 사이의 의미 관계를 이해하기 위한 단순화된 예시이며, 실제 학습된 모델의 좌표가 아닙니다.</p>
      <svg viewBox="0 0 100 100" className="mt-4 aspect-[4/3] w-full rounded-xl border border-amber-200 bg-white" role="img" aria-label="친구와 우정은 가깝고, 사람은 조금 떨어져 있으며, 냉장고는 멀리 있는 교육용 2차원 의미 공간">
        <line x1="10" y1="90" x2="94" y2="90" stroke="#94a3b8" strokeWidth="0.8" />
        <line x1="10" y1="90" x2="10" y2="8" stroke="#94a3b8" strokeWidth="0.8" />
        <line x1="31" y1="38" x2="39" y2="32" stroke="#7c3aed" strokeWidth="1.2" strokeDasharray="2 2" />
        {EMBEDDING_POINTS.map((point, index) => <g key={point.word}><circle cx={point.x} cy={point.y} r="3.5" fill={index < 2 ? '#7c3aed' : index === 2 ? '#0891b2' : '#f97316'} /><text x={point.x + 4.5} y={point.y + 1.5} fontSize="6" fontWeight="700" fill="#0f172a">{point.word}</text></g>)}
      </svg>
      <ul className="mt-3 grid gap-1 text-sm"><li>• 친구: ({EMBEDDING_POINTS[0].x}, {EMBEDDING_POINTS[0].y})</li><li>• 우정: ({EMBEDDING_POINTS[1].x}, {EMBEDDING_POINTS[1].y}) — 친구와 비교적 가까움</li><li>• 사람: ({EMBEDDING_POINTS[2].x}, {EMBEDDING_POINTS[2].y})</li><li>• 냉장고: ({EMBEDDING_POINTS[3].x}, {EMBEDDING_POINTS[3].y}) — 친구·우정에서 멂</li></ul>
      <button type="button" aria-pressed={confirmed} onClick={onConfirm} className={`mt-4 min-h-11 rounded-xl border px-4 text-sm font-bold ${confirmed ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-amber-600 bg-white'}`}>{confirmed ? '✓ 의미 공간 확인 완료' : '의미 공간의 위치 확인'}</button>
    </div>
  )
}

