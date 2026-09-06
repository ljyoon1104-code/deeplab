export const lesson06StepTitles = [
  'Loss를 계산한 다음에는',
  '신경망에서 무엇을 바꿀까',
  '역전파란 무엇일까',
  '어느 방향으로 바꿔야 할까',
  '한 번 학습하면 무엇이 달라질까',
  '반복하면 정말 학습할까',
  '딥러닝은 어떻게 학습할까',
] as const

export const lesson06Objectives = [
  '순전파로 예측값이 만들어지고 손실함수로 Loss가 계산됨을 복습한다.',
  'Loss를 줄이기 위해 신경망의 가중치와 편향을 수정해야 함을 이해한다.',
  '오차 정보를 출력 쪽에서 앞쪽으로 전달해 수정 방향을 계산하는 과정을 역전파라고 이해한다.',
  '경사하강법은 손실을 줄이는 방향으로 가중치와 편향을 조정하는 방법임을 이해한다.',
  '순전파 → Loss 계산 → 역전파 → 가중치·편향 수정을 반복하며 학습함을 이해한다.',
  '학습 전후의 예측값, Loss, 가중치와 편향 변화를 관찰한다.',
] as const

export const adjustmentCards = [
  { id: 'x1', label: '입력값 x1', answer: 'given' },
  { id: 'x2', label: '입력값 x2', answer: 'given' },
  { id: 'w1', label: '가중치 w1', answer: 'adjusted' },
  { id: 'w2', label: '가중치 w2', answer: 'adjusted' },
  { id: 'bias', label: '편향 b', answer: 'adjusted' },
  { id: 'target', label: '실제 정답 y', answer: 'given' },
] as const satisfies ReadonlyArray<{
  id: string
  label: string
  answer: 'adjusted' | 'given'
}>

export const learningFlowCards = [
  { id: 'input', label: '입력 데이터' },
  { id: 'weighted-sum', label: '가중치와 편향을 이용한 가중합' },
  { id: 'activation', label: '활성화 함수' },
  { id: 'prediction', label: '예측값' },
  { id: 'compare', label: '실제값과 비교' },
  { id: 'loss', label: 'Loss 계산' },
  { id: 'backpropagation', label: '역전파' },
  { id: 'update', label: '가중치와 편향 수정' },
  { id: 'repeat', label: '반복 학습' },
] as const

export const lesson06Quiz = [
  {
    question: '순전파의 역할로 가장 적절한 것은?',
    options: [
      ['A', '입력을 이용해 예측값을 만든다.'],
      ['B', '파일을 삭제한다.'],
      ['C', '인터넷에서 데이터를 다운로드한다.'],
      ['D', 'Loss를 항상 0으로 만든다.'],
    ],
    answer: 'A',
    explanation: '순전파는 입력이 신경망의 앞쪽에서 뒤쪽으로 전달되며 예측값을 만드는 과정입니다.',
  },
  {
    question: '역전파에서 수정되는 대표적인 값은?',
    options: [
      ['A', '입력 데이터와 정답'],
      ['B', '가중치와 편향'],
      ['C', '데이터 파일 이름'],
      ['D', '클래스 이름'],
    ],
    answer: 'B',
    explanation: '역전파로 계산한 오차 정보를 이용해 모델 내부의 가중치와 편향을 수정합니다.',
  },
  {
    question: '경사하강법의 역할을 가장 쉽게 설명한 것은?',
    options: [
      ['A', 'Loss가 작아지는 방향으로 가중치와 편향을 조정한다.'],
      ['B', '입력 데이터를 무조건 늘린다.'],
      ['C', '모든 가중치를 0으로 만든다.'],
      ['D', '출력값을 직접 정답으로 바꾼다.'],
    ],
    answer: 'A',
    explanation: '경사하강법은 현재 위치에서 Loss가 작아지는 방향을 찾아 가중치와 편향을 조금씩 조정합니다.',
  },
  {
    question: '딥러닝의 학습 과정으로 가장 적절한 것은?',
    options: [
      ['A', '순전파 → Loss 계산 → 역전파 → 가중치·편향 수정 → 반복'],
      ['B', '역전파 → 데이터 삭제 → 종료'],
      ['C', 'Loss 계산 → 결과를 무조건 정답으로 변경'],
      ['D', '입력 → 저장 → 종료'],
    ],
    answer: 'A',
    explanation: '딥러닝은 순전파로 예측하고 Loss를 계산한 뒤, 역전파와 값 수정을 거쳐 이 과정을 반복하며 학습합니다.',
  },
] as const

