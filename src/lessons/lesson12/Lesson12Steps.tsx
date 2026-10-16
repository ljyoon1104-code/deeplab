import { CheckCircle2, Circle, Info, RotateCcw, Sparkles, XCircle } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ActivityRequirements, ContextDistance, LanguageConceptRelations } from './Lesson12Guides'
import AttentionVisualizer from './AttentionVisualizer'
import SequenceMeaningActivity from './SequenceMeaningActivity'
import CourseRoadmap from './CourseRoadmap'
import FrequencyProbabilityTable from './FrequencyProbabilityTable'
import LanguageModelFlow from './LanguageModelFlow'
import {
  ATTENTION_EXAMPLES,
  CONCEPT_RELATION_CARDS,
  conceptDescription,
  NLP_DEVELOPMENT,
  CONTEXT_EXAMPLES,
  FREQUENCY_ROWS,
  LANGUAGE_MODEL_USES,
  LESSON12_QUIZ,
  MODEL_RELATION_CARDS,
  MODEL_RELATION_GUIDANCE,
  LESSON12_OPTION_ORDER,
  RNN_WORDS,
  SEQUENCE_SENTENCES,
  SERVICE_TECH_CARDS,
  lesson12StepTitles,
  type ModelRelation,
} from './lesson12Data'
import { useLesson12 } from './Lesson12Context'
import NextWordSimulation from './NextWordSimulation'
import RnnFlowVisualizer from './RnnFlowVisualizer'
import RnnTransformerComparison from './RnnTransformerComparison'
import { frequenciesToProbabilities, formatProbability } from './languageModelMath'

interface CommonStepProps { active: boolean; isComplete: boolean; onComplete: () => void }
interface StepFrameProps extends CommonStepProps { step: number; intro: string; children: ReactNode }

function StepFrame({ step, intro, active, isComplete, children }: StepFrameProps) {
  const titleId = active ? 'lesson-step-title' : `lesson12-step-${step}-title`
  return <Card as="section" hidden={!active} aria-labelledby={titleId} className="overflow-hidden"><div className="border-b border-slate-200 bg-gradient-to-r from-violet-50 via-white to-emerald-50 px-5 py-6 sm:px-8 sm:py-8"><div className="flex flex-wrap items-center justify-between gap-3"><span className="text-sm font-black tracking-[0.15em] text-violet-800">STEP {step}</span><span className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm font-bold ${isComplete ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>{isComplete ? <CheckCircle2 size={17} aria-hidden="true" /> : <Circle size={14} aria-hidden="true" />}{isComplete ? '활동 완료' : '활동 필요'}</span></div><h2 id={titleId} tabIndex={active ? -1 : undefined} className="step-focus-target mt-4 text-2xl font-black leading-snug tracking-tight text-slate-950 focus:outline-none sm:text-3xl">{lesson12StepTitles[step - 1]}</h2><p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{intro}</p></div><div className="px-5 py-7 sm:px-8 sm:py-9">{children}</div></Card>
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

export function Lesson12Step1(props: CommonStepProps) {
  const { activity, update } = useLesson12()
  const allCorrect = SEQUENCE_SENTENCES.every((item) => activity.sequenceAssignments[`${item.id}:subject`] === item.subject && activity.sequenceAssignments[`${item.id}:object`] === item.object)
  const ready = allCorrect && activity.sequenceFrequencyCorrect && activity.sequenceConfirmed
  return <StepFrame {...props} step={1} intro="비슷한 단어라도 나타나는 순서와 관계가 달라지면 누가 무엇을 했는지가 바뀝니다.">
    <ActivityRequirements items={[['네 문장의 주체·대상 정답', allCorrect], ['빈도와 관계 판단 정답', activity.sequenceFrequencyCorrect], ['순서의 영향 확인', activity.sequenceConfirmed]]} />
    <details className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="min-h-11 cursor-pointer py-2 font-black">이 차시의 학습 목표 자세히 보기</summary><ul className="mt-3 grid gap-2 text-sm leading-6 sm:grid-cols-2"><li>• 단어 순서에 따라 의미가 달라질 수 있음을 설명합니다.</li><li>• RNN의 이전 상태 전달 원리를 설명합니다.</li><li>• RNN과 순차 데이터의 관계를 이해합니다.</li><li>• 긴 문맥에서 기본 RNN의 한계를 이해합니다.</li><li>• Attention의 중요한 관계 반영 아이디어를 설명합니다.</li><li>• Transformer가 여러 단어 관계를 처리함을 이해합니다.</li><li>• 다음 단어 가능성으로 문장을 이어 가는 원리를 이해합니다.</li><li>• LLM의 뜻과 Transformer와의 관계를 구분합니다.</li></ul></details>
    <p className="mt-5 rounded-xl bg-cyan-50 p-4 leading-7">단어 횟수만으로는 누가 누구에게 행동하는지 알기 어렵습니다. 첫 문장은 안내 그림을 보고, 나머지는 주체·대상을 직접 고르세요. 두 역할을 맞히면 관계 그림이 나타납니다.</p>
    <div className="mt-6"><SequenceMeaningActivity assignments={activity.sequenceAssignments} onChoose={(key, value) => update((current) => ({ ...current, sequenceAssignments: { ...current.sequenceAssignments, [key]: value } }))} /></div>
    <Notice><strong>텍스트는 단어가 나타나는 순서와 단어 사이의 관계가 중요한 데이터</strong>입니다. 이런 문장처럼 순서가 있는 자료를 작은 보조 용어로 <strong>순차 데이터(Sequence Data)</strong>라고 부를 수 있습니다.</Notice>
    <fieldset className="mt-5 rounded-2xl border border-slate-200 p-5"><legend className="px-2 font-black">단어 빈도수만으로 행동의 주체와 대상을 구분할 수 있을까요?</legend><ChoiceButtons options={[{ id: 'no', text: '아니다. 같은 단어가 있어도 조사와 순서·관계를 함께 봐야 한다.' }, { id: 'yes', text: '그렇다. 단어가 나온 횟수만 세면 충분하다.' }]} value={activity.sequenceFrequencyAnswer} onChoose={(answer) => update((current) => ({ ...current, sequenceFrequencyAnswer: answer, sequenceFrequencyCorrect: answer === 'no' }))} />{activity.sequenceFrequencyAnswer ? <Feedback correct={activity.sequenceFrequencyCorrect}><strong>{activity.sequenceFrequencyCorrect ? '정답입니다.' : '오답입니다.'}</strong> 빈도만으로는 누가 누구를 사랑하거나 쫓았는지 알 수 없습니다.</Feedback> : null}</fieldset>
    {allCorrect && activity.sequenceFrequencyCorrect ? <label className="mt-4 flex items-start gap-3 rounded-xl bg-violet-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.sequenceConfirmed} onChange={(event) => update((current) => ({ ...current, sequenceConfirmed: event.target.checked }))} /><span>두 문장 쌍에서 단어 순서가 행동의 주체와 대상을 바꾸어 문장 의미에 영향을 준다는 점을 확인했습니다.</span></label> : null}
    <Button className="mt-5" disabled={!ready} onClick={props.onComplete}>STEP 1 활동 완료</Button>{props.isComplete ? <Completion>네 문장에서 행동의 주체와 대상을 정확히 구분했습니다.</Completion> : null}
  </StepFrame>
}

export function Lesson12Step2(props: CommonStepProps) {
  const { activity, update } = useLesson12()
  const allViewed = RNN_WORDS.every((_, index) => activity.rnnWordsViewed.includes(index))
  const allMemoryCorrect = RNN_WORDS.every((item, index) => activity.rnnMemoryAnswers[String(index)] === item.state)
  const ready = allViewed && allMemoryCorrect && activity.rnnFlowConfirmed && activity.rnnConceptConfirmed
  const next = () => update((current) => { const nextIndex = Math.min(RNN_WORDS.length - 1, current.currentRnnIndex + 1); return { ...current, currentRnnIndex: nextIndex, rnnWordsViewed: [...new Set([...current.rnnWordsViewed, nextIndex])] } })
  return <StepFrame {...props} step={2} intro="앞 STEP에서 본 순서와 문맥을 활용하려면 이전 정보가 필요합니다. 현재 단어와 이전 정보를 함께 처리하는 RNN을 살펴봅니다.">
    <ActivityRequirements items={[['다섯 단어 순서대로 처리', allViewed], ['현재 단어의 정보 판단 정답', allMemoryCorrect], ['이전 상태 전달 확인', activity.rnnFlowConfirmed], ['앞뒤 표현의 관계 확인', activity.rnnConceptConfirmed]]} />
    <div className="rounded-2xl bg-slate-950 p-5 text-white"><p className="text-sm font-black tracking-[0.14em] text-cyan-300">순환 신경망 · RNN · Recurrent Neural Network</p><p className="mt-3 text-lg font-black">RNN은 현재 입력과 이전 은닉 상태를 이용해 새 은닉 상태를 계산하는 신경망입니다.</p></div>
    <div className="mt-6 rounded-2xl border border-slate-200 p-5"><p className="text-sm font-black text-slate-600">처리할 문장</p><p className="mt-2 text-xl font-black">너는 노래를 못 부르지 않아.</p></div>
    <p className="mt-3 rounded-xl bg-cyan-50 p-4 text-sm leading-7">이 문장은 끝까지 읽어야 앞의 “못”과 뒤의 “않아”가 어떻게 연결되는지 살필 수 있습니다. 한 낱말만으로 전체 뜻을 확정하지 않고, 앞에서 얻은 정보와 현재 단어를 함께 봅니다. 먼저 첫 단어의 안내를 적용한 뒤 나머지 네 단어를 직접 판단하세요.</p>
    <div className="mt-5"><RnnFlowVisualizer currentIndex={activity.currentRnnIndex} viewed={activity.rnnWordsViewed} memoryAnswers={activity.rnnMemoryAnswers} onChooseMemory={(index, memory) => update((current) => ({ ...current, rnnMemoryAnswers: { ...current.rnnMemoryAnswers, [index]: memory } }))} onNext={next} onReset={() => update((current) => ({ ...current, currentRnnIndex: -1 }))} /></div>
    {allViewed && allMemoryCorrect ? <div className="mt-5 grid gap-3"><label className="flex items-start gap-3 rounded-xl bg-violet-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.rnnFlowConfirmed} onChange={(event) => update((current) => ({ ...current, rnnFlowConfirmed: event.target.checked }))} /><span>두 번째 단어부터 이전 상태 정보와 현재 단어가 함께 RNN에 들어가 새로운 상태 정보가 다음 단계로 전달됨을 확인했습니다.</span></label><label className="flex items-start gap-3 rounded-xl bg-cyan-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.rnnConceptConfirmed} onChange={(event) => update((current) => ({ ...current, rnnConceptConfirmed: event.target.checked }))} /><span>‘못’과 ‘않아’를 독립적으로 세기보다 앞뒤 관계를 함께 봐야 하며, RNN은 이전 단계 상태를 전달해 순차 데이터를 처리한다는 설명을 확인했습니다.</span></label></div> : null}
    <Button className="mt-5" disabled={!ready} onClick={props.onComplete}>STEP 2 활동 완료</Button>{props.isComplete ? <Completion>다섯 단어를 순서대로 처리하며 RNN의 상태 전달 흐름을 확인했습니다.</Completion> : null}
  </StepFrame>
}

export function Lesson12Step3(props: CommonStepProps) {
  const { activity, update } = useLesson12()
  const [selectedId, setSelectedId] = useState<string>(CONTEXT_EXAMPLES[0].id)
  const selected = CONTEXT_EXAMPLES.find((item) => item.id === selectedId) ?? CONTEXT_EXAMPLES[0]
  const allViewed = CONTEXT_EXAMPLES.every((item) => activity.contextsViewed.includes(item.id))
  const ready = allViewed && activity.longContextCorrect && activity.longContextRelationCorrect && activity.rnnLimitConfirmed
  const view = (id: string) => { setSelectedId(id); update((current) => ({ ...current, contextsViewed: [...new Set([...current.contextsViewed, id])] })) }
  const choose = (answer: string) => update((current) => ({ ...current, longContextAnswer: answer, longContextSubmitted: false, longContextCorrect: false }))
  const submit = () => update((current) => ({ ...current, longContextSubmitted: true, longContextCorrect: current.longContextAnswer === 'A' }))
  return <StepFrame {...props} step={3} intro="앞부분의 정보와 마지막 행동 사이가 가까운 문장과 먼 문장을 비교합니다.">
    <ActivityRequirements items={[['짧은·긴 문장 비교', allViewed], ['긴 문맥 문제 정답', activity.longContextCorrect], ['앞부분 관련 정보 선택 정답', activity.longContextRelationCorrect], ['한계 해석 확인', activity.rnnLimitConfirmed]]} />
    <div className="grid gap-4 md:grid-cols-2">{CONTEXT_EXAMPLES.map((item) => <button key={item.id} type="button" aria-pressed={selected.id === item.id} onClick={() => view(item.id)} className={`min-h-28 rounded-2xl border p-5 text-left ${selected.id === item.id ? 'border-violet-600 bg-violet-50' : 'border-slate-300 bg-white'}`}><strong>{item.title}</strong><span className="mt-2 block text-sm leading-6">{item.text}</span>{activity.contextsViewed.includes(item.id) ? <span className="mt-2 block text-xs font-bold text-emerald-700">✓ 정보 확인함</span> : null}</button>)}</div>
    <ContextDistance example={selected} relationCorrect={activity.longContextRelationCorrect} />
    <Notice>정보가 여러 단계를 거쳐 전달되면 멀리 떨어진 관계를 학습하고 활용하기 어려울 수 있습니다. 기본 RNN이 앞 정보를 무조건 잊거나 긴 문장을 전혀 처리하지 못한다는 뜻은 아닙니다.</Notice>
    <fieldset className="mt-6 rounded-2xl border border-slate-200 p-5"><legend className="px-2 font-black">긴 문장에서 앞부분의 정보가 중요한데 충분히 반영되지 않는다면 어떤 문제가 생길까요?</legend><ChoiceButtons showId options={[{ id: 'A', text: '문맥을 잘못 이해할 수 있다.' }, { id: 'B', text: '이미지 크기가 커진다.' }, { id: 'C', text: '픽셀값이 바뀐다.' }, { id: 'D', text: '음성의 주파수가 높아진다.' }]} value={activity.longContextAnswer} disabled={activity.longContextSubmitted} onChoose={choose} />{!activity.longContextSubmitted ? <Button className="mt-4" disabled={!activity.longContextAnswer} onClick={submit}>긴 문맥 문제 제출</Button> : null}</fieldset>
    {activity.longContextSubmitted ? <Feedback correct={activity.longContextCorrect}><strong>{activity.longContextCorrect ? '정답입니다.' : '오답입니다.'}</strong> 앞부분의 중요한 정보가 뒤쪽 판단에 충분히 반영되지 않으면 문장 전체의 문맥을 잘못 이해할 수 있습니다.{!activity.longContextCorrect ? <Button className="mt-3" variant="secondary" onClick={() => update((current) => ({ ...current, longContextAnswer: '', longContextSubmitted: false, longContextCorrect: false }))}><RotateCcw size={17} /> 다시 풀기</Button> : null}</Feedback> : null}
    <fieldset className="mt-5 rounded-2xl border border-slate-200 p-5"><legend className="px-2 font-black">긴 문장에서 “밥을 먹었다”와 가장 직접 관련된 앞부분 정보는?</legend><ChoiceButtons options={[{ id: 'hungry', text: '매우 배가 고팠다' }, { id: 'event', text: '학교 행사가 있었다' }, { id: 'club', text: '동아리 활동을 했다' }]} value={activity.longContextRelationAnswer} onChoose={(answer) => update((current) => ({ ...current, longContextRelationAnswer: answer, longContextRelationCorrect: answer === 'hungry' }))} />{activity.longContextRelationAnswer ? <Feedback correct={activity.longContextRelationCorrect}><strong>{activity.longContextRelationCorrect ? '정답입니다.' : '오답입니다.'}</strong> 행사와 동아리 활동은 배경이지만, 마지막 행동의 직접적인 이유는 배고픔입니다.</Feedback> : null}</fieldset>
    {allViewed && activity.longContextCorrect && activity.longContextRelationCorrect ? <label className="mt-5 flex items-start gap-3 rounded-xl bg-cyan-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.rnnLimitConfirmed} onChange={(event) => update((current) => ({ ...current, rnnLimitConfirmed: event.target.checked }))} /><span>기본 RNN의 긴 문맥 한계는 가능성에 대한 설명이며, 모든 RNN이 동일하거나 긴 문장을 전혀 처리하지 못한다는 단정이 아님을 확인했습니다.</span></label> : null}
    <Button className="mt-5" disabled={!ready} onClick={props.onComplete}>STEP 3 활동 완료</Button>{props.isComplete ? <Completion>짧고 긴 문장의 정보 거리를 비교하고 긴 문맥의 어려움을 확인했습니다.</Completion> : null}
  </StepFrame>
}

export function Lesson12Step4(props: CommonStepProps) {
  const { activity, update } = useLesson12()
  const first = ATTENTION_EXAMPLES[0]
  const second = ATTENTION_EXAMPLES[1]
  const firstCorrect = activity.attentionWords.length === 2 && first.important.every((word) => activity.attentionWords.includes(word))
  const secondCorrect = activity.secondAttentionWords.length === 2 && second.important.every((word) => activity.secondAttentionWords.includes(word))
  const ready = firstCorrect && secondCorrect && activity.attentionContextConfirmed && activity.attentionSimulationConfirmed
  const toggle = (word: string, key: 'first' | 'second') => update((current) => { const source = key === 'first' ? current.attentionWords : current.secondAttentionWords; const selected = source.includes(word) ? source.filter((item) => item !== word) : source.length < 2 ? [...source, word] : [source[1], word]; return key === 'first' ? { ...current, attentionWords: selected, attentionContextConfirmed: false } : { ...current, secondAttentionWords: selected, attentionContextConfirmed: false } })
  return <StepFrame {...props} step={4} intro="긴 문맥에서도 필요한 정보에 주목하려면 어떻게 해야 할까요? Attention이 현재 판단에 관련 있는 정보를 반영하는 방식을 살펴봅니다.">
    <ActivityRequirements items={[['비 예문의 관계 선택 정답', firstCorrect], ['그녀 예문의 관계 선택 정답', secondCorrect], ['다른 단어도 남는지 확인', activity.attentionContextConfirmed], ['교육용 예시의 범위 확인', activity.attentionSimulationConfirmed]]} />
    <p className="mb-4 rounded-xl bg-cyan-50 p-4 text-sm leading-7">Attention은 현재 처리와 관련 있는 정보에 서로 다른 가중치를 주어 조합하는 방식입니다. 각 질문에 필요한 두 단어를 선택하세요. 맞히면 관계선이 나타나며, 이 선은 실제 점수가 아닌 고정 설명입니다. 다른 단어는 삭제하지 않습니다.</p>
    <div className="grid gap-5 lg:grid-cols-2"><AttentionVisualizer example={first} selected={activity.attentionWords} onToggle={(word) => toggle(word, 'first')} /><AttentionVisualizer example={second} selected={activity.secondAttentionWords} onToggle={(word) => toggle(word, 'second')} /></div>
    {activity.attentionWords.length === 2 || activity.secondAttentionWords.length === 2 ? <Feedback correct={firstCorrect && secondCorrect}>{firstCorrect && secondCorrect ? <><strong>맞았습니다.</strong> 가까이 있는 단어만이 아니라, 문장 안에서 의미상 연결된 ‘비 ↔ 우산’과 ‘영희 ↔ 그녀’를 선택했습니다.</> : <><strong>다시 살펴보세요.</strong> 가까운 위치보다 질문을 해석하는 데 직접 필요한 관계를 선택하세요.</>}</Feedback> : null}
    {firstCorrect && secondCorrect ? <div className="mt-5 grid gap-3"><label className="flex items-start gap-3 rounded-xl bg-amber-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.attentionContextConfirmed} onChange={(event) => update((current) => ({ ...current, attentionContextConfirmed: event.target.checked }))} /><span>굵은 주황 연결선과 ‘중요 관계’ 텍스트는 선택된 관계를 나타내며, 다른 단어도 문장에서 삭제되지 않았음을 확인했습니다.</span></label><label className="flex items-start gap-3 rounded-xl bg-slate-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.attentionSimulationConfirmed} onChange={(event) => update((current) => ({ ...current, attentionSimulationConfirmed: event.target.checked }))} /><span>이 화면은 실제 Attention 점수 계산 결과가 아닌 교육용 개념 시뮬레이션임을 확인했습니다.</span></label></div> : null}
    <Button className="mt-5" disabled={!ready} onClick={props.onComplete}>STEP 4 활동 완료</Button>{props.isComplete ? <Completion>두 문장에서 중요한 단어 관계와 Attention의 교육용 범위를 확인했습니다.</Completion> : null}
  </StepFrame>
}

export function Lesson12Step5(props: CommonStepProps) {
  const { activity, update, assignModelRelation } = useLesson12()
  const [selectedId, setSelectedId] = useState<string>(MODEL_RELATION_CARDS[0].id)
  const selected = MODEL_RELATION_CARDS.find((item) => item.id === selectedId) ?? MODEL_RELATION_CARDS[0]
  const answer = activity.modelAssignments[selected.id]
  const allCorrect = MODEL_RELATION_CARDS.every((item) => activity.modelAssignments[item.id] === item.answer)
  const ready = allCorrect && activity.rnnVisualConfirmed && activity.transformerVisualConfirmed && activity.transformerLlmConfirmed
  return <StepFrame {...props} step={5} intro="이전 상태를 순서대로 전달하는 RNN과 여러 단어 관계를 살펴보는 Transformer의 처리 관점을 비교합니다.">
    <ActivityRequirements items={[['비교 카드 전체 정답', allCorrect], ['RNN 흐름 확인', activity.rnnVisualConfirmed], ['Transformer 흐름 확인', activity.transformerVisualConfirmed], ['Transformer와 LLM 구별 확인', activity.transformerLlmConfirmed]]} />
    <div className="mb-5 grid gap-3 md:grid-cols-3" aria-label="구조와 아이디어의 관계 비교">
      <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4"><h3 className="font-black">RNN · 신경망 구조</h3><p className="mt-2 text-sm leading-6">이전 상태를 전달하며 순서가 있는 입력을 처리합니다.</p></div>
      <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4"><h3 className="font-black">Attention · 아이디어</h3><p className="mt-2 text-sm leading-6">현재 처리에 중요한 단어 사이 관계를 반영합니다.</p></div>
      <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-4"><h3 className="font-black">Transformer · 신경망 구조</h3><p className="mt-2 text-sm leading-6">Attention으로 입력의 관계를 반영하며, 단어의 순서를 다루기 위해 위치 정보도 사용합니다.</p></div>
    </div>
    <p className="mb-5 text-sm leading-6">세 이름은 차례로 실행하는 세 단계가 아닙니다. 구조와 아이디어의 관계를 구분해 아래 발전 과정과 비교 활동을 살펴보세요.</p>
    <Notice><strong>교과서 118쪽의 자연어 처리 발전 과정</strong><p className="mt-2 leading-7">{NLP_DEVELOPMENT.join(' → ')}</p><p className="mt-2">긴 문맥의 정보를 유지하려는 발전과 중요한 단어에 집중하는 Attention의 아이디어가 이어집니다. Transformer도 이 발전 과정에 포함됩니다. 이 이름들은 참고용 발전 흐름이며, 암기하지 않아도 아래 그림과 카드의 이유로 판단할 수 있습니다.</p></Notice>
    <RnnTransformerComparison rnnConfirmed={activity.rnnVisualConfirmed} transformerConfirmed={activity.transformerVisualConfirmed} onConfirmRnn={() => update((current) => ({ ...current, rnnVisualConfirmed: true }))} onConfirmTransformer={() => update((current) => ({ ...current, transformerVisualConfirmed: true }))} />
    <div className="mt-7 grid gap-4 lg:grid-cols-2"><div><h3 className="font-black">① 설명 카드 선택</h3><div className="mt-3 grid gap-2">{MODEL_RELATION_CARDS.map((item, index) => { const assigned = activity.modelAssignments[item.id]; const correct = assigned === item.answer; return <button key={item.id} type="button" aria-pressed={selected.id === item.id} onClick={() => setSelectedId(item.id)} className={`min-h-14 rounded-xl border p-3 text-left ${selected.id === item.id ? 'border-violet-600 bg-violet-50' : 'border-slate-300 bg-white'}`}><strong>설명 {index + 1}</strong><span className="mt-1 block text-sm">{item.text}</span>{assigned ? <span className={`mt-1 block text-xs font-bold ${correct ? 'text-emerald-700' : 'text-rose-700'}`}>{correct ? '✓ 정확히 분류함' : '✕ 다시 분류 필요'}</span> : null}</button> })}</div></div><div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><h3 className="font-black">② 선택한 설명 분류</h3><p className="mt-3 rounded-xl bg-white p-4 font-bold">{selected.text}</p><div className="mt-4 grid gap-2 sm:grid-cols-3" role="group" aria-label="RNN과 Transformer 관계 분류">{([{ id: 'rnn', text: 'RNN' }, { id: 'transformer', text: 'Transformer' }, { id: 'both', text: '둘 다 관련 있음' }] as Array<{ id: ModelRelation; text: string }>).map((item) => <button key={item.id} type="button" aria-pressed={answer === item.id} onClick={() => assignModelRelation(selected.id, item.id)} className={`min-h-12 rounded-xl border p-2 text-sm font-bold ${answer === item.id ? 'border-violet-600 bg-violet-50' : 'border-slate-300 bg-white'}`}>{item.text}</button>)}</div>{answer ? answer === selected.answer ? <Feedback correct>맞았습니다. {MODEL_RELATION_GUIDANCE[selected.id]}</Feedback> : <Feedback correct={false}>{MODEL_RELATION_GUIDANCE[selected.id]} 앞 그림과 연결해 다시 선택하세요.</Feedback> : null}</div></div>
    {allCorrect && activity.rnnVisualConfirmed && activity.transformerVisualConfirmed ? <label className="mt-5 flex items-start gap-3 rounded-xl bg-amber-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.transformerLlmConfirmed} onChange={(event) => update((current) => ({ ...current, transformerLlmConfirmed: event.target.checked }))} /><span>현대의 많은 LLM이 Transformer를 핵심 기반 구조로 사용하지만, <strong>Transformer와 LLM은 같은 뜻이 아님</strong>을 확인했습니다.</span></label> : null}
    <Button className="mt-5" disabled={!ready} onClick={props.onComplete}>STEP 5 활동 완료</Button>{props.isComplete ? <Completion>RNN과 Transformer의 처리 관점 및 LLM과의 관계를 구분했습니다.</Completion> : null}
  </StepFrame>
}

export function Lesson12Step6(props: CommonStepProps) {
  const { activity, update } = useLesson12()
  const frequencyCorrect = activity.frequencyAnswers['밥'] === '먹다' && activity.frequencyAnswers['버스'] === '타다' && activity.frequencyAnswers['커피'] === '마시다' && ['밥', '버스', '커피'].every((context) => activity.frequencySubmitted.includes(context))
  const totalsCorrect = FREQUENCY_ROWS.every((row) => Number(activity.frequencyTotalAnswers[row.context]?.trim()) === row.candidates.reduce((sum, item) => sum + item.count, 0))
  const nextComplete = activity.nextFirstChoice === '우유를' && Boolean(activity.nextSecondChoice) && activity.nextWordSelections.length >= 2 && activity.firstChoicesSeen.includes('우유를') && activity.firstChoicesSeen.some((word) => word !== '우유를')
  const ready = frequencyCorrect && totalsCorrect && activity.probabilitiesConfirmed && activity.probabilityFactCorrect && nextComplete && activity.generationSimulationConfirmed
  return <StepFrame {...props} step={6} intro="작은 고정 빈도표로 후보 확률을 계산하고, 선택한 다음 단어가 새 문맥에 더해지는 과정을 관찰합니다.">
    <ActivityRequirements items={[['세 행의 빈도 합 정답', totalsCorrect], ['세 행의 최고 후보 선택·정답 제출', frequencyCorrect], ['계산 확률 확인', activity.probabilitiesConfirmed], ['확률과 사실 판단 정답', activity.probabilityFactCorrect], ['낮은 후보와 우유를 비교 후 두 번째 후보 선택', nextComplete], ['고정 예시의 범위 확인', activity.generationSimulationConfirmed]]} />
    <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5" role="note"><h3 className="font-black text-amber-950">생성 원리 단순화 시뮬레이션</h3><p className="mt-2 text-sm leading-6 text-amber-900">함께 나온 횟수로 다음 후보의 가능성을 계산해 봅니다. 실제 언어 모델은 바로 앞 단어의 횟수만 세어 답하지 않습니다.</p></div>
    <p className="mt-4 rounded-xl bg-white p-4 text-sm leading-7"><strong>계산 활동 순서:</strong> ① 빈도 합 입력 → ② 최고 확률 후보 선택 → ③ 제출. 첫 행은 안내, 나머지는 직접 계산합니다.</p>
    <div className="mt-6 rounded-xl bg-slate-950 p-4 text-center font-mono text-sm font-bold text-white">후보 확률 = 해당 후보 빈도(분자) ÷ 현재 행 세 후보 빈도 합(분모)</div>
    <p className="mt-3 text-sm leading-6 text-slate-600">빈도는 함께 등장한 횟수이고, 확률은 이 문맥에서 다음 후보를 선택할 가능성입니다. 사실일 확률이나 모델 정확도가 아닙니다. 백분율은 소수점 첫째 자리로 반올림합니다.</p>
    <div className="mt-6"><FrequencyProbabilityTable answers={activity.frequencyAnswers} totalAnswers={activity.frequencyTotalAnswers} submitted={activity.frequencySubmitted} onChoose={(context, word) => update((current) => ({ ...current, frequencyAnswers: { ...current.frequencyAnswers, [context]: word } }))} onTotalChange={(context, value) => update((current) => ({ ...current, frequencyTotalAnswers: { ...current.frequencyTotalAnswers, [context]: value } }))} onSubmit={(context) => update((current) => ({ ...current, frequencySubmitted: [...new Set([...current.frequencySubmitted, context])] }))} onRetry={(context) => update((current) => ({ ...current, frequencySubmitted: current.frequencySubmitted.filter((item) => item !== context), frequencyAnswers: { ...current.frequencyAnswers, [context]: '' } }))} /></div>
    {frequencyCorrect && totalsCorrect ? <><label className="mt-5 flex items-start gap-3 rounded-xl bg-cyan-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.probabilitiesConfirmed} onChange={(event) => update((current) => ({ ...current, probabilitiesConfirmed: event.target.checked }))} /><span>같은 빈도표에서 계산한 확률을 확인했습니다: {FREQUENCY_ROWS.map((row) => `${row.context}: ${frequenciesToProbabilities(row.candidates).map((item) => `${item.word} ${formatProbability(item.probability)}`).join(' · ')}`).join(' / ')}.</span></label><fieldset className="mt-5 rounded-2xl border border-slate-200 p-5"><legend className="px-2 font-black">가장 높은 확률은 반드시 사실일까요?</legend><ChoiceButtons options={[{ id: 'no', text: '아니다. 확률은 가능성이지 사실 검증 결과는 아니다.' }, { id: 'yes', text: '그렇다. 가장 높은 후보는 항상 사실이다.' }]} value={activity.probabilityFactAnswer} onChoose={(answer) => update((current) => ({ ...current, probabilityFactAnswer: answer, probabilityFactCorrect: answer === 'no' }))} />{activity.probabilityFactAnswer ? <Feedback correct={activity.probabilityFactCorrect}><strong>{activity.probabilityFactCorrect ? '정답입니다.' : '오답입니다.'}</strong> 확률이 높다는 것은 이 교육용 문맥에서 더 가능성이 크다는 뜻일 뿐입니다.</Feedback> : null}</fieldset></> : null}
    <section className="mt-8 rounded-2xl border border-cyan-200 p-4 sm:p-5" aria-label="학습된 언어 모델로 생성하는 전체 과정">
      <h3 className="font-black">생성 과정 설명 · 교과서 119쪽의 네 기본 과정</h3>
      <p className="mt-2 mb-4 text-sm leading-6">이제 빈도표와 별개의 고정 후보 예시로 이어 봅니다. 실제 모델 출력은 아닙니다.</p>
      <details className="mt-4"><summary className="min-h-11 cursor-pointer rounded-xl border border-slate-300 p-3 text-sm font-bold focus-visible:outline-3 focus-visible:outline-indigo-600">네 기본 과정과 현재 활동 연결 · 설명 펼치기</summary><div className="mt-4"><LanguageModelFlow firstChoice={activity.nextFirstChoice} secondChoice={activity.nextSecondChoice} /></div></details>
    </section>
    <div className="mt-9 border-t border-slate-200 pt-7"><h3 className="text-xl font-black">후보 확률을 보며 문장 이어 보기</h3><div className="mt-5"><NextWordSimulation firstChoice={activity.nextFirstChoice} secondChoice={activity.nextSecondChoice} onFirstChoice={(word) => update((current) => ({ ...current, nextFirstChoice: word, nextSecondChoice: word === current.nextFirstChoice ? current.nextSecondChoice : '', nextWordSelections: [...current.nextWordSelections, word], firstChoicesSeen: [...new Set([...current.firstChoicesSeen, word])]}))} onSecondChoice={(word) => update((current) => ({ ...current, nextSecondChoice: word, nextWordSelections: [...current.nextWordSelections, word] }))} /></div></div>
    <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6" role="status">후보 활동의 남은 조건: {[
      !activity.firstChoicesSeen.some((word) => word !== '우유를') ? '낮은 확률 후보(TV를 또는 버스를) 한 가지 선택' : '',
      !activity.firstChoicesSeen.includes('우유를') || activity.nextFirstChoice !== '우유를' ? '우유를 선택해 두 번째 후보 열기' : '',
      !activity.nextSecondChoice ? '두 번째 후보 하나 선택' : '',
    ].filter(Boolean).join(' · ') || '후보 비교를 마쳤습니다. 아래 고정 예시의 범위를 확인하세요.'}</p>
    {nextComplete ? <label className="mt-5 flex items-start gap-3 rounded-xl bg-emerald-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.generationSimulationConfirmed} onChange={(event) => update((current) => ({ ...current, generationSimulationConfirmed: event.target.checked }))} /><span>확률이 가장 높은 후보는 가능성이 큰 후보이지만 반드시 그 단어만 선택되는 것은 아닙니다. 실제 모델은 더 넓은 문맥과 복잡한 관계를 학습하며, 화면의 확률과 문장은 새로고침해도 임의로 변하지 않는 교육용 고정 예시임을 확인했습니다.</span></label> : null}
    <Notice>학생 화면에서는 ‘다음 단어’로 설명하지만, 실제 언어 모델은 단어보다 작은 <strong>토큰</strong> 단위를 사용하기도 합니다.</Notice>
    <Button className="mt-5" disabled={!ready} onClick={props.onComplete}>STEP 6 활동 완료</Button>{props.isComplete ? <Completion>실제 빈도에서 후보 확률을 계산하고 두 번의 단어 선택으로 문맥이 이어지는 과정을 확인했습니다.</Completion> : null}
  </StepFrame>
}

interface Step7Props extends CommonStepProps { priorStepsComplete: boolean; onCompletionReadyChange: (ready: boolean) => void }


type ReviewItem = { label: string; done: boolean | null; remaining?: string }
function ReviewNavigation({ label, items, current, onChange }: { label: string; items: ReviewItem[]; current: number; onChange: (index: number) => void }) {
  const required = items.filter(item => item.done !== null)
  return <nav aria-label={label} className="my-5 rounded-xl border border-slate-300 bg-slate-50 p-3">
    <p className="text-sm font-bold" aria-live="polite">{label} · 현재 {current + 1}/{items.length} · 필수 {required.filter(item => item.done).length}/{required.length} 완료</p>
    <div className={`mt-3 grid gap-2 ${label === '확인 문제 이동' ? 'grid-cols-2 sm:grid-cols-4' : 'sm:grid-cols-2'}`}>{items.map((item, index) => <button key={item.label} type="button" aria-current={current === index ? 'step' : undefined} onClick={() => onChange(index)} className={`min-h-11 min-w-0 rounded-lg border-2 p-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-indigo-600 ${current === index ? 'border-violet-600 bg-white' : 'border-slate-200 bg-white'}`}>
      <span className="block break-keep font-bold">{item.label} · {item.done === null ? '설명' : item.done ? '✓ 완료' : '○ 남음'}</span>
      {item.done === false && item.remaining && <span className="mt-1 block leading-5">{item.remaining}</span>}
    </button>)}</div>
    <div className="mt-3 flex flex-wrap gap-2"><Button variant="secondary" disabled={current === 0} onClick={() => onChange(current - 1)}>이전 {label === '확인 문제 이동' ? '문제' : '소구간'}</Button><Button variant="secondary" disabled={current === items.length - 1} onClick={() => onChange(current + 1)}>다음 {label === '확인 문제 이동' ? '문제' : '소구간'}</Button></div>
  </nav>
}

export function Lesson12Step7({ priorStepsComplete, onCompletionReadyChange, ...props }: Step7Props) {
  const { activity, update } = useLesson12()
  const [section, setSection] = useState(0)
  const [quizIndex, setQuizIndex] = useState(0)
  const conceptsCorrect = CONCEPT_RELATION_CARDS.every((item) => activity.conceptAssignments[item.id] === item.answer)
  const servicesCorrect = SERVICE_TECH_CARDS.every((item) => activity.serviceAssignments[item.id] === item.answer)
  const allQuizCorrect = LESSON12_QUIZ.every((item) => activity.quizCorrect.includes(item.id))
  const ready = activity.languageModelConfirmed && activity.llmConfirmed && conceptsCorrect && servicesCorrect && activity.roadmapConfirmed && allQuizCorrect

  useEffect(() => {
    onCompletionReadyChange(priorStepsComplete && props.isComplete)
    return () => onCompletionReadyChange(false)
  }, [onCompletionReadyChange, priorStepsComplete, props.isComplete])

  const chooseQuiz = (id: number, answer: string) => update((current) => ({ ...current, quizAnswers: { ...current.quizAnswers, [id]: answer } }))
  const submitQuiz = (id: number, answer: number) => update((current) => ({ ...current, quizSubmitted: [...new Set([...current.quizSubmitted, id])], quizCorrect: current.quizAnswers[String(id)] === String.fromCharCode(65 + answer) ? [...new Set([...current.quizCorrect, id])] : current.quizCorrect.filter((item) => item !== id) }))
  const retryQuiz = (id: number) => update((current) => ({ ...current, quizSubmitted: current.quizSubmitted.filter((item) => item !== id), quizCorrect: current.quizCorrect.filter((item) => item !== id), quizAnswers: { ...current.quizAnswers, [id]: '' } }))

  return <StepFrame {...props} step={7} intro="다음 단어 예측에서 생성형 언어 모델과 LLM으로 이어지는 전체 흐름과 12차시 학습 여정을 정리합니다.">
    <ReviewNavigation label="소구간 이동" current={section} onChange={setSection} items={[
 { label: '1. 개념 연결', done: activity.languageModelConfirmed && activity.llmConfirmed && conceptsCorrect, remaining: [!activity.languageModelConfirmed && '생성과 학습 구분 확인', !activity.llmConfirmed && 'LLM·Transformer 구분 확인', !conceptsCorrect && '네 개념 연결'].filter(Boolean).join(' · ') },
 { label: '2. 서비스 적용', done: servicesCorrect, remaining: SERVICE_TECH_CARDS.filter(item => activity.serviceAssignments[item.id] !== item.answer).map(item => item.title).join(' · ') },
 { label: '3. Roadmap', done: activity.roadmapConfirmed, remaining: '전체 학습 연결 확인' },
 { label: '4. 확인 문제', done: allQuizCorrect, remaining: LESSON12_QUIZ.filter(item => !activity.quizCorrect.includes(item.id)).map(item => '문제 ' + item.id).join(' · ') }
]} />
    <p className="text-sm leading-6">남은 항목의 버튼을 누르면 해당 소구간으로 이동합니다. 이동은 답안이나 완료 조건을 바꾸지 않습니다.</p>
    <div hidden={section !== 0} aria-label="소구간 1 내용">
    <h3 className="mb-4 border-b border-slate-200 pb-3 text-xl font-black">1. 생성형 언어 모델·LLM·Transformer·생성형 AI 관계</h3>
    <LanguageConceptRelations />
    <div className="mt-6 rounded-2xl border border-slate-200 p-5"><h3 className="font-black">① 교과서 기본 과정</h3><p className="mt-3 font-bold leading-7">형태소 분석 → 임베딩 → 언어 모델 → 확률적 선택</p><p className="mt-3 text-sm leading-6">아래 그림은 네 기본 과정에 기존 세부 동작을 대응시킵니다. 단어 인덱스·원-핫·임베딩을 모두 차례로 통과해야 하는 것은 아닙니다.</p><details className="mt-4"><summary className="min-h-11 cursor-pointer rounded-xl border border-slate-300 p-3 text-sm font-bold focus-visible:outline-3 focus-visible:outline-indigo-600">네 과정과 앱 활동 대응 다시 보기 · 선택 설명</summary><div className="mt-4"><LanguageModelFlow firstChoice={activity.nextFirstChoice} secondChoice={activity.nextSecondChoice} /></div></details></div>
    <Notice><strong>학습과 생성 구분:</strong> 학습 때는 자료를 바탕으로 가중치를 조정합니다. 사용 때는 현재 문맥으로 다음 토큰을 예측해 이어 씁니다. 대화에 새 내용이 추가되는 것만으로 모델 가중치를 다시 학습하는 것은 아닙니다.</Notice>
    <div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="flex items-start gap-3 rounded-xl bg-violet-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.languageModelConfirmed} onChange={(event) => update((current) => ({ ...current, languageModelConfirmed: event.target.checked }))} /><span>생성형 언어 모델이 문맥을 바탕으로 다음 단어 가능성을 예측하고 선택 결과를 새 문맥으로 삼아 텍스트를 이어 갈 수 있음을 확인했습니다.</span></label><label className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.llmConfirmed} onChange={(event) => update((current) => ({ ...current, llmConfirmed: event.target.checked }))} /><span>Transformer는 많은 LLM의 핵심 기반 구조이지만 같은 뜻이 아닙니다. LLM은 단순 빈도표나 문장 복사 장치가 아니며, 출력이 항상 사실이거나 정확하다고 보장되지 않음을 확인했습니다.</span></label></div>
    <div className="mt-8 border-t border-slate-200 pt-7"><h3 className="text-xl font-black">개념을 같은 뜻으로 묶지 않기</h3><p className="mt-2 text-sm leading-6 text-slate-600">각 개념에 맞는 설명을 연결하세요. 서로 바꾸면 오답입니다.</p><div className="mt-5 grid gap-4">{CONCEPT_RELATION_CARDS.map((item) => { const selected = activity.conceptAssignments[item.id] ?? ''; const correct = selected === item.answer; return <fieldset key={item.id} className="rounded-2xl border border-slate-200 p-5"><legend className="px-2 font-black">{item.concept}</legend><div className="mt-3 grid gap-2">{CONCEPT_RELATION_CARDS.map((option) => <button key={option.id} type="button" aria-pressed={selected === option.answer} onClick={() => update((current) => ({ ...current, conceptAssignments: { ...current.conceptAssignments, [item.id]: option.answer } }))} className={`min-h-11 rounded-xl border p-3 text-left text-sm font-bold ${selected === option.answer ? 'border-violet-600 bg-violet-50' : 'border-slate-300 bg-white'}`}>{conceptDescription(option.answer)}</button>)}</div>{selected ? <Feedback correct={correct}><strong>{correct ? '정확히 구분했습니다.' : '다시 연결하세요.'}</strong> {conceptDescription(item.answer)}</Feedback> : null}</fieldset> })}</div></div>
    </div>
    <div hidden={section !== 1} aria-label="소구간 2 내용">
    <div className="mt-8 border-t border-slate-200 pt-7"><h3 className="text-xl font-black">2. 서비스별 기술 적용과 한계</h3><p className="mt-2 text-sm leading-6 text-slate-600">모든 서비스에 LLM이나 Transformer를 연결하지 않고, 필요한 기술 흐름을 선택합니다. 알맞은 기술을 사용해도 답변의 사실성·요약 누락·분류 오류를 확인해야 합니다.</p><div className="mt-5 grid gap-4">{SERVICE_TECH_CARDS.map((item) => { const selected = activity.serviceAssignments[item.id] ?? ''; const correct = selected === item.answer; return <fieldset key={item.id} className="rounded-2xl border border-slate-200 p-5"><legend className="px-2 font-black">{item.title}</legend><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">{([{ id: 'language-model', text: '생성형 언어 모델' }, { id: 'speech-plus-language', text: '음성 인식 → 언어 모델' }, { id: 'image-classification', text: '이미지 분류' }, { id: 'image-generation', text: '이미지 생성 모델' }, { id: 'gan', text: 'GAN만 사용' }]).map((option) => <button key={option.id} type="button" aria-pressed={selected === option.id} onClick={() => update((current) => ({ ...current, serviceAssignments: { ...current.serviceAssignments, [item.id]: option.id } }))} className={`min-h-11 rounded-xl border p-2 text-sm font-bold ${selected === option.id ? 'border-violet-600 bg-violet-50' : 'border-slate-300 bg-white'}`}>{option.text}</button>)}</div>{selected ? <Feedback correct={correct}><strong>{correct ? '적절한 기술 흐름입니다.' : '다시 판단해 보세요.'}</strong> {item.id === 'voice-answer' ? '말소리는 먼저 텍스트로 바꾸고, 그 뒤 언어 모델이 답변을 생성할 수 있습니다.' : item.id === 'digit' ? '숫자 판단은 이미지 분류 문제입니다.' : item.id === 'image' ? '설명에 맞는 새 이미지는 이미지 생성 모델의 활용 사례입니다.' : '텍스트를 이어 만들거나 요약·답변하는 작업은 생성형 언어 모델과 관련됩니다.'}</Feedback> : null}</fieldset> })}</div></div>
    <div className="mt-8 border-t border-slate-200 pt-7"><h3 className="text-xl font-black">생성형 언어 모델 활용 사례</h3><p className="mt-2 text-sm text-slate-600">필요한 사례를 눌러 설명을 확인하세요. 방문 횟수 대신 위의 서비스 선택과 확인 문제로 이해를 판단합니다.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{LANGUAGE_MODEL_USES.map((item) => { const viewed = activity.usesViewed.includes(item.id); return <button key={item.id} type="button" aria-pressed={viewed} onClick={() => update((current) => ({ ...current, usesViewed: [...new Set([...current.usesViewed, item.id])] }))} className={`min-h-24 rounded-2xl border p-4 text-left ${viewed ? 'border-emerald-600 bg-emerald-50' : 'border-slate-300 bg-white'}`}><strong>{viewed ? '✓ 확인함 · ' : ''}{item.title}</strong><span className="mt-2 block text-sm leading-6">{viewed ? item.detail : '눌러서 설명 확인'}</span></button> })}</div></div>
    </div>
    <div hidden={section !== 2} aria-label="소구간 3 내용">
    <div className="mt-8 border-t border-slate-200 pt-7"><h3 className="text-xl font-black">3. 전체 12차시 Roadmap</h3><p className="mt-2 text-sm text-slate-600">차시 번호와 핵심 키워드를 선택하면 기존 학습 화면으로 이동할 수 있습니다.</p><div className="mt-5"><CourseRoadmap /></div><label className="mt-5 flex items-start gap-3 rounded-xl bg-cyan-50 p-4"><input type="checkbox" className="mt-1 size-5" checked={activity.roadmapConfirmed} onChange={(event) => update((current) => ({ ...current, roadmapConfirmed: event.target.checked }))} /><span>딥러닝 기초 원리 → 실제 MNIST 모델 실습 → 이미지·음성·언어 응용으로 이어지는 12차시 Roadmap을 확인했습니다.</span></label></div>
    </div>
    <div hidden={section !== 3} aria-label="소구간 4 내용">
    <div className="mt-8 border-t border-slate-200 pt-7"><h3 className="text-xl font-black">4. 확인 문제 {LESSON12_QUIZ.length}개</h3><p className="mt-2 text-sm text-slate-600">모든 문제를 정답으로 제출해야 Lesson 12를 완료할 수 있습니다.</p><ReviewNavigation label="확인 문제 이동" current={quizIndex} onChange={setQuizIndex} items={LESSON12_QUIZ.map((item, index) => ({ label: `문제 ${index + 1}`, done: activity.quizCorrect.includes(item.id), remaining: activity.quizSubmitted.includes(item.id) ? '오답 수정·재제출' : '선택 후 제출' }))} /><div className="mt-5 grid gap-5">{LESSON12_QUIZ.map((question, questionIndex) => { const answer = activity.quizAnswers[String(question.id)] ?? ''; const submitted = activity.quizSubmitted.includes(question.id); const correct = activity.quizCorrect.includes(question.id); return <fieldset hidden={quizIndex !== questionIndex} key={question.id} className="rounded-2xl border border-slate-200 p-5"><legend className="px-2 font-black">문제 {question.id}. {question.question}</legend><ChoiceButtons options={LESSON12_OPTION_ORDER[question.id].map((optionIndex, displayIndex) => ({ id: String.fromCharCode(65 + optionIndex), text: `${displayIndex + 1}. ${question.options[optionIndex]}` }))} value={answer} disabled={submitted} onChoose={(choice) => chooseQuiz(question.id, choice)} />{!submitted ? <Button className="mt-4" disabled={!answer} onClick={() => submitQuiz(question.id, question.answer)}>문제 {question.id} 제출</Button> : <Feedback correct={correct}><strong>{correct ? '정답입니다.' : '오답입니다.'}</strong> {question.explanation}{!correct ? <Button className="mt-3" variant="secondary" onClick={() => retryQuiz(question.id)}><RotateCcw size={17} /> 오답 다시 풀기</Button> : null}</Feedback>}</fieldset> })}</div></div>
    <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200"><h3 className="bg-slate-950 p-4 font-black text-white">마지막 개념 비교</h3><div className="grid divide-y divide-slate-200">{[['RNN', '이전 단계 정보를 다음 단계 처리에 활용'], ['Attention', '중요한 단어 관계를 더 크게 반영'], ['Transformer', 'Attention을 이용해 여러 단어 관계를 효율적으로 처리'], ['생성형 언어 모델', '문맥을 바탕으로 다음 단어 가능성을 예측하며 텍스트 생성'], ['LLM', '많은 학습 자료와 큰 규모의 모델을 사용하는 대형 언어 모델']].map(([concept, role]) => <div key={concept} className="grid gap-1 bg-white p-4 sm:grid-cols-[10rem_1fr]"><strong>{concept}</strong><span className="text-sm leading-6">{role}</span></div>)}</div></div>
    </div>
    <p className="mt-5 text-sm leading-6" role="status">{priorStepsComplete ? '✓ STEP 1~6 완료 기록이 있습니다.' : 'Lesson 완료에는 STEP 1~6 완료도 필요합니다. 이 STEP의 남은 조건은 위 안내에서 확인하세요.'}</p>
    <Button className="mt-7" disabled={!ready} onClick={props.onComplete}><Sparkles size={18} /> STEP 7 활동 완료</Button>
    {props.isComplete ? <div className="mt-8 rounded-3xl bg-slate-950 p-6 text-white sm:p-8"><p className="text-sm font-black tracking-[0.16em] text-emerald-300">DEEP LEARNING LAB · 12 / 12</p><h3 className="mt-2 text-2xl font-black">딥러닝의 원리, 실제 모델 실습과 주요 활용 분야를 모두 연결했습니다.</h3><p className="mt-3 leading-7 text-slate-300">아래의 기존 전체 차시 버튼을 이용해 원하는 활동을 다시 볼 수 있습니다.</p></div> : null}
  </StepFrame>
}
