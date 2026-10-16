import {
  ArrowDown,
  ArrowRight,
  Cat,
  Check,
  CheckCircle2,
  Circle,
  CircleHelp,
  Dog,
  Lightbulb,
  XCircle,
} from 'lucide-react'
import { useEffect, useState, type ReactNode, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  comparisonCards,
  comparisonCategories,
  decisionCriteria,
  featureCards,
  featureGroups,
  flowStages,
  lesson01Objectives,
  lesson01Quiz,
  lesson01StepTitles,
  methodCases,
  methodChoices,
  observationCards,
  observationRoles,
  projectLimitations,
  projectOptions,
  type ComparisonCategory,
  type FeatureGroup,
  type FlowStageId,
  type MethodChoice,
  type ObservationRole,
} from './lesson01Data'

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

type ActivityResult = 'idle' | 'incomplete' | 'incorrect' | 'correct'

const selectedButtonClass = 'border-indigo-500 bg-indigo-50 text-indigo-950 shadow-sm'
const unselectedButtonClass = 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300'

function StepFrame({ step, intro, active, isComplete, children }: StepFrameProps) {
  const titleId = active ? 'lesson-step-title' : `lesson01-step-${step}-title`

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
        <h2 id={titleId} tabIndex={active ? -1 : undefined} className="step-focus-target mt-4 text-2xl font-black leading-snug tracking-tight text-slate-950 focus:outline-none sm:text-3xl">
          {lesson01StepTitles[step - 1]}
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{intro}</p>
      </div>
      <div className="px-5 py-7 sm:px-8 sm:py-9">{children}</div>
    </Card>
  )
}

function StepCompletionMessage({ children }: { children: ReactNode }) {
  return (
    <div className="mt-7 flex items-start gap-3 border-t border-emerald-200 pt-5 text-emerald-900" role="status">
      <CheckCircle2 className="mt-0.5 shrink-0" size={21} aria-hidden="true" />
      <p className="font-semibold leading-7">{children}</p>
    </div>
  )
}

function ActivityFeedback({ result, correct, incomplete, incorrect }: {
  result: ActivityResult
  correct: ReactNode
  incomplete: ReactNode
  incorrect: ReactNode
}) {
  if (result === 'idle') return null
  const isCorrect = result === 'correct'
  const message = isCorrect ? correct : result === 'incomplete' ? incomplete : incorrect
  return (
    <div className={`mt-5 flex items-start gap-3 rounded-2xl p-5 ${isCorrect ? 'bg-emerald-50 text-emerald-950' : 'bg-amber-50 text-amber-950'}`} role="status">
      {isCorrect ? <CheckCircle2 className="mt-0.5 shrink-0" size={22} aria-hidden="true" /> : <CircleHelp className="mt-0.5 shrink-0" size={22} aria-hidden="true" />}
      <p className="leading-7">{message}</p>
    </div>
  )
}

function moveItem<T>(items: T[], from: number, offset: number) {
  const to = from + offset
  if (to < 0 || to >= items.length) return items
  const next = [...items]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

function FlowOrder({
  label,
  order,
  tokens,
  onChange,
}: {
  label: string
  order: string[]
  tokens: { id: string; label: string }[]
  onChange: (next: string[]) => void
}) {
  return (
    <section aria-label={label} className="rounded-2xl border border-slate-200 p-4 sm:p-5">
      <h3 className="text-lg font-black text-slate-950">{label}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">위·아래 화살표를 눌러 흐름을 순서대로 배열하세요.</p>
      <ol className="mt-4 space-y-2">
        {order.map((id, index) => {
          const token = tokens.find((item) => item.id === id)
          if (!token) return null
          return (
            <li key={id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-black text-indigo-700">{index + 1}</span>
              <span className="min-w-0 flex-1 font-bold leading-6 text-slate-900">{token.label}</span>
              <div className="flex shrink-0 gap-1">
                <Button variant="secondary" className="min-h-11 min-w-11 px-2" onClick={() => onChange(moveItem(order, index, -1))} disabled={index === 0} aria-label={`${token.label} 위로 이동`}>
                  ↑
                </Button>
                <Button variant="secondary" className="min-h-11 min-w-11 px-2" onClick={() => onChange(moveItem(order, index, 1))} disabled={index === order.length - 1} aria-label={`${token.label} 아래로 이동`}>
                  <ArrowDown size={18} aria-hidden="true" />
                </Button>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function ClassificationBoard({
  items,
  categories,
  assignments,
  selectedId,
  onSelect,
  onAssign,
}: {
  items: { id: string; label: string }[]
  categories: { id: string; label: string; description?: string }[]
  assignments: Record<string, string>
  selectedId: string | null
  onSelect: (id: string) => void
  onAssign: (categoryId: string) => void
}) {
  const selectedItem = items.find((item) => item.id === selectedId)
  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,0.85fr)]">
      <div>
        <p className="text-sm font-bold text-slate-700">카드를 하나 선택한 뒤 분류 영역을 누르세요.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {items.map((item) => {
            const chosen = selectedId === item.id
            const assigned = assignments[item.id]
            const category = categories.find((itemCategory) => itemCategory.id === assigned)
            return (
              <button key={item.id} type="button" aria-pressed={chosen} onClick={() => onSelect(item.id)} className={`min-h-14 rounded-xl border px-4 py-3 text-left font-semibold leading-6 transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${chosen ? selectedButtonClass : unselectedButtonClass}`}>
                <span className="flex items-start gap-2">
                  {chosen ? <CheckCircle2 className="mt-0.5 shrink-0 text-indigo-700" size={19} aria-hidden="true" /> : <Circle className="mt-0.5 shrink-0 text-slate-400" size={18} aria-hidden="true" />}
                  <span>{item.label}</span>
                </span>
                {category && <span className="mt-1 block text-xs font-bold text-indigo-700">→ {category.label}</span>}
              </button>
            )
          })}
        </div>
      </div>
      <div className="space-y-3" aria-live="polite">
        {categories.map((category) => (
          <Button key={category.id} variant={selectedItem && assignments[selectedItem.id] === category.id ? 'primary' : 'secondary'} className="h-auto min-h-16 w-full justify-start whitespace-normal text-left leading-6" disabled={!selectedItem} onClick={() => onAssign(category.id)}>
            <span>
              <span className="block font-black">{category.label}</span>
              {category.description && <span className="mt-0.5 block text-xs font-medium opacity-80">{category.description}</span>}
            </span>
          </Button>
        ))}
      </div>
    </div>
  )
}

function RadioOption({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-pressed={selected} onClick={onClick} className={`flex min-h-12 w-full items-start gap-3 rounded-xl border px-4 py-3 text-left font-semibold leading-6 transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${selected ? selectedButtonClass : unselectedButtonClass}`}>
      {selected ? <CheckCircle2 className="mt-0.5 shrink-0 text-indigo-700" size={19} aria-hidden="true" /> : <Circle className="mt-0.5 shrink-0 text-slate-400" size={18} aria-hidden="true" />}
      <span>{children}</span>
    </button>
  )
}

function ModelIntroduction() {
  return <section className="mt-8 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 sm:p-5" aria-label="모델과 학습, 예측의 관계">
    <h3 className="text-xl font-black">사진이 예측 결과가 되기까지</h3>
    <dl className="mt-4 grid gap-3 sm:grid-cols-2">
      <div><dt className="font-black">모델</dt><dd className="mt-1 leading-7">입력을 받아 예측을 계산하는 구조입니다.</dd></div>
      <div><dt className="font-black">학습</dt><dd className="mt-1 leading-7">예측이 정답에 가까워지도록 데이터로 모델의 내부 값을 조정하는 과정입니다.</dd></div>
      <div><dt className="font-black">예측</dt><dd className="mt-1 leading-7">모델이 입력을 보고 계산한 결과입니다. 보통 사용할 때는 학습된 내부 값을 그대로 써서 계산합니다.</dd></div>
      <div><dt className="font-black">레이블</dt><dd className="mt-1 leading-7">학습·평가에서 예측과 비교하는 실제 정답 정보입니다.</dd></div>
    </dl>
    <figure className="mt-5">
      <figcaption className="font-bold">고양이·강아지 분류의 설명용 그림</figcaption>
      <div className="mt-3 grid items-center gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <div className="rounded-xl border border-cyan-300 bg-white p-4 text-center"><Cat size={48} className="mx-auto text-cyan-700" aria-hidden="true" /><p className="mt-2 font-black">① 입력 이미지</p><p className="mt-1 text-sm">분류할 동물 사진</p></div>
        <ArrowRight className="hidden text-indigo-700 md:block" aria-hidden="true" /><ArrowDown className="mx-auto text-indigo-700 md:hidden" aria-hidden="true" />
        <div className="min-w-0 rounded-xl border-2 border-indigo-500 bg-white p-4 text-center">
          <svg viewBox="0 0 160 70" className="mx-auto h-14 w-full max-w-40" role="img" aria-label="입력을 받아 결과를 계산하는 모델"><path d="M20 15 L80 20 M20 15 L80 50 M20 55 L80 20 M20 55 L80 50 M80 20 L140 35 M80 50 L140 35" stroke="#6366f1" fill="none" strokeWidth="2" />{[[20,15],[20,55],[80,20],[80,50],[140,35]].map(([x,y]) => <circle key={x + '-' + y} cx={x} cy={y} r="9" fill="#e0e7ff" stroke="#4338ca" />)}</svg>
          <p className="mt-2 font-black">② 모델</p><p className="mt-1 text-sm">학습한 기준으로 계산</p>
        </div>
        <ArrowRight className="hidden text-indigo-700 md:block" aria-hidden="true" /><ArrowDown className="mx-auto text-indigo-700 md:hidden" aria-hidden="true" />
        <div className="rounded-xl border border-emerald-300 bg-white p-4 text-center"><Cat size={48} className="mx-auto text-emerald-700" aria-hidden="true" /><p className="mt-2 font-black">③ 예측 결과</p><p className="mt-1 text-sm">예: ‘고양이’라고 판단</p></div>
      </div>
      <div className="mt-3 rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 p-4 leading-7"><strong>정답을 알고 있을 때 비교:</strong> 예측 ‘고양이’ ↔ 실제 레이블 ‘고양이’<br />레이블은 비교할 정답이지, 새 이미지를 예측할 때 반드시 모델에 함께 넣어야 하는 입력이 아닙니다.</div>
    </figure>
  </section>
}

export function Lesson01Step1(props: CommonStepProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [assignments, setAssignments] = useState<Record<string, ObservationRole>>({ ears: observationCards[0].answer })
  const [result, setResult] = useState<ActivityResult>('idle')

  const assign = (role: ObservationRole) => {
    if (!selectedId) return
    setAssignments((current) => ({ ...current, [selectedId]: role }))
    setResult('idle')
  }
  const submit = () => {
    if (observationCards.some((card) => !assignments[card.id])) {
      setResult('incomplete')
      return
    }
    setResult(observationCards.every((card) => assignments[card.id] === card.answer) ? 'correct' : 'incorrect')
  }

  return (
    <StepFrame {...props} step={1} intro="고양이·강아지 이미지를 분류할 때, 사진에서 볼 수 있는 단서와 정답을 미리 알려 주는 정보를 구분합니다.">
      <section aria-labelledby="lesson01-goals-title">
        <h3 id="lesson01-goals-title" className="text-xl font-black text-slate-950">이번 차시에서 알아볼 것</h3>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {lesson01Objectives.map((objective, index) => <li key={objective} className="flex items-start gap-3 leading-7 text-slate-700"><span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-700">{index + 1}</span><span>{objective}</span></li>)}
        </ul>
      </section>

      <ModelIntroduction />
      <section className="mt-9" aria-labelledby="animal-clues-title">
        <h3 id="animal-clues-title" className="text-xl font-black text-slate-950">사진 분류 상황</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5"><Cat className="shrink-0 text-indigo-600" size={42} aria-hidden="true" /><p className="leading-7 text-slate-700"><strong className="text-slate-950">고양이</strong>와 <strong className="text-slate-950">강아지</strong> 사진을 보고 종류를 예측합니다.</p></div>
          <div className="flex items-center gap-4 rounded-2xl border border-cyan-200 bg-cyan-50/70 p-5"><Dog className="shrink-0 text-cyan-700" size={42} aria-hidden="true" /><p className="leading-7 text-slate-700">모델은 사진 자체를 보고 판단해야지, 파일 이름으로 정답을 알아내면 안 됩니다.</p></div>
        </div>
      </section>

      <section className="mt-9" aria-labelledby="observation-classification-title">
        <h3 id="observation-classification-title" className="text-xl font-black text-slate-950">정보의 역할을 분류하세요</h3>
        <p className="mt-2 leading-7 text-slate-600">‘파일 이름에 포함된 cat’처럼 정답을 직접 드러내는 정보는 실제 특징으로 쓰면 새 사진에서 잘못된 판단을 만들 수 있습니다.</p>
        <div className="mt-4 rounded-xl bg-indigo-50 p-4 leading-7"><p><strong>데이터</strong>는 고양이·강아지 사진, <strong>특징</strong>은 분류에 도움이 되는 모양·무늬 정보, <strong>레이블</strong>은 학습·평가에서 예측과 비교할 정답 이름입니다.</p><p className="mt-2"><strong>안내 예: {observationCards[0].label} → {observationRoles.find((role) => role.id === observationCards[0].answer)?.label}</strong><br />{observationCards[0].explanation} 나머지 카드를 같은 기준으로 분류하세요.</p></div>
        <ClassificationBoard items={observationCards.slice(1)} categories={observationRoles} assignments={assignments} selectedId={selectedId} onSelect={setSelectedId} onAssign={(role) => assign(role as ObservationRole)} />
        <Button className="mt-6" onClick={submit}>분류 제출</Button>
        {result === 'incorrect' && <ul className="mt-4 space-y-2 text-sm text-rose-800">{observationCards.filter((card) => assignments[card.id] !== card.answer).map((card) => <li key={card.id}>✕ {card.label}: {card.explanation}</li>)}</ul>}
        <ActivityFeedback result={result} incomplete="안내 예를 제외한 여섯 정보를 모두 분류한 뒤 제출하세요." incorrect="몇몇 정보의 역할이 맞지 않습니다. 사진에서 보이는 정보, 촬영 상황 정보, 정답 레이블을 다시 비교해 보세요." correct="정확합니다. 사진의 특징과 정답 레이블은 역할이 다르며, 파일 이름은 정답을 새어 나가게 하는 불안정한 정보입니다." />
        {result === 'correct' && !props.isComplete && <Button className="mt-4" onClick={props.onComplete}><Check size={18} aria-hidden="true" />피드백 확인하고 STEP 완료</Button>}
      </section>
      {props.isComplete && <StepCompletionMessage>관찰 가능한 특징, 불안정한 정보, 정답 레이블을 구분했습니다.</StepCompletionMessage>}
    </StepFrame>
  )
}

export function Lesson01Step2(props: CommonStepProps) {
  const [order, setOrder] = useState<FlowStageId[]>(['model', 'data', 'result', 'feature'])
  const [examples, setExamples] = useState<Record<string, FlowStageId>>({})
  const [missingFlow, setMissingFlow] = useState<string | null>(null)
  const [result, setResult] = useState<ActivityResult>('idle')
  const correctOrder = flowStages.map((stage) => stage.id)
  const exampleOptions = [...flowStages].sort((a, b) => b.label.localeCompare(a.label, 'ko'))

  const submit = () => {
    const flowCorrect = order.every((stage, index) => stage === correctOrder[index])
    const examplesComplete = flowStages.every((stage) => examples[stage.id])
    const examplesCorrect = flowStages.every((stage) => examples[stage.id] === stage.id)
    if (!examplesComplete || !missingFlow) return setResult('incomplete')
    if (flowCorrect && examplesCorrect && missingFlow === 'missing-feature') {
      setResult('correct')
      props.onComplete()
    } else setResult('incorrect')
  }

  return (
    <StepFrame {...props} step={2} intro="데이터 → 특징 → 모델 → 결과의 흐름을 직접 완성하고, 각 단계가 맡는 실제 예시를 연결합니다.">
      <p className="mb-5 rounded-xl bg-indigo-50 p-4 leading-7">앞에서 본 고양이·강아지 사진이 데이터입니다. 사진의 모양·무늬처럼 분류에 도움이 되는 정보가 특징이고, 모델은 이를 바탕으로 예측 결과를 계산합니다. 데이터를 준비하고 → 특징을 다루고 → 모델이 패턴을 학습한 뒤 → 예측 결과를 만드는 흐름으로 연결하세요.</p>
      <FlowOrder label="기계학습 Signal Flow" order={order} tokens={flowStages} onChange={(next) => { setOrder(next as FlowStageId[]); setResult('idle') }} />
      <section className="mt-8" aria-labelledby="flow-example-title">
        <h3 id="flow-example-title" className="text-xl font-black text-slate-950">단계와 예시 연결</h3>
        <p className="mt-2 leading-7 text-slate-600">각 예시가 어느 단계에 해당하는지 선택하세요.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {flowStages.map((stage) => (
            <label key={stage.id} className="rounded-xl border border-slate-200 p-4">
              <span className="block font-bold leading-6 text-slate-900">{stage.example}</span>
              <select value={examples[stage.id] ?? ''} onChange={(event) => { setExamples((current) => ({ ...current, [stage.id]: event.target.value as FlowStageId })); setResult('idle') }} className="mt-3 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-semibold text-slate-800 focus:outline-3 focus:outline-offset-2 focus:outline-indigo-600" aria-label={`${stage.example}의 단계`}>
                <option value="">단계를 선택하세요</option>
                {exampleOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
              </select>
            </label>
          ))}
        </div>
      </section>
      <fieldset className="mt-8 rounded-2xl border border-slate-200 p-5">
        <legend className="px-1 text-lg font-black leading-7 text-slate-950">사람이 특징을 설계하는 위 과정에서, 특징 단계 표시가 빠진 흐름은 어느 것인가요?</legend>
        <div className="mt-4 grid gap-3">
          {[
            ['missing-feature', '데이터 → 모델 → 결과'],
            ['complete', '데이터 → 특징 → 모델 → 결과'],
            ['wrong-order', '특징 → 데이터 → 모델 → 결과'],
          ].map(([id, label]) => <RadioOption key={id} selected={missingFlow === id} onClick={() => { setMissingFlow(id); setResult('idle') }}>{label}</RadioOption>)}
        </div>
      </fieldset>
      <Button className="mt-6" onClick={submit}>흐름 제출</Button>
      <ActivityFeedback result={result} incomplete="흐름, 네 개의 예시 연결, 빠진 단계 찾기를 모두 마친 뒤 제출하세요." incorrect="순서와 각 단계의 역할을 다시 살펴보세요. 특징은 데이터를 바탕으로 모델이 판단할 단서를 만들거나 찾는 단계입니다." correct="정확합니다. 데이터를 준비하고, 분류 단서를 다룬 뒤, 모델이 학습하여 예측 결과를 만듭니다." />
      {props.isComplete && <StepCompletionMessage>학습 흐름의 순서와 각 단계의 역할을 완성했습니다.</StepCompletionMessage>}
    </StepFrame>
  )
}

export function Lesson01Step3(props: CommonStepProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [assignments, setAssignments] = useState<Record<string, FeatureGroup>>({})
  const [finalFeatures, setFinalFeatures] = useState<string[]>([])
  const [backgroundDecision, setBackgroundDecision] = useState<string | null>(null)
  const [result, setResult] = useState<ActivityResult>('idle')
  const requiredFeatures = ['ear-shape', 'face-outline', 'muzzle-shape']

  const assign = (group: FeatureGroup) => {
    if (!selectedId) return
    setAssignments((current) => ({ ...current, [selectedId]: group }))
    setResult('idle')
  }
  const toggleFeature = (id: string) => {
    setFinalFeatures((current) => current.includes(id) ? current.filter((value) => value !== id) : current.length < 3 ? [...current, id] : current)
    setResult('idle')
  }
  const submit = () => {
    const categoriesDone = featureCards.every((card) => assignments[card.id])
    const categoriesCorrect = featureCards.every((card) => assignments[card.id] === card.answer)
    const finalCorrect = requiredFeatures.every((id) => finalFeatures.includes(id)) && finalFeatures.length === 3
    if (!categoriesDone || finalFeatures.length !== 3 || !backgroundDecision) return setResult('incomplete')
    if (categoriesCorrect && finalCorrect && backgroundDecision === 'background-learned') {
      setResult('correct')
      props.onComplete()
    } else setResult('incorrect')
  }

  return (
    <StepFrame {...props} step={3} intro="하나의 단서만 믿지 않고, 대상 자체의 특징과 촬영 조건에 의존하는 정보를 비교합니다.">
      <section aria-labelledby="feature-group-title">
        <h3 id="feature-group-title" className="text-xl font-black text-slate-950">특징을 세 영역으로 분류하세요</h3>
        <p className="mt-2 leading-7 text-slate-600">‘귀가 뾰족하면 항상 고양이’처럼 예외가 많은 규칙은 피해야 합니다. 여러 특징을 함께 살펴야 합니다.</p>
        <ClassificationBoard items={featureCards} categories={featureGroups} assignments={assignments} selectedId={selectedId} onSelect={setSelectedId} onAssign={(group) => assign(group as FeatureGroup)} />
      </section>
      <section className="mt-8 rounded-2xl border border-slate-200 p-5" aria-labelledby="final-feature-title">
        <h3 id="final-feature-title" className="text-lg font-black text-slate-950">최종 특징 3개를 선택하세요</h3>
        <p className="mt-2 leading-6 text-slate-600">이번 연습에서는 대상 자체의 모양을 나타내는, 비교적 안정적인 특징 세 가지를 고르세요. 이 세 특징이 모든 이미지 분류의 유일한 정답이라는 뜻은 아닙니다. 문제와 데이터가 달라지면 도움이 되는 특징도 달라집니다. {finalFeatures.length}/3 선택</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {featureCards.map((card) => <RadioOption key={card.id} selected={finalFeatures.includes(card.id)} onClick={() => toggleFeature(card.id)}>{card.label}</RadioOption>)}
        </div>
      </section>
      <fieldset className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/40 p-5">
        <legend className="px-1 text-lg font-black leading-7 text-slate-950">배경색만 달라졌는데 예측이 바뀌었다면?</legend>
        <p className="mt-2 leading-7 text-slate-700">두 사진의 동물은 같지만, 한 사진은 파란 벽 앞이고 다른 사진은 흰 벽 앞입니다.</p>
        <div className="mt-4 grid gap-3">
          <RadioOption selected={backgroundDecision === 'background-learned'} onClick={() => { setBackgroundDecision('background-learned'); setResult('idle') }}>모델이 동물보다 배경을 배웠을 수 있어, 새 장소에서 잘못 예측할 위험이 있다.</RadioOption>
          <RadioOption selected={backgroundDecision === 'better'} onClick={() => { setBackgroundDecision('better'); setResult('idle') }}>배경색까지 이용했으므로 언제나 더 좋은 모델이다.</RadioOption>
          <RadioOption selected={backgroundDecision === 'label'} onClick={() => { setBackgroundDecision('label'); setResult('idle') }}>배경색이 정답 레이블이므로 예측이 바뀌어야 한다.</RadioOption>
        </div>
      </fieldset>
      <Button className="mt-6" onClick={submit}>특징 선택 제출</Button>
      <ActivityFeedback result={result} incomplete="모든 특징 분류, 최종 특징 3개, 배경 사례 판단을 모두 마친 뒤 제출하세요." incorrect="대상 자체의 안정적인 모양 정보와 촬영 상황에 따라 바뀌는 정보를 다시 구분해 보세요." correct="좋습니다. 좋은 모델은 배경 같은 우연한 단서보다 여러 대상 특징을 함께 활용해야 합니다." />
      {props.isComplete && <StepCompletionMessage>특징을 고를 때 대상, 상황, 예외를 함께 고려했습니다.</StepCompletionMessage>}
    </StepFrame>
  )
}

const machineLearningTokens = [
  { id: 'image', label: '이미지' },
  { id: 'human-features', label: '사람이 특징 설계' },
  { id: 'feature-values', label: '특징값' },
  { id: 'model-learning', label: '모델 학습' },
  { id: 'prediction', label: '예측' },
]
const deepLearningTokens = [
  { id: 'pixels', label: '이미지 픽셀' },
  { id: 'network-learning', label: '신경망이 여러 층에서 표현 학습' },
  { id: 'dl-prediction', label: '예측' },
]

const comparisonQuestions = [
  { id: 'designer', question: '특징을 주로 설계하는 쪽은?', options: [{ id: 'ml-human', label: '기계학습에서는 사람이 특징 설계에 더 관여한다.' }, { id: 'dl-human', label: '딥러닝에서는 사람이 모든 특징을 하나씩 직접 설계한다.' }], answer: 'ml-human' },
  { id: 'input', question: '이미지 분류의 입력 형태로 알맞은 설명은?', options: [{ id: 'input-correct', label: '기계학습은 사람이 만든 특징값을, 딥러닝은 원본 이미지 픽셀을 주로 입력으로 사용할 수 있다.' }, { id: 'input-wrong', label: '딥러닝은 이미지 픽셀을 사용할 수 없다.' }], answer: 'input-correct' },
  { id: 'always-better', question: '딥러닝은 모든 문제에서 항상 더 좋은가요?', options: [{ id: 'no', label: '아니다. 데이터와 문제 조건에 맞춰 판단해야 한다.' }, { id: 'yes', label: '그렇다. 복잡한 모델은 언제나 유리하다.' }], answer: 'no' },
]

export function Lesson01Step4(props: CommonStepProps) {
  const [mlOrder, setMlOrder] = useState(['model-learning', 'image', 'prediction', 'human-features', 'feature-values'])
  const [dlOrder, setDlOrder] = useState(['network-learning', 'dl-prediction', 'pixels'])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<ActivityResult>('idle')
  const flowCorrect = (order: string[], tokens: { id: string }[]) => order.every((id, index) => id === tokens[index].id)

  const submit = () => {
    const questionsDone = comparisonQuestions.every((question) => answers[question.id])
    const questionsCorrect = comparisonQuestions.every((question) => answers[question.id] === question.answer)
    if (!questionsDone) return setResult('incomplete')
    if (flowCorrect(mlOrder, machineLearningTokens) && flowCorrect(dlOrder, deepLearningTokens) && questionsCorrect) {
      setResult('correct')
      props.onComplete()
    } else setResult('incorrect')
  }

  return (
    <StepFrame {...props} step={4} intro="두 흐름을 배열하고, 특징을 준비하는 방식의 차이와 공통점을 판단하세요.">
      <p className="mb-5 leading-7 text-slate-700">딥러닝은 기계학습의 한 종류입니다. 여기서는 사람이 특징을 설계하는 방식과 신경망이 여러 층에서 특징을 학습하는 방식을 비교합니다.</p>
      <div className="grid gap-5 xl:grid-cols-2">
        <FlowOrder label="기계학습 흐름" order={mlOrder} tokens={machineLearningTokens} onChange={(next) => { setMlOrder(next); setResult('idle') }} />
        <FlowOrder label="딥러닝 흐름" order={dlOrder} tokens={deepLearningTokens} onChange={(next) => { setDlOrder(next); setResult('idle') }} />
      </div>
      <div className="mt-6 rounded-2xl bg-indigo-50 p-5 text-slate-800">
        <Lightbulb className="float-left mr-3 mt-1 text-indigo-700" size={22} aria-hidden="true" />
        <p className="leading-7">학습된 특징이 사람이 이름 붙인 눈·귀와 꼭 일치하지는 않습니다. 두 방법 모두 사람이 데이터를 준비하고 새 데이터로 결과를 평가해야 합니다. 딥러닝도 레이블·모델 구조·학습 조건을 사람이 정합니다.</p>
      </div>
      <section className="mt-8" aria-labelledby="comparison-judgment-title">
        <h3 id="comparison-judgment-title" className="text-xl font-black text-slate-950">공통점과 차이를 판단하세요</h3>
        <div className="mt-4 space-y-5">
          {comparisonQuestions.map((question) => (
            <fieldset key={question.id} className="rounded-2xl border border-slate-200 p-5">
              <legend className="px-1 font-black leading-7 text-slate-950">{question.question}</legend>
              <div className="mt-3 grid gap-3">{question.options.map((option) => <RadioOption key={option.id} selected={answers[question.id] === option.id} onClick={() => { setAnswers((current) => ({ ...current, [question.id]: option.id })); setResult('idle') }}>{option.label}</RadioOption>)}</div>
            </fieldset>
          ))}
        </div>
      </section>
      <Button className="mt-6" onClick={submit}>비교 제출</Button>
      <ActivityFeedback result={result} incomplete="두 흐름과 세 가지 판단을 모두 완성한 뒤 제출하세요." incorrect="특징을 다루는 방식의 차이와, 두 방법 모두 데이터·학습·평가가 필요하다는 공통점을 다시 확인해 보세요." correct="정확합니다. 딥러닝은 여러 층에서 표현을 학습하지만, 어떤 방법이든 데이터 준비와 새로운 데이터 평가는 중요합니다." />
      {props.isComplete && <StepCompletionMessage>기계학습과 딥러닝의 흐름, 공통점, 차이를 비교했습니다.</StepCompletionMessage>}
    </StepFrame>
  )
}

export function Lesson01Step5(props: CommonStepProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [assignments, setAssignments] = useState<Record<string, ComparisonCategory>>({})
  const [result, setResult] = useState<ActivityResult>('idle')

  const submit = () => {
    if (comparisonCards.some((card) => !assignments[card.id])) return setResult('incomplete')
    if (comparisonCards.every((card) => assignments[card.id] === card.answer)) {
      setResult('correct')
      props.onComplete()
    } else setResult('incorrect')
  }

  return (
    <StepFrame {...props} step={5} intro="문장 속 근거를 읽고 기계학습, 딥러닝, 두 방법의 공통점으로 정확히 분류합니다.">
      <p className="rounded-2xl bg-slate-100 p-4 leading-7 text-slate-700">문장에서 ‘사람이 특징을 정함’, ‘여러 층에서 학습함’, ‘두 방법 모두 필요함’이라는 근거를 찾으세요. 카드를 선택해 분류한 뒤 모든 문장을 제출하세요.</p>
      <ClassificationBoard items={comparisonCards.map(({ id, text }) => ({ id, label: text }))} categories={comparisonCategories.map((category) => ({ ...category }))} assignments={assignments} selectedId={selectedId} onSelect={setSelectedId} onAssign={(category) => { if (!selectedId) return; setAssignments((current) => ({ ...current, [selectedId]: category as ComparisonCategory })); setResult('idle') }} />
      <Button className="mt-6" onClick={submit}>문장 분류 제출</Button>
      <ActivityFeedback result={result} incomplete="여섯 문장을 모두 세 영역 중 하나에 분류한 뒤 제출하세요." incorrect="특징을 사람이 직접 정하는지, 여러 층이 표현을 학습하는지, 두 방법 모두에 해당하는지를 문장마다 다시 살펴보세요." correct="좋습니다. 데이터 품질과 새 데이터 평가는 기계학습과 딥러닝 모두에 중요합니다." />
      {props.isComplete && <StepCompletionMessage>근거를 사용해 여섯 문장을 정확히 분류했습니다.</StepCompletionMessage>}
    </StepFrame>
  )
}

export function Lesson01Step6(props: CommonStepProps) {
  const [methods, setMethods] = useState<Record<string, MethodChoice>>({})
  const [reasons, setReasons] = useState<Record<string, string>>({})
  const [result, setResult] = useState<ActivityResult>('idle')

  const submit = () => {
    const casesComplete = methodCases.every((item) => methods[item.id] && reasons[item.id])
    const casesCorrect = methodCases.every((item) => methods[item.id] === item.answer && reasons[item.id] === item.reasonAnswer)
    if (!casesComplete) return setResult('incomplete')
    if (casesCorrect) {
      setResult('correct')
      props.onComplete()
    } else setResult('incorrect')
  }

  return (
    <StepFrame {...props} step={6} intro="방법 이름을 외우기보다 데이터와 문제 조건을 근거로 규칙 기반 방법, 기계학습, 딥러닝 중 적절한 방법을 판단합니다.">
      <section aria-labelledby="criteria-title" className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5">
        <h3 id="criteria-title" className="text-xl font-black text-slate-950">선택 전, 판단 조건을 확인하세요</h3>
        <p className="mt-2 leading-7 text-slate-700">다섯 조건은 선택을 돕는 참고 기준입니다. 사례에서 중요한 조건을 찾아 방법과 이유를 고르세요.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {decisionCriteria.map((criterion) => <p key={criterion} className="rounded-xl bg-white p-3 font-bold">{criterion}</p>)}
        </div>
      </section>
      <div className="mt-8 space-y-6">
        {methodCases.map((item) => (
          <section key={item.id} className="rounded-2xl border border-slate-200 p-5 sm:p-6" aria-labelledby={`method-case-${item.id}`}>
            <h3 id={`method-case-${item.id}`} className="text-lg font-black text-slate-950">{item.title}</h3>
            <p className="mt-2 leading-7 text-slate-700">{item.description}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {methodChoices.map((choice) => <Button key={choice.id} variant={methods[item.id] === choice.id ? 'primary' : 'secondary'} className="h-auto min-h-14 whitespace-normal text-left leading-6" aria-pressed={methods[item.id] === choice.id} onClick={() => { setMethods((current) => ({ ...current, [item.id]: choice.id })); setResult('idle') }}>{choice.label}</Button>)}
            </div>
            <fieldset className="mt-5">
              <legend className="font-bold text-slate-900">핵심 근거를 하나 고르세요</legend>
              <div className="mt-3 grid gap-3">{item.reasons.map((reason) => <RadioOption key={reason.id} selected={reasons[item.id] === reason.id} onClick={() => { setReasons((current) => ({ ...current, [item.id]: reason.id })); setResult('idle') }}>{reason.label}</RadioOption>)}</div>
            </fieldset>
          </section>
        ))}
      </div>
      <Button className="mt-6" onClick={submit}>방법 선택 제출</Button>
      <ActivityFeedback result={result} incomplete="세 사례의 방법과 핵심 근거를 모두 고른 뒤 제출하세요." incorrect="복잡한 모델이 언제나 좋은 것은 아닙니다. 데이터의 형태·양, 패턴 복잡성, 설명 가능성, 자원을 사례와 다시 연결해 보세요." correct="정확합니다. 정해진 조건에는 규칙을, 소규모 표 데이터에는 일반 기계학습을, 많은 복잡한 이미지에는 딥러닝을 우선 검토할 수 있습니다." />
      {props.isComplete && <StepCompletionMessage>문제의 조건을 근거로 세 가지 방법을 판단했습니다.</StepCompletionMessage>}
    </StepFrame>
  )
}

interface Lesson01Step7Props extends CommonStepProps {
  priorStepsComplete: boolean
  onCompletionReadyChange: (ready: boolean) => void
}

type ProjectField = keyof typeof projectOptions

const projectFields: { id: ProjectField; title: string; prompt: string }[] = [
  { id: 'data', title: '1. 수집할 데이터', prompt: '어떤 이미지를 모아야 할까요?' },
  { id: 'label', title: '2. 정답 레이블', prompt: '각 이미지에 붙일 정답 이름은 무엇일까요?' },
  { id: 'avoid', title: '3. 입력으로 사용하면 안 되는 정보', prompt: '정답을 몰래 알려 주는 정보는 무엇일까요?' },
  { id: 'method', title: '4. 사용할 학습 방식', prompt: '사람이 특징을 하나씩 설계하는 대신, 많은 이미지에서 신경망이 특징을 학습하게 하려면 어떤 방법일까요?' },
  { id: 'evaluation', title: '5. 결과 평가 방법', prompt: '어떻게 실제 사용 가능성을 확인할까요?' },
]


type ReviewItem = { label: string; purpose?: string; done: boolean | null; remaining?: string }
function ReviewNavigation({ label, items, current, onChange }: { label: string; items: ReviewItem[]; current: number; onChange: (index: number) => void }) {
  const heading = useRef<HTMLParagraphElement>(null)
  const move = (index: number) => {
    onChange(index)
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true })
      heading.current?.scrollIntoView({ block: 'start' })
    })
  }
  return <div className="my-5 min-w-0">
    <nav aria-label={label} className="rounded-xl border border-slate-300 bg-slate-50 p-3">
      <div className={`grid gap-2 ${label === '확인 문제 이동' ? 'grid-cols-2 sm:grid-cols-4' : 'sm:grid-cols-2'}`}>
        {items.map((item, index) => <button key={item.label} type="button" aria-current={current === index ? 'step' : undefined} onClick={() => move(index)} className={`min-h-11 min-w-0 rounded-lg border-2 p-3 text-left text-sm focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${current === index ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white'}`}>
          <span className="block break-keep font-bold">{item.label} · {item.done === null ? '참고 · 제출 없음' : item.done ? '✓ 정답 제출' : '○ 남음'}</span>
          {item.done === false && <span className="mt-1 block leading-5">{item.remaining}</span>}
        </button>)}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="secondary" disabled={current === 0} onClick={() => move(current - 1)}>이전 {label === '확인 문제 이동' ? '문제' : '구간'}</Button>
        <Button variant="secondary" disabled={current === items.length - 1} onClick={() => move(current + 1)}>다음 {label === '확인 문제 이동' ? '문제' : '구간'}</Button>
      </div>
    </nav>
    <p ref={heading} tabIndex={-1} className="mt-5 scroll-mt-64 leading-7 text-slate-700 focus-visible:outline-2 focus-visible:outline-indigo-600 md:scroll-mt-44">{items[current].purpose ?? items[current].label}</p>
  </div>
}

export function Lesson01Step7({ priorStepsComplete, onCompletionReadyChange, ...props }: Lesson01Step7Props) {
  const [section, setSection] = useState(0)
  const [quizIndex, setQuizIndex] = useState(0)
  const [projectAnswers, setProjectAnswers] = useState<Partial<Record<ProjectField, string>>>({})
  const [limitations, setLimitations] = useState<string[]>([])
  const [projectResult, setProjectResult] = useState<ActivityResult>('idle')
  const [projectCorrect, setProjectCorrect] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [quizSubmitted, setQuizSubmitted] = useState<string[]>([])
  const validLimitations = projectLimitations.map((item) => item.id)
  const allQuizCorrect = lesson01Quiz.every((question) => {
    const selected = question.options.find((option) => option.id === quizAnswers[question.id])
    return quizSubmitted.includes(question.id) && selected?.correct
  })

  useEffect(() => {
    onCompletionReadyChange(priorStepsComplete && projectCorrect && allQuizCorrect)
  }, [allQuizCorrect, onCompletionReadyChange, priorStepsComplete, projectCorrect])

  const changeProject = (field: ProjectField, value: string) => {
    setProjectAnswers((current) => ({ ...current, [field]: value }))
    setProjectResult('idle')
    setProjectCorrect(false)
  }
  const toggleLimitation = (id: string) => {
    setLimitations((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
    setProjectResult('idle')
    setProjectCorrect(false)
  }
  const submitProject = () => {
    const allFieldsDone = projectFields.every((field) => projectAnswers[field.id])
    const correctFields = projectFields.every((field) => projectOptions[field.id].some((option) => option.id === projectAnswers[field.id] && option.correct))
    const correctLimitations = validLimitations.every((id) => limitations.includes(id)) && limitations.length === validLimitations.length
    if (!allFieldsDone || limitations.length === 0) return setProjectResult('incomplete')
    if (correctFields && correctLimitations) {
      setProjectResult('correct')
      setProjectCorrect(true)
    } else setProjectResult('incorrect')
  }
  const selectQuiz = (questionId: string, answerId: string) => {
    setQuizAnswers((current) => ({ ...current, [questionId]: answerId }))
    setQuizSubmitted((current) => current.filter((id) => id !== questionId))
  }
  const submitQuiz = (questionId: string) => setQuizSubmitted((current) => current.includes(questionId) ? current : [...current, questionId])

  return (
    <StepFrame {...props} step={7} intro="새로운 이미지 분류 문제를 설계하며 데이터·레이블·특징·학습 방식·평가·한계를 하나의 흐름으로 연결합니다.">
      <ReviewNavigation label="소구간 이동" current={section} onChange={setSection} items={[
        { label: '1. 미니 AI 프로젝트 설계', purpose: '데이터·레이블·평가와 한계를 선택하고 프로젝트를 제출하세요.', done: projectCorrect, remaining: '다섯 선택과 한계 판단 후 설계 제출' },
        { label: '2. 마지막 확인 문제', purpose: '배운 개념을 문제마다 판단해 제출하세요.', done: allQuizCorrect, remaining: '모든 문제 정답 제출' },
      ]} />
      <div hidden={section !== 0} aria-label="소구간 1 내용">
      <section className="rounded-2xl border border-cyan-200 bg-cyan-50/50 p-5" aria-labelledby="project-title">
        <h3 id="project-title" className="text-xl font-black text-slate-950">미니 AI 프로젝트 · 학교 분리수거 분류</h3>
        <p className="mt-2 leading-7 text-slate-700">다양한 물체 이미지가 충분히 있고, 여러 층이 시각 특징을 학습하게 하려 합니다. 분리수거함에 들어온 물체의 이미지를 보고 <strong>종이·플라스틱·캔</strong>으로 분류하는 시스템을 설계합니다.</p>
      </section>
      <div className="mt-7 space-y-6">
        {projectFields.map((field) => (
          <fieldset key={field.id} className="rounded-2xl border border-slate-200 p-5">
            <legend className="px-1 text-lg font-black text-slate-950">{field.title}</legend>
            <p className="mt-1 leading-7 text-slate-600">{field.prompt}</p>
            <div className="mt-4 grid gap-3">{projectOptions[field.id].map((option) => <RadioOption key={option.id} selected={projectAnswers[field.id] === option.id} onClick={() => changeProject(field.id, option.id)}>{option.label}</RadioOption>)}</div>
          </fieldset>
        ))}
      </div>
      <fieldset className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/40 p-5">
        <legend className="px-1 text-lg font-black text-slate-950">6. 실제 사용 시 생길 수 있는 한계를 모두 고르세요</legend>
        <p className="mt-2 leading-7 text-slate-700">현실에서는 학습 사진과 다른 상황이 생길 수 있습니다.</p>
        <div className="mt-4 grid gap-3">
          {[...projectLimitations, { id: 'always-perfect', label: '한 번 학습하면 모든 상황에서 항상 정확하다.' }].map((item) => <RadioOption key={item.id} selected={limitations.includes(item.id)} onClick={() => toggleLimitation(item.id)}>{item.label}</RadioOption>)}
        </div>
      </fieldset>
      <Button className="mt-6" onClick={submitProject}>프로젝트 설계 제출</Button>
      <ActivityFeedback result={projectResult} incomplete="다섯 연결과 한계 선택을 모두 마친 뒤 제출하세요." incorrect="다양한 실제 이미지를 데이터로 모으고, 정답을 새는 파일 이름은 피하며, 학습에 쓰지 않은 새 이미지로 평가해야 합니다. 현실의 한계도 다시 확인하세요." correct="프로젝트 설계가 완성되었습니다. 데이터의 범위와 새 데이터 평가, 실제 환경의 한계를 함께 고려했습니다." />

      </div>
      <div hidden={section !== 1} aria-label="소구간 2 내용">
      <section className="mt-10 border-t border-slate-200 pt-8" aria-labelledby="lesson01-quiz-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><h3 id="lesson01-quiz-title" className="text-xl font-black text-slate-950">마지막 확인 문제</h3><p className="mt-2 leading-7 text-slate-600">오답은 선택을 바꾼 뒤 다시 제출할 수 있습니다.</p></div>
          <span className="rounded-full bg-indigo-100 px-3 py-1.5 text-sm font-black text-indigo-800">{lesson01Quiz.filter((question) => quizSubmitted.includes(question.id) && question.options.find((option) => option.id === quizAnswers[question.id])?.correct).length} / {lesson01Quiz.length} 정답</span>
        </div>
        <ReviewNavigation label="확인 문제 이동" current={quizIndex} onChange={setQuizIndex} items={lesson01Quiz.map((question, index) => ({ label: `문제 ${index + 1}`, done: quizSubmitted.includes(question.id) && !!question.options.find(option => option.id === quizAnswers[question.id])?.correct, remaining: quizSubmitted.includes(question.id) ? '오답 수정 후 재제출' : '선택 후 제출' }))} />
        <div className="mt-5 space-y-5">
          {lesson01Quiz.map((question, index) => {
            const submitted = quizSubmitted.includes(question.id)
            const selected = question.options.find((option) => option.id === quizAnswers[question.id])
            return (
              <fieldset hidden={quizIndex !== index} key={question.id} className="rounded-2xl border border-slate-200 p-5">
                <legend className="px-1 font-black leading-7 text-slate-950">문제 {index + 1}. {question.question}</legend>
                <div className="mt-4 grid gap-3">{question.options.map((option) => <RadioOption key={option.id} selected={quizAnswers[question.id] === option.id} onClick={() => selectQuiz(question.id, option.id)}>{option.label}</RadioOption>)}</div>
                <Button className="mt-4" onClick={() => submitQuiz(question.id)} disabled={!quizAnswers[question.id]}>답안 확인</Button>
                {submitted && <div className={`mt-4 flex items-start gap-3 rounded-xl p-4 ${selected?.correct ? 'bg-emerald-50 text-emerald-950' : 'bg-amber-50 text-amber-950'}`} role="status">{selected?.correct ? <CheckCircle2 className="mt-0.5 shrink-0" size={20} aria-hidden="true" /> : <XCircle className="mt-0.5 shrink-0" size={20} aria-hidden="true" />}<p className="leading-7">{selected?.correct ? `정답입니다. ${question.explanation}` : `다시 생각해 보세요. ${question.explanation}`}</p></div>}
              </fieldset>
            )
          })}
        </div>
      </section>

      </div>
      {projectCorrect && allQuizCorrect && !props.isComplete && <div className="mt-7 flex items-start gap-3 rounded-2xl bg-amber-50 p-5 text-amber-950" role="status"><CircleHelp className="mt-0.5 shrink-0" size={21} aria-hidden="true" /><p className="leading-7">프로젝트 설계와 확인 문제를 모두 통과했습니다. {priorStepsComplete ? '화면 아래의 완료 버튼으로 Lesson 01을 완료하세요.' : '앞 STEP의 핵심 활동을 모두 완료하면 완료 버튼이 활성화됩니다.'}</p></div>}

      {props.isComplete && <div className="mt-8 border-t border-emerald-200 pt-7"><div className="flex items-start gap-3 text-emerald-900" role="status"><CheckCircle2 className="mt-0.5 shrink-0" size={24} aria-hidden="true" /><div><h3 className="text-xl font-black">Lesson 01 완료</h3><p className="mt-2 leading-7">홈의 전체 진행도에 1개 차시 완료로 반영되었습니다.</p></div></div><div className="mt-7 rounded-2xl bg-indigo-50 p-5"><p className="font-black text-indigo-900">Lesson 02로 이어지는 질문</p><p className="mt-2 text-lg font-bold leading-7 text-slate-900">신경망 안에서는 어떻게 계산할까요?</p><div className="mt-5 flex flex-col gap-3 sm:flex-row"><Link to="/" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:border-indigo-300 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Home에서 진행도 보기</Link><Link to="/lesson/02" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Lesson 02 미리 보기<ArrowRight size={18} aria-hidden="true" /></Link></div></div></div>}
    </StepFrame>
  )
}
