import { SEQUENCE_SENTENCES } from './lesson12Data'

export default function SequenceMeaningActivity({ assignments, onChoose }: { assignments: Record<string, string>; onChoose: (key: string, value: string) => void }) {
  return <div className="grid gap-4 md:grid-cols-2">{SEQUENCE_SENTENCES.map((item) => {
    const subjectKey = `${item.id}:subject`
    const objectKey = `${item.id}:object`
    const subjectCorrect = assignments[subjectKey] === item.subject
    const objectCorrect = assignments[objectKey] === item.object
    const answered = assignments[subjectKey] && assignments[objectKey]
    return <fieldset key={item.id} className="rounded-2xl border border-slate-200 p-5"><legend className="px-2 font-black">{item.sentence}</legend>{([{ key: subjectKey, label: item.subjectLabel, answer: item.subject }, { key: objectKey, label: item.objectLabel, answer: item.object }]).map((role) => <div key={role.key} className="mt-4"><p className="text-sm font-bold">{role.label}</p><div className="mt-2 grid grid-cols-2 gap-2">{item.choices.map((choice) => <button key={choice} type="button" aria-pressed={assignments[role.key] === choice} onClick={() => onChoose(role.key, choice)} className={`min-h-11 rounded-xl border font-bold ${assignments[role.key] === choice ? 'border-violet-600 bg-violet-50' : 'border-slate-300 bg-white'}`}>{choice}</button>)}</div></div>)}{answered ? <p className={`mt-4 text-sm font-bold ${subjectCorrect && objectCorrect ? 'text-emerald-700' : 'text-rose-700'}`} role="status">{subjectCorrect && objectCorrect ? `✓ ${item.action} 행동의 주체와 대상을 정확히 구분했습니다.` : '✕ 조사와 단어 순서를 다시 확인하세요.'}</p> : null}</fieldset>
  })}</div>
}

