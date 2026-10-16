import { CONTEXT_EXAMPLES } from './lesson12Data'

export function ActivityRequirements({ items }: { items: Array<[string, boolean]> }) {
  const remaining = items.filter(([, done]) => !done)
  return <aside className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6" aria-label="이번 활동의 완료 조건">
    <p className="font-black">할 일 · {items.length - remaining.length}/{items.length} 완료</p>
    <p className="mt-2 text-slate-600" aria-live="polite">{remaining.length ? `남은 조건: ${remaining.map(([label]) => label).join(' · ')}` : '필수 활동을 마쳤습니다. 아래 STEP 활동 완료 버튼을 누르세요.'}</p>
    <p className="mt-1 text-xs text-slate-500">설명 그림의 이전·다음·다시 보기는 답안이나 완료 기록을 바꾸지 않습니다.</p>
  </aside>
}

export function ContextDistance({ example, relationCorrect = false }: { example: typeof CONTEXT_EXAMPLES[number]; relationCorrect?: boolean }) {
  const text = example.text
  const firstEnd = example.id === 'long' ? text.indexOf('. ') + 2 : text.indexOf('밥을')
  const finalStart = example.id === 'long' ? text.indexOf('집에 돌아온') : firstEnd
  const parts = [text.slice(0, firstEnd), text.slice(firstEnd, finalStart), text.slice(finalStart)]
  const reveal = example.id === 'short' || relationCorrect
  return <figure className="mt-5 rounded-2xl border border-slate-200 p-4 sm:p-5" aria-label={`${example.title}의 문장 순서 비교`}>
    <figcaption className="font-black">같은 질문으로 비교 · 왜 밥을 먹었을까요?</figcaption>
    <p className="mt-2 text-sm leading-6">앞의 이유와 마지막 행동을 연결해 보세요. 긴 문장에서는 그 사이에 다른 사건들이 더 들어 있습니다.</p>
    <ol className="mt-4 grid gap-3 md:grid-cols-3">{parts.map((part, index) => <li key={index} className={`min-w-0 rounded-xl border-2 p-3 ${reveal && index !== 1 ? 'border-violet-400 bg-violet-50' : 'border-slate-300 bg-slate-50'}`}>
      <h4 className="text-sm font-black">{['① 앞부분', '② 사이에 있는 내용', '③ 마지막 행동'][index]}</h4>
      <p className="mt-2 break-keep text-sm leading-7">{part || '바로 마지막 행동으로 이어집니다.'}</p>
      {index < 2 ? <p className="mt-2 text-sm font-bold">↓ 문장 순서</p> : null}
    </li>)}</ol>
    {reveal ? <div className="mt-3 rounded-xl border-2 border-violet-300 bg-violet-50 p-3 text-sm leading-6"><p className="font-black">① {example.reason} → ③ {example.ending}</p><p>{parts[1] ? '②의 여러 사건을 사이에 두고 앞의 이유를 마지막 행동에 연결합니다.' : '사이에 다른 사건 없이 이유와 행동이 이어집니다.'}</p></div> : <p className="mt-3 rounded-xl bg-white p-3 text-sm leading-6">위 화살표는 읽는 순서만 나타냅니다. 긴 문장에서는 어떤 정보가 마지막 행동의 이유가 되는지 아래에서 판단하세요. 맞힌 뒤 이유와 행동의 관계를 표시합니다.</p>}
    <p className="mt-3 text-xs leading-5 text-slate-600">그림의 간격은 설명용이며 RNN의 기억량이나 성능 수치가 아닙니다. 기본 RNN은 멀리 떨어진 문맥을 충분히 활용하기 어려울 수 있지만 항상 앞 정보를 잊는 것은 아닙니다.</p>
  </figure>
}

function Character({ name }: { name: string }) {
  const cat = name === '고양이'
  const animal = cat || name === '강아지'
  return <div className="min-w-0 rounded-xl border border-slate-300 bg-white p-3 text-center">
    <svg viewBox="0 0 100 90" className="mx-auto h-20 w-24 max-w-full" aria-hidden="true">
      {animal ? <><path d={cat ? 'M22 40 L18 9 L43 28 M57 28 L82 9 L78 40' : 'M28 22 Q1 7 10 57 L27 49 M72 22 Q99 7 90 57 L73 49'} fill="#c4b5fd" stroke="#5b21b6" strokeWidth="3" /><ellipse cx="50" cy="48" rx="31" ry="29" fill="#ede9fe" stroke="#5b21b6" strokeWidth="3" /><circle cx="38" cy="43" r="3" /><circle cx="62" cy="43" r="3" /><path d="M46 55 L54 55 L50 60 Z M50 60 Q42 68 38 61 M50 60 Q58 68 62 61" fill="none" stroke="#5b21b6" strokeWidth="2" /></> : <><circle cx="50" cy="27" r="18" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="3" /><path d="M18 84 Q18 50 50 50 Q82 50 82 84 Z" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="3" /><circle cx="44" cy="25" r="2" /><circle cx="56" cy="25" r="2" /><path d="M44 35 Q50 39 56 35" fill="none" stroke="#1d4ed8" strokeWidth="2" /></>}
    </svg><strong>{name}</strong>
  </div>
}

// Only mount after a guided example or a correct pair; hidden answers are not in the SVG/ARIA tree.
export function SentenceRelation({ subject, object, action }: { subject: string; object: string; action: string }) {
  return <figure className="mt-3 break-keep rounded-xl bg-cyan-50 p-3" aria-label={`${subject}에서 ${object}로 향하는 ${action} 행동`}>
    <div className="grid grid-cols-2 gap-3"><div><Character name={subject} /><p className="mt-2 text-center text-sm font-bold">① 행동하는 쪽</p></div><div><Character name={object} /><p className="mt-2 text-center text-sm font-bold">② 행동을 받는 쪽</p></div></div>
    <svg viewBox="0 0 240 40" className="h-10 w-full" aria-hidden="true"><path d="M56 4 V22 H180 M171 14 L181 22 L171 30 M184 4 V12" fill="none" stroke="#0e7490" strokeWidth="3" /></svg>
    <figcaption className="text-center text-sm font-bold">① {subject} → {action} 행동 → ② {object}</figcaption>
  </figure>
}

export function LanguageConceptRelations() {
  return <figure className="rounded-2xl border border-slate-300 p-4 sm:p-5" aria-label="생성형 AI의 범주, 언어 모델의 규모와 기반 구조 관계">
    <figcaption className="mb-4 text-sm font-bold">종류·규모·구조의 관계 · 네 가지 처리 단계가 아닙니다</figcaption>
    <div className="rounded-xl border-2 border-cyan-500 bg-cyan-50 p-4"><h4 className="font-black">생성형 AI · 넓은 기술 범주</h4><p className="mt-2 text-sm leading-6">텍스트·이미지·음성 등 새로운 콘텐츠를 만듭니다.</p>
      <div className="mt-4 rounded-xl border-2 border-violet-400 bg-white p-4"><h4 className="font-black">이 중 언어 생성에 사용하는 모델</h4><p className="mt-2 text-sm leading-6"><strong>생성형 언어 모델</strong>: 언어 모델은 문맥을 바탕으로 다음 토큰의 가능성을 예측할 수 있습니다. 생성형 언어 모델은 이를 활용해 언어를 이어 만듭니다.</p></div>
    </div>
    <div className="mt-4 grid gap-3 md:grid-cols-2"><div className="rounded-xl border-2 border-emerald-400 bg-emerald-50 p-4"><h4 className="font-black">규모 관점 · LLM</h4><p className="mt-2 text-sm leading-6">많은 학습 자료와 큰 규모의 모델을 사용하는 대형 언어 모델(Large Language Model)입니다. 언어 생성에 활용될 수 있지만 생성형 AI 전체와 같은 뜻은 아닙니다.</p></div><div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-4"><h4 className="font-black">구조 관점 · Transformer</h4><p className="mt-2 text-sm leading-6">Attention을 활용하는 신경망 구조입니다.</p><p className="mt-2 border-t border-amber-300 pt-2 text-sm font-bold">Transformer ─ 기반 구조로 사용 → 많은 LLM</p></div></div>
  </figure>
}
