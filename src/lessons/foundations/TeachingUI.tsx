import { useState, type ReactNode } from 'react'
import { Button } from '../../components/ui/Button'
import { MathExpression, MathFraction } from './MathExpression'
export { NetworkFlowFigure as NetworkPicture } from './NetworkFlowFigure'

export function SymbolName({ name }: { name: string }) {
  const [base, index] = [name[0], name.slice(1)]
  return <span className="whitespace-nowrap italic">{base}{index && <sub>{index}</sub>}</span>
}
export function Fraction({ top, bottom }: { top: ReactNode; bottom: ReactNode }) {
  return <MathFraction top={top} bottom={bottom} />
}
export function Derivative({ name }: { name: string }) {
  return <MathExpression inline formula={`\\frac{\\partial L}{\\partial ${name[0]}${name.length>1?`_{${name.slice(1)}}`:''}}`} />
}
export function SumSymbol({ index = 'k', end = 'C' }: { index?: string; end?: string }) {
  return <MathExpression inline formula={`\\sum_{${index}=1}^{${end}}`} />
}
export function Box({ title, children }: { title: string; children: ReactNode }) {
  return <section className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4"><h3 className="mb-3 text-lg font-bold">{title}</h3><div className="grid min-w-0 grid-cols-1 gap-3 leading-7">{children}</div></section>
}
export interface Row { name: ReactNode; formula: ReactNode; substitute: ReactNode; result: ReactNode }
export function CalculationTable({ rows }: { rows: Row[] }) {
  return <div className="grid min-w-0 grid-cols-1 gap-2"><p className="text-slate-600">표가 넓으면 표 안에서 좌우로 이동하세요. 키보드: 표에 초점을 두고 ←·→.</p><div role="region" aria-label="계산표 가로 스크롤" tabIndex={0} className="min-w-0 max-w-full overflow-x-auto rounded-xl border border-slate-300 focus-visible:outline-3 focus-visible:outline-indigo-600"><table className="w-full min-w-[620px] border-collapse text-left leading-7"><thead className="bg-slate-100"><tr>{['계산 단계', '가져다 쓰는 공식', '숫자 대입', '결과'].map(t => <th key={t} className="min-w-24 whitespace-nowrap p-3">{t}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i} className="border-t border-slate-200"><th className="min-w-24 p-3 font-semibold">{r.name}</th><td className="p-3">{r.formula}</td><td className="p-3">{r.substitute}</td><td className="p-3 font-bold text-indigo-800">{typeof r.result === 'string' && /^-?\d+\.\d+(?:e[+-]?\d+)?$/.test(r.result) ? <>≈ {r.result}</> : r.result}</td></tr>)}</tbody></table></div></div>
}
export interface Task { id: string; prompt: string; options?: string[]; answer: string | number; hint: string; explanation: string; tolerance?: number; validate?: (value: string) => boolean }
export interface Response { value: string; submitted: boolean }
export type Answers = Record<string, Response>
export function correct(task: Task, response?: Response) {
  if (!response?.submitted) return false
  if (task.validate) return task.validate(response.value)
  if (typeof task.answer === 'string') return response.value === task.answer
  const cleaned = response.value.trim().replace(',', '.')
  return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(cleaned) && Number.isFinite(Number(cleaned)) && Math.abs(Number(cleaned) - task.answer) <= (task.tolerance ?? .0006)
}
export function Question({ task, response, onChange, submitLabel = '답 제출' }: { task: Task; response?: Response; onChange: (a: Response) => void; submitLabel?: string }) {
  const ok = correct(task, response)
  return <fieldset id={`task-${task.id}`} className="min-w-0 rounded-xl border border-indigo-200 bg-white p-4">
    <legend className="max-w-full px-2 font-bold leading-7">{task.prompt}</legend>
    {task.options ? <div className="grid min-w-0 grid-cols-1 gap-2">{task.options.map(o => <Button key={o} variant="secondary" aria-pressed={response?.value === o} className={`justify-start text-left ${response?.value === o ? 'border-indigo-600 bg-indigo-50' : ''}`} onClick={() => onChange({ value: o, submitted: false })}>{o}</Button>)}</div> : <label className="grid min-w-0 grid-cols-1 gap-2">수치 입력 (소수 넷째 자리까지 반올림 가능)<input type="text" inputMode="text" aria-label={task.prompt} className="min-h-12 w-full min-w-0 rounded-lg border border-slate-400 p-3" value={response?.value ?? ''} onChange={e => onChange({ value: e.target.value, submitted: false })} /></label>}
    <Button className="mt-3" disabled={!response?.value.trim()} onClick={() => response && onChange({ ...response, submitted: true })}>{submitLabel}</Button>
    <p aria-live="polite" className={`mt-3 rounded-lg p-2 leading-7 ${response?.submitted ? ok ? 'bg-emerald-50' : 'bg-rose-50' : 'text-slate-600'}`}>{response?.submitted ? ok ? `정답입니다. ${task.explanation}` : `다시 계산해 보세요. ${task.hint} 수정한 뒤 다시 제출할 수 있습니다.` : '답을 선택하거나 입력한 뒤 제출해 주세요.'}</p>
  </fieldset>
}
export function SceneNav({ titles, index, setIndex, mode = 'explanation' }: { titles: string[]; index: number; setIndex: (i: number) => void; mode?: 'explanation' | 'calculation' }) {
  const label = mode === 'calculation' ? '계산 단계' : '설명'
  return <nav aria-label={`${label} 이동`} className="flex min-w-0 flex-wrap items-center gap-2"><label className="grid min-w-0 max-w-full gap-1">{label} {index+1}/{titles.length}<select aria-label={label} className="min-h-11 w-full min-w-0 rounded-lg border p-2" value={index} onChange={e => setIndex(Number(e.target.value))}>{titles.map((t, i) => <option key={t} value={i}>{i+1}. {t}</option>)}</select></label><Button variant="secondary" disabled={index === 0} onClick={() => setIndex(index-1)}>이전 {label}</Button><Button variant="secondary" disabled={index === titles.length-1} onClick={() => setIndex(index+1)}>다음 {label}</Button><Button variant="secondary" onClick={() => setIndex(0)}>다시 보기</Button></nav>
}
export function FormulaChoice({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <label className="grid min-w-0 grid-cols-1 gap-2">출력층에 적용할 기울기 공식<select className="min-h-12 w-full min-w-0 rounded-lg border p-2" value={value} onChange={e => onChange(e.target.value)}><option value="">공식을 선택하세요</option><option value="linear">2(ŷ−y)</option><option value="binary">p−y</option><option value="multi">클래스마다 pₖ−yₖ</option></select></label>
}
export function LocalExplanation({ children }: { children: (index: number) => ReactNode }) {
  const [index, setIndex] = useState(0)
  return <><SceneNav titles={['입력', '계산', '해석']} index={index} setIndex={setIndex} />{children(index)}</>
}
