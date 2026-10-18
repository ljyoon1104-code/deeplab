export const lesson11StepTitles = [
  '자연어 처리가 하는 일',
  '문장에서 단어 번호까지',
  '원-핫으로 표현하기',
  '임베딩이 필요한 이유',
  '단어 빈도로 기사 분류하기',
  '횟수로 알 수 없는 의미',
  '새로운 글에 적용하기',
] as const

export type NlpActivityType = 'understanding' | 'generation'

export const NLP_ACTIVITY_CARDS = [
  { id: 'review', text: '리뷰가 긍정인지 부정인지 판단한다.', answer: 'understanding', input: '“이 책을 다시 읽고 싶다.”라는 리뷰', action: '글에 담긴 감정을 판단', result: '긍정 또는 부정이라는 판단', reason: '리뷰에 대한 새 글을 쓰는 것이 아니라 입력 글의 감정을 파악합니다.' },
  { id: 'continue', text: '문장의 다음 내용을 작성한다.', answer: 'generation', input: '“오늘 친구와 도서관에 가서…”', action: '앞 문맥에 이어질 내용을 작성', result: '새로 이어 쓴 문장', reason: '문맥 이해도 필요하지만, 여기서 분류하는 동작은 이어질 문장을 만드는 것입니다.' },
  { id: 'intent', text: '사용자의 질문 의도를 파악한다.', answer: 'understanding', input: '“근처 맛집 추천해 줘.”라는 질문', action: '사용자가 무엇을 요청하는지 파악', result: '주변 식당 추천 요청이라는 판단', reason: '답변 서비스 중 요청의 의도를 파악하는 동작만 분류합니다. 답변을 쓰는 동작과 구별하세요.' },
  { id: 'summary', text: '주어진 내용을 짧게 요약한 문장을 만든다.', answer: 'generation', input: '학교 행사 안내 글', action: '핵심 내용을 새 문장으로 짧게 작성', result: '새로 구성한 요약문', reason: '핵심 파악에는 이해가 필요하지만, 여기서는 요약문을 새로 만드는 동작을 분류합니다.' },
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
  { id: 'pear', sentence: '나는 배를 먹었다.', target: '배', choices: ['과일', '물 위를 이동하는 배'], answer: '과일', cue: '“먹었다”는 먹는 대상을 가리킵니다.' },
  { id: 'boat', sentence: '나는 배를 탔다.', target: '배', choices: ['과일', '물 위를 이동하는 배'], answer: '물 위를 이동하는 배', cue: '“탔다”는 타고 이동하는 대상을 가리킵니다.' },
  { id: 'snow', sentence: '오늘은 눈이 많이 온다.', target: '눈', choices: ['하늘에서 내리는 눈', '신체 기관'], answer: '하늘에서 내리는 눈', cue: '“오늘”, “많이 온다”는 날씨 상황을 나타냅니다.' },
  { id: 'eye', sentence: '눈이 아파서 병원에 갔다.', target: '눈', choices: ['하늘에서 내리는 눈', '신체 기관'], answer: '신체 기관', cue: '“아파서”, “병원”은 몸의 상태와 관련됩니다.' },
] as const

export const TEXT_REPRESENTATION_SCENARIOS = [
  { id: 'index', text: '단어를 숫자 ID로 저장한다.', answer: 'index', limit: '번호 자체는 단어의 의미를 나타내지 않습니다.' },
  { id: 'onehot', text: '작은 단어 목록에서 선택 단어의 위치를 분명히 표시한다.', answer: 'onehot', limit: '단어가 많으면 벡터가 매우 길어집니다.' },
  { id: 'frequency', text: '문서에서 자주 등장한 단어로 간단히 주제를 추정한다.', answer: 'frequency', limit: '순서와 부정 표현을 놓칠 수 있습니다.' },
  { id: 'embedding', text: '의미가 비슷한 단어의 관계를 비교한다.', answer: 'embedding', limit: '학습 데이터에 따라 관계가 달라질 수 있습니다.' },
  { id: 'context', text: '다의어와 부정 표현이 있는 문장을 해석한다.', answer: 'context', limit: '주변 단어와 순서를 함께 처리해야 합니다.' },
] as const

export const LESSON11_QUIZ = [
  {
    id: 1,
    question: '자연어 처리의 목표로 가장 적절한 것은?',
    options: ['컴퓨터가 사람의 언어를 이해하고 처리하도록 한다.', '말소리를 텍스트로 바꾸는 일만 한다.', '텍스트의 글자 수만 세면 의미 처리가 끝난다.', '텍스트를 숫자로 바꾸면 의미를 항상 완벽히 안다.'],
    answer: 0,
    explanation: '자연어 처리는 컴퓨터가 사람의 언어를 이해하고 처리하며, 필요한 경우 언어를 생성하도록 하는 기술입니다.',
  },
  {
    id: 2,
    question: '컴퓨터가 텍스트를 딥러닝 모델에서 처리하려면 필요한 과정은?',
    options: ['단어를 숫자 형태로 표현한다.', '모든 단어에 의미와 무관하게 같은 번호를 붙인다.', '인덱스가 큰 단어를 중요한 단어라고 정한다.', '띄어쓰기만 하면 숫자 표현 없이 신경망에 넣을 수 있다.'],
    answer: 0,
    explanation: '신경망은 수치 계산을 하므로 텍스트의 단어나 토큰을 숫자 형태로 표현하는 과정이 필요합니다.',
  },
  {
    id: 3,
    question: '원-핫 인코딩의 특징은?',
    options: ['해당 단어 위치만 1이고 나머지는 0이다.', '모든 값이 항상 1이다.', '의미가 비슷한 단어는 항상 같은 위치가 1이다.', '항상 두 개의 숫자만 사용한다.'],
    answer: 0,
    explanation: '원-핫 벡터는 선택한 단어의 인덱스 위치 하나만 1이고 나머지 위치는 모두 0입니다.',
  },
  {
    id: 4,
    question: '워드 임베딩에 대한 설명으로 적절한 것은?',
    options: ['단어를 여러 실숫값으로 표현하여 의미와 관계를 나타내는 데 활용할 수 있다.', '모든 단어를 같은 벡터로 만든다.', '단어 인덱스의 크기만으로 의미 거리를 정한다.', '항상 한 위치만 1이다.'],
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
    options: ['주변 단어와 문맥이 다르기 때문이다.', '글자 수가 다르기 때문이다.', '단어 인덱스의 크기가 뜻을 결정하기 때문이다.', '항상 같은 의미이다.'],
    answer: 0,
    explanation: '같은 글자라도 함께 쓰인 단어와 문장 상황이 달라지면 문맥에서 선택되는 의미가 달라집니다.',
  },
  {
    id: 17, // 기존 미등록 단어 문항(7)의 저장 답안을 재사용하지 않습니다.
    question: '“영수는 서울에 3번 간 적이 있다.”에서 사람·장소·숫자를 찾는 과정은?',
    options: ['단어 빈도수만 세기', '의미·개체명 분석', '원-핫 벡터 길이 늘리기', '단어별 인덱스 연결'],
    answer: 1,
    explanation: '영수(사람), 서울(장소), 3번(숫자)처럼 단어가 가리키는 개체의 종류를 파악하는 것은 의미·개체명 분석과 연결됩니다.',
  },
  {
    id: 8,
    question: '빈도 비율을 함께 보는 이유로 가장 적절한 것은?',
    options: ['글 길이가 다른 문서도 단어 수를 전체 토큰 수와 함께 비교할 수 있기 때문이다.', '단어 순서를 완벽히 복원하기 때문이다.', '모든 문장의 뜻을 자동으로 알기 때문이다.', '원-핫 벡터 길이를 줄이기 때문이다.'],
    answer: 0,
    explanation: '단순 횟수는 긴 글에서 커지기 쉽습니다. 전체 단어 수로 나눈 비율을 함께 보면 문서 길이가 다른 경우도 비교하기 쉽습니다.',
  },
  {
    id: 9,
    question: '“학생이 선생님을 도왔다.”와 “선생님이 학생을 도왔다.”의 차이를 알기 위해 특히 필요한 것은?',
    options: ['단어의 순서와 문장 안의 관계', '각 단어의 글자 수', '단어가 나온 총횟수만', '각 단어의 원-핫 벡터 길이만'],
    answer: 0,
    explanation: '두 문장은 비슷한 단어를 쓰지만 순서와 관계가 달라 누가 누구를 도왔는지가 달라집니다.',
  },
] as const

export const SEMANTIC_STAGES = [
  { title: '형태소 분석', description: '문장을 형태소로 나누고 조사·접미사 등을 분리하여 단어의 기본 형태를 파악합니다.', example: '교과서: The small dog quickly ran home to his owner.를 작은 단위로 나누어 살펴봅니다.' },
  { title: '구문 분석', description: '단어 사이 문법적 관계와 문장 속 역할을 파악합니다.', example: '교과서의 dog와 ran처럼 누가 어떤 행동을 했는지 관계를 봅니다. 아래 어순 활동에 적용합니다.' },
  { title: '의미·개체명 분석', description: '단어·구문의 뜻과 조합, 사람·장소·숫자 등 개체를 파악합니다.', example: '교과서: ‘사과를 먹는다’와 ‘기차를 먹는다’를 비교하고, ‘영수는 서울에 3번 간 적이 있다’에서 사람·장소·숫자를 찾습니다.' },
  { title: '담화·의도 분석', description: '개별 문장을 넘어 전체 대화의 맥락에서 의도와 요청을 파악합니다.', example: '앞뒤 문장과 상황을 함께 확인합니다. 아래의 ‘배’와 ‘눈’ 활동은 문맥이 의미 판단에 필요한 이유를 연습합니다.' },
] as const

// 표시 순서만 변경합니다. 원래 선택지 인덱스(A~D)와 저장된 답의 의미는 유지합니다.
export const LESSON11_OPTION_ORDER: Record<number, readonly number[]> = {
  1: [1, 0, 2, 3], 2: [1, 2, 0, 3], 3: [0, 1, 2, 3],
  4: [1, 2, 3, 0], 5: [1, 0, 2, 3], 6: [1, 2, 0, 3],
  17: [1, 0, 2, 3], 8: [1, 2, 3, 0], 9: [1, 0, 2, 3],
}
