import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Circle,
  CircleHelp,
  Database,
  Eye,
  Info,
  Layers3,
  Link2,
  RotateCcw,
  Sparkles,
  XCircle,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useLoadedLesson07Lab } from './Lesson07Context'
import { makeOneHot, mnistSourceUrl } from './mnistLoader'
import {
  datasetSizeDescriptions,
  lesson07Objectives,
  lesson07StepTitles,
  problemSolvingFlow,
} from './lesson07Data'
import { MnistCanvas, MnistPixelGrid } from './MnistCanvas'
import { MNIST_DATASET_SIZES, type MnistSample } from './mnistTypes'

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

function StepFrame({ step, intro, active, isComplete, children }: StepFrameProps) {
  const titleId = active ? 'lesson-step-title' : `lesson07-step-${step}-title`

  return (
    <Card as="section" hidden={!active} aria-labelledby={titleId} className="overflow-hidden">
      <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-50 via-white to-cyan-50 px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-black tracking-[0.15em] text-indigo-700">STEP {step}</span>
          <span
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm font-bold ${
              isComplete
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-white text-slate-600 ring-1 ring-slate-200'
            }`}
          >
            {isComplete ? <CheckCircle2 size={17} aria-hidden="true" /> : <Circle size={14} aria-hidden="true" />}
            {isComplete ? '활동 완료' : '활동 필요'}
          </span>
        </div>
        <h2
          id={titleId}
          tabIndex={active ? -1 : undefined}
          className="step-focus-target mt-4 text-2xl font-black leading-snug tracking-tight text-slate-950 focus:outline-none sm:text-3xl"
        >
          {lesson07StepTitles[step - 1]}
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{intro}</p>
      </div>
      <div className="px-5 py-7 sm:px-8 sm:py-9">{children}</div>
    </Card>
  )
}

function LabBadges() {
  return (
    <div className="flex flex-wrap gap-2" aria-label="실습 데이터 배지">
      <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm font-black text-indigo-800">
        <Database size={17} aria-hidden="true" />
        MNIST DATA LAB
      </span>
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-800">
        <CheckCircle2 size={17} aria-hidden="true" />
        REAL MNIST
      </span>
    </div>
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

function FlowArrow() {
  return (
    <>
      <ArrowDown className="mx-auto shrink-0 text-cyan-700 md:hidden" size={20} aria-hidden="true" />
      <ArrowRight className="mx-auto hidden shrink-0 text-cyan-700 md:block" size={20} aria-hidden="true" />
    </>
  )
}

function FlowChain({ items, label }: { items: readonly string[]; label: string }) {
  return (
    <div
      className="grid items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 md:grid-flow-col md:auto-cols-fr"
      aria-label={label}
    >
      {items.map((item, index) => (
        <div className="contents" key={`${item}-${index}`}>
          <div className="flex min-h-16 items-center justify-center rounded-xl border border-indigo-200 bg-white px-3 py-3 text-center font-black leading-6 text-indigo-950">
            {item}
          </div>
          {index < items.length - 1 ? <FlowArrow /> : null}
        </div>
      ))}
    </div>
  )
}

function SampleGallery({
  samples,
  selectedSampleId,
  onSelect,
}: {
  samples: readonly MnistSample[]
  selectedSampleId: string | null
  onSelect: (sample: MnistSample) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {samples.map((sample) => {
        const selected = sample.id === selectedSampleId
        return (
          <button
            key={sample.id}
            type="button"
            aria-pressed={selected}
            aria-label={`label ${sample.label}, sample ${sample.id} 선택`}
            onClick={() => onSelect(sample)}
            className={`min-w-0 rounded-2xl border p-3 text-left transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
              selected
                ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-indigo-300'
            }`}
          >
            <MnistCanvas sample={sample} size={112} className="mx-auto w-full" />
            <span className="mt-3 flex items-center justify-between gap-2">
              <strong className="text-lg text-slate-950">Label {sample.label}</strong>
              {selected ? <CheckCircle2 className="shrink-0 text-indigo-600" size={18} aria-hidden="true" /> : null}
            </span>
            <span className="mt-1 block truncate font-mono text-xs text-slate-500" title={sample.id}>
              {sample.id}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function LabelFilters() {
  const { selectedLabel, setSelectedLabel } = useLoadedLesson07Lab()
  const filters: Array<'all' | number> = ['all', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

  return (
    <div className="flex max-w-full flex-wrap gap-2" role="group" aria-label="숫자 label 필터">
      {filters.map((filter) => (
        <button
          key={filter}
          type="button"
          aria-pressed={selectedLabel === filter}
          onClick={() => setSelectedLabel(filter)}
          className={`flex min-h-11 min-w-11 items-center justify-center rounded-xl border px-3 font-black focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
            selectedLabel === filter
              ? 'border-indigo-600 bg-indigo-600 text-white'
              : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'
          }`}
        >
          {filter === 'all' ? '전체' : filter}
        </button>
      ))}
    </div>
  )
}

function PixelInformation({ sample, index }: { sample: MnistSample; index: number }) {
  const pixel = sample.pixels[index]
  const row = Math.floor(index / 28)
  const column = index % 28
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5" aria-live="polite">
      <div className="flex flex-wrap items-center gap-4">
        <span
          className="size-16 shrink-0 rounded-xl border border-slate-300 shadow-inner"
          style={{ backgroundColor: `rgb(${pixel} ${pixel} ${pixel})` }}
          aria-label={`픽셀 밝기 ${pixel}`}
        />
        <dl className="grid min-w-0 flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <dt className="text-xs font-bold text-slate-500">행 좌표</dt>
            <dd className="mt-1 font-mono text-lg font-black">{row + 1}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-slate-500">열 좌표</dt>
            <dd className="mt-1 font-mono text-lg font-black">{column + 1}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-slate-500">내부 index</dt>
            <dd className="mt-1 font-mono text-lg font-black">{index}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-slate-500">원본 픽셀값</dt>
            <dd className="mt-1 font-mono text-lg font-black">{pixel}</dd>
          </div>
        </dl>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">
        행과 열은 화면에서 1부터 세고, 코드는 0부터 시작하는 <strong>내부 index {index}</strong>를 사용합니다.
        사람이 말하는 배열 위치는 {index + 1}번째입니다.
      </p>
    </div>
  )
}

export function Lesson07Step1(props: CommonStepProps) {
  const {
    datasetSize,
    setDatasetSize,
    requestDataset,
    dataset,
    metadata,
    loadedDatasetSize,
  } = useLoadedLesson07Lab()
  const [balanceChoice, setBalanceChoice] = useState<'A' | 'B' | 'C' | null>(null)
  const distribution = useMemo(() => {
    const counts = Array.from({ length: 10 }, () => 0)
    dataset?.samples.forEach((sample) => {
      counts[sample.label] += 1
    })
    return counts
  }, [dataset])
  const loadedCurrentSelection = loadedDatasetSize === datasetSize
  const maxCount = Math.max(...distribution, 1)

  return (
    <StepFrame
      {...props}
      step={1}
      intro="전체 딥러닝 문제 해결 흐름에서 실제 데이터를 불러오고 전처리를 시작합니다."
    >
      <LabBadges />
      <p className="mt-4 font-bold leading-7 text-emerald-900">
        MNIST 전체 데이터 중 숫자 0~9를 균형 있게 추출한 실제 sample입니다.
      </p>

      <section className="mt-8" aria-labelledby="lesson07-flow-title">
        <h3 id="lesson07-flow-title" className="text-xl font-black text-slate-950">딥러닝 문제 해결의 전체 흐름</h3>
        <div className="mt-5"><FlowChain items={problemSolvingFlow} label="딥러닝 문제 해결의 여섯 단계" /></div>
        <p className="mt-4 leading-7 text-slate-600">
          Lesson 07은 실제 데이터를 탐색하고 모델의 입력과 정답을 준비합니다. 실제 학습과 성능 평가는 Lesson 08에서 진행합니다.
        </p>
      </section>

      <section className="mt-9" aria-labelledby="lesson07-objectives-title">
        <h3 id="lesson07-objectives-title" className="text-xl font-black text-slate-950">이번 차시에서 알아볼 것</h3>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {lesson07Objectives.map((objective, index) => (
            <li key={objective} className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 leading-7 text-slate-700">
              <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-700">{index + 1}</span>
              {objective}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-9" aria-labelledby="dataset-loader-title">
        <h3 id="dataset-loader-title" className="text-xl font-black text-slate-950">Dataset Loader</h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-bold text-slate-500">원본 MNIST</p>
            <p className="mt-2 font-black">Train {metadata.original.train.count.toLocaleString()}</p>
            <p className="mt-1 font-black">Test {metadata.original.test.count.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
            <p className="text-sm font-bold text-indigo-700">이번 수업용 Train subset</p>
            <p className="mt-2 text-2xl font-black text-indigo-950">{datasetSize.toLocaleString()}개</p>
            <p className="mt-1 text-sm text-slate-600">500 / 1,000 / 2,000 / 5,000 중 선택</p>
          </div>
          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
            <p className="text-sm font-bold text-cyan-800">Lesson 08 평가용 Test subset</p>
            <p className="mt-2 text-2xl font-black text-cyan-950">{metadata.testSubsetCount.toLocaleString()}개</p>
          </div>
        </div>

        <fieldset className="mt-6">
          <legend className="font-black text-slate-900">사용할 Train subset을 선택하세요</legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {MNIST_DATASET_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                role="radio"
                aria-checked={datasetSize === size}
                onClick={() => setDatasetSize(size)}
                className={`min-h-24 rounded-2xl border p-4 text-left focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  datasetSize === size
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-950'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300'
                }`}
              >
                <span className="block text-xl font-black">{size.toLocaleString()}개</span>
                <span className="mt-1 block text-sm font-semibold text-slate-600">{datasetSizeDescriptions[size]}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <Button className="mt-5" onClick={() => void requestDataset(datasetSize)}>
          <Database size={18} aria-hidden="true" />
          선택한 데이터 불러오기
        </Button>
      </section>

      <section className="mt-9" aria-labelledby="loaded-dataset-title">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="text-emerald-600" size={24} aria-hidden="true" />
          <h3 id="loaded-dataset-title" className="text-xl font-black text-slate-950">
            {dataset.count.toLocaleString()}장의 실제 MNIST 데이터를 불러왔습니다.
          </h3>
        </div>
        {!loadedCurrentSelection ? (
          <p className="mt-3 rounded-xl bg-amber-50 p-4 font-bold text-amber-950">
            화면의 선택은 {datasetSize.toLocaleString()}개이고 현재 데이터는 {loadedDatasetSize?.toLocaleString()}개입니다. 선택한 데이터를 불러오세요.
          </p>
        ) : null}
        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            ['현재 sample', `${dataset.count.toLocaleString()}개`],
            ['이미지 크기', `${dataset.imageWidth}×${dataset.imageHeight}`],
            ['픽셀 수', `${dataset.samples[0].pixels.length}개`],
            ['클래스', '0~9'],
            ['픽셀 범위', `${dataset.pixelRange[0]}~${dataset.pixelRange[1]}`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-100 p-4">
              <dt className="text-xs font-bold text-slate-500">{label}</dt>
              <dd className="mt-1 font-black text-slate-950">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 rounded-2xl border border-slate-200 p-5">
          <p className="font-black text-slate-900">실제 samples에서 계산한 숫자별 분포</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {distribution.map((count, label) => (
              <div key={label} className="grid grid-cols-[2rem_minmax(0,1fr)_3.5rem] items-center gap-3">
                <span className="font-black text-indigo-800">{label}</span>
                <span className="h-3 overflow-hidden rounded-full bg-slate-200">
                  <span className="block h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500" style={{ width: `${(count / maxCount) * 100}%` }} />
                </span>
                <span className="text-right font-mono font-bold text-slate-700">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <fieldset className="mt-9">
        <legend className="text-lg font-black leading-7 text-slate-950">왜 숫자별 데이터 개수를 비슷하게 준비했을까요?</legend>
        <div className="mt-4 grid gap-3">
          {[
            ['A', '각 숫자를 고르게 경험하도록 하기 위해'],
            ['B', '모든 픽셀값을 똑같이 만들기 위해'],
            ['C', '숫자 label을 없애기 위해'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={balanceChoice === key}
              onClick={() => setBalanceChoice(key as 'A' | 'B' | 'C')}
              className={`min-h-14 rounded-xl border px-4 py-3 text-left font-semibold ${
                balanceChoice === key ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300'
              }`}
            >
              {key}. {label}
            </button>
          ))}
        </div>
        {balanceChoice ? (
          <p className={`mt-4 flex items-start gap-2 rounded-xl p-4 font-semibold leading-6 ${balanceChoice === 'A' ? 'bg-emerald-50 text-emerald-950' : 'bg-rose-50 text-rose-950'}`} role="status">
            {balanceChoice === 'A' ? <CheckCircle2 className="mt-0.5 shrink-0" size={20} aria-hidden="true" /> : <XCircle className="mt-0.5 shrink-0" size={20} aria-hidden="true" />}
            {balanceChoice === 'A'
              ? '맞습니다. 특정 숫자만 지나치게 많이 학습되는 것을 줄이고 각 숫자를 고르게 경험하게 합니다.'
              : '픽셀이나 label을 바꾸는 것이 아니라 숫자 0~9의 sample 수를 비슷하게 준비한 이유를 생각해 보세요.'}
          </p>
        ) : null}
      </fieldset>

      <Button className="mt-6" disabled={!loadedCurrentSelection} onClick={props.onComplete}>
        <Eye size={18} aria-hidden="true" />
        실제 sample 수와 분포 확인 완료
      </Button>

      {props.isComplete ? <StepCompletionMessage>실제 fetch 결과에서 sample 수와 숫자 0~9 분포를 확인했습니다.</StepCompletionMessage> : null}
    </StepFrame>
  )
}

export function Lesson07Step2(props: CommonStepProps) {
  const {
    dataset,
    selectedSampleId,
    selectedLabel,
    selectSample,
    markExploredLabel,
    exploredLabels,
  } = useLoadedLesson07Lab()
  const [page, setPage] = useState(0)
  const pageSize = 10
  const filteredSamples = useMemo(
    () => dataset!.samples.filter((sample) => selectedLabel === 'all' || sample.label === selectedLabel),
    [dataset, selectedLabel],
  )
  const pageCount = Math.max(1, Math.ceil(filteredSamples.length / pageSize))
  const visibleSamples = filteredSamples.slice(page * pageSize, page * pageSize + pageSize)

  useEffect(() => setPage(0), [selectedLabel, dataset])
  useEffect(() => {
    if (exploredLabels.size >= 3 && !props.isComplete) props.onComplete()
  }, [exploredLabels, props.isComplete, props.onComplete])

  const chooseSample = (sample: MnistSample) => {
    selectSample(sample.id)
    markExploredLabel(sample.label)
  }

  return (
    <StepFrame {...props} step={2} intro="실제 손글씨를 label로 필터링하고 서로 다른 사람이 쓴 모양을 비교합니다.">
      <LabBadges />
      <section className="mt-7" aria-labelledby="digit-filter-title">
        <h3 id="digit-filter-title" className="text-xl font-black text-slate-950">숫자 필터</h3>
        <p className="mt-2 leading-7 text-slate-600">필터를 고른 뒤 실제 sample 카드를 눌러 탐색 기록을 남기세요.</p>
        <div className="mt-4"><LabelFilters /></div>
      </section>

      <section className="mt-7" aria-labelledby="sample-gallery-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 id="sample-gallery-title" className="text-xl font-black text-slate-950">실제 MNIST sample</h3>
            <p className="mt-1 text-sm text-slate-600">한 번에 {visibleSamples.length}장만 표시합니다. 전체 {filteredSamples.length.toLocaleString()}장</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">{page + 1} / {pageCount}쪽</span>
        </div>
        <div className="mt-5">
          <SampleGallery samples={visibleSamples} selectedSampleId={selectedSampleId} onSelect={chooseSample} />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="secondary" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>
            <ArrowLeft size={18} aria-hidden="true" /> 이전 sample
          </Button>
          <Button onClick={() => setPage((current) => (current + 1) % pageCount)}>
            다른 sample 보기 <ChevronRight size={18} aria-hidden="true" />
          </Button>
        </div>
      </section>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-indigo-50 p-4 font-bold leading-7 text-indigo-950">같은 숫자라도 사람마다 획의 굵기, 기울기와 모양이 다릅니다.</div>
        <div className="rounded-xl bg-slate-100 p-4">
          <p className="text-sm font-bold text-slate-600">실제 sample을 선택한 label</p>
          <p className="mt-2 font-mono text-lg font-black text-slate-950">{[...exploredLabels].sort((a, b) => a - b).join(', ') || '아직 없음'} ({exploredLabels.size}/3종)</p>
        </div>
      </div>
      {props.isComplete ? <StepCompletionMessage>서로 다른 숫자 label의 실제 sample을 3종 이상 선택했습니다.</StepCompletionMessage> : null}
    </StepFrame>
  )
}

export function Lesson07Step3(props: CommonStepProps) {
  const {
    selectedSample,
    selectedPixelIndex,
    selectPixel,
    markInspectedPixel,
    inspectedPixelIndexes,
  } = useLoadedLesson07Lab()
  const [showValues, setShowValues] = useState(false)
  const sample = selectedSample!
  const sawDark = [...inspectedPixelIndexes].some((index) => sample.pixels[index] <= 32)
  const sawBright = [...inspectedPixelIndexes].some((index) => sample.pixels[index] >= 128)

  useEffect(() => {
    if (inspectedPixelIndexes.size >= 5 && sawDark && sawBright && !props.isComplete) props.onComplete()
  }, [inspectedPixelIndexes, props.isComplete, props.onComplete, sawBright, sawDark])

  const inspectPixel = (index: number) => {
    selectPixel(index)
    markInspectedPixel(index)
  }

  return (
    <StepFrame {...props} step={3} intro="현재 선택한 실제 sample을 확대하여 한 칸의 위치와 밝기값을 직접 확인합니다.">
      <LabBadges />
      <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(17rem,0.9fr)]">
        <section aria-labelledby="pixel-grid-title">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 id="pixel-grid-title" className="text-xl font-black text-slate-950">28×28 픽셀 격자</h3>
              <p className="mt-1 font-mono text-sm text-slate-500">Label {sample.label} · {sample.id}</p>
            </div>
            <Button variant="secondary" aria-pressed={showValues} onClick={() => setShowValues((value) => !value)}>
              픽셀값 표시 {showValues ? 'ON' : 'OFF'}
            </Button>
          </div>
          <div className="mt-5 flex justify-center">
            <MnistPixelGrid sample={sample} selectedIndex={selectedPixelIndex} onSelect={inspectPixel} showSelectedValue={showValues} ariaLabel="확대된 실제 MNIST 픽셀 격자" />
          </div>
        </section>

        <section aria-labelledby="pixel-observation-title">
          <h3 id="pixel-observation-title" className="text-xl font-black text-slate-950">선택한 픽셀</h3>
          <div className="mt-5"><PixelInformation sample={sample} index={selectedPixelIndex} /></div>
          <dl className="mt-5 grid grid-cols-3 gap-3">
            {[
              ['Label', String(sample.label)],
              ['Pixels', `${sample.pixels.length}개`],
              ['Range', '0~255'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-100 p-3 text-center">
                <dt className="text-xs font-bold text-slate-500">{label}</dt>
                <dd className="mt-1 font-black">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 space-y-3">
            {[
              [inspectedPixelIndexes.size >= 5, `서로 다른 픽셀 ${Math.min(inspectedPixelIndexes.size, 5)}/5개`],
              [sawDark, '0에 가까운 검은 배경 픽셀'],
              [sawBright, '값이 큰 밝은 숫자 획 픽셀'],
            ].map(([done, label]) => (
              <div key={String(label)} className={`flex items-center gap-2 rounded-xl p-3 font-bold ${done ? 'bg-emerald-50 text-emerald-900' : 'bg-slate-100 text-slate-600'}`}>
                {done ? <CheckCircle2 size={19} aria-hidden="true" /> : <Circle size={17} aria-hidden="true" />}
                {label}
              </div>
            ))}
          </div>
        </section>
      </div>
      <p className="mt-7 rounded-xl bg-indigo-50 p-4 font-bold leading-7 text-indigo-950">이것은 그림 파일처럼 보이지만 AI에게는 행 우선 순서로 놓인 784개의 숫자입니다.</p>
      {props.isComplete ? <StepCompletionMessage>서로 다른 실제 픽셀과 검은 배경·밝은 획 값을 모두 관찰했습니다.</StepCompletionMessage> : null}
    </StepFrame>
  )
}

export function Lesson07Step4(props: CommonStepProps) {
  const { selectedSample, selectedPixelIndex, selectPixel } = useLoadedLesson07Lab()
  const sample = selectedSample!
  const [flattened, setFlattened] = useState(false)
  const [linkedFromImage, setLinkedFromImage] = useState(false)
  const [linkedFromArray, setLinkedFromArray] = useState(false)
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const answerCorrect = submitted && Number(answer) === 784
  const row = Math.floor(selectedPixelIndex / 28)
  const rowStart = row * 28
  const visibleIndexes = Array.from({ length: 28 }, (_, offset) => rowStart + offset)
  const ready = flattened && linkedFromImage && linkedFromArray && answerCorrect

  useEffect(() => {
    if (ready && !props.isComplete) props.onComplete()
  }, [props.isComplete, props.onComplete, ready])

  return (
    <StepFrame {...props} step={4} intro="28×28 이미지를 행 우선 순서로 읽어 DNN이 받을 784개 입력으로 펼칩니다.">
      <LabBadges />
      <div className="mt-7"><FlowChain items={['28행 × 28열 이미지', '첫 번째 행', '두 번째 행', '…', '784개 픽셀 배열']} label="MNIST 이미지를 행 우선 배열로 펼치는 과정" /></div>
      <Button className="mt-6" onClick={() => setFlattened(true)}>
        <Layers3 size={18} aria-hidden="true" /> 펼쳐 보기
      </Button>

      {flattened ? (
        <div className="mt-7 grid gap-7 lg:grid-cols-2">
          <section aria-labelledby="flatten-image-title">
            <h3 id="flatten-image-title" className="text-lg font-black text-slate-950">28×28 PIXEL IMAGE</h3>
            <p className="mt-2 text-sm text-slate-600">이미지 칸을 누르면 같은 배열 위치가 강조됩니다.</p>
            <div className="mt-4 flex justify-center">
              <MnistPixelGrid
                sample={sample}
                selectedIndex={selectedPixelIndex}
                onSelect={(index) => {
                  selectPixel(index)
                  setLinkedFromImage(true)
                }}
                ariaLabel="flatten과 연결된 MNIST 픽셀 격자"
              />
            </div>
          </section>

          <section aria-labelledby="flatten-array-title">
            <h3 id="flatten-array-title" className="text-lg font-black text-slate-950">FLATTENED INPUT</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">전체 배열은 실제로 {sample.pixels.length}개입니다. 화면에는 선택한 {row + 1}행의 28개 값을 보여줍니다.</p>
            <div className="mt-4 rounded-2xl bg-slate-100 p-4">
              <p className="font-mono text-sm font-bold text-slate-700">pixels[{rowStart}] … pixels[{rowStart + 27}]</p>
              <div className="mt-3 grid grid-cols-[repeat(7,minmax(0,1fr))] gap-1 sm:grid-cols-[repeat(14,minmax(0,1fr))]">
                {visibleIndexes.map((index) => (
                  <button
                    key={index}
                    type="button"
                    aria-pressed={selectedPixelIndex === index}
                    aria-label={`배열 위치 ${index + 1}, 값 ${sample.pixels[index]}`}
                    onClick={() => {
                      selectPixel(index)
                      setLinkedFromArray(true)
                    }}
                    className={`min-h-12 min-w-0 rounded-md px-0.5 py-1 text-center font-mono text-[10px] font-bold focus-visible:outline-2 focus-visible:outline-indigo-600 sm:text-xs ${
                      selectedPixelIndex === index ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-indigo-100'
                    }`}
                  >
                    <span className="block opacity-70">{index + 1}</span>
                    <span className="block">{sample.pixels[index]}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4 font-mono text-sm leading-7 text-indigo-950">
              [{sample.pixels.slice(0, 12).join(', ')}, …, {sample.pixels.slice(-8).join(', ')}]
            </div>
            <div className="mt-4"><PixelInformation sample={sample} index={selectedPixelIndex} /></div>
          </section>
        </div>
      ) : null}

      <fieldset className="mt-8">
        <legend className="text-lg font-black text-slate-950">28 × 28 = ?</legend>
        <div className="mt-4 flex max-w-sm flex-col gap-3 sm:flex-row">
          <input
            type="number"
            inputMode="numeric"
            value={answer}
            onChange={(event) => {
              setAnswer(event.target.value)
              setSubmitted(false)
            }}
            aria-label="28 곱하기 28의 답"
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-300 px-4 font-mono text-lg font-bold focus:border-indigo-500 focus:outline-none focus:ring-3 focus:ring-indigo-100"
          />
          <Button disabled={!answer} onClick={() => setSubmitted(true)}>입력 관계 확인</Button>
        </div>
        {submitted ? (
          <p className={`mt-4 flex items-center gap-2 font-bold ${answerCorrect ? 'text-emerald-800' : 'text-rose-800'}`} role="status">
            {answerCorrect ? <CheckCircle2 size={20} aria-hidden="true" /> : <XCircle size={20} aria-hidden="true" />}
            {answerCorrect ? '28 × 28 = 784, 모델 입력 노드 수도 784개입니다.' : '28개 열이 28행 있으므로 다시 계산해 보세요.'}
          </p>
        ) : null}
      </fieldset>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          [flattened, '실제 flatten 결과'],
          [linkedFromImage && linkedFromArray, '이미지 ↔ 배열 연결'],
          [answerCorrect, '입력 노드 784개'],
        ].map(([done, label]) => (
          <div key={String(label)} className={`flex items-center gap-2 rounded-xl p-4 font-bold ${done ? 'bg-emerald-50 text-emerald-900' : 'bg-slate-100 text-slate-600'}`}>
            {done ? <CheckCircle2 size={19} aria-hidden="true" /> : <Circle size={17} aria-hidden="true" />}{label}
          </div>
        ))}
      </div>
      {props.isComplete ? <StepCompletionMessage>실제 이미지 픽셀과 행 우선 배열 위치를 양방향으로 연결하고 784개 입력 관계를 확인했습니다.</StepCompletionMessage> : null}
    </StepFrame>
  )
}

export function Lesson07Step5(props: CommonStepProps) {
  const {
    selectedSample,
    selectedPixelIndex,
    selectPixel,
    markNormalizedComparison,
    normalizedComparedIndexes,
    normalizedInput,
    normalizeCurrentSample,
  } = useLoadedLesson07Lab()
  const sample = selectedSample!
  const [mode, setMode] = useState<'original' | 'normalized'>('original')
  const normalizedReady = normalizedInput?.sampleId === sample.id && normalizedInput.values.length === 784
  const selectedOriginal = sample.pixels[selectedPixelIndex]
  const selectedNormalized = selectedOriginal / 255

  useEffect(() => {
    if (normalizedComparedIndexes.size >= 5 && normalizedReady && !props.isComplete) props.onComplete()
  }, [normalizedComparedIndexes, normalizedReady, props.isComplete, props.onComplete])

  const comparePixel = (index: number) => {
    selectPixel(index)
    markNormalizedComparison(index)
  }

  const previewValues =
    mode === 'original'
      ? sample.pixels
      : normalizedReady
        ? normalizedInput.values
        : sample.pixels.map((pixel) => pixel / 255)

  return (
    <StepFrame {...props} step={5} intro="현재 실제 sample의 원본 배열은 보존하고, 255로 나눈 새로운 0~1 배열을 만듭니다.">
      <LabBadges />
      <div className="mt-7 flex flex-wrap gap-2" role="group" aria-label="픽셀값 표시 범위">
        {[
          ['original', '원본 0~255'],
          ['normalized', '정규화 0~1'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={mode === key}
            onClick={() => setMode(key as 'original' | 'normalized')}
            className={`min-h-11 rounded-xl border px-4 font-bold ${mode === key ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,0.85fr)]">
        <section aria-labelledby="normalize-grid-title">
          <h3 id="normalize-grid-title" className="text-xl font-black text-slate-950">실제 픽셀 선택</h3>
          <p className="mt-2 leading-7 text-slate-600">서로 다른 픽셀을 눌러 원본값과 계산된 정규화 값을 비교하세요.</p>
          <div className="mt-5 flex justify-center">
            <MnistPixelGrid sample={sample} selectedIndex={selectedPixelIndex} onSelect={comparePixel} ariaLabel="정규화 값을 비교할 실제 MNIST 픽셀 격자" />
          </div>
        </section>
        <section aria-labelledby="normalization-result-title">
          <h3 id="normalization-result-title" className="text-xl font-black text-slate-950">선택 픽셀 계산</h3>
          <div className="mt-5 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 text-center">
            <p className="font-mono text-lg font-black text-indigo-950">normalized = pixel / 255</p>
            <p className="mt-4 font-mono text-2xl font-black text-slate-950">{selectedOriginal} ÷ 255 = {selectedNormalized.toFixed(3)}</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-100 p-4 text-center">
              <p className="text-sm font-bold text-slate-500">원본값</p>
              <p className="mt-1 font-mono text-2xl font-black">{selectedOriginal}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4 text-center">
              <p className="text-sm font-bold text-emerald-700">정규화값</p>
              <p className="mt-1 font-mono text-2xl font-black">{selectedNormalized.toFixed(3)}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">현재 보기: {mode === 'original' ? `원본 ${selectedOriginal}` : `정규화 ${selectedNormalized.toFixed(3)}`}</p>
          <p className="mt-3 rounded-xl bg-slate-100 p-4 font-bold text-slate-800">비교한 서로 다른 픽셀 {Math.min(normalizedComparedIndexes.size, 5)}/5개</p>
        </section>
      </div>

      <section className="mt-8" aria-labelledby="normalize-all-title">
        <h3 id="normalize-all-title" className="text-xl font-black text-slate-950">784개 전체 입력</h3>
        <Button className="mt-4" onClick={normalizeCurrentSample}>
          <Sparkles size={18} aria-hidden="true" /> 전체 입력 정규화
        </Button>
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-black text-slate-950">{normalizedReady ? '새 정규화 배열' : '현재 원본 배열'}</p>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-700">길이 {previewValues.length}</span>
          </div>
          <p className="mt-4 break-words font-mono text-sm leading-7 text-slate-700">
            [{previewValues.slice(0, 14).map((value) => typeof value === 'number' && mode === 'normalized' ? value.toFixed(3) : value).join(', ')}, …, {previewValues.slice(-8).map((value) => typeof value === 'number' && mode === 'normalized' ? value.toFixed(3) : value).join(', ')}]
          </p>
          {normalizedReady ? (
            <p className="mt-4 flex items-center gap-2 font-bold text-emerald-800" role="status"><CheckCircle2 size={20} aria-hidden="true" /> 원본 배열은 유지하고 0~1 범위의 유한한 숫자 784개를 새로 만들었습니다.</p>
          ) : null}
        </div>
      </section>
      {props.isComplete ? <StepCompletionMessage>실제 픽셀 5개 이상을 비교하고 별도의 784개 정규화 배열을 만들었습니다.</StepCompletionMessage> : null}
    </StepFrame>
  )
}

export function Lesson07Step6(props: CommonStepProps) {
  const {
    dataset,
    selectedSample,
    selectedSampleId,
    selectedLabel,
    selectSample,
    markOneHotLabel,
    oneHotLabels,
  } = useLoadedLesson07Lab()
  const sample = selectedSample!
  const oneHot = makeOneHot(sample.label)
  const visibleSamples = useMemo(
    () => dataset!.samples.filter((item) => selectedLabel === 'all' || item.label === selectedLabel).slice(0, 10),
    [dataset, selectedLabel],
  )

  useEffect(() => {
    const vectorValid = oneHot.length === 10 && oneHot[sample.label] === 1 && oneHot.reduce<number>((sum, value) => sum + value, 0) === 1
    if (oneHotLabels.size >= 3 && vectorValid && !props.isComplete) props.onComplete()
  }, [oneHotLabels, props.isComplete, props.onComplete, sample.label])

  const chooseSample = (nextSample: MnistSample) => {
    selectSample(nextSample.id)
    markOneHotLabel(nextSample.label)
  }

  return (
    <StepFrame {...props} step={6} intro="현재 실제 sample의 label을 정답 위치만 1인 길이 10의 원-핫 벡터로 바꿉니다.">
      <LabBadges />
      <div className="mt-7"><LabelFilters /></div>
      <div className="mt-5"><SampleGallery samples={visibleSamples} selectedSampleId={selectedSampleId} onSelect={chooseSample} /></div>

      <section className="mt-8" aria-labelledby="one-hot-title">
        <h3 id="one-hot-title" className="text-xl font-black text-slate-950">Image → Label → One-hot</h3>
        <div className="mt-5 grid items-center gap-4 md:grid-cols-[minmax(8rem,0.6fr)_auto_minmax(7rem,0.5fr)_auto_minmax(0,1.5fr)]">
          <div className="rounded-2xl bg-slate-950 p-4 text-center"><MnistCanvas sample={sample} size={140} className="mx-auto" /><p className="mt-3 font-mono text-xs text-slate-300">{sample.id}</p></div>
          <FlowArrow />
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 text-center"><p className="text-sm font-bold text-indigo-700">실제 Label</p><p className="mt-2 text-4xl font-black text-indigo-950">{sample.label}</p></div>
          <FlowArrow />
          <div className="min-w-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-bold text-emerald-800">길이 10의 원-핫 정답</p>
            <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10">
              {oneHot.map((value, index) => (
                <div key={index} className={`rounded-lg p-2 text-center font-mono font-black ${value === 1 ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600'}`}>
                  <span className="block text-[10px] opacity-70">{index}</span>{value}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="font-black text-emerald-900">원-핫 벡터</p><p className="mt-2 leading-7 text-slate-700">실제 정답을 나타냅니다. 1의 위치가 현재 실제 label {sample.label}과 같습니다.</p></div>
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5"><p className="font-black text-cyan-900">Softmax</p><p className="mt-2 leading-7 text-slate-700">모델이 예측한 클래스별 확률입니다. 아직 모델을 학습하지 않았으므로 이 차시에서는 예측 확률을 만들지 않습니다.</p></div>
      </div>
      <p className="mt-5 rounded-xl bg-slate-100 p-4 font-bold text-slate-800">원-핫을 확인한 서로 다른 실제 label: {[...oneHotLabels].sort((a, b) => a - b).join(', ') || '아직 없음'} ({oneHotLabels.size}/3종)</p>
      {props.isComplete ? <StepCompletionMessage>서로 다른 실제 label 3종 이상에서 원-핫의 1 위치가 label과 일치함을 확인했습니다.</StepCompletionMessage> : null}
    </StepFrame>
  )
}

interface Step7Props extends CommonStepProps {
  priorStepsComplete: boolean
  onCompletionReadyChange: (ready: boolean) => void
}

type SourceId = 'pixels' | 'one-hot'
type TargetId = 'INPUT' | 'TARGET'

export function Lesson07Step7({ priorStepsComplete, onCompletionReadyChange, ...props }: Step7Props) {
  const { selectedSample, normalizedInput, metadata, dataset } = useLoadedLesson07Lab()
  const sample = selectedSample!
  const oneHot = makeOneHot(sample.label)
  const [selectedSource, setSelectedSource] = useState<SourceId | null>(null)
  const [connections, setConnections] = useState<Partial<Record<SourceId, TargetId>>>({})
  const [submitted, setSubmitted] = useState(false)
  const normalizedReady = normalizedInput?.sampleId === sample.id && normalizedInput.values.length === 784
  const allConnected = Boolean(connections.pixels && connections['one-hot'])
  const correct = connections.pixels === 'INPUT' && connections['one-hot'] === 'TARGET'
  const completionReady = submitted && correct && normalizedReady

  useEffect(() => {
    onCompletionReadyChange(completionReady)
  }, [completionReady, onCompletionReadyChange])

  const connectTo = (target: TargetId) => {
    if (!selectedSource) return
    setConnections((current) => {
      const next = { ...current }
      const otherSource: SourceId = selectedSource === 'pixels' ? 'one-hot' : 'pixels'
      if (next[otherSource] === target) delete next[otherSource]
      next[selectedSource] = target
      return next
    })
    setSelectedSource(null)
    setSubmitted(false)
  }

  return (
    <StepFrame {...props} step={7} intro="실제 sample에서 만든 입력과 정답을 DNN 학습 준비 흐름의 올바른 위치에 연결합니다.">
      <LabBadges />
      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5" aria-labelledby="input-data-flow-title">
          <h3 id="input-data-flow-title" className="text-xl font-black text-indigo-950">입력 데이터</h3>
          <div className="mt-5"><FlowChain items={['실제 MNIST 28×28 이미지', '원본 픽셀 784개', '0~1 정규화', 'DNN 입력 784']} label="실제 MNIST 입력 데이터 준비 흐름" /></div>
        </section>
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5" aria-labelledby="target-data-flow-title">
          <h3 id="target-data-flow-title" className="text-xl font-black text-emerald-950">정답 데이터</h3>
          <div className="mt-5"><FlowChain items={['실제 label', '길이 10의 원-핫 벡터', '학습 정답 TARGET']} label="실제 MNIST 정답 데이터 준비 흐름" /></div>
        </section>
      </div>

      <section className="mt-9" aria-labelledby="actual-sample-summary-title">
        <h3 id="actual-sample-summary-title" className="text-xl font-black text-slate-950">현재 실제 sample에서 만든 값</h3>
        <div className="mt-5 grid gap-5 md:grid-cols-[11rem_minmax(0,1fr)]">
          <div className="rounded-2xl bg-slate-950 p-4 text-center"><MnistCanvas sample={sample} size={140} className="mx-auto" /><p className="mt-3 text-white">Label <strong>{sample.label}</strong></p><p className="mt-1 truncate font-mono text-xs text-slate-300">{sample.id}</p></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className={`rounded-2xl p-5 ${normalizedReady ? 'bg-indigo-50' : 'bg-amber-50'}`}>
              <p className="text-sm font-bold text-slate-600">INPUT 후보</p>
              <p className="mt-2 font-black text-slate-950">정규화된 픽셀 {normalizedInput?.values.length ?? 0}개</p>
              <p className="mt-2 font-mono text-sm text-slate-600">{normalizedReady ? `[${normalizedInput.values.slice(0, 5).map((value) => value.toFixed(3)).join(', ')}, …]` : 'STEP 5에서 전체 입력을 정규화하세요.'}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-5">
              <p className="text-sm font-bold text-emerald-700">TARGET 후보</p>
              <p className="mt-2 font-black text-slate-950">길이 {oneHot.length}의 원-핫 벡터</p>
              <p className="mt-2 break-words font-mono text-sm text-slate-600">[{oneHot.join(', ')}]</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-9" aria-labelledby="model-structure-title">
        <h3 id="model-structure-title" className="text-xl font-black text-slate-950">Lesson 08에서 사용할 모델 구조</h3>
        <div className="mt-5"><FlowChain items={['입력층 784', '은닉층 100 + ReLU', '은닉층 50 + ReLU', '출력층 10 + Softmax']} label="MNIST 분류 DNN 구조" /></div>
        <p className="mt-4 rounded-xl bg-slate-100 p-4 font-bold text-slate-800">손실함수: CCEE</p>
        <p className="mt-3 text-sm leading-6 text-slate-600">이번 STEP에서는 model.fit(), Loss와 Accuracy를 실행하지 않습니다.</p>
      </section>

      <section className="mt-9" aria-labelledby="input-target-connection-title">
        <h3 id="input-target-connection-title" className="text-xl font-black text-slate-950">INPUT과 TARGET 연결</h3>
        <p className="mt-2 leading-7 text-slate-600">왼쪽 데이터 카드를 고른 뒤 들어갈 영역을 누르세요.</p>
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="font-black text-slate-800">1. 연결할 데이터</p>
            <div className="mt-3 grid gap-3">
              {[
                ['pixels', '정규화된 784개 픽셀값'],
                ['one-hot', '길이 10의 원-핫 벡터'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  disabled={id === 'pixels' && !normalizedReady}
                  aria-pressed={selectedSource === id}
                  onClick={() => setSelectedSource(id as SourceId)}
                  className={`min-h-16 rounded-xl border px-4 py-3 text-left font-bold focus-visible:outline-3 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${selectedSource === id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white'}`}
                >
                  {label}
                  {connections[id as SourceId] ? <span className="mt-1 block text-sm text-indigo-700">현재 연결: {connections[id as SourceId]}</span> : null}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-black text-slate-800">2. DNN의 위치</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(['INPUT', 'TARGET'] as const).map((target) => {
                const connectedSource = (Object.entries(connections) as Array<[SourceId, TargetId]>).find(([, value]) => value === target)?.[0]
                return (
                  <button
                    key={target}
                    type="button"
                    disabled={!selectedSource}
                    onClick={() => connectTo(target)}
                    className="min-h-28 rounded-2xl border-2 border-dashed border-cyan-400 bg-cyan-50 p-4 text-center focus-visible:outline-3 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50"
                  >
                    <span className="text-lg font-black text-cyan-950">{target}</span>
                    <span className="mt-2 block text-sm font-semibold text-slate-600">{connectedSource ? (connectedSource === 'pixels' ? '정규화 픽셀 784개' : '원-핫 벡터 10개') : '데이터를 선택해 연결'}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button disabled={!allConnected} onClick={() => setSubmitted(true)}><Link2 size={18} aria-hidden="true" /> 연결 확인</Button>
          <Button variant="ghost" onClick={() => { setConnections({}); setSelectedSource(null); setSubmitted(false) }}><RotateCcw size={18} aria-hidden="true" /> 초기화</Button>
        </div>
        {submitted ? (
          <div className={`mt-5 flex items-start gap-3 rounded-xl p-5 ${correct ? 'bg-emerald-50 text-emerald-950' : 'bg-rose-50 text-rose-950'}`} role="status">
            {correct ? <CheckCircle2 className="mt-0.5 shrink-0" size={22} aria-hidden="true" /> : <XCircle className="mt-0.5 shrink-0" size={22} aria-hidden="true" />}
            <div><p className="font-black">{correct ? '실제 MNIST 데이터의 학습 준비가 완료되었습니다.' : '두 데이터의 역할을 다시 확인하세요.'}</p><p className="mt-1 leading-6">{correct ? '정규화된 픽셀은 모델 입력, 원-핫 벡터는 예측과 비교할 실제 정답입니다.' : '784개 픽셀값은 INPUT으로, 실제 label에서 만든 원-핫 벡터는 TARGET으로 연결합니다.'}</p></div>
          </div>
        ) : null}
      </section>

      {completionReady && !props.isComplete ? (
        <div className="mt-7 flex items-start gap-3 rounded-2xl bg-amber-50 p-5 text-amber-950" role="status">
          <CircleHelp className="mt-0.5 shrink-0" size={21} aria-hidden="true" />
          <p className="leading-7">INPUT과 TARGET 연결을 마쳤습니다. {priorStepsComplete ? '화면 아래의 완료 버튼으로 Lesson 07을 완료하세요.' : '완료되지 않은 앞 STEP의 실제 데이터 활동을 마치면 완료 버튼이 활성화됩니다.'}</p>
        </div>
      ) : null}

      <details className="mt-9 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <summary className="flex min-h-11 cursor-pointer items-center gap-2 font-black text-slate-900 focus-visible:outline-3 focus-visible:outline-indigo-600"><Info size={20} aria-hidden="true" /> 데이터 정보</summary>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div><dt className="text-sm font-bold text-slate-500">Dataset</dt><dd className="mt-1 font-black">{metadata.datasetName}</dd></div>
          <div><dt className="text-sm font-bold text-slate-500">Original</dt><dd className="mt-1 leading-7">{metadata.sources.originalDataset.creators.join(', ')}<br />{metadata.sources.originalDataset.note}</dd></div>
          <div><dt className="text-sm font-bold text-slate-500">CSV conversion</dt><dd className="mt-1 font-black">{metadata.sources.csvConversion.converter} · {metadata.sources.csvConversion.name}</dd></div>
          <div><dt className="text-sm font-bold text-slate-500">이번 실습</dt><dd className="mt-1 leading-7">원본 MNIST Train과 Test에서 숫자 0~9를 균형 있게 추출한 교육용 subset</dd></div>
          <div><dt className="text-sm font-bold text-slate-500">전체 Train / Test</dt><dd className="mt-1 font-black">{metadata.original.train.count.toLocaleString()} / {metadata.original.test.count.toLocaleString()}</dd></div>
          <div><dt className="text-sm font-bold text-slate-500">이미지와 픽셀</dt><dd className="mt-1 font-black">{metadata.image.width}×{metadata.image.height} grayscale · {metadata.pixelRange[0]}~{metadata.pixelRange[1]}</dd></div>
        </dl>
        <p className="mt-5 text-sm text-slate-600">현재 불러온 Train subset: {dataset.count.toLocaleString()}개</p>
        <a href={mnistSourceUrl()} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center font-bold text-indigo-700 underline decoration-2 underline-offset-4 focus-visible:outline-3 focus-visible:outline-indigo-600">SOURCE.md 열기</a>
      </details>

      <section className="mt-9 rounded-2xl bg-gradient-to-br from-indigo-950 to-cyan-900 p-6 text-white sm:p-8" aria-labelledby="next-lab-title">
        <p className="text-sm font-black tracking-[0.18em] text-cyan-200">NEXT LAB</p>
        <h3 id="next-lab-title" className="mt-2 text-2xl font-black">실제 신경망을 학습시켜 보자</h3>
        <p className="mt-4 max-w-3xl leading-7 text-indigo-100">다음 차시에서는 지금 준비한 실제 MNIST 데이터를 이용해 브라우저에서 실제 딥러닝 모델을 학습합니다.</p>
        <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {['실제 Loss', '실제 Accuracy', '실제 Test 예측', '오분류 이미지 분석', '직접 숫자를 그려 예측'].map((item) => <li key={item} className="rounded-xl bg-white/10 p-3 text-sm font-bold">{item}</li>)}
        </ul>
      </section>

      {props.isComplete ? (
        <div className="mt-8 border-t border-emerald-200 pt-7">
          <div className="flex items-start gap-3 text-emerald-900" role="status"><CheckCircle2 className="mt-0.5 shrink-0" size={24} aria-hidden="true" /><div><h3 className="text-xl font-black">Lesson 07 완료</h3><p className="mt-2 leading-7">홈의 전체 진행도에 이 차시 완료가 반영되었습니다.</p></div></div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:border-indigo-300 focus-visible:outline-3 focus-visible:outline-indigo-600">Home에서 진행도 보기</Link>
            <Link to="/lesson/08" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 focus-visible:outline-3 focus-visible:outline-indigo-600">Lesson 08 미리 보기 <ArrowRight size={18} aria-hidden="true" /></Link>
          </div>
        </div>
      ) : null}
    </StepFrame>
  )
}
