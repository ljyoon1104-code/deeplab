import { useState } from 'react'
import { Button } from '../../components/ui/Button'

const information = [
  { text: '민수는', meaning: '행동한 사람', color: 'border-slate-400 bg-slate-100 text-slate-900' },
  { text: '추워서', meaning: '날씨와 이유', color: 'border-blue-500 bg-blue-100 text-blue-950' },
  { text: '학교에서', meaning: '행동한 장소', color: 'border-amber-500 bg-amber-100 text-amber-950' },
  { text: '목도리를 둘렀다', meaning: '살펴볼 행동', color: 'border-violet-500 bg-violet-100 text-violet-950' },
] as const

// 고정 교육용 반영 비중입니다. 실제 모델의 어텐션 점수를 계산하지 않습니다.
export const attentionGuideCriteria = [
  { label: '왜 둘렀을까요?', question: '목도리를 두른 이유', shares: [1, 5, 1, 3], evidence: '② 추워서 ＋ ④ 목도리를 둘렀다', conclusion: '날씨와 행동을 연결해, 추워서 목도리를 둘렀다는 판단에 활용합니다.' },
  { label: '어디에서 둘렀을까요?', question: '목도리를 두른 장소', shares: [1, 1, 5, 3], evidence: '③ 학교에서 ＋ ④ 목도리를 둘렀다', conclusion: '장소와 행동을 연결해, 학교에서 목도리를 둘렀다는 판단에 활용합니다.' },
] as const

/** 단어의 수치 벡터 자체가 아니라, 각 정보가 조합에 기여하는 비율을 나타내는 설명 그림입니다. */
export default function AttentionCombinationGuide() {
  const [criterion, setCriterion] = useState(0)
  const current = attentionGuideCriteria[criterion]
  const total = current.shares.reduce((sum: number, share) => sum + share, 0)
  const pieces = current.shares.flatMap((share, index) => Array.from({ length: share }, () => index))

  return <figure className="min-w-0 rounded-xl border border-slate-300 bg-slate-50 p-3 sm:p-4" aria-label="어텐션 비중과 정보 조합 안내">
    <figcaption className="font-bold">먼저 관찰 · 민수는 추워서 학교에서 목도리를 둘렀다.</figcaption>
    <p className="mt-2 leading-7">질문을 바꾸며 <strong>반영 비중</strong>(조합에 기여하는 정도)을 비교하세요. 비중은 정답일 확률이 아닙니다.</p>
    <div role="group" aria-label="안내 사례의 판단 기준" className="mt-3 grid gap-2 sm:grid-cols-2">
      {attentionGuideCriteria.map((item, index) => <Button key={item.question} variant={criterion === index ? 'primary' : 'secondary'} aria-pressed={criterion === index} onClick={() => setCriterion(index)}>{item.label}</Button>)}
    </div>
    <div className="mt-3" aria-live="polite">
      <h3 className="font-bold">현재 기준: {current.question}</h3>
      <div className="mt-2 grid gap-2" role="list" aria-label="입력 정보와 조합에 반영할 비중">
        {information.map((item, index) => <div key={item.text} role="listitem" className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 rounded-lg border px-3 py-2 ${item.color}`}>
          <div className="min-w-0"><strong>{index + 1}. {item.text}</strong><span className="block text-sm">{item.meaning}</span></div>
          <div className="text-right"><strong>{current.shares[index] / total * 100}%</strong><span className="block text-sm">{total}칸 중 {current.shares[index]}칸</span></div>
        </div>)}
      </div>
      <p className="my-2 text-center font-bold">↓ 각 정보의 기여를 합쳐 하나로 조합</p>
      <div className="rounded-lg border-2 border-indigo-500 bg-white p-3">
        <h4 className="font-bold">조합된 정보 · {total}칸 = 100%</h4>
        <div className="mt-2 grid grid-cols-10 gap-0.5" role="img" aria-label={information.map((item, index) => `${index + 1}번 ${item.text}: ${current.shares[index]}칸`).join(', ')}>
          {pieces.map((source, position) => <span key={position} className={`flex min-w-0 items-center justify-center rounded border py-2 font-bold ${information[source].color}`} aria-hidden="true">{source + 1}</span>)}
        </div>
        <p className="mt-2 text-sm">번호는 위 입력 정보와 같습니다. 한 칸은 {100 / total}%이며, 모든 정보가 조합에 남아 있습니다.</p>
        <div className="mt-3 border-t border-indigo-200 pt-3 leading-7"><strong>판단에 활용할 관계: {current.evidence}</strong><p>{current.conclusion}</p></div>
      </div>
    </div>
    <p className="mt-3 text-sm leading-6">띠는 고정 교육용 비중을 그린 것이며, 문장은 그 관계의 해설입니다. 실제 모델은 현재 처리에 따라 비중을 계산해 숫자 표현들을 조합합니다. 이 그림은 실제 점수·벡터 계산 결과가 아닙니다. 기준 버튼은 관찰만 바꾸고 답안을 제출하지 않습니다.</p>
  </figure>
}
