import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { TEXTBOOK_KERNEL } from './lesson09Data'
import type { Matrix } from './cnnMath'
import { displayIntensity, intensityRange, loadPetImage, type PetImageData } from './petImageProcessing'
import PetSourceImage from './PetSourceImage'
import { DensePhotoExample, PhotoPoolingDetail } from './PetDetailDiagrams'

const stages = ['크기 조절·흑백', '픽셀 배열', '합성곱·특징 맵', '렐루(ReLU)', '최대 풀링', '차원 변환'] as const
const help = [
  '원본 비율을 유지하여 가로 64픽셀로 축소하고, 색상 값을 밝기 정보로 바꿉니다. 세로 크기만 가장 가까운 정수로 반올림합니다.',
  '흑백 이미지를 이루는 각 칸이 실제 배열의 값입니다. 그림과 숫자는 같은 데이터의 두 표현이며, 이 단계에서 값이나 위치를 바꾸지 않습니다.',
  '선택한 3×3 영역과 고정 필터의 같은 위치를 곱해 모두 더합니다. 편향은 0으로 둡니다. 한 칸 이동(스트라이드 1), 테두리 추가 없음(패딩 없음) 조건입니다. 이 합이 특징 맵의 한 칸이 됩니다.',
  '활성화 함수(Activation function)는 신경망이 복잡한 관계를 표현하도록 중간에 적용하는 함수입니다. 렐루(ReLU) 함수는 max(0, 값)을 계산하여 음수는 0으로 바꾸고 양수와 0은 그대로 다음 처리에 전달합니다.',
  '겹치지 않는 2×2 영역마다 실제 최댓값 하나를 남깁니다. 값의 수와 세부 정보 일부가 줄며, 더 선명하거나 더 정확해진다는 뜻은 아닙니다.',
  '풀링 결과를 첫 행부터 왼쪽→오른쪽으로 읽고 다음 행을 이어 붙입니다. 값과 순서는 유지되고 2차원 격자가 1차원 배열이 됩니다.',
]
// Modes select the explanation. Only explicit pixel selection can report activity to the caller.
const modes = {
  pixels: { stages: [1], title: '사진의 실제 픽셀 살펴보기', intro: '원본 사진을 축소한 흑백 이미지와 숫자 격자를 연결합니다. 칸을 선택하면 위치·밝기값이 함께 바뀝니다.' },
  spatial: { stages: [1], title: '사진에서 이웃한 픽셀 살펴보기', intro: '원본 → 비율을 유지한 축소·흑백 → 이웃한 3×3 칸을 비교하세요. 이웃한 칸의 가로·세로 관계를 살펴보는 것이 CNN의 출발점입니다.' },
  convolution: { stages: [2], title: '사진 한 영역에 같은 합성곱 원리 적용하기', intro: '작은 격자와 다른 입력인 사진에 같은 원리를 적용하는 보충 설명입니다. 사진에는 교과서의 3×3 필터를 사용합니다.' },
  feature: { stages: [2, 3], title: '필터 이동에서 전체 특징 맵으로', intro: '필터 위치를 옮기면 입력 영역과 대응하는 결과 칸이 함께 바뀝니다. 이어서 같은 특징 맵의 ReLU 전후를 비교할 수 있습니다.' },
  pooling: { stages: [4], title: '사진의 특징 맵에서 대표값 남기기', intro: '전체 특징 맵과 풀링 결과를 먼저 비교하고, 아래에서 일부 4×4를 네 영역으로 나누어 2×2로 줄이는 과정을 확인하세요.' },
  dense: { stages: [5], title: '풀링 결과에서 배열·완전 연결층으로', intro: '선택한 풀링 칸이 행 우선 배열의 어느 위치인지 찾고, 같은 실제 입력값이 뉴런 A·B에 연결되는 설명용 모형을 살펴보세요.' },
} satisfies Record<string, { stages: number[]; title: string; intro: string }>
type LabMode = keyof typeof modes
type PhotoMode = LabMode | 'review'
type Selection = { row: number; column: number; size: number }
const bound = (value: number, max: number) => Math.max(0, Math.min(max, value))
const fixedRange = { min: 0, max: 255 }
const convolutionPhases = ['영역 보기', '곱하기', '합산', '결과 칸'] as const
// Hand-picked visual landmarks in the source photo, not model detections.
const photoPositions = [
  { name: '큰 고양이 머리 주변', x: 0.21, y: 0.2 },
  { name: '작은 고양이 주변', x: 0.5, y: 0.45 },
  { name: '강아지 주변', x: 0.77, y: 0.27 },
]

function MatrixImage({ values, label, selection, onSelect, range, strip = false, keyStep = 1, revealThrough }: {
  values: Matrix; label: string; selection?: Selection; onSelect?: (row: number, column: number) => void
  range: { min: number; max: number }; strip?: boolean; keyStep?: number; revealThrough?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rows = values.length
  const columns = values[0].length
  useEffect(() => {
    const context = canvasRef.current?.getContext('2d')
    if (!context) return
    const pixels = context.createImageData(columns, rows)
    values.forEach((row, r) => row.forEach((value, c) => {
      const i = (r * columns + c) * 4
      const brightness = displayIntensity(value, range)
      pixels.data.set([brightness, brightness, brightness, 255], i)
    }))
    context.putImageData(pixels, 0, 0)
  }, [values, rows, columns, range])
  return <figure className="min-w-0 rounded-xl border border-slate-300 bg-white p-3">
    <figcaption className="mb-2 text-sm font-bold">{label} · 가로 {columns} × 세로 {rows}</figcaption>
    <div className={strip ? 'overflow-x-auto rounded border border-slate-400 focus-visible:outline-2 focus-visible:outline-indigo-600' : ''} tabIndex={strip ? 0 : undefined} role={strip ? 'region' : undefined} aria-label={strip ? '차원 변환 전체 배열 그림 · 좌우 스크롤 가능' : undefined}>
      <div className="relative" style={strip ? { width: columns * 3, height: 44 } : undefined}>
        <canvas ref={canvasRef} width={columns} height={rows} role="img" aria-label={`${label}: 실제 계산 배열의 밝기 표현`} className="block w-full" style={{ imageRendering: 'pixelated', ...(strip ? { height: 44 } : {}) }} />
        {revealThrough !== undefined && <svg viewBox={`0 0 ${columns} ${rows}`} preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true"><rect x={revealThrough % columns + 1} y={Math.floor(revealThrough / columns)} width={columns - revealThrough % columns - 1} height="1" fill="#e2e8f0" /><rect x="0" y={Math.floor(revealThrough / columns) + 1} width={columns} height={rows - Math.floor(revealThrough / columns) - 1} fill="#e2e8f0" /></svg>}
        {selection && <svg viewBox={`0 0 ${columns} ${rows}`} preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true"><rect x={selection.column} y={selection.row} width={selection.size} height={selection.size} fill="none" stroke="white" strokeWidth="4" vectorEffect="non-scaling-stroke" /><rect x={selection.column} y={selection.row} width={selection.size} height={selection.size} fill="none" stroke="#c2410c" strokeWidth="2" vectorEffect="non-scaling-stroke" /></svg>}
        {onSelect && <button type="button" aria-label={`${label} 위치 선택 · 방향키로 한 칸 이동`} className="absolute inset-0 min-h-11 w-full cursor-crosshair focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={event => { const rect = event.currentTarget.getBoundingClientRect(); onSelect(bound(Math.floor((event.clientY - rect.top) / rect.height * rows), rows - 1), bound(Math.floor((event.clientX - rect.left) / rect.width * columns), columns - 1)) }}
          onKeyDown={event => { const directions: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }; const delta = directions[event.key]; if (delta && selection) { event.preventDefault(); onSelect(bound(selection.row + delta[0] * keyStep, rows - 1), bound(selection.column + delta[1] * keyStep, columns - 1)) } }} />}
      </div>
    </div>
  </figure>
}

function SmallGrid({ values, label, selected, onSelect, grayscale = false }: { values: Matrix; label: string; selected?: number; onSelect?: (index: number) => void; grayscale?: boolean }) {
  return <div className="min-w-0"><p className="mb-2 text-sm font-bold">{label}</p><div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${values[0].length}, minmax(0, 1fr))` }}>
    {values.flat().map((value, index) => <button key={index} type="button" disabled={!onSelect} onClick={() => onSelect?.(index)} aria-pressed={selected === index} aria-label={`${label} ${Math.floor(index / values[0].length) + 1}행 ${index % values[0].length + 1}열 값 ${value}`}
      style={grayscale ? { backgroundColor: `rgb(${value},${value},${value})`, color: value < 128 ? 'white' : '#0f172a' } : undefined}
      className={`min-h-12 min-w-0 rounded-md border px-1 py-2 text-center disabled:opacity-100 ${selected === index ? 'border-orange-700 bg-orange-100 ring-2 ring-orange-600' : 'border-slate-300 bg-white'}`}><span className={`block text-xs ${grayscale ? '' : 'text-slate-600'}`}>#{index + 1}</span><strong className="font-mono text-sm">{value}</strong></button>)}
  </div></div>
}

function LoadedLab({ data, mode, onPixelSelect }: { data: PetImageData; mode: LabMode; onPixelSelect?: (row: number, column: number) => void }) {
  const allowedStages = modes[mode].stages
  const [stage, setStage] = useState(allowedStages[0])
  const [cursor, setCursor] = useState(mode === 'feature' ? { row: 0, column: 0 } : { row: 12, column: 14 })
  const [term, setTerm] = useState(0)
  const [convolutionPhase, setConvolutionPhase] = useState(0)
  const [showWholeMap, setShowWholeMap] = useState(false)
  const flatImage = useMemo(() => [data.flattened], [data])
  const grayFlat = useMemo(() => data.gray.flat(), [data])
  const mapRange = useMemo(() => intensityRange(data.feature), [data])
  const reluUnchanged = useMemo(() => data.feature.every((row, r) => row.every((value, c) => value === data.relu[r][c])), [data])
  const isPool = stage >= 4
  const target = stage < 2 ? data.gray : isPool ? data.pooled : data.feature
  const rows = target.length
  const columns = target[0].length
  const row = bound(cursor.row, rows - 1)
  const column = bound(cursor.column, columns - 1)
  const index = row * columns + column
  const select = (r: number, c: number) => {
    const next = { row: bound(r, rows - 1), column: bound(c, columns - 1) }
    setCursor(next)
    if (mode === 'pixels') onPixelSelect?.(next.row, next.column)
  }
  const move = (delta: number) => { const next = bound(index + delta, rows * columns - 1); select(Math.floor(next / columns), next % columns) }
  const inputRow = isPool ? row * 2 : row
  const inputColumn = isPool ? column * 2 : column
  const boxSize = stage < 2 ? 1 : stage < 4 ? 3 : 4
  const sourceBox = <rect x={inputColumn / data.width * 1672} y={inputRow / data.height * 941} width={boxSize / data.width * 1672} height={boxSize / data.height * 941} fill="#f97316" fillOpacity="0.18" stroke="#c2410c" strokeWidth="3" vectorEffect="non-scaling-stroke" />
  const patchRow = stage < 2 ? bound(row - 1, data.height - 3) : row
  const patchColumn = stage < 2 ? bound(column - 1, data.width - 3) : column
  const patch = data.gray.slice(patchRow, patchRow + 3).map(values => values.slice(patchColumn, patchColumn + 3))
  const products = patch.map((values, r) => values.map((value, c) => value * TEXTBOOK_KERNEL[r][c]))
  const poolPatch = data.relu.slice(row * 2, row * 2 + 2).map(values => values.slice(column * 2, column * 2 + 2))
  const pooledWindowStart = Math.max(0, index - 3)
  const arrayStart = Math.max(0, row * data.width + column - 3)
  const rawPixel = data.gray[row]?.[column]
  const sourceRange = {
    left: Math.floor(inputColumn / data.width * data.originalWidth), top: Math.floor(inputRow / data.height * data.originalHeight),
    right: Math.ceil((inputColumn + boxSize) / data.width * data.originalWidth), bottom: Math.ceil((inputRow + boxSize) / data.height * data.originalHeight),
  }

  return <div className="mt-4 min-w-0 space-y-4">
    {mode !== 'pixels' && mode !== 'dense' && <p className="text-sm leading-6">{modes[mode].intro}</p>}
    {stage >= 2 && <p className="text-sm leading-6">사진의 실제 처리값입니다. 고정 필터의 원리 설명이지 학습된 CNN의 예측 결과는 아닙니다.</p>}
    {allowedStages.length > 1 && <div className="flex flex-wrap gap-2" role="group" aria-label="이 STEP의 사진 처리 비교">{allowedStages.map(value => <Button key={value} variant={stage === value ? 'primary' : 'secondary'} aria-pressed={stage === value} onClick={() => setStage(value)}>{stages[value]}</Button>)}</div>}
    <Button variant="ghost" onClick={() => { setStage(allowedStages[0]); setCursor(mode === 'feature' ? { row: 0, column: 0 } : { row: 12, column: 14 }); setTerm(0); setConvolutionPhase(0); setShowWholeMap(false) }}>사진 설명 다시 보기</Button>
    <h4 className="text-lg font-black">{mode === 'spatial' ? '축소·흑백과 이웃한 픽셀' : stages[stage]}</h4>
    {stage === 1 && <p className="rounded-lg bg-slate-100 p-3 text-sm leading-6">원본 {data.originalWidth}×{data.originalHeight} → 비율을 유지한 흑백 {data.width}×{data.height}입니다. 밝은 칸일수록 0~255 사이의 값이 큽니다. {mode === 'spatial' && '선택한 칸과 그 주변을 숫자로 보아도 위·아래·왼쪽·오른쪽의 위치 관계는 유지됩니다.'}</p>}
    {stage !== 1 && <p className="text-sm leading-6" aria-live="polite">{stage === 5 ? '펼치기는 값과 순서를 유지합니다. 완전 연결층은 그 값에 가중치를 곱해 더하고 편향을 더합니다.' : help[stage]}</p>}
    {stage === 3 && <p className="rounded-lg bg-amber-50 p-3 text-sm leading-6">왜 중간에 다른 계산을 넣을까요? 2배한 뒤 3배하는 계산은 결국 6배하는 한 번의 계산으로 합칠 수 있습니다. 곱하고 더하는 층만 쌓으면 복잡한 관계를 표현하는 데 한계가 있습니다. ReLU처럼 입력에 따라 처리 방식이 달라지는 <strong>비선형 계산</strong>을 넣으면 이 한계를 줄일 수 있습니다. 아래에서는 음수가 없어 값이 그대로여도 올바른 결과입니다.</p>}
    {stage === 2 && mode === 'convolution' && <div className="space-y-3 rounded-xl border border-violet-300 bg-white p-3">
      <p className="text-sm font-bold">사진 속 익숙한 위치부터 살펴보기</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="사진 속 합성곱 위치">{photoPositions.map(position => {
        const r = bound(Math.floor(position.y * data.height), rows - 1)
        const c = bound(Math.floor(position.x * data.width), columns - 1)
        return <Button key={position.name} variant={row === r && column === c ? 'primary' : 'secondary'} aria-pressed={row === r && column === c} onClick={() => { select(r, c); setConvolutionPhase(0) }}>{position.name}</Button>
      })}</div>
      <p className="text-sm leading-6">위치는 사진을 보고 정한 설명용 지점입니다. 아래 테두리는 그 주변의 작은 3×3 영역이며 동물 전체나 모델의 탐지 상자가 아닙니다.</p>
    </div>}
    <div className={`grid items-start gap-3 ${stage >= 3 || mode === 'convolution' ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
      {stage < 3 && <figure className="min-w-0 rounded-xl border border-slate-300 bg-white p-3"><figcaption className="mb-2 text-sm font-bold">원본과 비교 · 원본 {data.originalWidth}×{data.originalHeight}</figcaption><PetSourceImage overlay={sourceBox} /><p className="mt-2 text-xs leading-5">원본 대응 영역: x {sourceRange.left}~{sourceRange.right}, y {sourceRange.top}~{sourceRange.bottom} (끝 제외). 축소한 한 칸은 원본 한 픽셀과 같지는 않습니다.</p></figure>}
      {stage === 0 && <MatrixImage values={data.gray} label="변환 후 · 축소한 흑백 이미지" range={fixedRange} selection={{ row, column, size: 1 }} onSelect={select} />}
      {stage === 1 && <><MatrixImage values={data.gray} label="변환 전 · 밝기 이미지" range={fixedRange} selection={{ row, column, size: 1 }} onSelect={select} /><div className="min-w-0 rounded-xl border border-slate-300 bg-white p-3"><p className="mb-2 text-sm font-bold">변환 후 · 같은 {data.width}×{data.height} 픽셀의 숫자 표현</p><SmallGrid values={patch} grayscale label="선택 주변 3×3 확대" selected={(row - patchRow) * 3 + column - patchColumn} onSelect={i => select(patchRow + Math.floor(i / 3), patchColumn + i % 3)} /><p className="mt-2 text-sm"><strong>{rawPixel}</strong>: [{row}][{column}] 칸의 밝기값입니다. 칸을 누르면 사진의 테두리도 함께 바뀝니다.</p></div></>}
      {stage === 2 && <><MatrixImage values={data.gray} label="변환 전 · 입력 3×3 영역 선택" range={fixedRange} selection={{ row, column, size: 3 }} onSelect={select} />{mode === 'feature' && <MatrixImage values={data.feature} label="변환 후 · 실제 특징 맵" range={mapRange} selection={{ row, column, size: 1 }} onSelect={select} revealThrough={showWholeMap ? undefined : index} />}</>}
      {stage === 3 && <><MatrixImage values={data.feature} label="변환 전 · 특징 맵" range={mapRange} selection={{ row, column, size: 1 }} onSelect={select} /><MatrixImage values={data.relu} label="변환 후 · ReLU 결과" range={mapRange} selection={{ row, column, size: 1 }} onSelect={select} /></>}
      {stage === 4 && <><MatrixImage values={data.relu} label="변환 전 · ReLU의 2×2 영역" range={mapRange} selection={{ row: row * 2, column: column * 2, size: 2 }} keyStep={2} onSelect={(r, c) => select(Math.floor(r / 2), Math.floor(c / 2))} /><MatrixImage values={data.pooled} label="변환 후 · 최대 풀링" range={mapRange} selection={{ row, column, size: 1 }} onSelect={select} /></>}
      {stage === 5 && <><MatrixImage values={data.pooled} label="변환 전 · 풀링 결과" range={mapRange} selection={{ row, column, size: 1 }} onSelect={select} /><MatrixImage values={flatImage} label="변환 후 · 행 우선 한 줄 배열" range={mapRange} selection={{ row: 0, column: index, size: 1 }} strip /></>}
    </div>
    {mode === 'feature' && stage === 2 && <div className="space-y-2 rounded-lg border border-violet-200 bg-white p-3"><p className="text-sm leading-6" aria-live="polite">{showWholeMap ? `전체 ${rows * columns}칸의 실제 계산 결과를 비교합니다.` : `첫 칸부터 현재 ${index + 1}번째 결과 칸까지 표시합니다. 나머지 회색 영역은 아직 표시하지 않은 칸이며 계산값 0이 아닙니다.`} 이전·다음 위치로 이동하거나 그림을 선택해 대응을 살펴보세요. 전체 배열은 이미 계산되어 있고, 이 조작은 보이는 범위만 바꿉니다.</p><Button variant="secondary" aria-pressed={showWholeMap} onClick={() => setShowWholeMap(value => !value)}>{showWholeMap ? '현재 위치까지 보기' : '전체 특징 맵 보기'}</Button></div>}
    <details><summary className="min-h-11 cursor-pointer py-2 text-sm font-bold">위치 이동 도구 · 슬라이더와 이전·다음</summary>
    <fieldset className="rounded-xl border border-orange-300 bg-orange-50 p-3"><legend className="px-1 text-sm font-bold">{stage === 2 ? '필터 시작 위치' : stage >= 4 ? '풀링 결과 위치' : '확인할 위치'} · 0부터 시작하는 행·열</legend><p className="text-sm leading-6">그림 선택이 기본 조작입니다. 여기서는 같은 위치를 슬라이더나 버튼으로 옮길 수 있습니다.</p><div className="mt-2 grid gap-3 sm:grid-cols-2"><label className="min-w-0 text-sm font-bold">행 {row} / {rows - 1}<input aria-label="사진 실습 행" type="range" className="block min-h-11 w-full" min={0} max={rows - 1} value={row} onChange={event => select(Number(event.target.value), column)} /></label><label className="min-w-0 text-sm font-bold">열 {column} / {columns - 1}<input aria-label="사진 실습 열" type="range" className="block min-h-11 w-full" min={0} max={columns - 1} value={column} onChange={event => select(row, Number(event.target.value))} /></label></div><div className="mt-2 flex flex-wrap gap-2"><Button variant="secondary" disabled={index === 0} onClick={() => move(-1)}>이전 위치</Button><Button variant="secondary" disabled={index === rows * columns - 1} onClick={() => move(1)}>다음 위치</Button></div></fieldset>
    </details>
    {mode !== 'convolution' && <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-sm leading-6" role="status">
      {stage < 2 ? <><strong>픽셀[{row}][{column}] = {rawPixel} · 선택한 칸의 밝기</strong>{mode === 'spatial' ? <p>테두리 칸과 위·아래·왼쪽·오른쪽 칸의 위치를 비교하세요. 작은 영역의 관계를 살펴보는 방식과, 아래의 한 줄 배열 표현을 연결해 보세요.</p> : <details className="mt-2"><summary className="min-h-11 cursor-pointer rounded py-2 font-bold focus-visible:outline-2 focus-visible:outline-indigo-600">밝기 계산과 배열 위치 자세히 보기</summary><p>행 우선 index = {row} × {data.width} + {column} = {row * data.width + column}. 전체 {data.width * data.height}개 값이며 MNIST의 28×28(784개)와 다른 크기입니다.</p><p>밝기 = 반올림(0.299×R + 0.587×G + 0.114×B). 흑백 배열은 0~255 정수입니다. 투명한 픽셀은 흰 배경과 합성합니다.</p><p>배열 일부 (index {arrayStart}부터): {grayFlat.slice(arrayStart, arrayStart + 10).join(', ')} …</p></details>}</>
        : stage === 2 ? <><strong>특징 맵[{row}][{column}] = {data.feature[row][column]}</strong><p>선택 영역의 실제 값과 고정 필터를 곱한 합입니다. 동물일 확률이 아니며, 이 필터가 모든 윤곽을 찾는다는 뜻도 아닙니다.</p></>
          : stage === 3 ? <><strong>max(0, {data.feature[row][column]}) = {data.relu[row][column]}</strong><p>{reluUnchanged ? '이 사진의 밝기값과 교과서 필터는 음수가 없어서 전체 특징 맵에서 ReLU 전후가 같습니다.' : '음수인 칸만 0으로 바뀌고 다른 값은 유지됩니다.'}</p></>
            : stage === 4 ? <><strong>max({poolPatch.flat().join(', ')}) = {data.pooled[row][column]}</strong><p>{data.relu[0].length}×{data.relu.length}의 {data.relu.length * data.relu[0].length}개 값 → {columns}×{rows}의 {data.flattened.length}개 대표값. 선택 영역의 최댓값이 출력의 같은 번호 칸으로 갑니다.</p></>
              : <><strong>선택한 풀링값 {data.flattened[index]} → 배열의 같은 값</strong><details className="mt-2"><summary className="min-h-11 cursor-pointer py-2 font-bold">보충 · 배열 위치와 행의 연결</summary><p>배열[{index}] = 풀링[{row}][{column}] = {data.flattened[index]}</p><p>index = {row}×{columns}+{column}. 전체 길이 {columns}×{rows} = {data.flattened.length}. 그림 막대는 {data.flattened.length}×1이며 내부에서 좌우로 스크롤할 수 있습니다.</p><p>선택 주변 (index {pooledWindowStart}부터): {data.flattened.slice(pooledWindowStart, pooledWindowStart + 10).join(', ')} …</p><p>한 행의 끝 배열[{columns - 1}] = {data.flattened[columns - 1]} → 다음 행 시작 배열[{columns}] = {data.flattened[columns]} 순서로 이어집니다.</p></details></>}
    </div>}
    {mode === 'convolution' && <section className="space-y-3 rounded-xl border border-violet-300 bg-white p-3" aria-label="사진 합성곱 단계별 대응">
      <h5 className="font-black">선택 영역 → 같은 위치끼리 곱하기 → 합산 → 결과 칸</h5>
      <div className="flex flex-wrap gap-2" role="group" aria-label="사진 합성곱 설명 단계">{convolutionPhases.map((title, i) => <Button key={title} variant={convolutionPhase === i ? 'primary' : 'secondary'} aria-pressed={convolutionPhase === i} onClick={() => setConvolutionPhase(i)}>{i + 1}. {title}</Button>)}</div>
      <p className="rounded-lg bg-violet-50 p-3 text-sm leading-6" aria-live="polite">{[
        `① 원본 테두리 안을 축소 흑백 이미지의 ${row}행 ${column}열에서 시작하는 3×3 값으로 읽습니다.`,
        `② 같은 번호 #${term + 1}끼리 대응합니다. ${patch.flat()[term]} × ${TEXTBOOK_KERNEL.flat()[term]} = ${products.flat()[term]}. 다른 번호도 선택해 보세요.`,
        `③ 아홉 곱셈 결과를 모두 더하면 ${data.feature[row][column]}입니다. 필터의 0과 곱한 항은 합에 0을 더합니다.`,
        `④ 이 합을 특징 맵[${row}][${column}]에 넣습니다. 아래 테두리 한 칸의 숫자가 같은 ${data.feature[row][column]}입니다. 전체 특징 맵은 STEP 5에서 이어 봅니다.`,
      ][convolutionPhase]}</p>
      <div className="grid gap-4 sm:grid-cols-3"><div className={`rounded-lg p-1 ${convolutionPhase === 0 ? 'ring-2 ring-violet-600' : ''}`}><SmallGrid values={patch} grayscale label="① 선택 입력 영역" selected={term} onSelect={setTerm} /></div><div className={`rounded-lg p-1 ${convolutionPhase === 1 ? 'ring-2 ring-violet-600' : ''}`}><SmallGrid values={TEXTBOOK_KERNEL} label="② 교과서 3×3 필터" selected={term} onSelect={setTerm} /></div><div className={`rounded-lg p-1 ${convolutionPhase === 1 || convolutionPhase === 2 ? 'ring-2 ring-violet-600' : ''}`}><SmallGrid values={products} label="③ 같은 위치의 곱" selected={term} onSelect={setTerm} /></div></div>
      <p className="rounded-lg bg-orange-50 p-3 text-sm font-bold">#{term + 1}: {patch.flat()[term]} × {TEXTBOOK_KERNEL.flat()[term]} = {products.flat()[term]}</p>
      <p className={`break-words rounded-lg bg-cyan-50 p-3 text-sm leading-6 ${convolutionPhase >= 2 ? 'ring-2 ring-violet-600' : ''}`}>합산: {products.flat().join(' + ')} = <strong>{data.feature[row][column]}</strong> → 특징 맵[{row}][{column}]</p>
      <div className={`rounded-xl border-2 border-violet-400 p-3 ${convolutionPhase === 3 ? 'ring-2 ring-violet-600' : ''}`}><p className="text-sm font-bold">④ 특징 맵의 해당 한 칸 · [{row}][{column}]</p><output className="mt-2 inline-block rounded-lg border-2 border-violet-600 bg-violet-50 px-6 py-3 font-mono text-lg font-black">{data.feature[row][column]}</output><p className="mt-2 text-sm leading-6">이 값은 선택 영역과 필터의 곱을 더한 결과이지, 동물일 확률이 아닙니다.</p></div>
      <div className="flex flex-wrap gap-2"><Button variant="secondary" disabled={convolutionPhase === 0} onClick={() => setConvolutionPhase(value => value - 1)}>이전 대응</Button><Button variant="secondary" disabled={convolutionPhase === 3} onClick={() => setConvolutionPhase(value => value + 1)}>다음 대응</Button><Button variant="ghost" onClick={() => { setConvolutionPhase(0); setTerm(0) }}>대응 다시 보기</Button></div>
      <p className="text-sm leading-6">교과서 필터는 밝기값을 가중합합니다. 이 그림을 ‘윤곽만 추출한 결과’로 읽지 마세요. STEP 5의 두 필터 비교처럼, 다른 필터는 같은 입력에서도 다른 반응을 만들 수 있습니다. 이 사진 풀이와 교과서 독립 계산은 서로 다른 입력입니다.</p>
    </section>}
    {stage === 4 && <PhotoPoolingDetail data={data} row={row} column={column} range={mapRange} onSelect={select} />}
    {stage === 5 && <>
      <details className="rounded-xl border border-violet-300 bg-white p-3"><summary className="min-h-11 cursor-pointer py-2 text-sm font-bold">보충 · 주변 배열 칸에서 위치 선택</summary><div className="flex flex-wrap gap-2" role="group" aria-label="실제 풀링 배열 위치 선택">{data.flattened.slice(Math.max(0, index - 2), Math.min(data.flattened.length, index + 3)).map((value, offset) => {
        const position = Math.max(0, index - 2) + offset
        return <button key={position} type="button" aria-pressed={position === index} onClick={() => select(Math.floor(position / columns), position % columns)} className={`min-h-14 rounded-lg border-2 px-3 py-2 text-sm focus-visible:outline-3 focus-visible:outline-indigo-600 ${position === index ? 'border-violet-600 bg-violet-100' : 'border-slate-300'}`}><span className="block">[{position}]{position === index ? ' ✓' : ''}</span><strong>{value}</strong></button>
      })}</div><p className="mt-2 text-sm leading-6">배열 칸을 선택해도 풀링 그림과 입력 1이 함께 바뀝니다. 위의 전체 막대에서는 좌우 스크롤로 모든 {data.flattened.length}개 위치를 볼 수 있습니다.</p></details>
      <DensePhotoExample key={index} data={data} index={index} />
    </>}
    {stage >= 2 && mode !== 'convolution' && <p className="text-sm leading-6">그림은 실제 범위 {mapRange.min}~{mapRange.max}를 표시용 밝기 0~255로 바꾼 것입니다. 계산 배열은 그대로이며, 밝기는 확률이 아닙니다.</p>}
    {stage === 5 && <p className="rounded-lg border border-violet-200 p-3 text-sm leading-6">실제 모델의 최종 분류층은 구별할 종류인 <strong>클래스(Class)</strong>마다 점수를 계산합니다. 확률로 바꾸기 전 점수가 <strong>로짓(Logit)</strong>입니다. 소프트맥스(Softmax) 함수가 이 점수를 합이 1인 확률 형태로 바꾸면 예측에 활용합니다. 모델의 확률은 실제로 맞힌 비율인 정확도와 다릅니다. 여기서는 학습된 분류층을 실행하지 않으므로 <strong>고양이·강아지 예측과 확률은 제공하지 않습니다.</strong></p>}
    {mode === 'pixels' && <p className="text-sm">칸을 선택한 다음 아래 핵심 질문에 답하세요. 다시 보기는 선택 기록을 지우지 않습니다.</p>}
  </div>
}

function LoadedOverview({ data }: { data: PetImageData }) {
  const range = useMemo(() => intensityRange(data.feature), [data])
  return <div className="mt-4 space-y-3">
    <div className="grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <figure className="min-w-0 rounded-xl border border-slate-300 bg-white p-3"><figcaption className="mb-2 text-sm font-bold">① 동물 사진 · {data.originalWidth}×{data.originalHeight}</figcaption><PetSourceImage /><p className="mt-2 text-sm leading-6">비율을 유지한 {data.width}×{data.height} 흑백 픽셀을 계산에 사용합니다.</p></figure>
      <div className="min-w-0"><MatrixImage values={data.gray} label="② 축소·흑백 이미지" range={fixedRange} /><p className="mt-2 text-sm leading-6">색상 정보를 0~255 밝기로 바꿉니다. 이웃한 칸의 위치 관계는 유지됩니다.</p></div>
      <div className="min-w-0"><MatrixImage values={data.feature} label="③ 합성곱 특징 맵" range={range} /><p className="mt-2 text-sm leading-6">3×3 고정 필터로 작은 영역의 밝기값을 가중합합니다.</p></div>
      <div className="min-w-0"><MatrixImage values={data.relu} label="④ 렐루(ReLU) 결과" range={range} /><p className="mt-2 text-sm leading-6">각 칸에 max(0, 값)을 적용합니다. 이 입력과 필터에서는 음수가 없어 전후가 같습니다.</p></div>
      <div className="min-w-0"><MatrixImage values={data.pooled} label="⑤ 최대 풀링 결과" range={range} /><p className="mt-2 text-sm leading-6">2×2마다 최댓값을 남겨 공간 크기와 값의 수를 줄입니다.</p></div>
      <div className="min-w-0 rounded-xl border border-slate-300 bg-white p-3"><h5 className="text-sm font-bold">⑥ 행 우선 한 줄 배열 · {data.flattened.length}개</h5><div className="my-3 flex flex-wrap gap-1">{data.flattened.slice(0, 6).map((value, i) => <span key={i} className="rounded border border-slate-300 bg-slate-50 p-2 text-sm"><span className="block text-xs">[{i}]</span><strong>{value}</strong></span>)}<span className="self-center">…</span></div><p className="text-sm leading-6">풀링의 첫 행부터 읽은 실제 값입니다. 나머지 {data.flattened.length - 6}개 값은 생략했습니다. 값과 순서를 바꾸지 않고 펼칩니다.</p></div>
      <DensePhotoExample data={data} index={0} compact />
    </div>
    <p className="rounded-lg bg-white p-3 text-sm leading-6">①→⑦은 같은 사진의 처리값을 연결한 복습입니다. 고정 필터가 사진의 눈·귀·얼굴을 학습해 인식한 결과는 아닙니다. 특징 맵·ReLU·풀링은 실제 값 범위 {range.min}~{range.max}를 표시용 밝기 0~255로 바꾸어 그렸습니다. 실제 CNN은 학습한 필터와 완전 연결층 등을 통해 특징을 종합하고 출력층의 소프트맥스를 분류에 활용합니다. 여기에는 동물 예측·확률이나 추가 완료 조건이 없습니다.</p>
  </div>
}

function PipelineLoader({ mode, onPixelSelect }: { mode: PhotoMode; onPixelSelect?: (row: number, column: number) => void }) {
  const [data, setData] = useState<PetImageData | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let alive = true
    loadPetImage().then(value => { if (alive) setData(value) }).catch((reason: unknown) => { if (alive) setError(reason instanceof Error ? reason.message : '이미지 처리를 완료하지 못했습니다.') })
    return () => { alive = false }
  }, [attempt])
  if (error) return <div role="alert" className="mt-4 rounded-lg bg-rose-50 p-4 text-sm"><p>이미지 로딩·처리 실패: {error}</p><Button className="mt-3" variant="secondary" onClick={() => { setError(''); setAttempt(value => value + 1) }}>사진 처리 다시 시도</Button></div>
  if (!data) return <p role="status" className="mt-4 flex items-center gap-2 text-sm"><span className="size-5 animate-spin rounded-full border-2 border-cyan-700 border-t-transparent motion-reduce:animate-none" aria-hidden="true" />원본 이미지와 설명에 사용할 실제 값 준비 중…</p>
  return mode === 'review' ? <LoadedOverview data={data} /> : <LoadedLab data={data} mode={mode} onPixelSelect={onPixelSelect} />
}

export default function PetImageLab({ mode, active, onPixelSelect }: { mode: PhotoMode; active: boolean; onPixelSelect?: (row: number, column: number) => void }) {
  // Inactive STEP components stay mounted to preserve their answers, but do not run a photo view.
  if (!active) return null
  const title = mode === 'review' ? '흐름 완성 후 복습 · 같은 사진의 전체 처리 결과' : modes[mode].title
  return <section aria-label={title} className="my-6 min-w-0 rounded-2xl border-2 border-cyan-300 bg-slate-50 p-3 sm:p-5">
    <h3 className="text-base font-black">{title}</h3>
    <PipelineLoader key={mode} mode={mode} onPixelSelect={onPixelSelect} />
  </section>
}
