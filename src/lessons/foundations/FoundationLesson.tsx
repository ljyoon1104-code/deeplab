import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { LessonContentProps } from '../lessonRegistry'
import { Button } from '../../components/ui/Button'
import { pinnedHeaderOffset } from '../../lib/viewportLayout'
import { ConceptView } from './ConceptViews'
import { curriculum, type FoundationId } from './curriculum'
import { NetworkLab, networkTasks } from './NetworkLab'
import { GroupedActivity } from './GroupedActivity'
import { Basics01_02 } from './Basics01_02'
import { Basics03_04 } from './Basics03_04'
import { Basics05_06 } from './Basics05_06'
import { correct, Question, type Answers, type Response } from './TeachingUI'

// 1~6차시 답안은 기존 설계처럼 차시 안의 임시 상태입니다.
// 진행도·완료 버전·저장 키를 변경하거나 과거 기록으로 새 답을 채우지 않습니다.
export default function FoundationLesson({lesson,currentStep,progress,onStepComplete,onLessonCompletionReadyChange,onStepChange,onFoundationNavigationChange}:LessonContentProps) {
 const id=lesson.id as FoundationId, pages=curriculum[id]
 const [answers,setAnswers]=useState<Answers>({})
 const [requestedTask,setRequestedTask]=useState<{id:string;nonce:number;step:number}|null>(null)
 const [navigationNotice,setNavigationNotice]=useState<{step:number;text:string}|null>(null)
 const requestSequence=useRef(0)
 useEffect(()=>{setRequestedTask(null)},[currentStep,lesson.id])
 const change=useCallback((taskId:string,response:Response)=>{
  setAnswers(old=>({...old,[taskId]:response}))
  setNavigationNotice(null)
 },[])
 const currentReady=pages[6].tasks.every(t=>correct(t,answers[t.id]))
 const priorReady=[1,2,3,4,5,6].every(s=>progress.completedSteps.includes(s))
 useEffect(()=>{onLessonCompletionReadyChange(currentReady&&priorReady)},[currentReady,priorReady,onLessonCompletionReadyChange])
 const currentPage=pages[currentStep-1]
 const currentRemaining=useMemo(()=>currentPage.tasks.filter(t=>!correct(t,answers[t.id])),[currentPage,answers])
 const requestActivity=useCallback((taskId:string)=>{
  const task=currentPage.tasks.find(t=>t.id===taskId)
  if(!task)return
  setNavigationNotice({step:currentStep,text:`STEP ${currentStep} · ${currentPage.title}: “${task.prompt}”부터 이어서 답을 제출해 주세요.`})
  requestSequence.current+=1
  setRequestedTask({id:task.id,nonce:requestSequence.current,step:currentStep})
 },[currentPage,currentStep])
 useEffect(()=>{
  if(!requestedTask||requestedTask.step!==currentStep)return
  if(currentPage.lab&&networkTasks(currentPage.lab.kind,currentPage.lab.mode).some(task=>task.id===requestedTask.id))return
  const task=document.getElementById(`task-${requestedTask.id}`)
  if(!task)return
  task.tabIndex=-1
  task.style.scrollMarginTop=`${pinnedHeaderOffset()+16}px`
  task.focus({preventScroll:true})
  task.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})
 },[requestedTask,currentStep,currentPage])
 const advance=useCallback(()=>{
  if(currentStep>=7)return
  // 이동은 항상 허용하고, 완료 기록만 기존 정답 제출 조건으로 제한합니다.
  // 제출 문항이 없는 개념 연결 STEP도 실제 방문 후 다음으로 이동할 때만 기록합니다.
  if(currentRemaining.length===0&&!progress.completedSteps.includes(currentStep))onStepComplete(currentStep)
  onStepChange?.(currentStep+1)
 },[currentStep,currentRemaining,progress.completedSteps,onStepComplete,onStepChange])
 useEffect(()=>{
  onFoundationNavigationChange?.({lessonId:lesson.id,step:currentStep,advance})
 },[lesson.id,currentStep,advance,onFoundationNavigationChange])
 return <>{pages.map((page,i)=>{
  const remaining=page.tasks.filter(t=>!correct(t,answers[t.id]))
  const active=currentStep===i+1, already=progress.completedSteps.includes(i+1)
  const labRequest=active&&page.lab&&requestedTask?.step===i+1&&networkTasks(page.lab.kind,page.lab.mode).some(task=>task.id===requestedTask.id)?requestedTask:undefined
  return <section key={`${id}-${i}`} hidden={!active} aria-label={page.title} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-7">
   <p className="text-sm font-bold text-indigo-700">STEP {i+1} · {already?'저장된 완료 기록 있음':page.tasks.length?'필수 학습':'개념 연결 · 제출 없음'}</p>
   <h2 id={active?'lesson-step-title':undefined} tabIndex={-1} className="step-focus-target my-3 text-2xl font-black">{page.title}</h2>
   <p className="mb-5 leading-7">{page.purpose}</p>
   {already&&!progress.completed&&remaining.length>0&&<p className="mb-4 rounded-lg bg-indigo-50 p-3 leading-7">완료 기록은 유지됩니다. 아래 표시는 현재 복습 답안이며, 완료 기록으로 답안을 자동 정답 처리하지 않습니다.</p>}
   {active&&navigationNotice?.step===i+1&&<p role="status" className="mb-4 rounded-lg bg-indigo-50 p-3 leading-7">{navigationNotice.text}</p>}
   <div className="grid min-w-0 gap-5">{page.text.map(p=><p key={p} className="leading-7">{p}</p>)}
   {page.experience
    ? id==='01'||id==='02'?<Basics01_02 page={page} answers={answers} change={change}/>
     :id==='03'||id==='04'?<Basics03_04 page={page} answers={answers} change={change}/>
     :<Basics05_06 page={page} answers={answers} change={change}/>
    :<ConceptView page={page}/>}
   {page.lab?<NetworkLab {...page.lab} answers={answers} change={change} requestedTask={labRequest}/>:page.group?<GroupedActivity mode={page.group} tasks={page.tasks} answers={answers} change={change}/>:!page.experience&&page.tasks.map(task=><Question key={task.id} task={task} response={answers[task.id]} onChange={r=>change(task.id,r)}/>)}
   {page.optionalActivity&&<details className="rounded-xl border border-slate-200 p-4">
    <summary className="min-h-12 cursor-pointer py-3 font-bold">{page.optionalActivity.title}</summary>
    <p className="my-3 leading-7">관심이 있으면 다른 문제에도 적용해 보세요. 이 선택 탐구는 STEP·차시 완료에 필요하지 않습니다.</p>
    {page.optionalActivity.text.map(text=><p key={text} className="mb-3 leading-7">{text}</p>)}
    <Basics01_02 page={page.optionalActivity} answers={answers} change={change}/>
   </details>}</div>
   <div className="mt-6 border-t pt-5"><p aria-live="polite" className="font-bold">{!page.tasks.length?'개념 연결 · 제출 문항 없음':page.group||page.submissions?`필수 답안 ${page.tasks.length-remaining.length}/${page.tasks.length} 정답 제출 · 제출 활동 ${page.submissions??1}개`:`필수 활동 ${page.tasks.length-remaining.length}/${page.tasks.length} 정답 제출`}</p>
   {remaining.length>0&&<details className="my-3"><summary className="min-h-11 cursor-pointer py-2">남은 할 일 {remaining.length}개 · 눌러서 이어 하기</summary><ul className="space-y-2">{remaining.map(t=><li key={t.id}><Button variant="secondary" className="max-w-full justify-start text-left" onClick={()=>requestActivity(t.id)}>{t.prompt}</Button></li>)}</ul></details>}
   <p className="mt-2 text-sm leading-6 text-slate-600">{i===6&&!priorReady?'차시 완료에는 앞의 STEP 1~6 완료도 필요합니다. ':''}{already?'완료 기록을 유지하며 STEP을 자유롭게 오갈 수 있습니다.':i===6?'필수 활동을 마치면 아래 차시 완료 버튼이 활성화됩니다.':page.tasks.length?'다음 STEP은 언제든 이동할 수 있습니다. 모든 답안을 정답 제출한 뒤 다음으로 이동하면 이 STEP의 완료가 기록됩니다.':'다층 구조가 필요한 이유를 살펴본 뒤 아래 버튼으로 다음 STEP에 이어 가세요.'}{page.tasks.length>0&&' 답안을 고치면 다시 제출해 주세요. 임시 답안은 새로고침 시 초기화되며 완료 기록은 유지됩니다.'}</p></div>
  </section>
 })}</>
}
