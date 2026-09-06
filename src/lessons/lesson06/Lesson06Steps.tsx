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
  lesson06Objectives,
  lesson06Quiz,
  lesson06StepTitles,
} from './lesson06Data'
import { LossHistoryGraph } from './LossHistoryGraph'
import { LossLandscapeDiagram } from './LossLandscapeDiagram'
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
      intro="Lesson 05에서 Loss를 계산한 다음, 학습을 계속하려면 무엇을 해야 하는지 생각합니다."
    >
      <section aria-labelledby="lesson06-goals-title">
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
            label="입력에서 Loss 계산까지의 복습 흐름"
            items={[
              '입력',
              '순전파',
              `예측값 ${formatTrainingValue(initialForward.prediction)}`,
              '실제값과 비교',
              '손실함수',
              `Loss ${formatTrainingValue(initialForward.loss)}`,
            ]}
          />
        </div>
        <p className="mt-4 rounded-xl bg-indigo-50 p-4 font-bold leading-7 text-indigo-950">
          Loss는 모델이 현재 얼마나 틀렸는지를 알려주는 값입니다. Loss를
          계산하는 것만으로 가중치와 편향이 바뀌지는 않습니다.
        </p>
      </section>

      <fieldset className="mt-9">
        <legend className="text-xl font-black leading-snug text-slate-950">
          Loss를 계산한 다음 해야 할 일로 가장 적절한 것은?
        </legend>
        <div className="mt-4 grid gap-3">
          {[
            ['A', 'Loss를 줄이도록 모델을 수정한다.'],
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
          explanation="학습하려면 입력이나 정답을 바꾸는 것이 아니라 Loss가 줄어들도록 모델 내부의 값을 조정해야 합니다."
        />
      )}

      {props.isComplete && (
        <StepCompletionMessage>
          Loss를 계산한 뒤 모델을 수정해야 한다는 점을 확인했습니다.
        </StepCompletionMessage>
      )}
    </StepFrame>
  )
}

type AdjustmentTarget = 'adjusted' | 'given'

export function Lesson06Step2(props: CommonStepProps) {
  const [answers, setAnswers] = useState<
    Record<string, AdjustmentTarget | undefined>
  >({})
  const [submitted, setSubmitted] = useState(false)
  const allAnswered = adjustmentCards.every((card) => answers[card.id])
  const correct = adjustmentCards.every(
    (card) => answers[card.id] === card.answer,
  )

  const choose = (id: string, target: AdjustmentTarget) => {
    setAnswers((current) => ({ ...current, [id]: target }))
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
      step={2}
      intro="신경망이 학습하면서 조정하는 값과 학습 데이터로 주어진 값을 구분합니다."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
          <h3 className="font-black text-indigo-950">모델이 조정하는 값</h3>
          <p className="mt-2 leading-7 text-slate-700">
            가중치와 편향은 Loss를 줄이는 방향으로 조정될 수 있습니다.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <h3 className="font-black text-emerald-950">주어진 데이터와 정답</h3>
          <p className="mt-2 leading-7 text-slate-700">
            입력값과 실제 정답인 데이터 라벨은 모델이 마음대로 바꾸지 않습니다.
          </p>
        </div>
      </div>

      <section className="mt-8" aria-labelledby="adjustment-sort-title">
        <h3 id="adjustment-sort-title" className="text-xl font-black text-slate-950">
          각 값을 두 영역 중 하나로 분류하세요
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
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {[
                  ['adjusted', '모델이 조정'],
                  ['given', '주어진 값'],
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
                ? '신경망은 가중치 w1, w2와 편향 b를 조정하며 입력값 x1, x2와 실제 정답 y는 주어진 값으로 유지합니다.'
                : 'w1, w2, b는 모델이 조정합니다. x1, x2와 데이터 라벨인 실제 정답 y는 주어진 값입니다.'
            }
          />
        )}
      </section>

      {props.isComplete && (
        <StepCompletionMessage>
          수정할 가중치·편향과 바꾸지 않는 입력·정답을 올바르게 구분했습니다.
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

      <div className="mt-7 space-y-5">
        <section aria-labelledby="forward-flow-title">
          <h3 id="forward-flow-title" className="font-black text-slate-950">
            순전파 · 예측을 만드는 방향
          </h3>
          <div className="mt-3">
            <FlowChain
              label="입력에서 Loss까지 진행하는 순전파"
              items={['입력', '가중합', '활성화 함수', '예측', 'Loss']}
            />
          </div>
        </section>
        <section aria-labelledby="backward-flow-title">
          <h3 id="backward-flow-title" className="font-black text-slate-950">
            역전파 · 오차 정보를 전달하는 방향
          </h3>
          <div className="mt-3">
            <FlowChain
              tone="rose"
              label="Loss에서 앞쪽 연결로 오차 정보를 전달하는 역전파"
              items={[
                'Loss',
                '출력 쪽',
                '앞쪽 연결',
                '가중치와 편향 수정',
              ]}
            />
          </div>
        </section>
      </div>

      <p className="mt-5 rounded-xl bg-slate-100 p-4 text-sm leading-6 text-slate-700">
        역전파는 Loss 숫자 하나가 선을 따라 이동하거나 데이터를 뒤집는 과정이
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

  const submit = () => {
    if (!choice) return
    setSubmitted(true)
    if (choice === 'left') props.onComplete()
  }

  return (
    <StepFrame
      {...props}
      step={4}
      intro="경사하강법을 Loss가 작아지는 방향으로 값을 조금씩 조정하는 방법으로 이해합니다."
    >
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
        <LossLandscapeDiagram showDirection={submitted && choice === 'left'} />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        이 그림은 원리를 쉽게 이해하기 위한 단순화된 표현입니다. 실제 딥러닝의
        Loss 공간이 언제나 하나의 매끄러운 언덕인 것은 아닙니다.
      </p>

      <fieldset className="mt-8">
        <legend className="text-xl font-black leading-snug text-slate-950">
          현재 위치에서 어느 방향으로 이동하면 Loss가 작아질까요?
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
            explanation="현재 점에서는 왼쪽의 낮은 곳으로 이동하면 Loss가 작아집니다. 경사하강법은 이처럼 손실이 작아지는 방향으로 가중치와 편향을 조정합니다."
          />
        )}
      </fieldset>

      <section className="mt-8" aria-labelledby="learning-rate-title">
        <h3 id="learning-rate-title" className="text-xl font-black text-slate-950">
          학습률은 한 번에 움직이는 크기
        </h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-slate-100 p-4">
            <p className="font-black text-slate-900">너무 작으면</p>
            <p className="mt-2 leading-6 text-slate-600">
              한 번의 변화가 작아 학습이 느릴 수 있습니다.
            </p>
          </div>
          <div className="rounded-xl bg-slate-100 p-4">
            <p className="font-black text-slate-900">너무 크면</p>
            <p className="mt-2 leading-6 text-slate-600">
              적절한 지점을 지나칠 수 있습니다.
            </p>
          </div>
          <div className="rounded-xl bg-indigo-100 p-4">
            <p className="font-black text-indigo-950">이번 실습</p>
            <p className="mt-2 leading-6 text-slate-700">
              학습률을 {LEARNING_RATE.toFixed(1)}로 고정합니다.
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          경사하강법이 최솟값을 언제나 정확히 찾거나 한 번의 업데이트로 최적
          모델을 만든다는 뜻은 아닙니다.
        </p>
      </section>

      {props.isComplete && (
        <StepCompletionMessage>
          Loss가 작아지는 방향을 선택하고 학습률의 의미를 확인했습니다.
        </StepCompletionMessage>
      )}
    </StepFrame>
  )
}

export function Lesson06Step5(props: CommonStepProps) {
  const [forwardRun, setForwardRun] = useState(false)
  const [trainingResult, setTrainingResult] =
    useState<TrainingStepResult | null>(null)

  const runTraining = () => {
    const result = trainOneStep(INITIAL_PARAMETERS)
    setTrainingResult(result)
    props.onComplete()
  }

  const beforeValues = [
    { label: 'w1', value: formatTrainingValue(INITIAL_PARAMETERS.w1) },
    { label: 'w2', value: formatTrainingValue(INITIAL_PARAMETERS.w2) },
    { label: '편향 b', value: formatTrainingValue(INITIAL_PARAMETERS.b) },
    { label: '가중합 z', value: formatTrainingValue(initialForward.z) },
    { label: '예측값', value: formatTrainingValue(initialForward.prediction) },
    { label: 'BCE Loss', value: formatTrainingValue(initialForward.loss) },
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
          label: 'BCE Loss',
          value: formatTrainingValue(trainingResult.after.loss),
        },
      ]
    : []

  return (
    <StepFrame
      {...props}
      step={5}
      intro="작은 이진 분류 뉴런에서 실제 BCE 기울기에 근거한 1회 업데이트를 실행합니다."
    >
      <SimulationBadge />
      <div className="mt-5 rounded-2xl bg-slate-100 p-5">
        <h3 className="text-lg font-black text-slate-950">고정된 작은 신경망</h3>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['입력 x1', TRAINING_EXAMPLE.x1],
            ['입력 x2', TRAINING_EXAMPLE.x2],
            ['실제 정답 y', TRAINING_EXAMPLE.y],
            ['학습률', LEARNING_RATE],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-white p-3">
              <dt className="text-sm font-bold text-slate-500">{label}</dt>
              <dd className="mt-1 font-mono text-xl font-black">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          활성화 함수는 Sigmoid, 손실함수는 BCE를 사용합니다. Lesson 05에서
          다룬 이진 교차 엔트로피 오차와 같은 계산입니다.
        </p>
      </div>

      <section className="mt-8" aria-labelledby="single-forward-title">
        <h3 id="single-forward-title" className="text-xl font-black text-slate-950">
          1. 학습 전 순전파
        </h3>
        <p className="mt-2 leading-7 text-slate-600">
          초기 가중치와 편향으로 가중합, Sigmoid 예측값과 BCE Loss를 계산하세요.
        </p>
        <div className="mt-5">
          <FlowChain
            label="초기값으로 실행하는 순전파"
            items={[
              'x1=1, x2=1',
              'w1=0.2, w2=-0.1, b=0',
              forwardRun
                ? `z=${formatTrainingValue(initialForward.z)}`
                : '가중합 z',
              'Sigmoid',
              forwardRun
                ? `예측 ${formatTrainingValue(initialForward.prediction)}`
                : '예측값',
              forwardRun
                ? `Loss ${formatTrainingValue(initialForward.loss)}`
                : 'BCE Loss',
            ]}
          />
        </div>
        <Button className="mt-5" onClick={() => setForwardRun(true)}>
          <Play size={18} aria-hidden="true" />
          순전파 실행
        </Button>
        {forwardRun && (
          <div className="mt-5">
            <MetricGrid title="학습 전 계산 결과" values={beforeValues} />
          </div>
        )}
      </section>

      <section className="mt-9" aria-labelledby="one-training-title">
        <h3 id="one-training-title" className="text-xl font-black text-slate-950">
          2. 실제 계산으로 한 번 학습
        </h3>
        <p className="mt-2 leading-7 text-slate-600">
          학생에게 미분식을 계산시키지 않지만, 버튼은 현재 예측과 정답에서 얻은
          실제 오차 정보를 이용해 가중치와 편향을 업데이트합니다.
        </p>
        <Button className="mt-5" disabled={!forwardRun} onClick={runTraining}>
          <TrendingDown size={18} aria-hidden="true" />
          1회 학습
        </Button>

        {trainingResult && (
          <>
            <div className="mt-6">
              <FlowChain
                tone="rose"
                label="Loss 확인부터 다시 순전파까지의 한 번 학습 흐름"
                items={[
                  'Loss 확인',
                  '역전파',
                  '가중치·편향 수정',
                  '다시 순전파',
                ]}
              />
            </div>
            <p className="mt-4 rounded-xl bg-rose-50 p-4 font-bold text-rose-950">
              이 업데이트에 사용된 오차 정보: {formatTrainingValue(trainingResult.error)}
            </p>
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <MetricGrid title="학습 전" values={beforeValues} />
              <MetricGrid title="1회 학습 후" values={afterValues} tone="emerald" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                '가중치가 바뀜',
                '편향이 바뀜',
                '예측값이 정답 1에 가까워짐',
                '이 예제에서 Loss가 감소함',
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
          </>
        )}
      </section>

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
  const [usedReset, setUsedReset] = useState(false)
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
    setUsedReset(true)
    setSubmitted(false)
  }

  const submit = () => {
    if (!choice || !trainedAtLeastFive) return
    setSubmitted(true)
  }

  useEffect(() => {
    if (
      trainedAtLeastFive &&
      usedReset &&
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
    usedReset,
  ])

  return (
    <StepFrame
      {...props}
      step={6}
      intro="동일한 실제 계산을 최대 10회 반복하고 Epoch에 따른 가중치, 편향, 예측값과 Loss 변화를 관찰합니다."
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
            { label: 'BCE Loss', value: formatTrainingValue(current.loss) },
          ]}
        />
      </div>

      <div className="mt-6">
        <LossHistoryGraph history={graphHistory} />
      </div>

      {comparisonHistory && comparisonHistory.length > 1 && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-100 p-4">
            <p className="text-sm font-bold text-slate-500">초기 Loss</p>
            <p className="mt-1 font-mono text-2xl font-black text-slate-950">
              {formatTrainingValue(comparisonHistory[0].loss)}
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-4">
            <p className="text-sm font-bold text-emerald-700">
              {comparisonHistory.at(-1)!.epoch}회 학습 후 Loss
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
        <div
          className={`flex items-center gap-3 rounded-xl p-4 ${
            usedReset
              ? 'bg-emerald-50 text-emerald-900'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {usedReset ? (
            <CheckCircle2 size={20} aria-hidden="true" />
          ) : (
            <Circle size={18} aria-hidden="true" />
          )}
          <span className="font-bold">처음으로 초기화 실행</span>
        </div>
      </div>

      <fieldset className="mt-8">
        <legend className="text-xl font-black leading-snug text-slate-950">
          이 학습 예제에서 학습이 진행되면서 Loss는 어떻게 되었나요?
        </legend>
        <div className="mt-4 grid gap-3">
          {[
            ['A', '대체로 감소했다.'],
            ['B', '계속 무조건 커졌다.'],
            ['C', '아무 관계가 없다.'],
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
          Loss 비교 제출
        </Button>
        {submitted && (
          <AnswerFeedback
            correct={choice === 'A'}
            explanation="이 단순한 학습 예제에서는 Loss가 감소했습니다. 실제 딥러닝에서는 데이터와 설정에 따라 Loss가 매번 일정하게 감소하지 않을 수도 있습니다."
          />
        )}
      </fieldset>

      {trainedAtLeastFive && !usedReset && (
        <p className="mt-5 rounded-xl bg-amber-50 p-4 font-bold leading-7 text-amber-950">
          반복 학습 전의 상태로 돌아가는 것도 확인해 보세요. ‘처음으로 초기화’를
          실행하면 최근 학습 그래프와 비교값은 남아 있습니다.
        </p>
      )}

      {props.isComplete && (
        <StepCompletionMessage>
          최소 5회 반복 학습과 초기화를 실행하고 초기 Loss와 마지막 Loss를 비교했습니다.
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
  learningFlowCards[6],
  learningFlowCards[2],
  learningFlowCards[8],
  learningFlowCards[4],
  learningFlowCards[1],
  learningFlowCards[7],
  learningFlowCards[5],
]

export function Lesson06Step7({
  priorStepsComplete,
  onCompletionReadyChange,
  ...props
}: Step7Props) {
  const [order, setOrder] = useState<string[]>([])
  const [orderSubmitted, setOrderSubmitted] = useState(false)
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
  const expectedOrder = learningFlowCards.map((card) => card.id)
  const orderCorrect =
    order.length === expectedOrder.length &&
    order.every((id, index) => id === expectedOrder[index])
  const allQuizSubmitted = quizSubmitted.every(Boolean)
  const completionReady =
    orderSubmitted && orderCorrect && allQuizSubmitted

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
      <section aria-labelledby="full-learning-flow-title">
        <h3
          id="full-learning-flow-title"
          className="text-xl font-black text-slate-950"
        >
          1. 딥러닝 학습 흐름 배열
        </h3>
        <p className="mt-2 leading-7 text-slate-600">
          아홉 카드를 학습이 진행되는 순서대로 선택하세요.
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
                ? '입력 데이터에서 예측과 Loss를 만들고, 역전파로 수정한 뒤 다시 학습하는 순서입니다.'
                : '입력 → 가중합 → 활성화 함수 → 예측 → 실제값과 비교 → Loss → 역전파 → 가중치·편향 수정 → 반복 순서를 다시 확인하세요.'
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
            ['경사하강법', '손실을 줄이는 방향으로 가중치와 편향을 조정'],
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
          3. 확인 문제 4개
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
                  explanation={quiz.explanation}
                />
              )}
            </fieldset>
          ))}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="final-loop-title">
        <h3 id="final-loop-title" className="text-xl font-black text-slate-950">
          4. 1~6차시 최종 연결
        </h3>
        <div className="mt-5">
          <FlowChain
            label="입력부터 Loss를 계산하는 최종 흐름"
            items={[
              '입력 x',
              '가중치 w · 편향 b',
              '가중합 z',
              '활성화 함수',
              '예측값',
              '실제값과 비교',
              '손실함수',
              'Loss',
            ]}
          />
          <ArrowDown
            className="mx-auto my-3 text-rose-600"
            size={24}
            aria-hidden="true"
          />
          <FlowChain
            tone="rose"
            label="Loss에서 역전파와 수정 후 다시 순전파하는 흐름"
            items={['Loss', '역전파', 'w · b 수정', '다시 순전파']}
          />
        </div>
        <p className="mt-4 font-bold leading-7 text-indigo-900">
          예측값은 다음 순전파에서 달라집니다. 손실함수가 현재 예측을 직접
          수정하는 것이 아닙니다.
        </p>
      </section>

      {completionReady && !props.isComplete && (
        <div
          className="mt-7 flex items-start gap-3 rounded-2xl bg-amber-50 p-5 text-amber-950"
          role="status"
        >
          <CircleHelp className="mt-0.5 shrink-0" size={21} aria-hidden="true" />
          <p className="leading-7">
            전체 학습 흐름 배열과 확인 문제 네 개 제출을 마쳤습니다.{' '}
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
