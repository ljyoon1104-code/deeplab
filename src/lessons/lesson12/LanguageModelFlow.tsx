import { ArrowDown } from 'lucide-react'

const stages = ['텍스트 입력', '단어 또는 토큰으로 나누기', '숫자로 표현', '임베딩', '문맥과 단어 관계 처리', '다음 단어 가능성 예측', '후보 중 하나 선택', '새 문맥으로 다시 예측', '문장 생성']

export default function LanguageModelFlow() {
  return <div className="flex flex-col items-stretch gap-2" role="img" aria-label={stages.join('에서 다음으로 ')}>{stages.map((stage, index) => <div key={stage} className="contents"><span className={`rounded-xl border p-3 text-center text-sm font-black ${index < 4 ? 'border-cyan-200 bg-cyan-50' : index < 7 ? 'border-violet-200 bg-violet-50' : 'border-emerald-200 bg-emerald-50'}`}>{stage}</span>{index < stages.length - 1 ? <ArrowDown className="mx-auto text-slate-500" aria-hidden="true" /> : null}</div>)}</div>
}
