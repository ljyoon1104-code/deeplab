import { useMemo, useState } from 'react'
import { displayIntensity, type PetImageData } from './petImageProcessing'
import './petDiagrams.css'

const regionColors = ['#9a3412', '#1d4ed8', '#047857', '#7e22ce']

export function PhotoPoolingDetail({ data, row, column, range, onSelect }: {
  data: PetImageData; row: number; column: number; range: { min: number; max: number }
  onSelect: (row: number, column: number) => void
}) {
  // Align the enlarged patch with the existing non-overlapping pooling windows.
  const [chosenWindow, setChosenWindow] = useState<{ row: number; column: number } | null>(null)
  const keepWindow = chosenWindow && row >= chosenWindow.row && row < chosenWindow.row + 2 && column >= chosenWindow.column && column < chosenWindow.column + 2
  const anchorRow = keepWindow ? chosenWindow.row : Math.min(Math.floor(row / 2) * 2, data.pooled.length - 2)
  const anchorColumn = keepWindow ? chosenWindow.column : Math.min(Math.floor(column / 2) * 2, data.pooled[0].length - 2)
  const selectRegion = (r: number, c: number) => {
    setChosenWindow({ row: anchorRow, column: anchorColumn })
    onSelect(r, c)
  }
  const activeRegion = (row - anchorRow) * 2 + column - anchorColumn
  const regions = [0, 1, 2, 3].map(region => {
    const r = anchorRow + Math.floor(region / 2)
    const c = anchorColumn + region % 2
    return { r, c, values: data.relu.slice(r * 2, r * 2 + 2).flatMap(line => line.slice(c * 2, c * 2 + 2)), maximum: data.pooled[r][c] }
  })
  const selected = regions[activeRegion]
  return <section className="space-y-3 rounded-xl border border-emerald-300 bg-white p-3" aria-label="사진의 네 풀링 영역 확대">
    <h5 className="font-black">확대 설명 · 실제 특징 맵 일부 4×4 → 풀링 일부 2×2</h5>
    <p className="text-sm leading-6">전체 사진의 처리 크기와 다릅니다. 아래는 ReLU 결과의 {anchorRow * 2}~{anchorRow * 2 + 3}행, {anchorColumn * 2}~{anchorColumn * 2 + 3}열입니다. 번호를 누르면 전체 그림의 선택 영역도 함께 바뀝니다.</p>
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <div><p className="mb-2 text-sm font-bold">① 네 2×2 영역 · 밝기와 숫자는 같은 값</p>
        <div className="grid grid-cols-2 gap-2">{regions.map(({ r, c, values, maximum }, region) => <button key={region} type="button" onClick={() => selectRegion(r, c)} aria-pressed={region === activeRegion} aria-label={`풀링 영역 ${region + 1} 선택 · 출력 ${r}행 ${c}열`} className="min-w-0 rounded-lg border-2 p-1.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" style={{ borderColor: regionColors[region], boxShadow: region === activeRegion ? `0 0 0 2px ${regionColors[region]}` : undefined }}>
          <span className="mb-1 block text-sm font-bold" style={{ color: regionColors[region] }}>영역 {region + 1}{region === activeRegion ? ' ✓' : ''}</span>
          <span className="grid grid-cols-2 gap-1">{values.map((value, cell) => {
            const brightness = displayIntensity(value, range)
            return <span key={cell} className="flex min-h-12 min-w-0 flex-col justify-center rounded border border-slate-400 px-0.5 py-1 font-mono text-sm" style={{ backgroundColor: `rgb(${brightness},${brightness},${brightness})`, color: brightness < 128 ? 'white' : '#0f172a' }}><strong>{value}</strong><span className="font-sans text-xs">{value === maximum ? '최대' : '값'}</span></span>
          })}</span>
        </button>)}</div>
      </div>
      <div><p className="mb-2 text-sm font-bold">② 각 영역의 최댓값 → 같은 번호의 출력 칸</p>
        <div className="mb-2 rounded-lg bg-emerald-50 p-3 text-sm leading-6" aria-live="polite"><strong>영역 {activeRegion + 1}: max({selected.values.join(', ')}) = {selected.maximum}</strong><div className="pet-pool-transfer h-14 text-center" aria-hidden="true"><span key={`${row}-${column}`} className="pet-pool-value inline-block rounded border border-emerald-500 bg-white px-3 font-mono font-bold">{selected.maximum} ↓ {activeRegion + 1}번 칸</span></div><p>출력[{row}][{column}]에 {selected.maximum}을 남깁니다.</p></div>
        <div className="grid grid-cols-2 gap-2">{regions.map(({ r, c, maximum }, region) => <button key={region} type="button" onClick={() => selectRegion(r, c)} aria-pressed={region === activeRegion} aria-label={`풀링 출력 ${r}행 ${c}열 값 ${maximum}`} className="min-h-20 min-w-0 rounded-lg border-2 p-2 text-sm focus-visible:outline-3 focus-visible:outline-indigo-600" style={{ borderColor: regionColors[region], backgroundColor: region === activeRegion ? '#f0fdf4' : 'white' }}><span className="block font-bold">{region + 1}번 출력{region === activeRegion ? ' ✓' : ''}</span><strong className="block font-mono text-lg">{maximum}</strong><span className="text-xs">[{r}][{c}]</span></button>)}</div>
        <p className="mt-2 text-sm leading-6">최댓값이 같으면 여러 입력 칸에 ‘최대’가 표시되지만 출력은 한 값입니다.</p>
      </div>
    </div>
    <p className="text-sm leading-6">16개 값에서 대표값 4개를 남깁니다. 세부 위치와 작은 반응 일부는 사라지며, 풀링 자체가 고양이·강아지를 분류하는 것은 아닙니다.</p>
  </section>
}

// Deliberately assumed teaching values, not trained parameters or class predictions.
const assumedNeurons = [
  { name: 'A', weights: [1, 0.5, -1], bias: 2 },
  { name: 'B', weights: [-0.5, 1, 0.25], bias: -3 },
]

export function DensePhotoExample({ data, index, compact = false }: { data: PetImageData; index: number; compact?: boolean }) {
  const [focusedInput, setFocusedInput] = useState(0)
  const inputs = useMemo(() => [index, (index + 1) % data.flattened.length, (index + data.pooled[0].length) % data.flattened.length].map(position => ({ index: position, value: data.flattened[position] })), [data, index])
  const calculations = useMemo(() => assumedNeurons.map(neuron => {
    const products = inputs.map((input, i) => input.value * neuron.weights[i])
    return { ...neuron, products, sum: products.reduce((a, b) => a + b, 0) + neuron.bias }
  }), [inputs])
  return <section className="min-w-0 rounded-xl border border-violet-300 bg-white p-3" aria-label={compact ? '완전 연결층 축소 구조' : '실제 배열과 완전 연결층 축소 계산'}>
    <h5 className="font-black">{compact ? '⑦ 완전 연결층으로 연결' : '풀링 칸 → 배열 위치 → 완전 연결층'}</h5>
    <p className="mt-2 text-sm leading-6">{data.pooled[0].length}×{data.pooled.length} → 행 우선 {data.flattened.length}개. {compact ? '그중 세 입력과 뉴런 A·B만 그린 축소 예입니다.' : `선택한 칸은 배열[${index}] = ${data.flattened[index]}입니다. 선택 칸과 두 추가 입력만 확대하며 나머지 ${data.flattened.length - inputs.length}개는 생략했습니다.`}</p>
    <svg viewBox="0 0 300 285" className={`mx-auto block w-full ${compact ? 'max-w-xs' : 'max-w-md'}`} role="img" aria-label={`실제 배열 입력 ${inputs.map(input => input.value).join(', ')}에서 뉴런 A와 B로 각각 연결되는 여섯 선. ${focusedInput + 1}번 입력의 두 연결 강조`}>
      <g fontSize="20" fill="#0f172a" textAnchor="middle"><text x="51" y="22">실제 입력</text><text x="245" y="22">뉴런</text></g>
      {inputs.flatMap((_, i) => [0, 1].map(j => <line key={`${i}-${j}`} x1="91" y1={65 + i * 90} x2="220" y2={105 + j * 100} stroke={i === focusedInput ? '#7e22ce' : '#cbd5e1'} strokeWidth={i === focusedInput ? 3 : 1.5} />))}
      {inputs.map((input, i) => <g key={i}><rect x="4" y={43 + i * 90} width="87" height="48" rx="8" fill={i === focusedInput ? '#f3e8ff' : '#f8fafc'} stroke={i === focusedInput ? '#7e22ce' : '#64748b'} strokeWidth="2" /><text x="47" y={62 + i * 90} fontSize="18" textAnchor="middle" fill="#334155">입력 {i + 1}</text><text x="47" y={84 + i * 90} fontSize="22" fontWeight="700" textAnchor="middle" fill="#0f172a">{input.value}</text></g>)}
      {assumedNeurons.map((neuron, i) => <g key={neuron.name}><circle cx="245" cy={105 + i * 100} r="25" fill="#ede9fe" stroke="#6d28d9" strokeWidth="2" /><text x="245" y={113 + i * 100} textAnchor="middle" fontSize="24" fontWeight="700" fill="#4c1d95">{neuron.name}</text></g>)}
    </svg>
    <p className="text-sm leading-6"><strong>완전 연결층</strong>은 앞에서 얻은 반응을 가중치와 편향으로 종합합니다. A·B는 뉴런 이름이며, 동물 종류나 학습된 클래스 점수가 아닙니다.</p>
    {!compact && <>
      <div className="my-3 grid gap-2 sm:grid-cols-3" role="group" aria-label="축소 모형 입력 연결 강조">{inputs.map((input, i) => <button key={i} type="button" onClick={() => setFocusedInput(i)} aria-pressed={focusedInput === i} className={`min-h-11 min-w-0 rounded-lg border-2 p-2 text-sm focus-visible:outline-3 focus-visible:outline-indigo-600 ${focusedInput === i ? 'border-violet-600 bg-violet-50' : 'border-slate-300'}`}><strong className="block">입력 {i + 1}{focusedInput === i ? ' ✓' : ''}</strong><span>배열[{input.index}] = {input.value}</span><span className="block text-xs">풀링[{Math.floor(input.index / data.pooled[0].length)}][{input.index % data.pooled[0].length}]</span></button>)}</div>
      <p className="mb-3 rounded-lg bg-amber-50 p-3 text-sm leading-6">입력 세 값은 실제 사진의 풀링 결과이고, 가중치·편향은 설명용으로 가정했습니다. 같은 입력을 A·B가 어떻게 다르게 조합하는지 비교하세요.</p>
      <details className="mb-3 rounded-lg bg-slate-50 p-3 text-sm leading-6"><summary className="min-h-11 cursor-pointer py-2 font-bold">가중치와 편향의 뜻·시작값 알아보기</summary><p className="mt-2"><strong>가중치(Weight)</strong>는 입력의 영향 크기와 방향을 조절하는 학습 가능한 숫자입니다. 입력마다 가중치를 곱해 더한 값이 <strong>가중합(Weighted sum)</strong>이며, 뉴런에서는 여기에 <strong>편향(Bias)</strong>을 추가로 더합니다. 실제 모델의 가중치는 보통 임의의 작은 값으로, 편향은 0으로 시작하는 경우가 많고 이후 학습으로 조정합니다. 아래 숫자는 계산을 살펴보기 위해 따로 정한 설명용 값입니다.</p></details>
      <div className="grid gap-3 lg:grid-cols-2">{calculations.map(neuron => <div key={neuron.name} className="min-w-0 rounded-lg border border-violet-200 p-3 text-sm leading-6">
        <h6 className="font-black">뉴런 {neuron.name} · 가중합</h6><p>가정한 가중치 [{neuron.weights.join(', ')}], 편향 {neuron.bias}</p>
        <p className="mt-2 break-words font-bold">z{neuron.name} = {neuron.sum}</p><p>입력×가중치를 더하고 편향을 더한 가중합입니다.</p>
        <details className="mt-2"><summary className="min-h-11 cursor-pointer py-2 font-bold">곱셈과 합 자세히 보기</summary><ul className="my-2 space-y-1">{inputs.map((input, i) => <li key={i} className={`rounded px-2 py-1 ${focusedInput === i ? 'bg-violet-100 font-bold' : 'bg-slate-50'}`}>입력 {i + 1}: {input.value} × ({neuron.weights[i]}) = {neuron.products[i]}</li>)}</ul><p className="break-words">{neuron.products.map(v => `(${v})`).join(' + ')} + ({neuron.bias}) = {neuron.sum}</p></details>
      </div>)}</div>
    </>}
  </section>
}
