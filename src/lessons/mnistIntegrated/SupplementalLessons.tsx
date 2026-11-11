import { useState } from 'react'
import { useProgress } from '../../hooks/useProgress'
import { getLesson } from '../../data/lessons'
import { Button } from '../../components/ui/Button'
import Lesson07 from '../lesson07/Lesson07'
import { Lesson08Content } from '../lesson08/Lesson08'
import { lesson07StepTitles } from '../lesson07/lesson07Data'
import { lesson08StepTitles } from '../lesson08/lesson08Data'

export default function SupplementalLessons() {
  const { progress, markStepComplete } = useProgress()
  const [part, setPart] = useState<'07' | '08'>('07')
  const [step, setStep] = useState({ '07': 1, '08': 1 })
  const [visited, setVisited] = useState({ '07': true, '08': false })
  const [ready, setReady] = useState({ '07': false, '08': false })
  return <div className="space-y-4">
    <div className="flex flex-wrap gap-3">{(['07', '08'] as const).map((id) => <Button key={id} className="min-h-12" variant={part === id ? 'primary' : 'secondary'} onClick={() => { setPart(id); setVisited((value) => ({ ...value, [id]: true })) }}>기존 {id}차시 보충</Button>)}</div>
    <nav className="grid gap-2 sm:grid-cols-2" aria-label="보충 STEP 이동">{(part === '07' ? lesson07StepTitles : lesson08StepTitles).map((title, i) => <Button key={title} className="min-h-12 justify-start" variant={step[part] === i + 1 ? 'primary' : 'secondary'} onClick={() => setStep((value) => ({ ...value, [part]: i + 1 }))}>{i + 1}. {title}</Button>)}</nav>
    {(['07', '08'] as const).map((id) => { const Content = id === '07' ? Lesson07 : Lesson08Content; return visited[id] && <div key={id} hidden={part !== id}><Content lesson={getLesson(id)!} currentStep={step[id]} progress={progress[id]} onStepComplete={(n) => markStepComplete(id, n)} onLessonCompletionReadyChange={(value) => setReady((current) => current[id] === value ? current : { ...current, [id]: value })} /></div> })}
    {step[part] === 7 && <Button className="min-h-12" disabled={!ready[part] || ![1, 2, 3, 4, 5, 6].every((n) => progress[part].completedSteps.includes(n)) || progress[part].completed} onClick={() => markStepComplete(part, 7)}>기존 {part}차시 보충 활동 완료</Button>}
  </div>
}
