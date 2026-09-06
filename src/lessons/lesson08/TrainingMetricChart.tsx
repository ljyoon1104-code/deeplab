import { useMemo, useState } from 'react'
import type { EpochMetric } from './lesson08Types'

interface TrainingMetricChartProps {
  title: string
  metric: 'loss' | 'accuracy'
  history: EpochMetric[]
  onInspect: () => void
}

export default function TrainingMetricChart({
  title,
  metric,
  history,
  onInspect,
}: TrainingMetricChartProps) {
  const [selectedEpoch, setSelectedEpoch] = useState(history.at(-1)?.epoch ?? 1)
  const values = history.map((item) => item[metric])
  const selected = history.find((item) => item.epoch === selectedEpoch) ?? history[0]
  const points = useMemo(() => {
    if (values.length === 0) return ''
    const min = metric === 'accuracy' ? 0 : Math.min(...values)
    const max = metric === 'accuracy' ? 1 : Math.max(...values)
    const span = Math.max(max - min, 0.000001)
    return values
      .map((value, index) => {
        const x = values.length === 1 ? 150 : 24 + (index / (values.length - 1)) * 252
        const y = 142 - ((value - min) / span) * 112
        return `${x},${y}`
      })
      .join(' ')
  }, [metric, values])

  if (!selected) return null

  return (
    <article className="metric-chart-card" aria-label={`${title} 실제 학습 그래프`}>
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">ACTUAL HISTORY</p>
          <h3>{title}</h3>
        </div>
        <button type="button" className="secondary-button" onClick={onInspect}>
          그래프 확인
        </button>
      </div>
      <svg viewBox="0 0 300 170" role="img" aria-label={`${title} epoch별 변화`}>
        <line x1="24" y1="142" x2="280" y2="142" className="chart-axis" />
        <line x1="24" y1="24" x2="24" y2="142" className="chart-axis" />
        <polyline points={points} className="metric-chart-line" />
        <text x="150" y="165" textAnchor="middle" className="chart-label">Epoch</text>
        <text x="10" y="18" className="chart-label">{metric === 'accuracy' ? 'Accuracy' : 'Loss'}</text>
        {history.map((item, index) => {
          const [x, y] = points.split(' ')[index].split(',').map(Number)
          return (
            <circle
              key={item.epoch}
              cx={x}
              cy={y}
              r={item.epoch === selectedEpoch ? 6 : 4}
              className="metric-chart-point"
              onClick={() => {
                setSelectedEpoch(item.epoch)
                onInspect()
              }}
              role="button"
              tabIndex={0}
              aria-label={`${item.epoch} epoch 값 선택`}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  setSelectedEpoch(item.epoch)
                  onInspect()
                }
              }}
            />
          )
        })}
      </svg>
      <p className="metric-selected-value" aria-live="polite">
        {selected.epoch} epoch · {metric === 'accuracy' ? 'Accuracy' : 'Loss'}{' '}
        <strong>
          {metric === 'accuracy'
            ? `${(selected.accuracy * 100).toFixed(2)}%`
            : selected.loss.toFixed(4)}
        </strong>
      </p>
      <div className="choice-row compact" aria-label={`${title} epoch 선택`}>
        {history.map((item) => (
          <button
            key={item.epoch}
            type="button"
            className={item.epoch === selectedEpoch ? 'choice-chip selected' : 'choice-chip'}
            onClick={() => {
              setSelectedEpoch(item.epoch)
              onInspect()
            }}
          >
            {item.epoch} epoch
          </button>
        ))}
      </div>
    </article>
  )
}
