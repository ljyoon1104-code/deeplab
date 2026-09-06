import {
  MNIST_DATASET_SIZES,
  type MnistDataset,
  type MnistDatasetSize,
  type MnistMetadata,
  type MnistSample,
} from './mnistTypes'

const fileByDatasetSize: Record<MnistDatasetSize, string> = {
  500: 'train-0500.json',
  1000: 'train-1000.json',
  2000: 'train-2000.json',
  5000: 'train-5000.json',
}

const datasetCache = new Map<MnistDatasetSize, MnistDataset>()
let metadataCache: MnistMetadata | null = null

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object'

function validateSample(value: unknown, index: number): MnistSample {
  if (!isRecord(value)) {
    throw new Error(`samples[${index}]가 객체가 아닙니다.`)
  }

  const { id, label, pixels } = value
  if (typeof id !== 'string' || id.trim() === '') {
    throw new Error(`samples[${index}]에 유효한 sample ID가 없습니다.`)
  }
  if (!Number.isInteger(label) || Number(label) < 0 || Number(label) > 9) {
    throw new Error(`${id}: label이 0~9 정수가 아닙니다.`)
  }
  if (!Array.isArray(pixels) || pixels.length !== 784) {
    throw new Error(`${id}: pixels 배열의 길이가 784가 아닙니다.`)
  }
  if (
    !pixels.every(
      (pixel) => Number.isInteger(pixel) && Number(pixel) >= 0 && Number(pixel) <= 255,
    )
  ) {
    throw new Error(`${id}: pixel에 0~255 범위의 정수가 아닌 값이 있습니다.`)
  }

  return { id, label: Number(label), pixels: pixels.map(Number) }
}

function validateDataset(value: unknown, expectedSize: MnistDatasetSize): MnistDataset {
  if (!isRecord(value)) {
    throw new Error('MNIST JSON의 최상위 값이 객체가 아닙니다.')
  }
  if (value.dataset !== 'MNIST' || value.split !== 'train') {
    throw new Error('MNIST Train subset의 dataset 또는 split 값이 잘못되었습니다.')
  }
  if (value.count !== expectedSize || !Array.isArray(value.samples)) {
    throw new Error(`선택한 ${expectedSize.toLocaleString()}개 subset의 count 또는 samples가 잘못되었습니다.`)
  }
  if (value.samples.length !== value.count) {
    throw new Error('samples 길이와 count가 일치하지 않습니다.')
  }
  if (value.imageWidth !== 28 || value.imageHeight !== 28) {
    throw new Error('MNIST 이미지 크기가 28×28이 아닙니다.')
  }
  if (
    !Array.isArray(value.pixelRange) ||
    value.pixelRange.length !== 2 ||
    value.pixelRange[0] !== 0 ||
    value.pixelRange[1] !== 255
  ) {
    throw new Error('MNIST 픽셀 범위가 0~255가 아닙니다.')
  }

  const samples = value.samples.map(validateSample)
  const ids = new Set<string>()
  for (const sample of samples) {
    if (ids.has(sample.id)) {
      throw new Error(`중복 sample ID를 발견했습니다: ${sample.id}`)
    }
    ids.add(sample.id)
  }

  return {
    dataset: 'MNIST',
    split: 'train',
    count: expectedSize,
    imageWidth: 28,
    imageHeight: 28,
    pixelRange: [0, 255],
    samples,
  }
}

function validateMetadata(value: unknown): MnistMetadata {
  if (!isRecord(value)) {
    throw new Error('metadata.json의 최상위 값이 객체가 아닙니다.')
  }

  const metadata = value as unknown as MnistMetadata
  if (
    typeof metadata.datasetName !== 'string' ||
    !isRecord(metadata.image) ||
    metadata.image.width !== 28 ||
    metadata.image.height !== 28 ||
    metadata.image.pixelCount !== 784 ||
    !isRecord(metadata.original) ||
    !isRecord(metadata.original.train) ||
    !isRecord(metadata.original.test) ||
    metadata.original.train.count !== 60_000 ||
    metadata.original.test.count !== 10_000 ||
    !Array.isArray(metadata.classes) ||
    metadata.classes.length !== 10 ||
    metadata.testSubsetCount !== 500 ||
    !isRecord(metadata.sources) ||
    !isRecord(metadata.sources.originalDataset) ||
    !isRecord(metadata.sources.csvConversion)
  ) {
    throw new Error('metadata.json의 필수 정보가 예상 구조와 다릅니다.')
  }

  return metadata
}

export function mnistDatasetUrl(size: MnistDatasetSize) {
  return `${import.meta.env.BASE_URL}data/mnist/${fileByDatasetSize[size]}`
}

export function mnistSourceUrl() {
  return `${import.meta.env.BASE_URL}data/mnist/SOURCE.md`
}

export async function loadMnistDataset(
  size: MnistDatasetSize,
  signal?: AbortSignal,
): Promise<MnistDataset> {
  const cached = datasetCache.get(size)
  if (cached) return cached

  const response = await fetch(mnistDatasetUrl(size), { signal })
  if (!response.ok) {
    throw new Error(`Train ${size.toLocaleString()}개 파일 요청에 실패했습니다. (${response.status})`)
  }
  const dataset = validateDataset(await response.json(), size)
  datasetCache.set(size, dataset)
  return dataset
}

export async function loadMnistMetadata(signal?: AbortSignal): Promise<MnistMetadata> {
  if (metadataCache) return metadataCache
  const response = await fetch(`${import.meta.env.BASE_URL}data/mnist/metadata.json`, {
    signal,
  })
  if (!response.ok) {
    throw new Error(`metadata.json 요청에 실패했습니다. (${response.status})`)
  }
  metadataCache = validateMetadata(await response.json())
  return metadataCache
}

export function isMnistDatasetSize(value: number): value is MnistDatasetSize {
  return (MNIST_DATASET_SIZES as readonly number[]).includes(value)
}

export function normalizePixels(pixels: readonly number[]) {
  if (pixels.length !== 784) {
    throw new Error('정규화할 pixels 배열의 길이가 784가 아닙니다.')
  }
  const normalized = pixels.map((pixel) => pixel / 255)
  if (
    normalized.length !== 784 ||
    normalized.some((value) => !Number.isFinite(value) || value < 0 || value > 1)
  ) {
    throw new Error('정규화 결과가 0~1 범위의 유한한 숫자가 아닙니다.')
  }
  return normalized
}

export function makeOneHot(label: number) {
  if (!Number.isInteger(label) || label < 0 || label > 9) {
    throw new Error('원-핫으로 바꿀 label은 0~9 정수여야 합니다.')
  }
  return Array.from({ length: 10 }, (_, index) => (index === label ? 1 : 0))
}

