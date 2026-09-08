export interface PerceptronInput {
  inputs: readonly number[]
  weights: readonly number[]
  bias: number
}

export interface PerceptronCalculation extends PerceptronInput {
  products: number[]
  productSum: number
  z: number
  output: 0 | 1
}

const cleanNumber = (value: number) => (Object.is(value, -0) ? 0 : value)

export const stepActivation = (z: number): 0 | 1 => (z < 0 ? 0 : 1)

export const calculatePerceptronN = ({
  inputs,
  weights,
  bias,
}: PerceptronInput): PerceptronCalculation => {
  if (inputs.length === 0 || inputs.length !== weights.length) {
    throw new Error('입력값과 가중치는 같은 개수로 하나 이상 필요합니다.')
  }

  const products = inputs.map((input, index) =>
    cleanNumber(input * weights[index]),
  )
  const productSum = cleanNumber(products.reduce((sum, value) => sum + value, 0))
  const z = cleanNumber(productSum + bias)

  return {
    inputs,
    weights,
    bias,
    products,
    productSum,
    z,
    output: stepActivation(z),
  }
}

export const parseStudentNumber = (value: string) => {
  const normalized = value.trim().replace(',', '.')
  if (normalized === '') return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

export const isCloseNumber = (actual: number | null, expected: number, tolerance = 1e-6) =>
  actual !== null && Math.abs(actual - expected) <= tolerance

export const formatNumber = (value: number, digits = 2) =>
  Number.isInteger(value) ? String(value) : String(Number(value.toFixed(digits)))

export interface BoundaryPoint {
  x: number
  y: number
}

export const classifyPoint = (
  point: BoundaryPoint,
  weights: readonly [number, number],
  bias: number,
) => calculatePerceptronN({ inputs: [point.x, point.y], weights, bias })

export const getBoundarySegment = (
  weights: readonly [number, number],
  bias: number,
  min = -3,
  max = 3,
): [BoundaryPoint, BoundaryPoint] | null => {
  const [w1, w2] = weights
  if (Math.abs(w1) < 1e-9 && Math.abs(w2) < 1e-9) return null

  const candidates: BoundaryPoint[] = []
  const add = (point: BoundaryPoint) => {
    if (
      point.x >= min - 1e-9 &&
      point.x <= max + 1e-9 &&
      point.y >= min - 1e-9 &&
      point.y <= max + 1e-9 &&
      !candidates.some(
        (candidate) =>
          Math.abs(candidate.x - point.x) < 1e-7 &&
          Math.abs(candidate.y - point.y) < 1e-7,
      )
    ) {
      candidates.push(point)
    }
  }

  if (Math.abs(w2) >= 1e-9) {
    add({ x: min, y: (-bias - w1 * min) / w2 })
    add({ x: max, y: (-bias - w1 * max) / w2 })
  }
  if (Math.abs(w1) >= 1e-9) {
    add({ x: (-bias - w2 * min) / w1, y: min })
    add({ x: (-bias - w2 * max) / w1, y: max })
  }

  return candidates.length >= 2 ? [candidates[0], candidates[1]] : null
}

export const truthTable = (weights: readonly [number, number], bias: number) =>
  ([
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ] as const).map(([x1, x2]) => ({
    x1,
    x2,
    ...calculatePerceptronN({ inputs: [x1, x2], weights, bias }),
  }))

export const matchesTruthTable = (
  weights: readonly [number, number],
  bias: number,
  expected: readonly (0 | 1)[],
) => truthTable(weights, bias).every((row, index) => row.output === expected[index])
