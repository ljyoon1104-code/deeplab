import {
  activationOutput,
  type ActivationKind,
} from './activationMath'
import { useId } from 'react'

const WIDTH = 320
const HEIGHT = 210
const LEFT = 40
const RIGHT = 302
const TOP = 16
const BOTTOM = 174
const X_MIN = -5
const X_MAX = 5
const Y_MIN = 0
const Y_MAX = 5

const mapX = (value: number) =>
  LEFT + ((value - X_MIN) / (X_MAX - X_MIN)) * (RIGHT - LEFT)

const mapY = (value: number) =>
  BOTTOM - ((value - Y_MIN) / (Y_MAX - Y_MIN)) * (BOTTOM - TOP)

const buildPath = (kind: ActivationKind) => {
  if (kind === 'step') {
    return `M ${mapX(-5)} ${mapY(0)} L ${mapX(0)} ${mapY(0)} M ${mapX(0)} ${mapY(1)} L ${mapX(5)} ${mapY(1)}`
  }

  const samples = Array.from({ length: 81 }, (_, index) => -5 + index / 8)
  return samples
    .map((z, index) => {
      const prefix = index === 0 ? 'M' : 'L'
      return `${prefix} ${mapX(z)} ${mapY(activationOutput(kind, z))}`
    })
    .join(' ')
}

const graphNames: Record<ActivationKind, string> = {
  step: '계단 함수',
  relu: 'ReLU',
  sigmoid: 'Sigmoid',
}

const graphColors: Record<ActivationKind, string> = {
  step: '#4f46e5',
  relu: '#0891b2',
  sigmoid: '#059669',
}

const dashStyles: Record<ActivationKind, string | undefined> = {
  step: '10 4',
  relu: undefined,
  sigmoid: '3 4',
}

export function ActivationGraph({
  kind,
  z,
  compact = false,
}: {
  kind: ActivationKind
  z: number
  compact?: boolean
}) {
  const titleId = useId()
  const output = activationOutput(kind, z)
  const color = graphColors[kind]
  const currentX = mapX(z)
  const currentY = mapY(output)
  const title = `${graphNames[kind]} 그래프. 현재 가중합 z ${z}, 출력 ${output.toFixed(2)}`

  return (
    <figure className="min-w-0" aria-label={title}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-labelledby={titleId}
        className={`block w-full rounded-xl border border-slate-200 bg-white ${compact ? 'max-h-48' : 'max-h-60'}`}
      >
        <title id={titleId}>{title}</title>
        <line x1={LEFT} y1={BOTTOM} x2={RIGHT} y2={BOTTOM} stroke="#64748b" strokeWidth="1.5" />
        <line x1={mapX(0)} y1={TOP} x2={mapX(0)} y2={BOTTOM} stroke="#94a3b8" strokeWidth="1" />
        <line x1={LEFT} y1={mapY(1)} x2={RIGHT} y2={mapY(1)} stroke="#e2e8f0" strokeWidth="1" />
        <text x={RIGHT} y={198} textAnchor="end" fill="#475569" fontSize="12" fontWeight="700">가중합 z</text>
        <text x={LEFT - 8} y={TOP + 3} textAnchor="end" fill="#475569" fontSize="12" fontWeight="700">출력</text>
        <text x={mapX(-5)} y={193} textAnchor="middle" fill="#64748b" fontSize="11">-5</text>
        <text x={mapX(0)} y={193} textAnchor="middle" fill="#64748b" fontSize="11">0</text>
        <text x={mapX(5)} y={193} textAnchor="middle" fill="#64748b" fontSize="11">5</text>
        <text x={LEFT - 8} y={BOTTOM + 4} textAnchor="end" fill="#64748b" fontSize="11">0</text>
        <text x={LEFT - 8} y={mapY(1) + 4} textAnchor="end" fill="#64748b" fontSize="11">1</text>
        <text x={LEFT - 8} y={TOP + 4} textAnchor="end" fill="#64748b" fontSize="11">5</text>
        <path
          d={buildPath(kind)}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={dashStyles[kind]}
        />
        {kind === 'step' && (
          <>
            <circle cx={mapX(0)} cy={mapY(0)} r="5" fill="white" stroke={color} strokeWidth="2.5" />
            <circle cx={mapX(0)} cy={mapY(1)} r="5" fill={color} />
          </>
        )}
        <line
          x1={currentX}
          y1={TOP}
          x2={currentX}
          y2={BOTTOM}
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.65"
        />
        <circle cx={currentX} cy={currentY} r="6" fill={color} stroke="white" strokeWidth="3" />
      </svg>
      <figcaption className="mt-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-black text-slate-900">{graphNames[kind]}</span>
        <span className="font-bold tabular-nums" style={{ color }}>
          z {z} → 출력 {Number.isInteger(output) ? output : output.toFixed(2)}
        </span>
      </figcaption>
    </figure>
  )
}
