interface WaveformVisualizerProps {
  cycles: number
  label: string
  selected?: boolean
}

function waveformPath(cycles: number) {
  const points = Array.from({ length: 121 }, (_, index) => {
    const x = (index / 120) * 300
    const y = 55 - Math.sin((index / 120) * Math.PI * 2 * cycles) * 34
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return points.join(' ')
}

export default function WaveformVisualizer({ cycles, label, selected = false }: WaveformVisualizerProps) {
  return (
    <svg viewBox="0 0 300 110" className={`w-full rounded-xl border bg-white ${selected ? 'border-violet-600 ring-2 ring-violet-300' : 'border-slate-200'}`} role="img" aria-label={`${label}: 같은 시간 동안 ${cycles}번 진동하는 단순화한 파형 예시`}>
      <line x1="0" y1="55" x2="300" y2="55" stroke="#cbd5e1" strokeWidth="1" />
      <polyline points={waveformPath(cycles)} fill="none" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
