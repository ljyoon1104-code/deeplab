export const LOSS_EPSILON = 1e-12

export const clampProbability = (probability: number) =>
  Math.min(1 - LOSS_EPSILON, Math.max(LOSS_EPSILON, probability))

export const predictionError = (target: number, prediction: number) =>
  prediction - target

export const squaredError = (target: number, prediction: number) =>
  predictionError(target, prediction) ** 2

export const mse = (
  targets: readonly number[],
  predictions: readonly number[],
) => {
  if (targets.length === 0 || targets.length !== predictions.length) {
    throw new Error('MSE 계산에는 길이가 같은 실제값과 예측값 배열이 필요합니다.')
  }

  return (
    targets.reduce(
      (sum, target, index) => sum + squaredError(target, predictions[index]),
      0,
    ) / targets.length
  )
}

export const binaryCrossEntropy = (target: 0 | 1, probability: number) => {
  const safeProbability = clampProbability(probability)
  return -(
    target * Math.log(safeProbability) +
    (1 - target) * Math.log(1 - safeProbability)
  )
}

export const categoricalCrossEntropy = (
  oneHotTarget: readonly number[],
  probabilities: readonly number[],
) => {
  if (
    oneHotTarget.length === 0 ||
    oneHotTarget.length !== probabilities.length
  ) {
    throw new Error('CCEE 계산에는 길이가 같은 정답과 확률 배열이 필요합니다.')
  }

  return -oneHotTarget.reduce(
    (sum, target, index) =>
      sum + target * Math.log(clampProbability(probabilities[index])),
    0,
  )
}

export const formatLoss = (value: number, digits = 2) =>
  value.toFixed(digits)

