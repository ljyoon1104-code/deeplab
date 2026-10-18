import {
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
import GanSimulation, { PreviousGanPattern } from './GanSimulation'
import GeneratorDiscriminatorFlow from './GeneratorDiscriminatorFlow'
import {
  GAN_ROLE_CARDS,
  GAN_ROUNDS,
  GENERATION_CATEGORIES,
  GENERATION_SCENARIOS,
  LANGUAGE_PROCESS_CARDS,
  RECOGNITION_CARDS,
  SERVICE_SCENARIOS,
  SPEECH_USES,
  SPEECH_METHOD_SCENARIOS,
  TECHNOLOGY_CARDS,
  lesson10StepTitles,
  type GanRole,
  type GenerationCategory,
  type LanguageProcess,
  type RecognitionMethod,
} from './lesson10Data'
import { useLesson10 } from './Lesson10Context'
import SpeechRecognitionFlow, { SpeechConceptGuide } from './SpeechRecognitionFlow'
import WaveformVisualizer from './WaveformVisualizer'
import { GenerationPhotoComparison, Lesson10Recap, SpeechCandidateClues, SpeechSituation } from './Lesson10Examples'
import ActivityCaseNavigation from './ActivityCaseNavigation'

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
        <h2 id={titleId} tabIndex={active ? -1 : undefined} style={{ scrollMarginTop: '16rem' }} className="step-focus-target mt-4 break-words text-2xl font-black leading-snug tracking-tight text-slate-950 focus:outline-none sm:text-3xl">{lesson10StepTitles[step - 1]}</h2>
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

function ActivityGuide({ items, complete }: { items: Array<[string, boolean]>; complete: boolean }) {
  return <aside className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4" aria-label="활동 완료 안내">
    <p className="text-sm font-black">{complete ? '완료한 STEP입니다. 아래에서 복습할 수 있습니다.' : '할 일과 완료 조건 · 설명 읽기만으로 완료되지 않습니다.'}</p>
    <ul className="mt-2 grid gap-1 text-sm leading-6" aria-live="polite">{items.map(([label, done]) => <li key={label} className={done ? 'text-emerald-800' : 'text-slate-700'}>{done ? '✓ 확인됨' : '○ 남은 조건'} · {label}</li>)}</ul>
    <p className="mt-2 text-xs leading-5 text-slate-600">틀린 선택은 피드백을 보고 바꿀 수 있습니다. 설명 그림의 조작은 답안이나 완료 기록을 바꾸지 않습니다.</p>
  </aside>
}

function PartBadge({ children }: { children: ReactNode }) {
  return <p className="mb-5 inline-flex min-h-10 items-center rounded-full bg-slate-950 px-4 text-sm font-black tracking-wide text-white">{children}</p>
}

function ChoiceRow({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<[string, string]> }) {
  return <div className="mt-4"><p className="text-sm font-bold">{label}</p><div className="mt-2 grid gap-2">{options.map(([id, text]) => <button key={id} type="button" aria-pressed={value === id} onClick={() => onChange(id)} className={`min-h-11 rounded-xl border px-3 text-left text-sm font-bold ${value === id ? 'border-violet-600 bg-white text-violet-950' : 'border-slate-300 bg-white text-slate-700'}`}>{value === id ? '✓ 선택됨 · ' : ''}{text}</button>)}</div></div>
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
      <ActivityGuide complete={props.isComplete} items={[[`아홉 사례의 동작을 정확히 분류 (${GENERATION_SCENARIOS.filter(item => activity.generationAssignments[item.id] === item.answer).length}/9)`, allCorrect], ['정답 후 생성형 AI 정의와 GAN 관계 확인', activity.generationDefinitionConfirmed && activity.ganRelationConfirmed]]} />
      <PartBadge>PART A — 생성형 인공지능과 GAN</PartBadge>
      <p className="mb-4 text-sm leading-6">먼저 새 콘텐츠를 만드는 생성형 AI와 GAN의 두 신경망을 비교합니다. 이어 말소리의 특징·음소에서 텍스트를 만드는 음성 인식, 규칙과 학습의 차이, 자연어 처리와의 역할 구분을 살펴봅니다. 서로 다른 활용 분야이지 한 줄의 처리 과정은 아닙니다.</p>
      <Notice><strong>생성형 인공지능</strong>은 기존 콘텐츠에서 학습한 패턴을 바탕으로 새로운 콘텐츠를 만드는 기술 범주입니다. 한 서비스가 여러 동작을 함께 할 수 있으므로 <strong>카드에 지정한 동작만</strong> 판단하세요. 수치나 배열이 바뀌었다는 사실만으로 생성형 AI라고 하지는 않습니다.</Notice>
      <GenerationPhotoComparison active={props.active} />

      <div className="mt-7">
        <div>
          <h3 className="mb-3 font-black">직접 적용 · 입력과 결과를 근거로 동작 분류</h3>
          <ActivityCaseNavigation label="분류할 사례" items={GENERATION_SCENARIOS.map((item, index) => ({ id: item.id, label: `사례 ${index + 1}`, done: activity.generationAssignments[item.id] === item.answer }))} selected={selectedId} onSelect={setSelectedId} />
          <div className="mt-3">
            {GENERATION_SCENARIOS.map((item, index) => {
              const answer = activity.generationAssignments[item.id]
              const correct = answer === item.answer
              return <div key={item.id} hidden={selected.id !== item.id} className={`min-w-0 rounded-xl border p-3 ${selected.id === item.id ? 'border-violet-600 bg-violet-50' : 'border-slate-200 bg-white'}`}><p className="font-black">사례 {index + 1}</p><p className="mt-1 text-sm leading-6">{item.text}</p>{answer ? <p className={`mt-1 text-sm font-bold ${correct ? 'text-emerald-700' : 'text-rose-700'}`}>{correct ? '✓ 정확히 분류함' : '✕ 다시 분류 필요'}</p> : null}
                {selected.id === item.id && <div><CategoryButtons<GenerationCategory> labels={[...GENERATION_CATEGORIES]} value={selectedAnswer} onChoose={category => assignGeneration(selected.id, category)} />{selectedAnswer && <Feedback correct={correct}><strong>{correct ? '맞았습니다.' : '선택한 사례의 동작을 다시 살펴보세요.'}</strong> {item.reason}{!correct && ' 위 버튼으로 바로 수정할 수 있습니다.'}</Feedback>}</div>}
              </div>
            })}
          </div>
        </div>
      </div>
      {allCorrect ? <div className="mt-6 grid gap-3">
        <label className="flex items-start gap-3 rounded-xl bg-violet-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.generationDefinitionConfirmed} onChange={(event) => update((current) => ({ ...current, generationDefinitionConfirmed: event.target.checked }))} /><span>생성형 인공지능이 기존 콘텐츠의 패턴을 학습하여 새로운 콘텐츠를 만드는 기술임을 확인했습니다.</span></label>
        <label className="flex items-start gap-3 rounded-xl bg-cyan-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.ganRelationConfirmed} onChange={(event) => update((current) => ({ ...current, ganRelationConfirmed: event.target.checked }))} /><span><strong>GAN은 생성형 인공지능을 구현하는 대표적인 방법 중 하나</strong>이며, 모든 생성형 AI가 GAN인 것은 아님을 확인했습니다.</span></label>
      </div> : null}
      <Button className="mt-5" disabled={!ready} onClick={props.onComplete}>STEP 1 활동 완료</Button>
      {props.isComplete ? <Completion>종류·상태 판단, 모델의 콘텐츠 생성, 정해진 변환·검색·대입을 구분하고 생성형 인공지능과 GAN의 관계를 확인했습니다.</Completion> : null}
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
      <ActivityGuide complete={props.isComplete} items={[[`여섯 역할 카드 정확히 연결 (${GAN_ROLE_CARDS.filter(item => activity.ganRoleAssignments[item.id] === item.answer).length}/6)`, allCorrect], ['정답 후 데이터 흐름과 가중치 조정 확인', activity.ganFlowConfirmed]]} />
      <Notice><strong>생성적 적대 신경망(GAN)</strong>은 생성자와 감별자라는 서로 다른 두 신경망이 경쟁하며 학습하는 생성 모델입니다. 생성자는 실제와 비슷한 새 데이터를 만들고, 감별자는 실제 데이터와 생성 데이터를 구분합니다. ‘가짜 데이터’는 생성자가 만든 데이터를 가리키는 기술적 표현입니다.</Notice>
      <div className="mt-6"><GeneratorDiscriminatorFlow /></div>

      <div className="mt-7">
        <ActivityCaseNavigation label="직접 연결할 역할" items={GAN_ROLE_CARDS.map((item, index) => ({ id: item.id, label: `역할 ${index + 1}`, done: activity.ganRoleAssignments[item.id] === item.answer }))} selected={selectedId} onSelect={setSelectedId} />
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><h3 className="font-black">② 흐름 속 역할 연결</h3><p className="mt-3 rounded-xl bg-white p-4 font-bold">{selected.text}</p><CategoryButtons<GanRole> labels={[{ id: 'generator', label: '생성자' }, { id: 'discriminator', label: '감별자' }, { id: 'real-data', label: '실제 데이터' }, { id: 'feedback', label: '감별 결과와 가중치 조정' }]} value={selectedAnswer} onChoose={(role) => assignGanRole(selected.id, role)} />{selectedAnswer ? selectedAnswer === selected.answer ? <Feedback correct>맞았습니다. {selected.answer === 'generator' ? '생성자는 학습 뒤에도 주로 새 콘텐츠를 만드는 쪽입니다.' : selected.answer === 'discriminator' ? '감별자는 실제 데이터와 생성 데이터를 구분합니다.' : selected.answer === 'real-data' ? '실제 데이터는 감별자가 비교할 기준을 제공합니다.' : '감별 결과를 바탕으로 생성자와 감별자의 가중치가 조정됩니다.'}</Feedback> : <Feedback correct={false}>생성자·감별자뿐 아니라 실제 데이터의 비교 기준과 감별 결과에 따른 가중치 조정 역할도 구분해 보세요.</Feedback> : null}</div>
      </div>
      {allCorrect ? <label className="mt-5 flex items-start gap-3 rounded-xl bg-cyan-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.ganFlowConfirmed} onChange={(event) => update((current) => ({ ...current, ganFlowConfirmed: event.target.checked }))} /><span>생성 데이터와 실제 데이터가 감별자에게 들어가며, 감별 결과를 바탕으로 생성자와 감별자의 가중치가 조정되는 Signal Flow를 확인했습니다.</span></label> : null}
      <Button className="mt-5" disabled={!ready} onClick={props.onComplete}>STEP 2 활동 완료</Button>
      {props.isComplete ? <Completion>생성자와 감별자의 역할 및 Signal Flow를 정확히 연결했습니다.</Completion> : null}
    </StepFrame>
  )
}

export function Lesson10Step3(props: CommonStepProps) {
  const { activity, update } = useLesson10()
  const [predictions, setPredictions] = useState<Record<number, { similarity?: string; difficulty?: string; improve?: string }>>({})
  const allRoundsChecked = [1, 2, 3, 4].every((round) => activity.checkedGanRounds.includes(round))
  const currentChecked = activity.checkedGanRounds.includes(activity.currentGanRound)
  const prediction = predictions[activity.currentGanRound] ?? {}
  const guidedRound = activity.currentGanRound === 1
  const currentRound = GAN_ROUNDS[activity.currentGanRound - 1]
  const previousRound = GAN_ROUNDS[activity.currentGanRound - 2]
  const predictionReady = guidedRound || Boolean(prediction.similarity && prediction.difficulty)
  const allPredicted = [2, 3, 4].every((round) => {
    const item = predictions[round]
    return item?.similarity && item.difficulty
  })
  const [limitAnswer, setLimitAnswer] = useState('')
  const improvementsCorrect = [1, 2, 3, 4].every((round) => predictions[round]?.improve === 'shape')
  const ready = allRoundsChecked && allPredicted && improvementsCorrect && limitAnswer === 'limits' && activity.ganSimulationConfirmed
  const confirmRound = () => update((current) => ({ ...current, checkedGanRounds: [...new Set([...current.checkedGanRounds, current.currentGanRound])] }))
  const nextRound = () => update((current) => ({ ...current, currentGanRound: Math.min(4, current.currentGanRound + 1) }))
  const restart = () => update((current) => ({ ...current, currentGanRound: 1 }))

  return (
    <StepFrame {...props} step={3} intro="정해진 네 라운드를 차례로 살펴보며 두 신경망이 서로의 결과에 영향을 주는 원리를 관찰합니다.">
      <ActivityGuide complete={props.isComplete} items={[[`Round 결과 비교·해석 확인 (${[1, 2, 3, 4].filter(round => activity.checkedGanRounds.includes(round)).length}/4)`, allRoundsChecked], ['Round 2~4에서 이전 결과를 보고 예상 선택 (예상의 적중 여부는 채점하지 않음)', allPredicted], ['네 Round에서 남은 차이를 줄이는 방향으로 해석', improvementsCorrect], ['시뮬레이션 한계 판단과 고정 예시 확인', limitAnswer === 'limits' && activity.ganSimulationConfirmed]]} />
      <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5" role="note"><h3 className="font-black text-amber-950">GAN 원리 시뮬레이션</h3><p className="mt-2 text-sm leading-6 text-amber-900">도형은 실제 학습 결과나 손실값이 아닌 고정 교육용 예시입니다. 각 라운드에서 바뀐 위치와 남은 차이를 비교하세요. 실제 GAN은 각자의 손실 계산 → 역전파 → 가중치 수정으로 학습하며, 결과가 항상 좋아지거나 완벽해지는 것은 아닙니다.</p></div>
      {guidedRound ? <Notice><strong>Round 1 · 안내형 비교</strong><p>먼저 아래 실제 패턴과 생성 결과를 봅니다. 각 위치에서 ① 도형의 종류 ② 원의 채움 ③ 순서를 비교하세요. 네 위치 모두 모양 차이가 커 구분하기 쉬운 예입니다. 다음에는 모양과 순서의 차이를 줄이는 방향을 생각할 수 있습니다.</p><p>이 Round에서는 근거 없는 사전 예상을 요구하지 않습니다. 결과를 본 뒤 개선 방향을 직접 선택하세요.</p></Notice> : <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-5"><h3 className="font-black">Round {activity.currentGanRound} · 이전 결과를 근거로 예상</h3><p className="mt-2 rounded-xl bg-white p-3 text-sm leading-6">비교 기준: 실제 패턴 ○ ● ○ ●<br />{previousRound.judgment}<br />이전 개선 방향: {previousRound.improvement}</p><div className="mt-3"><PreviousGanPattern round={activity.currentGanRound} /></div><p className="mt-2 text-sm leading-6">이전 결과에서 남은 차이를 줄이면 어떻게 달라질까요? 두 예상을 고른 뒤 결과와 비교하세요. 예상의 적중 여부는 채점하지 않습니다.</p>
        <div className="mt-4 grid gap-4">{[
          ['similarity', '생성 결과는 실제 패턴과 얼마나 비슷할까요?', [['low', '많이 다를 것'], ['middle', '일부 비슷할 것'], ['high', '거의 비슷할 것']]],
          ['difficulty', '감별자가 구분하기는?', [['easy', '쉬울 것'], ['hard', '어려울 것']]],
        ].map(([key, label, choices]) => <div key={key as string}><p className="text-sm font-bold">{label as string}</p><div className="mt-2 flex flex-wrap gap-2">{(choices as string[][]).map(([id, text]) => <button key={id} type="button" aria-pressed={prediction[key as keyof typeof prediction] === id} onClick={() => setPredictions((current) => ({ ...current, [activity.currentGanRound]: { ...current[activity.currentGanRound], [key as string]: id } }))} className={`min-h-11 rounded-lg border px-3 text-sm font-bold ${prediction[key as keyof typeof prediction] === id ? 'border-violet-600 bg-white' : 'border-violet-200 bg-violet-100'}`}>{text}</button>)}</div></div>)}</div>
      </div>}
      {predictionReady ? <div className="mt-4"><GanSimulation key={activity.currentGanRound} round={activity.currentGanRound} showImprovement={guidedRound || prediction.improve === 'shape'} />
        {!guidedRound && <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm leading-6">내 예상: {prediction.similarity === 'low' ? '많이 다를 것' : prediction.similarity === 'middle' ? '일부 비슷할 것' : '거의 비슷할 것'} / 구분하기 {prediction.difficulty === 'easy' ? '쉬울 것' : '어려울 것'}.<br />관찰한 고정 결과: {currentRound.judgment}. 예상과 다르더라도 오답 처리하지 않습니다. 실제 패턴과 아직 다른 위치를 찾아 아래에서 해석하세요.</p>}
        <ChoiceRow label={`Round ${activity.currentGanRound} 결과 해석 · 다음에 개선할 방향은?`} value={prediction.improve ?? ''} onChange={value => setPredictions(current => ({ ...current, [activity.currentGanRound]: { ...current[activity.currentGanRound], improve: value } }))} options={[[ 'shape', '남아 있는 도형 모양·채움·순서의 차이 줄이기' ], ['nothing', '차이가 남아 있어도 아무것도 바꾸지 않기']]} />
        {prediction.improve && <Feedback correct={prediction.improve === 'shape'}>{prediction.improve === 'shape' ? '결과를 근거로 개선 방향을 해석했습니다.' : '예상이 아니라 결과 해석을 다시 확인하세요. 실제 패턴과 다른 위치가 남아 있습니다.'} {currentRound.improvement}. 실제 GAN에서는 학습 계산으로 가중치를 조정하며 사람이 도형을 고치는 것이 아닙니다.</Feedback>}
      </div> : <Notice>두 예상을 선택하면 새 고정 결과가 나타납니다. 예상의 적중 여부와 무관하게 비교·해석을 진행합니다.</Notice>}
      <div className="mt-5 flex flex-wrap gap-2">
        <Button onClick={confirmRound} disabled={currentChecked || !predictionReady || prediction.improve !== 'shape'}><CheckCircle2 size={18} /> {currentChecked ? `Round ${activity.currentGanRound} 확인 완료` : `Round ${activity.currentGanRound} 비교·해석 확인`}</Button>
        {activity.currentGanRound < 4 ? <Button variant="secondary" onClick={nextRound} disabled={!currentChecked}>다음 라운드 <ArrowRight size={18} /></Button> : <Button variant="secondary" onClick={restart}><RotateCcw size={17} /> Round 1부터 다시 보기</Button>}
      </div>
      <p className="mt-3 text-sm font-bold" aria-live="polite">확인한 Round: {[1, 2, 3, 4].filter((round) => activity.checkedGanRounds.includes(round)).join(', ') || '아직 없음'}</p>
      {allRoundsChecked && allPredicted ? <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="font-black">시뮬레이션의 한계를 판단하세요.</p><ChoiceRow label="다음 중 옳은 설명" value={limitAnswer} onChange={setLimitAnswer} options={[['limits', '더 비슷해져도 실제 데이터를 그대로 복사한 것은 아니며, 감별자를 속였다고 완벽한 결과라는 뜻도 아니다. 이 화면은 실제 학습 결과가 아닌 고정 교육용 예시다.'], ['guarantee', 'Round 4는 실제 GAN이 언제나 완벽한 콘텐츠를 만든다는 증명이다.']]} />{limitAnswer ? <Feedback correct={limitAnswer === 'limits'}>{limitAnswer === 'limits' ? '맞았습니다. 생성자와 감별자는 다른 역할을 하며, 이 고정 도형은 실제 Loss·정확도·학습 결과가 아닙니다.' : '고정 Round는 원리 설명용입니다. 실제 학습의 품질이나 성공을 보장하지 않습니다.'}</Feedback> : null}{limitAnswer === 'limits' ? <label className="mt-4 flex items-start gap-3 rounded-xl bg-white p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.ganSimulationConfirmed} onChange={(event) => update((current) => ({ ...current, ganSimulationConfirmed: event.target.checked }))} /><span>화면의 도형과 네 단계는 결정론적 고정 예시임을 확인했습니다.</span></label> : null}</div> : null}
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
  const [wave, setWave] = useState<Record<string, string>>({})
  const waveReady = wave.limit === 'many-features'
  const ready = activity.speechSubmitted && activity.speechCorrect && activity.speechFlowConfirmed && waveReady
  const choose = (answer: string) => update((current) => ({ ...current, speechAnswer: answer, speechSubmitted: false, speechCorrect: false }))
  const submit = () => update((current) => ({ ...current, speechSubmitted: true, speechCorrect: current.speechAnswer === 'A' }))
  const retry = () => update((current) => ({ ...current, speechAnswer: '', speechSubmitted: false, speechCorrect: false }))

  return (
    <StepFrame {...props} step={4} intro="말소리가 음성 인식을 거쳐 글자로 바뀌는 첫 흐름을 확인합니다.">
      <ActivityGuide complete={props.isComplete} items={[[ '음성 인식의 결과를 맞게 제출', activity.speechSubmitted && activity.speechCorrect], ['한 음성 특징의 한계 판단', waveReady], ['말소리→텍스트 흐름 확인', activity.speechFlowConfirmed]]} />
      <PartBadge>PART B — 음성 인식</PartBadge>
      <p className="mt-4 leading-7 text-slate-700">앞에서는 새로운 콘텐츠를 만드는 방법을 배웠습니다. 이제는 말소리를 텍스트로 바꾸는 다른 활용 분야를 살펴봅니다. 음성 인식은 GAN의 다음 처리 단계가 아니며, GAN이 필수인 것도 아닙니다.</p>
      <Notice><strong>음성 인식</strong>은 사람의 말소리를 분석하여 텍스트 데이터로 바꾸는 기술입니다.</Notice>
      <SpeechConceptGuide />
      <div className="mt-5 rounded-xl border border-slate-200 p-4"><ChoiceRow label="파형 하나로 문장 전체를 결정할 수 있을까?" value={wave.limit ?? ''} onChange={value => setWave(current => ({ ...current, limit: value }))} options={[[ 'many-features', '아니다. 사람·속도·환경에 따라 파형이 달라지고 여러 특징과 후보를 함께 사용한다.' ], ['one-feature', '그렇다. 주파수 하나만 알면 언제나 문장을 결정할 수 있다.']]} />
        {wave.limit && <Feedback correct={waveReady}>{waveReady ? '맞았습니다. 같은 말도 사람과 환경에 따라 파형이 달라질 수 있습니다.' : '주파수는 여러 음성 특징 중 하나입니다. 한 특징만으로 서로 다른 문장을 모두 구분할 수 있는지 생각하세요.'}</Feedback>}
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
  { id: 'low', label: '파형 A', cycles: 2 },
  { id: 'middle', label: '파형 B', cycles: 4 },
  { id: 'high', label: '파형 C', cycles: 7 },
] as const

export function Lesson10Step5(props: CommonStepProps) {
  const { activity, update } = useLesson10()
  const [frequencySubmitted, setFrequencySubmitted] = useState(false)
  const [sentenceSubmitted, setSentenceSubmitted] = useState(false)
  const [clues, setClues] = useState<Record<string, string>>({})
  const cluesCorrect = clues.sound === 'sound' && clues.context === 'context' && clues.noise === 'noise'
  const ready = activity.frequencyCorrect && activity.frequencyConfirmed && activity.sentenceCorrect && cluesCorrect
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
      <ActivityGuide complete={props.isComplete} items={[[ '세 파형을 비교해 가장 높은 것·낮은 것을 맞게 제출', activity.frequencyCorrect], ['정답 후 주파수 관계 확인', activity.frequencyConfirmed], ['문장 후보를 맞게 제출', activity.sentenceCorrect], ['음향·문맥·불확실성의 세 단서 구분', cluesCorrect]]} />
      <p className="rounded-xl bg-cyan-50 p-4 text-sm leading-6">STEP 4에서 본 주파수는 진동 횟수, 음소는 작은 말소리 단위입니다. 먼저 새 파형을 독립적으로 비교하고, 이어서 “문이 닫힙니다.”의 일부가 불분명한 상황에서 후보와 단서를 판단합니다.</p>
      <Notice>음성 인식에서는 <strong>주파수를 포함한 여러 음성 특징</strong>을 분석하여 말소리를 구분합니다. 주파수 하나나 파형 하나만으로 음소·글자·문장을 정확히 결정할 수는 없습니다.</Notice>

      <fieldset className="mt-7 rounded-2xl border border-slate-200 p-5">
        <legend className="px-2 font-black">독립 판단 · A·B·C의 주파수를 비교하세요.</legend>
        <p className="mb-4 text-sm leading-6 text-slate-600">세 그림은 같은 시간 구간입니다. 앞 안내에서 본 비교 방법을 사용해 곡선의 반복을 직접 살펴보세요. 실제 음성 분석 결과가 아니라 주파수 관계를 설명하는 그림입니다.</p>
        <div className="grid gap-4 md:grid-cols-3">{waves.map((wave) => <div key={wave.id} className="rounded-2xl border border-slate-200 p-3"><WaveformVisualizer cycles={wave.cycles} label={wave.label} selected={activity.highWave === wave.id || activity.lowWave === wave.id} /><p className="mt-2 text-center text-sm font-black">{wave.label}</p><div className="mt-3 grid grid-cols-2 gap-2"><button type="button" aria-pressed={activity.highWave === wave.id} onClick={() => { update((current) => ({ ...current, highWave: wave.id, frequencyCorrect: false })); setFrequencySubmitted(false) }} className={`min-h-11 rounded-lg border text-xs font-bold ${activity.highWave === wave.id ? 'border-rose-600 bg-rose-50' : 'border-slate-300'}`}>가장 높음</button><button type="button" aria-pressed={activity.lowWave === wave.id} onClick={() => { update((current) => ({ ...current, lowWave: wave.id, frequencyCorrect: false })); setFrequencySubmitted(false) }} className={`min-h-11 rounded-lg border text-xs font-bold ${activity.lowWave === wave.id ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>가장 낮음</button></div></div>)}</div>
        <Button className="mt-5" disabled={!activity.highWave || !activity.lowWave} onClick={checkFrequency}>파형 비교 제출</Button>
      {frequencySubmitted ? activity.frequencyCorrect ? <Feedback correct>맞았습니다. 같은 시간 동안 진동 횟수가 많은 C가 가장 높고, 적은 A가 가장 낮은 주파수 예시입니다.</Feedback> : <Feedback correct={false}>같은 시간 너비 안에서 곡선이 몇 번 위아래로 반복되는지 다시 세어 보세요.</Feedback> : null}
      {activity.frequencyCorrect ? <label className="mt-4 flex items-start gap-3 rounded-xl bg-violet-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.frequencyConfirmed} onChange={(event) => update((current) => ({ ...current, frequencyConfirmed: event.target.checked }))} /><span>같은 시간 기준으로 진동 횟수가 많을수록 주파수가 높다는 설명을 확인했습니다.</span></label> : null}
      </fieldset>

      <details className="mt-6 rounded-xl border border-slate-200 p-4"><summary className="min-h-11 cursor-pointer font-black">필요할 때 복습 · 말소리에서 텍스트까지</summary><p className="mt-2 text-sm text-slate-600">필요한 단계를 눌러 위의 세 기본 과정과 연결해 보세요. 방문 횟수 대신 아래의 문장 후보와 단서 판단으로 이해를 확인합니다.</p><div className="mt-4"><SpeechRecognitionFlow viewed={activity.speechStagesViewed} /></div></details>

      <p className="mt-6 text-sm leading-6">아래는 녹음을 듣는 문제가 아니라 주어진 상황과 텍스트 단서를 이용하는 판단 연습입니다. 실제 음성 인식에서는 음향 단서와 문맥을 함께 사용합니다.</p>
      <fieldset className="mt-8 rounded-2xl border border-slate-200 p-5"><legend className="px-2 font-black">엘리베이터 문이 닫히기 직전 안내 방송입니다. 일부 말소리가 불분명할 때 자연스러운 문장을 선택하세요.</legend><SpeechCandidateClues selected={activity.sentenceChoice} correct={activity.sentenceCorrect} /><div className="mt-3 grid gap-2 sm:grid-cols-2">{[{ id: 'hurt', text: '문이 다칩니다.' }, { id: 'close', text: '문이 닫힙니다.' }].map((item) => <button key={item.id} type="button" disabled={sentenceSubmitted && activity.sentenceCorrect} aria-pressed={activity.sentenceChoice === item.id} onClick={() => chooseSentence(item.id)} className={`min-h-12 rounded-xl border p-3 font-bold ${activity.sentenceChoice === item.id ? 'border-violet-600 bg-violet-50' : 'border-slate-300'}`}>{item.text}</button>)}</div><Button className="mt-4" disabled={!activity.sentenceChoice || activity.sentenceCorrect} onClick={checkSentence}>문장 후보 제출</Button>
      {sentenceSubmitted ? activity.sentenceCorrect ? <Feedback correct>맞았습니다. ‘문이 닫히기 직전인 엘리베이터’라는 문맥과 문이 하는 동작이 선택 근거입니다. ‘다치다’는 상처를 입는 뜻이라 이 상황에 맞지 않습니다. 실제 녹음의 소리를 확인한 결과는 아니며, 실제 인식에서는 음향 단서도 필요합니다.</Feedback> : <Feedback correct={false}>‘다치다’와 ‘닫히다’ 중 문이 움직이는 이 상황에 맞는 동작을 생각하세요. 소리만 비슷하다는 이유로 선택하지 말고 상황과 연결한 뒤 다시 제출하세요.</Feedback> : null}
      </fieldset>
      {activity.sentenceCorrect ? <div className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50 p-5"><h3 className="font-black">후보를 고를 때 쓰는 단서 구분</h3><p className="mt-2 text-sm leading-6">한 음성 특징 하나로 정답을 결정하지 않습니다. 소리와 문맥, 불확실성을 함께 고려해 텍스트 후보를 선택합니다.</p>
        <ChoiceRow label="‘닫’ 소리의 길이·높낮이·시간 변화는?" value={clues.sound ?? ''} onChange={(value) => setClues((current) => ({ ...current, sound: value }))} options={[['sound', '소리 자체에서 얻는 음향 단서'], ['context', '앞뒤 문맥 단서']]} />
        <ChoiceRow label="‘문이 ___니다’에서 자연스러운 동작을 고르는 데 도움이 되는 것은?" value={clues.context ?? ''} onChange={(value) => setClues((current) => ({ ...current, context: value }))} options={[['context', '앞뒤 단어와 문맥 단서'], ['noise', '주변 소음']]} />
        <ChoiceRow label="복도 소음 때문에 끝소리가 약하게 들리는 부분은?" value={clues.noise ?? ''} onChange={(value) => setClues((current) => ({ ...current, noise: value }))} options={[['noise', '불확실해진 부분'], ['sound', '정답을 확정하는 한 가지 특징']]} />
        {(clues.sound || clues.context || clues.noise) ? <Feedback correct={cluesCorrect}>{cluesCorrect ? '맞았습니다. 말소리 → 음성 인식 → 텍스트 → 자연어 처리 → 의미·문맥 처리의 흐름에서, 음향과 문맥은 서로 다른 역할을 합니다.' : <ul>{clues.sound !== 'sound' && <li>소리의 길이·높낮이·시간 변화는 신호 자체에서 얻는 정보입니다.</li>}{clues.context !== 'context' && <li>주변 단어와 문이 하는 동작의 관계는 문맥 단서입니다.</li>}{clues.noise !== 'noise' && <li>소음은 끝소리를 확정해 주는 정보가 아니라 판단을 어렵게 하는 원인입니다.</li>}</ul>}</Feedback> : null}
      </div> : null}
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
  const [scenarioChoices, setScenarioChoices] = useState<Record<string, string>>({})
  const [scenarioLimits, setScenarioLimits] = useState<Record<string, string>>({})
  const scenariosCorrect = SPEECH_METHOD_SCENARIOS.every((item) => scenarioChoices[item.id] === item.answer && scenarioLimits[item.id] === 'limit')
  const ready = allCorrect && scenariosCorrect && activity.recognitionComparisonConfirmed

  return (
    <StepFrame {...props} step={6} intro="사람이 규칙을 미리 쓰는 방식과 데이터에서 패턴을 학습하는 방식을 비교합니다.">
      <ActivityGuide complete={props.isComplete} items={[[`여섯 비교 카드 분류 (${RECOGNITION_CARDS.filter(item => activity.recognitionAssignments[item.id] === item.answer).length}/6)`, allCorrect], ...SPEECH_METHOD_SCENARIOS.map((item, index): [string, boolean] => [`사례 ${index + 1}: 방법과 한계 판단`, scenarioChoices[item.id] === item.answer && scenarioLimits[item.id] === 'limit']), ['두 방법의 장점과 한계 확인', activity.recognitionComparisonConfirmed]]} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5"><h3 className="font-black text-orange-950">규칙 기반 if-then 방식</h3><ul className="mt-3 grid gap-2 text-sm leading-6"><li>• 사람이 음성 처리 규칙을 미리 작성합니다.</li><li>• 정해진 상황에서는 사용할 수 있습니다.</li><li>• 규칙과 크게 다른 발음에는 대응하기 어렵습니다.</li><li>• 크기·속도·억양의 모든 경우를 사람이 쓰기 어렵습니다.</li></ul></div>
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5"><h3 className="font-black text-violet-950">딥러닝 방식</h3><ul className="mt-3 grid gap-2 text-sm leading-6"><li>• 많은 음성 데이터에서 패턴을 학습합니다.</li><li>• 다양한 발음 사례를 데이터로 학습할 수 있습니다.</li><li>• 학습한 패턴으로 가능한 텍스트를 예측합니다.</li><li>• 데이터와 환경에 따라 결과가 달라질 수 있습니다.</li></ul></div>
      </div>
      <Notice>두 방식 모두 음성 인식에 쓰이며, 딥러닝도 낯선 발음·환경에서는 오류가 납니다. 아래 비교 카드를 분류한 뒤 사례의 조건을 살펴보세요.</Notice>
      <div className="mt-7"><ActivityCaseNavigation label="직접 분류할 설명" items={RECOGNITION_CARDS.map((item, index) => ({ id: item.id, label: `설명 ${index + 1}`, done: activity.recognitionAssignments[item.id] === item.answer }))} selected={selectedId} onSelect={setSelectedId} /><div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><h3 className="font-black">현재 설명의 기준은 사람이 만들까요, 데이터에서 배울까요?</h3><p className="mt-3 rounded-xl bg-white p-4 font-bold">{selected.text}</p><CategoryButtons<RecognitionMethod> labels={[{ id: 'rules', label: '규칙 기반 방식' }, { id: 'deep-learning', label: '딥러닝 방식' }]} value={selectedAnswer} onChoose={(method) => assignRecognition(selected.id, method)} />{selectedAnswer ? selectedAnswer === selected.answer ? <Feedback correct>맞았습니다. {selected.answer === 'rules' ? '사람이 정한 규칙에 기대는 방식의 특징입니다.' : '음성 데이터에서 패턴을 학습하는 방식의 특징입니다.'}</Feedback> : <Feedback correct={false}>규칙을 사람이 직접 만드는지, 많은 데이터에서 패턴을 학습하는지 기준으로 다시 분류하세요.</Feedback> : null}</div></div>
      <div className="mt-7 rounded-2xl border border-violet-200 bg-violet-50 p-5"><h3 className="font-black">조건에 맞는 방법과 한계 판단</h3><p className="mt-2 text-sm leading-6">각 사례의 입력·인식 범위·데이터를 보고, 방법을 선택한 뒤 예상 한계를 고르세요.</p><div className="mt-4 grid gap-4">{SPEECH_METHOD_SCENARIOS.map((item, index) => <div key={item.id} className="rounded-xl bg-white p-4"><p className="font-bold">사례 {index + 1}. {item.text}</p><SpeechSituation id={item.id} /><div className="mt-3 flex flex-wrap gap-2"><button type="button" aria-pressed={scenarioChoices[item.id] === 'rules'} onClick={() => setScenarioChoices((current) => ({ ...current, [item.id]: 'rules' }))} className={`min-h-11 rounded-lg border px-3 font-bold ${scenarioChoices[item.id] === 'rules' ? 'border-violet-600 bg-violet-50' : 'border-slate-300'}`}>규칙 기반</button><button type="button" aria-pressed={scenarioChoices[item.id] === 'deep-learning'} onClick={() => setScenarioChoices((current) => ({ ...current, [item.id]: 'deep-learning' }))} className={`min-h-11 rounded-lg border px-3 font-bold ${scenarioChoices[item.id] === 'deep-learning' ? 'border-violet-600 bg-violet-50' : 'border-slate-300'}`}>딥러닝</button></div><ChoiceRow label="예상 한계" value={scenarioLimits[item.id] ?? ''} onChange={(value) => setScenarioLimits((current) => ({ ...current, [item.id]: value }))} options={[['limit', item.limit], ['always', '선택한 방식은 어떤 환경에서도 항상 정확하다.']]} />{scenarioChoices[item.id] && <Feedback correct={scenarioChoices[item.id] === item.answer && scenarioLimits[item.id] === 'limit'}><strong>{scenarioChoices[item.id] === item.answer ? '방법 선택의 근거:' : '이 사례의 조건을 다시 확인하세요:'}</strong> {item.reason}{scenarioLimits[item.id] === 'always' && <p>어떤 방식도 모든 환경의 정확도를 보장하지 않습니다. 이 사례에서는 {item.limit}</p>}{!scenarioLimits[item.id] && <p>예상 한계도 선택하여 이 사례의 판단을 완성하세요.</p>}</Feedback>}</div>)}</div>{Object.keys(scenarioChoices).length || Object.keys(scenarioLimits).length ? <Feedback correct={scenariosCorrect}>{scenariosCorrect ? '맞았습니다. 방법 선택은 데이터·발음 다양성·소음·설명 필요성과 함께 한계를 고려해야 합니다.' : '각 조건에서 가장 적절한 방법과 현실적인 한계를 함께 고르세요.'}</Feedback> : null}</div>
      {allCorrect ? <label className="mt-5 flex items-start gap-3 rounded-xl bg-cyan-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.recognitionComparisonConfirmed} onChange={(event) => update((current) => ({ ...current, recognitionComparisonConfirmed: event.target.checked }))} /><span>규칙 기반 방식과 딥러닝 방식 모두 사용할 조건이 있으며, 각각 장점과 한계가 있음을 확인했습니다.</span></label> : null}
      <Button className="mt-5" disabled={!ready} onClick={props.onComplete}>STEP 6 활동 완료</Button>
      {props.isComplete ? <Completion>여섯 설명을 정확히 분류하고 세 사례에서 두 방식의 차이와 한계를 확인했습니다.</Completion> : null}
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
  { id: 1, question: '생성형 인공지능의 특징으로 가장 적절한 것은?', options: [{ id: 'A', text: '학습한 데이터를 바탕으로 새로운 콘텐츠를 생성한다.' }, { id: 'B', text: '입력의 종류를 판단하는 기능만 뜻한다.' }, { id: 'C', text: '정해진 수만큼 밝기를 바꾸는 모든 연산을 뜻한다.' }, { id: 'D', text: '저장된 콘텐츠를 그대로 검색하는 기능만 뜻한다.' }], answer: 'A', explanation: '생성형 인공지능은 기존 콘텐츠에서 학습한 패턴을 바탕으로 새로운 콘텐츠를 만듭니다.' },
  { id: 2, question: 'GAN에서 새로운 데이터를 만드는 모델은?', options: [{ id: 'A', text: '생성자' }, { id: 'B', text: '감별자' }, { id: 'C', text: '실제 데이터 자체' }, { id: 'D', text: '생성 입력 자체' }], answer: 'A', explanation: '생성자는 실제 데이터와 비슷한 새 데이터를 만드는 신경망입니다.' },
  { id: 3, question: 'GAN에서 실제 데이터와 생성 데이터를 구분하는 모델은?', options: [{ id: 'A', text: '생성자' }, { id: 'B', text: '감별자' }, { id: 'C', text: '실제 데이터 자체' }, { id: 'D', text: '생성 입력 자체' }], answer: 'B', explanation: '감별자는 주어진 데이터가 실제인지 생성자가 만든 것인지 구분합니다.' },
  { id: 4, question: '음성 인식의 역할은?', options: [{ id: 'A', text: '사람의 말소리를 텍스트로 변환' }, { id: 'B', text: '주어진 텍스트의 의미와 문맥만 분석' }, { id: 'C', text: '주어진 텍스트를 말소리로 읽어 주기' }, { id: 'D', text: '텍스트 뒤에 이어질 새 문장 만들기' }], answer: 'A', explanation: '음성 인식은 사람의 말소리를 분석해 텍스트 데이터로 바꾸는 기술입니다.' },
  { id: 5, question: '딥러닝 음성 인식에 대한 설명으로 적절한 것은?', options: [{ id: 'A', text: '많은 음성 데이터의 패턴을 학습할 수 있다.' }, { id: 'B', text: '사람의 발음 차이는 전혀 존재하지 않는다.' }, { id: 'C', text: '반드시 하나의 주파수만 사용한다.' }, { id: 'D', text: '모든 규칙을 사람이 직접 작성한다.' }], answer: 'A', explanation: '딥러닝 방식은 많은 음성 데이터에서 발음과 주변 정보의 패턴을 학습할 수 있습니다.' },
  { id: 6, question: '다음 중 올바른 연결은?', options: [{ id: 'A', text: '음성 인식 → 말소리를 텍스트로 변환 / 자연어 처리 → 텍스트의 의미와 문맥 처리' }, { id: 'B', text: '음성 인식 → 글의 의미 처리 / 자연어 처리 → 말소리를 글자로 변환' }, { id: 'C', text: '음성 인식 → 텍스트를 읽어 주기 / 자연어 처리 → 소리의 진동 횟수만 분석' }], answer: 'A', explanation: '음성 인식은 소리를 텍스트로 바꾸고, 자연어 처리는 그 텍스트의 단어·의미·문맥을 처리합니다.' },
  { id: 7, question: 'GAN Round 1~4 고정 도형 시뮬레이션에 대한 설명으로 옳은 것은?', options: [{ id: 'A', text: 'GAN 원리를 설명하는 교육용 고정 예시이며 실제 학습 Loss나 성능 결과가 아니다.' }, { id: 'B', text: '실제 모델의 정확도를 보장한다.' }, { id: 'C', text: '감별자를 속이면 결과는 언제나 완벽하다.' }], answer: 'A', explanation: '고정 Round는 생성자와 감별자의 역할 변화를 설명할 뿐 실제 모델 학습 결과나 품질을 보장하지 않습니다.' },
  { id: 8, question: '주파수와 파형에 대한 설명으로 가장 적절한 것은?', options: [{ id: 'A', text: '같은 시간에 진동 횟수가 많으면 높은 주파수 예시가 될 수 있지만, 한 특징만으로 문장 전체를 결정할 수는 없다.' }, { id: 'B', text: '주파수 하나만 알면 항상 문장을 완벽히 알 수 있다.' }, { id: 'C', text: '사람과 환경이 달라도 파형은 항상 같다.' }], answer: 'A', explanation: '음성 인식은 높낮이·시간 변화 등 여러 음성 특징과 문맥을 함께 사용하며, 사람과 환경에 따라 파형도 달라질 수 있습니다.' },
]

// 표시 순서만 바꿉니다. 정답 ID와 저장된 A/B/C/D의 연결은 그대로 유지합니다.
const quizOptionOrder: Record<number, string[]> = {
  1: ['B', 'A', 'D', 'C'], 2: ['C', 'B', 'D', 'A'],
  3: ['B', 'A', 'D', 'C'], 4: ['B', 'C', 'A', 'D'],
  5: ['A', 'D', 'B', 'C'], 6: ['C', 'A', 'B'],
  7: ['B', 'C', 'A'], 8: ['A', 'C', 'B'],
}

interface Step7Props extends CommonStepProps {
  priorStepsComplete: boolean
  onCompletionReadyChange: (ready: boolean) => void
}


type ReviewItem = { label: string; done: boolean | null; remaining?: string }
function ReviewNavigation({ label, items, current, onChange }: { label: string; items: ReviewItem[]; current: number; onChange: (index: number) => void }) {
  const required = items.filter(item => item.done !== null)
  return <nav aria-label={label} className="my-5 rounded-xl border border-slate-300 bg-slate-50 p-3">
    <p className="text-sm font-bold" aria-live="polite">{label} · 현재 {current + 1}/{items.length} · 필수 {required.filter(item => item.done).length}/{required.length} 완료</p>
    <div className={`mt-3 grid gap-2 ${label === '확인 문제 이동' ? 'grid-cols-2 sm:grid-cols-4' : 'sm:grid-cols-2'}`}>{items.map((item, index) => <button key={item.label} type="button" aria-current={current === index ? 'step' : undefined} onClick={() => onChange(index)} className={`min-h-11 min-w-0 rounded-lg border-2 p-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-indigo-600 ${current === index ? 'border-violet-600 bg-white' : 'border-slate-200 bg-white'}`}>
      <span className="block break-keep font-bold">{item.label} · {item.done === null ? '설명' : item.done ? '✓ 완료' : '○ 남음'}</span>
      {item.done === false && item.remaining && <span className="mt-1 block leading-5">{item.remaining}</span>}
    </button>)}</div>
    <div className="mt-3 flex flex-wrap gap-2"><Button variant="secondary" disabled={current === 0} onClick={() => onChange(current - 1)}>이전 {label === '확인 문제 이동' ? '문제' : '소구간'}</Button><Button variant="secondary" disabled={current === items.length - 1} onClick={() => onChange(current + 1)}>다음 {label === '확인 문제 이동' ? '문제' : '소구간'}</Button></div>
  </nav>
}

export function Lesson10Step7({ priorStepsComplete, onCompletionReadyChange, ...props }: Step7Props) {
  const { activity, update, assignLanguageProcess } = useLesson10()
  const [section, setSection] = useState(0)
  const [quizIndex, setQuizIndex] = useState(0)
  const [selectedId, setSelectedId] = useState<string>(LANGUAGE_PROCESS_CARDS[0].id)
  const selected = LANGUAGE_PROCESS_CARDS.find((item) => item.id === selectedId) ?? LANGUAGE_PROCESS_CARDS[0]
  const selectedAnswer = activity.languageAssignments[selected.id]
  const languageCorrect = LANGUAGE_PROCESS_CARDS.every((item) => activity.languageAssignments[item.id] === item.answer)
  const allQuizCorrect = quiz.every((item) => activity.quizCorrect.includes(item.id))
  const [selectedService, setSelectedService] = useState<string>(SERVICE_SCENARIOS[0].id)
  const [serviceCards, setServiceCards] = useState<Record<string, string[]>>({})
  const [serviceSubmitted, setServiceSubmitted] = useState(false)
  const selectedServiceData = SERVICE_SCENARIOS.find((item) => item.id === selectedService) ?? SERVICE_SCENARIOS[0]
  const selectedCards = serviceCards[selectedService] ?? []
  const serviceCorrect = SERVICE_SCENARIOS.every((item) => item.answer.length === (serviceCards[item.id] ?? []).length && item.answer.every((card) => (serviceCards[item.id] ?? []).includes(card)))
  const ready = languageCorrect && serviceCorrect && allQuizCorrect

  useEffect(() => {
    onCompletionReadyChange(priorStepsComplete && props.isComplete)
    return () => onCompletionReadyChange(false)
  }, [onCompletionReadyChange, priorStepsComplete, props.isComplete])

  const selectQuiz = (id: number, answer: string) => update((current) => ({ ...current, quizAnswers: { ...current.quizAnswers, [id]: answer } }))
  const submitQuiz = (definition: QuizDefinition) => update((current) => ({ ...current, quizSubmitted: [...new Set([...current.quizSubmitted, definition.id])], quizCorrect: current.quizAnswers[String(definition.id)] === definition.answer ? [...new Set([...current.quizCorrect, definition.id])] : current.quizCorrect.filter((id) => id !== definition.id) }))
  const retryQuiz = (id: number) => update((current) => ({ ...current, quizSubmitted: current.quizSubmitted.filter((item) => item !== id), quizCorrect: current.quizCorrect.filter((item) => item !== id), quizAnswers: { ...current.quizAnswers, [id]: '' } }))

  return (
    <StepFrame {...props} step={7} intro="AI가 새 콘텐츠를 만드는 과정과, 말소리를 글자로 바꾸고 의미를 처리하는 과정을 구분해 정리합니다.">
    <ReviewNavigation label="소구간 이동" current={section} onChange={setSection} items={[
 { label: '1. 핵심 복습', done: null },
 { label: '2. 역할 연결', done: languageCorrect, remaining: LANGUAGE_PROCESS_CARDS.filter(item => activity.languageAssignments[item.id] !== item.answer).map((item) => '역할 ' + (LANGUAGE_PROCESS_CARDS.indexOf(item) + 1)).join(' · ') },
 { label: '3. 서비스 적용', done: serviceCorrect, remaining: SERVICE_SCENARIOS.filter(item => item.answer.length !== (serviceCards[item.id] ?? []).length || !item.answer.every(card => (serviceCards[item.id] ?? []).includes(card))).map(item => '서비스 ' + (SERVICE_SCENARIOS.indexOf(item) + 1)).join(' · ') },
 { label: '4. 확인 문제', done: allQuizCorrect, remaining: quiz.filter(item => !activity.quizCorrect.includes(item.id)).map(item => '문제 ' + item.id).join(' · ') }
]} />
    <p className="text-sm leading-6">남은 항목의 버튼을 누르면 해당 소구간으로 이동합니다. 이동은 답안이나 완료 조건을 바꾸지 않습니다.</p>
    <div hidden={section !== 0} aria-label="소구간 1 내용">
      <p className="mb-5 text-lg font-black text-slate-900">생성, 음성 인식, 자연어 처리는 서로 다른 역할입니다. 서비스에 필요한 기술을 골라 연결해 봅시다.</p>
      <Lesson10Recap />
      <Notice><strong>음성 인식</strong>은 사람의 말소리를 분석하여 텍스트 데이터로 바꾸고, <strong>자연어 처리</strong>는 텍스트에 담긴 단어, 의미와 문맥을 분석하고 처리합니다.<br /><span className="mt-2 block font-bold">사람의 말소리 → 음성 인식 → 텍스트 → 자연어 처리 → 의미와 문맥 처리</span></Notice>

    </div>
    <div hidden={section !== 1} aria-label="소구간 2 내용">
      <h3 className="mt-7 border-t border-slate-200 pt-6 text-xl font-black">소구간 2 · 핵심 역할 연결</h3>
      <p className="mt-2 text-sm leading-6">두 과정 카드를 각각 필요한 기술과 연결하세요. 틀린 연결은 바로 바꿀 수 있습니다.</p>

      <div className="mt-7"><ActivityCaseNavigation label="“오늘 날씨 알려 줘.”의 처리 과정" items={LANGUAGE_PROCESS_CARDS.map((item, index) => ({ id: item.id, label: `과정 ${index + 1}`, done: activity.languageAssignments[item.id] === item.answer }))} selected={selectedId} onSelect={setSelectedId} /><div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><h3 className="font-black">입력과 결과를 보고 필요한 기술 연결</h3><p className="mt-3 rounded-xl bg-white p-4 font-bold">{selected.text}</p><CategoryButtons<LanguageProcess> labels={[{ id: 'speech-recognition', label: '음성 인식' }, { id: 'natural-language', label: '자연어 처리' }]} value={selectedAnswer} onChoose={(process) => assignLanguageProcess(selected.id, process)} />{selectedAnswer ? selectedAnswer === selected.answer ? <Feedback correct>맞았습니다. {selected.answer === 'speech-recognition' ? '말소리를 글자로 바꾸는 과정은 음성 인식입니다.' : '텍스트의 요청 의미를 파악하는 과정은 자연어 처리입니다.'}</Feedback> : <Feedback correct={false}>소리→글자와 글자→의미 중 어느 과정인지 다시 구분해 보세요.</Feedback> : null}</div></div>

    </div>
    <div hidden={section !== 2} aria-label="소구간 3 내용">
      <div className="mt-8 rounded-2xl border border-violet-200 bg-violet-50 p-5"><h3 className="text-xl font-black">소구간 3 · 서비스에 기술 적용</h3><p className="mt-2 text-sm leading-6">이번에는 구현 모델 이름이 아닌 필요한 기술 분야를 모두 고릅니다. 자연어 처리는 언어 이해와 생성을 포함합니다. 생성형 언어 모델은 자연어 처리에, GAN은 이미지 생성에 사용할 수 있는 방법 중 하나이며 분야와 같은 뜻이 아닙니다.</p><div className="mt-4 grid gap-2">{SERVICE_SCENARIOS.map((item, index) => <button key={item.id} type="button" aria-pressed={selectedService === item.id} onClick={() => { setSelectedService(item.id); setServiceSubmitted(false) }} className={`min-h-12 rounded-xl border p-3 text-left font-bold ${selectedService === item.id ? 'border-violet-600 bg-white text-violet-950' : 'border-violet-200 bg-violet-100'}`}>서비스 {index + 1}. {item.text}<span className="mt-1 block text-xs">선택: {(serviceCards[item.id] ?? []).join(', ') || '없음'}</span></button>)}</div><p className="mt-5 font-bold">“{selectedServiceData.text}”에 필요한 기술</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{TECHNOLOGY_CARDS.map((card) => <button key={card} type="button" aria-pressed={selectedCards.includes(card)} onClick={() => { setServiceCards((current) => ({ ...current, [selectedService]: selectedCards.includes(card) ? selectedCards.filter((item) => item !== card) : [...selectedCards, card] })); setServiceSubmitted(false) }} className={`min-h-11 rounded-xl border px-3 text-left text-sm font-bold ${selectedCards.includes(card) ? 'border-violet-600 bg-white text-violet-950' : 'border-slate-300 bg-white'}`}>{selectedCards.includes(card) ? '✓ 선택됨 · ' : ''}{card}</button>)}</div><Button className="mt-4" onClick={() => setServiceSubmitted(true)} disabled={selectedCards.length === 0}>서비스 기술 제출</Button>{serviceSubmitted ? <Feedback correct={selectedServiceData.answer.length === selectedCards.length && selectedServiceData.answer.every((card) => selectedCards.includes(card))}>{selectedServiceData.answer.length === selectedCards.length && selectedServiceData.answer.every((card) => selectedCards.includes(card)) ? `맞았습니다. ${selectedServiceData.reason}` : `질문이 지정한 기능을 다시 확인하세요. ${selectedServiceData.reason}`}</Feedback> : null}</div>

      <div className="mt-8 border-t border-slate-200 pt-7"><h3 className="text-lg font-black">참고 · 음성 인식 활용 사례</h3><p className="mt-2 text-sm text-slate-600">필요한 사례를 눌러 교과서의 활용 범위를 확인하세요. 방문 횟수는 완료 조건이 아닙니다.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{SPEECH_USES.map((item) => {
        const viewed = activity.speechUsesViewed.includes(item.id)
        return <button key={item.id} type="button" aria-pressed={viewed} onClick={() => update((current) => ({ ...current, speechUsesViewed: [...new Set([...current.speechUsesViewed, item.id])] }))} className={`min-h-28 rounded-2xl border p-4 text-left ${viewed ? 'border-cyan-600 bg-cyan-50' : 'border-slate-200 bg-white'}`}><span className="flex items-center gap-2 font-black"><Volume2 size={18} aria-hidden="true" />{item.title}</span><span className="mt-2 block text-sm leading-6">{viewed ? `✓ 확인함 · ${item.detail}` : '눌러서 설명 확인'}</span></button>
      })}</div></div>

    </div>
    <div hidden={section !== 3} aria-label="소구간 4 내용">
      <div className="mt-8 border-t border-slate-200 pt-7"><h3 className="text-xl font-black">소구간 4 · 확인 문제 8개</h3><p className="mt-2 text-sm leading-6 text-slate-600">각 문제를 제출하면 아이콘과 글로 결과를 확인합니다. 오답은 해설을 읽고 다시 풀 수 있습니다.</p><ReviewNavigation label="확인 문제 이동" current={quizIndex} onChange={setQuizIndex} items={quiz.map((item, index) => ({ label: `문제 ${index + 1}`, done: activity.quizCorrect.includes(item.id), remaining: activity.quizSubmitted.includes(item.id) ? '오답 수정·재제출' : '선택 후 제출' }))} /><div className="mt-5 grid gap-5">{quiz.map((definition, questionIndex) => {
        const answer = activity.quizAnswers[String(definition.id)]
        const submitted = activity.quizSubmitted.includes(definition.id)
        const correct = activity.quizCorrect.includes(definition.id)
        return <fieldset hidden={quizIndex !== questionIndex} key={definition.id} className="rounded-2xl border border-slate-200 p-5"><legend className="px-2 font-black">문제 {definition.id}. {definition.question}</legend><div className="mt-3 grid gap-2">{quizOptionOrder[definition.id].map((optionId, optionIndex) => { const option = definition.options.find(item => item.id === optionId)!; return <button key={option.id} type="button" disabled={submitted} aria-pressed={answer === option.id} onClick={() => selectQuiz(definition.id, option.id)} className={`min-h-12 rounded-xl border p-3 text-left text-sm font-bold disabled:cursor-not-allowed ${answer === option.id ? 'border-violet-600 bg-violet-50' : 'border-slate-300 bg-white'}`}>{optionIndex + 1}. {option.text}</button> })}</div>{!submitted ? <Button className="mt-4" disabled={!answer} onClick={() => submitQuiz(definition)}>문제 {definition.id} 제출</Button> : <Feedback correct={correct}><strong>{correct ? '정답입니다.' : '오답입니다.'}</strong> {definition.explanation}{!correct ? <Button className="mt-3" variant="secondary" onClick={() => retryQuiz(definition.id)}><RotateCcw size={17} /> 오답 다시 풀기</Button> : null}</Feedback>}</fieldset>
      })}</div></div>

    </div>
      <p className="mt-5 text-sm" role="status">{priorStepsComplete ? '✓ STEP 1~6 완료' : '차시 완료에는 STEP 1~6도 필요합니다. 상단 STEP 버튼으로 이동하세요.'}</p>
      <Button className="mt-7" disabled={!ready} onClick={props.onComplete}><Sparkles size={18} /> STEP 7 활동 완료</Button>
      {props.isComplete ? <div className="mt-8 rounded-3xl bg-slate-950 p-6 text-white sm:p-8"><p className="text-sm font-black tracking-[0.16em] text-emerald-300">LESSON 10 SIGNAL FLOW COMPLETE</p><h3 className="mt-2 text-2xl font-black">서비스에 맞게 생성·음성 인식·의미 처리의 역할을 구분했습니다.</h3><div className="mt-6 border-t border-slate-700 pt-6"><p className="text-sm font-bold text-cyan-300">Lesson 11 연결 질문</p><p className="mt-2 text-lg font-black">말소리에서 바꾼 텍스트나 직접 입력한 글을 AI가 처리하려면, 글자를 어떻게 숫자로 표현하고 의미와 문맥을 이해해야 할까요?</p><Link to="/lesson/11" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 font-bold text-slate-950">Lesson 11 미리 보기 <ArrowRight size={18} /></Link></div></div> : null}
    </StepFrame>
  )
}
