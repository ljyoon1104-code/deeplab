interface ProgressBarProps {
  value: number
  label: string
  showValue?: boolean
  size?: 'sm' | 'md'
}

export function ProgressBar({
  value,
  label,
  showValue = true,
  size = 'md',
}: ProgressBarProps) {
  const normalized = Math.min(100, Math.max(0, value))

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between gap-4 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        {showValue && (
          <span className="font-semibold tabular-nums text-slate-900">
            {normalized}%
          </span>
        )}
      </div>
      <div
        className={`overflow-hidden rounded-full bg-slate-200 ${size === 'sm' ? 'h-1.5' : 'h-2.5'}`}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={normalized}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  )
}
