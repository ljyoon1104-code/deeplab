import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { cceePresets } from '../lesson05/lesson05Data'
import { binaryCrossEntropy, categoricalCrossEntropy, mse, predictionError, squaredError } from '../lesson05/lossMath'
import { Box, correct, Question, type Answers, type Response, type Task } from './TeachingUI'
import { backward, examples, fmt, forward, names, pairs, parameters, update, type Network, type Pair } from './network'
import type { Page } from './curriculum'
import { GradientChain } from './GradientChain'
import { repeatChoices, type RepeatObservation } from './repeatObservation'
import { MathExpression } from './MathExpression'

interface Props {
  page: Page
  answers: Answers
  change: (id: string, response: Response) => void
}

export function Basics05_06({ page, answers, change }: Props) {
  if (page.experience === '06-chain') return <GradientChain tasks={page.tasks} answers={answers} change={change} />
  const questions = page.lab || page.group ? [] : page.tasks
  return <div className="grid min-w-0 grid-cols-1 gap-5">
    {page.experience === '05-errors' && <><LossUseTable /><ErrorComparison /></>}
    {page.experience === '05-mse' && <ScoreLoss />}
    {page.experience === '05-bce' && <ProbabilityLoss />}
    {page.experience === '05-cce' && <Box title="원-핫의 정답 위치와 예측 확률">
      <p>원-핫은 실제 정답 위치만 1이고 나머지는 0인 표시입니다. 이번 고양이·강아지·새 예제의 정답은 [1, 0, 0]이므로 고양이 위치의 예측 확률로 손실을 계산합니다.</p>
      <p>정답의 1은 예측 확률 100%라는 뜻이 아닙니다. 아래에는 앞 차시에서 계산한 세 예측 확률을 그대로 사용합니다.</p>
    </Box>}
    {page.experience === '05-cce-apply' && <><OneHotLoss /><CceMeanBridge /></>}
    {page.experience === '06-start' && <><ParameterRoles /><DirectionObservation /></>}
    {page.experience === '06-repeat' && <RepeatedLearning task={page.tasks[0]} response={answers[page.tasks[0].id]} onChange={response => change(page.tasks[0].id, response)} />}
    {questions.filter(task => task.id !== 'basics20261020-06-repeat-interpretation').map(task => <Question key={task.id} task={task} response={answers[task.id]} onChange={response => change(task.id, response)} />)}
  </div>
}

function LossUseTable() {
  return <Box title="무엇을 예측하는지에 맞추어 손실함수를 고릅니다">
    <p>수치의 차이를 비교할지, 실제 정답에 준 확률을 평가할지에 따라 알맞은 계산 방법이 달라집니다.</p>
    <p className="text-slate-600">표가 넓으면 표 안에서 좌우로 이동하세요.</p>
    <div className="max-w-full overflow-x-auto rounded-lg border bg-white focus-visible:outline-2 focus-visible:outline-indigo-600" role="region" aria-label="문제별 대표 출력 방식과 손실함수 표" tabIndex={0}>
      <table className="w-full min-w-[500px] text-left">
        <caption className="p-3 text-left">문제 유형 → 출력의 의미 → 대표 손실함수</caption>
        <thead className="bg-slate-100"><tr><th scope="col" className="p-3">문제 유형</th><th scope="col" className="p-3">대표 출력 방식과 의미</th><th scope="col" className="p-3">손실함수</th></tr></thead>
        <tbody>
          <tr className="border-t"><th scope="row" className="p-3 font-normal">수치 예측</th><td className="p-3">선형 출력<br />예측한 수치</td><td className="p-3">MSE — 평균제곱오차</td></tr>
          <tr className="border-t"><th scope="row" className="p-3 font-normal">이진 분류</th><td className="p-3">시그모이드<br />클래스 1의 확률</td><td className="p-3">BCE — 이진 교차 엔트로피</td></tr>
          <tr className="border-t"><th scope="row" className="p-3 font-normal">다중 분류</th><td className="p-3">소프트맥스<br />각 클래스의 확률</td><td className="p-3">CCE — 범주형 교차 엔트로피</td></tr>
        </tbody>
      </table>
    </div>
  </Box>
}

function ErrorComparison() {
  const [prediction, setPrediction] = useState(70)
  const target = 80
  const error = predictionError(target, prediction)
  const targets = [10, 20, 30, 40]
  const models = [[10, 20, 30, 50], [7, 17, 27, 37]]
  return <>
    <Box title="예측이 높아도, 낮아도 차이는 남습니다">
      <p>실제 점수는 <strong>80점</strong>입니다. 예측을 바꾸어 차이의 방향과 크기를 비교하세요.</p>
      <div className="flex flex-wrap gap-2">{[70, 90].map(value => <Button key={value} variant="secondary" aria-pressed={prediction === value} onClick={() => setPrediction(value)} className={prediction === value ? 'border-indigo-600 bg-indigo-50' : ''}>예측 {value}점</Button>)}</div>
      <div className="grid gap-3 sm:grid-cols-3" aria-live="polite">
        <div className="rounded-lg bg-white p-3">① 실제와 비교<MathExpression formula={`${prediction}-${target}=${error}`}/>부호는 높거나 낮은 방향입니다.</div>
        <div className="rounded-lg bg-white p-3">② 차이를 제곱<MathExpression formula={`(${error})^2=${squaredError(target, prediction)}`}/>반대 방향의 차이도 남습니다.</div>
        <p className="rounded-lg bg-white p-3">③ 여러 자료라면 평균<br /><strong>제곱오차 합 ÷ 자료 수</strong><br />이를 평균제곱오차, MSE라고 합니다.</p>
      </div>
      <p>오차 −10과 +10을 그대로 더하면 0이지만, 두 예측이 모두 맞은 것은 아닙니다. 제곱하면 100과 100이 되어 서로 지워지지 않습니다.</p>
    </Box>
    <Box title="같은 자료에서 두 모델을 비교하기">
      <p>이번에는 다른 네 자료의 실제 값 <strong>[{targets.join(', ')}]</strong>을 사용합니다. 앱이 계산한 제곱오차와 MSE를 비교하세요.</p>
      <div className="grid gap-3 sm:grid-cols-2">{models.map((predictions, index) => <article key={index} className="rounded-lg border border-slate-300 bg-white p-3">
        <h4 className="font-bold">모델 {index === 0 ? 'A' : 'B'}</h4>
        <p>예측 [{predictions.join(', ')}]</p>
        <p>제곱오차 [{predictions.map((value, i) => squaredError(targets[i], value)).join(', ')}]</p>
        <p className="mt-2 font-bold">MSE = {fmt(mse(targets, predictions))}<br /><span className="font-normal">네 제곱오차의 평균입니다.</span></p>
      </article>)}</div>
      <p>MSE는 <strong>비교하는 방법</strong>이고, 위의 숫자는 그 방법으로 얻은 <strong>손실값</strong>입니다. <strong>정확도</strong>는 분류한 여러 자료 중 맞힌 비율이므로 손실과 다른 값입니다. 손실은 같은 자료·같은 손실함수로 비교합니다.</p>
    </Box>
  </>
}

function ScoreLoss() {
  const samples = [
    { hours:2, focus:4, target:80, prediction:85 },
    { hours:3, focus:3, target:70, prediction:80 },
    { hours:4, focus:5, target:90, prediction:90 },
  ]
  const squares = samples.map(sample => squaredError(sample.target, sample.prediction))
  return <Box title="공부 시간·집중도에서 성적을 예측했다면">
    <p>예측 성적과 실제 성적의 차이를 제곱해 더한 뒤, 자료 수로 나눕니다. 반대 방향의 오차가 지워지지 않고 여러 예측의 차이를 하나의 손실값으로 비교할 수 있습니다.</p>
    <p className="text-slate-600">표가 넓으면 표 안에서 좌우로 이동하세요.</p>
    <div className="min-w-0 max-w-full overflow-x-auto rounded-lg border bg-white focus-visible:outline-2 focus-visible:outline-indigo-600" role="region" aria-label="성적 예측과 제곱오차 표" tabIndex={0}>
      <table className="w-full min-w-[540px] text-left"><caption className="p-3 text-left">세 학생의 성적 예측 · 입력은 공부 시간과 집중도입니다.</caption>
        <thead className="bg-slate-100"><tr>{['공부 시간','집중도','실제 성적 y','예측 성적 ŷ','차이 ŷ−y','제곱오차'].map(label=><th key={label} className="p-3">{label}</th>)}</tr></thead>
        <tbody>{samples.map((sample,index)=><tr key={index} className="border-t">
          {[sample.hours,sample.focus,sample.target,sample.prediction,predictionError(sample.target,sample.prediction),squares[index]].map((value,column)=><td key={column} className="p-3">{value}</td>)}
        </tr>)}</tbody>
      </table>
    </div>
    <MathExpression formula={String.raw`\mathrm{MSE}=\frac{${squares.join(' + ')}}{${samples.length}}\approx${fmt(mse(samples.map(s=>s.target),samples.map(s=>s.prediction)))}`}/>
    <p>분자는 세 제곱오차의 합, 분모 3은 자료 수입니다. 결과는 성적 예측의 평균 손실이며, 맞힌 비율이 아닙니다.</p>
    <p className="border-l-4 border-indigo-400 pl-3">이제 입력을 작은 신경망 예제로 바꿉니다. 아래 필수 계산은 4차시의 <strong>선형 출력과 정답</strong>을 그대로 사용합니다.</p>
  </Box>
}

function ProbabilityLoss() {
  const [target, setTarget] = useState<0 | 1>(1)
  const [probability, setProbability] = useState(.7)
  return <Box title="정답에 더 큰 확률을 주면 손실은 어떻게 될까요?">
    <p>별도 관찰 예제입니다. <strong>p는 언제나 스팸(클래스 1)의 확률</strong>이고, 실제 정답 y는 스팸이면 1, 정상이면 0입니다. 정답에 따라 p와 1−p 중 어느 확률을 쓰는지 비교하세요.</p>
    <p>ln은 자연로그이며 앱이 계산합니다. y가 0 또는 1이므로 두 항 중 하나는 0을 곱해 없어집니다.</p>
    <MathExpression formula={String.raw`L_{BCE}=-[y\ln(p)+(1-y)\ln(1-p)]`} />
    <div className="flex flex-wrap gap-2">{([1, 0] as const).map(value => <Button key={value} variant="secondary" aria-pressed={target === value} onClick={() => setTarget(value)} className={target === value ? 'border-indigo-600 bg-indigo-50' : ''}>실제 정답: {value === 1 ? '스팸(1)' : '정상(0)'}</Button>)}</div>
    <label className="grid gap-2">스팸 예측 확률 p = {probability.toFixed(2)}
      <input type="range" min=".05" max=".95" step=".05" aria-label="관찰 예제의 스팸 예측 확률" value={probability} onChange={event => setProbability(Number(event.target.value))} className="w-full" />
    </label>
    <Button variant="secondary" onClick={() => setProbability(.8)}>p=0.8에서 두 정답 비교</Button>
    <div className="grid gap-3 sm:grid-cols-2" aria-live="polite">
      {([1, 0] as const).map(value => {
        const targetProbability = value === 1 ? probability : 1 - probability
        return <div key={value} className={`rounded-lg border-2 p-3 ${target === value ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white'}`}>
          <h4 className="font-bold">{target === value ? '관찰 중 · ' : ''}정답 y={value} ({value === 1 ? '스팸' : '정상'})</h4>
          <p>{value === 1 ? '1−y=0이므로 −ln(p)가 남습니다.' : 'y=0이므로 −ln(1−p)가 남습니다.'}</p>
          <MathExpression formula={value === 1 ? String.raw`L=-\ln(p)` : String.raw`L=-\ln(1-p)`}/>
          <p>정답의 확률</p><MathExpression formula={value === 1 ? `p=${fmt(probability)}` : `1-p=1-${fmt(probability)}=${fmt(targetProbability)}`}/>
          <p>손실</p><MathExpression formula={String.raw`-\ln(${fmt(targetProbability)})\approx${fmt(binaryCrossEntropy(value, probability))}`}/>
        </div>
      })}
    </div>
    <p>실제 정답의 확률이 작을수록 손실은 커집니다. 아래 필수 계산은 슬라이더와 별개로 앞 차시의 공통 예측값을 사용합니다.</p>
  </Box>
}

function OneHotLoss() {
  const [preset, setPreset] = useState(0)
  const [position, setPosition] = useState<number | null>(null)
  const classes = ['Setosa', 'Versicolor', 'Virginica']
  const target = [0, 0, 1]
  const probabilities = cceePresets[preset].probabilities
  return <Box title="원-핫의 1이 있는 위치를 찾으세요">
    <p>붓꽃의 세 종류를 분류하는 별도 관찰 예제입니다. <strong>클래스는 구분할 종류</strong>이며, 정답 [0, 0, 1]의 1은 확률이 아니라 실제 정답 위치를 표시합니다.</p>
    <div className="flex flex-wrap gap-2">{cceePresets.map((item, index) => <Button key={item.id} variant="secondary" aria-pressed={preset === index} onClick={() => setPreset(index)} className={preset === index ? 'border-indigo-600 bg-indigo-50' : ''}>{item.label}</Button>)}</div>
    <div className="grid min-w-0 gap-2 sm:grid-cols-3">{classes.map((name, index) => <Button key={name} variant="secondary" onClick={() => setPosition(index)} aria-pressed={position === index} className={`min-w-0 flex-col p-3 ${position === index ? 'border-indigo-600 bg-indigo-50' : ''}`}>
      <span>{name}</span><span>정답 칸: {target[index]}</span><span>예측 확률: {probabilities[index].toFixed(2)}</span>
    </Button>)}</div>
    <div className="rounded-lg bg-white p-3" aria-live="polite">{position === null ? '정답의 1이 있는 칸을 눌러, 손실에 사용할 확률을 찾아보세요.' : position === 2
      ? <>Virginica의 예측 확률 <strong>{probabilities[2].toFixed(2)}</strong>를 사용합니다.<MathExpression formula={String.raw`L_{CCE}=-\ln(${probabilities[2].toFixed(2)})\approx${fmt(categoricalCrossEntropy(target, probabilities))}`}/></>
      : `${classes[position]}의 정답 칸은 0입니다. 원-핫에서 1인 칸을 다시 찾아보세요.`}</div>
    <p>앞의 신경망과 분류할 종류는 다르지만, 정답 위치의 확률을 찾아 손실을 계산하는 원리는 같습니다.</p>
  </Box>
}

function CceMeanBridge() {
  const probabilities = [.7, .2, .1]
  const target = [1, 0, 0]
  return <Box title="한 자료의 CCE → 여러 자료의 평균">
    <p>평균 계산으로 연결하는 별도 안내 예입니다. 고양이·강아지·새 순서로 예측 [0.7, 0.2, 0.1], 정답 [1, 0, 0]을 사용합니다.</p>
    <MathExpression formula={String.raw`L=-[1\ln(0.7)+0\ln(0.2)+0\ln(0.1)]`}/>
    <MathExpression formula={String.raw`L=-\ln(0.7)\approx${fmt(categoricalCrossEntropy(target, probabilities))}`}/>
    <p>이 값은 한 자료의 손실입니다. 다음 STEP에서는 각 자료의 손실을 더해 자료 수로 나눕니다. 이 안내 계산을 별도로 제출하지는 않습니다.</p>
  </Box>
}

function ParameterRoles() {
  const [selected, setSelected] = useState(0)
  const n = examples.linear
  const f = forward(n)
  const items = [
    { name: '입력 x·정답 y', value: `x=${n.x[0]}, y=${n.y[0]}`, role: '주어진 자료', detail: '이 한 번의 학습에서 비교할 자료입니다. 예측에 맞추어 정답을 바꾸지 않습니다.' },
    { name: '가중치·편향', value: `w=${n.w[0][0]}, v=${n.v[0][0]}, b=${n.b[0]}, bₒ=${n.bo[0]}`, role: '학습 파라미터', detail: '손실을 줄이려고 수정할 모델의 값입니다. 입력과 가중치를 곱하고 편향을 더해 예측합니다.' },
    { name: '예측·손실', value: `ŷ=${fmt(f.p[0])}, L=${fmt(f.loss)}`, role: '계산 결과', detail: '현재 파라미터로 계산한 결과입니다. 숫자를 직접 정답으로 고치는 대신, 파라미터를 바꾼 뒤 다시 계산합니다.' },
  ]
  const current = items[selected]
  return <Box title="손실을 구한 다음, 무엇을 바꿀까요?">
    <p>앞 차시의 선형 출력 예제를 그대로 이어 봅니다. 세 묶음을 선택해 값의 역할을 비교하세요.</p>
    <div className="grid gap-2 sm:grid-cols-3">{items.map((item, index) => <Button key={item.name} variant="secondary" aria-pressed={selected === index} onClick={() => setSelected(index)} className={selected === index ? 'border-indigo-600 bg-indigo-50' : ''}>{item.name}</Button>)}</div>
    <div className="rounded-lg border border-indigo-200 bg-white p-3" aria-live="polite"><p className="font-bold">{current.name} → {current.role}</p><p className="my-2 font-mono">{current.value}</p><p>{current.detail}</p></div>
    <p><strong>역전파는 기울기를 구하고, 경사하강법은 그 기울기로 값을 수정합니다.</strong> 기울기는 파라미터를 조금 늘릴 때 손실이 어느 방향으로 얼마나 변하는지 알려주는 값입니다.</p>
  </Box>
}

function DirectionObservation() {
  const [value, setValue] = useState(examples.linear.v[0][0])
  const initial = examples.linear
  const current = { ...initial, v: [[value]] }
  const currentForward = forward(current)
  const gradient = backward(current).dv[0][0]
  const changeAmount = -initial.eta * gradient
  const nextValue = value + changeAmount
  const left = 48, right = 330, top = 24, bottom = 210
  const x = (v: number) => left + v / 1.8 * (right - left)
  const y = (loss: number) => bottom - loss / 3.7 * (bottom - top)
  const points = Array.from({ length: 91 }, (_, index) => {
    const v = index * .02
    return `${x(v)},${y(forward({ ...initial, v: [[v]] }).loss)}`
  }).join(' ')
  return <Box title="손실 곡선에서 수정 방향을 먼저 예상하기">
    <p>다른 값은 고정하고 <strong>출력 가중치 v₁ 하나만</strong> 바꾸어 계산한 곡선입니다. 처음 v₁=0.6에서 왼쪽과 오른쪽 중 어느 쪽으로 조금 움직이면 손실이 작아질까요?</p>
    <svg viewBox="0 0 360 270" role="img" aria-label={`가로축 출력 가중치 v1, 세로축 MSE 손실. 현재 v1 ${fmt(value)}, 손실 ${fmt(currentForward.loss)}`} className="mx-auto w-full max-w-md">
      <line x1={left} y1={top} x2={left} y2={bottom} stroke="#64748b" />
      <line x1={left} y1={bottom} x2={right} y2={bottom} stroke="#64748b" />
      {[0, 1, 2, 3].map(tick => <g key={tick}><line x1={left} x2={right} y1={y(tick)} y2={y(tick)} stroke="#e2e8f0" /><text x="36" y={y(tick) + 6} textAnchor="end" fontSize="16">{tick}</text></g>)}
      <polyline points={points} fill="none" stroke="#4f46e5" strokeWidth="3" />
      <circle cx={x(value)} cy={y(currentForward.loss)} r="7" fill="#be123c" />
      {[0, .6, 1.2, 1.8].map(tick => <text key={tick} x={x(tick)} y="234" textAnchor="middle" fontSize="16">{tick}</text>)}
      <text x="14" y="18" fontSize="16">손실</text>
      <text x="190" y="259" textAnchor="middle" fontSize="17">출력 가중치 v₁</text>
    </svg>
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" onClick={() => setValue(.5)}>초기값보다 0.1 낮추어 비교</Button>
      <Button variant="secondary" onClick={() => setValue(.7)}>초기값보다 0.1 높여 비교</Button>
      <Button variant="ghost" onClick={() => setValue(.6)}>v₁=0.6 다시 보기</Button>
    </div>
    <p className="rounded-lg bg-white p-3" aria-live="polite">현재 v₁=<strong>{fmt(value)}</strong> → 예측 ŷ=<strong>{fmt(currentForward.p[0])}</strong> → MSE 손실 L=<strong>{fmt(currentForward.loss)}</strong><br />이 지점의 기울기 ∂L/∂v₁=<strong>{fmt(gradient)}</strong>입니다. {gradient < 0 ? '음수이면 v₁을 조금 늘릴 때 손실이 줄어드는 방향입니다.' : '양수이면 v₁을 조금 줄일 때 손실이 줄어드는 방향입니다.'}</p>
    <p>학습률 η(에타)는 <strong>기울기를 실제 수정량으로 바꾸는 배율</strong>입니다. 지금 관찰한 같은 가중치와 기울기에 η={initial.eta}를 적용해 봅니다.</p>
    <MathExpression formula={String.raw`v_1^{new}=v_1^{old}-\eta\frac{\partial L}{\partial v_1}`}/>
    <div className="grid gap-2 sm:grid-cols-3">
      <div className="rounded-lg bg-white p-3"><strong>현재 값과 조건</strong><MathExpression formula={String.raw`v_1=${fmt(value)},\quad\eta=${initial.eta}`}/><MathExpression formula={String.raw`\frac{\partial L}{\partial v_1}\approx${fmt(gradient)}`}/></div>
      <div className="rounded-lg bg-white p-3"><strong>실제 수정량</strong><MathExpression formula={String.raw`-${initial.eta}\times(${fmt(gradient)})\approx${fmt(changeAmount)}`}/></div>
      <div className="rounded-lg bg-white p-3"><strong>새 가중치</strong><MathExpression formula={String.raw`${fmt(value)}+(${fmt(changeAmount)})\approx${fmt(nextValue)}`}/></div>
    </div>
    <p>이 그림은 한 가중치의 방향 관찰입니다. 뒤의 세 필수 실습은 수정 전 값으로 모든 기울기를 구한 뒤, 가중치와 편향을 함께 바꿉니다.</p>
  </Box>
}

function RepeatedLearning({ task, response, onChange }: { task: Task; response?: Response; onChange: (response: Response) => void }) {
  const [kind, setKind] = useState<Pair>('linear')
  const [histories, setHistories] = useState<Record<Pair, Network[]>>({
    linear: [examples.linear], binary: [examples.binary], multi: [examples.multi],
  })
  const history = histories[kind]
  const current = history[history.length - 1]
  const previous = history[Math.max(0, history.length - 2)]
  const before = forward(previous)
  const after = forward(current)
  const gradient = backward(previous)
  const losses = history.map(network => forward(network).loss)
  const count = history.length - 1
  const left = 58, right = 560, top = 24, bottom = 190
  const maxLoss = Math.max(.05, ...losses) * 1.12
  const plotX = (index: number) => left + index / Math.max(1, count) * (right - left)
  const plotY = (loss: number) => bottom - loss / maxLoss * (bottom - top)
  const firstParameter = parameters(previous)[0]
  const lastParameter = parameters(current)[0]
  let observation: RepeatObservation | undefined
  try { observation = response?.value ? JSON.parse(response.value) as RepeatObservation : undefined } catch { /* A previous temporary answer is not a new observation. */ }
  const selected = observation?.conclusion ?? ''
  const run = (steps: number) => setHistories(all => {
    const next = [...all[kind]]
    for (let i = 0; i < steps && next.length <= 30; i += 1) {
      const n = next[next.length - 1]
      const trained = update(n)
      if (!Number.isFinite(forward(trained).loss)) break
      next.push(trained)
    }
    return { ...all, [kind]: next }
  })
  return <Box title="같은 계산을 반복하면 예측과 손실은 어떻게 달라질까요?">
    <p>앞의 공통 예제를 같은 자료와 학습률로 반복합니다. 각 점은 <strong>순전파 → 기울기 계산 → 동시 수정 → 재예측</strong>을 실제 계산한 결과입니다.</p>
    <div className="flex flex-wrap gap-2">{pairs.map(pair => <Button key={pair} variant="secondary" aria-pressed={kind === pair} onClick={() => setKind(pair)} className={kind === pair ? 'border-indigo-600 bg-indigo-50' : ''}>{names[pair]}</Button>)}</div>
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={() => run(1)} disabled={count >= 30}>1회 더 학습</Button>
      <Button variant="secondary" onClick={() => run(5)} disabled={count >= 30}>5회 더 학습</Button>
      <Button variant="ghost" onClick={() => setHistories(all => ({ ...all, [kind]: [examples[kind]] }))}>이 관찰만 처음으로</Button>
    </div>
    <p aria-live="polite">현재 <strong>{count}회</strong> · 학습률 η={current.eta} · 입력 [{current.x.join(', ')}] · 정답 [{current.y.join(', ')}]</p>
    <div className="max-w-full overflow-x-auto rounded-lg border border-slate-300 bg-white focus-visible:outline-3 focus-visible:outline-indigo-600" role="region" aria-label="반복 학습 손실 그래프 가로 스크롤" tabIndex={0}>
      <svg viewBox="0 0 600 245" className="w-full min-w-[600px]" role="img" aria-label={`${names[kind]}, 학습 ${count}회. 초기 손실 ${fmt(losses[0])}, 현재 손실 ${fmt(after.loss)}`}>
        <line x1={left} x2={left} y1={top} y2={bottom} stroke="#64748b" />
        <line x1={left} x2={right} y1={bottom} y2={bottom} stroke="#64748b" />
        {[0, .5, 1].map(ratio => <g key={ratio}><line x1={left} x2={right} y1={plotY(maxLoss * ratio)} y2={plotY(maxLoss * ratio)} stroke="#e2e8f0" /><text x="49" y={plotY(maxLoss * ratio) + 5} textAnchor="end" fontSize="16">{(maxLoss * ratio).toFixed(2)}</text></g>)}
        <polyline points={losses.map((loss, index) => `${plotX(index)},${plotY(loss)}`).join(' ')} fill="none" stroke="#4f46e5" strokeWidth="3" />
        {losses.map((loss, index) => <circle key={index} cx={plotX(index)} cy={plotY(loss)} r={index === count ? 6 : 3} fill={index === count ? '#be123c' : '#4f46e5'} />)}
        <text x={left} y="215" textAnchor="middle" fontSize="17">0</text>
        {count > 0 && <text x={right} y="215" textAnchor="middle" fontSize="17">{count}</text>}
        <text x="300" y="239" textAnchor="middle" fontSize="17">학습 횟수</text>
        <text x="14" y="17" fontSize="16">손실</text>
      </svg>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      <p className="rounded-lg bg-white p-3"><strong>{count === 0 ? '초기 계산' : `${count - 1}회 → ${count}회 비교`}</strong><br />예측 [{before.p.map(fmt).join(', ')}] → [{after.p.map(fmt).join(', ')}]<br />손실 {fmt(before.loss)} → {fmt(after.loss)}</p>
      <div className="rounded-lg bg-white p-3"><strong>대표 가중치 {firstParameter.label}</strong><br />{count === 0 ? <>아직 수정하지 않았습니다.<br />현재 값 {fmt(firstParameter.value)}</> : <><MathExpression formula={String.raw`${fmt(firstParameter.value)}-${current.eta}\times(${fmt(gradient.dw[0][0])})\approx${fmt(lastParameter.value)}`}/>다른 가중치·편향도 같은 시점의 기울기로 함께 수정합니다.</>}</div>
    </div>
    <p>표시한 소수는 근삿값(≈)이며 계산에는 반올림 전 값을 씁니다. 작은 값의 <strong>e−8은 ×10⁻⁸</strong>을 뜻합니다. 작게 보이는 손실을 정확한 0이나 모든 자료의 정답으로 해석하지 마세요.</p>
    <div className="rounded-lg border border-slate-300 bg-white p-3"><strong>여러 자료를 함께 학습할 때</strong><p>위 그래프는 한 자료를 반복한 결과입니다. N개 자료에서는 개별 손실과 기울기를 각각 평균냅니다. θ는 같은 가중치 또는 편향, i는 자료 번호입니다.</p><MathExpression formula={String.raw`\overline{L}=\frac{1}{N}\sum_{i=1}^{N}L_i`}/><MathExpression formula={String.raw`\frac{\partial\overline{L}}{\partial\theta}=\frac{1}{N}\sum_{i=1}^{N}\frac{\partial L_i}{\partial\theta}`}/><p>BCE·CCE도 계산된 손실을 평균내며, 손실을 다시 제곱하지 않습니다.</p></div>
    <details>
      <summary className="min-h-11 cursor-pointer py-2 font-bold">관찰한 두 시점의 상세값</summary>
      <div className="grid gap-2 break-all rounded-lg bg-white p-3">
        <p>수정 전 손실: {before.loss.toPrecision(15)}</p>
        <p>수정 후 손실: {after.loss.toPrecision(15)}</p>
        <p>수정에 사용한 w₁₁ 기울기: {count === 0 ? '아직 수정하지 않았습니다.' : gradient.dw[0][0].toPrecision(15)}</p>
      </div>
    </details>
    <fieldset id={`task-${task.id}`} className="min-w-0 rounded-xl border border-indigo-200 bg-white p-4">
      <legend className="max-w-full px-2 font-bold">{task.prompt}</legend>
      <p className="mb-3">{count === 0 ? '먼저 학습을 실행해 변화한 예측·손실을 관찰하세요.' : `현재 ${names[kind]}의 ${count - 1}회 → ${count}회 결과를 해석해 제출하세요.`}</p>
      <div className="grid gap-2">{repeatChoices.map(choice => <Button key={choice} variant="secondary" className={`justify-start text-left ${selected === choice ? 'border-indigo-600 bg-indigo-50' : ''}`} aria-pressed={selected === choice} onClick={() => onChange({ value: JSON.stringify({ kind, steps: count, conclusion: choice }), submitted: false })}>{choice}</Button>)}</div>
      <Button className="mt-3" disabled={count === 0 || !selected} onClick={() => onChange({ value: JSON.stringify({ kind, steps: count, conclusion: selected }), submitted: true })}>관찰 해석 제출</Button>
      <p className="mt-3 rounded-lg bg-slate-50 p-3" aria-live="polite">{response?.submitted
        ? <>{observation && names[observation.kind]} · {observation?.steps}회째 관찰 답안: {correct(task, response) ? `정답입니다. ${task.explanation}` : `다시 살펴보세요. ${task.hint}`} 다른 관찰로 이동해도 이 제출 기록은 유지됩니다.</>
        : '학습 실행만으로 정답 처리되지 않습니다. 결과에 맞는 해석을 선택해 제출하세요.'}</p>
    </fieldset>
  </Box>
}
