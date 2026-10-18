import { maxPool2D, type Matrix } from './cnnMath'
import PixelGrid from './PixelGrid'
import type { ReactNode } from 'react'

interface PoolingVisualizerProps {
  input: Matrix
  poolSize: number
  selectedRegion: number
  checkedRegions: readonly number[]
  control?: ReactNode
}

export default function PoolingVisualizer({ input, poolSize, selectedRegion, checkedRegions, control }: PoolingVisualizerProps) {
  const output = maxPool2D(input, poolSize)
  const outputColumns = output[0].length
  const selectedRow = Math.floor(selectedRegion / outputColumns)
  const selectedColumn = selectedRegion % outputColumns
  const visibleOutput = output.map((row, rowIndex) => row.map((value, columnIndex) => {
    const regionIndex = rowIndex * outputColumns + columnIndex
    return checkedRegions.includes(regionIndex) ? value : '·'
  }))
  const showRepresentative = selectedRegion === 0 || checkedRegions.includes(selectedRegion)
  const selectedValues = input.slice(selectedRow * poolSize, (selectedRow + 1) * poolSize)
    .map(row => row.slice(selectedColumn * poolSize, (selectedColumn + 1) * poolSize))
  const maximumIndex = selectedValues.flat().indexOf(output[selectedRow][selectedColumn])
  const representative = { row: selectedRow * poolSize + Math.floor(maximumIndex / poolSize), column: selectedColumn * poolSize + maximumIndex % poolSize }
  const regionNumbers = input.map((row, r) => row.map((_, c) => String(Math.floor(r / poolSize) * outputColumns + Math.floor(c / poolSize) + 1)))

  return (
    <div className="mt-5 grid gap-4">
      <p className="text-sm leading-6"><strong>영역 #{selectedRegion + 1} → 출력 {selectedRow + 1}행 {selectedColumn + 1}열.</strong> 같은 번호의 {poolSize * poolSize}개 값 중 하나를 대표값으로 남깁니다.{showRepresentative ? ' 굵은 테두리는 이 영역의 최댓값입니다.' : ' 아직 확인하지 않은 영역의 대표값은 직접 선택하세요.'}</p>
      <div className="grid items-center gap-5 md:grid-cols-[1fr_auto_0.75fr]">
      <div className="min-w-0"><PixelGrid
        values={input}
        label="4×4 특징 맵"
        tone="feature"
        region={{ startRow: selectedRow * poolSize, startColumn: selectedColumn * poolSize, height: poolSize, width: poolSize }}
        annotations={regionNumbers}
        focusCell={showRepresentative ? representative : undefined}
      />
      {control}</div>
      <div className="text-center font-black text-amber-700" aria-label="최대 풀링하여 크기 줄이기">최대 풀링 →</div>
      <PixelGrid values={visibleOutput} label="2×2 풀링 결과 · 선택 뒤 대표값 표시" tone="pool" region={{ startRow: selectedRow, startColumn: selectedColumn, height: 1, width: 1 }} annotations={output.map((row, r) => row.map((_, c) => String(r * outputColumns + c + 1)))} />
      </div>
      <p className="rounded-xl bg-amber-50 p-3 text-sm leading-6"><strong>{input.length * input[0].length}개 값 → {output.length * outputColumns}개 대표값.</strong> 영역별 대표 반응은 남지만 나머지 값과 세부 위치 정보 일부는 줄어듭니다. 다음 처리에 전달할 값의 수는 줄어도 정확도가 항상 높아지는 것은 아닙니다.</p>
    </div>
  )
}
