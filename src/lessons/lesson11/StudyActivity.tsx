import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { Button } from '../../components/ui/Button'

export interface StudyTask {
  id: string
  prompt: string
  options?: readonly string[]
  answer?: string
  validate?: (value: string) => boolean
  hint: string | ((value: string) => string)
  explanation: string
  placeholder?: string
  prerequisiteId?: string
}
interface Answer { value: string; submitted: boolean }
type Answers = Record<string, Answer>
interface StudyState {
  answers: Answers
  change: (id: string, value: string) => void
  submit: (id: string) => void
  correct: (id: string) => boolean
  tasks: Record<string, StudyTask>
  storageError: boolean
}
const StudyContext = createContext<StudyState | null>(null)
export function passes(task: StudyTask, value: string) {
  return task.validate ? task.validate(value) : value === task.answer
}
export function numericAnswer(expected: number, tolerance = 1e-9) {
  return (value: string) => {
    const cleaned = value.trim().replace(',', '.')
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(cleaned)) return false
    const number = Number(cleaned)
    return Number.isFinite(number) && Math.abs(number - expected) <= tolerance
  }
}

// 새 문항은 별도 이름 공간에 보관합니다. 기존 activity:v1·진행도 키는 읽거나 쓰지 않습니다.
export function StudyProvider({ lesson, tasks, children }: { lesson: '11' | '12'; tasks: Record<string, StudyTask>; children: ReactNode }) {
  const storageKey = `deep-learning-lab:lesson${lesson}:study:20261017:v1`
  const [storageError, setStorageError] = useState(false)
  const [answers, setAnswers] = useState<Answers>(() => {
    try {
      const raw: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '{}')
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
      return Object.fromEntries(Object.entries(raw).filter(([id, value]) => tasks[id] && value && typeof value.value === 'string' && typeof value.submitted === 'boolean'))
    } catch { return {} }
  })
  const [edited, setEdited] = useState(false)
  useEffect(() => {
    if (!edited) return
    try { localStorage.setItem(storageKey, JSON.stringify(answers)); setStorageError(false) }
    catch { setStorageError(true) }
  }, [answers, edited, storageKey])
  const change = (id: string, value: string) => {
    setEdited(true)
    setAnswers((current) => ({ ...current, [id]: { value, submitted: false } }))
  }
  const submit = (id: string) => {
    setEdited(true)
    setAnswers((current) => current[id]?.value.trim() ? { ...current, [id]: { ...current[id], submitted: true } } : current)
  }
  const correct = (id: string) => Boolean(tasks[id] && answers[id]?.submitted && passes(tasks[id], answers[id].value))
  return <StudyContext.Provider value={{ answers, change, submit, correct, tasks, storageError }}>{children}</StudyContext.Provider>
}
export function useStudy() {
  const state = useContext(StudyContext)
  if (!state) throw new Error('StudyProvider 안에서 활동을 표시해야 합니다.')
  return state
}

export function Question({ id, children }: { id: string; children?: ReactNode }) {
  const { tasks, answers, change, submit, correct } = useStudy()
  const task = tasks[id]
  const answer = answers[id]
  return <fieldset id={`task-${id}`} className="min-w-0 rounded-2xl border border-slate-300 bg-white p-4 sm:p-5">
    <legend className="max-w-full px-2 font-bold leading-7">{task.prompt}</legend>
    {children}
    {task.options ? <div className="grid gap-2">{task.options.map((option) => <button key={option} type="button" aria-pressed={answer?.value === option} onClick={() => change(id, option)} className={`min-h-12 rounded-xl border p-3 text-left leading-6 focus-visible:outline-3 focus-visible:outline-indigo-600 ${answer?.value === option ? 'border-indigo-600 bg-indigo-50 font-bold' : 'border-slate-300 bg-white'}`}>{option}</button>)}</div> : <label className="grid gap-2"><span className="text-sm">답 입력</span><input aria-label={task.prompt} value={answer?.value ?? ''} onChange={(event) => change(id, event.target.value)} placeholder={task.placeholder} className="min-h-12 w-full min-w-0 rounded-xl border border-slate-400 px-3 text-base" /></label>}
    <Button className="mt-3" disabled={!answer?.value.trim()} onClick={() => submit(id)}>답 제출</Button>
    <p className="mt-2 text-sm text-slate-600" aria-live="polite">{!answer?.value ? '답을 선택하거나 입력해 주세요.' : !answer.submitted ? '선택·입력한 답을 제출해 주세요.' : ''}</p>
    {answer?.submitted && <p role="status" className={`mt-3 rounded-xl p-3 leading-7 ${correct(id) ? 'bg-emerald-50 text-emerald-950' : 'bg-rose-50 text-rose-950'}`}><strong>{correct(id) ? '정답입니다. ' : '다시 살펴보세요. '}</strong>{correct(id) ? task.explanation : typeof task.hint === 'function' ? task.hint(answer.value) : task.hint}{!correct(id) && ' 답을 바꾼 뒤 다시 제출할 수 있습니다.'}</p>}
  </fieldset>
}

export interface StudyStepProps { active: boolean; isComplete: boolean; onComplete: () => void }
export interface FinalStudyProps extends StudyStepProps { priorStepsComplete: boolean; onCompletionReadyChange: (ready: boolean) => void }
export function StudyFrame({ step, title, purpose, ids, active, isComplete, onComplete, children, completionAllowed = true, onRevealTask }: StudyStepProps & { step: number; title: string; purpose: string; ids: string[]; children: ReactNode; completionAllowed?: boolean; onRevealTask?: (id: string) => void }) {
  const { correct, tasks, storageError } = useStudy()
  const remaining = ids.filter((id) => !correct(id))
  const titleId = active ? 'lesson-step-title' : `study-step-${step}`
  return <section hidden={!active} aria-labelledby={titleId} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-7">
    <div className="mb-6 border-b border-slate-200 pb-5">
      <p className="text-sm font-bold text-indigo-700">STEP {step} · {isComplete ? '저장된 완료 기록 있음' : '학습 중'}</p>
      <h2 id={titleId} tabIndex={-1} className="step-focus-target mt-2 text-2xl font-black leading-snug focus:outline-none">{title}</h2>
      <p className="mt-3 leading-7 text-slate-700">{purpose}</p>
      {isComplete && remaining.length > 0 && <p className="mt-3 rounded-lg bg-indigo-50 p-3 text-sm leading-6">기존 완료 기록은 유지됩니다. 아래 남은 문항은 현재 개편 활동의 답안 기준이며, 과거 기록으로 자동 정답 처리하지 않습니다.</p>}
      {storageError && <p role="alert" className="mt-3 text-rose-800">현재 답안을 저장하지 못했습니다. 새로고침 전에 브라우저 저장 공간을 확인해 주세요.</p>}
    </div>
    <div className="grid min-w-0 gap-6">{children}</div>
    <div className="mt-7 border-t border-slate-200 pt-5">
      <p className="mb-3 font-bold" aria-live="polite">현재 활동 {ids.length - remaining.length}/{ids.length} 정답 제출</p>
      {remaining.length > 0 && <details className="mb-3"><summary className="min-h-11 cursor-pointer py-2">남은 문항으로 이동 ({remaining.length})</summary><ul className="grid gap-2">{remaining.map((id) => <li key={id}><button className="min-h-11 text-left text-sm text-indigo-800 underline" onClick={() => { onRevealTask?.(id); requestAnimationFrame(() => { const target = document.getElementById(`task-${id}`) ?? document.getElementById(`task-${tasks[id].prerequisiteId}`); target?.scrollIntoView({ block: 'center' }); target?.querySelector<HTMLElement>('button, input')?.focus({ preventScroll: true }) }) }}>{tasks[id].prompt}</button></li>)}</ul></details>}
      <Button disabled={remaining.length > 0 || !completionAllowed} onClick={onComplete}>STEP {step} 활동 완료</Button>
      {remaining.length > 0 && <p className="mt-2 text-sm text-slate-600">위 문항을 모두 맞게 제출하면 완료할 수 있습니다. 설명 조작은 답안·완료를 바꾸지 않습니다.</p>}
    </div>
  </section>
}

export function Panels({ items }: { items: readonly { title: string; text: string }[] }) {
  return <div className="grid min-w-0 gap-3 sm:grid-cols-2">{items.map((item) => <div key={item.title} className="min-w-0 rounded-xl border border-indigo-200 bg-indigo-50 p-4"><h3 className="font-bold">{item.title}</h3><p className="mt-2 leading-7">{item.text}</p></div>)}</div>
}
export function ExplainCursor({ index, count, onChange, nextLabel = '다음 설명', previousLabel = '이전 설명', restartLabel = '다시 보기' }: { index: number; count: number; onChange: (index: number) => void; nextLabel?: string; previousLabel?: string; restartLabel?: string }) {
  return <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="설명 이동"><Button variant="secondary" disabled={index === 0} onClick={() => onChange(index - 1)}>{previousLabel}</Button><span>{index + 1}/{count}</span><Button variant="secondary" disabled={index === count - 1} onClick={() => onChange(index + 1)}>{nextLabel}</Button><Button variant="secondary" onClick={() => onChange(0)}>{restartLabel}</Button></div>
}
