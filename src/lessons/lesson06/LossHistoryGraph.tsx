import type { TrainingSnapshot } from './trainingMath'
import { formatTrainingValue } from './trainingMath'

interface LossHistoryGraphProps {
  history: readonly TrainingSnapshot[]
  idSuffix?: string
  title?: string
}

export function LossHistoryGraph({
  history,
  idSuffix = 'main',
  title = 'Epoch별 Loss 변화',
}: LossHistoryGraphProps) {
  const width = 680
  const height = 260
  const left = 58
  const right = 20
  const top = 24
  const bottom = 46
  const plotWidth = width - left - right
  const plotHeight = height - top - bottom
  const maxEpoch = Math.max(1, ...history.map((item) => item.epoch))
  const maxLoss = Math.max(...history.map((item) => item.loss))
  const minLoss = Math.min(...history.map((item) => item.loss))
  const lossRange = Math.max(0.05, maxLoss - minLoss)
  const paddedMax = maxLoss + lossRange * 0.12
  const paddedMin = Math.max(0, minLoss - lossRange * 0.12)
  const paddedRange = Math.max(0.05, paddedMax - paddedMin)
  const toX = (epoch: number) => left + (epoch / maxEpoch) * plotWidth
  const toY = (loss: number) =>
    top + ((paddedMax - loss) / paddedRange) * plotHeight
  const points = history
    .map((item) => `${toX(item.epoch)},${toY(item.loss)}`)
    .join(' ')

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-lg font-black text-slate-950">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">
            버튼으로 실행한 실제 반복 계산 결과만 연결합니다.
          </p>
        </div>
        <p className="font-mono text-sm font-bold text-indigo-800">
          {history.length > 1
            ? `${formatTrainingValue(history[0].loss)} → ${formatTrainingValue(history.at(-1)!.loss)}`
            : `초기 Loss ${formatTrainingValue(history[0].loss)}`}
        </p>
      </div>
      <svg
        className="mt-4 h-auto w-full"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-labelledby={`loss-history-title-${idSuffix} loss-history-description-${idSuffix}`}
      >
        <title id={`loss-history-title-${idSuffix}`}>{title} 그래프</title>
        <desc id={`loss-history-description-${idSuffix}`}>
          초기값부터 현재까지 실제 계산한 Loss를 Epoch 순서로 연결한 그래프입니다.
        </desc>
        {[0, 0.5, 1].map((ratio) => {
          const y = top + ratio * plotHeight
          const value = paddedMax - ratio * paddedRange
          return (
            <g key={ratio}>
              <line
                x1={left}
                y1={y}
                x2={width - right}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text
                x={left - 10}
                y={y + 5}
                textAnchor="end"
                fontSize="13"
                fill="#64748b"
              >
                {value.toFixed(2)}
              </text>
            </g>
          )
        })}
        <line
          x1={left}
          y1={top}
          x2={left}
          y2={height - bottom}
          stroke="#94a3b8"
          strokeWidth="2"
        />
        <line
          x1={left}
          y1={height - bottom}
          x2={width - right}
          y2={height - bottom}
          stroke="#94a3b8"
          strokeWidth="2"
        />
        {history.length > 1 && (
          <polyline
            points={points}
            fill="none"
            stroke="#4f46e5"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {history.map((item) => (
          <g key={item.epoch}>
            <circle
              cx={toX(item.epoch)}
              cy={toY(item.loss)}
              r="6"
              fill="#06b6d4"
              stroke="white"
              strokeWidth="3"
            />
            {(item.epoch === 0 || item === history.at(-1)) && (
              <text
                x={toX(item.epoch)}
                y={height - bottom + 25}
                textAnchor="middle"
                fontSize="13"
                fontWeight="700"
                fill="#475569"
              >
                {item.epoch}
              </text>
            )}
          </g>
        ))}
        <text
          x={left + plotWidth / 2}
          y={height - 8}
          textAnchor="middle"
          fontSize="14"
          fontWeight="700"
          fill="#334155"
        >
          Epoch
        </text>
        <text
          x="16"
          y={top + plotHeight / 2}
          textAnchor="middle"
          fontSize="14"
          fontWeight="700"
          fill="#334155"
          transform={`rotate(-90 16 ${top + plotHeight / 2})`}
        >
          Loss
        </text>
      </svg>
    </div>
  )
}
