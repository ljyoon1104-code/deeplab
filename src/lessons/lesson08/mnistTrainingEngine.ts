import type { MnistDataset, MnistSample } from '../lesson07/mnistTypes'
import { MODEL_OPTIONS } from './lesson08Data'
import type {
  BatchProgress,
  DrawingPrediction,
  EpochMetric,
  EvaluationResult,
  Lesson08ModelType,
} from './lesson08Types'

export type TensorFlow = typeof import('@tensorflow/tfjs')
export type TrainableModel = import('@tensorflow/tfjs').Sequential
export type OwnedOptimizer = import('@tensorflow/tfjs').Optimizer

let tensorflowPromise: Promise<TensorFlow> | null = null

export async function loadTensorFlow() {
  tensorflowPromise ??= import('@tensorflow/tfjs').then(async (tf) => {
    await tf.ready()
    return tf
  }).catch((error) => {
    tensorflowPromise = null
    throw error
  })
  return tensorflowPromise
}

export function createTrainableModel(tf: TensorFlow, modelType: Lesson08ModelType) {
  const model = tf.sequential()
  const hiddenLayers = MODEL_OPTIONS[modelType].layers
  hiddenLayers.forEach((units, index) => {
    model.add(
      tf.layers.dense({
        units,
        activation: 'relu',
        ...(index === 0 ? { inputShape: [784] } : {}),
      }),
    )
  })
  model.add(tf.layers.dense({ units: 10, activation: 'softmax' }))

  const optimizer = tf.train.adam()
  try {
    model.compile({ optimizer, loss: 'categoricalCrossentropy', metrics: ['accuracy'] })
    return { model, optimizer }
  } catch (error) {
    model.dispose()
    optimizer.dispose()
    throw error
  }
}

export function createTrainingTensors(tf: TensorFlow, dataset: MnistDataset) {
  const xsBuffer = new Float32Array(dataset.count * 784)
  const ysBuffer = new Float32Array(dataset.count * 10)
  dataset.samples.forEach((sample, sampleIndex) => {
    const pixelOffset = sampleIndex * 784
    for (let pixelIndex = 0; pixelIndex < 784; pixelIndex += 1) {
      xsBuffer[pixelOffset + pixelIndex] = sample.pixels[pixelIndex] / 255
    }
    ysBuffer[sampleIndex * 10 + sample.label] = 1
  })

  const trainXs = tf.tensor2d(xsBuffer, [dataset.count, 784])
  try {
    return {
      trainXs,
      trainYs: tf.tensor2d(ysBuffer, [dataset.count, 10]),
    }
  } catch (error) {
    trainXs.dispose()
    throw error
  }
}

export async function fitModel(
  tf: TensorFlow,
  model: TrainableModel,
  trainXs: import('@tensorflow/tfjs').Tensor2D,
  trainYs: import('@tensorflow/tfjs').Tensor2D,
  epochs: number,
  onBatch: (progress: BatchProgress) => void,
  onEpoch: (metric: EpochMetric) => void,
) {
  const history: EpochMetric[] = []
  const batchesPerEpoch = Math.ceil(trainXs.shape[0] / 32)
  const totalBatches = batchesPerEpoch * epochs
  let activeEpoch = 0
  let lastPublishedAt = 0

  await model.fit(trainXs, trainYs, {
    epochs,
    batchSize: 32,
    shuffle: true,
    yieldEvery: 'batch',
    callbacks: {
      onEpochBegin: (epoch) => {
        activeEpoch = epoch
      },
      onBatchEnd: async (batch, logs) => {
        const loss = Number(logs?.loss)
        const accuracy = Number(logs?.acc ?? logs?.accuracy)
        if (!Number.isFinite(loss) || !Number.isFinite(accuracy)) {
          throw new Error('Batch 학습 지표가 유한한 숫자가 아닙니다.')
        }

        const batchInEpoch = batch + 1
        const completedBatches = activeEpoch * batchesPerEpoch + batchInEpoch
        const now = performance.now()
        const shouldPublish =
          batch === 0 ||
          batchInEpoch === batchesPerEpoch ||
          completedBatches === totalBatches ||
          now - lastPublishedAt >= 120

        if (shouldPublish) {
          lastPublishedAt = now
          onBatch({
            currentEpoch: activeEpoch + 1,
            batchInEpoch,
            batchesPerEpoch,
            completedBatches,
            totalBatches,
            loss,
            accuracy,
          })
          await tf.nextFrame()
        }
      },
      onEpochEnd: async (epoch, logs) => {
        const loss = Number(logs?.loss)
        const accuracy = Number(logs?.acc ?? logs?.accuracy)
        if (!Number.isFinite(loss) || !Number.isFinite(accuracy)) {
          throw new Error('학습 지표가 유한한 숫자가 아닙니다.')
        }
        const metric = { epoch: epoch + 1, loss, accuracy }
        history.push(metric)
        onEpoch(metric)
        await tf.nextFrame()
      },
    },
  })
  return history
}

export function validateProbabilities(values: readonly number[]) {
  if (
    values.length !== 10 ||
    values.some((value) => !Number.isFinite(value) || value < 0 || value > 1)
  ) {
    throw new Error('Softmax 확률 10개가 올바른 범위의 유한한 숫자가 아닙니다.')
  }
  const sum = values.reduce((total, value) => total + value, 0)
  if (Math.abs(sum - 1) > 0.001) {
    throw new Error(`Softmax 확률의 내부 합이 1이 아닙니다. (${sum})`)
  }
}

function bestIndex(values: readonly number[]) {
  let best = 0
  for (let index = 1; index < values.length; index += 1) {
    if (values[index] > values[best]) best = index
  }
  return best
}

export async function evaluateModel(
  tf: TensorFlow,
  model: TrainableModel,
  samples: MnistSample[],
): Promise<EvaluationResult> {
  const testXs = tf.tensor2d(
    Float32Array.from(samples.flatMap((sample) => sample.pixels.map((pixel) => pixel / 255))),
    [samples.length, 784],
  )
  let output: import('@tensorflow/tfjs').Tensor | null = null
  try {
    const prediction = model.predict(testXs)
    if (Array.isArray(prediction)) throw new Error('모델 출력이 하나의 텐서가 아닙니다.')
    output = prediction
    if (output.rank !== 2 || output.shape[0] !== samples.length || output.shape[1] !== 10) {
      throw new Error('모델 출력 shape이 [Test 개수, 10]이 아닙니다.')
    }
    const flat = Array.from(await output.data())
    const predictions = samples.map((sample, sampleIndex) => {
      const probabilities = flat.slice(sampleIndex * 10, sampleIndex * 10 + 10)
      validateProbabilities(probabilities)
      const predictedLabel = bestIndex(probabilities)
      return {
        sample,
        actualLabel: sample.label,
        predictedLabel,
        probabilities,
        confidence: probabilities[predictedLabel],
      }
    })
    const correct = predictions.filter((item) => item.actualLabel === item.predictedLabel).length
    return {
      sampleCount: samples.length,
      correct,
      wrong: samples.length - correct,
      accuracy: correct / samples.length,
      predictions,
    }
  } finally {
    output?.dispose()
    testXs.dispose()
  }
}

export async function predictDrawing(
  tf: TensorFlow,
  model: TrainableModel,
  normalized: readonly number[],
  previewPixels: number[],
): Promise<DrawingPrediction> {
  if (
    normalized.length !== 784 ||
    normalized.some((value) => !Number.isFinite(value) || value < 0 || value > 1)
  ) {
    throw new Error('그림 입력이 0~1 범위의 값 784개가 아닙니다.')
  }
  const input = tf.tensor2d(Float32Array.from(normalized), [1, 784])
  let output: import('@tensorflow/tfjs').Tensor | null = null
  try {
    const prediction = model.predict(input)
    if (Array.isArray(prediction)) throw new Error('모델 출력이 하나의 텐서가 아닙니다.')
    output = prediction
    if (output.rank !== 2 || output.shape[0] !== 1 || output.shape[1] !== 10) {
      throw new Error('그림 예측 출력 shape이 [1, 10]이 아닙니다.')
    }
    const probabilities = Array.from(await output.data())
    validateProbabilities(probabilities)
    const predictedLabel = bestIndex(probabilities)
    return {
      predictedLabel,
      probabilities,
      confidence: probabilities[predictedLabel],
      inputCount: 784,
      inputMin: Math.min(...normalized),
      inputMax: Math.max(...normalized),
      previewPixels,
    }
  } finally {
    output?.dispose()
    input.dispose()
  }
}
