import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { NEXT_WORD_STAGES } from './lesson12Data'
import { formatProbability } from './languageModelMath'

function CandidateButtons({ candidates, selected, onChoose }: { candidates: readonly { word: string; probability: number }[]; selected: string; onChoose: (word: string) => void }) {
  return <div className="mt-3 grid gap-3 sm:grid-cols-3">{candidates.map((candidate) => <button key={candidate.word} type="button" aria-pressed={selected === candidate.word} onClick={() => onChoose(candidate.word)} className={`min-h-20 rounded-xl border p-3 text-left ${selected === candidate.word ? 'border-emerald-700 bg-emerald-50' : 'border-slate-300 bg-white'}`}><span className="flex justify-between gap-2 font-black"><span>{candidate.word}</span><span>{formatProbability(candidate.probability)}</span></span><span className="mt-2 block h-3 overflow-hidden rounded-full bg-slate-200"><span className="block h-full rounded-full bg-emerald-600" style={{ width: `${candidate.probability * 100}%` }} /></span><span className="mt-2 block text-xs font-bold">{selected === candidate.word ? '✓ 선택·제출됨' : '이 단어 선택·제출'}</span></button>)}</div>
}

export default function NextWordSimulation({ firstChoice, secondChoice, onFirstChoice, onSecondChoice }: { firstChoice: string; secondChoice: string; onFirstChoice: (word: string) => void; onSecondChoice: (word: string) => void }) {
  const [stage, setStage] = useState(0)
  const currentContext = secondChoice ? `${NEXT_WORD_STAGES.milk.context} ${secondChoice}.` : firstChoice ? `${NEXT_WORD_STAGES.first.context} ${firstChoice}` : NEXT_WORD_STAGES.first.context
  const titles = ['현재 문맥', '후보 확률', '선택과 새 문맥', '다음 후보']
  const descriptions = [
    `“${NEXT_WORD_STAGES.first.context}”에서 시작해 다음에 이어질 말을 살펴봅니다.`,
    '막대가 길수록 이 문맥에서 다음 후보로 선택될 가능성이 큽니다.',
    firstChoice ? `“${currentContext}”가 다음 예측에 사용할 새 문맥입니다.` : '아직 단어를 선택하지 않았습니다. 설명을 넘기는 것만으로 단어가 자동 선택되지는 않습니다.',
    firstChoice === '우유를' ? `“${NEXT_WORD_STAGES.milk.context}” 뒤의 후보를 비교하고 두 번째 단어를 고르세요.` : firstChoice ? '현재 선택의 분기 안내를 확인하세요.' : '먼저 후보를 선택하면 새 문맥과, 제공된 경우 그다음 후보를 볼 수 있습니다.',
  ]
  const panel = (index: number) => `mt-4 min-w-0 rounded-xl border-2 p-3 transition-colors duration-150 motion-reduce:transition-none ${stage === index ? 'border-emerald-700 bg-white' : 'border-emerald-200 bg-emerald-50'}`
  const appended = secondChoice || firstChoice
  const prefix = appended ? currentContext.slice(0, currentContext.lastIndexOf(appended)) : currentContext
  return <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
    <h3 className="font-black">학생이 현재 만드는 문맥 · 고정 후보 선택 활동</h3>
    <p className="mt-2 mb-4 text-sm leading-6">TV를 또는 버스를 선택해 문맥 변화를 본 뒤, 우유를 선택하고 두 번째 후보를 고르세요.</p>
    <p className="text-sm font-black text-emerald-900">문맥 → 후보 확률 → 선택·제출 → 새 문맥 → 다음 후보</p>
    <p className="mt-2 text-sm leading-6"><strong>단어 버튼으로 직접 선택·제출</strong>합니다. 무작위 추출이 아니며 낮은 확률도 오답은 아닙니다.</p>
    <div className={panel(0)}><h3 className="font-black">① 처음 문맥</h3><p className="mt-2 text-lg font-bold">{NEXT_WORD_STAGES.first.context}</p></div>
    <div className={panel(1)}><h3 className="font-black">② 첫 번째 다음 단어 후보</h3><p className="mt-2 text-sm">“{NEXT_WORD_STAGES.first.context}” 뒤에 올 후보입니다.</p><CandidateButtons candidates={NEXT_WORD_STAGES.first.candidates} selected={firstChoice} onChoose={onFirstChoice} /></div>
    <div className={panel(2)} aria-live="polite"><h3 className="font-black">③ 선택한 단어를 포함한 현재 문맥</h3><p className="mt-2 text-sm">선택 전 문맥: {secondChoice ? NEXT_WORD_STAGES.milk.context : NEXT_WORD_STAGES.first.context}</p><p className="mt-1 text-sm">방금 선택한 단어: {appended || '아직 없음'}</p><p className="mt-2 break-words text-xl font-black" aria-label={currentContext}>{prefix}{appended && <><span className="inline-block whitespace-nowrap rounded border-2 border-emerald-700 bg-emerald-100 px-1">{appended}</span>{secondChoice ? '.' : ''}</>}</p><p className="mt-2 text-sm">{appended ? '테두리의 새 단어도 다음 예측의 문맥에 포함됩니다.' : '후보 선택 전입니다.'}</p></div>
    {firstChoice && firstChoice !== '우유를' ? <p className="mt-3 text-sm font-bold text-amber-800">“{firstChoice}” 분기는 문맥 비교까지입니다. 후속 후보는 우유를 선택했을 때만 제공됩니다.</p> : null}
    {firstChoice === '우유를' ? <div className={panel(3)}><h3 className="font-black">④ 새 문맥 “{NEXT_WORD_STAGES.milk.context}”의 다음 후보</h3><CandidateButtons candidates={NEXT_WORD_STAGES.milk.candidates} selected={secondChoice} onChoose={onSecondChoice} /><p className="mt-3 text-sm leading-6"><strong>가장 높은 확률 후보는 “마신다” 60%</strong>입니다. 다음 후보 가능성이며, 문장이 사실일 확률이나 모델 정확도 60%가 아닙니다.</p></div> : null}
    <p className="mt-4 text-sm leading-6" aria-live="polite" aria-atomic="true"><strong>설명 · {stage + 1}/4 · {titles[stage]}: </strong>{descriptions[stage]}</p>
    <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label="문장 생성 설명 조작">
      <Button variant="secondary" disabled={stage === 0} onClick={() => setStage((value) => value - 1)} aria-label="생성 과정 이전 설명">이전</Button>
      <Button disabled={stage === titles.length - 1} onClick={() => setStage((value) => value + 1)} aria-label="생성 과정 다음 설명">다음</Button>
      <Button variant="secondary" onClick={() => setStage(0)} aria-label="생성 과정 설명 다시 보기">다시 보기</Button>
    </div>
  </div>
}

