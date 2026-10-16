import { convolve2D, maxPool2D, type Matrix } from './cnnMath'
import { TEXTBOOK_KERNEL } from './lesson09Data'

export const PET_IMAGE_URL = `${import.meta.env.BASE_URL}images/lesson09/pets-source-v1.png`

/** This pipeline is separate from lesson answers. Display intensities never replace raw values. */
export function processPetPixels(rgba: Uint8ClampedArray, width: number, height: number) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 3 || height < 3 || rgba.length !== width * height * 4) {
    throw new Error('이미지 크기와 RGBA 픽셀 수가 맞지 않습니다.')
  }
  const gray = Array.from({ length: height }, (_, row) => Array.from({ length: width }, (_, column) => {
    const i = (row * width + column) * 4
    const alpha = rgba[i + 3] / 255
    return Math.round((0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2]) * alpha + 255 * (1 - alpha))
  }))
  const feature = convolve2D(gray, TEXTBOOK_KERNEL)
  const relu = feature.map(row => row.map(value => Math.max(0, value)))
  const pooled = maxPool2D(relu, 2)
  return { gray, feature, relu, pooled, flattened: pooled.flat() }
}

export function intensityRange(values: Matrix) {
  const all = values.flat()
  return { min: Math.min(...all), max: Math.max(...all) }
}

export function displayIntensity(value: number, range: { min: number; max: number }) {
  // A constant positive map is drawn light, a zero map black. No division by zero.
  return range.max === range.min ? (range.max > 0 ? 255 : 0) : Math.round(255 * (value - range.min) / (range.max - range.min))
}

async function decodePetImage() {
  const image = new Image()
  image.src = PET_IMAGE_URL
  await image.decode()
  const width = 64
  const height = Math.round(width * image.naturalHeight / image.naturalWidth)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('이 브라우저에서 이미지 픽셀을 읽을 수 없습니다.')
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, 0, 0, width, height)
  return {
    originalWidth: image.naturalWidth, originalHeight: image.naturalHeight,
    width, height, ...processPetPixels(context.getImageData(0, 0, width, height).data, width, height),
  }
}

export type PetImageData = Awaited<ReturnType<typeof decodePetImage>>
// All optional explanation panels share one decode/calculation, not lesson progress or answers.
let cached: Promise<PetImageData> | undefined
export function loadPetImage(): Promise<PetImageData> {
  cached ??= decodePetImage().catch((error: unknown) => { cached = undefined; throw error })
  return cached
}
