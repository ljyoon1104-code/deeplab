import { ArrowDown, ArrowRight } from 'lucide-react'

function Arrow() {
  return <><ArrowDown className="mx-auto text-orange-600 md:hidden" aria-hidden="true" /><ArrowRight className="my-auto hidden shrink-0 text-orange-600 md:block" aria-hidden="true" /></>
}

export default function GeneratorDiscriminatorFlow() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5" role="img" aria-label="생성자가 생성 데이터를 만들고, 실제 데이터와 생성 데이터가 감별자에 들어가 실제인지 생성인지 판단하며 피드백이 이어지는 흐름">
      <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
        <div className="rounded-xl border border-violet-300 bg-violet-50 p-4 text-center md:flex-1"><strong>생성자 Generator</strong><span className="mt-1 block text-sm">새로운 데이터를 만듦</span></div>
        <Arrow />
        <div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4 text-center md:flex-1"><strong>생성 데이터</strong><span className="mt-1 block text-sm">실제와 비슷하게 만들려는 결과</span></div>
        <Arrow />
        <div className="grid gap-2 md:flex-1"><div className="rounded-xl border border-blue-300 bg-blue-50 p-3 text-center"><strong>실제 데이터</strong></div><div className="rounded-xl border border-orange-300 bg-orange-50 p-3 text-center"><strong>감별자 Discriminator</strong><span className="mt-1 block text-sm">실제 / 생성 판단</span></div></div>
        <Arrow />
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-center md:flex-1"><strong>판단과 피드백</strong><span className="mt-1 block text-sm">두 신경망의 다음 학습에 영향</span></div>
      </div>
    </div>
  )
}
