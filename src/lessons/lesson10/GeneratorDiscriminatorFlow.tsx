import { ArrowDown } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/ui/Button'

const explanations = [
  '전체 보기: 학습 중에는 생성자와 감별자를 함께 학습시키고, 학습 후 생성에는 학습된 생성자를 사용합니다.',
  '① 기본 GAN은 노이즈, 즉 무작위 숫자 묶음을 시작 정보로 받아 새 데이터를 만듭니다. 모든 생성형 AI가 노이즈만 입력받는 것은 아닙니다.',
  '② 감별자는 생성 데이터와 실제 데이터를 각각 받아 실제인지 생성된 것인지 판단합니다.',
  '③ 두 신경망은 각자의 목표로 손실을 계산하고, 역전파로 가중치를 수정합니다. 5~6차시에서 배운 학습 원리를 서로 다른 목표에 적용합니다.',
  '④ 학습 후에는 새 생성 입력을 학습된 생성자에 넣어 결과를 만듭니다. 생성할 때마다 감별자를 반드시 거치는 것은 아닙니다.',
] as const

function NeuralNetwork({ name }: { name: string }) {
  const columns = [[30, 65, 100], [42, 88], [65]]
  return <div className="rounded-xl border-2 border-current bg-white p-3 text-center">
    <p className="text-sm font-black">{name}</p>
    <svg viewBox="0 0 260 130" className="mx-auto mt-2 w-full max-w-64" role="img" aria-label={`${name}: 여러 인공 뉴런과 연결선으로 그린 별도의 신경망. 실제 층 수나 가중치가 아닌 구조 설명용입니다.`}>
      {columns.slice(0, -1).flatMap((ys, column) => ys.flatMap((y, row) => columns[column + 1].map((nextY, nextRow) => <line key={`${column}-${row}-${nextRow}`} x1={30 + column * 100} y1={y} x2={130 + column * 100} y2={nextY} stroke="currentColor" strokeWidth="2" opacity="0.5" />)))}
      {columns.flatMap((ys, column) => ys.map((y, row) => <circle key={`${column}-${row}`} cx={30 + column * 100} cy={y} r="10" fill="white" stroke="currentColor" strokeWidth="3" />))}
    </svg>
    <p className="text-xs leading-5">원 = 인공 뉴런 · 선 = 정보 전달 연결</p>
  </div>
}

export default function GeneratorDiscriminatorFlow() {
  const [stage, setStage] = useState(0)
  const highlight = (target: number) => stage === target ? ' ring-2 ring-violet-600 ring-offset-2' : ''
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <h3 className="font-black text-slate-950">GAN · 학습과 사용 구분 (교과서 106쪽)</h3>
      <p className="mt-3 min-h-20 text-sm leading-6" aria-live="polite" aria-atomic="true"><strong>설명 {stage + 1}/{explanations.length} · </strong>{explanations[stage]}</p>
      <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label="GAN 설명 조작"><Button variant="secondary" disabled={stage === 0} onClick={() => setStage(value => value - 1)}>이전</Button><Button disabled={stage === explanations.length - 1} onClick={() => setStage(value => value + 1)}>다음</Button><Button variant="secondary" onClick={() => setStage(0)}>다시 보기</Button></div>
      <p className="mt-2 text-xs leading-5 text-slate-600">테두리와 번호가 현재 설명 위치를 나타냅니다. 설명 이동은 답안·Round·완료 기록과 무관합니다.</p>
      <div className="mt-4 grid items-start gap-5 lg:grid-cols-2">
        <section className="min-w-0 rounded-xl border border-violet-200 bg-white p-4" aria-label="GAN 학습 중 흐름">
          <h4 className="font-black text-violet-950">① 학습 중 · 생성과 감별을 반복</h4>
          <div className={`mt-4 grid gap-2 rounded-xl p-1 text-violet-900 transition-colors motion-reduce:transition-none${highlight(1)}`}>
            <p className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-center text-sm font-black">① 생성 입력 · 노이즈(무작위 숫자 묶음)</p>
            <ArrowDown className="mx-auto" aria-hidden="true" />
            <NeuralNetwork name="생성자 Generator" />
            <ArrowDown className="mx-auto" aria-hidden="true" />
            <p className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-center text-sm font-black">생성 데이터 · 실제와 비슷한 새 결과</p>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-600">생성자의 목표: 생성 결과를 감별자가 실제 데이터처럼 판단하도록 학습합니다.</p>
          <div className={`mt-4 grid grid-cols-2 gap-2 rounded-xl p-1 text-center text-sm font-bold${highlight(2)}`}>
            <div className="min-w-0 rounded-xl border border-cyan-300 bg-cyan-50 p-3">위에서 만든 생성 데이터</div>
            <div className="min-w-0 rounded-xl border border-blue-300 bg-blue-50 p-3">비교 기준이 되는 실제 데이터</div>
            <ArrowDown className="mx-auto text-orange-600" aria-hidden="true" /><ArrowDown className="mx-auto text-orange-600" aria-hidden="true" />
            <div className="col-span-2 text-orange-900"><NeuralNetwork name="② 감별자 Discriminator" /></div>
            <ArrowDown className="col-span-2 mx-auto text-orange-600" aria-hidden="true" />
            <p className="col-span-2 rounded-xl border border-orange-300 bg-orange-50 p-3">감별자의 목표 · 실제 데이터와 생성 데이터를 더 잘 구분하기</p>
          </div>
          <ArrowDown className="mx-auto my-2 text-orange-600" aria-hidden="true" />
          <div className={`rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-center text-sm font-bold${highlight(3)}`}>③ 각자의 목표에 맞게 학습<br />손실 계산 → 역전파 → 가중치 수정<span className="mt-2 block font-normal">생성자와 감별자는 별도의 신경망입니다. 여기서는 실제 손실이나 가중치를 계산하지 않습니다.</span></div>
          <p className="mt-3 rounded-xl border border-dashed border-violet-400 p-3 text-center text-sm font-bold">↶ 다시 생성하고 판단하며 학습 반복</p>
        </section>
        <section className={`min-w-0 rounded-xl border border-emerald-200 bg-white p-4${highlight(4)}`} aria-label="GAN 학습 후 사용 흐름">
          <h4 className="font-black text-emerald-950">④ 학습 후 · 새 콘텐츠 만들기</h4>
          <div className="mt-4 grid gap-2 text-center text-sm font-bold">
            <div className="rounded-xl border border-slate-300 p-3">생성 입력</div>
            <ArrowDown className="mx-auto text-emerald-600" aria-hidden="true" />
            <div className="text-violet-900"><NeuralNetwork name="학습된 생성자" /></div>
            <ArrowDown className="mx-auto text-emerald-600" aria-hidden="true" />
            <div className="rounded-xl border border-cyan-300 bg-cyan-50 p-3">새로운 결과</div>
          </div>
          <p className="mt-4 text-sm leading-6">학습된 생성자의 구조와 가중치로 새 콘텐츠를 만듭니다. 매번 감별자를 거쳐야 하는 것은 아니며, 위 학습을 처음부터 다시 하는 것도 아닙니다.</p>
        </section>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-700">GAN은 생성형 AI를 구현하는 대표 방법 중 하나입니다. 모든 생성형 AI가 GAN인 것은 아닙니다. 이 그림은 원리 설명이며 실제 모델 실행 결과가 아닙니다.</p>
    </div>
  )
}
