import { FREQUENCY_ROWS } from './lesson12Data'
import { formatProbability, frequenciesToProbabilities } from './languageModelMath'

export default function FrequencyProbabilityTable({ answers, totalAnswers, submitted, onChoose, onTotalChange, onSubmit, onRetry }: { answers: Record<string, string>; totalAnswers: Record<string, string>; submitted: readonly string[]; onChoose: (context: string, word: string) => void; onTotalChange: (context: string, value: string) => void; onSubmit: (context: string) => void; onRetry: (context: string) => void }) {
  return <div className="grid gap-5">{FREQUENCY_ROWS.map((row, rowIndex) => {
    const probabilities = frequenciesToProbabilities(row.candidates)
    const selected = answers[row.context]
    const isSubmitted = submitted.includes(row.context)
    const correct = isSubmitted && selected === row.answer
    const total = row.candidates.reduce((sum, item) => sum + item.count, 0)
    const totalCorrect = Number(totalAnswers[row.context]?.trim()) === total
    const probabilitySum = probabilities.reduce((sum, candidate) => sum + candidate.probability, 0)
    const guided = rowIndex === 0
    const showCalculation = guided || totalCorrect
    const statusId = `frequency-status-${row.context}`
    return <section key={row.context} className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5" aria-labelledby={`frequency-${row.context}`}>
      <h3 id={`frequency-${row.context}`} className="font-black">{guided ? '안내 풀이' : '독립 계산'} · 앞 단어: {row.context}</h3>
      {guided ? <p className="mt-3 rounded-xl bg-cyan-50 p-3 text-sm leading-6">분모: {row.candidates.map((item) => item.count).join(' + ')} = {total}회. 각 후보의 횟수를 이 합으로 나눕니다. “{row.answer}”는 횟수가 가장 커서 확률도 가장 높습니다. 아래 계산과 비교하세요.</p> : <p className="mt-3 text-sm leading-6">세 후보의 횟수를 더하세요. 합을 맞히면 확률이 표시됩니다.</p>}
      <label className="mt-4 block min-w-0 text-sm font-bold">① 빈도 합<input value={totalAnswers[row.context] ?? ''} inputMode="numeric" onChange={(event) => onTotalChange(row.context, event.target.value)} aria-describedby={statusId} className="mt-2 min-h-11 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 font-mono sm:max-w-48" /></label>
      {totalAnswers[row.context] ? <p className={`mt-2 text-sm font-bold ${totalCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>{totalCorrect ? `✓ 후보 빈도 합은 ${total}입니다.` : '✕ 세 후보의 빈도를 모두 더해 보세요.'}</p> : null}
      <p className="mt-4 text-sm font-bold">② 최고 확률 후보</p>
      <div className="mt-2 grid gap-3 sm:grid-cols-3">{probabilities.map((candidate) => <button key={candidate.word} type="button" disabled={isSubmitted} aria-pressed={selected === candidate.word} onClick={() => onChoose(row.context, candidate.word)} className={`min-h-16 min-w-0 rounded-xl border p-3 text-left disabled:cursor-not-allowed ${selected === candidate.word ? 'border-cyan-700 bg-cyan-50' : 'border-slate-300 bg-white'}`}>
        <span className="flex flex-wrap justify-between gap-2 text-sm font-black"><span>{selected === candidate.word ? '✓ ' : ''}{candidate.word}</span>{showCalculation ? <span>{formatProbability(candidate.probability)}</span> : null}</span>
        <span className="mt-1 block text-sm">함께 나온 횟수: {candidate.count}회</span>
        {showCalculation && guided ? <span className="mt-2 block rounded-lg bg-white p-2 text-sm leading-6">분자 {candidate.count}회 ÷ 분모 {total}회<br />→ 비율 {candidate.probability.toFixed(4)}<br />→ 확률 {formatProbability(candidate.probability)}</span> : null}
        {showCalculation ? <span className="mt-2 block h-3 overflow-hidden rounded-full bg-slate-200"><span className="block h-full rounded-full bg-cyan-600" style={{ width: `${candidate.probability * 100}%` }} /></span> : null}
      </button>)}</div>
      {showCalculation ? <details className="mt-3 text-sm"><summary className="min-h-11 cursor-pointer py-2 font-bold">보충 · 나눗셈과 반올림</summary>{!guided && <ul className="mb-3 space-y-2">{probabilities.map(candidate => <li key={candidate.word}>{candidate.word}: 분자 {candidate.count}회 ÷ 분모 {total}회 = 비율 {candidate.probability.toFixed(4)} → {formatProbability(candidate.probability)}</li>)}</ul>}<p className="break-words">내부 확률 합: {probabilitySum.toFixed(12)} · 전체 100.0%. 각 후보의 표시를 반올림하면 합에 작은 차이가 날 수 있습니다.</p></details> : null}
      <p id={statusId} className="mt-3 rounded-xl bg-white p-3 text-sm leading-6" role="status">{!totalCorrect ? '남은 조건: 후보 빈도 합을 올바르게 입력하세요.' : !selected ? '합은 맞았습니다. 후보를 선택해 주세요.' : !isSubmitted ? `“${selected}”를 선택했습니다. 아래 행 답 제출을 눌러 판단을 확인하세요.` : correct ? '이 행의 합과 후보 판단을 마쳤습니다.' : '오답 다시 풀기를 누른 뒤 후보를 바꾸어 제출하세요.'}</p>
      {!isSubmitted ? <button type="button" disabled={!selected || !totalCorrect} onClick={() => onSubmit(row.context)} aria-describedby={statusId} className="mt-3 min-h-11 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white disabled:bg-slate-300">“{row.context}” 행 답 제출</button> : <><p className={`mt-3 text-sm font-bold ${correct ? 'text-emerald-700' : 'text-rose-700'}`} role="status">{correct ? `✓ ${row.context} 다음에는 “${row.answer}”가 가장 자주 나왔습니다.` : '✕ 빈도와 계산된 확률이 가장 큰 후보를 다시 선택하세요.'}</p>{!correct ? <button type="button" onClick={() => onRetry(row.context)} className="mt-3 min-h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold">오답 다시 풀기</button> : null}</>}
    </section>
  })}</div>
}
