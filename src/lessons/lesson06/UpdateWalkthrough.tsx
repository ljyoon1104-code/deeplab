import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { formatTrainingValue, type ModelParameters, type TrainingExample, type TrainingStepResult } from './trainingMath'

interface UpdateWalkthroughProps {
  example: Readonly<TrainingExample>
  beforeParameters: Readonly<ModelParameters>
  result: Readonly<TrainingStepResult>
  learningRate: number
}

const stages = ['가중치 w1', '가중치 w2', '편향 b', '다시 예측', '손실 비교'] as const

function ValuePair({ label, before, after }: { label: string; before: number; after: number }) {
  return (
    <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2" aria-label={`${label}의 학습 전후 값`}>
      <div className="min-w-0 rounded-xl bg-slate-100 p-3">
        <p className="text-sm font-bold text-slate-700">기존 {label}</p>
        <p className="mt-1 break-words font-mono text-xl font-black">{formatTrainingValue(before)}</p>
      </div>
      <span aria-label="변화" className="font-black text-indigo-700">→</span>
      <div className="min-w-0 rounded-xl bg-indigo-50 p-3">
        <p className="text-sm font-bold text-indigo-900">새 {label}</p>
        <p className="mt-1 break-words font-mono text-xl font-black text-indigo-950">{formatTrainingValue(after)}</p>
      </div>
    </div>
  )
}

export function UpdateWalkthrough({ example, beforeParameters, result, learningRate }: UpdateWalkthroughProps) {
  // 실제 1회 학습에서 생성된 기록을 읽습니다. 항목 이동은 학습·답안 상태를 바꾸지 않습니다.
  const [stage, setStage] = useState(0)
  const parameter = stage < 3 ? (['w1', 'w2', 'b'] as const)[stage] : undefined
  const connectedInput = parameter === 'w1' ? example.x1 : parameter === 'w2' ? example.x2 : 1
  const gradient = result.error * connectedInput
  const format = formatTrainingValue

  return (
    <section className="mt-6 min-w-0 rounded-2xl border border-slate-200 p-3 sm:p-5" aria-labelledby="update-walkthrough-title">
      <h4 id="update-walkthrough-title" className="text-lg font-black text-slate-950">무엇이 바뀌었나요? · 실제 1회 학습 기록</h4>
      <p className="mt-2 leading-7 text-slate-700">항목을 골라 수정 계산과 결과를 함께 보세요. 아래 설명 이동은 추가 학습이나 답안 제출이 아닙니다.</p>
      <p className="mt-3 rounded-xl bg-slate-50 p-3 leading-7">
        <strong>유지하는 자료</strong> · 입력 x1={example.x1}, x2={example.x2} · 실젯값 y={example.y}
      </p>
      <ol className="mt-3 flex flex-wrap gap-2" aria-label="학습 기록에서 살펴볼 항목">
        {stages.map((title, index) => (
          <li key={title} className="min-w-0 flex-1 basis-24">
            <button type="button" aria-pressed={stage === index} onClick={() => setStage(index)}
              className={`min-h-12 w-full rounded-xl border-2 px-2 py-2 font-bold transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${stage === index ? 'border-indigo-500 bg-indigo-50 text-indigo-950' : 'border-slate-200 bg-white text-slate-700'}`}>
              {index + 1}. {title}
            </button>
          </li>
        ))}
      </ol>
      <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label="실제 학습 기록의 변화 설명 조작">
        <Button variant="secondary" disabled={stage === 0} onClick={() => setStage((value) => value - 1)} aria-label="학습 변화 이전 설명">이전</Button>
        <Button disabled={stage === stages.length - 1} onClick={() => setStage((value) => value + 1)} aria-label="학습 변화 다음 설명">다음</Button>
        <Button variant="secondary" onClick={() => setStage(0)} aria-label="학습 변화 설명 다시 보기">다시 보기</Button>
      </div>

      <div className="mt-4 min-w-0 border-t border-slate-200 pt-4" aria-live="polite" aria-atomic="true">
        <h5 className="text-lg font-black text-slate-950">{stage + 1}/5 · {stages[stage]}</h5>
        {parameter ? (
          <>
            <ValuePair label={parameter} before={beforeParameters[parameter]} after={result.nextParameters[parameter]} />
            <div className="mt-4 space-y-3 leading-7">
              <div>
                <p className="font-black">① 역전파로 기울기 구하기</p>
                <p>기울기는 이 값을 조금 바꿀 때 손실이 어느 방향으로 얼마나 변하는지 나타냅니다.</p>
                <p className="mt-2 break-words font-mono">예측−실젯값 = {format(result.before.prediction)} − {example.y} ≈ {format(result.error)}</p>
                <p className="break-words font-mono">
                  {parameter === 'b'
                    ? `편향의 기울기 = 예측−실젯값 ≈ ${format(gradient)}`
                    : `${parameter}의 기울기 = (예측−실젯값) × 입력 ${parameter === 'w1' ? 'x1' : 'x2'} ≈ ${format(result.error)} × ${connectedInput} ≈ ${format(gradient)}`}
                </p>
                <p className="mt-1 text-sm text-slate-600">시그모이드와 BCEE를 사용하는 이 뉴런에서 구한 식입니다. 부호 있는 ‘예측−실젯값’과 손실값은 다릅니다.</p>
              </div>
              <div className="rounded-xl bg-indigo-50 p-3">
                <p className="font-black">② 경사 하강법으로 값 수정</p>
                <p>새 값 = 기존 값 − 학습률 × 기울기</p>
                <p className="mt-1 break-words font-mono font-bold">
                  {format(beforeParameters[parameter])} − {learningRate} × ({format(gradient)})<br />
                  ≈ {format(result.nextParameters[parameter])}
                </p>
                <p className="mt-1">학습률 {learningRate}은 기울기에 적용할 수정 크기를 조절합니다. 매번 {learningRate}만큼 바꾼다는 뜻은 아닙니다.</p>
              </div>
              <p>이번에는 음수인 기울기에 학습률을 곱해 빼므로 값이 커졌습니다. 바뀐 가중치와 편향은 <strong>‘다시 예측’의 순전파</strong>에 사용합니다. 모든 학습에서 값이 커지는 것은 아닙니다.</p>
            </div>
          </>
        ) : stage === 3 ? (
          <>
            <ValuePair label="예측값 p" before={result.before.prediction} after={result.after.prediction} />
            <p className="mt-3 leading-7">입력은 그대로 두고 수정된 w1·w2·b로 다시 순전파합니다. 가중합 z가 바뀌어 시그모이드의 출력도 달라집니다.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                { label: '수정 전', parameters: beforeParameters, output: result.before },
                { label: '수정 후', parameters: result.nextParameters, output: result.after },
              ].map(({ label, parameters, output }) => (
                <div key={label} className="min-w-0 rounded-xl bg-slate-50 p-3 leading-7">
                  <p className="font-black">{label} · 같은 입력으로 계산</p>
                  <p className="mt-1">z = x1×w1 + x2×w2 + b</p>
                  <p className="break-words font-mono">= {example.x1}×({format(parameters.w1)})<br />+ {example.x2}×({format(parameters.w2)})<br />+ ({format(parameters.b)}) ≈ {format(output.z)}</p>
                  <p className="mt-2 break-words font-mono font-bold">시그모이드({format(output.z)}) ≈ {format(output.prediction)}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 leading-7">예측값 p는 클래스 1일 확률로 해석하는 출력입니다. 이번에는 실젯값 {example.y}에 가까워졌지만, 손실값이나 모델 전체의 정확도와 같은 값은 아닙니다. 다음 ‘손실 비교’에서 같은 자료로 다시 평가합니다.</p>
          </>
        ) : (
          <>
            <ValuePair label="손실" before={result.before.loss} after={result.after.loss} />
            <p className="mt-3 leading-7">실젯값 y={example.y}는 바꾸지 않습니다. BCEE는 새 예측값을 같은 학습 자료와 비교해 손실을 계산하는 방법입니다.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                { label: '수정 전 예측으로 비교', output: result.before },
                { label: '수정 후 예측으로 비교', output: result.after },
              ].map(({ label, output }) => (
                <div key={label} className="min-w-0 rounded-xl bg-slate-50 p-3 leading-7">
                  <p className="font-black">{label}</p>
                  <p className="mt-1 font-mono">p ≈ {format(output.prediction)}, y = {example.y}</p>
                  <p className="mt-1 break-words font-mono">손실 = {example.y === 1 ? '−ln(p)' : '−ln(1−p)'}<br />≈ −ln({format(example.y === 1 ? output.prediction : 1 - output.prediction)})<br />≈ <strong>{format(output.loss)}</strong></p>
                </div>
              ))}
            </div>
            <p className="mt-3 leading-7">ln은 자연로그이며 앱이 계산합니다. 같은 자료에서 정답 위치의 확률이 커져 이번 손실은 줄었습니다. 손실은 예측을 평가한 값이지 확률·정확도가 아니며, 한 번의 감소가 모든 학습이나 다른 자료의 성능 향상을 보장하지 않습니다.</p>
          </>
        )}
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">표시할 때만 반올림합니다. 실제 학습은 내부 원래 값으로 이미 한 번 실행했으며, ‘다시 보기’는 이 설명의 첫 항목으로만 돌아갑니다.</p>
    </section>
  )
}
