type GridValues = readonly (readonly (number | string)[])[]

interface GridRegion {
  startRow: number
  startColumn: number
  height: number
  width: number
}

interface PixelGridProps {
  values: GridValues
  label: string
  region?: GridRegion
  tone?: 'input' | 'kernel' | 'feature' | 'pool'
  compact?: boolean
  annotations?: readonly (readonly string[])[]
  focusCell?: { row: number; column: number }
}

const toneClasses = {
  input: 'border-cyan-300 bg-cyan-50 text-cyan-950',
  kernel: 'border-violet-300 bg-violet-50 text-violet-950',
  feature: 'border-emerald-300 bg-emerald-50 text-emerald-950',
  pool: 'border-amber-300 bg-amber-50 text-amber-950',
}

export default function PixelGrid({ values, label, region, tone = 'input', compact = false, annotations, focusCell }: PixelGridProps) {
  const columns = values[0]?.length ?? 1
  return (
    <div>
      <p className="mb-2 text-sm font-black text-slate-700">{label}</p>
      {region ? <p className="mb-2 text-xs font-bold text-violet-700">선택 영역: {region.startRow + 1}행 {region.startColumn + 1}열에서 시작</p> : null}
      <div
        className={`grid w-full max-w-sm gap-1 rounded-2xl border p-2 ${toneClasses[tone]}`}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        role="img"
        aria-label={`${label}. ${values.map((row) => row.join(', ')).join(' / ')}`}
      >
        {values.flatMap((row, rowIndex) => row.map((value, columnIndex) => {
          const focused = focusCell?.row === rowIndex && focusCell.column === columnIndex
          const annotation = annotations?.[rowIndex]?.[columnIndex]
          const selected = Boolean(
            region &&
            rowIndex >= region.startRow && rowIndex < region.startRow + region.height &&
            columnIndex >= region.startColumn && columnIndex < region.startColumn + region.width,
          )
          return (
            <span
              key={`${rowIndex}-${columnIndex}`}
              className={`relative flex aspect-square min-w-0 items-center justify-center rounded-lg border font-mono font-black transition-colors duration-150 motion-reduce:transition-none ${compact ? 'text-sm' : 'text-base sm:text-lg'} ${focused ? 'border-orange-800 bg-orange-100 ring-2 ring-orange-600' : selected ? 'border-violet-800 bg-white ring-2 ring-violet-500' : 'border-white/80 bg-white/65'}`}
              aria-label={`${rowIndex + 1}행 ${columnIndex + 1}열 값 ${value}${selected ? ', 선택됨' : ''}${annotation ? `, 대응 번호 ${annotation}` : ''}${focused ? ', 현재 설명 위치' : ''}`}
            >
              {annotation || selected ? <span className="absolute left-1 top-0 text-[9px] text-violet-800" aria-hidden="true">{annotation ? `#${annotation}` : '✓'}</span> : null}
              {value}
            </span>
          )
        }))}
      </div>
    </div>
  )
}
