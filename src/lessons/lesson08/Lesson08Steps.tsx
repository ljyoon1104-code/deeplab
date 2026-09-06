import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Circle,
  Database,
  Eye,
  FlaskConical,
  Info,
  LoaderCircle,
  Play,
  RotateCcw,
  Square,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { MnistCanvas } from '../lesson07/MnistCanvas'
import { MNIST_DATASET_SIZES, type MnistDatasetSize, type MnistSample } from '../lesson07/mnistTypes'
import DrawingCanvas from './DrawingCanvas'
import { useLesson08Lab } from './Lesson08Context'
import {
  MODEL_OPTIONS,
  REQUIRED_EXPERIMENT_COUNT,
  STATUS_LABELS,
  lesson08StepTitles,
} from './lesson08Data'
import TrainingMetricChart from './TrainingMetricChart'
import type { ExperimentRecord, Lesson08Epochs, Lesson08ModelType } from './lesson08Types'

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
  const titleId = active ? 'lesson-step-title' : `lesson08-step-${step}-title`
  return (
    <Card as="section" hidden={!active} aria-labelledby={titleId} className="overflow-hidden">
      <div className="border-b border-slate-200 bg-gradient-to-r from-violet-50 via-white to-cyan-50 px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-black tracking-[0.15em] text-violet-700">STEP {step}</span>
          <span
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm font-bold ${
              isComplete ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-slate-600 ring-1 ring-slate-200'
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
          {lesson08StepTitles[step - 1]}
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{intro}</p>
      </div>
      <div className="px-5 py-7 sm:px-8 sm:py-9">{children}</div>
    </Card>
  )
}

function LabBadges() {
  return (
    <div className="flex flex-wrap gap-2" aria-label="실습 배지">
      <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-black text-violet-800">
        <FlaskConical size={17} aria-hidden="true" /> MNIST TRAINING LAB
      </span>
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-800">
        <CheckCircle2 size={17} aria-hidden="true" /> REAL TRAINING
      </span>
    </div>
  )
}

function Completion({ children }: { children: ReactNode }) {
  return (
    <div className="mt-7 flex items-start gap-3 border-t border-emerald-200 pt-5 text-emerald-900" role="status">
      <CheckCircle2 className="mt-0.5 shrink-0" size={21} aria-hidden="true" />
      <p className="font-semibold leading-7">{children}</p>
    </div>
  )
}

function Notice({ children, danger = false }: { children: ReactNode; danger?: boolean }) {
  return (
    <div
      className={`mt-5 flex items-start gap-3 rounded-2xl border p-4 ${
        danger ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-cyan-200 bg-cyan-50 text-cyan-950'
      }`}
      role={danger ? 'alert' : 'note'}
    >
      {danger ? <AlertTriangle className="mt-0.5 shrink-0" size={20} /> : <Info className="mt-0.5 shrink-0" size={20} />}
      <div className="min-w-0 text-sm leading-6">{children}</div>
    </div>
  )
}

function ModelRequired() {
  const { startTraining, isBusy } = useLesson08Lab()
  return (
    <Notice>
      <p className="font-black">현재 메모리에 학습된 모델이 없습니다.</p>
      <p className="mt-1">새로고침하면 실험 요약은 남지만 모델 자체는 사라집니다. STEP 1과 STEP 2로 돌아가거나 같은 설정으로 다시 학습하세요.</p>
      <Button className="mt-3" onClick={() => void startTraining()} disabled={isBusy}>
        <Play size={17} aria-hidden="true" /> 같은 설정으로 실제 학습
      </Button>
    </Notice>
  )
}

function Percent({ value }: { value: number }) {
  return <>{(value * 100).toFixed(2)}%</>
}

function ProbabilityBars({ values, emphasis }: { values: readonly number[]; emphasis?: number }) {
  return (
    <div className="grid gap-2" aria-label="숫자 0부터 9까지 실제 Softmax 확률">
      {values.map((value, digit) => (
        <div
          key={digit}
          className={`grid grid-cols-[2rem_minmax(0,1fr)_4.5rem] items-center gap-3 rounded-xl px-3 py-2 ${
            digit === emphasis ? 'bg-violet-100 text-violet-950' : 'bg-slate-50 text-slate-700'
          }`}
        >
          <strong>{digit}</strong>
          <span className="h-3 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
            <span className="block h-full rounded-full bg-violet-600" style={{ width: `${Math.max(value * 100, 0.3)}%` }} />
          </span>
          <span className="text-right font-mono text-xs font-bold">{(value * 100).toFixed(2)}%</span>
        </div>
      ))}
      <p className="text-xs leading-5 text-slate-500">표시값은 반올림하므로 화면의 백분율 합이 정확히 100%로 보이지 않을 수 있습니다. 내부 계산은 반올림 전 확률을 사용합니다.</p>
    </div>
  )
}

export function Lesson08Step1(props: CommonStepProps) {
  const {
    datasetSize,
    epochs,
    modelType,
    summaryConfirmed,
    isBusy,
    setDatasetSize,
    setEpochs,
    setModelType,
    confirmSummary,
  } = useLesson08Lab()
  const [touched, setTouched] = useState({ data: false, epoch: false, model: false })
  const ready = Object.values(touched).every(Boolean)

  const confirm = () => {
    if (!ready) return
    confirmSummary()
    props.onComplete()
  }

  return (
    <StepFrame {...props} step={1} intro="학습에 사용할 실제 데이터 수, 반복 횟수와 신경망 구조를 직접 정합니다.">
      <LabBadges />
      <p className="mt-4 leading-7 text-slate-700">실제 MNIST 데이터와 실제 신경망으로 학습합니다. 학습 결과는 기기와 실행 시점에 따라 조금씩 달라질 수 있습니다.</p>

      <div className="mt-7 grid gap-7">
        <fieldset disabled={isBusy}>
          <legend className="text-lg font-black text-slate-950">1. 학습 데이터 수</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {MNIST_DATASET_SIZES.map((size) => {
              const descriptions: Record<MnistDatasetSize, string> = {
                500: '빠른 실험', 1000: '기본 실험', 2000: '더 많은 데이터', 5000: '가장 많은 수업용 데이터',
              }
              return (
                <button
                  key={size}
                  type="button"
                  aria-pressed={datasetSize === size}
                  onClick={() => { setDatasetSize(size); setTouched((value) => ({ ...value, data: true })) }}
                  className={`rounded-2xl border p-4 text-left focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-violet-600 ${datasetSize === size ? 'border-violet-500 bg-violet-50' : 'border-slate-200 bg-white'}`}
                >
                  <strong className="block text-xl">{size.toLocaleString()}개</strong>
                  <span className="mt-1 block text-sm text-slate-600">{descriptions[size]}</span>
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-sm text-slate-500">데이터 수가 많다고 언제나 정확도가 높아지는 것은 아닙니다. 실제 결과로 비교해 봅니다.</p>
        </fieldset>

        <fieldset disabled={isBusy}>
          <legend className="text-lg font-black text-slate-950">2. Epoch</legend>
          <p className="mt-1 text-sm leading-6 text-slate-600">전체 학습 데이터를 한 번 사용하여 학습하는 것을 1 Epoch라고 합니다.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {([1, 3, 5] as Lesson08Epochs[]).map((value) => (
              <button key={value} type="button" aria-pressed={epochs === value} onClick={() => { setEpochs(value); setTouched((item) => ({ ...item, epoch: true })) }} className={`min-h-12 min-w-20 rounded-xl border px-5 font-black ${epochs === value ? 'border-violet-500 bg-violet-600 text-white' : 'border-slate-200 bg-white text-slate-800'}`}>
                {value} Epoch
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset disabled={isBusy}>
          <legend className="text-lg font-black text-slate-950">3. 모델 구조</legend>
          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            {(Object.keys(MODEL_OPTIONS) as Lesson08ModelType[]).map((type) => {
              const option = MODEL_OPTIONS[type]
              return (
                <button key={type} type="button" aria-pressed={modelType === type} onClick={() => { setModelType(type); setTouched((item) => ({ ...item, model: true })) }} className={`rounded-2xl border p-5 text-left ${modelType === type ? 'border-violet-500 bg-violet-50' : 'border-slate-200 bg-white'}`}>
                  <span className="text-xs font-black tracking-wide text-violet-700">{type === 'textbook' ? '교과서에서 학습한 구조' : '실험용 비교 모델'}</span>
                  <strong className="mt-2 block text-lg">{option.name}</strong>
                  <span className="mt-2 block text-sm leading-6 text-slate-600">{option.shortStructure}</span>
                </button>
              )
            })}
          </div>
        </fieldset>
      </div>

      <div className="mt-7 rounded-2xl border border-violet-200 bg-violet-50 p-5">
        <h3 className="font-black text-violet-950">실행 조건 요약</h3>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div><dt className="text-slate-500">Train</dt><dd className="font-black">{datasetSize.toLocaleString()}개</dd></div>
          <div><dt className="text-slate-500">Epoch</dt><dd className="font-black">{epochs}</dd></div>
          <div><dt className="text-slate-500">모델</dt><dd className="font-black">{MODEL_OPTIONS[modelType].name}</dd></div>
          <div><dt className="text-slate-500">최적화 방법</dt><dd className="font-black">Adam</dd></div>
          <div><dt className="text-slate-500">손실함수</dt><dd className="font-black">CCEE</dd></div>
          <div><dt className="text-slate-500">배치 크기</dt><dd className="font-black">32</dd></div>
        </dl>
        <Button className="mt-5" onClick={confirm} disabled={!ready || isBusy}>
          <CheckCircle2 size={18} aria-hidden="true" /> 이 실행 조건 확인
        </Button>
        {!ready ? <p className="mt-2 text-sm text-slate-600">세 종류의 조건을 각각 한 번 선택해 주세요.</p> : null}
      </div>
      {isBusy ? <Notice>학습이 끝날 때까지 현재 실행 조건은 잠겨 있습니다.</Notice> : null}
      {props.isComplete || summaryConfirmed ? <Completion>Train 수, Epoch, 모델 구조를 선택하고 실행 조건을 확인했습니다.</Completion> : null}
    </StepFrame>
  )
}

export function Lesson08Step2(props: CommonStepProps) {
  const lab = useLesson08Lab()
  const running = [
    'loading-data',
    'loading-engine',
    'converting-data',
    'preparing-model',
    'training',
    'summarizing',
  ].includes(lab.status)
  const hasMeasuredProgress = Boolean(lab.batchProgress) || Boolean(lab.trainingResult)
  const hasIndeterminateProgress = running && !hasMeasuredProgress
  const measuredPercentage = lab.trainingResult
    ? 100
    : lab.batchProgress && lab.batchProgress.totalBatches > 0
      ? Math.min(
          99,
          Math.max(
            0,
            (lab.batchProgress.completedBatches / lab.batchProgress.totalBatches) * 100,
          ),
        )
      : 0
  const progressEpochs = lab.trainingResult?.config.epochs ?? lab.epochs
  const progressLabel = lab.trainingResult
    ? '학습 완료 · 전체 진행률 100%'
    : lab.batchProgress
      ? `Epoch ${lab.batchProgress.currentEpoch} / ${progressEpochs}, Batch ${lab.batchProgress.batchInEpoch} / ${lab.batchProgress.batchesPerEpoch}, 전체 진행률 ${Math.floor(measuredPercentage)}%`
      : STATUS_LABELS[lab.status]

  return (
    <StepFrame {...props} step={2} intro="선택한 실제 MNIST Train subset으로 새 신경망을 만들고 학습합니다.">
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="flex items-center gap-2 text-lg font-black"><Database size={20} /> 실제 학습 흐름</h3>
          <ol className="mt-4 grid gap-2 text-sm leading-6 text-slate-700">
            {['Train JSON 불러오기와 구조 확인', '픽셀값 ÷ 255, 입력 shape [N, 784]', 'label 원-핫, 정답 shape [N, 10]', '선택 구조로 새 모델 생성과 학습'].map((item, index) => (
              <li key={item} className="flex gap-3"><span className="font-black text-violet-700">{index + 1}</span><span>{item}</span></li>
            ))}
          </ol>
          <p className="mt-4 text-sm leading-6 text-slate-600">Train은 가중치와 편향을 학습하는 데만 사용합니다. 새 실험은 이전 모델을 이어 쓰지 않고 새 모델로 시작합니다.</p>
        </div>

        <div className="rounded-2xl border border-violet-200 bg-white p-5" aria-busy={running}>
          <p className="text-xs font-black tracking-[0.15em] text-violet-700">TRAINING STATUS</p>
          <div className="mt-2 flex items-center gap-2" role="status" aria-live="polite" aria-atomic="true">
            {running ? <LoaderCircle className="shrink-0 animate-spin text-violet-600" size={21} aria-hidden="true" /> : null}
            <h3 className="text-xl font-black">{STATUS_LABELS[lab.status]}</h3>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-slate-500">Train sample</dt><dd className="font-black">{(lab.trainingResult?.config.datasetSize ?? lab.datasetSize).toLocaleString()}</dd></div>
            <div><dt className="text-slate-500">모델</dt><dd className="font-black">{MODEL_OPTIONS[lab.trainingResult?.config.modelType ?? lab.modelType].name}</dd></div>
            <div><dt className="text-slate-500">Epoch</dt><dd className="font-black">{lab.currentEpoch} / {lab.trainingResult?.config.epochs ?? lab.epochs}</dd></div>
            <div><dt className="text-slate-500">backend</dt><dd className="font-mono font-black">{lab.backend ?? '준비 전'}</dd></div>
            <div><dt className="text-slate-500">현재 Loss</dt><dd className="font-mono font-black">{lab.liveMetric ? lab.liveMetric.loss.toFixed(4) : '—'}</dd></div>
            <div><dt className="text-slate-500">현재 Accuracy</dt><dd className="font-mono font-black">{lab.liveMetric ? <Percent value={lab.liveMetric.accuracy} /> : '—'}</dd></div>
            <div className="col-span-2"><dt className="text-slate-500">경과 시간</dt><dd className="font-mono font-black">{(lab.elapsedMs / 1000).toFixed(1)}초</dd></div>
          </dl>
          <div className="mt-5">
            <div className="flex items-center justify-between gap-3 text-sm font-bold text-slate-700">
              <span>학습 진행률</span>
              <span className="tabular-nums">
                {hasMeasuredProgress ? `${Math.floor(measuredPercentage)}%` : '준비 중…'}
              </span>
            </div>
            <div
              className={`mt-2 h-3 overflow-hidden rounded-full bg-slate-200 ${
                hasIndeterminateProgress ? 'training-progress-indeterminate' : ''
              }`}
              role="progressbar"
              aria-label="실제 모델 학습 진행률"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={hasMeasuredProgress ? Math.floor(measuredPercentage) : undefined}
              aria-valuetext={progressLabel}
            >
              <span
                className="block h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 transition-[width] duration-200"
                style={{
                  width: hasMeasuredProgress
                    ? `${measuredPercentage}%`
                    : hasIndeterminateProgress
                      ? '35%'
                      : '0%',
                }}
              />
            </div>
            {lab.batchProgress ? (
              <p className="mt-2 text-sm font-semibold text-slate-600">
                Epoch {lab.batchProgress.currentEpoch} / {progressEpochs} · Batch{' '}
                {lab.batchProgress.batchInEpoch} / {lab.batchProgress.batchesPerEpoch} · 완료{' '}
                {lab.batchProgress.completedBatches} / {lab.batchProgress.totalBatches} Batch
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-600">
                {running
                  ? `${STATUS_LABELS[lab.status]}… 정확한 Batch 진행률이 준비되면 표시합니다.`
                  : '학습을 시작하면 실제 Batch 완료 수로 진행률을 표시합니다.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {lab.error && ['data', 'engine', 'model', 'training'].includes(lab.error.kind) ? (
        <Notice danger><p className="font-black">{lab.error.message}</p><p className="mt-1 break-words">{lab.error.detail}</p></Notice>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={() => void lab.startTraining()} disabled={lab.isBusy}>
          {running ? <LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
          {running ? '실제 모델 학습 중…' : lab.trainingResult ? '새 모델로 다시 학습' : '실제 모델 학습 시작'}
        </Button>
        {running ? <Button variant="danger" onClick={lab.cancelTraining}><Square size={17} aria-hidden="true" /> 학습 취소</Button> : null}
      </div>

      {lab.status === 'cancelled' ? (
        <Notice>
          <p className="font-black">학습이 취소되었습니다.</p>
          <p className="mt-1">진행률은 다음 학습을 시작할 때 0부터 다시 계산됩니다.</p>
        </Notice>
      ) : null}

      {lab.trainingResult ? (
        <div className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <h3 className="font-black text-emerald-950">실제 학습 완료 결과</h3>
          <dl className="mt-3 grid gap-3 sm:grid-cols-4">
            <div><dt className="text-sm text-slate-600">최종 Train Loss</dt><dd className="font-mono text-lg font-black">{lab.trainingResult.finalLoss.toFixed(4)}</dd></div>
            <div><dt className="text-sm text-slate-600">최종 Train Accuracy</dt><dd className="font-mono text-lg font-black"><Percent value={lab.trainingResult.finalAccuracy} /></dd></div>
            <div><dt className="text-sm text-slate-600">완료 Epoch</dt><dd className="font-mono text-lg font-black">{lab.trainingResult.completedEpochs}</dd></div>
            <div><dt className="text-sm text-slate-600">학습 시간</dt><dd className="font-mono text-lg font-black">{(lab.trainingResult.durationMs / 1000).toFixed(2)}초</dd></div>
          </dl>
          <Button className="mt-5" onClick={props.onComplete}>
            <CheckCircle2 size={18} aria-hidden="true" /> 실제 학습 결과 확인
          </Button>
        </div>
      ) : null}
      {props.isComplete ? (
        <Completion>
          {lab.trainingResult
            ? '실제 model.fit()이 완료되어 마지막 Loss와 Accuracy를 확인했습니다.'
            : '이 STEP의 완료 기록이 저장되어 있습니다. 현재 메모리의 모델이 필요하면 실제 학습을 다시 실행하세요.'}
        </Completion>
      ) : null}
    </StepFrame>
  )
}

export function Lesson08Step3(props: CommonStepProps) {
  const { trainingResult, modelReady } = useLesson08Lab()
  const [viewedLoss, setViewedLoss] = useState(false)
  const [viewedAccuracy, setViewedAccuracy] = useState(false)
  const [lastChecked, setLastChecked] = useState(false)
  const [lossReading, setLossReading] = useState<'down' | 'up' | 'similar' | null>(null)
  const [accuracyReading, setAccuracyReading] = useState<'down' | 'up' | 'similar' | null>(null)
  const [submitted, setSubmitted] = useState(false)

  if (!trainingResult) {
    return <StepFrame {...props} step={3} intro="실제 epoch 기록을 그래프로 읽고 Loss와 Accuracy의 의미를 구분합니다."><ModelRequired /></StepFrame>
  }
  const first = trainingResult.history[0]
  const last = trainingResult.history.at(-1) ?? first
  const classify = (start: number, end: number) => Math.abs(end - start) < 0.0001 ? 'similar' : end < start ? 'down' : 'up'
  const complete = viewedLoss && viewedAccuracy && lastChecked && submitted
  const finish = () => {
    if (!complete) return
    props.onComplete()
  }

  return (
    <StepFrame {...props} step={3} intro="callback에서 수집한 실제 epoch history만 이용해 두 지표의 변화를 살펴봅니다.">
      {!modelReady ? <ModelRequired /> : null}
      <div className="grid gap-5 lg:grid-cols-2">
        <TrainingMetricChart title="Epoch별 Loss" metric="loss" history={trainingResult.history} onInspect={() => setViewedLoss(true)} />
        <TrainingMetricChart title="Epoch별 Accuracy" metric="accuracy" history={trainingResult.history} onInspect={() => setViewedAccuracy(true)} />
      </div>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <caption className="px-4 py-3 text-left font-black">실제 history 값</caption>
          <thead className="bg-slate-100"><tr><th className="px-4 py-3">Epoch</th><th className="px-4 py-3">Loss</th><th className="px-4 py-3">Accuracy</th></tr></thead>
          <tbody>{trainingResult.history.map((item) => <tr key={item.epoch} className="border-t border-slate-200"><td className="px-4 py-3 font-black">{item.epoch}</td><td className="px-4 py-3 font-mono">{item.loss.toFixed(6)}</td><td className="px-4 py-3 font-mono"><Percent value={item.accuracy} /></td></tr>)}</tbody>
        </table>
      </div>
      <label className="mt-4 flex items-start gap-3 rounded-xl bg-slate-50 p-4">
        <input type="checkbox" className="mt-1 size-5" checked={lastChecked} onChange={(event) => setLastChecked(event.target.checked)} />
        <span>마지막 Epoch의 Loss <strong>{last.loss.toFixed(4)}</strong>와 Accuracy <strong><Percent value={last.accuracy} /></strong>를 확인했습니다.</span>
      </label>

      <div className="mt-6 rounded-2xl border border-slate-200 p-5">
        <h3 className="font-black">이번 실행 결과 해석</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">Loss는 틀린 정도, Accuracy는 맞힌 비율로 서로 같은 지표가 아닙니다. 각 지표의 첫 epoch와 마지막 epoch를 비교하세요.</p>
        {(['loss', 'accuracy'] as const).map((metric) => {
          const value = metric === 'loss' ? lossReading : accuracyReading
          const setValue = metric === 'loss' ? setLossReading : setAccuracyReading
          return (
            <fieldset key={metric} className="mt-4">
              <legend className="font-bold">{metric === 'loss' ? 'Loss' : 'Accuracy'}는 어떻게 달라졌나요?</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {([['down', '감소'], ['up', '증가'], ['similar', '거의 같음']] as const).map(([key, label]) => <button key={key} type="button" aria-pressed={value === key} onClick={() => { setValue(key); setSubmitted(false) }} className={`min-h-11 rounded-xl border px-4 font-bold ${value === key ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-300 bg-white'}`}>{label}</button>)}
              </div>
            </fieldset>
          )
        })}
        <Button className="mt-5" onClick={() => setSubmitted(true)} disabled={!lossReading || !accuracyReading}>해석 제출</Button>
        {submitted ? <Notice><p>실제 값 기준: Loss는 <strong>{classify(first.loss, last.loss) === 'down' ? '감소' : classify(first.loss, last.loss) === 'up' ? '증가' : '거의 같음'}</strong>, Accuracy는 <strong>{classify(first.accuracy, last.accuracy) === 'up' ? '증가' : classify(first.accuracy, last.accuracy) === 'down' ? '감소' : '거의 같음'}</strong>했습니다.</p><p className="mt-1">매 epoch가 같은 방향으로 움직인다고 보장할 수 없고, 다른 실행에서도 같은 값이 나온다고 보장할 수 없습니다.</p></Notice> : null}
        <Button className="mt-5" onClick={finish} disabled={!complete}>STEP 3 활동 완료</Button>
      </div>
      {props.isComplete ? <Completion>두 실제 그래프와 마지막 값을 확인하고 Loss와 Accuracy를 구분해 해석했습니다.</Completion> : null}
    </StepFrame>
  )
}

export function Lesson08Step4(props: CommonStepProps) {
  const { modelReady, trainingResult, evaluation, evaluateTest, status, error } = useLesson08Lab()
  const [compared, setCompared] = useState(false)
  const finish = () => {
    if (!evaluation || !compared) return
    props.onComplete()
  }

  return (
    <StepFrame {...props} step={4} intro="학습에 넣지 않은 실제 Test 500개를 현재 모델의 predict()로 평가합니다.">
      {!modelReady ? <ModelRequired /> : (
        <>
          <Notice>Train subset은 가중치와 편향 학습에만, Test 500은 학습이 끝난 현재 모델의 평가에만 사용합니다. Test 결과로 모델을 다시 학습하지 않습니다.</Notice>
          <Button
            className="mt-5"
            onClick={() => void evaluateTest()}
            disabled={status === 'evaluating'}
            aria-busy={status === 'evaluating'}
          >
            {status === 'evaluating' ? <LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
            {status === 'evaluating' ? 'Test 500개 평가 중…' : 'Test 500개로 평가하기'}
          </Button>
          {status === 'evaluating' ? (
            <p className="mt-3 flex items-center gap-2 text-sm font-bold text-violet-800" role="status" aria-live="polite">
              <LoaderCircle className="animate-spin" size={17} aria-hidden="true" />
              학습에 사용하지 않은 Test JSON을 불러와 실제 model.predict()를 실행하고 있습니다.
            </p>
          ) : null}
        </>
      )}
      {error?.kind === 'evaluation' ? <Notice danger><p className="font-black">{error.message}</p><p className="mt-1">{error.detail}</p><Button className="mt-3" onClick={() => void evaluateTest()}><RotateCcw size={17} /> 다시 시도</Button></Notice> : null}
      {evaluation && trainingResult ? (
        <div className="mt-7">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-slate-100 p-5"><p className="text-sm text-slate-600">Test sample</p><p className="mt-1 text-2xl font-black">{evaluation.sampleCount}</p></div>
            <div className="rounded-2xl bg-emerald-50 p-5"><p className="text-sm text-emerald-800">정답 수</p><p className="mt-1 text-2xl font-black text-emerald-950">{evaluation.correct}</p></div>
            <div className="rounded-2xl bg-rose-50 p-5"><p className="text-sm text-rose-800">오답 수</p><p className="mt-1 text-2xl font-black text-rose-950">{evaluation.wrong}</p></div>
            <div className="rounded-2xl bg-violet-50 p-5"><p className="text-sm text-violet-800">Test Accuracy</p><p className="mt-1 text-2xl font-black text-violet-950"><Percent value={evaluation.accuracy} /></p></div>
          </div>
          <p className="mt-3 text-sm font-bold text-slate-700">{evaluation.correct} + {evaluation.wrong} = {evaluation.sampleCount} · Test Accuracy = {evaluation.correct} ÷ {evaluation.sampleCount} × 100</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-cyan-200 p-5"><p className="text-sm text-slate-600">Train Accuracy</p><p className="mt-1 text-2xl font-black"><Percent value={trainingResult.finalAccuracy} /></p><p className="mt-2 text-sm leading-6 text-slate-600">학습에 사용한 데이터에서의 정확도</p></div>
            <div className="rounded-2xl border border-violet-200 p-5"><p className="text-sm text-slate-600">Test Accuracy</p><p className="mt-1 text-2xl font-black"><Percent value={evaluation.accuracy} /></p><p className="mt-2 text-sm leading-6 text-slate-600">학습에 사용하지 않은 새로운 데이터에서의 정확도</p></div>
          </div>
          <label className="mt-4 flex items-start gap-3 rounded-xl bg-slate-50 p-4"><input type="checkbox" checked={compared} onChange={(event) => setCompared(event.target.checked)} className="mt-1 size-5" /><span>Train Accuracy와 Test Accuracy의 대상이 다름을 확인했습니다. 특정 정확도를 성공 기준으로 정하지 않습니다.</span></label>
          <Button className="mt-5" disabled={!compared} onClick={finish}>STEP 4 활동 완료</Button>
        </div>
      ) : null}
      {props.isComplete ? <Completion>현재 모델로 실제 Test 500개를 예측하고 Train·Test Accuracy를 비교했습니다.</Completion> : null}
    </StepFrame>
  )
}

export function Lesson08Step5(props: CommonStepProps) {
  const { evaluation, modelReady } = useLesson08Lab()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [observedIds, setObservedIds] = useState<Set<string>>(new Set())
  const [reasons, setReasons] = useState<Set<string>>(new Set())
  const [probabilitiesChecked, setProbabilitiesChecked] = useState(false)
  const [noErrorConfirmed, setNoErrorConfirmed] = useState(false)
  const errors = useMemo(
    () => evaluation?.predictions.filter((item) => item.predictedLabel !== item.actualLabel) ?? [],
    [evaluation],
  )
  const selected = errors.find((item) => item.sample.id === selectedId) ?? null
  const target = Math.min(3, errors.length)
  const ready = errors.length === 0
    ? noErrorConfirmed
    : observedIds.size >= target && reasons.size > 0 && probabilitiesChecked

  if (!evaluation) {
    return (
      <StepFrame {...props} step={5} intro="실제 Test 예측에서 AI가 혼동한 숫자와 확률을 관찰합니다.">
        {!modelReady ? <ModelRequired /> : <Notice>먼저 STEP 4에서 현재 모델을 Test 500개로 평가해 주세요.</Notice>}
      </StepFrame>
    )
  }

  return (
    <StepFrame {...props} step={5} intro="predictedLabel과 actualLabel이 다른 실제 Test sample만 살펴봅니다.">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-500">실제 오분류</p>
          <p className="text-2xl font-black">{errors.length}개</p>
        </div>
        {errors.length > 0 ? <span className="rounded-full bg-violet-100 px-4 py-2 text-sm font-black text-violet-800">확인 {Math.min(observedIds.size, target)} / {target}</span> : null}
      </div>

      {errors.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <h3 className="font-black text-emerald-950">이번 실제 Test에서는 오분류가 없었습니다.</h3>
          <p className="mt-2 text-sm leading-6 text-emerald-900">가짜 오분류를 만들지 않습니다. 다른 실행에서는 결과가 달라질 수 있습니다.</p>
          <label className="mt-4 flex items-start gap-3"><input type="checkbox" className="mt-1 size-5" checked={noErrorConfirmed} onChange={(event) => setNoErrorConfirmed(event.target.checked)} /><span>오분류 0개라는 실제 결과를 확인했습니다.</span></label>
        </div>
      ) : (
        <>
          <p className="mt-5 text-sm leading-6 text-slate-600">한꺼번에 크게 렌더링하지 않고 실제 오분류 중 앞의 {Math.min(errors.length, 12)}개만 카드로 표시합니다. 카드를 선택해 자세히 관찰하세요.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {errors.slice(0, 12).map((item) => {
              const selectedCard = item.sample.id === selectedId
              const observed = observedIds.has(item.sample.id)
              return (
                <button
                  key={item.sample.id}
                  type="button"
                  aria-pressed={selectedCard}
                  onClick={() => {
                    setSelectedId(item.sample.id)
                    setObservedIds((current) => new Set(current).add(item.sample.id))
                    setProbabilitiesChecked(false)
                  }}
                  className={`rounded-2xl border p-3 text-left ${selectedCard ? 'border-violet-500 bg-violet-50' : 'border-slate-200 bg-white'}`}
                >
                  <MnistCanvas sample={item.sample} size={96} className="mx-auto w-full" />
                  <span className="mt-2 block truncate font-mono text-[11px] text-slate-500" title={item.sample.id}>{item.sample.id}</span>
                  <span className="mt-1 block text-sm font-black">정답 {item.actualLabel} · 예측 {item.predictedLabel}</span>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-violet-700">{observed ? <CheckCircle2 size={14} /> : <Eye size={14} />} {observed ? '확인함' : '선택'}</span>
                </button>
              )
            })}
          </div>

          {selected ? (
            <div className="mt-7 grid gap-6 rounded-2xl border border-violet-200 bg-violet-50/50 p-5 lg:grid-cols-[16rem_1fr]">
              <div>
                <MnistCanvas sample={selected.sample} size={224} className="mx-auto" />
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-slate-500">실제 정답</dt><dd className="text-xl font-black">{selected.actualLabel}</dd></div>
                  <div><dt className="text-slate-500">AI 예측</dt><dd className="text-xl font-black">{selected.predictedLabel}</dd></div>
                  <div><dt className="text-slate-500">가장 높은 확률</dt><dd className="font-mono font-black"><Percent value={selected.confidence} /></dd></div>
                  <div><dt className="text-slate-500">정답 클래스 확률</dt><dd className="font-mono font-black"><Percent value={selected.probabilities[selected.actualLabel]} /></dd></div>
                </dl>
              </div>
              <div>
                <h3 className="font-black">실제 Softmax 확률</h3>
                <ProbabilityBars values={selected.probabilities} emphasis={selected.predictedLabel} />
                <label className="mt-4 flex items-start gap-3 rounded-xl bg-white p-3"><input type="checkbox" className="mt-1 size-5" checked={probabilitiesChecked} onChange={(event) => setProbabilitiesChecked(event.target.checked)} /><span className="text-sm leading-6">예측 숫자의 확률과 실제 정답 클래스의 확률을 비교했습니다.</span></label>
              </div>
            </div>
          ) : null}

          <fieldset className="mt-7 rounded-2xl border border-slate-200 p-5">
            <legend className="px-2 font-black">AI는 왜 이 숫자를 헷갈렸을까요?</legend>
            <p className="text-sm leading-6 text-slate-600">모델이 사람처럼 생각한다고 가정하지 말고, 이미지에서 관찰되는 모양을 골라 보세요. 정답을 채점하지 않는 관찰 활동입니다.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {['획 모양이 불분명함', '일부 획이 희미함', '다른 숫자와 비슷한 부분'].map((reason) => (
                <label key={reason} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"><input type="checkbox" className="mt-1 size-5" checked={reasons.has(reason)} onChange={() => setReasons((current) => { const next = new Set(current); if (next.has(reason)) next.delete(reason); else next.add(reason); return next })} /><span>{reason}</span></label>
              ))}
            </div>
          </fieldset>
        </>
      )}

      <Button className="mt-6" disabled={!ready} onClick={props.onComplete}>STEP 5 활동 완료</Button>
      {props.isComplete ? <Completion>실제 오분류 결과와 Softmax 확률을 관찰했습니다.</Completion> : null}
    </StepFrame>
  )
}

export function Lesson08Step6(props: CommonStepProps) {
  const {
    modelReady,
    isBusy,
    drawingPrediction,
    predictDrawing,
    clearDrawingPrediction,
    markEmptyDrawing,
    emptyDrawingMessage,
    error,
  } = useLesson08Lab()
  const [emptyChecked, setEmptyChecked] = useState(false)
  const [probabilitiesChecked, setProbabilitiesChecked] = useState(false)
  const ready = emptyChecked && Boolean(drawingPrediction) && probabilitiesChecked
  const previewSample: MnistSample | null = drawingPrediction
    ? { id: 'drawing-preprocessed', label: drawingPrediction.predictedLabel, pixels: drawingPrediction.previewPixels }
    : null

  return (
    <StepFrame {...props} step={6} intro="검은 Canvas에 흰색으로 숫자를 그리고 현재 메모리의 실제 모델에 물어봅니다.">
      {!modelReady ? (
        <Notice><p className="font-black">먼저 STEP 1과 STEP 2에서 실제 모델을 학습해 주세요.</p><p className="mt-1">저장된 실험 기록만으로는 현재 모델을 복원할 수 없습니다.</p></Notice>
      ) : null}
      <div className="mt-5 grid gap-7 lg:grid-cols-[20rem_1fr]">
        <div>
          <h3 className="mb-3 font-black">원래 Drawing Canvas</h3>
          <DrawingCanvas
            disabled={!modelReady || isBusy}
            onClear={() => { clearDrawingPrediction(); setProbabilitiesChecked(false) }}
            onEmpty={() => { markEmptyDrawing(); setEmptyChecked(true); setProbabilitiesChecked(false) }}
            onPrepared={async ({ normalized, previewPixels }) => {
              await predictDrawing(normalized, previewPixels)
              setProbabilitiesChecked(false)
            }}
          />
          {emptyDrawingMessage ? <p className="mt-3 flex items-center gap-2 font-bold text-amber-800" role="status"><AlertTriangle size={18} />{emptyDrawingMessage}</p> : null}
          {error?.kind === 'drawing' ? <Notice danger><p className="font-black">{error.message}</p><p className="mt-1">{error.detail}</p></Notice> : null}
        </div>

        <div>
          {!drawingPrediction || !previewSample ? (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-600">숫자를 그린 뒤 <strong className="ml-1">AI에게 물어보기</strong>를 누르면 실제 입력과 예측 결과가 나타납니다.</div>
          ) : (
            <div className="grid gap-6">
              <div className="grid gap-5 rounded-2xl border border-violet-200 bg-violet-50 p-5 sm:grid-cols-[9rem_1fr]">
                <div>
                  <p className="mb-2 text-sm font-black text-violet-900">전처리된 28×28</p>
                  <MnistCanvas sample={previewSample} size={128} />
                </div>
                <dl className="grid grid-cols-2 gap-3 self-center">
                  <div><dt className="text-sm text-slate-600">입력값 수</dt><dd className="text-xl font-black">{drawingPrediction.inputCount}</dd></div>
                  <div><dt className="text-sm text-slate-600">입력 범위</dt><dd className="font-mono text-lg font-black">{drawingPrediction.inputMin.toFixed(3)}~{drawingPrediction.inputMax.toFixed(3)}</dd></div>
                  <div><dt className="text-sm text-slate-600">실제 예측 숫자</dt><dd className="text-3xl font-black text-violet-700">{drawingPrediction.predictedLabel}</dd></div>
                  <div><dt className="text-sm text-slate-600">가장 높은 확률</dt><dd className="font-mono text-lg font-black"><Percent value={drawingPrediction.confidence} /></dd></div>
                </dl>
              </div>
              <ProbabilityBars values={drawingPrediction.probabilities} emphasis={drawingPrediction.predictedLabel} />
              <label className="flex items-start gap-3 rounded-xl bg-slate-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={probabilitiesChecked} onChange={(event) => setProbabilitiesChecked(event.target.checked)} /><span>0~9의 실제 확률과 가장 높은 확률을 확인했습니다.</span></label>
              <Notice>모델은 틀릴 수 있으며, 직접 그린 획은 MNIST 이미지와 모양·위치·굵기가 다를 수 있습니다. 맞혀야 완료되는 활동이 아닙니다.</Notice>
            </div>
          )}
        </div>
      </div>
      <Button className="mt-6" disabled={!ready} onClick={props.onComplete}>STEP 6 활동 완료</Button>
      {props.isComplete ? <Completion>빈 입력 처리를 확인하고, 직접 그린 숫자를 28×28로 전처리해 현재 모델로 실제 예측했습니다.</Completion> : null}
    </StepFrame>
  )
}

function modelName(record: ExperimentRecord) {
  return MODEL_OPTIONS[record.modelType].name
}

type DifferenceChoice = 'data' | 'model' | 'epoch' | 'multiple' | 'same'

function actualDifference(a: ExperimentRecord, b: ExperimentRecord): DifferenceChoice {
  const changes = [
    a.trainSampleCount !== b.trainSampleCount,
    a.modelType !== b.modelType,
    a.epochs !== b.epochs,
  ].filter(Boolean).length
  if (changes === 0) return 'same'
  if (changes > 1) return 'multiple'
  if (a.trainSampleCount !== b.trainSampleCount) return 'data'
  if (a.modelType !== b.modelType) return 'model'
  return 'epoch'
}

interface Step7Props extends CommonStepProps {
  priorStepsComplete: boolean
  completedSteps: readonly number[]
  onCompletionReadyChange: (ready: boolean) => void
}

export function Lesson08Step7({
  priorStepsComplete,
  completedSteps,
  onCompletionReadyChange,
  ...props
}: Step7Props) {
  const { experiments } = useLesson08Lab()
  const [experimentA, setExperimentA] = useState<string>('')
  const [experimentB, setExperimentB] = useState<string>('')
  const [difference, setDifference] = useState<DifferenceChoice | null>(null)
  const [interpretation, setInterpretation] = useState<'a' | 'b' | 'similar' | 'not-comparable' | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!experimentA && experiments[0]) setExperimentA(experiments[0].id)
    if (!experimentB && experiments[1]) setExperimentB(experiments[1].id)
  }, [experimentA, experimentB, experiments])

  const recordA = experiments.find((item) => item.id === experimentA) ?? null
  const recordB = experiments.find((item) => item.id === experimentB) ?? null
  const enoughRecords = experiments.length >= REQUIRED_EXPERIMENT_COUNT
  const ready = Boolean(enoughRecords && recordA && recordB && recordA.id !== recordB.id && difference && interpretation && submitted)

  useEffect(() => {
    onCompletionReadyChange(priorStepsComplete && props.isComplete)
    return () => onCompletionReadyChange(false)
  }, [onCompletionReadyChange, priorStepsComplete, props.isComplete])

  const finish = () => {
    if (!ready) return
    props.onComplete()
  }

  const completedItems = [
    ['실제 MNIST 데이터', completedSteps.includes(1)],
    ['실제 신경망 학습', completedSteps.includes(2)],
    ['실제 Loss와 Accuracy', completedSteps.includes(3)],
    ['실제 Test 평가', completedSteps.includes(4)],
    ['실제 오분류 분석', completedSteps.includes(5)],
    ['내 손글씨 실제 예측', completedSteps.includes(6)],
    ['실험 결과 비교', props.isComplete],
  ] as const

  return (
    <StepFrame {...props} step={7} intro="최근 실제 학습 요약에서 두 실험을 골라 조건과 결과의 차이를 비교합니다.">
      <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
        <h3 className="font-black text-cyan-950">권장 비교</h3>
        <p className="mt-2 text-sm leading-6 text-cyan-900">실험 A: Train 500 · 기본 모델 · Epoch 3 / 실험 B: Train 2,000 · 기본 모델 · Epoch 3</p>
        <p className="mt-1 text-sm leading-6 text-cyan-900">데이터 수의 영향을 볼 때는 모델과 Epoch를 같게, 모델 구조를 볼 때는 데이터 수와 Epoch를 같게 유지하세요. 새 실행은 상단 STEP 1과 STEP 2에서 시작할 수 있습니다.</p>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">실제 신경망 학습 결과는 초기 가중치와 실행 환경의 영향으로 같은 조건에서도 조금 달라질 수 있습니다.</p>

      {!enoughRecords ? (
        <Notice><p className="font-black">실제 학습 기록이 {experiments.length}개 있습니다.</p><p className="mt-1">기본 완료 기준은 {REQUIRED_EXPERIMENT_COUNT}회입니다. 조건을 바꾸어 실제 학습을 한 번 더 실행하세요.</p></Notice>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {([['A', experimentA, setExperimentA], ['B', experimentB, setExperimentB]] as const).map(([label, value, setter]) => (
              <label key={label} className="rounded-2xl border border-slate-200 p-4"><span className="font-black">실험 {label}</span><select className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3" value={value} onChange={(event) => { setter(event.target.value); setSubmitted(false) }}><option value="">기록 선택</option>{experiments.map((record, index) => <option key={record.id} value={record.id}>{index + 1}. Train {record.trainSampleCount.toLocaleString()} · {modelName(record)} · {record.epochs} Epoch</option>)}</select></label>
            ))}
          </div>

          {recordA && recordB && recordA.id !== recordB.id ? (
            <>
              <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full text-left text-sm">
                  <caption className="px-4 py-3 text-left font-black">실제 실험 결과 비교</caption>
                  <thead className="bg-slate-100"><tr><th className="px-4 py-3">항목</th><th className="px-4 py-3">실험 A</th><th className="px-4 py-3">실험 B</th></tr></thead>
                  <tbody>
                    {[
                      ['데이터 버전', recordA.datasetVersion, recordB.datasetVersion],
                      ['Train sample', recordA.trainSampleCount.toLocaleString(), recordB.trainSampleCount.toLocaleString()],
                      ['모델', modelName(recordA), modelName(recordB)],
                      ['Epoch / batch', `${recordA.epochs} / ${recordA.batchSize}`, `${recordB.epochs} / ${recordB.batchSize}`],
                      ['Train Loss', recordA.finalTrainLoss.toFixed(4), recordB.finalTrainLoss.toFixed(4)],
                      ['Train Accuracy', `${(recordA.finalTrainAccuracy * 100).toFixed(2)}%`, `${(recordB.finalTrainAccuracy * 100).toFixed(2)}%`],
                      ['Test Accuracy', recordA.testAccuracy === null ? '평가 전' : `${(recordA.testAccuracy * 100).toFixed(2)}%`, recordB.testAccuracy === null ? '평가 전' : `${(recordB.testAccuracy * 100).toFixed(2)}%`],
                      ['Test 정답 / 오답', recordA.testCorrect === null ? '—' : `${recordA.testCorrect} / ${recordA.testWrong}`, recordB.testCorrect === null ? '—' : `${recordB.testCorrect} / ${recordB.testWrong}`],
                      ['학습 시간', `${(recordA.durationMs / 1000).toFixed(2)}초`, `${(recordB.durationMs / 1000).toFixed(2)}초`],
                      ['실행 시각', new Date(recordA.timestamp).toLocaleString(), new Date(recordB.timestamp).toLocaleString()],
                    ].map(([item, a, b]) => <tr key={item} className="border-t border-slate-200"><th className="px-4 py-3 text-slate-600">{item}</th><td className="px-4 py-3 font-medium">{a}</td><td className="px-4 py-3 font-medium">{b}</td></tr>)}
                  </tbody>
                </table>
              </div>

              <fieldset className="mt-6 rounded-2xl border border-slate-200 p-5">
                <legend className="px-2 font-black">어떤 학습 조건이 달랐나요?</legend>
                <div className="flex flex-wrap gap-2">
                  {([['data', 'Train 수'], ['model', '모델 구조'], ['epoch', 'Epoch'], ['multiple', '둘 이상'], ['same', '같은 조건']] as const).map(([key, label]) => <button key={key} type="button" aria-pressed={difference === key} onClick={() => { setDifference(key); setSubmitted(false) }} className={`min-h-11 rounded-xl border px-4 font-bold ${difference === key ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-300 bg-white'}`}>{label}</button>)}
                </div>
              </fieldset>
              <fieldset className="mt-5 rounded-2xl border border-slate-200 p-5">
                <legend className="px-2 font-black">실제 Train Accuracy 차이를 어떻게 읽었나요?</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {([['a', '실험 A가 더 높다'], ['b', '실험 B가 더 높다'], ['similar', '거의 비슷하다'], ['not-comparable', '조건이 여러 개 달라 단일 원인으로 해석하기 어렵다']] as const).map(([key, label]) => <button key={key} type="button" aria-pressed={interpretation === key} onClick={() => { setInterpretation(key); setSubmitted(false) }} className={`min-h-11 rounded-xl border px-4 text-left font-bold ${interpretation === key ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-300 bg-white'}`}>{label}</button>)}
                </div>
              </fieldset>
              <Button className="mt-5" disabled={!difference || !interpretation} onClick={() => setSubmitted(true)}>비교 해석 제출</Button>
              {submitted ? <Notice><p>실제 조건 비교 결과: <strong>{actualDifference(recordA, recordB) === 'data' ? 'Train 수' : actualDifference(recordA, recordB) === 'model' ? '모델 구조' : actualDifference(recordA, recordB) === 'epoch' ? 'Epoch' : actualDifference(recordA, recordB) === 'multiple' ? '둘 이상의 조건' : '같은 조건'}</strong>{actualDifference(recordA, recordB) === 'multiple' ? '이 달라 하나의 조건만 원인이라고 단정할 수 없습니다.' : '을 중심으로 비교할 수 있습니다.'}</p></Notice> : null}
            </>
          ) : <Notice>서로 다른 두 실험을 선택해 주세요.</Notice>}
        </>
      )}

      <Button className="mt-6" disabled={!ready} onClick={finish}><BarChart3 size={18} /> STEP 7 활동 완료</Button>
      {props.isComplete ? (
        <div className="mt-8 rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-black tracking-[0.16em] text-emerald-300">REAL MNIST TRAINING COMPLETE</p>
          <h3 className="mt-2 text-2xl font-black">직접 수행한 학습 활동</h3>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {completedItems.filter(([, done]) => done).map(([item]) => <li key={item} className="flex items-center gap-2"><CheckCircle2 className="text-emerald-300" size={19} />{item}</li>)}
          </ul>
          <div className="mt-7 border-t border-slate-700 pt-6">
            <p className="text-sm font-bold text-cyan-300">LESSON 09로 이어지는 질문</p>
            <p className="mt-2 text-lg font-black">신경망은 이미지에서 가까이 있는 픽셀들의 특징을 어떻게 더 잘 찾을 수 있을까요?</p>
            <Link to="/lesson/09" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-white px-4 font-bold text-slate-950">Lesson 09 미리 보기</Link>
          </div>
        </div>
      ) : null}
    </StepFrame>
  )
}
