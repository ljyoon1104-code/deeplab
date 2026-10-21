import { useId, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { calculatePerceptronN, formatNumber } from '../lesson02/perceptronMath'
import { ConceptView } from './ConceptViews'
import { Box, Question, correct, type Answers, type Response, type Task } from './TeachingUI'
import { LayersConcept } from './LayersConcept'
import { MathExpression } from './MathExpression'
import type { Page } from './curriculum'

type Props = { page: Page; answers: Answers; change: (id: string, response: Response) => void }
const number = (value: number) => formatNumber(value, 4)
const baseline = { w1: .5, w2: -.2, b: .1 }
const calculate = (values: typeof baseline, inputs: readonly number[] = [2, 3]) => {
  const result = calculatePerceptronN({ inputs, weights: [values.w1, values.w2], bias: values.b })
  // 이 0.1 간격 조작에서 생기는 부동소수점 잔차만 0으로 맞춥니다.
  return Math.abs(result.z) < 1e-12 ? { ...result, z: 0, output: 1 as const } : result
}
type Plan = { key: keyof typeof baseline; candidate: number; prediction: string }
const initialPlan: Plan = { key: 'w1', candidate: .6, prediction: '' }
const read = <T,>(value: string | undefined, fallback: T): T => {
  try { return value ? { ...fallback, ...JSON.parse(value) } : fallback } catch { return fallback }
}
export function validateObservationPlan(value: string) {
  const plan = read<Plan>(value, initialPlan)
  if (!['w1', 'w2', 'b'].includes(plan.key) || !Number.isFinite(plan.candidate) || plan.candidate < -1 || plan.candidate > 1 || plan.candidate === baseline[plan.key]) return false
  const before = calculate(baseline).z
  const after = calculate({ ...baseline, [plan.key]: plan.candidate }).z
  return plan.prediction === (Math.abs(after - before) < 1e-9 ? 'same' : after > before ? 'increase' : 'decrease')
}
function validValues(value: string) {
  const values = read(value, { w1: NaN, w2: NaN, b: NaN })
  return [values.w1, values.w2, values.b].every(v => Number.isFinite(v) && v >= -1 && v <= 1) ? values : null
}
export function validateTargetOne(value: string) {
  const values = validValues(value)
  return !!values && values.w1 === .5 && values.w2 === -.2 && calculate(values).output === 1
}
export function validateTargetZero(value: string) {
  const values = validValues(value)
  return !!values && values.b === .1 && calculate(values).output === 0
}
function Questions({ page, answers, change }: Props) {
  return <div className="grid gap-4">{page.tasks.map(task => <Question key={task.id} task={task} response={answers[task.id]} onChange={response => change(task.id, response)} />)}</div>
}
function Status({ task, response }: { task: Task; response?: Response }) {
  return <p aria-live="polite" className={`rounded-lg p-3 leading-7 ${response?.submitted ? correct(task, response) ? 'bg-emerald-50' : 'bg-rose-50' : 'bg-slate-50'}`}>
    {response?.submitted ? correct(task, response) ? `✓ ${task.explanation}` : `다시 살펴보세요. ${task.hint}` : '현재 선택은 아직 제출하지 않았습니다.'}
  </p>
}
function AiRelations() {
  const [selected, setSelected] = useState('ai')
  const [useCase, setUseCase] = useState(0)
  const cases = [
    { name: '사진 분류', input: '고양이가 찍힌 사진', output: '“고양이”라는 종류', purpose: '사진 속 물체를 구별하는 데 활용합니다.' },
    { name: '음성 인식', input: '“오늘 날씨 알려 줘”라는 말소리', output: '“오늘 날씨 알려 줘”라는 글', purpose: '소리를 글로 바꿔 음성으로 기기를 조작하는 데 활용합니다.' },
    { name: '문장 생성', input: '“학교 축제를 소개하는 글을 써 줘”라는 요청', output: '요청에 이어지는 소개 문장', purpose: '문맥에 맞는 글을 만드는 데 활용합니다. 생성한 내용이 사실인지는 따로 확인해야 합니다.' },
  ]
  const items = [
    { id: 'ai', name: '인공지능(AI)', detail: '사람의 지능이 필요한 판단·문제 해결 등을 컴퓨터로 구현하는 넓은 분야입니다. 사람이 만든 규칙을 사용하는 방법도 있습니다.' },
    { id: 'ml', name: '기계학습', detail: 'AI의 한 방법으로, 데이터를 통해 예측에 쓸 규칙을 배웁니다.' },
    { id: 'dl', name: '딥러닝', detail: '기계학습의 한 방법으로, 여러 층의 신경망에서 유용한 표현을 함께 배웁니다.' },
  ]
  return <><Box title="딥러닝은 어디에 쓰일까요?">
    <div className="grid gap-2 sm:grid-cols-3">{cases.map((item, index) => <Button key={item.name} variant={useCase === index ? 'primary' : 'secondary'} aria-pressed={useCase === index} onClick={() => setUseCase(index)}>{item.name}</Button>)}</div>
    <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]" aria-live="polite">
      <div className="rounded-xl border border-cyan-300 bg-cyan-50 p-3"><strong className="block">입력</strong>{cases[useCase].input}</div>
      <span aria-hidden="true" className="text-center text-2xl text-indigo-600"><span className="sm:hidden">↓</span><span className="hidden sm:inline">→</span></span>
      <div className="rounded-xl border border-indigo-300 bg-indigo-50 p-3"><strong className="block">얻으려는 결과</strong>{cases[useCase].output}</div>
    </div>
    <p>{cases[useCase].purpose}</p>
    <p><strong>딥러닝</strong>은 여러 계산층으로 연결된 인공신경망이 자료에서 유용한 표현과 판단 규칙을 학습하는 방법입니다. 사람이 사진과 말소리마다 모든 규칙을 직접 적기 어려워 이런 학습 방법을 사용합니다.</p>
    <p>위 입력과 결과는 활용을 설명하는 예시이며, 여기서 모델을 실행한 결과는 아닙니다.</p>
  </Box><Box title="AI 안에 기계학습, 그 안에 딥러닝">
    <div className="rounded-xl border-2 border-slate-400 bg-white p-3">
      <Button variant="secondary" aria-pressed={selected === 'ai'} onClick={() => setSelected('ai')}>{items[0].name}</Button>
      <div className="ml-3 mt-3 rounded-xl border-2 border-indigo-400 bg-indigo-50 p-3">
        <Button variant="secondary" aria-pressed={selected === 'ml'} onClick={() => setSelected('ml')}>{items[1].name}</Button>
        <div className="ml-3 mt-3 rounded-xl border-2 border-cyan-600 bg-cyan-50 p-3"><Button variant="secondary" aria-pressed={selected === 'dl'} onClick={() => setSelected('dl')}>{items[2].name}</Button></div>
      </div>
    </div>
    <p aria-live="polite">{items.find(item => item.id === selected)!.detail}</p>
    <div className="grid gap-3 sm:grid-cols-3">{[
      ['데이터', '모델에 보여 주는 고양이·강아지 사진'],
      ['모델의 예측', '사진을 보고 계산한 “고양이”라는 결과'],
      ['정답 레이블', '사람이 확인한 “강아지”라는 정답 정보'],
    ].map(([title, detail]) => <p key={title} className="rounded-lg bg-white p-3"><strong className="block">{title}</strong>{detail}</p>)}</div>
  </Box></>
}
const featureOptions = [
  ['ears', '귀의 전체 모양'], ['face', '얼굴 윤곽'], ['muzzle', '주둥이 형태'], ['wall', '사진 뒤 벽의 색'], ['filename', '파일 이름의 cat'], ['tail', '꼬리의 순간적인 위치'],
] as const
function FeatureSelection({ page, answers, change }: Props) {
  const [background, setBackground] = useState(false)
  const task = page.tasks[0]
  const selected = (answers[task.id]?.value ?? '').split(',').filter(Boolean)
  const toggle = (id: string) => change(task.id, { value: (selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]).sort().join(','), submitted: false })
  return <div className="grid gap-4">
    <Box title="사진에서 무엇을 살펴보면 좋을까요?">
      <div className="grid items-center gap-4 sm:grid-cols-2">
        <figure>
          <svg viewBox="0 0 300 220" className="w-full max-w-sm rounded-xl" role="img" aria-label="배경만 바꾸어도 귀, 얼굴 윤곽, 주둥이는 같은 고양이 개념 그림">
            <rect width="300" height="220" fill={background ? '#dcfce7' : '#dbeafe'} />
            <path d="M90 92 L82 32 L133 63 M167 63 L218 32 L210 92" fill="#d6a267" stroke="#6b4423" strokeWidth="3" />
            <ellipse cx="150" cy="118" rx="77" ry="64" fill="#e5bb85" stroke="#6b4423" strokeWidth="3" />
            <circle cx="121" cy="111" r="5" /><circle cx="179" cy="111" r="5" />
            <ellipse cx="150" cy="139" rx="30" ry="20" fill="#fff4df" /><path d="M142 133 L158 133 L150 142 Z" fill="#805044" />
            <text x="150" y="207" textAnchor="middle" fontSize="16">같은 고양이 · 배경만 변경</text>
          </svg>
          <figcaption className="mt-2">모델을 실행한 결과가 아닌 특징 비교용 그림입니다.</figcaption>
        </figure>
        <div><Button variant="secondary" onClick={() => setBackground(value => !value)}>배경색 바꿔 관찰하기</Button><p className="mt-3">대상 자체의 특징은 배경이 바뀌어도 남습니다. 한 가지 단서만으로 모든 고양이를 구별할 수 있는 것은 아닙니다.</p></div>
      </div>
      <fieldset id={`task-${task.id}`} className="min-w-0">
        <legend className="mb-3 font-bold">{task.prompt}</legend>
        <div className="grid gap-2 sm:grid-cols-2">{featureOptions.map(([id, label]) => <Button key={id} variant="secondary" aria-pressed={selected.includes(id)} className={`justify-start text-left ${selected.includes(id) ? 'border-indigo-600 bg-indigo-50' : ''}`} onClick={() => toggle(id)}>{selected.includes(id) ? '✓ ' : ''}{label}</Button>)}</div>
        <p className="my-3">{selected.length}/3개 선택</p>
        <Button disabled={selected.length !== 3} onClick={() => change(task.id, { value: selected.sort().join(','), submitted: true })}>특징 선택 제출</Button>
        <div className="mt-3"><Status task={task} response={answers[task.id]} /></div>
      </fieldset>
      <p>파일 이름은 사진 속 특징이 아닙니다. 정답 이름을 입력에 넣으면 새로운 파일에서는 사라질 단서에 의존할 수 있습니다.</p>
    </Box>
    <Question task={page.tasks[1]} response={answers[page.tasks[1].id]} onChange={response => change(page.tasks[1].id, response)} />
  </div>
}
function ExtractionComparison() {
  const [side, setSide] = useState(0)
  return <Box title="같은 이미지에서 유용한 정보를 얻는 두 방식">
    <figure className="grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <svg viewBox="0 0 300 250" className="mx-auto w-full max-w-sm rounded-xl" role="img" aria-label="두 방식에 같은 고양이 그림을 입력합니다. 사람의 특징 설계에서는 1번 귀의 모양과 2번 주둥이 형태처럼 관찰 기준을 정합니다.">
        <rect width="300" height="250" rx="12" fill="#f1f5f9" />
        <path d="M90 92 L82 32 L133 63 M167 63 L218 32 L210 92" fill="#d6a267" stroke="#6b4423" strokeWidth="3" />
        <ellipse cx="150" cy="118" rx="77" ry="64" fill="#e5bb85" stroke="#6b4423" strokeWidth="3" />
        <circle cx="121" cy="111" r="5" /><circle cx="179" cy="111" r="5" />
        <ellipse cx="150" cy="139" rx="30" ry="20" fill="#fff4df" /><path d="M142 133 L158 133 L150 142 Z" fill="#805044" />
        <rect x="74" y="24" width="66" height="72" rx="5" fill="none" stroke={side === 0 ? '#4338ca' : '#64748b'} strokeWidth={side === 0 ? '3' : '1'} strokeDasharray={side === 0 ? undefined : '4 4'} />
        <rect x="115" y="116" width="70" height="48" rx="5" fill="none" stroke={side === 0 ? '#b45309' : '#64748b'} strokeWidth={side === 0 ? '3' : '1'} strokeDasharray={side === 0 ? undefined : '4 4'} />
        <text x="55" y="43" fontSize="19" fontWeight="bold" fill="#4338ca">①</text>
        <text x="194" y="145" fontSize="19" fontWeight="bold" fill="#b45309">②</text>
        <text x="150" y="211" textAnchor="middle" fontSize="16">공통 입력 · 같은 고양이 그림</text>
        <text x="150" y="235" textAnchor="middle" fontSize="15">① 귀의 모양 · ② 주둥이 형태</text>
      </svg>
      <figcaption className="leading-7">두 방식 모두 같은 이미지로 종류를 판단합니다. 이 기계학습 예에서는 사람이 <strong>무엇을 측정할지</strong> 정하고, 딥러닝에서는 여러 층이 <strong>어떤 표현을 사용할지</strong>도 학습합니다.</figcaption>
    </figure>
    <div className="grid gap-3 sm:grid-cols-2">{[
      { title: '일반적인 기계학습', flow: ['① 귀의 가로·세로 비율, ② 주둥이 길이처럼 사람이 측정 기준을 정합니다.', '기준에 따라 얻은 특징값을 모델에 제공합니다.', '모델은 특징값과 정답의 관계를 학습해 새 이미지의 종류를 예측합니다.'] },
      { title: '딥러닝', flow: ['이미지의 숫자를 여러 층의 신경망에 제공합니다.', '앞 층의 출력을 다음 층에서 조합하며 유용한 표현을 만듭니다.', '예측과 정답을 비교해 여러 층의 값을 조정하며, 표현과 판단을 함께 학습합니다.'] },
    ].map((item, index) => <section key={item.title} className={`rounded-xl border-2 p-3 ${side === index ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white'}`}>
      <Button variant="secondary" aria-pressed={side === index} onClick={() => setSide(index)}>{item.title} 살펴보기</Button>
      {index === 0 ? <div className="mt-3 rounded-lg bg-white p-3" aria-label="사람이 정한 특징의 대응">
        <div className="grid gap-2"><p className="rounded-lg border-2 border-indigo-500 p-2"><strong>① 귀 그림</strong> → 귀의 비율</p><p className="rounded-lg border-2 border-amber-600 p-2"><strong>② 주둥이 그림</strong> → 주둥이 길이</p></div>
        <p className="mt-2 text-center">↓</p><p className="rounded-lg bg-slate-100 p-2 text-center">[귀 비율, 주둥이 길이, …]<br />사람이 정한 기준으로 얻은 특징값</p>
      </div> : <figure className="mt-3 rounded-lg bg-white p-3">
        <p className="font-bold">작은 단서를 반영한 표현</p>
        <svg viewBox="0 0 270 100" className="mt-2 w-full" role="img" aria-label="같은 고양이 그림의 숫자에서 활용할 수 있는 밝기 차, 짧은 선, 곡선의 개념 예시">
          {[12, 102, 192].map(x => <rect key={x} x={x} y="6" width="66" height="60" rx="5" fill="#f8fafc" stroke="#94a3b8" />)}
          {[0,1,2].flatMap(row => [0,1,2].map(col => <rect key={`${row}-${col}`} x={20 + col * 17} y={12 + row * 17} width="15" height="15" fill={['#334155', '#94a3b8', '#e2e8f0'][col]} />))}
          <path d="M112 54L126 15 M139 56L160 25" stroke="#4338ca" strokeWidth="5" strokeLinecap="round" />
          <path d="M202 48Q223 9 248 39 M207 55Q224 35 250 50" fill="none" stroke="#b45309" strokeWidth="4" strokeLinecap="round" />
          <text x="45" y="91" textAnchor="middle" fontSize="16">밝기 차</text><text x="135" y="91" textAnchor="middle" fontSize="16">짧은 선</text><text x="225" y="91" textAnchor="middle" fontSize="16">곡선</text>
        </svg>
        <p className="text-center" aria-hidden="true">↓</p>
        <p className="font-bold">여러 단서를 조합한 표현</p>
        <svg viewBox="0 0 270 100" className="mt-2 w-full" role="img" aria-label="짧은 선과 곡선을 함께 조합해 더 넓은 모양을 표현하는 개념 예시">
          <rect x="12" y="6" width="246" height="88" rx="8" fill="#f8fafc" stroke="#94a3b8" />
          <path d="M67 66Q45 48 69 26L91 44 M179 44L201 26Q225 48 203 66" fill="none" stroke="#4338ca" strokeWidth="4" strokeLinecap="round" />
          <path d="M69 66Q135 108 201 66 M91 44Q135 16 179 44 M112 66Q135 46 158 66" fill="none" stroke="#b45309" strokeWidth="4" strokeLinecap="round" />
          <path d="M121 72L135 80L149 72" fill="none" stroke="#0e7490" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <figcaption className="mt-2 text-center">단서의 조합 → 고양이·강아지 등의 종류 판단</figcaption>
        <p className="mt-2">입력의 영향을 정하는 가중치를 조정하며, 여러 층에서 예측에 도움이 되는 단서 조합을 배웁니다. 위 무늬는 설명용 예시이며, 각 층이 반드시 정해진 신체 부위를 찾는다는 뜻은 아닙니다.</p>
      </figure>}
      <ol className="mt-3 grid gap-2">{item.flow.map((text, i) => <li key={text} className="rounded-lg bg-white p-2"><span className="font-bold">{i + 1}. </span>{text}</li>)}</ol>
    </section>)}</div>
    <p aria-live="polite">{side === 0 ? '사람이 특징을 설계해도 예측 규칙은 자료로 학습합니다. 기계학습이 특징을 하나만 사용한다는 뜻은 아닙니다.' : '여러 층이 표현을 학습해도 데이터 수집·정답 확인·평가는 사람이 설계해야 합니다.'}</p>
    <p>그림은 두 방식을 비교하는 개념 예시입니다. 앱이 모델을 학습하거나 귀·주둥이를 실제로 인식한 결과는 아닙니다.</p>
  </Box>
}
function SelectionForm({ page, answers, change, title, groups }: Props & { title: string; groups: { heading: string; detail?: string; tasks: Task[] }[] }) {
  const ready = page.tasks.every(task => !!answers[task.id]?.value)
  const done = page.tasks.every(task => correct(task, answers[task.id]))
  return <Box title={title}>
    {groups.map(group => <section key={group.heading} className="min-w-0 rounded-xl border border-slate-300 bg-white p-3">
      <h4 className="font-bold">{group.heading}</h4>{group.detail && <p className="mt-2">{group.detail}</p>}
      <div className="mt-3 grid gap-4">{group.tasks.map(task => <div key={task.id} id={`task-${task.id}`}>
        <label className="grid gap-2 font-semibold">{task.prompt}
          <select className="min-h-12 w-full min-w-0 rounded-lg border border-slate-400 bg-white p-2 font-normal" value={answers[task.id]?.value ?? ''} disabled={correct(task, answers[task.id])} onChange={event => change(task.id, { value: event.target.value, submitted: false })}>
            <option value="">선택해 주세요</option>{task.options!.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        {answers[task.id]?.submitted && <div className="mt-2"><Status task={task} response={answers[task.id]} /></div>}
      </div>)}</div>
    </section>)}
    <Button disabled={!ready || done} onClick={() => page.tasks.forEach(task => {
      if (!correct(task, answers[task.id])) change(task.id, { value: answers[task.id].value, submitted: true })
    })}>{done ? '모든 선택을 맞게 제출했습니다' : `${title} 제출`}</Button>
    <p aria-live="polite">{done ? '정답 항목은 유지됩니다. 아래 STEP 이동으로 학습을 이어가세요.' : !ready ? '아직 고르지 않은 항목을 선택해 주세요.' : '한 번에 제출하며, 틀린 항목만 고쳐 다시 제출할 수 있습니다.'}</p>
  </Box>
}
function LearningCycle() {
  const [part, setPart] = useState(0)
  const stages = [
    ['학습', '학습 사진 → 예측 → 실제 레이블과 비교 → 모델 조정', '비교할 정답은 유지합니다. 가중치와 편향처럼 학습으로 바꾸는 값을 파라미터라고 합니다. 방금 살펴본 수정 규칙도 이 값들을 조정하는 한 방법입니다.'],
    ['예측', '새 사진 → 학습한 모델 → 예측한 종류', '학습한 모델을 사용하는 단계입니다. 예측할 때마다 정답을 알려 주거나 자동으로 학습하는 것은 아닙니다.'],
    ['평가', '학습에 쓰지 않은 사진의 예측 ↔ 실제 레이블', '새 자료에서도 잘 작동하는지 확인합니다. 학습한 사진을 잘 맞힌 것만으로 판단하지 않습니다.'],
  ]
  return <Box title="학습·예측·평가는 서로 다른 일입니다">
    <div className="flex flex-wrap gap-2">{stages.map(([name], index) => <Button key={name} variant="secondary" aria-pressed={part === index} onClick={() => setPart(index)}>{name}</Button>)}</div>
    <p className="rounded-xl bg-white p-3 font-semibold">{stages[part][1]}</p>
    <p aria-live="polite">{stages[part][2]}</p>
    <p>가중치는 입력의 영향, 편향은 판단 기준을 조절하는 값입니다. 학습에서는 이 값들을 고치며 실제 정답은 바꾸지 않습니다.</p>
  </Box>
}
function NeuronFlow({ worked = false, productReady = false, sumReady = false }: { worked?: boolean; productReady?: boolean; sumReady?: boolean }) {
  const [selected, setSelected] = useState(0)
  const marker = useId()
  const result = calculate(baseline)
  const parts = [
    { title: '입력 x', value: 'x₁=2, x₂=3', detail: '판단할 대상에서 받은 두 숫자입니다.' },
    { title: '가중치 w와 곱셈', value: `2×0.5=${number(result.products[0])}, 3×(−0.2)=${productReady ? number(result.products[1]) : '?'}`, detail: worked ? '가중치는 입력의 영향 크기와 방향을 조절합니다. 첫 곱은 안내로 보고, 두 번째 곱은 아래에서 직접 계산하세요.' : '가중치는 입력의 영향 크기와 방향을 조절합니다. 음수 가중치는 해당 입력이 커질수록 합을 낮춥니다.' },
    { title: '합산과 편향 b', value: `${sumReady ? number(result.productSum) : '두 곱의 합 ?'} + 0.1 = ${productReady && sumReady ? number(result.z) : 'z'}`, detail: '편향은 곱의 합에 한 번 더해 판단 기준을 옮깁니다. 이 결과가 가중합 z입니다.' },
    { title: '활성화 함수', value: 'z≥0 → 1, z<0 → 0', detail: '가중합을 출력으로 바꾸는 규칙입니다. 이 차시의 계단 함수는 0을 기준으로 비교합니다.' },
    { title: '출력 ŷ', value: productReady && sumReady ? `${number(result.z)}≥0 → 출력 ${result.output}` : 'z를 0과 비교 → 출력', detail: '여기서 0·1은 두 상태의 판단 결과이며, 확률 0%·100%라는 뜻은 아닙니다.' },
  ]
  return <Box title={worked ? '같은 두 입력을 숫자로 따라가세요' : '여러 신호를 받아 하나의 판단으로'}>
    {!worked && <><p>생물학적 뉴런은 여러 신호를 받아 다른 뉴런으로 전달합니다. 이런 정보 전달에서 착안한 계산 단위가 인공 뉴런이며, <strong>퍼셉트론</strong>은 그 기본 모형입니다.</p>
      <figure className="grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"><img src={`${import.meta.env.BASE_URL}images/foundations/neuron-inspiration-v1.png`} alt="여러 가지돌기를 통해 신호를 받아 하나의 축삭을 따라 다른 뉴런으로 전달하는 신경 세포의 개념 삽화" className="mx-auto h-auto w-full max-w-[400px] rounded-xl" /><figcaption>여러 신호를 받기 → 모아서 반응하기 → 다음으로 전달하기. 아래 인공 뉴런은 이 생각을 숫자 계산으로 단순화한 것이며, 실제 신경 세포를 그대로 재현하지는 않습니다.</figcaption></figure>
    </>}
    <p>먼저 출력 규칙을 확인하세요. 이 계단 함수는 가중합이 0 이상이면 1, 0보다 작으면 0을 내보냅니다.</p>
    <figure className="min-w-0">
      <div role="region" aria-label="퍼셉트론 입력과 계산 그림 가로 스크롤" tabIndex={0} className="max-w-full overflow-x-auto rounded-xl border border-slate-300 bg-white focus-visible:outline-3 focus-visible:outline-indigo-600">
      <svg viewBox="0 0 900 330" className="w-full min-w-[760px]" role="img" aria-label="두 입력은 각각 가중치와 곱해져 합산점에 모입니다. 곱의 합에 편향을 더해 가중합 z를 만들고 활성화 함수를 거쳐 출력합니다. 번호 1부터 5는 처리 위치입니다.">
        <defs><marker id={marker} markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><path d="M0 0L10 4L0 8Z" fill="#475569" /></marker></defs>
        <rect x="18" y="66" width="116" height="176" rx="16" fill="#ecfeff" stroke={selected === 0 ? '#0e7490' : '#a5f3fc'} strokeWidth="3" />
        <text x="76" y="44" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#0e7490">① 입력</text>
        {[110, 208].map((y, index) => <g key={index}>
          <circle cx="76" cy={y} r="31" fill="white" stroke="#0e7490" strokeWidth="2" />
          <text x="76" y={y + 6} textAnchor="middle" fontSize="19">x{index + 1}{worked ? ` = ${result.inputs[index]}` : ''}</text>
          <path d={`M108 ${y}H273L333 159`} fill="none" stroke={selected === 1 ? '#b45309' : '#64748b'} strokeWidth={selected === 1 ? 4 : 2} markerEnd={`url(#${marker})`} />
          <rect x="151" y={y - 42} width="126" height="34" rx="6" fill="#fffbeb" />
          <text x="214" y={y - 19} textAnchor="middle" fontSize="18" fill="#92400e">w{index + 1}{worked ? ` = ${number(result.weights[index])}` : '를 곱함'}</text>
          {worked && <text x="214" y={y + 29} textAnchor="middle" fontSize="18">{result.inputs[index]}×({number(result.weights[index])})</text>}
        </g>)}
        <text x="214" y="44" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#92400e">② 가중치</text>
        <circle cx="355" cy="159" r="31" fill="#fffbeb" stroke={selected === 2 ? '#b45309' : '#d97706'} strokeWidth="3" />
        <text x="355" y="168" textAnchor="middle" fontSize="30">Σ</text>
        <text x="355" y="223" textAnchor="middle" fontSize="18">곱의 합{worked && sumReady ? ` ${number(result.productSum)}` : ''}</text>
        <path d="M389 159H440" fill="none" stroke="#475569" strokeWidth="2" markerEnd={`url(#${marker})`} />
        <circle cx="466" cy="159" r="25" fill="#fffbeb" stroke="#d97706" strokeWidth="2" /><text x="466" y="167" textAnchor="middle" fontSize="28">+</text>
        <rect x="418" y="55" width="96" height="39" rx="8" fill="#fff7ed" stroke="#c2410c" strokeWidth="2" />
        <text x="466" y="80" textAnchor="middle" fontSize="18">b{worked ? ' = 0.1' : ' 편향'}</text><path d="M466 95V130" stroke="#475569" strokeWidth="2" markerEnd={`url(#${marker})`} />
        <text x="441" y="28" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#92400e">③ 합산 + 편향</text>
        <path d="M492 159H592" fill="none" stroke="#475569" strokeWidth="2" markerEnd={`url(#${marker})`} /><text x="544" y="142" textAnchor="middle" fontSize="19">z{worked && productReady && sumReady ? `=${number(result.z)}` : ''}</text>
        <rect x="596" y="106" width="130" height="106" rx="15" fill="#eef2ff" stroke={selected === 3 ? '#4338ca' : '#a5b4fc'} strokeWidth="3" />
        <text x="661" y="139" textAnchor="middle" fontSize="21" fontWeight="bold">f(z)</text><text x="661" y="169" textAnchor="middle" fontSize="18">z ≥ 0 → 1</text><text x="661" y="195" textAnchor="middle" fontSize="18">z &lt; 0 → 0</text>
        <text x="661" y="44" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#4338ca">④ 활성화</text>
        <path d="M730 159H782" fill="none" stroke="#475569" strokeWidth="2" markerEnd={`url(#${marker})`} />
        <circle cx="824" cy="159" r="39" fill="#ecfdf5" stroke={selected === 4 ? '#047857' : '#6ee7b7'} strokeWidth="3" /><text x="824" y="167" textAnchor="middle" fontSize="21">ŷ{worked && productReady && sumReady ? ` = ${result.output}` : ''}</text>
        <text x="824" y="44" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#047857">⑤ 출력</text>
        <text x="450" y="287" textAnchor="middle" fontSize="18">입력의 전달과, 다음 뉴런 안에서 수행하는 가중합·활성화 계산을 구별하세요.</text>
        <text x="450" y="314" textAnchor="middle" fontSize="17">Σ: 곱한 항을 더하는 곳 · b: 한 번 더하는 편향 · ŷ: 최종 판단</text>
      </svg></div>
      <figcaption className="mt-2">모바일에서는 그림 안을 좌우로 움직여 전체 연결을 볼 수 있습니다. 아래 번호로 각 위치의 역할을 확인하세요.</figcaption>
    </figure>
    <div className="flex flex-wrap gap-2" aria-label="퍼셉트론 처리 위치 선택">{parts.map((part, index) => <Button key={part.title} variant={selected === index ? 'primary' : 'secondary'} aria-pressed={selected === index} onClick={() => setSelected(index)}>{index + 1}. {part.title}</Button>)}</div>
    <p aria-live="polite"><strong>{parts[selected].title}: </strong>{parts[selected].detail}</p>
    <div className="rounded-xl border border-indigo-200 bg-white p-3 leading-7">
      <p>x는 입력, w는 가중치, b는 편향입니다. 번호 i는 연결을 구별하고, n은 입력 수입니다. z는 가중합, f는 활성화 함수, ŷ는 출력입니다.</p>
      <MathExpression formula={String.raw`z=\sum_{i=1}^{n}w_i x_i+b \qquad \hat y=f(z)`} />
      <MathExpression formula={String.raw`f(z)=\begin{cases}1 & z\geq0 \\0 & z<0\end{cases}`} />
      {worked ? <><p>그림의 두 입력에 해당하는 숫자 대입입니다.</p><MathExpression formula={String.raw`z=2\times0.5+3\times(-0.2)+0.1${productReady && sumReady ? `=${number(result.z)}` : ''}`} />
      <p>{productReady && sumReady ? `가중합 ${number(result.z)}는 0 이상이므로 계단 출력은 ${result.output}입니다.` : '첫 곱 2×0.5=1은 안내입니다. 아래 두 중간값을 맞게 제출하면 최종 결과를 연결해 볼 수 있습니다.'}</p></> : <p>가중치·편향은 학습으로 조정하는 파라미터입니다. 다음 STEP에서는 같은 구조에 실제 숫자를 넣습니다.</p>}
    </div>
  </Box>
}
function ObserveChange({ page, answers, change }: Props) {
  const task = page.tasks[0]
  const response = answers[task.id]
  const plan = read<Plan>(response?.value, initialPlan)
  const edit = (patch: Partial<Plan>) => change(task.id, { value: JSON.stringify({ ...plan, ...patch }), submitted: false })
  const before = calculate(baseline)
  const after = calculate({ ...baseline, [plan.key]: plan.candidate })
  return <div className="grid gap-4">
    <Box title="바꾸기 전 예상 → 실제 계산 비교">
      <p>입력 (2, 3), 현재 w₁=0.5, w₂=−0.2, b=0.1입니다. 현재 출력은 {before.output}입니다.</p>
      <MathExpression formula={String.raw`z=2\times0.5+3\times(-0.2)+0.1=${number(before.z)}`} />
      <fieldset id={`task-${task.id}`} className="grid min-w-0 gap-3">
        <legend className="mb-3 font-bold">{task.prompt}</legend>
        <label className="grid gap-1">바꿀 값<select className="min-h-12 min-w-0 rounded-lg border p-2" value={plan.key} onChange={event => {
          const key = event.target.value as Plan['key']
          edit({ key, candidate: Math.min(1, baseline[key] + .1), prediction: '' })
        }}><option value="w1">가중치 w₁</option><option value="w2">가중치 w₂</option><option value="b">편향 b</option></select></label>
        <label className="grid gap-1">변경할 값: {number(plan.candidate)}
          <input aria-label="관찰할 새 값" className="min-h-11 w-full" type="range" min="-1" max="1" step=".1" value={plan.candidate} onChange={event => edit({ candidate: Number(event.target.value), prediction: '' })} />
        </label>
        <p>다른 조건은 그대로일 때, 새 가중합 z는 현재보다 어떻게 될까요?</p>
        <div className="flex flex-wrap gap-2">{[['increase', '커집니다'], ['decrease', '작아집니다'], ['same', '같습니다']].map(([id, label]) => <Button key={id} variant="secondary" aria-pressed={plan.prediction === id} onClick={() => edit({ prediction: id })}>{label}</Button>)}</div>
        <Button disabled={!plan.prediction || plan.candidate === baseline[plan.key]} onClick={() => change(task.id, { value: JSON.stringify(plan), submitted: true })}>예상 제출 후 실제 계산</Button>
        {response?.submitted && <div className="rounded-lg bg-white p-3"><p>변경 후 가중합과 출력</p><MathExpression formula={String.raw`z=${after.inputs.map((x, i) => `${x}\\times(${number(after.weights[i])})`).join('+')}+(${number(after.bias)})=${number(after.z)}`} /><p>계단 출력: <strong>{after.output}</strong></p></div>}
        <Status task={task} response={response} />
      </fieldset>
    </Box>
    <Box title="독립 계산 · 다음 두 문항은 이 고정 조건을 사용합니다">
      <p>입력 (2, 3) · 가중치 (0.5, −0.2) · 편향 −0.5</p>
      <p>위 관찰 슬라이더와 별개입니다. 같은 계산 순서로 가중합과 출력을 직접 구하세요.</p>
      {page.tasks.slice(1).map(item => <Question key={item.id} task={item} response={answers[item.id]} onChange={response => change(item.id, response)} />)}
    </Box>
  </div>
}
function Boundary() {
  const [bias, setBias] = useState(.1)
  const [point, setPoint] = useState([2, 3])
  const result = calculate({ w1: .5, w2: -.2, b: bias }, point)
  // This plotted window uses the same coefficients and threshold as the numeric example.
  const boundary = (x: number) => (.5 * x + bias) / .2
  const px = (x: number) => 40 + x * 60
  const py = (y: number) => 270 - y * 60
  const points = [[0, 0], [1, 1], [2, 3], [3, 1], [4, 4]]
  const candidates = [[0, boundary(0)], [4, boundary(4)], [(-bias) / .5, 0], [(.8 - bias) / .5, 4]].filter(([x, y]) => x >= 0 && x <= 4 && y >= 0 && y <= 4)
  const ends = candidates.filter(([x, y], i) => candidates.findIndex(p => Math.abs(p[0] - x) < 1e-8 && Math.abs(p[1] - y) < 1e-8) === i)
  return <Box title="입력 공간에서 보는 판단 기준">
    <p>점은 두 입력 (x₁, x₂)입니다. 선 위에서는 z=0이고, 선을 넘어 z의 부호가 바뀌면 출력도 달라집니다.</p>
    <div className="grid min-w-0 grid-cols-1 items-start gap-4 sm:grid-cols-2">
      <div role="region" tabIndex={0} aria-label="판단 경계 그림 가로 스크롤" className="min-w-0 max-w-full overflow-x-auto focus-visible:outline-3 focus-visible:outline-indigo-600">
      <svg viewBox="0 0 320 315" className="w-full min-w-[320px] max-w-sm" role="img" aria-label={`가중치 0.5, -0.2인 판단 경계. 선택 입력 ${point.join(', ')}의 가중합 ${number(result.z)}, 출력 ${result.output}`}>
        <path d="M40 20V270H300" fill="none" stroke="#475569" strokeWidth="2" />
        {[0, 1, 2, 3, 4].map(value => <g key={value}><text x={px(value)} y="292" textAnchor="middle" fontSize="15">{value}</text><text x="24" y={py(value) + 5} textAnchor="middle" fontSize="15">{value}</text></g>)}
        {ends.length >= 2 && <line x1={px(ends[0][0])} y1={py(ends[0][1])} x2={px(ends[1][0])} y2={py(ends[1][1])} stroke="#6366f1" strokeWidth="3" />}
        {points.map(([x, y]) => <g key={`${x},${y}`}><circle cx={px(x)} cy={py(y)} r={point[0] === x && point[1] === y ? 9 : 5} fill={point[0] === x && point[1] === y ? '#b45309' : '#64748b'} /><text x={px(x)} y={py(y) - 15} textAnchor="middle" fontSize="14">({x},{y})</text></g>)}
        <text x="292" y="311" fontSize="15">x₁</text><text x="7" y="18" fontSize="15">x₂</text>
      </svg></div>
      <div className="grid min-w-0 grid-cols-1 gap-3">
        <label className="grid gap-1">관찰할 입력
          <select aria-label="판단 경계에서 관찰할 입력" className="min-h-12 w-full rounded-lg border p-2" value={point.join(',')} onChange={event => setPoint(event.target.value.split(',').map(Number))}>{points.map(p => <option key={p.join(',')} value={p.join(',')}>입력 ({p.join(', ')})</option>)}</select>
        </label>
        <label className="grid gap-1">편향 b={number(bias)}<input aria-label="판단 경계의 편향" className="min-h-11 w-full" type="range" min="-1" max="1" step=".1" value={bias} onChange={event => setBias(Number(event.target.value))} /></label>
        <div aria-live="polite"><MathExpression formula={String.raw`z=${point[0]}\times0.5+${point[1]}\times(-0.2)+(${number(bias)})=${number(result.z)}`} /><p>계단 출력: <strong>{result.output}</strong></p></div>
        <p>가중치는 선의 방향에, 편향은 선의 위치에 영향을 줍니다. 조작은 학습 알고리즘이 아니라 사람이 조건을 바꾸는 관찰입니다.</p>
      </div>
    </div>
  </Box>
}
function TargetDesign({ task, response, change, target }: { task: Task; response?: Response; change: Props['change']; target: 0 | 1 }) {
  const fallback = target === 1 ? { ...baseline, b: -.5 } : baseline
  const values = read(response?.value, fallback)
  const result = calculate(values)
  const edit = (key: keyof typeof baseline, value: number) => change(task.id, { value: JSON.stringify({ ...values, [key]: value }), submitted: false })
  return <fieldset id={`task-${task.id}`} className="grid min-w-0 grid-cols-1 gap-3 rounded-xl border border-indigo-200 bg-white p-4">
    <legend className="px-2 font-bold">{task.prompt}</legend>
    <p>입력은 (2, 3)입니다. {target === 1 ? '가중치 (0.5, −0.2)는 고정하고 편향을 정하세요.' : '편향 0.1은 고정하고 두 가중치를 정하세요.'}</p>
    {(target === 1 ? ['b'] as const : ['w1', 'w2'] as const).map(key => <label key={key} className="grid gap-1">{key === 'b' ? '편향 b' : key === 'w1' ? '가중치 w₁' : '가중치 w₂'}: {number(values[key])}
      <input aria-label={`${target === 1 ? '출력 1' : '출력 0'} 설계 ${key}`} className="min-h-11 w-full" type="range" min="-1" max="1" step=".1" value={values[key]} onChange={event => edit(key, Number(event.target.value))} />
    </label>)}
    <div className="rounded-lg bg-slate-50 p-3" aria-live="polite"><MathExpression formula={String.raw`z=2\times(${number(values.w1)})+3\times(${number(values.w2)})+(${number(values.b)})=${number(result.z)}`} /><p>현재 계단 출력 <strong>{result.output}</strong></p></div>
    <Button onClick={() => change(task.id, { value: JSON.stringify(values), submitted: true })}>목표 출력 {target} 설계 제출</Button>
    <Status task={task} response={response} />
  </fieldset>
}
function ClassicalRule({ page, answers, change }: Props) {
  const current = calculate(baseline)
  return <div className="grid gap-4">
    <Box title="정답과 출력의 차이로 수정 방향을 정합니다">
      <p>정답 y=0인데 현재 출력 ŷ={current.output}입니다. 가중합 z={number(current.z)}를 0보다 작게 만드는 방향으로 고쳐야 합니다.</p>
      <div className="grid gap-3 sm:grid-cols-3">{[
        ['정답 1 · 출력 0', 'y−ŷ=+1', '가중합을 높이는 방향'],
        ['정답 0 · 출력 1', 'y−ŷ=−1', '가중합을 낮추는 방향'],
        ['정답과 출력이 같음', 'y−ŷ=0', '이번에는 수정하지 않음'],
      ].map(([condition, difference, meaning]) => <p key={condition} className={`rounded-lg border p-3 ${condition === '정답 0 · 출력 1' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white'}`}><strong className="block">{condition}</strong><span className="block font-mono">{difference}</span>{meaning}</p>)}</div>
      <p>가중치에는 왜 입력 x를 곱할까요? 가중치는 가중합의 <strong>w×x 항</strong>에 들어가기 때문입니다. 양수 입력은 차이의 방향대로, 음수 입력은 반대 방향으로 가중치를 고쳐야 가중합이 원하는 방향으로 바뀝니다. 입력이 0이면 그 연결은 이번 가중합에 영향을 주지 않습니다.</p>
      <p><strong>학습률 η(에타)</strong>는 수정량에 곱하는 배율입니다. η=0.1은 차이와 입력으로 정한 수정량을 0.1배로 적용한다는 뜻이지, 모든 가중치를 항상 0.1씩 바꾼다는 뜻은 아닙니다.</p>
      <div className="rounded-lg bg-white p-3">
        <MathExpression formula={String.raw`w_i^{new}=w_i^{old}+\eta(y-\hat y)x_i`} />
        <MathExpression formula={String.raw`b^{new}=b^{old}+\eta(y-\hat y)`} />
        <p>old는 수정 전, new는 수정 후 값입니다. 이번 연결의 대입식은 다음과 같습니다.</p>
        <MathExpression formula={String.raw`w_1^{new}=0.5+0.1\times(0-1)\times2`} />
        <p>편향은 입력과 곱하지 않고 더하는 값이므로 수정식에도 x를 곱하지 않습니다.</p>
      </div>
    </Box>
    <Questions page={page} answers={answers} change={change} />
  </div>
}
export function Basics01_02(props: Props) {
  const { page, answers, change } = props
  if (page.experience === '01-intro') return <div className="grid gap-4"><AiRelations /><Questions {...props} /></div>
  if (page.experience === '01-features') return <FeatureSelection {...props} />
  if (page.experience === '01-extraction') return <div className="grid gap-4"><ExtractionComparison /><Questions {...props} /></div>
  if (page.experience === '01-extraction-features') return <div className="grid gap-4"><ExtractionComparison /><Question task={page.tasks[0]} response={answers[page.tasks[0].id]} onChange={response => change(page.tasks[0].id, response)} /><FeatureSelection {...props} page={{ ...page, tasks: page.tasks.slice(1) }} /></div>
  if (page.experience === '01-method') return <SelectionForm {...props} title="방법과 근거" groups={[
    { heading: 'A. 소규모 표 데이터', detail: '사람이 측정한 특징으로 비교적 단순한 패턴을 예측합니다.', tasks: page.tasks.slice(0, 2) },
    { heading: 'B. 많은 이미지', detail: '복잡한 시각 패턴을 여러 층에서 표현으로 학습하려고 합니다.', tasks: page.tasks.slice(2, 4) },
    { heading: 'C. 조건이 명확한 자동 처리', detail: '예외가 거의 없고 처리 조건이 완전히 정해져 있습니다.', tasks: page.tasks.slice(4, 6) },
  ]} />
  if (page.experience === '01-cycle') return <div className="grid gap-4"><LearningCycle /><Questions {...props} /></div>
  if (page.experience === '01-project') return <SelectionForm {...props} title="분리수거 AI 설계" groups={page.tasks.map((task, index) => {
    const heading = task.id.endsWith('project-data-v5') ? '수집할 데이터'
      : task.id.endsWith('project-label-v5') ? '정답 레이블'
        : task.id.endsWith('project-evaluate-v5') ? '평가 방법' : '사용할 때의 한계'
    return { heading: `${index + 1}. ${heading}`, tasks: [task] }
  })} />
  if (page.experience === '02-intro') return <div className="grid gap-4"><NeuronFlow /><Questions {...props} /></div>
  if (page.experience === '02-guided') return <div className="grid gap-4"><NeuronFlow worked productReady={correct(page.tasks[0], answers[page.tasks[0].id])} sumReady={correct(page.tasks[1], answers[page.tasks[1].id])} /><Questions {...props} /></div>
  if (page.experience === '02-observe') return <ObserveChange {...props} />
  if (page.experience === '02-rule') return <ClassicalRule {...props} />
  if (page.experience === '01-rule-cycle') return <div className="grid gap-4"><ClassicalRule {...props} page={{ ...page, tasks: page.tasks.slice(0, 3) }} /><LearningCycle /><Question task={page.tasks[3]} response={answers[page.tasks[3].id]} onChange={response => change(page.tasks[3].id, response)} /></div>
  if (page.experience === '02-ann') return <LayersConcept mode="overview" />
  if (page.experience === '02-layers') return <LayersConcept mode="roles" />
  if (page.experience === '02-depth') return <LayersConcept mode="depth" />
  if (page.experience === '02-boundary') return <div className="grid gap-4"><Boundary /><Questions {...props} /><LayersConcept mode="comparison" /></div>
  if (page.experience === '02-target') return <div className="grid gap-4">{page.tasks.map((task, index) => <TargetDesign key={task.id} task={task} response={answers[task.id]} change={change} target={index === 0 ? 1 : 0} />)}<p className="leading-7">목표를 만족하는 설정은 하나만 있는 것이 아닙니다. 실제 가중합이 기준을 만족하는지로 설계를 확인합니다. 다음 차시에서는 같은 가중합을 다른 규칙으로 바꾸는 함수를 배웁니다.</p></div>
  return <><ConceptView page={page} /><Questions {...props} /></>
}
