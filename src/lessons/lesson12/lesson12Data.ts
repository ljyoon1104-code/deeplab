export const lesson12StepTitles = [
  '단어의 순서가 왜 중요할까?',
  '이전 정보를 활용하는 RNN',
  '문장이 길어지면 어떤 문제가 생길까?',
  '중요한 단어에 집중하면?',
  'Transformer는 무엇이 다를까?',
  'AI는 다음 단어를 어떻게 고를까?',
  '생성형 언어 모델과 LLM',
] as const

export const SEQUENCE_SENTENCES = [
  { id: 'love1', sentence: '나는 너를 사랑해.', action: '사랑', subjectLabel: '사랑하는 사람', objectLabel: '사랑받는 사람', choices: ['나', '너'], subject: '나', object: '너' },
  { id: 'love2', sentence: '너는 나를 사랑해.', action: '사랑', subjectLabel: '사랑하는 사람', objectLabel: '사랑받는 사람', choices: ['나', '너'], subject: '너', object: '나' },
  { id: 'chase1', sentence: '강아지가 고양이를 쫓았다.', action: '쫓기', subjectLabel: '쫓는 동물', objectLabel: '쫓기는 동물', choices: ['강아지', '고양이'], subject: '강아지', object: '고양이' },
  { id: 'chase2', sentence: '고양이가 강아지를 쫓았다.', action: '쫓기', subjectLabel: '쫓는 동물', objectLabel: '쫓기는 동물', choices: ['강아지', '고양이'], subject: '고양이', object: '강아지' },
] as const

export const RNN_WORDS = [
  { word: '너는', state: '대상에 관한 정보' },
  { word: '노래를', state: '행동의 대상' },
  { word: '못', state: '부정과 관련된 표현 등장' },
  { word: '부르지', state: '노래 행동' },
  { word: '않아', state: '앞의 표현과 함께 전체 문맥 확인 필요' },
] as const

export const ATTENTION_EXAMPLES = [
  { id: 'rain', sentence: '비가 내려서 우산을 펼쳤다.', prompt: '우산을 편 이유를 이해할 때 중요한 관계는?', words: ['비', '내려서', '우산', '펼쳤다'], important: ['비', '우산'] },
  { id: 'thanks', sentence: '철수는 영희에게 책을 건넸고 그녀는 고맙다고 말했다.', prompt: '“그녀”가 누구인지 이해할 때 중요한 관계는?', words: ['철수', '영희', '책', '그녀', '고맙다'], important: ['영희', '그녀'] },
] as const

export const CONTEXT_EXAMPLES = [
  { id: 'short', title: '짧은 문장', text: '철수는 배가 고파서 밥을 먹었다.', person: '철수', middle: '배가 고픔', ending: '밥을 먹음', reason: '배가 고팠기 때문' },
  { id: 'long', title: '긴 문장', text: '철수는 아침을 먹지 못해 매우 배가 고팠다. 학교 행사 준비를 돕고, 동아리 친구들과 발표 자료를 정리한 뒤, 운동장에 놓인 물건을 교실로 옮겼다. 집에 돌아온 철수는 먼저 밥을 먹었다.', person: '철수', middle: '학교 행사·동아리·운동', ending: '밥을 먹음', reason: '아침을 먹지 못해 매우 배가 고팠기 때문' },
] as const

export type ModelRelation = 'rnn' | 'transformer' | 'both'
export const MODEL_RELATION_CARDS = [
  { id: 'state', text: '이전 단계의 상태 정보를 다음 단계로 전달한다.', answer: 'rnn' },
  { id: 'attention', text: 'Attention을 이용해 문장 안 여러 단어의 관계를 살펴본다.', answer: 'transformer' },
  { id: 'context-evidence', text: '긴 문맥의 관련 정보를 활용하지만 항상 완벽히 이해한다고 보장할 수는 없다.', answer: 'both' },
  { id: 'sequence', text: '문장과 같은 순서가 있는 데이터를 처리하는 데 활용할 수 있다.', answer: 'both' },
  { id: 'learn', text: '데이터로부터 언어 패턴을 학습한다.', answer: 'both' },
  { id: 'numeric', text: '입력을 숫자 표현으로 바꾸어 처리한다.', answer: 'both' },
  { id: 'quality', text: '학습 데이터의 품질이 결과에 영향을 준다.', answer: 'both' },
] as const

export interface CandidateFrequency { word: string; count: number }
export const FREQUENCY_ROWS: Array<{ context: string; candidates: CandidateFrequency[]; answer: string }> = [
  { context: '밥', candidates: [{ word: '먹다', count: 350 }, { word: '타다', count: 0 }, { word: '마시다', count: 10 }], answer: '먹다' },
  { context: '버스', candidates: [{ word: '먹다', count: 0 }, { word: '타다', count: 200 }, { word: '마시다', count: 0 }], answer: '타다' },
  { context: '커피', candidates: [{ word: '먹다', count: 50 }, { word: '타다', count: 5 }, { word: '마시다', count: 400 }], answer: '마시다' },
]

export const NEXT_WORD_STAGES = {
  first: {
    context: '세훈이는',
    candidates: [{ word: '우유를', probability: 0.5 }, { word: 'TV를', probability: 0.3 }, { word: '버스를', probability: 0.2 }],
  },
  milk: {
    context: '세훈이는 우유를',
    candidates: [{ word: '먹는다', probability: 0.2 }, { word: '마신다', probability: 0.6 }, { word: '탄다', probability: 0.2 }],
  },
} as const

export const LANGUAGE_MODEL_USES = [
  { id: 'chatbot', title: '챗봇', detail: '대화 문맥을 바탕으로 답변 텍스트를 생성합니다.' },
  { id: 'translation', title: '기계 번역', detail: '입력 언어의 의미를 다른 언어 문장으로 표현합니다.' },
  { id: 'summary', title: '글 요약', detail: '긴 글의 핵심을 짧은 텍스트로 생성합니다.' },
  { id: 'completion', title: '문장 완성', detail: '현재 문맥 뒤에 이어질 텍스트를 생성합니다.' },
] as const

export const CONCEPT_RELATION_CARDS = [
  { id: 'language-model', concept: '생성형 언어 모델', answer: '문맥을 바탕으로 다음 단어 가능성을 예측하며 텍스트를 생성하는 모델' },
  { id: 'llm', concept: 'LLM', answer: '매우 큰 텍스트 데이터와 큰 모델 규모를 사용하는 대규모 언어 모델' },
  { id: 'transformer', concept: 'Transformer', answer: '많은 LLM에서 사용하는 기반 구조' },
  { id: 'generative-ai', concept: '생성형 AI', answer: '텍스트·이미지·음성 등 새로운 콘텐츠를 만드는 더 넓은 범주' },
] as const

export const SERVICE_TECH_CARDS = [
  { id: 'completion', title: '문장 자동 완성', answer: 'language-model' },
  { id: 'summary', title: '긴 글 요약', answer: 'language-model' },
  { id: 'answer', title: '질문에 대한 답변 생성', answer: 'language-model' },
  { id: 'voice-answer', title: '음성 질문을 텍스트로 바꾼 뒤 답변', answer: 'speech-plus-language' },
  { id: 'digit', title: '이미지 속 숫자 분류', answer: 'image-classification' },
  { id: 'image', title: '설명에 맞는 이미지 생성', answer: 'image-generation' },
] as const

export const COURSE_ROADMAP = [
  { title: '딥러닝 기초 원리', tone: 'cyan', lessons: [['01', '기계학습에서 딥러닝으로'], ['02', '퍼셉트론'], ['03', '활성화 함수'], ['04', '인공신경망'], ['05', '손실함수'], ['06', '역전파와 학습']] },
  { title: '실제 모델 실습', tone: 'violet', lessons: [['07', 'MNIST 데이터와 전처리'], ['08', 'MNIST 학습과 평가']] },
  { title: '딥러닝 응용', tone: 'amber', lessons: [['09', '컴퓨터 비전과 CNN'], ['10', '생성형 AI와 음성 인식'], ['11', '자연어 처리'], ['12', 'RNN·Transformer·생성형 언어 모델']] },
] as const

export const LESSON12_QUIZ = [
  { id: 1, question: 'RNN의 특징으로 가장 적절한 것은?', options: ['이전 단계의 정보를 다음 입력 처리에 활용한다.', '각 단계에서 이전 정보를 모두 버린다.', '모든 단어를 독립적으로만 처리한다.', '뒤 단어를 보지 않아도 문장 뜻이 항상 확정된다.'], answer: 0, explanation: 'RNN은 이전 입력에서 얻은 상태 정보를 다음 입력 처리에 함께 활용합니다.' },
  { id: 2, question: '문장에서 단어의 순서가 중요한 이유는?', options: ['순서에 따라 의미가 달라질 수 있기 때문이다.', '같은 단어의 등장 횟수만으로 역할이 결정되기 때문이다.', '높은 인덱스의 단어가 언제나 주체이기 때문이다.', '문장에서는 순서가 중요하지 않다.'], answer: 0, explanation: '비슷한 단어를 사용해도 순서와 관계가 달라지면 행동의 주체·대상과 문장 의미가 달라질 수 있습니다.' },
  { id: 3, question: 'Attention의 핵심 아이디어로 적절한 것은?', options: ['문장에서 중요한 단어 관계를 더 크게 반영한다.', '관계가 약한 단어는 문장에서 모두 삭제한다.', '가까이 있는 단어끼리만 관계를 살펴본다.', '중요 관계를 고르면 모든 문장을 완벽히 이해한다.'], answer: 0, explanation: 'Attention은 현재 처리에 중요한 단어 관계를 더 크게 반영하며 다른 단어를 모두 삭제하지 않습니다.' },
  { id: 4, question: 'Transformer에 대한 설명으로 적절한 것은?', options: ['문장 안 여러 단어의 관계를 효율적으로 처리하는 데 활용된다.', 'Attention이라는 아이디어와 완전히 같은 뜻이다.', 'LLM이나 생성형 AI 전체를 가리키는 이름이다.', '다음 단어 확률이 높은지로 사실을 검증하는 방법이다.'], answer: 0, explanation: 'Transformer는 Attention을 이용해 입력 문장의 여러 단어 관계를 효율적으로 처리하는 데 적합합니다.' },
  { id: 5, question: '생성형 언어 모델이 문장을 만드는 원리를 쉽게 설명한 것은?', options: ['문맥을 바탕으로 다음 단어의 가능성을 예측하며 문장을 이어 간다.', '모든 문장을 미리 저장했다가 그대로 복사한다.', '처음 문맥을 그대로 두고 새로 선택한 단어는 다음 처리에 쓰지 않는다.', '가장 확률이 높은 문장을 고르면 사실 검증까지 끝난다.'], answer: 0, explanation: '생성형 언어 모델은 현재 문맥에서 다음 단어 또는 토큰의 가능성을 예측하고 선택한 결과를 새 문맥에 더해 생성을 이어갈 수 있습니다.' },
  { id: 6, question: '대형 언어 모델 LLM에 대한 설명으로 적절한 것은?', options: ['매우 큰 규모의 텍스트 데이터를 학습한 언어 모델이다.', '이미지·음성 등 모든 생성형 AI를 통틀어 부르는 이름이다.', 'Attention의 단어 연결선 자체를 가리키는 이름이다.', 'Transformer라는 구조와 완전히 같은 뜻이다.'], answer: 0, explanation: 'LLM은 매우 큰 규모의 텍스트 데이터를 학습한 대형 언어 모델입니다.' },
  { id: 7, question: '다음 단어 확률이 가장 높다는 뜻으로 알맞은 것은?', options: ['그 문맥에서 더 가능성이 큰 후보라는 뜻이며 사실 검증 결과는 아니다.', '반드시 사실이라는 뜻이다.', '다른 후보는 절대 선택할 수 없다는 뜻이다.', '문장 전체를 이미 이해했다는 보장이다.'], answer: 0, explanation: '확률은 문맥에서의 가능성을 나타낼 뿐, 실제 세계의 사실 여부를 검증하지는 않습니다.' },
  { id: 8, question: 'RNN과 Transformer의 차이를 가장 잘 설명한 것은?', options: ['RNN은 이전 상태를 순서대로 전달하고, Transformer는 Attention으로 여러 단어 관계를 처리하는 데 적합하다.', '두 구조는 언제나 같은 순서로만 처리한다.', 'Transformer는 텍스트를 숫자로 바꾸지 않는다.', 'RNN은 문장을 전혀 처리하지 못한다.'], answer: 0, explanation: '두 구조 모두 언어 패턴 학습에 활용될 수 있지만, 이전 상태 전달과 Attention 중심 관계 처리는 구분되는 관점입니다.' },
  { id: 9, question: '생성형 AI와 LLM의 관계로 알맞은 것은?', options: ['LLM은 텍스트 생성에 활용되는 모델이며, 생성형 AI는 이미지·음성 등을 포함하는 더 넓은 범주다.', '생성형 AI와 LLM은 완전히 같은 뜻이다.', 'Transformer는 생성형 AI보다 더 넓은 범주다.', 'LLM은 음성 인식과 같은 뜻이다.'], answer: 0, explanation: '생성형 AI는 새로운 콘텐츠를 만드는 넓은 기술 범주이며, LLM은 그중 텍스트 생성에 활용될 수 있는 언어 모델입니다.' },
  { id: 10, question: 'Deep Learning Lab 07~08차시에서 다룬 핵심은?', options: ['MNIST 데이터 준비와 모델 학습·평가', '단어 빈도수와 임베딩', 'GAN 생성자와 감별자', 'CNN 필터와 최대 풀링'], answer: 0, explanation: '07차시는 MNIST 데이터·전처리, 08차시는 MNIST 모델 학습과 평가를 다룹니다.' },
] as const

export const conceptDescription = (value: string) =>
  value === '매우 큰 텍스트 데이터와 큰 모델 규모를 사용하는 대규모 언어 모델'
    ? '매우 큰 규모의 텍스트 데이터를 학습한 대형 언어 모델'
    : value

export const NLP_DEVELOPMENT = ['RNN', 'LSTM', 'Seq2Seq', 'Attention', 'Transformer', 'GPT-1', 'BERT', 'GPT-3'] as const

export const GENERATION_PHASES = [
  { title: '형태소 분석', detail: '입력 텍스트를 단어나 형태소로 나누어 처리할 단위를 준비합니다.' },
  { title: '임베딩', detail: '처리 단위를 숫자로 표현하고 단어의 관계를 나타내는 공간에 배치합니다.' },
  { title: '언어 모델', detail: '학습된 모델이 현재 문맥과 단어 관계를 바탕으로 다음 단어의 가능성을 예측합니다.' },
  { title: '확률적 선택', detail: '후보 확률을 이용해 다음 단어를 선택합니다. 선택 결과를 새 문맥에 더하고 생성을 반복합니다.' },
] as const


// 아래 설명은 표시용입니다. RNN_WORDS.state와 저장된 선택 값은 변경하지 않습니다.
export const RNN_GUIDANCE = [
  { choiceHint: '누구에 관한 이야기인지', cue: '“너는”에서 이야기를 할 사람인 너를 먼저 파악합니다. 아직 무슨 행동인지는 뒤 단어를 더 봐야 합니다.', carried: '너에 관한 이야기' },
  { choiceHint: '무엇에 대한 행동인지', cue: '앞에서 너에 관한 이야기임을 알았습니다. “노래를”의 를은 뒤에 올 행동이 향하는 것이 무엇인지 살피는 단서입니다.', carried: '노래에 대한 행동이라는 정보' },
  { choiceHint: '할 수 없음 등을 나타내는 부정 표현인지', cue: '너와 노래에 관한 앞 정보를 유지하면서 “못”이 더하는 뜻을 살펴보세요. 아직 마지막 표현이 남아 있어 전체 뜻을 확정하지 않습니다.', carried: '못이라는 부정 표현이 등장함' },
  { choiceHint: '어떤 행동인지', cue: '앞의 “너는 노래를 못”과 “부르지”를 함께 보세요. 현재 단어가 어떤 행동을 나타내는지 판단하되, 다음 표현도 기다립니다.', carried: '부르는 행동에 관한 정보' },
  { choiceHint: '앞의 표현과 문장 끝을 함께 봐야 하는지', cue: '앞에서 나온 “못”과 마지막 “않아”를 함께 보아야 합니다. 낱말의 부정만 따로 세지 말고 문장 전체의 관계를 살펴보세요.', carried: '못 … 않아를 함께 해석해야 한다는 정보' },
] as const

export const ATTENTION_GUIDANCE: Record<string, { guide: string; reason: string }> = {
  rain: { guide: '이유를 묻는 질문입니다. 원인과 그에 따른 행동에 관련된 단어 두 개를 찾으세요.', reason: '“비가 내려서”는 “우산을 펼쳤다”의 이유입니다. 비와 우산의 관계를 보면 우산을 편 까닭을 이해하는 데 도움이 됩니다.' },
  thanks: { guide: '그녀가 가리키는 사람을 묻습니다. 누가 책을 받았고 누가 고맙다고 말하는지 문장 앞뒤를 살펴보세요.', reason: '이 예문에서는 영희가 책을 받고, 뒤에서 그녀가 고맙다고 말합니다. 영희와 그녀를 연결하면 지칭 대상을 이해하는 데 도움이 됩니다.' },
}

export const MODEL_RELATION_GUIDANCE: Record<string, string> = {
  state: 'RNN 그림에서 앞 단계의 정보가 다음 단어 처리로 이어지는 화살표를 보세요.',
  attention: 'Transformer 그림 안의 Attention은 질문에 관련된 단어 관계를 반영하는 방식입니다. 구조와 그 구조가 쓰는 방식을 구별하세요.',
  'context-evidence': '두 그림 모두 문맥 활용을 설명하지만, 어떤 구조도 모든 문장의 정확한 이해를 보장하지 않습니다.',
  sequence: '두 그림에 같은 순서의 문장 단어가 입력되어 있습니다.',
  learn: '처리 구조는 달라도 두 신경망 모두 데이터에서 패턴을 학습합니다.',
  numeric: 'Lesson 11처럼 텍스트를 숫자로 표현하는 준비는 두 구조에 모두 필요합니다.',
  quality: '어떤 구조를 쓰더라도 잘못되거나 부족한 데이터가 결과에 영향을 줄 수 있습니다.',
}

// 표시 번호만 분산합니다. 원래 선택지 인덱스(A~D)는 채점·저장 ID로 유지합니다.
export const LESSON12_OPTION_ORDER: Record<number, readonly number[]> = {
  1: [1, 0, 2, 3], 2: [1, 2, 0, 3], 3: [0, 1, 2, 3],
  4: [1, 2, 3, 0], 5: [1, 0, 2, 3], 6: [1, 2, 0, 3],
  7: [1, 2, 3, 0], 8: [0, 1, 2, 3], 9: [1, 0, 2, 3], 10: [1, 2, 0, 3],
}
