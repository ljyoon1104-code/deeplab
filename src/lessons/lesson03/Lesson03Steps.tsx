import {
  ArrowDown,
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  CircleHelp,
  Eye,
  Lightbulb,
  Link2,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  XCircle,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ActivationGraph } from './ActivationGraph'
import {
  percentagesThatSumTo100,
  relu,
  sigmoid,
  softmax,
  stepActivation,
} from './activationMath'
import {
  lesson03Objectives,
  lesson03Quiz,
  lesson03StepTitles,
  stepExamples,
  usageFunctions,
  usageTargets,
  type UsageTarget,
} from './lesson03Data'

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
  const titleId = active ? 'lesson-step-title' : `lesson03-step-${step}-title`

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
          {lesson03StepTitles[step - 1]}
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
          {correct ? '정답입니다' : '이유를 확인하고 다시 시도하세요'}
        </p>
        <p className="mt-1 leading-6">{explanation}</p>
      </div>
    </div>
  )
}

function FlowArrow() {
  return (
    <>
      <ArrowDown className="mx-auto text-cyan-600 md:hidden" size={21} aria-hidden="true" />
      <ArrowRight className="hidden shrink-0 text-cyan-600 md:block" size={21} aria-hidden="true" />
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
    slate: 'border-slate-200 bg-white',
    indigo: 'border-indigo-200 bg-indigo-50',
    cyan: 'border-cyan-200 bg-cyan-50',
    emerald: 'border-emerald-200 bg-emerald-50',
  }

  return (
    <div className={`min-w-0 rounded-2xl border p-4 text-center ${tones[tone]}`}>
      <p className="text-xs font-black tracking-wider text-slate-500">{eyebrow}</p>
      <p className="mt-2 break-words text-lg font-black text-slate-950">{title}</p>
      <p className="mt-1 break-words text-sm leading-6 text-slate-600">{detail}</p>
    </div>
  )
}

type Zone = 'negative' | 'zero' | 'positive'

const getZone = (z: number): Zone => {
  if (z < 0) return 'negative'
  if (z > 0) return 'positive'
  return 'zero'
}

const zoneLabels: Record<Zone, string> = {
  negative: '음수 z',
  zero: 'z = 0',
  positive: '양수 z',
}

function ZoneProgress({ zones }: { zones: readonly Zone[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3" aria-label="가중합 영역 확인 상태">
      {(['negative', 'zero', 'positive'] as const).map((zone) => {
        const complete = zones.includes(zone)
        return (
          <div
            key={zone}
            className={`flex min-h-14 items-center gap-2 rounded-xl px-4 font-bold ${
              complete ? 'bg-emerald-100 text-emerald-900' : 'bg-white text-slate-600 ring-1 ring-slate-200'
            }`}
          >
            {complete ? (
              <CheckCircle2 size={19} aria-label="확인 완료" />
            ) : (
              <Circle size={17} aria-label="확인 전" />
            )}
            {zoneLabels[zone]}
          </div>
        )
      })}
    </div>
  )
}

function RangeControl({
  id,
  label,
  value,
  min = -5,
  max = 5,
  step = 1,
  onChange,
}: {
  id: string
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="flex items-center justify-between gap-3 font-bold text-slate-800">
        <span>{label}</span>
        <output className="min-w-14 rounded-lg bg-indigo-100 px-3 py-1.5 text-center text-lg font-black tabular-nums text-indigo-900">
          {value}
        </output>
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 min-h-11 w-full cursor-pointer accent-indigo-600"
      />
      <span className="flex justify-between text-xs font-bold tabular-nums text-slate-500">
        <span>{min}</span>
        <span>{max}</span>
      </span>
    </label>
  )
}

function PresetButtons({
  values,
  current,
  onSelect,
}: {
  values: readonly number[]
  current: number
  onSelect: (value: number) => void
}) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="가중합 빠른 선택">
      {values.map((value) => (
        <Button
          key={value}
          variant={current === value ? 'primary' : 'secondary'}
          aria-pressed={current === value}
          onClick={() => onSelect(value)}
        >
          z = {value}
        </Button>
      ))}
    </div>
  )
}

function LayerLocation({ focus }: { focus: 'hidden' | 'output' }) {
  return <figure className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
    <figcaption className="font-black">함수는 신경망의 어디에서 쓰일까요?</figcaption>
    <svg viewBox="0 0 300 190" className="mx-auto mt-3 w-full max-w-sm" role="img" aria-label="입력층, 은닉층, 출력층의 위치. 입력층은 데이터를 전달하고 은닉층과 출력층은 처리합니다.">
      {[15,115,215].map((x, i) => <rect key={x} x={x} y="5" width="70" height="180" rx="12" fill={(focus === 'hidden' && i === 1) || (focus === 'output' && i === 2) ? '#c7d2fe' : 'white'} stroke="#4338ca" strokeWidth={(focus === 'hidden' && i === 1) || (focus === 'output' && i === 2) ? 3 : 1} />)}
      {[65,130].flatMap((from) => [65,130].map((to) => <line key={from + '-' + to} x1="50" y1={from} x2="150" y2={to} stroke="#94a3b8" strokeWidth="2" />))}
      {[65,130].map((from) => <line key={from} x1="150" y1={from} x2="250" y2="98" stroke="#94a3b8" strokeWidth="2" />)}
      {[50,150].flatMap((x) => [65,130].map((y) => <circle key={x + '-' + y} cx={x} cy={y} r="14" fill={x === 50 ? '#cffafe' : '#e0e7ff'} stroke="#4338ca" strokeWidth="2" />))}
      <circle cx="250" cy="98" r="17" fill="#d1fae5" stroke="#047857" strokeWidth="2" />
      {['입력층','은닉층','출력층'].map((name,i) => <text key={name} x={50 + i * 100} y="29" textAnchor="middle" fontSize="14" fontWeight="bold">{name}</text>)}
      <text x={focus === 'hidden' ? 150 : 250} y="170" textAnchor="middle" fontSize="13" fontWeight="bold">{focus === 'hidden' ? '렐루' : '시그모이드'}</text>
    </svg>
    <dl className="mt-3 grid gap-2 text-sm leading-6 sm:grid-cols-3">
      <div><dt className="font-black">입력층</dt><dd>외부 데이터를 받아 전달합니다.</dd></div>
      <div><dt className="font-black">은닉층</dt><dd>입력층과 출력층 사이에서 정보를 처리합니다.</dd></div>
      <div><dt className="font-black">출력층</dt><dd>최종 결과를 내보냅니다.</dd></div>
    </dl>
    <p className="mt-3 leading-7">{focus === 'hidden' ? '렐루는 은닉층에서 자주 사용됩니다.' : '이진 분류에서는 출력층 뉴런 하나에 시그모이드를 사용해 1로 표시한 클래스의 예측 확률을 나타낼 수 있습니다.'} 자세한 층 구조는 Lesson 04에서 배웁니다.</p>
  </figure>
}

export function Lesson03Step1(props: CommonStepProps) {
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
      intro="Lesson 02의 퍼셉트론 계산에서 가중합 z 다음에 무엇이 있어야 최종 출력으로 이어지는지 찾아봅니다."
    >
      <section aria-labelledby="lesson03-goals-title">
        <h3 id="lesson03-goals-title" className="text-xl font-black text-slate-950">이번 차시에서 알아볼 것</h3>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {lesson03Objectives.map((objective, index) => (
            <li key={objective} className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 leading-7 text-slate-700">
              <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-700">
                {index + 1}
              </span>
              <span>{objective}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-6 text-slate-600">이번 차시에서는 미분이나 함수의 수학적 유도보다 출력 변화 관찰에 집중합니다.</p>
      </section>

      <section className="mt-9" aria-labelledby="activation-flow-title">
        <h3 id="activation-flow-title" className="text-xl font-black text-slate-950">가중합 이후의 Signal Flow</h3>
        <p className="mt-3 rounded-xl bg-indigo-50 p-4 leading-7"><strong>활성화 함수</strong>는 가중합을 다음 층에 전달하거나 최종 결과로 쓸 출력으로 바꿉니다. 값에 따라 다르게 처리하는 비선형 함수를 넣으면 신경망이 복잡한 관계를 표현하는 데 도움이 됩니다.</p>
        <details className="mt-3"><summary className="min-h-11 cursor-pointer py-2 font-bold">곱하고 더하는 계산만 쌓으면 왜 부족할까요?</summary><p className="mt-2 leading-7">2배한 뒤 3배하면 결국 6배하는 계산 하나가 됩니다. 곱하고 더하기만 하는 층은 여러 개 쌓아도 하나의 계산으로 합칠 수 있습니다. 렐루(ReLU)처럼 입력에 따라 다르게 반응하는 비선형 활성화 함수가 이 한계를 줄여 줍니다.</p></details>
        <div className="mt-5 grid items-center gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
          <FlowNode eyebrow="계산" title="입력값 × 가중치" detail="각 입력에 가중치를 곱합니다." />
          <FlowArrow />
          <FlowNode eyebrow="편향 더하기" title="가중합 z" detail="활성화 함수 적용 전 값" tone="indigo" />
          <FlowArrow />
          <FlowNode eyebrow="무엇이 들어갈까?" title="?" detail="가중합을 한 번 더 변환합니다." tone="cyan" />
          <FlowArrow />
          <FlowNode eyebrow="결과" title="출력" detail="활성화 함수 적용 후 값" tone="emerald" />
        </div>
      </section>

      <fieldset className="mt-9">
        <legend className="text-xl font-black leading-snug text-slate-950">
          가중합을 그대로 출력하지 않고 한 번 더 변환한다면 무엇을 사용할까요?
        </legend>
        <div className="mt-4 grid gap-3">
          {[
            ['A', '활성화 함수'],
            ['B', '데이터 파일'],
            ['C', '학습 횟수'],
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
              ? '활성화 함수는 가중합을 받아 다음 출력값으로 변환하는 함수입니다.'
              : '가중합 z 바로 다음에 놓여 출력 형태를 바꾸는 요소를 Signal Flow에서 다시 확인하세요.'
          }
        />
      )}

      {props.isComplete && (
        <StepCompletionMessage>활성화 함수의 역할을 선택해 제출하고 해설을 확인했습니다.</StepCompletionMessage>
      )}
    </StepFrame>
  )
}

export function Lesson03Step2(props: CommonStepProps) {
  const [answers, setAnswers] = useState<Array<0 | 1 | null>>([null, null, null, null])
  const allCorrect = answers.every((answer, index) => answer === stepExamples[index].output)

  useEffect(() => {
    if (!props.isComplete && allCorrect) props.onComplete()
  }, [allCorrect, props])

  return (
    <StepFrame
      {...props}
      step={2}
      intro="계단 함수는 가중합을 0과 비교해 판단 결과 0 또는 1을 냅니다. 확률을 뜻하지 않으며, z가 0이면 출력은 1입니다."
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(19rem,1.1fr)] lg:items-start">
        <section aria-labelledby="step-rule-title">
          <h3 id="step-rule-title" className="text-xl font-black text-slate-950">계단 함수 규칙</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <p className="rounded-xl bg-slate-100 p-4 font-black tabular-nums text-slate-900">z &lt; 0이면 출력 0</p>
            <p className="rounded-xl bg-indigo-50 p-4 font-black tabular-nums text-indigo-950">z ≥ 0이면 출력 1</p>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">0은 두 번째 조건에 포함되므로 Step(0) = 1입니다.</p>
        </section>
        <ActivationGraph kind="step" z={0} />
      </div>

      <section className="mt-9" aria-labelledby="step-judgment-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id="step-judgment-title" className="text-xl font-black text-slate-950">네 가중합 판단하기</h3>
          <span className="text-sm font-bold tabular-nums text-indigo-700">{answers.filter((answer) => answer !== null).length} / 4 판단</span>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {stepExamples.map((example, index) => {
            const answer = answers[index]
            const correct = answer === example.output
            return (
              <fieldset key={example.z} className="rounded-2xl border border-slate-200 p-5">
                <legend className="px-1 text-lg font-black tabular-nums text-slate-950">z = {example.z}</legend>
                <p className="mt-2 font-bold text-slate-700">계단 함수의 출력은?</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {([0, 1] as const).map((value) => (
                    <Button
                      key={value}
                      variant={answer === value ? 'primary' : 'secondary'}
                      aria-pressed={answer === value}
                      onClick={() =>
                        setAnswers((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)))
                      }
                    >
                      출력 {value}
                    </Button>
                  ))}
                </div>
                {answer !== null && (
                  <AnswerFeedback
                    correct={correct}
                    explanation={correct
                      ? `${example.z < 0 ? 'z<0' : 'z≥0'} 조건을 정확히 적용했습니다.`
                      : 'z가 0보다 작은지, 아니면 0을 포함한 이상인지 규칙에서 다시 확인하세요.'}
                  />
                )}
              </fieldset>
            )
          })}
        </div>
      </section>

      {props.isComplete && (
        <StepCompletionMessage>가중합 -3, -0.5, 0, 4의 출력을 모두 판단했습니다.</StepCompletionMessage>
      )}
    </StepFrame>
  )
}

export function Lesson03Step3(props: CommonStepProps) {
  const challenges = [-3, 0, 2] as const
  const [challengeIndex, setChallengeIndex] = useState(0)
  const [prediction, setPrediction] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [solved, setSolved] = useState<number[]>([])
  const z = challenges[challengeIndex]
  const output = relu(z)
  const correct = prediction === output

  useEffect(() => {
    if (!props.isComplete && solved.length === challenges.length) props.onComplete()
  }, [props, solved.length])

  const submit = () => {
    if (prediction === null) return
    setSubmitted(true)
    if (correct) setSolved((current) => current.includes(z) ? current : [...current, z])
  }

  const chooseChallenge = (index: number) => {
    setChallengeIndex(index)
    setPrediction(null)
    setSubmitted(false)
  }

  return (
    <StepFrame
      {...props}
      step={3}
      intro="렐루(ReLU)는 음수를 0으로, 0 이상의 값은 그대로 보내는 비선형 활성화 함수입니다. 은닉층에서 이 출력은 다음 층으로 전달할 중간값입니다. 그래프와 세 입력을 비교해 보세요."
    >
      <LayerLocation focus="hidden" />
      <div className="grid gap-6 lg:grid-cols-[minmax(17rem,0.75fr)_minmax(19rem,1.15fr)] lg:items-start">
        <section className="rounded-2xl border border-slate-200 p-5" aria-labelledby="relu-control-title">
          <div className="flex items-center justify-between gap-3">
            <h3 id="relu-control-title" className="text-xl font-black text-slate-950">렐루(ReLU) 함수 조작</h3>
            <SlidersHorizontal className="text-cyan-700" size={24} aria-hidden="true" />
          </div>
          <div className="mt-5"><PresetButtons values={challenges} current={z} onSelect={(value) => chooseChallenge(challenges.indexOf(value as -3 | 0 | 2))} /></div>
          <fieldset className="mt-6">
            <legend className="font-black">ReLU({z})의 출력을 예측하세요.</legend>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {[0, 2, 3].map((value) => <Button key={value} variant={prediction === value ? 'primary' : 'secondary'} aria-pressed={prediction === value} onClick={() => { setPrediction(value); setSubmitted(false) }}>{value}</Button>)}
            </div>
            <Button className="mt-4 w-full" disabled={prediction === null} onClick={submit}>예측 제출</Button>
          </fieldset>
          {submitted && <AnswerFeedback correct={correct} explanation={correct ? `${z < 0 ? '음수는 0으로 바뀌고' : z === 0 ? '0에서는 출력도 0이며' : '양수는 그대로 전달되어'} ReLU(${z})=${output}입니다.` : '음수는 0, 0과 양수는 입력값 그대로라는 규칙을 다시 적용해 보세요.'} />}
          <div className="mt-6 rounded-2xl bg-cyan-50 p-5" aria-live="polite">
            <p className="text-sm font-black text-cyan-800">현재 ReLU 출력</p>
            <p className="mt-2 text-3xl font-black tabular-nums text-slate-950">ReLU({z}) = {output}</p>
            <p className="mt-2 leading-6 text-slate-700">{z < 0 ? '음수이므로 0으로 바뀝니다.' : '0 이상이므로 입력값을 그대로 보냅니다.'}</p>
          </div>
          <p className="mt-4 text-sm font-bold text-indigo-700">맞게 예측한 영역 {solved.length} / 3</p>
        </section>

        <div>
          <ActivationGraph kind="relu" z={z} />
          <div className="mt-5 rounded-2xl bg-slate-100 p-5">
            <p className="font-black tabular-nums text-slate-950">ReLU(z) = max(0, z)</p>
            <p className="mt-2 leading-7 text-slate-700">ReLU는 음수는 0으로 만들고, 양수는 그대로 전달합니다. 딥러닝의 은닉층에서 자주 사용됩니다.</p>
          </div>
        </div>
      </div>

      {props.isComplete && (
        <StepCompletionMessage>음수, 0, 양수의 렐루 출력을 예측하고 그래프와 연결했습니다.</StepCompletionMessage>
      )}
    </StepFrame>
  )
}

export function Lesson03Step4(props: CommonStepProps) {
  const challenges = [-2, 0, 2] as const
  const [z, setZ] = useState<number>(-2)
  const [prediction, setPrediction] = useState<'below' | 'equal' | 'above' | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [zones, setZones] = useState<Zone[]>([])
  const [direction, setDirection] = useState<'increase' | 'decrease' | null>(null)
  const [directionSubmitted, setDirectionSubmitted] = useState(false)
  const output = sigmoid(z)
  const expected = z < 0 ? 'below' : z > 0 ? 'above' : 'equal'
  const correct = prediction === expected
  const ready = zones.length === 3 && directionSubmitted && direction === 'increase'

  useEffect(() => {
    if (!props.isComplete && ready) props.onComplete()
  }, [props, ready])

  const chooseZ = (value: number) => {
    setZ(value)
    setPrediction(null)
    setSubmitted(false)
  }

  const submit = () => {
    if (!prediction) return
    setSubmitted(true)
    if (correct) {
      const zone = getZone(z)
      setZones((current) => current.includes(zone) ? current : [...current, zone])
    }
  }

  return (
    <StepFrame
      {...props}
      step={4}
      intro="시그모이드(sigmoid) 함수는 가중합을 0과 1 사이로 바꿉니다. 그래프는 z=0에서 0.5를 지나며 오른쪽으로 갈수록 출력이 커집니다. 지수 계산 대신 출력의 의미를 판단하세요."
    >
      <LayerLocation focus="output" />
      <p className="mb-6 rounded-xl bg-cyan-50 p-4 leading-7">여기서 출력이 커진다는 것은 이진 분류에서 <strong>1로 표시한 클래스의 예측 확률이 커진다</strong>는 뜻입니다. 실제 정답인지 알려면 예측과 레이블을 비교해야 합니다.</p>
      <div className="grid gap-6 lg:grid-cols-[minmax(17rem,0.75fr)_minmax(19rem,1.15fr)] lg:items-start">
        <section className="rounded-2xl border border-slate-200 p-5" aria-labelledby="sigmoid-control-title">
          <h3 id="sigmoid-control-title" className="text-xl font-black text-slate-950">시그모이드(sigmoid) 함수 조작</h3>
          <div className="mt-5"><PresetButtons values={challenges} current={z} onSelect={chooseZ} /></div>
          <fieldset className="mt-6"><legend className="font-black">Sigmoid({z})는 0.5와 비교하면?</legend><div className="mt-3 grid gap-3 sm:grid-cols-3">{([{ value: 'below', label: '0.5보다 작다' }, { value: 'equal', label: '0.5이다' }, { value: 'above', label: '0.5보다 크다' }] as const).map((option) => <Button key={option.value} variant={prediction === option.value ? 'primary' : 'secondary'} aria-pressed={prediction === option.value} onClick={() => { setPrediction(option.value); setSubmitted(false) }}>{option.label}</Button>)}</div><Button className="mt-4 w-full" disabled={!prediction} onClick={submit}>예측 제출</Button></fieldset>
          {submitted && <AnswerFeedback correct={correct} explanation={correct ? `z=${z}일 때 내부 계산값은 ${output.toPrecision(8)}이고, 화면 표시값은 ${output.toFixed(2)}입니다.` : 'z가 음수이면 0.5보다 작고, 0이면 0.5, 양수이면 0.5보다 큽니다.'} />}
          <div className="mt-6 rounded-2xl bg-emerald-50 p-5" aria-live="polite">
            <p className="text-sm font-black text-emerald-800">현재 Sigmoid 출력</p>
            <p className="mt-2 text-3xl font-black tabular-nums text-slate-950">{output.toFixed(2)}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">내부 계산값 {output.toPrecision(8)}을 화면에서 소수점 둘째 자리로 반올림했습니다.</p>
          </div>
        </section>

        <div>
          <ActivationGraph kind="sigmoid" z={z} />
          <details className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
            <summary className="min-h-11 cursor-pointer font-black text-indigo-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">원리 보기</summary>
            <p className="mt-3 break-words font-bold tabular-nums text-slate-900">sigmoid(z) = 1 / (1 + exp(-z))</p>
            <p className="mt-2 leading-6 text-slate-600">지수 계산을 직접 할 필요는 없습니다. 식으로 계산한 내부 값은 유지하고 화면에 표시할 때만 반올림합니다.</p>
          </details>
        </div>
      </div>

      <section className="mt-7 rounded-2xl bg-indigo-50 p-5" aria-labelledby="sigmoid-observation-title">
        <h3 id="sigmoid-observation-title" className="font-black text-indigo-950">세 영역 확인</h3>
        <div className="mt-4"><ZoneProgress zones={zones} /></div>
      </section>

      <fieldset className="mt-7 rounded-2xl border border-slate-200 p-5"><legend className="font-black">z가 -2에서 2로 커지면 Sigmoid 출력은?</legend><div className="mt-4 grid grid-cols-2 gap-3"><Button variant={direction === 'increase' ? 'primary' : 'secondary'} aria-pressed={direction === 'increase'} onClick={() => { setDirection('increase'); setDirectionSubmitted(false) }}>커진다</Button><Button variant={direction === 'decrease' ? 'primary' : 'secondary'} aria-pressed={direction === 'decrease'} onClick={() => { setDirection('decrease'); setDirectionSubmitted(false) }}>작아진다</Button></div><Button className="mt-4" disabled={!direction} onClick={() => setDirectionSubmitted(true)}>변화 방향 제출</Button>{directionSubmitted && <AnswerFeedback correct={direction === 'increase'} explanation={direction === 'increase' ? 'z가 커질수록 이진 분류에서 1로 표시한 클래스의 예측 확률이 커집니다. 정답 여부는 실제 레이블과 비교해야 합니다.' : 'S자 그래프가 왼쪽에서 오른쪽으로 올라가는 방향인지 확인하세요.'} />}</fieldset>

      <div className="mt-7 grid gap-3 sm:grid-cols-5">
        {[-5, -2, 0, 2, 5].map((value) => (
          <div key={value} className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-sm font-bold tabular-nums text-slate-600">z = {value}</p>
            <p className="mt-1 text-lg font-black tabular-nums text-slate-950">약 {sigmoid(value).toFixed(2)}</p>
          </div>
        ))}
      </div>

      <p className="mt-7 flex items-start gap-3 rounded-2xl bg-cyan-50 p-5 font-semibold leading-7 text-slate-800">
        <Lightbulb className="mt-0.5 shrink-0 text-cyan-700" size={22} aria-hidden="true" />
        Sigmoid 출력은 0~1 사이이기 때문에 두 종류 중 하나를 구분하는 이진 분류 출력층에서 활용할 수 있습니다.
      </p>

      {props.isComplete && (
        <StepCompletionMessage>Sigmoid의 세 영역과 출력 변화 방향을 예측하고 판단의 의미를 해석했습니다.</StepCompletionMessage>
      )}
    </StepFrame>
  )
}

export function Lesson03Step5(props: CommonStepProps) {
  const [z, setZ] = useState(0)
  const [zones, setZones] = useState<Zone[]>([])
  const comparisonTargets = ['계단 함수', 'ReLU', 'Sigmoid', 'Sigmoid', 'ReLU']
  const [comparisonAnswers, setComparisonAnswers] = useState<string[]>(Array(5).fill(''))
  const [comparisonSubmitted, setComparisonSubmitted] = useState(false)
  const [interpretation, setInterpretation] = useState<'same' | 'different' | null>(null)
  const [interpretationSubmitted, setInterpretationSubmitted] = useState(false)
  const comparisonCorrect = comparisonAnswers.every((answer, index) => answer === comparisonTargets[index])
  const ready = zones.length === 3 && comparisonSubmitted && comparisonCorrect && interpretationSubmitted && interpretation === 'different'

  useEffect(() => {
    if (!props.isComplete && ready) props.onComplete()
  }, [props, ready])

  const observe = (value: number) => {
    setZ(value)
    const zone = getZone(value)
    setZones((current) => (current.includes(zone) ? current : [...current, zone]))
  }

  const stepOutput = stepActivation(z)
  const reluOutput = relu(z)
  const sigmoidOutput = sigmoid(z)

  return (
    <StepFrame
      {...props}
      step={5}
      intro="하나의 가중합 z를 계단 함수, ReLU, Sigmoid에 동시에 넣고 세 출력값과 그래프 위 점을 함께 비교합니다."
    >
      <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 sm:p-6" aria-labelledby="same-z-control-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 id="same-z-control-title" className="text-xl font-black text-indigo-950">같은 가중합 z</h3>
            <p className="mt-1 leading-6 text-slate-700">슬라이더 하나가 세 함수에 동시에 연결됩니다.</p>
          </div>
          <span className="rounded-xl bg-white px-4 py-2 text-2xl font-black tabular-nums text-indigo-900">z = {z}</span>
        </div>
        <div className="mt-5">
          <RangeControl id="compare-z" label="세 함수에 넣을 가중합" value={z} onChange={observe} />
        </div>
        <div className="mt-5">
          <PresetButtons values={[-2, 0, 2]} current={z} onSelect={observe} />
        </div>
      </section>

      <div className="mt-7 grid gap-4 md:grid-cols-3" aria-live="polite">
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 text-center">
          <p className="font-black text-indigo-800">계단 함수</p>
          <p className="mt-3 text-3xl font-black tabular-nums text-slate-950">{stepOutput}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{z < 0 ? 'z < 0 → 0' : 'z ≥ 0 → 1'}</p>
        </div>
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5 text-center">
          <p className="font-black text-cyan-800">ReLU</p>
          <p className="mt-3 text-3xl font-black tabular-nums text-slate-950">{reluOutput}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">max(0, {z})</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
          <p className="font-black text-emerald-800">Sigmoid</p>
          <p className="mt-3 text-3xl font-black tabular-nums text-slate-950">{sigmoidOutput.toFixed(2)}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">내부 값 {sigmoidOutput.toPrecision(8)}</p>
        </div>
      </div>

      <section className="mt-9" aria-labelledby="three-graphs-title">
        <h3 id="three-graphs-title" className="text-xl font-black text-slate-950">같은 좌표계에서 그래프 비교</h3>
        <p className="mt-2 leading-7 text-slate-600">세 그래프 모두 가중합 z는 -5~5, 출력 축은 0~5 범위를 사용합니다. 세로 점선과 점이 현재 값을 나타냅니다.</p>
        <div className="mt-5 grid gap-6 lg:grid-cols-3">
          <ActivationGraph kind="step" z={z} compact />
          <ActivationGraph kind="relu" z={z} compact />
          <ActivationGraph kind="sigmoid" z={z} compact />
        </div>
      </section>

      <section className="mt-7 rounded-2xl bg-slate-100 p-5" aria-labelledby="same-z-observation-title">
        <h3 id="same-z-observation-title" className="font-black text-slate-950">세 영역을 직접 확인하세요</h3>
        <div className="mt-4"><ZoneProgress zones={zones} /></div>
      </section>

      <section className="mt-8" aria-labelledby="activation-table-title"><h3 id="activation-table-title" className="text-xl font-black">함수 비교표</h3><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[42rem] border-collapse text-left text-sm"><thead><tr className="bg-slate-100"><th className="p-3">함수</th><th className="p-3">출력 범위</th><th className="p-3">음수 입력</th><th className="p-3">z=0</th><th className="p-3">변화</th><th className="p-3">주요 쓰임</th></tr></thead><tbody>{[['계단 함수','0 또는 1','0','1','경계에서 불연속','즉시 0/1 판단'],['ReLU','0 이상','0','0','연속','은닉층 특징'],['Sigmoid','0~1','0과 0.5 사이','0.5','연속','이진 분류 확률']].map((row) => <tr key={row[0]} className="border-t border-slate-200">{row.map((cell, columnIndex) => <td key={columnIndex} className="p-3 font-semibold">{cell}</td>)}</tr>)}</tbody></table></div><div className="mt-5 grid gap-4 md:grid-cols-2">{['출력이 0 또는 1뿐인 함수','음수는 0, 양수는 그대로인 함수','z=0에서 0.5인 함수','이진 분류 확률에 알맞은 함수','은닉층 특징 표현에 알맞은 함수'].map((label,index) => <label key={label} className="rounded-xl border border-slate-200 p-4"><span className="block font-bold leading-6">{label}</span><select value={comparisonAnswers[index]} onChange={(event) => { setComparisonAnswers((items) => items.map((answer,item) => item===index ? event.target.value : answer)); setComparisonSubmitted(false) }} className="mt-3 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3"><option value="">함수 선택</option><option>계단 함수</option><option>ReLU</option><option>Sigmoid</option></select></label>)}</div><Button className="mt-5" disabled={comparisonAnswers.some((answer) => !answer)} onClick={() => setComparisonSubmitted(true)}>비교표 연결 제출</Button>{comparisonSubmitted && <AnswerFeedback correct={comparisonCorrect} explanation={comparisonCorrect ? '출력 범위, 경계값, 연속성, 사용 위치를 모두 구분했습니다.' : '틀린 연결이 있습니다. 표에서 출력 범위와 주요 쓰임 열을 다시 비교하세요.'} />}</section>

      <fieldset className="mt-8 rounded-2xl border border-indigo-200 bg-indigo-50 p-5"><legend className="font-black text-indigo-950">같은 z라도 함수에 따라 출력이 달라지는 까닭은?</legend><div className="mt-4 grid gap-3 sm:grid-cols-2"><Button variant={interpretation === 'different' ? 'primary' : 'secondary'} aria-pressed={interpretation === 'different'} onClick={() => { setInterpretation('different'); setInterpretationSubmitted(false) }}>각 함수의 변환 규칙과 출력 범위가 다르다</Button><Button variant={interpretation === 'same' ? 'primary' : 'secondary'} aria-pressed={interpretation === 'same'} onClick={() => { setInterpretation('same'); setInterpretationSubmitted(false) }}>함수 이름만 다르고 규칙은 같다</Button></div><Button className="mt-4" disabled={!interpretation} onClick={() => setInterpretationSubmitted(true)}>차이 해석 제출</Button>{interpretationSubmitted && <AnswerFeedback correct={interpretation === 'different'} explanation={interpretation === 'different' ? '계단 함수는 판단, ReLU는 특징 전달, Sigmoid는 0~1 정도 표현에 맞는 서로 다른 규칙을 가집니다.' : '같은 z=0에서도 출력이 1, 0, 0.5로 다른 점을 다시 확인하세요.'} />}</fieldset>

      {z === 0 && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-amber-50 p-5 text-amber-950" role="status">
          <Eye className="mt-0.5 shrink-0" size={22} aria-hidden="true" />
          <p className="leading-7"><strong>z = 0 비교:</strong> 계단 함수는 1, ReLU는 0, Sigmoid는 0.5입니다.</p>
        </div>
      )}

      {props.isComplete && (
        <StepCompletionMessage>세 영역을 관찰하고 비교표와 해석 문제로 함수의 출력 범위와 사용 위치를 구분했습니다.</StepCompletionMessage>
      )}
    </StepFrame>
  )
}

const softmaxClasses = [
  { id: 'cat', label: '고양이' },
  { id: 'dog', label: '강아지' },
  { id: 'rabbit', label: '토끼' },
] as const

export function Lesson03Step6(props: CommonStepProps) {
  const [scores, setScores] = useState([1, 2, 4])
  const [observations, setObservations] = useState<string[]>([])
  const [phenomena, setPhenomena] = useState<string[]>([])
  const [reason, setReason] = useState<'relative' | 'independent' | null>(null)
  const [reasonSubmitted, setReasonSubmitted] = useState(false)
  const [notice, setNotice] = useState('세 점수는 한 묶음으로 Softmax에 들어갑니다.')
  const probabilities = useMemo(() => softmax(scores), [scores])
  const displayPercentages = useMemo(() => percentagesThatSumTo100(probabilities), [probabilities])
  const probabilitySum = probabilities.reduce((total, value) => total + value, 0)
  const maxScore = Math.max(...scores)
  const predicted = softmaxClasses
    .filter((_, index) => scores[index] === maxScore)
    .map((item) => item.label)
  const configurationKey = scores.join('|')
  const ready = observations.length >= 2 && reasonSubmitted && reason === 'relative'

  useEffect(() => {
    if (!props.isComplete && ready) props.onComplete()
  }, [props, ready])

  const changeScore = (index: number, value: number) => {
    setScores((current) => current.map((score, itemIndex) => (itemIndex === index ? value : score)))
    setNotice('확률이 함께 바뀌었습니다. 결과를 살펴본 뒤 이 설정을 기록하세요.')
  }

  const recordObservation = () => {
    if (observations.includes(configurationKey)) {
      setNotice('이미 기록한 설정입니다. 하나 이상의 점수를 바꿔 다시 관찰하세요.')
      return
    }
    setObservations((current) => [...current, configurationKey])
    setNotice(`설정 ${observations.length + 1}을 기록했습니다. 가장 높은 확률: ${predicted.join(', ')}`)
  }

  const reset = () => {
    setScores([1, 2, 4])
    setObservations([])
    setPhenomena([])
    setReason(null)
    setReasonSubmitted(false)
    setNotice('관찰 기록을 초기화했습니다. 기본 점수부터 다시 확인하세요.')
  }

  const observePhenomenon = (id: string, nextScores: number[], message: string) => {
    setScores(nextScores)
    setPhenomena((current) => current.includes(id) ? current : [...current, id])
    setNotice(message)
  }

  return (
    <StepFrame
      {...props}
      step={6}
      intro="클래스는 구별할 종류이고, 로짓은 확률로 바꾸기 전의 점수입니다. 소프트맥스(softmax) 함수는 클래스별 점수를 함께 받아 합이 1인 확률로 바꿉니다."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(17rem,0.7fr)_minmax(0,1.3fr)]">
        <section className="rounded-2xl border border-slate-200 p-5" aria-labelledby="softmax-score-title">
          <div className="flex items-center justify-between gap-3">
            <h3 id="softmax-score-title" className="text-xl font-black text-slate-950">세 클래스 점수</h3>
            <SlidersHorizontal className="text-indigo-600" size={24} aria-hidden="true" />
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">각 점수는 0~5에서 바꿀 수 있습니다.</p>
          <div className="mt-6 space-y-6">
            {softmaxClasses.map((item, index) => (
              <RangeControl
                key={item.id}
                id={`softmax-${item.id}`}
                label={`${item.label} 점수 z${index + 1}`}
                value={scores[index]}
                min={0}
                max={5}
                step={0.5}
                onChange={(value) => changeScore(index, value)}
              />
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-slate-50 p-5 sm:p-6" aria-labelledby="softmax-result-title">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 id="softmax-result-title" className="text-xl font-black text-slate-950">소프트맥스(softmax) 함수의 확률</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">세 점수 전체를 함께 계산한 결과입니다.</p>
            </div>
            <span className="rounded-xl bg-emerald-100 px-3 py-2 text-sm font-black text-emerald-900">
              합계 100%
            </span>
          </div>

          <div className="mt-6 space-y-5" aria-live="polite">
            {softmaxClasses.map((item, index) => (
              <div key={item.id}>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold text-slate-800">{item.label}</span>
                  <span className="font-black tabular-nums text-indigo-800">{displayPercentages[index].toFixed(1)}%</span>
                </div>
                <div className="mt-2 h-5 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 transition-[width] duration-200 motion-reduce:transition-none"
                    style={{ width: `${probabilities[index] * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-xs tabular-nums text-slate-500">내부 확률 {probabilities[index].toPrecision(8)}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
            <p className="text-sm font-black text-indigo-800">예측 결과로 선택할 수 있는 클래스</p>
            <p className="mt-2 text-2xl font-black text-slate-950">{predicted.join(', ')}</p>
            {predicted.length > 1 && (
              <p className="mt-2 leading-6 text-slate-700">가장 큰 점수가 같아서 가장 높은 확률도 같습니다.</p>
            )}
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-500">내부 확률 합계: {probabilitySum.toPrecision(12)} · 표시할 때만 반올림합니다.</p>
        </section>
      </div>

      <section className="mt-7 rounded-2xl border border-indigo-200 bg-indigo-50 p-5" aria-labelledby="softmax-observation-title">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 id="softmax-observation-title" className="font-black text-indigo-950">소프트맥스(softmax) 설정 비교</h3>
            <p className="mt-1 text-sm leading-6 text-slate-700" aria-live="polite">{notice}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={reset}>
              <RotateCcw size={18} aria-hidden="true" />
              기록 초기화
            </Button>
            <Button onClick={recordObservation}>이 설정 관찰하기</Button>
          </div>
        </div>
        <p className="mt-4 font-black tabular-nums text-indigo-900">서로 다른 설정 {observations.length} / 2</p>
      </section>

      <section className="mt-7" aria-labelledby="softmax-challenges"><h3 id="softmax-challenges" className="text-xl font-black">비교를 돕는 점수 예시</h3><p className="mt-2 leading-7 text-slate-600">예시나 슬라이더로 서로 다른 두 설정을 비교하고 기록하세요. 모든 예시 버튼을 누를 필요는 없습니다.</p><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[
        { id: 'wide', label: '점수 차이가 큰 경우', scores: [0,0,5], message: '가장 큰 점수의 확률이 뚜렷하게 높아졌습니다.' },
        { id: 'close', label: '점수 차이가 작은 경우', scores: [2,2.5,3], message: '점수가 비슷하면 확률도 비교적 고르게 나뉩니다.' },
        { id: 'tie', label: '두 최고 점수가 같은 경우', scores: [3,3,1], message: '같은 최고 점수 두 클래스의 확률도 같습니다.' },
        { id: 'one', label: '한 클래스만 높이기', scores: [1,2,5], message: '한 점수만 높여도 전체 합이 1이어야 하므로 다른 클래스 확률도 함께 변합니다.' },
      ].map((item) => <Button key={item.id} variant={phenomena.includes(item.id) ? 'primary' : 'secondary'} onClick={() => observePhenomenon(item.id, item.scores, item.message)}>{phenomena.includes(item.id) ? <Check size={18} aria-hidden="true" /> : null}{item.label}</Button>)}</div><p className="mt-4 rounded-xl bg-slate-100 p-4 font-bold">선택해 본 예시 {phenomena.length}개 · 완료 조건은 두 설정 비교와 이유 판단입니다.</p></section>

      <fieldset className="mt-7 rounded-2xl border border-indigo-200 bg-indigo-50 p-5"><legend className="font-black text-indigo-950">한 클래스 점수만 바꿔도 다른 확률이 함께 변하는 이유는?</legend><div className="mt-4 grid gap-3 sm:grid-cols-2"><Button variant={reason === 'relative' ? 'primary' : 'secondary'} aria-pressed={reason === 'relative'} onClick={() => { setReason('relative'); setReasonSubmitted(false) }}>여러 점수를 한 묶음으로 비교하고 합을 1로 만들기 때문</Button><Button variant={reason === 'independent' ? 'primary' : 'secondary'} aria-pressed={reason === 'independent'} onClick={() => { setReason('independent'); setReasonSubmitted(false) }}>각 점수를 서로 무관하게 따로 계산하기 때문</Button></div><Button className="mt-4" disabled={!reason} onClick={() => setReasonSubmitted(true)}>이유 제출</Button>{reasonSubmitted && <AnswerFeedback correct={reason === 'relative'} explanation={reason === 'relative' ? 'Softmax는 전체 점수의 상대적 크기를 한 번에 비교합니다.' : '세 확률의 합이 늘 1인 점과, 한 막대가 커질 때 다른 막대가 작아지는 점을 다시 보세요.'} />}</fieldset>

      <ul className="mt-7 grid gap-3 md:grid-cols-2">
        {[
          '점수가 커지면 해당 클래스의 확률이 높아지는 경향이 있습니다.',
          '가장 높은 확률을 가진 클래스를 예측 결과로 선택할 수 있습니다.',
          '가장 큰 점수가 같으면 가장 높은 확률도 같을 수 있습니다.',
          '확률이 가장 높다는 것이 반드시 정답이라는 뜻은 아닙니다.',
        ].map((statement) => (
          <li key={statement} className="flex items-start gap-3 rounded-xl bg-slate-100 p-4 leading-7 text-slate-800">
            <CheckCircle2 className="mt-1 shrink-0 text-cyan-700" size={19} aria-hidden="true" />
            {statement}
          </li>
        ))}
      </ul>

      <div className="mt-7 flex items-start gap-3 rounded-2xl bg-cyan-50 p-5">
        <Sparkles className="mt-0.5 shrink-0 text-cyan-700" size={22} aria-hidden="true" />
        <p className="font-semibold leading-7 text-slate-800">예측 확률은 한 입력에 대한 모델의 출력입니다. 정확도는 여러 데이터에서 실제로 맞힌 비율이므로 두 값은 다릅니다.</p>
      </div>

      {props.isComplete && (
        <StepCompletionMessage>두 점수 설정의 클래스별 확률과 합을 비교하고 여러 점수가 함께 계산되는 이유를 설명했습니다.</StepCompletionMessage>
      )}
    </StepFrame>
  )
}

interface Step7Props extends CommonStepProps {
  priorStepsComplete: boolean
  onCompletionReadyChange: (ready: boolean) => void
}

const applicationCases = [
  { id: 'step', name: '계단 함수', location: '교육용 퍼셉트론 판단', output: '0 또는 1', reason: '기준을 넘었는지 즉시 구분' },
  { id: 'relu', name: '렐루(ReLU) 함수', location: '은닉층', output: '0 이상의 특징값', reason: '양수 특징을 그대로 전달' },
  { id: 'sigmoid', name: '시그모이드(sigmoid) 함수', location: '이진 분류 출력층', output: '0~1 사이 한 확률', reason: '두 상태 중 한쪽의 정도 표현' },
  { id: 'softmax', name: '소프트맥스(softmax) 함수', location: '다중 분류 출력층', output: '합이 1인 클래스별 확률', reason: '여러 클래스를 한 묶음으로 비교' },
] as const


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

export function Lesson03Step7({
  priorStepsComplete,
  onCompletionReadyChange,
  ...props
}: Step7Props) {
  const [section, setSection] = useState(0)
  const [quizIndex, setQuizIndex] = useState(0)
  const [mappings, setMappings] = useState<Record<string, UsageTarget | undefined>>({})
  const [mappingSubmitted, setMappingSubmitted] = useState(false)
  const [outputs, setOutputs] = useState<Record<string, string>>({})
  const [reasons, setReasons] = useState<Record<string, string>>({})
  const [applicationSubmitted, setApplicationSubmitted] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Array<string | null>>([null, null, null, null])
  const [quizSubmitted, setQuizSubmitted] = useState([false, false, false, false])

  const allMapped = usageFunctions.every((item) => mappings[item.id])
  const mappingCorrect = usageFunctions.every((item) => mappings[item.id] === item.target)
  const allQuizSubmitted = quizSubmitted.every(Boolean)
  const allQuizCorrect = lesson03Quiz.every((quiz, index) => quizAnswers[index] === quiz.answer)
  const allApplicationsAnswered = applicationCases.every((item) => outputs[item.id] && reasons[item.id])
  const applicationsCorrect = applicationCases.every((item) => outputs[item.id] === item.output && reasons[item.id] === item.reason)
  const completionReady = priorStepsComplete && mappingSubmitted && mappingCorrect && allQuizSubmitted
    && allQuizCorrect && applicationSubmitted && applicationsCorrect

  useEffect(() => {
    onCompletionReadyChange(completionReady)
  }, [completionReady, onCompletionReadyChange])

  const chooseMapping = (functionId: string, target: UsageTarget) => {
    setMappings((current) => ({ ...current, [functionId]: target }))
    setMappingSubmitted(false)
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
      intro="활성화 함수를 알맞은 사용 위치에 연결하고 네 확인 문제로 각 함수의 특징을 정리합니다."
    >
      <ReviewNavigation label="소구간 이동" current={section} onChange={setSection} items={[
        { label: '1. 함수와 사용 위치 연결', purpose: '각 함수가 어디에 사용되는지 연결하세요.', done: mappingSubmitted && mappingCorrect, remaining: '세 함수의 위치 연결 후 제출' },
        { label: '2. 출력 형태와 선택 이유 해석', purpose: '네 함수가 어떤 출력을 만들며 왜 쓰이는지 선택하세요.', done: applicationSubmitted && applicationsCorrect, remaining: '네 함수의 출력·이유 선택 후 제출' },
        { label: '3. 확인 문제', purpose: '배운 함수의 특징을 구분해 문제마다 제출하세요.', done: allQuizSubmitted && allQuizCorrect, remaining: '네 문제 정답 제출' },
      ]} />
      <div hidden={section !== 0} aria-label="소구간 1 내용">
      <section aria-labelledby="usage-mapping-title">
        <div className="flex items-center gap-3">
          <Link2 className="text-indigo-600" size={25} aria-hidden="true" />
          <h3 id="usage-mapping-title" className="text-xl font-black text-slate-950">함수와 사용 위치 연결</h3>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {usageFunctions.map((item) => (
            <fieldset key={item.id} className="rounded-2xl border border-slate-200 p-5">
              <legend className="px-1 text-lg font-black text-indigo-800">{item.label}</legend>
              <p className="mt-2 text-sm leading-6 text-slate-600">주로 사용하는 위치를 선택하세요.</p>
              <div className="mt-4 grid gap-3">
                {usageTargets.map((target) => (
                  <button
                    key={target}
                    type="button"
                    aria-pressed={mappings[item.id] === target}
                    onClick={() => chooseMapping(item.id, target)}
                    className={`min-h-14 rounded-xl border px-4 py-3 text-left font-semibold leading-6 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                      mappings[item.id] === target
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-950'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300'
                    }`}
                  >
                    {target}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <Button
          className="mt-5"
          disabled={!allMapped}
          onClick={() => setMappingSubmitted(true)}
        >
          연결 확인
          <Check size={18} aria-hidden="true" />
        </Button>
        {mappingSubmitted && (
          <AnswerFeedback
            correct={mappingCorrect}
            explanation={
              mappingCorrect
                ? 'ReLU는 은닉층, Sigmoid는 이진 분류 출력층, Softmax는 다중 분류 출력층에 연결됩니다.'
                : 'ReLU → 은닉층, Sigmoid → 이진 분류 출력층, Softmax → 다중 분류 출력층의 연결을 다시 확인하세요.'
            }
          />
        )}
        <div className="mt-5 rounded-2xl bg-slate-100 p-5">
          <p className="font-black text-slate-950">계단 함수</p>
          <p className="mt-2 leading-7 text-slate-700">퍼셉트론의 기본 판단 원리를 이해할 때 사용하는 함수로 따로 기억하세요.</p>
        </div>
      </section>

      </div>
      <div hidden={section !== 1} aria-label="소구간 2 내용">
      <section className="mt-10" aria-labelledby="application-design-title"><h3 id="application-design-title" className="text-xl font-black">출력 형태와 사용 이유 해석</h3><div className="mt-5 grid gap-5 xl:grid-cols-2">{applicationCases.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 p-5"><h4 className="text-lg font-black text-indigo-800">{item.name}</h4><p className="mt-2 text-sm text-slate-600">사용 위치: {item.location}</p>{[
        { label: '출력 형태', value: outputs[item.id] ?? '', set: setOutputs, options: applicationCases.map((candidate) => candidate.output) },
        { label: '선택 이유', value: reasons[item.id] ?? '', set: setReasons, options: applicationCases.map((candidate) => candidate.reason) },
      ].map((field) => <label key={field.label} className="mt-4 block"><span className="text-sm font-bold text-slate-700">{field.label}</span><select value={field.value} onChange={(event) => { field.set((current) => ({ ...current, [item.id]: event.target.value })); setApplicationSubmitted(false) }} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3"><option value="">선택</option>{[...new Set(field.options)].map((option) => <option key={option} value={option}>{option}</option>)}</select></label>)}</article>)}</div><Button className="mt-5" disabled={!allApplicationsAnswered} onClick={() => setApplicationSubmitted(true)}>출력 해석 제출</Button>{applicationSubmitted && <AnswerFeedback correct={applicationsCorrect} explanation={applicationsCorrect ? '네 함수가 그 위치에서 사용되는 이유를 출력 특성과 연결했습니다.' : '틀린 항목이 있습니다. 계단=즉시 0/1, ReLU=은닉 특징, Sigmoid=이진 확률, Softmax=클래스별 확률의 차이를 다시 보세요.'} />}</section>

      </div>
      <div hidden={section !== 2} aria-label="소구간 3 내용">
      <section className="mt-10" aria-labelledby="lesson03-quiz-title">
        <h3 id="lesson03-quiz-title" className="text-xl font-black text-slate-950">확인 문제 4개</h3>
        <p className="mt-2 leading-7 text-slate-600">오답이어도 이유를 확인한 뒤 답을 바꾸어 다시 제출할 수 있습니다.</p>
        <ReviewNavigation label="확인 문제 이동" current={quizIndex} onChange={setQuizIndex} items={lesson03Quiz.map((question, index) => ({ label: `문제 ${index + 1}`, done: quizSubmitted[index] && quizAnswers[index] === question.answer, remaining: quizSubmitted[index] ? '오답 수정 후 재제출' : '선택 후 제출' }))} />
        <div className="mt-5 space-y-6">
          {lesson03Quiz.map((quiz, index) => (
            <fieldset hidden={quizIndex !== index} key={quiz.question} className="rounded-2xl border border-slate-200 p-5 sm:p-6">
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
                <AnswerFeedback
                  correct={quizAnswers[index] === quiz.answer}
                  explanation={quizAnswers[index] === quiz.answer ? quiz.explanation : '선택한 함수의 출력 범위와 사용 위치를 표에서 다시 확인하세요.'}
                />
              )}
            </fieldset>
          ))}
        </div>
      </section>

      </div>
      {completionReady && !props.isComplete && (
        <div className="mt-7 flex items-start gap-3 rounded-2xl bg-amber-50 p-5 text-amber-950" role="status">
          <CircleHelp className="mt-0.5 shrink-0" size={21} aria-hidden="true" />
          <p className="leading-7">함수 연결과 네 문제 제출을 마쳤습니다. {priorStepsComplete
            ? '화면 아래의 완료 버튼으로 Lesson 03을 완료하세요.'
            : '완료되지 않은 앞 STEP의 핵심 활동을 마치면 완료 버튼이 활성화됩니다.'}</p>
        </div>
      )}

      {props.isComplete && (
        <div className="mt-8 border-t border-emerald-200 pt-7">
          <div className="flex items-start gap-3 text-emerald-900" role="status">
            <CheckCircle2 className="mt-0.5 shrink-0" size={24} aria-hidden="true" />
            <div>
              <h3 className="text-xl font-black">Lesson 03 완료</h3>
              <p className="mt-2 leading-7">홈의 전체 진행도에 이 차시 완료가 반영되었습니다.</p>
            </div>
          </div>
          <div className="mt-7 rounded-2xl bg-indigo-50 p-5">
            <p className="font-black text-indigo-900">Lesson 04로 이어지는 질문</p>
            <p className="mt-2 text-lg font-bold leading-7 text-slate-900">퍼셉트론 하나가 아니라 여러 개를 연결하면 어떤 구조가 될까요?</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:border-indigo-300 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Home에서 진행도 보기
              </Link>
              <Link
                to="/lesson/04"
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
