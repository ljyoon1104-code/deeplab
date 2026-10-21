import { useId, useState } from 'react'
import { fmt, forward, type Network } from './network'
import { MathExpression } from './MathExpression'

export interface NetworkFlowProps {
  network: Network
  stage: 'hidden' | 'output' | 'back-output' | 'back-hidden' | 'update'
  reveal?: boolean
  hiddenLabels?: string[]
  outputLabels?: string[]
  gradients?: { dz: string[]; da: string[] }
  defaultConnectionFamily?: 'w' | 'v'
}

/** One geometry for both directions. Gradient labels are supplied by answer gates. */
export function NetworkFlowFigure({ network, stage, reveal = true, hiddenLabels, outputLabels, gradients, defaultConnectionFamily }: NetworkFlowProps) {
  const f = forward(network), reverse = stage.startsWith('back'), id = useId()
  const [selection, setSelection] = useState('')
  const lines = [
    ...network.w.flatMap((values, j) => values.map((value, i) => ({ id: `w-${j}-${i}`, name: `w${j+1}${i+1}`, from: i, to: j, value, family: 'w' }))),
    ...network.v.flatMap((values, k) => values.map((value, j) => ({ id: `v-${k}-${j}`, name: `v${k+1}${j+1}`, from: j, to: k, value, family: 'v' }))),
  ]
  const chosen = lines.find(line => line.id === selection) ?? lines.find(line => line.family === (defaultConnectionFamily ?? (reverse || stage.includes('output') ? 'v' : 'w')))!
  const heights = Math.max(network.x.length, network.b.length, network.bo.length)
  const height = 130 + heights * 170
  const y = (index: number, count: number) => 130 + index * 170 + (heights-count)*85
  const colors = ['#0e7490', '#6d28d9', '#b45309']
  const fills = ['#ecfeff', '#f5f3ff', '#fff7ed']
  const subscript = (value: number | string) => String(value).replace(/\d/g, digit => '₀₁₂₃₄₅₆₇₈₉'[Number(digit)])
  const h = (j: number) => hiddenLabels?.[j] ?? (reveal ? fmt(f.h[j]) : '미제출')
  const z = (k: number) => outputLabels?.[k] ?? (reveal ? fmt(f.z[k]) : '미제출')
  const columnX = (layer: number) => 120 + layer * 380
  const edgePosition = (line: typeof lines[number]) => {
    const layer = line.family === 'w' ? 0 : 1
    const fromCount = line.family === 'w' ? network.x.length : network.b.length
    const toCount = line.family === 'w' ? network.b.length : network.bo.length
    const x1 = columnX(layer) + 40, x2 = columnX(layer + 1) - 40
    const y1 = y(line.from, fromCount), y2 = y(line.to, toCount)
    // Labels sit on separated parts of the original connection, away from crossings.
    const fraction = fromCount === 1 ? .5 : line.from === 0 ? .25 : .75
    return { x1, x2, y1, y2, labelX: x1 + (x2 - x1) * fraction, labelY: y1 + (y2 - y1) * fraction }
  }
  const layerValues = [network.x.map((v,i)=>`x${i+1} = ${fmt(v)}`), network.b.map((_,j)=>`H${j+1}: h${j+1} = ${h(j)}, b${j+1} = ${fmt(network.b[j])}`), network.bo.map((v,k)=>`출력 ${k+1}: z${k+1} = ${z(k)}, bₒ${k+1} = ${fmt(v)}`)]
  return <figure className="grid min-w-0 grid-cols-1 gap-3 rounded-xl border border-slate-300 bg-white p-3 sm:p-4">
    <figcaption className="text-lg font-bold">{reverse ? '같은 연결을 거슬러 계산하는 손실의 기울기' : stage === 'update' ? '모든 기울기를 구한 뒤 함께 바꾸는 값' : '한 뉴런의 출력이 다음 뉴런의 입력이 됩니다'}</figcaption>
    <p>{reverse ? '점선은 기울기를 거슬러 계산하는 연결이며, 굵은 선은 지금 선택한 연결입니다. 원에는 뉴런 이름을, 그 아래에는 순전파 값과 ∂L로 표시한 기울기를 구별해 적었습니다.' : '청록색 입력은 특징값을 전달합니다. 보라색 은닉 뉴런과 주황색 출력 뉴런이 가중합과 활성화 계산을 합니다.'}</p>
    <label className="grid min-w-0 gap-1">살펴볼 연결
      <select aria-label="살펴볼 신경망 연결" className="min-h-12 w-full min-w-0 rounded-lg border border-slate-400 bg-white p-2" value={chosen.id} onChange={e=>setSelection(e.target.value)}>
        {lines.map(line=><option key={line.id} value={line.id}>{subscript(line.name)}: {line.family==='w'?`x${subscript(line.from+1)} → H${line.to+1}`:`H${line.from+1} → 출력 ${line.to+1}`} (가중치 {fmt(line.value)})</option>)}
      </select>
    </label>
    <div role="region" tabIndex={0} aria-label="신경망 연결 그림 가로 스크롤" className="max-w-full overflow-x-auto rounded-lg border border-slate-200 focus-visible:outline-2 focus-visible:outline-indigo-600">
      <svg viewBox={`0 0 1000 ${height}`} className="mx-auto w-full min-w-[900px] max-w-[1000px]" role="img" aria-label={`입력층·은닉층·출력층. 모든 연결에 가중치 기호가 표시되어 있습니다. 선택 연결 ${subscript(chosen.name)}, 가중치 ${fmt(chosen.value)}. ${reverse?'기울기는 오른쪽에서 왼쪽으로 전달되며 연결 기호는 순전파와 같습니다.':'값은 왼쪽에서 오른쪽으로 전달됩니다.'}`}>
        <defs><marker id={`${id}-flow`} markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8Z" fill={reverse?'#7e22ce':'#64748b'}/></marker></defs>
        {[['입력층','특징값 전달'],['은닉층','가중합 → ReLU'],['출력층','점수 → 예측']].map(([name,role],index)=><g key={name}><rect x={columnX(index)-110} y="14" width="220" height={height-28} rx="18" fill={fills[index]}/><text x={columnX(index)} y="43" textAnchor="middle" fill={colors[index]} fontWeight="bold" fontSize="22">{name}</text><text x={columnX(index)} y="70" textAnchor="middle" fontSize="17">{role}</text></g>)}
        {lines.map(line=>{
          const { x1, x2, y1, y2 } = edgePosition(line)
          const selected=line.id===chosen.id
          return <path key={line.id} d={reverse?`M${x2} ${y2} L${x1} ${y1}`:`M${x1} ${y1} L${x2} ${y2}`} fill="none" stroke={selected?'#be123c':reverse?'#a78bfa':'#94a3b8'} strokeWidth={selected?4:1.7} strokeDasharray={reverse?'8 5':undefined} markerEnd={`url(#${id}-flow)`}/>
        })}
        {layerValues.map((values,layer)=>values.map((_,index)=>{
          const cx=columnX(layer), cy=y(index,values.length)
          return <g key={`${layer}-${index}`}><circle cx={cx} cy={cy} r="34" fill="white" stroke={colors[layer]} strokeWidth="2.5"/><text x={cx} y={cy+6} textAnchor="middle" fontSize="20" fontWeight="bold">{layer===0?`x${subscript(index+1)}`:layer===1?`H${index+1}`:`O${index+1}`}</text><rect x={cx-90} y={cy+45} width="180" height="80" rx="8" fill={fills[layer]}/><text x={cx} y={cy+64} textAnchor="middle" fontSize="17">{layer===0?fmt(network.x[index]):layer===1?`h${subscript(index+1)} = ${h(index)}`:`z${subscript(index+1)} = ${z(index)}`}</text>{layer>0&&<text x={cx} y={cy+87} textAnchor="middle" fontSize="16">{layer===1?`b${subscript(index+1)} = ${fmt(network.b[index])}`:`bₒ${subscript(index+1)} = ${fmt(network.bo[index])}`}</text>}{reverse&&layer>0&&<text x={cx} y={cy+112} textAnchor="middle" fontSize="17" fill="#7e22ce">∂L/∂{layer===1?'a':'z'}{subscript(index+1)} = {(layer===1?gradients?.da[index]:gradients?.dz[index])??'미제출'}</text>}</g>
        }))}
        {lines.map(line => {
          const { labelX, labelY } = edgePosition(line)
          const selected = line.id === chosen.id
          return <g key={`label-${line.id}`}>
            <rect x={labelX-24} y={labelY-16} width="48" height="32" rx="6" fill="white" stroke={selected?'#be123c':'#64748b'} strokeWidth={selected?2:1}/>
            <text x={labelX} y={labelY+5} textAnchor="middle" fontSize="19" fill={selected?'#9f1239':'#334155'}>
              <tspan fontStyle="italic">{line.family}</tspan><tspan baselineShift="sub" fontSize="14">{line.to+1}{line.from+1}</tspan>
            </text>
          </g>
        })}
      </svg>
    </div>
    <div className="rounded-lg border-l-4 border-rose-600 bg-rose-50 p-3 leading-7" aria-live="polite">
      <strong>선택 연결 {chosen.name} · {reverse?'수정 전 ':''}가중치 {fmt(chosen.value)}</strong>
      <p>{reverse?'원래 연결: ':''}{chosen.family==='w'?`입력 x${chosen.from+1} → 은닉 H${chosen.to+1}`:`은닉 출력 h${chosen.from+1} → 출력 ${chosen.to+1}`}</p>
      {reverse ? chosen.family==='w' ? <>
        <p>이 w 연결의 기울기는 은닉 가중합의 기울기에 이 연결로 들어온 입력을 곱해 구합니다. 가중치 자체는 아직 바꾸지 않습니다.</p>
        <MathExpression formula={`\\frac{\\partial L}{\\partial w_{${chosen.to+1}${chosen.from+1}}}=\\frac{\\partial L}{\\partial a_${chosen.to+1}}x_${chosen.from+1}`}/>
      </> : stage==='back-hidden' ? <>
        <p>출력 {chosen.to+1}에서 H{chosen.from+1}으로 돌아오는 영향에는 이 수정 전 가중치를 곱합니다. 같은 은닉 뉴런에 연결된 출력들의 영향을 더한 뒤 ReLU 기울기를 적용합니다.</p>
        <MathExpression formula={`\\frac{\\partial L}{\\partial a_${chosen.from+1}}=(\\sum_{k=1}^{${network.v.length}}\\frac{\\partial L}{\\partial z_k}v_{k${chosen.from+1}})\\mathrm{ReLU}'(a_${chosen.from+1})`}/>
      </> : <>
        <p>이 v 연결의 기울기는 출력 점수의 기울기에 이 연결로 들어온 은닉 출력을 곱해 구합니다. 가중치 자체는 아직 바꾸지 않습니다.</p>
        <MathExpression formula={`\\frac{\\partial L}{\\partial v_{${chosen.to+1}${chosen.from+1}}}=\\frac{\\partial L}{\\partial z_${chosen.to+1}}h_${chosen.from+1}`}/>
      </> : <MathExpression formula={`${chosen.name[0]}_{${chosen.name.slice(1)}} \\times ${chosen.family==='w'?'x':'h'}_{${chosen.from+1}} = ${fmt(chosen.value)} \\times ${chosen.family==='w'?fmt(network.x[chosen.from]):/^[−+\-\d.eE×]+$/.test(h(chosen.from))?h(chosen.from):'?'}`}/>}
    </div>
    <p className="sm:hidden">그림은 옆으로 이동할 수 있습니다. {layerValues.map((values,index)=>`${['입력','은닉','출력'][index]}: ${values.join(' / ')}`).join(' → ')}</p>
  </figure>
}
