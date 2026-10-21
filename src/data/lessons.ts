import type { LessonGroup, LessonMetadata } from '../types/lesson'

export const lessonGroups: LessonGroup[] = [
  {
    id: 'foundations',
    title: '딥러닝의 기초',
    description: '신경망이 입력을 계산하고 학습하는 원리를 살펴봅니다.',
  },
  {
    id: 'practice',
    title: '딥러닝 모델 실습',
    description: 'MNIST 데이터로 손글씨 인식 모델의 과정을 경험합니다.',
  },
  {
    id: 'applications',
    title: '딥러닝의 활용',
    description: '이미지와 음성, 언어를 다루는 AI의 원리를 알아봅니다.',
  },
]

export const lessons: LessonMetadata[] = [
  {
    id: '01',
    title: '딥러닝이 무엇인가와 퍼셉트론',
    description: '딥러닝 · 특징 학습 · 뉴런의 역할과 계산',
    group: 'foundations',
  },
  {
    id: '02',
    title: '인공신경망과 각 층의 역할',
    description: 'ANN · 입력층과 중간 계산 · 다층 구조와 DNN',
    group: 'foundations',
  },
  {
    id: '03',
    title: '활성화 함수에 따라 출력이 달라질까?',
    description: '계단 · ReLU · 선형 출력 · 시그모이드 · 소프트맥스',
    group: 'foundations',
  },
  {
    id: '04',
    title: '은닉층이 있는 신경망의 순전파',
    description: 'ReLU 은닉층에서 세 출력 방식까지',
    group: 'foundations',
  },
  {
    id: '05',
    title: 'AI는 얼마나 틀렸을까?',
    description: 'MSE · BCE · CCE · 평균 손실과 해석',
    group: 'foundations',
  },
  {
    id: '06',
    title: 'AI는 틀린 것을 어떻게 고칠까?',
    description: '기울기 계산 · 세 조합의 역전파 · 값 수정과 재예측',
    group: 'foundations',
  },
  {
    id: '07',
    title: '손글씨 AI 모델 만들기 ①',
    description: 'MNIST · 차원 변환 · 정규화 · 원-핫 인코딩',
    group: 'practice',
  },
  {
    id: '08',
    title: '손글씨 AI 모델 만들기 ②',
    description: '모델 구성 · 학습 · 오차 · 정확도 · 평가',
    group: 'practice',
  },
  {
    id: '09',
    title: 'AI는 이미지를 어떻게 볼까?',
    description: '컴퓨터 비전 · CNN',
    group: 'applications',
  },
  {
    id: '10',
    title: 'AI는 만들고 들을 수 있을까?',
    description: '생성형 AI · 음성 인식',
    group: 'applications',
  },
  {
    id: '11',
    title: 'AI는 언어를 어떻게 이해할까?',
    description: '자연어 처리 · 임베딩',
    group: 'applications',
  },
  {
    id: '12',
    title: 'AI는 문맥을 기억하고 글을 어떻게 만들까?',
    description: 'RNN · Transformer · LLM',
    group: 'applications',
  },
]

export const lessonSteps = [
  '오늘의 질문',
  '개념 이해',
  '직접 조작',
  '결과 관찰',
  '왜 이렇게 되었을까?',
  '핵심 정리',
  '확인 문제',
] as const

export const getLesson = (lessonId: string) =>
  lessons.find((lesson) => lesson.id === lessonId)
