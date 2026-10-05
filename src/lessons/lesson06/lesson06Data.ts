export const learningPhases = [
  { label: '순전파', detail: '입력 → 가중합 → 활성화 함수 → 예측값' },
  { label: '오차 계산', detail: '예측값과 실젯값 → 손실함수로 비교 → 오차(loss)' },
  { label: '역전파', detail: '오차 정보로 수정 방향 계산 → 경사 하강법으로 가중치와 편향 조정' },
] as const

export const lesson06StepTitles = [
  '오차(loss)를 계산한 다음에는',
  '신경망에서 무엇을 바꿀까',
  '역전파란 무엇일까',
  '어느 방향으로 바꿔야 할까',
  '한 번 학습하면 무엇이 달라질까',
  '반복하면 정말 학습할까',
  '딥러닝은 어떻게 학습할까',
] as const

export const lesson06Objectives = [
  '순전파로 예측값이 만들어지고 손실함수로 오차(loss)가 계산됨을 복습한다.',
  '오차(loss)를 줄이기 위해 신경망의 가중치와 편향을 수정해야 함을 이해한다.',
  '오차 정보를 출력 쪽에서 앞쪽으로 전달해 수정 방향을 계산하는 과정을 역전파라고 이해한다.',
  '경사 하강법은 손실을 줄이는 방향으로 가중치와 편향을 조정하는 방법임을 이해한다.',
  '순전파 → 오차 계산 → 역전파를 반복하며 학습하고, 세부 활동을 이 기본 과정에 연결한다.',
  '학습 전후의 예측값, 오차(loss), 가중치와 편향 변화를 관찰한다.',
] as const

export const adjustmentCards = [
  { id: 'x1', label: '입력값 x1', answer: 'given' },
  { id: 'w1', label: '가중치 w1', answer: 'adjusted' },
  { id: 'bias', label: '편향 b', answer: 'adjusted' },
  { id: 'target', label: '실젯값 y', answer: 'given' },
  { id: 'weighted-sum', label: '가중합 z', answer: 'computed' },
  { id: 'prediction', label: '순전파의 예측값', answer: 'computed' },
  { id: 'loss', label: '손실함수의 오차(loss)', answer: 'computed' },
] as const satisfies ReadonlyArray<{
  id: string
  label: string
  answer: 'adjusted' | 'given' | 'computed'
}>

export const learningFlowCards = [
  { id: 'prepare', label: '입력 데이터와 실젯값 준비' },
  { id: 'initialize', label: '가중치와 편향 초기화' },
  { id: 'forward', label: '순전파' },
  { id: 'prediction', label: '예측값 생성' },
  { id: 'loss', label: '손실함수로 오차(loss) 계산' },
  { id: 'backpropagation', label: '역전파로 수정 방향 계산' },
  { id: 'update', label: '경사 하강법으로 가중치와 편향 수정' },
  { id: 'forward-again', label: '다시 순전파' },
  { id: 'repeat', label: '정해진 횟수만큼 반복' },
  { id: 'test', label: '새로운 데이터로 성능 확인' },
] as const

export const lesson06Quiz = [
  {
    question: '순전파의 역할로 가장 적절한 것은?',
    options: [
      ['A', '입력을 이용해 예측값을 만든다.'],
      ['B', '파일을 삭제한다.'],
      ['C', '인터넷에서 데이터를 다운로드한다.'],
      ['D', '오차(loss)를 항상 0으로 만든다.'],
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
    question: '경사 하강법의 역할을 가장 쉽게 설명한 것은?',
    options: [
      ['A', '오차(loss)가 작아지는 방향으로 가중치와 편향을 조정한다.'],
      ['B', '입력 데이터를 무조건 늘린다.'],
      ['C', '모든 가중치를 0으로 만든다.'],
      ['D', '출력값을 직접 정답으로 바꾼다.'],
    ],
    answer: 'A',
    explanation: '경사 하강법은 현재 위치에서 오차(loss)가 작아지는 방향을 찾아 가중치와 편향을 조금씩 조정합니다.',
  },
  {
    question: '딥러닝의 학습 과정으로 가장 적절한 것은?',
    options: [
      ['A', '순전파 → 오차(loss) 계산 → 역전파 → 가중치·편향 수정 → 반복'],
      ['B', '역전파 → 데이터 삭제 → 종료'],
      ['C', '오차(loss) 계산 → 결과를 무조건 정답으로 변경'],
      ['D', '입력 → 저장 → 종료'],
    ],
    answer: 'A',
    explanation: '딥러닝은 순전파로 예측하고 오차(loss)를 계산한 뒤, 역전파와 값 수정을 거쳐 이 과정을 반복하며 학습합니다.',
  },
  {
    question: '손실함수로 오차를 계산한 것만으로 가중치와 편향이 바뀌나요?',
    options: [
      ['A', '아니다. 오차 정보로 수정 방향을 계산하고 가중치와 편향을 조정해야 한다.'],
      ['B', '그렇다. 오차를 읽기만 하면 모델이 수정된다.'],
      ['C', '그렇다. 실젯값을 예측값으로 바꾸면 된다.'],
      ['D', '아니다. 학습은 가중치를 바꾸지 않는다.'],
    ],
    answer: 'A',
    explanation: '오차 계산은 틀린 정도를 구하는 과정입니다. 그 정보를 이용해 수정 방향을 계산하고 가중치와 편향을 조정한 뒤 다시 순전파합니다.',
  },
  {
    question: '오차(loss) 그래프가 전체적으로 내려가다가 마지막에 조금 올라갔다면?',
    options: [
      ['A', '전체 경향과 작은 흔들림을 함께 살펴본다.'],
      ['B', '마지막 값 하나만 보고 학습이 모두 실패했다고 단정한다.'],
      ['C', '그래프와 학습은 관계가 없다.'],
      ['D', '정답 데이터를 바꾼다.'],
    ],
    answer: 'A',
    explanation: '실제 학습의 오차(loss)는 매번 똑같이 내려가지 않을 수 있으므로 전체 감소 경향과 작은 변화를 함께 해석해야 합니다.',
  },
  {
    question: '훈련 데이터 결과와 새로운 데이터 결과를 구분해야 하는 이유는?',
    options: [
      ['A', '새로운 데이터에도 배운 기준이 적용되는지 확인하기 위해'],
      ['B', '훈련 데이터 결과를 숨기기 위해'],
      ['C', '가중치를 입력 데이터로 바꾸기 위해'],
      ['D', '학습 횟수를 무조건 1로 만들기 위해'],
    ],
    answer: 'A',
    explanation: '학습 데이터에서만 잘 맞는지, 처음 보는 데이터에도 성능이 유지되는지 구분해서 확인해야 합니다.',
  },
] as const
