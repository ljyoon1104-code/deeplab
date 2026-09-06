import { ArrowDown, ArrowRight } from 'lucide-react'
import { convolveAt, type Matrix } from './cnnMath'
import PixelGrid from './PixelGrid'

interface KernelVisualizerProps {
  input: Matrix
  kernel: Matrix
  startRow: number
  startColumn: number
  outputRow?: number
  outputColumn?: number
}

export default function KernelVisualizer({
  input,
  kernel,
  startRow,
  startColumn,
  outputRow = startRow,
  outputColumn = startColumn,
}: KernelVisualizerProps) {
  const terms = kernel.flatMap((row, rowIndex) =>
    row.map((kernelValue, columnIndex) => {
      const inputValue = input[startRow + rowIndex][startColumn + columnIndex]
      return { inputValue, kernelValue, product: inputValue * kernelValue, rowIndex, columnIndex }
    }),
  )
  const result = convolveAt(input, kernel, startRow, startColumn)

  return (
    <div className="grid gap-5">
      <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_0.75fr]">
        <PixelGrid values={input} label="입력 이미지 격자" region={{ startRow, startColumn, height: kernel.length, width: kernel[0].length }} />
        <div className="flex items-center justify-center text-2xl font-black text-orange-700" aria-label="곱하기">×</div>
        <PixelGrid values={kernel} label="필터(커널)" tone="kernel" />
      </div>
      <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
        <p className="font-black text-orange-950">같은 위치끼리 곱하기</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {terms.map((term) => (
            <div key={`${term.rowIndex}-${term.columnIndex}`} className="rounded-xl bg-white p-3 text-center">
              <span className="block text-xs font-bold text-slate-500">영역 {term.rowIndex + 1}행 {term.columnIndex + 1}열</span>
              <strong className="mt-1 block font-mono">{term.inputValue} × {term.kernelValue} = {term.product}</strong>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col items-center gap-2 md:flex-row md:justify-center">
          <span className="font-mono font-black">{terms.map((term) => term.product).join(' + ')} = {result}</span>
          <ArrowDown className="text-orange-700 md:hidden" aria-hidden="true" />
          <ArrowRight className="hidden text-orange-700 md:block" aria-hidden="true" />
          <span className="rounded-xl bg-emerald-100 px-4 py-2 font-black text-emerald-900">특성 맵 {outputRow + 1}행 {outputColumn + 1}열 = {result}</span>
        </div>
      </div>
    </div>
  )
}
