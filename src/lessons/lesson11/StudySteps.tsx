import { useEffect, useState, type ReactNode } from 'react'
import { WORDS, FREQUENCY_DOCUMENTS, lesson11StepTitles } from './lesson11Data'
import { countWords, createOneHot, createWordIndex, frequencyRatio, tokenizeText } from './textRepresentation'
import EmbeddingVisualizer from './EmbeddingVisualizer'
import EmbeddingTraining from './EmbeddingTraining'
import { ExplainCursor, Panels, Question, StudyFrame, useStudy, type FinalStudyProps, type StudyStepProps } from './StudyActivity'
import { applicationText, article, articleTokens, articleCounts, lesson11Groups } from './studyTasks'

function Frame({ step, purpose, children, ...props }: StudyStepProps & { step: number; purpose: string; children: ReactNode; completionAllowed?: boolean; onRevealTask?: (id: string) => void }) {
  return <StudyFrame {...props} step={step} title={lesson11StepTitles[step - 1]} purpose={purpose} ids={lesson11Groups[step - 1]}>{children}</StudyFrame>
}
function Questions({ step }: { step: number }) { return <>{lesson11Groups[step - 1].map((id) => <Question key={id} id={id} />)}</> }
const box = 'rounded-xl border border-slate-300 bg-slate-50 p-4 leading-7'

export function Lesson11Step1(props: StudyStepProps) {
  return <Frame {...props} step={1} purpose="같은 맛집 요청에서 소리를 글로 바꾸는 일, 뜻을 파악하는 일, 답변을 쓰는 일을 구분해 보세요.">
    <p className="leading-7"><strong>자연어</strong>는 우리가 평소 쓰는 말과 글입니다. <strong>자연어 처리</strong>는 이 언어를 기계가 이해하고 생성하도록 하는 기술입니다. 글자를 알아보는 것만으로는 무엇을 원하는지 알기 어려워, 의미·문맥 처리가 필요합니다.</p>
    <figure className="rounded-2xl bg-indigo-50 p-4 sm:p-5">
      <figcaption className="mb-3 font-bold">“근처 맛집 추천해 줘.” · 서비스 원리 설명 예시</figcaption>
      <Panels items={[{ title: '말로 한 요청', text: '말소리 → 음성 인식 → 요청 텍스트' }, { title: '직접 쓴 요청', text: '글로 쓴 요청 → 요청 텍스트' }]} />
      <div className="my-3 text-center font-bold">↓ 같은 텍스트를 처리합니다.</div>
      <Panels items={[{ title: '언어 이해 · 원하는 일 파악', text: '“내 주변 식당을 추천해 달라”는 의도를 파악합니다.' }, { title: '언어 생성 · 답변 문장 작성', text: '확인한 음식점 정보를 바탕으로 “이 식당을 추천합니다.”라는 답변을 씁니다.' }]} />
      <p className="mt-3 text-sm leading-6">실제 검색·모델 실행 결과가 아닙니다. 한 서비스는 이해와 생성을 함께 사용할 수 있습니다.</p>
      <div className="mt-4 grid gap-4"><Questions step={1} /></div>
    </figure>
  </Frame>
}

export function Lesson11Step2(props: StudyStepProps) {
  const [cursor, setCursor] = useState(0)
  const tokens = tokenizeText(WORDS.join(' '))
  const entries = [...createWordIndex(tokens)]
  const selected = entries[cursor]
  return <Frame {...props} step={2} purpose="신경망이 계산할 수 있도록 글을 숫자로 표현합니다. 같은 단어가 문장·목록·번호에서 어떻게 이어지는지 살펴보고 번호를 찾아보세요.">
    <p className="leading-7"><strong>토큰</strong>은 처리할 텍스트의 단위입니다. 여기서는 띄어쓰기 기준으로 나눕니다. <strong>형태소</strong>는 뜻을 가진 가장 작은 말의 단위로, ‘친구는’을 ‘친구/는’으로 나누는 방식과는 구별합니다.</p>
    <figure className={box}>
      <figcaption className="font-bold">문장 → 띄어쓰기 단위 → 중복 없는 목록 → 인덱스</figcaption>
      <p className="my-3">{tokens.map((word, i) => <span key={i} className={`mr-2 inline-block rounded px-1 ${word === selected[0] ? 'bg-indigo-200 font-bold underline' : ''}`}>{word}</span>)}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{entries.map(([word, id]) => <button type="button" key={word} aria-pressed={id === cursor} onClick={() => setCursor(id)} className={`min-h-14 rounded-lg border p-2 ${id === cursor ? 'border-indigo-700 bg-indigo-50 font-bold' : 'bg-white'}`}>{word}<span className="block text-sm">인덱스 {id} · {id + 1}번째 칸</span></button>)}</div>
      <p className="mt-3" aria-live="polite"><strong>{selected[0]} → {selected[1]}</strong> · 목록에서 구별하는 번호입니다. 번호가 커도 뜻이나 중요도가 커지지는 않습니다.</p>
      <ExplainCursor index={cursor} count={entries.length} onChange={setCursor} nextLabel="다음 단어 대응 보기" previousLabel="앞 단어 대응 보기" restartLabel="첫 단어로 돌아가기" />
      <div className="mt-5 grid gap-4"><Questions step={2} /></div>
    </figure>
  </Frame>
}

export function Lesson11Step3(props: StudyStepProps) {
  const vector = createOneHot(WORDS, '좋은')
  return <Frame {...props} step={3} purpose="구별 번호를 ‘선택한 칸 표시’로 바꾸어 보세요. 안내와 다른 단어의 벡터를 직접 만들고 잘못된 표현을 고칩니다.">
    <p className="leading-7"><strong>벡터</strong>는 여러 숫자를 순서대로 묶은 표현입니다. 숫자 칸의 개수를 <strong>차원</strong>이라고 합니다. <strong>원-핫</strong>은 단어 목록의 각 자리에 칸을 두고 선택한 단어만 1, 나머지는 0으로 구별합니다.</p>
    <figure className={box}><figcaption className="font-bold">안내 풀이 · 좋은 → 인덱스 0 → 첫 칸만 1</figcaption>
      <div className="my-3 grid grid-cols-6 gap-1">{vector.map((value, i) => <div key={i} className={`rounded-lg border py-2 text-center ${value ? 'border-indigo-600 bg-indigo-100' : 'bg-white'}`}><span className="block text-xs">칸 {i + 1}</span><strong className="text-xl">{value}</strong></div>)}</div>
      <p>단어가 {WORDS.length}개라서 길이는 {vector.length}입니다. 인덱스는 0부터, 화면의 번째 칸은 1부터 셉니다.</p>
    </figure>
    <section className={`${box} grid gap-4`}><h3 className="font-bold">직접 만들고 오류 고치기</h3><p><strong>목록 순서:</strong> {WORDS.map((word, i) => `${i}: ${word}`).join(' · ')}. 같은 목록을 이용하되 안내와 다른 단어의 벡터를 만듭니다. 정답 제출 전에는 완성 벡터를 공개하지 않습니다.</p><Questions step={3} /></section>
  </Frame>
}

export function Lesson11Step4(props: StudyStepProps) {
  const [scene, setScene] = useState(0)
  return <Frame {...props} step={4} onRevealTask={(id) => setScene(id === 'embedding-relation-v3' ? 2 : 1)} purpose="숫자를 담는 방식, 숫자를 배우는 과정, 단어 사이의 관계를 구별해 보세요. 세 주제를 차례로 살펴보고 판단을 제출하세요.">
    <EmbeddingVisualizer
        activeScene={scene} onSceneChange={setScene}
        learning={<EmbeddingTraining><Question id="embedding-lookup-v3" /><Question id="embedding-learning-v3" /></EmbeddingTraining>}
        relationQuestion={<Question id="embedding-relation-v3" />}
    />
  </Frame>
}

export function Lesson11Step5(props: StudyStepProps) {
  const { correct } = useStudy()
  const [cursor, setCursor] = useState(0)
  const guide = tokenizeText(FREQUENCY_DOCUMENTS[0].text)
  const vocabulary = [...new Set(guide)]
  const counts = countWords(guide.slice(0, cursor + 1).join(' '), vocabulary)
  const full = countWords(guide.join(' '), vocabulary)
  const reveal = correct('article-count') && correct('article-ratio')
  return <Frame {...props} step={5} purpose="기사의 단어만으로 주제를 빠르게 추정할 수 있을까요? 안내 자료를 세어 보고, 다른 자료의 횟수·비율·주제와 근거를 제출하세요.">
    <p className="leading-7"><strong>빈도</strong>는 등장 횟수입니다. 관련 단어가 많이 나오는지 세면 간단한 기사 분류에 도움이 됩니다. 아래는 기사에서 핵심 단어만 남긴 교육용 자료입니다.</p>
    <figure className={box}><figcaption className="font-bold">안내 자료 · {FREQUENCY_DOCUMENTS[0].text}</figcaption>
      <div className="my-3 flex flex-wrap gap-2">{guide.map((word, i) => <span key={i} className={`rounded-lg border px-3 py-2 ${i === cursor ? 'bg-indigo-200 font-bold ring-2 ring-indigo-700' : 'bg-white'}`}>{i + 1}. {word}</span>)}</div>
      <p aria-live="polite">{cursor + 1}개까지 센 횟수: {vocabulary.map((word) => `${word} ${counts[word]}회`).join(' · ')}</p>
      <ExplainCursor index={cursor} count={guide.length} onChange={setCursor} nextLabel="다음 단어까지 세기" previousLabel="앞 단어까지 세기" restartLabel="첫 단어부터 세기" />
      <p className="mt-3">전체 풀이: 축구 {full['축구']}회 ÷ 전체 {guide.length}개 = {frequencyRatio(full['축구'], guide.length)} = {frequencyRatio(full['축구'], guide.length) * 100}%. 축구·경기·선수가 스포츠라는 주제의 근거입니다.</p>
    </figure>
    <section className={`${box} grid gap-4`}><h3 className="font-bold">다른 기사에 적용하기</h3><p className="text-lg">{article}</p><p>단어 비율 = 해당 단어 횟수(분자) ÷ 전체 토큰 수(분모). 비율은 주제일 확률이나 정확도가 아닙니다.</p>
    <Questions step={5} />
    {reveal && <div className={box} role="status"><h3 className="font-bold">계산 후 빈도표</h3><table className="mt-2 w-full text-left"><thead><tr><th>단어</th><th>횟수</th><th>전체 {articleTokens.length}개 중 비율</th></tr></thead><tbody>{Object.entries(articleCounts).map(([word, count]) => <tr key={word}><th className="py-2">{word}</th><td>{count}</td><td>{count}/{articleTokens.length} = {(frequencyRatio(count, articleTokens.length) * 100).toFixed(1)}%</td></tr>)}</tbody></table></div>}
    <p className="leading-7">글이 길면 횟수도 커질 수 있어 비율로 비교할 수 있습니다. 다만 자주 나온 말이 항상 핵심은 아니며, 횟수만으로는 단어 순서·부정·같은 단어의 다른 뜻을 놓칠 수 있습니다.</p></section>
  </Frame>
}

export function Lesson11Step6(props: StudyStepProps) {
  return <Frame {...props} step={6} purpose="횟수가 같아도 뜻이 달라집니다. 표현의 역할과 주변 단서를 이용해 의미를 판단해 보세요.">
    <Panels items={[{ title: '단어가 같아도 역할이 바뀝니다.', text: '학생이 선생님을 도왔다. ↔ 선생님이 학생을 도왔다.' }, { title: '핵심 단어만 세면 놓칩니다.', text: '좋다 ↔ 좋지 않다 / 배를 먹었다 ↔ 배를 탔다 / 눈이 온다 ↔ 눈이 아프다' }]} />
    <figure className={box}><figcaption className="font-bold">같은 대화에서 무엇을 살필까요? · 개념 설명 예시</figcaption><p className="my-3">“어디에 갔나요?” — “영수는 서울에 갔어요.”</p>
      <Panels items={[
        { title: '① 형태소 분석 · 작은 뜻 단위', text: '영수/는, 서울/에처럼 이름과 조사를 구별합니다. 단순 띄어쓰기와 다릅니다.' },
        { title: '② 구문 분석 · 문장 속 역할', text: '영수는 간 사람, 서울은 간 곳입니다. 단어 사이의 문법 관계를 살핍니다.' },
        { title: '③ 의미·개체명 분석 · 뜻과 대상', text: '갔다는 이동의 뜻이며, 영수는 사람 이름이고 서울은 장소 이름입니다.' },
        { title: '④ 담화·의도 분석 · 앞뒤 대화', text: '이 말은 방문 장소를 묻는 앞 질문에 답하고 있습니다.' },
      ]} /><p className="mt-3 text-sm">실제 분석기를 실행한 결과가 아닙니다. 네 관점은 횟수만으로 알기 어려운 관계와 의도를 살피도록 돕습니다.</p><div className="mt-4 grid gap-4"><Questions step={6} /></div></figure>
  </Frame>
}

export function Lesson11Step7(props: FinalStudyProps) {
  const { correct } = useStudy()
  const ready = lesson11Groups.flat().every(correct) && props.priorStepsComplete
  useEffect(() => { props.onCompletionReadyChange(props.active && ready) }, [props.active, props.onCompletionReadyChange, ready])
  return <Frame {...props} completionAllowed={ready} step={7} purpose="새 글에서 숫자로 표현할 정보와 문맥으로 판단할 정보를 구별해 보세요. 앞의 활동과 이 적용 과제를 끝내면 차시를 완료할 수 있습니다.">
    <section className={`${box} grid gap-4`}><blockquote className="rounded-xl bg-indigo-50 p-4 text-lg leading-8">{applicationText}</blockquote>
    <p>띄어쓰기 기준으로 나누고 앞에서부터 중복 없이 등록하세요. <strong>번호·횟수는 계산을 위한 표현</strong>이고, <strong>승리 여부는 부정과 문맥을 이용한 해석</strong>입니다.</p>
    <Questions step={7} /></section>
    {!ready && <p className="text-sm leading-6 text-slate-600">차시 완료에는 STEP 1~6의 현재 활동 정답과 각 STEP 완료가 필요합니다. 과거 완료 기록은 별도로 유지됩니다.</p>}
    <p className="leading-7">다음 차시에서는 앞말의 정보를 다음 처리에 활용하는 RNN과 중요한 관계를 반영하는 어텐션을 살펴봅니다.</p>
  </Frame>
}
