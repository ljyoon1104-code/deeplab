import { WORDS } from './lesson11Data'
import { createOneHot } from './textRepresentation'

export default function OneHotVisualizer({ selectedWord }: { selectedWord: string }) {
  const vector = createOneHot(WORDS, selectedWord)
  const activeIndex = vector.indexOf(1)
  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-black">“{selectedWord}”의 원-핫 벡터</h3><span className="rounded-full bg-white px-3 py-1 text-sm font-bold">벡터 길이: {vector.length}</span></div>
      <p className="mt-2 text-sm">계산 결과: [{vector.join(', ')}] · 1의 위치는 인덱스 {activeIndex}이며 해당 단어는 “{WORDS[activeIndex]}”입니다.</p>
      <div className="mt-4 grid grid-cols-6 gap-1.5" role="group" aria-label={`${selectedWord} 원-핫 벡터 ${vector.join(', ')}`}>
        {vector.map((value, index) => <div key={WORDS[index]} className={`min-w-0 rounded-xl border p-1.5 text-center sm:p-2 ${value === 1 ? 'border-violet-700 bg-violet-700 text-white' : 'border-slate-300 bg-white text-slate-700'}`}><span className="block font-mono text-xl font-black">{value}</span><span className="mt-1 block break-all text-[10px] font-bold leading-4">위치 {index}<br />{WORDS[index]}{value === 1 ? <><br />선택 단어</> : null}</span></div>)}
      </div>
    </div>
  )
}
