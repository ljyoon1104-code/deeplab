import { Button } from '../../components/ui/Button'
import { binaryCrossEntropy, categoricalCrossEntropy, squaredError } from '../lesson05/lossMath'
import { correct, type Answers, type Response, type Task } from './TeachingUI'
import { MathExpression } from './MathExpression'
import { examples, fmt, forward, mean, pairs, sum } from './network'
import { LossFormula } from './NetworkLab'

type GroupMode = 'output-meaning' | 'average-loss'
interface GroupedActivityProps {
  mode: GroupMode
  tasks: Task[]
  answers: Answers
  change: (id: string, response: Response) => void
}

const outputExamples = pairs.map(kind => ({ kind, values: forward(examples[kind]).p }))
const mseTargets = [3, 5, 7]
const msePredictions = [2, 4, 9]
const bceProbabilities = [.8, .1, .5]
const cceProbabilities = [[.7, .2, .1], [.9, .05, .05]]
const averageExamples = [
  {
    name: 'MSE',
    condition: '집값 자료의 정답과 예측을 비교합니다.',
    headings: ['정답 y', '예측 ŷ', '제곱오차'],
    losses: mseTargets.map((target, i) => squaredError(target, msePredictions[i])),
    rows: mseTargets.map((target, i) => [target, msePredictions[i], squaredError(target, msePredictions[i])]),
    rule: '각 자료의 제곱오차를 더하고 자료 수로 나눕니다.',
  },
  {
    name: 'BCE',
    condition: '세 자료 모두 정답 y=1입니다.',
    headings: ['자료', '예측 p', '손실 −ln(p)'],
    losses: bceProbabilities.map(p => binaryCrossEntropy(1, p)),
    rows: bceProbabilities.map((p, i) => [i + 1, p, binaryCrossEntropy(1, p)]),
    rule: '각 자료의 BCE를 더하고 자료 수로 나눕니다. 손실을 다시 제곱하지 않습니다.',
  },
  {
    name: 'CCE',
    condition: '두 자료 모두 정답 y=[1,0,0]이며, 첫 클래스의 확률로 손실을 구합니다.',
    headings: ['자료', '정답 클래스 확률', '개별 손실'],
    losses: cceProbabilities.map(p => categoricalCrossEntropy([1, 0, 0], p)),
    rows: cceProbabilities.map((p, i) => [i + 1, p[0], categoricalCrossEntropy([1, 0, 0], p)]),
    rule: '각 자료의 CCE를 더하고 자료 수로 나눕니다. 손실을 다시 제곱하지 않습니다.',
  },
]

export function GroupedActivity({ mode, tasks, answers, change }: GroupedActivityProps) {
  const missing = tasks.filter(task => !answers[task.id]?.value.trim())
  const solvedCount = tasks.filter(task => correct(task, answers[task.id])).length
  const allCorrect = solvedCount === tasks.length
  const hasSubmission = tasks.some(task => answers[task.id]?.submitted)
  const submit = () => {
    if (missing.length || allCorrect) return
    tasks.forEach(task => {
      const response = answers[task.id]
      if (response && !correct(task, response)) change(task.id, { ...response, submitted: true })
    })
  }

  return <section aria-label={mode === 'output-meaning' ? '세 출력값의 의미 함께 확인' : '세 평균 손실 함께 계산'} className="grid min-w-0 grid-cols-1 gap-4">
    <p className="leading-7">{mode === 'output-meaning' ? '각 예제의 출력값을 보고 의미를 선택한 뒤, 세 답안을 함께 제출하세요.' : '개별 손실의 합을 자료 수로 나누어 세 평균을 입력한 뒤 함께 제출하세요. 표시는 반올림하며 계산은 원래 값으로 이어집니다.'}</p>
    {mode === 'average-loss' && <div className="grid min-w-0 grid-cols-1 gap-2">
      <MathExpression formula={String.raw`\bar{L}=\frac{1}{N}\sum_{i=1}^{N}L_i`} />
      <p className="leading-7">N은 자료 수, L<sub>i</sub>는 i번째 자료의 손실입니다. Σ는 각 자료의 손실을 모두 더한다는 뜻입니다. MSE는 제곱오차를, BCE·CCE는 각 손실값을 평균냅니다.</p>
      <LossFormula kind="linear"/>
    </div>}
    <div className={`grid min-w-0 grid-cols-1 gap-4 ${mode === 'output-meaning' ? 'lg:grid-cols-3' : ''}`}>
      {tasks.map((task, index) => {
        const response = answers[task.id]
        const ok = correct(task, response)
        const feedbackId = `feedback-${task.id}`
        const output = outputExamples[index]
        const average = averageExamples[index]
        return <fieldset key={task.id} id={`task-${task.id}`} tabIndex={-1} className="grid min-w-0 grid-cols-1 content-start gap-3 rounded-xl border border-indigo-200 bg-white p-4 focus-visible:outline-3 focus-visible:outline-indigo-600">
          <legend className="max-w-full px-2 font-bold leading-7">{task.prompt}</legend>
          <div className={`grid min-w-0 grid-cols-1 gap-4 ${mode === 'average-loss' ? 'lg:grid-cols-2' : ''}`}>
          {mode === 'output-meaning' ? <div className="rounded-lg bg-slate-50 p-3 leading-7">
            <p className="font-bold">{['선형 출력', '시그모이드', '소프트맥스'][index]}</p>
            <p className="break-words">{output.kind === 'linear' ? `ŷ=${fmt(output.values[0])}` : output.kind === 'binary' ? `p=${fmt(output.values[0])}` : `p=[${output.values.map(fmt).join(', ')}]`}</p>
            {output.kind === 'multi' && <p>순서: 고양이·강아지·새<br/>출력값의 합={fmt(sum(output.values))}</p>}
          </div> : <div className="grid min-w-0 grid-cols-1 gap-3 leading-7">
            <p><strong>{average.name}</strong> · {average.condition}</p>
            {average.name === 'CCE' && <p className="break-words">예측 확률: {cceProbabilities.map((probabilities, i) => <span key={i} className="block">자료 {i + 1}: [{probabilities.map(fmt).join(', ')}]</span>)}</p>}
            <p className="text-slate-600">표가 넓으면 표 안에서 좌우로 이동하세요.</p>
            <div role="region" aria-label={`${average.name} 개별 손실표 가로 스크롤`} tabIndex={0} className="min-w-0 max-w-full overflow-x-auto rounded-lg focus-visible:outline-3 focus-visible:outline-indigo-600">
            <table className="w-full min-w-[360px] table-fixed border-collapse text-center">
              <thead><tr className="border-b border-slate-300">{average.headings.map(heading => <th key={heading} scope="col" className="break-words px-1 py-2">{heading}</th>)}</tr></thead>
              <tbody>{average.rows.map((row, rowIndex) => <tr key={rowIndex} className="border-b border-slate-200">{row.map((value, column) => <td key={column} className="whitespace-nowrap px-1 py-2 tabular-nums">{fmt(value)}</td>)}</tr>)}</tbody>
            </table>
            </div>
          </div>}
          <div className="grid min-w-0 grid-cols-1 content-start gap-3 leading-7">
          {mode === 'average-loss' && <><p>{average.rule}</p><div className="min-w-0 rounded-lg bg-slate-50 p-3"><p>평균 계산 {average.name === 'MSE' ? '· 정확한 개별 손실' : '· 개별 손실은 표시만 반올림'}</p><MathExpression formula={`\\bar{L}${average.name === 'MSE' ? '=' : '\\approx'}\\frac{${average.losses.map(fmt).join('+')}}{${average.losses.length}}${ok ? `${Number(fmt(mean(average.losses)))===mean(average.losses)?'=':'\\approx'}${fmt(mean(average.losses))}` : ''}`} /></div></>}
          {ok ? <p className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 leading-7"><strong>정답 제출 완료</strong><br/>제출한 답: {response?.value}</p> : task.options ? <label className="grid min-w-0 gap-2 leading-7">출력값의 의미
            <select aria-label={task.prompt} aria-describedby={feedbackId} className="min-h-12 w-full min-w-0 rounded-lg border border-slate-400 bg-white p-2" value={response?.value ?? ''} onChange={event => change(task.id, { value: event.target.value, submitted: false })}>
              <option value="">의미를 선택하세요</option>
              {task.options.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
            {response?.value && <span className="break-words">선택: {response.value}</span>}
          </label> : <label className="grid min-w-0 gap-2 leading-7">평균 손실 입력
            <input aria-label={task.prompt} aria-describedby={feedbackId} inputMode="decimal" className="min-h-12 w-full min-w-0 rounded-lg border border-slate-400 p-3" value={response?.value ?? ''} onChange={event => change(task.id, { value: event.target.value, submitted: false })}/>
          </label>}
          <p id={feedbackId} aria-live="polite" className={`rounded-lg p-3 leading-7 ${response?.submitted ? ok ? 'bg-emerald-50' : 'bg-rose-50' : 'text-slate-600'}`}>
            {response?.submitted ? ok ? task.explanation : `다시 확인해 보세요. ${task.hint} 이 행을 수정한 뒤 다시 제출하세요.` : response?.value ? '아래 함께 제출 버튼으로 확인하세요.' : '이 행의 답을 입력하거나 선택해 주세요.'}
          </p>
          </div>
          </div>
        </fieldset>
      })}
    </div>
    <div className="grid min-w-0 grid-cols-1 gap-2 rounded-xl border border-slate-300 bg-slate-50 p-4">
      <p aria-live="polite" className="leading-7">{allCorrect ? '모든 행을 맞혔습니다. 정답으로 제출한 답안은 유지됩니다.' : missing.length ? `아직 입력하지 않은 행: ${missing.map(task => tasks.indexOf(task) + 1).join(', ')}번. 모든 행의 답을 준비해 주세요.` : '모든 행에 답을 준비했습니다. 정답인 행은 유지하고 나머지 행을 함께 확인합니다.'}</p>
      <Button disabled={missing.length > 0 || allCorrect} onClick={submit}>{allCorrect ? '전체 정답 제출 완료' : hasSubmission ? '수정한 답안 다시 제출' : '세 답안 함께 제출'}</Button>
    </div>
  </section>
}
