import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  CircleHelp,
  Play,
  RefreshCcw,
  RotateCcw,
  Sparkles,
  TrendingDown,
  XCircle,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  adjustmentCards,
  learningFlowCards,
  learningPhases,
  lesson06Objectives,
  lesson06Quiz,
  lesson06StepTitles,
} from './lesson06Data'
import { LossHistoryGraph } from './LossHistoryGraph'
import { LossLandscapeDiagram } from './LossLandscapeDiagram'
import { UpdateWalkthrough } from './UpdateWalkthrough'
import {
  INITIAL_PARAMETERS,
  LEARNING_RATE,
  TRAINING_EXAMPLE,
  formatTrainingValue,
  forward,
  makeSnapshot,
  trainOneStep,
  trainRepeatedly,
  type ModelParameters,
  type TrainingSnapshot,
  type TrainingStepResult,
} from './trainingMath'

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
  const titleId = active ? 'lesson-step-title' : `lesson06-step-${step}-title`

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
          {lesson06StepTitles[step - 1]}
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
  tone = 'indigo',
}: {
  items: readonly string[]
  label: string
  tone?: 'indigo' | 'rose'
}) {
  const nodeClass =
    tone === 'indigo'
      ? 'border-indigo-200 bg-white text-indigo-950'
      : 'border-rose-200 bg-white text-rose-950'

  return (
    <div
      className={`grid items-center gap-2 rounded-2xl border p-4 md:grid-flow-col md:auto-cols-fr ${
        tone === 'indigo'
          ? 'border-indigo-100 bg-indigo-50/60'
          : 'border-rose-100 bg-rose-50/60'
      }`}
      aria-label={label}
    >
      {items.map((item, index) => (
        <div className="contents" key={`${item}-${index}`}>
          <div
            className={`flex min-h-16 items-center justify-center rounded-xl border px-3 py-3 text-center font-black leading-6 ${nodeClass}`}
          >
            {item}
          </div>
          {index < items.length - 1 && <FlowArrow />}
        </div>
      ))}
    </div>
  )
}

function SimulationBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm font-black text-indigo-800">
      <Sparkles size={17} aria-hidden="true" />
      학습 원리 시뮬레이션
    </div>
  )
}

function MetricGrid({
  title,
  values,
  tone = 'slate',
}: {
  title: string
  values: ReadonlyArray<{ label: string; value: string }>
  tone?: 'slate' | 'indigo' | 'emerald'
}) {
  const toneClass = {
    slate: 'border-slate-200 bg-slate-50',
    indigo: 'border-indigo-200 bg-indigo-50',
    emerald: 'border-emerald-200 bg-emerald-50',
  }[tone]

  return (
    <section className={`rounded-2xl border p-5 ${toneClass}`}>
      <h3 className="text-lg font-black text-slate-950">{title}</h3>
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {values.map((item) => (
          <div key={item.label} className="rounded-xl bg-white p-3">
            <dt className="text-sm font-bold text-slate-500">{item.label}</dt>
            <dd className="mt-1 break-words font-mono text-xl font-black text-slate-950">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

const initialForward = forward(INITIAL_PARAMETERS)

export function Lesson06Step1(props: CommonStepProps) {
  const [choice, setChoice] = useState<'A' | 'B' | 'C' | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const submit = () => {
    if (!choice) return
    setSubmitted(true)
    if (choice === 'A') props.onComplete()
  }

  return (
    <StepFrame
      {...props}
      step={1}
      intro="Lesson 05에서 오차(loss)를 계산한 다음, 학습을 계속하려면 무엇을 해야 하는지 생각합니다."
    >
      <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5" aria-label="교과서 기본 학습 과정">
        <h3 className="font-black text-indigo-950">순전파 → 오차 계산 → 역전파</h3>
        <p className="mt-2 leading-7">교과서 인쇄 94쪽의 세 과정입니다. 아래 계산과 조작은 별도의 학습 과정이 아니라 이 세 과정을 자세히 살펴보는 활동입니다.</p>
        <dl className="mt-4 grid gap-3 lg:grid-cols-3">{learningPhases.map((phase) => <div key={phase.label} className="rounded-xl bg-white p-4"><dt className="font-black text-indigo-900">{phase.label}</dt><dd className="mt-2 leading-7 text-slate-700">{phase.detail}</dd></div>)}</dl>
        <p className="mt-4 leading-7">조정 후에는 같은 입력으로 다시 순전파하여 새로운 예측값과 오차를 확인합니다. 자료 준비는 이 반복 이전에, 테스트 데이터 평가는 훈련 후에 이루어집니다.</p>
      </section>
      <section className="mt-7" aria-labelledby="lesson06-goals-title">
        <h3 id="lesson06-goals-title" className="text-xl font-black text-slate-950">
          이번 차시에서 알아볼 것
        </h3>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {lesson06Objectives.map((objective, index) => (
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
          미분, 편미분, 연쇄 법칙이나 복잡한 행렬 계산은 하지 않습니다. 작은
          신경망의 실제 계산 결과를 조작하며 학습 원리를 관찰합니다.
        </p>
      </section>

      <section className="mt-9" aria-labelledby="loss-review-title">
        <h3 id="loss-review-title" className="text-xl font-black text-slate-950">
          Lesson 05 흐름 복습
        </h3>
        <div className="mt-5">
          <FlowChain
            label="입력에서 오차(loss) 계산까지의 복습 흐름"
            items={[
              '입력',
              '순전파',
              `예측값 ${formatTrainingValue(initialForward.prediction)}`,
              '실젯값과 비교',
              '손실함수',
              `오차(loss) ${formatTrainingValue(initialForward.loss)}`,
            ]}
          />
        </div>
        <p className="mt-4 rounded-xl bg-indigo-50 p-4 font-bold leading-7 text-indigo-950">
          오차(loss)은 모델이 현재 얼마나 틀렸는지를 알려주는 값입니다. 오차(loss)를
          계산하는 것만으로 가중치와 편향이 바뀌지는 않습니다.
        </p>
      </section>

      <fieldset className="mt-9">
        <legend className="text-xl font-black leading-snug text-slate-950">
          오차(loss)를 계산한 다음 해야 할 일로 가장 적절한 것은?
        </legend>
        <div className="mt-4 grid gap-3">
          {[
            ['A', '오차(loss)를 줄이도록 모델을 수정한다.'],
            ['B', '입력 데이터를 모두 삭제한다.'],
            ['C', '예측값을 무조건 정답으로 바꾼다.'],
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
        <Button className="mt-5" disabled={!choice} onClick={submit}>
          선택 제출
        </Button>
      </fieldset>

      {submitted && (
        <AnswerFeedback
          correct={choice === 'A'}
          explanation="학습하려면 입력이나 정답을 바꾸는 것이 아니라 오차(loss)가 줄어들도록 모델 내부의 값을 조정해야 합니다."
        />
      )}

      {props.isComplete && (
        <StepCompletionMessage>
          오차(loss)를 계산한 뒤 모델을 수정해야 한다는 점을 확인했습니다.
        </StepCompletionMessage>
      )}
    </StepFrame>
  )
}

type AdjustmentTarget = 'adjusted' | 'given' | 'computed'

export function Lesson06Step2(props: CommonStepProps) {
  const [answers, setAnswers] = useState<
    Record<string, AdjustmentTarget | undefined>
  >({})
  const [submitted, setSubmitted] = useState(false)
  const [reason, setReason] = useState<'evidence' | 'shortcut' | null>(null)
  const [reasonSubmitted, setReasonSubmitted] = useState(false)
  const allAnswered = adjustmentCards.every((card) => answers[card.id])
  const correct = adjustmentCards.every(
    (card) => answers[card.id] === card.answer,
  )
  const reasonCorrect = reason === 'evidence'

  const choose = (id: string, target: AdjustmentTarget) => {
    setAnswers((current) => ({ ...current, [id]: target }))
    setSubmitted(false)
  }

  const submit = () => {
    if (!allAnswered) return
    setSubmitted(true)
  }

  useEffect(() => {
    if (submitted && correct && reasonSubmitted && reasonCorrect && !props.isComplete) {
      props.onComplete()
    }
  }, [correct, props.isComplete, props.onComplete, reasonCorrect, reasonSubmitted, submitted])

  return (
    <StepFrame
      {...props}
      step={2}
      intro="주어진 값, 순전파에서 계산되는 값, 학습하면서 조정되는 값을 구분합니다."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
          <h3 className="font-black text-indigo-950">모델이 조정하는 값</h3>
          <p className="mt-2 leading-7 text-slate-700">
            가중치와 편향은 오차(loss)를 줄이는 방향으로 조정될 수 있습니다.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <h3 className="font-black text-emerald-950">주어진 데이터와 정답</h3>
          <p className="mt-2 leading-7 text-slate-700">
            입력값과 실젯값인 데이터 레이블은 모델이 마음대로 바꾸지 않습니다.
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5 sm:col-span-2">
          <h3 className="font-black text-cyan-950">순전파와 비교로 계산되는 값</h3>
          <p className="mt-2 leading-7 text-slate-700">
            가중합·예측값·오차(loss)는 현재 입력과 모델 값에서 계산되는 결과입니다. 가중치와 편향을 조정하면 다음 순전파에서 계산 결과도 달라집니다.
          </p>
        </div>
      </div>

      <section className="mt-8" aria-labelledby="adjustment-sort-title">
        <h3 id="adjustment-sort-title" className="text-xl font-black text-slate-950">
          각 값을 세 영역 중 하나로 분류하세요
        </h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {adjustmentCards.map((card) => (
            <fieldset
              key={card.id}
              className="rounded-2xl border border-slate-200 p-5"
            >
              <legend className="px-1 text-lg font-black text-slate-950">
                {card.label}
              </legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {[
                  ['adjusted', '모델이 조정'],
                  ['given', '주어진 값'],
                  ['computed', '계산된 결과'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={answers[card.id] === key}
                    onClick={() => choose(card.id, key as AdjustmentTarget)}
                    className={`min-h-12 rounded-xl border px-3 py-2 text-sm font-bold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                      answers[card.id] === key
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-950'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <Button className="mt-5" disabled={!allAnswered} onClick={submit}>
          분류 확인
        </Button>
        {submitted && (
          <AnswerFeedback
            correct={correct}
            explanation={
              correct
                ? '입력과 정답은 주어지고, 가중치와 편향은 조정되며, 예측과 오차(loss)는 그 값들에서 계산됩니다.'
                : '입력·정답은 자료의 근거, 가중치·편향은 모델의 조정 대상, 예측·오차(loss)는 계산 결과라는 차이를 살펴보세요.'
            }
          />
        )}
      </section>

      <fieldset className="mt-8">
        <legend className="text-xl font-black leading-snug text-slate-950">
          왜 모델이 입력값과 실젯값을 임의로 바꾸면 안 될까요?
        </legend>
        <div className="mt-4 grid gap-3">
          {[
            ['evidence', '입력과 정답은 모델이 배워야 할 실제 자료와 기준이기 때문이다.'],
            ['shortcut', '오차(loss) 숫자만 작아 보이게 만들면 학습이 끝나기 때문이다.'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={reason === key}
              onClick={() => {
                setReason(key as typeof reason)
                setReasonSubmitted(false)
              }}
              className={`min-h-14 rounded-xl border px-4 py-3 text-left font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                reason === key
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-950'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <Button className="mt-5" disabled={!reason} onClick={() => setReasonSubmitted(true)}>
          이유 제출
        </Button>
        {reasonSubmitted && (
          <AnswerFeedback
            correct={reasonCorrect}
            explanation={
              reasonCorrect
                ? '입력과 정답은 모델이 설명해야 할 자료입니다. 모델은 이 근거를 바꾸는 대신 자신의 가중치와 편향을 조정합니다.'
                : '오차(loss) 숫자만 억지로 낮추는 것이 아니라, 주어진 자료와 정답을 설명하는 모델을 만들어야 합니다.'
            }
          />
        )}
      </fieldset>

      {props.isComplete && (
        <StepCompletionMessage>
          주어진 값, 계산 결과와 조정할 값을 구분하고 입력·정답을 유지해야 하는 이유를 판단했습니다.
        </StepCompletionMessage>
      )}
    </StepFrame>
  )
}

type PassType = 'forward' | 'backward'

export function Lesson06Step3(props: CommonStepProps) {
  const [answers, setAnswers] = useState<
    Record<'prediction' | 'correction', PassType | undefined>
  >({
    prediction: undefined,
    correction: undefined,
  })
  const [submitted, setSubmitted] = useState(false)
  const allAnswered = Boolean(answers.prediction && answers.correction)
  const correct =
    answers.prediction === 'forward' && answers.correction === 'backward'

  const choose = (
    id: 'prediction' | 'correction',
    value: PassType,
  ) => {
    setAnswers((current) => ({ ...current, [id]: value }))
    setSubmitted(false)
  }

  const submit = () => {
    if (!allAnswered) return
    setSubmitted(true)
    if (correct) props.onComplete()
  }

  return (
    <StepFrame
      {...props}
      step={3}
      intro="앞으로 진행되는 예측 과정과 뒤에서 앞으로 오차 정보를 전달하는 역전파를 구분합니다."
    >
      <div className="rounded-2xl bg-indigo-50 p-5">
        <h3 className="text-xl font-black text-indigo-950">역전파</h3>
        <p className="mt-2 leading-7 text-slate-800">
          예측의 오차 정보를 출력 쪽에서 앞쪽으로 전달하여 각 연결이 오차에
          얼마나 영향을 주었는지 계산하고, 가중치와 편향을 수정하는 과정을
          역전파라고 합니다.
        </p>
      </div>

      <p className="mt-5 leading-7 text-slate-700">순전파로 예측을 만든 다음 손실함수로 실젯값과 비교해 오차를 계산합니다. 역전파는 이 오차 정보를 이용하는 다음 과정입니다.</p>
      <div className="mt-7 space-y-5">
        <section aria-labelledby="forward-flow-title">
          <h3 id="forward-flow-title" className="font-black text-slate-950">
            순전파 · 예측을 만드는 방향
          </h3>
          <div className="mt-3">
            <FlowChain
              label="입력에서 예측값까지 진행하는 순전파"
              items={['입력', '가중합', '활성화 함수', '예측값']}
            />
          </div>
        </section>
        <section aria-labelledby="backward-flow-title">
          <h3 id="backward-flow-title" className="font-black text-slate-950">
            역전파 · 오차에 관한 정보로 수정 방향 계산
          </h3>
          <div className="mt-3">
            <FlowChain
              tone="rose"
              label="오차에 관한 정보로 앞쪽 연결의 수정 방향을 계산하는 역전파"
              items={[
                '오차(loss)의 오차 정보',
                '출력 쪽 → 앞쪽',
                '수정 방향 계산',
                '경사 하강법으로 값 수정',
                '다시 순전파',
              ]}
            />
          </div>
        </section>
      </div>

      <p className="mt-5 rounded-xl bg-slate-100 p-4 text-sm leading-6 text-slate-700">
        역전파는 오차(loss) 숫자 하나가 선을 따라 이동하거나 데이터를 뒤집는 과정이
        아닙니다. 정답을 바꾸는 과정도 아니며, 오차에 대한 정보를 뒤에서 앞으로
        전달해 수정 방향을 계산합니다.
      </p>

      <section className="mt-8" aria-labelledby="pass-sort-title">
        <h3 id="pass-sort-title" className="text-xl font-black text-slate-950">
          두 흐름을 구분하세요
        </h3>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {[
            {
              id: 'prediction' as const,
              text: '입력 → 예측값을 만든다',
            },
            {
              id: 'correction' as const,
              text: '오차 정보 → 앞쪽으로 전달하여 수정 방향을 계산한다',
            },
          ].map((item) => (
            <fieldset
              key={item.id}
              className="rounded-2xl border border-slate-200 p-5"
            >
              <legend className="px-1 font-black leading-7 text-slate-950">
                {item.text}
              </legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {[
                  ['forward', '순전파'],
                  ['backward', '역전파'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={answers[item.id] === key}
                    onClick={() => choose(item.id, key as PassType)}
                    className={`min-h-12 rounded-xl border px-3 py-2 font-bold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                      answers[item.id] === key
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-950'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <Button className="mt-5" disabled={!allAnswered} onClick={submit}>
          흐름 확인
        </Button>
        {submitted && (
          <AnswerFeedback
            correct={correct}
            explanation="입력으로 예측을 만드는 과정은 순전파, 오차 정보로 앞쪽 연결의 수정 방향을 계산하는 과정은 역전파입니다."
          />
        )}
      </section>

      {props.isComplete && (
        <StepCompletionMessage>
          순전파와 역전파의 방향과 역할을 올바르게 구분했습니다.
        </StepCompletionMessage>
      )}
    </StepFrame>
  )
}

export function Lesson06Step4(props: CommonStepProps) {
  const [choice, setChoice] = useState<'left' | 'right' | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [meaning, setMeaning] = useState<'adjust' | 'answer' | null>(null)
  const [meaningSubmitted, setMeaningSubmitted] = useState(false)

  const submit = () => {
    if (!choice) return
    setSubmitted(true)
  }

  useEffect(() => {
    if (submitted && choice === 'left' && meaningSubmitted && meaning === 'adjust' && !props.isComplete) {
      props.onComplete()
    }
  }, [choice, props.isComplete, props.onComplete, meaning, meaningSubmitted, submitted])


  return (
    <StepFrame
      {...props}
      step={4}
      intro="경사 하강법을 오차(loss)가 작아지는 방향으로 값을 조금씩 조정하는 방법으로 이해합니다."
    >
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
        <LossLandscapeDiagram showDirection={submitted && choice === 'left'} />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        이 그림은 원리를 쉽게 이해하기 위한 단순화된 표현입니다. 실제 딥러닝의
        오차(loss) 공간이 언제나 하나의 매끄러운 언덕인 것은 아닙니다.
      </p>

      <fieldset className="mt-8">
        <legend className="text-xl font-black leading-snug text-slate-950">
          현재 위치에서 어느 방향으로 이동하면 오차(loss)가 작아질까요?
        </legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            aria-pressed={choice === 'left'}
            onClick={() => {
              setChoice('left')
              setSubmitted(false)
            }}
            className={`flex min-h-14 items-center justify-center gap-2 rounded-xl border px-4 py-3 font-black focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
              choice === 'left'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-950'
                : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300'
            }`}
          >
            <ArrowLeft size={20} aria-hidden="true" />
            왼쪽 · 낮은 곳 방향
          </button>
          <button
            type="button"
            aria-pressed={choice === 'right'}
            onClick={() => {
              setChoice('right')
              setSubmitted(false)
            }}
            className={`flex min-h-14 items-center justify-center gap-2 rounded-xl border px-4 py-3 font-black focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
              choice === 'right'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-950'
                : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300'
            }`}
          >
            오른쪽 · 높은 곳 방향
            <ArrowRight size={20} aria-hidden="true" />
          </button>
        </div>
        <Button className="mt-5" disabled={!choice} onClick={submit}>
          방향 확인
        </Button>
        {submitted && (
          <AnswerFeedback
            correct={choice === 'left'}
            explanation="현재 점에서는 왼쪽의 낮은 곳으로 이동하면 오차(loss)가 작아집니다. 경사 하강법은 이처럼 손실이 작아지는 방향으로 가중치와 편향을 조정합니다."
          />
        )}
      </fieldset>

      <fieldset className="mt-8 rounded-2xl bg-indigo-50 p-5">
        <legend className="font-black">그림에서 낮은 방향으로 이동한다는 것은 무엇을 뜻할까요?</legend>
        <div className="mt-4 grid gap-3">{([{id:'adjust',label:'계산한 오차가 줄어드는 방향으로 가중치와 편향을 조정한다.'},{id:'answer',label:'예측과 같아지도록 입력과 실젯값을 바꾼다.'}] as const).map((item) => <Button key={item.id} variant={meaning === item.id ? 'primary' : 'secondary'} aria-pressed={meaning === item.id} onClick={() => {setMeaning(item.id);setMeaningSubmitted(false)}}>{item.label}</Button>)}</div>
        <Button className="mt-4" disabled={!meaning} onClick={() => setMeaningSubmitted(true)}>방향의 의미 제출</Button>
        {meaningSubmitted && <AnswerFeedback correct={meaning === 'adjust'} explanation={meaning === 'adjust' ? '경사 하강법은 오차가 작아지는 방향으로 모델의 가중치와 편향을 조정하는 방법입니다.' : '실젯값은 비교 기준입니다. 그 값을 바꾸는 대신 모델 안의 가중치와 편향을 조정합니다.'} />}
        <p className="mt-4 text-sm leading-6">다음 실험은 한 번 조정하는 크기(학습률)를 {LEARNING_RATE}로 고정합니다. 이 값의 비교나 수식 유도는 하지 않습니다. 한 번의 조정으로 언제나 최적 모델이 되는 것은 아닙니다.</p>
      </fieldset>

      {props.isComplete && (
        <StepCompletionMessage>
          오차가 작아지는 방향을 찾고 가중치와 편향을 조정한다는 의미를 설명했습니다.
        </StepCompletionMessage>
      )}
    </StepFrame>
  )
}

export function Lesson06Step5(props: CommonStepProps) {
  const [forwardRun, setForwardRun] = useState(false)
  const [trainingResult, setTrainingResult] =
    useState<TrainingStepResult | null>(null)
  const [predictions, setPredictions] = useState<Record<string, string>>({})
  const [predictionSubmitted, setPredictionSubmitted] = useState(false)
  const [interpretation, setInterpretation] = useState<'parameters' | 'target' | null>(null)
  const [interpretationSubmitted, setInterpretationSubmitted] = useState(false)
  const predictionSolutions: Record<string, string> | null = trainingResult ? {
    output: trainingResult.after.prediction > trainingResult.before.prediction ? 'up' : 'down',
    loss: trainingResult.after.loss < trainingResult.before.loss ? 'down' : 'up',
    parameters: (['w1', 'w2', 'b'] as const).every((key) => trainingResult.nextParameters[key] > INITIAL_PARAMETERS[key]) ? 'up' : 'down',
  } : null
  const allPredicted = ['output', 'loss', 'parameters'].every((id) => predictions[id])

  const runTraining = () => {
    if (!forwardRun || !predictionSubmitted || trainingResult) return
    const result = trainOneStep(INITIAL_PARAMETERS)
    setTrainingResult(result)
  }

  const choosePrediction = (id: string, answer: string) => {
    setPredictions((current) => ({ ...current, [id]: answer }))
    setPredictionSubmitted(false)
    setInterpretationSubmitted(false)
  }

  useEffect(() => {
    if (trainingResult && interpretationSubmitted && interpretation === 'parameters' && !props.isComplete) props.onComplete()
  }, [interpretation, interpretationSubmitted, props, trainingResult])

  const beforeValues = [
    { label: 'w1', value: formatTrainingValue(INITIAL_PARAMETERS.w1) },
    { label: 'w2', value: formatTrainingValue(INITIAL_PARAMETERS.w2) },
    { label: '편향 b', value: formatTrainingValue(INITIAL_PARAMETERS.b) },
    { label: '가중합 z', value: formatTrainingValue(initialForward.z) },
    { label: '예측값', value: formatTrainingValue(initialForward.prediction) },
    { label: 'BCEE 오차(loss)', value: formatTrainingValue(initialForward.loss) },
  ]

  const afterValues = trainingResult
    ? [
        {
          label: 'w1',
          value: formatTrainingValue(trainingResult.nextParameters.w1),
        },
        {
          label: 'w2',
          value: formatTrainingValue(trainingResult.nextParameters.w2),
        },
        {
          label: '편향 b',
          value: formatTrainingValue(trainingResult.nextParameters.b),
        },
        {
          label: '가중합 z',
          value: formatTrainingValue(trainingResult.after.z),
        },
        {
          label: '예측값',
          value: formatTrainingValue(trainingResult.after.prediction),
        },
        {
          label: 'BCEE 오차(loss)',
          value: formatTrainingValue(trainingResult.after.loss),
        },
      ]
    : []

  return (
    <StepFrame
      {...props}
      step={5}
      intro="작은 이진 분류 뉴런에서 BCEE에 따른 수정 방향에 근거한 1회 업데이트를 실행합니다."
    >
      <SimulationBadge />
      <div className="mt-5 rounded-2xl bg-slate-100 p-5">
        <h3 className="text-lg font-black text-slate-950">고정된 작은 신경망</h3>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['입력 x1', TRAINING_EXAMPLE.x1],
            ['입력 x2', TRAINING_EXAMPLE.x2],
            ['실젯값 y', TRAINING_EXAMPLE.y],
            ['학습률', LEARNING_RATE],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-white p-3">
              <dt className="text-sm font-bold text-slate-500">{label}</dt>
              <dd className="mt-1 font-mono text-xl font-black">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          활성화 함수는 시그모이드(sigmoid), 손실함수는 이진 교차 엔트로피 오차(BCEE)를 사용합니다. Lesson 05에서
          다룬 BCEE와 같은 계산입니다.
        </p>
      </div>

      <section className="mt-8" aria-labelledby="single-forward-title">
        <h3 id="single-forward-title" className="text-xl font-black text-slate-950">
          1. 학습 전 순전파와 오차 계산
        </h3>
        <p className="mt-2 leading-7 text-slate-600">
          초기 가중치와 편향으로 가중합, 시그모이드 예측값과 BCEE 오차(loss)를 계산하세요.
        </p>
        <div className="mt-5">
          <FlowChain
            label="초기값으로 실행하는 순전파와 오차 계산"
            items={[
              'x1=1, x2=1',
              'w1=0.2, w2=-0.1, b=0',
              forwardRun
                ? `z=${formatTrainingValue(initialForward.z)}`
                : '가중합 z',
              '시그모이드(sigmoid)',
              forwardRun
                ? `예측 ${formatTrainingValue(initialForward.prediction)}`
                : '예측값',
              forwardRun
                ? `BCEE 오차(loss) ${formatTrainingValue(initialForward.loss)}`
                : 'BCEE 오차(loss)',
            ]}
          />
        </div>
        <Button className="mt-5" onClick={() => setForwardRun(true)}>
          <Play size={18} aria-hidden="true" />
          순전파·오차 계산 실행
        </Button>
        {forwardRun && (
          <div className="mt-5">
            <MetricGrid title="학습 전 계산 결과" values={beforeValues} />
          </div>
        )}
      </section>

      <section className="mt-9" aria-labelledby="before-training-prediction-title">
        <h3 id="before-training-prediction-title" className="text-xl font-black text-slate-950">
          2. 실행 전에 변화 예측
        </h3>
        <p className="mt-2 leading-7 text-slate-600">
          실젯값은 1입니다. 현재 예측 {formatTrainingValue(initialForward.prediction)}가 정답에 가까워지려면 무엇이 어떻게 변해야 할지 먼저 기록하세요.
        </p>
        <div className="mt-5 space-y-5">
          {[
            { id: 'output', question: '예측값은?', options: [['up', '증가'], ['down', '감소']] },
            { id: 'loss', question: '오차(loss)는?', options: [['up', '증가'], ['down', '감소']] },
            { id: 'parameters', question: '이번 예제의 w1, w2, b는?', options: [['up', '모두 증가'], ['down', '모두 감소']] },
          ].map((item) => (
            <fieldset key={item.id} className="rounded-2xl border border-slate-200 p-5">
              <legend className="px-1 font-black text-slate-950">{item.question}</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {item.options.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={predictions[item.id] === key}
                    disabled={trainingResult !== null}
                    onClick={() => choosePrediction(item.id, key)}
                    className={`min-h-14 rounded-xl border px-4 py-3 text-left font-bold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                      predictions[item.id] === key
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-950'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <Button
          className="mt-5"
          disabled={!allPredicted || trainingResult !== null}
          onClick={() => setPredictionSubmitted(true)}
        >
          변화 예상 기록
        </Button>
        {predictionSubmitted && !trainingResult && (
          <p className="mt-4 rounded-xl bg-indigo-50 p-4 font-bold text-indigo-950" role="status">
            예상을 기록했습니다. 이제 실제 1회 학습 결과와 비교하세요.
          </p>
        )}
      </section>

      <section className="mt-9" aria-labelledby="one-training-title">
        <h3 id="one-training-title" className="text-xl font-black text-slate-950">
          3. 실제 계산으로 한 번 학습
        </h3>
        <p className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 font-semibold leading-7 text-indigo-950">
          입력과 실젯값은 유지됩니다. 가중치와 편향을 조정한 뒤 같은 입력으로 다시 순전파하면 새로운 가중합·예측값·오차가 계산됩니다.
        </p>
        <p className="mt-2 leading-7 text-slate-600">
          학생에게 미분식을 계산시키지 않지만, 버튼은 현재 예측과 정답에서 얻은
          실제 오차 정보를 이용해 가중치와 편향을 업데이트합니다.
        </p>
        <Button className="mt-5" disabled={!forwardRun || !predictionSubmitted || trainingResult !== null} onClick={runTraining}>
          <TrendingDown size={18} aria-hidden="true" />
          1회 학습
        </Button>

        {trainingResult && (
          <>
            <div className="mt-6">
              <FlowChain
                tone="rose"
                label="오차(loss) 확인부터 다시 순전파까지의 한 번 학습 흐름"
                items={[
                  '오차(loss) 확인',
                  '역전파',
                  '가중치·편향 수정',
                  '다시 순전파',
                ]}
              />
            </div>
            <p className="mt-4 rounded-xl bg-rose-50 p-4 font-bold text-rose-950">
              예측값과 실젯값의 방향을 나타내는 차이: {formatTrainingValue(trainingResult.error)}. 이 부호 있는 차이와 손실함수로 계산한 오차(loss)는 서로 다른 값입니다.
            </p>
            <UpdateWalkthrough
              example={TRAINING_EXAMPLE}
              beforeValues={beforeValues}
              afterValues={afterValues}
            />
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                '가중치가 바뀜',
                '편향이 바뀜',
                '예측값이 정답 1에 가까워짐',
                '이 예제에서 오차(loss)가 감소함',
              ].map((label) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 font-bold text-emerald-900"
                >
                  <CheckCircle2 size={19} aria-hidden="true" />
                  {label}
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3" aria-live="polite">
              {[
                ['예측값 증가', predictions.output === predictionSolutions?.output],
                ['오차(loss) 감소', predictions.loss === predictionSolutions?.loss],
                ['w1·w2·b 증가', predictions.parameters === predictionSolutions?.parameters],
              ].map(([label, matched]) => (
                <div
                  key={String(label)}
                  className={`flex items-center gap-2 rounded-xl p-4 font-bold ${
                    matched ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-950'
                  }`}
                >
                  {matched ? <CheckCircle2 size={19} aria-hidden="true" /> : <CircleHelp size={19} aria-hidden="true" />}
                  <span>{label}: {matched ? '예상과 같음' : '실제 값으로 다시 확인'}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-xl bg-slate-100 p-4 leading-7 text-slate-700">
              실제 계산에서 예측은 {formatTrainingValue(trainingResult.before.prediction)}에서 {formatTrainingValue(trainingResult.after.prediction)}로,
              오차(loss)는 {formatTrainingValue(trainingResult.before.loss)}에서 {formatTrainingValue(trainingResult.after.loss)}로 변했습니다.
              입력과 실젯값은 유지된 채 가중치와 편향이 조정되어, 다시 순전파한 예측이 정답 1에 가까워졌습니다. 이 단순 예제에서 오차가 줄었으며 모든 학습이 매번 같은 결과를 내는 것은 아닙니다.
            </p>
          </>
        )}
      </section>

      {trainingResult && <fieldset className="mt-7 rounded-xl border border-indigo-200 p-5">
        <legend className="font-black">학습 전후 결과가 달라진 이유는?</legend>
        <div className="mt-4 grid gap-3">{([{id:'parameters',label:'가중치와 편향을 조정하고 다시 순전파해 새 예측값과 오차를 계산했기 때문이다.'},{id:'target',label:'손실함수가 실젯값이나 현재 예측을 직접 정답으로 고쳤기 때문이다.'}] as const).map((item) => <Button key={item.id} variant={interpretation === item.id ? 'primary' : 'secondary'} aria-pressed={interpretation === item.id} onClick={() => {setInterpretation(item.id);setInterpretationSubmitted(false)}}>{item.label}</Button>)}</div>
        <Button className="mt-4" disabled={!interpretation} onClick={() => setInterpretationSubmitted(true)}>학습 결과 해석 제출</Button>
        {interpretationSubmitted && <AnswerFeedback correct={interpretation === 'parameters'} explanation={interpretation === 'parameters' ? '가중치와 편향을 조정한 뒤 같은 입력으로 다시 계산했습니다. 오차 계산은 비교, 역전파는 오차를 줄이기 위한 수정 과정입니다.' : '위의 입력과 실젯값은 그대로입니다. 전후 표에서 바뀐 가중치·편향과 다음 순전파의 예측값을 비교한 뒤 다시 제출하세요.'} />}
      </fieldset>}

      {props.isComplete && (
        <StepCompletionMessage>
          실제 계산에 근거한 1회 업데이트를 실행하고 학습 전후 값을 비교했습니다.
        </StepCompletionMessage>
      )}
    </StepFrame>
  )
}

export function Lesson06Step6(props: CommonStepProps) {
  const initialSnapshot = useMemo(
    () => makeSnapshot(0, INITIAL_PARAMETERS),
    [],
  )
  const [parameters, setParameters] =
    useState<ModelParameters>(INITIAL_PARAMETERS)
  const [epoch, setEpoch] = useState(0)
  const [history, setHistory] = useState<TrainingSnapshot[]>([initialSnapshot])
  const [lastRunHistory, setLastRunHistory] =
    useState<TrainingSnapshot[] | null>(null)
  const [trainedAtLeastFive, setTrainedAtLeastFive] = useState(false)
  const [choice, setChoice] = useState<'A' | 'B' | 'C' | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const current = makeSnapshot(epoch, parameters)
  const graphHistory =
    history.length > 1 ? history : lastRunHistory ?? history
  const comparisonHistory =
    history.length > 1 ? history : lastRunHistory
  const runEpochs = (requestedCount: number) => {
    const count = Math.min(requestedCount, 10 - epoch)
    if (count <= 0) return
    const result = trainRepeatedly(parameters, epoch, count)
    const nextEpoch = epoch + count
    setParameters(result.parameters)
    setEpoch(nextEpoch)
    setHistory((currentHistory) => [...currentHistory, ...result.snapshots])
    setSubmitted(false)
    if (nextEpoch >= 5) setTrainedAtLeastFive(true)
  }

  const reset = () => {
    if (history.length > 1) {
      setLastRunHistory(history)
    }
    setParameters(INITIAL_PARAMETERS)
    setEpoch(0)
    setHistory([initialSnapshot])
    setSubmitted(false)
  }

  const submit = () => {
    if (!choice || !trainedAtLeastFive) return
    setSubmitted(true)
  }

  useEffect(() => {
    if (
      trainedAtLeastFive &&
      submitted &&
      choice === 'A' &&
      !props.isComplete
    ) {
      props.onComplete()
    }
  }, [
    choice,
    props.isComplete,
    props.onComplete,
    submitted,
    trainedAtLeastFive,
  ])

  return (
    <StepFrame
      {...props}
      step={6}
      intro="동일한 실제 계산을 최대 10회 반복하고 에포크에 따른 가중치, 편향, 예측값과 오차(loss) 변화를 관찰합니다."
    >
      <SimulationBadge />
      <div className="mt-5 flex flex-wrap gap-3">
        <Button onClick={() => runEpochs(1)} disabled={epoch >= 10}>
          1회 더 학습
        </Button>
        <Button onClick={() => runEpochs(5)} disabled={epoch >= 10}>
          5회 연속 학습
        </Button>
        <Button variant="secondary" onClick={reset}>
          <RefreshCcw size={18} aria-hidden="true" />
          처음으로 초기화
        </Button>
      </div>

      <div className="mt-6">
        <MetricGrid
          title="현재 학습 상태"
          tone="indigo"
          values={[
            { label: '학습 횟수', value: `${current.epoch}` },
            { label: 'w1', value: formatTrainingValue(current.w1) },
            { label: 'w2', value: formatTrainingValue(current.w2) },
            { label: '편향 b', value: formatTrainingValue(current.b) },
            { label: '예측값', value: formatTrainingValue(current.prediction) },
            { label: 'BCEE 오차(loss)', value: formatTrainingValue(current.loss) },
          ]}
        />
      </div>

      <div className="mt-6">
        <LossHistoryGraph history={graphHistory} />
      </div>

      {comparisonHistory && comparisonHistory.length > 1 && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-100 p-4">
            <p className="text-sm font-bold text-slate-500">초기 오차(loss)</p>
            <p className="mt-1 font-mono text-2xl font-black text-slate-950">
              {formatTrainingValue(comparisonHistory[0].loss)}
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-4">
            <p className="text-sm font-bold text-emerald-700">
              {comparisonHistory.at(-1)!.epoch}회 학습 후 오차(loss)
            </p>
            <p className="mt-1 font-mono text-2xl font-black text-emerald-950">
              {formatTrainingValue(comparisonHistory.at(-1)!.loss)}
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div
          className={`flex items-center gap-3 rounded-xl p-4 ${
            trainedAtLeastFive
              ? 'bg-emerald-50 text-emerald-900'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {trainedAtLeastFive ? (
            <CheckCircle2 size={20} aria-hidden="true" />
          ) : (
            <Circle size={18} aria-hidden="true" />
          )}
          <span className="font-bold">최소 5회 학습 실행</span>
        </div>
        <p className="rounded-xl bg-slate-100 p-4 text-sm leading-6">초기화는 다시 관찰하고 싶을 때 사용합니다. 누르는 것 자체가 완료 조건은 아니며, 초기화해도 최근 그래프와 비교값은 남습니다.</p>
      </div>

      <fieldset className="mt-8">
        <legend className="text-xl font-black leading-snug text-slate-950">
          이 학습 예제에서 학습이 진행되면서 오차(loss)는 어떻게 되었나요?
        </legend>
        <div className="mt-4 grid gap-3">
          {[
            ['A', '오차가 감소해 이 예제의 예측이 실젯값에 더 가까워졌다.'],
            ['B', '계속 무조건 커졌다.'],
            ['C', '모든 데이터에서 언제나 정확해졌다는 뜻이다.'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              disabled={!trainedAtLeastFive}
              aria-pressed={choice === key}
              onClick={() => {
                setChoice(key as 'A' | 'B' | 'C')
                setSubmitted(false)
              }}
              className={`min-h-14 rounded-xl border px-4 py-3 text-left font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${
                choice === key
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-950'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300'
              }`}
            >
              {key}. {label}
            </button>
          ))}
        </div>
        <Button
          className="mt-5"
          disabled={!choice || !trainedAtLeastFive}
          onClick={submit}
        >
          오차(loss) 비교 제출
        </Button>
        {submitted && (
          <AnswerFeedback
            correct={choice === 'A'}
            explanation="이 단순한 학습 예제에서는 오차(loss)가 감소했습니다. 실제 딥러닝에서는 데이터와 설정에 따라 오차(loss)가 매번 일정하게 감소하지 않을 수도 있습니다."
          />
        )}
      </fieldset>

      {props.isComplete && (
        <StepCompletionMessage>
          실제 계산을 반복하고 오차의 변화와 의미를 해석했습니다.
        </StepCompletionMessage>
      )}
    </StepFrame>
  )
}

interface Step7Props extends CommonStepProps {
  priorStepsComplete: boolean
  onCompletionReadyChange: (ready: boolean) => void
}

const shuffledLearningCards = [
  learningFlowCards[3],
  learningFlowCards[0],
  learningFlowCards[5],
  learningFlowCards[2],
  learningFlowCards[9],
  learningFlowCards[4],
  learningFlowCards[1],
  learningFlowCards[7],
  learningFlowCards[6],
  learningFlowCards[8],
]

export function Lesson06Step7({
  priorStepsComplete,
  onCompletionReadyChange,
  ...props
}: Step7Props) {
  const [order, setOrder] = useState<string[]>([])
  const [orderSubmitted, setOrderSubmitted] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Array<string | null>>(
    lesson06Quiz.map(() => null),
  )
  const [quizSubmitted, setQuizSubmitted] = useState<boolean[]>(
    lesson06Quiz.map(() => false),
  )
  const expectedOrder = learningFlowCards.map((card) => card.id)
  const orderCorrect =
    order.length === expectedOrder.length &&
    order.every((id, index) => id === expectedOrder[index])
  const allQuizSubmitted = quizSubmitted.every(Boolean)
  const allQuizCorrect = lesson06Quiz.every(
    (quiz, index) => quizSubmitted[index] && quizAnswers[index] === quiz.answer,
  )
  const completionReady =
    priorStepsComplete && orderSubmitted && orderCorrect && allQuizSubmitted && allQuizCorrect

  useEffect(() => {
    onCompletionReadyChange(completionReady)
  }, [completionReady, onCompletionReadyChange])

  const addCard = (id: string) => {
    if (order.includes(id)) return
    setOrder((current) => [...current, id])
    setOrderSubmitted(false)
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
      intro="입력부터 반복 학습까지 1~6차시의 개념을 하나의 흐름으로 연결합니다."
    >
      <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
        <h3 className="font-black text-indigo-950">교과서 기본 과정과 세부 활동 연결</h3>
        <div className="mt-4"><FlowChain label="교과서 기본 학습 과정" items={learningPhases.map((phase) => phase.label)} /></div>
        <dl className="mt-4 grid gap-3 lg:grid-cols-3">{learningPhases.map((phase) => <div key={phase.label} className="rounded-xl bg-white p-4"><dt className="font-black">{phase.label}</dt><dd className="mt-2 leading-7">{phase.detail}</dd></div>)}</dl>
        <p className="mt-4 leading-7">다음 카드는 이 세 과정의 세부 활동입니다. 자료 준비·초기화는 반복 전에, 새 데이터 평가는 훈련 후에 연결합니다. 서로 다른 두 학습 순서를 외우는 활동이 아닙니다.</p>
      </section>
      <section aria-labelledby="full-learning-flow-title">
        <h3
          id="full-learning-flow-title"
          className="text-xl font-black text-slate-950"
        >
          1. 딥러닝 학습 흐름 배열
        </h3>
        <p className="mt-2 leading-7 text-slate-600">
          열 카드를 학습이 진행되는 순서대로 선택하세요.
        </p>
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="font-black text-slate-800">배치할 카드</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {shuffledLearningCards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  disabled={order.includes(card.id)}
                  onClick={() => addCard(card.id)}
                  className="min-h-14 rounded-xl border border-slate-300 bg-white px-4 py-3 text-left font-bold leading-6 text-slate-800 hover:border-indigo-400 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {card.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="font-black text-slate-800">내가 만든 학습 흐름</p>
              <Button
                variant="ghost"
                onClick={() => {
                  setOrder([])
                  setOrderSubmitted(false)
                }}
              >
                <RotateCcw size={17} aria-hidden="true" />
                초기화
              </Button>
            </div>
            <ol className="mt-3 min-h-80 space-y-2 rounded-2xl bg-slate-100 p-4">
              {order.length === 0 ? (
                <li className="py-12 text-center text-slate-500">
                  카드를 순서대로 선택하세요.
                </li>
              ) : (
                order.map((id, index) => {
                  const card = learningFlowCards.find((item) => item.id === id)!
                  return (
                    <li key={id}>
                      <div className="rounded-xl border border-indigo-200 bg-white p-3 font-black leading-6 text-indigo-950">
                        <span className="mr-2 text-sm text-indigo-500">
                          {index + 1}
                        </span>
                        {card.label}
                      </div>
                      {index < order.length - 1 && (
                        <ArrowDown
                          className="mx-auto my-1 text-cyan-700"
                          size={18}
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
          disabled={order.length !== learningFlowCards.length}
          onClick={() => setOrderSubmitted(true)}
        >
          전체 흐름 확인
        </Button>
        {orderSubmitted && (
          <AnswerFeedback
            correct={orderCorrect}
            explanation={
              orderCorrect
                ? '입력 데이터에서 예측과 오차(loss)를 만들고, 역전파로 수정한 뒤 다시 학습하는 순서입니다.'
                : '자료 준비와 초기화가 먼저입니다. 그다음 예측·오차(loss)·수정·반복을 거친 뒤 새로운 데이터 확인이 이어지는지 살펴보세요.'
            }
          />
        )}
      </section>

      <section className="mt-10" aria-labelledby="four-concepts-title">
        <h3 id="four-concepts-title" className="text-xl font-black text-slate-950">
          2. 네 개념의 서로 다른 역할
        </h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[
            ['순전파', '입력에서 예측값을 만드는 과정'],
            ['손실함수', '예측이 얼마나 틀렸는지 계산'],
            ['역전파', '오차 정보를 이용해 수정 방향을 계산'],
            ['경사 하강법', '손실을 줄이는 방향으로 가중치와 편향을 조정'],
          ].map(([name, description]) => (
            <div
              key={name}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <p className="font-black text-indigo-800">{name}</p>
              <p className="mt-2 leading-7 text-slate-700">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="lesson06-quiz-title">
        <h3 id="lesson06-quiz-title" className="text-xl font-black text-slate-950">
          3. 확인 문제 {lesson06Quiz.length}개
        </h3>
        <p className="mt-2 leading-7 text-slate-600">
          오답은 해설을 읽고 답을 바꾸어 다시 제출할 수 있습니다.
        </p>
        <div className="mt-5 space-y-6">
          {lesson06Quiz.map((quiz, index) => (
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
                  explanation={
                    quizAnswers[index] === quiz.answer
                      ? quiz.explanation
                      : '이 선택이 예측을 만드는 과정인지, 수정 방향을 찾는 과정인지, 또는 새로운 데이터의 성능을 확인하는 과정인지 다시 구분해 보세요.'
                  }
                />
              )}
            </fieldset>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-xl bg-indigo-50 p-5" aria-labelledby="final-loop-title">
        <h3 id="final-loop-title" className="font-black">학습 결과 해석</h3>
        <p className="mt-3 leading-7">순전파 → 오차 계산 → 역전파를 반복하며 가중치와 편향을 조정합니다. 예측값은 조정 뒤의 다음 순전파에서 달라집니다. 손실함수가 현재 예측을 직접 수정하는 것이 아닙니다. 훈련 후에는 사용하지 않은 테스트 데이터로 결과를 확인합니다.</p>
      </section>

      {completionReady && !props.isComplete && (
        <div
          className="mt-7 flex items-start gap-3 rounded-2xl bg-amber-50 p-5 text-amber-950"
          role="status"
        >
          <CircleHelp className="mt-0.5 shrink-0" size={21} aria-hidden="true" />
          <p className="leading-7">
            전체 학습 흐름 배열과 확인 문제 {lesson06Quiz.length}개를 모두 맞혔습니다.{' '}
            {priorStepsComplete
              ? '화면 아래의 완료 버튼으로 Lesson 06을 완료하세요.'
              : '완료되지 않은 앞 STEP의 핵심 활동을 마치면 완료 버튼이 활성화됩니다.'}
          </p>
        </div>
      )}

      {props.isComplete && (
        <div className="mt-8 border-t border-emerald-200 pt-7">
          <div className="flex items-start gap-3 text-emerald-900" role="status">
            <CheckCircle2 className="mt-0.5 shrink-0" size={24} aria-hidden="true" />
            <div>
              <h3 className="text-xl font-black">Lesson 06 완료</h3>
              <p className="mt-2 leading-7">
                홈의 전체 진행도에 이 차시 완료가 반영되었습니다.
              </p>
            </div>
          </div>
          <div className="mt-7 rounded-2xl bg-indigo-50 p-5">
            <p className="font-black text-indigo-900">Lesson 07로 이어지는 질문</p>
            <p className="mt-2 text-lg font-bold leading-7 text-slate-900">
              실제 손글씨 데이터를 신경망에 넣으려면 이미지와 정답을 어떤 숫자
              형태로 준비해야 할까요?
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:border-indigo-300 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Home에서 진행도 보기
              </Link>
              <Link
                to="/lesson/07"
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
