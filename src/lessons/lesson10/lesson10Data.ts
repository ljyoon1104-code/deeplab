export const lesson10StepTitles = [
  'AI는 분류만 할까, 새로 만들 수도 있을까?',
  'GAN에는 두 AI가 있다',
  '생성자와 감별자가 경쟁하면?',
  'AI는 사람의 말을 어떻게 들을까?',
  '소리에서 글자까지',
  '규칙으로 듣기 vs 데이터로 배우기',
  '생성형 AI와 음성 인식 정리하기',
] as const

export type GenerationCategory = 'decision' | 'generation'

export const GENERATION_SCENARIOS = [
  { id: 'cat-class', text: '사진이 고양이인지 판단한다.', answer: 'decision' },
  { id: 'cat-create', text: '새로운 고양이 그림을 만든다.', answer: 'generation' },
  { id: 'spam-class', text: '이메일이 스팸인지 판단한다.', answer: 'decision' },
  { id: 'music-create', text: '새로운 배경 음악을 만든다.', answer: 'generation' },
] as const

export type GanRole = 'generator' | 'discriminator'

export const GAN_ROLE_CARDS = [
  { id: 'make-new', text: '새로운 데이터를 만든다.', answer: 'generator' },
  { id: 'make-similar', text: '실제 데이터와 비슷한 결과를 만들려고 한다.', answer: 'generator' },
  { id: 'distinguish', text: '실제 데이터와 생성 데이터를 구분한다.', answer: 'discriminator' },
  { id: 'judge-better', text: '구분 결과를 통해 더 정확하게 판단하도록 학습한다.', answer: 'discriminator' },
] as const

export const REAL_PATTERN = ['○', '●', '○', '●'] as const

export const GAN_ROUNDS = [
  {
    round: 1,
    generated: ['■', '△', '■', '△'],
    judgment: '실제 데이터와 모양이 많이 다름',
    improvement: '원과 채워진 원이 번갈아 나타나는 모양을 더 살펴봄',
  },
  {
    round: 2,
    generated: ['○', '△', '●', '□'],
    judgment: '일부 모양은 비슷하지만 차이가 남아 있음',
    improvement: '서로 다른 도형을 줄이고 원 모양과 순서를 더 비슷하게 만듦',
  },
  {
    round: 3,
    generated: ['○', '○', '●', '△'],
    judgment: '이전보다 비슷해졌지만 구분할 특징이 남아 있음',
    improvement: '두 번째와 네 번째 위치의 모양 차이를 줄이려고 함',
  },
  {
    round: 4,
    generated: ['○', '●', '○', '△'],
    judgment: '실제 패턴과 더 비슷해짐',
    improvement: '남아 있는 마지막 모양 차이를 다음 학습에서 줄일 수 있음',
  },
] as const

export type RecognitionMethod = 'rules' | 'deep-learning'

export const RECOGNITION_CARDS = [
  { id: 'write-rules', text: '사람이 많은 규칙을 직접 정한다.', answer: 'rules' },
  { id: 'learn-data', text: '대량의 음성 데이터에서 패턴을 학습한다.', answer: 'deep-learning' },
  { id: 'pronunciation', text: '다양한 발음 차이를 데이터로 학습할 수 있다.', answer: 'deep-learning' },
  { id: 'unseen-rule', text: '정해진 규칙과 크게 다른 입력에 취약하다.', answer: 'rules' },
] as const

export type LanguageProcess = 'speech-recognition' | 'natural-language'

export const LANGUAGE_PROCESS_CARDS = [
  { id: 'speech-to-text', text: '말소리를 “오늘 날씨 알려 줘.”라는 글자로 바꾼다.', answer: 'speech-recognition' },
  { id: 'understand-request', text: '사용자가 날씨 정보를 요청한다는 의미를 파악한다.', answer: 'natural-language' },
] as const

export const SPEECH_USES = [
  { id: 'device', title: '음성으로 기기 제어', detail: '말소리를 명령 텍스트로 바꾸어 기기 동작으로 연결할 수 있습니다.' },
  { id: 'caption', title: '영상 자막 생성', detail: '영상 속 말소리를 텍스트 자막으로 바꿀 수 있습니다.' },
  { id: 'record', title: '회의나 수업의 말소리 기록', detail: '사람의 말을 읽을 수 있는 기록으로 남길 수 있습니다.' },
  { id: 'language', title: '외국어 발음 학습', detail: '학습자가 말한 소리를 텍스트와 비교하는 활동에 활용할 수 있습니다.' },
] as const
