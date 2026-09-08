export const MNIST_IMAGE_SIDE = 28
export const MNIST_PIXEL_COUNT = MNIST_IMAGE_SIDE * MNIST_IMAGE_SIDE

export interface BrightnessCenteringResult {
  pixels: number[]
  shiftX: number
  shiftY: number
  centerBefore: { x: number; y: number } | null
  centerAfter: { x: number; y: number } | null
}

function assertNormalizedPixels(pixels: readonly number[]) {
  if (
    pixels.length !== MNIST_PIXEL_COUNT ||
    pixels.some((value) => !Number.isFinite(value) || value < 0 || value > 1)
  ) {
    throw new Error('28×28 전처리 입력은 0~1 범위의 유한한 값 784개여야 합니다.')
  }
}

export function brightnessWeightedCenter(pixels: readonly number[]) {
  assertNormalizedPixels(pixels)

  let brightnessTotal = 0
  let weightedX = 0
  let weightedY = 0

  for (let y = 0; y < MNIST_IMAGE_SIDE; y += 1) {
    for (let x = 0; x < MNIST_IMAGE_SIDE; x += 1) {
      const brightness = pixels[y * MNIST_IMAGE_SIDE + x]
      brightnessTotal += brightness
      weightedX += x * brightness
      weightedY += y * brightness
    }
  }

  if (brightnessTotal === 0) return null
  return {
    x: weightedX / brightnessTotal,
    y: weightedY / brightnessTotal,
  }
}

function translatePixels(pixels: readonly number[], shiftX: number, shiftY: number) {
  const translated = Array<number>(MNIST_PIXEL_COUNT).fill(0)

  for (let y = 0; y < MNIST_IMAGE_SIDE; y += 1) {
    for (let x = 0; x < MNIST_IMAGE_SIDE; x += 1) {
      const targetX = x + shiftX
      const targetY = y + shiftY
      if (
        targetX < 0 ||
        targetX >= MNIST_IMAGE_SIDE ||
        targetY < 0 ||
        targetY >= MNIST_IMAGE_SIDE
      ) {
        continue
      }
      translated[targetY * MNIST_IMAGE_SIDE + targetX] = pixels[y * MNIST_IMAGE_SIDE + x]
    }
  }

  return translated
}

/**
 * Keeps the black-background / bright-stroke convention while translating only
 * the final 28×28 image. Pixels that would leave the image are discarded.
 */
export function centerByBrightness(
  pixels: readonly number[],
  target = (MNIST_IMAGE_SIDE - 1) / 2,
): BrightnessCenteringResult {
  assertNormalizedPixels(pixels)
  const values = Array.from(pixels)
  const centerBefore = brightnessWeightedCenter(values)

  if (!centerBefore) {
    return {
      pixels: values,
      shiftX: 0,
      shiftY: 0,
      centerBefore: null,
      centerAfter: null,
    }
  }

  const shiftX = Math.round(target - centerBefore.x)
  const shiftY = Math.round(target - centerBefore.y)
  const centered = translatePixels(values, shiftX, shiftY)

  return {
    pixels: centered,
    shiftX,
    shiftY,
    centerBefore,
    centerAfter: brightnessWeightedCenter(centered),
  }
}
