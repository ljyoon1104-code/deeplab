export const lesson07StepTitles = [
  '데이터셋 크기와 분포 해석',
  '같은 숫자도 모양이 다른 이유',
  '28×28 좌표와 픽셀 위치 계산',
  'Flatten과 위치 보존',
  '정규화 계산과 필요성',
  'Label과 원-핫 Target',
  '모델에 들어가는 한 쌍 구성',
] as const

export const lesson07Objectives = [
  '실제 MNIST Train subset의 크기와 숫자별 분포를 해석한다.',
  '실제 28×28 이미지의 좌표와 행 우선 index를 서로 계산한다.',
  '원본 픽셀을 보존한 채 0~1 범위의 INPUT을 계산한다.',
  '실제 label을 길이 10의 원-핫 TARGET으로 연결한다.',
  '학습에 쓰지 않은 Test 데이터로 평가해야 하는 이유를 설명한다.',
] as const

export const problemSolvingFlow = [
  '문제 정의',
  '데이터 수집',
  '데이터 전처리',
  '딥러닝 모델 구성',
  '학습',
  '성능 평가',
] as const

export const datasetSizeDescriptions = {
  500: '빠른 실험',
  1000: '기본 실험',
  2000: '더 많은 데이터',
  5000: '가장 많은 수업용 데이터',
} as const

export const lesson07FinalQuiz = [
  {
    id: 'sample-label',
    question: 'MNIST에서 표본(sample)과 label의 관계로 알맞은 것은?',
    options: [
      ['a', '표본은 28×28 픽셀 이미지이고, label은 그 이미지의 실제 숫자다.', true],
      ['b', 'label은 이미지의 784개 픽셀값이다.', false],
      ['c', '표본은 모델이 예측한 확률이다.', false],
    ],
    explanation: '표본은 입력 이미지이고 label은 그 이미지가 나타내는 실제 정답입니다.',
  },
  {
    id: 'image-length',
    question: '28×28 MNIST 이미지의 flatten 배열 길이는?',
    options: [['a', '56', false], ['b', '784', true], ['c', '28', false]],
    explanation: '28행과 28열의 모든 칸을 한 줄로 잇기 때문에 28×28=784개입니다.',
  },
  {
    id: 'coordinate-index',
    question: '행 우선 배열에서 index를 구할 때 사용하는 식은?',
    options: [['a', 'row + column', false], ['b', 'row × 28 + column', true], ['c', 'row × column', false]],
    explanation: '각 행에는 28개 픽셀이 있으므로 앞 행의 개수 row×28을 먼저 더합니다.',
  },
  {
    id: 'normalization',
    question: '정규화가 하는 일로 알맞은 것은?',
    options: [['a', '픽셀 위치와 label을 바꾼다.', false], ['b', '원본값을 덮어쓴다.', false], ['c', '새 배열의 값 범위를 0~1에 맞춘다.', true]],
    explanation: '정규화는 픽셀의 순서나 label을 바꾸지 않고, 별도의 값 배열을 만듭니다.',
  },
  {
    id: 'one-hot',
    question: '원-핫 TARGET의 특징으로 알맞은 것은?',
    options: [['a', '길이 10이고 실제 label 위치에만 1이 있다.', true], ['b', '모든 위치에 1이 있다.', false], ['c', '이미지의 밝기를 나타낸다.', false]],
    explanation: '원-핫 벡터는 실제 정답 클래스 하나를 1의 위치로 나타냅니다.',
  },
  {
    id: 'input-target',
    question: '신경망 학습 준비에서 INPUT과 TARGET의 연결은?',
    options: [['a', 'INPUT=원-핫, TARGET=정규화 픽셀', false], ['b', 'INPUT=정규화 픽셀, TARGET=실제 label의 원-핫', true], ['c', '둘 다 모델 예측 확률', false]],
    explanation: '입력은 이미지에서 만든 정규화 배열이고, target은 실제 정답을 나타냅니다.',
  },
  {
    id: 'train-test',
    question: 'Train과 Test 데이터를 구분하는 가장 중요한 이유는?',
    options: [['a', 'Test는 Train보다 항상 픽셀이 밝아서', false], ['b', '새로운 데이터에서의 동작을 확인하려고', true], ['c', 'Test의 label을 학습 중에 바꾸려고', false]],
    explanation: '학습에 사용하지 않은 Test로 평가해야 모델이 학습 사진만 외운 것은 아닌지 확인할 수 있습니다.',
  },
] as const
