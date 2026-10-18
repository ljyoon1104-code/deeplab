import { ArrowDown, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { convolveAt, convolve2D, type Matrix } from './cnnMath'
import PixelGrid from './PixelGrid'

interface KernelVisualizerProps {
  input: Matrix
  kernel: Matrix
  startRow: number
  startColumn: number
  outputRow?: number
  outputColumn?: number
  showCalculation?: boolean
}

export default function KernelVisualizer({
  input,
  kernel,
  startRow,
  startColumn,
  outputRow = startRow,
  outputColumn = startColumn,
  showCalculation = true,
}: KernelVisualizerProps) {
  const [stage, setStage] = useState(0)
  const terms = kernel.flatMap((row, rowIndex) =>
    row.map((kernelValue, columnIndex) => {
      const inputValue = input[startRow + rowIndex][startColumn + columnIndex]
      return { inputValue, kernelValue, product: inputValue * kernelValue, rowIndex, columnIndex }
    }),
  )
  const result = convolveAt(input, kernel, startRow, startColumn)
  const featureMap = convolve2D(input, kernel)
  const term = terms[stage - 1]
  const finalStage = terms.length + 1
  const inputNumbers = input.map((row, r) => row.map((_, c) =>
    r >= startRow && r < startRow + kernel.length && c >= startColumn && c < startColumn + kernel[0].length
      ? String((r - startRow) * kernel[0].length + c - startColumn + 1) : '',
  ))
  const kernelNumbers = kernel.map((row, r) => row.map((_, c) => String(r * row.length + c + 1)))
  const visibleMap = featureMap.map((row, r) => row.map((_, c) =>
    r === outputRow && c === outputColumn && showCalculation && stage === finalStage ? result : '?',
  ))

  return (
    <div className="grid gap-5">
      <p className="font-black text-slate-800">{input.length}×{input[0].length} 입력 · {kernel.length}×{kernel[0].length} 필터 · 특징 맵 {outputRow + 1}행 {outputColumn + 1}열 연결</p>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm leading-6" aria-live="polite" aria-atomic="true">
          <strong>설명 {stage + 1}/{finalStage + 1} · </strong>
          {stage === 0 ? '선택 영역 → 필터의 같은 위치 → 각 곱셈 → 합산 → 특징 맵의 한 칸으로 이어집니다. 다음을 눌러 #번호가 같은 칸과 식을 찾으세요.'
            : term ? `#${stage}: 입력 ${term.inputValue}와 필터 ${term.kernelValue}는 같은 상대 위치입니다. ${term.inputValue} × ${term.kernelValue} ${showCalculation ? `= ${term.product}` : '= ? (직접 계산)'}`
            : `곱셈 결과를 모두 더해 특징 맵 ${outputRow + 1}행 ${outputColumn + 1}열에 놓습니다.${showCalculation ? ` 합은 ${result}입니다.` : ' 아직 정답을 공개하지 않습니다. 아래 독립 입력란에서 곱과 합을 완성하세요.'}`}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label="합성곱 설명 조작">
          <Button variant="secondary" disabled={stage === 0} onClick={() => setStage((value) => value - 1)} aria-label="합성곱 이전 설명">이전 대응</Button>
          <Button disabled={stage === finalStage} onClick={() => setStage((value) => value + 1)} aria-label="합성곱 다음 설명">{stage < terms.length ? `곱 #${stage + 1} 보기` : '합산 위치 보기'}</Button>
          <Button variant="secondary" onClick={() => setStage(0)} aria-label="합성곱 설명 다시 보기">영역부터 보기</Button>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-500">이전·다음으로 같은 #번호의 입력과 필터를 따라가 보세요. 굵은 테두리가 지금 곱할 두 칸을 나타냅니다. 계산을 직접 하는 문제에서는 아래 입력란에 답을 적어 주세요.</p>
      </div>
      <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_0.75fr]">
        <PixelGrid values={input} label="입력 이미지 격자 · 번호가 같은 필터 칸과 대응" region={{ startRow, startColumn, height: kernel.length, width: kernel[0].length }} annotations={inputNumbers} focusCell={term ? { row: startRow + term.rowIndex, column: startColumn + term.columnIndex } : undefined} />
        <div className="flex items-center justify-center text-2xl font-black text-orange-700" aria-label="곱하기">×</div>
        <PixelGrid values={kernel} label="필터(커널) · 같은 번호끼리 곱하기" tone="kernel" annotations={kernelNumbers} focusCell={term ? { row: term.rowIndex, column: term.columnIndex } : undefined} />
      </div>
      <div className="grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_10rem]">
        <p className="text-sm leading-6"><strong>↓ 입력 영역 하나에서 결과 한 칸으로</strong><br />선택 영역 전체의 곱을 더한 값이 특징 맵의 테두리 한 칸에 들어갑니다.</p>
        <PixelGrid values={visibleMap} label={`특징 맵 · ${outputRow + 1}행 ${outputColumn + 1}열`} tone="feature" compact region={{ startRow: outputRow, startColumn: outputColumn, height: 1, width: 1 }} focusCell={stage === finalStage ? { row: outputRow, column: outputColumn } : undefined} />
      </div>
      <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
        <p className="font-black text-orange-950">같은 위치끼리 곱하기</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {terms.map((term, index) => (
            <div key={`${term.rowIndex}-${term.columnIndex}`} className={`min-w-0 rounded-xl border-2 p-3 text-center transition-colors duration-150 motion-reduce:transition-none ${stage === index + 1 ? 'border-orange-600 bg-orange-100' : 'border-transparent bg-white'}`}>
              <span className="block text-xs font-bold text-slate-600">#{index + 1} · 영역 {term.rowIndex + 1}행 {term.columnIndex + 1}열{stage === index + 1 ? ' · 현재 대응' : ''}</span>
              <strong className="mt-1 block break-words font-mono">{term.inputValue} × {term.kernelValue} {showCalculation ? `= ${term.product}` : '= ?'}</strong>
            </div>
          ))}
        </div>
        {showCalculation ? <div className="mt-4 flex flex-col items-center gap-2 md:flex-row md:justify-center">
          <span className="min-w-0 break-words font-mono font-black">{terms.map((term) => term.product).join(' + ')} = {result}</span>
          <ArrowDown className="text-orange-700 md:hidden" aria-hidden="true" />
          <ArrowRight className="hidden text-orange-700 md:block" aria-hidden="true" />
          <span className="rounded-xl bg-emerald-100 px-4 py-2 font-black text-emerald-900">특징 맵 {outputRow + 1}행 {outputColumn + 1}열 = {result}</span>
        </div> : <p className="mt-4 text-sm font-bold">같은 위치끼리 곱한 결과를 모두 더해 아래 입력란에 적어 보세요.</p>}
      </div>
    </div>
  )
}
