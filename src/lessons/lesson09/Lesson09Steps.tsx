import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Circle,
  Move,
  RotateCcw,
  XCircle,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import CnnFlowDiagram, { CnnOverview } from './CnnFlowDiagram'
import { convolve2D, convolveAt, maxPool2D, type Matrix } from './cnnMath'
import KernelVisualizer from './KernelVisualizer'
import {
  CNN_FLOW,
  CNN_FLOW_ROLES,
  cnnFlowLabel,
  TEXTBOOK_INPUT,
  TEXTBOOK_KERNEL,
  TEXTBOOK_COMPARISON_KERNEL,
  CONVOLUTION_INPUT,
  CONVOLUTION_KERNEL,
  POOLING_INPUT,
  VISION_SCENARIOS,
  VISION_TASKS,
  lesson09StepTitles,
  type VisionTask,
} from './lesson09Data'
import { useLesson09 } from './Lesson09Context'
import PixelGrid from './PixelGrid'
import PoolingVisualizer from './PoolingVisualizer'
import { VisionTaskExamples } from './VisionConcepts'
import SpatialComparison from './SpatialComparison'
import PetImageLab from './PetImageLab'

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
  const titleId = active ? 'lesson-step-title' : `lesson09-step-${step}-title`
  return (
    <Card as="section" hidden={!active} aria-labelledby={titleId} className="overflow-hidden">
      <div className="border-b border-slate-200 bg-gradient-to-r from-cyan-50 via-white to-violet-50 px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-black tracking-[0.15em] text-cyan-800">STEP {step}</span>
          <span className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm font-bold ${isComplete ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>
            {isComplete ? <CheckCircle2 size={17} aria-hidden="true" /> : <Circle size={14} aria-hidden="true" />}
            {isComplete ? '활동 완료' : '활동 필요'}
          </span>
        </div>
        <h2 id={titleId} tabIndex={active ? -1 : undefined} className="step-focus-target mt-4 text-2xl font-black leading-snug tracking-tight text-slate-950 focus:outline-none sm:text-3xl">{lesson09StepTitles[step - 1]}</h2>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{intro}</p>
      </div>
      <div className="px-5 py-7 sm:px-8 sm:py-9">{children}</div>
    </Card>
  )
}

function Feedback({ correct, children }: { correct: boolean; children: ReactNode }) {
  return (
    <div className={`mt-4 flex items-start gap-3 rounded-2xl border p-4 ${correct ? 'border-emerald-200 bg-emerald-50 text-emerald-950' : 'border-rose-200 bg-rose-50 text-rose-950'}`} role="status" aria-live="polite">
      {correct ? <CheckCircle2 className="mt-0.5 shrink-0" size={20} aria-hidden="true" /> : <XCircle className="mt-0.5 shrink-0" size={20} aria-hidden="true" />}
      <div className="min-w-0 text-sm leading-6">{children}</div>
    </div>
  )
}

function Completion({ children }: { children: ReactNode }) {
  return <div className="mt-7 flex items-start gap-3 border-t border-emerald-200 pt-5 text-emerald-900" role="status"><CheckCircle2 className="mt-0.5 shrink-0" size={21} aria-hidden="true" /><p className="font-semibold leading-7">{children}</p></div>
}

function ActivityGuide({ complete, items }: { complete: boolean; items: Array<[string, boolean]> }) {
  return <aside className="my-4 rounded-xl border border-slate-200 bg-slate-50 p-4" aria-label="활동 완료 안내">
    <p className="text-sm font-black">{complete ? '완료 기록이 유지됩니다.' : '완료까지 남은 활동'}</p>
    {!complete && <ul className="mt-2 grid gap-1 text-sm leading-6" aria-live="polite">{items.map(([label, done]) => <li key={label}><span className={done ? 'font-bold text-emerald-800' : 'text-slate-700'}>{done ? '✓ 확인됨' : '○ 남은 조건'} · {label}</span></li>)}</ul>}
  </aside>
}

function ChoiceRow({ label, value, onChange, options }: { label: string; value?: string; onChange: (value: string) => void; options: Array<[string, string]> }) {
  return <div><p className="text-sm font-bold">{label}</p><div className="mt-2 grid gap-2">{options.map(([id, text]) => <button key={id} type="button" aria-pressed={value === id} onClick={() => onChange(id)} className={`min-h-11 rounded-lg border px-3 text-left text-sm font-bold ${value === id ? 'border-violet-700 bg-white text-violet-950' : 'border-slate-300 bg-white text-slate-700'}`}>{value === id ? '✓ 선택됨 · ' : ''}{text}</button>)}</div></div>
}

// New core questions use separate IDs inside the existing answer maps.
// Legacy questions (1–7) and completed STEP records are never rewritten.
const coreQuestions = {
  101: { question: '사진의 밝기값과 사람이 붙인 레이블은 어떻게 다른가요?', options: [['brightness', '밝기값은 사진의 칸에 담긴 숫자이고, 레이블은 사람이 정한 정답입니다.'], ['same', '밝기값 하나가 곧 사람이 붙인 정답입니다.']], answer: 'brightness', hint: '한 칸의 밝기로 읽는 숫자와, 사진 전체에 붙인 정답 이름을 구분해 보세요.' },
  103: { question: '한 줄 배열과 CNN의 이웃 영역을 비교한 설명으로 알맞은 것은?', options: [['lost', '펼치면 픽셀값이 사라져 완전 연결 신경망은 이미지를 분류할 수 없습니다.'], ['neighbors', '펼쳐도 값은 같고, CNN은 가까운 칸들을 함께 살펴보며 필터를 옮깁니다.']], answer: 'neighbors', hint: '같은 #번호의 값은 그대로입니다. CNN이 보는 2×2 영역을 옮기며 이웃 관계를 비교하세요.' },
  105: { question: '같은 입력 위치에서 두 필터의 반응값이 달라질 수 있는 이유는?', options: [['probability', '반응값이 큰 필터일수록 동물일 확률이 높기 때문입니다.'], ['different', '같은 입력값에도 필터마다 곱하는 숫자가 다르기 때문입니다.']], answer: 'different', hint: '필터 안의 숫자를 비교하세요. 반응값은 곱해 더한 결과이지 정답 확률이 아닙니다.' },
  106: { question: '최대 풀링으로 줄어드는 것과 잃는 정보는?', options: [['all', '값의 수만 줄고, 모든 값과 세부 위치는 그대로 남습니다.'], ['reduce', '다음에 처리할 값의 수가 줄고, 나머지 값과 세부 위치 정보 일부는 사라집니다.']], answer: 'reduce', hint: '영역의 네 값 중 하나만 남깁니다. 나머지 세 값과 원래 위치까지 모두 복원할 수 있을까요?' },
  107: { question: 'A와 B가 같은 입력을 받아도 계산값이 달라질 수 있는 이유는?', options: [['classes', 'A는 고양이이고 B는 강아지를 뜻하기 때문입니다.'], ['weights', '입력을 조합하는 가중치와 더하는 편향이 다르기 때문입니다.']], answer: 'weights', hint: 'A·B는 종류 이름이 아니라 뉴런 이름입니다. 같은 입력에 곱하는 가중치와 편향을 비교하세요.' },
} satisfies Record<number, { question: string; options: Array<[string, string]>; answer: string; hint: string }>
type CoreId = keyof typeof coreQuestions

function useCoreAnswer(id: CoreId) {
  const { activity } = useLesson09()
  return activity.quizSubmitted.includes(id) && activity.quizAnswers[String(id)]?.[0] === coreQuestions[id].answer
}

function CoreQuestion({ id }: { id: CoreId }) {
  const { activity, update } = useLesson09()
  const definition = coreQuestions[id]
  const value = activity.quizAnswers[String(id)]?.[0]
  const submitted = activity.quizSubmitted.includes(id)
  const correct = value === definition.answer
  return <fieldset className="mt-5 rounded-xl border border-slate-200 p-4">
    <legend className="px-2 font-black">핵심 질문</legend>
    <ChoiceRow label={definition.question} value={value} options={definition.options} onChange={choice => update(current => ({
      ...current, quizAnswers: { ...current.quizAnswers, [id]: [choice] },
      quizSubmitted: current.quizSubmitted.filter(key => key !== id),
      quizCorrect: current.quizCorrect.filter(key => key !== id),
    }))} />
    <Button className="mt-3" disabled={!value} onClick={() => update(current => ({
      ...current, quizSubmitted: [...new Set([...current.quizSubmitted, id])],
      quizCorrect: correct ? [...new Set([...current.quizCorrect, id])] : current.quizCorrect.filter(key => key !== id),
    }))}>답 제출</Button>
    {submitted && <Feedback correct={correct}>{correct ? `맞았습니다. ${definition.options.find(([key]) => key === definition.answer)?.[1]}` : `다시 생각해 보세요. ${definition.hint}`}</Feedback>}
  </fieldset>
}

export function Lesson09Step1(props: CommonStepProps) {
  const { activity, update } = useLesson09()
  const correct = useCoreAnswer(101)
  const selected = activity.pixelChoices.some(value => /^photo:\d+:\d+$/.test(value))
  return <StepFrame {...props} step={1} intro="목적: 이미지의 한 칸과 밝기 숫자를 연결합니다. 할 일: 사진의 칸을 선택한 뒤 픽셀값과 정답의 차이를 판단하세요.">
    <p className="mb-3 text-sm leading-6"><strong>컴퓨터 비전</strong>은 이미지에서 정보를 찾는 분야입니다. 컴퓨터가 사진을 계산하려면 작은 칸인 <strong>픽셀</strong>을 숫자로 나타내야 합니다. 아래 사진의 한 칸을 선택해 밝기값과 위치를 함께 확인하세요.</p>
    <PetImageLab mode="pixels" active={props.active} onPixelSelect={(row, column) => update(current => ({ ...current, pixelChoices: [...current.pixelChoices.filter(value => !value.startsWith('photo:')), `photo:${row}:${column}`] }))} />
    <p className="text-sm leading-6"><strong>입력</strong>은 사진의 픽셀값, <strong>레이블</strong>은 사람이 붙인 정답 ‘동물 있음’입니다. 여러 뉴런을 연결한 <strong>인공신경망</strong>이 입력을 계산해 내놓는 결과가 모델 예측입니다. 레이블과 예측은 학습·평가에서 비교하며, 지금은 학습된 모델을 실행하지 않습니다.</p>
    <CoreQuestion id={101} />
    <ActivityGuide complete={props.isComplete} items={[[ '사진의 픽셀 한 칸 선택', selected], ['핵심 질문 정답', correct]]} />
    <Button disabled={!selected || !correct} onClick={props.onComplete}>STEP 1 활동 완료</Button>
  </StepFrame>
}

const visionTaskKeys = Object.keys(VISION_TASKS) as VisionTask[]

const requiredVisionScenarios = VISION_SCENARIOS.slice(0, 4)

export function Lesson09Step2(props: CommonStepProps) {
  const { activity, update, assignVision } = useLesson09()
  const [selectedScenario, setSelectedScenario] = useState<string>(requiredVisionScenarios[0].id)
  const [submitted, setSubmitted] = useState(activity.quizSubmitted.includes(102))
  const allAssigned = requiredVisionScenarios.every((item) => activity.visionAssignments[item.id])
  const allCorrect = requiredVisionScenarios.every((item) => activity.visionAssignments[item.id] === item.answer)

  const finish = () => {
    if (submitted && allCorrect) props.onComplete()
  }

  return (
    <StepFrame {...props} step={2} intro="목적: 네 작업이 답하는 방식의 차이를 비교합니다. 할 일: 네 상황에 알맞은 작업을 하나씩 연결하세요.">
      <ActivityGuide complete={props.isComplete} items={[[`네 상황에 작업 연결 (${requiredVisionScenarios.filter(item => activity.visionAssignments[item.id]).length}/4)`, allAssigned], ['네 상황을 모두 맞게 제출', submitted && allCorrect]]} />
      <VisionTaskExamples />
      <h3 className="mt-6 font-black">직접 적용 · 현재 상황에 필요한 출력은 무엇인가요?</h3>
      <nav className="mt-3 flex flex-wrap gap-2" aria-label="컴퓨터 비전 적용 상황 이동">{requiredVisionScenarios.map((scenario, index) => <Button key={scenario.id} variant={selectedScenario === scenario.id ? 'primary' : 'secondary'} aria-pressed={selectedScenario === scenario.id} onClick={() => setSelectedScenario(scenario.id)}>상황 {index + 1}{activity.visionAssignments[scenario.id] ? ' · 연결함' : ''}</Button>)}</nav>
      <div className="mt-3">
        {requiredVisionScenarios.map((scenario, index) => <div key={scenario.id} hidden={selectedScenario !== scenario.id} className={`min-w-0 rounded-xl border p-3 ${selectedScenario === scenario.id ? 'border-cyan-600 bg-cyan-50' : 'border-slate-200 bg-white'}`}>
          <button type="button" aria-pressed={selectedScenario === scenario.id} onClick={() => setSelectedScenario(scenario.id)} className="min-h-14 w-full rounded-lg p-1 text-left"><span className="font-black">{selectedScenario === scenario.id ? '✓ 선택한 ' : ''}상황 {index + 1}</span><span className="mt-1 block text-sm leading-6">{scenario.text}</span></button>
          <p className="mt-2 text-sm font-bold text-violet-800" aria-live="polite">현재 연결: {activity.visionAssignments[scenario.id] ? VISION_TASKS[activity.visionAssignments[scenario.id] as VisionTask]?.name : '아직 선택하지 않음'}</p>
          {selectedScenario === scenario.id && <div className="mt-3 grid grid-cols-2 gap-2" role="group" aria-label={`상황 ${index + 1}에 작업 연결`}>{visionTaskKeys.map(task => <button key={task} type="button" aria-pressed={activity.visionAssignments[scenario.id] === task} onClick={() => { assignVision(selectedScenario, task); setSubmitted(false); update(current => ({ ...current, quizSubmitted: current.quizSubmitted.filter(id => id !== 102) })) }} className={`min-h-14 rounded-lg border p-2 text-sm font-bold ${activity.visionAssignments[scenario.id] === task ? 'border-violet-700 bg-violet-100 text-violet-950' : 'border-violet-300 bg-white text-violet-900'}`}>{activity.visionAssignments[scenario.id] === task ? '✓ ' : ''}{VISION_TASKS[task].name}에 연결</button>)}</div>}
        </div>)}
      </div>
      <Button className="mt-5" onClick={() => { setSubmitted(true); update(current => ({ ...current, quizSubmitted: [...new Set([...current.quizSubmitted, 102])] })) }} disabled={!allAssigned}>네 상황 분류 확인</Button>
      {submitted ? allCorrect ? <Feedback correct>네 상황을 올바르게 연결했습니다. 네 작업은 질문뿐 아니라 출력 형태도 다릅니다.</Feedback> : <Feedback correct={false}><strong>다시 연결해 보세요.</strong><ul className="mt-1">{requiredVisionScenarios.filter((item) => activity.visionAssignments[item.id] !== item.answer).map((item) => <li key={item.id}>• “{item.text}”는 {VISION_TASKS[item.answer].name} 결과가 필요합니다.</li>)}</ul></Feedback> : null}
      <Button className="mt-5" onClick={finish} disabled={!submitted || !allCorrect}>STEP 2 활동 완료</Button>
      {props.isComplete ? <Completion>네 상황을 이미지 분류·객체 위치 식별·객체 탐지·이미지 분할로 구분하고 결과 형태를 확인했습니다.</Completion> : null}
    </StepFrame>
  )
}

const exampleImage = [
  [0, 2, 7, 0],
  [1, 8, 9, 2],
  [0, 5, 8, 1],
  [0, 1, 3, 0],
] as const

export function Lesson09Step3(props: CommonStepProps) {
  const { activity, update } = useLesson09()
  const correct = useCoreAnswer(103)
  const selected = activity.networkAssignments['spatial:pixel'] !== undefined
  return <StepFrame {...props} step={3} intro="목적: 같은 값을 펼친 배열과 공간적 이웃 관계를 비교합니다. 할 일: 픽셀을 선택해 대응을 찾고, 이웃 영역을 옮긴 뒤 질문에 답하세요.">
    <p className="mb-4 text-sm leading-6">여기부터는 사진과 다른 작은 4×4 숫자 예제입니다. 차원 변환은 값과 순서를 유지해 펼치고, 합성곱 신경망(CNN)은 가까운 칸에 필터를 적용해 여러 위치를 살펴봅니다.</p>
    <CnnOverview />
    <SpatialComparison image={exampleImage} onPixelSelect={index => update(current => ({ ...current, networkAssignments: { ...current.networkAssignments, 'spatial:pixel': String(index) } }))} />
    <CoreQuestion id={103} />
    <ActivityGuide complete={props.isComplete} items={[[ '픽셀과 배열의 대응 위치 선택', selected], ['핵심 질문 정답', correct]]} />
    <Button disabled={!selected || !correct} onClick={props.onComplete}>STEP 3 활동 완료</Button>
  </StepFrame>
}

export function Lesson09Step4(props: CommonStepProps) {
  const { activity, update } = useLesson09()
  const input = CONVOLUTION_INPUT as Matrix
  const kernel = CONVOLUTION_KERNEL as Matrix
  const guidedExpression = kernel.flatMap((row, rowIndex) => row.map((kernelValue, columnIndex) => `${input[rowIndex][columnIndex]}×${kernelValue}`)).join(' + ')
  const guidedSum = convolveAt(input, kernel, 0, 0)
  const terms = kernel.flatMap((row, rowIndex) => row.map((kernelValue, columnIndex) => input[rowIndex][columnIndex + 1] * kernelValue))
  const expectedSum = convolveAt(input, kernel, 0, 1)
  const answers = [0, 1, 2, 3].map(index => activity.quizAnswers['convolution:terms']?.[index] ?? '')
  const setAnswers = (updater: (values: string[]) => string[]) => update(current => ({ ...current, quizAnswers: { ...current.quizAnswers, 'convolution:terms': updater([0, 1, 2, 3].map(index => current.quizAnswers['convolution:terms']?.[index] ?? '')) } }))
  const sumAnswer = activity.quizAnswers['convolution:sum']?.[0] ?? ''
  const setSumAnswer = (value: string) => update(current => ({ ...current, quizAnswers: { ...current.quizAnswers, 'convolution:sum': [value] } }))
  const submitted = activity.quizSubmitted.includes(104)
  const setSubmitted = (value: boolean) => update(current => ({ ...current, quizSubmitted: value ? [...new Set([...current.quizSubmitted, 104])] : current.quizSubmitted.filter(id => id !== 104) }))
  const correctTerms = answers.map(Number).every((value, index) => answers[index] !== '' && value === terms[index])
  const correctSum = sumAnswer !== '' && Number(sumAnswer) === expectedSum
  const correct = correctTerms && correctSum

  const changeAnswer = (index: number, value: string) => {
    setAnswers((current) => current.map((item, itemIndex) => itemIndex === index ? value : item))
    setSubmitted(false)
  }

  return (
    <StepFrame {...props} step={4} intro="목적: 곱하고 더한 반응값이 특징 맵 한 칸이 되는 과정을 알아봅니다. 할 일: 첫 위치의 안내를 보고 두 번째 위치의 네 곱과 합을 제출하세요.">
      <ActivityGuide complete={props.isComplete} items={[[`독립 계산의 네 곱과 합 입력 (${answers.filter(value => value !== '').length + (sumAnswer !== '' ? 1 : 0)}/5)`, answers.every(value => value !== '') && sumAnswer !== ''], ['계산을 모두 맞게 제출', submitted && correct]]} />
      <p className="text-sm leading-6"><strong>필터</strong>는 작은 영역에 곱하는 숫자 배열이며, 그 안의 숫자를 <strong>가중치</strong>라고 합니다. 같은 위치끼리 곱해 더한 반응값이 <strong>특징 맵</strong>의 한 칸에 들어갑니다.</p>
      <p className="mt-2 text-sm leading-6">여기서는 고정된 필터로 연습하며, 실제 CNN에서는 학습으로 필터값을 조정합니다.</p>
      <h3 className="mt-5 font-black">안내 풀이 · 왼쪽 위 영역부터 계산</h3>
      <div className="mt-3 grid max-w-sm grid-cols-2 items-start gap-3">
        <PixelGrid values={input.slice(0, kernel.length).map(row => row.slice(0, kernel[0].length))} label="첫 2×2 입력 영역" />
        <PixelGrid values={kernel} label="2×2 필터" tone="kernel" />
      </div>
      <p className="mt-3 text-base leading-7"><strong>{guidedExpression} = {guidedSum}</strong><br />{guidedSum}은 특징 맵 첫 칸(1행 1열)에 들어가는 반응값입니다.</p>
      <details className="mt-3"><summary className="min-h-11 cursor-pointer py-2 font-bold">보충 · 첫 위치를 단계별로 따라가기</summary><KernelVisualizer input={input} kernel={kernel} startRow={0} startColumn={0} /></details>
      <div className="mt-7 rounded-2xl border border-orange-200 bg-orange-50 p-5">
        <h3 className="font-black text-orange-950">직접 계산하기</h3>
        <p className="mt-2 text-sm leading-6">이번에는 필터를 오른쪽으로 한 칸 옮겼습니다. 대응하는 네 곱셈 결과와 합을 입력해 특징 맵 1행 2열을 만드세요.</p>
        <div className="mt-4 grid items-start gap-4 lg:grid-cols-2">
        <div className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <PixelGrid values={input} label="입력 · 테두리 안의 네 칸" region={{ startRow: 0, startColumn: 1, height: kernel.length, width: kernel[0].length }} annotations={input.map((row, r) => row.map((_, c) => r < kernel.length && c >= 1 ? String(r * kernel[0].length + c) : ''))} />
          <PixelGrid values={kernel} label="필터 · 같은 #번호끼리 곱하기" tone="kernel" annotations={kernel.map((row, r) => row.map((_, c) => String(r * kernel[0].length + c + 1)))} />
        </div>
        <div className="min-w-0">
        <div className="grid grid-cols-2 gap-3">
          {kernel.flatMap((row, rowIndex) => row.map((kernelValue, columnIndex) => {
            const inputValue = input[rowIndex][columnIndex + 1]
            const index = rowIndex * kernel[0].length + columnIndex
            return <label key={index} className="min-w-0 rounded-xl bg-white p-3 text-sm"><span className="block font-bold">#{index + 1} · {rowIndex + 1}행 {columnIndex + 1}열</span><span className="mt-1 block font-mono">{inputValue} × {kernelValue}</span><input type="text" inputMode="text" value={answers[index]} onChange={(event) => changeAnswer(index, event.target.value)} aria-label={`${inputValue} 곱하기 ${kernelValue} 결과`} className="mt-2 min-h-11 w-full min-w-0 rounded-lg border border-slate-300 px-3 font-mono" /></label>
          }))}
        </div>
        <label className="mt-4 block max-w-sm font-bold">네 결과의 합<input type="text" inputMode="text" value={sumAnswer} onChange={(event) => { setSumAnswer(event.target.value); setSubmitted(false) }} className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-mono" /></label>
        <Button className="mt-5" onClick={() => setSubmitted(true)} disabled={answers.some((item) => item === '') || sumAnswer === ''}>계산 제출</Button>
      {submitted ? correct ? <Feedback correct>{terms.join(' + ')} = <strong>{expectedSum}</strong>: 이 필터를 적용한 반응값입니다. 특징 맵 1행 2열에 들어가며 정답 확률이 아닙니다.</Feedback> : <Feedback correct={false}><strong>다시 계산하세요.</strong> 같은 위치끼리 곱한 네 결과를 먼저 확인한 뒤 그 값을 모두 더합니다.{answers.map(Number).map((value, index) => answers[index] && value !== terms[index] ? <span key={index} className="block">• {Math.floor(index / 2) + 1}행 {index % 2 + 1}열 곱셈을 다시 확인하세요.</span> : null)}{!correctSum ? <span className="block">• 네 곱셈 결과의 최종 합을 다시 확인하세요.</span> : null}</Feedback> : null}
        </div>
        </div>
      </div>
      <Button className="mt-5" disabled={!submitted || !correct} onClick={props.onComplete}>STEP 4 활동 완료</Button>
      <details className="mt-5"><summary className="min-h-11 cursor-pointer py-2 font-bold">보충 · 다른 입력인 실제 사진에 적용하기</summary><PetImageLab mode="convolution" active={props.active} /></details>
      {props.isComplete ? <Completion>네 곱셈과 합을 실제 격자·필터로 계산해 특징 맵 두 번째 칸을 만들었습니다.</Completion> : null}
    </StepFrame>
  )
}

export function Lesson09Step5(props: CommonStepProps) {
  const { activity, update } = useLesson09()
  const input = TEXTBOOK_INPUT as Matrix
  const kernel = TEXTBOOK_KERNEL as Matrix
  const featureMap = convolve2D(input, kernel)
  const secondMap = convolve2D(input, TEXTBOOK_COMPARISON_KERNEL)
  const positions = featureMap.flatMap((row, r) => row.map((value, c) => ({ index: r * row.length + c, row: r, column: c, value })))
  const selected = positions[activity.selectedFilterPosition] ?? positions[0]
  const observed = positions.filter(position => activity.checkedFilterPositions.includes(position.index))
  const compared = observed.length >= 2
  const interpreted = useCoreAnswer(105)
  const [answers, setAnswers] = useState(['', ''])
  const [submitted, setSubmitted] = useState(false)
  const [sizeAnswer, setSizeAnswer] = useState('')
  const correct = answers.every((answer, index) => answer.trim() !== '' && Number(answer) === featureMap[1][index])
  return <StepFrame {...props} step={5} intro="목적: 같은 필터를 옮기거나 필터를 바꿨을 때의 반응을 비교합니다. 할 일: 서로 다른 두 위치 이상을 선택하고 두 필터의 차이를 해석하세요.">
    <p className="text-sm leading-6">이제 교과서의 4×4 입력·3×3 필터로 바꿉니다. 비슷한 패턴이 다른 위치에도 있을 수 있어 같은 필터를 이동합니다. 이동 간격인 <strong>스트라이드</strong>는 1칸이며, <strong>패딩</strong>이라 부르는 테두리 추가는 하지 않습니다.</p>
    <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="필터 위치 선택">{positions.map(position => <Button key={position.index} variant={selected.index === position.index ? 'primary' : 'secondary'} aria-pressed={selected.index === position.index} onClick={() => update(current => ({ ...current, selectedFilterPosition: position.index, checkedFilterPositions: [...new Set([...current.checkedFilterPositions, position.index])] }))}>위치 {position.index + 1}{activity.checkedFilterPositions.includes(position.index) ? ' ✓' : ''}</Button>)}</div>
    <div className="mt-4 grid items-start gap-4 lg:grid-cols-3">
      <PixelGrid values={input} label="같은 입력 · 선택 영역" region={{ startRow: selected.row, startColumn: selected.column, height: kernel.length, width: kernel[0].length }} />
      {[{ name: '기존 필터', values: kernel, map: featureMap }, { name: '비교 필터', values: TEXTBOOK_COMPARISON_KERNEL, map: secondMap }].map(item => <div key={item.name} className="grid min-w-0 gap-3 rounded-xl border border-slate-200 p-3">
        <PixelGrid values={item.values} label={item.name} tone="kernel" compact />
        <PixelGrid values={item.map} label="특징 맵 · 대응하는 칸" tone="feature" compact region={{ startRow: selected.row, startColumn: selected.column, height: 1, width: 1 }} />
        <p className="text-sm leading-6" aria-live="polite"><strong>{item.map[selected.row][selected.column]}</strong>: 선택 영역에 이 필터를 적용한 반응값입니다.</p>
      </div>)}
    </div>
    <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-6">한 방향에서 필터를 놓을 수 있는 위치는 {input.length} − {kernel.length} + 1 = <strong>{featureMap.length}곳</strong>입니다. 가로와 세로 위치마다 반응값을 모아 {featureMap.length}×{featureMap[0].length} 특징 맵을 만듭니다.</p>
    <p className="mt-3 text-sm leading-6">큰 반응값은 눈·귀를 찾았다는 뜻이나 정답 확률이 아닙니다. 지금은 고정 필터를 비교하며, 실제 CNN에서는 학습으로 필터값을 조정합니다.</p>
    <CoreQuestion id={105} />
    <ActivityGuide complete={props.isComplete} items={[[`서로 다른 위치 비교 (${observed.length}/2 이상)`, compared], ['두 필터의 차이 해석', interpreted]]} />
    <Button disabled={!compared || !interpreted} onClick={props.onComplete}>STEP 5 활동 완료</Button>
    <details className="mt-5"><summary className="min-h-11 cursor-pointer py-2 font-bold">선택 연습 · 추가 계산과 출력 크기 (완료 조건 아님)</summary>
      <p className="mt-2 text-sm leading-6">위에 보이는 결과를 스스로 계산해 확인하는 복습입니다. 이동 간격(스트라이드) 1, 테두리 추가(패딩) 없음일 때 출력 한 변 = 입력 한 변 − 필터 한 변 + 1입니다.</p>
      <KernelVisualizer input={input} kernel={kernel} startRow={selected.row} startColumn={selected.column} />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{answers.map((answer, index) => <label key={index}>특징 맵 2행 {index + 1}열<input type="text" inputMode="text" value={answer} onChange={event => { setAnswers(current => current.map((v, i) => i === index ? event.target.value : v)); setSubmitted(false) }} className="mt-2 min-h-11 w-full rounded-lg border px-3" /></label>)}</div>
      <ChoiceRow label="출력 한 변의 칸 수는?" value={sizeAnswer} onChange={value => { setSizeAnswer(value); setSubmitted(false) }} options={['1', '2', '3'].map(v => [v, v])} />
      <Button className="mt-3" disabled={answers.some(value => !value.trim()) || !sizeAnswer} onClick={() => setSubmitted(true)}>선택 연습 제출</Button>
      {submitted && <Feedback correct={correct && sizeAnswer === String(featureMap.length)}>{correct && sizeAnswer === String(featureMap.length) ? '계산과 출력 크기가 맞습니다.' : '같은 위치끼리 곱해 더한 값과 가능한 필터 위치 수를 확인하세요.'}</Feedback>}
    </details>
    <section className="mt-6 border-t border-slate-200 pt-5" aria-label="같은 반응값을 다음 층에 전달하기"><h3 className="font-black">같은 원리를 사진에 적용하고 다음 층으로 전달하기</h3><p className="mt-2 text-sm leading-6">아래는 작은 격자와 다른 사진 입력입니다. <strong>렐루(ReLU) 함수</strong>는 음수를 0으로 바꾸고 0과 양수는 그대로 전달합니다. 값이 모두 양수이면 전후가 같아도 올바른 결과입니다.</p><PetImageLab mode="feature" active={props.active} /></section>
  </StepFrame>
}

export function Lesson09Step6(props: CommonStepProps) {
  const { activity, update } = useLesson09()
  const input = POOLING_INPUT as Matrix
  const pooled = maxPool2D(input, 2)
  const guidedValues = input.slice(0, 2).flatMap(row => row.slice(0, 2))
  const values = input.slice(0, 2).flatMap(row => row.slice(2, 4))
  const choice = activity.poolSelections['1']
  const correct = choice === pooled[0][1]
  const meaning = useCoreAnswer(106)
  return <StepFrame {...props} step={6} intro="목적: 대표값을 남겨 다음 단계에서 처리할 숫자를 줄입니다. 할 일: 첫 영역의 안내를 보고 두 번째 영역의 최댓값을 고른 뒤 줄어드는 정보를 판단하세요.">
    <p className="text-sm leading-6">새로운 4×4 풀링 예제입니다. <strong>최대 풀링</strong>은 2×2 영역에서 가장 큰 값 하나를 남깁니다.</p>
    <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm leading-6">안내 · 첫 영역 [{guidedValues.join(', ')}] → <strong>{pooled[0][0]}</strong>: 이 영역에서 남긴 최댓값입니다.</p>
    <PoolingVisualizer input={input} poolSize={2} selectedRegion={1} checkedRegions={correct ? [0, 1, 2, 3] : [0]} control={<fieldset className="mt-4 rounded-xl border border-amber-200 p-4"><legend className="px-2 font-bold">직접 선택 · 오른쪽 위 2×2 영역의 최댓값</legend>
      <div className="flex flex-wrap gap-2">{values.map((value, index) => <Button key={index} variant={choice === value ? 'primary' : 'secondary'} aria-pressed={choice === value} onClick={() => update(current => ({ ...current, poolSelections: { ...current.poolSelections, 1: value }, checkedPoolRegions: value === pooled[0][1] ? [...new Set([...current.checkedPoolRegions, 1])] : current.checkedPoolRegions }))}>{value}</Button>)}</div>
      {choice !== undefined && <Feedback correct={correct}>{correct ? `${choice}: 이 2×2 영역에서 남긴 최댓값입니다. 나머지 결과도 펼쳐 보면 16개 값이 4개가 됩니다.` : '네 숫자 중 가장 큰 값을 다시 선택하세요.'}</Feedback>}
    </fieldset>} />
    <CoreQuestion id={106} />
    <ActivityGuide complete={props.isComplete} items={[[ '독립 영역의 최댓값 선택', correct], ['줄어드는 값과 정보 판단', meaning]]} />
    <Button disabled={!correct || !meaning} onClick={props.onComplete}>STEP 6 활동 완료</Button>
    <details className="mt-5"><summary className="min-h-11 cursor-pointer py-2 font-bold">보충 · 실제 사진의 풀링 전후</summary><PetImageLab mode="pooling" active={props.active} /></details>
  </StepFrame>
}

interface QuizDefinition {
  id: number
  question: string
  options: Array<{ id: string; text: string }>
  answers: string[]
  multiple?: boolean
  explanation: string
}

const practiceMap = convolve2D(CONVOLUTION_INPUT, CONVOLUTION_KERNEL)
const practiceTerms = CONVOLUTION_KERNEL.flatMap((row, r) => row.map((value, c) => CONVOLUTION_INPUT[r][c + 1] * value))

const quiz: QuizDefinition[] = [
  {
    id: 1,
    question: '여러 사람과 자동차를 각각 상자로 찾아야 할 때 가장 알맞은 작업은?',
    options: [
      { id: 'detection', text: '객체 탐지' }, { id: 'localization', text: '객체 위치 식별' }, { id: 'segmentation', text: '이미지 분할' },
    ],
    answers: ['detection'], explanation: '객체 탐지는 여러 객체의 종류와 각각의 위치를 찾습니다. 위치 식별은 주된 한 객체를 다룹니다.',
  },
  {
    id: 2,
    question: 'flatten한 뒤에도 맞는 설명은?',
    options: [
      { id: 'values', text: '픽셀값은 배열에 남지만, 행·열 이웃 관계를 바로 읽기 어려워진다.' },
      { id: 'erase', text: '모든 픽셀값이 사라진다.' }, { id: 'cnn-only', text: '이미지 분류를 할 수 없게 된다.' },
    ],
    answers: ['values'], explanation: 'flatten은 순서대로 배열을 만들기 때문에 픽셀값은 남습니다. 다만 2차원 이웃 관계는 CNN처럼 바로 드러나지 않습니다.',
  },
  {
    id: 3,
    question: '오른쪽 위 위치의 합성곱 값은 무엇인가? (3×1 + 1×0 + 4×0 + 6×1)',
    options: [{ id: String(practiceMap[0][1]), text: String(practiceMap[0][1]) }, { id: '6', text: '6' }, { id: '14', text: '14' }],
    answers: [String(practiceMap[0][1])], explanation: `같은 위치끼리 곱한 ${practiceTerms.join(', ')}을 더하면 ${practiceMap[0][1]}입니다.`,
  },
  {
    id: 4,
    question: '입력 3×3과 필터 2×2를 stride 1, padding 없음으로 계산하면 특징 맵 크기는?',
    options: [{ id: '2', text: '2×2' }, { id: '3', text: '3×3' }, { id: '1', text: '1×1' }],
    answers: [String(practiceMap.length)], explanation: `한 변은 ${CONVOLUTION_INPUT.length} − ${CONVOLUTION_KERNEL.length} + 1 = ${practiceMap.length}이므로 ${practiceMap.length}×${practiceMap[0].length} 특징 맵입니다.`,
  },
  {
    id: 5,
    question: '같은 이미지에 다른 필터를 적용하면?',
    options: [
      { id: 'different', text: '찾는 패턴이 달라져 특징 맵도 달라질 수 있다.' },
      { id: 'same', text: '언제나 같은 특징 맵이 나온다.' }, { id: 'label', text: 'label이 자동으로 바뀐다.' },
    ],
    answers: ['different'], explanation: '필터마다 강조하는 지역 패턴이 다르므로 같은 이미지에서도 계산된 특징 맵은 달라질 수 있습니다.',
  },
  {
    id: 6,
    question: '최대 풀링에 대한 올바른 설명은?',
    options: [
      { id: 'maximum', text: '작은 영역의 최댓값을 남겨 크기와 이후 계산량을 줄일 수 있다.' },
      { id: 'all', text: '모든 세부 위치를 완전히 보존한다.' }, { id: 'class', text: '그 자체로 최종 클래스를 결정한다.' },
    ],
    answers: ['maximum'], explanation: '최대 풀링은 강한 반응을 대표값으로 남기는 중간 단계입니다. 일부 위치 정보는 줄고, 뒤의 층이 분류를 이어갑니다.',
  },
  { id: 7, question: 'CNN의 올바른 전체 흐름은?', options: [{ id: 'correct', text: '이미지 입력 → 합성곱 → ReLU → 풀링 → flatten → 완전 연결층 → Softmax → 클래스 예측' }, { id: 'missing', text: '이미지 입력 → Softmax → 합성곱 → 클래스 예측' }, { id: 'reverse', text: '클래스 예측 → flatten → 이미지 입력' }], answers: ['correct'], explanation: '합성곱과 ReLU, 풀링으로 특징을 다룬 뒤 flatten과 완전 연결층이 특징을 종합하고 Softmax가 클래스별 확률을 만듭니다.' },
]

function sameAnswers(selected: readonly string[], expected: readonly string[]) {
  return selected.length === expected.length && expected.every((item) => selected.includes(item))
}

interface Step7Props extends CommonStepProps {
  priorStepsComplete: boolean
  onCompletionReadyChange: (ready: boolean) => void
}

export function Lesson09Step7({ priorStepsComplete, onCompletionReadyChange, ...props }: Step7Props) {
  const { activity, update } = useLesson09()
  const [flowSubmitted, setFlowSubmitted] = useState(false)
  const denseCorrect = useCoreAnswer(107)
  const ready = activity.flowCorrect && denseCorrect

  useEffect(() => {
    onCompletionReadyChange(priorStepsComplete && props.isComplete)
    return () => onCompletionReadyChange(false)
  }, [onCompletionReadyChange, priorStepsComplete, props.isComplete])

  const move = (index: number, direction: -1 | 1) => {
    setFlowSubmitted(false)
    update((current) => {
      const target = index + direction
      if (target < 0 || target >= current.cnnFlow.length || current.flowCorrect) return current
      const next = [...current.cnnFlow]
      ;[next[index], next[target]] = [next[target], next[index]]
      return { ...current, cnnFlow: next, flowCorrect: false }
    })
  }
  const submitFlow = () => {
    const correct = activity.cnnFlow.every((item, index) => item === CNN_FLOW[index])
    update((current) => ({ ...current, flowCorrect: correct }))
    setFlowSubmitted(true)
  }

  const setQuizAnswer = (definition: QuizDefinition, optionId: string) => {
    if (activity.quizSubmitted.includes(definition.id)) return
    update((current) => {
      const currentAnswers = current.quizAnswers[String(definition.id)] ?? []
      const nextAnswers = definition.multiple
        ? currentAnswers.includes(optionId) ? currentAnswers.filter((item) => item !== optionId) : [...currentAnswers, optionId]
        : [optionId]
      return { ...current, quizAnswers: { ...current.quizAnswers, [definition.id]: nextAnswers } }
    })
  }
  const submitQuiz = (definition: QuizDefinition) => {
    const selected = activity.quizAnswers[String(definition.id)] ?? []
    const correct = sameAnswers(selected, definition.answers)
    update((current) => ({
      ...current,
      quizSubmitted: [...new Set([...current.quizSubmitted, definition.id])],
      quizCorrect: correct ? [...new Set([...current.quizCorrect, definition.id])] : current.quizCorrect.filter((id) => id !== definition.id),
    }))
  }
  const retryQuiz = (id: number) => {
    update((current) => ({ ...current, quizSubmitted: current.quizSubmitted.filter((item) => item !== id), quizAnswers: { ...current.quizAnswers, [id]: [] } }))
  }

  return (
    <StepFrame {...props} step={7} intro="목적: 앞에서 얻은 반응을 종합하는 방법과 전체 과정을 연결합니다. 할 일: 뉴런 A·B의 차이를 판단하고 흐름 카드를 배열하세요.">
      <ActivityGuide complete={props.isComplete} items={[[ 'STEP 1~6 완료 (차시 완료에 필요)', priorStepsComplete], ['CNN 전체 흐름 배열을 맞게 제출', activity.flowCorrect], ['뉴런 A·B의 계산 차이 판단', denseCorrect]]} />
      <PetImageLab mode="dense" active={props.active} />
      <CoreQuestion id={107} />
      <section className="mt-5 rounded-xl border border-cyan-200 p-4" aria-label="흐름 카드의 값과 역할 참고"><h3 className="font-black">값을 펼치는 일과 계산하는 일을 구별하세요</h3>
        <p className="text-sm leading-6">ReLU는 음수를 0으로 바꾸고, 차원 변환은 값과 순서를 유지해 펼칩니다. 완전 연결층은 여러 반응을 종합하며, 분류용 출력층의 점수에 소프트맥스를 적용하면 클래스별 확률이 됩니다. 확률은 정확도나 정답 보장이 아닙니다.</p>
        <p className="mt-2 text-sm leading-6">합성곱은 한 칸씩 이동(스트라이드 1)하며 테두리 추가(패딩) 없이 계산했고, 풀링은 2×2 영역을 두 칸씩 옮겼습니다. 실제 CNN에서는 층을 반복하거나 구성을 바꿀 수 있습니다.</p>
      </section>
      <h3 className="mb-3 mt-7 border-t border-slate-200 pt-6 text-lg font-black">직접 적용 · 나의 CNN 흐름 배열</h3>
      {!activity.flowCorrect ? <>
      <p className="mb-3 text-sm leading-6">카드의 역할을 읽고 위·아래 버튼으로 옮긴 뒤 순서를 확인하세요.</p>
      <div className="mt-6 grid gap-2">
        {activity.cnnFlow.map((item, index) => <div key={item} className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"><span className="flex size-8 items-center justify-center rounded-full bg-slate-100 font-black">{index + 1}</span><div><strong>{cnnFlowLabel(item)}</strong><span className="mt-1 block text-xs leading-5 text-slate-600">{CNN_FLOW_ROLES[item]}</span></div><div className="flex gap-1"><button type="button" aria-label={`${cnnFlowLabel(item)} 위로 이동`} disabled={index === 0 || activity.flowCorrect} onClick={() => move(index, -1)} className="flex size-11 items-center justify-center rounded-lg border border-slate-300 disabled:opacity-30"><ArrowUp size={18} /></button><button type="button" aria-label={`${cnnFlowLabel(item)} 아래로 이동`} disabled={index === activity.cnnFlow.length - 1 || activity.flowCorrect} onClick={() => move(index, 1)} className="flex size-11 items-center justify-center rounded-lg border border-slate-300 disabled:opacity-30"><ArrowDown size={18} /></button></div></div>)}
      </div>
      <Button className="mt-5" onClick={submitFlow} disabled={activity.flowCorrect}><Move size={18} /> 순서 확인</Button>
      </> : <><CnnFlowDiagram flow={activity.cnnFlow} /><Feedback correct>순서가 맞습니다. 완성된 전체 흐름입니다.</Feedback></>}
      {flowSubmitted && !activity.flowCorrect ? <Feedback correct={false}>아직 순서가 맞지 않습니다. 합성곱으로 지역 패턴을 찾고 ReLU·풀링으로 반응을 다룬 뒤 flatten과 완전 연결층, Softmax로 이어집니다.</Feedback> : null}
      {activity.flowCorrect && <details className="mt-5"><summary className="min-h-11 cursor-pointer py-2 font-bold">전체 사진 처리 결과 연결해 복습하기</summary><PetImageLab mode="review" active={props.active} /></details>}

      <details className="mt-6 border-t border-slate-200 pt-4">
        <summary className="min-h-11 cursor-pointer py-2 font-black">선택 복습 · 확인 문제 7개 (완료 조건 아님)</summary>
        <p className="mt-2 text-sm leading-6 text-slate-600">각 문제를 제출하면 아이콘과 글로 결과를 확인합니다. 맞힌 문제는 유지되고, 틀린 문제만 다시 풀 수 있습니다.</p>
        <div className="mt-5 grid gap-5">
          {quiz.map((definition) => {
            const selected = activity.quizAnswers[String(definition.id)] ?? []
            const submitted = activity.quizSubmitted.includes(definition.id)
            const correct = activity.quizCorrect.includes(definition.id)
            return (
              <fieldset key={definition.id} className="rounded-2xl border border-slate-200 p-5">
                <legend className="px-2 font-black">문제 {definition.id}. {definition.question}</legend>
                <div className="mt-3 grid gap-2">
                  {definition.options.map((option) => <button key={option.id} type="button" disabled={submitted} aria-pressed={selected.includes(option.id)} onClick={() => setQuizAnswer(definition, option.id)} className={`min-h-12 rounded-xl border p-3 text-left text-sm font-bold disabled:cursor-not-allowed ${selected.includes(option.id) ? 'border-violet-600 bg-violet-50 text-violet-950' : 'border-slate-300 bg-white'}`}>{selected.includes(option.id) ? '✓ 선택됨 · ' : ''}{option.text}</button>)}
                </div>
                {!submitted ? <Button className="mt-4" onClick={() => submitQuiz(definition)} disabled={selected.length === 0}>문제 {definition.id} 제출</Button> : null}
                {submitted ? <Feedback correct={correct}><strong>{correct ? '정답입니다.' : '오답입니다.'}</strong> {definition.explanation}{!correct ? <Button className="mt-3" variant="secondary" onClick={() => retryQuiz(definition.id)}><RotateCcw size={17} /> 오답 다시 풀기</Button> : null}</Feedback> : null}
              </fieldset>
            )
          })}
        </div>
      </details>

      <Button className="mt-7" disabled={!ready} onClick={props.onComplete}><CheckCircle2 size={18} /> STEP 7 활동 완료</Button>
      {props.isComplete ? (
        <div className="mt-8 rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-black tracking-[0.16em] text-emerald-300">CNN SIGNAL FLOW COMPLETE</p>
          <h3 className="mt-2 text-2xl font-black">이미지의 공간 구조에서 분류 결과까지 연결했습니다.</h3>
          <div className="mt-6 border-t border-slate-700 pt-6"><p className="text-sm font-bold text-cyan-300">Lesson 10 연결 질문</p><p className="mt-2 text-lg font-black">이미지를 분류하는 인공지능과 달리, 새로운 이미지를 만드는 생성형 인공지능은 어떤 원리를 사용할까요?</p><Link to="/lesson/10" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 font-bold text-slate-950">Lesson 10 미리 보기 <ArrowRight size={18} /></Link></div>
        </div>
      ) : null}
    </StepFrame>
  )
}
