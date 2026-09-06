import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Circle,
  Info,
  RotateCcw,
  Sparkles,
  Volume2,
  XCircle,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import GanSimulation from './GanSimulation'
import GeneratorDiscriminatorFlow from './GeneratorDiscriminatorFlow'
import {
  GAN_ROLE_CARDS,
  GENERATION_SCENARIOS,
  LANGUAGE_PROCESS_CARDS,
  RECOGNITION_CARDS,
  SPEECH_USES,
  lesson10StepTitles,
  type GanRole,
  type GenerationCategory,
  type LanguageProcess,
  type RecognitionMethod,
} from './lesson10Data'
import { useLesson10 } from './Lesson10Context'
import SpeechRecognitionFlow, { SPEECH_STAGES } from './SpeechRecognitionFlow'
import WaveformVisualizer from './WaveformVisualizer'

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
  const titleId = active ? 'lesson-step-title' : `lesson10-step-${step}-title`
  return (
    <Card as="section" hidden={!active} aria-labelledby={titleId} className="overflow-hidden">
      <div className="border-b border-slate-200 bg-gradient-to-r from-violet-50 via-white to-cyan-50 px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-black tracking-[0.15em] text-violet-800">STEP {step}</span>
          <span className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm font-bold ${isComplete ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>
            {isComplete ? <CheckCircle2 size={17} aria-hidden="true" /> : <Circle size={14} aria-hidden="true" />}
            {isComplete ? '활동 완료' : '활동 필요'}
          </span>
        </div>
        <h2 id={titleId} tabIndex={active ? -1 : undefined} className="step-focus-target mt-4 text-2xl font-black leading-snug tracking-tight text-slate-950 focus:outline-none sm:text-3xl">{lesson10StepTitles[step - 1]}</h2>
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

function PartBadge({ children }: { children: ReactNode }) {
  return <p className="mb-5 inline-flex min-h-10 items-center rounded-full bg-slate-950 px-4 text-sm font-black tracking-wide text-white">{children}</p>
}

function CategoryButtons<T extends string>({
  labels,
  value,
  onChoose,
}: {
  labels: Array<{ id: T; label: string }>
  value?: string
  onChoose: (id: T) => void
}) {
  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2" role="group" aria-label="선택한 카드를 연결할 영역">
      {labels.map((item) => <button key={item.id} type="button" aria-pressed={value === item.id} onClick={() => onChoose(item.id)} className={`min-h-12 rounded-xl border px-4 py-3 font-bold ${value === item.id ? 'border-violet-600 bg-violet-50 text-violet-950' : 'border-slate-300 bg-white text-slate-700'}`}>{value === item.id ? '✓ 연결됨 · ' : ''}{item.label}</button>)}
    </div>
  )
}

export function Lesson10Step1(props: CommonStepProps) {
  const { activity, update, assignGeneration } = useLesson10()
  const [selectedId, setSelectedId] = useState<string>(GENERATION_SCENARIOS[0].id)
  const selected = GENERATION_SCENARIOS.find((item) => item.id === selectedId) ?? GENERATION_SCENARIOS[0]
  const selectedAnswer = activity.generationAssignments[selected.id]
  const allCorrect = GENERATION_SCENARIOS.every((item) => activity.generationAssignments[item.id] === item.answer)
  const ready = allCorrect && activity.generationDefinitionConfirmed && activity.ganRelationConfirmed

  return (
    <StepFrame {...props} step={1} intro="판단하거나 숫자를 예측하는 AI와, 학습한 패턴으로 새 콘텐츠를 만드는 AI를 비교합니다.">
      <PartBadge>PART A — 생성형 인공지능과 GAN</PartBadge>
      <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="font-black">이 차시의 학습 목표</h3>
        <ul className="mt-3 grid gap-2 text-sm leading-6 sm:grid-cols-2">
          <li>• 생성형 인공지능이 새 콘텐츠를 만드는 기술임을 설명합니다.</li>
          <li>• 생성형 인공지능과 GAN을 같은 개념으로 혼동하지 않습니다.</li>
          <li>• GAN의 생성자와 감별자 역할을 구분합니다.</li>
          <li>• 두 신경망이 경쟁하며 학습하는 기본 원리를 설명합니다.</li>
          <li>• 음성 인식이 말소리를 텍스트로 바꾸는 기술임을 설명합니다.</li>
          <li>• 여러 음성 특징과 음소의 관련성을 기본 수준에서 설명합니다.</li>
          <li>• 규칙 기반 방식과 딥러닝 음성 인식의 차이를 구분합니다.</li>
          <li>• 음성 인식과 자연어 처리를 구분합니다.</li>
        </ul>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['분류', '이미지를 보고 → 고양이 또는 강아지 판단'],
          ['예측', '데이터를 보고 → 숫자값 예측'],
          ['생성', '학습한 데이터의 패턴을 바탕으로 → 새로운 이미지, 글, 음악 등을 만듦'],
        ].map(([title, text], index) => <div key={title} className={`rounded-2xl border p-5 ${index === 2 ? 'border-violet-200 bg-violet-50' : 'border-slate-200 bg-slate-50'}`}><h3 className="font-black">{title}</h3><p className="mt-2 text-sm leading-6">{text}</p></div>)}
      </div>
      <Notice><strong>생성형 인공지능</strong>은 텍스트, 오디오, 이미지 등의 기존 콘텐츠에서 패턴을 학습하여 새로운 콘텐츠를 만들어 내는 인공지능 기술입니다.</Notice>

      <div className="mt-7 grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="font-black">① 사례 카드 선택</h3>
          <div className="mt-3 grid gap-2">
            {GENERATION_SCENARIOS.map((item, index) => {
              const answer = activity.generationAssignments[item.id]
              const correct = answer === item.answer
              return <button key={item.id} type="button" aria-pressed={selected.id === item.id} onClick={() => setSelectedId(item.id)} className={`min-h-14 rounded-xl border p-3 text-left ${selected.id === item.id ? 'border-violet-600 bg-violet-50' : 'border-slate-200 bg-white'}`}><span className="font-black">사례 {index + 1}</span><span className="mt-1 block text-sm">{item.text}</span>{answer ? <span className={`mt-1 block text-xs font-bold ${correct ? 'text-emerald-700' : 'text-rose-700'}`}>{correct ? '✓ 정확히 분류함' : '✕ 다시 분류 필요'}</span> : null}</button>
            })}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="font-black">② 선택한 사례 분류</h3>
          <p className="mt-3 rounded-xl bg-white p-4 font-bold">{selected.text}</p>
          <CategoryButtons<GenerationCategory> labels={[{ id: 'decision', label: '판단·분류' }, { id: 'generation', label: '생성' }]} value={selectedAnswer} onChoose={(category) => assignGeneration(selected.id, category)} />
          {selectedAnswer ? selectedAnswer === selected.answer
            ? <Feedback correct>맞았습니다. {selected.answer === 'generation' ? '학습한 패턴을 바탕으로 새 콘텐츠를 만드는 사례입니다.' : '주어진 입력을 보고 범주를 판단하는 사례입니다.'}</Feedback>
            : <Feedback correct={false}>다시 생각해 보세요. {selected.answer === 'generation' ? '새 이미지나 음악을 만드는지는 생성에 해당합니다.' : '입력이 어느 범주인지 고르는지는 판단·분류에 해당합니다.'}</Feedback> : null}
        </div>
      </div>
      {allCorrect ? <div className="mt-6 grid gap-3">
        <label className="flex items-start gap-3 rounded-xl bg-violet-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.generationDefinitionConfirmed} onChange={(event) => update((current) => ({ ...current, generationDefinitionConfirmed: event.target.checked }))} /><span>생성형 인공지능이 기존 콘텐츠의 패턴을 학습하여 새로운 콘텐츠를 만드는 기술임을 확인했습니다.</span></label>
        <label className="flex items-start gap-3 rounded-xl bg-cyan-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.ganRelationConfirmed} onChange={(event) => update((current) => ({ ...current, ganRelationConfirmed: event.target.checked }))} /><span><strong>GAN은 생성형 인공지능을 구현하는 대표적인 방법 중 하나</strong>이며, 모든 생성형 AI가 GAN인 것은 아님을 확인했습니다.</span></label>
      </div> : null}
      <Button className="mt-5" disabled={!ready} onClick={props.onComplete}>STEP 1 활동 완료</Button>
      {props.isComplete ? <Completion>네 사례를 구분하고 생성형 인공지능과 GAN의 포함 관계를 확인했습니다.</Completion> : null}
    </StepFrame>
  )
}

export function Lesson10Step2(props: CommonStepProps) {
  const { activity, update, assignGanRole } = useLesson10()
  const [selectedId, setSelectedId] = useState<string>(GAN_ROLE_CARDS[0].id)
  const selected = GAN_ROLE_CARDS.find((item) => item.id === selectedId) ?? GAN_ROLE_CARDS[0]
  const selectedAnswer = activity.ganRoleAssignments[selected.id]
  const allCorrect = GAN_ROLE_CARDS.every((item) => activity.ganRoleAssignments[item.id] === item.answer)
  const ready = allCorrect && activity.ganFlowConfirmed

  return (
    <StepFrame {...props} step={2} intro="GAN을 이루는 서로 다른 두 신경망의 역할과 연결 흐름을 살펴봅니다.">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5"><h3 className="font-black text-violet-950">생성자 Generator</h3><p className="mt-2 leading-7">진짜 데이터와 비슷한 새로운 데이터를 만듭니다.</p></div>
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5"><h3 className="font-black text-orange-950">감별자 Discriminator</h3><p className="mt-2 leading-7">주어진 데이터가 실제 데이터인지 생성자가 만든 데이터인지 구분합니다.</p></div>
      </div>
      <Notice><strong>GAN</strong>은 생성자와 감별자라는 두 신경망이 경쟁하며 학습하는 생성 모델입니다. 두 역할은 하나의 AI가 번갈아 맡는 것이 아니라 서로 다른 신경망입니다. 여기서 ‘가짜 데이터’는 생성자가 만든 데이터를 가리키는 기술적 표현입니다.</Notice>
      <div className="mt-6"><GeneratorDiscriminatorFlow /></div>

      <div className="mt-7 grid gap-4 lg:grid-cols-2">
        <div><h3 className="font-black">① 역할 카드 선택</h3><div className="mt-3 grid gap-2">{GAN_ROLE_CARDS.map((item, index) => {
          const answer = activity.ganRoleAssignments[item.id]
          const correct = answer === item.answer
          return <button key={item.id} type="button" aria-pressed={selected.id === item.id} onClick={() => setSelectedId(item.id)} className={`min-h-14 rounded-xl border p-3 text-left ${selected.id === item.id ? 'border-violet-600 bg-violet-50' : 'border-slate-200 bg-white'}`}><span className="font-black">역할 {index + 1}</span><span className="mt-1 block text-sm">{item.text}</span>{answer ? <span className={`mt-1 block text-xs font-bold ${correct ? 'text-emerald-700' : 'text-rose-700'}`}>{correct ? '✓ 정확히 연결함' : '✕ 다시 연결 필요'}</span> : null}</button>
        })}</div></div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><h3 className="font-black">② 선택한 역할 연결</h3><p className="mt-3 rounded-xl bg-white p-4 font-bold">{selected.text}</p><CategoryButtons<GanRole> labels={[{ id: 'generator', label: '생성자' }, { id: 'discriminator', label: '감별자' }]} value={selectedAnswer} onChoose={(role) => assignGanRole(selected.id, role)} />{selectedAnswer ? selectedAnswer === selected.answer ? <Feedback correct>맞았습니다. 이 설명은 {selected.answer === 'generator' ? '새 데이터를 만드는 생성자' : '실제와 생성을 구분하는 감별자'}의 역할입니다.</Feedback> : <Feedback correct={false}>다시 연결해 보세요. 생성자는 데이터를 만들고, 감별자는 실제 데이터와 생성 데이터를 구분합니다.</Feedback> : null}</div>
      </div>
      {allCorrect ? <label className="mt-5 flex items-start gap-3 rounded-xl bg-cyan-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.ganFlowConfirmed} onChange={(event) => update((current) => ({ ...current, ganFlowConfirmed: event.target.checked }))} /><span>생성 데이터와 실제 데이터가 감별자에게 들어가고, 판단과 피드백이 학습에 이어지는 Signal Flow를 확인했습니다.</span></label> : null}
      <Button className="mt-5" disabled={!ready} onClick={props.onComplete}>STEP 2 활동 완료</Button>
      {props.isComplete ? <Completion>생성자와 감별자의 네 역할 및 Signal Flow를 정확히 연결했습니다.</Completion> : null}
    </StepFrame>
  )
}

export function Lesson10Step3(props: CommonStepProps) {
  const { activity, update } = useLesson10()
  const allRoundsChecked = [1, 2, 3, 4].every((round) => activity.checkedGanRounds.includes(round))
  const currentChecked = activity.checkedGanRounds.includes(activity.currentGanRound)
  const ready = allRoundsChecked && activity.ganSimulationConfirmed
  const confirmRound = () => update((current) => ({ ...current, checkedGanRounds: [...new Set([...current.checkedGanRounds, current.currentGanRound])] }))
  const nextRound = () => update((current) => ({ ...current, currentGanRound: Math.min(4, current.currentGanRound + 1) }))
  const restart = () => update((current) => ({ ...current, currentGanRound: 1 }))

  return (
    <StepFrame {...props} step={3} intro="정해진 네 라운드를 차례로 살펴보며 두 신경망이 서로의 결과에 영향을 주는 원리를 관찰합니다.">
      <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5" role="note"><h3 className="font-black text-amber-950">GAN 원리 시뮬레이션</h3><p className="mt-2 text-sm leading-6 text-amber-900">실제 GAN을 학습하거나 실제 이미지를 생성하는 기능이 아니라, 생성자와 감별자의 관계를 설명하는 교육용 시뮬레이션입니다.</p></div>
      <div className="mt-6"><GanSimulation round={activity.currentGanRound} /></div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button onClick={confirmRound} disabled={currentChecked}><CheckCircle2 size={18} /> {currentChecked ? `Round ${activity.currentGanRound} 확인 완료` : `Round ${activity.currentGanRound} 내용 확인`}</Button>
        {activity.currentGanRound < 4 ? <Button variant="secondary" onClick={nextRound} disabled={!currentChecked}>다음 라운드 <ArrowRight size={18} /></Button> : <Button variant="secondary" onClick={restart}><RotateCcw size={17} /> Round 1부터 다시 보기</Button>}
      </div>
      <p className="mt-3 text-sm font-bold" aria-live="polite">확인한 Round: {[1, 2, 3, 4].filter((round) => activity.checkedGanRounds.includes(round)).join(', ') || '아직 없음'}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-violet-50 p-4 text-sm leading-6"><strong>생성자</strong><br />감별자를 속일 만큼 그럴듯한 데이터를 만들도록 학습합니다.</div>
        <div className="rounded-xl bg-orange-50 p-4 text-sm leading-6"><strong>감별자</strong><br />실제 데이터와 생성 데이터를 더 잘 구분하도록 학습합니다.</div>
        <div className="rounded-xl bg-cyan-50 p-4 text-sm leading-6"><strong>함께 변화</strong><br />두 모델은 서로 경쟁하면서 함께 변화하며, 한 번의 판단으로 학습이 끝나지 않습니다.</div>
        <div className="rounded-xl bg-slate-100 p-4 text-sm leading-6"><strong>실제 결과</strong><br />데이터와 학습 조건에 따라 달라지며 특정 정확도나 성공을 보장하지 않습니다.</div>
      </div>
      {allRoundsChecked ? <label className="mt-5 flex items-start gap-3 rounded-xl bg-amber-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.ganSimulationConfirmed} onChange={(event) => update((current) => ({ ...current, ganSimulationConfirmed: event.target.checked }))} /><span>화면의 도형과 네 단계는 GAN 학습 결과가 아니라 원리를 설명하기 위한 결정론적 고정 예시임을 확인했습니다.</span></label> : null}
      <Button className="mt-5" disabled={!ready} onClick={props.onComplete}>STEP 3 활동 완료</Button>
      {props.isComplete ? <Completion>Round 1~4의 변화와 교육용 고정 시뮬레이션이라는 범위를 확인했습니다.</Completion> : null}
    </StepFrame>
  )
}

const speechOptions = [
  { id: 'A', text: '안녕하세요' },
  { id: 'B', text: '사람의 감정을 그림으로 생성' },
  { id: 'C', text: '이미지에서 사람의 위치 탐지' },
  { id: 'D', text: '새로운 음악 생성' },
] as const

export function Lesson10Step4(props: CommonStepProps) {
  const { activity, update } = useLesson10()
  const ready = activity.speechSubmitted && activity.speechFlowConfirmed
  const choose = (answer: string) => update((current) => ({ ...current, speechAnswer: answer, speechSubmitted: false, speechCorrect: false }))
  const submit = () => update((current) => ({ ...current, speechSubmitted: true, speechCorrect: current.speechAnswer === 'A' }))
  const retry = () => update((current) => ({ ...current, speechAnswer: '', speechSubmitted: false, speechCorrect: false }))

  return (
    <StepFrame {...props} step={4} intro="말소리가 음성 인식을 거쳐 글자로 바뀌는 첫 흐름을 확인합니다.">
      <PartBadge>PART B — 음성 인식</PartBadge>
      <Notice><strong>음성 인식</strong>은 사람의 말소리를 분석하여 텍스트 데이터로 바꾸는 기술입니다.</Notice>
      <div className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
        <WaveformVisualizer cycles={4} label="사람의 말소리를 나타낸 단순화한 파형" />
        <div className="mt-4 flex flex-col items-stretch gap-2 text-center font-black sm:flex-row sm:items-center">
          <span className="rounded-xl bg-white p-3 sm:flex-1">사람의 말소리<br />“문이 닫힙니다.”</span><ArrowDown className="mx-auto sm:hidden" aria-hidden="true" /><ArrowRight className="hidden shrink-0 sm:block" aria-hidden="true" /><span className="rounded-xl bg-violet-100 p-3 sm:flex-1">음성 인식</span><ArrowDown className="mx-auto sm:hidden" aria-hidden="true" /><ArrowRight className="hidden shrink-0 sm:block" aria-hidden="true" /><span className="rounded-xl bg-white p-3 sm:flex-1">텍스트<br />“문이 닫힙니다.”</span>
        </div>
      </div>
      <fieldset className="mt-7 rounded-2xl border border-slate-200 p-5">
        <legend className="px-2 font-black">사람이 “안녕하세요”라고 말했습니다. 음성 인식의 결과는 무엇일까요?</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">{speechOptions.map((option) => <button key={option.id} type="button" disabled={activity.speechSubmitted} aria-pressed={activity.speechAnswer === option.id} onClick={() => choose(option.id)} className={`min-h-12 rounded-xl border p-3 text-left font-bold disabled:cursor-not-allowed ${activity.speechAnswer === option.id ? 'border-violet-600 bg-violet-50' : 'border-slate-300 bg-white'}`}>{option.id}. {option.text}</button>)}</div>
        {!activity.speechSubmitted ? <Button className="mt-4" disabled={!activity.speechAnswer} onClick={submit}>정답 제출</Button> : null}
      </fieldset>
      {activity.speechSubmitted ? <Feedback correct={activity.speechCorrect}><strong>{activity.speechCorrect ? '정답입니다.' : '오답입니다.'}</strong> 음성 인식 결과는 먼저 텍스트입니다. 그 텍스트가 어떤 의미인지 파악하는 과정은 자연어 처리와 관련됩니다.{!activity.speechCorrect ? <Button className="mt-3" variant="secondary" onClick={retry}><RotateCcw size={17} /> 다시 풀기</Button> : null}</Feedback> : null}
      <label className="mt-5 flex items-start gap-3 rounded-xl bg-cyan-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.speechFlowConfirmed} onChange={(event) => update((current) => ({ ...current, speechFlowConfirmed: event.target.checked }))} /><span>사람의 말소리 → 음성 인식 → 텍스트 흐름을 확인했습니다.</span></label>
      <Button className="mt-5" disabled={!ready} onClick={props.onComplete}>STEP 4 활동 완료</Button>
      {props.isComplete ? <Completion>음성 인식이 말소리를 먼저 텍스트로 바꾸는 기술임을 확인했습니다.</Completion> : null}
    </StepFrame>
  )
}

const waves = [
  { id: 'low', label: '파형 A · 진동 횟수가 적음', cycles: 2 },
  { id: 'middle', label: '파형 B · 진동 횟수가 중간', cycles: 4 },
  { id: 'high', label: '파형 C · 진동 횟수가 많음', cycles: 7 },
] as const

export function Lesson10Step5(props: CommonStepProps) {
  const { activity, update } = useLesson10()
  const [frequencySubmitted, setFrequencySubmitted] = useState(false)
  const [sentenceSubmitted, setSentenceSubmitted] = useState(false)
  const allStagesViewed = SPEECH_STAGES.every((stage) => activity.speechStagesViewed.includes(stage))
  const ready = activity.frequencyCorrect && activity.frequencyConfirmed && allStagesViewed && activity.sentenceCorrect
  const checkFrequency = () => {
    const correct = activity.highWave === 'high' && activity.lowWave === 'low'
    update((current) => ({ ...current, frequencyCorrect: correct }))
    setFrequencySubmitted(true)
  }
  const chooseSentence = (value: string) => {
    update((current) => ({ ...current, sentenceChoice: value, sentenceCorrect: false }))
    setSentenceSubmitted(false)
  }
  const checkSentence = () => {
    update((current) => ({ ...current, sentenceCorrect: current.sentenceChoice === 'close' }))
    setSentenceSubmitted(true)
  }

  return (
    <StepFrame {...props} step={5} intro="음성의 여러 특징과 말소리 단위, 주변 정보를 거쳐 텍스트 후보를 고르는 과정을 탐색합니다.">
      <div className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-violet-200 bg-violet-50 p-5"><h3 className="font-black">주파수</h3><p className="mt-2 leading-7">1초 동안 진동하는 횟수를 나타내며 소리의 높낮이와 관련된 특징</p></div><div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5"><h3 className="font-black">음소</h3><p className="mt-2 leading-7">언어를 구성하는 가장 작은 소리 단위</p></div></div>
      <Notice>음성 인식에서는 <strong>주파수를 포함한 여러 음성 특징</strong>을 분석하여 말소리를 구분합니다. 주파수 하나나 파형 하나만으로 음소·글자·문장을 정확히 결정할 수는 없습니다.</Notice>

      <fieldset className="mt-7 rounded-2xl border border-slate-200 p-5">
        <legend className="px-2 font-black">단순화한 파형 예시를 비교하세요.</legend>
        <p className="mb-4 text-sm leading-6 text-slate-600">정밀한 음향 분석 결과가 아니라, 같은 너비 안의 진동 횟수 차이만 보여 주는 예시입니다.</p>
        <div className="grid gap-4 md:grid-cols-3">{waves.map((wave) => <div key={wave.id} className="rounded-2xl border border-slate-200 p-3"><WaveformVisualizer cycles={wave.cycles} label={wave.label} selected={activity.highWave === wave.id || activity.lowWave === wave.id} /><p className="mt-2 text-center text-sm font-black">{wave.label}</p><div className="mt-3 grid grid-cols-2 gap-2"><button type="button" aria-pressed={activity.highWave === wave.id} onClick={() => { update((current) => ({ ...current, highWave: wave.id, frequencyCorrect: false })); setFrequencySubmitted(false) }} className={`min-h-11 rounded-lg border text-xs font-bold ${activity.highWave === wave.id ? 'border-rose-600 bg-rose-50' : 'border-slate-300'}`}>가장 높음</button><button type="button" aria-pressed={activity.lowWave === wave.id} onClick={() => { update((current) => ({ ...current, lowWave: wave.id, frequencyCorrect: false })); setFrequencySubmitted(false) }} className={`min-h-11 rounded-lg border text-xs font-bold ${activity.lowWave === wave.id ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>가장 낮음</button></div></div>)}</div>
        <Button className="mt-5" disabled={!activity.highWave || !activity.lowWave} onClick={checkFrequency}>파형 비교 제출</Button>
      </fieldset>
      {frequencySubmitted ? activity.frequencyCorrect ? <Feedback correct>맞았습니다. 같은 시간 동안 진동 횟수가 많은 C가 가장 높고, 적은 A가 가장 낮은 주파수 예시입니다.</Feedback> : <Feedback correct={false}>같은 시간 너비 안에서 곡선이 몇 번 위아래로 반복되는지 다시 세어 보세요.</Feedback> : null}
      {activity.frequencyCorrect ? <label className="mt-4 flex items-start gap-3 rounded-xl bg-violet-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.frequencyConfirmed} onChange={(event) => update((current) => ({ ...current, frequencyConfirmed: event.target.checked }))} /><span>같은 시간 기준으로 진동 횟수가 많을수록 주파수가 높다는 설명을 확인했습니다.</span></label> : null}

      <div className="mt-8 border-t border-slate-200 pt-7"><h3 className="text-xl font-black">말소리에서 텍스트까지</h3><p className="mt-2 text-sm text-slate-600">각 단계를 눌러 어떤 순서로 이어지는지 모두 확인하세요.</p><div className="mt-4"><SpeechRecognitionFlow viewed={activity.speechStagesViewed} onView={(stage) => update((current) => ({ ...current, speechStagesViewed: [...new Set([...current.speechStagesViewed, stage])] }))} /></div></div>

      <fieldset className="mt-8 rounded-2xl border border-slate-200 p-5"><legend className="px-2 font-black">일부 말소리가 불분명할 때 더 자연스러운 문장을 선택하세요.</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{[{ id: 'hurt', text: '문이 다칩니다.' }, { id: 'close', text: '문이 닫힙니다.' }].map((item) => <button key={item.id} type="button" disabled={sentenceSubmitted && activity.sentenceCorrect} aria-pressed={activity.sentenceChoice === item.id} onClick={() => chooseSentence(item.id)} className={`min-h-12 rounded-xl border p-3 font-bold ${activity.sentenceChoice === item.id ? 'border-violet-600 bg-violet-50' : 'border-slate-300'}`}>{item.text}</button>)}</div><Button className="mt-4" disabled={!activity.sentenceChoice || activity.sentenceCorrect} onClick={checkSentence}>문장 후보 제출</Button></fieldset>
      {sentenceSubmitted ? activity.sentenceCorrect ? <Feedback correct>맞았습니다. 사람마다 발음·속도·억양이 다르고 일부 소리가 불분명할 수 있습니다. 딥러닝 방식은 많은 음성 데이터의 패턴과 주변 정보를 이용해 가능한 텍스트를 예측하지만 모든 상황의 정답을 보장하지는 않습니다.</Feedback> : <Feedback correct={false}>“문”과 자연스럽게 연결되는 행동을 생각해 다른 문장 후보를 선택해 보세요.</Feedback> : null}
      <Button className="mt-6" disabled={!ready} onClick={props.onComplete}>STEP 5 활동 완료</Button>
      {props.isComplete ? <Completion>파형의 진동 횟수를 비교하고 음성 특징에서 문장 후보를 거쳐 텍스트가 되는 흐름을 확인했습니다.</Completion> : null}
    </StepFrame>
  )
}

export function Lesson10Step6(props: CommonStepProps) {
  const { activity, update, assignRecognition } = useLesson10()
  const [selectedId, setSelectedId] = useState<string>(RECOGNITION_CARDS[0].id)
  const selected = RECOGNITION_CARDS.find((item) => item.id === selectedId) ?? RECOGNITION_CARDS[0]
  const selectedAnswer = activity.recognitionAssignments[selected.id]
  const allCorrect = RECOGNITION_CARDS.every((item) => activity.recognitionAssignments[item.id] === item.answer)
  const ready = allCorrect && activity.recognitionComparisonConfirmed

  return (
    <StepFrame {...props} step={6} intro="사람이 규칙을 미리 쓰는 방식과 데이터에서 패턴을 학습하는 방식을 비교합니다.">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5"><h3 className="font-black text-orange-950">규칙 기반 if-then 방식</h3><ul className="mt-3 grid gap-2 text-sm leading-6"><li>• 사람이 음성 처리 규칙을 미리 작성합니다.</li><li>• 정해진 상황에서는 사용할 수 있습니다.</li><li>• 규칙과 크게 다른 발음에는 대응하기 어렵습니다.</li><li>• 크기·속도·억양의 모든 경우를 사람이 쓰기 어렵습니다.</li></ul></div>
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5"><h3 className="font-black text-violet-950">딥러닝 방식</h3><ul className="mt-3 grid gap-2 text-sm leading-6"><li>• 많은 음성 데이터에서 패턴을 학습합니다.</li><li>• 다양한 발음 사례를 데이터로 학습할 수 있습니다.</li><li>• 학습한 패턴으로 가능한 텍스트를 예측합니다.</li><li>• 데이터와 환경에 따라 결과가 달라질 수 있습니다.</li></ul></div>
      </div>
      <Notice>딥러닝은 다양한 사례를 학습할 수 있지만 어떤 목소리도 완벽하게 인식하는 것은 아닙니다.</Notice>
      <div className="mt-7 grid gap-4 lg:grid-cols-2"><div><h3 className="font-black">① 설명 카드 선택</h3><div className="mt-3 grid gap-2">{RECOGNITION_CARDS.map((item, index) => {
        const answer = activity.recognitionAssignments[item.id]
        const correct = answer === item.answer
        return <button key={item.id} type="button" aria-pressed={selected.id === item.id} onClick={() => setSelectedId(item.id)} className={`min-h-14 rounded-xl border p-3 text-left ${selected.id === item.id ? 'border-violet-600 bg-violet-50' : 'border-slate-200'}`}><span className="font-black">설명 {index + 1}</span><span className="mt-1 block text-sm">{item.text}</span>{answer ? <span className={`mt-1 block text-xs font-bold ${correct ? 'text-emerald-700' : 'text-rose-700'}`}>{correct ? '✓ 정확히 분류함' : '✕ 다시 분류 필요'}</span> : null}</button>
      })}</div></div><div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><h3 className="font-black">② 선택한 설명 분류</h3><p className="mt-3 rounded-xl bg-white p-4 font-bold">{selected.text}</p><CategoryButtons<RecognitionMethod> labels={[{ id: 'rules', label: '규칙 기반 방식' }, { id: 'deep-learning', label: '딥러닝 방식' }]} value={selectedAnswer} onChoose={(method) => assignRecognition(selected.id, method)} />{selectedAnswer ? selectedAnswer === selected.answer ? <Feedback correct>맞았습니다. {selected.answer === 'rules' ? '사람이 정한 규칙에 기대는 방식의 특징입니다.' : '음성 데이터에서 패턴을 학습하는 방식의 특징입니다.'}</Feedback> : <Feedback correct={false}>규칙을 사람이 직접 만드는지, 많은 데이터에서 패턴을 학습하는지 기준으로 다시 분류하세요.</Feedback> : null}</div></div>
      {allCorrect ? <label className="mt-5 flex items-start gap-3 rounded-xl bg-cyan-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.recognitionComparisonConfirmed} onChange={(event) => update((current) => ({ ...current, recognitionComparisonConfirmed: event.target.checked }))} /><span>규칙 기반 방식과 딥러닝 방식 모두 사용할 조건이 있으며, 각각 장점과 한계가 있음을 확인했습니다.</span></label> : null}
      <Button className="mt-5" disabled={!ready} onClick={props.onComplete}>STEP 6 활동 완료</Button>
      {props.isComplete ? <Completion>네 설명을 정확히 분류하고 두 방식의 차이와 한계를 확인했습니다.</Completion> : null}
    </StepFrame>
  )
}

interface QuizDefinition {
  id: number
  question: string
  options: Array<{ id: string; text: string }>
  answer: string
  explanation: string
}

const quiz: QuizDefinition[] = [
  { id: 1, question: '생성형 인공지능의 특징으로 가장 적절한 것은?', options: [{ id: 'A', text: '학습한 데이터를 바탕으로 새로운 콘텐츠를 생성한다.' }, { id: 'B', text: '파일만 저장한다.' }, { id: 'C', text: '모든 데이터를 삭제한다.' }, { id: 'D', text: '이미지 분류만 가능하다.' }], answer: 'A', explanation: '생성형 인공지능은 기존 콘텐츠에서 학습한 패턴을 바탕으로 새로운 콘텐츠를 만듭니다.' },
  { id: 2, question: 'GAN에서 새로운 데이터를 만드는 모델은?', options: [{ id: 'A', text: '생성자' }, { id: 'B', text: '감별자' }, { id: 'C', text: '출력층' }, { id: 'D', text: '풀링층' }], answer: 'A', explanation: '생성자는 실제 데이터와 비슷한 새 데이터를 만드는 신경망입니다.' },
  { id: 3, question: 'GAN에서 실제 데이터와 생성 데이터를 구분하는 모델은?', options: [{ id: 'A', text: '생성자' }, { id: 'B', text: '감별자' }, { id: 'C', text: '입력층' }, { id: 'D', text: '활성화 함수' }], answer: 'B', explanation: '감별자는 주어진 데이터가 실제인지 생성자가 만든 것인지 구분합니다.' },
  { id: 4, question: '음성 인식의 역할은?', options: [{ id: 'A', text: '사람의 말소리를 텍스트로 변환' }, { id: 'B', text: '이미지를 분할' }, { id: 'C', text: '숫자를 정규화' }, { id: 'D', text: '새로운 이미지만 생성' }], answer: 'A', explanation: '음성 인식은 사람의 말소리를 분석해 텍스트 데이터로 바꾸는 기술입니다.' },
  { id: 5, question: '딥러닝 음성 인식에 대한 설명으로 적절한 것은?', options: [{ id: 'A', text: '많은 음성 데이터의 패턴을 학습할 수 있다.' }, { id: 'B', text: '사람의 발음 차이는 전혀 존재하지 않는다.' }, { id: 'C', text: '반드시 하나의 주파수만 사용한다.' }, { id: 'D', text: '모든 규칙을 사람이 직접 작성한다.' }], answer: 'A', explanation: '딥러닝 방식은 많은 음성 데이터에서 발음과 주변 정보의 패턴을 학습할 수 있습니다.' },
  { id: 6, question: '다음 중 올바른 연결은?', options: [{ id: 'A', text: '음성 인식 → 말소리를 텍스트로 변환 / 자연어 처리 → 텍스트의 의미와 문맥 처리' }, { id: 'B', text: '음성 인식 → 이미지 분류 / 자연어 처리 → 풀링' }, { id: 'C', text: '음성 인식 → GAN 학습 / 자연어 처리 → 픽셀 정규화' }], answer: 'A', explanation: '음성 인식은 소리를 텍스트로 바꾸고, 자연어 처리는 그 텍스트의 단어·의미·문맥을 처리합니다.' },
]

interface Step7Props extends CommonStepProps {
  priorStepsComplete: boolean
  onCompletionReadyChange: (ready: boolean) => void
}

export function Lesson10Step7({ priorStepsComplete, onCompletionReadyChange, ...props }: Step7Props) {
  const { activity, update, assignLanguageProcess } = useLesson10()
  const [selectedId, setSelectedId] = useState<string>(LANGUAGE_PROCESS_CARDS[0].id)
  const selected = LANGUAGE_PROCESS_CARDS.find((item) => item.id === selectedId) ?? LANGUAGE_PROCESS_CARDS[0]
  const selectedAnswer = activity.languageAssignments[selected.id]
  const languageCorrect = LANGUAGE_PROCESS_CARDS.every((item) => activity.languageAssignments[item.id] === item.answer)
  const allUsesViewed = SPEECH_USES.every((item) => activity.speechUsesViewed.includes(item.id))
  const allQuizSubmitted = quiz.every((item) => activity.quizSubmitted.includes(item.id))
  const ready = languageCorrect && allUsesViewed && allQuizSubmitted

  useEffect(() => {
    onCompletionReadyChange(priorStepsComplete && props.isComplete)
    return () => onCompletionReadyChange(false)
  }, [onCompletionReadyChange, priorStepsComplete, props.isComplete])

  const selectQuiz = (id: number, answer: string) => update((current) => ({ ...current, quizAnswers: { ...current.quizAnswers, [id]: answer } }))
  const submitQuiz = (definition: QuizDefinition) => update((current) => ({ ...current, quizSubmitted: [...new Set([...current.quizSubmitted, definition.id])], quizCorrect: current.quizAnswers[String(definition.id)] === definition.answer ? [...new Set([...current.quizCorrect, definition.id])] : current.quizCorrect.filter((id) => id !== definition.id) }))
  const retryQuiz = (id: number) => update((current) => ({ ...current, quizSubmitted: current.quizSubmitted.filter((item) => item !== id), quizCorrect: current.quizCorrect.filter((item) => item !== id), quizAnswers: { ...current.quizAnswers, [id]: '' } }))

  return (
    <StepFrame {...props} step={7} intro="AI가 새 콘텐츠를 만드는 과정과, 말소리를 글자로 바꾸고 의미를 처리하는 과정을 구분해 정리합니다.">
      <p className="mb-5 text-lg font-black text-slate-900">AI는 만들고, 듣고, 이해합니다. 세 과정의 역할을 흐름으로 정리해 봅시다.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5"><p className="text-sm font-black text-violet-800">생성형 인공지능</p><div className="mt-4 grid gap-2 text-center font-black"><span className="rounded-xl bg-white p-3">학습 데이터의 패턴</span><ArrowDown className="mx-auto" aria-hidden="true" /><span className="rounded-xl bg-white p-3">새로운 콘텐츠 생성</span><span className="mt-2 text-sm">GAN: 생성자 ↔ 감별자</span></div></div>
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5"><p className="text-sm font-black text-cyan-800">음성 인식</p><div className="mt-4 grid gap-2 text-center font-black"><span className="rounded-xl bg-white p-3">말소리</span><ArrowDown className="mx-auto" aria-hidden="true" /><span className="rounded-xl bg-white p-3">음성 특징 분석</span><ArrowDown className="mx-auto" aria-hidden="true" /><span className="rounded-xl bg-white p-3">텍스트 변환</span></div></div>
      </div>
      <Notice><strong>음성 인식</strong>은 사람의 말소리를 분석하여 텍스트 데이터로 바꾸고, <strong>자연어 처리</strong>는 텍스트에 담긴 단어, 의미와 문맥을 분석하고 처리합니다.<br /><span className="mt-2 block font-bold">사람의 말소리 → 음성 인식 → 텍스트 → 자연어 처리 → 의미와 문맥 처리</span></Notice>

      <div className="mt-7 grid gap-4 lg:grid-cols-2"><div><h3 className="font-black">① “오늘 날씨 알려 줘.” 처리 카드</h3><div className="mt-3 grid gap-2">{LANGUAGE_PROCESS_CARDS.map((item, index) => {
        const answer = activity.languageAssignments[item.id]
        const correct = answer === item.answer
        return <button key={item.id} type="button" aria-pressed={selected.id === item.id} onClick={() => setSelectedId(item.id)} className={`min-h-16 rounded-xl border p-3 text-left ${selected.id === item.id ? 'border-violet-600 bg-violet-50' : 'border-slate-200'}`}><span className="font-black">과정 {index + 1}</span><span className="mt-1 block text-sm">{item.text}</span>{answer ? <span className={`mt-1 block text-xs font-bold ${correct ? 'text-emerald-700' : 'text-rose-700'}`}>{correct ? '✓ 정확히 연결함' : '✕ 다시 연결 필요'}</span> : null}</button>
      })}</div></div><div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><h3 className="font-black">② 선택한 과정 연결</h3><p className="mt-3 rounded-xl bg-white p-4 font-bold">{selected.text}</p><CategoryButtons<LanguageProcess> labels={[{ id: 'speech-recognition', label: '음성 인식' }, { id: 'natural-language', label: '자연어 처리' }]} value={selectedAnswer} onChoose={(process) => assignLanguageProcess(selected.id, process)} />{selectedAnswer ? selectedAnswer === selected.answer ? <Feedback correct>맞았습니다. {selected.answer === 'speech-recognition' ? '말소리를 글자로 바꾸는 과정은 음성 인식입니다.' : '텍스트의 요청 의미를 파악하는 과정은 자연어 처리입니다.'}</Feedback> : <Feedback correct={false}>소리→글자와 글자→의미 중 어느 과정인지 다시 구분해 보세요.</Feedback> : null}</div></div>

      <div className="mt-8 border-t border-slate-200 pt-7"><h3 className="text-xl font-black">음성 인식 활용 사례</h3><p className="mt-2 text-sm text-slate-600">네 사례를 모두 눌러 설명을 확인하세요. 외부 서비스에는 연결되지 않습니다.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{SPEECH_USES.map((item) => {
        const viewed = activity.speechUsesViewed.includes(item.id)
        return <button key={item.id} type="button" aria-pressed={viewed} onClick={() => update((current) => ({ ...current, speechUsesViewed: [...new Set([...current.speechUsesViewed, item.id])] }))} className={`min-h-28 rounded-2xl border p-4 text-left ${viewed ? 'border-cyan-600 bg-cyan-50' : 'border-slate-200 bg-white'}`}><span className="flex items-center gap-2 font-black"><Volume2 size={18} aria-hidden="true" />{item.title}</span><span className="mt-2 block text-sm leading-6">{viewed ? `✓ 확인함 · ${item.detail}` : '눌러서 설명 확인'}</span></button>
      })}</div></div>

      <div className="mt-8 border-t border-slate-200 pt-7"><h3 className="text-xl font-black">확인 문제 6개</h3><p className="mt-2 text-sm leading-6 text-slate-600">각 문제를 제출하면 아이콘과 글로 결과를 확인합니다. 오답은 해설을 읽고 다시 풀 수 있습니다.</p><div className="mt-5 grid gap-5">{quiz.map((definition) => {
        const answer = activity.quizAnswers[String(definition.id)]
        const submitted = activity.quizSubmitted.includes(definition.id)
        const correct = activity.quizCorrect.includes(definition.id)
        return <fieldset key={definition.id} className="rounded-2xl border border-slate-200 p-5"><legend className="px-2 font-black">문제 {definition.id}. {definition.question}</legend><div className="mt-3 grid gap-2">{definition.options.map((option) => <button key={option.id} type="button" disabled={submitted} aria-pressed={answer === option.id} onClick={() => selectQuiz(definition.id, option.id)} className={`min-h-12 rounded-xl border p-3 text-left text-sm font-bold disabled:cursor-not-allowed ${answer === option.id ? 'border-violet-600 bg-violet-50' : 'border-slate-300 bg-white'}`}>{option.id}. {option.text}</button>)}</div>{!submitted ? <Button className="mt-4" disabled={!answer} onClick={() => submitQuiz(definition)}>문제 {definition.id} 제출</Button> : <Feedback correct={correct}><strong>{correct ? '정답입니다.' : '오답입니다.'}</strong> {definition.explanation}{!correct ? <Button className="mt-3" variant="secondary" onClick={() => retryQuiz(definition.id)}><RotateCcw size={17} /> 오답 다시 풀기</Button> : null}</Feedback>}</fieldset>
      })}</div></div>

      <Button className="mt-7" disabled={!ready} onClick={props.onComplete}><Sparkles size={18} /> STEP 7 활동 완료</Button>
      {props.isComplete ? <div className="mt-8 rounded-3xl bg-slate-950 p-6 text-white sm:p-8"><p className="text-sm font-black tracking-[0.16em] text-emerald-300">LESSON 10 SIGNAL FLOW COMPLETE</p><h3 className="mt-2 text-2xl font-black">만들기, 듣기, 의미 처리를 올바른 흐름으로 연결했습니다.</h3><div className="mt-6 border-t border-slate-700 pt-6"><p className="text-sm font-bold text-cyan-300">Lesson 11 연결 질문</p><p className="mt-2 text-lg font-black">말소리를 텍스트로 바꾼 다음, AI는 글자를 어떻게 숫자로 표현하고 단어의 의미와 문맥을 이해할까요?</p><Link to="/lesson/11" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 font-bold text-slate-950">Lesson 11 미리 보기 <ArrowRight size={18} /></Link></div></div> : null}
    </StepFrame>
  )
}
