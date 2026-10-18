import { useState, type ReactNode } from 'react'
import { EMBEDDING_POINTS } from './lesson11Data'
import OneHotVisualizer from './OneHotVisualizer'

export default function EmbeddingVisualizer({ onConfirm, confirmed, comparisonQuestion, learning, relationQuestion, activeScene, onSceneChange }: { onConfirm?: () => void; confirmed?: boolean; comparisonQuestion?: ReactNode; learning?: ReactNode; relationQuestion?: ReactNode; activeScene?: number; onSceneChange?: (index: number) => void }) {
  const [selectedWord, setSelectedWord] = useState<string>(EMBEDDING_POINTS[0].word)
  const selected = EMBEDDING_POINTS.find((point) => point.word === selectedWord)!
  return (
    <div className="grid min-w-0 gap-6">
    {onSceneChange && <nav aria-label="임베딩 학습 주제" className="grid gap-2 sm:grid-cols-3">{['① 표현 비교', '② 행렬로 학습', '③ 단어 간 관계'].map((label, i) => <button type="button" key={label} onClick={() => onSceneChange(i)} aria-current={activeScene === i ? 'step' : undefined} className={`min-h-12 rounded-xl border-2 p-3 font-bold focus-visible:outline-3 focus-visible:outline-indigo-700 ${activeScene === i ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300 bg-white'}`}>{label}</button>)}</nav>}
    <div hidden={activeScene !== undefined && activeScene !== 0}>
    <section className="grid min-w-0 gap-4 rounded-2xl border border-amber-300 bg-amber-50 p-3 sm:p-5" aria-labelledby="embedding-dense-title">
      <h3 id="embedding-dense-title" className="text-xl font-black text-amber-950">① 왜 ‘밀집 표현’이라고 부를까요?</h3>
      <p className="leading-7"><strong>벡터</strong>는 숫자를 순서대로 묶은 표현이고, <strong>차원</strong>은 그 숫자 칸의 수입니다. 원-핫은 단어를 구별하지만, 목록이 커질수록 길어지고 의미의 비슷함을 직접 담기 어렵습니다.</p>
      <p className="mt-3 font-bold" aria-live="polite">{selectedWord} · 인덱스 {EMBEDDING_POINTS.findIndex((point) => point.word === selectedWord)} (구별 번호)</p>
      <p className="mt-2 text-sm leading-6">앞의 여섯 단어와 다른 비교 예제입니다. 목록 순서: {EMBEDDING_POINTS.map((point) => point.word).join(' → ')}.</p>
      <div className="grid items-start gap-4 sm:grid-cols-2"><section className="min-w-0 rounded-xl bg-white p-3"><h4 className="font-black">원-핫 · 희소 표현</h4><p className="mt-2 leading-7">목록 크기만큼 칸이 있고 대부분 0입니다.</p><div className="mt-3"><OneHotVisualizer compact vocabulary={EMBEDDING_POINTS.map((point) => point.word)} selectedWord={selectedWord} /></div></section><section className="min-w-0 rounded-xl bg-white p-3"><h4 className="font-black">임베딩 · 밀집 표현</h4><p className="mt-2 leading-7">상대적으로 짧은 벡터의 여러 숫자에 정보를 나누어 담습니다. 대부분의 칸을 실숫값으로 활용합니다.</p><div className="mt-3 grid grid-cols-2 gap-2" aria-live="polite">{[selected.x, selected.y].map((value, index) => <div key={index} className="rounded-lg border border-amber-400 p-3 text-center"><span className="block text-sm">{index + 1}번 칸</span><strong className="text-xl">{value}</strong></div>)}</div><p className="mt-2 text-sm leading-6">{selected.word}의 길이 2인 교육용 벡터입니다. 실숫값에는 정수·소수·음수·0도 포함됩니다.</p></section></div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="비교할 단어 선택">{EMBEDDING_POINTS.map((point) => <button key={point.word} type="button" aria-pressed={selectedWord === point.word} onClick={() => setSelectedWord(point.word)} className={`min-h-12 rounded-xl border-2 p-2 font-bold focus-visible:outline-3 focus-visible:outline-violet-600 ${selectedWord === point.word ? 'border-violet-600 bg-violet-50' : 'border-amber-200 bg-white'}`}>{selectedWord === point.word ? '✓ ' : ''}{point.word}</button>)}</div>
      <p className="leading-7"><strong>밀집은 숫자를 담는 방식이지, 단어가 한곳에 몰린다는 뜻이 아닙니다.</strong> 임베딩 길이는 모델 구성 때 정합니다. 원-핫의 0을 지우거나 학습 중 길이를 자동으로 줄이는 과정이 아니며, 두 표현을 반드시 차례로 거치지도 않습니다.</p>
      {comparisonQuestion}
    </section>
    </div>
    <div hidden={activeScene !== undefined && activeScene !== 1}>{learning}</div>
    <div hidden={activeScene !== undefined && activeScene !== 2}>
    <section className="grid min-w-0 gap-4 rounded-2xl border border-violet-300 bg-violet-50 p-3 sm:p-5" aria-labelledby="embedding-relations-title">
      <h3 id="embedding-relations-title" className="text-xl font-black">③ 왜 어떤 단어의 벡터는 비슷해질까요?</h3>
      <figure className="rounded-xl border bg-white p-4"><figcaption className="font-bold">쓰임 비교 예문 · 친구와 동료</figcaption><p className="mt-3 leading-8">나는 <strong>친구</strong>와 <u>함께 일을 도왔어요.</u><br />나는 <strong>동료</strong>와 <u>함께 일을 도왔어요.</u></p><p className="mt-2 leading-7">밑줄 친 주변 표현이 비슷합니다. 이런 쓰임이 많은 문장에서 나타나면, 예측에 도움이 되는 비슷한 표현을 배울 수 있습니다. 두 문장만으로 가까움을 보장하지는 않습니다.</p></figure>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="관계를 관찰할 단어">{EMBEDDING_POINTS.map((point) => <button key={point.word} type="button" onClick={() => setSelectedWord(point.word)} aria-pressed={selectedWord === point.word} className={`min-h-12 rounded-lg border-2 p-2 font-bold ${selectedWord === point.word ? 'border-violet-600 bg-white' : 'border-slate-300'}`}>{point.word}</button>)}</div>
      <div className="grid items-center gap-4 sm:grid-cols-2"><div><h4 className="font-bold">관계 그림 · 앞의 네 단어 비교</h4><p className="mt-2 leading-7"><strong>{selected.word}: [{selected.x}, {selected.y}]</strong><br />선택한 단어를 둘레 원으로 표시합니다. 두 숫자는 확률이나 중요도가 아니며, 좌표축에 ‘친절함’ 같은 의미를 붙이지 않았습니다.</p><p className="mt-2 leading-7">이 네 단어의 좌표는 별도의 고정 교육용 예시입니다. 앞서 본 3×2 행렬의 학습 결과나 실제 임베딩 전체를 보여주는 것은 아닙니다.</p></div>
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
      </div>
      <p className="leading-7"><strong>밀집은 표현 방식, 가까움은 학습된 관계입니다.</strong> 모델이 뜻을 먼저 알고 점을 놓거나 모든 단어를 모으는 것은 아닙니다. 자료와 학습 목적에 따라 관계가 달라지므로, 뜻이 비슷해도 언제나 가까운 것은 아닙니다.</p>
      {relationQuestion}
      {onConfirm && <button type="button" aria-pressed={confirmed} onClick={onConfirm} className={`mt-4 min-h-11 rounded-xl border px-4 text-sm font-bold ${confirmed ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-amber-600 bg-white'}`}>{confirmed ? '✓ 의미 공간 확인 완료' : '의미 공간의 위치 확인'}</button>}
    </section>
    </div>
    {onSceneChange && activeScene !== undefined && <div className="flex flex-wrap gap-2" aria-label="임베딩 주제 이동"><button type="button" disabled={activeScene === 0} onClick={() => onSceneChange(activeScene - 1)} className="min-h-12 rounded-xl border px-4 py-2 disabled:opacity-40">이전 주제</button><button type="button" disabled={activeScene === 2} onClick={() => onSceneChange(activeScene + 1)} className="min-h-12 rounded-xl border border-indigo-500 px-4 py-2 disabled:opacity-40">{activeScene === 0 ? '행렬로 학습 살펴보기' : '단어 간 관계 살펴보기'}</button><p className="self-center text-sm">주제 이동은 답안·완료를 바꾸지 않습니다.</p></div>}
    </div>
  )
}

