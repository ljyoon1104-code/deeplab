import { NetworkPicture } from './TeachingUI'
import { MathExpression } from './MathExpression'
import { fmt, forward, type Network } from './network'

export interface BackpropLabels {
  dz: string[]
  dv: string
  da: string[]
  dw: string
}
interface BackpropPictureProps {
  network: Network
  phase: 'output-score' | 'output-weight' | 'hidden-sum' | 'input-weight'
  labels: BackpropLabels
}

/** Forward and backward share one geometry. Unsolved gradient labels stay masked. */
export function BackpropPicture({ network, phase, labels }: BackpropPictureProps) {
  const f = forward(network)
  const title = phase === 'output-score' ? '손실에서 출력 점수로'
    : phase === 'output-weight' ? '출력 점수에서 출력 연결로'
      : phase === 'hidden-sum' ? '여러 출력에서 은닉 뉴런으로'
        : '은닉 뉴런에서 입력 연결로'
  const outputName = (k: number) => network.kind === 'multi' ? ['고양이', '강아지', '새'][k] : '출력 1'
  const displayed = (value: string | undefined) => !value || value.includes('직접') ? '?' : value
  const math = (formula: string) => <MathExpression formula={formula}/>

  return <section className="grid min-w-0 grid-cols-1 gap-3 rounded-xl border border-rose-200 bg-rose-50/40 p-3 sm:p-4">
    <h4 className="text-lg font-bold">역전파 · {title}</h4>
    <p className="leading-7">같은 신경망을 거꾸로 살펴봅니다. h·z는 순전파의 참고값이고, ∂L로 시작하는 값은 손실의 기울기입니다. 연결의 가중치는 아직 수정 전 값입니다.</p>
    <NetworkPicture network={network} stage={phase==='output-score'||phase==='output-weight'?'back-output':'back-hidden'} gradients={{dz:labels.dz,da:labels.da}} defaultConnectionFamily={phase==='input-weight'?'w':'v'}/>

    {phase === 'output-score' && <div className={f.z.length>1?'grid min-w-0 gap-3 md:grid-cols-3':'grid min-w-0 gap-3'}>
      {f.z.map((score,k)=><div key={k} className="min-w-0 rounded-lg border border-rose-200 bg-white p-3">
        <strong>{outputName(k)} · 출력 {k+1}</strong>
        <p>참고값: z={fmt(score)}, {network.kind==='linear'?'ŷ':'p'}={fmt(f.p[k])}, y={network.y[k]}</p>
        {math('\\frac{\\partial L}{\\partial z_{'+(k+1)+'}}='+displayed(labels.dz[k]))}
        <p className="text-slate-600">?는 아래에서 직접 계산할 기울기입니다.</p>
      </div>)}
    </div>}

    {phase === 'output-weight' && <div className="min-w-0 rounded-lg border border-rose-200 bg-white p-3">
      <strong>H1 → 출력 1 연결 · v₁₁의 기울기</strong>
      <p>순전파에서 이 연결로 들어온 h₁={fmt(f.h[0])}을 곱합니다. v₁₁={fmt(network.v[0][0])} 자체는 아직 바꾸지 않습니다.</p>
      {math('\\frac{\\partial L}{\\partial v_{11}}=\\frac{\\partial L}{\\partial z_1}h_1=('+displayed(labels.dz[0])+')\\times'+fmt(f.h[0]))}
      <p>계산 결과: <strong>{labels.dv}</strong>. 편향은 입력을 곱하지 않습니다.</p>
      {math('\\frac{\\partial L}{\\partial b_{o1}}=\\frac{\\partial L}{\\partial z_1}')}
    </div>}

    {phase === 'hidden-sum' && network.b.map((_,j)=><section key={j} className="min-w-0 rounded-lg border border-rose-200 bg-white p-3">
      <h5 className="font-bold">H{j+1} · 출력 경로 합산과 ReLU</h5>
      <div className="mt-2 grid min-w-0 gap-2 md:grid-cols-2">
        {network.v.map((row,k)=><div key={k} className="min-w-0 rounded border border-slate-200 p-2">
          <strong>{outputName(k)} → H{j+1}</strong>
          {math('\\frac{\\partial L}{\\partial z_{'+(k+1)+'}}v_{'+(k+1)+(j+1)+'}=('+displayed(labels.dz[k])+')\\times'+fmt(row[j]))}
          <p>v{k+1}{j+1}={fmt(row[j])}: 이 경로의 수정 전 가중치</p>
        </div>)}
      </div>
      {math('\\frac{\\partial L}{\\partial a_{'+(j+1)+'}}=(\\sum_{k=1}^{'+network.v.length+'}\\frac{\\partial L}{\\partial z_k}v_{k'+(j+1)+'})\\mathrm{ReLU}\'(a_{'+(j+1)+'})')}
      <p className={'rounded-lg border-2 p-3 '+(f.a[j]>0?'border-emerald-500 bg-emerald-50':'border-dashed border-slate-500 bg-slate-100')}>
        순전파의 a{j+1}={fmt(f.a[j])}. {f.a[j]>0?'통과: 양수이므로 기울기 1을 곱합니다.':f.a[j]<0?'차단: 음수이므로 기울기 0을 곱합니다.':'경계: a=0에서는 기울기 0을 사용하는 규칙입니다.'}
      </p>
      <p className="mt-2">은닉 가중합의 기울기: <strong>{labels.da[j] ?? '?'}</strong>. 여러 출력에서는 모든 경로의 영향을 먼저 더합니다.</p>
    </section>)}

    {phase === 'input-weight' && <div className="min-w-0 rounded-lg border border-rose-200 bg-white p-3">
      <strong>입력 x₁ → H1 연결 · w₁₁의 기울기</strong>
      <p>이 연결의 입력 x₁={fmt(network.x[0])}을 곱합니다. w₁₁={fmt(network.w[0][0])}은 수정 전 값입니다.</p>
      {math('\\frac{\\partial L}{\\partial w_{11}}=\\frac{\\partial L}{\\partial a_1}x_1=('+displayed(labels.da[0])+')\\times'+fmt(network.x[0]))}
      <p>계산 결과: <strong>{labels.dw}</strong>. 은닉 편향의 기울기는 a₁의 기울기와 같습니다.</p>
      {math('\\frac{\\partial L}{\\partial b_1}=\\frac{\\partial L}{\\partial a_1}')}
    </div>}
  </section>
}
