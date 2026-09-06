import {
  ArrowDown,
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  CircleHelp,
  Equal,
  Gauge,
  Lightbulb,
  RotateCcw,
  SlidersHorizontal,
  XCircle,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  calculatePerceptron,
  formatNumber,
  lesson02Objectives,
  lesson02StepTitles,
  parseStudentNumber,
  perceptronElements,
  type PerceptronValues,
} from './lesson02Data'

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
  const titleId = active ? 'lesson-step-title' : `lesson02-step-${step}-title`

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
          {lesson02StepTitles[step - 1]}
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
          {correct ? '정답입니다' : '계산 과정을 확인하고 다시 시도하세요'}
        </p>
        <p className="mt-1 leading-6">{explanation}</p>
      </div>
    </div>
  )
}

function NumericInput({
  id,
  label,
  value,
  onChange,
  describedBy,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  describedBy?: string
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={describedBy}
        className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-lg font-black tabular-nums text-slate-950 outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"
      />
    </label>
  )
}

function FlowArrow() {
  return (
    <>
      <ArrowDown className="mx-auto text-cyan-600 md:hidden" size={22} aria-hidden="true" />
      <ArrowRight className="hidden shrink-0 text-cyan-600 md:block" size={22} aria-hidden="true" />
    </>
  )
}

function FlowNode({
  eyebrow,
  title,
  detail,
  tone = 'slate',
}: {
  eyebrow: string
  title: string
  detail: string
  tone?: 'slate' | 'indigo' | 'cyan' | 'emerald'
}) {
  const tones = {
    slate: 'border-slate-200 bg-white text-slate-950',
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-950',
    cyan: 'border-cyan-200 bg-cyan-50 text-cyan-950',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-950',
  }

  return (
    <div className={`min-w-0 rounded-2xl border p-4 text-center ${tones[tone]}`}>
      <p className="text-xs font-black tracking-wider text-slate-500">{eyebrow}</p>
      <p className="mt-2 break-words text-lg font-black tabular-nums">{title}</p>
      <p className="mt-1 break-words text-sm leading-6 text-slate-600">{detail}</p>
    </div>
  )
}

function PerceptronSignalFlow({
  values,
  label = '퍼셉트론 계산 Signal Flow',
}: {
  values: PerceptronValues
  label?: string
}) {
  const result = calculatePerceptron(values)

  return (
    <div
      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5"
      aria-label={label}
    >
      <div className="grid min-w-0 items-center gap-3 md:grid-cols-[minmax(0,1.45fr)_auto_minmax(0,0.8fr)_auto_minmax(0,1.15fr)_auto_minmax(0,0.85fr)_auto_minmax(0,0.7fr)]">
        <div className="grid min-w-0 gap-3">
          <FlowNode
            eyebrow="입력값 × 가중치"
            title={`${formatNumber(values.x1)} × ${formatNumber(values.w1)} = ${formatNumber(result.product1)}`}
            detail="x1 × w1"
            tone="indigo"
          />
          <FlowNode
            eyebrow="입력값 × 가중치"
            title={`${formatNumber(values.x2)} × ${formatNumber(values.w2)} = ${formatNumber(result.product2)}`}
            detail="x2 × w2"
            tone="indigo"
          />
        </div>
        <FlowArrow />
        <FlowNode
          eyebrow="모두 더하기"
          title={formatNumber(result.productSum)}
          detail={`${formatNumber(result.product1)} + ${formatNumber(result.product2)}`}
        />
        <FlowArrow />
        <FlowNode
          eyebrow={`편향 ${formatNumber(values.b)} 더하기`}
          title={`가중합 z = ${formatNumber(result.z)}`}
          detail={`${formatNumber(result.productSum)} + (${formatNumber(values.b)})`}
          tone="cyan"
        />
        <FlowArrow />
        <FlowNode
          eyebrow="활성화 함수"
          title="계단 함수"
          detail={result.z < 0 ? 'z < 0 → 0' : 'z ≥ 0 → 1'}
        />
        <FlowArrow />
        <FlowNode
          eyebrow="최종 출력"
          title={`출력 = ${result.output}`}
          detail="활성화 함수 적용 후"
          tone="emerald"
        />
      </div>
    </div>
  )
}

export function Lesson02Step1(props: CommonStepProps) {
  const [choice, setChoice] = useState<'A' | 'B' | 'C' | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const submit = () => {
    if (!choice) return
    setSubmitted(true)
    props.onComplete()
  }

  return (
    <StepFrame
      {...props}
      step={1}
      intro="여러 신호를 받아 하나의 결과를 만드는 과정을 사람의 신경세포에 빗대어 살펴봅니다. 두 구조가 실제로 완전히 같다는 뜻은 아닙니다."
    >
      <section aria-labelledby="lesson02-goals-title">
        <h3 id="lesson02-goals-title" className="text-xl font-black text-slate-950">
          이번 차시에서 알아볼 것
        </h3>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {lesson02Objectives.map((objective, index) => (
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
          이번 차시는 입력값 2개인 단순 퍼셉트론만 다루며, 행렬·벡터·미분은 사용하지 않습니다.
        </p>
      </section>

      <section className="mt-9" aria-labelledby="neuron-flow-title">
        <h3 id="neuron-flow-title" className="text-xl font-black text-slate-950">
          여러 신호에서 하나의 판단으로
        </h3>
        <div className="mt-5 grid items-center gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <FlowNode eyebrow="사람의 신경세포 비유" title="여러 신호" detail="여러 곳에서 정보가 들어옵니다." />
          <FlowArrow />
          <FlowNode eyebrow="처리" title="신경세포" detail="신호를 종합합니다." tone="indigo" />
          <FlowArrow />
          <FlowNode eyebrow="결과" title="판단 결과" detail="하나의 결과로 이어집니다." tone="emerald" />
        </div>
        <div className="mt-5 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
          <p className="font-black text-indigo-950">
            퍼셉트론은 여러 입력을 받아 계산한 뒤 하나의 결과를 출력하는 가장 기본적인 인공 뉴런입니다.
          </p>
          <p className="mt-2 leading-7 text-slate-700">
            입력값 x1, x2 → 퍼셉트론 → 출력의 흐름으로 생각할 수 있습니다.
          </p>
        </div>
      </section>

      <fieldset className="mt-9">
        <legend className="text-xl font-black leading-snug text-slate-950">
          퍼셉트론의 기본 역할로 알맞은 것을 선택하세요.
        </legend>
        <div className="mt-4 grid gap-3">
          {[
            ['A', '여러 입력을 받아 하나의 출력을 만든다.'],
            ['B', '데이터를 인터넷에서 자동으로 다운로드한다.'],
            ['C', '이미지를 저장만 한다.'],
          ].map(([key, text]) => (
            <button
              key={key}
              type="button"
              aria-pressed={choice === key}
              onClick={() => {
                setChoice(key as 'A' | 'B' | 'C')
                setSubmitted(false)
              }}
              className={`min-h-14 rounded-xl border px-4 py-3 text-left font-semibold leading-6 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                choice === key
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-950'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300'
              }`}
            >
              {key}. {text}
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
              ? '여러 입력을 계산하여 하나의 출력을 만드는 것이 퍼셉트론의 기본 역할입니다.'
              : '정답은 A입니다. 퍼셉트론은 입력을 다운로드하거나 저장하는 도구가 아니라 여러 입력을 계산해 하나의 출력을 만듭니다.'
          }
        />
      )}

      {props.isComplete && (
        <StepCompletionMessage>퍼셉트론의 기본 역할을 선택해 제출하고 해설을 확인했습니다.</StepCompletionMessage>
      )}
    </StepFrame>
  )
}

export function Lesson02Step2(props: CommonStepProps) {
  const [viewed, setViewed] = useState<string[]>([])
  const [activeElement, setActiveElement] = useState<(typeof perceptronElements)[number] | null>(null)

  useEffect(() => {
    if (!props.isComplete && viewed.length === perceptronElements.length) {
      props.onComplete()
    }
  }, [props.isComplete, props.onComplete, viewed.length])

  const inspect = (element: (typeof perceptronElements)[number]) => {
    setActiveElement(element)
    setViewed((current) =>
      current.includes(element.id) ? current : [...current, element.id],
    )
  }

  return (
    <StepFrame
      {...props}
      step={2}
      intro="퍼셉트론 계산에 등장하는 값을 하나씩 눌러 역할을 확인합니다. 가중합과 출력은 활성화 함수를 기준으로 서로 다른 값입니다."
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-black text-slate-950">퍼셉트론 Signal Flow</h3>
        <span className="text-sm font-bold tabular-nums text-indigo-700">
          {viewed.length} / {perceptronElements.length} 확인
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {perceptronElements.map((element) => {
          const isViewed = viewed.includes(element.id)
          const isActive = activeElement?.id === element.id
          return (
            <button
              key={element.id}
              type="button"
              onClick={() => inspect(element)}
              aria-pressed={isActive}
              className={`min-h-28 rounded-2xl border p-4 text-left focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                isActive
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 bg-white hover:border-indigo-300'
              }`}
            >
              <span className="flex items-start justify-between gap-3">
                <span>
                  <span className="block font-black text-slate-950">{element.label}</span>
                  <span className="mt-1 block text-sm font-bold text-indigo-700">{element.symbol}</span>
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
        {activeElement ? (
          <>
            <p className="font-black text-indigo-800">
              {activeElement.label} <span className="text-sm">({activeElement.symbol})</span>
            </p>
            <p className="mt-2 leading-7 text-slate-700">{activeElement.description}</p>
          </>
        ) : (
          <p className="leading-7 text-slate-600">여섯 요소를 눌러 각각의 설명을 확인하세요.</p>
        )}
      </div>

      <div className="mt-7">
        <PerceptronSignalFlow values={{ x1: 4, x2: 5, w1: 1, w2: 1, b: -10 }} />
      </div>

      {props.isComplete && (
        <StepCompletionMessage>입력값부터 출력까지 여섯 구성 요소의 역할을 모두 확인했습니다.</StepCompletionMessage>
      )}
    </StepFrame>
  )
}

const step3Targets = [4, 5, 9] as const

export function Lesson02Step3(props: CommonStepProps) {
  const [answers, setAnswers] = useState(['', '', ''])
  const [submitted, setSubmitted] = useState([false, false, false])
  const correct = answers.map((answer, index) => parseStudentNumber(answer) === step3Targets[index])

  useEffect(() => {
    if (!props.isComplete && submitted.every(Boolean) && correct.every(Boolean)) {
      props.onComplete()
    }
  }, [correct, props, submitted])

  const changeAnswer = (index: number, value: string) => {
    setAnswers((current) => current.map((answer, item) => (item === index ? value : answer)))
    setSubmitted((current) => current.map((value, item) => (item === index ? false : value)))
  }

  const submitAnswer = (index: number) => {
    if (parseStudentNumber(answers[index]) === null) return
    setSubmitted((current) => current.map((value, item) => (item === index ? true : value)))
  }

  const activities = [
    { label: '첫 번째 곱셈 결과', equation: '4 × 1 = ?', explanation: '입력값 4에 가중치 1을 곱하면 4입니다.' },
    { label: '두 번째 곱셈 결과', equation: '5 × 1 = ?', explanation: '입력값 5에 가중치 1을 곱하면 5입니다.' },
    { label: '두 결과의 합', equation: '4 + 5 = ?', explanation: '두 곱셈 결과 4와 5를 더하면 9입니다.' },
  ]

  return (
    <StepFrame
      {...props}
      step={3}
      intro="편향은 잠시 제외하고, 입력값에 가중치를 곱한 뒤 두 결과를 더해 봅니다."
    >
      <div className="rounded-2xl bg-indigo-50 p-5">
        <p className="font-black text-indigo-950">주어진 값</p>
        <p className="mt-2 break-words text-lg font-black tabular-nums text-slate-900">
          x1 = 4, x2 = 5, w1 = 1, w2 = 1
        </p>
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-3">
        {activities.map((activity, index) => (
          <section key={activity.label} className="rounded-2xl border border-slate-200 p-5">
            <p className="text-sm font-black text-indigo-700">계산 {index + 1}</p>
            <p className="mt-2 text-2xl font-black tabular-nums text-slate-950">{activity.equation}</p>
            <div className="mt-5">
              <NumericInput
                id={`step3-answer-${index}`}
                label={activity.label}
                value={answers[index]}
                onChange={(value) => changeAnswer(index, value)}
              />
            </div>
            <Button
              className="mt-4 w-full"
              onClick={() => submitAnswer(index)}
              disabled={parseStudentNumber(answers[index]) === null}
            >
              계산 확인
            </Button>
            {submitted[index] && (
              <AnswerFeedback correct={correct[index]} explanation={activity.explanation} />
            )}
          </section>
        ))}
      </div>

      <div className="mt-7 flex items-start gap-3 rounded-2xl bg-cyan-50 p-5">
        <Lightbulb className="mt-0.5 shrink-0 text-cyan-700" size={22} aria-hidden="true" />
        <p className="font-semibold leading-7 text-slate-800">
          가중치는 각 입력에 곱해져 입력이 결과에 미치는 정도를 조절합니다.
        </p>
      </div>

      {props.isComplete && (
        <StepCompletionMessage>두 곱셈과 덧셈, 세 계산의 정답을 모두 확인했습니다.</StepCompletionMessage>
      )}
    </StepFrame>
  )
}

export function Lesson02Step4(props: CommonStepProps) {
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const correct = parseStudentNumber(answer) === -1

  const submit = () => {
    if (parseStudentNumber(answer) === null) return
    setSubmitted(true)
    if (correct) props.onComplete()
  }

  return (
    <StepFrame
      {...props}
      step={4}
      intro="두 곱셈 결과의 합 9에 편향 -10을 더해 활성화 함수 적용 전 값인 가중합을 구합니다."
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.75fr)]">
        <section className="rounded-2xl border border-slate-200 p-5 sm:p-6">
          <p className="text-sm font-black text-indigo-700">편향까지 포함한 계산</p>
          <div className="mt-4 space-y-2 text-lg font-black tabular-nums text-slate-950 sm:text-xl">
            <p>(4 × 1) + (5 × 1) - 10</p>
            <p>= 4 + 5 - 10</p>
            <p>= 9 + (-10)</p>
          </div>
          <div className="mt-5 max-w-sm">
            <NumericInput
              id="step4-answer"
              label="가중합 z를 입력하세요"
              value={answer}
              onChange={(value) => {
                setAnswer(value)
                setSubmitted(false)
              }}
            />
          </div>
          <Button
            className="mt-4"
            onClick={submit}
            disabled={parseStudentNumber(answer) === null}
          >
            가중합 확인
          </Button>
          {submitted && (
            <AnswerFeedback
              correct={correct}
              explanation="4 + 5 = 9이고, 여기에 편향 -10을 더하면 9 + (-10) = -1이므로 가중합 z = -1입니다."
            />
          )}
        </section>

        <aside className="rounded-2xl bg-cyan-50 p-5 sm:p-6" aria-label="가중합 식 설명">
          <Equal className="text-cyan-700" size={28} aria-hidden="true" />
          <h3 className="mt-4 text-xl font-black text-cyan-950">가중합</h3>
          <p className="mt-3 leading-7 text-slate-700">
            입력값과 가중치의 계산 결과에 편향을 더한 값을 가중합이라고 합니다.
          </p>
          <p className="mt-4 rounded-xl bg-white p-4 font-black tabular-nums text-slate-950">
            z = x1 × w1 + x2 × w2 + b
          </p>
        </aside>
      </div>

      <div className="mt-7">
        <PerceptronSignalFlow values={{ x1: 4, x2: 5, w1: 1, w2: 1, b: -10 }} />
      </div>

      {props.isComplete && (
        <StepCompletionMessage>편향을 포함해 가중합 z = -1을 직접 계산했습니다.</StepCompletionMessage>
      )}
    </StepFrame>
  )
}

export function Lesson02Step5(props: CommonStepProps) {
  const [firstOutput, setFirstOutput] = useState<0 | 1 | null>(null)
  const [firstSubmitted, setFirstSubmitted] = useState(false)
  const [secondZ, setSecondZ] = useState('')
  const [secondOutput, setSecondOutput] = useState<0 | 1 | null>(null)
  const [secondSubmitted, setSecondSubmitted] = useState(false)

  useEffect(() => {
    if (!props.isComplete && firstSubmitted && secondSubmitted) {
      props.onComplete()
    }
  }, [firstSubmitted, props, secondSubmitted])

  const secondCorrect = parseStudentNumber(secondZ) === 4 && secondOutput === 1

  return (
    <StepFrame
      {...props}
      step={5}
      intro="가중합을 계단 함수에 넣어 최종 출력 0 또는 1로 바꿉니다. 가중합은 함수 적용 전 값이고, 출력은 적용 후 값입니다."
    >
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
        <p className="font-black text-indigo-950">계단 함수</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <p className="rounded-xl bg-white p-4 font-black tabular-nums text-slate-900">z &lt; 0이면 출력 0</p>
          <p className="rounded-xl bg-white p-4 font-black tabular-nums text-slate-900">z ≥ 0이면 출력 1</p>
        </div>
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <fieldset className="rounded-2xl border border-slate-200 p-5 sm:p-6">
          <legend className="px-1 text-lg font-black text-slate-950">예제 1</legend>
          <p className="mt-2 leading-7 text-slate-700">
            x1 = 4, x2 = 5, w1 = 1, w2 = 1, b = -10
          </p>
          <p className="mt-3 font-black tabular-nums text-slate-950">
            (4 × 1) + (5 × 1) - 10 = -1
          </p>
          <p className="mt-5 font-bold text-slate-800">가중합 z = -1일 때 출력은?</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {([0, 1] as const).map((value) => (
              <Button
                key={value}
                variant={firstOutput === value ? 'primary' : 'secondary'}
                aria-pressed={firstOutput === value}
                onClick={() => {
                  setFirstOutput(value)
                  setFirstSubmitted(false)
                }}
              >
                출력 {value}
              </Button>
            ))}
          </div>
          <Button
            className="mt-4 w-full"
            onClick={() => setFirstSubmitted(true)}
            disabled={firstOutput === null}
          >
            예제 1 확인
          </Button>
          {firstSubmitted && (
            <AnswerFeedback
              correct={firstOutput === 0}
              explanation="가중합 z = -1은 0보다 작으므로 계단 함수 적용 후 최종 출력은 0입니다."
            />
          )}
        </fieldset>

        <fieldset className="rounded-2xl border border-slate-200 p-5 sm:p-6">
          <legend className="px-1 text-lg font-black text-slate-950">예제 2</legend>
          <p className="mt-2 leading-7 text-slate-700">
            x1 = 8, x2 = 6, w1 = 1, w2 = 1, b = -10
          </p>
          <p className="mt-3 font-black tabular-nums text-slate-950">
            (8 × 1) + (6 × 1) - 10 = ?
          </p>
          <div className="mt-5">
            <NumericInput
              id="step5-second-z"
              label="가중합 z"
              value={secondZ}
              onChange={(value) => {
                setSecondZ(value)
                setSecondSubmitted(false)
              }}
            />
          </div>
          <p className="mt-5 font-bold text-slate-800">계단 함수 적용 후 출력은?</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {([0, 1] as const).map((value) => (
              <Button
                key={value}
                variant={secondOutput === value ? 'primary' : 'secondary'}
                aria-pressed={secondOutput === value}
                onClick={() => {
                  setSecondOutput(value)
                  setSecondSubmitted(false)
                }}
              >
                출력 {value}
              </Button>
            ))}
          </div>
          <Button
            className="mt-4 w-full"
            onClick={() => setSecondSubmitted(true)}
            disabled={parseStudentNumber(secondZ) === null || secondOutput === null}
          >
            예제 2 확인
          </Button>
          {secondSubmitted && (
            <AnswerFeedback
              correct={secondCorrect}
              explanation="8 × 1 = 8, 6 × 1 = 6이므로 가중합 z = 8 + 6 - 10 = 4입니다. 4 ≥ 0이므로 최종 출력은 1입니다."
            />
          )}
        </fieldset>
      </div>

      <section className="mt-7" aria-labelledby="example-compare-title">
        <h3 id="example-compare-title" className="text-xl font-black text-slate-950">두 예제 비교</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-100 p-5">
            <p className="text-sm font-black text-slate-600">예제 A</p>
            <p className="mt-2 text-xl font-black tabular-nums text-slate-950">가중합 -1 → 출력 0</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-5">
            <p className="text-sm font-black text-emerald-800">예제 B</p>
            <p className="mt-2 text-xl font-black tabular-nums text-slate-950">가중합 4 → 출력 1</p>
          </div>
        </div>
        <p className="mt-5 flex items-start gap-3 rounded-2xl bg-cyan-50 p-5 font-semibold leading-7 text-slate-800">
          <Lightbulb className="mt-0.5 shrink-0 text-cyan-700" size={22} aria-hidden="true" />
          퍼셉트론은 가중합을 계산한 뒤 활성화 함수를 이용하여 최종 출력을 만듭니다. 이번 차시에서는 계단 함수만 사용합니다.
        </p>
      </section>

      {props.isComplete && (
        <StepCompletionMessage>두 예제의 가중합과 계단 함수 출력을 제출하고 확인했습니다.</StepCompletionMessage>
      )}
    </StepFrame>
  )
}

type SliderKey = keyof PerceptronValues

const sliderSettings: Array<{
  key: SliderKey
  label: string
  min: number
  max: number
  step: number
}> = [
  { key: 'x1', label: '입력값 x1', min: 0, max: 10, step: 1 },
  { key: 'x2', label: '입력값 x2', min: 0, max: 10, step: 1 },
  { key: 'w1', label: '가중치 w1', min: -2, max: 2, step: 0.5 },
  { key: 'w2', label: '가중치 w2', min: -2, max: 2, step: 0.5 },
  { key: 'b', label: '편향 b', min: -10, max: 10, step: 1 },
]

export function Lesson02Step6(props: CommonStepProps) {
  const [values, setValues] = useState<PerceptronValues>({ x1: 2, x2: 3, w1: 1, w2: 1, b: -4 })
  const [observations, setObservations] = useState<string[]>([])
  const [seenOutputs, setSeenOutputs] = useState<Array<0 | 1>>([])
  const [notice, setNotice] = useState('값을 바꾸면 계산 결과가 즉시 갱신됩니다.')
  const result = useMemo(() => calculatePerceptron(values), [values])

  useEffect(() => {
    if (
      !props.isComplete &&
      observations.length >= 3 &&
      seenOutputs.includes(0) &&
      seenOutputs.includes(1)
    ) {
      props.onComplete()
    }
  }, [observations.length, props, seenOutputs])

  const configurationKey = sliderSettings.map(({ key }) => `${key}:${values[key]}`).join('|')

  const recordObservation = () => {
    if (observations.includes(configurationKey)) {
      setNotice('이미 기록한 설정입니다. 입력값, 가중치 또는 편향을 바꿔 새 설정을 관찰하세요.')
      return
    }
    setObservations((current) => [...current, configurationKey])
    setSeenOutputs((current) =>
      current.includes(result.output) ? current : [...current, result.output],
    )
    setNotice(`설정 ${observations.length + 1}을 기록했습니다. 이번 출력은 ${result.output}입니다.`)
  }

  const resetExperiment = () => {
    setValues({ x1: 2, x2: 3, w1: 1, w2: 1, b: -4 })
    setObservations([])
    setSeenOutputs([])
    setNotice('실험 기록을 초기화했습니다. 기본값부터 다시 관찰해 보세요.')
  }

  return (
    <StepFrame
      {...props}
      step={6}
      intro="입력값, 가중치와 편향을 조절하며 각 곱셈, 가중합, 계단 함수 판단과 출력이 어떻게 달라지는지 실험합니다."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(17rem,0.72fr)_minmax(0,1.45fr)]">
        <section className="rounded-2xl border border-slate-200 p-5" aria-labelledby="slider-title">
          <div className="flex items-center justify-between gap-3">
            <h3 id="slider-title" className="text-xl font-black text-slate-950">값 조절하기</h3>
            <SlidersHorizontal className="text-indigo-600" size={24} aria-hidden="true" />
          </div>
          <div className="mt-6 space-y-6">
            {sliderSettings.map((setting) => (
              <label key={setting.key} className="block">
                <span className="flex items-center justify-between gap-3 text-sm font-bold text-slate-700">
                  <span>{setting.label}</span>
                  <output className="min-w-12 rounded-lg bg-indigo-50 px-2 py-1 text-center font-black tabular-nums text-indigo-800">
                    {formatNumber(values[setting.key])}
                  </output>
                </span>
                <input
                  type="range"
                  min={setting.min}
                  max={setting.max}
                  step={setting.step}
                  value={values[setting.key]}
                  onChange={(event) => {
                    const next = Number(event.target.value)
                    setValues((current) => ({ ...current, [setting.key]: next }))
                    setNotice('값이 바뀌었습니다. 계산을 살펴본 뒤 이 설정을 기록하세요.')
                  }}
                  className="mt-3 min-h-11 w-full cursor-pointer accent-indigo-600"
                />
                <span className="flex justify-between text-xs font-semibold tabular-nums text-slate-500">
                  <span>{setting.min}</span>
                  <span>{setting.max}</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section aria-labelledby="live-result-title">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 id="live-result-title" className="text-xl font-black text-slate-950">실시간 계산 결과</h3>
            <span
              className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 font-black ${
                result.output === 1
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'bg-slate-200 text-slate-900'
              }`}
              aria-live="polite"
            >
              <Gauge size={20} aria-hidden="true" />
              출력 {result.output}
            </span>
          </div>
          <div className="mt-5">
            <PerceptronSignalFlow values={values} label="조절 중인 퍼셉트론의 실시간 계산 흐름" />
          </div>
          <div className="mt-5 rounded-2xl bg-slate-900 p-5 text-white" aria-live="polite">
            <p className="break-words font-black tabular-nums">
              ({formatNumber(values.x1)} × {formatNumber(values.w1)}) + ({formatNumber(values.x2)} × {formatNumber(values.w2)}) + ({formatNumber(values.b)})
            </p>
            <p className="mt-2 break-words leading-7 text-slate-200">
              = {formatNumber(result.product1)} + {formatNumber(result.product2)} + ({formatNumber(values.b)}) = 가중합 z {formatNumber(result.z)}
            </p>
            <p className="mt-2 font-bold text-cyan-300">
              {result.z < 0 ? `${formatNumber(result.z)} < 0` : `${formatNumber(result.z)} ≥ 0`} → 계단 함수 → 출력 {result.output}
            </p>
          </div>
        </section>
      </div>

      <section className="mt-7 rounded-2xl border border-indigo-200 bg-indigo-50 p-5" aria-labelledby="observation-title">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 id="observation-title" className="font-black text-indigo-950">실험 관찰 기록</h3>
            <p className="mt-1 text-sm leading-6 text-slate-700" aria-live="polite">{notice}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={resetExperiment}>
              <RotateCcw size={18} aria-hidden="true" />
              기록 초기화
            </Button>
            <Button onClick={recordObservation}>이 설정 관찰하기</Button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-4">
            <p className="text-sm font-bold text-slate-600">서로 다른 설정</p>
            <p className="mt-1 text-xl font-black tabular-nums text-slate-950">{observations.length} / 3</p>
          </div>
          <div className={`rounded-xl p-4 ${seenOutputs.includes(0) ? 'bg-emerald-100' : 'bg-white'}`}>
            <p className="text-sm font-bold text-slate-600">출력 0 관찰</p>
            <p className="mt-1 font-black text-slate-950">{seenOutputs.includes(0) ? '완료' : '아직'}</p>
          </div>
          <div className={`rounded-xl p-4 ${seenOutputs.includes(1) ? 'bg-emerald-100' : 'bg-white'}`}>
            <p className="text-sm font-bold text-slate-600">출력 1 관찰</p>
            <p className="mt-1 font-black text-slate-950">{seenOutputs.includes(1) ? '완료' : '아직'}</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          선택한 값 자체에는 정답이나 오답이 없습니다. 같은 입력에서도 가중치와 편향에 따라 결과가 달라지는지 관찰하세요.
        </p>
      </section>

      {props.isComplete && (
        <StepCompletionMessage>서로 다른 설정을 세 번 이상 실험하고 출력 0과 1을 모두 관찰했습니다.</StepCompletionMessage>
      )}
    </StepFrame>
  )
}

interface Step7Props extends CommonStepProps {
  priorStepsComplete: boolean
  onCompletionReadyChange: (ready: boolean) => void
}

const finalCalculation = [
  { label: '① 첫 번째 곱셈', equation: '3 × 2 = ?', target: 6, explanation: '입력값 3에 가중치 2를 곱하면 6입니다.' },
  { label: '② 두 번째 곱셈', equation: '4 × (-1) = ?', target: -4, explanation: '입력값 4에 가중치 -1을 곱하면 -4입니다.' },
  { label: '③ 가중합', equation: '6 + (-4) + (-1) = ?', target: 1, explanation: '두 곱셈 결과를 더하고 편향 -1을 더하면 가중합 z = 1입니다.' },
  { label: '④ 최종 출력', equation: 'z = 1일 때 계단 함수 출력은?', target: 1, explanation: '가중합 1은 0 이상이므로 계단 함수 적용 후 최종 출력은 1입니다.' },
] as const

export function Lesson02Step7({
  priorStepsComplete,
  onCompletionReadyChange,
  ...props
}: Step7Props) {
  const [calcAnswers, setCalcAnswers] = useState(['', '', '', ''])
  const [calcSubmitted, setCalcSubmitted] = useState([false, false, false, false])
  const [quizAnswers, setQuizAnswers] = useState<Array<'A' | 'B' | 'C' | 'D' | '0' | '1' | null>>([null, null, null])
  const [quizSubmitted, setQuizSubmitted] = useState([false, false, false])

  const allSubmitted = calcSubmitted.every(Boolean) && quizSubmitted.every(Boolean)

  useEffect(() => {
    onCompletionReadyChange(allSubmitted)
  }, [allSubmitted, onCompletionReadyChange])

  const changeCalc = (index: number, value: string) => {
    setCalcAnswers((current) => current.map((answer, item) => (item === index ? value : answer)))
    setCalcSubmitted((current) => current.map((submitted, item) => (item === index ? false : submitted)))
  }

  const submitCalc = (index: number) => {
    if (parseStudentNumber(calcAnswers[index]) === null) return
    setCalcSubmitted((current) => current.map((submitted, item) => (item === index ? true : submitted)))
  }

  const chooseQuiz = (index: number, answer: 'A' | 'B' | 'C' | 'D' | '0' | '1') => {
    setQuizAnswers((current) => current.map((value, item) => (item === index ? answer : value)))
    setQuizSubmitted((current) => current.map((submitted, item) => (item === index ? false : submitted)))
  }

  const submitQuiz = (index: number) => {
    if (!quizAnswers[index]) return
    setQuizSubmitted((current) => current.map((submitted, item) => (item === index ? true : submitted)))
  }

  return (
    <StepFrame
      {...props}
      step={7}
      intro="입력값×가중치부터 계단 함수 출력까지 한 번에 완성하고, 세 확인 문제로 각 값의 역할을 정리합니다."
    >
      <section aria-labelledby="final-calc-title">
        <h3 id="final-calc-title" className="text-xl font-black text-slate-950">종합 계산 문제</h3>
        <p className="mt-2 leading-7 text-slate-600">
          x1 = 3, x2 = 4, w1 = 2, w2 = -1, b = -1
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {finalCalculation.map((item, index) => {
            const correct = parseStudentNumber(calcAnswers[index]) === item.target
            return (
              <div key={item.label} className="rounded-2xl border border-slate-200 p-5">
                <p className="font-black text-indigo-700">{item.label}</p>
                <p className="mt-2 text-xl font-black tabular-nums text-slate-950">{item.equation}</p>
                <div className="mt-4">
                  <NumericInput
                    id={`step7-calc-${index}`}
                    label={index === 3 ? '출력 입력' : '계산 결과 입력'}
                    value={calcAnswers[index]}
                    onChange={(value) => changeCalc(index, value)}
                  />
                </div>
                <Button
                  className="mt-4 w-full"
                  onClick={() => submitCalc(index)}
                  disabled={parseStudentNumber(calcAnswers[index]) === null}
                >
                  계산 제출
                </Button>
                {calcSubmitted[index] && (
                  <AnswerFeedback correct={correct} explanation={item.explanation} />
                )}
              </div>
            )
          })}
        </div>
      </section>

      <div className="mt-7">
        <PerceptronSignalFlow values={{ x1: 3, x2: 4, w1: 2, w2: -1, b: -1 }} label="종합 문제의 퍼셉트론 계산 흐름" />
      </div>

      <section className="mt-10" aria-labelledby="lesson02-quiz-title">
        <h3 id="lesson02-quiz-title" className="text-xl font-black text-slate-950">확인 문제 3개</h3>
        <p className="mt-2 leading-7 text-slate-600">틀렸다면 계산 과정과 해설을 확인한 뒤 답을 바꾸어 다시 제출할 수 있습니다.</p>

        <div className="mt-5 space-y-6">
          <fieldset className="rounded-2xl border border-slate-200 p-5 sm:p-6">
            <legend className="px-1 text-lg font-black leading-7 text-slate-950">
              문제 1. 퍼셉트론에서 가중치의 역할로 가장 적절한 것은?
            </legend>
            <div className="mt-4 grid gap-3">
              {[
                ['A', '입력의 중요도를 조절한다.'],
                ['B', '데이터를 저장한다.'],
                ['C', '인터넷 속도를 조절한다.'],
                ['D', '출력값을 삭제한다.'],
              ].map(([key, text]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={quizAnswers[0] === key}
                  onClick={() => chooseQuiz(0, key as 'A' | 'B' | 'C' | 'D')}
                  className={`min-h-14 rounded-xl border px-4 py-3 text-left font-semibold leading-6 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                    quizAnswers[0] === key
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-950'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300'
                  }`}
                >
                  {key}. {text}
                </button>
              ))}
            </div>
            <Button className="mt-4" onClick={() => submitQuiz(0)} disabled={!quizAnswers[0]}>
              문제 1 제출
            </Button>
            {quizSubmitted[0] && (
              <AnswerFeedback
                correct={quizAnswers[0] === 'A'}
                explanation="정답은 A입니다. 가중치는 각 입력이 계산 결과에 얼마나 중요하게 반영될지 조절합니다."
              />
            )}
          </fieldset>

          <fieldset className="rounded-2xl border border-slate-200 p-5 sm:p-6">
            <legend className="px-1 text-lg font-black leading-7 text-slate-950">
              문제 2. 편향의 역할로 가장 적절한 것은?
            </legend>
            <div className="mt-4 grid gap-3">
              {[
                ['A', '입력값의 단위를 바꾼다.'],
                ['B', '전체 판단 기준을 조정한다.'],
                ['C', '입력 개수를 늘린다.'],
                ['D', '데이터 파일을 저장한다.'],
              ].map(([key, text]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={quizAnswers[1] === key}
                  onClick={() => chooseQuiz(1, key as 'A' | 'B' | 'C' | 'D')}
                  className={`min-h-14 rounded-xl border px-4 py-3 text-left font-semibold leading-6 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                    quizAnswers[1] === key
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-950'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300'
                  }`}
                >
                  {key}. {text}
                </button>
              ))}
            </div>
            <Button className="mt-4" onClick={() => submitQuiz(1)} disabled={!quizAnswers[1]}>
              문제 2 제출
            </Button>
            {quizSubmitted[1] && (
              <AnswerFeedback
                correct={quizAnswers[1] === 'B'}
                explanation="정답은 B입니다. 편향은 입력과 가중치의 계산에 더해져 전체 판단 기준을 조정합니다."
              />
            )}
          </fieldset>

          <fieldset className="rounded-2xl border border-slate-200 p-5 sm:p-6">
            <legend className="px-1 text-lg font-black leading-7 text-slate-950">
              문제 3. x1 = 2, x2 = 1, w1 = 2, w2 = 1, b = -4일 때 출력은?
            </legend>
            <p className="mt-3 rounded-xl bg-slate-100 p-4 font-bold tabular-nums text-slate-800">
              가중합 z = 2 × 2 + 1 × 1 - 4 = 1
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {(['0', '1'] as const).map((answer) => (
                <Button
                  key={answer}
                  variant={quizAnswers[2] === answer ? 'primary' : 'secondary'}
                  aria-pressed={quizAnswers[2] === answer}
                  onClick={() => chooseQuiz(2, answer)}
                >
                  출력 {answer}
                </Button>
              ))}
            </div>
            <Button className="mt-4" onClick={() => submitQuiz(2)} disabled={!quizAnswers[2]}>
              문제 3 제출
            </Button>
            {quizSubmitted[2] && (
              <AnswerFeedback
                correct={quizAnswers[2] === '1'}
                explanation="가중합 z = 1이고 1 ≥ 0이므로 계단 함수 적용 후 최종 출력은 1입니다."
              />
            )}
          </fieldset>
        </div>
      </section>

      {allSubmitted && !props.isComplete && (
        <div className="mt-7 flex items-start gap-3 rounded-2xl bg-amber-50 p-5 text-amber-950" role="status">
          <CircleHelp className="mt-0.5 shrink-0" size={21} aria-hidden="true" />
          <p className="leading-7">
            종합 계산과 세 확인 문제를 모두 제출했습니다. {priorStepsComplete
              ? '화면 아래의 완료 버튼으로 Lesson 02를 완료하세요.'
              : '완료되지 않은 앞 STEP의 핵심 활동을 마치면 완료 버튼이 활성화됩니다.'}
          </p>
        </div>
      )}

      {props.isComplete && (
        <div className="mt-8 border-t border-emerald-200 pt-7">
          <div className="flex items-start gap-3 text-emerald-900" role="status">
            <CheckCircle2 className="mt-0.5 shrink-0" size={24} aria-hidden="true" />
            <div>
              <h3 className="text-xl font-black">Lesson 02 완료</h3>
              <p className="mt-2 leading-7">홈의 전체 진행도에 이 차시 완료가 반영되었습니다.</p>
            </div>
          </div>
          <div className="mt-7 rounded-2xl bg-indigo-50 p-5">
            <p className="font-black text-indigo-900">Lesson 03으로 이어지는 질문</p>
            <p className="mt-2 text-lg font-bold leading-7 text-slate-900">
              지금은 계단 함수만 사용했습니다. 같은 가중합에 다른 활성화 함수를 사용하면 출력은 어떻게 달라질까요?
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:border-indigo-300 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Home에서 진행도 보기
              </Link>
              <Link
                to="/lesson/03"
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
