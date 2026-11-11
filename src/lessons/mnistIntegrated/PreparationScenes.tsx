import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { MnistCanvas } from '../lesson07/MnistCanvas'
import { useLesson08Lab } from '../lesson08/Lesson08Context'
import { MODEL_OPTIONS } from '../lesson08/lesson08Data'
import { useMnistCourse } from './CourseSession'

const box = 'min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6'

export function PreparationScenes({ scene }: { scene: number }) {
  const course = useMnistCourse()
  const lab = useLesson08Lab()
  const [trialLabel, setTrialLabel] = useState<number | null>(null)
  const { selectedSample: sample, dataset, selectedPixelIndex: index, record } = course
  if (course.loading || !dataset || !sample) return <div className={box} role="status">{course.error ?? '실제 MNIST 사진을 준비하고 있습니다.'}{course.error && <Button className="ml-3" onClick={() => void course.retry()}>자료 다시 불러오기</Button>}</div>
  const pixel = sample.pixels[index]
  const row = Math.floor(index / 28) + 1
  const column = index % 28 + 1
  const target = record.normalizationTarget
  const targetSample = dataset.samples.find((item) => item.id === target?.sampleId)
  const activeModelType = lab.modelReady && lab.trainingResult ? lab.trainingResult.config.modelType : lab.modelType
  const prediction = lab.samplePrediction?.sampleId === sample.id && lab.samplePrediction.modelType === activeModelType ? lab.samplePrediction : null
  const normalizedAnswer = record.answers.normalization
  const vectorLabel = trialLabel ?? sample.label

  return <>
    <section hidden={scene !== 1} className="space-y-5" aria-label="손글씨 인식 문제">
      <p className="leading-7">서로 다르게 쓴 숫자를 같은 종류로 알아보게 해 봅니다. MNIST는 손글씨 사진과 실제 정답인 <strong>레이블</strong>을 함께 제공하므로, 예측을 정답과 비교하며 학습하고 평가할 수 있습니다.</p>
      <div className="grid gap-5 md:grid-cols-[auto_minmax(0,1fr)]">
        <div className={`${box} flex flex-col items-center gap-3`}><MnistCanvas sample={sample} size={196} /><span className="font-bold">입력: 실제 손글씨 사진</span></div>
        <div className={`${box} space-y-4`}>
          <p><strong>실제 정답: {sample.label}</strong> — 자료에 붙어 있는 레이블입니다.</p>
          <p><strong>모델의 예측: {prediction ? `${prediction.prediction.predictedLabel} (${prediction.trained ? '학습한 모델' : '학습하지 않은 관찰 모델'})` : '아직 이 사진으로 계산하지 않았습니다.'}</strong> 숫자 0~9에 부여한 확률 중 가장 큰 후보를 확인합니다.</p>
          <label className="block font-semibold">함께 관찰할 Train 사진<select className="mt-2 block min-h-12 w-full rounded-xl border p-3" value={sample.id} onChange={(event) => course.selectSample(event.target.value)}>{dataset.samples.slice(0, 30).map((item, i) => <option key={item.id} value={item.id}>{i + 1}번째 사진 · 실제 정답 {item.label}</option>)}{!dataset.samples.slice(0, 30).some((item) => item.id === sample.id) && <option value={sample.id}>저장한 사진 · 실제 정답 {sample.label}</option>}</select></label>
          <p className="text-sm leading-6 text-slate-600">Train은 학습에 사용하는 자료이고, 별도의 Test는 처음 보는 자료에 대한 예측을 평가합니다. Test의 정답으로 가중치를 수정하지 않습니다.</p>
        </div>
      </div>
      <p className={box}>앞에서 배운 <strong>입력 → 순전파 → 예측 → 정답과 손실 비교 → 값 수정</strong>을 실제 사진으로 실행합니다. 이번 필수 실험은 한 번이며, 조건을 바꾼 추가 실험은 선택입니다.</p>
    </section>

    <section hidden={scene !== 2} className="space-y-5" aria-label="사진을 숫자로 준비">
      <p className="leading-7">픽셀은 사진을 이루는 한 칸입니다. 한 칸을 골라 위치와 밝기를 연결한 뒤, 같은 784개 값을 0~1 사이로 바꾸어 신경망의 입력으로 준비합니다.</p>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className={`${box} space-y-4`}>
          <div className="relative mx-auto w-56 max-w-full">
            <button type="button" className="block w-full focus-visible:outline-4 focus-visible:outline-indigo-600" aria-label="사진의 픽셀 선택. 키보드는 아래 픽셀 위치 슬라이더를 사용하세요." onPointerDown={(event) => { const rect = event.currentTarget.getBoundingClientRect(); const x = Math.max(0, Math.min(27, Math.floor((event.clientX - rect.left) / rect.width * 28))); const y = Math.max(0, Math.min(27, Math.floor((event.clientY - rect.top) / rect.height * 28))); course.selectPixel(y * 28 + x) }}><MnistCanvas sample={sample} size={224} /></button>
            <span aria-hidden="true" className="pointer-events-none absolute border-2 border-yellow-300" style={{ left: `${(column - 1) / 28 * 100}%`, top: `${(row - 1) / 28 * 100}%`, width: `${100 / 28}%`, height: `${100 / 28}%` }} />
          </div>
          <label className="block">관찰할 픽셀 위치<input className="my-3 block min-h-8 w-full" type="range" min={0} max={783} value={index} onChange={(event) => course.selectPixel(Number(event.target.value))} /></label>
          <p aria-live="polite"><strong>{row}행 {column}열 · 밝기 {pixel}</strong><br />배열 인덱스 = ({row}−1)×28+({column}−1) = {index}</p>
          <p className="text-sm leading-6">행 순서대로 펼친 <strong>28×28 = 784개</strong>입니다. 값과 순서는 유지되며 인덱스 0이 첫 칸입니다.</p>
          <div className="max-w-full overflow-x-auto rounded-lg bg-slate-50 p-3 focus-visible:outline-2" tabIndex={0} aria-label="선택한 픽셀 주변의 펼친 배열, 가로 스크롤 가능"><div className="flex w-max gap-2">{sample.pixels.slice(Math.max(0, index - 2), Math.min(784, index + 3)).map((value, i) => { const n = Math.max(0, index - 2) + i; return <div key={n} className={`min-w-16 rounded-lg border p-2 text-center ${n === index ? 'border-indigo-600 bg-indigo-100' : 'border-slate-200'}`}><small>#{n}</small><p className="font-bold">{value}</p><p className="text-sm">{(value / 255).toFixed(3)}</p></div> })}</div></div>
          <p>정규화: 밝기 ÷ 255 → 선택한 칸은 <strong>{pixel} ÷ 255 ≈ {(pixel / 255).toFixed(4)}</strong>입니다. 입력 크기를 일정한 범위로 맞춥니다.</p>
        </div>
        <div className="space-y-5">
          {target && targetSample && <form className={`${box} space-y-3`} onSubmit={(event) => { event.preventDefault(); course.submitAnswer('normalization') }}>
            <h3 className="text-lg font-bold">직접 계산 1 · 한 칸 정규화</h3>
            <div className="flex flex-wrap items-center gap-4"><MnistCanvas sample={targetSample} size={84} /><p className="min-w-0 flex-1">이 사진의 {Math.floor(target.index / 28) + 1}행 {target.index % 28 + 1}열<br /><strong>밝기 {target.value} ÷ 255</strong></p></div>
            <p className="text-sm">관찰할 픽셀을 바꾸어도 이 계산 문제의 칸은 유지됩니다. 소수 셋째 자리까지 입력해 보세요.</p>
            <label className="block font-semibold">정규화 답<input type="text" inputMode="text" className="mt-2 min-h-12 w-full rounded-xl border p-3" value={normalizedAnswer?.value ?? ''} onChange={(event) => course.setAnswer('normalization', event.target.value)} /></label>
            <Button type="submit" className="min-h-12">정규화 제출</Button>
            {normalizedAnswer?.submitted && <p role="status" className={course.answerReady('normalization') ? 'text-emerald-700' : 'text-rose-700'}>{course.answerReady('normalization') ? '맞았습니다. 이 값은 선택한 칸의 정규화된 밝기입니다.' : '다시 계산해 보세요. 밝기를 최대 밝기 255로 나눕니다.'}</p>}
          </form>}
          <div className={`${box} space-y-3`}>
            <h3 className="text-lg font-bold">INPUT과 TARGET은 같은 사진의 한 쌍</h3>
            <p><strong>INPUT</strong>: 이 사진을 펼쳐 정규화한 숫자 784개입니다.</p>
            <p><strong>TARGET</strong>: 실제 레이블 {sample.label} 위치만 1인 원-핫 10개입니다. 1은 정답 위치이며 모델의 예측 확률이 아닙니다.</p>
            <label className="block">원-핫 위치 관찰<select className="ml-2 min-h-12 rounded-lg border p-2" value={vectorLabel} onChange={(event) => setTrialLabel(Number(event.target.value))}>{Array.from({ length: 10 }, (_, n) => <option key={n} value={n}>{n}</option>)}</select></label>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">{Array.from({ length: 10 }, (_, n) => <div key={n} className={`rounded-lg border p-2 text-center ${n === vectorLabel ? 'border-emerald-600 bg-emerald-50 font-bold' : 'border-slate-200'}`}><span className="text-sm">{n}번</span><p>{n === vectorLabel ? 1 : 0}</p></div>)}</div>
            <p className="text-sm">{vectorLabel === sample.label ? '현재 사진의 실제 TARGET입니다.' : `지금은 레이블 ${vectorLabel}의 위치를 살펴보는 예시입니다. 실제 사진의 정답 ${sample.label}이나 학습 자료는 바뀌지 않습니다.`}</p>
          </div>
        </div>
      </div>
    </section>

    <section hidden={scene !== 3} className="space-y-5" aria-label="실제 신경망의 예측">
      <p className="leading-7">순전파는 현재 가중치·편향으로 예측을 계산하는 과정입니다. 앞 뉴런의 출력이 다음 뉴런의 입력이 되며, 입력층은 준비한 숫자를 전달합니다.</p>
      <div className={`${box} grid gap-4 sm:grid-cols-3`}>
        <div className="rounded-xl bg-cyan-50 p-4"><strong>① 입력층 · 784개</strong><p className="mt-2">사진의 정규화된 밝기입니다.</p></div>
        <div className="rounded-xl bg-indigo-50 p-4"><strong>② 은닉층 · {MODEL_OPTIONS[activeModelType].layers.join(' → ')}개</strong><p className="mt-2">입력×가중치의 합에 편향을 더합니다. ReLU는 가중합이 양수이면 그대로, 0 이하면 0을 보냅니다.</p></div>
        <div className="rounded-xl bg-amber-50 p-4"><strong>③ 출력층 · 10개</strong><p className="mt-2">점수 10개를 소프트맥스로 바꾸어 숫자 0~9의 예측 확률을 얻습니다. 합은 약 1입니다.</p></div>
      </div>
      <div className={`${box} grid gap-5 md:grid-cols-[auto_minmax(0,1fr)]`}>
        <div className="flex flex-col items-center gap-3"><MnistCanvas sample={sample} size={140} /><p className="font-bold">실제 정답 {sample.label}</p><Button className="min-h-12" disabled={lab.isBusy || lab.previewBusy} onClick={() => void lab.previewSample(sample)}>{lab.previewBusy ? '순전파 계산 중…' : '이 사진으로 실제 예측'}</Button></div>
        <div className="min-w-0 space-y-3">
          <p>{lab.modelReady ? '현재 학습한 모델에 같은 사진을 입력합니다.' : '아직 학습하지 않은 별도 관찰 모델을 사용합니다. 관찰 중 이 모델의 가중치는 수정하지 않습니다. 다음 학습의 초기 가중치와 같다고 비교하지 않습니다.'}</p>
          {lab.previewError && <p role="alert" className="text-rose-700">{lab.previewError}</p>}
          {prediction ? <><p aria-live="polite" className="font-bold">{prediction.trained ? '학습한 모델' : '학습하지 않은 관찰 모델'}의 예측: {prediction.prediction.predictedLabel} · 확률 {(prediction.prediction.confidence * 100).toFixed(1)}%</p><div className="grid grid-cols-5 gap-2">{prediction.prediction.probabilities.map((p, n) => <div key={n} className={`min-w-0 rounded-lg border p-2 text-center ${n === prediction.prediction.predictedLabel ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200'}`}><p>{n}</p><p className="text-sm tabular-nums">{(p * 100).toFixed(1)}%</p></div>)}</div><p>이 확률은 이 사진의 후보를 비교한 값입니다. 전체 Test 정확도나 사실일 확률을 뜻하지 않습니다.</p></> : <p className="rounded-xl bg-slate-50 p-4">버튼으로 실제 순전파 결과를 확인할 수 있습니다. 예측을 관찰해도 학습이 실행되거나 답안이 제출되지는 않습니다.</p>}
        </div>
      </div>
      <p className={box}>가중치·편향을 합쳐 <strong>파라미터</strong>라고 합니다. 다음 장면에서는 실제 정답과 예측을 범주형 교차 엔트로피 손실로 비교하고, 역전파로 구한 기울기를 이용해 이 값들을 수정합니다.</p>
    </section>
  </>
}
