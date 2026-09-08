import { FREQUENCY_DOCUMENTS, FREQUENCY_WORDS } from './lesson11Data'
import { countWords, frequencyRatio, tokenizeText } from './textRepresentation'

export default function FrequencyComparison({ topics, onChoose }: { topics: Record<string, string>; onChoose: (documentId: string, topic: string) => void }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {FREQUENCY_DOCUMENTS.map((document, documentIndex) => {
        const counts = countWords(document.text, FREQUENCY_WORDS)
        const tokens = tokenizeText(document.text)
        const selected = topics[document.id]
        const correct = selected === document.answer
        return <section key={document.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5" aria-labelledby={`${document.id}-title`}><h3 id={`${document.id}-title`} className="font-black">문서 {documentIndex + 1}</h3><p className="mt-2 rounded-xl bg-white p-3 font-bold">{document.text}</p><p className="mt-2 text-xs text-slate-600">실제 토큰 {tokens.length}개 · 예: “{documentIndex === 0 ? '축구' : '요리'}” 빈도 비율 {Math.round(frequencyRatio(counts[documentIndex === 0 ? '축구' : '요리'], tokens.length) * 100)}%</p><div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3 xl:grid-cols-6">{FREQUENCY_WORDS.map((word) => <div key={word} className={`rounded-lg border p-2 text-center ${counts[word] ? 'border-cyan-300 bg-cyan-50' : 'border-slate-200 bg-white'}`}><span className="block text-xs">{word}</span><strong className="font-mono text-lg">{counts[word]}</strong></div>)}</div><div className="mt-4 grid grid-cols-2 gap-2"><button type="button" aria-pressed={selected === 'sports'} onClick={() => onChoose(document.id, 'sports')} className={`min-h-11 rounded-xl border font-bold ${selected === 'sports' ? 'border-violet-600 bg-violet-50' : 'border-slate-300 bg-white'}`}>스포츠</button><button type="button" aria-pressed={selected === 'food'} onClick={() => onChoose(document.id, 'food')} className={`min-h-11 rounded-xl border font-bold ${selected === 'food' ? 'border-violet-600 bg-violet-50' : 'border-slate-300 bg-white'}`}>음식·요리</button></div>{selected ? <p className={`mt-3 text-sm font-bold ${correct ? 'text-emerald-700' : 'text-rose-700'}`} role="status">{correct ? '✓ 빈도가 높은 단어에서 주제를 정확히 찾았습니다.' : '✕ 빈도가 1 이상인 단어들을 다시 살펴보세요.'}</p> : null}</section>
      })}
    </div>
  )
}
