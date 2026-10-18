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
import { useEffect, useState, type ReactNode, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { TinyNetworkWalkthrough } from './TinyNetworkWalkthrough'
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
import {
  forwardTinyNetwork,
  networkNumberMatches,
  parseNetworkNumber,
  type TinyNetworkConfig,
} from './networkMath'

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
    if (choice === 'A') props.onComplete()
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
        <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4 leading-7">
          <p><strong>인공신경망(ANN)</strong>은 여러 인공 뉴런을 서로 연결한 구조입니다. Lesson 02의 한 뉴런이 만든 출력이 다음 뉴런의 입력이 됩니다.</p>
          <dl className="mt-3 grid gap-3 sm:grid-cols-3">
            <div><dt className="font-black">○ 원 · 노드</dt><dd>뉴런은 입력을 받아 가중합과 활성화 함수로 값을 계산하는 단위입니다. 입력층의 원은 데이터를 전달합니다.</dd></div>
            <div><dt className="font-black">─ 선 · 연결</dt><dd>값이 전달되는 길이며 각 연결에 가중치가 있습니다.</dd></div>
            <div><dt className="font-black">층 · 이름과 테두리</dt><dd>같은 단계의 계산 단위를 묶은 것입니다. 그림 방향보다 입력층·은닉층·출력층 이름을 살펴보세요.</dd></div>
          </dl>
        </div>
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
              : '단일 퍼셉트론과 여러 뉴런이 선으로 연결된 그림의 차이를 다시 확인하세요.'
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
  const [irisInputs, setIrisInputs] = useState<number | null>(null)
  const [digitOutputs, setDigitOutputs] = useState<number | null>(null)
  const [spamOutputOne, setSpamOutputOne] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const countsCorrect = irisInputs === 4 && digitOutputs === 10 && spamOutputOne

  useEffect(() => {
    if (!props.isComplete && viewed.length === networkLayers.length && submitted && countsCorrect) props.onComplete()
  }, [countsCorrect, props, submitted, viewed.length])

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
      <p className="mb-4 leading-7 text-slate-700">동그라미는 값을 받거나 계산하는 <strong>노드</strong>, 노드를 묶은 단은 <strong>층</strong>입니다. 연결선의 가중치가 전달되는 값의 영향을 조절합니다. 은닉층의 중간 출력은 다음 층의 입력이 됩니다.</p>
      <section aria-labelledby="layer-explore-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id="layer-explore-title" className="text-xl font-black text-slate-950">층별 역할 탐색</h3>
          <span className="text-sm font-black tabular-nums text-indigo-700">{viewed.length} / 3 확인</span>
        </div>
        <div className="mt-4"><NeuralNetworkDiagram layers={networkLayers} label="입력 데이터가 세 층을 지나는 흐름" selectedLayerId={activeLayer?.id} renderLayerAction={(diagramLayer) => {
            const layer = networkLayers.find((item) => item.id === diagramLayer.id)!
            const isViewed = viewed.includes(layer.id)
            const isActive = activeLayer?.id === layer.id
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => inspect(layer)}
                aria-pressed={isActive}
                className={`mt-3 min-h-12 w-full rounded-xl border p-3 text-left focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 bg-white hover:border-indigo-300'
                }`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block font-black text-slate-950">{layer.label} 역할 확인</span>
                    <span className="mt-1 block text-sm font-semibold text-slate-600">{isViewed ? '확인함 · 다시 볼 수 있습니다' : layer.shortRole}</span>
                  </span>
                  {isViewed ? (
                    <CheckCircle2 className="shrink-0 text-emerald-600" size={20} aria-label="확인함" />
                  ) : (
                    <Circle className="shrink-0 text-slate-400" size={18} aria-label="확인 전" />
                  )}
                </span>
              </button>
            )
          }} /></div>
        <p className="mt-3 leading-7 text-slate-700" role="status">{activeLayer ? `현재 확인한 층: ${activeLayer.label} · ${activeLayer.shortRole}` : '각 층의 그림과 역할을 읽고 해당 층의 확인 버튼을 누르세요.'}</p>
      </section>

      <section className="mt-8 rounded-2xl border border-indigo-200 bg-indigo-50 p-5" aria-labelledby="node-count-title"><h3 id="node-count-title" className="text-xl font-black text-indigo-950">문제에 맞는 입력·출력 뉴런 수</h3><div className="mt-5 grid gap-5 lg:grid-cols-3"><fieldset className="rounded-xl bg-white p-4"><legend className="font-black">붓꽃 특징 4개</legend><p className="mt-1 text-sm text-slate-600">입력 뉴런 수는?</p><div className="mt-3 grid grid-cols-3 gap-2">{[3,4,10].map((value) => <Button key={value} variant={irisInputs === value ? 'primary' : 'secondary'} aria-pressed={irisInputs === value} onClick={() => { setIrisInputs(value); setSubmitted(false) }}>{value}개</Button>)}</div></fieldset><fieldset className="rounded-xl bg-white p-4"><legend className="font-black">숫자 0~9 분류</legend><p className="mt-1 text-sm text-slate-600">클래스별 출력 뉴런 수는?</p><div className="mt-3 grid grid-cols-3 gap-2">{[1,4,10].map((value) => <Button key={value} variant={digitOutputs === value ? 'primary' : 'secondary'} aria-pressed={digitOutputs === value} onClick={() => { setDigitOutputs(value); setSubmitted(false) }}>{value}개</Button>)}</div></fieldset><fieldset className="rounded-xl bg-white p-4"><legend className="font-black">스팸/정상 이진 분류</legend><p className="mt-1 text-sm text-slate-600">스팸일 확률을 만들 출력 뉴런을 선택하세요.</p><div className="mt-3 grid gap-2"><Button variant={spamOutputOne ? 'primary' : 'secondary'} aria-pressed={spamOutputOne} onClick={() => { setSpamOutputOne(true); setSubmitted(false) }}>{spamOutputOne ? <Check size={18} aria-hidden="true" /> : null}출력 뉴런 1개</Button></div><p className="mt-3 text-sm font-bold text-slate-700">출력 뉴런 1개 → 시그모이드(sigmoid) → 스팸일 확률 0~1</p></fieldset></div><Button className="mt-5" disabled={irisInputs === null || digitOutputs === null || !spamOutputOne} onClick={() => setSubmitted(true)}>뉴런 수 설계 제출</Button>{submitted && <AnswerFeedback correct={countsCorrect} explanation={countsCorrect ? '입력 뉴런은 특징 수, 다중 분류 출력 뉴런은 클래스 수와 맞추었습니다. 이진 분류는 출력 뉴런 1개와 시그모이드로 스팸일 확률을 만듭니다.' : '입력은 특징 개수, 다중 분류 출력은 클래스 개수를 기준으로 다시 선택하세요. 스팸/정상은 출력 뉴런 1개와 시그모이드를 연결하세요.'} />}</section>

      <p className="mt-5 text-sm leading-6 text-slate-600">‘은닉’은 입력층과 출력층 사이의 내부 계산층이라는 뜻입니다. 입력층은 계산이나 예측 없이 데이터를 전달합니다.</p>

      {props.isComplete && (
        <StepCompletionMessage>세 층의 역할을 확인하고 문제 조건에 맞는 입력·출력 뉴런 수를 설계했습니다.</StepCompletionMessage>
      )}
    </StepFrame>
  )
}

const guidedNetwork: TinyNetworkConfig = {
  inputs: [2, 1],
  hiddenWeights: [[1, -1], [-1, 2]],
  hiddenBiases: [0, 0],
  outputWeights: [1, 1],
  outputBias: -0.5,
  outputActivation: 'step',
}

const independentNetwork: TinyNetworkConfig = {
  inputs: [-1, 2],
  hiddenWeights: [[-1, 1], [1, 0.5]],
  hiddenBiases: [-1, 0],
  outputWeights: [0.5, -1],
  outputBias: -0.5,
  outputActivation: 'sigmoid',
}

function TinyNetworkExercise({ config, guided, onSolved }: { config: TinyNetworkConfig; guided: boolean; onSolved: (correct: boolean) => void }) {
  const result = forwardTinyNetwork(config)
  const expected = [result.hidden[0].z, result.hidden[0].output, result.hidden[1].z, result.hidden[1].output, result.outputZ, result.output]
  const labels = ['은닉 뉴런 1의 가중합', '은닉 뉴런 1의 렐루 출력', '은닉 뉴런 2의 가중합', '은닉 뉴런 2의 렐루 출력', '출력층 가중합', '계단 함수 최종 출력']
  const required = guided ? [2, 3, 4, 5] : [0, 1, 2, 3, 4]
  const [answers, setAnswers] = useState<string[]>(Array(expected.length).fill(''))
  const [submitted, setSubmitted] = useState(false)
  const correct = required.every((index) => networkNumberMatches(answers[index], expected[index]))
  const hints = ['각 입력×가중치의 합에 첫 은닉 뉴런의 편향을 더하세요.', '렐루는 음수를 0으로, 0 이상은 그대로 보냅니다.', '같은 입력에 두 번째 뉴런의 가중치와 편향을 적용하세요.', '두 번째 가중합에 렐루를 적용하세요.', '원래 입력이 아니라 두 은닉 뉴런의 출력을 새 입력으로 사용하세요.', '출력층 가중합이 0 이상이면 1, 음수이면 0입니다.']
  return <>
    <TinyNetworkWalkthrough config={config} result={result} guided={guided} revealAnswers={submitted && correct} renderAnswer={(index) => {
        if (!required.includes(index)) return null
        const fieldCorrect = networkNumberMatches(answers[index], expected[index])
        return <label key={labels[index]} className="my-3 block rounded-xl bg-slate-50 p-3"><span className="mb-2 block text-sm font-bold">직접 계산 · {labels[index]}</span><input type="text" inputMode="decimal" value={answers[index]} onChange={(event) => {setAnswers((items) => items.map((answer, item) => item === index ? event.target.value : answer));setSubmitted(false);onSolved(false)}} aria-invalid={submitted && !fieldCorrect || undefined} aria-describedby={submitted ? `network-${guided ? 'guided' : 'independent'}-${index}-hint` : undefined} className={`min-h-12 w-full rounded-xl border px-4 font-black focus-visible:outline-3 focus-visible:outline-indigo-600 ${submitted ? fieldCorrect ? 'border-emerald-500 bg-emerald-50' : 'border-rose-500 bg-rose-50' : 'border-slate-300 bg-white'}`} />{submitted && <span id={`network-${guided ? 'guided' : 'independent'}-${index}-hint`} className={`mt-1 block text-sm font-semibold ${fieldCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>{fieldCorrect ? '✓ 맞음' : `✕ ${hints[index]}`}</span>}</label>
      }} />
    {config.outputActivation === 'sigmoid' && <p className="mt-5 rounded-xl bg-indigo-50 p-4 leading-7">시그모이드 함수의 출력은 앱이 계산해 제공합니다: 약 <strong>{result.output.toFixed(2)}</strong>. 지수 계산은 하지 않습니다. 은닉층의 출력과 출력층 가중합을 구한 뒤, 이 확률이 무엇을 뜻하는지 아래에서 판단하세요.</p>}
    <Button className="mt-5" disabled={required.some((index) => parseNetworkNumber(answers[index]) === null)} onClick={() => {setSubmitted(true);onSolved(correct)}}>전체 순전파 제출</Button>
    {submitted && <AnswerFeedback correct={correct} explanation={correct ? `은닉층에서 처리한 두 값이 출력층 입력이 됩니다. 출력층 가중합 ${result.outputZ} → 최종 출력 ${result.output.toFixed(config.outputActivation === 'sigmoid' ? 2 : 0)}입니다.` : '✕ 표시된 필드의 힌트를 따라 수정한 뒤 다시 제출하세요. 입력층은 데이터를 받고, 은닉층·출력층은 각자의 가중치·편향과 활성화 함수를 사용합니다.'} />}
  </>
}

export function Lesson04Step3(props: CommonStepProps) {
  return <StepFrame {...props} step={3} intro="입력 2개→은닉 뉴런 2개→출력 뉴런 1개의 작은 신경망을 안내에 따라 계산합니다."><div className="mt-6"><TinyNetworkExercise config={guidedNetwork} guided onSolved={(correct) => { if (correct) props.onComplete() }} /></div>{props.isComplete ? <StepCompletionMessage>두 은닉 뉴런과 출력 뉴런을 연결한 순전파를 안내에 따라 계산했습니다.</StepCompletionMessage> : null}</StepFrame>
}

export function Lesson04SequenceReference(props: CommonStepProps) {
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

export function Lesson04Step4(props: CommonStepProps) {
  const result = forwardTinyNetwork(independentNetwork)
  const [interpretation, setInterpretation] = useState<'class0' | 'class1' | null>(null)
  const [calculationSolved, setCalculationSolved] = useState(false)
  const [interpretationSubmitted, setInterpretationSubmitted] = useState(false)
  const ready = calculationSolved && interpretationSubmitted && interpretation === 'class1'

  useEffect(() => {
    if (!props.isComplete && ready) props.onComplete()
  }, [props, ready])

  return <StepFrame {...props} step={4} intro="같은 구조에서 가중합과 렐루 출력을 스스로 계산합니다. 시그모이드 출력은 제공된 값을 보고 한 클래스일 확률로 해석합니다."><div className="mt-6"><TinyNetworkExercise config={independentNetwork} guided={false} onSolved={setCalculationSolved} /></div><fieldset className="mt-7 rounded-2xl border border-indigo-200 bg-indigo-50 p-5"><legend className="font-black text-indigo-950">계산된 시그모이드 출력 약 {result.output.toFixed(2)}의 해석은?</legend><div className="mt-4 grid gap-3 sm:grid-cols-2"><Button variant={interpretation === 'class1' ? 'primary' : 'secondary'} aria-pressed={interpretation === 'class1'} onClick={() => { setInterpretation('class1'); setInterpretationSubmitted(false) }}>클래스 1일 확률이 0.5보다 크다</Button><Button variant={interpretation === 'class0' ? 'primary' : 'secondary'} aria-pressed={interpretation === 'class0'} onClick={() => { setInterpretation('class0'); setInterpretationSubmitted(false) }}>클래스 0일 확률이 0.5보다 크다</Button></div><Button className="mt-4" disabled={!interpretation} onClick={() => setInterpretationSubmitted(true)}>결과 해석 제출</Button>{interpretationSubmitted && <AnswerFeedback correct={interpretation === 'class1'} explanation={interpretation === 'class1' ? '이 출력은 클래스 1일 확률을 나타냅니다. 0.5를 분류 기준으로 쓰면 클래스 1로 예측하지만, 실제 정답인지는 레이블과 비교해야 합니다.' : 'Sigmoid에서 0.5를 기준으로 어느 쪽 확률이 더 큰지 다시 확인하세요.'} />}</fieldset>{props.isComplete ? <StepCompletionMessage>두 번째 작은 신경망의 순전파를 독립적으로 계산하고 출력 확률을 해석했습니다.</StepCompletionMessage> : null}</StepFrame>
}

type OutputField = 'type' | 'output' | 'activation'

interface OutputSelection {
  type?: string
  output?: string
  activation?: string
}

const outputOptions: Record<OutputField, readonly string[]> = {
  type: ['회귀', '이진 분류', '다중 분류'],
  output: ['연속적인 수치 출력', '출력 뉴런 1개', '클래스별 출력'],
  activation: ['출력값을 그대로 사용', 'Sigmoid', 'Softmax'],
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
    if (!answer) return false
    return answer.type === item.type && answer.output === item.output && answer.activation === item.activation
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
      <div className="grid gap-5 lg:grid-cols-3">
        <SimpleFlow
          items={['날씨 특징 입력', '은닉층', '연속적인 수치', '그대로 사용', '기온 예측']}
          label="사례 1 · 회귀 출력층"
        />
        <SimpleFlow
          items={['스팸 메일 입력', '은닉층', '출력 뉴런 1개', '시그모이드(sigmoid)', '스팸일 확률 0~1']}
          label="사례 2 · 이진 분류 출력층"
        />
        <SimpleFlow
          items={['동물 사진 입력', '은닉층', '클래스별 출력', '소프트맥스(softmax)', '고양이 / 강아지 / 토끼 확률']}
          label="사례 3 · 다중 분류 출력층"
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
                          {option === 'Sigmoid' ? '시그모이드(sigmoid)' : option === 'Softmax' ? '소프트맥스(softmax)' : option}
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
          세 상황 연결 확인
          <Check size={18} aria-hidden="true" />
        </Button>
        {submitted && (
          <AnswerFeedback
            correct={allCorrect}
            explanation={
              allCorrect
                ? '회귀는 연속 수치를 그대로 사용하고, 이진 분류는 Sigmoid, 다중 분류는 Softmax를 사용하도록 연결했습니다.'
                : '연속 숫자 예측·두 상태 분류·여러 클래스 분류에서 출력 형태가 어떻게 다른지 다시 비교하세요.'
            }
          />
        )}
      </section>

      <p className="mt-7 flex items-start gap-3 rounded-2xl bg-cyan-50 p-5 font-semibold leading-7 text-slate-800">
        <Lightbulb className="mt-0.5 shrink-0 text-cyan-700" size={22} aria-hidden="true" />
        출력층은 문제의 종류에 맞는 형태로 최종 결과를 만듭니다.
      </p>

      {props.isComplete && (
        <StepCompletionMessage>회귀·이진·다중 분류의 출력 형태와 활성화 함수를 모두 올바르게 설계했습니다.</StepCompletionMessage>
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
  const [simpleModel, setSimpleModel] = useState<'A' | 'B' | null>(null)
  const [complexModel, setComplexModel] = useState<'A' | 'B' | null>(null)
  const [risks, setRisks] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const comparisonCorrect = simpleModel === 'A' && complexModel === 'B' && risks.includes('time') && risks.includes('generalization') && risks.length === 2

  const submit = () => {
    if (!choice || !simpleModel || !complexModel || risks.length === 0) return
    setSubmitted(true)
    if (choice === 'B' && comparisonCorrect) props.onComplete()
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

      <section className="mt-8" aria-labelledby="model-comparison-title"><h3 id="model-comparison-title" className="text-xl font-black">두 모델의 조건 비교</h3><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[40rem] border-collapse text-left"><thead><tr className="bg-slate-100"><th className="p-3">비교</th><th className="p-3">신경망 A</th><th className="p-3">신경망 B</th></tr></thead><tbody>{[['은닉층 수','1개','3개'],['뉴런 수','적음','많음'],['표현 가능한 구조','비교적 단순','더 복잡'],['학습 시간','비교적 짧음','더 길 수 있음'],['필요 데이터','적은 편','더 많이 필요할 수 있음'],['주의점','복잡한 문제 표현 부족','과도하면 새 데이터 성능이 낮을 수 있음']].map((row) => <tr key={row[0]} className="border-t border-slate-200">{row.map((cell) => <td key={cell} className="p-3 font-semibold">{cell}</td>)}</tr>)}</tbody></table></div><div className="mt-6 grid gap-5 lg:grid-cols-2"><fieldset className="rounded-2xl border border-slate-200 p-5"><legend className="font-black">적은 데이터로 단순한 규칙을 구분한다면?</legend><div className="mt-3 grid grid-cols-2 gap-3"><Button variant={simpleModel === 'A' ? 'primary' : 'secondary'} aria-pressed={simpleModel === 'A'} onClick={() => { setSimpleModel('A'); setSubmitted(false) }}>A</Button><Button variant={simpleModel === 'B' ? 'primary' : 'secondary'} aria-pressed={simpleModel === 'B'} onClick={() => { setSimpleModel('B'); setSubmitted(false) }}>B</Button></div></fieldset><fieldset className="rounded-2xl border border-slate-200 p-5"><legend className="font-black">데이터가 충분한 복잡한 이미지 문제라면?</legend><div className="mt-3 grid grid-cols-2 gap-3"><Button variant={complexModel === 'A' ? 'primary' : 'secondary'} aria-pressed={complexModel === 'A'} onClick={() => { setComplexModel('A'); setSubmitted(false) }}>A</Button><Button variant={complexModel === 'B' ? 'primary' : 'secondary'} aria-pressed={complexModel === 'B'} onClick={() => { setComplexModel('B'); setSubmitted(false) }}>B</Button></div></fieldset></div><fieldset className="mt-5 rounded-2xl border border-slate-200 p-5"><legend className="font-black">단순한 문제에 지나치게 큰 모델을 쓰면 생길 수 있는 두 문제</legend><div className="mt-3 grid gap-3 sm:grid-cols-3">{[['time','학습 시간이 길어질 수 있음'],['generalization','새 데이터에서 성능이 낮을 수 있음'],['always','항상 정확도가 100%가 됨']].map(([id,label]) => <Button key={id} variant={risks.includes(id) ? 'primary' : 'secondary'} aria-pressed={risks.includes(id)} onClick={() => { setRisks((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items,id]); setSubmitted(false) }}>{risks.includes(id) ? <Check size={18} aria-hidden="true" /> : null}{label}</Button>)}</div></fieldset></section>

      <div className="mt-7 flex items-start gap-3 rounded-2xl bg-slate-100 p-5">
        <Sparkles className="mt-0.5 shrink-0 text-indigo-600" size={22} aria-hidden="true" />
        <p className="font-semibold leading-7 text-slate-800">여러 층이 중간 반응을 다시 조합하고 비선형 계산을 적용하면 복잡한 관계를 표현하는 데 도움이 됩니다. 그렇다고 층이 많을수록 항상 성능이 좋아지는 것은 아닙니다.</p>
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
        <Button className="mt-4" onClick={submit} disabled={!choice || !simpleModel || !complexModel || risks.length === 0}>비교 결과 제출</Button>
      </fieldset>
      {submitted && (
        <AnswerFeedback
          correct={choice === 'B' && comparisonCorrect}
          explanation={choice === 'B' && comparisonCorrect ? '문제와 데이터에 따라 적절한 구조가 다릅니다. 복잡성, 학습 시간과 새 데이터 성능을 함께 판단했습니다.' : '층이 많다고 항상 좋은 것은 아닙니다. 단순한 문제에는 작은 A, 복잡하고 데이터가 충분한 문제에는 B가 더 알맞을 수 있습니다.'}
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

export function Lesson04Step7({
  priorStepsComplete,
  onCompletionReadyChange,
  ...props
}: Step7Props) {
  const [section, setSection] = useState(0)
  const [quizIndex, setQuizIndex] = useState(0)
  const [structure, setStructure] = useState<string[]>([])
  const [structureSubmitted, setStructureSubmitted] = useState(false)
  const [details, setDetails] = useState<Record<string, DetailTarget | undefined>>({})
  const [detailsSubmitted, setDetailsSubmitted] = useState(false)
  const [features, setFeatures] = useState<string[]>([])
  const [inputCount, setInputCount] = useState<number | null>(null)
  const [hiddenLayers, setHiddenLayers] = useState<number | null>(null)
  const [hiddenActivation, setHiddenActivation] = useState<string | null>(null)
  const [outputCount, setOutputCount] = useState<number | null>(null)
  const [outputActivation, setOutputActivation] = useState<string | null>(null)
  const [designReason, setDesignReason] = useState<string | null>(null)
  const [designSubmitted, setDesignSubmitted] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Array<string | null>>([null, null, null, null])
  const [quizSubmitted, setQuizSubmitted] = useState([false, false, false, false])

  const structureCorrect =
    structure.length === 3 &&
    structure.every((id, index) => id === ['input', 'hidden', 'output'][index])
  const allDetailsConnected = detailConnections.every((item) => details[item.id])
  const detailsCorrect = detailConnections.every((item) => details[item.id] === item.answer)
  const allQuizSubmitted = quizSubmitted.every(Boolean)
  const allQuizCorrect = lesson04Quiz.every((quiz, index) => quizAnswers[index] === quiz.answer)
  const relevantFeatures = irisCards.filter((card) => card.target === 'input').map((card) => card.label as string)
  const designCorrect = features.length === relevantFeatures.length && features.every((feature) => relevantFeatures.includes(feature)) && inputCount === features.length && (hiddenLayers === 1 || hiddenLayers === 2) && hiddenActivation === 'ReLU' && outputCount === 3 && outputActivation === 'Softmax' && designReason === 'three-classes'
  const completionReady =
    priorStepsComplete &&
    structureSubmitted &&
    structureCorrect &&
    detailsSubmitted &&
    detailsCorrect &&
    designSubmitted &&
    designCorrect &&
    allQuizSubmitted &&
    allQuizCorrect

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
      <ReviewNavigation label="소구간 이동" current={section} onChange={setSection} items={[
        { label: '1. 신경망 기본 순서', purpose: '정보가 흐르는 순서대로 층을 배치해 제출하세요.', done: structureSubmitted && structureCorrect, remaining: '세 층 배치 후 기본 순서 확인' },
        { label: '2. 붓꽃 분류 신경망 설계', purpose: '선택한 특징과 분류할 종류에 맞춰 뉴런 수와 함수를 정하세요.', done: designSubmitted && designCorrect, remaining: '특징·뉴런 수·함수·이유 선택 후 구조 검사' },
        { label: '3. 역할·활성화 함수 연결', purpose: '층의 역할과 활성화 함수의 사용 위치를 연결하세요.', done: detailsSubmitted && detailsCorrect, remaining: '여섯 연결 후 세부 연결 확인' },
        { label: '4. 확인 문제', purpose: '신경망 구조의 특징을 문제마다 판단해 제출하세요.', done: allQuizSubmitted && allQuizCorrect, remaining: '네 문제 정답 제출' },
      ]} />
      <div hidden={section !== 0} aria-label="소구간 1 내용">
      <section aria-labelledby="complete-structure-title">
        <h3 id="complete-structure-title" className="text-xl font-black text-slate-950">1. 신경망 기본 순서 완성</h3>
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

      </div>
      <div hidden={section !== 1} aria-label="소구간 2 내용">
      <section className="mt-10 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 sm:p-6" aria-labelledby="new-network-design-title"><h3 id="new-network-design-title" className="text-xl font-black text-indigo-950">2. 붓꽃 종류 분류 신경망 설계</h3><p className="mt-2 leading-7 text-slate-700">꽃받침 길이·너비와 꽃잎 길이·너비, 네 수치로 붓꽃을 Setosa·Versicolor·Virginica의 세 종류로 분류합니다. 이번 작은 설계에서는 은닉층 1개 또는 2개를 검토합니다. 실제로 어느 구조가 좋은지는 결과를 평가해야 합니다.</p><fieldset className="mt-5"><legend className="font-black">사용할 네 수치 특징을 모두 선택</legend><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[...relevantFeatures,'사진 파일명'].map((feature) => <Button key={feature} variant={features.includes(feature) ? 'primary' : 'secondary'} aria-pressed={features.includes(feature)} onClick={() => { setFeatures((items) => items.includes(feature) ? items.filter((item) => item !== feature) : [...items,feature]); setDesignSubmitted(false) }}>{features.includes(feature) ? <Check size={18} aria-hidden="true" /> : null}{feature}</Button>)}</div></fieldset><p className="mt-4 rounded-xl bg-white p-3 leading-7">선택한 특징 {features.length}개 ↔ 입력 뉴런 {inputCount ?? '미선택'}개 · 분류할 종류 3개 ↔ 출력 뉴런 {outputCount ?? '미선택'}개<br />특징마다 입력 하나, 종류마다 출력 하나가 대응하는지 비교하세요.</p><div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{[
        { label: '입력 뉴런 수', value: inputCount ?? '', set: (value: string) => setInputCount(Number(value)), options: ['2','3','4','5'] },
        { label: '은닉층 수', value: hiddenLayers ?? '', set: (value: string) => setHiddenLayers(Number(value)), options: ['0','1','2','5'] },
        { label: '은닉층 활성화 함수', value: hiddenActivation ?? '', set: setHiddenActivation, options: ['ReLU','Sigmoid','Softmax'] },
        { label: '출력 뉴런 수', value: outputCount ?? '', set: (value: string) => setOutputCount(Number(value)), options: ['1','2','3','10'] },
        { label: '출력층 활성화 함수', value: outputActivation ?? '', set: setOutputActivation, options: ['ReLU','Sigmoid','Softmax'] },
        { label: '이 구조를 고른 이유', value: designReason ?? '', set: setDesignReason, options: ['three-classes','many-layers','file-name'], optionLabels: ['세 클래스를 확률로 비교해야 해서','층이 많을수록 항상 좋아서','파일명만 보면 되어서'] },
      ].map((field) => <label key={field.label} className="block"><span className="text-sm font-bold">{field.label}</span><select value={field.value} onChange={(event) => { field.set(event.target.value); setDesignSubmitted(false) }} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3"><option value="">선택</option>{field.options.map((option,index) => <option key={option} value={option}>{field.optionLabels?.[index] ?? (option === 'ReLU' ? '렐루(ReLU) 함수' : option === 'Sigmoid' ? '시그모이드(sigmoid) 함수' : option === 'Softmax' ? '소프트맥스(softmax) 함수' : option)}</option>)}</select></label>)}</div><Button className="mt-5" disabled={features.length !== relevantFeatures.length || inputCount === null || hiddenLayers === null || !hiddenActivation || outputCount === null || !outputActivation || !designReason} onClick={() => setDesignSubmitted(true)}>내 구조 검사</Button>{designSubmitted && <AnswerFeedback correct={designCorrect} explanation={designCorrect ? `선택한 특징 ${features.length}개와 입력 뉴런 수를 맞추고, 렐루 은닉층과 3개 소프트맥스 출력을 구성했습니다.` : '입력 뉴런 수는 선택한 유효 특징 수와 같아야 합니다. 네 수치 특징을 빠짐없이 선택해 입력 4개를 만들고, 세 붓꽃 종류에 대응하는 출력 3개와 소프트맥스가 필요합니다. 은닉층 1~2개는 모두 허용됩니다.'} />}</section>

      </div>
      <div hidden={section !== 2} aria-label="소구간 3 내용">
      <section className="mt-10" aria-labelledby="detail-connection-title">
        <div className="flex items-center gap-3">
          <Link2 className="text-indigo-600" size={24} aria-hidden="true" />
          <h3 id="detail-connection-title" className="text-xl font-black text-slate-950">3. 역할과 활성화 함수 연결</h3>
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

      </div>
      <div hidden={section !== 3} aria-label="소구간 4 내용">
      <section className="mt-10" aria-labelledby="lesson04-quiz-title">
        <h3 id="lesson04-quiz-title" className="text-xl font-black text-slate-950">4. 확인 문제 4개</h3>
        <p className="mt-2 leading-7 text-slate-600">오답은 해설을 확인하고 답을 바꾸어 다시 제출할 수 있습니다.</p>
        <ReviewNavigation label="확인 문제 이동" current={quizIndex} onChange={setQuizIndex} items={lesson04Quiz.map((question, index) => ({ label: `문제 ${index + 1}`, done: quizSubmitted[index] && quizAnswers[index] === question.answer, remaining: quizSubmitted[index] ? '오답 수정 후 재제출' : '선택 후 제출' }))} />
        <div className="mt-5 space-y-6">
          {lesson04Quiz.map((quiz, index) => (
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
                <AnswerFeedback correct={quizAnswers[index] === quiz.answer} explanation={quizAnswers[index] === quiz.answer ? quiz.explanation : '문제의 입력·출력 조건과 층의 역할을 다시 확인하세요.'} />
              )}
            </fieldset>
          ))}
        </div>
      </section>

      </div>
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
