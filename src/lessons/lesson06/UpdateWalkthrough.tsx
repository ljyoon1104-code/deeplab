import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import type { TrainingExample } from './trainingMath'

interface DisplayValue {
  readonly label: string
  readonly value: string
}

interface UpdateWalkthroughProps {
  example: Readonly<TrainingExample>
  beforeValues: readonly DisplayValue[]
  afterValues: readonly DisplayValue[]
}

const stages = [
  { title: '유지되는 값', detail: '입력과 실젯값 확인' },
  { title: '조정 전 계산', detail: '순전파 → 오차 계산' },
  { title: '가중치·편향 조정', detail: '역전파 → 경사 하강법' },
  { title: '다시 순전파', detail: '같은 입력 → 새로운 결과' },
] as const

const descriptions = [
  '입력 x1·x2와 비교 기준인 실젯값 y는 유지됩니다. 실젯값을 바꾸어서 오차를 줄이는 것이 아닙니다.',
  '학습 전 가중치와 편향으로 순전파해 예측값을 만들고, 실젯값과 비교하여 오차를 계산했습니다.',
  '역전파는 오차에 관한 정보로 수정 방향을 계산합니다. 경사 하강법으로 실제 조정한 가중치와 편향이 학습 후 영역에 표시됩니다. 입력 데이터가 뒤로 이동한다는 뜻은 아닙니다.',
  '조정된 가중치와 편향에 같은 입력을 넣어 다시 순전파했습니다. 새 가중합과 예측값을 얻고, 같은 실젯값과 비교하여 새 오차를 계산했습니다.',
] as const

export function UpdateWalkthrough({ example, beforeValues, afterValues }: UpdateWalkthroughProps) {
  // 이미 생성된 전후 기록을 읽는 표시 커서입니다. 학습 함수는 호출하지 않습니다.
  const [stage, setStage] = useState(0)
  const highlight = 'border-indigo-500 bg-indigo-50 ring-2 ring-inset ring-indigo-500'

  return (
    <section className="mt-6 min-w-0 rounded-2xl border border-slate-200 p-4 sm:p-5" aria-labelledby="update-walkthrough-title">
      <h4 id="update-walkthrough-title" className="text-lg font-black text-slate-950">변화 따라보기 · 실제 1회 학습 기록</h4>
      <ol className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4" aria-label="한 번 학습의 설명 순서">
        {stages.map((item, index) => (
          <li key={item.title} aria-current={stage === index ? 'step' : undefined}
            className={`min-w-0 rounded-xl border-2 p-3 transition-colors duration-150 motion-reduce:transition-none ${stage === index ? highlight : 'border-slate-200 bg-slate-50'}`}>
            <p className="text-sm font-black">{index + 1}. {item.title}</p>
            <p className="mt-1 text-xs leading-5">{item.detail}</p>
            {stage === index && <p className="mt-1 text-xs font-bold">현재 설명</p>}
          </li>
        ))}
      </ol>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        순방향은 입력을 이용한 계산, 역방향은 오차 정보로 수정 방향을 구하는 과정입니다. 값 조정 뒤에는 다시 순전파합니다.
      </p>
      <div className={`mt-4 rounded-xl border-2 p-3 transition-colors duration-150 motion-reduce:transition-none ${stage === 0 ? highlight : 'border-slate-200'}`}>
        <p className="font-black">고정 · 입력과 실젯값</p>
        <dl className="mt-2 grid grid-cols-3 gap-2">
          {[
            ['입력 x1', example.x1],
            ['입력 x2', example.x2],
            ['실젯값 y', example.y],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0 rounded-lg bg-white p-2 text-center">
              <dt className="text-xs font-bold">{label}</dt>
              <dd className="mt-1 font-mono text-lg font-black">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {[{ title: '학습 전', values: beforeValues }, { title: '1회 학습 후', values: afterValues }].map((record, recordIndex) => (
          <section key={record.title} className="min-w-0 rounded-xl border border-slate-200 p-3" aria-label={record.title}>
            <h5 className="font-black text-slate-950">{record.title}</h5>
            {[
              { title: '조정하는 값 · 가중치와 편향', values: record.values.slice(0, 3), active: recordIndex === 0 ? stage === 1 : stage === 2 },
              { title: '순전파·오차 계산 결과', values: record.values.slice(3), active: recordIndex === 0 ? stage === 1 : stage === 3 },
            ].map((group) => (
              <div key={group.title} className={`mt-3 rounded-xl border-2 p-3 transition-colors duration-150 motion-reduce:transition-none ${group.active ? highlight : 'border-slate-200 bg-slate-50'}`}>
                <p className="text-sm font-bold">{group.title}</p>
                <dl className="mt-2 space-y-2">
                  {group.values.map((item) => (
                    <div key={item.label} className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                      <dt className="text-sm text-slate-700">{item.label}</dt>
                      <dd className="font-mono font-black text-slate-950">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </section>
        ))}
      </div>
      <p className="mt-4 leading-7 text-slate-800" aria-live="polite" aria-atomic="true">
        <strong>{stage + 1}/4 · {stages[stage].title}: </strong>{descriptions[stage]}
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label="실제 학습 기록의 변화 설명 조작">
        <Button variant="secondary" disabled={stage === 0} onClick={() => setStage((value) => value - 1)} aria-label="학습 변화 이전 설명">이전</Button>
        <Button disabled={stage === stages.length - 1} onClick={() => setStage((value) => value + 1)} aria-label="학습 변화 다음 설명">다음</Button>
        <Button variant="secondary" onClick={() => setStage(0)} aria-label="학습 변화 설명 다시 보기">다시 보기</Button>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        설명을 다시 보아도 학습을 더 실행하거나 기록을 초기화하지 않습니다. 이번 예제의 가중치가 증가했다고 모든 학습에서 증가하는 것은 아닙니다.
      </p>
    </section>
  )
}
