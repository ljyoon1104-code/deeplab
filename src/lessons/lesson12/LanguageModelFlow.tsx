import { ArrowDown } from 'lucide-react'
import { GENERATION_PHASES } from './lesson12Data'

export default function LanguageModelFlow() {
  return <div className="flex flex-col items-stretch gap-2" role="img" aria-label={GENERATION_PHASES.map((stage) => `${stage.title}: ${stage.detail}`).join(' → ')}>{GENERATION_PHASES.map((stage, index) => <div key={stage.title} className="contents"><div className={`rounded-xl border p-4 text-center ${index < 2 ? 'border-cyan-200 bg-cyan-50' : index === 2 ? 'border-violet-200 bg-violet-50' : 'border-emerald-200 bg-emerald-50'}`}><strong className="text-sm">{stage.title}</strong><p className="mt-2 text-sm leading-6">{stage.detail}</p></div>{index < GENERATION_PHASES.length - 1 ? <ArrowDown className="mx-auto text-slate-500" aria-hidden="true" /> : null}</div>)}</div>
}
