export const lesson10StepTitles = [
  'AI는 분류만 할까, 새로 만들 수도 있을까?',
  'GAN에는 두 AI가 있다',
  '생성자와 감별자가 경쟁하면?',
  'AI는 사람의 말을 어떻게 들을까?',
  '소리에서 글자까지',
  '규칙으로 듣기 vs 데이터로 배우기',
  '생성형 AI와 음성 인식 정리하기',
] as const

export type GenerationCategory = 'decision' | 'generation' | 'not-generation'

// 저장된 분류 ID는 유지하고, 화면에서는 서로 겹치지 않는 동작으로 구분합니다.
export const GENERATION_CATEGORIES = [
  { id: 'decision', label: '종류·상태 판단', detail: '입력이 어느 종류인지, 어떤 상태인지 판단합니다.' },
  { id: 'generation', label: '모델로 콘텐츠 생성', detail: '학습한 패턴을 바탕으로 이미지·글·음악 등의 내용을 구성합니다.' },
  { id: 'not-generation', label: '정해진 변환·검색·대입', detail: '내용을 생성하는 모델 없이 지정된 연산·검색·칸 채우기를 수행합니다.' },
] as const

export const GENERATION_SCENARIOS = [
  { id: 'cat-class', text: '모델이 사진을 보고 고양이인지 판단하는 동작.', answer: 'decision', reason: '그림을 새로 그리는 것이 아니라 입력의 종류를 판단합니다. 이 활동에서는 판단 결과를 내는 동작으로 분류합니다.' },
  { id: 'cat-create', text: '이미지 모델이 학습한 패턴으로 새로운 고양이 그림을 만드는 동작.', answer: 'generation', reason: '저장된 그림을 그대로 찾거나 밝기만 바꾸는 것이 아니라 모델이 그림의 내용을 구성합니다.' },
  { id: 'spam-class', text: '모델이 이메일의 내용을 보고 스팸 여부를 판단하는 동작.', answer: 'decision', reason: '새 이메일을 작성하지 않고 입력 이메일의 상태를 판단합니다.' },
  { id: 'music-create', text: '음악 모델이 학습한 패턴으로 새로운 배경 음악을 만드는 동작.', answer: 'generation', reason: '기존 음악 파일을 찾아 재생하는 것이 아니라 모델이 음악의 내용을 구성합니다.' },
  { id: 'continue', text: '언어 모델이 앞 문맥에 이어질 새로운 문장을 만드는 동작.', answer: 'generation', reason: '미리 저장한 문장을 그대로 꺼내지 않고 문맥에 맞는 내용을 모델이 구성합니다.' },
  { id: 'summary', text: '언어 모델이 입력 글의 핵심을 새 요약문으로 다시 구성하는 동작.', answer: 'generation', reason: '주제를 분류하거나 원문 문장을 그대로 검색하는 동작이 아니라 요약문의 표현을 모델이 구성합니다.' },
  { id: 'brightness', text: '모델 없이 지정한 수만큼 픽셀 밝기만 높이는 동작.', answer: 'not-generation', reason: '수치와 배열이 달라져도 지정한 연산을 적용한 것입니다. 내용 생성 모델을 사용하지 않으며 종류도 판단하지 않습니다.' },
  { id: 'search', text: '정확히 일치하는 검색어로 저장된 문장 하나를 찾아 그대로 보여 주는 동작.', answer: 'not-generation', reason: '이 문제의 대상은 저장된 문장의 조회입니다. 새 답변을 작성하거나 문장 종류를 판단하는 동작은 포함하지 않습니다.' },
  { id: 'template', text: '모델 없이 정해진 양식의 이름 칸에 입력받은 이름만 넣는 동작.', answer: 'not-generation', reason: '미리 정해진 자리에 값을 대입합니다. 문장이 달라졌다는 이유만으로 생성형 인공지능이라고 하지는 않습니다.' },
] as const

export type GanRole = 'generator' | 'discriminator' | 'real-data' | 'feedback'

export const GAN_ROLE_CARDS = [
  { id: 'make-new', text: '새로운 데이터를 만든다.', answer: 'generator' },
  { id: 'make-similar', text: '실제 데이터와 비슷한 결과를 만들려고 한다.', answer: 'generator' },
  { id: 'distinguish', text: '실제 데이터와 생성 데이터를 구분한다.', answer: 'discriminator' },
  { id: 'judge-better', text: '구분 결과를 통해 더 정확하게 판단하도록 학습한다.', answer: 'discriminator' },
  { id: 'actual-reference', text: '감별자가 비교 기준으로 받는 실제 사례다.', answer: 'real-data' },
  { id: 'improve-direction', text: '감별 결과를 바탕으로 생성자와 감별자의 가중치가 조정된다.', answer: 'feedback' },
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
    judgment: '네 도형 중 세 개가 원 모양이지만 위치와 채움의 차이가 남아 있음',
    improvement: '두 번째·세 번째·네 번째 위치를 실제 패턴과 비교해 모양과 순서의 차이를 줄이려고 함',
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
  { id: 'noise-data', text: '소음과 여러 말하기 속도 사례를 데이터에서 학습할 수 있다.', answer: 'deep-learning' },
  { id: 'repair-rules', text: '오류를 고칠 때 규칙 문장을 직접 수정하는 일이 중심이다.', answer: 'rules' },
] as const

export const SPEECH_METHOD_SCENARIOS = [
  { id: 'quiet-command', text: '조용한 교실에서 “시작·멈춤·다음” 세 명령만 인식한다. 다양한 문장으로 확장할 계획이 없고, 소수 명령에 대한 규칙을 직접 관리하려 한다.', answer: 'rules', limit: '명령 밖의 표현, 다른 말하기 방식에는 규칙을 더 작성해야 할 수 있다.', reason: '딥러닝도 사용할 수 있지만, 이 조건에서는 명령과 환경이 제한적이고 규칙을 직접 관리하려 하므로 규칙 기반을 먼저 고려합니다.' },
  { id: 'daily-speech', text: '다양한 사람이 속도와 발음을 달리하여 일상 문장을 말한다. 이런 음성 사례를 학습에 사용할 수 있다.', answer: 'deep-learning', limit: '학습 데이터에 적은 발음·환경에서는 오류가 날 수 있다.', reason: '모든 문장·발음·속도 조합을 규칙으로 작성하기는 어렵습니다. 제공되는 다양한 음성 사례에서 패턴을 학습하는 방식이 이 조건에 맞습니다.' },
  { id: 'noisy-term', text: '소음이 큰 공장에서 전문 용어를 인식한다. 현장 소음·다양한 발음·전문 용어를 포함한 데이터를 수집해 학습·평가할 수 있다.', answer: 'deep-learning', limit: '소음과 전문 용어가 포함된 충분한 학습·평가 데이터가 필요하다.', reason: '소음과 발음의 조합을 규칙만으로 모두 다루기 어렵습니다. 현장 데이터를 학습할 수 있다는 조건 때문에 딥러닝을 고려하며, 낯선 소음에서는 여전히 오류가 날 수 있습니다.' },
] as const

export const SERVICE_SCENARIOS = [
  { id: 'voice-answer', text: '음성 질문을 글로 바꾸고, 질문을 이해하여 텍스트 답변을 만드는 두 기능에 필요한 분야를 고르세요.', answer: ['음성 인식', '자연어 처리'], reason: '말소리→글자는 음성 인식, 텍스트의 질문 이해와 답변 생성은 자연어 처리 분야입니다.' },
  { id: 'image-create', text: '설명 입력을 처리한 뒤 새로운 이미지를 만드는 출력 기능만 묻습니다. 이 기능에 해당하는 분야를 고르세요.', answer: ['이미지 생성'], reason: '전체 서비스에는 언어 처리도 쓰일 수 있습니다. 여기서는 새 이미지를 만드는 출력 기능만 묻습니다. GAN은 가능한 구현 방법 중 하나이지 필수는 아닙니다.' },
  { id: 'call-summary', text: '통화의 말소리를 글로 바꾸고, 그 글의 핵심을 요약하는 두 기능에 필요한 분야를 고르세요.', answer: ['음성 인식', '자연어 처리'], reason: '통화를 텍스트로 바꾸는 음성 인식과, 그 내용을 이해하여 요약문을 만드는 자연어 처리가 함께 쓰입니다.' },
  { id: 'photo-class', text: '사진 전체에서 주된 객체의 종류를 판단하는 기능만 묻습니다. 해당 분야를 고르세요.', answer: ['이미지 분류'], reason: '새 이미지를 그리는 것이 아니라 입력 사진의 종류를 판단하는 이미지 분류입니다.' },
] as const

export const TECHNOLOGY_CARDS = ['음성 인식', '자연어 처리', '이미지 분류', '이미지 생성'] as const

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
