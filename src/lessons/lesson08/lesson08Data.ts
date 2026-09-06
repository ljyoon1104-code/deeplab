import type { Lesson08ModelType } from './lesson08Types'

export const lesson08StepTitles = [
  '학습 조건을 정해 보자',
  '실제 신경망을 학습시켜 보자',
  'Loss와 Accuracy는 어떻게 변했을까',
  '처음 보는 숫자로 시험해 보자',
  'AI가 틀린 숫자를 찾아보자',
  '내가 직접 숫자를 그려 보자',
  '조건을 바꾸면 결과가 달라질까',
] as const

export const BATCH_SIZE = 32 as const
export const REQUIRED_EXPERIMENT_COUNT = 2

export const MODEL_OPTIONS: Record<
  Lesson08ModelType,
  { name: string; shortStructure: string; layers: number[]; note: string }
> = {
  simple: {
    name: '간단한 모델',
    shortStructure: '입력 784 → Dense 32 + ReLU → 출력 10 + Softmax',
    layers: [32],
    note: '빠르게 비교하는 실험용 구조',
  },
  textbook: {
    name: '기본 모델',
    shortStructure: '입력 784 → Dense 100 + ReLU → Dense 50 + ReLU → 출력 10 + Softmax',
    layers: [100, 50],
    note: '교과서에서 다룬 기본 구조',
  },
  wide: {
    name: '넓은 모델',
    shortStructure: '입력 784 → Dense 128 + ReLU → Dense 64 + ReLU → 출력 10 + Softmax',
    layers: [128, 64],
    note: '뉴런 수를 늘린 실험용 구조',
  },
}

export const STATUS_LABELS = {
  idle: '대기 중',
  'loading-data': 'MNIST 데이터 불러오는 중',
  preparing: '텐서와 새 모델 준비 중',
  training: '실제 모델 학습 중',
  trained: '학습 완료',
  evaluating: 'Test 데이터 평가 중',
  ready: '학습과 평가 완료',
  cancelled: '학습 취소됨',
  error: '문제가 발생함',
} as const

export const friendlyErrorMessages = {
  data: 'MNIST 데이터를 불러오지 못했습니다.',
  engine: '딥러닝 엔진을 시작하지 못했습니다.',
  model: '신경망 모델을 준비하지 못했습니다.',
  training: '모델 학습 중 문제가 발생했습니다.',
  evaluation: 'Test 데이터 평가 중 문제가 발생했습니다.',
  drawing: '그린 숫자를 예측하는 중 문제가 발생했습니다.',
} as const
