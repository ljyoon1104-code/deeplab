import { useId, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { calculatePerceptronN } from '../lesson02/perceptronMath'
import { Box } from './TeachingUI'
import { MathExpression } from './MathExpression'

const xorPoints = [
  { inputs: [0, 0] as const, answer: 0 },
  { inputs: [1, 0] as const, answer: 1 },
  { inputs: [0, 1] as const, answer: 1 },
  { inputs: [1, 1] as const, answer: 0 },
]

// 관계를 비교하기 위한 고정 모형입니다. 학습을 실행하거나 답안을 갱신하지 않습니다.
export function evaluateXorExample(inputs: readonly [number, number]) {
  const first = calculatePerceptronN({ inputs, weights: [1, 1], bias: -.5 })
  const second = calculatePerceptronN({ inputs, weights: [1, 1], bias: -1.5 })
  const output = calculatePerceptronN({ inputs: [first.output, second.output], weights: [1, -2], bias: -.5 })
  return { single: first, hidden: [first, second], output }
}

function XorBoundary({ multi, selected }: { multi: boolean; selected: number }) {
  const px = (x: number) => 90 + x * 170
  const py = (y: number) => 230 - y * 170
  return <figure className="min-w-0 rounded-xl border border-slate-300 bg-white p-3">
    <figcaption className="font-bold">{multi ? '여러 뉴런을 연결한 다층 구조' : '은닉층 없는 단층 퍼셉트론'}</figcaption>
    <div role="region" aria-label={`${multi ? '다층' : '단층'} 경계 그림 가로 스크롤`} tabIndex={0} className="max-w-full overflow-x-auto focus-visible:outline-3 focus-visible:outline-indigo-600">
    <svg viewBox="0 0 340 310" className="mx-auto mt-2 w-full min-w-[320px] max-w-sm" role="img" aria-label={multi ? '같은 XOR 네 점에서 두 경계를 조합합니다. 가운데 띠 영역에 정답 1인 두 점이 들어가고 정답 0인 두 점은 밖에 있습니다.' : '같은 XOR 네 점에서 직선 하나로 나누어 봅니다. 이 설정은 입력 1,1을 1로 출력하지만 실제 정답은 0입니다.'}>
      <rect x="56" y="26" width="238" height="238" fill="#f8fafc" stroke="#cbd5e1" />
      <polygon points={multi ? '56,111 56,26 141,26 294,179 294,264 209,264' : '56,111 56,26 294,26 294,264 209,264'} fill="#fef3c7" />
      <path d="M56 111L209 264" fill="none" stroke="#4338ca" strokeWidth="3" />
      {multi && <path d="M141 26L294 179" fill="none" stroke="#0e7490" strokeWidth="3" strokeDasharray="6 4" />}
      <path d="M56 230H315 M90 274V12" fill="none" stroke="#475569" strokeWidth="1.5" />
      <text x="314" y="251" fontSize="17">x₁</text><text x="28" y="18" fontSize="17">x₂</text>
      {xorPoints.map((point, index) => <g key={point.inputs.join(',')}>
        {index === selected && <circle cx={px(point.inputs[0])} cy={py(point.inputs[1])} r="27" fill="none" stroke="#0f172a" strokeWidth="3" />}
        {point.answer === 0
          ? <circle cx={px(point.inputs[0])} cy={py(point.inputs[1])} r="20" fill="#fff" stroke="#4338ca" strokeWidth="2" />
          : <rect x={px(point.inputs[0]) - 20} y={py(point.inputs[1]) - 20} width="40" height="40" rx="5" fill="#fff" stroke="#b45309" strokeWidth="2" />}
        <text x={px(point.inputs[0])} y={py(point.inputs[1]) + 6} textAnchor="middle" fontSize="19" fontWeight="bold">{point.answer}</text>
        <text x={px(point.inputs[0])} y={py(point.inputs[1]) - 34} textAnchor="middle" fontSize="16">({point.inputs.join(', ')})</text>
      </g>)}
      <text x="175" y="294" textAnchor="middle" fontSize="16">점 안의 숫자: 실제 정답</text>
    </svg></div>
    <p className="leading-7">노란 영역은 이 모형이 1로 출력하는 영역입니다. {multi ? '두 경계 사이만 1로 판단합니다.' : '직선 하나로는 대각선끼리 같은 정답인 네 점을 모두 나눌 수 없습니다.'}</p>
  </figure>
}

function XorComparison() {
  const [selected, setSelected] = useState(3)
  const point = xorPoints[selected]
  const calculation = evaluateXorExample(point.inputs)
  return <div className="grid min-w-0 grid-cols-1 gap-4">
    <p><strong>XOR</strong>는 두 입력이 다르면 1, 같으면 0인 규칙입니다. 앞의 (2, 3) 계산과는 별도의 네 입력을 사용해, 단층과 다층이 표현할 수 있는 관계를 비교합니다.</p>
    <p>같은 계산 단계의 뉴런들을 묶어 <strong>층</strong>이라고 합니다. 단층 퍼셉트론은 입력에서 바로 출력으로 판단하고, <strong>다층 퍼셉트론(MLP)</strong>은 그 사이에 중간 계산을 하는 <strong>은닉층</strong>을 둡니다.</p>
    <div className="grid gap-2 sm:grid-cols-4" aria-label="XOR 입력 선택">{xorPoints.map((item, index) => <Button key={item.inputs.join(',')} variant={selected === index ? 'primary' : 'secondary'} aria-pressed={selected === index} onClick={() => setSelected(index)}>입력 ({item.inputs.join(', ')})</Button>)}</div>
    <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-2"><XorBoundary multi={false} selected={selected} /><XorBoundary multi selected={selected} /></div>
    <div className="rounded-xl border border-indigo-300 bg-indigo-50 p-3 leading-7" aria-live="polite">
      <p><strong>선택 입력 ({point.inputs.join(', ')}) · 실제 정답 {point.answer}</strong></p>
      <p>단층의 출력 {calculation.single.output} · {calculation.single.output === point.answer ? '이 입력에서는 일치' : '이 입력에서는 불일치'} / 다층의 출력 {calculation.output.output} · {calculation.output.output === point.answer ? '일치' : '불일치'}</p>
    </div>
    <p>다층 구조의 두 은닉 뉴런은 서로 다른 기준을 계산합니다. 그 출력을 다시 조합하면 한 직선만으로 나타내기 어려운 관계를 표현할 수 있습니다.</p>
    <figure className="min-w-0 rounded-xl border border-slate-300 bg-white p-3">
      <figcaption className="font-bold">같은 선택 입력이 두 중간 판단을 거쳐 출력으로 연결됩니다.</figcaption>
      <ol className="mt-3 grid min-w-0 grid-cols-1 gap-3 md:grid-cols-[.8fr_1.2fr_1fr]">
        <li className="rounded-lg bg-slate-50 p-3"><strong>① 입력</strong><p>x₁={point.inputs[0]}<br />x₂={point.inputs[1]}</p><p className="mt-2">두 값 모두 각 은닉 뉴런으로 전달됩니다.</p></li>
        <li className="rounded-lg bg-indigo-50 p-3"><strong>② 은닉층 · 중간 판단 두 개</strong><MathExpression formula={`${point.inputs[0]}+${point.inputs[1]}-0.5=${calculation.hidden[0].z}`} /><p>은닉 1의 계단 출력 <strong>{calculation.hidden[0].output}</strong></p><MathExpression formula={`${point.inputs[0]}+${point.inputs[1]}-1.5=${calculation.hidden[1].z}`} /><p>은닉 2의 계단 출력 <strong>{calculation.hidden[1].output}</strong></p></li>
        <li className="rounded-lg bg-emerald-50 p-3"><strong>③ 출력층 · 중간값 조합</strong><MathExpression formula={String.raw`${calculation.hidden[0].output}\times1+${calculation.hidden[1].output}\times(-2)-0.5=${calculation.output.z}`} /><p>계단 출력 <strong>{calculation.output.output}</strong></p><p className="mt-2">앞 뉴런의 출력이 다음 뉴런의 입력입니다.</p></li>
      </ol>
    </figure>
    <p>이 그림은 미리 정한 가중치·편향으로 실제 계산한 설명용 모형이지, 앱에서 학습한 결과가 아닙니다. 모든 뉴런은 가중합이 0 이상이면 1을 출력합니다. 중간의 비선형 판단 없이 곱셈·덧셈만 겹치면 이런 두 경계의 조합을 만들 수 없습니다.</p>
  </div>
}

const layerRoles = [
  { name: '입력층', role: '자료의 특징값을 받아 다음 뉴런으로 전달합니다.', detail: '입력층이 가중합을 구하는 것이 아닙니다. 연결된 다음 뉴런이 받은 값에 가중치를 곱해 계산합니다.' },
  { name: '은닉층', role: '앞 층의 값을 조합하고 활성화 함수를 적용해 중간 출력을 만듭니다.', detail: '비선형 계산을 조합해 복잡한 관계를 표현할 수 있습니다. 은닉층이 없는 인공신경망도 있으며, 중간 출력은 최종 정답과 다릅니다.' },
  { name: '출력층', role: '앞 층에서 받은 값으로 문제에 맞는 최종 예측을 만듭니다.', detail: '수치 예측은 값을, 분류는 종류에 대한 판단이나 확률을 내보냅니다. 출력 목적에 맞는 함수는 다음 차시에서 비교합니다.' },
]
function AnnOverview() {
  const marker = useId()
  const [focus, setFocus] = useState(0)
  const locations = [{ x: 275, y: 110, name: '은닉 뉴런 H1' }, { x: 275, y: 262, name: '은닉 뉴런 H2' }, { x: 550, y: 186, name: '출력 뉴런' }]
  return <Box title="한 뉴런의 출력을 다른 뉴런의 입력으로">
    <p><strong>인공신경망(ANN)</strong>은 인공 뉴런들을 연결한 계산 구조입니다. 한 뉴런이 만든 출력이 다음 뉴런의 입력이 되어, 여러 판단을 조합합니다.</p>
    <figure className="min-w-0">
      <div role="region" aria-label="ANN 연결 그림 가로 스크롤" tabIndex={0} className="max-w-full overflow-x-auto rounded-xl border border-slate-300 bg-white focus-visible:outline-3 focus-visible:outline-indigo-600">
        <svg viewBox="0 0 730 390" className="mx-auto w-full min-w-[650px] max-w-[820px]" role="img" aria-label="입력층의 특징값 둘이 두 은닉 뉴런에 전달됩니다. 두 은닉 뉴런의 출력 h₁,h₂가 출력 뉴런의 입력으로 모입니다. 굵은 테두리는 관찰할 뉴런입니다.">
          <defs><marker id={marker} markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><path d="M0 0L10 4L0 8Z" fill="#64748b" /></marker></defs>
          <rect x="15" y="22" width="136" height="320" rx="14" fill="#ecfeff" /><rect x="195" y="22" width="160" height="320" rx="14" fill="#f5f3ff" /><rect x="470" y="22" width="160" height="320" rx="14" fill="#fff7ed" />
          <text x="83" y="54" textAnchor="middle" fontSize="21" fontWeight="bold" fill="#0e7490">입력층</text><text x="275" y="54" textAnchor="middle" fontSize="21" fontWeight="bold" fill="#6d28d9">은닉층</text><text x="550" y="54" textAnchor="middle" fontSize="21" fontWeight="bold" fill="#b45309">출력층</text>
          {[110, 262].flatMap(y => [110, 262].map(hy => <path key={`${y}-${hy}`} d={`M115 ${y}L232 ${hy}`} fill="none" stroke="#94a3b8" strokeWidth="2" markerEnd={`url(#${marker})`} />))}
          {[110, 262].map((y, index) => <g key={y}>
            <circle cx="83" cy={y} r="31" fill="white" stroke="#0e7490" strokeWidth="2" /><text x="83" y={y + 7} textAnchor="middle" fontSize="21">x{['₁', '₂'][index]}</text>
            <path d={`M317 ${y}H388L507 186`} fill="none" stroke={focus === index || focus === 2 ? '#6d28d9' : '#94a3b8'} strokeWidth="3" markerEnd={`url(#${marker})`} />
            <rect x="360" y={y - 31} width="68" height="38" rx="7" fill="white" stroke="#c4b5fd" /><text x="394" y={y - 6} textAnchor="middle" fontSize="21">h{['₁', '₂'][index]}</text>
          </g>)}
          {locations.map((node, index) => <g key={node.name}>
            <circle cx={node.x} cy={node.y} r="40" fill="white" stroke={index === 2 ? '#b45309' : '#6d28d9'} strokeWidth={focus === index ? 5 : 2} />
            <text x={node.x} y={node.y - 3} textAnchor="middle" fontSize="17">가중합</text><text x={node.x} y={node.y + 21} textAnchor="middle" fontSize="17">+ 활성화</text>
          </g>)}
          <path d="M594 186H670" fill="none" stroke="#b45309" strokeWidth="3" markerEnd={`url(#${marker})`} /><text x="690" y="192" textAnchor="middle" fontSize="25">ŷ</text>
          <text x="83" y="328" textAnchor="middle" fontSize="17">특징값 전달</text><text x="275" y="328" textAnchor="middle" fontSize="17">중간 출력</text><text x="550" y="328" textAnchor="middle" fontSize="17">최종 예측</text>
          <text x="365" y="375" textAnchor="middle" fontSize="18">h₁·h₂는 은닉층의 출력이면서 출력 뉴런으로 들어가는 입력입니다.</text>
        </svg>
      </div>
      <figcaption className="mt-2">입력층은 특징값을 전달합니다. 가중합·활성화 계산은 그 값을 받는 은닉·출력 뉴런 안에서 이루어집니다.</figcaption>
    </figure>
    <div className="grid gap-2 sm:grid-cols-3">{locations.map((node, index) => <Button key={node.name} variant={focus === index ? 'primary' : 'secondary'} aria-pressed={focus === index} onClick={() => setFocus(index)}>{node.name} 관찰</Button>)}</div>
    <p aria-live="polite">{focus === 2 ? '출력 뉴런은 h₁과 h₂를 각각 받아 가중치로 조합합니다. 앞 뉴런의 출력이 다음 계산의 재료가 됩니다.' : `H${focus + 1}은 x₁과 x₂를 모두 받아 계산합니다. 서로 다른 가중치·편향을 쓸 수 있으므로 같은 입력에서도 다른 중간 출력을 만들 수 있습니다.`}</p>
  </Box>
}
function LayersAndDepth({ depthOnly = false }: { depthOnly?: boolean }) {
  const [selected, setSelected] = useState(1)
  const [depth, setDepth] = useState(1)
  const marker = useId()
  const columns = depth + 2
  const width = columns * 125 + 20
  return <div className="grid gap-4">
    <p>{depthOnly ? <><strong>다층 퍼셉트론(MLP)</strong>은 은닉층을 두어 중간 출력을 조합하는 신경망입니다. 여러 은닉층으로 깊어진 신경망을 <strong>심층 신경망(DNN)</strong>이라고 하며, 딥러닝은 이런 여러 단계의 표현을 학습합니다.</> : <><strong>층</strong>은 같은 처리 단계의 단위들을 묶은 것입니다. 입력층과 출력층 사이에서 중간 계산을 하는 층을 <strong>은닉층</strong>이라고 합니다.</>}</p>
    <div className="grid gap-2 sm:grid-cols-3">{layerRoles.map((layer, index) => <Button key={layer.name} variant={selected === index ? 'primary' : 'secondary'} aria-pressed={selected === index} onClick={() => setSelected(index)}>{layer.name}</Button>)}</div>
    <section className="rounded-xl border-2 border-indigo-500 bg-indigo-50 p-3 leading-7" aria-live="polite">
      <h4 className="font-bold">{layerRoles[selected].name}의 역할</h4><p>{layerRoles[selected].role}</p><p>{layerRoles[selected].detail}</p>
    </section>
    {depthOnly && <div className="flex flex-wrap gap-2">{[0, 1, 3].map(value => <Button key={value} variant={depth === value ? 'primary' : 'secondary'} aria-pressed={depth === value} onClick={() => setDepth(value)}>은닉층 {value}개 비교</Button>)}</div>}
    <div role="region" aria-label="입력층 은닉층 출력층 구조 가로 스크롤" tabIndex={0} className="max-w-full overflow-x-auto rounded-xl border border-slate-300 bg-white focus-visible:outline-3 focus-visible:outline-indigo-600">
      <svg viewBox={`0 0 ${width} 260`} className="w-full" style={{ minWidth: width }} role="img" aria-label={`입력층, 은닉층 ${depth}개, 출력층. 선택한 ${layerRoles[selected].name}은 굵은 테두리로 강조됩니다. 층의 역할과 깊이를 비교하는 개념 그림입니다.`}>
        <defs><marker id={marker} markerWidth="7" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0 0L7 3L0 6Z" fill="#64748b" /></marker></defs>
        {Array.from({ length: columns - 1 }, (_, column) => [90, 170].flatMap(from => [90, 170].map(to => <line key={`${column}-${from}-${to}`} x1={column * 125 + 83} y1={from} x2={(column + 1) * 125 + 34} y2={to} stroke="#94a3b8" strokeWidth="2" markerEnd={`url(#${marker})`} />)))}
        {Array.from({ length: columns }, (_, column) => {
          const type = column === 0 ? 0 : column === columns - 1 ? 2 : 1
          return <g key={column}>
            <text x={column * 125 + 60} y="32" textAnchor="middle" fontSize="16" fontWeight="bold">{type === 1 ? `은닉층 ${column}` : layerRoles[type].name}</text>
            {[90, 170].map((y, row) => <g key={y}><circle cx={column * 125 + 60} cy={y} r="23" fill={['#ecfeff', '#f5f3ff', '#fff7ed'][type]} stroke={['#0e7490', '#6d28d9', '#b45309'][type]} strokeWidth={type === selected ? 4 : 1.5} /><text x={column * 125 + 60} y={y + 6} textAnchor="middle" fontSize="17">{type === 0 ? `x${['₁', '₂'][row]}` : type === 1 ? '계산' : '출력'}</text></g>)}
          </g>
        })}
        <text x="20" y="236" fontSize="16">원: 뉴런 · 선: 값을 전달하는 연결</text>
      </svg>
    </div>
    {depthOnly && <p aria-live="polite"><strong>현재 은닉층 {depth}개: </strong>{depth === 0 ? '입력 특징값이 출력 뉴런으로 바로 전달됩니다. 은닉층 없이도 인공신경망을 구성할 수 있습니다.' : depth === 1 ? '중간 계산 한 층을 둔 다층 퍼셉트론입니다.' : '여러 중간 계산층을 이어 가는 심층 신경망입니다.'}</p>}
    <p>{depthOnly ? '깊이는 한 층의 뉴런 수가 아니라, 중간 계산을 몇 층에 걸쳐 이어 가는가와 관련됩니다. 층을 더하면 표현을 다시 조합할 수 있지만 계산량도 늘고, 새 자료의 예측이 항상 더 좋아지는 것은 아닙니다.' : '은닉층은 복잡한 비선형 관계를 중간 표현으로 만드는 데 쓰입니다. 모든 인공신경망에 은닉층이 꼭 있어야 하는 것은 아닙니다.'}</p>
  </div>
}

export function LayersConcept({ mode }: { mode?: 'overview' | 'roles' | 'comparison' | 'depth' }) {
  const [scene, setScene] = useState<'xor' | 'layers'>('xor')
  if (mode === 'overview') return <AnnOverview />
  if (mode === 'roles') return <Box title="받는 값 · 계산하는 일 · 보내는 값"><LayersAndDepth /></Box>
  if (mode === 'comparison') return <Box title="같은 자료를 단층과 다층으로 비교"><XorComparison /></Box>
  if (mode === 'depth') return <Box title="MLP·DNN과 깊이"><LayersAndDepth depthOnly /></Box>
  return <Box title="한 뉴런의 한계에서 여러 층으로">
    <nav aria-label="단층과 다층 설명 이동" className="grid gap-2 sm:grid-cols-2">
      <Button variant={scene === 'xor' ? 'primary' : 'secondary'} aria-pressed={scene === 'xor'} onClick={() => setScene('xor')}>같은 네 입력 · 단층과 다층 비교</Button>
      <Button variant={scene === 'layers' ? 'primary' : 'secondary'} aria-pressed={scene === 'layers'} onClick={() => setScene('layers')}>입력층·은닉층·출력층과 깊이</Button>
    </nav>
    <div hidden={scene !== 'xor'}><XorComparison /></div>
    <div hidden={scene !== 'layers'}><LayersAndDepth /></div>
    <p>설명 이동과 점·층 선택은 관찰 대상만 바꾸며 답안이나 완료 기록을 바꾸지 않습니다.</p>
  </Box>
}
