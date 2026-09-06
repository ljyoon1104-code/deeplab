import {
  ArrowDown,
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  CircleHelp,
  Gauge,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Target,
  XCircle,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  cceePresets,
  forwardPassCards,
  lesson05Objectives,
  lesson05Quiz,
  lesson05StepTitles,
  lossMatchingCases,
  mseExamples,
} from './lesson05Data'
import {
  binaryCrossEntropy,
  categoricalCrossEntropy,
  formatLoss,
  isWithinTolerance,
  mse,
  parseFiniteNumberInput,
  predictionError,
  squaredError,
} from './lossMath'

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
  const titleId = active ? 'lesson-step-title' : `lesson05-step-${step}-title`

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
          {lesson05StepTitles[step - 1]}
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
        <CheckCircle2
          className="mt-0.5 shrink-0 text-emerald-600"
          size={21}
          aria-hidden="true"
        />
      ) : (
        <XCircle
          className="mt-0.5 shrink-0 text-rose-600"
          size={21}
          aria-hidden="true"
        />
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

function FlowArrow() {
  return (
    <>
      <ArrowDown
        className="mx-auto shrink-0 text-cyan-700 md:hidden"
        size={21}
        aria-hidden="true"
      />
      <ArrowRight
        className="mx-auto hidden shrink-0 text-cyan-700 md:block"
        size={21}
        aria-hidden="true"
      />
    </>
  )
}

function FlowChain({
  items,
  label,
}: {
  items: readonly string[]
  label: string
}) {
  return (
    <div
      className="grid items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-flow-col md:auto-cols-fr"
      aria-label={label}
    >
      {items.map((item, index) => (
        <div className="contents" key={item}>
          <div className="flex min-h-16 items-center justify-center rounded-xl border border-indigo-200 bg-white px-3 py-3 text-center font-black leading-6 text-indigo-950">
            {item}
          </div>
          {index < items.length - 1 && <FlowArrow />}
        </div>
      ))}
    </div>
  )
}

function LossMeter({
  display,
  level,
  description,
}: {
  display: string
  level: number
  description: string
}) {
  const percentage = Math.round(Math.min(1, Math.max(0, level)) * 100)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 font-black text-slate-950">
          <Gauge className="text-indigo-600" size={20} aria-hidden="true" />
          Loss Meter
        </span>
        <strong className="text-lg text-indigo-800">{display}</strong>
      </div>
      <div
        className="mt-4 h-4 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-label={description}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        aria-valuetext={display}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-rose-500 transition-[width] duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  )
}

function PredictionLossFlow({
  prediction,
  target,
  lossName,
  children,
}: {
  prediction: ReactNode
  target: ReactNode
  lossName: string
  children: ReactNode
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-center">
          <p className="text-sm font-bold text-cyan-800">신경망이 만든 예측값</p>
          <div className="mt-2 font-black leading-7 text-slate-950">{prediction}</div>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
          <p className="text-sm font-bold text-emerald-800">주어진 실제값</p>
          <div className="mt-2 font-black leading-7 text-slate-950">{target}</div>
        </div>
      </div>
      <ArrowDown className="mx-auto my-3 text-indigo-600" size={22} aria-hidden="true" />
      <div className="mx-auto max-w-sm rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-center">
        <p className="text-sm font-bold text-indigo-700">두 값을 비교</p>
        <p className="mt-1 font-black text-indigo-950">{lossName}</p>
      </div>
      <ArrowDown className="mx-auto my-3 text-indigo-600" size={22} aria-hidden="true" />
      {children}
    </div>
  )
}

export function Lesson05Step1(props: CommonStepProps) {
  const [order, setOrder] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const correctOrder = forwardPassCards.map((card) => card.id)
  const orderCorrect =
    order.length === correctOrder.length &&
    order.every((id, index) => id === correctOrder[index])
  const shuffledCards = [
    forwardPassCards[3],
    forwardPassCards[0],
    forwardPassCards[2],
    forwardPassCards[1],
  ]

  const addCard = (id: string) => {
    if (order.includes(id)) return
    setOrder((current) => [...current, id])
    setSubmitted(false)
  }

  const submit = () => {
    if (order.length !== forwardPassCards.length) return
    setSubmitted(true)
    if (orderCorrect) props.onComplete()
  }

  return (
    <StepFrame
      {...props}
      step={1}
      intro="Lesson 04에서 만든 신경망이 입력을 받아 예측값을 만드는 정보 흐름을 완성합니다."
    >
      <section aria-labelledby="lesson05-goals-title">
        <h3 id="lesson05-goals-title" className="text-xl font-black text-slate-950">
          이번 차시에서 알아볼 것
        </h3>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {lesson05Objectives.map((objective, index) => (
            <li
              key={objective}
              className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 leading-7 text-slate-700"
            >
              <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-700">
                {index + 1}
              </span>
              <span>{objective}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          이번 차시는 현재 예측이 얼마나 틀렸는지 Loss를 계산하는 데까지 다룹니다.
          Loss를 이용해 가중치와 편향을 바꾸는 과정은 Lesson 06에서 알아봅니다.
        </p>
      </section>

      <section className="mt-9" aria-labelledby="forward-pass-title">
        <div className="flex items-center gap-3">
          <Sparkles className="text-indigo-600" size={24} aria-hidden="true" />
          <h3 id="forward-pass-title" className="text-xl font-black text-slate-950">
            순전파 흐름을 배열해 보세요
          </h3>
        </div>
        <p className="mt-2 leading-7 text-slate-600">
          입력 데이터가 신경망의 앞쪽에서 뒤쪽으로 전달되며 예측값을 만드는
          과정을 순전파라고 합니다.
        </p>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div>
            <p className="font-black text-slate-800">배치할 카드</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {shuffledCards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  disabled={order.includes(card.id)}
                  onClick={() => addCard(card.id)}
                  className="min-h-14 rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-800 hover:border-indigo-400 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {card.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="font-black text-slate-800">내가 만든 순전파</p>
              <Button
                variant="ghost"
                onClick={() => {
                  setOrder([])
                  setSubmitted(false)
                }}
              >
                <RotateCcw size={17} aria-hidden="true" />
                초기화
              </Button>
            </div>
            <ol className="mt-3 grid min-h-44 items-center gap-2 rounded-2xl bg-slate-100 p-4 md:grid-flow-col md:auto-cols-fr lg:grid-flow-row">
              {order.length === 0 ? (
                <li className="text-center text-slate-500">카드를 순서대로 선택하세요.</li>
              ) : (
                order.map((id, index) => {
                  const card = forwardPassCards.find((item) => item.id === id)!
                  return (
                    <li key={id} className="contents">
                      <div className="rounded-xl border border-indigo-200 bg-white p-4 text-center font-black text-indigo-900">
                        <span className="mr-2 text-sm text-indigo-500">{index + 1}</span>
                        {card.label}
                      </div>
                      {index < order.length - 1 && (
                        <ArrowDown
                          className="mx-auto text-cyan-700"
                          size={20}
                          aria-hidden="true"
                        />
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
          disabled={order.length !== forwardPassCards.length}
          onClick={submit}
        >
          순서 확인
          <Check size={18} aria-hidden="true" />
        </Button>
        {submitted && (
          <AnswerFeedback
            correct={orderCorrect}
            explanation={
              orderCorrect
                ? '입력 데이터 → 은닉층에서 처리 → 출력층 → 예측값 순서로 정보가 전달됩니다.'
                : '입력 데이터가 먼저 들어오고, 은닉층과 출력층을 지나 마지막에 예측값이 만들어집니다.'
            }
          />
        )}
      </section>

      {props.isComplete && (
        <StepCompletionMessage>
          순전파의 네 단계를 올바른 순서로 배열했습니다.
        </StepCompletionMessage>
      )}
    </StepFrame>
  )
}

export function Lesson05Step2(props: CommonStepProps) {
  const [differenceA, setDifferenceA] = useState('')
  const [differenceB, setDifferenceB] = useState('')
  const [closer, setCloser] = useState<'A' | 'B' | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const correct =
    Number(differenceA) === 10 && Number(differenceB) === 2 && closer === 'B'

  const submit = () => {
    if (!differenceA || !differenceB || !closer) return
    setSubmitted(true)
    if (correct) props.onComplete()
  }

  return (
    <StepFrame
      {...props}
      step={2}
      intro="같은 실제값에 대한 두 예측의 차이를 직접 계산하고 어느 예측이 더 가까운지 판단합니다."
    >
      <div className="grid gap-5 md:grid-cols-2">
        {[
          {
            id: 'A',
            title: '사례 A',
            target: 80,
            prediction: 70,
            value: differenceA,
            setter: setDifferenceA,
          },
          {
            id: 'B',
            title: '사례 B',
            target: 80,
            prediction: 78,
            value: differenceB,
            setter: setDifferenceB,
          },
        ].map((item) => (
          <section
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            aria-labelledby={`score-case-${item.id}`}
          >
            <h3
              id={`score-case-${item.id}`}
              className="text-lg font-black text-slate-950"
            >
              {item.title}
            </h3>
            <dl className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white p-4">
                <dt className="text-sm font-bold text-slate-500">실제 시험 점수</dt>
                <dd className="mt-1 text-2xl font-black text-emerald-700">
                  {item.target}점
                </dd>
              </div>
              <div className="rounded-xl bg-white p-4">
                <dt className="text-sm font-bold text-slate-500">AI 예측</dt>
                <dd className="mt-1 text-2xl font-black text-cyan-700">
                  {item.prediction}점
                </dd>
              </div>
            </dl>
            <label
              htmlFor={`difference-${item.id}`}
              className="mt-5 block font-black text-slate-800"
            >
              두 점수의 차이
            </label>
            <div className="mt-2 flex items-center gap-3">
              <input
                id={`difference-${item.id}`}
                type="number"
                inputMode="decimal"
                value={item.value}
                onChange={(event) => {
                  item.setter(event.target.value)
                  setSubmitted(false)
                }}
                className="min-h-12 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-lg font-black text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-3 focus:ring-indigo-100"
              />
              <span className="font-bold text-slate-600">점</span>
            </div>
          </section>
        ))}
      </div>

      <fieldset className="mt-8">
        <legend className="text-xl font-black leading-snug text-slate-950">
          어느 예측이 실제값에 더 가까운가요?
        </legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            ['A', '사례 A · 예측 70점'],
            ['B', '사례 B · 예측 78점'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={closer === key}
              onClick={() => {
                setCloser(key as 'A' | 'B')
                setSubmitted(false)
              }}
              className={`min-h-14 rounded-xl border px-4 py-3 text-left font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                closer === key
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-950'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <Button
          className="mt-5"
          disabled={!differenceA || !differenceB || !closer}
          onClick={submit}
        >
          계산과 선택 제출
        </Button>
      </fieldset>

      {submitted && (
        <AnswerFeedback
          correct={correct}
          explanation={
            correct
              ? '80과 70의 차이는 10, 80과 78의 차이는 2입니다. 차이가 더 작은 78점 예측이 실제값에 더 가깝습니다.'
              : '각 예측과 실제값 80의 거리를 다시 계산해 보세요. |80-70|=10, |80-78|=2입니다.'
          }
        />
      )}

      {props.isComplete && (
        <StepCompletionMessage>
          두 예측의 차이를 계산하고 실제값에 더 가까운 예측을 찾았습니다.
        </StepCompletionMessage>
      )}
    </StepFrame>
  )
}

export function Lesson05Step3(props: CommonStepProps) {
  const [choice, setChoice] = useState<'A' | 'B' | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const submit = () => {
    if (!choice) return
    setSubmitted(true)
    if (choice === 'A') props.onComplete()
  }

  return (
    <StepFrame
      {...props}
      step={3}
      intro="예측값과 실제값을 비교해 현재 예측이 얼마나 틀렸는지를 Loss로 나타냅니다."
    >
      <div className="rounded-2xl bg-indigo-50 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Target className="mt-0.5 shrink-0 text-indigo-700" size={24} aria-hidden="true" />
          <div>
            <h3 className="text-xl font-black text-indigo-950">손실함수</h3>
            <p className="mt-2 leading-7 text-slate-800">
              예측값과 실제값의 차이를 이용하여 모델이 얼마나 틀렸는지를
              숫자로 나타내는 함수를 손실함수라고 합니다.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <PredictionLossFlow prediction="98" target="100" lossName="손실함수 적용">
          <LossMeter
            display="오차 2 · 비교적 작은 Loss"
            level={0.12}
            description="이 활동 안에서 예측 98은 실제 100에 가까운 편입니다."
          />
        </PredictionLossFlow>
        <PredictionLossFlow prediction="60" target="100" lossName="손실함수 적용">
          <LossMeter
            display="오차 40 · 비교적 큰 Loss"
            level={0.82}
            description="이 활동 안에서 예측 60은 실제 100과 많이 다른 편입니다."
          />
        </PredictionLossFlow>
      </div>

      <fieldset className="mt-8">
        <legend className="text-xl font-black leading-snug text-slate-950">
          어느 상황의 Loss가 더 작을까요?
        </legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            ['A', '실제 100, 예측 98'],
            ['B', '실제 100, 예측 60'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={choice === key}
              onClick={() => {
                setChoice(key as 'A' | 'B')
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
        <Button className="mt-5" disabled={!choice} onClick={submit}>
          선택 제출
        </Button>
      </fieldset>

      {submitted && (
        <AnswerFeedback
          correct={choice === 'A'}
          explanation="예측 98은 실제값 100과의 차이가 2이므로 차이가 40인 예측 60보다 Loss가 작습니다."
        />
      )}

      <div className="mt-6 flex items-start gap-3 rounded-xl bg-slate-100 p-4 text-slate-700">
        <Lightbulb className="mt-0.5 shrink-0 text-amber-600" size={20} aria-hidden="true" />
        <p className="leading-7">
          손실값이 작을수록 현재 예측이 실제값에 가까운 방향입니다. Loss는
          정확도와 같은 값이 아니며, 손실함수가 예측값을 직접 고치는 것도 아닙니다.
        </p>
      </div>

      {props.isComplete && (
        <StepCompletionMessage>
          작은 Loss와 큰 Loss를 비교해 더 가까운 예측을 판단했습니다.
        </StepCompletionMessage>
      )}
    </StepFrame>
  )
}

export function Lesson05Step4(props: CommonStepProps) {
  const [errors, setErrors] = useState(['', '', ''])
  const [squares, setSquares] = useState(['', '', ''])
  const [average, setAverage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [fieldResults, setFieldResults] = useState<{
    errors: boolean[]
    squares: boolean[]
    average: boolean
  } | null>(null)

  const targets = mseExamples.map((item) => item.target)
  const predictions = mseExamples.map((item) => item.prediction)
  const expectedErrors = mseExamples.map((item) =>
    predictionError(item.target, item.prediction),
  )
  const expectedSquares = mseExamples.map((item) =>
    squaredError(item.target, item.prediction),
  )
  const expectedMse = mse(targets, predictions)
  const allFilled =
    errors.every((value) => value.trim() !== '') &&
    squares.every((value) => value.trim() !== '') &&
    average.trim() !== ''

  const gradeInputs = () => {
    const errorResults = errors.map((value, index) =>
      isWithinTolerance(parseFiniteNumberInput(value), expectedErrors[index], 1e-9),
    )
    const squareResults = squares.map((value, index) =>
      isWithinTolerance(parseFiniteNumberInput(value), expectedSquares[index], 1e-9),
    )
    const averageResult = isWithinTolerance(
      parseFiniteNumberInput(average),
      expectedMse,
      0.005,
    )
    return {
      errors: errorResults,
      squares: squareResults,
      average: averageResult,
      correct:
        errorResults.every(Boolean) &&
        squareResults.every(Boolean) &&
        averageResult,
    }
  }

  const correct = fieldResults
    ? fieldResults.errors.every(Boolean) &&
      fieldResults.squares.every(Boolean) &&
      fieldResults.average
    : false

  const updateValue = (
    setter: Dispatch<SetStateAction<string[]>>,
    index: number,
    value: string,
  ) => {
    setter((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? value : item)),
    )
    setSubmitted(false)
    setFieldResults(null)
  }

  const submit = () => {
    if (!allFilled) return
    const result = gradeInputs()
    setFieldResults(result)
    setSubmitted(true)
    if (result.correct) props.onComplete()
  }

  return (
    <StepFrame
      {...props}
      step={4}
      intro="연속적인 숫자 예측의 차이를 제곱하고 평균을 내어 평균제곱오차(MSE)를 계산합니다."
    >
      <div className="rounded-2xl bg-indigo-50 p-5">
        <p className="font-black text-indigo-950">
          평균제곱오차(MSE) = 각 오차를 제곱한 값의 평균
        </p>
        <p className="mt-2 leading-7 text-slate-700">
          점수, 가격, 온도처럼 연속적인 숫자를 예측하는 문제에 사용할 수 있습니다.
        </p>
      </div>

      <section className="mt-8" aria-labelledby="mse-calculate-title">
        <h3 id="mse-calculate-title" className="text-xl font-black text-slate-950">
          1. 오차와 오차 제곱 계산
        </h3>
        <p className="mt-2 leading-7 text-slate-600">
          오차는 예측값 - 실제값으로 계산하고, 그 값을 다시 제곱하세요.
        </p>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {mseExamples.map((item, index) => (
            <fieldset
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <legend className="px-1 text-lg font-black text-slate-950">
                {item.label}
              </legend>
              <dl className="mt-2 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white p-3">
                  <dt className="text-sm font-bold text-slate-500">실제값</dt>
                  <dd className="mt-1 text-xl font-black">{item.target}</dd>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <dt className="text-sm font-bold text-slate-500">예측값</dt>
                  <dd className="mt-1 text-xl font-black">{item.prediction}</dd>
                </div>
              </dl>
              <label
                htmlFor={`mse-error-${index}`}
                className="mt-4 block font-bold text-slate-800"
              >
                오차
              </label>
              <input
                id={`mse-error-${index}`}
                type="text"
                inputMode="decimal"
                value={errors[index]}
                aria-invalid={fieldResults ? !fieldResults.errors[index] : undefined}
                aria-describedby={fieldResults ? `mse-error-${index}-result` : undefined}
                onChange={(event) =>
                  updateValue(setErrors, index, event.target.value)
                }
                className={`mt-2 min-h-12 w-full rounded-xl border bg-white px-4 text-lg font-black focus:outline-none focus:ring-3 ${
                  fieldResults
                    ? fieldResults.errors[index]
                      ? 'border-emerald-500 focus:ring-emerald-100'
                      : 'border-rose-500 focus:ring-rose-100'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                }`}
              />
              {fieldResults ? (
                <p
                  id={`mse-error-${index}-result`}
                  className={`mt-2 flex items-center gap-1.5 text-sm font-bold ${
                    fieldResults.errors[index] ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {fieldResults.errors[index] ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  {fieldResults.errors[index] ? '오차가 맞습니다.' : `오차를 다시 확인하세요.`}
                </p>
              ) : null}
              <label
                htmlFor={`mse-square-${index}`}
                className="mt-4 block font-bold text-slate-800"
              >
                오차 제곱
              </label>
              <input
                id={`mse-square-${index}`}
                type="text"
                inputMode="decimal"
                value={squares[index]}
                aria-invalid={fieldResults ? !fieldResults.squares[index] : undefined}
                aria-describedby={fieldResults ? `mse-square-${index}-result` : undefined}
                onChange={(event) =>
                  updateValue(setSquares, index, event.target.value)
                }
                className={`mt-2 min-h-12 w-full rounded-xl border bg-white px-4 text-lg font-black focus:outline-none focus:ring-3 ${
                  fieldResults
                    ? fieldResults.squares[index]
                      ? 'border-emerald-500 focus:ring-emerald-100'
                      : 'border-rose-500 focus:ring-rose-100'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                }`}
              />
              {fieldResults ? (
                <p
                  id={`mse-square-${index}-result`}
                  className={`mt-2 flex items-center gap-1.5 text-sm font-bold ${
                    fieldResults.squares[index] ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {fieldResults.squares[index] ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  {fieldResults.squares[index] ? '오차 제곱이 맞습니다.' : '오차 제곱을 다시 확인하세요.'}
                </p>
              ) : null}
            </fieldset>
          ))}
        </div>
      </section>

      <section className="mt-8" aria-labelledby="mse-average-title">
        <h3 id="mse-average-title" className="text-xl font-black text-slate-950">
          2. 오차 제곱의 평균 계산
        </h3>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="font-mono text-lg font-bold leading-8 text-slate-800">
            ({expectedSquares.join(' + ')}) ÷ {mseExamples.length}
          </p>
          <label htmlFor="mse-average" className="mt-4 block font-black text-slate-800">
            최종 MSE를 소수점 둘째 자리까지 입력하세요
          </label>
          <div className="mt-2 flex max-w-sm items-center gap-3">
            <input
              id="mse-average"
              type="text"
              inputMode="decimal"
              value={average}
              aria-invalid={fieldResults ? !fieldResults.average : undefined}
              aria-describedby={fieldResults ? 'mse-average-result' : undefined}
              onChange={(event) => {
                setAverage(event.target.value)
                setSubmitted(false)
                setFieldResults(null)
              }}
              className={`min-h-12 min-w-0 flex-1 rounded-xl border bg-white px-4 text-lg font-black focus:outline-none focus:ring-3 ${
                fieldResults
                  ? fieldResults.average
                    ? 'border-emerald-500 focus:ring-emerald-100'
                    : 'border-rose-500 focus:ring-rose-100'
                  : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
              }`}
            />
            <span className="font-bold text-slate-600">MSE</span>
          </div>
          {fieldResults ? (
            <p
              id="mse-average-result"
              className={`mt-2 flex items-center gap-1.5 text-sm font-bold ${
                fieldResults.average ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {fieldResults.average ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {fieldResults.average
                ? 'MSE가 맞습니다.'
                : '소수점 둘째 자리까지 계산해 다시 입력하세요.'}
            </p>
          ) : null}
        </div>
        <Button className="mt-5" disabled={!allFilled} onClick={submit}>
          MSE 계산 확인
        </Button>
      </section>

      {submitted && (
        <>
          <AnswerFeedback
            correct={correct}
            explanation={
              correct
                ? `오차 제곱의 합 ${expectedSquares.reduce((sum, value) => sum + value, 0)}을 ${mseExamples.length}으로 나누면 ${expectedMse}…, 약 ${formatLoss(expectedMse)}입니다.`
                : '각 오차는 5, 10, 0이고 오차 제곱은 25, 100, 0입니다. 세 제곱값을 더한 뒤 3으로 나누어 다시 시도하세요.'
            }
          />
          {correct && (
            <div className="mt-5">
              <LossMeter
                display={`MSE ${formatLoss(expectedMse)}`}
                level={0.58}
                description="이 MSE는 세 학생의 오차 제곱을 평균 낸 값입니다. 다른 손실함수 값과 공통 척도로 비교하지 않습니다."
              />
            </div>
          )}
        </>
      )}

      {props.isComplete && (
        <StepCompletionMessage>
          각 오차와 오차 제곱을 입력하고 MSE {formatLoss(expectedMse)}를 계산했습니다.
        </StepCompletionMessage>
      )}
    </StepFrame>
  )
}

export function Lesson05Step5(props: CommonStepProps) {
  const [target, setTarget] = useState<0 | 1>(1)
  const [probability, setProbability] = useState(0.5)
  const [observedClose, setObservedClose] = useState(false)
  const [observedFar, setObservedFar] = useState(false)
  const [seenTargets, setSeenTargets] = useState<Array<0 | 1>>([1])
  const loss = useMemo(
    () => binaryCrossEntropy(target, probability),
    [target, probability],
  )
  const correctClassProbability = target === 1 ? probability : 1 - probability

  const recordObservation = (nextTarget: 0 | 1, nextProbability: number) => {
    const correctProbability =
      nextTarget === 1 ? nextProbability : 1 - nextProbability
    if (correctProbability >= 0.8) setObservedClose(true)
    if (correctProbability <= 0.2) setObservedFar(true)
  }

  useEffect(() => {
    if (observedClose && observedFar && !props.isComplete) {
      props.onComplete()
    }
  }, [observedClose, observedFar, props.isComplete, props.onComplete])

  return (
    <StepFrame
      {...props}
      step={5}
      intro="Sigmoid가 만든 스팸 확률과 실제 정답을 BCEE로 비교해 Loss 변화를 관찰합니다."
    >
      <div className="rounded-2xl bg-indigo-50 p-5">
        <h3 className="text-xl font-black text-indigo-950">
          이진 교차 엔트로피 오차(BCEE)
        </h3>
        <p className="mt-2 leading-7 text-slate-700">
          스팸/정상처럼 두 종류 중 하나를 분류할 때 예측 확률과 실제 정답을
          비교하는 손실함수입니다. 로그 계산을 암기하기보다 확률과 Loss의 관계를
          관찰하세요.
        </p>
      </div>

      <section className="mt-8" aria-labelledby="bcee-target-title">
        <h3 id="bcee-target-title" className="text-xl font-black text-slate-950">
          1. 실제 정답 선택
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            { value: 1 as const, label: '스팸 · 정답 1' },
            { value: 0 as const, label: '정상 · 정답 0' },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={target === item.value}
              onClick={() => {
                setTarget(item.value)
                setSeenTargets((current) =>
                  current.includes(item.value) ? current : [...current, item.value],
                )
                recordObservation(item.value, probability)
              }}
              className={`min-h-14 rounded-xl border px-4 py-3 text-left font-black focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                target === item.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-950'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-600">
          확인한 실제 정답: {seenTargets.length}/2
        </p>
      </section>

      <section className="mt-8" aria-labelledby="bcee-slider-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 id="bcee-slider-title" className="text-xl font-black text-slate-950">
              2. Sigmoid의 스팸 예측 확률 조절
            </h3>
            <p className="mt-2 leading-7 text-slate-600">
              슬라이더 값은 모델이 출력한 ‘스팸일 확률’입니다.
            </p>
          </div>
          <output
            htmlFor="spam-probability"
            className="rounded-xl bg-cyan-50 px-4 py-2 text-xl font-black text-cyan-900"
          >
            p = {probability.toFixed(2)}
          </output>
        </div>
        <input
          id="spam-probability"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={probability}
          onChange={(event) => {
            const nextProbability = Number(event.target.value)
            setProbability(nextProbability)
            recordObservation(target, nextProbability)
          }}
          className="mt-5 w-full accent-indigo-600"
          aria-valuetext={`스팸일 확률 ${probability.toFixed(2)}`}
        />
        <div className="mt-2 flex justify-between text-sm font-bold text-slate-500">
          <span>0.00 · 정상 쪽</span>
          <span>0.50 · 애매함</span>
          <span>1.00 · 스팸 쪽</span>
        </div>
      </section>

      <div className="mt-8">
        <PredictionLossFlow
          prediction={
            <>
              스팸 확률 {probability.toFixed(2)}
              <span className="mt-1 block text-sm font-semibold text-slate-600">
                Sigmoid가 생성
              </span>
            </>
          }
          target={target === 1 ? '스팸 · 1' : '정상 · 0'}
          lossName="BCEE로 평가"
        >
          <LossMeter
            display={`Loss ${formatLoss(loss)}`}
            level={1 - Math.exp(-Math.min(loss, 8))}
            description={`현재 정답 클래스(${target === 1 ? '스팸' : '정상'})의 확률은 ${correctClassProbability.toFixed(2)}입니다. 이 BCEE 활동 안에서 확률 변화에 따른 Loss를 비교하세요.`}
          />
        </PredictionLossFlow>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div
          className={`flex items-center gap-3 rounded-xl p-4 ${
            observedClose
              ? 'bg-emerald-50 text-emerald-900'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {observedClose ? (
            <CheckCircle2 size={20} aria-hidden="true" />
          ) : (
            <Circle size={18} aria-hidden="true" />
          )}
          <span className="font-bold">정답과 가까운 예측 관찰</span>
        </div>
        <div
          className={`flex items-center gap-3 rounded-xl p-4 ${
            observedFar
              ? 'bg-emerald-50 text-emerald-900'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {observedFar ? (
            <CheckCircle2 size={20} aria-hidden="true" />
          ) : (
            <Circle size={18} aria-hidden="true" />
          )}
          <span className="font-bold">정답과 먼 예측 관찰</span>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-700">
        <p>
          정답이 1이면 <strong>Loss = -ln(p)</strong>, 정답이 0이면{' '}
          <strong>Loss = -ln(1-p)</strong>로 계산합니다. 내부 계산은 0과 1
          끝값에서도 깨지지 않도록 안전한 범위로 제한합니다.
        </p>
        <p className="mt-2 font-bold text-indigo-900">
          정답 클래스의 확률이 높아지면 Loss는 작아지고, 낮아지면 Loss는
          커지는 경향이 있습니다.
        </p>
      </div>

      {props.isComplete && (
        <StepCompletionMessage>
          BCEE에서 정답과 가까운 예측과 먼 예측을 모두 관찰했습니다.
        </StepCompletionMessage>
      )}
    </StepFrame>
  )
}

const irisLabels = ['Setosa', 'Versicolor', 'Virginica'] as const
const irisTarget = [0, 0, 1] as const

export function Lesson05Step6(props: CommonStepProps) {
  const [presetId, setPresetId] = useState<(typeof cceePresets)[number]['id']>('A')
  const [viewedPresets, setViewedPresets] = useState<string[]>([])
  const preset = cceePresets.find((item) => item.id === presetId)!
  const loss = categoricalCrossEntropy(irisTarget, preset.probabilities)

  useEffect(() => {
    if (viewedPresets.length === cceePresets.length && !props.isComplete) {
      props.onComplete()
    }
  }, [viewedPresets, props.isComplete, props.onComplete])

  const selectPreset = (id: (typeof cceePresets)[number]['id']) => {
    setPresetId(id)
    setViewedPresets((current) =>
      current.includes(id) ? current : [...current, id],
    )
  }

  return (
    <StepFrame
      {...props}
      step={6}
      intro="붓꽃 세 종류의 예측 확률을 비교하며 정답 클래스 확률과 CCEE Loss의 관계를 관찰합니다."
    >
      <div className="rounded-2xl bg-indigo-50 p-5">
        <h3 className="text-xl font-black text-indigo-950">
          범주형 교차 엔트로피 오차(CCEE)
        </h3>
        <p className="mt-2 leading-7 text-slate-700">
          여러 클래스 중 하나를 분류할 때 실제 정답 위치에 해당하는 예측 확률을
          이용해 Loss를 계산합니다.
        </p>
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <section
          className="rounded-2xl border border-slate-200 bg-white p-5"
          aria-labelledby="one-hot-title"
        >
          <h3 id="one-hot-title" className="text-lg font-black text-slate-950">
            원-핫 실제 정답
          </h3>
          <p className="mt-2 leading-6 text-slate-600">
            실제 정답은 Virginica이며, 원-핫 배열은 정답 위치만 1로 표시합니다.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {irisLabels.map((label, index) => (
              <div
                key={label}
                className={`rounded-xl p-3 text-center ${
                  irisTarget[index] === 1
                    ? 'bg-emerald-100 text-emerald-950'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <p className="break-words text-xs font-bold sm:text-sm">{label}</p>
                <p className="mt-2 text-2xl font-black">{irisTarget[index]}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 font-mono font-black text-emerald-800">[0, 0, 1]</p>
        </section>

        <section
          className="rounded-2xl border border-slate-200 bg-white p-5"
          aria-labelledby="softmax-probability-title"
        >
          <h3
            id="softmax-probability-title"
            className="text-lg font-black text-slate-950"
          >
            Softmax 예측 확률
          </h3>
          <p className="mt-2 leading-6 text-slate-600">
            모델이 각 클래스일 가능성을 확률로 출력한 값입니다.
          </p>
          <div className="mt-4 space-y-3">
            {irisLabels.map((label, index) => (
              <div key={label}>
                <div className="flex justify-between gap-3 text-sm font-bold">
                  <span>{label}</span>
                  <span>{preset.probabilities[index].toFixed(2)}</span>
                </div>
                <div className="mt-1 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      index === 2 ? 'bg-emerald-500' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${preset.probabilities[index] * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-8" aria-labelledby="ccee-preset-title">
        <h3 id="ccee-preset-title" className="text-xl font-black text-slate-950">
          세 예측을 모두 비교해 보세요
        </h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {cceePresets.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={presetId === item.id}
              onClick={() => selectPreset(item.id)}
              className={`min-h-28 rounded-2xl border p-4 text-left focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                presetId === item.id
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-950'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300'
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <strong>{item.label}</strong>
                {viewedPresets.includes(item.id) && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                    <CheckCircle2 size={15} aria-hidden="true" />
                    확인
                  </span>
                )}
              </span>
              <span className="mt-2 block font-mono text-sm">
                [{item.probabilities.map((value) => value.toFixed(2)).join(', ')}]
              </span>
              <span className="mt-2 block text-sm leading-6 text-slate-600">
                {item.helper}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm font-bold text-slate-600">
          확인한 예측: {viewedPresets.length}/3
        </p>
      </section>

      <div className="mt-8">
        <PredictionLossFlow
          prediction={
            <>
              [{preset.probabilities.map((value) => value.toFixed(2)).join(', ')}]
              <span className="mt-1 block text-sm font-semibold text-slate-600">
                Softmax 확률
              </span>
            </>
          }
          target={
            <>
              [0, 0, 1]
              <span className="mt-1 block text-sm font-semibold text-slate-600">
                원-핫 정답
              </span>
            </>
          }
          lossName="CCEE로 평가"
        >
          <LossMeter
            display={`Loss ${formatLoss(loss)}`}
            level={1 - Math.exp(-Math.min(loss, 8))}
            description={`정답 Virginica 위치의 예측 확률 ${preset.probabilities[2].toFixed(2)}를 사용해 -ln(${preset.probabilities[2].toFixed(2)})로 계산했습니다.`}
          />
        </PredictionLossFlow>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-xl bg-slate-100 p-4 text-slate-700">
        <Lightbulb className="mt-0.5 shrink-0 text-amber-600" size={20} aria-hidden="true" />
        <p className="leading-7">
          정답 클래스인 Virginica의 확률이 높아질수록 CCEE Loss는 작아지는
          경향이 있습니다. 예측 A의 Loss는 -ln(0.84) = {formatLoss(categoricalCrossEntropy(irisTarget, cceePresets[0].probabilities), 3)}…,
          화면 표시 약 {formatLoss(categoricalCrossEntropy(irisTarget, cceePresets[0].probabilities))}입니다.
        </p>
      </div>

      {props.isComplete && (
        <StepCompletionMessage>
          CCEE 예측 확률 세 가지를 모두 비교했습니다.
        </StepCompletionMessage>
      )}
    </StepFrame>
  )
}

interface Step7Props extends CommonStepProps {
  priorStepsComplete: boolean
  onCompletionReadyChange: (ready: boolean) => void
}

type LossName = 'MSE' | 'BCEE' | 'CCEE'

export function Lesson05Step7({
  priorStepsComplete,
  onCompletionReadyChange,
  ...props
}: Step7Props) {
  const [matches, setMatches] = useState<Record<string, LossName | undefined>>({})
  const [matchesSubmitted, setMatchesSubmitted] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Array<string | null>>([
    null,
    null,
    null,
    null,
  ])
  const [quizSubmitted, setQuizSubmitted] = useState([
    false,
    false,
    false,
    false,
  ])

  const allMatched = lossMatchingCases.every((item) => matches[item.id])
  const matchesCorrect = lossMatchingCases.every(
    (item) => matches[item.id] === item.answer,
  )
  const allQuizSubmitted = quizSubmitted.every(Boolean)
  const completionReady =
    matchesSubmitted && matchesCorrect && allQuizSubmitted

  useEffect(() => {
    onCompletionReadyChange(completionReady)
  }, [completionReady, onCompletionReadyChange])

  const chooseMatch = (id: string, lossName: LossName) => {
    setMatches((current) => ({ ...current, [id]: lossName }))
    setMatchesSubmitted(false)
  }

  const chooseQuiz = (index: number, answer: string) => {
    setQuizAnswers((current) =>
      current.map((value, itemIndex) => (itemIndex === index ? answer : value)),
    )
    setQuizSubmitted((current) =>
      current.map((value, itemIndex) => (itemIndex === index ? false : value)),
    )
  }

  const submitQuiz = (index: number) => {
    if (!quizAnswers[index]) return
    setQuizSubmitted((current) =>
      current.map((value, itemIndex) => (itemIndex === index ? true : value)),
    )
  }

  return (
    <StepFrame
      {...props}
      step={7}
      intro="문제 유형에 맞는 손실함수를 연결하고 활성화 함수와 손실함수의 서로 다른 역할을 정리합니다."
    >
      <section aria-labelledby="loss-match-title">
        <h3 id="loss-match-title" className="text-xl font-black text-slate-950">
          1. 문제 유형과 손실함수 연결
        </h3>
        <p className="mt-2 leading-7 text-slate-600">
          손실함수는 마음대로 바꾸는 것이 아니라 문제 유형에 맞게 선택합니다.
        </p>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {lossMatchingCases.map((item) => (
            <fieldset
              key={item.id}
              className="rounded-2xl border border-slate-200 p-5"
            >
              <legend className="px-1 text-lg font-black leading-7 text-slate-950">
                {item.title}
              </legend>
              <p className="mt-1 text-sm font-bold text-indigo-700">{item.type}</p>
              <div className="mt-4 grid gap-2">
                {(['MSE', 'BCEE', 'CCEE'] as const).map((lossName) => (
                  <button
                    key={lossName}
                    type="button"
                    aria-pressed={matches[item.id] === lossName}
                    onClick={() => chooseMatch(item.id, lossName)}
                    className={`min-h-12 rounded-xl border px-4 py-3 text-left font-black focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                      matches[item.id] === lossName
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-950'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300'
                    }`}
                  >
                    {lossName}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <Button
          className="mt-5"
          disabled={!allMatched}
          onClick={() => setMatchesSubmitted(true)}
        >
          연결 확인
        </Button>
        {matchesSubmitted && (
          <AnswerFeedback
            correct={matchesCorrect}
            explanation={
              matchesCorrect
                ? '연속적인 숫자 예측은 MSE, 이진 분류는 BCEE, 다중 분류는 CCEE로 연결합니다.'
                : '기온처럼 연속적인 숫자는 MSE, 스팸/정상은 BCEE, 여러 동물 중 하나는 CCEE입니다.'
            }
          />
        )}
      </section>

      <section className="mt-10" aria-labelledby="function-role-title">
        <h3 id="function-role-title" className="text-xl font-black text-slate-950">
          2. 활성화 함수와 손실함수 구분
        </h3>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
            <p className="text-sm font-black tracking-wide text-cyan-800">
              활성화 함수
            </p>
            <p className="mt-2 text-lg font-black text-slate-950">
              가중합을 출력값으로 변환
            </p>
            <p className="mt-3 leading-7 text-slate-700">
              ReLU, Sigmoid, Softmax가 해당합니다. 예를 들어 Softmax는
              [0.12, 0.04, 0.84]와 같은 예측 확률을 만듭니다.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-black tracking-wide text-emerald-800">
              손실함수
            </p>
            <p className="mt-2 text-lg font-black text-slate-950">
              예측값과 실제값을 비교해 틀린 정도를 계산
            </p>
            <p className="mt-3 leading-7 text-slate-700">
              MSE, BCEE, CCEE가 해당합니다. CCEE는 Softmax 예측과 실제
              [0, 0, 1]을 비교해 Loss를 계산합니다.
            </p>
          </div>
        </div>
        <div className="mt-5">
          <FlowChain
            label="활성화 함수가 예측값을 만들고 손실함수가 Loss를 계산하는 흐름"
            items={[
              '가중합',
              '활성화 함수',
              '예측값',
              '실제값과 비교',
              '손실함수',
              'Loss',
            ]}
          />
        </div>
        <p className="mt-4 font-bold leading-7 text-indigo-900">
          Sigmoid와 BCEE는 같은 개념이 아니며, Softmax와 CCEE도 같은
          개념이 아닙니다. 손실함수는 현재 예측값을 직접 수정하지 않습니다.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="lesson05-quiz-title">
        <h3 id="lesson05-quiz-title" className="text-xl font-black text-slate-950">
          3. 확인 문제 4개
        </h3>
        <p className="mt-2 leading-7 text-slate-600">
          오답은 해설을 확인하고 답을 바꾸어 다시 제출할 수 있습니다.
        </p>
        <div className="mt-5 space-y-6">
          {lesson05Quiz.map((quiz, index) => (
            <fieldset
              key={quiz.question}
              className="rounded-2xl border border-slate-200 p-5 sm:p-6"
            >
              <legend className="px-1 text-lg font-black leading-7 text-slate-950">
                문제 {index + 1}. {quiz.question}
              </legend>
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
              <Button
                className="mt-4"
                onClick={() => submitQuiz(index)}
                disabled={!quizAnswers[index]}
              >
                문제 {index + 1} 제출
              </Button>
              {quizSubmitted[index] && (
                <AnswerFeedback
                  correct={quizAnswers[index] === quiz.answer}
                  explanation={quiz.explanation}
                />
              )}
            </fieldset>
          ))}
        </div>
      </section>

      {completionReady && !props.isComplete && (
        <div
          className="mt-7 flex items-start gap-3 rounded-2xl bg-amber-50 p-5 text-amber-950"
          role="status"
        >
          <CircleHelp className="mt-0.5 shrink-0" size={21} aria-hidden="true" />
          <p className="leading-7">
            문제 유형 연결과 확인 문제 네 개 제출을 마쳤습니다.{' '}
            {priorStepsComplete
              ? '화면 아래의 완료 버튼으로 Lesson 05를 완료하세요.'
              : '완료되지 않은 앞 STEP의 핵심 활동을 마치면 완료 버튼이 활성화됩니다.'}
          </p>
        </div>
      )}

      {props.isComplete && (
        <div className="mt-8 border-t border-emerald-200 pt-7">
          <div className="flex items-start gap-3 text-emerald-900" role="status">
            <CheckCircle2 className="mt-0.5 shrink-0" size={24} aria-hidden="true" />
            <div>
              <h3 className="text-xl font-black">Lesson 05 완료</h3>
              <p className="mt-2 leading-7">
                홈의 전체 진행도에 이 차시 완료가 반영되었습니다.
              </p>
            </div>
          </div>
          <div className="mt-7 rounded-2xl bg-indigo-50 p-5">
            <p className="font-black text-indigo-900">Lesson 06으로 이어지는 질문</p>
            <p className="mt-2 text-lg font-bold leading-7 text-slate-900">
              Loss를 계산했다면 AI는 이 값을 줄이기 위해 무엇을 바꿔야 할까요?
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:border-indigo-300 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Home에서 진행도 보기
              </Link>
              <Link
                to="/lesson/06"
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
