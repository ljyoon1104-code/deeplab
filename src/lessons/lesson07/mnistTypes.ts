export const MNIST_DATASET_SIZES = [500, 1_000, 2_000, 5_000] as const

export type MnistDatasetSize = (typeof MNIST_DATASET_SIZES)[number]

export interface MnistSample {
  id: string
  label: number
  pixels: number[]
}

export interface MnistDataset {
  dataset: 'MNIST'
  split: 'train'
  count: number
  imageWidth: 28
  imageHeight: 28
  pixelRange: [0, 255]
  samples: MnistSample[]
}

export interface MnistMetadata {
  datasetName: string
  datasetVersion: string
  image: {
    width: number
    height: number
    pixelCount: number
  }
  classes: number[]
  original: {
    train: { count: number }
    test: { count: number }
  }
  testSubsetCount: number
  pixelRange: [number, number]
  sources: {
    originalDataset: {
      name: string
      creators: string[]
      note: string
    }
    csvConversion: {
      converter: string
      name: string
      sourcePage: string
    }
  }
}

export interface NormalizedInput {
  sampleId: string
  values: number[]
}

