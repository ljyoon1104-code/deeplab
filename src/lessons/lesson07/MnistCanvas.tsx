import { useEffect, useRef } from 'react'
import type { MnistSample } from './mnistTypes'

interface MnistCanvasProps {
  sample: MnistSample
  size?: number
  className?: string
}

export function MnistCanvas({ sample, size = 112, className = '' }: MnistCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    context.imageSmoothingEnabled = false
    const image = context.createImageData(28, 28)
    sample.pixels.forEach((pixel, index) => {
      const offset = index * 4
      image.data[offset] = pixel
      image.data[offset + 1] = pixel
      image.data[offset + 2] = pixel
      image.data[offset + 3] = 255
    })
    context.putImageData(image, 0, 0)
  }, [sample])

  return (
    <canvas
      ref={canvasRef}
      width={28}
      height={28}
      className={`mnist-canvas rounded-lg bg-black ${className}`}
      style={{ width: size, height: size, maxWidth: '100%' }}
      aria-label={`실제 MNIST sample ${sample.id}, label ${sample.label}`}
      role="img"
    />
  )
}

interface MnistPixelGridProps {
  sample: MnistSample
  selectedIndex: number
  onSelect: (index: number) => void
  showSelectedValue?: boolean
  ariaLabel: string
}

export function MnistPixelGrid({
  sample,
  selectedIndex,
  onSelect,
  showSelectedValue = false,
  ariaLabel,
}: MnistPixelGridProps) {
  return (
    <div className="mnist-pixel-grid" role="grid" aria-label={ariaLabel}>
      {sample.pixels.map((pixel, index) => {
        const selected = index === selectedIndex
        const row = Math.floor(index / 28) + 1
        const column = (index % 28) + 1
        return (
          <button
            key={index}
            type="button"
            role="gridcell"
            aria-selected={selected}
            aria-label={`${row}행 ${column}열, 내부 index ${index}, 픽셀값 ${pixel}`}
            title={`${row}행 ${column}열 · ${pixel}`}
            onClick={() => onSelect(index)}
            className={`mnist-pixel-cell ${selected ? 'mnist-pixel-cell-selected' : ''}`}
            style={{ backgroundColor: `rgb(${pixel} ${pixel} ${pixel})` }}
          >
            {selected && showSelectedValue ? <span>{pixel}</span> : null}
          </button>
        )
      })}
    </div>
  )
}
