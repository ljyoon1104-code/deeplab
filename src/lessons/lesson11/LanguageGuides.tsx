import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { FREQUENCY_DOCUMENTS, FREQUENCY_WORDS, SEMANTIC_STAGES, WORDS } from './lesson11Data'
import { countWords, createOneHot, createWordIndex, frequencyRatio, tokenizeText } from './textRepresentation'

function GuideControls({ label, stage, last, onChange }: { label: string; stage: number; last: number; onChange: (stage: number) => void }) {
  return <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label={label}>
    <Button variant="secondary" disabled={stage === 0} onClick={() => onChange(stage - 1)}>이전</Button>
    <Button disabled={stage === last} onClick={() => onChange(stage + 1)}>다음</Button>
    <Button variant="secondary" onClick={() => onChange(0)}>다시 보기</Button>
  </div>
}

export function RequestPaths() {
  return <figure className="mt-6 rounded-2xl border border-cyan-200 p-4">
    <figcaption className="font-black">같은 요청, 두 입력 경로 · 개념 설명용 그림</figcaption>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-cyan-300 bg-cyan-50 p-4"><h3 className="font-black">① 말로 한 요청</h3><p className="mt-2 leading-7">“근처 맛집 추천해 줘.”</p><p className="mt-2 rounded-lg bg-white p-3 text-sm"><strong>↓ 음성 인식</strong><br />말소리를 글자로 바꿉니다.</p></div>
      <div className="rounded-xl border border-violet-300 bg-violet-50 p-4"><h3 className="font-black">② 직접 쓴 요청</h3><p className="mt-2 leading-7">“근처 맛집 추천해 줘.”</p><p className="mt-2 rounded-lg bg-white p-3 text-sm"><strong>↓ 이미 텍스트</strong><br />음성 인식을 거치지 않습니다.</p></div>
    </div>
    <div className="mx-5 grid grid-cols-2 text-center text-xl font-black text-cyan-800" aria-hidden="true"><span>↓</span><span>↓</span></div>
    <div className="rounded-xl border-2 border-cyan-500 bg-slate-950 p-4 text-center text-white"><h3 className="text-sm font-bold text-cyan-200">두 경로의 공통 텍스트</h3><p className="mt-2 font-black">근처 맛집 추천해 줘.</p></div>
    <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-2" aria-label="자연어 처리의 전체 지도">
      <li className="rounded-xl bg-cyan-50 p-3"><strong>① 처리 단위로 나누기 → ② 숫자로 표현하기</strong><p className="mt-1">Lesson 11에서 주로 살펴봅니다.</p></li>
      <li className="rounded-xl bg-violet-50 p-3"><strong>③ 문맥과 관계 처리 → ④ 분류·이해·생성</strong><p className="mt-1">Lesson 12에서 순서·관계와 언어 생성을 이어 봅니다.</p></li>
    </ol>
    <p className="mt-3 text-sm leading-6">이 요청은 주변 식당 추천을 원하는 말로 이해하고 답변을 만들 수 있습니다. 인덱스·원-핫·임베딩·빈도는 목적에 따라 쓰는 방법이며, 모두 차례로 거쳐야 하는 단계는 아닙니다.</p>
    <p className="mt-2 text-sm leading-6 text-slate-600">서비스에 따라 음성 인식, 정보 검색, 답변을 소리로 바꾸는 음성 합성이 더해질 수 있습니다. 모두 필수는 아니며, 이 그림은 실제 검색·모델 실행 결과가 아닙니다.</p>
  </figure>
}

export function UnderstandingGeneration() {
  const [selected, setSelected] = useState(0)
  const actions = [
    { title: '요청 이해', action: '무엇을 요청하는지 파악', result: '주변 식당을 추천해 달라는 의도', note: '입력의 의미를 판단합니다. 새 답변을 쓰는 동작과 구별하세요.' },
    { title: '답변 생성', action: '필요한 내용을 답변 문장으로 작성', result: '“원하는 음식 종류를 알려 주시면 추천을 도와드릴게요.”', note: '문맥에 맞는 답변 표현을 만듭니다. 식당 정보 조회나 실제 언어 모델 실행 결과가 아닙니다.' },
  ]
  return <figure className="rounded-2xl border border-cyan-200 p-4 sm:p-5" aria-label="같은 질문의 이해와 생성 비교">
    <figcaption className="font-black">같은 질문에서 서로 다른 두 동작</figcaption>
    <p className="mt-3 rounded-xl bg-slate-950 p-4 font-bold text-white">공통 입력: “근처 맛집 추천해 줘.”</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">{actions.map((item, index) => <div key={item.title} className={`min-w-0 rounded-xl border-2 p-3 transition-colors motion-reduce:transition-none ${selected === index ? 'border-violet-600 bg-violet-50' : 'border-slate-200 bg-slate-50'}`}>
      <button type="button" aria-pressed={selected === index} onClick={() => setSelected(index)} className="min-h-11 w-full rounded-lg border border-slate-300 bg-white p-2 font-black">{selected === index ? '✓ ' : ''}{item.title} 살펴보기</button>
      <dl className="mt-3 space-y-3 text-sm leading-6"><div><dt className="font-bold">동작</dt><dd>{item.action}</dd></div><div><dt className="font-bold">결과 예</dt><dd className="rounded-lg bg-white p-2">{item.result}</dd></div></dl>
    </div>)}</div>
    <p className="mt-3 text-sm leading-6" aria-live="polite"><strong>{actions[selected].title}: </strong>{actions[selected].note}</p>
    <p className="mt-2 text-sm leading-6">실제 서비스에서는 이해와 생성을 함께 사용할 수 있습니다. 아래에서는 각 사례의 중심 동작을 분류합니다. 이 그림의 선택은 활동 답안을 바꾸지 않습니다.</p>
  </figure>
}

export function ActivityRequirements({ items }: { items: Array<[string, boolean]> }) {
  const remaining = items.filter(([, done]) => !done)
  return <aside className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6" aria-label="이번 활동의 완료 조건">
    <p className="font-black">할 일 · {items.filter(([, done]) => done).length}/{items.length} 완료</p>
    <p className="mt-2 text-slate-600" aria-live="polite">{remaining.length ? `남은 조건: ${remaining.map(([label]) => label).join(' · ')}` : '필수 활동을 마쳤습니다. 아래 STEP 활동 완료 버튼을 누르세요.'}</p>
    <p className="mt-1 text-xs text-slate-500">설명 그림의 조작은 답안이나 완료 기록을 바꾸지 않습니다.</p>
  </aside>
}

export function TokenPath() {
  const [stage, setStage] = useState(0)
  const [selectedWord, setSelectedWord] = useState<string>(WORDS[0])
  const sentence = WORDS.join(' ')
  const tokens = tokenizeText(sentence)
  const indexMap = createWordIndex(tokens)
  const entries = [...indexMap.entries()]
  const titles = ['문장', '나눈 단위: 토큰', '중복 없는 단어 목록', '단어별 인덱스']
  const notes = [
    '신경망은 숫자를 계산합니다. 문장의 단어를 숫자로 표현하면 모델의 입력으로 사용할 수 있습니다.',
    '이 활동에서는 띄어쓰기로 나눈 단위를 토큰으로 씁니다. 뜻을 가진 최소 단위인 형태소를 찾는 분석과는 다릅니다.',
    '처음 나온 순서대로 단어를 한 번씩 등록합니다. 이 예문에는 중복이 없지만, 같은 단어가 다시 나오면 기존 목록과 번호를 사용합니다.',
    `“${selectedWord}” → 인덱스 ${indexMap.get(selectedWord)} = 목록의 ${indexMap.get(selectedWord)! + 1}번째 칸. 인덱스는 0부터 세는 구별 번호이며, 크기가 중요도나 의미의 크기를 나타내지 않습니다.`,
  ]
  return <section className="mt-5 rounded-2xl border border-cyan-200 p-4 sm:p-5" aria-label="문장에서 인덱스까지 안내 그림">
    <h3 className="font-black">같은 예문을 숫자로 표현하기 · 과정 자세히 보기</h3>
    <p className="mt-2 text-sm leading-6">첫 안내는 “좋은”입니다. 단어를 고르면 네 표현에서 같은 단어에 테두리와 ✓가 표시됩니다. 설명 이동과 단어 선택은 아래 연결 활동의 답을 바꾸지 않습니다.</p>
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label="인덱스 설명의 단어 선택">{entries.map(([word]) => <button key={word} type="button" aria-pressed={selectedWord === word} onClick={() => setSelectedWord(word)} className={`min-h-11 rounded-lg border-2 p-2 font-bold ${selectedWord === word ? 'border-violet-600 bg-violet-50' : 'border-slate-200 bg-white'}`}>{selectedWord === word ? '✓ ' : ''}{word}</button>)}</div>
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      {titles.map((title, index) => <div key={title} className={`min-w-0 rounded-xl border-2 p-3 transition-colors motion-reduce:transition-none ${stage === index ? 'border-violet-600 bg-violet-50' : 'border-slate-200 bg-slate-50'}`}>
        <h4 className="font-bold">{index + 1}. {title}{stage === index ? ' · 현재 설명' : ''}</h4>
        <div className={`mt-2 flex flex-wrap ${index === 0 ? 'gap-x-1' : 'gap-2'}`}>{(index < 2 ? tokens : entries.map(([word]) => word)).map((word, tokenIndex) => <span key={`${word}-${tokenIndex}`} className={`rounded-lg border-2 px-2 py-1 text-sm ${selectedWord === word ? 'border-violet-600 bg-white font-black' : 'border-transparent'}`}>{selectedWord === word ? '✓ ' : ''}{word}{index === 3 && stage === 3 ? ` → ${indexMap.get(word)}` : ''}</span>)}</div>
      </div>)}
    </div>
    <p className="mt-4 min-h-24 rounded-xl bg-cyan-50 p-3 text-sm leading-6" aria-live="polite"><strong>{stage + 1}/4 · {titles[stage]}: </strong>{notes[stage]}</p>
    <GuideControls label="토큰과 인덱스 설명 조작" stage={stage} last={3} onChange={setStage} />
  </section>
}

export function OneHotGuide({ word }: { word: string }) {
  const [stage, setStage] = useState(0)
  const vector = createOneHot(WORDS, word)
  const index = vector.indexOf(1)
  const notes = [
    `STEP 3과 같은 목록에서 안내 단어 “${word}”를 찾습니다. 아래 독립 문항과는 다른 단어입니다.`,
    `“${word}”의 인덱스는 ${index}입니다. 0부터 센 번호이므로 화면에서는 ${index + 1}번째 칸입니다.`,
    `전체 목록 크기와 같은 ${vector.length}칸을 준비합니다. 아직 값을 넣지 않은 빈 칸입니다.`,
    `안내 단어의 칸만 1, 나머지는 0으로 채웠습니다. ${vector.length}개의 숫자를 순서대로 묶은 ${vector.length}차원 벡터입니다.`,
  ]
  return <section className="mt-5 rounded-xl border border-cyan-200 p-4" aria-label="독립 문항과 다른 단어의 원-핫 안내">
    <h3 className="font-black">안내 풀이 · “{word}”의 인덱스와 원-핫</h3>
    <p className="mt-2 text-sm leading-6">목록의 어느 단어인지 구별하려고 해당 칸만 1, 나머지는 0으로 표시합니다. 1은 확률이나 중요도가 아닙니다. 벡터 길이는 목록 크기이고, 차원은 숫자의 개수입니다.</p>
    <p className="mt-3 rounded-lg bg-cyan-50 p-3 font-bold">안내 단어: {word}{stage >= 1 ? ` → 인덱스 ${index} · ${index + 1}번째 칸` : ''}</p>
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{WORDS.map((item, position) => <div key={item} className={`min-w-0 rounded-lg border-2 p-3 text-center transition-colors motion-reduce:transition-none ${item === word ? 'border-violet-600 bg-violet-50' : 'border-slate-200'}`}>
      <span className="block text-sm font-bold">{item === word ? '✓ ' : ''}{item}</span>
      <span className="mt-2 block min-h-8 font-mono text-xl font-black">{stage === 3 ? vector[position] : stage === 2 ? '□' : '—'}</span>
    </div>)}</div>
    <p className="mt-3 min-h-20 text-sm leading-6" aria-live="polite">{stage + 1}/4 · {notes[stage]}</p>
    <GuideControls label="원-핫 안내 설명 조작" stage={stage} last={3} onChange={setStage} />
  </section>
}

export function FrequencyGuide() {
  const [cursor, setCursor] = useState(0)
  const document = FREQUENCY_DOCUMENTS[1]
  const tokens = tokenizeText(document.text)
  const word = '음식'
  const count = countWords(document.text, [word])[word]
  const ratio = frequencyRatio(count, tokens.length)
  const inspected = tokens.slice(0, Math.min(cursor, tokens.length))
  const runningCounts = countWords(inspected.join(' '), FREQUENCY_WORDS)
  const counted = cursor >= tokens.length
  const ratioShown = cursor > tokens.length
  const topicShown = cursor > tokens.length + 1
  return <section className="mt-5 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 sm:p-5" aria-label="빈도 계산 안내 풀이">
    <h3 className="font-black">안내 풀이 · 문서 2의 “{word}”</h3>
    <p className="mt-2 text-sm leading-6">‘다음’으로 단어를 하나씩 셉니다. 같은 문장의 빈도표가 바뀌고, 마지막에는 전체 토큰 수로 나눈 비율과 주제 해석을 봅니다. 자동 분석 모델이 아닌 실제 단어 세기 계산입니다.</p>
    <div className="mt-3 flex flex-wrap gap-2">{tokens.map((token, index) => <span key={index} className={`rounded-lg border-2 px-3 py-2 transition-colors motion-reduce:transition-none ${index === cursor - 1 ? 'border-violet-600 bg-white font-black' : 'border-cyan-200'}`}>{index + 1}. {token}{index === cursor - 1 ? ' ← 현재 단어' : index < cursor ? ' ✓ 셈' : ''}</span>)}</div>
    <div className="mt-3 grid grid-cols-3 gap-2" aria-label="안내 문장의 누적 빈도표">{FREQUENCY_WORDS.map((token) => <div key={token} className={`rounded-lg border-2 p-2 text-center ${tokens[cursor - 1] === token ? 'border-violet-600 bg-white' : 'border-cyan-100 bg-white'}`}><span className="block text-sm">{token}</span><strong className="font-mono">{runningCounts[token]}회</strong></div>)}</div>
    <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">{[['찾을 단어', word], ['분자 · 해당 단어 횟수', `${runningCounts[word]}회${counted ? ' · 최종' : ' · 세는 중'}`], ['분모 · 전체 토큰 수', `${tokens.length}개`], ['빈도 비율', ratioShown ? `${count} ÷ ${tokens.length} = ${ratio} (${ratio * 100}%)` : '단어를 모두 센 뒤 확인']].map(([label, value]) => <div key={label} className="min-w-0 rounded-xl bg-white p-3"><dt>{label}</dt><dd className="mt-1 font-bold">{value}</dd></div>)}</dl>
    <p className="mt-3 min-h-20 text-sm leading-6" aria-live="polite">{topicShown ? '주제 해석: 요리·음식·맛이 함께 나오므로 음식·요리와 관련된 문서로 판단할 수 있습니다. 빈도표만으로 문장 전체 뜻이 확정되는 것은 아닙니다.' : ratioShown ? `“${word}” ${count}회 ÷ 전체 ${tokens.length}개 = ${ratio}. 이 글에서 해당 단어가 차지하는 비율이지, 음식 문서일 확률이나 모델 정확도가 아닙니다.` : cursor === 0 ? '아직 단어를 세기 전입니다. 다음 버튼으로 첫 토큰부터 살펴보세요.' : `현재까지 ${inspected.length}개 토큰을 셌습니다. “${tokens[cursor - 1]}”의 누적 횟수는 ${runningCounts[tokens[cursor - 1]]}회입니다.${counted ? ' 다음에는 비율을 계산합니다.' : ''}`}</p>
    <GuideControls label="빈도 안내 설명 조작" stage={cursor} last={tokens.length + 2} onChange={setCursor} />
    <p className="mt-3 text-sm leading-6">긴 글은 횟수만 커질 수 있으므로 전체 토큰 수도 함께 봅니다. 비율로 비교해도 단어 순서나 부정의 뜻까지 알 수 있는 것은 아닙니다. 아래에서는 문서 1의 다른 단어를 직접 계산하세요.</p>
  </section>
}

export function SemanticGuide() {
  const [stage, setStage] = useState(0)
  const examples = [
    { units: ['사과', '를', '먹', '는다'], relation: '어떤 단위로 나눌까요?', note: '“사과를 먹는다”를 작은 의미·문법 단위로 살펴봅니다. STEP 3의 띄어쓰기 분리와는 다릅니다.' },
    { units: ['사과를 · 먹는 대상', '→', '먹는다 · 행동'], relation: '누가 무엇을 했으며, 말들이 어떻게 연결될까요?', note: '누가 무엇을 하는지 문장 안의 문법적 관계를 봅니다. 이 짧은 예문에는 행동의 주체가 직접 적혀 있지 않습니다.' },
    { units: ['사과', '↔ 먹는다', '과일의 뜻'], relation: '어떤 뜻이며, 무엇을 가리킬까요?', note: '“먹는다”와 함께 쓰인 사과는 과일입니다. 주체와 장소를 밝힌 “민수가 서울에서 사과를 먹는다”에서는 민수는 사람 이름, 서울은 장소 이름입니다. 이렇게 이름이 가리키는 대상을 구분하는 것이 개체명 분석입니다.' },
    { units: ['앞뒤 대화·상황', '↔ 사과를 먹는다', '의도 판단'], relation: '앞뒤 상황에서 어떤 의도로 말했을까요?', note: '“지금 무엇을 하니?”에 대한 “사과를 먹는다”는 현재 행동을 알려 주는 답입니다. 같은 말도 “왜 지금 통화하기 어렵니?”에 대한 답이면 통화가 어려운 이유를 전하는 말일 수 있습니다. 앞 질문과 상황을 함께 봅니다.' },
  ]
  return <section className="mt-4 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 sm:p-5" aria-label="같은 예문의 의미 분석 설명">
    <h3 className="font-black">의미론적 접근 방식 · 교과서 기본 과정</h3>
    <p className="mt-3 rounded-xl bg-white p-3 font-bold">공통 안내 예문: 사과를 먹는다.</p>
    <ol className="mt-3 grid gap-2 sm:grid-cols-2">{SEMANTIC_STAGES.map((item, index) => <li key={item.title} className={`rounded-xl border-2 p-3 ${stage === index ? 'border-violet-600 bg-white font-bold' : 'border-cyan-200'}`}>{index + 1}. {item.title}{stage === index ? ' · 현재' : ''}</li>)}</ol>
    <div className="mt-4 rounded-xl bg-white p-4" aria-live="polite"><p className="text-sm leading-6">{SEMANTIC_STAGES[stage].description}</p><div className="my-3 flex flex-wrap gap-2">{examples[stage].units.map((unit) => <span key={unit} className="rounded-lg border-2 border-violet-300 bg-violet-50 p-2 font-bold">{unit}</span>)}</div><h4 className="font-black">{examples[stage].relation}</h4><p className="mt-2 text-sm leading-6">{examples[stage].note}</p></div>
    <GuideControls label="의미 분석 설명 조작" stage={stage} last={3} onChange={setStage} />
    <details className="mt-4 text-sm leading-6"><summary className="min-h-11 cursor-pointer py-2 font-bold">기존 교과서 예시와 연결</summary><ul className="space-y-2">{SEMANTIC_STAGES.map((item) => <li key={item.title}><strong>{item.title}: </strong>{item.example}</li>)}</ul></details>
    <p className="mt-3 text-sm leading-6">언어 이해를 나누어 살펴본 개념 그림이며 실제 분석기 결과는 아닙니다. 모든 최신 모델이 네 개의 별도 프로그램을 이 순서대로 실행하는 것은 아닙니다.</p>
  </section>
}
