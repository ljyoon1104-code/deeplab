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
  '합성곱 층',
  '특성 맵',
  '풀링 층',
  '크기가 줄어든 특성 맵',
  '완전연결 층',
  '분류 결과',
] as const

export type CnnFlowItem = (typeof CNN_FLOW)[number]

export const CNN_FLOW_ROLES: Record<CnnFlowItem, string> = {
  '입력 이미지': '픽셀의 가로·세로 구조를 유지한 입력',
  '합성곱 층': '작은 필터로 주변 픽셀 영역을 살펴봄',
  '특성 맵': '필터 계산으로 찾아낸 특징의 위치와 정도를 담은 격자',
  '풀링 층': '작은 영역의 대표값을 선택해 크기를 줄임',
  '크기가 줄어든 특성 맵': '핵심 특징을 간단한 형태로 전달',
  '완전연결 층': '찾아낸 특징을 종합',
  '분류 결과': '각 클래스의 예측 결과 생성',
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
] as const

export type NetworkMode = 'fully-connected' | 'cnn' | 'both'

export const NETWORK_STATEMENTS = [
  { id: 'flatten', text: '이미지를 한 줄의 입력 배열로 변환한다.', answer: 'fully-connected' },
  { id: 'spatial', text: '이미지의 가로·세로 배치를 유지한다.', answer: 'cnn' },
  { id: 'classify', text: '이미지 분류에 사용할 수 있다.', answer: 'both' },
  { id: 'local', text: '가까운 픽셀 영역을 반복해서 살펴본다.', answer: 'cnn' },
  { id: 'learn', text: '학습을 통해 예측 결과를 만든다.', answer: 'both' },
] as const
