export type ActivationKind = 'step' | 'relu' | 'sigmoid'

export const stepActivation = (z: number): 0 | 1 => (z < 0 ? 0 : 1)

export const relu = (z: number) => Math.max(0, z)

export const sigmoid = (z: number) => {
  if (z >= 0) return 1 / (1 + Math.exp(-z))

  const expZ = Math.exp(z)
  return expZ / (1 + expZ)
}

export const activationOutput = (kind: ActivationKind, z: number) => {
  if (kind === 'step') return stepActivation(z)
  if (kind === 'relu') return relu(z)
  return sigmoid(z)
}

export const softmax = (values: readonly number[]) => {
  if (values.length === 0) return []

  const maxValue = Math.max(...values)
  const exponentials = values.map((value) => Math.exp(value - maxValue))
  const sum = exponentials.reduce((total, value) => total + value, 0)

  return exponentials.map((value) => value / sum)
}

export const formatActivationValue = (value: number) => {
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(2)
}
