export const lesson05StepTitles = [
  '신경망의 예측은 어떻게 만들어질까',
  '예측값과 실제값은 같을까',
  '틀린 정도를 숫자로 나타내려면',
  '숫자를 예측한다면 — MSE',
  '두 종류 중 하나라면 — BCEE',
  '여러 종류 중 하나라면 — CCEE',
  '어떤 손실함수를 사용해야 할까',
] as const

export const lesson05Objectives = [
  '입력 데이터가 신경망을 지나 예측값을 만드는 과정을 순전파라고 이해한다.',
  '예측값과 실제값이 다를 수 있음을 이해한다.',
  '예측이 얼마나 틀렸는지를 수치로 나타내는 것이 손실(Loss)임을 이해한다.',
  '문제 유형에 따라 사용하는 손실함수가 달라짐을 이해한다.',
  '평균제곱오차(MSE), BCEE, CCEE의 역할을 구분할 수 있다.',
  '손실값이 작을수록 현재 예측이 실제값에 가까운 방향임을 이해한다.',
] as const

export const forwardPassCards = [
  { id: 'input', label: '입력 데이터' },
  { id: 'hidden', label: '은닉층에서 처리' },
  { id: 'output', label: '출력층' },
  { id: 'prediction', label: '예측값' },
] as const

export const mseExamples = [
  { id: 'student-1', label: '학생 1', target: 80, prediction: 85 },
  { id: 'student-2', label: '학생 2', target: 70, prediction: 80 },
  { id: 'student-3', label: '학생 3', target: 90, prediction: 90 },
] as const

export const cceePresets = [
  {
    id: 'A',
    label: '예측 A',
    helper: '정답 확률이 높음',
    probabilities: [0.12, 0.04, 0.84] as const,
  },
  {
    id: 'B',
    label: '예측 B',
    helper: '정답 확률이 낮아짐',
    probabilities: [0.25, 0.35, 0.4] as const,
  },
  {
    id: 'C',
    label: '예측 C',
    helper: '다른 클래스 확률이 가장 높음',
    probabilities: [0.7, 0.2, 0.1] as const,
  },
] as const

export const lossMatchingCases = [
  {
    id: 'temperature',
    title: '내일 기온 23.5℃ 예측',
    type: '연속적인 숫자 예측',
    answer: 'MSE',
  },
  {
    id: 'spam',
    title: '이메일이 스팸 / 정상인지 분류',
    type: '이진 분류',
    answer: 'BCEE',
  },
  {
    id: 'animals',
    title: '고양이 / 강아지 / 토끼 중 하나를 분류',
    type: '다중 분류',
    answer: 'CCEE',
  },
] as const

export const lesson05Quiz = [
  {
    question: '손실함수의 역할로 가장 적절한 것은?',
    options: [
      ['A', '예측과 실제값의 차이를 평가한다.'],
      ['B', '데이터를 인터넷에서 수집한다.'],
      ['C', '입력값의 개수를 늘린다.'],
      ['D', '이미지를 저장한다.'],
    ],
    answer: 'A',
    explanation: '손실함수는 모델의 예측값과 실제값을 비교하여 현재 예측이 얼마나 틀렸는지 수치로 나타냅니다.',
  },
  {
    question: '연속적인 숫자값을 예측할 때 주로 사용하는 손실함수는?',
    options: [
      ['A', 'MSE'],
      ['B', 'BCEE'],
      ['C', 'CCEE'],
      ['D', 'Softmax'],
    ],
    answer: 'A',
    explanation: '평균제곱오차(MSE)는 점수, 가격, 온도처럼 연속적인 숫자를 예측하는 문제에 사용할 수 있습니다.',
  },
  {
    question: '두 종류 중 하나를 분류할 때 주로 사용하는 손실함수는?',
    options: [
      ['A', 'ReLU'],
      ['B', 'BCEE'],
      ['C', 'MSE'],
      ['D', 'Softmax'],
    ],
    answer: 'B',
    explanation: 'BCEE는 스팸 또는 정상처럼 두 종류 중 하나를 판단하는 이진 분류의 예측을 평가합니다.',
  },
  {
    question: '여러 클래스 중 하나를 분류할 때 주로 사용하는 손실함수는?',
    options: [
      ['A', 'CCEE'],
      ['B', 'Sigmoid'],
      ['C', 'ReLU'],
      ['D', 'MSE'],
    ],
    answer: 'A',
    explanation: 'CCEE는 여러 클래스의 예측 확률과 실제 정답을 비교하는 다중 분류 손실함수입니다.',
  },
] as const

