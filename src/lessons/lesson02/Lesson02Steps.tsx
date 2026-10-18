import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  CheckCircle2,
  Circle,
  CircleHelp,
  RotateCcw,
  XCircle,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { NeuronIntroduction, PerceptronWalkthrough } from './PerceptronExplanation'
import { lesson02Objectives, lesson02StepTitles } from './lesson02Data'
import {
  calculatePerceptronN,
  classifyPoint,
  formatNumber,
  getBoundarySegment,
  isCloseNumber,
  parseStudentNumber,
  type PerceptronInput,
} from './perceptronMath'

interface CommonStepProps {
  active: boolean
  isComplete: boolean
  onComplete: () => void
}

interface StepFrameProps extends CommonStepProps {
  step: number
  intro: string
  children: ReactNode
}

function StepFrame({ step, intro, active, isComplete, children }: StepFrameProps) {
  const titleId = active ? 'lesson-step-title' : `lesson02-step-${step}-title`
  return (
    <Card as="section" hidden={!active} aria-labelledby={titleId} className="overflow-hidden">
      <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-50 via-white to-cyan-50 px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-black tracking-[0.15em] text-indigo-700">STEP {step}</span>
          <span className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm font-bold ${isComplete ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>
            {isComplete ? <CheckCircle2 size={17} aria-hidden="true" /> : <Circle size={14} aria-hidden="true" />}
            {isComplete ? '활동 완료' : '활동 필요'}
          </span>
        </div>
        <h2 id={titleId} tabIndex={active ? -1 : undefined} className="step-focus-target mt-4 text-2xl font-black leading-snug tracking-tight text-slate-950 focus:outline-none sm:text-3xl">{lesson02StepTitles[step - 1]}</h2>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{intro}</p>
      </div>
      <div className="px-5 py-7 sm:px-8 sm:py-9">{children}</div>
    </Card>
  )
}

function Completion({ children }: { children: ReactNode }) {
  return <div className="mt-7 flex items-start gap-3 border-t border-emerald-200 pt-5 text-emerald-900" role="status"><CheckCircle2 className="mt-0.5 shrink-0" size={21} aria-hidden="true" /><p className="font-semibold leading-7">{children}</p></div>
}

function Feedback({ correct, children }: { correct: boolean; children: ReactNode }) {
  return <div className={`mt-4 flex items-start gap-3 rounded-xl p-4 ${correct ? 'bg-emerald-50 text-emerald-950' : 'bg-rose-50 text-rose-950'}`} role="status" aria-live="polite">{correct ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={21} aria-hidden="true" /> : <XCircle className="mt-0.5 shrink-0 text-rose-600" size={21} aria-hidden="true" />}<div><p className="font-black">{correct ? '정답입니다' : '다시 살펴보세요'}</p><div className="mt-1 leading-6">{children}</div></div></div>
}

function NumberField({ id, label, value, onChange, state }: { id: string; label: string; value: string; onChange: (value: string) => void; state?: 'correct' | 'wrong' }) {
  const messageId = `${id}-message`
  return <label htmlFor={id} className="block"><span className="mb-2 block text-sm font-bold text-slate-700">{label}</span><span className="relative block"><input id={id} type="text" inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={state === 'wrong' || undefined} aria-describedby={state ? messageId : undefined} className={`min-h-12 w-full rounded-xl border bg-white px-4 pr-11 text-lg font-black tabular-nums text-slate-950 outline-none focus:ring-3 ${state === 'correct' ? 'border-emerald-500 focus:ring-emerald-100' : state === 'wrong' ? 'border-rose-500 focus:ring-rose-100' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'}`} />{state === 'correct' ? <CheckCircle2 className="absolute right-3 top-3 text-emerald-600" size={22} aria-hidden="true" /> : state === 'wrong' ? <XCircle className="absolute right-3 top-3 text-rose-600" size={22} aria-hidden="true" /> : null}</span>{state ? <span id={messageId} className={`mt-1.5 block text-sm font-semibold ${state === 'correct' ? 'text-emerald-700' : 'text-rose-700'}`}>{state === 'correct' ? '✓ 계산이 맞습니다.' : '✕ 이 단계의 계산을 다시 확인하세요.'}</span> : null}</label>
}

function ChoiceButtons<T extends string>({ value, options, onChange }: { value: T | null; options: readonly { value: T; label: string }[]; onChange: (value: T) => void }) {
  return <div className="grid gap-3">{options.map((option) => <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)} className={`min-h-12 rounded-xl border px-4 py-3 text-left font-bold leading-6 transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${value === option.value ? 'border-indigo-600 bg-indigo-50 text-indigo-950' : 'border-slate-300 bg-white text-slate-800 hover:border-indigo-300'}`}><span className="flex items-center gap-2">{value === option.value ? <CheckCircle2 size={18} className="shrink-0 text-indigo-600" aria-hidden="true" /> : <Circle size={16} className="shrink-0 text-slate-400" aria-hidden="true" />}{option.label}</span></button>)}</div>
}

const sequenceItems = [
  { id: 'input', label: '입력값·가중치 확인' },
  { id: 'multiply', label: '입력값 × 가중치' },
  { id: 'sum', label: '곱한 값을 모두 더하기' },
  { id: 'bias', label: '편향 더하기' },
  { id: 'z', label: '가중합 z' },
  { id: 'activation', label: '활성화 함수' },
  { id: 'output', label: '출력 0 또는 1' },
] as const

const roleItems = [
  { id: 'input', label: '입력값', role: '모델이 받는 정보' },
  { id: 'weight', label: '가중치', role: '입력을 얼마나 중요하게 볼지 정하는 값' },
  { id: 'bias', label: '편향', role: '판단 기준을 이동시키는 값' },
  { id: 'z', label: '가중합 z', role: '활성화 함수에 전달되는 계산 결과' },
  { id: 'activation', label: '활성화 함수', role: '가중합을 최종 출력 형태로 바꾸는 함수' },
] as const

export function Lesson02Step1(props: CommonStepProps) {
  const [order, setOrder] = useState(['input', 'multiply', 'bias', 'sum', 'z', 'output', 'activation'])
  const [roles, setRoles] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const correctOrder = order.every((id, index) => id === sequenceItems[index].id)
  const correctRoles = roleItems.every((item) => roles[item.id] === item.role)
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= order.length) return
    setOrder((current) => { const next = [...current]; [next[index], next[target]] = [next[target], next[index]]; return next })
    setSubmitted(false)
  }
  const submit = () => { setSubmitted(true); if (correctOrder && correctRoles) props.onComplete() }
  return <StepFrame {...props} step={1} intro="설명을 읽은 뒤 계산 순서와 각 요소의 역할을 직접 연결합니다.">
    <NeuronIntroduction />
    <details className="mt-5 rounded-xl border border-slate-200 p-4"><summary className="min-h-11 cursor-pointer py-2 font-black">학습 목표 자세히 보기</summary><ul className="mt-4 grid gap-3 md:grid-cols-2">{lesson02Objectives.map((objective) => <li key={objective} className="rounded-xl bg-slate-50 p-4 font-semibold leading-7 text-slate-700">{objective}</li>)}</ul></details>
    <section className="mt-9" aria-labelledby="sequence-title"><h3 id="sequence-title" className="text-xl font-black">활동 1. 계산 순서 배열</h3><p className="mt-2 leading-7 text-slate-600">위·아래 버튼으로 카드를 옮기세요. 키보드만으로도 조작할 수 있습니다.</p><ol className="mt-4 grid gap-3">{order.map((id, index) => { const item = sequenceItems.find((candidate) => candidate.id === id)!; return <li key={id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-black text-indigo-800">{index + 1}</span><span className="min-w-0 flex-1 font-bold">{item.label}</span><button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`${item.label} 위로 이동`} className="flex size-11 items-center justify-center rounded-xl border border-slate-300 disabled:opacity-35"><ArrowUp size={18} aria-hidden="true" /></button><button type="button" onClick={() => move(index, 1)} disabled={index === order.length - 1} aria-label={`${item.label} 아래로 이동`} className="flex size-11 items-center justify-center rounded-xl border border-slate-300 disabled:opacity-35"><ArrowDown size={18} aria-hidden="true" /></button></li> })}</ol></section>
    <section className="mt-9" aria-labelledby="roles-title"><h3 id="roles-title" className="text-xl font-black">활동 2. 역할 연결</h3><div className="mt-4 grid gap-4 md:grid-cols-2">{roleItems.map((item) => <label key={item.id} className="rounded-xl border border-slate-200 p-4"><span className="block font-black">{item.label}</span><select value={roles[item.id] ?? ''} onChange={(event) => { setRoles((current) => ({ ...current, [item.id]: event.target.value })); setSubmitted(false) }} className="mt-3 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 focus-visible:outline-3 focus-visible:outline-indigo-600"><option value="">역할 선택</option>{roleItems.map((candidate) => <option key={candidate.role} value={candidate.role}>{candidate.role}</option>)}</select></label>)}</div></section>
    <Button className="mt-6" onClick={submit} disabled={Object.keys(roles).length < roleItems.length}>순서와 역할 확인</Button>
    {submitted ? <Feedback correct={correctOrder && correctRoles}>{correctOrder && correctRoles ? '입력부터 출력까지의 순서와 다섯 요소의 역할을 정확히 연결했습니다.' : <><p>{!correctOrder ? '순서 활동에 어긋난 카드가 있습니다. 곱셈 결과를 먼저 모두 더한 뒤 편향을 더하는지 확인하세요.' : '순서는 맞습니다.'}</p><p>{!correctRoles ? '역할 연결을 다시 확인하세요. 가중합은 활성화 함수에 들어가기 직전의 계산값입니다.' : '역할 연결은 맞습니다.'}</p></>}</Feedback> : null}
    {props.isComplete ? <Completion>계산 순서와 각 요소의 역할을 모두 올바르게 연결했습니다.</Completion> : null}
  </StepFrame>
}

const textbookExample: PerceptronInput = { inputs: [4, 5], weights: [1, 1], bias: -10 }
const textbookResult = calculatePerceptronN(textbookExample)
const guidedProblem: PerceptronInput = { inputs: [8, 6], weights: [1, 1], bias: -10 }
const guidedResult = calculatePerceptronN(guidedProblem)

function CalculationFields({ idPrefix, values, onChange, submitted, expected }: { idPrefix: string; values: string[]; onChange: (index: number, value: string) => void; submitted: boolean; expected: readonly number[] }) {
  const labels = ['x1 × w1', 'x2 × w2', ...(expected.length === 6 ? ['x3 × w3'] : []), '곱셈 결과의 합', '편향을 더한 가중합 z', '계단 함수 출력']
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{labels.map((label, index) => { const parsed = parseStudentNumber(values[index] ?? ''); const state = submitted ? (isCloseNumber(parsed, expected[index]) ? 'correct' : 'wrong') : undefined; return <NumberField key={label} id={`${idPrefix}-${index}`} label={label} value={values[index] ?? ''} onChange={(value) => onChange(index, value)} state={state} /> })}</div>
}

export function Lesson02Step2(props: CommonStepProps) {
  const expected = [guidedResult.productSum, guidedResult.z, guidedResult.output]
  const [answers, setAnswers] = useState(['', '', ''])
  const [prediction, setPrediction] = useState<0 | 1 | null>(null)
  const [reason, setReason] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const allCorrect = answers.every((answer, index) => isCloseNumber(parseStudentNumber(answer), expected[index])) && reason === 'sum'
  return <StepFrame {...props} step={2} intro="완성 풀이를 읽고, 같은 가중치·편향에서 입력이 바뀌는 예제의 나머지 계산과 결과 해석을 완성합니다.">{/* Textbook values and answers share the existing calculation function. */}
    <section className="rounded-2xl bg-indigo-50 p-5">
      <h3 className="text-xl font-black">완성 풀이 · 교과서 91쪽</h3>
      <p className="mt-3 font-bold">입력 (4, 5), 가중치 (1, 1), 편향 -10</p>
      <PerceptronWalkthrough result={textbookResult} />
    </section>
    <section className="mt-6 rounded-2xl border border-slate-200 p-5">
      <h3 className="text-xl font-black">풀이 일부 완성 · 입력만 (8, 6)으로 바꾸면?</h3>
      <p className="mt-2 leading-7">가중치 (1, 1)과 편향 -10은 같습니다. 먼저 출력을 예상하세요. 예상이 틀려도 계산 후 수정할 수 있습니다.</p>
      <div className="mt-4"><ChoiceButtons value={prediction === null ? null : String(prediction)} options={[{value:'0',label:'출력 0 예상'},{value:'1',label:'출력 1 예상'}]} onChange={(value) => { setPrediction(Number(value) as 0 | 1); setSubmitted(false) }} /></div>
      <p className="mt-5 rounded-xl bg-slate-100 p-4 font-bold">곱셈 안내: 8 × 1 = {guidedResult.products[0]}, 6 × 1 = {guidedResult.products[1]}</p>
      <fieldset disabled={prediction === null} className="mt-4 grid gap-4 sm:grid-cols-3">
        <legend className="mb-3 font-bold">예상 후 나머지 계산을 완성하세요</legend>
        {['곱셈 결과의 합', '편향을 더한 가중합 z', '계단 함수 출력'].map((label, index) => <NumberField key={label} id={`guided-${index}`} label={label} value={answers[index]} onChange={(value) => { setAnswers((items) => items.map((answer, item) => item === index ? value : answer)); setSubmitted(false) }} state={submitted ? isCloseNumber(parseStudentNumber(answers[index]), expected[index]) ? 'correct' : 'wrong' : undefined} />)}
      </fieldset>
      <fieldset className="mt-5"><legend className="mb-3 font-bold">두 예제에서 출력이 달라지는 이유는?</legend><ChoiceButtons value={reason} options={[{value:'sum',label:'입력이 달라져 편향을 더한 가중합의 부호가 바뀐다.'},{value:'rule',label:'계단 함수의 기준이 예제마다 바뀐다.'}]} onChange={(value) => {setReason(value);setSubmitted(false)}} /></fieldset>
      <Button className="mt-5" disabled={prediction === null || !reason || answers.some((value) => parseStudentNumber(value) === null)} onClick={() => {setSubmitted(true);if(allCorrect)props.onComplete()}}>계산과 해석 제출</Button>
      {submitted && <Feedback correct={allCorrect}>{allCorrect ? `가중합 ${guidedResult.z} → 출력 ${guidedResult.output}. 처음 예상 ${prediction}과 비교해 보세요. 두 예제 모두 같은 계단 함수 기준을 사용합니다.` : <><p>합산 → 편향 -10 추가 → 가중합의 부호 비교 순으로 ✕ 필드를 확인하세요.</p>{reason !== 'sum' && <p>입력이 바뀌어 계산값이 달라졌지만 활성화 함수의 기준은 같습니다.</p>}</>}</Feedback>}
    </section>
    {props.isComplete && <Completion>완성 풀이를 적용해 두 번째 예제의 계산과 출력 변화 이유를 확인했습니다.</Completion>}
  </StepFrame>
}

const independentProblems = [
  { title: '문제 A', input: { inputs: [3, 4], weights: [2, -1], bias: -1 } },
  { title: '문제 B', input: { inputs: [2, 1], weights: [-1, 0.5], bias: 0.5 } },
] as const

export function Lesson02Step3(props: CommonStepProps) {
  const results = independentProblems.map((problem) => calculatePerceptronN(problem.input))
  const expected = results.map((result) => [...result.products, result.productSum, result.z, result.output])
  const [answers, setAnswers] = useState<string[][]>(expected.map((items) => Array(items.length).fill('')))
  const [submitted, setSubmitted] = useState([false, false])
  const correct = answers.map((row, problemIndex) => row.every((answer, index) => isCloseNumber(parseStudentNumber(answer), expected[problemIndex][index])))
  useEffect(() => { if (!props.isComplete && submitted.every(Boolean) && correct.every(Boolean)) props.onComplete() }, [correct, props, submitted])
  return <StepFrame {...props} step={3} intro="완성 풀이 없이 두 입력의 계산을 적용합니다. 먼저 가중합을 구한 뒤, 계단 함수의 기준으로 출력을 판단하세요."><div className="grid gap-6 xl:grid-cols-2">{independentProblems.map((problem, problemIndex) => <section key={problem.title} className="rounded-2xl border border-slate-200 p-5"><h3 className="text-xl font-black">{problem.title}</h3><p className="mt-2 break-words font-mono text-sm leading-7 text-slate-700">입력 [{problem.input.inputs.join(', ')}] · 가중치 [{problem.input.weights.join(', ')}] · 편향 {problem.input.bias}</p><div className="mt-5"><CalculationFields idPrefix={`independent-${problemIndex}`} values={answers[problemIndex]} onChange={(index, value) => { setAnswers((current) => current.map((row, item) => item === problemIndex ? row.map((answer, field) => field === index ? value : answer) : row)); setSubmitted((current) => current.map((submittedValue, item) => item === problemIndex ? false : submittedValue)) }} submitted={submitted[problemIndex]} expected={expected[problemIndex]} /></div><Button className="mt-5 w-full" onClick={() => setSubmitted((current) => current.map((value, item) => item === problemIndex ? true : value))} disabled={answers[problemIndex].some((answer) => parseStudentNumber(answer) === null)}>문제 {problemIndex === 0 ? 'A' : 'B'} 제출</Button>{submitted[problemIndex] ? <Feedback correct={correct[problemIndex]}>{correct[problemIndex] ? `z=${formatNumber(results[problemIndex].z)}, 출력 ${results[problemIndex].output}을 정확히 계산했습니다.` : '✕ 표시가 있는 단계부터 다시 계산하세요. 각 입력에 연결된 가중치를 곱하고 편향을 마지막에 더했는지 확인하세요.'}</Feedback> : null}</section>)}</div>{props.isComplete ? <Completion>출력 0 문제와 출력 1 문제를 모두 독립적으로 계산했습니다.</Completion> : null}</StepFrame>
}

type AdjustableKey = 'x1' | 'x2' | 'w1' | 'w2' | 'b'
type Direction = 'increase' | 'decrease' | 'same'
const adjustableSettings: Array<{ key: AdjustableKey; label: string; min: number; max: number; step: number }> = [
  { key: 'x1', label: '입력값 x1', min: -3, max: 3, step: 0.5 },
  { key: 'x2', label: '입력값 x2', min: -3, max: 3, step: 0.5 },
  { key: 'w1', label: '가중치 w1', min: -3, max: 3, step: 0.5 },
  { key: 'w2', label: '가중치 w2', min: -3, max: 3, step: 0.5 },
  { key: 'b', label: '편향 b', min: -3, max: 3, step: 0.5 },
]
const toInput = (values: Record<AdjustableKey, number>): PerceptronInput => ({ inputs: [values.x1, values.x2], weights: [values.w1, values.w2], bias: values.b })

export function Lesson02Step4(props: CommonStepProps) {
  const initial = { x1: 1, x2: -1, w1: 1, w2: 1, b: -0.5 }
  const [values, setValues] = useState(initial)
  const [key, setKey] = useState<AdjustableKey>('w1')
  const [candidate, setCandidate] = useState(initial.w1)
  const [prediction, setPrediction] = useState<Direction | null>(null)
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null)
  const [observed, setObserved] = useState<string[]>([])
  const [successfulCount, setSuccessfulCount] = useState(0)
  const current = calculatePerceptronN(toInput(values))
  const previewValues = { ...values, [key]: candidate }
  const preview = calculatePerceptronN(toInput(previewValues))
  const ready = ['weight', 'bias', 'boundary'].every((item) => observed.includes(item))
  useEffect(() => { if (!props.isComplete && ready) props.onComplete() }, [props, ready])
  const apply = () => {
    if (!prediction || candidate === values[key]) return
    const direction: Direction = preview.z > current.z ? 'increase' : preview.z < current.z ? 'decrease' : 'same'
    const correct = prediction === direction
    setValues(previewValues)
    setFeedback({ correct, text: `z ${formatNumber(current.z)} → ${formatNumber(preview.z)}, 출력 ${current.output} → ${preview.output}. ${correct ? '예측과 실제 변화가 같습니다.' : '변경한 값이 곱셈과 편향에 어떤 부호로 반영되는지 확인하고 다시 예측해 보세요.'}` })
    if (correct) { setSuccessfulCount((count) => count + 1); setObserved((items) => [...new Set([...items, ...(key.startsWith('w') ? ['weight'] : []), ...(key === 'b' ? ['bias'] : []), ...(current.output !== preview.output ? ['boundary'] : [])])]) }
    setPrediction(null)
  }
  const selectKey = (nextKey: AdjustableKey) => { setKey(nextKey); setCandidate(values[nextKey]); setPrediction(null); setFeedback(null) }
  return <StepFrame {...props} step={4} intro="값을 바꾸기 전에 z의 변화 방향을 먼저 예측한 뒤 실제 계산과 비교합니다."><div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><section className="rounded-2xl border border-slate-200 p-5"><h3 className="text-xl font-black">1. 바꿀 값 선택</h3><label className="mt-4 block"><span className="text-sm font-bold">변수</span><select value={key} onChange={(event) => selectKey(event.target.value as AdjustableKey)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3">{adjustableSettings.map((setting) => <option key={setting.key} value={setting.key}>{setting.label}</option>)}</select></label>{(() => { const setting = adjustableSettings.find((item) => item.key === key)!; return <label className="mt-5 block"><span className="flex justify-between gap-3 font-bold"><span>바꿀 값</span><output className="rounded-lg bg-indigo-50 px-3 py-1 tabular-nums text-indigo-800">{formatNumber(candidate)}</output></span><input className="mt-3 min-h-11 w-full accent-indigo-600" type="range" min={setting.min} max={setting.max} step={setting.step} value={candidate} onChange={(event) => { setCandidate(Number(event.target.value)); setPrediction(null); setFeedback(null) }} /></label> })()}<div className="mt-4 flex flex-wrap gap-2"><Button variant="secondary" onClick={() => setCandidate(Math.min(3, values[key] + 1))}>1 크게</Button><Button variant="secondary" onClick={() => setCandidate(Math.max(-3, values[key] - 1))}>1 작게</Button></div></section><section className="rounded-2xl bg-slate-900 p-5 text-white"><h3 className="text-xl font-black">현재 계산</h3><p className="mt-4 break-words font-mono leading-8">({values.x1}×{values.w1}) + ({values.x2}×{values.w2}) + ({values.b})</p><p className="mt-2 text-lg font-black text-cyan-300">z={formatNumber(current.z)} → 출력 {current.output}</p><p className="mt-4 text-sm leading-6 text-slate-300">음수 입력에 음수 가중치를 곱하면 양수 항이 됩니다. 편향을 늘리면 다른 값이 같을 때 z도 같은 만큼 커집니다.</p></section></div><fieldset className="mt-7"><legend className="text-xl font-black">2. 변경 후 z는?</legend><div className="mt-4 grid gap-3 sm:grid-cols-3">{([{ value: 'increase', label: '커진다' }, { value: 'decrease', label: '작아진다' }, { value: 'same', label: '같다' }] as const).map((option) => <Button key={option.value} variant={prediction === option.value ? 'primary' : 'secondary'} aria-pressed={prediction === option.value} onClick={() => setPrediction(option.value)}>{prediction === option.value ? <Check size={18} aria-hidden="true" /> : null}{option.label}</Button>)}</div><Button className="mt-4" onClick={apply} disabled={!prediction || candidate === values[key]}>예측 제출 후 실제 계산</Button></fieldset>{feedback ? <Feedback correct={feedback.correct}>{feedback.text}</Feedback> : null}<section className="mt-7 rounded-2xl border border-indigo-200 bg-indigo-50 p-5"><h3 className="font-black text-indigo-950">완료 관찰</h3><div className="mt-4 grid gap-3 sm:grid-cols-3">{[['weight', '가중치 변화'], ['bias', '편향 변화'], ['boundary', '출력 0 ↔ 1 변화']].map(([id, label]) => <div key={id} className={`rounded-xl p-4 ${observed.includes(id) ? 'bg-emerald-100 text-emerald-900' : 'bg-white text-slate-700'}`}><p className="font-black">{observed.includes(id) ? '✓' : '○'} {label}</p></div>)}</div><p className="mt-4 font-semibold">맞게 예측한 변화 {successfulCount}회 · 위 세 종류의 관찰이 완료 기준입니다.</p></section><Button className="mt-5" variant="ghost" onClick={() => { setValues(initial); setKey('w1'); setCandidate(initial.w1); setPrediction(null); setFeedback(null); setObserved([]); setSuccessfulCount(0) }}><RotateCcw size={18} aria-hidden="true" />처음부터 다시</Button>{props.isComplete ? <Completion>가중치와 편향의 변화를 예측하고 출력이 바뀌는 경계를 직접 확인했습니다.</Completion> : null}</StepFrame>
}

export function Lesson02Step5(props: CommonStepProps) {
  const [biasOne, setBiasOne] = useState(-2)
  const [weightsZero, setWeightsZero] = useState<[number, number]>([1, 1])
  const biasOptions = [-2.5, -2.1, -2.01, -1.9] as const
  const [smallBias, setSmallBias] = useState<number>(-1.9)
  const [submitted, setSubmitted] = useState([false, false, false])
  const first = calculatePerceptronN({ inputs: [2, 1], weights: [1, -1], bias: biasOne })
  const second = calculatePerceptronN({ inputs: [1, 2], weights: weightsZero, bias: -1 })
  const third = calculatePerceptronN({ inputs: [1, 1], weights: [1, 1], bias: smallBias })
  const validBiases = biasOptions.filter((candidateBias) => calculatePerceptronN({ inputs: [1, 1], weights: [1, 1], bias: candidateBias }).output === 0)
  const smallestChange = Math.min(...validBiases.map((candidateBias) => Math.abs(candidateBias - -2)))
  const correct = [first.output === 1, second.output === 0, third.output === 0 && Math.abs(smallBias - -2) === smallestChange]
  useEffect(() => { if (!props.isComplete && submitted.every(Boolean) && correct.every(Boolean)) props.onComplete() }, [correct, props, submitted])
  const submit = (index: number) => setSubmitted((items) => items.map((value, item) => item === index ? true : value))
  return <StepFrame {...props} step={5} intro="입력은 고정하고 가중치나 편향을 설계해 목표 출력을 만드는 설정을 찾고 가중합으로 이유를 확인합니다."><div className="grid gap-6 xl:grid-cols-3"><section className="rounded-2xl border border-slate-200 p-5"><h3 className="font-black">설계 A · 목표 출력 1</h3><p className="mt-2 text-sm leading-6 text-slate-600">입력 [2,1], 가중치 [1,-1]에서 편향을 고르세요.</p><label className="mt-5 block"><span className="flex justify-between font-bold"><span>편향 b</span><output>{biasOne}</output></span><input className="mt-2 min-h-11 w-full" type="range" min={-3} max={2} step={0.5} value={biasOne} onChange={(event) => { setBiasOne(Number(event.target.value)); setSubmitted((items) => [false, items[1], items[2]]) }} /></label><p className="mt-3 rounded-xl bg-slate-100 p-3 font-mono">z={formatNumber(first.z)} → 출력 {first.output}</p><Button className="mt-4 w-full" onClick={() => submit(0)}>설계 A 확인</Button>{submitted[0] ? <Feedback correct={correct[0]}>{correct[0] ? '실제 z가 0 이상이므로 목표 출력 1을 만들었습니다.' : '현재 z가 0보다 작습니다. 편향을 어느 방향으로 움직이면 z가 커질지 생각해 보세요.'}</Feedback> : null}</section><section className="rounded-2xl border border-slate-200 p-5"><h3 className="font-black">설계 B · 목표 출력 0</h3><p className="mt-2 text-sm leading-6 text-slate-600">입력 [1,2], 편향 -1에서 두 가중치를 고르세요.</p>{(['w1','w2'] as const).map((label, index) => <label key={label} className="mt-4 block"><span className="flex justify-between font-bold"><span>{label}</span><output>{weightsZero[index]}</output></span><input className="mt-2 min-h-11 w-full" type="range" min={-2} max={2} step={0.5} value={weightsZero[index]} onChange={(event) => { const next = [...weightsZero] as [number, number]; next[index] = Number(event.target.value); setWeightsZero(next); setSubmitted((items) => [items[0], false, items[2]]) }} /></label>)}<p className="mt-3 rounded-xl bg-slate-100 p-3 font-mono">z={formatNumber(second.z)} → 출력 {second.output}</p><Button className="mt-4 w-full" onClick={() => submit(1)}>설계 B 확인</Button>{submitted[1] ? <Feedback correct={correct[1]}>{correct[1] ? '실제 계산으로 목표 출력 0을 만들었습니다. 다른 조합도 가능합니다.' : 'z가 아직 0 이상입니다. 양의 입력에 어떤 부호의 가중치를 곱하면 z가 작아지는지 살펴보세요.'}</Feedback> : null}</section><section className="rounded-2xl border border-slate-200 p-5"><h3 className="font-black">설계 C · 가장 작은 편향 변화</h3><p className="mt-2 text-sm leading-6 text-slate-600">현재 b=-2이면 z=0, 출력 1입니다. 출력 0으로 바꾸는 가장 작은 선택지를 고르세요.</p><div className="mt-4 grid grid-cols-2 gap-3">{biasOptions.map((candidateBias) => <Button key={candidateBias} variant={smallBias === candidateBias ? 'primary' : 'secondary'} aria-pressed={smallBias === candidateBias} onClick={() => { setSmallBias(candidateBias); setSubmitted((items) => [items[0], items[1], false]) }}>b={candidateBias}</Button>)}</div><p className="mt-3 rounded-xl bg-slate-100 p-3 font-mono">z={formatNumber(third.z)} → 출력 {third.output}</p><Button className="mt-4 w-full" onClick={() => submit(2)}>설계 C 확인</Button>{submitted[2] ? <Feedback correct={correct[2]}>{correct[2] ? `출력 0을 만들면서 기존 편향과의 차이 ${formatNumber(Math.abs(smallBias + 2))}가 가장 작습니다.` : third.output !== 0 ? 'z=0도 계단 함수에서는 출력 1입니다. z를 0보다 조금 작게 만들어야 합니다.' : '출력 0은 만들었지만 더 작은 편향 변화로도 가능한 선택지가 있습니다.'}</Feedback> : null}</section></div>{props.isComplete ? <Completion>하나로 정해진 답을 외우지 않고 실제 조건식으로 세 목표 출력을 설계했습니다.</Completion> : null}</StepFrame>
}

const boundaryPoints = [
  { id: 'A', x: -2, y: -1, target: 0 as const, shape: 'square' as const },
  { id: 'B', x: -1, y: -2, target: 0 as const, shape: 'square' as const },
  { id: 'C', x: -2, y: 1, target: 0 as const, shape: 'square' as const },
  { id: 'D', x: 1, y: 1, target: 1 as const, shape: 'circle' as const },
  { id: 'E', x: 2, y: 1, target: 1 as const, shape: 'circle' as const },
  { id: 'F', x: 1, y: 2, target: 1 as const, shape: 'circle' as const },
]

export function Lesson02Step6(props: CommonStepProps) {
  const [weights, setWeights] = useState<[number, number]>([1, -1])
  const [bias, setBias] = useState(0)
  const [selectedId, setSelectedId] = useState('A')
  const [prediction, setPrediction] = useState<0 | 1 | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [observedOutputs, setObservedOutputs] = useState<number[]>([])
  const [reason, setReason] = useState<string | null>(null)
  const [reasonSubmitted, setReasonSubmitted] = useState(false)
  const selected = boundaryPoints.find((point) => point.id === selectedId)!
  const pointResult = classifyPoint(selected, weights, bias)
  const segment = getBoundarySegment(weights, bias)
  const ready = observedOutputs.includes(0) && observedOutputs.includes(1) && reasonSubmitted && reason === 'parameters'
  const mapX = (x: number) => 36 + ((x + 3) / 6) * 288
  const mapY = (y: number) => 324 - ((y + 3) / 6) * 288
  useEffect(() => { if (!props.isComplete && ready) props.onComplete() }, [props, ready])
  const clearPrediction = () => { setPrediction(null); setSubmitted(false); setReasonSubmitted(false) }
  const selectPoint = (id: string) => { setSelectedId(id); clearPrediction(); setObservedOutputs([]) }
  const checkOutput = () => {
    if (prediction === null) return
    setSubmitted(true)
    if (prediction === pointResult.output) setObservedOutputs((items) => [...new Set([...items, pointResult.output])])
  }
  return <StepFrame {...props} step={6} intro="그래프의 점 하나는 두 입력값의 한 쌍입니다. 같은 점에서 가중치·편향을 바꾸고 출력이 어떻게 달라지는지 예측합니다.">
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 p-4">
        <h3 className="text-xl font-black">같은 입력에서 출력 비교</h3>
        <p className="mt-2 text-sm leading-6">가로축은 입력 x1, 세로축은 입력 x2입니다. 점선은 출력이 바뀌는 위치를 보여 줍니다. 식을 외우거나 유도할 필요는 없습니다.</p>
        <svg className="mt-4 h-auto w-full" viewBox="0 0 360 360" role="img" aria-label="여러 입력과 출력이 바뀌는 위치"><rect x="36" y="36" width="288" height="288" rx="12" fill="#f8fafc" stroke="#cbd5e1" />{[-2,-1,0,1,2].map((value) => <g key={value}><line x1={mapX(value)} x2={mapX(value)} y1="36" y2="324" stroke="#e2e8f0" /><line x1="36" x2="324" y1={mapY(value)} y2={mapY(value)} stroke="#e2e8f0" /></g>)}<line x1="36" x2="324" y1={mapY(0)} y2={mapY(0)} stroke="#64748b" /><line x1={mapX(0)} x2={mapX(0)} y1="36" y2="324" stroke="#64748b" />{segment ? <line x1={mapX(segment[0].x)} y1={mapY(segment[0].y)} x2={mapX(segment[1].x)} y2={mapY(segment[1].y)} stroke="#7c3aed" strokeWidth="4" strokeDasharray="8 5" /> : null}{boundaryPoints.map((point) => point.shape === 'square' ? <g key={point.id} onClick={() => selectPoint(point.id)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectPoint(point.id) } }} aria-label={`${point.id} 점 선택, 좌표 ${point.x}, ${point.y}`}><rect x={mapX(point.x)-10} y={mapY(point.y)-10} width="20" height="20" rx="2" fill={selectedId === point.id ? '#f59e0b' : '#0ea5e9'} stroke="#0f172a" strokeWidth="2" /><text x={mapX(point.x)} y={mapY(point.y)+4} textAnchor="middle" fontSize="11" fontWeight="900">{point.id}</text></g> : <g key={point.id} onClick={() => selectPoint(point.id)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectPoint(point.id) } }} aria-label={`${point.id} 점 선택, 좌표 ${point.x}, ${point.y}`}><circle cx={mapX(point.x)} cy={mapY(point.y)} r="11" fill={selectedId === point.id ? '#f59e0b' : '#fb7185'} stroke="#0f172a" strokeWidth="2" /><text x={mapX(point.x)} y={mapY(point.y)+4} textAnchor="middle" fontSize="11" fontWeight="900">{point.id}</text></g>)}</svg>
        <div className="mt-3 flex flex-wrap gap-2">{boundaryPoints.map((point) => <Button key={point.id} variant={selectedId === point.id ? 'primary' : 'secondary'} aria-pressed={selectedId === point.id} onClick={() => selectPoint(point.id)}>{point.id} ({point.x}, {point.y})</Button>)}</div>
      </section>
      <section className="rounded-2xl border border-slate-200 p-5">
        <h3 className="text-xl font-black">가중치·편향 조절</h3>
        {(['w1', 'w2'] as const).map((label, index) => <label key={label} className="mt-5 block"><span className="flex justify-between font-bold"><span>가중치 {label}</span><output>{weights[index]}</output></span><input type="range" className="mt-2 min-h-11 w-full" min={-2} max={2} step={0.5} value={weights[index]} onChange={(event) => {const next = [...weights] as [number, number]; next[index] = Number(event.target.value); setWeights(next); clearPrediction()}} /></label>)}
        <label className="mt-5 block"><span className="flex justify-between font-bold"><span>편향 b</span><output>{bias}</output></span><input type="range" className="mt-2 min-h-11 w-full" min={-2} max={2} step={0.5} value={bias} onChange={(event) => {setBias(Number(event.target.value));clearPrediction()}} /></label>
        <p className="mt-5 font-bold">선택 입력: ({selected.x}, {selected.y})</p>
        <p className="mt-2 leading-7">각 입력×가중치의 합에 편향을 더해 보세요. 가중합이 0 이상이면 출력 1입니다.</p>
        <div className="mt-4"><ChoiceButtons value={prediction === null ? null : String(prediction)} options={[{value:'0',label:'출력 0 예상'},{value:'1',label:'출력 1 예상'}]} onChange={(value) => {setPrediction(Number(value) as 0 | 1);setSubmitted(false)}} /></div>
        <Button className="mt-4" disabled={prediction === null} onClick={checkOutput}>예상과 실제 비교</Button>
        {submitted && <Feedback correct={prediction === pointResult.output}>{selected.x} × {weights[0]} + {selected.y} × {weights[1]} + ({bias}) = {formatNumber(pointResult.z)} → 출력 {pointResult.output}. {prediction !== pointResult.output && '가중합의 부호를 확인하고 예상을 바꾸어 다시 제출하세요.'}</Feedback>}
        <p className="mt-4 font-bold" role="status">같은 입력에서 맞게 예측한 출력: {observedOutputs.length ? observedOutputs.join(', ') : '아직 없음'} / 0과 1 모두</p>
      </section>
    </div>
    <fieldset className="mt-6 rounded-2xl bg-indigo-50 p-5"><legend className="font-bold">입력이 같은데 출력이 달라질 수 있는 이유는?</legend><ChoiceButtons value={reason} options={[{value:'parameters',label:'가중치나 편향이 바뀌면 가중합이 달라져 계단 함수 기준을 넘을 수 있다.'},{value:'input',label:'모델이 입력값을 정답으로 바꾸기 때문이다.'}]} onChange={(value) => {setReason(value);setReasonSubmitted(false)}} /><Button className="mt-4" disabled={!reason} onClick={() => setReasonSubmitted(true)}>변화 이유 제출</Button>{reasonSubmitted && <Feedback correct={reason === 'parameters'}>{reason === 'parameters' ? '같은 입력도 가중치·편향에 따라 다르게 처리될 수 있습니다.' : '선택한 입력은 그대로입니다. 조절한 가중치·편향이 가중합에 어떻게 반영되는지 확인하세요.'}</Feedback>}</fieldset>
    {props.isComplete && <Completion>같은 입력에서 두 출력을 예측하고 변화 이유를 설명했습니다.</Completion>}
  </StepFrame>
}

const finalQuiz = [
  { question: '퍼셉트론은 가중합을 어떻게 출력으로 바꾸나요?', options: ['활성화 함수를 적용한다', '입력값을 지운다', '편향만 출력한다'], answer: '활성화 함수를 적용한다', hint: '가중합은 중간 계산값이고, 활성화 함수 적용 후의 값이 출력입니다.' },
  { question: '다른 값이 같을 때 편향을 증가시키면 z는?', options: ['커진다', '작아진다', '항상 같다'], answer: '커진다', hint: '편향은 곱셈 결과의 합에 그대로 더해집니다.' },
  { question: '가중합이 정확히 0인 계단 함수의 출력은?', options: ['0', '1', '판단할 수 없다'], answer: '1', hint: '가중합이 0 이상일 때 출력 1입니다. 0도 포함됩니다.' },
  { question: '양수 입력에 곱하는 가중치를 키우면 다른 값이 같을 때?', options: ['그 입력의 곱셈 결과가 커진다', '입력값 자체가 커진다', '항상 출력이 바뀐다'], answer: '그 입력의 곱셈 결과가 커진다', hint: '가중합이 커져도 여전히 같은 부호라면 출력은 그대로일 수 있습니다.' },
  { question: '가중합이 2에서 4로 바뀌어도 계단 함수 출력이 같은 이유는?', options: ['둘 다 0 이상이어서', '가중치를 사용하지 않아서', '가중합과 출력이 같은 값이어서'], answer: '둘 다 0 이상이어서', hint: '계단 함수는 크기 자체가 아니라 0을 기준으로 두 상태를 구분합니다.' },
] as const

interface Step7Props extends CommonStepProps { priorStepsComplete: boolean; onCompletionReadyChange: (ready: boolean) => void }

const summarySettings = [
  { label: '기준 설정', inputs: [4, 5], weights: [1, 1], bias: -10 },
  { label: '편향만 -8로', inputs: [4, 5], weights: [1, 1], bias: -8 },
  { label: '첫 가중치만 2로', inputs: [4, 5], weights: [2, 1], bias: -10 },
] as const

export function Lesson02Step7({ priorStepsComplete, onCompletionReadyChange, ...props }: Step7Props) {
  const [quizIndex, setQuizIndex] = useState(0)
  const results = summarySettings.map(calculatePerceptronN)
  const [outputs, setOutputs] = useState<string[]>(['', '', ''])
  const [comparisonSubmitted, setComparisonSubmitted] = useState(false)
  const [reason, setReason] = useState<string | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>(Array(finalQuiz.length).fill(null))
  const [quizSubmitted, setQuizSubmitted] = useState<boolean[]>(Array(finalQuiz.length).fill(false))
  const quizCorrect = quizAnswers.map((answer, index) => answer === finalQuiz[index].answer)
  const comparisonCorrect = outputs.every((value, index) => parseStudentNumber(value) === results[index].output) && reason === 'z'
  const ready = priorStepsComplete && comparisonSubmitted && comparisonCorrect && quizSubmitted.every(Boolean) && quizCorrect.every(Boolean)
  useEffect(() => { onCompletionReadyChange(ready) }, [onCompletionReadyChange, ready])
  return <StepFrame {...props} step={7} intro="같은 입력에서 가중치·편향을 하나씩 바꾸는 세 설정을 비교하고, 계산과 출력의 관계를 정리합니다.">
    <section className="grid gap-4 md:grid-cols-3">{summarySettings.map((setting, index) => <article key={setting.label} className="rounded-2xl border border-slate-200 p-5"><h3 className="font-black">{setting.label}</h3><p className="my-3 leading-7">입력 [{setting.inputs.join(', ')}]<br />가중치 [{setting.weights.join(', ')}]<br />편향 {setting.bias}</p><NumberField id={`summary-output-${index}`} label="예상 출력" value={outputs[index]} onChange={(value) => {setOutputs((items) => items.map((answer, item) => item === index ? value : answer));setComparisonSubmitted(false)}} state={comparisonSubmitted ? parseStudentNumber(outputs[index]) === results[index].output ? 'correct' : 'wrong' : undefined} />{comparisonSubmitted && <p className="mt-3 font-bold">곱셈 {results[index].products.join(' + ')} → 합 {results[index].productSum} → 편향 추가 z={results[index].z} → 출력 {results[index].output}</p>}</article>)}</section>
    <fieldset className="mt-6"><legend className="mb-3 font-bold">출력의 차이를 설명하는 근거는?</legend><ChoiceButtons value={reason} options={[{value:'z',label:'가중치·편향이 가중합에 영향을 주며, 가중합의 부호로 출력을 결정한다.'},{value:'label',label:'모델이 정답 레이블을 보고 출력에 그대로 복사한다.'}]} onChange={(value) => {setReason(value);setComparisonSubmitted(false)}} /></fieldset>
    <Button className="mt-4" disabled={outputs.some((value) => parseStudentNumber(value) === null) || !reason} onClick={() => setComparisonSubmitted(true)}>설정 비교 제출</Button>
    {comparisonSubmitted && <Feedback correct={comparisonCorrect}>{comparisonCorrect ? '입력은 같지만 가중치·편향이 달라지면 가중합과 출력이 달라질 수 있습니다.' : '✕ 필드의 가중합을 0과 비교하세요. 정답 레이블은 계산 입력으로 몰래 사용하지 않습니다. 수정 후 다시 제출할 수 있습니다.'}</Feedback>}
    <section className="mt-10" aria-labelledby="final-quiz-title"><h3 id="final-quiz-title" className="text-xl font-black">최종 확인 문제 5개</h3><p className="mt-2 leading-7">한 문제씩 판단하고 제출하세요. 문제 이동은 선택과 제출 기록을 바꾸지 않습니다.</p><nav aria-label="확인 문제 이동" className="mt-4 flex flex-wrap gap-2">{finalQuiz.map((question, index) => <Button key={question.question} variant={quizIndex === index ? 'primary' : 'secondary'} aria-pressed={quizIndex === index} onClick={() => setQuizIndex(index)}>문제 {index + 1} · {quizSubmitted[index] ? quizCorrect[index] ? '정답' : '수정 필요' : '미제출'}</Button>)}</nav><div className="mt-5 grid gap-5">{finalQuiz.map((question,index) => <fieldset hidden={quizIndex !== index} key={question.question} className="rounded-2xl border border-slate-200 p-5"><legend className="font-black leading-7">문제 {index+1}. {question.question}</legend><div className="mt-4"><ChoiceButtons value={quizAnswers[index]} options={question.options.map((label) => ({ value: label, label }))} onChange={(value) => { setQuizAnswers((items) => items.map((answer,item) => item===index ? value : answer)); setQuizSubmitted((items) => items.map((submittedValue,item) => item===index ? false : submittedValue)) }} /></div><Button className="mt-4" disabled={!quizAnswers[index]} onClick={() => setQuizSubmitted((items) => items.map((submittedValue,item) => item===index ? true : submittedValue))}>문제 {index+1} 제출</Button>{quizSubmitted[index] ? <Feedback correct={quizCorrect[index]}>{quizCorrect[index] ? '배운 원리를 새로운 조건에 올바르게 적용했습니다.' : question.hint}</Feedback> : null}</fieldset>)}</div><div className="mt-4 flex flex-wrap gap-2"><Button variant="secondary" disabled={quizIndex === 0} onClick={() => setQuizIndex((index) => index - 1)}>이전 문제</Button><Button variant="secondary" disabled={quizIndex === finalQuiz.length - 1} onClick={() => setQuizIndex((index) => index + 1)}>다음 문제</Button><span className="self-center font-bold">{quizIndex + 1} / {finalQuiz.length}</span></div></section>{ready && !props.isComplete ? <div className="mt-7 flex items-start gap-3 rounded-2xl bg-amber-50 p-5 text-amber-950" role="status"><CircleHelp className="mt-0.5 shrink-0" size={21} aria-hidden="true" /><p className="leading-7">모든 종합 활동을 마쳤습니다. {priorStepsComplete ? '화면 아래의 완료 버튼으로 Lesson 02를 완료하세요.' : '완료되지 않은 앞 STEP의 활동을 먼저 마치세요.'}</p></div> : null}{props.isComplete ? <div className="mt-8 border-t border-emerald-200 pt-7"><Completion>Lesson 02의 활동을 모두 완료했고 Home 진행도에 반영되었습니다.</Completion><div className="mt-7 rounded-2xl bg-indigo-50 p-5"><p className="font-black text-indigo-900">Lesson 03으로 이어지는 질문</p><p className="mt-2 text-lg font-bold leading-7">같은 가중합에 다른 활성화 함수를 사용하면 출력은 어떻게 달라질까요?</p><div className="mt-5 flex flex-col gap-3 sm:flex-row"><Link to="/" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold">Home에서 진행도 보기</Link><Link to="/lesson/03" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white">Lesson 03으로<ArrowRight size={18} aria-hidden="true" /></Link></div></div></div> : null}</StepFrame>
}
