import { ArrowDown } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { GENERATION_PHASES, NEXT_WORD_STAGES } from './lesson12Data'
import { formatProbability } from './languageModelMath'

export default function LanguageModelFlow({ firstChoice = '', secondChoice = '' }: { firstChoice?: string; secondChoice?: string }) {
  const [scene, setScene] = useState(0)
  const context = NEXT_WORD_STAGES.first.context
  const currentContext = firstChoice ? `${context} ${firstChoice}${secondChoice ? ` ${secondChoice}` : ''}` : context
  const steps = ['처리 단위 준비', '숫자 표현', '문맥을 바탕으로 후보 예측', '후보 선택과 문장 이어가기']
  const activityLinks = [
    '대응: Lesson 11의 단위 나누기 설명. 띄어쓰기 활동이 실제 형태소 분석기는 아니며 이 화면도 분석기를 실행하지 않습니다.',
    '대응: Lesson 11의 숫자 표현·교육용 임베딩 그림. 이 활동에서 임베딩 모델을 학습하지는 않습니다.',
    '대응: STEP 6의 현재 문맥과 후보 확률. 실제 모델 실행 대신 이미 정해진 교육용 후보를 사용합니다.',
    '대응: STEP 6의 후보 선택 → 새 문맥 → 제공된 두 번째 후보. 버튼 선택은 확률을 보고 관찰하는 활동이며 무작위 추출은 하지 않습니다.',
  ]
  return <div aria-label="교과서의 문장 생성 네 과정과 앱 활동 대응">
    <p className="mb-3 text-sm leading-6">같은 시작 문맥 “{context}”를 네 과정에 대응시킵니다. 아래 그림은 분석기·임베딩·언어 모델을 실제 실행한 결과가 아닙니다.</p>
    <div className="flex flex-col items-stretch gap-2">{GENERATION_PHASES.map((stage, index) => <div key={stage.title} className="contents"><div className={`min-w-0 rounded-xl border-2 p-4 transition-colors motion-reduce:transition-none ${scene === index ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-slate-50'}`}><h4 className="text-sm font-black">{index + 1}. {stage.title} · {steps[index]}</h4><p className="mt-2 text-sm leading-6">{stage.detail}</p>
      <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-sm leading-7">
        {index === 0 ? <><strong>입력 문맥:</strong> {context}<p>앱에서는 띄어쓰기로 나눈 단위를 관찰: <span className="rounded border-2 border-cyan-600 px-2">{context}</span></p><p>실제 형태소 분석을 실행한 결과와는 다릅니다.</p></> : index === 1 ? <><span className="rounded border border-cyan-600 px-2">{context}</span> → <span className="rounded border border-violet-600 px-2">[숫자로 표현]</span><p>숫자 표현의 역할만 표시합니다. 실제 임베딩 값을 계산하거나 만들어 넣지 않습니다.</p></> : index === 2 ? <><strong>“{context}” 다음 후보 · 제공된 고정 예시</strong><div className="mt-2 flex flex-wrap gap-2">{NEXT_WORD_STAGES.first.candidates.map((candidate) => <span key={candidate.word} className="rounded border border-slate-300 px-2">{candidate.word} {formatProbability(candidate.probability)}</span>)}</div></> : <><p>선택 전: {context}</p><p><strong>{firstChoice ? '현재 활동에서 선택한 결과:' : '현재 활동은 아직 선택 전:'}</strong></p><p className="mt-2 break-words font-bold">{firstChoice ? <>{context} <mark className="inline-block whitespace-nowrap rounded bg-emerald-100 px-1">{firstChoice}</mark>{secondChoice ? <> <mark className="inline-block whitespace-nowrap rounded bg-emerald-100 px-1">{secondChoice}</mark></> : null}</> : `${currentContext} [선택한 뒤에 이어집니다]`}</p><p>설명 이동은 단어를 선택하지 않습니다. 활동에서 선택한 단어만 표시합니다.</p></>}
      </div><p className="mt-3 text-xs leading-6 text-slate-600">{activityLinks[index]}</p></div>{index < GENERATION_PHASES.length - 1 ? <ArrowDown className="mx-auto text-slate-500" aria-hidden="true" /> : null}</div>)}</div>
    <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label="네 기본 과정 설명 조작"><Button variant="secondary" disabled={scene === 0} onClick={() => setScene((value) => value - 1)}>이전</Button><Button disabled={scene === 3} onClick={() => setScene((value) => value + 1)}>다음</Button><Button variant="secondary" onClick={() => setScene(0)}>다시 보기</Button></div>
    <p className="mt-2 text-sm font-bold" aria-live="polite">현재 강조: {scene + 1}. {GENERATION_PHASES[scene].title} · 설명 조작은 답안·선택 기록을 바꾸지 않습니다.</p>
  </div>
}
