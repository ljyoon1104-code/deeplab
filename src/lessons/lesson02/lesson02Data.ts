export const lesson02StepTitles = [
  '인공 뉴런은 어떻게 판단할까',
  '퍼셉트론을 이루는 값',
  '가중치를 적용해 보자',
  '편향까지 더하면',
  '계산 결과를 최종 판단으로 바꾸기',
  '가중치와 편향을 바꾸면 결과도 바뀔까',
  '퍼셉트론 계산 완성하기',
] as const

export const lesson02Objectives = [
  '퍼셉트론은 여러 입력을 받아 하나의 출력을 만드는 인공 뉴런의 기본 구조임을 이해한다.',
  '입력값, 가중치, 편향의 역할을 구분할 수 있다.',
  '입력값과 가중치를 곱하고 모두 더한 뒤 편향을 더해 가중합을 구할 수 있다.',
  '가중합에 계단 함수를 적용하여 최종 출력을 구할 수 있다.',
  '가중치나 편향이 달라지면 같은 입력에서도 결과가 달라질 수 있음을 이해한다.',
] as const

export const perceptronElements = [
  {
    id: 'input',
    label: '입력값',
    symbol: 'x1, x2',
    description: '퍼셉트론에 들어오는 정보입니다.',
  },
  {
    id: 'weight',
    label: '가중치',
    symbol: 'w1, w2',
    description: '각 입력을 얼마나 중요하게 반영할지 나타내는 값입니다.',
  },
  {
    id: 'bias',
    label: '편향',
    symbol: 'b',
    description: '전체 판단 기준을 조정하는 값입니다.',
  },
  {
    id: 'weighted-sum',
    label: '가중합',
    symbol: 'z',
    description: '입력값×가중치를 모두 더하고 편향까지 더한 값입니다.',
  },
  {
    id: 'activation',
    label: '활성화 함수',
    symbol: '계단 함수',
    description: '가중합을 기준과 비교하여 최종 판단으로 바꾸는 함수입니다.',
  },
  {
    id: 'output',
    label: '출력',
    symbol: '0 또는 1',
    description: '가중합에 활성화 함수를 적용한 뒤 얻는 최종 결과입니다.',
  },
] as const

export interface PerceptronValues {
  x1: number
  x2: number
  w1: number
  w2: number
  b: number
}

export interface PerceptronResult extends PerceptronValues {
  product1: number
  product2: number
  productSum: number
  z: number
  output: 0 | 1
}

const cleanNumber = (value: number) => (Object.is(value, -0) ? 0 : value)

export const calculatePerceptron = (
  values: PerceptronValues,
): PerceptronResult => {
  const product1 = cleanNumber(values.x1 * values.w1)
  const product2 = cleanNumber(values.x2 * values.w2)
  const productSum = cleanNumber(product1 + product2)
  const z = cleanNumber(productSum + values.b)

  return {
    ...values,
    product1,
    product2,
    productSum,
    z,
    output: z < 0 ? 0 : 1,
  }
}

export const formatNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)))

export const parseStudentNumber = (value: string) => {
  if (value.trim() === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}
