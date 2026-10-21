import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { relu, sigmoid, softmax, stepActivation } from '../lesson03/activationMath'
import { ConceptView } from './ConceptViews'
import { NetworkSymbols } from './NetworkSymbols'
import { OutputFormula } from './NetworkLab'
import { MathExpression } from './MathExpression'
import { Box, CalculationTable, NetworkPicture, Question, correct, type Answers, type Response } from './TeachingUI'
import { examples, fmt, sum } from './network'
import type { Page } from './curriculum'

interface Props {
  page: Page
  answers: Answers
  change: (id: string, response: Response) => void
}

function Questions({ page, answers, change }: Props) {
  return <>{page.tasks.map(task => <Question key={task.id} task={task} response={answers[task.id]} onChange={response => change(task.id, response)} />)}</>
}

function ReluLocation() {
  return <Box title="은닉층의 계산값을 다음 층으로 보내기">
    <p>은닉층에서 곱하고 더한 가중합을 a, ReLU를 지난 출력을 h라고 부릅니다. h는 다음 층의 입력이지 정답이나 확률이 아닙니다.</p>
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-indigo-200 bg-white p-3 font-semibold">
      <span>가중합 a</span><span aria-hidden="true">→</span><span>ReLU</span><span aria-hidden="true">→</span><span>은닉 출력 h</span>
    </div>
    <p>ReLU는 은닉층에서 사용하는 대표 함수입니다. 양수이면 가중합 그대로, 0 이하이면 0을 보내는 규칙을 슬라이더와 그래프에서 확인하세요. 이런 비선형 계산은 복잡한 관계를 표현하는 데 도움이 됩니다.</p>
  </Box>
}

function SoftmaxObservation() {
  const [scores, setScores] = useState([2, 1, 0])
  const [reference, setReference] = useState([2, 1, 0])
  const names = ['고양이', '강아지', '새']
  const probabilities = softmax(scores)
  const previous = softmax(reference)
  return <>
    <Box title="먼저 관찰 · 점수 하나를 바꾸면 다른 확률은 어떻게 될까요?">
      <p>소프트맥스는 다중 분류의 출력층에서 각 종류의 점수를 합이 1인 확률로 바꾸는 대표 함수입니다. 한 점수만 높인 뒤 다른 두 확률도 비교하세요.</p>
      <div className="grid gap-4 sm:grid-cols-3">
        {names.map((name, index) => <label key={name} className="grid gap-2 font-semibold">
          {name} 점수 z{index + 1}: {fmt(scores[index])}
          <input aria-label={`${name} 점수 조절`} className="min-h-11 w-full accent-indigo-600" type="range" min="-2" max="5" step="0.5" value={scores[index]} onChange={event => setScores(current => current.map((value, i) => i === index ? Number(event.target.value) : value))} />
        </label>)}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setReference([...scores])}>현재 설정을 비교 기준으로</Button>
        <Button variant="secondary" onClick={() => setScores([3, 3, 1])}>두 최고 점수를 같게</Button>
        <Button variant="secondary" onClick={() => { setScores([2, 1, 0]); setReference([2, 1, 0]) }}>처음 설정 다시 보기</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3" aria-live="polite">
        {names.map((name, index) => <div key={name} className="rounded-lg border bg-white p-3">
          <h4 className="font-bold">{name}</h4>
          <p>비교 기준 점수 {fmt(reference[index])}<br />확률 {fmt(previous[index])} ({(previous[index] * 100).toFixed(2)}%)</p>
          <div aria-hidden="true" className="my-2 h-4 rounded bg-slate-100"><div className="h-full rounded bg-slate-500" style={{ width: `${previous[index] * 100}%` }} /></div>
          <p className="font-semibold">현재 점수 {fmt(scores[index])}<br />확률 {fmt(probabilities[index])} ({(probabilities[index] * 100).toFixed(2)}%)</p>
          <div aria-hidden="true" className="my-2 h-4 rounded bg-indigo-100"><div className="h-full rounded bg-indigo-600" style={{ width: `${probabilities[index] * 100}%` }} /></div>
        </div>)}
      </div>
      <p>현재 확률의 합은 {fmt(sum(probabilities))}입니다. 높은 확률은 이 입력에 대한 예측이지, 여러 자료를 맞힌 비율인 정확도가 아닙니다.</p>
    </Box>
    <Box title="관찰한 변화를 식으로 연결하기">
      <OutputFormula kind="multi" />
      <p>이번에는 C=3으로, 각 점수를 e의 거듭제곱으로 바꾼 뒤 세 값의 합으로 나눕니다. 한 점수가 바뀌면 모든 클래스가 함께 쓰는 분모도 바뀝니다.</p>
      <CalculationTable rows={names.map((name, index) => ({
        name,
        formula: <MathExpression formula={String.raw`p_k=\frac{e^{z_k}}{\sum_{r=1}^{C}e^{z_r}}`} />,
        substitute: <MathExpression formula={`p_${index+1}=\\frac{e^{${fmt(scores[index])}}}{${scores.map(score=>`e^{${fmt(score)}}`).join('+')}}\\approx\\frac{${fmt(Math.exp(scores[index]))}}{${fmt(sum(scores.map(Math.exp)))}}`} />,
        result: `${fmt(probabilities[index])} (${(probabilities[index] * 100).toFixed(2)}%)`,
      }))} />
      <p>표시는 반올림하지만 계산은 원래 값으로 합니다. 여기서는 확률 변화의 원리를 관찰하고, 다음 차시에서는 입력에서 이 점수가 만들어지는 과정까지 직접 계산합니다.</p>
    </Box>
  </>
}

function SameInputComparison() {
  const [input, setInput] = useState(-2)
  const scalar = [
    { name: '계단', result: stepActivation(input), meaning: '기준을 넘었는지 0 또는 1로 판단', rule: '0 이상이면 1, 음수이면 0' },
    { name: 'ReLU', result: relu(input), meaning: '다음 층으로 전달하는 중간 출력', rule: '음수는 0, 양수는 그대로' },
    { name: '선형', result: input, meaning: '그대로 사용하는 수치 예측', rule: '값을 그대로 출력' },
    { name: '시그모이드', result: sigmoid(input), meaning: '클래스 1의 예측 확률', rule: '0과 1 사이로 변환' },
  ]
  const scores = [input, 1, 0]
  const probabilities = softmax(scores)
  return <Box title="같은 값인데 출력의 뜻은 왜 다를까요?">
    <label className="grid gap-2 font-semibold">함께 넣을 값: {fmt(input)}
      <input aria-label="함수 비교 입력값" type="range" className="min-h-11 w-full accent-indigo-600" min="-3" max="3" step="0.5" value={input} onChange={event => setInput(Number(event.target.value))} />
    </label>
    <div className="flex flex-wrap gap-2">{[-2, 0, 2].map(value => <Button key={value} variant="secondary" aria-pressed={input === value} onClick={() => setInput(value)}>입력 {value}</Button>)}</div>
    <p>아래 네 함수에는 같은 숫자 하나를 넣습니다. ReLU에서는 이 입력을 은닉 가중합 a, 다른 세 함수에서는 z라고 부릅니다.</p>
    <div className="grid gap-3 sm:grid-cols-2" aria-live="polite">
      {scalar.map(item => <div key={item.name} className="rounded-lg border bg-white p-3">
        <h4 className="font-bold">{item.name}: {fmt(input)} → {fmt(item.result)}</h4>
        <p>{item.rule}<br /><strong>결과의 뜻:</strong> {item.meaning}</p>
      </div>)}
    </div>
    <div className="rounded-lg border border-indigo-300 bg-indigo-50 p-3">
      <h4 className="font-bold">소프트맥스는 숫자 하나가 아니라 점수 묶음을 받습니다.</h4>
      <p>점수 [{scores.map(fmt).join(', ')}] → 확률 [{probabilities.map(fmt).join(', ')}]</p>
      <p>첫 점수에 위 값을 넣고 다른 두 점수 1, 0은 고정했습니다. 각 칸은 클래스별 확률이며 합은 1입니다.</p>
    </div>
    <h4 className="font-bold">어디에, 어떤 문제에 사용할까요?</h4>
    <p className="text-slate-600">표가 넓으면 표 안에서 좌우로 이동하세요.</p>
    <div className="max-w-full overflow-x-auto rounded-lg border bg-white focus-visible:outline-2 focus-visible:outline-indigo-600" role="region" aria-label="활성화 함수의 대표 사용 표" tabIndex={0}>
      <table className="w-full min-w-[480px] text-left">
        <caption className="p-3 text-left">문제에 맞게 사용하는 대표 조합이며, 가능한 모든 사용법을 나열한 표는 아닙니다.</caption>
        <thead className="bg-slate-100"><tr><th scope="col" className="p-3">문제 유형</th><th scope="col" className="p-3">은닉층의 대표 함수</th><th scope="col" className="p-3">출력층의 대표 함수</th></tr></thead>
        <tbody>{[
          ['수치 예측 — 기온·성적 등', 'ReLU', '선형 출력'],
          ['이진 분류 — 스팸·정상 등', 'ReLU', '시그모이드'],
          ['다중 분류 — 여러 동물 종류 등', 'ReLU', '소프트맥스'],
        ].map(([problem, hidden, output]) => <tr key={problem} className="border-t"><th scope="row" className="p-3 font-normal">{problem}</th><td className="p-3">{hidden}</td><td className="p-3">{output}</td></tr>)}</tbody>
      </table>
    </div>
    <p>수치 예측의 ‘출력층 활성화 함수를 사용하지 않음’은 가중합을 그대로 내보내는 선형 출력 <MathExpression inline formula={String.raw`\hat y=z`} />을 뜻합니다. 계단 함수는 고전적 퍼셉트론에서 기준에 따라 0·1을 판단하는 출력 함수로 구별합니다.</p>
  </Box>
}

const layers = [
  { id: 'input', title: '입력층', detail: '그림의 x₁과 x₂는 그대로 다음 뉴런에 전달할 특징값입니다. 가중치 w를 곱하고 합치는 계산은 값을 받는 은닉 뉴런에서 합니다.', transfer: '특징값 x를 다음 뉴런으로 전달' },
  { id: 'hidden', title: '은닉층', detail: '한 은닉 뉴런에 들어오는 곱셈 항들을 더하고 편향 b를 더하면 가중합 a가 됩니다. ReLU를 적용한 h가 다음 층의 입력입니다.', transfer: '곱셈 항의 합 + b → a → ReLU → h' },
  { id: 'output', title: '출력층', detail: '이제 원래 입력 x가 아니라 h에 연결 가중치 v를 곱합니다. 항들을 더하고 출력 편향 bₒ를 더해 점수 z를 만든 뒤 출력 함수를 적용합니다.', transfer: '은닉 출력 h × v → 합산·편향 → 점수 z' },
] as const

function LayerExploration() {
  const [selected, setSelected] = useState<(typeof layers)[number]['id']>('input')
  const layer = layers.find(item => item.id === selected)!
  return <>
    <Box title="그림의 연결을 계산식으로 읽기">
      <p>순전파는 현재 가중치·편향으로 입력에서 예측까지 계산하는 과정입니다. 층과 연결을 골라, 앞 층의 출력이 다음 뉴런 계산의 어느 항이 되는지 살펴보세요.</p>
      <div className="grid gap-2 sm:grid-cols-3">{layers.map(item => <Button key={item.id} variant={selected === item.id ? 'primary' : 'secondary'} aria-pressed={selected === item.id} onClick={() => setSelected(item.id)}>{item.title}</Button>)}</div>
      <div aria-live="polite" className="rounded-lg border border-indigo-300 bg-white p-3"><h4 className="font-bold">{layer.title} · {layer.transfer}</h4><p>{layer.detail}</p></div>
      <NetworkPicture network={examples.binary} stage={selected === 'output' ? 'output' : 'hidden'} reveal={false} />
      <p>이 그림과 아래 대입식은 시그모이드 예제의 같은 조건을 사용합니다. 다음 세 실습에서는 각 예제의 입력·가중치로 h와 z를 직접 계산합니다.</p>
    </Box>
    <NetworkSymbols network={examples.binary} />
  </>
}

const irisFeatures = [
  { id: 'sepal-length', label: '꽃받침 길이' },
  { id: 'sepal-width', label: '꽃받침 너비' },
  { id: 'petal-length', label: '꽃잎 길이' },
  { id: 'petal-width', label: '꽃잎 너비' },
  { id: 'filename', label: '사진 파일명' },
]

function IrisDesign({ page, answers, change }: Props) {
  const task = page.tasks[0]
  const response = answers[task.id]
  const selected = (response?.value ?? '').split(',').filter(Boolean)
  const inputTask = page.tasks[1], outputTask = page.tasks[2]
  const inputCount = answers[inputTask.id]?.value ?? ''
  const outputCount = answers[outputTask.id]?.value ?? ''
  const ok = correct(task, response)
  const ready = page.tasks.every(item => !!answers[item.id]?.value.trim())
  const done = page.tasks.every(item => correct(item, answers[item.id]))
  const toggle = (id: string) => {
    if (ok) return
    const next = selected.includes(id) ? selected.filter(value => value !== id) : [...selected, id]
    change(task.id, { value: irisFeatures.filter(item => next.includes(item.id)).map(item => item.id).join(','), submitted: false })
  }
  return <>
    <fieldset id={`task-${task.id}`} className="min-w-0 rounded-xl border border-indigo-200 bg-white p-4">
      <legend className="max-w-full px-2 font-bold leading-7">{task.prompt}</legend>
      <div className="grid gap-2 sm:grid-cols-2">{irisFeatures.map(feature => <Button key={feature.id} disabled={ok} variant={selected.includes(feature.id) ? 'primary' : 'secondary'} aria-pressed={selected.includes(feature.id)} onClick={() => toggle(feature.id)}>{selected.includes(feature.id) ? '✓ ' : ''}{feature.label}</Button>)}</div>
      <p aria-live="polite" className={`mt-3 rounded-lg p-3 ${response?.submitted ? ok ? 'bg-emerald-50' : 'bg-rose-50' : 'bg-slate-50'}`}>{response?.submitted ? ok ? `✓ 정답 유지 · ${task.explanation}` : `특징을 다시 선택하세요. ${task.hint}` : '실제 꽃에서 측정하는 수치 특징을 고른 뒤, 아래 뉴런 수와 함께 제출하세요.'}</p>
    </fieldset>
    <Box title="선택한 특징과 뉴런 수로 구조 만들기">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-3"><h4 className="font-bold">입력</h4><p>선택한 특징 {selected.length}개<br />입력 뉴런 {inputCount || '미입력'}개</p></div>
        <div className="rounded-lg border bg-white p-3"><h4 className="font-bold">은닉층</h4><p>특징을 조합해 중간 출력을 만듭니다. 뉴런 수는 설계할 때 정합니다.</p></div>
        <div className="rounded-lg border bg-white p-3"><h4 className="font-bold">출력</h4><p>분류할 종류: Setosa·Versicolor·Virginica<br />출력 뉴런 {outputCount || '미입력'}개</p></div>
      </div>
      <p>입력은 특징 하나마다 한 칸이 필요합니다. 소프트맥스는 종류마다 점수와 확률 한 칸을 만듭니다. 숨겨진 정답 이름을 입력에 넣는 설계는 아닙니다.</p>
    </Box>
    <div className="grid gap-3 sm:grid-cols-2">{[inputTask, outputTask].map(item => {
      const itemResponse = answers[item.id]
      const itemCorrect = correct(item, itemResponse)
      return <fieldset key={item.id} id={`task-${item.id}`} className="min-w-0 rounded-xl border border-indigo-200 bg-white p-4">
        <legend className="max-w-full px-2 font-bold leading-7">{item.prompt}</legend>
        <label className="grid gap-2">뉴런 수
          <input aria-label={item.prompt} inputMode="numeric" disabled={itemCorrect} className="min-h-12 w-full min-w-0 rounded-lg border border-slate-400 p-3 disabled:bg-emerald-50" value={itemResponse?.value ?? ''} onChange={event => change(item.id, { value: event.target.value, submitted: false })} />
        </label>
        <p aria-live="polite" className={`mt-3 rounded-lg p-3 ${itemResponse?.submitted ? itemCorrect ? 'bg-emerald-50' : 'bg-rose-50' : 'bg-slate-50'}`}>{itemResponse?.submitted ? itemCorrect ? '✓ 정답 유지 · 다른 오답 항목만 고치세요.' : `이 수를 다시 확인하세요. ${item.hint}` : '특징 선택과 두 뉴런 수를 모두 작성한 뒤 함께 제출하세요.'}</p>
      </fieldset>
    })}</div>
    <Button disabled={!ready || done} onClick={() => page.tasks.forEach(item => {
      if (!correct(item, answers[item.id])) change(item.id, { value: answers[item.id].value, submitted: true })
    })}>{done ? '세 설계 항목 정답 제출 완료' : '신경망 설계 함께 제출'}</Button>
    <p aria-live="polite">{done ? '특징 선택·입력 뉴런 수·출력 뉴런 수를 모두 확인했습니다.' : !ready ? '특징과 두 뉴런 수를 모두 작성해 주세요.' : '한 번에 제출합니다. 맞힌 항목은 유지하고, 틀린 항목만 수정해 다시 제출할 수 있습니다.'}</p>
  </>
}

function DepthComparison() {
  const [depth, setDepth] = useState(1)
  const count = depth + 2
  const width = count * 260 - 130
  return <Box title="층 수를 바꾸어 순전파의 길 비교하기">
    <p>은닉층이 여러 개인 DNN에서도 앞 층의 출력이 다음 층의 입력이 되는 계산 원리는 같습니다. 층 수를 바꾸어 값을 전달하는 단계가 어떻게 달라지는지 살펴보세요.</p>
    <div className="flex flex-wrap gap-2">{[1, 3].map(value => <Button key={value} variant={depth === value ? 'primary' : 'secondary'} aria-pressed={depth === value} onClick={() => setDepth(value)}>은닉층 {value}개</Button>)}</div>
    <div role="region" aria-label="은닉층 수 비교 그림 가로 스크롤" tabIndex={0} className="max-w-full overflow-x-auto rounded-lg border bg-white focus-visible:outline-3 focus-visible:outline-indigo-600">
      <svg viewBox={`0 0 ${width} 340`} className="w-full" style={{ minWidth: width }} role="img" aria-label={`입력층에서 은닉층 ${depth}개를 거쳐 출력층으로 연결한 구조 예시. 모든 연결에 가중치 기호를 표시했습니다.`}>
        {Array.from({ length: count - 1 }, (_, layer) => [100, 260].flatMap((from, i) => [100, 260].map((to, j) => {
          const start = layer * 260 + 95, end = (layer + 1) * 260 + 35
          const fraction = i === 0 ? .25 : .75
          const labelX = start + (end-start)*fraction, labelY = from+(to-from)*fraction
          return <g key={`${layer}-${i}-${j}`}>
            <line x1={start} y1={from} x2={end} y2={to} stroke="#818cf8" strokeWidth="2" />
            <rect x={labelX-28} y={labelY-17} width="56" height="34" rx="5" fill="white" stroke="#64748b" />
            <text x={labelX} y={labelY+5} textAnchor="middle" fontSize="19" fill="#334155"><tspan fontStyle="italic">{layer===count-2?'v':'w'}</tspan>{layer>0&&layer<count-2&&<tspan baselineShift="super" fontSize="12">{layer+1}</tspan>}<tspan baselineShift="sub" fontSize="14">{j+1}{i+1}</tspan></text>
          </g>
        })))}
        {Array.from({ length: count }, (_, index) => <g key={index}>
          <text x={index * 260 + 65} y="30" textAnchor="middle" fontSize="16" fontWeight="bold">{index === 0 ? '입력층' : index === count - 1 ? '출력층' : `은닉층 ${index}`}</text>
          {[100, 260].map((y, node) => <g key={y}><circle cx={index * 260 + 65} cy={y} r="24" fill={index === 0 || index === count - 1 ? '#f1f5f9' : '#e0e7ff'} stroke="#4f46e5" strokeWidth="2" /><text x={index*260+65} y={y+6} textAnchor="middle" fontSize="18">{index===0?'x':index===count-1?'O':'H'}<tspan baselineShift="sub" fontSize="13">{node+1}</tspan></text></g>)}
        </g>)}
        <text x="20" y="322" fontSize="16">한 층의 출력 → 다음 층의 입력</text>
      </svg>
    </div>
    {depth>1&&<p>은닉층 사이의 w에는 받는 은닉층 번호를 위첨자로 붙였습니다. 아래 두 번호는 받는 뉴런·보내는 뉴런 순서입니다.</p>}
    <p>위 그림은 층 수 비교용이며 앞 실습의 계산 결과를 이어 붙인 것은 아닙니다. 여러 층은 복잡한 관계를 표현할 수 있지만 계산량도 늘어납니다. 새 자료의 성능은 데이터와 학습 조건에도 달려 있습니다.</p>
  </Box>
}

export function Basics03_04(props: Props) {
  const { page } = props
  if (page.experience === '03-intro') return <>
    <Box title="함수는 입력을 정해진 규칙으로 바꾸는 계산입니다">
      <p>같은 가중합이라도 ‘기준을 넘었는가’, ‘중간값을 전달할까’, ‘어느 종류일 가능성이 큰가’에 따라 필요한 출력이 다릅니다. 활성화 함수가 가중합을 알맞은 출력으로 바꿉니다.</p>
      <p>곱하고 더하기만 하는 층은 여러 개를 쌓아도 하나의 계산으로 합칠 수 있습니다. ReLU처럼 값에 따라 다르게 반응하는 비선형 함수를 넣으면 복잡한 관계를 표현할 수 있습니다.</p>
      <p><strong>고전적 퍼셉트론의 계단 출력:</strong> 가중합 z≥0이면 1, z&lt;0이면 0입니다. 작은 값 변화로도 기준 0을 넘으면 판단 결과가 바뀝니다.</p>
    </Box>
    <ConceptView page={{ ...page, layerIntro: false }} />
    <Questions {...props} />
  </>
  if (page.experience === '03-relu') return <><ReluLocation /><ConceptView page={page} /><Questions {...props} /></>
  if (page.experience === '03-softmax') return <><SoftmaxObservation /><Questions {...props} /></>
  if (page.experience === '03-compare') return <><SameInputComparison /><Questions {...props} /></>
  if (page.experience === '04-structure') return <><LayerExploration /><Questions {...props} /></>
  if (page.experience === '04-design') return <IrisDesign {...props} />
  if (page.experience === '04-depth') return <><DepthComparison /><Questions {...props} /></>
  return null
}
