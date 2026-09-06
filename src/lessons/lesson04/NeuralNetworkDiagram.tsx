import { ArrowDown, ArrowRight } from 'lucide-react'
import { useId } from 'react'

export interface DiagramLayer {
  id: string
  label: string
  role: string
  nodeCount: number
  tone: 'indigo' | 'cyan' | 'emerald' | 'slate'
}

const tones: Record<DiagramLayer['tone'], {
  card: string
  node: string
  label: string
}> = {
  indigo: {
    card: 'border-indigo-200 bg-indigo-50',
    node: 'border-indigo-600 bg-indigo-100',
    label: 'text-indigo-800',
  },
  cyan: {
    card: 'border-cyan-200 bg-cyan-50',
    node: 'border-cyan-700 bg-cyan-100',
    label: 'text-cyan-800',
  },
  emerald: {
    card: 'border-emerald-200 bg-emerald-50',
    node: 'border-emerald-700 bg-emerald-100',
    label: 'text-emerald-800',
  },
  slate: {
    card: 'border-slate-200 bg-slate-50',
    node: 'border-slate-600 bg-slate-100',
    label: 'text-slate-700',
  },
}

function ConnectionBridge() {
  const titleId = useId()

  return (
    <div className="flex items-center justify-center" aria-hidden="true">
      <svg
        viewBox="0 0 60 150"
        className="hidden h-36 w-10 md:block"
        role="img"
        aria-labelledby={titleId}
      >
        <title id={titleId}>이전 층의 뉴런과 다음 층의 뉴런을 연결하는 선</title>
        {[22, 75, 128].flatMap((from) =>
          [28, 75, 122].map((to) => (
            <line
              key={`${from}-${to}`}
              x1="2"
              y1={from}
              x2="58"
              y2={to}
              stroke="#94a3b8"
              strokeWidth="1.4"
              opacity="0.72"
            />
          )),
        )}
      </svg>
      <ArrowDown className="text-cyan-700 md:hidden" size={24} />
    </div>
  )
}

function LayerCard({ layer, compact }: { layer: DiagramLayer; compact: boolean }) {
  const tone = tones[layer.tone]

  return (
    <div className={`min-w-0 rounded-2xl border p-4 text-center ${tone.card}`}>
      <p className={`text-sm font-black ${tone.label}`}>{layer.label}</p>
      <div
        className={`mx-auto mt-4 grid w-fit gap-2 ${
          layer.nodeCount <= 3 ? 'grid-cols-1' : 'grid-cols-2'
        }`}
        aria-label={`${layer.label} 노드 ${layer.nodeCount}개`}
      >
        {Array.from({ length: layer.nodeCount }, (_, index) => (
          <span
            key={index}
            className={`block rounded-full border-2 ${tone.node} ${compact ? 'size-6' : 'size-8'}`}
            aria-label={`${layer.label} 노드 ${index + 1}`}
          />
        ))}
      </div>
      <p className="mt-4 text-sm font-semibold leading-6 text-slate-700">{layer.role}</p>
    </div>
  )
}

export function NeuralNetworkDiagram({
  layers,
  label,
  compact = false,
}: {
  layers: readonly DiagramLayer[]
  label: string
  compact?: boolean
}) {
  return (
    <figure className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <figcaption className="mb-4 font-black text-slate-950">{label}</figcaption>
      <div
        className="grid min-w-0 items-center gap-3 md:grid-flow-col md:auto-cols-fr md:gap-1"
        aria-label={`${label}: ${layers.map((layer) => layer.label).join('에서 ')}으로 연결`}
      >
        {layers.map((layer, index) => (
          <div key={layer.id} className="contents">
            <LayerCard layer={layer} compact={compact} />
            {index < layers.length - 1 && <ConnectionBridge />}
          </div>
        ))}
      </div>
    </figure>
  )
}

export function SimpleFlow({
  items,
  label,
}: {
  items: readonly string[]
  label: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <p className="font-black text-slate-950">{label}</p>
      <div className="mt-4 grid items-center gap-2 md:grid-flow-col md:auto-cols-fr">
        {items.map((item, index) => (
          <div key={`${item}-${index}`} className="contents">
            <div className="flex min-h-16 min-w-0 items-center justify-center rounded-xl border border-indigo-200 bg-white px-3 py-3 text-center font-bold leading-6 text-slate-900">
              {item}
            </div>
            {index < items.length - 1 && (
              <>
                <ArrowDown className="mx-auto text-cyan-700 md:hidden" size={21} aria-hidden="true" />
                <ArrowRight className="mx-auto hidden text-cyan-700 md:block" size={21} aria-hidden="true" />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
