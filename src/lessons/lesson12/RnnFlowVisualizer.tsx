import { ArrowDown, ArrowRight, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/ui/Button'
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
  const memoryCorrect = current ? memoryAnswers[String(currentIndex)] === current.state : false
  const [review, setReview] = useState<{ activityIndex: number; index: number } | null>(null)
  const solved = viewed.filter((index) => memoryAnswers[String(index)] === RNN_WORDS[index]?.state)
  const sceneIndex = review?.activityIndex === currentIndex && solved.includes(review.index) ? review.index : currentIndex
  const scene = sceneIndex >= 0 ? RNN_WORDS[sceneIndex] : null
  const sceneSolved = solved.includes(sceneIndex)
  const earlierScene = solved.filter((index) => index < sceneIndex).at(-1)
  const laterScene = solved.find((index) => index > sceneIndex)
  const previousContext = RNN_WORDS.slice(0, Math.max(0, sceneIndex)).map((item) => item.word).join(' ')
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
    <p className="mb-4 text-sm leading-6">이 그림은 앞의 정보가 다음 처리에 활용된다는 설명용 표시입니다. 실제 RNN이 앞 단어를 글자 그대로 모두 저장하거나 화면의 설명 문장을 내부 상태로 사용하는 것은 아닙니다.</p>
    <div className="flex flex-wrap gap-2" aria-label="RNN이 처리할 문장 단어 순서">{RNN_WORDS.map((item, index) => <span key={item.word} className={`rounded-xl border px-3 py-2 text-sm font-black ${index === currentIndex ? 'border-blue-700 bg-blue-600 text-white' : viewed.includes(index) ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-300 bg-white'}`}>{index === currentIndex ? '현재 · ' : viewed.includes(index) ? '확인 · ' : ''}{item.word}</span>)}</div>
    <div className="mt-5" aria-live="polite">
      {!scene ? <p className="rounded-xl bg-white p-5 text-center font-bold">‘다음 단어’ 버튼을 눌러 첫 단어부터 처리하세요.</p> : <>
        <p className="mb-3 text-sm font-bold">{sceneIndex === currentIndex ? '현재 활동' : '완료한 장면 복습'} · {sceneIndex + 1}/{RNN_WORDS.length} · {scene.word}</p>
        <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
          <div className="grid min-w-0 gap-2">
            <div className="rounded-xl border-2 border-violet-300 bg-violet-50 p-3"><strong className="text-sm">① 이전까지 처리한 문맥</strong><p className="mt-2 leading-6">{previousContext || '첫 단계: 이전 문맥 없음'}</p><p className="mt-2 text-xs leading-5">앞에서 얻은 정보가 상태를 통해 현재 처리에도 활용됩니다.</p></div>
            <div className="rounded-xl border-2 border-blue-500 bg-blue-50 p-3"><strong className="text-sm">② 현재 단어</strong><p className="mt-2 font-black">{scene.word}</p></div>
          </div>
          <ArrowDown className="mx-auto md:hidden" aria-hidden="true" /><ArrowRight className="hidden md:block" aria-hidden="true" />
          <div className="rounded-xl border-2 border-slate-800 bg-slate-900 p-5 text-center font-black text-white">RNN<p className="mt-2 text-sm">이전 정보와 현재 단어를 함께 처리</p></div>
          <ArrowDown className="mx-auto md:hidden" aria-hidden="true" /><ArrowRight className="hidden md:block" aria-hidden="true" />
          <div className="min-w-0 rounded-xl border-2 border-cyan-300 bg-cyan-50 p-3"><strong className="text-sm">③ 이번 단계에서 더해지는 정보</strong><p className="mt-2 leading-6">{sceneSolved ? scene.state : '아래 선택지에서 현재 단어가 더하는 정보를 판단하세요.'}</p><p className="mt-3 border-t border-cyan-200 pt-3 text-xs leading-5">이전 정보와 함께 다음 처리에 활용됩니다. 이 설명 하나가 상태 전체를 뜻하지는 않습니다.</p></div>
        </div>
        {previousContext.includes('못') && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm leading-6">앞에서 읽은 ‘못’도 현재 처리와 연결됩니다. 마지막 ‘않아’까지 앞의 부정 표현과 함께 살펴보아야 합니다.</p>}
      </>}
    </div>
    {current ? <fieldset className="mt-5 rounded-xl border border-violet-200 bg-violet-50 p-4"><legend className="px-2 font-black">현재 활동 단어 “{current.word}”가 이번 단계에서 더하는 정보는?</legend><div className="mt-3 grid gap-2 sm:grid-cols-3">{RNN_WORDS.map((item) => <button key={item.word} type="button" aria-pressed={memoryAnswers[String(currentIndex)] === item.state} onClick={() => onChooseMemory(currentIndex, item.state)} className={`min-h-11 rounded-xl border p-2 text-sm font-bold ${memoryAnswers[String(currentIndex)] === item.state ? 'border-violet-600 bg-white text-violet-950' : 'border-violet-200 bg-violet-50'}`}>{item.state}</button>)}</div>{memoryAnswers[String(currentIndex)] ? <p className={`mt-3 text-sm font-bold ${memoryCorrect ? 'text-emerald-700' : 'text-rose-700'}`} role="status">{memoryCorrect ? '✓ 이번에 더해진 정보는 이전 정보와 함께 다음 단계에 활용됩니다.' : '✕ 현재 단어와 함께 새로 생긴 정보를 다시 살펴보세요.'}</p> : null}</fieldset> : null}
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="이미 해결한 RNN 장면의 설명 조작">
      <Button variant="secondary" disabled={earlierScene === undefined} onClick={() => setReview({ activityIndex: currentIndex, index: earlierScene! })} aria-label="RNN 이전 설명">이전 설명</Button>
      <Button variant="secondary" disabled={laterScene === undefined} onClick={() => setReview({ activityIndex: currentIndex, index: laterScene! })} aria-label="RNN 다음 설명">다음 설명</Button>
      <Button variant="secondary" disabled={solved.length === 0} onClick={() => setReview({ activityIndex: currentIndex, index: solved[0] })} aria-label="RNN 설명 다시 보기">다시 보기</Button>
      <Button variant="secondary" disabled={review === null} onClick={() => setReview(null)}>현재 활동 보기</Button>
    </div>
    <p className="mt-2 text-xs leading-5 text-slate-500">설명 조작은 해결한 장면만 다시 보여 줍니다. 아래 활동의 현재 단어·답안·진행 기록은 바뀌지 않습니다.</p>
    <div className="mt-5 flex flex-wrap gap-2"><button type="button" disabled={currentIndex >= RNN_WORDS.length - 1 || (currentIndex >= 0 && !memoryCorrect)} onClick={onNext} className="min-h-11 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white disabled:bg-slate-300">다음 단어</button><button type="button" onClick={onReset} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold"><RotateCcw size={17} aria-hidden="true" /> 활동 처음부터</button></div>
  </div>
}
