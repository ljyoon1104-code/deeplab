import type { MnistDatasetSize, MnistSample } from '../lesson07/mnistTypes'

export type Lesson08ModelType = 'simple' | 'textbook' | 'wide'
export type Lesson08Epochs = 1 | 3 | 5

export type TrainingStatus =
  | 'idle'
  | 'loading-data'
  | 'loading-engine'
  | 'converting-data'
  | 'preparing-model'
  | 'training'
  | 'summarizing'
  | 'trained'
  | 'evaluating'
  | 'predicting'
  | 'ready'
  | 'cancelled'
  | 'error'

export interface TrainingConfig {
  datasetVersion: string
  datasetSize: MnistDatasetSize
  epochs: Lesson08Epochs
  modelType: Lesson08ModelType
  batchSize: 32
}

export interface EpochMetric {
  epoch: number
  loss: number
  accuracy: number
}

export interface BatchProgress {
  currentEpoch: number
  batchInEpoch: number
  batchesPerEpoch: number
  completedBatches: number
  totalBatches: number
  loss: number
  accuracy: number
}

export interface TrainingResult {
  config: TrainingConfig
  history: EpochMetric[]
  finalLoss: number
  finalAccuracy: number
  durationMs: number
  completedEpochs: number
  backend: string
  recordId: string
}

export interface TestPrediction {
  sample: MnistSample
  actualLabel: number
  predictedLabel: number
  probabilities: number[]
  confidence: number
}

export interface EvaluationResult {
  sampleCount: number
  correct: number
  wrong: number
  accuracy: number
  predictions: TestPrediction[]
}

export interface DrawingPrediction {
  predictedLabel: number
  probabilities: number[]
  confidence: number
  inputCount: 784
  inputMin: number
  inputMax: number
  previewPixels: number[]
}

export interface ExperimentRecord {
  id: string
  datasetVersion: string
  trainSampleCount: MnistDatasetSize
  modelType: Lesson08ModelType
  epochs: Lesson08Epochs
  batchSize: 32
  finalTrainLoss: number
  finalTrainAccuracy: number
  testAccuracy: number | null
  testCorrect: number | null
  testWrong: number | null
  durationMs: number
  timestamp: string
}

export type OperationErrorKind =
  | 'data'
  | 'engine'
  | 'model'
  | 'training'
  | 'evaluation'
  | 'drawing'

export interface OperationError {
  kind: OperationErrorKind
  message: string
  detail?: string
}
