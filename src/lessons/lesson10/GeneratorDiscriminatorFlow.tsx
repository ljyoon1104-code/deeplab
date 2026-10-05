import { ArrowDown, ArrowRight } from 'lucide-react'

function Arrow() {
  return <><ArrowDown className="mx-auto text-orange-600 md:hidden" aria-hidden="true" /><ArrowRight className="my-auto hidden shrink-0 text-orange-600 md:block" aria-hidden="true" /></>
}

export default function GeneratorDiscriminatorFlow() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <h3 className="font-black text-slate-950">GAN · 학습과 사용 구분 (교과서 106쪽)</h3>
      <div className="mt-4 grid gap-5 lg:grid-cols-[2fr_1fr]">
        <section className="min-w-0 rounded-xl border border-violet-200 bg-white p-4" aria-label="GAN 학습 중 흐름">
          <h4 className="font-black text-violet-950">① 학습 중 · 생성과 감별을 반복</h4>
          <div className="mt-4 flex flex-col items-stretch gap-2 md:flex-row md:items-center">
            {['생성 입력', '생성자 Generator', '생성 데이터'].map((item, index) => <div key={item} className="contents"><div className="min-w-0 rounded-xl border border-violet-200 bg-violet-50 p-3 text-center text-sm font-black md:flex-1">{item}</div>{index < 2 && <Arrow />}</div>)}
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-600">생성 입력은 새 결과를 위한 시작 정보이며 실제 데이터를 그대로 복사한 값이 아닙니다.</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center text-sm font-bold">
            <div className="min-w-0 rounded-xl border border-cyan-300 bg-cyan-50 p-3">위에서 만든 생성 데이터</div>
            <div className="min-w-0 rounded-xl border border-blue-300 bg-blue-50 p-3">비교 기준이 되는 실제 데이터</div>
            <ArrowDown className="mx-auto text-orange-600" aria-hidden="true" /><ArrowDown className="mx-auto text-orange-600" aria-hidden="true" />
            <div className="col-span-2 rounded-xl border-2 border-orange-300 bg-orange-50 p-3">감별자 Discriminator<br /><span className="text-xs">두 종류를 입력받아 실제 / 생성 판단</span></div>
          </div>
          <ArrowDown className="mx-auto my-2 text-orange-600" aria-hidden="true" />
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-center text-sm font-bold">감별 결과를 바탕으로<br />생성자·감별자의 가중치 조정</div>
          <p className="mt-3 rounded-xl border border-dashed border-violet-400 p-3 text-center text-sm font-bold">↶ 다시 생성하고 판단하며 학습 반복</p>
        </section>
        <section className="min-w-0 rounded-xl border border-emerald-200 bg-white p-4" aria-label="GAN 학습 후 사용 흐름">
          <h4 className="font-black text-emerald-950">② 학습 후 · 새 콘텐츠 만들기</h4>
          <div className="mt-4 grid gap-2 text-center text-sm font-bold">
            <div className="rounded-xl border border-slate-300 p-3">생성 입력</div>
            <ArrowDown className="mx-auto text-emerald-600" aria-hidden="true" />
            <div className="rounded-xl border-2 border-violet-300 bg-violet-50 p-3">학습된 생성자</div>
            <ArrowDown className="mx-auto text-emerald-600" aria-hidden="true" />
            <div className="rounded-xl border border-cyan-300 bg-cyan-50 p-3">새로운 결과</div>
          </div>
          <p className="mt-4 text-sm leading-6">학습한 뒤 새 콘텐츠를 만들 때는 주로 생성자를 사용합니다. 새 결과를 만들 때마다 위 학습 과정을 처음부터 다시 실행하는 것은 아닙니다.</p>
        </section>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-700">GAN은 생성형 AI를 구현하는 대표 방법 중 하나입니다. 모든 생성형 AI가 GAN인 것은 아닙니다. 이 그림은 원리 설명이며 실제 모델 실행 결과가 아닙니다.</p>
    </div>
  )
}
