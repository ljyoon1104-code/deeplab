import type { MnistSample } from '../lesson07/mnistTypes'

export interface MnistTestDataset {
  dataset: 'MNIST'
  split: 'test'
  count: 500
  imageWidth: 28
  imageHeight: 28
  pixelRange: [0, 255]
  samples: MnistSample[]
}

let testCache: MnistTestDataset | null = null

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object'
}

function validateTestDataset(value: unknown): MnistTestDataset {
  if (!isRecord(value)) throw new Error('Test JSON의 최상위 값이 객체가 아닙니다.')
  if (
    value.dataset !== 'MNIST' ||
    value.split !== 'test' ||
    value.count !== 500 ||
    value.imageWidth !== 28 ||
    value.imageHeight !== 28 ||
    !Array.isArray(value.pixelRange) ||
    value.pixelRange[0] !== 0 ||
    value.pixelRange[1] !== 255 ||
    !Array.isArray(value.samples) ||
    value.samples.length !== 500
  ) {
    throw new Error('MNIST Test subset의 구조가 예상과 다릅니다.')
  }

  const ids = new Set<string>()
  const samples = value.samples.map((item, index) => {
    if (!isRecord(item)) throw new Error(`samples[${index}]가 객체가 아닙니다.`)
    const { id, label, pixels } = item
    if (typeof id !== 'string' || !id.startsWith('test-') || ids.has(id)) {
      throw new Error(`samples[${index}]의 ID가 올바르지 않거나 중복되었습니다.`)
    }
    if (!Number.isInteger(label) || Number(label) < 0 || Number(label) > 9) {
      throw new Error(`${id}: label이 0~9 정수가 아닙니다.`)
    }
    if (
      !Array.isArray(pixels) ||
      pixels.length !== 784 ||
      !pixels.every((pixel) => Number.isInteger(pixel) && Number(pixel) >= 0 && Number(pixel) <= 255)
    ) {
      throw new Error(`${id}: pixels가 0~255 정수 784개가 아닙니다.`)
    }
    ids.add(id)
    return { id, label: Number(label), pixels: pixels.map(Number) }
  })

  return {
    dataset: 'MNIST',
    split: 'test',
    count: 500,
    imageWidth: 28,
    imageHeight: 28,
    pixelRange: [0, 255],
    samples,
  }
}

export async function loadMnistTestDataset(signal?: AbortSignal) {
  if (testCache) return testCache
  const response = await fetch(`${import.meta.env.BASE_URL}data/mnist/test-0500.json`, { signal })
  if (!response.ok) throw new Error(`Test 500개 파일 요청에 실패했습니다. (${response.status})`)
  testCache = validateTestDataset(await response.json())
  return testCache
}
