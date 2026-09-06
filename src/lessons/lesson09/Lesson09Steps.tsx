import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Circle,
  Eye,
  Info,
  Move,
  RotateCcw,
  XCircle,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import CnnFlowDiagram from './CnnFlowDiagram'
import { convolve2D, convolveAt, maxPool2D, type Matrix } from './cnnMath'
import KernelVisualizer from './KernelVisualizer'
import {
  CNN_FLOW,
  CNN_FLOW_ROLES,
  CONVOLUTION_INPUT,
  CONVOLUTION_KERNEL,
  NETWORK_STATEMENTS,
  POOLING_INPUT,
  VISION_SCENARIOS,
  VISION_TASKS,
  lesson09StepTitles,
  type NetworkMode,
  type VisionTask,
} from './lesson09Data'
import { useLesson09 } from './Lesson09Context'
import PixelGrid from './PixelGrid'
import PoolingVisualizer from './PoolingVisualizer'

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

function Notice({ children }: { children: ReactNode }) {
  return <div className="mt-4 flex items-start gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-cyan-950" role="note"><Info className="mt-0.5 shrink-0" size={20} aria-hidden="true" /><div className="text-sm leading-6">{children}</div></div>
}

function Completion({ children }: { children: ReactNode }) {
  return <div className="mt-7 flex items-start gap-3 border-t border-emerald-200 pt-5 text-emerald-900" role="status"><CheckCircle2 className="mt-0.5 shrink-0" size={21} aria-hidden="true" /><p className="font-semibold leading-7">{children}</p></div>
}

const pixelCandidates = [
  { id: 'brightness', text: '픽셀의 밝기', correct: true },
  { id: 'position', text: '픽셀의 위치', correct: true },
  { id: 'nearby', text: '주변 픽셀의 밝기 변화', correct: true },
  { id: 'mood', text: '사람의 기분', correct: false },
  { id: 'author', text: '파일을 만든 사람의 이름', correct: false },
  { id: 'edge', text: '선과 모서리의 형태', correct: true },
] as const

export function Lesson09Step1(props: CommonStepProps) {
  const { activity, update } = useLesson09()
  const [submitted, setSubmitted] = useState(false)
  const selected = new Set(activity.pixelChoices)
  const missing = pixelCandidates.filter((item) => item.correct && !selected.has(item.id))
  const extra = pixelCandidates.filter((item) => !item.correct && selected.has(item.id))
  const correct = missing.length === 0 && extra.length === 0

  const toggle = (id: string) => {
    update((current) => {
      const next = new Set(current.pixelChoices)
      if (next.has(id)) next.delete(id); else next.add(id)
      return { ...current, pixelChoices: [...next] }
    })
    setSubmitted(false)
  }

  const finish = () => {
    if (!submitted || !correct || !activity.pixelConfirmed) return
    props.onComplete()
  }

  return (
    <StepFrame {...props} step={1} intro="사람과 컴퓨터는 이미지를 어떻게 다르게 볼까요?">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5"><h3 className="font-black text-cyan-950">사람의 관점</h3><ul className="mt-3 grid gap-2 text-sm leading-6 text-cyan-900"><li>• 선의 모양과 곡선</li><li>• 선의 방향</li><li>• 숫자 전체 형태</li><li>• 다른 숫자와의 차이</li></ul></div>
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5"><h3 className="font-black text-violet-950">컴퓨터의 초기 입력</h3><ul className="mt-3 grid gap-2 text-sm leading-6 text-violet-900"><li>• 각 픽셀의 밝기값</li><li>• 픽셀의 위치</li><li>• 주변 픽셀과의 관계</li><li>• 반복되는 선과 모양</li></ul></div>
      </div>
      <Notice><p><strong>컴퓨터 비전</strong>은 컴퓨터가 이미지나 영상에서 의미 있는 정보를 찾도록 하는 인공지능 분야입니다. <strong>CNN</strong>은 이미지의 공간적 특징을 찾는 데 많이 사용하는 신경망 모델이며, 두 말은 같은 뜻이 아닙니다.</p><p className="mt-1">Lesson 07의 MNIST도 컴퓨터가 처음 받는 값은 28×28 픽셀의 밝기 숫자였습니다.</p></Notice>

      <fieldset className="mt-7 rounded-2xl border border-slate-200 p-5">
        <legend className="px-2 font-black">컴퓨터가 이미지에서 활용할 수 있는 정보를 모두 선택하세요.</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pixelCandidates.map((item) => <button key={item.id} type="button" aria-pressed={selected.has(item.id)} onClick={() => toggle(item.id)} className={`min-h-14 rounded-xl border px-4 text-left font-bold ${selected.has(item.id) ? 'border-violet-600 bg-violet-50 text-violet-950' : 'border-slate-300 bg-white text-slate-700'}`}>{selected.has(item.id) ? '✓ 선택됨 · ' : ''}{item.text}</button>)}
        </div>
        <Button className="mt-5" onClick={() => setSubmitted(true)} disabled={selected.size === 0}>선택 제출</Button>
      </fieldset>
      {submitted ? (
        correct ? <Feedback correct><strong>맞았습니다.</strong> 픽셀의 밝기와 위치, 주변 변화, 선·모서리 같은 시각 정보가 판단의 단서가 됩니다.</Feedback> : <Feedback correct={false}><strong>다시 생각해 보세요.</strong>{missing.length ? ` 활용할 수 있는 정보에서 빠진 항목: ${missing.map((item) => item.text).join(', ')}.` : ''}{extra.length ? ` 이미지 자체에서 알 수 없는 항목: ${extra.map((item) => item.text).join(', ')}.` : ''}</Feedback>
      ) : null}
      {submitted && correct ? <label className="mt-4 flex items-start gap-3 rounded-xl bg-slate-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.pixelConfirmed} onChange={(event) => update((current) => ({ ...current, pixelConfirmed: event.target.checked }))} /><span>컴퓨터에는 이미지가 먼저 픽셀의 밝기 숫자와 위치 정보로 입력된다는 안내를 확인했습니다.</span></label> : null}
      <Button className="mt-5" disabled={!submitted || !correct || !activity.pixelConfirmed} onClick={finish}>STEP 1 활동 완료</Button>
      {props.isComplete ? <Completion>이미지가 픽셀 숫자로 입력되고, 컴퓨터가 활용할 수 있는 시각 정보를 구분했습니다.</Completion> : null}
    </StepFrame>
  )
}

const visionTaskKeys = Object.keys(VISION_TASKS) as VisionTask[]

export function Lesson09Step2(props: CommonStepProps) {
  const { activity, update, assignVision } = useLesson09()
  const [selectedScenario, setSelectedScenario] = useState<string>(VISION_SCENARIOS[0].id)
  const [submitted, setSubmitted] = useState(false)
  const allAssigned = VISION_SCENARIOS.every((item) => activity.visionAssignments[item.id])
  const allCorrect = VISION_SCENARIOS.every((item) => activity.visionAssignments[item.id] === item.answer)
  const allViewed = visionTaskKeys.every((task) => activity.visionViewed.includes(task))

  const finish = () => {
    if (submitted && allCorrect && allViewed) props.onComplete()
  }

  return (
    <StepFrame {...props} step={2} intro="이미지 전체, 한 객체의 위치, 여러 객체의 위치와 픽셀 영역은 서로 다른 결과입니다.">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="font-black">① 상황 카드 선택</h3>
          <div className="mt-3 grid gap-2">
            {VISION_SCENARIOS.map((scenario, index) => <button key={scenario.id} type="button" aria-pressed={selectedScenario === scenario.id} onClick={() => setSelectedScenario(scenario.id)} className={`min-h-14 rounded-xl border p-3 text-left ${selectedScenario === scenario.id ? 'border-cyan-600 bg-cyan-50' : 'border-slate-200 bg-white'}`}><span className="font-black">상황 {index + 1}</span><span className="mt-1 block text-sm leading-6">{scenario.text}</span>{activity.visionAssignments[scenario.id] ? <span className="mt-1 block text-xs font-bold text-violet-700">현재 연결: {VISION_TASKS[activity.visionAssignments[scenario.id] as VisionTask]?.name}</span> : null}</button>)}
          </div>
        </div>
        <div>
          <h3 className="font-black">② 작업 영역 선택</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {visionTaskKeys.map((task) => {
              const item = VISION_TASKS[task]
              const viewed = activity.visionViewed.includes(task)
              return <div key={task} className="rounded-xl border border-slate-200 p-4"><button type="button" className="min-h-11 w-full rounded-lg bg-violet-600 px-3 font-bold text-white" onClick={() => { assignVision(selectedScenario, task); setSubmitted(false) }}>{item.name}에 연결</button><p className="mt-3 text-sm font-bold">“{item.question}”</p><p className="mt-2 text-sm text-slate-600">결과: {item.output}</p><button type="button" onClick={() => update((current) => ({ ...current, visionViewed: [...new Set([...current.visionViewed, task])] }))} className="mt-3 min-h-11 text-sm font-bold text-cyan-800">{viewed ? '✓ 결과 형태 확인함' : '결과 형태 확인'}</button></div>
            })}
          </div>
        </div>
      </div>
      <Notice>객체 위치 식별은 주된 객체 하나를 가정해 하나의 상자를 찾습니다. 객체 탐지는 여러 객체와 각각의 상자를 찾고, 이미지 분할은 각 픽셀이 속한 영역을 표시합니다.</Notice>
      <Button className="mt-5" onClick={() => setSubmitted(true)} disabled={!allAssigned}>네 상황 분류 확인</Button>
      {submitted ? allCorrect ? <Feedback correct>네 상황을 올바르게 연결했습니다. 네 작업은 질문뿐 아니라 출력 형태도 다릅니다.</Feedback> : <Feedback correct={false}><strong>다시 연결해 보세요.</strong><ul className="mt-1">{VISION_SCENARIOS.filter((item) => activity.visionAssignments[item.id] !== item.answer).map((item) => <li key={item.id}>• “{item.text}”는 {VISION_TASKS[item.answer].name} 결과가 필요합니다.</li>)}</ul></Feedback> : null}
      <Button className="mt-5" onClick={finish} disabled={!submitted || !allCorrect || !allViewed}>STEP 2 활동 완료</Button>
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

const networkModeLabels: Record<NetworkMode, string> = {
  'fully-connected': '완전연결 신경망 방식',
  cnn: 'CNN 방식',
  both: '둘 다 가능',
}

export function Lesson09Step3(props: CommonStepProps) {
  const { activity, update, assignNetwork } = useLesson09()
  const [selectedStatement, setSelectedStatement] = useState<string>(NETWORK_STATEMENTS[0].id)
  const [submitted, setSubmitted] = useState(false)
  const allAssigned = NETWORK_STATEMENTS.every((item) => activity.networkAssignments[item.id])
  const allCorrect = NETWORK_STATEMENTS.every((item) => activity.networkAssignments[item.id] === item.answer)
  const complete = submitted && allCorrect && activity.fullyConnectedConfirmed && activity.cnnConfirmed

  return (
    <StepFrame {...props} step={3} intro="같은 이미지를 한 줄로 펼치는 방식과 가로·세로 구조를 유지하는 방식을 비교합니다.">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5"><h3 className="font-black text-violet-950">기존 완전연결 신경망 입력</h3><div className="mt-4 grid gap-4 sm:grid-cols-[10rem_1fr]"><PixelGrid values={exampleImage} label="4×4 예시 이미지" compact /><div><p className="text-sm font-bold">행 우선으로 펼치기 → 16개 입력값</p><div className="mt-3 flex flex-wrap gap-1" aria-label={`펼친 배열 ${exampleImage.flat().join(', ')}`}>{exampleImage.flat().map((value, index) => <span key={index} className="flex size-8 items-center justify-center rounded bg-white font-mono text-xs font-black">{value}</span>)}</div></div></div><p className="mt-4 text-sm leading-6">28×28 MNIST에서는 같은 방법으로 784개 입력값을 만들었습니다.</p></div>
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5"><h3 className="font-black text-cyan-950">CNN 입력 표현</h3><div className="mt-4"><PixelGrid values={exampleImage} label="4×4 구조 유지 · 2×2 영역 선택" region={{ startRow: 1, startColumn: 1, height: 2, width: 2 }} compact /></div><p className="mt-4 text-sm leading-6">가로·세로 배치를 유지하고 가까운 픽셀의 작은 영역에서 특징을 찾습니다.</p></div>
      </div>

      <div className="mt-7 grid gap-4 lg:grid-cols-2">
        <div><h3 className="font-black">① 설명 선택</h3><div className="mt-3 grid gap-2">{NETWORK_STATEMENTS.map((item, index) => <button key={item.id} type="button" aria-pressed={selectedStatement === item.id} onClick={() => setSelectedStatement(item.id)} className={`min-h-12 rounded-xl border p-3 text-left text-sm font-bold ${selectedStatement === item.id ? 'border-cyan-600 bg-cyan-50' : 'border-slate-200'}`}>{index + 1}. {item.text}{activity.networkAssignments[item.id] ? <span className="mt-1 block text-xs text-violet-700">현재 분류: {networkModeLabels[activity.networkAssignments[item.id] as NetworkMode]}</span> : null}</button>)}</div></div>
        <div><h3 className="font-black">② 방식에 분류</h3><div className="mt-3 grid gap-2">{(Object.keys(networkModeLabels) as NetworkMode[]).map((mode) => <button key={mode} type="button" onClick={() => { assignNetwork(selectedStatement, mode); setSubmitted(false) }} className="min-h-14 rounded-xl border border-violet-200 bg-violet-50 px-4 text-left font-black text-violet-950">{networkModeLabels[mode]}에 연결</button>)}</div></div>
      </div>
      <Button className="mt-5" onClick={() => setSubmitted(true)} disabled={!allAssigned}>다섯 문장 분류 확인</Button>
      {submitted ? allCorrect ? <Feedback correct>올바르게 분류했습니다. 두 방식 모두 이미지를 분류하고 학습으로 예측할 수 있지만, 입력 구조와 특징을 살피는 방식이 다릅니다.</Feedback> : <Feedback correct={false}><strong>분류를 다시 확인하세요.</strong><ul>{NETWORK_STATEMENTS.filter((item) => activity.networkAssignments[item.id] !== item.answer).map((item) => <li key={item.id}>• “{item.text}” → {networkModeLabels[item.answer]}</li>)}</ul></Feedback> : null}
      {submitted && allCorrect ? <div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="flex items-start gap-3 rounded-xl bg-slate-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.fullyConnectedConfirmed} onChange={(event) => update((current) => ({ ...current, fullyConnectedConfirmed: event.target.checked }))} /><span>완전연결 신경망도 펼친 이미지를 입력받아 분류할 수 있습니다.</span></label><label className="flex items-start gap-3 rounded-xl bg-slate-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.cnnConfirmed} onChange={(event) => update((current) => ({ ...current, cnnConfirmed: event.target.checked }))} /><span>CNN은 가로·세로 공간 구조를 유지하며 가까운 영역의 특징을 찾는 데 적합합니다.</span></label></div> : null}
      <Notice>어느 모델이 더 좋은지는 데이터, 구조와 학습 조건에 따라 달라집니다. 이미지는 반드시 CNN으로만 처리해야 하는 것이 아닙니다.</Notice>
      <Button className="mt-5" disabled={!complete} onClick={props.onComplete}>STEP 3 활동 완료</Button>
      {props.isComplete ? <Completion>완전연결 신경망과 CNN의 이미지 입력 방식 및 공통점을 구분했습니다.</Completion> : null}
    </StepFrame>
  )
}

export function Lesson09Step4(props: CommonStepProps) {
  const { update } = useLesson09()
  const input = CONVOLUTION_INPUT as Matrix
  const kernel = CONVOLUTION_KERNEL as Matrix
  const terms = kernel.flatMap((row, rowIndex) => row.map((kernelValue, columnIndex) => input[rowIndex][columnIndex] * kernelValue))
  const expectedSum = convolveAt(input, kernel, 0, 0)
  const [answers, setAnswers] = useState(['', '', '', ''])
  const [sumAnswer, setSumAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const correctTerms = answers.map(Number).every((value, index) => answers[index] !== '' && value === terms[index])
  const correctSum = sumAnswer !== '' && Number(sumAnswer) === expectedSum
  const correct = correctTerms && correctSum
  const [mapConfirmed, setMapConfirmed] = useState(false)

  const changeAnswer = (index: number, value: string) => {
    setAnswers((current) => current.map((item, itemIndex) => itemIndex === index ? value : item))
    setSubmitted(false)
  }

  return (
    <StepFrame {...props} step={4} intro="작은 필터와 이미지 영역의 같은 위치 숫자를 곱하고 더해 특징 한 칸을 만듭니다.">
      <Notice><strong>필터(커널)</strong>: 이미지의 작은 영역을 살펴보며 특정한 모양이나 밝기 변화를 찾는 작은 숫자 격자</Notice>
      <div className="mt-6"><KernelVisualizer input={input} kernel={kernel} startRow={0} startColumn={0} /></div>
      <div className="mt-7 rounded-2xl border border-orange-200 bg-orange-50 p-5">
        <h3 className="font-black text-orange-950">직접 계산하기</h3>
        <p className="mt-2 text-sm leading-6">이미지의 작은 영역 선택 → 같은 위치끼리 곱하기 → 모두 더하기 → 특성 맵 한 칸 생성</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {kernel.flatMap((row, rowIndex) => row.map((kernelValue, columnIndex) => {
            const inputValue = input[rowIndex][columnIndex]
            const index = rowIndex * kernel[0].length + columnIndex
            return <label key={index} className="rounded-xl bg-white p-3 text-sm"><span className="block font-bold">{rowIndex + 1}행 {columnIndex + 1}열</span><span className="mt-1 block font-mono">{inputValue} × {kernelValue}</span><input type="number" inputMode="numeric" value={answers[index]} onChange={(event) => changeAnswer(index, event.target.value)} aria-label={`${inputValue} 곱하기 ${kernelValue} 결과`} className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 font-mono" /></label>
          }))}
        </div>
        <label className="mt-4 block max-w-sm font-bold">네 결과의 합<input type="number" inputMode="numeric" value={sumAnswer} onChange={(event) => { setSumAnswer(event.target.value); setSubmitted(false) }} className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-mono" /></label>
        <Button className="mt-5" onClick={() => setSubmitted(true)} disabled={answers.some((item) => item === '') || sumAnswer === ''}>계산 제출</Button>
      </div>
      {submitted ? correct ? <Feedback correct>계산 결과는 {terms.join(' + ')} = <strong>{expectedSum}</strong>입니다.</Feedback> : <Feedback correct={false}><strong>다시 계산하세요.</strong> 같은 위치끼리 곱한 네 결과를 먼저 확인한 뒤 그 값을 모두 더합니다.{answers.map(Number).map((value, index) => answers[index] && value !== terms[index] ? <span key={index} className="block">• {Math.floor(index / 2) + 1}행 {index % 2 + 1}열 곱셈을 다시 확인하세요.</span> : null)}{!correctSum ? <span className="block">• 네 곱셈 결과의 최종 합을 다시 확인하세요.</span> : null}</Feedback> : null}
      {submitted && correct ? <label className="mt-4 flex items-start gap-3 rounded-xl bg-emerald-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={mapConfirmed} onChange={(event) => setMapConfirmed(event.target.checked)} /><span>필터를 적용한 결과 {expectedSum}은 특성 맵의 첫 번째 칸이 된다는 설명을 확인했습니다.</span></label> : null}
      <Button className="mt-5" disabled={!submitted || !correct || !mapConfirmed} onClick={() => { update((current) => ({ ...current, selectedFilterPosition: 0 })); props.onComplete() }}>STEP 4 활동 완료</Button>
      {props.isComplete ? <Completion>네 곱셈과 합을 실제 격자·필터로 계산해 특성 맵 첫 칸을 만들었습니다.</Completion> : null}
    </StepFrame>
  )
}

export function Lesson09Step5(props: CommonStepProps) {
  const { activity, update } = useLesson09()
  const input = CONVOLUTION_INPUT as Matrix
  const kernel = CONVOLUTION_KERNEL as Matrix
  const featureMap = convolve2D(input, kernel)
  const positions = featureMap.flatMap((row, rowIndex) => row.map((value, columnIndex) => ({
    index: rowIndex * row.length + columnIndex,
    row: rowIndex,
    column: columnIndex,
    value,
  })))
  const selectedIndex = positions.some((item) => item.index === activity.selectedFilterPosition) ? activity.selectedFilterPosition : 0
  const selected = positions[selectedIndex]
  const allChecked = positions.every((item) => activity.checkedFilterPositions.includes(item.index))
  const visibleMap = featureMap.map((row, rowIndex) => row.map((value, columnIndex) =>
    activity.checkedFilterPositions.includes(rowIndex * row.length + columnIndex) ? value : '·',
  ))

  const confirmCurrent = () => {
    update((current) => ({ ...current, checkedFilterPositions: [...new Set([...current.checkedFilterPositions, selected.index])] }))
  }

  return (
    <StepFrame {...props} step={5} intro="같은 필터를 가로와 세로로 한 칸씩 옮겨 네 위치의 특징 값을 계산합니다.">
      <div className="flex flex-wrap gap-2" role="group" aria-label="필터 위치 선택">
        {positions.map((position) => {
          const checked = activity.checkedFilterPositions.includes(position.index)
          return <button key={position.index} type="button" aria-pressed={selected.index === position.index} onClick={() => update((current) => ({ ...current, selectedFilterPosition: position.index }))} className={`min-h-12 rounded-xl border px-4 font-bold ${selected.index === position.index ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-300 bg-white text-slate-700'}`}>위치 {position.index + 1} · {position.row + 1}행 {position.column + 1}열 {checked ? '✓ 확인함' : ''}</button>
        })}
      </div>
      <div className="mt-6"><KernelVisualizer input={input} kernel={kernel} startRow={selected.row} startColumn={selected.column} outputRow={selected.row} outputColumn={selected.column} /></div>
      <Button className="mt-5" onClick={confirmCurrent}><Eye size={18} aria-hidden="true" /> 위치 {selected.index + 1} 계산 확인</Button>

      <div className="mt-7 grid gap-5 md:grid-cols-2 md:items-center">
        <PixelGrid values={visibleMap} label="확인하면서 채워지는 특성 맵" tone="feature" />
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <h3 className="font-black text-emerald-950">특성 맵은 어떻게 만들어질까?</h3>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-emerald-900"><li>• 필터는 이미지 전체가 아닌 작은 영역을 반복해서 살펴봅니다.</li><li>• 같은 필터를 여러 위치에 적용해 비슷한 특징이 나타난 위치를 찾습니다.</li><li>• 이 결과 격자를 <strong>특성 맵</strong>이라고 합니다.</li><li>• 실제 CNN에서는 필터의 숫자도 학습 과정에서 조정될 수 있습니다.</li></ul>
        </div>
      </div>
      {allChecked ? <label className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.featureMapConfirmed} onChange={(event) => update((current) => ({ ...current, featureMapConfirmed: event.target.checked }))} /><span>네 위치의 결과로 특성 맵 [{featureMap[0].join(', ')}] / [{featureMap[1].join(', ')}]가 완성됨을 확인했습니다.</span></label> : <Notice>네 위치를 차례로 선택하고 각 위치의 계산을 확인하면 특성 맵 칸이 채워집니다.</Notice>}
      <Button className="mt-5" disabled={!allChecked || !activity.featureMapConfirmed} onClick={props.onComplete}>STEP 5 활동 완료</Button>
      {props.isComplete ? <Completion>네 위치를 실제 계산하여 특성 맵 [[{featureMap[0].join(', ')}], [{featureMap[1].join(', ')}]]를 완성했습니다.</Completion> : null}
    </StepFrame>
  )
}

export function Lesson09Step6(props: CommonStepProps) {
  const { activity, update } = useLesson09()
  const input = POOLING_INPUT as Matrix
  const pooled = maxPool2D(input, 2)
  const regions = pooled.flatMap((row, rowIndex) => row.map((value, columnIndex) => {
    const values = [
      input[rowIndex * 2][columnIndex * 2], input[rowIndex * 2][columnIndex * 2 + 1],
      input[rowIndex * 2 + 1][columnIndex * 2], input[rowIndex * 2 + 1][columnIndex * 2 + 1],
    ]
    return { index: rowIndex * row.length + columnIndex, row: rowIndex, column: columnIndex, values, maximum: value }
  }))
  const selectedIndex = regions.some((item) => item.index === activity.selectedPoolRegion) ? activity.selectedPoolRegion : 0
  const selected = regions[selectedIndex]
  const currentChoice = activity.poolSelections[String(selected.index)]
  const currentCorrect = currentChoice === selected.maximum
  const allChecked = regions.every((item) => activity.checkedPoolRegions.includes(item.index))

  const chooseRepresentative = (value: number) => {
    update((current) => {
      const correct = value === selected.maximum
      return {
        ...current,
        poolSelections: { ...current.poolSelections, [selected.index]: value },
        checkedPoolRegions: correct ? [...new Set([...current.checkedPoolRegions, selected.index])] : current.checkedPoolRegions,
      }
    })
  }

  return (
    <StepFrame {...props} step={6} intro="최대 풀링은 작은 영역의 가장 큰 값을 대표값으로 선택해 격자의 크기를 줄입니다.">
      <PoolingVisualizer input={input} poolSize={2} selectedRegion={selected.index} checkedRegions={activity.checkedPoolRegions} />
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="2×2 풀링 영역 선택">
        {regions.map((region) => <button key={region.index} type="button" aria-pressed={selected.index === region.index} onClick={() => update((current) => ({ ...current, selectedPoolRegion: region.index }))} className={`min-h-12 rounded-xl border px-4 font-bold ${selected.index === region.index ? 'border-amber-600 bg-amber-500 text-slate-950' : 'border-slate-300 bg-white'}`}>영역 {region.index + 1} · {region.row + 1}행 {region.column + 1}열 {activity.checkedPoolRegions.includes(region.index) ? '✓ 완료' : ''}</button>)}
      </div>
      <fieldset className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <legend className="px-2 font-black">영역 {selected.index + 1}의 대표값을 선택하세요.</legend>
        <p className="text-sm">현재 2×2 영역: {selected.values.join(', ')}</p>
        <div className="mt-3 flex flex-wrap gap-2">{selected.values.map((value, index) => <button key={`${value}-${index}`} type="button" aria-pressed={currentChoice === value} onClick={() => chooseRepresentative(value)} className={`min-h-12 min-w-14 rounded-xl border px-4 font-mono font-black ${currentChoice === value ? 'border-amber-700 bg-white' : 'border-amber-300 bg-amber-100'}`}>{value}</button>)}</div>
      </fieldset>
      {currentChoice !== undefined ? currentCorrect ? <Feedback correct>{selected.values.join(', ')} 중 가장 큰 값 <strong>{selected.maximum}</strong>이 이 영역의 대표값입니다.</Feedback> : <Feedback correct={false}>최대 풀링은 현재 영역의 값 {selected.values.join(', ')} 중 <strong>가장 큰 값</strong>을 선택합니다. 다시 골라 보세요.</Feedback> : null}
      <div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4 text-sm leading-6"><strong>줄어드는 것</strong><br />가로·세로 크기와 이후 계산량</div><div className="rounded-xl bg-slate-50 p-4 text-sm leading-6"><strong>주의할 점</strong><br />일부 세부 정보가 줄 수 있으며, 언제나 성능을 높이거나 모든 정보를 보존하지는 않습니다.</div></div>
      {allChecked ? <label className="mt-5 flex items-start gap-3 rounded-xl bg-emerald-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.poolingConfirmed} onChange={(event) => update((current) => ({ ...current, poolingConfirmed: event.target.checked }))} /><span>4×4 특성 맵이 대표값 [{pooled[0].join(', ')}] / [{pooled[1].join(', ')}]의 2×2 결과로 줄어드는 것을 확인했습니다.</span></label> : <Notice>네 영역에서 실제 최댓값을 모두 선택하면 2×2 결과가 완성됩니다.</Notice>}
      <Button className="mt-5" disabled={!allChecked || !activity.poolingConfirmed} onClick={props.onComplete}>STEP 6 활동 완료</Button>
      {props.isComplete ? <Completion>네 영역의 대표값을 계산해 4×4 특성 맵을 2×2 [[{pooled[0].join(', ')}], [{pooled[1].join(', ')}]]로 줄였습니다.</Completion> : null}
    </StepFrame>
  )
}

interface QuizDefinition {
  id: number
  question: string
  options: Array<{ id: string; text: string }>
  answers: string[]
  multiple?: boolean
  explanation: string
}

const quiz: QuizDefinition[] = [
  {
    id: 1,
    question: '컴퓨터 비전에 대한 올바른 설명은 무엇인가?',
    options: [
      { id: 'vision', text: '이미지나 영상에서 의미 있는 정보를 찾도록 하는 인공지능 분야이다.' },
      { id: 'cnn', text: 'CNN과 완전히 같은 뜻이다.' },
      { id: 'storage', text: '이미지 파일을 저장하는 방식이다.' },
    ],
    answers: ['vision'],
    explanation: '컴퓨터 비전은 이미지와 영상에서 정보를 찾는 분야이고, CNN은 그 분야에서 사용할 수 있는 신경망 모델입니다.',
  },
  {
    id: 2,
    question: 'CNN을 이미지 처리에 사용하기 적합한 이유는 무엇인가?',
    options: [
      { id: 'spatial', text: '이미지의 가로·세로 구조를 유지하며 가까운 픽셀에서 특징을 찾을 수 있기 때문이다.' },
      { id: 'always', text: '모든 이미지 문제에서 항상 가장 정확하기 때문이다.' },
      { id: 'no-train', text: '학습하지 않아도 정답을 알 수 있기 때문이다.' },
    ],
    answers: ['spatial'],
    explanation: 'CNN은 공간 구조를 유지한 채 작은 주변 영역에서 특징을 찾는 데 적합합니다. 성능은 데이터와 조건에 따라 달라집니다.',
  },
  {
    id: 3,
    question: '완전연결 신경망은 이미지를 입력받아 분류할 수 없다.',
    options: [{ id: 'O', text: 'O' }, { id: 'X', text: 'X' }],
    answers: ['X'],
    explanation: 'MNIST처럼 이미지를 한 줄 배열로 펼쳐 완전연결 신경망에 입력할 수 있습니다.',
  },
  {
    id: 4,
    question: '필터를 이미지의 여러 위치에 적용해서 만들어진 결과 격자를 무엇이라고 하는가?',
    options: [{ id: 'feature', text: '특성 맵' }, { id: 'label', text: '라벨' }, { id: 'epoch', text: 'Epoch' }],
    answers: ['feature'],
    explanation: '필터 계산으로 찾은 특징의 위치와 정도를 담은 결과 격자를 특성 맵이라고 합니다.',
  },
  {
    id: 5,
    question: '최대 풀링에 대한 올바른 설명을 모두 고르시오.',
    options: [
      { id: 'maximum', text: '작은 영역의 가장 큰 값을 선택할 수 있다.' },
      { id: 'size', text: '특성 맵의 가로·세로 크기를 줄일 수 있다.' },
      { id: 'compute', text: '이후 계산량을 줄이는 데 도움이 될 수 있다.' },
      { id: 'all-pixels', text: '원본 이미지의 모든 픽셀을 그대로 보존한다.' },
      { id: 'always-accurate', text: '언제나 모델의 정확도를 높인다.' },
    ],
    answers: ['maximum', 'size', 'compute'],
    multiple: true,
    explanation: '최대 풀링은 영역의 최댓값을 남겨 크기와 계산량을 줄일 수 있지만, 일부 정보가 줄고 정확도가 항상 높아지는 것은 아닙니다.',
  },
  {
    id: 6,
    question: '다음 중 CNN의 처리 흐름으로 가장 적절한 것은?',
    options: [
      { id: 'correct', text: '입력 이미지 → 합성곱 → 특성 맵 → 풀링 → 완전연결 층 → 분류 결과' },
      { id: 'reverse', text: '분류 결과 → 풀링 → 입력 이미지 → 합성곱' },
      { id: 'loss', text: '입력 이미지 → 손실함수 → 필터 삭제 → 분류 결과' },
    ],
    answers: ['correct'],
    explanation: '합성곱으로 특성 맵을 만들고 풀링으로 줄인 뒤, 완전연결 층이 특징을 종합해 분류 결과를 만듭니다.',
  },
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
  const allQuizCorrect = quiz.every((item) => activity.quizCorrect.includes(item.id))
  const ready = activity.flowCorrect && allQuizCorrect

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
    <StepFrame {...props} step={7} intro="합성곱과 풀링으로 찾은 특징이 최종 분류 결과로 이어지는 순서를 완성합니다.">
      <CnnFlowDiagram flow={activity.cnnFlow} />
      <div className="mt-6 grid gap-2">
        {activity.cnnFlow.map((item, index) => <div key={item} className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"><span className="flex size-8 items-center justify-center rounded-full bg-slate-100 font-black">{index + 1}</span><div><strong>{item}</strong><span className="mt-1 block text-xs leading-5 text-slate-600">{CNN_FLOW_ROLES[item]}</span></div><div className="flex gap-1"><button type="button" aria-label={`${item} 위로 이동`} disabled={index === 0 || activity.flowCorrect} onClick={() => move(index, -1)} className="flex size-11 items-center justify-center rounded-lg border border-slate-300 disabled:opacity-30"><ArrowUp size={18} /></button><button type="button" aria-label={`${item} 아래로 이동`} disabled={index === activity.cnnFlow.length - 1 || activity.flowCorrect} onClick={() => move(index, 1)} className="flex size-11 items-center justify-center rounded-lg border border-slate-300 disabled:opacity-30"><ArrowDown size={18} /></button></div></div>)}
      </div>
      <Button className="mt-5" onClick={submitFlow} disabled={activity.flowCorrect}>{activity.flowCorrect ? <><CheckCircle2 size={18} /> CNN 흐름 완성</> : <><Move size={18} /> 순서 확인</>}</Button>
      {activity.flowCorrect ? <Feedback correct>입력 이미지 → 합성곱 층 → 특성 맵 → 풀링 층 → 크기가 줄어든 특성 맵 → 완전연결 층 → 분류 결과 순서가 맞습니다.</Feedback> : null}
      {flowSubmitted && !activity.flowCorrect ? <Feedback correct={false}>아직 순서가 맞지 않습니다. 합성곱으로 특성 맵을 먼저 만들고, 풀링으로 크기를 줄인 뒤 완전연결 층에서 특징을 종합하는 흐름을 다시 확인하세요.</Feedback> : null}

      <div className="mt-9 border-t border-slate-200 pt-7">
        <h3 className="text-xl font-black">확인 문제 6개</h3>
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
      </div>

      <Button className="mt-7" disabled={!ready} onClick={props.onComplete}><CheckCircle2 size={18} /> STEP 7 활동 완료</Button>
      {props.isComplete ? (
        <div className="mt-8 rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-black tracking-[0.16em] text-emerald-300">CNN SIGNAL FLOW COMPLETE</p>
          <h3 className="mt-2 text-2xl font-black">이미지의 공간 구조에서 분류 결과까지 연결했습니다.</h3>
          <div className="mt-6 border-t border-slate-700 pt-6"><p className="text-sm font-bold text-cyan-300">Lesson 10 연결 질문</p><p className="mt-2 text-lg font-black">이미지 특징을 찾는 CNN은 숫자만 다루는 신경망과 구조가 어떻게 다를까요? 실제 CNN 모델은 어떤 층으로 구성할 수 있을까요?</p><Link to="/lesson/10" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 font-bold text-slate-950">Lesson 10 미리 보기 <ArrowRight size={18} /></Link></div>
        </div>
      ) : null}
    </StepFrame>
  )
}
