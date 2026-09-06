import {
  ArrowDown,
  ArrowRight,
  Cat,
  Check,
  CheckCircle2,
  Circle,
  CircleHelp,
  Dog,
  Images,
  Lightbulb,
  Network,
  RotateCcw,
  Search,
  Sparkles,
  UserRound,
  XCircle,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import {
  caseStudies,
  comparisonCards,
  comparisonCategories,
  deepLearningFlow,
  featureCandidates,
  lesson01Objectives,
  lesson01StepTitles,
  machineLearningFlow,
  type CaseDecision,
  type ComparisonCategory,
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

function StepFrame({
  step,
  intro,
  active,
  isComplete,
  children,
}: StepFrameProps) {
  const titleId = active ? 'lesson-step-title' : `lesson01-step-${step}-title`

  return (
    <Card
      as="section"
      hidden={!active}
      aria-labelledby={titleId}
      className="overflow-hidden"
    >
      <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-50 via-white to-cyan-50 px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-black tracking-[0.15em] text-indigo-700">
            STEP {step}
          </span>
          <span
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm font-bold ${
              isComplete
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-white text-slate-600 ring-1 ring-slate-200'
            }`}
          >
            {isComplete ? (
              <CheckCircle2 size={17} aria-hidden="true" />
            ) : (
              <Circle size={14} aria-hidden="true" />
            )}
            {isComplete ? '활동 완료' : '활동 필요'}
          </span>
        </div>
        <h2
          id={titleId}
          tabIndex={active ? -1 : undefined}
          className="step-focus-target mt-4 text-2xl font-black leading-snug tracking-tight text-slate-950 focus:outline-none sm:text-3xl"
        >
          {lesson01StepTitles[step - 1]}
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
          {intro}
        </p>
      </div>
      <div className="px-5 py-7 sm:px-8 sm:py-9">{children}</div>
    </Card>
  )
}

function StepCompletionMessage({ children }: { children: ReactNode }) {
  return (
    <div
      className="mt-7 flex items-start gap-3 border-t border-emerald-200 pt-5 text-emerald-900"
      role="status"
    >
      <CheckCircle2 className="mt-0.5 shrink-0" size={21} aria-hidden="true" />
      <p className="font-semibold leading-7">{children}</p>
    </div>
  )
}

export function Lesson01Step1(props: CommonStepProps) {
  const [choice, setChoice] = useState<'human' | 'ai' | null>(null)

  const choose = (nextChoice: 'human' | 'ai') => {
    setChoice(nextChoice)
    props.onComplete()
  }

  return (
    <StepFrame
      {...props}
      step={1}
      intro="사람은 사진을 볼 때 어떤 단서를 이용할까요? 고양이와 강아지를 구분하는 상황에서 특징을 누가 찾는지 생각해 봅니다."
    >
      <section aria-labelledby="lesson01-goals-title">
        <h3 id="lesson01-goals-title" className="text-xl font-black text-slate-950">
          이번 차시에서 알아볼 것
        </h3>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {lesson01Objectives.map((objective, index) => (
            <li key={objective} className="flex items-start gap-3 leading-7 text-slate-700">
              <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-700">
                {index + 1}
              </span>
              <span>{objective}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 border-t border-slate-200 pt-4 text-sm leading-6 text-slate-600">
          이번 차시에서는 가중치, 편향, 퍼셉트론 계산, 활성화 함수 계산,
          손실함수와 역전파를 계산하지 않습니다. 이 내용은 이후 차시에서 다룹니다.
        </p>
      </section>

      <section className="mt-9" aria-labelledby="animal-clues-title">
        <h3 id="animal-clues-title" className="text-xl font-black text-slate-950">
          사진에서 찾을 수 있는 단서
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex min-h-36 items-center gap-4 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5">
            <Cat className="shrink-0 text-indigo-600" size={44} aria-hidden="true" />
            <div>
              <p className="font-black text-slate-950">고양이</p>
              <p className="mt-1 leading-6 text-slate-600">귀 모양과 얼굴 형태, 털과 눈을 살펴볼 수 있어요.</p>
            </div>
          </div>
          <div className="flex min-h-36 items-center gap-4 rounded-2xl border border-cyan-200 bg-cyan-50/70 p-5">
            <Dog className="shrink-0 text-cyan-700" size={44} aria-hidden="true" />
            <div>
              <p className="font-black text-slate-950">강아지</p>
              <p className="mt-1 leading-6 text-slate-600">같은 단서를 보더라도 모습과 조합은 달라질 수 있어요.</p>
            </div>
          </div>
        </div>
      </section>

      <fieldset className="mt-9">
        <legend className="text-xl font-black leading-snug text-slate-950">
          컴퓨터가 고양이와 강아지를 구분하려면 누가 이런 특징을 찾아야 할까요?
        </legend>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Button
            variant={choice === 'human' ? 'primary' : 'secondary'}
            className="h-auto min-h-14 justify-start text-left leading-6"
            aria-pressed={choice === 'human'}
            onClick={() => choose('human')}
          >
            A. 사람이 중요한 특징을 찾아 알려준다
          </Button>
          <Button
            variant={choice === 'ai' ? 'primary' : 'secondary'}
            className="h-auto min-h-14 justify-start text-left leading-6"
            aria-pressed={choice === 'ai'}
            onClick={() => choose('ai')}
          >
            B. AI가 데이터에서 중요한 특징을 학습한다
          </Button>
        </div>
      </fieldset>

      {choice && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-slate-100 p-5" role="status">
          <CircleHelp className="mt-0.5 shrink-0 text-indigo-600" size={22} aria-hidden="true" />
          <p className="leading-7 text-slate-700">
            지금은 정답이나 오답으로 나누지 않습니다. 사람이 특징을 정하는 방식과 AI가
            데이터에서 특징을 학습하는 방식의 차이를 앞으로 알아봅시다.
          </p>
        </div>
      )}
      {props.isComplete && (
        <StepCompletionMessage>두 방식 중 하나를 선택하고 차이를 살펴볼 준비를 마쳤습니다.</StepCompletionMessage>
      )}
    </StepFrame>
  )
}

export function Lesson01Step2(props: CommonStepProps) {
  const [viewed, setViewed] = useState<string[]>([])
  const [activeNode, setActiveNode] = useState<(typeof machineLearningFlow)[number] | null>(null)

  useEffect(() => {
    if (!props.isComplete && viewed.length === machineLearningFlow.length) {
      props.onComplete()
    }
  }, [props.isComplete, props.onComplete, viewed.length])

  const inspectNode = (node: (typeof machineLearningFlow)[number]) => {
    setActiveNode(node)
    setViewed((current) =>
      current.includes(node.id) ? current : [...current, node.id],
    )
  }

  return (
    <StepFrame
      {...props}
      step={2}
      intro="기계학습이 데이터를 받아 결과를 만드는 기본 흐름을 노드별로 확인합니다."
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xl font-black text-slate-950">기계학습 Signal Flow</h3>
        <span className="text-sm font-bold tabular-nums text-indigo-700">
          {viewed.length} / {machineLearningFlow.length} 확인
        </span>
      </div>

      <div className="mt-5 grid items-center gap-2 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]">
        {machineLearningFlow.map((node, index) => {
          const isViewed = viewed.includes(node.id)
          const isActive = activeNode?.id === node.id
          return (
            <div className="contents" key={node.id}>
              <button
                type="button"
                onClick={() => inspectNode(node)}
                aria-pressed={isActive}
                className={`min-h-24 rounded-2xl border p-4 text-left transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 bg-white hover:border-indigo-300'
                }`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-lg font-black text-slate-950">{node.label}</span>
                  {isViewed ? (
                    <CheckCircle2 className="text-emerald-600" size={20} aria-label="확인함" />
                  ) : (
                    <Circle className="text-slate-400" size={18} aria-label="확인 전" />
                  )}
                </span>
                <span className="mt-2 block text-sm leading-6 text-slate-600">눌러서 설명 보기</span>
              </button>
              {index < machineLearningFlow.length - 1 && (
                <>
                  <ArrowDown className="mx-auto text-cyan-600 md:hidden" size={20} aria-hidden="true" />
                  <ArrowRight className="hidden text-cyan-600 md:block" size={22} aria-hidden="true" />
                </>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-6 min-h-24 rounded-2xl bg-slate-100 p-5" aria-live="polite">
        {activeNode ? (
          <>
            <p className="font-black text-indigo-700">{activeNode.label}</p>
            <p className="mt-1 leading-7 text-slate-700">{activeNode.description}</p>
          </>
        ) : (
          <p className="leading-7 text-slate-600">각 노드를 순서대로 눌러 짧은 설명을 확인하세요.</p>
        )}
      </div>

      {props.isComplete && (
        <StepCompletionMessage>데이터에서 결과까지 네 노드의 역할을 모두 확인했습니다.</StepCompletionMessage>
      )}
    </StepFrame>
  )
}

export function Lesson01Step3(props: CommonStepProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [confirmed, setConfirmed] = useState(false)
  const [notice, setNotice] = useState('')

  const toggleFeature = (feature: string) => {
    setConfirmed(false)
    setNotice('')
    if (selected.includes(feature)) {
      setSelected((current) => current.filter((item) => item !== feature))
      return
    }
    if (selected.length >= 3) {
      setNotice('특징은 최대 3개까지 고를 수 있습니다.')
      return
    }
    setSelected((current) => [...current, feature])
  }

  const confirmSelection = () => {
    if (selected.length < 1 || selected.length > 3) return
    setConfirmed(true)
    props.onComplete()
  }

  return (
    <StepFrame
      {...props}
      step={3}
      intro="고양이와 강아지를 분류할 때 도움이 될 것 같은 특징을 직접 골라 봅니다."
    >
      <fieldset>
        <legend className="text-xl font-black text-slate-950">
          특징을 1개에서 3개까지 선택하세요
        </legend>
        <p className="mt-2 leading-7 text-slate-600">
          절대적인 정답은 없습니다. 어떤 정보를 판단에 사용할지 생각하는 활동입니다.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featureCandidates.map((feature) => {
            const isSelected = selected.includes(feature)
            return (
              <button
                key={feature}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleFeature(feature)}
                className={`flex min-h-14 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left font-bold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300'
                }`}
              >
                <span>{feature}</span>
                {isSelected ? (
                  <CheckCircle2 size={20} aria-label="선택됨" />
                ) : (
                  <Circle size={18} aria-label="선택 안 됨" />
                )}
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-slate-600" aria-live="polite">
          {notice || `${selected.length}개 선택됨`}
        </p>
        <Button onClick={confirmSelection} disabled={selected.length < 1 || selected.length > 3}>
          선택 완료
          <Check size={18} aria-hidden="true" />
        </Button>
      </div>

      {confirmed && (
        <div className="mt-6 rounded-2xl bg-indigo-50 p-5" role="status">
          <p className="font-black text-indigo-900">사람이 특징을 정하는 과정</p>
          <p className="mt-2 leading-7 text-slate-700">
            일반적인 기계학습에서는 사람이 문제 해결에 사용할 특징을 선정하거나 가공하는
            과정이 중요한 경우가 많습니다. 배경이나 파일 이름을 골랐더라도 오답으로
            처리하지 않습니다. 실제 문제에서는 그 특징이 도움이 되는지 데이터로 확인합니다.
          </p>
        </div>
      )}

      {props.isComplete && (
        <StepCompletionMessage>특징을 선택하고 사람이 특징을 정하는 과정의 설명을 확인했습니다.</StepCompletionMessage>
      )}
    </StepFrame>
  )
}

function FlowRow({
  label,
  nodes,
  tone,
  revealedCount = nodes.length,
}: {
  label: string
  nodes: readonly string[]
  tone: 'indigo' | 'cyan'
  revealedCount?: number
}) {
  return (
    <div>
      <p className={`text-sm font-black ${tone === 'indigo' ? 'text-indigo-700' : 'text-cyan-800'}`}>
        {label}
      </p>
      <div className="mt-3 grid items-center gap-2 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]">
        {nodes.map((node, index) => {
          const isRevealed = index < revealedCount
          const isCurrent = index === revealedCount - 1
          return (
            <div className="contents" key={node}>
              <div
                className={`flex min-h-16 items-center justify-center rounded-xl border px-3 py-3 text-center font-bold transition-colors ${
                  isCurrent
                    ? tone === 'indigo'
                      ? 'border-indigo-500 bg-indigo-100 text-indigo-950'
                      : 'border-cyan-600 bg-cyan-100 text-cyan-950'
                    : isRevealed
                      ? 'border-slate-300 bg-white text-slate-800'
                      : 'border-slate-200 bg-slate-100 text-slate-400'
                }`}
              >
                {isRevealed ? node : '아직 확인 전'}
              </div>
              {index < nodes.length - 1 && (
                <>
                  <ArrowDown className="mx-auto text-slate-400 md:hidden" size={19} aria-hidden="true" />
                  <ArrowRight className="hidden text-slate-400 md:block" size={21} aria-hidden="true" />
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function Lesson01Step4(props: CommonStepProps) {
  const [revealedCount, setRevealedCount] = useState(1)

  const showNext = () => {
    const next = Math.min(deepLearningFlow.length, revealedCount + 1)
    setRevealedCount(next)
    if (next === deepLearningFlow.length) props.onComplete()
  }

  return (
    <StepFrame
      {...props}
      step={4}
      intro="같은 동물 분류 문제를 일반적인 기계학습과 딥러닝의 두 흐름으로 비교합니다."
    >
      <div className="space-y-8">
        <FlowRow
          label="일반적인 기계학습"
          nodes={['데이터', '사람이 특징 선정', '모델', '결과']}
          tone="indigo"
        />
        <FlowRow
          label="딥러닝"
          nodes={deepLearningFlow}
          tone="cyan"
          revealedCount={revealedCount}
        />
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-slate-600" aria-live="polite">
          딥러닝 흐름 {revealedCount} / {deepLearningFlow.length}
        </p>
        {revealedCount < deepLearningFlow.length ? (
          <Button onClick={showNext}>
            다음 흐름 보기
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => setRevealedCount(1)}>
            <RotateCcw size={18} aria-hidden="true" />
            처음부터 다시 보기
          </Button>
        )}
      </div>

      {revealedCount === deepLearningFlow.length && (
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-cyan-50 p-5">
            <Network className="text-cyan-700" size={24} aria-hidden="true" />
            <p className="mt-3 leading-7 text-slate-700">
              딥러닝은 인공신경망을 이용해 많은 데이터에서 분류에 도움이 되는 특징을
              학습할 수 있습니다.
            </p>
          </div>
          <div className="rounded-2xl bg-indigo-50 p-5">
            <UserRound className="text-indigo-700" size={24} aria-hidden="true" />
            <p className="mt-3 leading-7 text-slate-700">
              사람이 모든 특징과 판단 규칙을 하나씩 직접 입력하는 방식과는 다릅니다.
              이번 단계에서는 신경망 내부 계산까지 설명하지 않습니다.
            </p>
          </div>
        </div>
      )}

      {props.isComplete && (
        <>
          <StepCompletionMessage>딥러닝 Signal Flow를 마지막 결과까지 확인했습니다.</StepCompletionMessage>
          <p className="mt-5 flex items-start gap-3 font-bold leading-7 text-indigo-800">
            <Lightbulb className="mt-0.5 shrink-0" size={21} aria-hidden="true" />
            Lesson 02로 이어지는 질문: 신경망 안에서는 어떻게 계산할까요?
          </p>
        </>
      )}
    </StepFrame>
  )
}

export function Lesson01Step5(props: CommonStepProps) {
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [assignments, setAssignments] = useState<Record<number, ComparisonCategory>>({})
  const allClassified = Object.keys(assignments).length === comparisonCards.length

  useEffect(() => {
    if (!props.isComplete && allClassified) props.onComplete()
  }, [allClassified, props.isComplete, props.onComplete])

  const assignSelected = (category: ComparisonCategory) => {
    if (selectedCard === null) return
    setAssignments((current) => ({ ...current, [selectedCard]: category }))
    const nextCard = comparisonCards.find(
      (card) => card.id !== selectedCard && assignments[card.id] === undefined,
    )
    setSelectedCard(nextCard?.id ?? null)
  }

  const score = useMemo(
    () => comparisonCards.filter((card) => assignments[card.id] === card.answer).length,
    [assignments],
  )

  return (
    <StepFrame
      {...props}
      step={5}
      intro="문장 카드를 선택한 뒤 가장 가까운 영역에 분류하며 두 방식의 공통점과 차이점을 찾습니다."
    >
      <section aria-labelledby="classification-cards-title">
        <div className="flex items-center justify-between gap-4">
          <h3 id="classification-cards-title" className="text-xl font-black text-slate-950">
            분류할 카드
          </h3>
          <span className="text-sm font-bold tabular-nums text-indigo-700">
            {Object.keys(assignments).length} / {comparisonCards.length} 분류
          </span>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {comparisonCards.map((card) => {
            const category = comparisonCategories.find(
              (item) => item.id === assignments[card.id],
            )
            const isSelected = selectedCard === card.id
            return (
              <button
                type="button"
                key={card.id}
                aria-pressed={isSelected}
                onClick={() => setSelectedCard(card.id)}
                className={`min-h-20 rounded-xl border p-4 text-left focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 bg-white hover:border-indigo-300'
                }`}
              >
                <span className="block font-bold leading-6 text-slate-900">{card.text}</span>
                <span className="mt-2 block text-sm font-semibold text-slate-500">
                  {category ? `현재 분류: ${category.label}` : '눌러서 분류하기'}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="mt-8" aria-labelledby="classification-areas-title">
        <h3 id="classification-areas-title" className="text-xl font-black text-slate-950">
          세 영역 중 하나를 선택하세요
        </h3>
        {selectedCard !== null ? (
          <p className="mt-2 leading-7 text-slate-600">
            선택한 카드: {comparisonCards.find((card) => card.id === selectedCard)?.text}
          </p>
        ) : (
          <p className="mt-2 leading-7 text-slate-600">먼저 위에서 분류할 카드를 선택하세요.</p>
        )}
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {comparisonCategories.map((category) => {
            const assignedCards = comparisonCards.filter(
              (card) => assignments[card.id] === category.id,
            )
            return (
              <div key={category.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <Button
                  variant="secondary"
                  className="h-auto w-full min-h-14 leading-6"
                  onClick={() => assignSelected(category.id)}
                  disabled={selectedCard === null}
                >
                  {category.label}
                </Button>
                <ul className="mt-3 space-y-2">
                  {assignedCards.length === 0 ? (
                    <li className="text-sm text-slate-500">아직 분류한 카드가 없습니다.</li>
                  ) : (
                    assignedCards.map((card) => (
                      <li key={card.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedCard(card.id)}
                          className="min-h-11 w-full rounded-lg bg-white px-3 py-2 text-left text-sm font-semibold leading-5 text-slate-700 ring-1 ring-slate-200 focus-visible:outline-3 focus-visible:outline-indigo-600"
                        >
                          {card.text}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )
          })}
        </div>
      </section>

      {allClassified && (
        <section className="mt-8 border-t border-slate-200 pt-7" aria-labelledby="classification-result-title">
          <h3 id="classification-result-title" className="text-xl font-black text-slate-950">
            분류 결과와 설명
          </h3>
          <p className="mt-2 leading-7 text-slate-600">
            제안한 분류와 {score}개가 같았습니다. 다른 선택이 있어도 설명을 읽고 다시 분류할 수 있습니다.
          </p>
          <ul className="mt-5 space-y-3">
            {comparisonCards.map((card) => {
              const isCorrect = assignments[card.id] === card.answer
              const answerLabel = comparisonCategories.find(
                (category) => category.id === card.answer,
              )?.label
              return (
                <li key={card.id} className="flex items-start gap-3 rounded-xl bg-slate-100 p-4">
                  {isCorrect ? (
                    <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={21} aria-hidden="true" />
                  ) : (
                    <CircleHelp className="mt-0.5 shrink-0 text-amber-600" size={21} aria-hidden="true" />
                  )}
                  <div>
                    <p className="font-bold text-slate-900">
                      {isCorrect ? '제안한 분류와 같아요' : `제안한 분류: ${answerLabel}`}
                    </p>
                    <p className="mt-1 leading-6 text-slate-600">{card.explanation}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {props.isComplete && (
        <StepCompletionMessage>다섯 문장을 모두 분류하고 결과 설명을 확인했습니다.</StepCompletionMessage>
      )}
    </StepFrame>
  )
}

export function Lesson01Step6(props: CommonStepProps) {
  const [decisions, setDecisions] = useState<Record<number, CaseDecision>>({})
  const allDecided = Object.keys(decisions).length === caseStudies.length

  useEffect(() => {
    if (!props.isComplete && allDecided) props.onComplete()
  }, [allDecided, props.isComplete, props.onComplete])

  return (
    <StepFrame
      {...props}
      step={6}
      intro="문제의 복잡성과 데이터의 양을 살펴보고 딥러닝이 특히 유용할지 판단합니다."
    >
      <div className="space-y-5">
        {caseStudies.map((study) => {
          const decision = decisions[study.id]
          const isSuggested = decision === study.answer
          return (
            <section key={study.id} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex items-start gap-4">
                {study.id === 1 ? (
                  <Search className="mt-0.5 shrink-0 text-indigo-600" size={25} aria-hidden="true" />
                ) : study.id === 2 ? (
                  <Images className="mt-0.5 shrink-0 text-cyan-700" size={25} aria-hidden="true" />
                ) : (
                  <Sparkles className="mt-0.5 shrink-0 text-violet-600" size={25} aria-hidden="true" />
                )}
                <div>
                  <p className="text-sm font-black text-indigo-700">사례 {study.id}</p>
                  <h3 className="mt-1 text-lg font-black text-slate-950">{study.title}</h3>
                  <p className="mt-2 leading-7 text-slate-600">{study.description}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2" role="group" aria-label={`${study.title} 판단`}>
                <Button
                  variant={decision === 'useful' ? 'primary' : 'secondary'}
                  className="h-auto min-h-14 leading-6"
                  aria-pressed={decision === 'useful'}
                  onClick={() => setDecisions((current) => ({ ...current, [study.id]: 'useful' }))}
                >
                  딥러닝이 특히 유용할 수 있음
                </Button>
                <Button
                  variant={decision === 'not-required' ? 'primary' : 'secondary'}
                  className="h-auto min-h-14 leading-6"
                  aria-pressed={decision === 'not-required'}
                  onClick={() => setDecisions((current) => ({ ...current, [study.id]: 'not-required' }))}
                >
                  꼭 딥러닝일 필요는 없음
                </Button>
              </div>
              {decision && (
                <div className="mt-4 flex items-start gap-3 rounded-xl bg-slate-100 p-4" role="status">
                  {isSuggested ? (
                    <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={20} aria-hidden="true" />
                  ) : (
                    <CircleHelp className="mt-0.5 shrink-0 text-amber-600" size={20} aria-hidden="true" />
                  )}
                  <div>
                    <p className="font-bold text-slate-900">
                      {isSuggested ? '제안한 판단과 같아요' : '이렇게도 생각해 보세요'}
                    </p>
                    <p className="mt-1 leading-6 text-slate-600">{study.explanation}</p>
                  </div>
                </div>
              )}
            </section>
          )
        })}
      </div>

      {allDecided && (
        <div className="mt-7 rounded-2xl bg-indigo-50 p-5">
          <p className="font-black text-indigo-900">판단의 기준</p>
          <p className="mt-2 leading-7 text-slate-700">
            복잡한 문제와 많은 데이터를 다룰 때 딥러닝이 강점을 보이는 경우가 많습니다.
            하지만 모든 문제에서 딥러닝을 사용해야 하는 것은 아닙니다.
          </p>
        </div>
      )}

      {props.isComplete && (
        <StepCompletionMessage>세 사례를 모두 판단하고 딥러닝이 항상 필요한 것은 아님을 확인했습니다.</StepCompletionMessage>
      )}
    </StepFrame>
  )
}

function QuizFeedback({ correct, explanation }: { correct: boolean; explanation: string }) {
  return (
    <div
      className={`mt-4 flex items-start gap-3 rounded-xl p-4 ${
        correct ? 'bg-emerald-50 text-emerald-950' : 'bg-rose-50 text-rose-950'
      }`}
      role="status"
    >
      {correct ? (
        <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={21} aria-hidden="true" />
      ) : (
        <XCircle className="mt-0.5 shrink-0 text-rose-600" size={21} aria-hidden="true" />
      )}
      <div>
        <p className="font-black">{correct ? '정답입니다' : '다시 생각해 보세요'}</p>
        <p className="mt-1 leading-6">{explanation}</p>
      </div>
    </div>
  )
}

interface Step7Props extends CommonStepProps {
  priorStepsComplete: boolean
  onCompletionReadyChange: (ready: boolean) => void
}

export function Lesson01Step7({
  priorStepsComplete,
  onCompletionReadyChange,
  ...props
}: Step7Props) {
  const [answer1, setAnswer1] = useState<'O' | 'X' | null>(null)
  const [answer2, setAnswer2] = useState<'A' | 'B' | 'C' | 'D' | null>(null)
  const [answer3, setAnswer3] = useState<string[]>([])
  const [submitted, setSubmitted] = useState<number[]>([])
  const allSubmitted = submitted.length === 3

  useEffect(() => {
    onCompletionReadyChange(allSubmitted)
  }, [allSubmitted, onCompletionReadyChange])

  const markSubmitted = (question: number) => {
    setSubmitted((current) =>
      current.includes(question) ? current : [...current, question],
    )
  }

  const changeAnswer3 = (answer: string) => {
    setSubmitted((current) => current.filter((question) => question !== 3))
    setAnswer3((current) =>
      current.includes(answer)
        ? current.filter((item) => item !== answer)
        : [...current, answer],
    )
  }

  const answer3Correct =
    answer3.length === 2 && answer3.includes('A') && answer3.includes('B')

  return (
    <StepFrame
      {...props}
      step={7}
      intro="핵심 문장을 확인하고 세 문제에 답합니다. 틀려도 설명을 읽고 다시 시도할 수 있습니다."
    >
      <section aria-labelledby="lesson01-summary-title">
        <h3 id="lesson01-summary-title" className="text-xl font-black text-slate-950">
          오늘의 핵심 문장
        </h3>
        <ol className="mt-4 space-y-3">
          <li className="flex gap-3 rounded-xl bg-indigo-50 p-4 leading-7 text-slate-800">
            <span className="font-black text-indigo-700">①</span>
            딥러닝은 기계학습의 한 분야입니다.
          </li>
          <li className="flex gap-3 rounded-xl bg-indigo-50 p-4 leading-7 text-slate-800">
            <span className="font-black text-indigo-700">②</span>
            일반적인 기계학습에서는 사람이 사용할 특징을 정하는 경우가 많습니다.
          </li>
          <li className="flex gap-3 rounded-xl bg-indigo-50 p-4 leading-7 text-slate-800">
            <span className="font-black text-indigo-700">③</span>
            딥러닝은 인공신경망을 이용해 데이터에서 중요한 특징을 학습할 수 있습니다.
          </li>
        </ol>
      </section>

      <div className="mt-9 space-y-6">
        <fieldset className="rounded-2xl border border-slate-200 p-5 sm:p-6">
          <legend className="px-1 text-lg font-black leading-7 text-slate-950">
            문제 1. 딥러닝은 기계학습과 완전히 별개의 기술이다.
          </legend>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {(['O', 'X'] as const).map((answer) => (
              <Button
                key={answer}
                variant={answer1 === answer ? 'primary' : 'secondary'}
                aria-pressed={answer1 === answer}
                onClick={() => {
                  setAnswer1(answer)
                  setSubmitted((current) => current.filter((question) => question !== 1))
                }}
              >
                {answer}
              </Button>
            ))}
          </div>
          <Button className="mt-4" onClick={() => markSubmitted(1)} disabled={!answer1}>
            문제 1 제출
          </Button>
          {submitted.includes(1) && (
            <QuizFeedback
              correct={answer1 === 'X'}
              explanation="딥러닝은 기계학습과 완전히 별개가 아니라 기계학습의 한 분야입니다."
            />
          )}
        </fieldset>

        <fieldset className="rounded-2xl border border-slate-200 p-5 sm:p-6">
          <legend className="px-1 text-lg font-black leading-7 text-slate-950">
            문제 2. 딥러닝의 특징으로 가장 적절한 것은?
          </legend>
          <div className="mt-4 grid gap-3">
            {[
              ['A', '모든 판단 규칙을 사람이 직접 작성한다.'],
              ['B', '인공신경망이 데이터에서 특징을 학습할 수 있다.'],
              ['C', '데이터를 사용하지 않는다.'],
              ['D', '모든 문제에서 다른 방법보다 정확하다.'],
            ].map(([key, text]) => (
              <button
                key={key}
                type="button"
                aria-pressed={answer2 === key}
                onClick={() => {
                  setAnswer2(key as 'A' | 'B' | 'C' | 'D')
                  setSubmitted((current) => current.filter((question) => question !== 2))
                }}
                className={`min-h-14 rounded-xl border px-4 py-3 text-left font-semibold leading-6 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  answer2 === key
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-950'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300'
                }`}
              >
                {key}. {text}
              </button>
            ))}
          </div>
          <Button className="mt-4" onClick={() => markSubmitted(2)} disabled={!answer2}>
            문제 2 제출
          </Button>
          {submitted.includes(2) && (
            <QuizFeedback
              correct={answer2 === 'B'}
              explanation="딥러닝은 인공신경망을 이용해 데이터에서 분류에 도움이 되는 특징을 학습할 수 있습니다."
            />
          )}
        </fieldset>

        <fieldset className="rounded-2xl border border-slate-200 p-5 sm:p-6">
          <legend className="px-1 text-lg font-black leading-7 text-slate-950">
            문제 3. 다음 중 옳은 설명을 모두 고르세요.
          </legend>
          <div className="mt-4 grid gap-3">
            {[
              ['A', '기계학습과 딥러닝 모두 데이터를 이용할 수 있다.'],
              ['B', '딥러닝은 기계학습의 한 분야이다.'],
              ['C', '딥러닝은 모든 문제에서 가장 좋은 방법이다.'],
            ].map(([key, text]) => {
              const checked = answer3.includes(key)
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={checked}
                  onClick={() => changeAnswer3(key)}
                  className={`flex min-h-14 items-start gap-3 rounded-xl border px-4 py-3 text-left font-semibold leading-6 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                    checked
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-950'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300'
                  }`}
                >
                  {checked ? (
                    <CheckCircle2 className="mt-0.5 shrink-0" size={20} aria-label="선택됨" />
                  ) : (
                    <Circle className="mt-0.5 shrink-0" size={18} aria-label="선택 안 됨" />
                  )}
                  <span>{key}. {text}</span>
                </button>
              )
            })}
          </div>
          <Button className="mt-4" onClick={() => markSubmitted(3)} disabled={answer3.length === 0}>
            문제 3 제출
          </Button>
          {submitted.includes(3) && (
            <QuizFeedback
              correct={answer3Correct}
              explanation="A와 B가 옳습니다. 두 방식 모두 데이터를 이용할 수 있고, 딥러닝은 기계학습의 한 분야입니다. 모든 문제에서 딥러닝이 가장 좋은 것은 아닙니다."
            />
          )}
        </fieldset>
      </div>

      {allSubmitted && !props.isComplete && (
        <div className="mt-7 flex items-start gap-3 rounded-2xl bg-amber-50 p-5 text-amber-950" role="status">
          <CircleHelp className="mt-0.5 shrink-0" size={21} aria-hidden="true" />
          <p className="leading-7">
            세 문제를 모두 제출했습니다. {priorStepsComplete
              ? '화면 아래의 완료 버튼으로 Lesson 01을 완료하세요.'
              : '완료되지 않은 앞 STEP의 핵심 활동을 마치면 완료 버튼이 활성화됩니다.'}
          </p>
        </div>
      )}

      {props.isComplete && (
        <div className="mt-8 border-t border-emerald-200 pt-7">
          <div className="flex items-start gap-3 text-emerald-900" role="status">
            <CheckCircle2 className="mt-0.5 shrink-0" size={24} aria-hidden="true" />
            <div>
              <h3 className="text-xl font-black">Lesson 01 완료</h3>
              <p className="mt-2 leading-7">
                홈의 전체 진행도에 1개 차시 완료로 반영되었습니다.
              </p>
            </div>
          </div>
          <div className="mt-7 rounded-2xl bg-indigo-50 p-5">
            <p className="font-black text-indigo-900">Lesson 02로 이어지는 질문</p>
            <p className="mt-2 text-lg font-bold leading-7 text-slate-900">
              신경망 안에서는 어떻게 계산할까요?
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:border-indigo-300 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Home에서 진행도 보기
              </Link>
              <Link
                to="/lesson/02"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Lesson 02 미리 보기
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </StepFrame>
  )
}
