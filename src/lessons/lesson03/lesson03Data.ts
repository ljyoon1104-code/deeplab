export const lesson03StepTitles = [
  '가중합 다음에는 무엇이 있을까',
  '계단 함수는 0과 1로 판단한다',
  'ReLU는 양수 값을 그대로 보낸다',
  'Sigmoid는 0과 1 사이로 바꾼다',
  '같은 z인데 왜 출력이 다를까',
  '여러 종류 중 하나를 고르려면',
  '어떤 활성화 함수를 어디에 사용할까',
] as const

export const lesson03Objectives = [
  '활성화 함수는 가중합을 받아 다음 출력값을 만드는 역할을 한다.',
  '같은 가중합이라도 어떤 활성화 함수를 사용하느냐에 따라 출력이 달라질 수 있다.',
  '계단 함수, ReLU, Sigmoid의 출력 특성을 비교할 수 있다.',
  'Softmax는 여러 출력값을 확률처럼 비교할 때 사용하며 출력값의 합이 1이 됨을 이해한다.',
  '활성화 함수마다 주로 사용되는 위치와 목적이 다름을 이해한다.',
] as const

export const stepExamples = [
  { z: -3, output: 0 },
  { z: -0.5, output: 0 },
  { z: 0, output: 1 },
  { z: 4, output: 1 },
] as const

export const usageTargets = [
  '은닉층',
  '이진 분류 출력층',
  '다중 분류 출력층',
] as const

export type UsageTarget = (typeof usageTargets)[number]

export const usageFunctions = [
  { id: 'relu', label: 'ReLU', target: '은닉층' },
  { id: 'sigmoid', label: 'Sigmoid', target: '이진 분류 출력층' },
  { id: 'softmax', label: 'Softmax', target: '다중 분류 출력층' },
] as const satisfies ReadonlyArray<{
  id: string
  label: string
  target: UsageTarget
}>

export const lesson03Quiz = [
  {
    question: 'ReLU의 특징으로 가장 적절한 것은?',
    options: [
      ['A', '모든 값을 0~1 사이로 만든다.'],
      ['B', '음수는 0, 양수는 그대로 출력한다.'],
      ['C', '여러 값의 합을 항상 1로 만든다.'],
      ['D', '출력이 항상 0 또는 1이다.'],
    ],
    answer: 'B',
    explanation: 'ReLU는 음수 입력을 0으로 만들고, 0 이상의 값은 그대로 출력합니다.',
  },
  {
    question: 'Sigmoid 함수에서 z = 0일 때 출력은?',
    options: [
      ['A', '0'],
      ['B', '0.5'],
      ['C', '1'],
      ['D', '2'],
    ],
    answer: 'B',
    explanation: 'sigmoid(0) = 1 / (1 + exp(0)) = 1 / 2이므로 출력은 0.5입니다.',
  },
  {
    question: '여러 클래스 중 하나를 분류할 때 출력층에서 주로 사용하는 함수는?',
    options: [
      ['A', 'ReLU'],
      ['B', 'Softmax'],
      ['C', '계단 함수'],
      ['D', '평균제곱오차'],
    ],
    answer: 'B',
    explanation: 'Softmax는 여러 클래스의 점수를 함께 비교 가능한 확률로 바꾸므로 다중 분류 출력층에서 주로 사용합니다.',
  },
  {
    question: '다음 설명 중 옳은 것은?',
    options: [
      ['A', '같은 z이면 어떤 활성화 함수를 사용해도 출력은 같다.'],
      ['B', 'Softmax 출력값의 합은 1이 된다.'],
      ['C', 'Sigmoid 출력은 음수가 될 수 있다.'],
      ['D', 'ReLU 출력은 항상 0 또는 1이다.'],
    ],
    answer: 'B',
    explanation: 'Softmax는 여러 점수를 함께 확률로 바꾸며 내부 계산에서 그 확률의 합은 1이 됩니다.',
  },
] as const
