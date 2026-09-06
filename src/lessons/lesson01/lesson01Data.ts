export const lesson01StepTitles = [
  '사진을 보고 고양이인지 어떻게 알아볼까',
  '기계학습 다시 보기',
  '사람이 특징을 정한다면',
  '딥러닝에서는 무엇이 다를까',
  '기계학습과 딥러닝 비교하기',
  '딥러닝은 언제 유용할까',
  '오늘 배운 내용 확인하기',
] as const

export const lesson01Objectives = [
  '딥러닝은 기계학습의 한 분야임을 설명할 수 있다.',
  '일반적인 기계학습에서 사람이 특징을 정하는 경우가 많음을 이해한다.',
  '딥러닝이 인공신경망을 이용해 데이터에서 중요한 특징을 학습할 수 있음을 이해한다.',
  '딥러닝이 모든 문제에서 항상 더 좋은 방법은 아님을 판단할 수 있다.',
] as const

export const machineLearningFlow = [
  {
    id: 'data',
    label: '데이터',
    description: 'AI가 학습할 자료',
  },
  {
    id: 'feature',
    label: '특징',
    description: '판단에 사용할 중요한 정보',
  },
  {
    id: 'model',
    label: '모델',
    description: '데이터의 규칙을 학습해 판단하는 부분',
  },
  {
    id: 'result',
    label: '결과',
    description: '분류 또는 예측 결과',
  },
] as const

export const deepLearningFlow = [
  '많은 이미지',
  '인공신경망',
  '특징 학습',
  '고양이 / 강아지 분류',
] as const

export const featureCandidates = [
  '귀 모양',
  '코 모양',
  '털 색',
  '얼굴 폭',
  '사진 배경',
  '파일 이름',
] as const

export type ComparisonCategory = 'machine-learning' | 'both' | 'deep-learning'

export const comparisonCategories: Array<{
  id: ComparisonCategory
  label: string
}> = [
  {
    id: 'machine-learning',
    label: '일반적인 기계학습에 더 가까움',
  },
  { id: 'both', label: '둘 다' },
  { id: 'deep-learning', label: '딥러닝에 더 가까움' },
]

export const comparisonCards: Array<{
  id: number
  text: string
  answer: ComparisonCategory
  explanation: string
}> = [
  {
    id: 1,
    text: '사람이 사용할 특징을 정하는 경우가 많다.',
    answer: 'machine-learning',
    explanation: '일반적인 기계학습에서는 사람이 특징을 선정하거나 가공하는 과정이 중요한 경우가 많습니다.',
  },
  {
    id: 2,
    text: '인공신경망이 데이터에서 특징을 학습할 수 있다.',
    answer: 'deep-learning',
    explanation: '딥러닝은 인공신경망을 이용해 분류에 도움이 되는 특징을 학습할 수 있습니다.',
  },
  {
    id: 3,
    text: '데이터를 이용하여 학습한다.',
    answer: 'both',
    explanation: '기계학습과 딥러닝 모두 데이터에서 규칙을 학습할 수 있습니다.',
  },
  {
    id: 4,
    text: '분류나 예측 결과를 만든다.',
    answer: 'both',
    explanation: '두 방식 모두 학습한 규칙을 이용해 분류나 예측 결과를 만들 수 있습니다.',
  },
  {
    id: 5,
    text: '복잡한 데이터의 특징을 자동으로 학습할 수 있다.',
    answer: 'deep-learning',
    explanation: '많은 이미지나 음성처럼 복잡한 데이터에서 특징을 학습하는 일은 딥러닝이 강점을 보이는 부분입니다.',
  },
]

export type CaseDecision = 'useful' | 'not-required'

export const caseStudies: Array<{
  id: number
  title: string
  description: string
  answer: CaseDecision
  explanation: string
}> = [
  {
    id: 1,
    title: '학생 30명의 시험 점수 예측',
    description: '학생 30명의 공부 시간을 이용해 시험 점수를 예측합니다.',
    answer: 'not-required',
    explanation: '데이터의 양과 관계가 비교적 단순하므로 간단한 모델도 사용할 수 있습니다.',
  },
  {
    id: 2,
    title: '수많은 동물 사진 분류',
    description: '수많은 사진에서 고양이와 강아지를 구분합니다.',
    answer: 'useful',
    explanation: '사진에는 모양과 색, 위치처럼 복잡한 정보가 많아 딥러닝이 특히 유용할 수 있습니다.',
  },
  {
    id: 3,
    title: '사람의 말을 글자로 변환',
    description: '많은 음성 데이터에서 사람의 말을 찾아 글자로 바꿉니다.',
    answer: 'useful',
    explanation: '음성은 시간에 따라 계속 변하는 복잡한 데이터이므로 딥러닝이 강점을 보이는 경우가 많습니다.',
  },
]
