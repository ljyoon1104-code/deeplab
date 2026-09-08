export const lesson09StepTitles = [
  '컴퓨터는 이미지에서 무엇을 찾을까?',
  '컴퓨터 비전에는 어떤 문제가 있을까?',
  '이미지를 펼치지 않고 특징을 찾을 수 있을까?',
  '필터로 특징을 찾아보자',
  '필터를 움직이면 어떻게 될까?',
  '데이터를 줄이면서 중요한 정보는 남길 수 있을까?',
  'CNN은 이미지를 어떻게 분류할까?',
] as const

export const CONVOLUTION_INPUT = [
  [2, 3, 1],
  [5, 4, 6],
  [2, 5, 0],
] as const

export const CONVOLUTION_KERNEL = [
  [1, 0],
  [0, 1],
] as const

export const POOLING_INPUT = [
  [1, 8, 2, 3],
  [4, 6, 9, 1],
  [7, 2, 3, 5],
  [0, 4, 6, 2],
] as const

export const CNN_FLOW = [
  '입력 이미지',
  '합성곱',
  'ReLU',
  '풀링',
  'flatten',
  '완전연결층',
  'Softmax',
  '클래스 예측',
] as const

export type CnnFlowItem = (typeof CNN_FLOW)[number]

export const CNN_FLOW_ROLES: Record<CnnFlowItem, string> = {
  '입력 이미지': '픽셀의 가로·세로 구조를 유지한 입력',
  '합성곱': '작은 필터로 지역 패턴을 탐색',
  ReLU: '음수 반응을 0으로 바꾸고 비선형성을 더함',
  '풀링': '공간 크기를 줄이며 강한 반응을 남김',
  flatten: '2차원 특성 맵을 한 줄 배열로 변환',
  '완전연결층': '추출된 특징을 종합',
  Softmax: '클래스별 확률을 생성',
  '클래스 예측': '가장 높은 확률을 바탕으로 예측 결과를 선택',
}

export type VisionTask = 'classification' | 'localization' | 'detection' | 'segmentation'

export const VISION_TASKS: Record<VisionTask, { name: string; question: string; output: string }> = {
  classification: {
    name: '이미지 분류',
    question: '이 이미지 전체는 무엇인가?',
    output: '고양이',
  },
  localization: {
    name: '객체 위치 식별',
    question: '이미지의 주된 객체는 무엇이며 어디에 있는가?',
    output: '고양이 + 하나의 사각형 위치',
  },
  detection: {
    name: '객체 탐지',
    question: '이미지에 어떤 객체들이 있으며 각각 어디에 있는가?',
    output: '고양이 상자 2개 + 강아지 상자 1개',
  },
  segmentation: {
    name: '이미지 분할',
    question: '각 픽셀은 어떤 객체나 영역에 속하는가?',
    output: '고양이에 해당하는 픽셀 영역을 색으로 표시',
  },
}

export const VISION_SCENARIOS = [
  { id: 'pet-class', text: '사진 한 장이 고양이인지 강아지인지 판단한다.', answer: 'classification' },
  { id: 'one-car', text: '사진 속 하나의 자동차 위치를 사각형으로 표시한다.', answer: 'localization' },
  { id: 'road-boxes', text: '도로 사진에서 자동차와 사람을 모두 찾아 각각 상자로 표시한다.', answer: 'detection' },
  { id: 'pixel-regions', text: '사진의 모든 픽셀을 사람·도로·하늘 영역으로 구분한다.', answer: 'segmentation' },
  { id: 'one-bird', text: '사진 속 새 한 마리의 종류와 위치를 하나의 상자로 표시한다.', answer: 'localization' },
  { id: 'many-birds', text: '사진 속 여러 새의 종류와 각각의 위치를 모두 상자로 표시한다.', answer: 'detection' },
] as const

export type NetworkMode = 'fully-connected' | 'cnn' | 'both'

export const NETWORK_STATEMENTS = [
  { id: 'flatten-values', text: 'flatten 후에도 각 픽셀값 자체는 배열에 남는다.', answer: 'both' },
  { id: 'neighbor', text: 'flatten하면 행과 열의 이웃 관계를 바로 보기 어려워진다.', answer: 'fully-connected' },
  { id: 'spatial', text: '작은 필터가 이미지의 가로·세로 구조를 이용해 지역 영역을 본다.', answer: 'cnn' },
  { id: 'classify', text: '이미지 분류에 사용할 수 있다.', answer: 'both' },
  { id: 'move', text: '같은 필터를 여러 위치로 옮겨 같은 종류의 패턴을 찾는다.', answer: 'cnn' },
] as const

export const SECOND_CONVOLUTION_KERNEL = [
  [0, 1],
  [1, 0],
] as const
