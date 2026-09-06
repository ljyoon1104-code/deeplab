export interface ModelParameters {
  w1: number
  w2: number
  b: number
}

export interface TrainingExample {
  x1: number
  x2: number
  y: 0 | 1
}

export interface ForwardResult {
  z: number
  prediction: number
  loss: number
}

export interface TrainingSnapshot extends ModelParameters, ForwardResult {
  epoch: number
}

export interface TrainingStepResult {
  before: ForwardResult
  after: ForwardResult
  nextParameters: ModelParameters
  error: number
}

export const TRAINING_EXAMPLE: TrainingExample = {
  x1: 1,
  x2: 1,
  y: 1,
}

export const INITIAL_PARAMETERS: ModelParameters = {
  w1: 0.2,
  w2: -0.1,
  b: 0,
}

export const LEARNING_RATE = 0.5
export const TRAINING_EPSILON = 1e-12

export const sigmoid = (value: number) => {
  if (value >= 0) {
    return 1 / (1 + Math.exp(-value))
  }
  const exponent = Math.exp(value)
  return exponent / (1 + exponent)
}

export const binaryCrossEntropy = (
  prediction: number,
  target: 0 | 1,
) => {
  const safePrediction = Math.min(
    1 - TRAINING_EPSILON,
    Math.max(TRAINING_EPSILON, prediction),
  )
  return -(
    target * Math.log(safePrediction) +
    (1 - target) * Math.log(1 - safePrediction)
  )
}

export const forward = (
  parameters: ModelParameters,
  example: TrainingExample = TRAINING_EXAMPLE,
): ForwardResult => {
  const z =
    example.x1 * parameters.w1 +
    example.x2 * parameters.w2 +
    parameters.b
  const prediction = sigmoid(z)
  return {
    z,
    prediction,
    loss: binaryCrossEntropy(prediction, example.y),
  }
}

export const trainOneStep = (
  parameters: ModelParameters,
  example: TrainingExample = TRAINING_EXAMPLE,
  learningRate = LEARNING_RATE,
): TrainingStepResult => {
  const before = forward(parameters, example)
  const error = before.prediction - example.y
  const nextParameters = {
    w1: parameters.w1 - learningRate * error * example.x1,
    w2: parameters.w2 - learningRate * error * example.x2,
    b: parameters.b - learningRate * error,
  }

  return {
    before,
    after: forward(nextParameters, example),
    nextParameters,
    error,
  }
}

export const makeSnapshot = (
  epoch: number,
  parameters: ModelParameters,
  example: TrainingExample = TRAINING_EXAMPLE,
): TrainingSnapshot => ({
  epoch,
  ...parameters,
  ...forward(parameters, example),
})

export const trainRepeatedly = (
  parameters: ModelParameters,
  startEpoch: number,
  count: number,
  example: TrainingExample = TRAINING_EXAMPLE,
  learningRate = LEARNING_RATE,
) => {
  let currentParameters = { ...parameters }
  const snapshots: TrainingSnapshot[] = []

  for (let index = 1; index <= count; index += 1) {
    const result = trainOneStep(currentParameters, example, learningRate)
    currentParameters = result.nextParameters
    snapshots.push(
      makeSnapshot(startEpoch + index, currentParameters, example),
    )
  }

  return {
    parameters: currentParameters,
    snapshots,
  }
}

export const formatTrainingValue = (value: number, digits = 3) =>
  value.toFixed(digits)

