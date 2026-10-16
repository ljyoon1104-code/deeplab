import { WORDS } from './lesson11Data'
import { createOneHot } from './textRepresentation'

export default function OneHotVisualizer({ selectedWord, vocabulary = WORDS, revealed = true }: { selectedWord: string; vocabulary?: readonly string[]; revealed?: boolean }) {
  const vector = createOneHot(vocabulary, selectedWord)
  const activeIndex = vector.indexOf(1)
  if (!revealed) return <div className="rounded-xl border border-dashed border-violet-300 bg-violet-50 p-4 text-sm leading-6" role="note">독립 계산 · “{selectedWord}”의 완성 벡터와 1의 위치는 위치 문제를 맞힌 뒤 표시됩니다. 위 단어 목록의 순서를 이용하세요.</div>
  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-black">“{selectedWord}”의 원-핫 벡터</h3><span className="rounded-full bg-white px-3 py-1 text-sm font-bold">벡터 길이: {vector.length}</span></div>
      <p className="mt-2 break-words text-sm leading-6">계산 결과: [{vector.join(', ')}] · 인덱스 {activeIndex}는 왼쪽부터 {activeIndex + 1}번째 칸입니다. 해당 단어 “{vocabulary[activeIndex]}” 위치만 1입니다.</p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label={`${selectedWord} 원-핫 벡터 ${vector.join(', ')}`}>
        {vector.map((value, index) => <div key={vocabulary[index]} className={`min-w-0 rounded-xl border p-2 text-center ${value === 1 ? 'border-violet-700 bg-violet-700 text-white' : 'border-slate-300 bg-white text-slate-700'}`}><span className="block font-mono text-xl font-black">{value}</span><span className="mt-1 block break-keep text-sm font-bold leading-5">인덱스 {index}<br />{vocabulary[index]}{value === 1 ? <><br />✓ 선택 단어</> : null}</span></div>)}
      </div>
      <p className="mt-3 text-xs leading-5">화면에서는 칸이 여러 줄로 배치되어도, 인덱스 0부터 차례대로 이어지는 하나의 벡터입니다.</p>
    </div>
  )
}
