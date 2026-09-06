import { ArrowDown, ArrowRight } from 'lucide-react'

export const SPEECH_STAGES = ['말소리', '음성의 여러 특징 분석', '음소 등 말소리 단위 추정', '가능한 단어와 문장 판단', '텍스트'] as const

export default function SpeechRecognitionFlow({ viewed, onView }: { viewed: readonly string[]; onView: (stage: string) => void }) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-stretch" role="group" aria-label={`음성 인식 단계: ${SPEECH_STAGES.join('에서 다음으로: ')}`}>
      {SPEECH_STAGES.map((stage, index) => <div key={stage} className="contents"><button type="button" aria-pressed={viewed.includes(stage)} onClick={() => onView(stage)} className={`min-h-20 min-w-0 rounded-2xl border p-3 text-center text-sm font-black md:flex-1 ${viewed.includes(stage) ? 'border-cyan-600 bg-cyan-50 text-cyan-950' : 'border-slate-300 bg-white text-slate-700'}`}>{viewed.includes(stage) ? '✓ 확인함 · ' : ''}{stage}</button>{index < SPEECH_STAGES.length - 1 ? <><ArrowDown className="mx-auto text-cyan-700 md:hidden" aria-hidden="true" /><ArrowRight className="my-auto hidden shrink-0 text-cyan-700 md:block" aria-hidden="true" /></> : null}</div>)}
    </div>
  )
}
