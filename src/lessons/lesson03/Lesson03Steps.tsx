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
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ActivationGraph } from './ActivationGraph'
import {
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

export function Lesson03Step1(props: CommonStepProps) {
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
              : '정답은 A입니다. 데이터 파일이나 학습 횟수가 아니라 활성화 함수가 가중합을 다음 출력값으로 변환합니다.'
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
  const allJudged = answers.every((answer) => answer !== null)

  useEffect(() => {
    if (!props.isComplete && allJudged) props.onComplete()
  }, [allJudged, props])

  return (
    <StepFrame
      {...props}
      step={2}
      intro="계단 함수는 가중합을 0과 비교해 출력 0 또는 1로 바꿉니다. z가 0이면 출력은 1입니다."
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
                    explanation={
                      example.z < 0
                        ? `${example.z}은 0보다 작으므로 출력은 0입니다.`
                        : `${example.z}은 0 이상이므로 출력은 1입니다.`
                    }
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
  const [z, setZ] = useState(0)
  const [observedValues, setObservedValues] = useState<number[]>([])
  const output = relu(z)

  useEffect(() => {
    if (!props.isComplete && observedValues.length >= 3) props.onComplete()
  }, [observedValues.length, props])

  const observe = (value: number) => {
    setZ(value)
    setObservedValues((current) => (current.includes(value) ? current : [...current, value]))
  }

  return (
    <StepFrame
      {...props}
      step={3}
      intro="ReLU에 가중합을 넣어 음수와 0, 양수가 각각 어떤 출력으로 바뀌는지 직접 조작해 봅니다."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(17rem,0.75fr)_minmax(19rem,1.15fr)] lg:items-start">
        <section className="rounded-2xl border border-slate-200 p-5" aria-labelledby="relu-control-title">
          <div className="flex items-center justify-between gap-3">
            <h3 id="relu-control-title" className="text-xl font-black text-slate-950">ReLU 조작</h3>
            <SlidersHorizontal className="text-cyan-700" size={24} aria-hidden="true" />
          </div>
          <div className="mt-5">
            <RangeControl id="relu-z" label="가중합 z" value={z} onChange={observe} />
          </div>
          <div className="mt-5">
            <PresetButtons values={[-3, -1, 0, 2, 5]} current={z} onSelect={observe} />
          </div>
          <div className="mt-6 rounded-2xl bg-cyan-50 p-5" aria-live="polite">
            <p className="text-sm font-black text-cyan-800">현재 ReLU 출력</p>
            <p className="mt-2 text-3xl font-black tabular-nums text-slate-950">ReLU({z}) = {output}</p>
            <p className="mt-2 leading-6 text-slate-700">{z < 0 ? '음수이므로 0으로 바뀝니다.' : '0 이상이므로 입력값을 그대로 보냅니다.'}</p>
          </div>
          <p className="mt-4 text-sm font-bold text-indigo-700">서로 다른 값 {observedValues.length} / 3 관찰</p>
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
        <StepCompletionMessage>ReLU에 서로 다른 가중합을 세 번 이상 넣어 출력 변화를 관찰했습니다.</StepCompletionMessage>
      )}
    </StepFrame>
  )
}

export function Lesson03Step4(props: CommonStepProps) {
  const [z, setZ] = useState(0)
  const [zones, setZones] = useState<Zone[]>([])
  const output = sigmoid(z)

  useEffect(() => {
    if (!props.isComplete && zones.length === 3) props.onComplete()
  }, [props, zones.length])

  const observe = (value: number) => {
    setZ(value)
    const zone = getZone(value)
    setZones((current) => (current.includes(zone) ? current : [...current, zone]))
  }

  return (
    <StepFrame
      {...props}
      step={4}
      intro="Sigmoid는 어떤 가중합을 넣어도 0과 1 사이로 바꿉니다. 슬라이더와 그래프의 점을 함께 움직여 봅니다."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(17rem,0.75fr)_minmax(19rem,1.15fr)] lg:items-start">
        <section className="rounded-2xl border border-slate-200 p-5" aria-labelledby="sigmoid-control-title">
          <h3 id="sigmoid-control-title" className="text-xl font-black text-slate-950">Sigmoid 조작</h3>
          <div className="mt-5">
            <RangeControl id="sigmoid-z" label="가중합 z" value={z} onChange={observe} />
          </div>
          <div className="mt-5">
            <PresetButtons values={[-5, -2, 0, 2, 5]} current={z} onSelect={observe} />
          </div>
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
        <StepCompletionMessage>Sigmoid 슬라이더로 음수, 0, 양수 가중합을 모두 확인했습니다.</StepCompletionMessage>
      )}
    </StepFrame>
  )
}

export function Lesson03Step5(props: CommonStepProps) {
  const [z, setZ] = useState(0)
  const [zones, setZones] = useState<Zone[]>([])

  useEffect(() => {
    if (!props.isComplete && zones.length === 3) props.onComplete()
  }, [props, zones.length])

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

      {z === 0 && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-amber-50 p-5 text-amber-950" role="status">
          <Eye className="mt-0.5 shrink-0" size={22} aria-hidden="true" />
          <p className="leading-7"><strong>z = 0 비교:</strong> 계단 함수는 1, ReLU는 0, Sigmoid는 0.5입니다.</p>
        </div>
      )}

      {props.isComplete && (
        <StepCompletionMessage>같은 가중합의 음수, 0, 양수 영역을 비교했습니다. 같은 z라도 활성화 함수에 따라 출력값이 달라집니다.</StepCompletionMessage>
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
  const [notice, setNotice] = useState('세 점수는 한 묶음으로 Softmax에 들어갑니다.')
  const probabilities = useMemo(() => softmax(scores), [scores])
  const probabilitySum = probabilities.reduce((total, value) => total + value, 0)
  const maxScore = Math.max(...scores)
  const predicted = softmaxClasses
    .filter((_, index) => scores[index] === maxScore)
    .map((item) => item.label)
  const configurationKey = scores.join('|')

  useEffect(() => {
    if (!props.isComplete && observations.length >= 2) props.onComplete()
  }, [observations.length, props])

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
    setNotice('관찰 기록을 초기화했습니다. 기본 점수부터 다시 확인하세요.')
  }

  return (
    <StepFrame
      {...props}
      step={6}
      intro="Softmax는 여러 클래스의 점수를 하나의 묶음으로 받아 서로 비교 가능한 확률로 바꿉니다."
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
                step={1}
                onChange={(value) => changeScore(index, value)}
              />
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-slate-50 p-5 sm:p-6" aria-labelledby="softmax-result-title">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 id="softmax-result-title" className="text-xl font-black text-slate-950">Softmax 확률</h3>
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
                  <span className="font-black tabular-nums text-indigo-800">{(probabilities[index] * 100).toFixed(1)}%</span>
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
            <h3 id="softmax-observation-title" className="font-black text-indigo-950">Softmax 설정 관찰</h3>
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
        <p className="font-semibold leading-7 text-slate-800">Softmax는 한 점수에 따로 적용하는 함수가 아니라 여러 출력값을 함께 받아 각 클래스의 상대적인 확률을 만듭니다.</p>
      </div>

      {props.isComplete && (
        <StepCompletionMessage>서로 다른 Softmax 점수 설정을 두 번 이상 실험했습니다.</StepCompletionMessage>
      )}
    </StepFrame>
  )
}

interface Step7Props extends CommonStepProps {
  priorStepsComplete: boolean
  onCompletionReadyChange: (ready: boolean) => void
}

export function Lesson03Step7({
  priorStepsComplete,
  onCompletionReadyChange,
  ...props
}: Step7Props) {
  const [mappings, setMappings] = useState<Record<string, UsageTarget | undefined>>({})
  const [mappingSubmitted, setMappingSubmitted] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Array<string | null>>([null, null, null, null])
  const [quizSubmitted, setQuizSubmitted] = useState([false, false, false, false])

  const allMapped = usageFunctions.every((item) => mappings[item.id])
  const mappingCorrect = usageFunctions.every((item) => mappings[item.id] === item.target)
  const allQuizSubmitted = quizSubmitted.every(Boolean)
  const completionReady = mappingSubmitted && mappingCorrect && allQuizSubmitted

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

      <section className="mt-10" aria-labelledby="lesson03-quiz-title">
        <h3 id="lesson03-quiz-title" className="text-xl font-black text-slate-950">확인 문제 4개</h3>
        <p className="mt-2 leading-7 text-slate-600">오답이어도 이유를 확인한 뒤 답을 바꾸어 다시 제출할 수 있습니다.</p>
        <div className="mt-5 space-y-6">
          {lesson03Quiz.map((quiz, index) => (
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
