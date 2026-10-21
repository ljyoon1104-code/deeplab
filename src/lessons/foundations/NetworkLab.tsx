import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { pinnedHeaderOffset } from '../../lib/viewportLayout'
import { backward, examples, fmt, forward, names, parameters, sum, update, type Pair } from './network'
import { Box, CalculationTable, correct, Derivative, NetworkPicture, Question, SceneNav, SymbolName, type Answers, type Response, type Row, type Task } from './TeachingUI'
import { BackpropPicture } from './BackpropPicture'
import { NetworkSymbols } from './NetworkSymbols'
import { MathExpression } from './MathExpression'

export type LabMode = 'forward' | 'loss' | 'training'
const numberTask = (id: string, prompt: string, answer: number, hint: string): Task => ({ id, prompt, answer, hint, explanation: answer === 0 ? '계산 결과는 0입니다. 반올림으로 작게 보이는 값과 구별하세요.' : `계산 결과는 약 ${fmt(answer)}입니다. 다음 계산에는 반올림 전 값을 사용합니다.` })
export function networkTasks(kind: Pair, mode: LabMode): Task[] {
  const n = examples[kind], f = forward(n), g = backward(n), next = update(n, g), after = forward(next)
  const prefix = `${mode}-${kind}-20261019-`
  const t = (id: string, prompt: string, value: number, hint: string) => numberTask(prefix+id, prompt, value, hint)
  if (mode === 'forward') return [
    t('h', '은닉 뉴런 H1의 ReLU 출력 h₁은?', f.h[0], '입력×가중치의 합에 편향을 더한 a₁부터 구하세요. ReLU는 양수는 그대로, 음수는 0입니다.'),
    t('z', kind === 'multi' ? '고양이 출력층 점수 z₁은?' : '출력층 점수 z는?', f.z[0], '출력층에는 원래 x가 아니라 은닉층 출력 h가 들어갑니다.'),
    kind === 'linear' ? { id: prefix+'identity-v2-p', prompt: '계산한 z와 최종 예측 ŷ가 같은 이유는?', options: ['선형 출력은 z를 그대로 전달하기 때문입니다.', '정답 y를 출력으로 복사하기 때문입니다.', '모든 출력 함수가 같은 숫자를 내기 때문입니다.'], answer: '선형 출력은 z를 그대로 전달하기 때문입니다.', hint: '선형 출력의 식 ŷ=z를 확인하세요.', explanation: '계산한 점수를 그대로 수치 예측으로 사용합니다. 확률로 바꾸는 것은 아닙니다.' } : t('p', kind === 'binary' ? '클래스 1의 확률 p는?' : '고양이 확률 p₁은?', f.p[0], kind === 'binary' ? '앱이 제공한 e의 계산값을 1/(1+e⁻ᶻ)에 넣으세요.' : '고양이의 exp 값을 세 exp 값의 합으로 나누세요.'),
  ]
  if (mode === 'loss') return [t('loss', `${names[kind]} 공통 예제의 손실 L은?`, f.loss, kind === 'linear' ? 'N=1이므로 (ŷ−y)²입니다. 1/2을 곱하지 않습니다.' : '이번 자료의 정답 위치에 준 확률의 자연로그에 −를 붙이세요.'),
    kind === 'linear'
      ? { id: prefix+'interpret-v2-meaning', prompt: '정답 2와 예측 1.3의 MSE가 나타내는 것은?', options: ['두 수의 차이를 제곱한 오차입니다.', '정답일 확률입니다.', '예측값 1.3 자체입니다.'], answer: '두 수의 차이를 제곱한 오차입니다.', hint: '데이터 하나의 MSE는 (ŷ−y)²입니다.', explanation: '차이의 방향 대신 크기를 제곱해 평가합니다. 수치 예측과 손실은 다른 값입니다.' }
      : kind === 'binary'
        ? { id: prefix+'interpret-v2-meaning', prompt: '정답 y=1일 때 p가 0.5에서 0.8로 커지면 BCE는?', options: ['커집니다.', '작아집니다.', '정답과 무관하므로 같습니다.'], answer: '작아집니다.', hint: 'y=1이면 −ln(p)만 남습니다. 정답 클래스에 더 큰 확률을 주었습니다.', explanation: '같은 정답에서 정답 클래스의 확률이 커지면 BCE는 작아집니다.' }
        : { id: prefix+'interpret-v2-meaning', prompt: '정답 y=[1,0,0]일 때 CCE에 직접 남는 항은?', options: ['세 확률의 평균입니다.', '가장 큰 확률 자체입니다.', '첫 클래스 확률에 대한 −ln(p₁)입니다.'], answer: '첫 클래스 확률에 대한 −ln(p₁)입니다.', hint: '원-핫의 0이 곱해진 손실 항은 0입니다.', explanation: '정답 위치의 확률로 손실을 구합니다. 다른 클래스의 기울기까지 0이라는 뜻은 아닙니다.' }]
  return [
    { id: prefix+'formula', prompt: '이 조합의 출력 점수 기울기 공식은?', options: ['2(ŷ−y)', 'p−y', '클래스마다 pₖ−yₖ'], answer: kind === 'linear' ? '2(ŷ−y)' : kind === 'binary' ? 'p−y' : '클래스마다 pₖ−yₖ', hint: '출력층과 손실함수를 한 쌍으로 확인하세요. 제곱오차에는 계수 2가 있습니다.', explanation: '데이터 하나 기준의 공식을 골랐습니다.' },
    ...g.dz.map((v, k) => t(`dz${k}`, `출력 점수 ${kind === 'multi' ? ['고양이','강아지','새'][k] : 'z'}의 기울기는?`, v, '선형은 2(ŷ−y), 분류는 p−y를 계산합니다. 정답 벡터의 각 칸을 확인하세요.')),
    t('dv', '출력층 첫 연결 v의 기울기는?', g.dv[0][0], `점수의 기울기에 출력층 입력 h₁=${fmt(f.h[0])}을 곱하세요. 원래 x를 곱하지 않습니다.`),
    ...(kind === 'linear' ? [{ id: 'ann20261019-06-order', prompt: '은닉층 기울기에 곱할 출력층 가중치는?', options: ['업데이트 전의 가중치', '먼저 업데이트한 가중치', '정답 레이블'], answer: '업데이트 전의 가중치', hint: '계산 도중 일부 값부터 수정하면 같은 손실의 기울기가 아니게 됩니다.', explanation: '계산 도중 일부 값부터 수정하면 같은 손실의 기울기가 아니게 됩니다.' }] : []),
    ...g.da.map((v, j) => t(`da${j}`, `은닉 뉴런 H${j+1}의 a${j+1} 기울기는?`, v, '출력별 기울기×수정 전 연결 가중치를 모두 더한 뒤 ReLU 기울기를 곱하세요.')),
    t('dw', '은닉층 첫 연결 w₁₁의 기울기는?', g.dw[0][0], `a₁의 기울기에 이 연결의 입력 x₁=${n.x[0]}을 곱하세요.`),
    t('wnew', '모두 함께 업데이트한 w₁₁의 새 값은?', next.w[0][0], `현재 w₁₁ − 학습률 ${n.eta} × w₁₁의 기울기입니다.`),
    t('hnew', '수정된 은닉층의 h₁은?', after.h[0], '새 은닉 가중치와 편향으로 다시 계산하세요. 이전 h를 그대로 사용하지 마세요.'),
    t('pnew', kind === 'linear' ? '다시 순전파한 ŷ는?' : kind === 'binary' ? '다시 순전파한 클래스 1의 확률은?' : '다시 순전파한 고양이 확률은?', after.p[0], '새 h와 새 출력층 가중치·편향을 함께 사용한 뒤 출력 함수를 적용하세요.'),
    t('lnew', '다시 계산한 손실은?', after.loss, '화면 반올림 값 대신 앱 계산 도우미의 원래 예측값으로 손실을 계산합니다.'),
    kind === 'binary'
      ? { id: 'ann20261019-06-binary-reason-v2', prompt: '시그모이드 공통 예제에서 H2 쪽 기울기가 0인 이유와 적용 범위는?', options: ['이번 입력의 a₂가 음수여서 ReLU가 기울기를 막습니다. 다른 입력에서도 항상 0인 것은 아닙니다.', 'H2는 모든 입력에서 학습에 쓰이지 않는 뉴런이기 때문입니다.', '시그모이드는 은닉층의 기울기를 항상 모두 0으로 만들기 때문입니다.'], answer: '이번 입력의 a₂가 음수여서 ReLU가 기울기를 막습니다. 다른 입력에서도 항상 0인 것은 아닙니다.', hint: '이번에는 a₂=−1이라 ReLU의 기울기가 0입니다. 입력이 달라져 가중합이 양수가 되면 이 판단도 달라질 수 있습니다.', explanation: '이번에는 a₂=−1이라 ReLU의 기울기가 0입니다. 입력이 달라져 가중합이 양수가 되면 이 판단도 달라질 수 있습니다.' }
      : kind === 'multi'
        ? { id: prefix+'combined-v3-reason', prompt: '여러 출력에서 은닉층으로 돌아오는 기울기는 왜 모으며, 어떻게 계산하나요?', options: ['각 클래스의 확률을 같게 만들기 위해, 세 기울기를 평균내어 전달합니다.', '세 출력이 같은 은닉 출력에 연결되어 손실에 함께 영향을 줍니다. 각 출력의 기울기×수정 전 연결 가중치를 더한 뒤 ReLU 기울기를 곱합니다.', '가장 큰 확률의 클래스만 손실에 영향을 주므로, 그 출력의 기울기와 연결 가중치만 곱해 전달합니다.'], answer: '세 출력이 같은 은닉 출력에 연결되어 손실에 함께 영향을 줍니다. 각 출력의 기울기×수정 전 연결 가중치를 더한 뒤 ReLU 기울기를 곱합니다.', hint: '한 은닉 출력에서 세 출력으로 이어지는 경로를 모두 살펴보세요. 각 경로의 영향을 합한 뒤 현재 은닉 가중합에서의 ReLU 기울기를 적용합니다.', explanation: '공유하는 은닉 출력의 변화는 연결된 세 출력에 영향을 줍니다. 수정 전 가중치로 경로별 영향을 더하며, 세 값의 평균이나 가장 큰 값 하나로 대신하지 않습니다.' }
        : { id: 'ann20261019-06-linear-reason-v2', prompt: '선형 출력에서 MSE의 기울기는 왜 2(ŷ−y)이고, 반제곱오차는 ŷ−y일까요?', options: ['MSE에서는 입력 뉴런이 두 개이기 때문입니다.', '제곱을 미분하면 2가 생기고, 반제곱오차의 계수 ½과 곱하면 1이 되기 때문입니다.', 'MSE만 가중치와 편향을 동시에 수정하기 때문입니다.'], answer: '제곱을 미분하면 2가 생기고, 반제곱오차의 계수 ½과 곱하면 1이 되기 때문입니다.', hint: '계수 2는 입력 개수가 아니라 제곱을 미분한 결과입니다. 손실 정의에 ½이 있으면 2와 곱해 없어집니다.', explanation: '계수 2는 입력 개수가 아니라 제곱을 미분한 결과입니다. 손실 정의에 ½이 있으면 2와 곱해 없어집니다.' },
  ]
}

export function NetworkLab({ kind, mode, answers, change, requestedTask }: { kind: Pair; mode: LabMode; answers: Answers; change: (id: string, r: Response) => void; requestedTask?: { id: string; nonce: number } }) {
  const n = examples[kind], f = useMemo(() => forward(n), [n]), g = useMemo(() => backward(n), [n]), next = useMemo(() => update(n, g), [n, g]), after = useMemo(() => forward(next), [next])
  const tasks = networkTasks(kind, mode)
  const [scene, setScene] = useState(0), [updated, setUpdated] = useState(false)
  const [navigationHint, setNavigationHint] = useState('')
  const root = useRef<HTMLDivElement>(null)
  const sceneHeading = useRef<HTMLHeadingElement>(null)
  const sceneFocusSequence = useRef(0)
  const [focusTarget, setFocusTarget] = useState<{ id: string; nonce: number }>()
  const titles = mode === 'training' ? ['순전파와 손실', '출력층 기울기', '출력 가중치·편향', '은닉층으로 전달', '은닉 가중치·편향', '함께 업데이트', '다시 순전파', '전후 해석'] : mode === 'forward' ? ['초기값', '은닉층 계산', '출력층 계산'] : ['공통 예측에서 손실 계산']
  const taskFor = (id: string) => tasks.find(t => id === 'reason' && kind !== 'multi' && mode === 'training' ? t.id === `ann20261019-06-${kind}-reason-v2` : t.id.endsWith(`-${id}`))
  const solved = (...ids: string[]) => ids.every(id => { const t = taskFor(id); return !!t && correct(t, answers[t.id]) })
  // Public results follow submitted answers, never the saved lesson completion flag.
  const computed = solved('formula')
  const outputReady = computed && solved(...g.dz.map((_, k) => `dz${k}`))
  const hiddenReady = outputReady && solved('dv')
  const weightsReady = hiddenReady && (kind !== 'linear' || solved('order')) && solved(...g.da.map((_, j) => `da${j}`))
  const gradientsReady = weightsReady && solved('dw')
  const newForwardReady = gradientsReady && updated && solved('wnew')
  const comparisonReady = newForwardReady && solved('hnew', 'pnew', 'lnew')
  const sceneReady = mode !== 'training' || [true, true, outputReady, hiddenReady, weightsReady, gradientsReady, newForwardReady, comparisonReady][scene]
  const pending = mode === 'training'
    ? !computed || !outputReady ? { scene: 1, text: '출력층 기울기에서 공식과 기울기를 정답으로 제출해 주세요.' }
      : !hiddenReady ? { scene: 2, text: '출력 가중치의 기울기를 정답으로 제출해 주세요.' }
      : !weightsReady ? { scene: 3, text: kind==='linear'?'은닉층으로 전달된 기울기와 수정 전 가중치 판단을 정답으로 제출해 주세요.':'은닉층으로 전달된 각 기울기를 정답으로 제출해 주세요.' }
      : !gradientsReady ? { scene: 4, text: '은닉 가중치의 기울기를 정답으로 제출해 주세요.' }
      : !newForwardReady ? { scene: 5, text: '함께 업데이트를 실행하고 새 가중치를 정답으로 제출해 주세요.' }
      : { scene: 6, text: '다시 순전파에서 새 은닉 출력·예측·손실을 정답으로 제출해 주세요.' }
    : { scene: 1, text: '은닉층 계산에서 h₁을 정답으로 제출하면 출력층 대입식을 볼 수 있습니다.' }
  const changeScene = (target: number) => {
    const limit = mode === 'training' ? comparisonReady ? 7 : pending.scene : mode === 'forward' && !solved('h') ? 1 : titles.length-1
    if (target > limit) {
      setNavigationHint(pending.text)
      setScene(limit)
    } else {
      setNavigationHint('')
      setScene(target)
    }
  }
  const changeSceneFromBottom = (target: number) => {
    changeScene(target)
    sceneFocusSequence.current += 1
    setFocusTarget({ id: 'scene', nonce: sceneFocusSequence.current })
  }
  useEffect(() => {
    if (!requestedTask) return
    const suffix = requestedTask.id.split('-').at(-1) ?? ''
    const target = mode === 'loss' ? 0 : mode === 'forward' ? suffix === 'h' ? 1 : 2
      : suffix === 'formula' || suffix.startsWith('dz') ? 1 : suffix === 'dv' ? 2 : suffix.startsWith('da') || suffix === 'order' ? 3 : suffix === 'dw' ? 4 : suffix === 'wnew' ? 5 : requestedTask.id === taskFor('reason')?.id ? 7 : 6
    changeScene(target)
    setFocusTarget({ id: mode === 'training' && suffix === 'wnew' && !updated ? 'update' : requestedTask.id, nonce: requestedTask.nonce })
    // A request is a navigation action, not an answer or calculation update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedTask?.nonce, requestedTask?.id])
  useEffect(() => {
    if (!focusTarget) return
    const target = focusTarget.id === 'scene' ? sceneHeading.current : focusTarget.id === 'update' ? root.current?.querySelector<HTMLElement>('[data-update]') : document.getElementById(`task-${focusTarget.id}`)
    if (!target || !root.current?.contains(target)) return
    const input = focusTarget.id === 'scene' || target.matches('button') ? target : target.querySelector<HTMLElement>('input, button')
    input?.focus({ preventScroll: true })
    target.style.scrollMarginTop = `${pinnedHeaderOffset() + 16}px`
    target.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
    setFocusTarget(undefined)
  }, [scene, focusTarget])
  const blocked = <div role="status" className="rounded-xl bg-indigo-50 p-4"><p className="mb-3">{pending.text} 답안을 지우지 않고 해당 장면으로 이동합니다.</p><Button variant="secondary" onClick={() => setScene(pending.scene)}>먼저 풀 계산으로 이동</Button></div>
  const result = (id: string, value: number) => { const t = taskFor(id); return !t || correct(t, answers[t.id]) ? fmt(value) : '직접 계산 ↓' }
  const question = (id: string) => { const t = taskFor(id); return t ? <Question key={t.id} task={t} response={answers[t.id]} onChange={r => change(t.id, r)} /> : null }
  const terms = (weights: number[], values: number[]) => weights.map((v, j) => `(${fmt(v)} × ${fmt(values[j])})`).join(' + ')
  const math = (formula: string) => <MathExpression formula={formula} />
  const params = parameters(n), nextParams = parameters(next)
  const parameterName = (name: string) => n.v.length === 1 && /^v\d$/.test(name) ? `v1${name.slice(1)}` : name === 'bo' ? 'bo1' : name
  const gradParams = parameters({ ...n, w:g.dw,b:g.db,v:g.dv,bo:g.dbo })
  const hiddenRows: Row[] = n.w.flatMap((row,j) => [
    {name: <SymbolName name={`a${j+1}`} />,formula: math(String.raw`a_j=\sum_{i=1}^{${n.x.length}}w_{ji}x_i+b_j`),substitute: math(`${terms(row,n.x)} + (${n.b[j]})`),result:fmt(f.a[j])},
    {name:<SymbolName name={`h${j+1}`} />,formula:math(String.raw`h_j=\mathrm{ReLU}(a_j)`),substitute:math(String.raw`\max(0, ${fmt(f.a[j])})`),result:j===0 ? result('h',f.h[j]) : fmt(f.h[j])},
  ])
  const outputRows: Row[] = n.v.map((row,k) => ({name:<SymbolName name={`z${kind==='multi'? k+1 : ''}`} />,formula:math(String.raw`z_k=\sum_{j=1}^{${n.b.length}}v_{kj}h_j+b_{ok}`),substitute:math(`${terms(row,f.h)} + (${n.bo[k]})`),result:k===0?result('z',f.z[k]):fmt(f.z[k])}))
  const dzRows: Row[] = g.dz.map((v,k) => ({name:<Derivative name={`z${kind==='multi'?k+1:''}`} />,formula:math(kind==='linear'?String.raw`\frac{\partial L}{\partial z}=2(\hat{y}-y)`:kind==='binary'?String.raw`\frac{\partial L}{\partial z}=p-y`:String.raw`\frac{\partial L}{\partial z_k}=p_k-y_k`),substitute:math(`${kind==='linear'?'2 × ':''}(${fmt(f.p[k])} − ${n.y[k]})`),result:result(`dz${k}`,v)}))
  const daRows: Row[] = g.da.map((v,j) => ({name:<Derivative name={`a${j+1}`} />,formula:math(String.raw`\frac{\partial L}{\partial a_j}=(\sum_{k=1}^{C}\frac{\partial L}{\partial z_k}v_{kj})\mathrm{ReLU}'(a_j)`),substitute:math(`(${g.dz.map((d,k)=>`${fmt(d)} × ${fmt(n.v[k][j])}`).join(' + ')}) × ${f.a[j]>0?1:0}`),result:result(`da${j}`,v)}))
  const predictionSymbols = kind === 'linear' ? 'ŷ는 수치 예측' : 'p는 분류 확률'
  const sceneSymbols = mode === 'loss'
    ? `y는 정답, ${predictionSymbols}, L은 예측을 평가한 손실입니다. 아래 첨자 i는 자료 번호, k는 클래스 번호입니다.`
    : mode === 'forward'
      ? scene < 2
        ? 'x는 입력, w는 입력→은닉 연결의 가중치, b는 편향입니다. a는 곱의 합에 편향을 더한 값, h는 a에 ReLU를 적용한 출력입니다.'
        : `h는 이전 층의 출력, v는 은닉→출력 연결의 가중치, bₒ는 출력 편향입니다. z는 출력 점수, ${predictionSymbols}입니다.`
      : [
        `h는 은닉 출력, z는 출력 점수, ${predictionSymbols}, y는 정답, L은 손실입니다.`,
        `∂L/∂z는 출력 점수 z가 변할 때 손실 L이 변하는 비율입니다. ${predictionSymbols}, y는 정답입니다.`,
        'v는 은닉→출력 연결의 가중치, h는 그 연결에 들어온 은닉 출력, bₒ는 출력 편향입니다. ∂L/∂v는 v에 대한 손실의 기울기입니다.',
        'a는 은닉 가중합, h는 ReLU 출력, v는 수정 전 출력 연결의 가중치입니다. ∂L/∂a는 a에 대한 손실의 기울기입니다.',
        'w는 입력→은닉 연결의 가중치, x는 그 연결의 입력, b는 은닉 편향입니다. ∂L/∂w는 w에 대한 손실의 기울기입니다.',
        'η는 학습률, ∂L/∂θ는 수정할 값 θ에 대한 손실의 기울기입니다. old는 수정 전, new는 수정 후를 뜻합니다.',
        `x는 같은 입력, w·v는 수정된 연결 가중치, b·bₒ는 수정된 편향입니다. 새 은닉 출력 h → 출력 점수 z → ${predictionSymbols} → 손실 L 순서로 계산합니다.`,
        `${predictionSymbols}이며 L은 그 예측을 정답 y와 비교한 손실입니다. 손실은 확률이나 정확도가 아닙니다.`,
      ][scene]
  return <div ref={root} className="grid min-w-0 grid-cols-1 gap-5">
    <h3 className="text-xl font-bold">{mode==='forward' ? {linear:'선형 출력',binary:'시그모이드 출력',multi:'소프트맥스 출력'}[kind] : names[kind]} · {mode==='training'?'계산부터 수정 후 해석까지':mode==='loss'?'앞 차시의 예측 평가':'입력에서 최종 출력까지'}</h3>
    {mode==='forward'&&scene===0&&<p className="leading-7">여기서 계산한 예측을 5차시에서 평가하고, 6차시에서 같은 초기값의 가중치·편향을 수정합니다.</p>}
    {titles.length>1&&<div role="group" aria-label="상단 계산 단계 이동"><SceneNav titles={titles} index={scene} setIndex={changeScene} mode="calculation" /></div>}
    {navigationHint && <p role="status" className="rounded-lg bg-indigo-50 p-3">{navigationHint}</p>}
    {titles.length>1&&<h4 ref={sceneHeading} tabIndex={-1} className="rounded text-lg font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600">{scene+1}/{titles.length} · {titles[scene]}</h4>}
    <p className="text-slate-700">소수는 최대 여섯 자리의 근삿값(≈)으로 표시하며, 계산은 반올림 전 값으로 이어집니다. 작은 0이 아닌 값은 지수 표기로 남깁니다.</p>
    <p className="leading-7"><strong>이 계산의 기호 · </strong>{sceneSymbols}</p>
    <details><summary className="min-h-11 cursor-pointer py-2 font-bold">기호와 연결 읽는 법 다시 확인</summary><NetworkSymbols network={n}/><p className="mt-3 leading-7">p는 분류 확률, ŷ는 수치 예측, L은 손실, η는 기울기를 실제 수정량으로 바꾸는 학습률입니다.</p></details>
    {(mode==='forward'||mode==='training'&&(scene===0||scene>=5)) && sceneReady && <NetworkPicture network={newForwardReady&&scene>=6?next:n} stage={mode==='training' ? scene===5?'update':scene===0?'hidden':'output' : scene<2?'hidden':'output'} reveal={mode!=='forward'}
      hiddenLabels={mode==='forward' ? f.h.map((v,j)=>j===0&&!solved('h')?'?':fmt(v)) : newForwardReady&&scene>=6 ? after.h.map((v,j)=>j===0&&!solved('hnew')?'?':fmt(v)) : undefined}
      outputLabels={mode==='forward' ? f.z.map((v,k)=>!solved('h')||k===0&&!solved('z')?'?':fmt(v)) : newForwardReady&&scene>=6 ? after.z.map(v=>!solved('hnew')||kind==='linear'&&!solved('pnew')?'?':fmt(v)) : undefined}
    />}
    {mode==='training'&&scene>=1&&scene<=4&&sceneReady&&(scene!==1||computed)&&<BackpropPicture network={n} phase={(['output-score','output-weight','hidden-sum','input-weight'] as const)[scene-1]} labels={{dz:g.dz.map((v,k)=>result(`dz${k}`,v)),dv:result('dv',g.dv[0][0]),da:g.da.map((v,j)=>result(`da${j}`,v)),dw:result('dw',g.dw[0][0])}}/>}
    {mode!=='loss'&&<details open={mode==='forward'&&scene===0}><summary className="min-h-11 cursor-pointer font-bold">현재 예제의 모든 초기값 · x=[{n.x.join(', ')}], y=[{n.y.join(', ')}], η={n.eta}</summary><div className="grid grid-cols-2 gap-2 py-3 sm:grid-cols-3">{params.map(p=><p key={p.label} className="rounded border p-2"><SymbolName name={parameterName(p.label)}/> = {fmt(p.value)}</p>)}</div></details>}
    {mode==='forward' && <>
      {scene===0 && <p>입력층은 x를 전달합니다. 은닉층은 가중합에 ReLU를 적용하고, 출력층은 h를 받아 문제에 맞는 예측을 만듭니다. 뉴런을 여러 개 연결해야 여러 입력의 비선형 관계를 표현할 수 있습니다.</p>}
      {scene===1 && <><CalculationTable rows={hiddenRows}/>{question('h')}</>}
      {scene===2 && (solved('h') ? <><p>이전 층의 출력 h=[{f.h.map(fmt).join(', ')}]가 출력층의 입력입니다.</p><CalculationTable rows={outputRows}/>{question('z')}<OutputFormula kind={kind}/>{solved('z') ? <><p>{kind==='binary'?`계산 도우미: exp(−z)=${fmt(Math.exp(-f.z[0]))}`:kind==='multi'?`계산 도우미: exp(z)=[${f.z.map(z=>fmt(Math.exp(z))).join(', ')}], 합=${fmt(sum(f.z.map(Math.exp)))}`:`선형 출력 ŷ=${fmt(f.z[0])}: 점수 z를 그대로 사용하는 수치 예측입니다.`}</p>{question('p')}</> : <p role="status">점수 z를 정답으로 제출하면 출력 계산으로 이어집니다.</p>}</> : blocked)}
    </>}
    {mode==='loss' && <><p>4차시 순전파 결과: {kind==='linear'?'ŷ':'p'}=[{f.p.map(fmt).join(', ')}], 정답 y=[{n.y.join(', ')}]. 이 예측값을 그대로 평가합니다.</p>{kind!=='linear'&&<p>ln은 자연로그라는 숫자 변환입니다. 정답 확률이 작을수록 −ln(확률)은 커지므로, 정답에 낮은 확률을 준 예측에 큰 손실을 줍니다. 이 앱이 제공하는 ln 값을 사용하며 로그를 손으로 계산할 필요는 없습니다.</p>}<LossFormula kind={kind}/>
      {math(kind==='linear'?String.raw`L=(${fmt(f.p[0])}-${n.y[0]})^2`:kind==='binary'?String.raw`L=-[${n.y[0]}\ln(${fmt(f.p[0])})+(1-${n.y[0]})\ln(1-${fmt(f.p[0])})]`:String.raw`L=-[${f.p.map((p,k)=>String.raw`${n.y[k]}\ln(${fmt(p)})`).join('+')}]`)}
      {kind!=='linear'&&<p>계산 도우미: ln(정답 확률) ≈ {fmt(Math.log(f.p[0]))}. 이 값에 −를 붙여 손실을 구합니다.</p>}{tasks.map(t=><Question key={t.id} task={t} response={answers[t.id]} onChange={r=>change(t.id,r)}/>)}</>}
    {mode==='training' && <>
      {scene===0 && <Box title="앞 차시에서 가져온 값"><p>h=[{f.h.map(fmt).join(', ')}] → z=[{f.z.map(fmt).join(', ')}] → {kind==='linear'?'ŷ':'p'}=[{f.p.map(fmt).join(', ')}] → 손실 L≈{fmt(f.loss)}</p><p>{kind==='linear'?'선형 출력에서는 점수 z를 그대로 ŷ로 쓰고 MSE로 평가합니다. 제공된 점수 기울기 공식은 2(ŷ−y)입니다.':kind==='binary'?'점수 z를 시그모이드 확률 p로 바꾸고 BCE로 평가합니다. 이 두 변화 비율을 곱해 정리한 점수 기울기 공식은 p−y입니다.':'여러 점수를 소프트맥스 확률로 바꾸고 CCE로 평가합니다. 연결된 변화 비율을 정리하면 각 점수의 기울기는 pₖ−yₖ입니다.'} 다음 장면에서 이 조합의 공식을 선택하고 현재 예측·정답을 대입하세요. 아직 가중치를 수정하는 것은 아닙니다.</p></Box>}
      {scene===1 && <>{taskFor('formula') && <Question task={taskFor('formula')!} response={answers[taskFor('formula')!.id]} onChange={r=>change(taskFor('formula')!.id,r)} submitLabel="공식 제출·기울기 계산"/>}{computed ? <><CalculationTable rows={dzRows}/>{g.dz.map((_,k)=>question(`dz${k}`))}</> : <p role="status">공식을 정답으로 제출하면 대입표가 나타납니다. 선택을 바꾸면 다시 제출해 주세요.</p>}</>}
      {!sceneReady && blocked}
      {scene===2 && sceneReady && <><p>가중치 기울기는 점수 기울기에 그 연결로 들어온 h를 곱해 구합니다. 편향에는 입력을 곱하지 않습니다.</p><CalculationTable rows={n.v.flatMap((row,k)=>[...row.map((_,j)=>({name:<Derivative name={`v${k+1}${j+1}`}/>,formula:math(String.raw`\frac{\partial L}{\partial v_{kj}}=\frac{\partial L}{\partial z_k}h_j`),substitute:math(`${fmt(g.dz[k])} × ${fmt(f.h[j])}`),result:k===0&&j===0?result('dv',g.dv[k][j]):fmt(g.dv[k][j])})),{name:<Derivative name={`bo${k+1}`}/>,formula:math(String.raw`\frac{\partial L}{\partial b_{ok}}=\frac{\partial L}{\partial z_k}`),substitute:math(fmt(g.dz[k])),result:fmt(g.dbo[k])}])}/>{question('dv')}</>}
      {scene===3 && sceneReady && <><p>{kind==='multi'?'세 출력 뉴런에서 돌아오는 영향을 더합니다. 합산식의 C는 더하는 출력 뉴런 수이며 이 예제에서는 클래스 수 3입니다.':'출력 뉴런이 하나이므로 아래 합산식의 C=1입니다. 출력층에서 돌아온 기울기에 수정 전 연결 가중치를 곱합니다.'} ReLU의 기울기는 순전파 출력 h와 다릅니다. 아래는 기울기를 통과시키는 비율이며 a=0에서는 이 앱의 규칙으로 0을 사용합니다.</p>{math(String.raw`\mathrm{ReLU}'(a)=\begin{cases}1 & a>0\\0 & a\le0\end{cases}`)}{kind==='linear'&&question('order')}<CalculationTable rows={daRows}/>{g.da.map((_,j)=>question(`da${j}`))}</>}
      {scene===4 && sceneReady && <><p>은닉층 가중치에는 원래 입력 x를 곱합니다. 은닉 편향의 기울기는 a의 기울기와 같습니다.</p><CalculationTable rows={n.w.flatMap((row,j)=>[...row.map((_,i)=>({name:<Derivative name={`w${j+1}${i+1}`}/>,formula:math(String.raw`\frac{\partial L}{\partial w_{ji}}=\frac{\partial L}{\partial a_j}x_i`),substitute:math(`${fmt(g.da[j])} × ${fmt(n.x[i])}`),result:j===0&&i===0?result('dw',g.dw[j][i]):fmt(g.dw[j][i])})),{name:<Derivative name={`b${j+1}`}/>,formula:math(String.raw`\frac{\partial L}{\partial b_j}=\frac{\partial L}{\partial a_j}`),substitute:math(fmt(g.da[j])),result:fmt(g.db[j])}])}/>{question('dw')}</>}
      {scene===5 && sceneReady && <><p>모든 기울기를 수정 전 가중치로 구한 뒤 함께 업데이트합니다. θ는 가중치·편향 중 하나를 뜻합니다.</p>{math(String.raw`\theta^{new}=\theta^{old}-\eta\frac{\partial L}{\partial\theta}`)}<Button data-update onClick={()=>setUpdated(true)}>경사하강법으로 모두 업데이트</Button><p>버튼은 같은 한 번의 수정 결과를 보여줍니다. 새 가중치를 계산해 제출하세요.</p>{updated&&<><CalculationTable rows={params.map((p,i)=>({name:<SymbolName name={parameterName(p.label)}/>,formula:math(String.raw`\theta^{new}=\theta^{old}-\eta\frac{\partial L}{\partial\theta}`),substitute:math(`${fmt(p.value)} − ${n.eta} × (${fmt(gradParams[i].value)})`),result:p.label==='w11'?result('wnew',nextParams[i].value):fmt(nextParams[i].value)}))}/>{question('wnew')}</>}</>}
      {scene===6 && sceneReady && <><CalculationTable rows={[
        ...next.w.map((row,j)=>({name:<SymbolName name={`h${j+1}`}/>,formula:math(String.raw`h_j=\mathrm{ReLU}(\sum_{i=1}^{${n.x.length}}w_{ji}^{new}x_i+b_j^{new})`),substitute:math(String.raw`\mathrm{ReLU}(${terms(row,n.x)} + ${fmt(next.b[j])})`),result:j===0?result('hnew',after.h[j]):fmt(after.h[j])})),
      ]}/>{question('hnew')}{solved('hnew') ? <><CalculationTable rows={next.v.map((row,k)=>({name:<SymbolName name={`z${k+1}`}/>,formula:math(String.raw`z_k=\sum_{j=1}^{${n.b.length}}v_{kj}^{new}h_j+b_{ok}^{new}`),substitute:math(`${terms(row,after.h)} + (${fmt(next.bo[k])})`),result:kind==='linear'?result('pnew',after.z[k]):fmt(after.z[k])}))}/><OutputFormula kind={kind}/><p>계산 도우미: {kind==='linear'?'선형 출력은 위 식으로 계산한 점수와 같습니다.':kind==='binary'?`exp(−z)=${fmt(Math.exp(-after.z[0]))}`:`exp(z)=[${after.z.map(z=>fmt(Math.exp(z))).join(', ')}], 합=${fmt(sum(after.z.map(Math.exp)))}`}</p>{question('pnew')}{solved('pnew') ? <><strong>손실 계산 도우미</strong>{kind==='linear'?math(String.raw`L=(\hat{y}-y)^2=(${fmt(after.p[0])}-${n.y[0]})^2`):math(String.raw`\ln(${fmt(after.p[0])})\approx${fmt(Math.log(after.p[0]))}`)}{question('lnew')}</> : <p role="status">새 예측을 정답으로 제출하면 손실 계산으로 이어집니다.</p>}</> : <p role="status">새 은닉 출력 h₁을 정답으로 제출하면 출력층 대입식이 나타납니다.</p>}</>}
      {scene===7 && sceneReady && <><p>같은 입력·정답·손실 정의로 비교합니다. 은닉층도 수정했다면 h부터 다시 계산해야 합니다.</p><CalculationTable rows={[{name:'예측',formula:kind==='linear'?'연속 수치':'클래스 확률',substitute:`수정 전 [${f.p.map(fmt).join(', ')}]`,result:`수정 후 [${after.p.map(fmt).join(', ')}]`},{name:'손실',formula:'같은 자료·같은 정의',substitute:fmt(f.loss),result:fmt(after.loss)}]}/>{kind==='linear'&&<div className="grid min-w-0 gap-2"><p>이제 손실 정의도 비교해 보세요. 제곱의 기울기에 생기는 계수 2에, 손실 앞의 계수가 곱해집니다.</p>{math(String.raw`L=(\hat{y}-y)^2,\quad\frac{\partial L}{\partial z}=2(\hat{y}-y)`)}{math(String.raw`L=\frac{1}{2}(\hat{y}-y)^2,\quad\frac{\partial L}{\partial z}=\hat{y}-y`)}<p>여기까지 계산한 MSE와 업데이트 값은 바꾸지 않습니다.</p></div>}{question('reason')}{kind==='linear'&&<Box title="업데이트 범위에 따른 결과 비교"><p>출력층만 수정하면 h=2는 그대로입니다. v=0.74, bₒ=0.17 → ŷ=1.65, L=0.1225입니다.</p><p>여기서는 은닉층도 수정해 h≈{fmt(after.h[0])}, ŷ≈{fmt(after.p[0])}, L≈{fmt(after.loss)}입니다. 같은 초기값도 수정하는 층이 다르면 결과가 달라집니다.</p></Box>}</>}
    </>}
    {titles.length>1&&scene<titles.length-1&&<nav aria-label="하단 계산 단계 이동" className="grid gap-2 border-t border-slate-200 pt-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
      <p className="leading-7">다음 계산: {titles[scene+1]}</p>
      <Button aria-label={`하단 다음 계산 단계: ${titles[scene+1]}`} className="min-h-12 whitespace-normal" onClick={()=>changeSceneFromBottom(scene+1)}>다음 계산 단계 →</Button>
    </nav>}
    {titles.length>1&&<p className="text-sm text-slate-600">계산 단계는 앞 계산을 제출하며 진행합니다. 전체 STEP은 자유롭게 오갈 수 있으며, 필수 답안을 모두 제출해야 완료됩니다.</p>}
  </div>
}

export function OutputFormula({kind}:{kind:Pair}) {
  return <div className="grid min-w-0 gap-2"><strong>{kind==='linear'?'선형 출력':kind==='binary'?'시그모이드':'소프트맥스'}</strong><MathExpression formula={kind==='linear'?String.raw`\hat{y}=z`:kind==='binary'?String.raw`p=\sigma(z)=\frac{1}{1+e^{-z}}`:String.raw`p_k=\frac{e^{z_k}}{\sum_{r=1}^{C}e^{z_r}}`}/>{kind==='multi'&&<p>k는 구할 클래스 번호, r은 분모에서 더할 클래스 번호, C는 클래스 수입니다.</p>}{kind!=='linear'&&<p>e≈2.71828은 자연상수이며 앱이 지수값을 계산합니다.</p>}</div>
}
export function LossFormula({kind}:{kind:Pair}) {
  return <div className="grid min-w-0 gap-2"><MathExpression formula={kind==='linear'?String.raw`\mathrm{MSE}=\frac{1}{N}\sum_{i=1}^{N}(\hat{y}_i-y_i)^2`:kind==='binary'?String.raw`L_{BCE}=-[y\ln(p)+(1-y)\ln(1-p)]`:String.raw`L_{CCE}=-\sum_{k=1}^{C}y_k\ln(p_k)`}/><p>{kind==='linear'?'i는 자료 번호, N은 자료 수입니다. 한 자료에서는 L=(ŷ−y)²이며 ½을 곱하지 않습니다.':kind==='binary'?'p는 항상 클래스 1의 확률입니다. y=1이면 −ln(p), y=0이면 −ln(1−p)가 남습니다.':'k는 클래스 번호, C는 클래스 수입니다. 원-핫의 1은 정답 위치이며 예측 확률과 구별합니다.'}</p></div>
}
