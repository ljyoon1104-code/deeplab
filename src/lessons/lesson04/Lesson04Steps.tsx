import {
  ArrowDown,
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  CircleHelp,
  Layers3,
  Lightbulb,
  Link2,
  RotateCcw,
  Sparkles,
  XCircle,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  hiddenProcessCards,
  irisCards,
  lesson04Objectives,
  lesson04Quiz,
  lesson04StepTitles,
  networkLayers,
  outputCases,
  type LayerId,
} from './lesson04Data'
import {
  NeuralNetworkDiagram,
  SimpleFlow,
  type DiagramLayer,
} from './NeuralNetworkDiagram'

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
  const titleId = active ? 'lesson-step-title' : `lesson04-step-${step}-title`

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
          {lesson04StepTitles[step - 1]}
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

function AnswerFeedback({
  correct,
  explanation,
}: {
  correct: boolean
  explanation: string
}) {
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
        <p className="font-black">
          {correct ? '정답입니다' : '설명을 확인하고 다시 시도하세요'}
        </p>
        <p className="mt-1 leading-6">{explanation}</p>
      </div>
    </div>
  )
}

const annLayers: DiagramLayer[] = [
  { id: 'ann-input', label: '여러 입력', role: '입력 정보', nodeCount: 3, tone: 'indigo' },
  { id: 'ann-hidden-1', label: '여러 인공 뉴런', role: '첫 번째 계산', nodeCount: 4, tone: 'cyan' },
  { id: 'ann-hidden-2', label: '다음 층의 뉴런', role: '연결된 계산', nodeCount: 3, tone: 'cyan' },
  { id: 'ann-output', label: '출력', role: '하나 이상의 결과', nodeCount: 1, tone: 'emerald' },
]

export function Lesson04Step1(props: CommonStepProps) {
  const [choice, setChoice] = useState<'A' | 'B' | 'C' | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [networkVisible, setNetworkVisible] = useState(false)

  const submit = () => {
    if (!choice) return
    setSubmitted(true)
    setNetworkVisible(true)
    props.onComplete()
  }

  return (
    <StepFrame
      {...props}
      step={1}
      intro="Lesson 02의 단일 퍼셉트론과 여러 퍼셉트론이 층으로 연결된 구조를 비교합니다."
    >
      <section aria-labelledby="lesson04-goals-title">
        <h3 id="lesson04-goals-title" className="text-xl font-black text-slate-950">이번 차시에서 알아볼 것</h3>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {lesson04Objectives.map((objective, index) => (
            <li key={objective} className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 leading-7 text-slate-700">
              <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-700">
                {index + 1}
              </span>
              <span>{objective}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-6 text-slate-600">이번 차시에서는 복잡한 수치 계산이나 행렬 계산을 하지 않고 신경망의 구조와 각 층의 역할에 집중합니다.</p>
      </section>

      <section className="mt-9" aria-labelledby="single-multiple-title">
        <h3 id="single-multiple-title" className="text-xl font-black text-slate-950">하나에서 여러 개로</h3>
        <div className="mt-5">
          <SimpleFlow items={['입력', '퍼셉트론', '출력']} label="단일 퍼셉트론" />
        </div>
        <div className="mt-5">
          {networkVisible ? (
            <NeuralNetworkDiagram layers={annLayers} label="여러 퍼셉트론이 연결된 인공신경망" compact />
          ) : (
            <button
              type="button"
              onClick={() => setNetworkVisible(true)}
              className="flex min-h-28 w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50 px-5 text-center font-black text-indigo-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <Layers3 size={25} aria-hidden="true" />
              여러 퍼셉트론 연결 보기
            </button>
          )}
        </div>
        {networkVisible && (
          <div className="mt-5 rounded-2xl bg-cyan-50 p-5">
            <p className="font-black leading-7 text-cyan-950">퍼셉트론을 여러 개 연결하면 더 많은 정보를 처리하는 인공신경망을 만들 수 있습니다.</p>
            <p className="mt-2 leading-7 text-slate-700">이처럼 여러 인공 뉴런을 서로 연결한 구조를 인공신경망(ANN)이라고 합니다.</p>
          </div>
        )}
      </section>

      <fieldset className="mt-9">
        <legend className="text-xl font-black leading-snug text-slate-950">인공신경망에 대한 설명으로 가장 적절한 것은?</legend>
        <div className="mt-4 grid gap-3">
          {[
            ['A', '여러 퍼셉트론을 연결한 구조'],
            ['B', '데이터를 저장하는 파일'],
            ['C', '인터넷 통신 방식'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={choice === key}
              onClick={() => {
                setChoice(key as 'A' | 'B' | 'C')
                setSubmitted(false)
              }}
              className={`min-h-14 rounded-xl border px-4 py-3 text-left font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                choice === key
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-950'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300'
              }`}
            >
              {key}. {label}
            </button>
          ))}
        </div>
        <Button className="mt-4" onClick={submit} disabled={!choice}>
          선택 제출
          <Check size={18} aria-hidden="true" />
        </Button>
      </fieldset>

      {submitted && (
        <AnswerFeedback
          correct={choice === 'A'}
          explanation={
            choice === 'A'
              ? '여러 퍼셉트론을 서로 연결하면 인공신경망(ANN)을 구성할 수 있습니다.'
              : '정답은 A입니다. 인공신경망은 파일이나 통신 방식이 아니라 여러 퍼셉트론을 연결한 구조입니다.'
          }
        />
      )}

      {props.isComplete && (
        <StepCompletionMessage>인공신경망의 의미를 선택해 제출하고 단일 퍼셉트론과 연결 구조를 비교했습니다.</StepCompletionMessage>
      )}
    </StepFrame>
  )
}

export function Lesson04Step2(props: CommonStepProps) {
  const [viewed, setViewed] = useState<LayerId[]>([])
  const [activeLayer, setActiveLayer] = useState<(typeof networkLayers)[number] | null>(null)

  useEffect(() => {
    if (!props.isComplete && viewed.length === networkLayers.length) props.onComplete()
  }, [props, viewed.length])

  const inspect = (layer: (typeof networkLayers)[number]) => {
    setActiveLayer(layer)
    setViewed((current) => (current.includes(layer.id) ? current : [...current, layer.id]))
  }

  return (
    <StepFrame
      {...props}
      step={2}
      intro="입력층, 은닉층, 출력층을 차례로 눌러 각 층의 노드와 역할을 확인합니다."
    >
      <NeuralNetworkDiagram layers={networkLayers} label="인공신경망의 세 층" />

      <section className="mt-7" aria-labelledby="layer-explore-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id="layer-explore-title" className="text-xl font-black text-slate-950">층별 역할 탐색</h3>
          <span className="text-sm font-black tabular-nums text-indigo-700">{viewed.length} / 3 확인</span>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {networkLayers.map((layer) => {
            const isViewed = viewed.includes(layer.id)
            const isActive = activeLayer?.id === layer.id
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => inspect(layer)}
                aria-pressed={isActive}
                className={`min-h-28 rounded-2xl border p-5 text-left focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 bg-white hover:border-indigo-300'
                }`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block text-lg font-black text-slate-950">{layer.label}</span>
                    <span className="mt-1 block text-sm font-semibold text-slate-600">{layer.shortRole}</span>
                  </span>
                  {isViewed ? (
                    <CheckCircle2 className="shrink-0 text-emerald-600" size={20} aria-label="확인함" />
                  ) : (
                    <Circle className="shrink-0 text-slate-400" size={18} aria-label="확인 전" />
                  )}
                </span>
              </button>
            )
          })}
        </div>
        <div className="mt-5 min-h-28 rounded-2xl bg-slate-100 p-5" aria-live="polite">
          {activeLayer ? (
            <>
              <p className="font-black text-indigo-800">{activeLayer.label}</p>
              <p className="mt-2 leading-7 text-slate-700">{activeLayer.role}</p>
            </>
          ) : (
            <p className="leading-7 text-slate-600">세 층을 눌러 설명을 확인하세요.</p>
          )}
        </div>
      </section>

      <div className="mt-7 flex items-start gap-3 rounded-2xl bg-amber-50 p-5 text-amber-950">
        <Lightbulb className="mt-0.5 shrink-0" size={22} aria-hidden="true" />
        <p className="leading-7"><strong>입력층은 계산이나 예측을 담당하지 않습니다.</strong> 외부 데이터를 받아 신경망의 다음 층으로 전달합니다.</p>
      </div>

      {props.isComplete && (
        <StepCompletionMessage>입력층, 은닉층, 출력층의 역할을 모두 확인했습니다.</StepCompletionMessage>
      )}
    </StepFrame>
  )
}

export function Lesson04Step3(props: CommonStepProps) {
  const [answers, setAnswers] = useState<Record<string, 'input' | 'output' | undefined>>({})
  const [submitted, setSubmitted] = useState(false)
  const allAnswered = irisCards.every((card) => answers[card.id])
  const allCorrect = irisCards.every((card) => answers[card.id] === card.target)

  const submit = () => {
    if (!allAnswered) return
    setSubmitted(true)
    if (allCorrect) props.onComplete()
  }

  return (
    <StepFrame
      {...props}
      step={3}
      intro="붓꽃 분류에서 신경망으로 들어오는 네 특징과 출력층에서 나오는 결과를 구분합니다."
    >
      <section aria-labelledby="iris-input-title">
        <h3 id="iris-input-title" className="text-xl font-black text-slate-950">붓꽃 데이터의 입력층</h3>
        <p className="mt-2 leading-7 text-slate-600">입력층은 네 특징을 받아 신경망에 전달합니다. 여기서 계산하거나 예측하지 않습니다.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {irisCards.slice(0, 4).map((card, index) => (
            <div key={card.id} className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-center">
              <span className="mx-auto block size-8 rounded-full border-2 border-indigo-600 bg-white" aria-hidden="true" />
              <p className="mt-3 font-black text-indigo-950">입력 노드 {index + 1}</p>
              <p className="mt-1 text-sm text-slate-600">{card.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm font-semibold leading-6 text-slate-600">입력층의 노드 수는 모델에 들어오는 입력 정보의 수와 관련됩니다.</p>
      </section>

      <section className="mt-9" aria-labelledby="iris-sort-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id="iris-sort-title" className="text-xl font-black text-slate-950">입력 데이터와 출력 결과 구분</h3>
          <span className="text-sm font-black text-indigo-700">{Object.keys(answers).length} / 6 분류</span>
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {irisCards.map((card) => (
            <fieldset key={card.id} className="rounded-2xl border border-slate-200 p-5">
              <legend className="px-1 text-lg font-black text-slate-950">{card.label}</legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  ['input', '입력층에 들어가는 값'],
                  ['output', '출력층에서 나오는 결과'],
                ].map(([target, label]) => (
                  <Button
                    key={target}
                    variant={answers[card.id] === target ? 'primary' : 'secondary'}
                    className="h-auto min-h-14 leading-6"
                    aria-pressed={answers[card.id] === target}
                    onClick={() => {
                      setAnswers((current) => ({ ...current, [card.id]: target as 'input' | 'output' }))
                      setSubmitted(false)
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <Button className="mt-5" onClick={submit} disabled={!allAnswered}>
          구분 결과 확인
          <Check size={18} aria-hidden="true" />
        </Button>
        {submitted && (
          <AnswerFeedback
            correct={allCorrect}
            explanation={
              allCorrect
                ? '네 길이·너비 특징은 입력층으로 들어가고, 붓꽃 종류와 각 종류의 예측 확률은 출력층에서 나옵니다.'
                : '꽃받침과 꽃잎의 길이·너비는 입력 데이터입니다. 붓꽃 종류와 예측 확률은 신경망이 만든 출력 결과입니다.'
            }
          />
        )}
      </section>

      {props.isComplete && (
        <StepCompletionMessage>붓꽃의 네 입력 특징과 두 출력 결과를 모두 올바르게 구분했습니다.</StepCompletionMessage>
      )}
    </StepFrame>
  )
}

export function Lesson04Step4(props: CommonStepProps) {
  const [sequence, setSequence] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [highlighted, setHighlighted] = useState<string | null>(null)
  const correctSequence = hiddenProcessCards.map((card) => card.id)
  const isCorrect = sequence.every((id, index) => id === correctSequence[index]) && sequence.length === correctSequence.length

  const addCard = (id: string) => {
    if (sequence.includes(id)) return
    setSequence((current) => [...current, id])
    setHighlighted(id)
    setSubmitted(false)
  }

  const removeCard = (id: string) => {
    setSequence((current) => current.filter((item) => item !== id))
    setHighlighted(null)
    setSubmitted(false)
  }

  const reset = () => {
    setSequence([])
    setHighlighted(null)
    setSubmitted(false)
  }

  const submit = () => {
    if (sequence.length !== hiddenProcessCards.length) return
    setSubmitted(true)
    if (isCorrect) props.onComplete()
  }

  return (
    <StepFrame
      {...props}
      step={4}
      intro="은닉층의 한 뉴런이 입력을 처리해 다음 층으로 보내는 정확한 순서를 카드로 완성합니다."
    >
      <section aria-labelledby="hidden-flow-title">
        <h3 id="hidden-flow-title" className="text-xl font-black text-slate-950">은닉층 내부 처리 흐름</h3>
        <p className="mt-2 leading-7 text-slate-600">카드를 고르면 아래 흐름의 해당 노드가 강조됩니다.</p>
        <div className="mt-5 grid items-center gap-2 md:grid-flow-col md:auto-cols-fr">
          {hiddenProcessCards.map((card, index) => {
            const selected = sequence.includes(card.id)
            const active = highlighted === card.id
            return (
              <div key={card.id} className="contents">
                <div
                  className={`flex min-h-20 min-w-0 items-center justify-center rounded-xl border px-3 py-3 text-center text-sm font-black leading-6 ${
                    active
                      ? 'border-cyan-600 bg-cyan-100 text-cyan-950 ring-2 ring-cyan-300'
                      : selected
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-950'
                        : 'border-slate-200 bg-white text-slate-500'
                  }`}
                >
                  {card.label}
                </div>
                {index < hiddenProcessCards.length - 1 && (
                  <>
                    <ArrowDown className={`mx-auto md:hidden ${selected ? 'text-cyan-700' : 'text-slate-300'}`} size={20} aria-hidden="true" />
                    <ArrowRight className={`mx-auto hidden md:block ${selected ? 'text-cyan-700' : 'text-slate-300'}`} size={20} aria-hidden="true" />
                  </>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="mt-9 grid gap-6 lg:grid-cols-2" aria-label="은닉층 순서 배열 활동">
        <div>
          <h3 className="text-lg font-black text-slate-950">배치할 카드</h3>
          <div className="mt-4 grid gap-3">
            {hiddenProcessCards.map((card) => (
              <button
                key={card.id}
                type="button"
                disabled={sequence.includes(card.id)}
                onClick={() => addCard(card.id)}
                className="min-h-14 rounded-xl border border-slate-300 bg-white px-4 py-3 text-left font-semibold leading-6 text-slate-800 hover:border-indigo-400 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                {card.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-black text-slate-950">내가 만든 순서</h3>
            <span className="text-sm font-black tabular-nums text-indigo-700">{sequence.length} / 5</span>
          </div>
          <ol className="mt-4 min-h-80 space-y-3 rounded-2xl bg-slate-100 p-4">
            {sequence.length === 0 ? (
              <li className="p-4 text-center leading-7 text-slate-500">왼쪽 카드를 처리 순서대로 선택하세요.</li>
            ) : (
              sequence.map((id, index) => {
                const card = hiddenProcessCards.find((item) => item.id === id)!
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => removeCard(id)}
                      className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-indigo-200 bg-white px-4 py-3 text-left font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      aria-label={`${index + 1}번 ${card.label}, 순서에서 제거`}
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-black text-white">{index + 1}</span>
                      <span>{card.label}</span>
                    </button>
                  </li>
                )
              })
            )}
          </ol>
        </div>
      </section>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={reset}>
          <RotateCcw size={18} aria-hidden="true" />
          순서 초기화
        </Button>
        <Button onClick={submit} disabled={sequence.length !== hiddenProcessCards.length}>순서 확인</Button>
      </div>
      {submitted && (
        <AnswerFeedback
          correct={isCorrect}
          explanation={
            isCorrect
              ? '각 입력에 가중치를 곱하고, 결과를 모두 더하며 편향을 추가해 가중합 z를 만든 뒤 활성화 함수를 적용하고 다음 층으로 전달합니다.'
              : '가중합은 입력×가중치의 결과를 모두 더하고 편향까지 추가한 값입니다. 그 다음 활성화 함수를 적용해 다음 층으로 전달합니다.'
          }
        />
      )}

      <p className="mt-7 flex items-start gap-3 rounded-2xl bg-cyan-50 p-5 font-semibold leading-7 text-slate-800">
        <Lightbulb className="mt-0.5 shrink-0 text-cyan-700" size={22} aria-hidden="true" />
        각 입력 × 가중치 → 계산 결과를 모두 더하고 편향 추가 → 가중합 z → 활성화 함수 적용 → 다음 층으로 전달
      </p>

      {props.isComplete && (
        <StepCompletionMessage>은닉층의 다섯 처리 단계를 정확한 순서로 배열했습니다.</StepCompletionMessage>
      )}
    </StepFrame>
  )
}

type OutputField = 'type' | 'output' | 'activation'

interface OutputSelection {
  type?: string
  output?: string
  activation?: string
}

const outputOptions: Record<OutputField, readonly string[]> = {
  type: ['이진 분류', '다중 분류'],
  output: ['출력 하나 또는 두 상태', '클래스별 출력'],
  activation: ['Sigmoid', 'Softmax'],
}

const outputFieldLabels: Record<OutputField, string> = {
  type: '문제 유형',
  output: '출력 형태',
  activation: '출력층 활성화 함수',
}

export function Lesson04Step5(props: CommonStepProps) {
  const [answers, setAnswers] = useState<Record<string, OutputSelection>>({})
  const [submitted, setSubmitted] = useState(false)

  const allAnswered = outputCases.every((item) => {
    const answer = answers[item.id]
    return answer?.type && answer.output && answer.activation
  })
  const allCorrect = outputCases.every((item) => {
    const answer = answers[item.id]
    return answer?.type === item.type && answer.output === item.output && answer.activation === item.activation
  })

  const choose = (caseId: string, field: OutputField, value: string) => {
    setAnswers((current) => ({
      ...current,
      [caseId]: { ...current[caseId], [field]: value },
    }))
    setSubmitted(false)
  }

  const submit = () => {
    if (!allAnswered) return
    setSubmitted(true)
    if (allCorrect) props.onComplete()
  }

  return (
    <StepFrame
      {...props}
      step={5}
      intro="이진 분류와 다중 분류에서 출력층의 노드 형태와 활성화 함수가 어떻게 달라지는지 연결합니다."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <SimpleFlow
          items={['스팸 메일 입력', '은닉층', '출력 하나 또는 두 상태', 'Sigmoid', '스팸 / 정상']}
          label="사례 1 · 이진 분류 출력층"
        />
        <SimpleFlow
          items={['동물 사진 입력', '은닉층', '클래스별 출력', 'Softmax', '고양이 / 강아지 / 토끼 확률']}
          label="사례 2 · 다중 분류 출력층"
        />
      </div>

      <section className="mt-9" aria-labelledby="output-connect-title">
        <div className="flex items-center gap-3">
          <Link2 className="text-indigo-600" size={24} aria-hidden="true" />
          <h3 id="output-connect-title" className="text-xl font-black text-slate-950">문제와 출력층 연결</h3>
        </div>
        <div className="mt-5 space-y-6">
          {outputCases.map((item, caseIndex) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 p-5 sm:p-6">
              <p className="text-sm font-black text-indigo-700">상황 {caseIndex + 1}</p>
              <h4 className="mt-2 text-xl font-black text-slate-950">{item.title}</h4>
              <div className="mt-5 grid gap-5 lg:grid-cols-3">
                {(['type', 'output', 'activation'] as const).map((field) => (
                  <fieldset key={field}>
                    <legend className="text-sm font-black text-slate-700">{outputFieldLabels[field]}</legend>
                    <div className="mt-3 grid gap-2">
                      {outputOptions[field].map((option) => (
                        <button
                          key={option}
                          type="button"
                          aria-pressed={answers[item.id]?.[field] === option}
                          onClick={() => choose(item.id, field, option)}
                          className={`min-h-14 rounded-xl border px-3 py-3 text-left text-sm font-semibold leading-6 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                            answers[item.id]?.[field] === option
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-950'
                              : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>
            </article>
          ))}
        </div>
        <Button className="mt-5" onClick={submit} disabled={!allAnswered}>
          두 상황 연결 확인
          <Check size={18} aria-hidden="true" />
        </Button>
        {submitted && (
          <AnswerFeedback
            correct={allCorrect}
            explanation={
              allCorrect
                ? '스팸 여부는 이진 분류이므로 출력 하나 또는 두 상태와 Sigmoid를 연결하고, 세 동물 중 하나는 다중 분류이므로 클래스별 출력과 Softmax를 연결합니다.'
                : '두 상태를 구분하는 스팸 문제는 이진 분류·Sigmoid, 세 종류 중 하나를 고르는 동물 문제는 다중 분류·Softmax입니다.'
            }
          />
        )}
      </section>

      <p className="mt-7 flex items-start gap-3 rounded-2xl bg-cyan-50 p-5 font-semibold leading-7 text-slate-800">
        <Lightbulb className="mt-0.5 shrink-0 text-cyan-700" size={22} aria-hidden="true" />
        출력층은 문제의 종류에 맞는 형태로 최종 결과를 만듭니다.
      </p>

      {props.isComplete && (
        <StepCompletionMessage>이진·다중 분류의 출력 형태와 활성화 함수를 모두 올바르게 연결했습니다.</StepCompletionMessage>
      )}
    </StepFrame>
  )
}

const networkALayers: DiagramLayer[] = [
  { id: 'a-input', label: '입력층', role: '데이터를 받음', nodeCount: 3, tone: 'indigo' },
  { id: 'a-hidden', label: '은닉층', role: '정보를 처리함', nodeCount: 4, tone: 'cyan' },
  { id: 'a-output', label: '출력층', role: '결과를 만듦', nodeCount: 2, tone: 'emerald' },
]

const networkBLayers: DiagramLayer[] = [
  { id: 'b-input', label: '입력층', role: '데이터를 받음', nodeCount: 3, tone: 'indigo' },
  { id: 'b-hidden-1', label: '은닉층 1', role: '정보 처리', nodeCount: 4, tone: 'cyan' },
  { id: 'b-hidden-2', label: '은닉층 2', role: '정보 처리', nodeCount: 4, tone: 'cyan' },
  { id: 'b-hidden-3', label: '은닉층 3', role: '정보 처리', nodeCount: 3, tone: 'cyan' },
  { id: 'b-output', label: '출력층', role: '결과를 만듦', nodeCount: 2, tone: 'emerald' },
]

export function Lesson04Step6(props: CommonStepProps) {
  const [choice, setChoice] = useState<'A' | 'B' | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const submit = () => {
    if (!choice) return
    setSubmitted(true)
    props.onComplete()
  }

  return (
    <StepFrame
      {...props}
      step={6}
      intro="은닉층이 하나인 신경망과 여러 개인 신경망을 비교하고 ANN과 DNN의 관계를 구분합니다."
    >
      <div className="space-y-6">
        <NeuralNetworkDiagram layers={networkALayers} label="신경망 A · 은닉층 1개 · 인공신경망(ANN)" compact />
        <NeuralNetworkDiagram layers={networkBLayers} label="신경망 B · 은닉층 3개 · 인공신경망(ANN)이면서 심층 신경망(DNN)" compact />
      </div>

      <section className="mt-7 grid gap-4 md:grid-cols-2" aria-label="ANN과 DNN 개념 구분">
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
          <p className="font-black text-indigo-900">인공신경망(ANN)</p>
          <p className="mt-2 leading-7 text-slate-700">여러 인공 뉴런을 연결한 신경망 전체를 가리킵니다. 신경망 A와 B는 모두 ANN입니다.</p>
        </div>
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
          <p className="font-black text-cyan-900">심층 신경망(DNN)</p>
          <p className="mt-2 leading-7 text-slate-700">입력층과 출력층 사이에 여러 개의 은닉층을 가진 인공신경망입니다. 신경망 B가 해당합니다.</p>
        </div>
      </section>

      <div className="mt-7 flex items-start gap-3 rounded-2xl bg-slate-100 p-5">
        <Sparkles className="mt-0.5 shrink-0 text-indigo-600" size={22} aria-hidden="true" />
        <p className="font-semibold leading-7 text-slate-800">이처럼 여러 층으로 이루어진 신경망을 이용하여 데이터의 특징을 학습하는 것이 딥러닝의 핵심입니다.</p>
      </div>

      <fieldset className="mt-9">
        <legend className="text-xl font-black leading-snug text-slate-950">은닉층이 많아지면 항상 더 좋은 모델이 될까요?</legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            ['A', '항상 그렇다.'],
            ['B', '반드시 그렇지는 않다.'],
          ].map(([key, label]) => (
            <Button
              key={key}
              variant={choice === key ? 'primary' : 'secondary'}
              className="h-auto min-h-14 leading-6"
              aria-pressed={choice === key}
              onClick={() => {
                setChoice(key as 'A' | 'B')
                setSubmitted(false)
              }}
            >
              {key}. {label}
            </Button>
          ))}
        </div>
        <Button className="mt-4" onClick={submit} disabled={!choice}>선택 제출</Button>
      </fieldset>
      {submitted && (
        <AnswerFeedback
          correct={choice === 'B'}
          explanation="문제와 데이터에 따라 적절한 신경망 구조가 다릅니다. 신경망을 무조건 크게 만드는 것이 목적은 아닙니다."
        />
      )}

      {props.isComplete && (
        <StepCompletionMessage>ANN과 DNN의 관계를 비교하고 은닉층 수에 관한 질문을 제출했습니다.</StepCompletionMessage>
      )}
    </StepFrame>
  )
}

interface Step7Props extends CommonStepProps {
  priorStepsComplete: boolean
  onCompletionReadyChange: (ready: boolean) => void
}

const structureCards = [
  { id: 'input', label: '입력층' },
  { id: 'hidden', label: '은닉층' },
  { id: 'output', label: '출력층' },
] as const

type DetailTarget =
  | '입력층'
  | '은닉층'
  | '출력층'
  | '이진 분류 출력층'
  | '다중 분류 출력층'

const detailConnections: Array<{
  id: string
  label: string
  helper: string
  options: readonly DetailTarget[]
  answer: DetailTarget
}> = [
  {
    id: 'external-data',
    label: '외부 데이터 입력',
    helper: '층의 역할',
    options: ['입력층', '은닉층', '출력층'],
    answer: '입력층',
  },
  {
    id: 'information-process',
    label: '가중합과 활성화 함수를 이용한 정보 처리',
    helper: '층의 역할',
    options: ['입력층', '은닉층', '출력층'],
    answer: '은닉층',
  },
  {
    id: 'final-result',
    label: '최종 예측 또는 분류 결과',
    helper: '층의 역할',
    options: ['입력층', '은닉층', '출력층'],
    answer: '출력층',
  },
  {
    id: 'relu',
    label: 'ReLU',
    helper: '활성화 함수',
    options: ['은닉층', '이진 분류 출력층', '다중 분류 출력층'],
    answer: '은닉층',
  },
  {
    id: 'sigmoid',
    label: 'Sigmoid',
    helper: '활성화 함수',
    options: ['은닉층', '이진 분류 출력층', '다중 분류 출력층'],
    answer: '이진 분류 출력층',
  },
  {
    id: 'softmax',
    label: 'Softmax',
    helper: '활성화 함수',
    options: ['은닉층', '이진 분류 출력층', '다중 분류 출력층'],
    answer: '다중 분류 출력층',
  },
]

export function Lesson04Step7({
  priorStepsComplete,
  onCompletionReadyChange,
  ...props
}: Step7Props) {
  const [structure, setStructure] = useState<string[]>([])
  const [structureSubmitted, setStructureSubmitted] = useState(false)
  const [details, setDetails] = useState<Record<string, DetailTarget | undefined>>({})
  const [detailsSubmitted, setDetailsSubmitted] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Array<string | null>>([null, null, null, null])
  const [quizSubmitted, setQuizSubmitted] = useState([false, false, false, false])

  const structureCorrect =
    structure.length === 3 &&
    structure.every((id, index) => id === ['input', 'hidden', 'output'][index])
  const allDetailsConnected = detailConnections.every((item) => details[item.id])
  const detailsCorrect = detailConnections.every((item) => details[item.id] === item.answer)
  const allQuizSubmitted = quizSubmitted.every(Boolean)
  const completionReady =
    structureSubmitted &&
    structureCorrect &&
    detailsSubmitted &&
    detailsCorrect &&
    allQuizSubmitted

  useEffect(() => {
    onCompletionReadyChange(completionReady)
  }, [completionReady, onCompletionReadyChange])

  const addStructure = (id: string) => {
    if (structure.includes(id)) return
    setStructure((current) => [...current, id])
    setStructureSubmitted(false)
  }

  const chooseDetail = (id: string, target: DetailTarget) => {
    setDetails((current) => ({ ...current, [id]: target }))
    setDetailsSubmitted(false)
  }

  const chooseQuiz = (index: number, answer: string) => {
    setQuizAnswers((current) => current.map((value, itemIndex) => (itemIndex === index ? answer : value)))
    setQuizSubmitted((current) => current.map((value, itemIndex) => (itemIndex === index ? false : value)))
  }

  const submitQuiz = (index: number) => {
    if (!quizAnswers[index]) return
    setQuizSubmitted((current) => current.map((value, itemIndex) => (itemIndex === index ? true : value)))
  }

  return (
    <StepFrame
      {...props}
      step={7}
      intro="신경망의 기본 순서, 각 층의 역할과 활성화 함수 위치를 연결하고 확인 문제로 정리합니다."
    >
      <section aria-labelledby="complete-structure-title">
        <h3 id="complete-structure-title" className="text-xl font-black text-slate-950">1. 신경망 기본 순서 완성</h3>
        <p className="mt-2 leading-7 text-slate-600">층 카드를 정보가 흐르는 순서대로 선택하세요.</p>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div>
            <p className="font-black text-slate-800">배치할 층</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[structureCards[2], structureCards[0], structureCards[1]].map((card) => (
                <button
                  key={card.id}
                  type="button"
                  disabled={structure.includes(card.id)}
                  onClick={() => addStructure(card.id)}
                  className="min-h-14 rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-800 hover:border-indigo-400 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {card.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="font-black text-slate-800">내가 만든 구조</p>
              <Button
                variant="ghost"
                onClick={() => {
                  setStructure([])
                  setStructureSubmitted(false)
                }}
              >
                <RotateCcw size={17} aria-hidden="true" />
                초기화
              </Button>
            </div>
            <ol className="mt-3 grid min-h-40 items-center gap-2 rounded-2xl bg-slate-100 p-4 md:grid-flow-col md:auto-cols-fr">
              {structure.length === 0 ? (
                <li className="text-center text-slate-500">층 카드를 선택하세요.</li>
              ) : (
                structure.map((id, index) => {
                  const card = structureCards.find((item) => item.id === id)!
                  return (
                    <li key={id} className="contents">
                      <div className="rounded-xl border border-indigo-200 bg-white p-4 text-center font-black text-indigo-900">
                        <span className="mr-2 text-sm text-indigo-500">{index + 1}</span>
                        {card.label}
                      </div>
                      {index < structure.length - 1 && (
                        <>
                          <ArrowDown className="mx-auto text-cyan-700 md:hidden" size={20} aria-hidden="true" />
                          <ArrowRight className="mx-auto hidden text-cyan-700 md:block" size={20} aria-hidden="true" />
                        </>
                      )}
                    </li>
                  )
                })
              )}
            </ol>
          </div>
        </div>
        <Button
          className="mt-5"
          disabled={structure.length !== 3}
          onClick={() => setStructureSubmitted(true)}
        >
          기본 순서 확인
        </Button>
        {structureSubmitted && (
          <AnswerFeedback
            correct={structureCorrect}
            explanation={structureCorrect ? '입력층 → 은닉층 → 출력층 순서로 정보가 전달됩니다.' : '외부 데이터를 먼저 받는 입력층, 정보를 처리하는 은닉층, 결과를 만드는 출력층 순서입니다.'}
          />
        )}
      </section>

      <section className="mt-10" aria-labelledby="detail-connection-title">
        <div className="flex items-center gap-3">
          <Link2 className="text-indigo-600" size={24} aria-hidden="true" />
          <h3 id="detail-connection-title" className="text-xl font-black text-slate-950">2. 역할과 활성화 함수 연결</h3>
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {detailConnections.map((item) => (
            <fieldset key={item.id} className="rounded-2xl border border-slate-200 p-5">
              <legend className="px-1 text-lg font-black leading-7 text-slate-950">{item.label}</legend>
              <p className="mt-1 text-sm font-bold text-indigo-700">{item.helper}</p>
              <div className="mt-4 grid gap-2">
                {item.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={details[item.id] === option}
                    onClick={() => chooseDetail(item.id, option)}
                    className={`min-h-14 rounded-xl border px-4 py-3 text-left font-semibold leading-6 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                      details[item.id] === option
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-950'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <Button
          className="mt-5"
          disabled={!allDetailsConnected}
          onClick={() => setDetailsSubmitted(true)}
        >
          세부 연결 확인
        </Button>
        {detailsSubmitted && (
          <AnswerFeedback
            correct={detailsCorrect}
            explanation={
              detailsCorrect
                ? '입력층은 외부 데이터, 은닉층은 정보 처리와 ReLU, 이진 분류 출력층은 Sigmoid, 다중 분류 출력층은 Softmax에 연결됩니다.'
                : '입력층 → 외부 데이터, 은닉층 → 정보 처리·ReLU, 출력층 → 최종 결과, 이진 출력층 → Sigmoid, 다중 출력층 → Softmax를 다시 확인하세요.'
            }
          />
        )}
      </section>

      <section className="mt-10" aria-labelledby="lesson04-quiz-title">
        <h3 id="lesson04-quiz-title" className="text-xl font-black text-slate-950">3. 확인 문제 4개</h3>
        <p className="mt-2 leading-7 text-slate-600">오답은 해설을 확인하고 답을 바꾸어 다시 제출할 수 있습니다.</p>
        <div className="mt-5 space-y-6">
          {lesson04Quiz.map((quiz, index) => (
            <fieldset key={quiz.question} className="rounded-2xl border border-slate-200 p-5 sm:p-6">
              <legend className="px-1 text-lg font-black leading-7 text-slate-950">문제 {index + 1}. {quiz.question}</legend>
              <div className="mt-4 grid gap-3">
                {quiz.options.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={quizAnswers[index] === key}
                    onClick={() => chooseQuiz(index, key)}
                    className={`min-h-14 rounded-xl border px-4 py-3 text-left font-semibold leading-6 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                      quizAnswers[index] === key
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-950'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300'
                    }`}
                  >
                    {key}. {label}
                  </button>
                ))}
              </div>
              <Button className="mt-4" onClick={() => submitQuiz(index)} disabled={!quizAnswers[index]}>
                문제 {index + 1} 제출
              </Button>
              {quizSubmitted[index] && (
                <AnswerFeedback correct={quizAnswers[index] === quiz.answer} explanation={quiz.explanation} />
              )}
            </fieldset>
          ))}
        </div>
      </section>

      {completionReady && !props.isComplete && (
        <div className="mt-7 flex items-start gap-3 rounded-2xl bg-amber-50 p-5 text-amber-950" role="status">
          <CircleHelp className="mt-0.5 shrink-0" size={21} aria-hidden="true" />
          <p className="leading-7">신경망 구조, 세부 연결과 네 문제 제출을 마쳤습니다. {priorStepsComplete
            ? '화면 아래의 완료 버튼으로 Lesson 04를 완료하세요.'
            : '완료되지 않은 앞 STEP의 핵심 활동을 마치면 완료 버튼이 활성화됩니다.'}</p>
        </div>
      )}

      {props.isComplete && (
        <div className="mt-8 border-t border-emerald-200 pt-7">
          <div className="flex items-start gap-3 text-emerald-900" role="status">
            <CheckCircle2 className="mt-0.5 shrink-0" size={24} aria-hidden="true" />
            <div>
              <h3 className="text-xl font-black">Lesson 04 완료</h3>
              <p className="mt-2 leading-7">홈의 전체 진행도에 이 차시 완료가 반영되었습니다.</p>
            </div>
          </div>
          <div className="mt-7 rounded-2xl bg-indigo-50 p-5">
            <p className="font-black text-indigo-900">Lesson 05로 이어지는 질문</p>
            <p className="mt-2 text-lg font-bold leading-7 text-slate-900">신경망이 만든 예측이 얼마나 틀렸는지는 어떻게 알 수 있을까요?</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:border-indigo-300 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Home에서 진행도 보기
              </Link>
              <Link
                to="/lesson/05"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                다음 차시 미리 보기
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </StepFrame>
  )
}
