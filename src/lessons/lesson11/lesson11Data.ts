export const lesson11StepTitles = [
  'AI는 글의 뜻을 어떻게 알까?',
  '자연어 처리는 무엇을 할까?',
  '컴퓨터는 단어를 숫자로 바꾼다',
  '원-핫 인코딩으로 단어 표현하기',
  '단어의 의미를 담는 워드 임베딩',
  '단어를 많이 세면 의미를 알 수 있을까?',
  '언어를 이해하려면 문맥이 필요하다',
] as const

export type NlpActivityType = 'understanding' | 'generation'

export const NLP_ACTIVITY_CARDS = [
  { id: 'review', text: '리뷰가 긍정인지 부정인지 판단한다.', answer: 'understanding' },
  { id: 'continue', text: '문장의 다음 내용을 작성한다.', answer: 'generation' },
  { id: 'intent', text: '사용자의 질문 의도를 파악한다.', answer: 'understanding' },
  { id: 'summary', text: '주어진 내용을 짧게 요약한 문장을 만든다.', answer: 'generation' },
] as const

export const WORDS = ['좋은', '친구는', '별처럼', '삶을', '빛나게', '해'] as const
export const INDEX_ACTIVITY_WORDS = ['좋은', '별처럼', '해'] as const

export const EMBEDDING_POINTS = [
  { word: '친구', x: 31, y: 38 },
  { word: '우정', x: 39, y: 32 },
  { word: '사람', x: 57, y: 55 },
  { word: '냉장고', x: 84, y: 79 },
] as const

export const FREQUENCY_WORDS = ['축구', '경기', '선수', '요리', '음식', '맛'] as const
export const FREQUENCY_DOCUMENTS = [
  {
    id: 'doc1',
    text: '축구 축구 경기 선수',
    answer: 'sports',
    counts: { 축구: 2, 경기: 1, 선수: 1, 요리: 0, 음식: 0, 맛: 0 },
  },
  {
    id: 'doc2',
    text: '요리 음식 요리 맛',
    answer: 'food',
    counts: { 축구: 0, 경기: 0, 선수: 0, 요리: 2, 음식: 1, 맛: 1 },
  },
] as const

export const CONTEXT_SENTENCES = [
  { id: 'pear', sentence: '나는 배를 먹었다.', target: '배', choices: ['과일', '물 위를 이동하는 배'], answer: '과일' },
  { id: 'boat', sentence: '나는 배를 탔다.', target: '배', choices: ['과일', '물 위를 이동하는 배'], answer: '물 위를 이동하는 배' },
  { id: 'snow', sentence: '오늘은 눈이 많이 온다.', target: '눈', choices: ['하늘에서 내리는 눈', '신체 기관'], answer: '하늘에서 내리는 눈' },
  { id: 'eye', sentence: '눈이 아파서 병원에 갔다.', target: '눈', choices: ['하늘에서 내리는 눈', '신체 기관'], answer: '신체 기관' },
] as const

export const LESSON11_QUIZ = [
  {
    id: 1,
    question: '자연어 처리의 목표로 가장 적절한 것은?',
    options: ['컴퓨터가 사람의 언어를 이해하고 처리하도록 한다.', '이미지의 픽셀만 분류한다.', '컴퓨터의 저장 공간만 늘린다.', '음성을 녹음만 한다.'],
    answer: 0,
    explanation: '자연어 처리는 컴퓨터가 사람의 언어를 이해하고 처리하며, 필요한 경우 언어를 생성하도록 하는 기술입니다.',
  },
  {
    id: 2,
    question: '컴퓨터가 텍스트를 딥러닝 모델에서 처리하려면 필요한 과정은?',
    options: ['단어를 숫자 형태로 표현한다.', '모든 단어를 삭제한다.', '이미지를 28×28로 변환한다.', '마이크를 항상 사용한다.'],
    answer: 0,
    explanation: '신경망은 수치 계산을 하므로 텍스트의 단어나 토큰을 숫자 형태로 표현하는 과정이 필요합니다.',
  },
  {
    id: 3,
    question: '원-핫 인코딩의 특징은?',
    options: ['해당 단어 위치만 1이고 나머지는 0이다.', '모든 값이 항상 1이다.', '단어의 뜻을 문장으로 저장한다.', '항상 두 개의 숫자만 사용한다.'],
    answer: 0,
    explanation: '원-핫 벡터는 선택한 단어의 인덱스 위치 하나만 1이고 나머지 위치는 모두 0입니다.',
  },
  {
    id: 4,
    question: '워드 임베딩에 대한 설명으로 적절한 것은?',
    options: ['단어를 여러 실숫값으로 표현하여 의미와 관계를 나타내는 데 활용할 수 있다.', '모든 단어를 같은 벡터로 만든다.', '단어를 이미지로만 저장한다.', '항상 한 위치만 1이다.'],
    answer: 0,
    explanation: '워드 임베딩은 학습을 통해 단어를 여러 실숫값의 벡터로 나타내고 관계와 의미 표현에 활용합니다.',
  },
  {
    id: 5,
    question: '빈도수 기반 방식의 한계로 적절한 것은?',
    options: ['단어의 순서와 문맥을 충분히 반영하기 어렵다.', '단어의 개수를 셀 수 없다.', '텍스트를 처리할 수 없다.', '항상 완벽하게 문맥을 이해한다.'],
    answer: 0,
    explanation: '빈도 정보는 간단하고 유용하지만 단어 순서, 부정 표현과 세밀한 문맥을 충분히 담기 어렵습니다.',
  },
  {
    id: 6,
    question: '“나는 배를 먹었다.”와 “나는 배를 탔다.”에서 ‘배’의 의미가 다른 이유는?',
    options: ['주변 단어와 문맥이 다르기 때문이다.', '글자 수가 다르기 때문이다.', '컴퓨터 화면 크기가 다르기 때문이다.', '항상 같은 의미이다.'],
    answer: 0,
    explanation: '같은 글자라도 함께 쓰인 단어와 문장 상황이 달라지면 문맥에서 선택되는 의미가 달라집니다.',
  },
] as const

