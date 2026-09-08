export type OutputActivation = 'step' | 'sigmoid'

export interface TinyNetworkConfig {
  inputs: readonly [number, number]
  hiddenWeights: readonly [readonly [number, number], readonly [number, number]]
  hiddenBiases: readonly [number, number]
  outputWeights: readonly [number, number]
  outputBias: number
  outputActivation: OutputActivation
}

const clean = (value: number) => Object.is(value, -0) ? 0 : value
export const reluValue = (value: number) => Math.max(0, value)
export const sigmoidValue = (value: number) => 1 / (1 + Math.exp(-value))

export const forwardTinyNetwork = (config: TinyNetworkConfig) => {
  const hidden = config.hiddenWeights.map((weights, index) => {
    const z = clean(config.inputs[0] * weights[0] + config.inputs[1] * weights[1] + config.hiddenBiases[index])
    return { z, output: reluValue(z) }
  }) as [{ z: number; output: number }, { z: number; output: number }]
  const outputZ = clean(hidden[0].output * config.outputWeights[0] + hidden[1].output * config.outputWeights[1] + config.outputBias)
  const output = config.outputActivation === 'step'
    ? (outputZ < 0 ? 0 : 1)
    : sigmoidValue(outputZ)
  return { hidden, outputZ, output }
}

export const parseNetworkNumber = (value: string) => {
  const normalized = value.trim().replace(',', '.')
  if (!normalized) return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

export const networkNumberMatches = (value: string, expected: number, tolerance = 0.005) => {
  const parsed = parseNetworkNumber(value)
  return parsed !== null && Math.abs(parsed - expected) <= tolerance
}
