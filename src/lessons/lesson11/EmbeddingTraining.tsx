import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { EMBEDDING_DEMO, EMBEDDING_WORDS, INITIAL_MODEL, LEARNING_RATE, OUTPUT_WORDS, TARGET_INDEX, type EmbeddingModel } from './embeddingTrainingMath'

const fmt = (value: number) => Number(value.toFixed(4)).toString()
const signed = (value: number) => value < 0 ? '− ' + fmt(Math.abs(value)) : '+ ' + fmt(value)
const stages = [
  { title: '행렬 준비', purpose: '단어를 계산에 사용하려면 숫자를 저장할 표가 필요합니다.' },
  { title: '세 벡터 가져오기', purpose: '입력 문장의 세 단어를 인덱스로 찾아 같은 표에서 가져옵니다.' },
  { title: '같은 칸끼리 평균', purpose: '세 벡터를 이 모형에 넣을 하나의 입력으로 모읍니다.' },
  { title: '점수와 확률', purpose: '평균 벡터에 가중치와 편향을 적용해 다음 단어 후보를 비교합니다.' },
  { title: '자료와 손실 비교', purpose: '이번 학습 자료에 나온 단어의 확률로 예측의 오차를 계산합니다.' },
  { title: '현재 값 수정', purpose: '기울기와 학습률을 이용해 손실을 줄이는 방향으로 값을 조정합니다.' },
  { title: '수정 후 재예측', purpose: '바뀐 숫자를 같은 입력과 계산에 다시 사용해 결과를 비교합니다.' },
]
const buttonClass = 'min-h-11 rounded-lg border px-3 py-2 text-left leading-6 focus-visible:outline-3 focus-visible:outline-indigo-700'
const boxClass = 'min-w-0 rounded-lg border border-slate-300 bg-white p-3'
const formulaClass = 'flex flex-wrap items-baseline gap-x-1 gap-y-1 leading-7 tabular-nums'
type Prediction = typeof EMBEDDING_DEMO.before
type Parameter = 'embedding' | 'weights' | 'bias'

function Matrix({ model, selected, onSelect, updated = false }: {
  model: EmbeddingModel
  selected: number
  onSelect: (index: number) => void
  updated?: boolean
}) {
  return <div className="min-w-0">
    <table className="w-full table-fixed border-collapse text-center leading-7">
      <caption className="mb-2 text-left font-bold">임베딩 행렬 · 3행 × 2열 · {updated ? '한 번 수정한 값' : '수정 전 초기값'}</caption>
      <thead><tr><th scope="col" className="w-[44%]">단어 · 인덱스</th><th scope="col">①번 칸</th><th scope="col">②번 칸</th></tr></thead>
      <tbody>{model.embedding.map((row, r) => <tr key={EMBEDDING_WORDS[r]} className={selected === r ? 'bg-indigo-100' : ''}>
        <th scope="row"><button type="button" aria-pressed={selected === r} onClick={() => onSelect(r)} className="min-h-12 w-full rounded border border-slate-300 px-1 py-2 focus-visible:outline-3 focus-visible:outline-indigo-700">
          {EMBEDDING_WORDS[r]} · {r}<span className="block text-sm font-normal">{r + 1}번째 행</span>
        </button></th>
        {row.map((value, c) => <td key={c} className="px-1 py-2 tabular-nums"><strong>{fmt(value)}</strong>{updated && <span className="block text-sm">수정됨</span>}</td>)}
      </tr>)}</tbody>
    </table>
  </div>
}

function Means({ model, result }: { model: EmbeddingModel; result: Prediction }) {
  return <div className="min-w-0">
    <ol className="grid gap-3" aria-label="같은 칸끼리 평균 계산">
      {result.input.map((mean, col) => <li key={col} className={boxClass}>
        <strong>{col === 0 ? '①' : '②'} 같은 칸의 세 수 → 평균</strong>
        <p className={formulaClass}>
          <span>(</span>{model.embedding.map((row, r) => <span key={EMBEDDING_WORDS[r]} className="whitespace-nowrap">{r === 0 ? fmt(row[col]) : signed(row[col])}</span>)}<span>) ÷ {model.embedding.length}</span>
          <span>≈ <strong>{fmt(mean)}</strong></span>
        </p>
      </li>)}
    </ol>
    <p className="mt-3 rounded-lg border-2 border-indigo-600 bg-indigo-50 p-3 leading-7" aria-label="평균 벡터 모델 입력">
      <strong>모델 입력 h = [{result.input.map(fmt).join(', ')}]</strong><br />①번·②번 칸 순서의 평균입니다. 후보 확률이 아닙니다.
    </p>
  </div>
}

function Probabilities({ result }: { result: Prediction }) {
  return <table className="w-full table-fixed text-center leading-7">
    <thead><tr><th scope="col">다음 후보</th><th scope="col">점수 z</th><th scope="col">확률 p</th></tr></thead>
    <tbody>{OUTPUT_WORDS.map((word, i) => <tr key={word} className={i === TARGET_INDEX ? 'bg-amber-50' : ''}>
      <th scope="row" className="py-2">{word}{i === TARGET_INDEX && <span className="block text-sm font-normal">자료의 단어</span>}</th>
      <td className="tabular-nums">{fmt(result.scores[i])}</td>
      <td className="tabular-nums">{(result.probabilities[i] * 100).toFixed(2)}%</td>
    </tr>)}</tbody>
  </table>
}

export default function EmbeddingTraining({ children }: { children: ReactNode }) {
  const [cursor, setCursor] = useState(0)
  const [selected, setSelected] = useState(1)
  const [column, setColumn] = useState(0)
  const [candidate, setCandidate] = useState(0)
  const [parameter, setParameter] = useState<Parameter>('embedding')
  const sceneTitleRef = useRef<HTMLHeadingElement>(null)
  const revealSceneRef = useRef(false)
  const { before, updated, after, gradients } = EMBEDDING_DEMO
  const g = gradients.bias
  const exponentials = before.scores.map((score) => Math.exp(score - Math.max(...before.scores)))
  const exponentialTotal = exponentials.reduce((sum, value) => sum + value, 0)
  const oldValue = parameter === 'embedding' ? INITIAL_MODEL.embedding[selected][column] : parameter === 'weights' ? INITIAL_MODEL.weights[column][candidate] : INITIAL_MODEL.bias[candidate]
  const gradient = parameter === 'embedding' ? gradients.embedding[selected][column] : parameter === 'weights' ? gradients.weights[column][candidate] : gradients.bias[candidate]
  const newValue = parameter === 'embedding' ? updated.embedding[selected][column] : parameter === 'weights' ? updated.weights[column][candidate] : updated.bias[candidate]
  const parameterName = parameter === 'embedding' ? EMBEDDING_WORDS[selected] + '의 ' + (column + 1) + '번 칸' : parameter === 'weights' ? (column + 1) + '번 입력 → ' + OUTPUT_WORDS[candidate] + '의 가중치' : OUTPUT_WORDS[candidate] + '의 편향'
  const move = (index: number) => setCursor(index)
  const restart = () => { setCursor(0); setSelected(1); setColumn(0); setCandidate(0); setParameter('embedding') }
  const moveFromBottom = (index: number) => { revealSceneRef.current = true; move(index) }
  const restartFromBottom = () => { revealSceneRef.current = true; restart() }

  useLayoutEffect(() => {
    if (!revealSceneRef.current) return
    revealSceneRef.current = false
    const title = sceneTitleRef.current
    if (!title) return
    const headerBottom = Math.max(0, document.querySelector('header')?.getBoundingClientRect().bottom ?? 0)
    const top = window.scrollY + title.getBoundingClientRect().top - headerBottom - 16
    title.focus({ preventScroll: true })
    // One post-render jump keeps the new scene visible without a second focus scroll.
    // No animation is needed, including when reduced motion is requested.
    window.scrollTo({ top: Math.max(0, top), behavior: 'instant' })
  }, [cursor])

  return <section className="grid min-w-0 gap-4 border-t-2 border-cyan-300 pt-4" aria-labelledby="embedding-learning-title">
    <h3 id="embedding-learning-title" className="text-xl font-black">② 단어의 숫자표를 어떻게 학습할까요?</h3>
    <p className="leading-7">신경망은 숫자로 계산합니다. <strong>임베딩 행렬은 단어별 벡터를 저장한 숫자표</strong>입니다. 이 표의 숫자를 학습해 단어의 쓰임과 관계를 예측에 활용합니다.</p>
    <p className="leading-7"><strong>학습 자료: “나는 친구와 함께 놀았다.”</strong><br />세 단어 ‘나는·친구와·함께’로 ‘걸었다·놀았다’ 두 후보를 비교하는 작은 교육용 모형입니다.</p>
    <ol className="flex flex-wrap gap-x-2 gap-y-1 leading-7" aria-label="임베딩 학습 전체 흐름">
      {stages.map((stage, index) => <li key={stage.title} className={index === cursor ? 'font-bold text-indigo-800 underline decoration-2 underline-offset-4' : 'text-slate-700'}>
        {index > 0 && <span aria-hidden="true">→ </span>}{index + 1}. {stage.title}
      </li>)}
    </ol>
    <p className="text-sm leading-6">초기 숫자는 고정한 가정이고 이후 값은 이 모형으로 실제 계산했습니다. 표시만 반올림합니다. 아래 조작은 이 한 번의 계산 기록을 살펴보며, 추가 학습·답안 제출·완료 처리를 하지 않습니다.</p>
    <div className="min-w-0 rounded-xl border border-indigo-300 bg-slate-50 p-3 sm:p-4">
      <div role="group" aria-label="임베딩 장면 상단 이동">
      <div className="grid min-w-0 gap-2 sm:grid-cols-[1fr_auto]">
        <label className="grid min-w-0 gap-1 font-bold">관찰할 처리
          <select value={cursor} onChange={(event) => move(Number(event.target.value))} aria-controls="embedding-current-scene" className="min-h-11 w-full min-w-0 rounded-lg border border-slate-400 bg-white p-2 font-normal">
            {stages.map((stage, index) => <option key={stage.title} value={index}>{index + 1}/7 · {stage.title}</option>)}
          </select>
        </label>
        <button type="button" onClick={restart} aria-controls="embedding-current-scene" className={buttonClass + ' self-end bg-white'}>초기 장면 다시 보기</button>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button type="button" disabled={cursor === 0} onClick={() => move(cursor - 1)} aria-controls="embedding-current-scene" className={buttonClass + ' bg-white disabled:opacity-40'}>← 이전 처리</button>
        <button type="button" disabled={cursor === stages.length - 1} onClick={() => move(cursor + 1)} aria-controls="embedding-current-scene" className={buttonClass + ' border-indigo-500 bg-indigo-50 disabled:opacity-40'}>{cursor < stages.length - 1 ? stages[cursor + 1].title + ' →' : '마지막 처리입니다'}</button>
      </div>
      </div>
      <div id="embedding-current-scene" className="mt-4 grid min-w-0 gap-3">
        <h4 ref={sceneTitleRef} tabIndex={-1} className="rounded text-lg font-black focus-visible:outline-3 focus-visible:outline-indigo-700" aria-live="polite">{cursor + 1}/7 · {stages[cursor].title}</h4>
        <p className="leading-7">{stages[cursor].purpose}</p>

        {cursor === 0 && <>
          <Matrix model={INITIAL_MODEL} selected={selected} onSelect={setSelected} />
          <p className="leading-7"><strong>벡터</strong>는 여러 숫자를 순서대로 묶은 표현, <strong>차원</strong>은 그 숫자 칸 수입니다. 단어 3개가 행 3개, 미리 정한 차원 2가 열 2개가 됩니다. 인덱스는 행을 찾는 구별 번호입니다.</p>
          <p className="leading-7">처음부터 학습하는 예로 작은 숫자를 준비했습니다. 사람이 뜻을 보고 좌표를 정한 것은 아닙니다. <strong>학습 중에는 행·열 수가 아니라 칸의 값이 바뀝니다.</strong></p>
          <p className="leading-7">소수·음수·0도 쓸 수 있습니다. <strong>0.2는 의미·중요도·확률 20%가 아닙니다.</strong> 각 칸에 사람이 정한 뜻이 하나씩 붙지도 않습니다.</p>
        </>}

        {cursor === 1 && <>
          <p className="leading-7">단어를 눌러 행을 찾아보세요. <strong>선택은 관찰할 행만 바꾸며, 예측에는 항상 세 행이 모두 쓰입니다.</strong></p>
          <Matrix model={INITIAL_MODEL} selected={selected} onSelect={setSelected} />
          <div className="rounded-lg border-2 border-indigo-600 bg-indigo-50 p-3 leading-7" aria-live="polite">
            <strong>지금 확대해서 관찰하는 단어: {EMBEDDING_WORDS[selected]}</strong>
            <p>인덱스 {selected} → {selected + 1}번째 행 → 벡터 [{INITIAL_MODEL.embedding[selected].map(fmt).join(', ')}]</p>
          </div>
          <p className="leading-7">글자 모양이나 뜻을 산술 계산한 값이 아니라, 해당 행의 숫자를 그대로 가져옵니다. 이렇게 가져온 <strong>세 벡터를 다음 장면에서 함께 모읍니다.</strong></p>
          <details className={boxClass}><summary className="cursor-pointer font-bold">보충 · 원-핫 × 행렬로 같은 행 가져오기</summary>
            <p className="mt-2 leading-7">[{EMBEDDING_WORDS.map((_, i) => Number(i === selected)).join(', ')}] × 이 행렬 = [{INITIAL_MODEL.embedding[selected].map(fmt).join(', ')}]. 1이 있는 행만 남습니다. 학습으로 원-핫의 0을 지우는 과정은 아닙니다.</p>
          </details>
        </>}

        {cursor === 2 && <>
          <div className="grid min-w-0 gap-3 md:grid-cols-2">
            <Matrix model={INITIAL_MODEL} selected={selected} onSelect={setSelected} />
            <Means model={INITIAL_MODEL} result={before} />
          </div>
          <p className="leading-7">각 식은 <strong>나는 → 친구와 → 함께</strong> 순서로 같은 열의 세 수를 더합니다. 평균 벡터 h를 다음 점수 계산의 입력으로 사용합니다.</p>
          <p className="leading-7">평균은 <strong>이 교육용 모형의 입력 결합 방식</strong>입니다. 순서를 바꿔도 평균은 같아 단어 순서를 처리하지 못합니다. 실제 모델에는 다른 결합 방식도 쓰입니다.</p>
        </>}

        {cursor === 3 && <>
          <p className="rounded-lg bg-indigo-50 p-3 leading-7"><strong>앞 장면에서 얻은 입력 h = [{before.input.map(fmt).join(', ')}]</strong><br />h의 두 칸 × 가중치 W + 편향 b → 후보 점수 z입니다. 가중치와 편향의 초기값도 설명용 가정입니다.</p>
          <ol className="grid min-w-0 gap-3 sm:grid-cols-2">
            {OUTPUT_WORDS.map((word, i) => <li key={word} className={boxClass}>
              <strong>{word}의 점수 z</strong>
              <p className="mt-1 leading-7">가중치 [{INITIAL_MODEL.weights.map((row) => fmt(row[i])).join(', ')}] · 편향 {fmt(INITIAL_MODEL.bias[i])}</p>
              <p className={formulaClass}>{before.input.map((value, c) => <span key={c} className="whitespace-nowrap">{c ? '+ ' : ''}({fmt(value)} × {fmt(INITIAL_MODEL.weights[c][i])})</span>)}<span>{signed(INITIAL_MODEL.bias[i])}</span></p>
              <p className="leading-7 tabular-nums">두 곱: {before.input.map((value, c) => fmt(value * INITIAL_MODEL.weights[c][i])).join(', ')} → 합과 편향 ≈ <strong>{fmt(before.scores[i])}</strong></p>
            </li>)}
          </ol>
          <p className="leading-7"><strong>소프트맥스 함수</strong>는 점수에 지수 함수 exp를 적용하고 그 합으로 나눠 확률로 바꿉니다. 점수 자체는 확률이 아닙니다.</p>
          <div className={boxClass}>
            <p className="leading-7">계산에서는 모든 점수에서 가장 큰 점수 m = {fmt(Math.max(...before.scores))}을 빼고 exp를 구합니다. 같은 값을 빼도 최종 확률은 같습니다.</p>
            <ol className="mt-2 grid gap-2">{OUTPUT_WORDS.map((word, i) => <li key={word} className="leading-7 tabular-nums">
              <strong>{word}</strong>: exp({fmt(before.scores[i])} − {fmt(Math.max(...before.scores))}) ≈ {fmt(exponentials[i])}<br />
              {fmt(exponentials[i])} ÷ {fmt(exponentialTotal)} ≈ {fmt(before.probabilities[i])} = {(before.probabilities[i] * 100).toFixed(2)}%
            </li>)}</ol>
          </div>
          <Probabilities result={before} />
          <p className="leading-7">분모는 두 exp 값의 합이고, 두 확률의 합은 1입니다. 이 확률은 <strong>다음 후보를 고를 가능성</strong>으로, 임베딩 숫자·사실일 확률·모델 정확도와는 다릅니다.</p>
        </>}

        {cursor === 4 && <>
          <Probabilities result={before} />
          <p className="leading-7">모형의 최고 확률 후보: <strong>{OUTPUT_WORDS[before.prediction]}</strong><br />학습 자료에 나온 다음 단어: <strong>{OUTPUT_WORDS[TARGET_INDEX]}</strong></p>
          <p className="leading-7">‘걸었다’도 자연스러운 표현입니다. 말의 옳고 그름이 아니라, <strong>이번 자료에 나온 ‘놀았다’</strong>와 비교합니다.</p>
          <div className="rounded-lg border border-amber-400 bg-amber-50 p-3 leading-7">
            <strong>‘놀았다’에 부여한 확률 → 손실값</strong>
            <p>범주형 교차 엔트로피 오차(CCEE)로 계산합니다.</p>
            <p className={formulaClass}><span>손실 = −ln({fmt(before.probabilities[TARGET_INDEX])})</span><span>≈ <strong>{fmt(before.loss)}</strong></span></p>
            <p>ln은 자연로그 함수이며 앱이 계산합니다. 자료의 단어에 부여한 확률이 작을수록 손실이 커집니다.</p>
          </div>
          <p className="leading-7">손실은 글자 차이를 센 값이나 정확도가 아니라 <strong>예측을 학습 자료와 비교한 오차</strong>입니다. 다음 장면에서는 이 손실이 각 숫자에 어떻게 영향을 받는지 이용해 값을 수정합니다.</p>
        </>}

        {cursor === 5 && <>
          <p className="leading-7"><strong>역전파</strong>로 각 값의 <strong>기울기</strong>를 구합니다. 기울기는 그 값을 바꿀 때 손실이 어느 방향으로 변하는지 나타냅니다. 학습률 {LEARNING_RATE}는 기울기를 얼마나 반영할지 정합니다.</p>
          <div className={boxClass}>
            <strong>후보 점수의 기울기 g = 확률 p − 자료의 표시 [0, 1]</strong>
            <p className="mt-1 leading-7">‘놀았다’에만 1을 놓습니다. 아래 모든 기울기는 수정 전 값으로 계산합니다.</p>
            {OUTPUT_WORDS.map((word, i) => <p key={word} className="leading-7 tabular-nums">{word}: {fmt(before.probabilities[i])} − {Number(i === TARGET_INDEX)} ≈ <strong>{fmt(g[i])}</strong></p>)}
          </div>
          <div className="grid min-w-0 gap-3 border-t border-slate-300 pt-3">
            <label className="grid gap-1 font-bold">확대해서 볼 수정 대상
              <select value={parameter} onChange={(event) => setParameter(event.target.value as Parameter)} className="min-h-11 w-full min-w-0 rounded-lg border border-slate-400 bg-white p-2 font-normal">
                <option value="embedding">임베딩 행렬의 한 칸</option><option value="weights">예측에 쓰는 가중치 W</option><option value="bias">예측에 쓰는 편향 b</option>
              </select>
            </label>
            <div className="flex flex-wrap gap-2">
              {parameter === 'embedding' && EMBEDDING_WORDS.map((word, i) => <button type="button" key={word} aria-pressed={selected === i} onClick={() => setSelected(i)} className={buttonClass + (selected === i ? ' border-indigo-700 bg-indigo-100 font-bold' : ' bg-white')}>{word} · 행 {i + 1}</button>)}
              {parameter !== 'embedding' && OUTPUT_WORDS.map((word, i) => <button type="button" key={word} aria-pressed={candidate === i} onClick={() => setCandidate(i)} className={buttonClass + (candidate === i ? ' border-indigo-700 bg-indigo-100 font-bold' : ' bg-white')}>{word}</button>)}
              {parameter !== 'bias' && [0, 1].map((c) => <button type="button" key={c} aria-pressed={column === c} onClick={() => setColumn(c)} className={buttonClass + (column === c ? ' border-indigo-700 bg-indigo-100 font-bold' : ' bg-white')}>{c + 1}번 칸</button>)}
            </div>
            <div className="rounded-lg border-2 border-indigo-600 bg-indigo-50 p-3 leading-7" aria-live="polite">
              <strong>지금 보는 값: {parameterName}</strong>
              {parameter === 'embedding' && <>
                <p>이 칸의 기울기 = (두 후보로 이어지는 가중치 × 각 g의 합) ÷ 입력 단어 3개</p>
                <p className={formulaClass}><span>({fmt(INITIAL_MODEL.weights[column][0])} × {fmt(g[0])}</span><span>+ {fmt(INITIAL_MODEL.weights[column][1])} × {fmt(g[1])})</span><span>÷ 3 ≈ <strong>{fmt(gradient)}</strong></span></p>
              </>}
              {parameter === 'weights' && <p>이 가중치의 기울기 = 입력 h × 후보의 g<br />{fmt(before.input[column])} × {fmt(g[candidate])} ≈ <strong>{fmt(gradient)}</strong></p>}
              {parameter === 'bias' && <p>이 편향의 기울기 = 후보의 g = <strong>{fmt(gradient)}</strong></p>}
              <p className="mt-2 font-bold">새 값 = 이전 값 − 학습률 × 기울기</p>
              <p className={formulaClass}><span>{fmt(oldValue)} − {LEARNING_RATE} × ({fmt(gradient)})</span><span>≈ <strong>{fmt(newValue)}</strong></span></p>
            </div>
          </div>
          <p className="leading-7"><strong>경사 하강법</strong>으로 이 규칙을 적용했습니다. 선택한 칸만이 아니라 세 임베딩 행과 예측용 가중치·편향이 함께 바뀌며, 행렬 크기는 3×2 그대로입니다. 다음 장면에서 바뀐 값으로 다시 계산합니다.</p>
        </>}

        {cursor === 6 && <>
          <p className="leading-7">같은 세 단어를 사용합니다. <strong>숫자표와 예측용 가중치·편향을 한 번 수정한 기록</strong>으로 다시 계산한 결과입니다.</p>
          <div className="grid min-w-0 gap-3 md:grid-cols-2">
            <div className="min-w-0">
              <Matrix model={updated} selected={selected} onSelect={setSelected} updated />
              <div className="mt-2 rounded-lg bg-indigo-50 p-3 leading-7" aria-live="polite">
                <strong>관찰하는 {EMBEDDING_WORDS[selected]} · 같은 칸 비교</strong>
                {INITIAL_MODEL.embedding[selected].map((value, c) => <p key={c}>{c + 1}번: {fmt(value)} → <strong>{fmt(updated.embedding[selected][c])}</strong></p>)}
              </div>
            </div>
            <Means model={updated} result={after} />
          </div>
          <p className="leading-7">모델 입력의 같은 두 칸: {before.input.map((value, c) => (c + 1) + '번 ' + fmt(value) + ' → ' + fmt(after.input[c])).join(' / ')}. 관찰 단어를 바꿔도 세 행의 평균과 아래 예측은 달라지지 않습니다.</p>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">{OUTPUT_WORDS.map((word, i) => <div key={word} className={boxClass}>
            <strong>{word} · 수정된 입력·가중치·편향으로 점수 계산</strong>
            <p className={formulaClass}>{after.input.map((value, c) => <span key={c} className="whitespace-nowrap">{c ? '+ ' : ''}({fmt(value)} × {fmt(updated.weights[c][i])})</span>)}<span>{signed(updated.bias[i])} ≈ {fmt(after.scores[i])}</span></p>
            <p className="mt-2 leading-7">점수: {fmt(before.scores[i])} → <strong>{fmt(after.scores[i])}</strong><br />소프트맥스 확률: {(before.probabilities[i] * 100).toFixed(2)}% → <strong>{(after.probabilities[i] * 100).toFixed(2)}%</strong></p>
          </div>)}</div>
          <div className="rounded-lg border border-amber-400 bg-amber-50 p-3 leading-7">
            <strong>같은 자료의 ‘놀았다’와 다시 비교</strong>
            <p>새 손실 = −ln({fmt(after.probabilities[TARGET_INDEX])}) ≈ {fmt(after.loss)}</p>
            <p>손실: {fmt(before.loss)} → <strong>{fmt(after.loss)}</strong><br />최고 확률 후보: {OUTPUT_WORDS[before.prediction]} → <strong>{OUTPUT_WORDS[after.prediction]}</strong></p>
          </div>
          <p className="leading-7">이 계산에서는 손실이 줄었지만 최고 확률 후보는 그대로입니다. <strong>손실 감소와 예측 성공률 상승은 같은 뜻이 아닙니다.</strong> 여러 자료로 반복하며 표현을 배우므로, 한 번의 수정으로 단어의 의미나 유사성을 모두 배웠다는 뜻도 아닙니다.</p>
          <p className="leading-7">이 예는 평균을 쓰는 작은 모형일 뿐 모든 학습 방식을 나타내지 않습니다. 학습된 모델을 사용할 때는 이미 배운 숫자표에서 벡터를 가져옵니다.</p>
        </>}
        {(cursor === 3 || cursor === 6) && <div role="group" aria-label="임베딩 장면 하단 이동" className="grid min-w-0 gap-2 border-t border-indigo-200 pt-3 sm:grid-cols-2">
          <button type="button" onClick={() => moveFromBottom(cursor - 1)} aria-controls="embedding-current-scene" className={buttonClass + ' bg-white'}>← 이전 처리</button>
          {cursor === 3
            ? <button type="button" onClick={() => moveFromBottom(cursor + 1)} aria-controls="embedding-current-scene" className={buttonClass + ' border-indigo-500 bg-indigo-50'}>자료와 손실 비교 →</button>
            : <button type="button" onClick={restartFromBottom} aria-controls="embedding-current-scene" className={buttonClass + ' border-indigo-500 bg-indigo-50'}>초기 장면 다시 보기</button>}
        </div>}
      </div>
    </div>
    {children}
  </section>
}
