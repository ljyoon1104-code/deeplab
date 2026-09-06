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
    title: '기계학습에서 딥러닝으로',
    description: '특징은 누가 찾을까?',
    group: 'foundations',
  },
  {
    id: '02',
    title: '퍼셉트론은 어떻게 판단할까?',
    description: '입력 · 가중치 · 편향',
    group: 'foundations',
  },
  {
    id: '03',
    title: '활성화 함수에 따라 출력이 달라질까?',
    description: 'Step · ReLU · Sigmoid · Softmax',
    group: 'foundations',
  },
  {
    id: '04',
    title: '퍼셉트론을 연결하면?',
    description: '인공신경망 · 입력층 · 은닉층 · 출력층',
    group: 'foundations',
  },
  {
    id: '05',
    title: 'AI는 얼마나 틀렸을까?',
    description: '순전파 · 손실함수',
    group: 'foundations',
  },
  {
    id: '06',
    title: 'AI는 틀린 것을 어떻게 고칠까?',
    description: '역전파 · 가중치와 편향 수정',
    group: 'foundations',
  },
  {
    id: '07',
    title: '손글씨 AI 모델 만들기 ①',
    description: 'MNIST · 전처리 · 모델 구성',
    group: 'practice',
  },
  {
    id: '08',
    title: '손글씨 AI 모델 만들기 ②',
    description: '학습 · Loss · Accuracy · 평가',
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
