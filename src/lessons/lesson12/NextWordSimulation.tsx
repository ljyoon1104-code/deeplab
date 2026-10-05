import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { NEXT_WORD_STAGES } from './lesson12Data'
import { formatProbability } from './languageModelMath'

function CandidateButtons({ candidates, selected, onChoose }: { candidates: readonly { word: string; probability: number }[]; selected: string; onChoose: (word: string) => void }) {
  return <div className="mt-3 grid gap-3 sm:grid-cols-3">{candidates.map((candidate) => <button key={candidate.word} type="button" aria-pressed={selected === candidate.word} onClick={() => onChoose(candidate.word)} className={`min-h-20 rounded-xl border p-3 text-left ${selected === candidate.word ? 'border-emerald-700 bg-emerald-50' : 'border-slate-300 bg-white'}`}><span className="flex justify-between gap-2 font-black"><span>{candidate.word}</span><span>{formatProbability(candidate.probability)}</span></span><span className="mt-2 block h-3 overflow-hidden rounded-full bg-slate-200"><span className="block h-full rounded-full bg-emerald-600" style={{ width: `${candidate.probability * 100}%` }} /></span></button>)}</div>
}

export default function NextWordSimulation({ firstChoice, secondChoice, onFirstChoice, onSecondChoice }: { firstChoice: string; secondChoice: string; onFirstChoice: (word: string) => void; onSecondChoice: (word: string) => void }) {
  const [stage, setStage] = useState(0)
  const currentContext = secondChoice ? `${NEXT_WORD_STAGES.milk.context} ${secondChoice}.` : firstChoice ? `${NEXT_WORD_STAGES.first.context} ${firstChoice}` : NEXT_WORD_STAGES.first.context
  const titles = ['현재 문맥', '후보 확률', '선택과 새 문맥', '다음 후보']
  const descriptions = [
    `처음 문맥은 “${NEXT_WORD_STAGES.first.context}”입니다. 학습된 모델로 생성하는 원리를 고정 예시로 살펴봅니다.`,
    '이 문맥에 연결된 기존 후보 확률을 비교하고 아래 단어 버튼으로 선택하세요. 빈도표에서 계산한 확률과는 별개의 교육용 예시입니다.',
    firstChoice ? `선택한 단어가 문장 끝에 추가되어 “${currentContext}”라는 새 문맥을 만듭니다. 다음 후보를 볼 때 이 문맥을 사용합니다.` : '아직 단어를 선택하지 않았습니다. 설명을 넘기는 것만으로 단어가 자동 선택되지는 않습니다.',
    firstChoice === '우유를' ? `제공된 다음 후보는 “${NEXT_WORD_STAGES.milk.context}”에 연결되어 있습니다. 두 번째 단어도 선택하면 문맥이 다시 길어집니다.` : firstChoice ? '이 선택 뒤의 후보 확률은 정의되어 있지 않습니다. 임의로 후속 단어나 확률을 만들지 않습니다.' : '먼저 후보를 선택하면 새 문맥과, 제공된 경우 그다음 후보를 볼 수 있습니다.',
  ]
  const panel = (index: number) => `mt-4 min-w-0 rounded-xl border-2 p-3 transition-colors duration-150 motion-reduce:transition-none ${stage === index ? 'border-emerald-700 bg-white' : 'border-emerald-200 bg-emerald-50'}`
  const appended = secondChoice || firstChoice
  const prefix = appended ? currentContext.slice(0, currentContext.lastIndexOf(appended)) : currentContext
  return <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
    <p className="text-sm font-black text-emerald-900">문맥 → 후보 확률 → 선택 → 새 문맥 → 다음 후보</p>
    <div className={panel(0)}><h3 className="font-black">① 처음 문맥</h3><p className="mt-2 text-lg font-bold">{NEXT_WORD_STAGES.first.context}</p></div>
    <div className={panel(1)}><h3 className="font-black">② 첫 번째 다음 단어 후보</h3><p className="mt-2 text-sm">“{NEXT_WORD_STAGES.first.context}” 뒤에 올 후보입니다.</p><CandidateButtons candidates={NEXT_WORD_STAGES.first.candidates} selected={firstChoice} onChoose={onFirstChoice} /></div>
    <div className={panel(2)} aria-live="polite"><h3 className="font-black">③ 선택한 단어를 포함한 현재 문맥</h3><p className="mt-2 break-words text-xl font-black" aria-label={currentContext}>{prefix}{appended && <><span className="rounded border-2 border-emerald-700 bg-emerald-100 px-1">{appended}</span>{secondChoice ? '.' : ''}</>}</p><p className="mt-2 text-sm">{appended ? '테두리는 방금 추가된 단어입니다. 앞 문맥이 사라지는 것이 아니라 함께 이어집니다.' : '후보 선택 전입니다.'}</p></div>
    {firstChoice && firstChoice !== '우유를' ? <p className="mt-3 text-sm font-bold text-amber-800">선택한 “{firstChoice}”가 문맥에 추가되었습니다. 제공된 두 번째 단계는 기본 학습 경로인 “우유를”을 선택하면 이어집니다. 다른 분기의 후속 확률은 제공하지 않습니다.</p> : null}
    {firstChoice === '우유를' ? <div className={panel(3)}><h3 className="font-black">④ 새 문맥 “{NEXT_WORD_STAGES.milk.context}”의 다음 후보</h3><CandidateButtons candidates={NEXT_WORD_STAGES.milk.candidates} selected={secondChoice} onChoose={onSecondChoice} /><p className="mt-3 text-sm leading-6"><strong>가장 높은 확률 후보는 “마신다” 60%</strong>입니다. 다른 후보도 0%가 아니므로 선택 가능성이 완전히 사라진 것은 아닙니다.</p></div> : null}
    <p className="mt-4 text-sm leading-6" aria-live="polite" aria-atomic="true"><strong>{stage + 1}/4 · {titles[stage]}: </strong>{descriptions[stage]}</p>
    <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label="문장 생성 설명 조작">
      <Button variant="secondary" disabled={stage === 0} onClick={() => setStage((value) => value - 1)} aria-label="생성 과정 이전 설명">이전</Button>
      <Button disabled={stage === titles.length - 1} onClick={() => setStage((value) => value + 1)} aria-label="생성 과정 다음 설명">다음</Button>
      <Button variant="secondary" onClick={() => setStage(0)} aria-label="생성 과정 설명 다시 보기">다시 보기</Button>
    </div>
    <p className="mt-2 text-xs leading-5 text-slate-600">설명 다시 보기는 단어 선택이나 제출 기록을 지우지 않습니다. 확률이 높다는 것은 사실이 맞다는 뜻이 아닙니다.</p>
  </div>
}

