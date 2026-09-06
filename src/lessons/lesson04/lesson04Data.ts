export const lesson04StepTitles = [
  '퍼셉트론을 여러 개 연결하면',
  '인공신경망에는 어떤 층이 있을까',
  '입력층은 무엇을 받을까',
  '은닉층에서는 무엇이 일어날까',
  '출력층은 어떤 결과를 만들까',
  '은닉층이 여러 개라면',
  '인공신경망을 완성해 보자',
] as const

export const lesson04Objectives = [
  '여러 퍼셉트론을 연결하면 인공신경망을 구성할 수 있음을 이해한다.',
  '인공신경망의 입력층, 은닉층, 출력층의 역할을 구분할 수 있다.',
  '입력층 → 은닉층 → 출력층으로 정보가 전달되는 전체 흐름을 설명할 수 있다.',
  '은닉층이 여러 개인 신경망을 심층 신경망(DNN)이라고 이해한다.',
  '앞 차시에서 배운 활성화 함수가 신경망의 각 층에서 어떻게 활용되는지 연결할 수 있다.',
] as const

export const networkLayers = [
  {
    id: 'input',
    label: '입력층',
    role: '외부의 입력 데이터를 받아 신경망에 전달합니다.',
    shortRole: '데이터를 받음',
    nodeCount: 4,
    tone: 'indigo',
  },
  {
    id: 'hidden',
    label: '은닉층',
    role: '입력받은 정보를 계산하고 필요한 특징을 학습합니다.',
    shortRole: '정보를 처리함',
    nodeCount: 4,
    tone: 'cyan',
  },
  {
    id: 'output',
    label: '출력층',
    role: '처리된 정보로 분류나 예측의 최종 결과를 만듭니다.',
    shortRole: '결과를 만듦',
    nodeCount: 3,
    tone: 'emerald',
  },
] as const

export type LayerId = (typeof networkLayers)[number]['id']

export const irisCards = [
  { id: 'sepal-length', label: '꽃받침 길이', target: 'input' },
  { id: 'sepal-width', label: '꽃받침 너비', target: 'input' },
  { id: 'petal-length', label: '꽃잎 길이', target: 'input' },
  { id: 'petal-width', label: '꽃잎 너비', target: 'input' },
  { id: 'iris-kind', label: '붓꽃 종류', target: 'output' },
  { id: 'iris-probability', label: '각 종류의 예측 확률', target: 'output' },
] as const satisfies ReadonlyArray<{
  id: string
  label: string
  target: 'input' | 'output'
}>

export const hiddenProcessCards = [
  { id: 'multiply', label: '각 입력에 가중치 곱하기' },
  { id: 'sum-bias', label: '계산 결과를 모두 더하고 편향 추가' },
  { id: 'weighted-sum', label: '가중합 z' },
  { id: 'activation', label: '활성화 함수 적용' },
  { id: 'forward', label: '다음 층으로 전달' },
] as const

export const outputCases = [
  {
    id: 'spam',
    title: '스팸 메일인가 아닌가',
    type: '이진 분류',
    output: '출력 하나 또는 두 상태',
    activation: 'Sigmoid',
  },
  {
    id: 'animals',
    title: '고양이·강아지·토끼 중 하나',
    type: '다중 분류',
    output: '클래스별 출력',
    activation: 'Softmax',
  },
] as const

export const lesson04Quiz = [
  {
    question: '인공신경망의 기본 구조로 가장 적절한 것은?',
    options: [
      ['A', '입력층 → 은닉층 → 출력층'],
      ['B', '출력층 → 입력층 → 은닉층'],
      ['C', '은닉층 → 데이터 → 입력층'],
      ['D', '출력층만 존재한다.'],
    ],
    answer: 'A',
    explanation: '인공신경망의 기본 정보 흐름은 입력층 → 은닉층 → 출력층입니다.',
  },
  {
    question: '은닉층의 역할로 가장 적절한 것은?',
    options: [
      ['A', '입력 정보를 처리하여 새로운 특징 표현을 만든다.'],
      ['B', '데이터 파일을 저장한다.'],
      ['C', '인터넷에서 데이터를 다운로드한다.'],
      ['D', '최종 결과만 화면에 출력한다.'],
    ],
    answer: 'A',
    explanation: '은닉층은 입력 정보를 가중합과 활성화 함수로 처리하여 다음 층에 전달할 새로운 특징 표현을 만듭니다.',
  },
  {
    question: '여러 개의 은닉층을 가진 신경망을 무엇이라고 하는가?',
    options: [
      ['A', '데이터베이스'],
      ['B', '심층 신경망(DNN)'],
      ['C', '운영체제'],
      ['D', '탐색 트리'],
    ],
    answer: 'B',
    explanation: '입력층과 출력층 사이에 여러 은닉층을 가진 인공신경망을 심층 신경망(DNN)이라고 합니다.',
  },
  {
    question: '다음 설명 중 옳은 것은?',
    options: [
      ['A', '은닉층이 많을수록 항상 좋은 모델이다.'],
      ['B', '출력층은 문제 유형에 따라 구조가 달라질 수 있다.'],
      ['C', 'ReLU는 항상 다중 분류 출력층에서만 사용한다.'],
      ['D', '입력층은 최종 분류 결과만 받는다.'],
    ],
    answer: 'B',
    explanation: '출력층은 이진 분류인지 다중 분류인지와 같은 문제 유형에 따라 출력 형태와 활성화 함수가 달라질 수 있습니다.',
  },
] as const
