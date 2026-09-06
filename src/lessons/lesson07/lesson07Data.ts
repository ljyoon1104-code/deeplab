export const lesson07StepTitles = [
  '실제 MNIST를 불러와 보자',
  '숫자 데이터를 직접 탐색해 보자',
  '이미지를 확대하면 무엇이 보일까',
  'AI에 넣을 데이터로 펼쳐 보자',
  '픽셀값을 정규화해 보자',
  '정답도 숫자 배열로 바꿔 보자',
  '학습 준비를 완료하자',
] as const

export const lesson07Objectives = [
  '실제 MNIST subset을 불러와 숫자별 분포와 손글씨 모양을 탐색한다.',
  '28×28 이미지를 행 우선 순서의 784개 모델 입력으로 연결한다.',
  '원본 픽셀을 255로 나누어 0~1 범위의 새 배열로 정규화한다.',
  '실제 label을 길이 10의 원-핫 정답 벡터로 바꾼다.',
  '정규화된 입력과 원-핫 정답을 DNN의 INPUT과 TARGET에 연결한다.',
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

