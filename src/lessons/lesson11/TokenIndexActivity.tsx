import { INDEX_ACTIVITY_WORDS, WORDS } from './lesson11Data'
import { createWordIndex } from './textRepresentation'

interface TokenIndexActivityProps {
  assignments: Record<string, string>
  selectedWord: string
  onSelectWord: (word: string) => void
  onAssign: (word: string, index: number) => void
}

export default function TokenIndexActivity({ assignments, selectedWord, onSelectWord, onAssign }: TokenIndexActivityProps) {
  const indexMap = createWordIndex(WORDS)
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div>
        <h3 className="font-black">① 단어 카드 선택</h3>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {INDEX_ACTIVITY_WORDS.map((word) => {
            const assigned = assignments[word]
            const correct = assigned === String(indexMap.get(word))
            return <button key={word} type="button" aria-pressed={selectedWord === word} onClick={() => onSelectWord(word)} className={`min-h-14 rounded-xl border p-3 font-bold ${selectedWord === word ? 'border-violet-600 bg-violet-50' : 'border-slate-300 bg-white'}`}>{word}{assigned !== undefined ? <span className={`mt-1 block text-xs ${correct ? 'text-emerald-700' : 'text-rose-700'}`}>{correct ? `✓ 인덱스 ${assigned}` : `✕ ${assigned} 다시 연결`}</span> : null}</button>
          })}
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="font-black">② “{selectedWord}”에 숫자 카드 연결</h3>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3">
          {WORDS.map((_, index) => <button key={index} type="button" aria-pressed={assignments[selectedWord] === String(index)} onClick={() => onAssign(selectedWord, index)} className={`min-h-12 rounded-xl border font-mono font-black ${assignments[selectedWord] === String(index) ? 'border-violet-600 bg-violet-50 text-violet-950' : 'border-slate-300 bg-white'}`}>{index}</button>)}
        </div>
        {assignments[selectedWord] !== undefined ? assignments[selectedWord] === String(indexMap.get(selectedWord))
          ? <p className="mt-4 text-sm font-bold text-emerald-700" role="status">✓ “{selectedWord}”의 고정 인덱스를 정확히 연결했습니다.</p>
          : <p className="mt-4 text-sm font-bold text-rose-700" role="status">✕ 예문의 단어 순서를 다시 확인하고 다른 숫자를 선택하세요.</p> : null}
      </div>
    </div>
  )
}

