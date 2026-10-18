import { useEffect, useState, type ReactNode } from 'react'
import { Button } from '../../components/ui/Button'
import { ExplainCursor, Panels, Question, StudyFrame, useStudy, type FinalStudyProps, type StudyStepProps } from '../lesson11/StudyActivity'
import { ATTENTION_EXAMPLES, CONTEXT_EXAMPLES, FREQUENCY_ROWS, GENERATION_PHASES, NEXT_WORD_STAGES, NLP_DEVELOPMENT, RNN_WORDS, SEQUENCE_SENTENCES, lesson12StepTitles } from './lesson12Data'
import { formatProbability, frequenciesToProbabilities } from './languageModelMath'
import { frequencyTotal, generationBranches, independentFrequency, lesson12Groups } from './studyTasks'
import AttentionCombinationGuide from './AttentionCombinationGuide'

const box = 'rounded-xl border border-slate-300 bg-slate-50 p-4 leading-7'
function Frame({ step, purpose, children, ...props }: StudyStepProps & { step: number; purpose: string; children: ReactNode; completionAllowed?: boolean; onRevealTask?: (id: string) => void }) {
  return <StudyFrame {...props} step={step} title={lesson12StepTitles[step - 1]} purpose={purpose} ids={lesson12Groups[step - 1]}>{children}</StudyFrame>
}
function Questions({ step }: { step: number }) { return <>{lesson12Groups[step - 1].map((id) => <Question key={id} id={id} />)}</> }

export function Lesson12Step1(props: StudyStepProps) {
  const { correct } = useStudy()
  return <Frame {...props} step={1} purpose="단어의 등장 횟수만 같으면 뜻도 같을까요? 두 문장을 비교하여 누가 누구에게 행동하는지 판단해 보세요.">
    {['order-love', 'order-chase'].map((taskId, pair) => <section key={taskId} className={`${box} grid gap-4`}><div className="grid gap-3 sm:grid-cols-2">{SEQUENCE_SENTENCES.slice(pair * 2, pair * 2 + 2).map((item, i) => <figure key={item.id} className="rounded-lg border bg-white p-3"><figcaption className="font-bold">{pair === 0 && i === 0 ? '안내 예시' : '비교 문장'} · {item.sentence}</figcaption>{pair === 0 && i === 0 || correct(taskId) ? <div className="mt-3 flex flex-wrap items-center justify-center gap-3 rounded-lg bg-indigo-50 p-3"><strong>{item.subject}</strong><span>— {item.action} →</span><strong>{item.object}</strong></div> : <p className="mt-3 text-sm">주체·대상을 판단한 뒤 관계 그림을 확인합니다.</p>}</figure>)}</div><Question id={taskId} /></section>)}
    <p className="leading-7">번호나 빈도만으로는 누가 행동하는지 충분히 나타내기 어렵습니다. 단어의 순서와 조사, 서로의 관계를 함께 처리해야 합니다.</p>
  </Frame>
}

export function Lesson12Step2(props: StudyStepProps) {
  const [cursor, setCursor] = useState(0)
  const previous = RNN_WORDS.slice(0, cursor).map((item) => item.word).join(' ')
  return <Frame {...props} step={2} purpose="앞말을 매번 버리지 않으려면 무엇을 전달해야 할까요? 전체 흐름에서 한 단계를 골라 이전 정보와 현재 입력의 관계를 살펴보세요.">
    <p className="leading-7"><strong>순환 신경망(RNN)</strong>은 현재 입력과 이전 <strong>은닉 상태</strong>로 새 상태를 계산해 다음 처리에 전달합니다. 은닉 상태는 앞의 정보를 반영한 숫자 묶음으로, 낱말을 따로 볼 때 놓치는 관계를 활용하도록 돕습니다.</p>
    <figure className={box}><figcaption className="font-bold">전체 연결 · 너는 → 노래를 → 못 → 부르지 → 않아</figcaption>
      <ol className="my-4 grid gap-2 sm:grid-cols-5">{RNN_WORDS.map((item, i) => <li key={item.word}><button className={`min-h-16 w-full rounded-lg border p-3 ${cursor === i ? 'border-indigo-700 bg-indigo-100 font-bold' : 'bg-white'}`} aria-pressed={cursor === i} onClick={() => setCursor(i)}>{i + 1}. {item.word}<span className="block text-sm">상태 h{i} → h{i + 1}</span></button></li>)}</ol>
      <div className="rounded-xl border-2 border-indigo-500 bg-white p-4" aria-live="polite"><p><strong>이전 상태 h{cursor}</strong>: {previous ? `“${previous}”까지의 정보를 반영` : '아직 읽은 단어가 없는 시작 상태'}</p><p className="my-2">＋ <strong>현재 입력: {RNN_WORDS[cursor].word}</strong>의 숫자 표현</p><p>↓ 함께 계산</p><p><strong>새 상태 h{cursor + 1}</strong> → {cursor < 4 ? `다음 입력 “${RNN_WORDS[cursor + 1].word}” 처리에 전달` : '문장 전체의 해석에 활용'}</p></div>
      <ExplainCursor index={cursor} count={RNN_WORDS.length} onChange={setCursor} nextLabel="다음 단어 처리" previousLabel="앞 단어 처리" restartLabel="첫 단어부터 관찰" />
      <p className="mt-3 text-sm">h는 상태를 구별하는 표시입니다. 이 문장형 설명은 교육용 요약이며 실제 수치 상태를 계산한 결과가 아닙니다. 문장 중간에서는 전체 뜻을 확정하지 않습니다.</p>
      <div className="mt-4 grid gap-4"><Questions step={2} /></div>
    </figure>
  </Frame>
}

export function Lesson12Step3(props: StudyStepProps) {
  const { correct } = useStudy()
  return <Frame {...props} step={3} purpose="마지막 행동의 이유가 멀리 앞에 있다면 어떨까요? 짧은 문장과 긴 문장에서 밥을 먹은 까닭을 비교해 보세요.">
    <div className="grid items-start gap-4 md:grid-cols-2">{CONTEXT_EXAMPLES.map((item, i) => <figure key={item.id} className={box}><figcaption className="font-bold">{item.title} · {i === 0 ? '안내' : '독립 판단'}</figcaption><p className="mt-3">{item.text}</p><div className="mt-3 grid gap-2"><div className="rounded-lg border bg-white p-3">앞부분: {i === 0 || correct('long-evidence') ? item.reason : '어떤 정보가 마지막 행동의 이유일까요?'}</div><div className="border-l-4 border-dashed border-slate-400 py-3 pl-3">{i === 0 ? '곧 이어서' : `그 사이: ${item.middle}`}</div><div className="rounded-lg border bg-white p-3">마지막 행동: {item.ending}</div></div>{i === 1 && <div className="mt-4"><Question id="long-evidence" /></div>}</figure>)}</div>
    <p className="leading-7">기본 RNN은 상태를 거듭 전달하는 동안 멀리 앞의 정보를 충분히 유지하기 어려울 수 있습니다. 긴 문장을 전혀 처리하지 못하거나 반드시 잊는다는 뜻은 아닙니다. 필요한 앞 정보를 따로 참고하는 방식이 도움이 됩니다.</p>
  </Frame>
}

export function Lesson12Step4(props: StudyStepProps) {
  const [query, setQuery] = useState(0)
  const { correct } = useStudy()
  const example = ATTENTION_EXAMPLES[query === 0 ? 0 : 1]
  const taskIds = ['attention-umbrella', 'attention-she', 'attention-book']
  const taskId = taskIds[query]
  const words = query === 0 ? [...example.words] : ['철수', '영희', '책', '건넸다', '그녀', '고맙다', '말했다']
  const related: readonly string[] = query === 2 ? ['책', '건넸다'] : example.important
  const solved = correct(taskId)
  return <Frame {...props} step={4} onRevealTask={(id) => { const position = taskIds.indexOf(id); if (position >= 0) setQuery(position) }} purpose="안내 사례에서 기준에 따라 정보 조합이 바뀌는 모습을 본 뒤, 다른 문장에서 필요한 관계를 판단해 제출하세요.">
    <p className="leading-7"><strong>어텐션(Attention)</strong>은 현재 처리와 관련된 정보에 서로 다른 비중을 주어 조합하는 방식입니다. 멀리 있는 단서도 참고할 수 있어, 모든 정보를 하나의 전달 상태에만 의존하는 어려움을 줄이는 데 도움이 됩니다.</p>
    <AttentionCombinationGuide />
    <h3 className="font-bold">직접 적용 · 다른 문장에서 관계와 근거 판단하기</h3>
    <p className="leading-7">세 기준의 질문에 답하고, 마지막에 비중을 주는 이유를 제출하세요. 정답 후에는 판단 근거와 조합 그림을 같은 자리에서 비교할 수 있습니다.</p>
    <div role="group" aria-label="어텐션 기준 선택" className="grid gap-2 sm:grid-cols-3">{['우산 · 편 이유', '그녀 · 가리키는 사람', '책 · 어떤 행동'].map((label, i) => <Button key={label} variant={i === query ? 'primary' : 'secondary'} aria-pressed={i === query} onClick={() => setQuery(i)}>{label}{correct(taskIds[i]) ? ' ✓' : ''}</Button>)}</div>
    <figure className={box}><figcaption className="font-bold">{example.sentence}</figcaption>
      <div className="mt-3 flex flex-wrap gap-2">{words.map((word) => <span key={word} className={`rounded-lg border px-3 py-2 ${solved && related.includes(word) ? 'border-indigo-500 bg-indigo-50 font-bold' : 'bg-white'}`}>{word}</span>)}</div>
      <div className="mt-4">{taskIds.map((id, i) => <div key={id} hidden={query !== i}><Question id={id} /></div>)}</div>
      {solved ? <div className="mt-3 rounded-lg border border-indigo-300 bg-white p-3 leading-7">
        <h4 className="font-bold">제출한 판단과 정보 조합</h4>
        <p className="mt-2"><strong>더 크게 반영: {related.join(' ＋ ')}</strong> ＋ 함께 참고: {words.filter((word) => !related.includes(word)).join(' · ')}</p>
        <p className="my-2 font-bold">↓ 모든 단어를 남겨 두고, 기여 정도를 달리하여 조합</p>
        <p>{query === 0 ? '비가 내려서 ＋ 우산을 펼친 행동 → 우산을 편 이유를 판단하는 정보' : query === 1 ? '책을 받은 영희 ＋ 뒤의 고맙다는 말 → 그녀가 가리키는 사람을 판단하는 정보' : '책 ＋ 건넸다는 행동 → 물건에 무엇을 했는지 판단하는 정보'}</p>
        <p className="mt-2 text-sm">관계를 설명한 교육용 그림입니다. 실제 모델의 점수나 계산 결과가 아니며, 비중이 작은 단어를 삭제하지 않습니다.</p>
      </div> : <p className="mt-3 text-sm">정답 제출 전에는 관계의 강조와 조합 결과를 공개하지 않습니다.</p>}
    </figure>
    <Question id="attention-combine" />
  </Frame>
}

export function Lesson12Step5(props: StudyStepProps) {
  const [cursor, setCursor] = useState(2)
  const word = RNN_WORDS[cursor].word
  return <Frame {...props} step={5} purpose="같은 문장을 두 구조가 어떻게 다루는지 비교하세요. 어텐션이라는 방식과 이를 활용하는 트랜스포머 구조를 구별합니다.">
    <p className="leading-7"><strong>트랜스포머(Transformer)</strong>는 어텐션을 핵심으로 활용하는 신경망 구조입니다. RNN이 앞 상태를 다음 처리로 전달하는 것과 달리, 입력 위치 사이의 관계를 함께 계산해 반영할 수 있습니다. 두 구조 모두 숫자로 표현된 입력을 사용합니다.</p>
    <figure className={box}><figcaption className="font-bold">같은 입력 · 단어를 골라 두 그림의 위치를 비교하세요.</figcaption><div className="my-3 flex flex-wrap gap-2">{RNN_WORDS.map((item, i) => <button key={item.word} type="button" onClick={() => setCursor(i)} aria-pressed={i === cursor} className={`min-h-12 rounded-lg border px-3 ${cursor === i ? 'border-indigo-600 bg-indigo-100 font-bold' : 'bg-white'}`}>{i + 1}. {item.word}</button>)}</div>
      <div className="grid gap-4 md:grid-cols-2"><section className="rounded-xl border bg-white p-4"><h3 className="font-bold">RNN · 상태 전달</h3><div className="mt-3 grid gap-2"><p className="rounded border p-2">이전 상태 h{cursor}</p><p>↓ ＋ 현재 단어 <strong>{word}</strong></p><p className="rounded border border-indigo-600 bg-indigo-50 p-2">새 상태 h{cursor + 1}</p><p>↓ 다음 단어 처리</p></div></section><section className="rounded-xl border bg-white p-4"><h3 className="font-bold">트랜스포머 · 관계 반영</h3><p className="mt-3 rounded border border-indigo-600 bg-indigo-50 p-2">현재 위치 {cursor + 1}: <strong>{word}</strong></p><p className="my-2">↕ 어텐션으로 관계를 반영</p><div className="flex flex-wrap gap-2">{RNN_WORDS.map((item, i) => <span key={item.word} className="rounded border p-2">{i + 1}. {item.word}</span>)}</div><p className="mt-2 text-sm">예: 못 ↔ 않아의 관계를 함께 참고합니다. 연결은 구조 설명용이며 실제 계산 결과가 아닙니다.</p></section></div>
      <ExplainCursor index={cursor} count={RNN_WORDS.length} onChange={setCursor} nextLabel="다음 위치 비교" previousLabel="이전 위치 비교" restartLabel="첫 위치 비교" />
      <p className="mt-4">위치 정보가 없으면 같은 단어 묶음의 다른 순서를 구별하기 어렵습니다. 입력 위치를 병렬로 처리할 수 있다는 말은 <strong>아직 고르지 않은 미래 문장을 한 번에 완성한다</strong>는 뜻이 아닙니다.</p>
      <div className="mt-4 grid gap-4"><Questions step={5} /></div>
    </figure>
    <aside className={box}><h3 className="font-bold">자연어 처리 기술의 발전</h3><p className="mt-3">{NLP_DEVELOPMENT.join(' → ')}</p><p>교과서의 발전 과정입니다. 모든 문장이 이 기술들을 순서대로 통과하는 처리 과정은 아닙니다.</p></aside>
  </Frame>
}

function ProbabilityRows({ candidates, total }: { candidates: readonly { word: string; count: number }[]; total?: number }) {
  const probabilities = frequenciesToProbabilities(candidates)
  return <div className="mt-3 grid gap-3">{probabilities.map((candidate) => <div key={candidate.word} className="rounded-lg border bg-white p-3"><div className="flex flex-wrap justify-between gap-2"><strong>{candidate.word} · {candidate.count}회</strong>{total !== undefined && <span>{candidate.count}/{total} ≈ {candidate.probability.toFixed(3)} ({formatProbability(candidate.probability)})</span>}</div>{total !== undefined && <div className="mt-2 h-3 rounded bg-slate-100"><div className="h-3 rounded bg-indigo-500" style={{ width: `${candidate.probability * 100}%` }} /></div>}</div>)}</div>
}

function GenerateSentence({ phase, onPhaseChange }: { phase: number; onPhaseChange: (phase: number) => void }) {
  const { answers, change, submit, correct } = useStudy()
  const first = answers['generation-first']?.value ?? ''
  const firstReady = correct('generation-first')
  const branch = generationBranches[first]
  const next = answers['generation-next']?.value ?? ''
  const nextReady = firstReady && correct('generation-next') && next.startsWith(`${first} `)
  const second = phase === 1 && firstReady && Boolean(branch)
  const candidates = second ? branch.candidates : NEXT_WORD_STAGES.first.candidates
  const selected = second ? next.slice(first.length + 1) : first
  const submitted = second ? nextReady : firstReady
  const context = second ? `세훈이는 ${first}` : '세훈이는'
  const currentId = second ? 'generation-next' : 'generation-first'
  return <section className={box} aria-label="문장 이어 만들기"><h3 className="font-bold">같은 후보판으로 문장 이어 만들기</h3>
    <p className="mt-2">빈도표와 별개의 고정 교육용 후보입니다. 낮은 확률도 고를 수 있습니다. 버튼으로 직접 선택하며 무작위로 추출하지 않습니다.</p>
    <div role="group" aria-label="생성 단계 다시 보기" className="my-3 flex flex-wrap gap-2"><Button variant={second ? 'secondary' : 'primary'} aria-pressed={!second} onClick={() => onPhaseChange(0)}>① 첫 토큰 {firstReady ? '✓' : ''}</Button><Button variant={second ? 'primary' : 'secondary'} aria-pressed={second} disabled={!firstReady} onClick={() => onPhaseChange(1)}>② 다음 토큰 {nextReady ? '✓' : ''}</Button></div>
    <p className="rounded-xl border-2 border-indigo-600 bg-indigo-50 p-3 text-lg"><strong>현재 예측의 입력 문맥: {context}</strong></p>
    <fieldset id={`task-${currentId}`} className="mt-4"><legend className="font-bold">{second ? '② 갱신된 문맥의 다음 후보' : '① 현재 문맥의 첫 후보'} · 선택 → 토큰 추가</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">{candidates.map((candidate) => <Button key={candidate.word} variant={selected === candidate.word ? 'primary' : 'secondary'} aria-pressed={selected === candidate.word} onClick={() => {
        if (second) change('generation-next', `${first} ${candidate.word}`)
        else { change('generation-first', candidate.word); change('generation-next', '') }
      }}><span>{candidate.word}<span className="block">{formatProbability(candidate.probability)}</span></span></Button>)}</div>
      {second && <p className="mt-3 text-sm">{branch.note}</p>}
      {second && first === '우유를' && <p className="mt-2">‘마신다 60%’는 이 문맥의 후보 가능성이지 사실성이나 모델 정확도 60%가 아닙니다.</p>}
      <div className="mt-3 flex flex-wrap items-center gap-3"><Button disabled={!selected} onClick={() => { submit(currentId); if (!second) onPhaseChange(1) }}>{second ? '선택한 토큰으로 문장 완성' : '선택한 토큰 추가 → 다음 후보'}</Button><span aria-live="polite">{!selected ? '후보를 먼저 골라 주세요.' : submitted ? '제출한 선택입니다.' : `선택: ${selected} · 추가 버튼을 눌러 주세요.`}</span></div>
    </fieldset>
    <div className="mt-4 rounded-xl bg-white p-3 leading-8" aria-live="polite"><h4 className="font-bold">마지막으로 제출한 결과 · {nextReady ? '두 번째 토큰까지' : firstReady ? '첫 토큰까지' : '아직 없음'}</h4><p>선택 전 문맥: <strong>{nextReady ? `세훈이는 ${first}` : '세훈이는'}</strong></p><p>방금 추가한 토큰: <strong>{nextReady ? next.slice(first.length + 1) : firstReady ? first : '아직 제출하지 않았습니다.'}</strong></p><p className="text-lg">새 문맥: <strong>{nextReady ? `세훈이는 ${next}.` : firstReady ? `세훈이는 ${first}` : '세훈이는'}</strong></p></div>
    <p className="mt-3">{nextReady ? '두 토큰을 추가했습니다. 실제 생성은 새 문맥으로 다음 예측을 반복할 수 있습니다. 이 예시는 여기서 끝납니다.' : firstReady ? '첫 선택을 새 문맥에 넣었습니다. 같은 후보판의 새 후보를 골라 문장을 완성하세요.' : '첫 토큰을 제출하면 모든 제공 후보에서 다음 후보로 이어집니다.'}</p>
  </section>
}

export function Lesson12Step6(props: StudyStepProps) {
  const { correct } = useStudy()
  const [generationPhase, setGenerationPhase] = useState(0)
  const guide = FREQUENCY_ROWS[0]
  const guideTotal = guide.candidates.reduce((sum, candidate) => sum + candidate.count, 0)
  const reveal = correct('probability-total') && correct('probability-best')
  return <Frame {...props} step={6} onRevealTask={(id) => { if (id === 'generation-first') setGenerationPhase(0); if (id === 'generation-next') setGenerationPhase(correct('generation-first') ? 1 : 0) }} purpose="함께 나온 횟수에서 후보의 가능성을 구한 뒤, 후보를 골라 문맥을 늘려 보세요. 계산 답과 후보 선택을 제출하고 문장을 끝까지 이어갑니다.">
    <p className="leading-7"><strong>후보 확률 = 해당 후보 빈도 ÷ 현재 행의 후보 빈도 합</strong><br />빈도는 함께 등장한 횟수입니다. 분자는 그 후보의 횟수, 분모는 비교하는 세 후보의 횟수 합입니다. 실제 언어 모델은 단순 횟수뿐 아니라 학습한 문맥 관계를 이용합니다.</p>
    <figure className={box}><figcaption className="font-bold">안내 · “{guide.context}” 다음 후보</figcaption><ProbabilityRows candidates={guide.candidates} total={guideTotal} /><p className="mt-3">횟수를 같은 분모 {guideTotal}으로 나눠 가능성을 비교합니다. 확률의 합은 1입니다. 화면 소수·백분율은 반올림 표시입니다.</p></figure>
    <section className={box}><h3 className="font-bold">직접 적용 · “{independentFrequency.context}” 다음 후보</h3><ProbabilityRows candidates={independentFrequency.candidates} total={reveal ? frequencyTotal : undefined} /><p className="mt-3">빈도 합 입력 → 최고 확률 후보 선택 → 각각 제출</p>
    <div className="mt-4 grid gap-4 sm:grid-cols-2"><Question id="probability-total" /><Question id="probability-best" /></div>
    {correct('probability-total') && !correct('probability-best') && <p role="status" className="rounded-xl bg-amber-50 p-3">합은 맞았습니다. 최고 확률 후보를 선택하고 제출해 주세요.</p>}
    </section>
    <GenerateSentence phase={generationPhase} onPhaseChange={setGenerationPhase} />
    <Question id="probability-meaning" />
  </Frame>
}

export function Lesson12Step7(props: FinalStudyProps) {
  const { correct } = useStudy()
  const ready = lesson12Groups.flat().every(correct) && props.priorStepsComplete
  useEffect(() => { props.onCompletionReadyChange(props.active && ready) }, [props.active, props.onCompletionReadyChange, ready])
  return <Frame {...props} completionAllowed={ready} step={7} purpose="직접 이어 만든 문장으로 언어 모델의 역할을 정리하고, 실제 챗봇 사례에서 구조·규모·학습과 사용을 구별해 보세요.">
    <p className="leading-7"><strong>생성형 언어 모델</strong>은 문맥을 바탕으로 다음 토큰의 가능성을 예측하며 글을 만듭니다. <strong>대형 언어 모델(LLM)</strong>은 매우 큰 규모의 텍스트를 학습한 큰 언어 모델입니다. 이름이 달라도 사실 확인을 대신해 주지는 않습니다.</p>
    <figure className={box}><figcaption className="font-bold">교과서의 문장 생성 네 과정 · 학습 후 사용하는 과정</figcaption><ol className="mt-3 grid gap-3 sm:grid-cols-2">{GENERATION_PHASES.map((phase, i) => <li key={phase.title} className="rounded-xl border bg-white p-3"><strong>{i + 1}. {phase.title}</strong><p className="mt-2">{phase.detail}</p></li>)}</ol><p className="mt-3 text-sm">앱은 띄어쓰기 단위와 고정 후보를 사용하고 학생이 직접 선택합니다. 실제 형태소 분석·임베딩·모델 계산·확률적 추출을 실행한 것은 아닙니다.</p></figure>
    <Panels items={[{ title: '범주 · 생성형 AI', text: '새로운 콘텐츠를 만드는 넓은 범주입니다. 텍스트를 생성하는 언어 모델 외에 이미지·음성 생성도 있습니다.' }, { title: '구조 · 트랜스포머', text: '많은 LLM의 기반 구조입니다. 어텐션은 이 구조가 활용하는 정보 반영 방식이지 LLM과 같은 이름이 아닙니다.' }, { title: '학습할 때', text: '여러 자료에서 예측 오차 등을 바탕으로 가중치를 조정해 언어 패턴을 익힙니다.' }, { title: '사용할 때 · 추론', text: '학습된 가중치로 입력 문맥의 다음 후보를 예측하고 선택한 토큰을 더하며 답변을 만듭니다.' }]} />
    <section className={`${box} grid gap-4`}><h3 className="font-bold">실제 챗봇에 적용해 구별하기</h3><Questions step={7} /></section>
    {!ready && <p className="text-sm leading-6">차시 완료에는 앞 STEP의 현재 활동 정답과 STEP 완료도 필요합니다. 과거 완료 기록은 지우지 않습니다.</p>}
    <p className="leading-7">이미지 분류, 음성 인식, 언어 생성은 서로 다른 문제를 해결합니다. 어떤 모델을 쓰든 입력·결과의 의미와 한계를 함께 확인하세요.</p>
  </Frame>
}
