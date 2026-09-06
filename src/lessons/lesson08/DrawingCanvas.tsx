import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Button } from '../../components/ui/Button'

interface PreparedDrawing {
  normalized: number[]
  previewPixels: number[]
}

interface DrawingCanvasProps {
  disabled: boolean
  onClear: () => void
  onEmpty: () => void
  onPrepared: (drawing: PreparedDrawing) => Promise<void>
}

const LOGICAL_SIZE = 280

function fillBlack(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d')
  if (!context) return
  context.save()
  context.setTransform(1, 0, 0, 1, 0, 0)
  context.fillStyle = '#000'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.restore()
}

function prepareDrawing(canvas: HTMLCanvasElement): PreparedDrawing | null {
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('그림 캔버스를 읽을 수 없습니다.')
  const image = context.getImageData(0, 0, canvas.width, canvas.height)
  let minX = canvas.width
  let minY = canvas.height
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const index = (y * canvas.width + x) * 4
      if (image.data[index] > 20) {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }
  if (maxX < minX || maxY < minY) return null

  const sourceWidth = maxX - minX + 1
  const sourceHeight = maxY - minY + 1
  const scale = 20 / Math.max(sourceWidth, sourceHeight)
  const targetWidth = Math.max(1, sourceWidth * scale)
  const targetHeight = Math.max(1, sourceHeight * scale)
  const targetX = (28 - targetWidth) / 2
  const targetY = (28 - targetHeight) / 2
  const resultCanvas = document.createElement('canvas')
  resultCanvas.width = 28
  resultCanvas.height = 28
  const resultContext = resultCanvas.getContext('2d', { willReadFrequently: true })
  if (!resultContext) throw new Error('28×28 입력을 만들 수 없습니다.')
  resultContext.fillStyle = '#000'
  resultContext.fillRect(0, 0, 28, 28)
  resultContext.imageSmoothingEnabled = true
  resultContext.drawImage(
    canvas,
    minX,
    minY,
    sourceWidth,
    sourceHeight,
    targetX,
    targetY,
    targetWidth,
    targetHeight,
  )
  const pixels = resultContext.getImageData(0, 0, 28, 28).data
  const normalized: number[] = []
  const previewPixels: number[] = []
  for (let index = 0; index < 784; index += 1) {
    const value = pixels[index * 4] / 255
    normalized.push(value)
    previewPixels.push(Math.round(value * 255))
  }
  return { normalized, previewPixels }
}

export default function DrawingCanvas({
  disabled,
  onClear,
  onEmpty,
  onPrepared,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ratio = Math.max(1, window.devicePixelRatio || 1)
    canvas.width = Math.round(LOGICAL_SIZE * ratio)
    canvas.height = Math.round(LOGICAL_SIZE * ratio)
    canvas.style.width = `${LOGICAL_SIZE}px`
    canvas.style.height = `${LOGICAL_SIZE}px`
    fillBlack(canvas)
  }, [])

  const pointerPosition = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  const startDrawing = (event: PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return
    const canvas = event.currentTarget
    const context = canvas.getContext('2d')
    if (!context) return
    event.preventDefault()
    canvas.setPointerCapture(event.pointerId)
    const point = pointerPosition(event)
    drawingRef.current = true
    context.beginPath()
    context.moveTo(point.x, point.y)
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle = '#fff'
    context.lineWidth = Math.max(18, canvas.width * 0.065)
  }

  const continueDrawing = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || disabled) return
    event.preventDefault()
    const context = event.currentTarget.getContext('2d')
    if (!context) return
    const point = pointerPosition(event)
    context.lineTo(point.x, point.y)
    context.stroke()
  }

  const finishDrawing = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    event.preventDefault()
    drawingRef.current = false
    const context = event.currentTarget.getContext('2d')
    context?.closePath()
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    fillBlack(canvas)
    onClear()
  }

  const predict = async () => {
    const canvas = canvasRef.current
    if (!canvas || busy) return
    const prepared = prepareDrawing(canvas)
    if (!prepared) {
      onEmpty()
      return
    }
    setBusy(true)
    try {
      await onPrepared(prepared)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="drawing-workbench">
      <canvas
        ref={canvasRef}
        className="digit-drawing-canvas"
        aria-label="검은 배경에 흰색으로 숫자를 그리는 영역"
        role="img"
        tabIndex={0}
        onPointerDown={startDrawing}
        onPointerMove={continueDrawing}
        onPointerUp={finishDrawing}
        onPointerCancel={finishDrawing}
        onLostPointerCapture={() => {
          drawingRef.current = false
        }}
      />
      <div className="button-row">
        <Button variant="secondary" onClick={clear} disabled={busy}>
          지우기
        </Button>
        <Button onClick={predict} disabled={disabled || busy}>
          {busy ? '예측 중…' : 'AI에게 물어보기'}
        </Button>
      </div>
    </div>
  )
}
