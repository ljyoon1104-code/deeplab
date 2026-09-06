import { ArrowDown, ArrowRight, CheckCircle2, Circle, Info, RotateCcw, Sparkles, XCircle } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import ContextMeaningActivity from './ContextMeaningActivity'
import EmbeddingVisualizer from './EmbeddingVisualizer'
import FrequencyComparison from './FrequencyComparison'
import {
  CONTEXT_SENTENCES,
  INDEX_ACTIVITY_WORDS,
  LESSON11_QUIZ,
  NLP_ACTIVITY_CARDS,
  WORDS,
  lesson11StepTitles,
  type NlpActivityType,
} from './lesson11Data'
import { useLesson11 } from './Lesson11Context'
import OneHotVisualizer from './OneHotVisualizer'
import TokenIndexActivity from './TokenIndexActivity'
import { createWordIndex } from './textRepresentation'

interface CommonStepProps { active: boolean; isComplete: boolean; onComplete: () => void }
interface StepFrameProps extends CommonStepProps { step: number; intro: string; children: ReactNode }

function StepFrame({ step, intro, active, isComplete, children }: StepFrameProps) {
  const titleId = active ? 'lesson-step-title' : `lesson11-step-${step}-title`
  return <Card as="section" hidden={!active} aria-labelledby={titleId} className="overflow-hidden"><div className="border-b border-slate-200 bg-gradient-to-r from-cyan-50 via-white to-amber-50 px-5 py-6 sm:px-8 sm:py-8"><div className="flex flex-wrap items-center justify-between gap-3"><span className="text-sm font-black tracking-[0.15em] text-cyan-800">STEP {step}</span><span className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm font-bold ${isComplete ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>{isComplete ? <CheckCircle2 size={17} aria-hidden="true" /> : <Circle size={14} aria-hidden="true" />}{isComplete ? '활동 완료' : '활동 필요'}</span></div><h2 id={titleId} tabIndex={active ? -1 : undefined} className="step-focus-target mt-4 text-2xl font-black leading-snug tracking-tight text-slate-950 focus:outline-none sm:text-3xl">{lesson11StepTitles[step - 1]}</h2><p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{intro}</p></div><div className="px-5 py-7 sm:px-8 sm:py-9">{children}</div></Card>
}

function Feedback({ correct, children }: { correct: boolean; children: ReactNode }) {
  return <div className={`mt-4 flex items-start gap-3 rounded-2xl border p-4 ${correct ? 'border-emerald-200 bg-emerald-50 text-emerald-950' : 'border-rose-200 bg-rose-50 text-rose-950'}`} role="status" aria-live="polite">{correct ? <CheckCircle2 className="mt-0.5 shrink-0" size={20} aria-hidden="true" /> : <XCircle className="mt-0.5 shrink-0" size={20} aria-hidden="true" />}<div className="min-w-0 text-sm leading-6">{children}</div></div>
}

function Notice({ children }: { children: ReactNode }) {
  return <div className="mt-4 flex items-start gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-cyan-950" role="note"><Info className="mt-0.5 shrink-0" size={20} aria-hidden="true" /><div className="text-sm leading-6">{children}</div></div>
}

function Completion({ children }: { children: ReactNode }) {
  return <div className="mt-7 flex items-start gap-3 border-t border-emerald-200 pt-5 text-emerald-900" role="status"><CheckCircle2 className="mt-0.5 shrink-0" size={21} aria-hidden="true" /><p className="font-semibold leading-7">{children}</p></div>
}

function ChoiceButtons({ options, value, disabled = false, showId = false, onChoose }: { options: Array<{ id: string; text: string }>; value: string; disabled?: boolean; showId?: boolean; onChoose: (id: string) => void }) {
  return <div className="mt-3 grid gap-2">{options.map((option) => <button key={option.id} type="button" disabled={disabled} aria-pressed={value === option.id} onClick={() => onChoose(option.id)} className={`min-h-12 rounded-xl border p-3 text-left font-bold disabled:cursor-not-allowed ${value === option.id ? 'border-violet-600 bg-violet-50 text-violet-950' : 'border-slate-300 bg-white text-slate-700'}`}>{showId ? `${option.id}. ` : ''}{option.text}</button>)}</div>
}

export function Lesson11Step1(props: CommonStepProps) {
  const { activity, update } = useLesson11()
  const ready = activity.step1Correct && activity.speechNlpConfirmed
  const select = (answer: string) => update((current) => ({ ...current, step1Answer: answer, step1Submitted: false, step1Correct: false }))
  const submit = () => update((current) => ({ ...current, step1Submitted: true, step1Correct: current.step1Answer === 'B' }))
  const retry = () => update((current) => ({ ...current, step1Answer: '', step1Submitted: false, step1Correct: false }))
  return <StepFrame {...props} step={1} intro="Lesson 10에서 말소리가 텍스트가 되는 과정을 배웠습니다. 이제 그 텍스트의 뜻을 처리하는 단계로 이어갑니다.">
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><h3 className="font-black">이 차시의 학습 목표</h3><ul className="mt-3 grid gap-2 text-sm leading-6 sm:grid-cols-2"><li>• 자연어와 자연어 처리의 의미를 설명합니다.</li><li>• 언어 이해와 언어 생성을 구분합니다.</li><li>• 텍스트에 숫자 표현이 필요한 이유를 이해합니다.</li><li>• 단어 인덱스와 원-핫 벡터를 직접 만듭니다.</li><li>• 원-핫의 특징과 한계를 설명합니다.</li><li>• 워드 임베딩의 기본 표현을 이해합니다.</li><li>• 단어 빈도수의 장점과 한계를 구분합니다.</li><li>• 주변 단어와 문맥으로 다의어 의미를 판단합니다.</li></ul></div>
    <div className="mt-6 grid gap-2 text-center font-black sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center"><span className="rounded-xl bg-slate-950 p-4 text-white">사람<br />“근처 맛집 추천해 줘.”</span><ArrowDown className="mx-auto sm:hidden" aria-hidden="true" /><ArrowRight className="mx-auto hidden sm:block" aria-hidden="true" /><span className="rounded-xl bg-cyan-100 p-4">음성 인식<br /><small>말소리 → 텍스트</small></span><ArrowDown className="mx-auto sm:hidden" aria-hidden="true" /><ArrowRight className="mx-auto hidden sm:block" aria-hidden="true" /><span className="rounded-xl bg-white p-4 ring-1 ring-slate-200">텍스트<br />“근처 맛집 추천해 줘.”</span></div>
    <fieldset className="mt-7 rounded-2xl border border-slate-200 p-5"><legend className="px-2 font-black">문장을 글자로 바꿨다고 해서 AI가 그 뜻까지 모두 이해한 걸까요?</legend><ChoiceButtons showId options={[{ id: 'A', text: '그렇다. 글자로 바꾸면 의미도 자동으로 모두 이해한다.' }, { id: 'B', text: '아니다. 단어와 문장의 의미를 처리하는 과정이 더 필요하다.' }]} value={activity.step1Answer} disabled={activity.step1Submitted} onChoose={select} />{!activity.step1Submitted ? <Button className="mt-4" disabled={!activity.step1Answer} onClick={submit}>개념 문제 제출</Button> : null}</fieldset>
    {activity.step1Submitted ? <Feedback correct={activity.step1Correct}><strong>{activity.step1Correct ? '정답입니다.' : '오답입니다.'}</strong> 음성 인식은 말소리를 텍스트로 바꾸는 기술이고, 텍스트의 의미와 문맥을 처리하는 것은 자연어 처리와 관련됩니다.{!activity.step1Correct ? <Button className="mt-3" variant="secondary" onClick={retry}><RotateCcw size={17} /> 다시 선택</Button> : null}</Feedback> : null}
    {activity.step1Correct ? <label className="mt-4 flex items-start gap-3 rounded-xl bg-cyan-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.speechNlpConfirmed} onChange={(event) => update((current) => ({ ...current, speechNlpConfirmed: event.target.checked }))} /><span>음성 인식의 우선 결과는 텍스트이며, 그 뜻과 문맥은 자연어 처리 단계에서 다룬다는 차이를 확인했습니다.</span></label> : null}
    <Button className="mt-5" disabled={!ready} onClick={props.onComplete}>STEP 1 활동 완료</Button>{props.isComplete ? <Completion>말소리→텍스트와 텍스트→의미 처리의 차이를 확인했습니다.</Completion> : null}
  </StepFrame>
}

export function Lesson11Step2(props: CommonStepProps) {
  const { activity, update, assignNlpActivity } = useLesson11()
  const [selectedId, setSelectedId] = useState<string>(NLP_ACTIVITY_CARDS[0].id)
  const selected = NLP_ACTIVITY_CARDS.find((item) => item.id === selectedId) ?? NLP_ACTIVITY_CARDS[0]
  const answer = activity.nlpAssignments[selected.id]
  const allCorrect = NLP_ACTIVITY_CARDS.every((item) => activity.nlpAssignments[item.id] === item.answer)
  const ready = allCorrect && activity.combinedUseConfirmed
  return <StepFrame {...props} step={2} intro="자연어 처리가 사람의 언어를 이해하고 처리하며 언어를 생성하는 두 관점을 비교합니다.">
    <div className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5"><h3 className="font-black">자연어</h3><p className="mt-2">사람들이 일상에서 사용하는 언어</p></div><div className="rounded-2xl border border-violet-200 bg-violet-50 p-5"><h3 className="font-black">자연어 처리</h3><p className="mt-2 leading-7">컴퓨터가 사람의 언어를 이해하고 처리하며, 필요한 경우 자연스러운 언어를 생성하도록 하는 기술</p></div></div>
    <div className="mt-5 grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-blue-200 p-5"><h3 className="font-black text-blue-900">언어 이해에 더 가까운 활동</h3><p className="mt-2 text-sm leading-6">감정 분석 · 텍스트 분류 · 문장 의미 파악 · 질문 의도 파악</p></div><div className="rounded-2xl border border-amber-200 p-5"><h3 className="font-black text-amber-900">언어 생성에 더 가까운 활동</h3><p className="mt-2 text-sm leading-6">자동 완성 · 문장 생성 · 요약문 생성 · 답변 생성</p></div></div>
    <div className="mt-7 grid gap-4 lg:grid-cols-2"><div><h3 className="font-black">① 사례 선택</h3><div className="mt-3 grid gap-2">{NLP_ACTIVITY_CARDS.map((item, index) => { const assigned = activity.nlpAssignments[item.id]; const correct = assigned === item.answer; return <button key={item.id} type="button" aria-pressed={selected.id === item.id} onClick={() => setSelectedId(item.id)} className={`min-h-14 rounded-xl border p-3 text-left ${selected.id === item.id ? 'border-violet-600 bg-violet-50' : 'border-slate-300 bg-white'}`}><strong>사례 {index + 1}</strong><span className="mt-1 block text-sm">{item.text}</span>{assigned ? <span className={`mt-1 block text-xs font-bold ${correct ? 'text-emerald-700' : 'text-rose-700'}`}>{correct ? '✓ 정확히 분류함' : '✕ 다시 분류 필요'}</span> : null}</button> })}</div></div><div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><h3 className="font-black">② 선택한 사례 분류</h3><p className="mt-3 rounded-xl bg-white p-4 font-bold">{selected.text}</p><div className="mt-4 grid gap-2 sm:grid-cols-2" role="group" aria-label="자연어 처리 활동 분류">{([{ id: 'understanding', text: '언어 이해에 더 가까움' }, { id: 'generation', text: '언어 생성에 더 가까움' }] as Array<{ id: NlpActivityType; text: string }>).map((item) => <button key={item.id} type="button" aria-pressed={answer === item.id} onClick={() => assignNlpActivity(selected.id, item.id)} className={`min-h-12 rounded-xl border p-3 font-bold ${answer === item.id ? 'border-violet-600 bg-violet-50' : 'border-slate-300 bg-white'}`}>{item.text}</button>)}</div>{answer ? answer === selected.answer ? <Feedback correct>맞았습니다. 이 사례는 {selected.answer === 'understanding' ? '입력된 언어의 감정·주제·의도·의미를 파악' : '새 문장이나 답변을 생성'}하는 활동에 더 가깝습니다.</Feedback> : <Feedback correct={false}>결과가 판단·파악인지, 새로운 문장을 만드는 것인지 다시 살펴보세요.</Feedback> : null}</div></div>
    {allCorrect ? <label className="mt-5 flex items-start gap-3 rounded-xl bg-cyan-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.combinedUseConfirmed} onChange={(event) => update((current) => ({ ...current, combinedUseConfirmed: event.target.checked }))} /><span>언어 이해와 언어 생성은 학습을 위한 큰 구분이며, 실제 자연어 처리 서비스에서는 두 활동이 함께 사용되거나 경계가 명확하지 않을 수 있음을 확인했습니다.</span></label> : null}
    <Button className="mt-5" disabled={!ready} onClick={props.onComplete}>STEP 2 활동 완료</Button>{props.isComplete ? <Completion>언어 이해와 생성에 가까운 사례를 모두 구분했습니다.</Completion> : null}
  </StepFrame>
}

export function Lesson11Step3(props: CommonStepProps) {
  const { activity, update } = useLesson11()
  const [selectedWord, setSelectedWord] = useState<string>(INDEX_ACTIVITY_WORDS[0])
  const indexMap = createWordIndex(WORDS)
  const allCorrect = INDEX_ACTIVITY_WORDS.every((word) => activity.indexAssignments[word] === String(indexMap.get(word)))
  const ready = allCorrect && activity.indexImportanceConfirmed
  return <StepFrame {...props} step={3} intro="신경망이 계산할 수 있도록 문장을 단어로 나누고 각 단어에 구별 번호를 연결합니다.">
    <Notice><strong>신경망은 글자 모양을 그대로 계산하지 않습니다.</strong> 텍스트를 처리하려면 단어나 토큰을 숫자 형태로 표현해야 합니다.</Notice>
    <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white"><p className="text-sm font-bold text-cyan-300">예문</p><p className="mt-2 text-xl font-black">좋은 친구는 별처럼 삶을 빛나게 해</p><div className="mt-4 flex flex-wrap gap-2">{WORDS.map((word) => <span key={word} className="rounded-lg bg-white/10 px-3 py-2 font-bold">{word}</span>)}</div><p className="mt-3 text-xs leading-5 text-slate-300">이번 활동은 학습을 위해 띄어쓰기 기준으로 단순하게 구분합니다. 실제 자연어 처리에서는 언어와 목적에 따라 더 복잡한 방법을 사용할 수 있습니다.</p></div>
    <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">{WORDS.map((word, index) => <div key={word} className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-center"><strong className="block">{word}</strong><span className="text-sm">인덱스 {index}</span></div>)}</div>
    <div className="mt-7"><TokenIndexActivity assignments={activity.indexAssignments} selectedWord={selectedWord} onSelectWord={setSelectedWord} onAssign={(word, index) => update((current) => ({ ...current, indexAssignments: { ...current.indexAssignments, [word]: String(index) } }))} /></div>
    <Notice><strong>인덱스는 단어를 구별하기 위해 붙인 번호</strong>입니다. ‘해’의 인덱스가 5라고 해서 ‘좋은’의 인덱스 0보다 더 중요하거나 의미가 5배 크다는 뜻은 아닙니다.</Notice>
    {allCorrect ? <label className="mt-4 flex items-start gap-3 rounded-xl bg-violet-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.indexImportanceConfirmed} onChange={(event) => update((current) => ({ ...current, indexImportanceConfirmed: event.target.checked }))} /><span>인덱스의 크기는 단어의 중요도나 의미의 크기를 나타내지 않는다는 설명을 확인했습니다.</span></label> : null}
    <Button className="mt-5" disabled={!ready} onClick={props.onComplete}>STEP 3 활동 완료</Button>{props.isComplete ? <Completion>세 단어에 고정 인덱스를 연결하고 번호의 의미를 확인했습니다.</Completion> : null}
  </StepFrame>
}

export function Lesson11Step4(props: CommonStepProps) {
  const { activity, update } = useLesson11()
  const enoughViewed = activity.oneHotWordsViewed.length >= 4
  const ready = enoughViewed && activity.oneHotLengthCorrect && activity.oneHotLimitsConfirmed
  const selectWord = (word: string) => update((current) => ({ ...current, selectedOneHotWord: word, oneHotWordsViewed: [...new Set([...current.oneHotWordsViewed, word])] }))
  const submitLength = () => update((current) => ({ ...current, oneHotLengthSubmitted: true, oneHotLengthCorrect: current.oneHotLengthAnswer.replaceAll(',', '').trim() === '10000' }))
  return <StepFrame {...props} step={4} intro="단어의 인덱스 위치 하나만 1로 바꾸어 길이 6의 원-핫 벡터를 직접 관찰합니다.">
    <Notice>Lesson 07에서 숫자 레이블을 길이 10의 원-핫 배열로 바꾼 것처럼, 여기서는 단어 6개를 같은 원리로 표현합니다.</Notice>
    <div className="mt-6"><h3 className="font-black">단어를 최소 4개 선택하세요.</h3><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">{WORDS.map((word) => <button key={word} type="button" aria-pressed={activity.selectedOneHotWord === word} onClick={() => selectWord(word)} className={`min-h-12 rounded-xl border p-2 font-bold ${activity.selectedOneHotWord === word ? 'border-violet-600 bg-violet-50' : 'border-slate-300 bg-white'}`}>{word}{activity.oneHotWordsViewed.includes(word) ? <span className="block text-xs text-emerald-700">✓ 확인함</span> : null}</button>)}</div><p className="mt-3 text-sm font-bold" aria-live="polite">서로 다른 단어 {activity.oneHotWordsViewed.length} / 4개 이상 확인</p></div>
    <div className="mt-5"><OneHotVisualizer selectedWord={activity.selectedOneHotWord} /></div>
    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5"><h3 className="font-black">원-핫 벡터 생성 원리</h3><p className="mt-2 text-sm leading-6">벡터 길이 = 전체 단어 수 · 선택한 단어의 인덱스 위치 = 1 · 나머지 위치 = 0</p></div>
    <fieldset className="mt-6 rounded-2xl border border-slate-200 p-5"><legend className="px-2 font-black">단어가 10,000개라면 각 단어의 원-핫 벡터 길이는 얼마일까요?</legend><input type="text" inputMode="numeric" value={activity.oneHotLengthAnswer} onChange={(event) => update((current) => ({ ...current, oneHotLengthAnswer: event.target.value, oneHotLengthSubmitted: false, oneHotLengthCorrect: false }))} className="mt-3 min-h-12 w-full rounded-xl border border-slate-300 px-4 font-mono text-lg sm:max-w-xs" aria-label="원-핫 벡터 길이 답" /><Button className="mt-3 sm:ml-2" disabled={!activity.oneHotLengthAnswer} onClick={submitLength}>길이 제출</Button></fieldset>
    {activity.oneHotLengthSubmitted ? <Feedback correct={activity.oneHotLengthCorrect}>{activity.oneHotLengthCorrect ? <><strong>정답입니다.</strong> 단어가 10,000개면 벡터 길이도 10,000입니다.</> : <><strong>오답입니다.</strong> 원-핫 벡터 길이는 전체 단어 수와 같습니다. 값을 고쳐 다시 제출하세요.</>}</Feedback> : null}
    {enoughViewed && activity.oneHotLengthCorrect ? <label className="mt-5 flex items-start gap-3 rounded-xl bg-amber-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.oneHotLimitsConfirmed} onChange={(event) => update((current) => ({ ...current, oneHotLimitsConfirmed: event.target.checked }))} /><span>원-핫은 한 위치만 1이고 나머지는 0입니다. 단어가 많아지면 벡터가 매우 길고 대부분 0인 <small>희소 표현(Sparse Representation)</small>이 되며, 단어 사이 의미 관계를 직접 표현하기 어렵다는 특징과 한계를 확인했습니다.</span></label> : null}
    <Button className="mt-5" disabled={!ready} onClick={props.onComplete}>STEP 4 활동 완료</Button>{props.isComplete ? <Completion>네 단어 이상의 원-핫 벡터, 길이 계산과 표현의 한계를 확인했습니다.</Completion> : null}
  </StepFrame>
}

export function Lesson11Step5(props: CommonStepProps) {
  const { activity, update } = useLesson11()
  const ready = activity.embeddingViewed && activity.embeddingPairCorrect && activity.embeddingCorrect && activity.embeddingComparisonConfirmed
  const choosePair = (pair: string) => update((current) => ({ ...current, embeddingPair: pair, embeddingPairCorrect: pair === 'friend-friendship' }))
  const selectAnswer = (answer: string) => update((current) => ({ ...current, embeddingAnswer: answer, embeddingSubmitted: false, embeddingCorrect: false }))
  const submitAnswer = () => update((current) => ({ ...current, embeddingSubmitted: true, embeddingCorrect: current.embeddingAnswer === 'A' }))
  const retryAnswer = () => update((current) => ({ ...current, embeddingAnswer: '', embeddingSubmitted: false, embeddingCorrect: false }))
  return <StepFrame {...props} step={5} intro="원-핫보다 작은 여러 실숫값으로 단어를 표현하고, 학습된 의미 관계를 공간으로 살펴봅니다.">
    <Notice><strong>워드 임베딩</strong>은 단어를 여러 실숫값으로 이루어진 벡터로 표현하는 방법입니다.</Notice>
    <div className="mt-6 grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="text-sm font-black text-slate-600">원-핫</p><p className="mt-3 font-mono font-bold">좋은 → [1, 0, 0, 0, 0, 0]</p></div><div className="rounded-2xl border border-violet-200 bg-violet-50 p-5"><p className="text-sm font-black text-violet-800">임베딩 형태 예시</p><p className="mt-3 font-mono font-bold">좋은 → [0.2, 0.4]<br />친구는 → [0.1, 0.5]</p><p className="mt-2 text-xs leading-5">실제 사전 학습 모델의 결과가 아니라 임베딩 형태를 설명하기 위한 교육용 고정 예시입니다.</p></div></div>
    <div className="mt-6"><EmbeddingVisualizer confirmed={activity.embeddingViewed} onConfirm={() => update((current) => ({ ...current, embeddingViewed: true }))} /></div>
    <fieldset className="mt-6 rounded-2xl border border-slate-200 p-5"><legend className="px-2 font-black">의미가 비슷해 가까이 배치된 단어 쌍은?</legend><ChoiceButtons options={[{ id: 'friend-friendship', text: '친구와 우정' }, { id: 'friend-fridge', text: '친구와 냉장고' }, { id: 'person-fridge', text: '사람과 냉장고' }]} value={activity.embeddingPair} onChoose={choosePair} /></fieldset>
    {activity.embeddingPair ? <Feedback correct={activity.embeddingPairCorrect}>{activity.embeddingPairCorrect ? <><strong>맞았습니다.</strong> 교육용 공간에서 의미가 관련된 ‘친구’와 ‘우정’을 가까이 배치했습니다.</> : <><strong>다시 살펴보세요.</strong> 점 사이의 거리와 단어의 관련성을 함께 확인하세요.</>}</Feedback> : null}
    <fieldset className="mt-6 rounded-2xl border border-slate-200 p-5"><legend className="px-2 font-black">워드 임베딩의 특징으로 알맞은 것은?</legend><ChoiceButtons showId options={[{ id: 'A', text: '단어를 여러 실숫값으로 표현할 수 있다.' }, { id: 'B', text: '모든 단어를 하나의 숫자로만 표현한다.' }, { id: 'C', text: '단어가 많아지면 반드시 모든 위치가 0이 된다.' }]} value={activity.embeddingAnswer} disabled={activity.embeddingSubmitted} onChoose={selectAnswer} />{!activity.embeddingSubmitted ? <Button className="mt-4" disabled={!activity.embeddingAnswer} onClick={submitAnswer}>개념 문제 제출</Button> : null}</fieldset>
    {activity.embeddingSubmitted ? <Feedback correct={activity.embeddingCorrect}><strong>{activity.embeddingCorrect ? '정답입니다.' : '오답입니다.'}</strong> 워드 임베딩은 단어를 여러 실숫값으로 표현해 관계와 의미를 나타내는 데 활용합니다. 각 숫자를 사람이 직접 읽어 뜻을 알아내는 방식은 아니며, 언제나 의미를 완벽하게 표현하지도 않습니다.{!activity.embeddingCorrect ? <Button className="mt-3" variant="secondary" onClick={retryAnswer}><RotateCcw size={17} /> 다시 풀기</Button> : null}</Feedback> : null}
    <div className="mt-6 grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5"><h3 className="font-black">원-핫 인코딩</h3><ul className="mt-3 grid gap-2 text-sm leading-6"><li>• 한 위치만 1, 나머지는 0</li><li>• 단어가 많으면 벡터가 길어짐</li><li>• 의미 관계를 직접 표현하기 어려움</li></ul></div><div className="rounded-2xl border border-violet-200 bg-violet-50 p-5"><h3 className="font-black">워드 임베딩</h3><ul className="mt-3 grid gap-2 text-sm leading-6"><li>• 여러 실숫값으로 구성</li><li>• 더 작은 차원으로 표현할 수 있음</li><li>• 학습을 통해 관계와 의미 표현에 활용</li></ul></div></div>
    {activity.embeddingViewed && activity.embeddingPairCorrect && activity.embeddingCorrect ? <label className="mt-5 flex items-start gap-3 rounded-xl bg-cyan-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.embeddingComparisonConfirmed} onChange={(event) => update((current) => ({ ...current, embeddingComparisonConfirmed: event.target.checked }))} /><span>원-핫과 임베딩의 표현 방식, 장점과 한계를 비교했습니다.</span></label> : null}
    <Button className="mt-5" disabled={!ready} onClick={props.onComplete}>STEP 5 활동 완료</Button>{props.isComplete ? <Completion>교육용 의미 공간과 비교 활동으로 워드 임베딩의 기본 개념을 확인했습니다.</Completion> : null}
  </StepFrame>
}

export function Lesson11Step6(props: CommonStepProps) {
  const { activity, update } = useLesson11()
  const topicsCorrect = activity.frequencyTopics.doc1 === 'sports' && activity.frequencyTopics.doc2 === 'food'
  const ready = topicsCorrect && activity.frequencyMeaningCorrect && activity.frequencyConfirmed
  const chooseMeaning = (answer: string) => update((current) => ({ ...current, frequencyMeaningAnswer: answer, frequencyMeaningSubmitted: false, frequencyMeaningCorrect: false }))
  const submitMeaning = () => update((current) => ({ ...current, frequencyMeaningSubmitted: true, frequencyMeaningCorrect: current.frequencyMeaningAnswer === 'no' }))
  const retryMeaning = () => update((current) => ({ ...current, frequencyMeaningAnswer: '', frequencyMeaningSubmitted: false, frequencyMeaningCorrect: false }))
  return <StepFrame {...props} step={6} intro="단어가 나온 횟수로 문서 주제를 찾고, 단어 순서와 부정 표현을 놓칠 수 있는 한계도 확인합니다.">
    <Notice>단어가 얼마나 자주 등장하는지 확인하면 문서의 주제나 특징을 어느 정도 파악할 수 있습니다.</Notice>
    <div className="mt-6"><FrequencyComparison topics={activity.frequencyTopics} onChoose={(id, topic) => update((current) => ({ ...current, frequencyTopics: { ...current.frequencyTopics, [id]: topic } }))} /></div>
    <div className="mt-7 grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-sm font-black text-emerald-900">문장 A</p><p className="mt-2 font-bold">영화가 재미있고 배우도 좋았다.</p></div><div className="rounded-2xl border border-rose-200 bg-rose-50 p-5"><p className="text-sm font-black text-rose-900">문장 B</p><p className="mt-2 font-bold">영화가 재미없고 배우도 좋지 않았다.</p></div></div>
    <fieldset className="mt-6 rounded-2xl border border-slate-200 p-5"><legend className="px-2 font-black">비슷한 단어가 비슷한 횟수로 등장하면 두 문장의 의미도 반드시 같을까요?</legend><ChoiceButtons options={[{ id: 'yes', text: '그렇다' }, { id: 'no', text: '아니다' }]} value={activity.frequencyMeaningAnswer} disabled={activity.frequencyMeaningSubmitted} onChoose={chooseMeaning} />{!activity.frequencyMeaningSubmitted ? <Button className="mt-4" disabled={!activity.frequencyMeaningAnswer} onClick={submitMeaning}>문장 의미 비교 제출</Button> : null}</fieldset>
    {activity.frequencyMeaningSubmitted ? <Feedback correct={activity.frequencyMeaningCorrect}><strong>{activity.frequencyMeaningCorrect ? '정답입니다.' : '오답입니다.'}</strong> 두 문장은 ‘영화’, ‘배우’ 같은 단어를 포함하지만 ‘재미없고’, ‘좋지 않았다’라는 부정 표현 때문에 전체 의미와 감정이 다릅니다.{!activity.frequencyMeaningCorrect ? <Button className="mt-3" variant="secondary" onClick={retryMeaning}><RotateCcw size={17} /> 다시 풀기</Button> : null}</Feedback> : null}
    <div className="mt-6 grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5"><h3 className="font-black">장점</h3><ul className="mt-3 grid gap-2 text-sm leading-6"><li>• 단어 출현 정보를 간단하게 계산할 수 있습니다.</li><li>• 문서의 주제와 특징을 어느 정도 파악할 수 있습니다.</li></ul></div><div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><h3 className="font-black">한계</h3><ul className="mt-3 grid gap-2 text-sm leading-6"><li>• 단어 순서를 충분히 반영하기 어렵습니다.</li><li>• 부정 표현과 단어 관계를 놓칠 수 있습니다.</li><li>• 세밀한 문맥을 충분히 나타내기 어렵습니다.</li></ul></div></div>
    {topicsCorrect && activity.frequencyMeaningCorrect ? <label className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.frequencyConfirmed} onChange={(event) => update((current) => ({ ...current, frequencyConfirmed: event.target.checked }))} /><span>빈도수 기반 방법은 간단하고 유용하지만, 단어 순서와 세밀한 문맥을 충분히 반영하기 어렵다는 장점과 한계를 확인했습니다.</span></label> : null}
    <Button className="mt-5" disabled={!ready} onClick={props.onComplete}>STEP 6 활동 완료</Button>{props.isComplete ? <Completion>빈도표로 두 문서의 주제를 찾고 문맥 표현의 한계를 확인했습니다.</Completion> : null}
  </StepFrame>
}

interface Step7Props extends CommonStepProps { priorStepsComplete: boolean; onCompletionReadyChange: (ready: boolean) => void }

export function Lesson11Step7({ priorStepsComplete, onCompletionReadyChange, ...props }: Step7Props) {
  const { activity, update } = useLesson11()
  const contextsCorrect = CONTEXT_SENTENCES.every((item) => activity.contextAssignments[item.id] === item.answer)
  const quizzesSubmitted = LESSON11_QUIZ.every((item) => activity.quizSubmitted.includes(item.id))
  const ready = contextsCorrect && activity.contextFlowConfirmed && activity.perspectivesConfirmed && quizzesSubmitted

  useEffect(() => {
    onCompletionReadyChange(priorStepsComplete && props.isComplete)
    return () => onCompletionReadyChange(false)
  }, [onCompletionReadyChange, priorStepsComplete, props.isComplete])

  const chooseQuiz = (id: number, answer: string) => update((current) => ({ ...current, quizAnswers: { ...current.quizAnswers, [id]: answer } }))
  const submitQuiz = (id: number, answer: number) => update((current) => ({ ...current, quizSubmitted: [...new Set([...current.quizSubmitted, id])], quizCorrect: current.quizAnswers[String(id)] === String.fromCharCode(65 + answer) ? [...new Set([...current.quizCorrect, id])] : current.quizCorrect.filter((item) => item !== id) }))
  const retryQuiz = (id: number) => update((current) => ({ ...current, quizSubmitted: current.quizSubmitted.filter((item) => item !== id), quizCorrect: current.quizCorrect.filter((item) => item !== id), quizAnswers: { ...current.quizAnswers, [id]: '' } }))

  return <StepFrame {...props} step={7} intro="같은 단어라도 주변 단어와 상황에 따라 달라지는 뜻을 찾고 Lesson 11의 전체 흐름을 완성합니다.">
    <ContextMeaningActivity assignments={activity.contextAssignments} onChoose={(id, meaning) => update((current) => ({ ...current, contextAssignments: { ...current.contextAssignments, [id]: meaning } }))} />
    <div className="mt-8 rounded-2xl border border-cyan-200 bg-cyan-50 p-5"><h3 className="font-black">언어 이해 Signal Flow</h3><div className="mt-4 flex flex-col items-stretch gap-2 text-center text-sm font-black md:flex-row md:items-center">{['단어 확인', '문장 안의 단어 관계 확인', '문맥에서 단어 의미 확인', '문장 전체의 의미와 의도 파악'].map((item, index, items) => <div key={item} className="contents"><span className="rounded-xl bg-white p-3 md:flex-1">{item}</span>{index < items.length - 1 ? <><ArrowDown className="mx-auto md:hidden" aria-hidden="true" /><ArrowRight className="hidden shrink-0 md:block" aria-hidden="true" /></> : null}</div>)}</div><p className="mt-4 text-xs leading-5">보조 용어: 형태소 분석 · 구문 분석 · 의미 분석 · 담화·의도 분석</p></div>
    {contextsCorrect ? <label className="mt-5 flex items-start gap-3 rounded-xl bg-cyan-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.contextFlowConfirmed} onChange={(event) => update((current) => ({ ...current, contextFlowConfirmed: event.target.checked }))} /><span>주변 단어와 문장 관계를 확인해야 문맥 속 단어 의미와 문장 전체 의도를 파악할 수 있음을 확인했습니다.</span></label> : null}
    <div className="mt-8 grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><h3 className="font-black">빈도수 기반</h3><p className="mt-2 text-sm leading-6">어떤 단어가 얼마나 자주 등장하는가?<br />→ 문서의 특징과 주제를 어느 정도 파악</p></div><div className="rounded-2xl border border-violet-200 bg-violet-50 p-5"><h3 className="font-black">의미 중심</h3><p className="mt-2 text-sm leading-6">단어가 문장에서 어떤 뜻과 역할을 가지는가?<br />→ 의미와 의도 파악</p></div><div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><h3 className="font-black">딥러닝 활용</h3><p className="mt-2 text-sm leading-6">많은 텍스트에서 단어와 문맥 패턴 학습<br />→ 복잡한 언어 관계 처리에 활용</p></div></div>
    <label className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.perspectivesConfirmed} onChange={(event) => update((current) => ({ ...current, perspectivesConfirmed: event.target.checked }))} /><span>세 관점은 완전히 배타적이지 않으며 하나가 나머지를 모두 대체하는 관계도 아님을 확인했습니다.</span></label>
    <div className="mt-8 border-t border-slate-200 pt-7"><h3 className="text-xl font-black">확인 문제 6개</h3><p className="mt-2 text-sm text-slate-600">각 문제를 제출하면 정답·오답과 해설을 확인할 수 있습니다.</p><div className="mt-5 grid gap-5">{LESSON11_QUIZ.map((question) => { const answer = activity.quizAnswers[String(question.id)] ?? ''; const submitted = activity.quizSubmitted.includes(question.id); const correct = activity.quizCorrect.includes(question.id); return <fieldset key={question.id} className="rounded-2xl border border-slate-200 p-5"><legend className="px-2 font-black">문제 {question.id}. {question.question}</legend><ChoiceButtons showId options={question.options.map((text, index) => ({ id: String.fromCharCode(65 + index), text }))} value={answer} disabled={submitted} onChoose={(choice) => chooseQuiz(question.id, choice)} />{!submitted ? <Button className="mt-4" disabled={answer === ''} onClick={() => submitQuiz(question.id, question.answer)}>문제 {question.id} 제출</Button> : <Feedback correct={correct}><strong>{correct ? '정답입니다.' : '오답입니다.'}</strong> {question.explanation}{!correct ? <Button className="mt-3" variant="secondary" onClick={() => retryQuiz(question.id)}><RotateCcw size={17} /> 오답 다시 풀기</Button> : null}</Feedback>}</fieldset> })}</div></div>
    <div className="mt-8 rounded-2xl border border-violet-200 bg-violet-50 p-5"><h3 className="font-black">Lesson 10 → Lesson 11 연결</h3><p className="mt-3 break-keep text-center font-bold leading-8">사람의 말 → 음성 인식 → 텍스트 → 자연어 처리 → 단어 수치화 → 의미와 문맥 처리</p></div>
    <Button className="mt-7" disabled={!ready} onClick={props.onComplete}><Sparkles size={18} /> STEP 7 활동 완료</Button>
    {props.isComplete ? <div className="mt-8 rounded-3xl bg-slate-950 p-6 text-white sm:p-8"><p className="text-sm font-black tracking-[0.16em] text-emerald-300">LESSON 11 SIGNAL FLOW COMPLETE</p><h3 className="mt-2 text-2xl font-black">문장을 숫자로 표현하고 문맥에서 의미를 찾는 흐름을 완성했습니다.</h3><div className="mt-6 border-t border-slate-700 pt-6"><p className="text-sm font-bold text-cyan-300">Lesson 12 연결 질문</p><p className="mt-2 text-lg font-black">문장은 단어가 순서대로 이어집니다. AI가 앞에서 나온 단어를 기억하고 문장 전체에서 중요한 단어의 관계를 살펴보려면 어떤 신경망이 필요할까요?</p><p className="mt-3 text-sm text-slate-300">미리 보기: AI는 문맥을 기억하고 글을 어떻게 만들까?</p><Link to="/lesson/12" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 font-bold text-slate-950">Lesson 12 미리 보기 <ArrowRight size={18} /></Link></div></div> : null}
  </StepFrame>
}
