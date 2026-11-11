import { useState, type ReactNode } from 'react'
import { CheckCircle2, LoaderCircle, Play, RotateCcw, Square } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { MnistCanvas } from '../lesson07/MnistCanvas'
import { MNIST_DATASET_SIZES, type MnistDatasetSize } from '../lesson07/mnistTypes'
import DrawingCanvas from '../lesson08/DrawingCanvas'
import { useLesson08Lab } from '../lesson08/Lesson08Context'
import { MODEL_OPTIONS, STATUS_LABELS } from '../lesson08/lesson08Data'
import TrainingMetricChart from '../lesson08/TrainingMetricChart'
import type { DrawingPrediction, Lesson08Epochs, Lesson08ModelType, TestPrediction } from '../lesson08/lesson08Types'
import { useMnistCourse, type AnswerId } from './CourseSession'

const buttonClass = 'min-h-12'
const inputClass = 'mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'
const trainingStates = ['loading-data', 'loading-engine', 'converting-data', 'preparing-model', 'training', 'summarizing']

function percent(value: number) { return `${(value * 100).toFixed(2)}%` }

function readAnswer<T extends object>(value: string | undefined): Partial<T> {
  if (!value) return {}
  try {
    const parsed: unknown = JSON.parse(value)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Partial<T> : {}
  } catch { return {} }
}

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 ${className}`}>{children}</div>
}

function Note({ children }: { children: ReactNode }) {
  return <div className="rounded-xl bg-indigo-50 p-4 text-sm leading-6 text-indigo-950">{children}</div>
}

function Choices({ label, value, options, onChange, disabled = false }: {
  label: string
  value: string | undefined
  options: readonly (readonly [string, string])[]
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return <fieldset disabled={disabled} className="min-w-0">
    <legend className="mb-3 font-bold text-slate-900">{label}</legend>
    <div className="flex flex-wrap gap-2">
      {options.map(([id, text]) => <button key={id} type="button" aria-pressed={value === id} onClick={() => onChange(id)}
        className={`min-h-12 min-w-0 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${value === id ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400'}`}>{text}</button>)}
    </div>
  </fieldset>
}

function Feedback({ id, hint }: { id: AnswerId; hint: string }) {
  const course = useMnistCourse()
  const answer = course.record.answers[id]
  if (!answer?.submitted) return null
  const ready = course.answerReady(id)
  return <p role="status" className={`mt-3 rounded-xl p-3 text-sm leading-6 ${ready ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-950'}`}>
    {ready ? <><CheckCircle2 size={16} className="mr-1 inline" aria-hidden="true" />{id === 'final-explain-v2' ? '순서와 이유 판단을 확인하고 서술을 저장했습니다. 서술 내용의 타당성은 아래 기준으로 함께 검토해 주세요.' : '실제 결과에 연결한 답변을 저장했습니다.'}</> : hint}
  </p>
}

function ModelRequired({ action }: { action: string }) {
  const course = useMnistCourse()
  return <Note>
    <p>{course.record.training ? `기록은 복원되었습니다. ${action}에 사용할 모델은 새로고침 후 복원되지 않으므로 다시 학습해야 합니다.` : `${action}을 하려면 먼저 실제 모델을 학습해 주세요.`}</p>
    <Button className={`mt-3 ${buttonClass}`} variant="secondary" onClick={() => course.setScene(4)}>학습 장면으로 이동</Button>
  </Note>
}

function Probabilities({ prediction }: { prediction: Pick<TestPrediction, 'probabilities' | 'predictedLabel'> }) {
  return <div className="space-y-2" aria-label="숫자 0부터 9까지 실제 출력 확률">
    {prediction.probabilities.map((value, label) => <div key={label} className="grid grid-cols-[1rem_minmax(0,1fr)_4.5rem] items-center gap-2 text-xs">
      <span className="font-bold">{label}</span>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200"><span className={`block h-full rounded-full ${label === prediction.predictedLabel ? 'bg-indigo-600' : 'bg-slate-400'}`} style={{ width: `${Math.max(0, Math.min(100, value * 100))}%` }} /></div>
      <span className="text-right tabular-nums">{percent(value)}</span>
    </div>)}
  </div>
}

interface Interpretation { loss: string; accuracy: string; meaning: string }

function TrainingScene() {
  const lab = useLesson08Lab()
  const course = useMnistCourse()
  const result = course.record.training
  const running = trainingStates.includes(lab.status)
  const history = result?.history ?? []
  const first = history[0]
  const last = history.at(-1)
  const answer = readAnswer<Interpretation>(course.record.answers['train-interpret-v2']?.value)
  const updateAnswer = (patch: Partial<Interpretation>) => course.setAnswer('train-interpret-v2', JSON.stringify({ ...answer, ...patch }))
  const [inspectedMetric, setInspectedMetric] = useState('')
  const progress = lab.trainingResult ? 100 : lab.batchProgress ? Math.min(99, 100 * lab.batchProgress.completedBatches / lab.batchProgress.totalBatches) : undefined
  const trainingError = lab.error && ['data', 'engine', 'model', 'training'].includes(lab.error.kind) ? lab.error : null

  return <div className="space-y-5">
    <p className="leading-7 text-slate-700">같은 입력·정답 쌍으로 <strong>순전파로 예측 → 정답과 손실 비교 → 기울기로 가중치·편향 수정</strong>을 반복합니다. 직접 학습한 결과에서 손실과 정확도의 변화를 읽고, 무엇을 바꾸었는지 설명해 보세요.</p>
    <Panel>
      <h3 className="text-lg font-bold">이번 학습의 조건</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div><p className="text-sm text-slate-500">Train 이미지</p><p className="text-xl font-bold">{lab.datasetSize.toLocaleString()}장</p></div>
        <div><p className="text-sm text-slate-500">모델 구조</p><p className="text-lg font-bold">784 → {MODEL_OPTIONS[lab.modelType].layers.join(' → ')} → 10</p></div>
        <div><p className="text-sm text-slate-500">전체 자료를 반복하는 횟수</p><p className="text-xl font-bold">{lab.epochs} epoch</p></div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600"><strong>Epoch</strong>는 전체 훈련 자료를 한 번 사용하는 단위이고, <strong>batch size</strong>는 한 번에 묶어 계산하는 자료 수입니다. 기본 조건은 Train 1,000장·3 Epoch·batch size 32이며, 저장한 자료 수 선택이 있으면 이어 씁니다. 매 Epoch 자료 순서를 섞습니다.</p>
      <details className="mt-4 rounded-xl border border-slate-200 p-4">
        <summary className="min-h-12 cursor-pointer py-3 font-bold text-slate-700">선택 활동 · 학습 조건 바꾸기</summary>
        <div className="mt-3 space-y-5">
          <Choices label="훈련 데이터 수" value={String(lab.datasetSize)} disabled={lab.isBusy} options={MNIST_DATASET_SIZES.map((size) => [String(size), `${size.toLocaleString()}장`])} onChange={(value) => lab.setDatasetSize(Number(value) as MnistDatasetSize)} />
          <Choices label="Epoch · 전체 자료 반복 횟수" value={String(lab.epochs)} disabled={lab.isBusy} options={[[ '1', '1회' ], [ '3', '3회' ], [ '5', '5회' ]]} onChange={(value) => lab.setEpochs(Number(value) as Lesson08Epochs)} />
          <Choices label="모델 구조" value={lab.modelType} disabled={lab.isBusy} options={(Object.keys(MODEL_OPTIONS) as Lesson08ModelType[]).map((type) => [type, `784 → ${MODEL_OPTIONS[type].layers.join(' → ')} → 10`])} onChange={(value) => lab.setModelType(value as Lesson08ModelType)} />
        </div>
      </details>
      <p className="mt-4 text-sm leading-6 text-slate-600"><strong>범주형 교차 엔트로피 손실</strong>은 예측 확률을 실제 정답과 비교한 값입니다. 역전파로 기울기를 구하고, <strong>Adam</strong>으로 파라미터인 가중치·편향을 수정합니다. 6차시의 기본 경사하강법과 원리는 같지만, Adam은 이전 기울기의 정보도 이용해 수정 크기를 정합니다.</p>
    </Panel>

    <Panel className="border-indigo-200">
      <div className="flex flex-wrap items-center gap-3">
        <Button className={buttonClass} onClick={() => void lab.startTraining()} disabled={lab.isBusy} aria-busy={running}>
          {running ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
          {running ? '실제 모델 학습 중…' : trainingError || lab.status === 'cancelled' ? '실제 학습 다시 시도' : result ? '선택 · 새 모델로 다시 학습' : '실제 모델 학습 시작'}
        </Button>
        {running ? <Button className={buttonClass} variant="danger" onClick={lab.cancelTraining}><Square size={17} aria-hidden="true" />학습 취소</Button> : null}
        <span className="text-sm font-bold text-indigo-800" role="status" aria-live="polite">{STATUS_LABELS[lab.status]}</span>
      </div>
      {result ? <p className="mt-3 text-sm leading-6 text-slate-600">한 번의 실제 학습으로 필수 활동을 이어갈 수 있습니다. 다시 학습하면 새 모델의 평가와 손글씨 관찰로 결과를 갱신합니다.</p> : null}
      {result && !lab.modelReady && !running ? <p className="mt-3 text-sm leading-6 text-amber-900">저장된 학습 기록을 표시하고 있습니다. 모델 자체는 복원되지 않으므로 새 예측을 하려면 다시 학습해 주세요.</p> : null}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">최근 측정한 훈련 손실</p><p className="mt-1 font-mono text-xl font-bold">{lab.liveMetric ? lab.liveMetric.loss.toFixed(4) : '측정 전'}</p></div>
        <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">최근 측정한 훈련 정확도</p><p className="mt-1 font-mono text-xl font-bold">{lab.liveMetric ? percent(lab.liveMetric.accuracy) : '측정 전'}</p></div>
        <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">이번 실행 경과 시간</p><p className="mt-1 font-mono text-xl font-bold">{(lab.elapsedMs / 1000).toFixed(1)}초</p></div>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label="실제 학습 진행률" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress === undefined ? undefined : Math.floor(progress)} aria-valuetext={progress === undefined ? STATUS_LABELS[lab.status] : `${Math.floor(progress)}%`}>
        <span className={`block h-full rounded-full bg-indigo-600 ${running && progress === undefined ? 'animate-pulse' : ''}`} style={{ width: progress === undefined ? running ? '25%' : '0%' : `${progress}%` }} />
      </div>
      <p className="mt-2 text-sm text-slate-600">{lab.batchProgress ? `Epoch ${lab.batchProgress.currentEpoch} / ${lab.trainingResult?.config.epochs ?? lab.epochs} · Batch ${lab.batchProgress.batchInEpoch} / ${lab.batchProgress.batchesPerEpoch} · 전체 ${Math.floor(progress ?? 0)}%` : running ? '학습을 준비하고 있습니다. 실제 배치가 완료되면 진행 수치가 나타납니다.' : '실제 실행 중에 완료한 배치 수와 측정한 값이 표시됩니다.'}</p>
      {trainingError ? <div role="alert" className="mt-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-900"><p className="font-bold">{trainingError.message}</p><p className="mt-1">위의 다시 시도 버튼으로 학습을 재시작할 수 있습니다.</p><details className="mt-2"><summary className="cursor-pointer">오류 내용</summary><p className="break-words">{trainingError.detail}</p></details></div> : null}
      {lab.status === 'cancelled' ? <p role="status" className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-950">학습을 취소했습니다. 완료 기록은 만들지 않았습니다. 다시 시도하면 새 모델로 시작합니다.</p> : null}
    </Panel>

    {result && first && last ? <Panel>
      <h3 className="text-lg font-bold">완료한 학습을 읽어 보기</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">아래 그래프는 실제로 완료한 epoch의 기록입니다. 첫 점도 이미 <strong>1 epoch 학습한 뒤</strong>의 값입니다. 학습 전 수치는 측정하지 않았습니다.</p>
      <div className="mt-5 grid gap-4 lg:grid-cols-2 [&_button]:!min-h-12 [&_.section-heading-row]:flex-wrap">
        <TrainingMetricChart title="훈련 손실 (Loss)" metric="loss" history={history} onInspect={() => setInspectedMetric('손실은 낮을수록 이 훈련 자료에서 예측과 정답의 차이가 작다는 뜻입니다.')} />
        <TrainingMetricChart title="훈련 정확도 (Accuracy)" metric="accuracy" history={history} onInspect={() => setInspectedMetric('훈련 정확도는 학습에 사용한 이미지 중 예측 숫자가 정답과 일치한 비율입니다.')} />
      </div>
      {inspectedMetric ? <p className="mt-3 text-sm text-indigo-900" role="status">{inspectedMetric}</p> : null}
      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm"><caption className="sr-only">처음 완료한 epoch와 마지막 epoch 실제 기록</caption><thead className="bg-slate-50"><tr><th className="p-3">측정 시점</th><th className="p-3">훈련 손실</th><th className="p-3">훈련 정확도</th></tr></thead><tbody>
          <tr className="border-t border-slate-200"><th className="p-3">1 epoch 후</th><td className="p-3 tabular-nums">{first.loss.toFixed(4)}</td><td className="p-3 tabular-nums">{percent(first.accuracy)}</td></tr>
          <tr className="border-t border-slate-200"><th className="p-3">마지막 {last.epoch} epoch 후</th><td className="p-3 tabular-nums">{last.loss.toFixed(4)}</td><td className="p-3 tabular-nums">{percent(last.accuracy)}</td></tr>
        </tbody></table>
      </div>
      {history.length === 1 ? <p className="mt-3 text-sm text-slate-600">1 epoch를 선택했으므로 처음과 마지막은 같은 측정값입니다.</p> : null}
      <div className="mt-5 space-y-5">
        <Choices label="첫 완료 epoch → 마지막 epoch: 손실은?" value={answer.loss} options={[[ 'down', '감소했다' ], [ 'same', '같다' ], [ 'up', '증가했다' ]]} onChange={(loss) => updateAnswer({ loss })} />
        <Choices label="첫 완료 epoch → 마지막 epoch: 정확도는?" value={answer.accuracy} options={[[ 'down', '감소했다' ], [ 'same', '같다' ], [ 'up', '증가했다' ]]} onChange={(accuracy) => updateAnswer({ accuracy })} />
        <Choices label="이 변화를 만드는 학습에서 무엇을 왜 수정했나요?" value={answer.meaning} options={[[ 'labels', '예측에 맞도록 사진의 실제 정답을 수정했다' ], [ 'weights-biases', '손실을 줄이는 방향을 기울기로 구해 가중치·편향을 수정했다' ], [ 'always-improves', '매번 정확도가 반드시 오르도록 Test의 정답으로 수정했다' ]]} onChange={(meaning) => updateAnswer({ meaning })} />
      </div>
      <Button className={`mt-5 ${buttonClass}`} disabled={!answer.loss || !answer.accuracy || !answer.meaning || running} onClick={() => course.submitAnswer('train-interpret-v2')}>학습 결과 해석 제출</Button>
      <Feedback id="train-interpret-v2" hint="표의 첫 완료 Epoch와 마지막 Epoch를 다시 비교하세요. 학습은 입력·정답을 고치는 일이 아니라 손실의 기울기로 가중치·편향을 수정하는 일입니다. 정확도가 매번 오르는 것은 아닙니다." />
    </Panel> : <Note>학습을 한 번 완료하면 실제 기록으로 손실과 정확도 변화를 해석할 수 있습니다.</Note>}
  </div>
}

interface TestInterpretation { role: string; comparison: string; meaning: string }

function EvaluationScene() {
  const lab = useLesson08Lab()
  const course = useMnistCourse()
  const evaluation = course.record.evaluation
  const training = course.record.training
  const answer = course.record.answers.accuracy?.value ?? ''
  const interpretation = readAnswer<TestInterpretation>(course.record.answers['test-interpret-v2']?.value)
  const updateInterpretation = (patch: Partial<TestInterpretation>) => course.setAnswer('test-interpret-v2', JSON.stringify({ ...interpretation, ...patch }))
  return <div className="space-y-5">
    <p className="leading-7 text-slate-700"><strong>Test</strong>는 학습에 쓰지 않은 이미지입니다. 가중치를 바꾸지 않고 정답을 얼마나 맞히는지 확인하므로, 새로운 자료에도 배운 특징을 적용하는지 살펴볼 수 있습니다.</p>
    <Panel>
      <div className="flex flex-wrap items-center gap-3">
        <Button className={buttonClass} onClick={() => void lab.evaluateTest()} disabled={!lab.modelReady || lab.isBusy} aria-busy={lab.status === 'evaluating'}>
          {lab.status === 'evaluating' ? <LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
          {lab.status === 'evaluating' ? 'Test 500장 평가 중…' : lab.error?.kind === 'evaluation' ? 'Test 평가 다시 시도' : evaluation ? '선택 · Test 500장 다시 평가' : 'Test 500장으로 평가하기'}
        </Button>
        <p className="text-sm leading-6 text-slate-600">훈련 자료와 분리한 실제 Test 500장을 사용합니다.</p>
      </div>
      {lab.status === 'evaluating' ? <p className="mt-3 text-sm font-semibold text-indigo-800" role="status">학습이 끝난 현재 모델로 500장의 예측과 실제 정답을 비교하고 있습니다.</p> : null}
      {lab.error?.kind === 'evaluation' ? <p role="alert" className="mt-3 rounded-xl bg-rose-50 p-4 text-sm text-rose-900">{lab.error.message} 위의 다시 시도 버튼을 눌러 주세요.</p> : null}
      {!lab.modelReady && !evaluation ? <div className="mt-4"><ModelRequired action="Test 평가" /></div> : null}
      {!lab.modelReady && evaluation ? <p className="mt-3 text-sm text-slate-600">저장된 평가 기록을 읽고 답할 수 있습니다. 새 평가를 원하면 학습 장면에서 모델을 다시 학습해 주세요.</p> : null}
    </Panel>
    {evaluation && training ? <>
      <div className="grid gap-3 sm:grid-cols-3">
        {[[ 'Test 이미지', `${evaluation.sampleCount}장` ], [ '맞힌 이미지', `${evaluation.correct}장` ], [ '틀린 이미지', `${evaluation.wrong}장` ]].map(([title, value]) => <Panel key={title}><p className="text-sm text-slate-500">{title}</p><p className="mt-1 text-2xl font-bold">{value}</p></Panel>)}
      </div>
      <Panel>
        <h3 className="text-lg font-bold">이번 모델은 두 자료에서 어떤 결과를 냈나요?</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-cyan-50 p-4"><p className="text-sm text-cyan-900">Train 정확도</p><p className="mt-1 text-2xl font-bold">{percent(training.finalAccuracy)}</p><p className="mt-2 text-sm text-cyan-950">이미 학습에 쓴 {training.config.datasetSize.toLocaleString()}장의 결과</p></div>
          <div className="rounded-xl bg-indigo-50 p-4"><p className="text-sm text-indigo-900">Test 정확도</p><p className="mt-1 text-2xl font-bold">{percent(evaluation.accuracy)}</p><p className="mt-2 text-sm text-indigo-950">학습에 쓰지 않은 {evaluation.sampleCount}장의 결과</p></div>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">Test 정확도는 맞힌 {evaluation.correct}장을 평가한 {evaluation.sampleCount}장으로 나눈 비율입니다. 훈련 지표는 학습 중, Test 지표는 학습 후 별도 자료로 측정했습니다.</p>
        <div className="mt-5 space-y-5">
          <Choices label={`Train ${training.config.datasetSize.toLocaleString()}장의 결과가 있는데 Test ${evaluation.sampleCount}장도 확인한 이유는?`} value={interpretation.role} options={[[ 'held-out', '학습에 쓰지 않은 사진에도 배운 관계를 적용하는지 확인하려고' ], [ 'train-test', 'Test 정답으로 가중치를 한 번 더 수정하려고' ], [ 'guaranteed', 'Train 정확도만으로 모든 새 사진의 결과를 확정할 수 있어서' ]]} onChange={(role) => updateInterpretation({ role })} />
          <Choices label="화면에 표시된 정확도를 비교하면?" value={interpretation.comparison} options={[[ 'lower', 'Test가 Train보다 낮다' ], [ 'same', '표시된 두 값이 같다' ], [ 'higher', 'Test가 Train보다 높다' ]]} onChange={(comparison) => updateInterpretation({ comparison })} />
          <Choices label={`이번 Test 정확도 ${percent(evaluation.accuracy)}와 한 사진의 예측 확률은 어떻게 다른가요?`} value={interpretation.meaning} options={[[ 'one-image', '둘 다 한 사진이 실제 정답일 가능성이다' ], [ 'probability-not-accuracy', '정확도는 여러 사진의 정답 비율이고, 예측 확률은 한 사진의 후보별 모델 출력이다' ], [ 'same-meaning', '같은 뜻이므로 두 숫자는 항상 같다' ]]} onChange={(meaning) => updateInterpretation({ meaning })} />
        </div>
        <Button className={`mt-5 ${buttonClass}`} disabled={!interpretation.role || !interpretation.comparison || !interpretation.meaning || lab.isBusy} onClick={() => course.submitAnswer('test-interpret-v2')}>Test 결과 해석 제출</Button>
        <Feedback id="test-interpret-v2" hint="위의 실제 Train·Test 표시값을 비교하세요. Test는 가중치를 수정하지 않고 새로운 자료에서 확인하며, 여러 사진의 정확도와 한 사진의 출력 확률은 다릅니다. 선택을 고쳐 다시 제출할 수 있습니다." />
        <details className="mt-5 rounded-xl border border-slate-200 p-4">
          <summary className="min-h-12 cursor-pointer py-3 font-bold text-slate-700">보충 계산 · Test 정확도 직접 구하기 (완료 조건 아님)</summary>
          <div className="mt-3">
            <p className="rounded-xl bg-slate-50 p-4 text-lg font-semibold">정확도 = 맞힌 수 ÷ 전체 수 × 100</p>
            <p className="mt-3 text-slate-700">이번 결과: <strong>{evaluation.correct} ÷ {evaluation.sampleCount} × 100</strong></p>
            <label className="mt-5 block max-w-sm font-bold" htmlFor="mnist-course-test-accuracy">계산한 Test 정확도 (%)</label>
            <input id="mnist-course-test-accuracy" type="text" inputMode="text" autoComplete="off" className={`${inputClass} max-w-sm`} placeholder="소수 둘째 자리까지 입력" value={answer} onChange={(event) => course.setAnswer('accuracy', event.target.value)} />
            <p className="mt-2 text-sm text-slate-500">% 기호를 제외하고 숫자만 입력해 주세요.</p>
            <Button className={`mt-4 ${buttonClass}`} disabled={!answer.trim()} onClick={() => course.submitAnswer('accuracy')}>계산 결과 제출</Button>
            <Feedback id="accuracy" hint={`맞힌 ${evaluation.correct}장을 전체 ${evaluation.sampleCount}장으로 나누고 100을 곱하세요. 소수 둘째 자리 정도까지 계산한 후 다시 제출할 수 있습니다.`} />
            {course.answerReady('accuracy') ? <p className="mt-3 text-sm leading-6 text-emerald-900">{evaluation.correct} ÷ {evaluation.sampleCount} × 100 = {percent(evaluation.accuracy)}입니다. 이 비율은 평가한 사진 중 맞힌 비율입니다.</p> : null}
          </div>
        </details>
      </Panel>
      <Note>Test가 Train보다 낮아야만 정상인 것은 아닙니다. 어느 결과든 이번 자료에서 측정한 값이며, 다른 사진의 결과까지 보장하지는 않습니다. 다음 장면에서 실제 사진 하나의 예측도 살펴봅니다.</Note>
    </> : <Note>평가를 실행하면 실제 정답 수와 오답 수가 나타납니다. 결과를 미리 정해 두지 않습니다.</Note>}
  </div>
}

interface Hypothesis { cause: string; certainty: string; reason: string }
interface DrawingComparison { change: string; meaning: string; reason: string }

function DrawingResult({ prediction, title }: { prediction: DrawingPrediction; title: string }) {
  return <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4">
    <h4 className="mb-3 font-bold">{title}</h4>
    <div className="flex flex-wrap items-center gap-4">
      <MnistCanvas sample={{ id: title, label: prediction.predictedLabel, pixels: prediction.previewPixels }} size={112} />
      <div className="text-sm leading-6"><p>실제 예측 <strong className="text-2xl text-indigo-700">{prediction.predictedLabel}</strong></p><p>가장 높은 확률 <strong>{percent(prediction.confidence)}</strong></p><p className="text-slate-500">입력 {prediction.inputCount}개 · 28×28</p><p className="text-slate-500">손글씨의 정답은 자동 부여하지 않음</p></div>
    </div>
  </div>
}

function ObservationScene() {
  const lab = useLesson08Lab()
  const course = useMnistCourse()
  const evaluation = course.record.evaluation
  const representative = evaluation?.representative ?? null
  const sameEvaluation = lab.trainingResult?.recordId === evaluation?.recordId
  const errors = sameEvaluation ? lab.evaluation?.predictions.filter((item) => item.predictedLabel !== item.actualLabel) ?? [] : []
  const evidence = course.record.answers['error-evidence']?.value
  const hypothesis = readAnswer<Hypothesis>(course.record.answers['error-hypothesis']?.value)
  const comparison = readAnswer<DrawingComparison>(course.record.answers['drawing-comparison']?.value)
  const updateHypothesis = (patch: Partial<Hypothesis>) => course.setAnswer('error-hypothesis', JSON.stringify({ ...hypothesis, ...patch }))
  const updateComparison = (patch: Partial<DrawingComparison>) => course.setAnswer('drawing-comparison', JSON.stringify({ ...comparison, ...patch }))
  const drawings = course.record.drawings

  return <div className="space-y-6">
    <p className="leading-7 text-slate-700">먼저 Test 이미지의 <strong>관찰한 사실</strong>과 <strong>원인에 대한 가설</strong>을 구분하세요. 이어 직접 쓴 숫자의 획을 바꿔 같은 모델의 반응을 비교합니다.</p>
    <Panel>
      <h3 className="text-lg font-bold">1. 실제 Test 결과에서 관찰하기</h3>
      {!evaluation ? <div className="mt-4"><Note><p>Test 평가를 먼저 실행하면 실제 이미지를 관찰할 수 있습니다.</p><Button variant="secondary" className={`mt-3 ${buttonClass}`} onClick={() => course.setScene(5)}>Test 평가로 이동</Button></Note></div> : <>
        <p className="mt-2 text-sm leading-6 text-slate-600">이번 Test {evaluation.sampleCount}장 중 오답은 <strong>{evaluation.wrong}장</strong>입니다. {evaluation.wrong === 0 ? '이번에는 오답이 없으므로 실제 정답 표본을 관찰합니다. 이 결과가 모든 입력의 정답을 보장하지는 않습니다.' : '대표 오답의 모양과 두 숫자를 비교하세요.'}</p>
        {errors.length > 1 ? <details className="mt-4 rounded-xl border border-slate-200 p-4"><summary className="min-h-12 cursor-pointer py-3 font-semibold">다른 실제 오답도 살펴보기</summary><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {errors.slice(0, 8).map((item) => <button key={item.sample.id} type="button" aria-pressed={representative?.sample.id === item.sample.id} className={`min-h-12 rounded-xl border p-3 text-left ${representative?.sample.id === item.sample.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'}`} onClick={() => course.selectRepresentative(item)}><MnistCanvas sample={item.sample} size={70} /><span className="mt-2 block text-sm font-semibold">정답 {item.actualLabel} · 예측 {item.predictedLabel}</span></button>)}
        </div></details> : null}
        {representative ? <div className="mt-5 grid gap-5 rounded-xl bg-slate-50 p-4 sm:grid-cols-[11rem_1fr]">
          <div><MnistCanvas sample={representative.sample} size={154} /><p className="mt-3 text-sm">정답 <strong className="text-xl">{representative.actualLabel}</strong> · 예측 <strong className="text-xl text-indigo-700">{representative.predictedLabel}</strong></p><p className="mt-1 text-sm">예측 클래스 확률 <strong>{percent(representative.confidence)}</strong></p><p className="mt-1 text-sm text-slate-600">정답 클래스 확률 {percent(representative.probabilities[representative.actualLabel])}</p></div>
          <div><h4 className="mb-3 text-sm font-bold">이 한 이미지의 실제 출력 확률</h4><Probabilities prediction={representative} /><p className="mt-3 text-xs leading-5 text-slate-600">높은 출력 확률도 실제 정답을 보장하지 않습니다.</p></div>
        </div> : null}
        <div className="mt-5 space-y-5">
          <Choices label="지금 확인할 수 있는 사실은?" value={evidence} options={[[ 'different', '대표 오답의 정답과 예측이 다르다' ], [ 'all-correct', '이번 Test에는 오답이 없다' ]]} onChange={(value) => course.setAnswer('error-evidence', value)} />
          <Choices label={evaluation.wrong ? '혼동의 원인으로 생각한 것은?' : '다른 입력에서 틀릴 가능성을 설명할 가설은?'} value={hypothesis.cause} options={[[ 'shape', '획 모양이 다른 숫자와 닮아서' ], [ 'coverage', '학습 자료가 다양한 글씨를 충분히 담지 못해서' ], [ 'uncertain', '지금 자료만으로 원인을 알기 어려워서' ]]} onChange={(cause) => updateHypothesis({ cause })} />
          <Choices label="원인에 대한 이 설명은 어느 정도로 확실한가요?" value={hypothesis.certainty} options={[[ 'confirmed', '확인된 원인이다' ], [ 'hypothesis', '추가 확인이 필요한 가설이다' ]]} onChange={(certainty) => updateHypothesis({ certainty })} />
          <label className="block font-bold">이미지나 실제 결과에서 본 근거를 내 말로 적기
            <input type="text" inputMode="text" autoComplete="off" className={inputClass} value={hypothesis.reason ?? ''} placeholder="어떤 획이나 결과를 보고 이렇게 생각했나요?" onChange={(event) => updateHypothesis({ reason: event.target.value })} />
          </label>
        </div>
        <Button className={`mt-5 ${buttonClass}`} disabled={!representative || !evidence || !hypothesis.cause || !hypothesis.certainty || (hypothesis.reason?.trim().length ?? 0) < 4} onClick={() => { course.submitAnswer('error-evidence'); course.submitAnswer('error-hypothesis') }}>관찰과 가설 제출</Button>
        <Feedback id="error-evidence" hint="실제 오답 수와 대표 이미지의 정답·예측을 다시 확인해 보세요. 관찰한 사실을 고쳐 제출할 수 있습니다." />
        <Feedback id="error-hypothesis" hint="이미지에서 본 근거를 네 글자 이상 적고, 원인이 확인된 사실인지 추가 검증이 필요한 가설인지 구분해 보세요." />
      </>}
    </Panel>

    <Panel>
      <h3 className="text-lg font-bold">2. 손글씨를 바꾸어 같은 모델에 물어보기</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">숫자를 쓰고 예측한 다음, 획의 모양이나 굵기를 바꿔 다시 예측하세요. <strong>같은 가중치·편향으로 서로 다른 실제 입력 두 개</strong>를 계산하며, 재학습하지 않습니다. 예측 숫자가 그대로여도 유효한 관찰입니다.</p>
      {!lab.modelReady && drawings.length < 2 ? <div className="mt-4"><ModelRequired action="손글씨 예측" /></div> : null}
      {!lab.modelReady && drawings.length >= 2 ? <p className="mt-3 text-sm text-slate-600">저장된 두 입력으로 비교할 수 있습니다. 새 손글씨 예측을 하려면 모델을 다시 학습해 주세요.</p> : null}
      <div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <div className="min-w-0 [&_.digit-drawing-canvas]:max-w-full [&_.digit-drawing-canvas]:!h-auto [&_.digit-drawing-canvas]:aspect-square [&_.button-row]:flex-wrap [&_button]:min-h-12">
          <DrawingCanvas disabled={!lab.modelReady || lab.isBusy} onClear={lab.clearDrawingPrediction} onEmpty={lab.markEmptyDrawing} onPrepared={async ({ normalized, previewPixels }) => { await lab.predictDrawing(normalized, previewPixels) }} />
          {lab.emptyDrawingMessage ? <p className="mt-3 text-sm font-bold text-amber-900" role="status">{lab.emptyDrawingMessage}</p> : null}
          {lab.error?.kind === 'drawing' ? <p className="mt-3 text-sm text-rose-900" role="alert">{lab.error.message} 그림을 확인한 뒤 ‘AI에게 물어보기’를 다시 눌러 주세요.</p> : null}
          <p className="mt-3 text-xs leading-5 text-slate-500">그림의 획 영역을 잘라 긴 변을 약 20픽셀로 줄이고, 28×28에 놓아 밝기 중심을 맞춥니다. 픽셀값을 255로 나눈 784개가 실제 모델의 입력입니다.</p>
        </div>
        <div className="min-w-0 space-y-3">
          <p className="text-sm font-bold text-indigo-900" aria-live="polite">같은 모델로 비교할 서로 다른 입력: {Math.min(drawings.length, 2)} / 2개</p>
          {drawings.map((drawing, index) => <DrawingResult key={`${index}-${drawing.predictedLabel}-${drawing.confidence}`} prediction={drawing} title={drawings.length === 1 ? '첫 번째 실제 입력' : index === 0 ? '이전 실제 입력' : '바꾼 실제 입력'} />)}
          {drawings.length === 0 ? <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-slate-300 p-5 text-sm leading-6 text-slate-600">예측하면 전처리한 이미지와 실제 출력이 여기에 나타납니다.</div> : null}
          {drawings.length === 1 ? <Note>첫 예측을 저장했습니다. 같은 그림으로 버튼만 다시 누르지 말고 획을 바꾼 뒤 다시 예측해 주세요.</Note> : null}
          {drawings.at(-1) ? <details className="rounded-xl border border-slate-200 p-4"><summary className="min-h-12 cursor-pointer py-3 text-sm font-bold">최근 손글씨의 0~9 확률 보기</summary><div className="mt-3"><Probabilities prediction={drawings[drawings.length - 1]} /></div></details> : null}
        </div>
      </div>
      <div className="mt-6 space-y-5">
        <Choices label="두 실제 예측 숫자를 비교하면?" value={comparison.change} options={[[ 'same', '같은 숫자로 예측했다' ], [ 'different', '다른 숫자로 예측했다' ]]} disabled={drawings.length < 2} onChange={(change) => updateComparison({ change })} />
        <Choices label="입력을 바꾸어 얻은 결과를 어떻게 해석하나요?" value={comparison.meaning} options={[[ 'input-not-guarantee', '입력 변화의 반응이며 정답을 보장하지 않는다' ], [ 'retrained', '내 그림으로 모델이 다시 학습되었다' ], [ 'always-correct', '이제 모든 손글씨를 맞힐 수 있다' ]]} disabled={drawings.length < 2} onChange={(meaning) => updateComparison({ meaning })} />
        <label className="block font-bold">무엇을 바꾸었고 예측은 어땠나요?
          <input type="text" inputMode="text" autoComplete="off" className={inputClass} value={comparison.reason ?? ''} placeholder="바꾼 획과 두 예측 숫자를 연결해 적어 보세요." onChange={(event) => updateComparison({ reason: event.target.value })} />
        </label>
      </div>
      <Button className={`mt-5 ${buttonClass}`} disabled={drawings.length < 2 || !comparison.change || !comparison.meaning || (comparison.reason?.trim().length ?? 0) < 4} onClick={() => course.submitAnswer('drawing-comparison')}>손글씨 비교 제출</Button>
      <Feedback id="drawing-comparison" hint="저장된 두 입력의 실제 예측 숫자가 같은지 확인하세요. 무엇을 바꿨는지 네 글자 이상 적고, 예측과 재학습의 차이를 생각해 다시 제출할 수 있습니다." />
    </Panel>
  </div>
}

const processCards = [
  { id: 'test', label: 'Test로 평가', detail: '학습에 쓰지 않은 자료로 확인' },
  { id: 'input', label: '입력 준비', detail: '이미지의 픽셀을 정규화' },
  { id: 'update', label: '가중치·편향 수정', detail: '기울기로 파라미터 조정' },
  { id: 'predict', label: '예측', detail: '순전파로 0~9 출력 계산' },
  { id: 'loss', label: '손실 계산', detail: '예측과 실제 정답 비교' },
] as const
interface FinalExplanation { order: string[]; transfer: string; reason: string }

function SummaryScene() {
  const course = useMnistCourse()
  const { training, evaluation, drawings } = course.record
  const finalAnswer = readAnswer<FinalExplanation>(course.record.answers['final-explain-v2']?.value)
  const order = Array.isArray(finalAnswer.order) ? finalAnswer.order.filter((id) => processCards.some((card) => card.id === id)) : []
  const update = (patch: Partial<FinalExplanation>) => course.setAnswer('final-explain-v2', JSON.stringify({ ...finalAnswer, ...patch }))
  const first = training?.history[0]
  const representative = evaluation?.representative
  return <div className="space-y-5">
    <p className="leading-7 text-slate-700">내가 실행한 결과를 근거로 <strong>이미지가 입력되어 학습되고 평가되기까지</strong>의 과정을 설명해 보세요. 한 번의 실제 학습과 그 모델의 관찰 기록을 함께 사용합니다.</p>
    <Panel>
      <h3 className="text-lg font-bold">나의 실제 실험 기록</h3>
      {training && first ? <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <div><dt className="text-sm text-slate-500">입력과 구조</dt><dd className="mt-1 font-semibold">Train {training.config.datasetSize.toLocaleString()}장 · 784 → {MODEL_OPTIONS[training.config.modelType].layers.join(' → ')} → 10</dd></div>
        <div><dt className="text-sm text-slate-500">실제로 완료한 학습</dt><dd className="mt-1 font-semibold">{training.completedEpochs} epoch · 배치 {training.config.batchSize} · {(training.durationMs / 1000).toFixed(1)}초</dd></div>
        <div><dt className="text-sm text-slate-500">훈련 손실 · 1 epoch 후 → 마지막</dt><dd className="mt-1 font-mono font-semibold">{first.loss.toFixed(4)} → {training.finalLoss.toFixed(4)}</dd></div>
        <div><dt className="text-sm text-slate-500">훈련 정확도 · 1 epoch 후 → 마지막</dt><dd className="mt-1 font-mono font-semibold">{percent(first.accuracy)} → {percent(training.finalAccuracy)}</dd></div>
        <div><dt className="text-sm text-slate-500">Test 평가</dt><dd className="mt-1 font-semibold">{evaluation ? `${evaluation.correct} / ${evaluation.sampleCount}장 정답 · ${percent(evaluation.accuracy)}` : '아직 평가하지 않음'}</dd></div>
        <div><dt className="text-sm text-slate-500">손글씨의 실제 예측</dt><dd className="mt-1 font-semibold">{drawings.length >= 2 ? `${drawings[0].predictedLabel} → ${drawings[1].predictedLabel} · 서로 다른 입력 2개` : `${drawings.length}개 기록 · 비교 준비 중`}</dd></div>
      </dl> : <p className="mt-3 text-slate-600">아직 완료한 실제 학습 기록이 없습니다. 학습 장면에서 시작해 주세요.</p>}
      {representative ? <div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl bg-slate-50 p-4"><MnistCanvas sample={representative.sample} size={84} /><div className="text-sm leading-6"><p>관찰한 Test 이미지: 정답 <strong>{representative.actualLabel}</strong> · 예측 <strong>{representative.predictedLabel}</strong> · 예측 확률 <strong>{percent(representative.confidence)}</strong></p><p className="text-slate-600">나의 가설: {readAnswer<Hypothesis>(course.record.answers['error-hypothesis']?.value).reason || '아직 작성하지 않음'}</p></div></div> : null}
    </Panel>
    <Panel>
      <h3 className="text-lg font-bold">한 번의 학습 과정과 마지막 평가를 순서대로 놓기</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">아래 카드 다섯 개를 첫 단계부터 선택하세요. 학습 중에는 예측·손실·수정을 반복하고, 학습이 끝나면 Test로 확인합니다.</p>
      <ol className="mt-4 grid gap-2 sm:grid-cols-5" aria-label="내가 선택한 학습 과정 순서">
        {Array.from({ length: 5 }, (_, index) => { const card = processCards.find((item) => item.id === order[index]); return <li key={index} className={`min-h-24 rounded-xl border p-3 ${card ? 'border-indigo-200 bg-indigo-50' : 'border-dashed border-slate-300 bg-slate-50'}`}><span className="text-xs font-bold text-slate-500">{index + 1}</span><p className="mt-2 text-sm font-bold">{card?.label ?? '선택할 자리'}</p></li> })}
      </ol>
      <div className="mt-4 flex flex-wrap gap-2" aria-label="순서에 넣을 과정 카드">
        {processCards.map((card) => <button key={card.id} type="button" disabled={order.includes(card.id)} onClick={() => update({ order: [...order, card.id] })} className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 py-3 text-left disabled:opacity-40"><span className="block text-sm font-bold">{card.label}</span><span className="mt-1 block text-xs text-slate-500">{card.detail}</span></button>)}
      </div>
      <Button className={`mt-3 ${buttonClass}`} variant="ghost" disabled={!order.length} onClick={() => update({ order: [] })}><RotateCcw size={16} aria-hidden="true" />순서 다시 놓기</Button>
      <div className="mt-5">
        <Choices label="이번 모델에 새 사진을 보여 주었더니 틀렸습니다. 예측·학습·평가를 어떻게 구별할까요?" value={finalAnswer.transfer} options={[[ 'prediction-updates', '예측 버튼을 다시 누르면 그 사진에 맞게 가중치가 저절로 바뀐다' ], [ 'loss-updates-not-test', '예측은 현재 값으로 계산하고, 학습은 정답과 비교한 손실의 기울기로 값을 수정하며, Test는 수정 없이 확인한다' ], [ 'label-updates', '사진의 실제 정답을 모델 예측으로 바꾸면 학습과 평가가 끝난다' ]]} onChange={(transfer) => update({ transfer })} />
      </div>
      <label className="mt-5 block font-bold">위 실험의 실제 수치나 관찰을 근거로 과정을 내 말로 설명하기
        <textarea rows={4} className={inputClass} value={finalAnswer.reason ?? ''} placeholder="같은 사진의 INPUT·TARGET은 어떻게 쓰였나요? 무엇을 수정했고, 이번 Test와 손글씨 결과는 무엇을 알려 주었나요?" onChange={(event) => update({ reason: event.target.value })} />
      </label>
      <p className="mt-2 text-sm leading-6 text-slate-500">열 글자 이상 작성하면 서술을 저장할 수 있습니다. 앱은 순서·선택 판단과 작성 여부를 확인하며, 서술의 이해도를 자동 채점하지 않습니다.</p>
      <Button className={`mt-5 ${buttonClass}`} disabled={order.length !== 5 || !finalAnswer.transfer || (finalAnswer.reason?.trim().length ?? 0) < 10 || !training || !evaluation || drawings.length < 2} onClick={() => course.submitAnswer('final-explain-v2')}>나의 설명 제출</Button>
      <Feedback id="final-explain-v2" hint="예측에서 나온 확률은 정답과 손실을 비교하는 데 쓰이고, 손실의 기울기는 가중치·편향 수정에 쓰입니다. Test에서는 수정하지 않습니다. 순서와 이유 판단을 다시 살피고 실제 관찰에 연결한 설명도 작성해 주세요." />
      <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6">
        <h4 className="font-bold">선생님과 함께 확인할 설명 기준</h4>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>같은 사진의 정규화된 INPUT과 레이블을 나타낸 TARGET이 각각 어디에 쓰였는지 연결했나요?</li>
          <li>관찰한 손실·정확도 변화와 수정한 가중치·편향을 구별하고, 입력·정답 자체는 유지됨을 설명했나요?</li>
          <li>나의 Test·손글씨 결과를 근거로 새로운 자료를 확인한 이유와 아직 확정할 수 없는 점을 설명했나요?</li>
        </ul>
      </div>
    </Panel>
    <Note>신경망은 Train으로 가중치를 조정해 입력을 예측하는 모델입니다. Test 정확도와 개별 예측을 함께 보아야 배운 내용과 남은 한계를 설명할 수 있습니다.</Note>
  </div>
}

export function TrainingScenes({ scene }: { scene: number }) {
  return <>
    <section hidden={scene !== 4} aria-label="실제 학습과 훈련 결과 해석"><TrainingScene /></section>
    <section hidden={scene !== 5} aria-label="Test 평가와 결과 해석"><EvaluationScene /></section>
    <section hidden={scene !== 6} aria-label="오답 관찰과 손글씨 비교"><ObservationScene /></section>
    <section hidden={scene !== 7} aria-label="실험 기록과 나의 설명"><SummaryScene /></section>
  </>
}
