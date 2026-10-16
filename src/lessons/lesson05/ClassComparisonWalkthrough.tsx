import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { formatLoss } from './lossMath'

interface ClassComparisonWalkthroughProps {
  labels: readonly string[]
  target: readonly number[]
  probabilities: readonly number[]
  presetLabel: string
  loss: number
}

const stages = ['실제 레이블', '원-핫의 1', '같은 열의 확률', 'CCEE 결과'] as const

export function ClassComparisonWalkthrough({
  labels,
  target,
  probabilities,
  presetLabel,
  loss,
}: ClassComparisonWalkthroughProps) {
  // 설명 위치만 바꿉니다. 예측 선택·관찰·답안 기록은 부모 활동이 관리합니다.
  const [stage, setStage] = useState(0)
  const targetIndex = target.indexOf(1)
  const targetLabel = labels[targetIndex]
  const targetProbability = probabilities[targetIndex]
  const descriptions = [
    `실제 레이블은 ${targetLabel}입니다. 두 배열 모두 ${targetIndex + 1}번째 칸이 이 클래스를 뜻합니다.`,
    `원-핫 실젯값 [${target.join(', ')}]에서 ${targetLabel}의 칸만 1입니다. 이 1은 모델의 예측 확률이 아니라 정답 위치 표시입니다.`,
    `${presetLabel}에서 같은 ${targetIndex + 1}번째 열의 예측 확률은 ${targetProbability.toFixed(2)}입니다. 이 클래스에 모델이 부여했다고 가정한 확률입니다.`,
    `정답 위치의 확률 ${targetProbability.toFixed(2)}로 계산한 CCEE 손실은 약 ${formatLoss(loss)}입니다. 확률이 아니라 예측을 평가한 값이며, 예측이나 정답 자체를 고치지는 않습니다.`,
  ]
  const highlight = 'border-indigo-500 bg-indigo-50 ring-2 ring-inset ring-indigo-500'

  return (
    <section className="mt-7 min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="class-comparison-title">
      <h3 id="class-comparison-title" className="text-lg font-black text-slate-950">
        정답·예측 확률·손실을 한곳에서 비교하기
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-700">
        같은 열은 같은 붓꽃 종류입니다. 설명을 넘기며 정답의 1 → 같은 열의 확률 → 손실을 따라가 보세요.
      </p>
      <ol className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="비교 설명 순서">
        {stages.map((title, index) => (
          <li key={title} aria-current={stage === index ? 'step' : undefined}
            className={`min-w-0 rounded-lg border-2 p-2 text-sm font-bold transition-colors duration-150 motion-reduce:transition-none ${stage === index ? 'border-indigo-500 bg-indigo-50 text-indigo-950' : 'border-slate-200 text-slate-600'}`}>
            {index + 1}. {title}{stage === index && <span className="block text-xs">현재 설명</span>}
          </li>
        ))}
      </ol>

      <table className="mt-5 w-full table-fixed border-separate border-spacing-1 text-center text-sm">
        <caption className="mb-2 text-left leading-6 text-slate-600">
          {presetLabel} · 실젯값과 소프트맥스 출력 형태의 예시 확률을 같은 열로 비교
        </caption>
        <thead>
          <tr>
            {labels.map((label, index) => (
              <th key={label} scope="col"
                className={`break-words rounded-lg border-2 p-2 align-top transition-colors duration-150 motion-reduce:transition-none ${index === targetIndex && stage === 0 ? highlight : 'border-slate-200 bg-slate-50'}`}>
                <span className="block text-xs">{index + 1}번째 클래스</span>
                <span className="mt-1 block">{label}</span>
                {index === targetIndex && <span className="mt-1 block text-xs text-emerald-800">실제 레이블</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr><th colSpan={labels.length} scope="rowgroup" className="pt-3 pb-1 text-left font-bold">원-핫 실젯값 · 정답 위치 표시</th></tr>
          <tr>
            {target.map((value, index) => (
              <td key={labels[index]} className={`rounded-lg border-2 p-2 transition-colors duration-150 motion-reduce:transition-none ${index === targetIndex && stage === 1 ? highlight : 'border-slate-200'}`}>
                <span className="font-mono text-xl font-black">{value}</span>
                {value === 1 && <span className="block text-xs font-bold text-emerald-800">정답 위치</span>}
              </td>
            ))}
          </tr>
        </tbody>
        <tbody>
          <tr><th colSpan={labels.length} scope="rowgroup" className="pt-3 pb-1 text-left font-bold">예측 확률 · 모델 출력으로 가정한 값</th></tr>
          <tr>
            {probabilities.map((value, index) => (
              <td key={labels[index]} className={`rounded-lg border-2 p-2 align-top transition-colors duration-150 motion-reduce:transition-none ${index === targetIndex && stage >= 2 ? highlight : 'border-slate-200'}`}>
                <span className="font-mono text-lg font-black">{value.toFixed(2)}</span>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                  <div className={`h-full rounded-full ${index === targetIndex ? 'bg-emerald-500' : 'bg-cyan-500'}`} style={{ width: `${value * 100}%` }} />
                </div>
                {index === targetIndex && <span className="mt-2 block text-xs font-bold">CCEE에 사용하는 확률</span>}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <p className={`mt-4 rounded-xl border-2 p-3 font-bold transition-colors duration-150 motion-reduce:transition-none ${stage === 3 ? highlight : 'border-slate-200 bg-slate-50'}`}>
        {targetLabel}의 확률 {targetProbability.toFixed(2)} → 손실값 −ln({targetProbability.toFixed(2)}) ≈ {formatLoss(loss)}
        <span className="mt-2 block text-sm font-normal leading-6">정답 위치의 확률이 높을수록 손실은 작아집니다. 손실값은 예측을 평가한 결과이며 확률이나 정확도가 아닙니다. 로그 계산은 앱이 합니다.</span>
      </p>
      <p className="mt-4 leading-7 text-slate-800" aria-live="polite" aria-atomic="true">
        <strong>{stage + 1}/4 · {stages[stage]}: </strong>{descriptions[stage]}
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label="클래스 비교 설명 조작">
        <Button variant="secondary" disabled={stage === 0} onClick={() => setStage((value) => value - 1)} aria-label="클래스 비교 이전 설명">이전</Button>
        <Button disabled={stage === stages.length - 1} onClick={() => setStage((value) => value + 1)} aria-label="클래스 비교 다음 설명">다음</Button>
        <Button variant="secondary" onClick={() => setStage(0)} aria-label="클래스 비교 설명 다시 보기">다시 보기</Button>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">설명 이동은 예측 관찰 횟수나 답안을 바꾸지 않습니다.</p>
    </section>
  )
}
