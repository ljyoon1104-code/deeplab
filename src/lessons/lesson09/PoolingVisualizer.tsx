import { maxPool2D, type Matrix } from './cnnMath'
import PixelGrid from './PixelGrid'

interface PoolingVisualizerProps {
  input: Matrix
  poolSize: number
  selectedRegion: number
  checkedRegions: readonly number[]
}

export default function PoolingVisualizer({ input, poolSize, selectedRegion, checkedRegions }: PoolingVisualizerProps) {
  const output = maxPool2D(input, poolSize)
  const outputColumns = output[0].length
  const selectedRow = Math.floor(selectedRegion / outputColumns)
  const selectedColumn = selectedRegion % outputColumns
  const visibleOutput = output.map((row, rowIndex) => row.map((value, columnIndex) => {
    const regionIndex = rowIndex * outputColumns + columnIndex
    return checkedRegions.includes(regionIndex) ? value : '·'
  }))

  return (
    <div className="grid items-center gap-5 md:grid-cols-[1fr_auto_0.75fr]">
      <PixelGrid
        values={input}
        label="4×4 특성 맵"
        tone="feature"
        region={{ startRow: selectedRow * poolSize, startColumn: selectedColumn * poolSize, height: poolSize, width: poolSize }}
      />
      <div className="text-center font-black text-amber-700" aria-label="최대 풀링하여 크기 줄이기">최대 풀링 →</div>
      <PixelGrid values={visibleOutput} label="2×2 풀링 결과" tone="pool" />
    </div>
  )
}
