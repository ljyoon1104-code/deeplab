import { ArrowDown, ArrowRight, RotateCcw } from 'lucide-react'
import { RNN_WORDS } from './lesson12Data'

interface Props {
  currentIndex: number
  viewed: readonly number[]
  memoryAnswers: Record<string, string>
  onNext: () => void
  onReset: () => void
  onChooseMemory: (index: number, memory: string) => void
}

export default function RnnFlowVisualizer({ currentIndex, viewed, memoryAnswers, onNext, onReset, onChooseMemory }: Props) {
  const current = currentIndex >= 0 ? RNN_WORDS[currentIndex] : null
  const previous = currentIndex > 0 ? RNN_WORDS[currentIndex - 1] : null
  const memoryCorrect = current ? memoryAnswers[String(currentIndex)] === current.state : false
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
    <div className="flex flex-wrap gap-2" aria-label="RNN이 처리할 문장 단어 순서">{RNN_WORDS.map((item, index) => <span key={item.word} className={`rounded-xl border px-3 py-2 text-sm font-black ${index === currentIndex ? 'border-blue-700 bg-blue-600 text-white' : viewed.includes(index) ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-300 bg-white'}`}>{index === currentIndex ? '현재 · ' : viewed.includes(index) ? '확인 · ' : ''}{item.word}</span>)}</div>
    <div className="mt-5" aria-live="polite">
      {!current ? <p className="rounded-xl bg-white p-5 text-center font-bold">‘다음 단어’ 버튼을 눌러 첫 단어부터 처리하세요.</p> : <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center"><div className="grid gap-2">{previous ? <span className="rounded-xl border border-violet-300 bg-violet-50 p-3 text-center font-bold">이전 상태 정보<br /><small>{previous.state}</small></span> : <span className="rounded-xl border border-slate-300 bg-white p-3 text-center font-bold">첫 단계<br /><small>이전 상태 없음</small></span>}<span className="rounded-xl border border-blue-300 bg-blue-50 p-3 text-center font-bold">현재 단어<br />{current.word}</span></div><ArrowDown className="mx-auto md:hidden" aria-hidden="true" /><ArrowRight className="hidden md:block" aria-hidden="true" /><span className="rounded-xl border-2 border-slate-800 bg-slate-900 p-5 text-center font-black text-white">RNN<br /><small>함께 처리</small></span><ArrowDown className="mx-auto md:hidden" aria-hidden="true" /><ArrowRight className="hidden md:block" aria-hidden="true" /><div className="grid gap-2"><span className="rounded-xl border border-cyan-300 bg-cyan-50 p-3 text-center font-bold">현재 단계 출력<br /><small>{current.word} 처리</small></span><span className="rounded-xl border border-violet-300 bg-violet-50 p-3 text-center font-bold">다음 단계 상태 정보<br /><small>{current.state}</small></span></div></div>}
    </div>
    {current ? <fieldset className="mt-5 rounded-xl border border-violet-200 bg-violet-50 p-4"><legend className="px-2 font-black">다음 단계로 무엇을 기억해 전달할까요?</legend><div className="mt-3 grid gap-2 sm:grid-cols-3">{RNN_WORDS.map((item) => <button key={item.word} type="button" aria-pressed={memoryAnswers[String(currentIndex)] === item.state} onClick={() => onChooseMemory(currentIndex, item.state)} className={`min-h-11 rounded-xl border p-2 text-sm font-bold ${memoryAnswers[String(currentIndex)] === item.state ? 'border-violet-600 bg-white text-violet-950' : 'border-violet-200 bg-violet-50'}`}>{item.state}</button>)}</div>{memoryAnswers[String(currentIndex)] ? <p className={`mt-3 text-sm font-bold ${memoryCorrect ? 'text-emerald-700' : 'text-rose-700'}`} role="status">{memoryCorrect ? '✓ 현재 단어에서 얻은 정보를 다음 단계로 전달합니다.' : '✕ 현재 단어와 함께 새로 생긴 정보를 다시 살펴보세요.'}</p> : null}</fieldset> : null}
    <div className="mt-5 flex flex-wrap gap-2"><button type="button" disabled={currentIndex >= RNN_WORDS.length - 1 || (currentIndex >= 0 && !memoryCorrect)} onClick={onNext} className="min-h-11 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white disabled:bg-slate-300">다음 단어</button><button type="button" onClick={onReset} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold"><RotateCcw size={17} aria-hidden="true" /> 처음부터 보기</button></div>
  </div>
}
