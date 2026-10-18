import { numericAnswer, type StudyTask } from '../lesson11/StudyActivity'
import { FREQUENCY_ROWS, NEXT_WORD_STAGES } from './lesson12Data'
import { frequenciesToProbabilities } from './languageModelMath'

const question = (id: string, prompt: string, options: string[], answer: string, hint: string, explanation: string): StudyTask => ({ id, prompt, options, answer, hint, explanation })
export const generationBranches: Record<string, { candidates: readonly { word: string; probability: number }[]; note: string }> = {
  '우유를': { candidates: NEXT_WORD_STAGES.milk.candidates, note: '교과서의 고정 후보입니다.' },
  'TV를': { candidates: [{ word: '본다', probability: 0.7 }, { word: '켠다', probability: 0.2 }, { word: '끈다', probability: 0.1 }], note: '이 분기는 문장을 끝까지 이어 보기 위해 추가한 교육용 가정입니다. 실제 모델 출력이 아닙니다.' },
  '버스를': { candidates: [{ word: '탄다', probability: 0.6 }, { word: '기다린다', probability: 0.3 }, { word: '놓친다', probability: 0.1 }], note: '이 분기는 문장을 끝까지 이어 보기 위해 추가한 교육용 가정입니다. 실제 모델 출력이 아닙니다.' },
}
export const independentFrequency = FREQUENCY_ROWS[2]
export const frequencyTotal = independentFrequency.candidates.reduce((sum, candidate) => sum + candidate.count, 0)
const best = frequenciesToProbabilities(independentFrequency.candidates).reduce((a, b) => a.probability > b.probability ? a : b)
export const lesson12Tasks: Record<string, StudyTask> = Object.fromEntries([
  question('order-love', '“너는 나를 사랑해.”에서 사랑하는 사람 → 사랑받는 사람은?', ['나 → 너', '너 → 나'], '너 → 나', '는과 를이 붙은 대상을 살펴보세요.', '너가 사랑하는 사람이고 나는 사랑받는 사람입니다. 같은 단어라도 관계가 달라집니다.'),
  question('order-chase', '“고양이가 강아지를 쫓았다.”에서 쫓는 동물과 판단 근거는?', ['강아지 · 더 뒤에 나와서', '고양이 · 가가 붙은 주체이며 쫓는 행동을 해서', '둘 다 · 한 번씩 등장해서'], '고양이 · 가가 붙은 주체이며 쫓는 행동을 해서', '등장 횟수 대신 행동을 하는 주체를 살펴보세요.', '고양이가 행동의 주체입니다. 단어의 횟수만으로 주체와 대상을 충분히 표현하기 어렵습니다.'),
  question('rnn-result', '“못”만 보고 부정이라고 확정하지 않고 “않아”까지 함께 보는 이유는?', ['마지막 단어만 있으면 앞말은 필요 없어서', '문장이 길수록 항상 긍정이어서', '앞말과 뒤 표현의 관계가 전체 해석을 바꿀 수 있어서'], '앞말과 뒤 표현의 관계가 전체 해석을 바꿀 수 있어서', '못 … 않아를 함께 읽을 때의 의미를 비교하세요.', '교과서 예시는 못 부른다는 뜻을 부정하는 관계를 함께 해석합니다. 중간 단어만으로 전체 뜻을 확정하면 놓칠 수 있습니다.'),
  question('rnn-state', '새 단어를 처리할 때 RNN이 함께 활용하는 것은?', ['현재 단어의 숫자 표현과 이전 은닉 상태', '현재 단어만, 앞 정보는 항상 폐기', '앞 문장이 그대로 저장된 텍스트 파일'], '현재 단어의 숫자 표현과 이전 은닉 상태', '그림에서 현재 입력 외에 들어오는 화살표를 살펴보세요.', '은닉 상태는 앞 정보를 반영한 숫자 묶음입니다. 화면의 문장형 요약이 그대로 저장되는 것은 아닙니다.'),
  question('long-evidence', '긴 문장에서 철수가 먼저 밥을 먹은 까닭을 뒷받침하는 앞 정보는?', ['운동장 물건을 옮겼다.', '아침을 먹지 못해 매우 배가 고팠다.', '동아리 발표 자료를 정리했다.'], '아침을 먹지 못해 매우 배가 고팠다.', '마지막 행동인 밥 먹기와 직접 연결되는 이유를 찾으세요.', '배고픔과 밥 먹기 사이에 여러 사건이 끼어 있습니다. 기본 RNN은 이런 긴 관계를 충분히 유지하기 어려울 수 있습니다.'),
  question('attention-umbrella', '기준이 “우산”일 때, 편 이유를 알려 주는 정보와 반영 방법은?', ['비 · 원인 관계를 더 크게 반영한다.', '우산 · 같은 단어만 반복한다.', '내려서 · 나머지 단어를 모두 삭제한다.'], '비 · 원인 관계를 더 크게 반영한다.', '비가 내려서라는 원인과 우산을 편 행동을 연결하세요.', '현재 판단에 관련 있는 비의 정보를 더 크게 반영해 다른 정보와 조합합니다. 다른 단어를 삭제하는 것은 아닙니다.'),
  question('attention-she', '기준이 “그녀”로 바뀌면, 누구를 가리키는지 판단할 때 더 참고할 정보는?', ['비와 우산', '책이라는 물건의 빈도', '책을 받은 영희와 뒤의 고맙다는 말'], '책을 받은 영희와 뒤의 고맙다는 말', '누가 책을 받았고 누가 고맙다고 말하는지 앞뒤를 보세요.', '기준과 질문이 달라지면 참고할 관계도 달라집니다. 이 문맥에서는 영희가 지칭 대상입니다.'),
  question('attention-combine', '어텐션에서 여러 정보에 서로 다른 비중을 주는 이유는?', ['가장 큰 번호의 단어만 보존하려고', '현재 처리에 더 관련 있는 정보를 더 크게 반영해 조합하려고', '관계가 약한 단어를 원문에서 없애려고'], '현재 처리에 더 관련 있는 정보를 더 크게 반영해 조합하려고', '원문을 지우는 것과 처리에 반영하는 정도를 조절하는 것은 다릅니다.', '어텐션은 현재 처리와의 관련성에 따라 정보의 기여 정도를 달리해 조합합니다.'),
  question('attention-book', '같은 문장에서 기준이 “책”이고 무엇을 했는지 묻는다면, 더 참고할 관계는?', ['영희와 그녀 · 지칭하는 사람', '책과 건넸다 · 물건에 한 행동', '고맙다와 그녀 · 말한 사람'], '책과 건넸다 · 물건에 한 행동', '누구인지를 묻는 질문에서 물건에 한 행동을 묻는 질문으로 바뀌었습니다.', '문장이 같아도 현재 기준과 질문이 바뀌면 더 크게 반영할 정보가 달라집니다.'),
  question('transformer-position', '“나는 너를 사랑해”와 “너는 나를 사랑해”를 같은 단어 묶음으로만 받는다면, 무엇을 더 알려 줘야 할까요?', ['단어의 위치·순서', '모든 단어를 같은 뜻으로 바꾸기', '가장 높은 빈도 한 개만 남기기'], '단어의 위치·순서', '나는 너를/너는 나를의 차이를 떠올리세요.', '트랜스포머도 위치 정보를 사용해 순서를 구별합니다. 관계를 함께 처리한다고 순서가 불필요한 것은 아닙니다.'),
  question('transformer-generation', '입력 위치의 관계를 병렬로 처리한다는 것과 문장 생성의 관계는?', ['병렬 처리하면 미래 문장 전체가 한 번에 확정됩니다.', '병렬 처리하면 다음 후보의 확률이 필요 없습니다.', '입력 관계를 함께 처리할 수 있어도, 선택한 토큰을 문맥에 더하며 다음 예측을 반복합니다.'], '입력 관계를 함께 처리할 수 있어도, 선택한 토큰을 문맥에 더하며 다음 예측을 반복합니다.', '입력 안에서 관계를 계산하는 일과 새 토큰을 이어 붙이는 일을 구별하세요.', '트랜스포머는 어텐션을 핵심으로 쓰는 구조입니다. 생성 과정은 문맥을 갱신하며 이어집니다.'),
  { id: 'probability-total', prompt: '“커피” 행의 세 후보 빈도 합은?', validate: numericAnswer(frequencyTotal), hint: '현재 행의 세 횟수를 모두 더하세요. 다른 행은 더하지 않습니다.', explanation: '이 합이 커피 다음 후보들의 비율을 계산할 분모입니다.' },
  question('probability-best', '커피 다음에 올 확률이 가장 높은 후보는?', independentFrequency.candidates.map((candidate) => candidate.word), best.word, '같은 분모로 나누므로 횟수의 크기를 비교할 수 있습니다.', '높은 후보 확률은 이 문맥에서의 가능성이지, 사실일 확률이나 모델 정확도가 아닙니다.'),
  { id: 'generation-first', prompt: '“세훈이는” 뒤에 붙일 후보를 선택하고 제출하세요.', options: NEXT_WORD_STAGES.first.candidates.map((candidate) => candidate.word), validate: (value: string) => NEXT_WORD_STAGES.first.candidates.some((candidate) => candidate.word === value), hint: '화면에 제시한 후보 중 하나를 선택하세요.', explanation: '선택한 토큰이 새 문맥에 들어갑니다. 낮은 확률 후보도 선택할 수 있습니다.' },
  { id: 'generation-next', prompt: '새 문맥의 다음 후보를 선택해 문장을 완성하세요.', prerequisiteId: 'generation-first', validate: (value: string) => Object.entries(generationBranches).some(([first, branch]) => branch.candidates.some((candidate) => value === `${first} ${candidate.word}`)), hint: '앞에서 제출한 문맥에 이어지는 후보를 골라 제출하세요.', explanation: '문맥 → 후보 → 선택 → 문맥 갱신 → 다음 예측을 경험했습니다. 자연스러운 문장도 사실을 보장하지 않습니다.' },
  question('probability-meaning', '“세훈이는 우유를 마신다”에서 마신다 60%의 의미는?', ['문장이 사실일 확률 60%', '고정 예시의 해당 문맥에서 다음 후보로 선택될 가능성 60%', '모델의 전체 정확도 60%'], '고정 예시의 해당 문맥에서 다음 후보로 선택될 가능성 60%', '후보가 무엇인지, 어떤 문맥의 수치인지 살펴보세요.', '실제 세계의 사실 검증이나 모델 성능 평가와는 다른 값입니다.'),
  question('apply-model', '대규모 텍스트로 학습한 모델이 어텐션 중심 구조를 사용해 답변을 씁니다. 설명으로 맞는 것은?', ['LLM과 트랜스포머는 같은 이름입니다.', 'LLM은 모델의 규모, 트랜스포머는 사용하는 구조에 관한 설명입니다.', '어텐션이 있으므로 모든 답변이 사실입니다.'], 'LLM은 모델의 규모, 트랜스포머는 사용하는 구조에 관한 설명입니다.', '얼마나 큰 모델인가와 어떤 구조로 처리하는가를 구분하세요.', '많은 LLM이 트랜스포머를 기반으로 합니다. 생성형 AI는 텍스트 외 이미지·음성 생성까지 포함하는 더 넓은 범주입니다.'),
  question('apply-training', '이미 학습된 챗봇에 질문을 입력해 답을 받았습니다. 이때의 핵심 과정은?', ['매 단어마다 사용자가 정답을 주어 가중치를 새로 학습시켰다.', '학습된 가중치로 후보를 예측하고 문장을 이어 생성했다.', '빈도표의 가장 큰 수를 골랐으므로 사실 검증도 끝났다.'], '학습된 가중치로 후보를 예측하고 문장을 이어 생성했다.', '학습할 때 가중치를 조정하는 일과 사용할 때 문장을 만드는 일을 구별하세요.', '기본적인 추론에서는 학습된 가중치를 사용합니다. 답변은 자료와 대조하여 확인해야 합니다.'),
].map((task) => [task.id, task]))
export const lesson12Groups = [
  ['order-love', 'order-chase'], ['rnn-result', 'rnn-state'], ['long-evidence'], ['attention-umbrella', 'attention-she', 'attention-book', 'attention-combine'], ['transformer-position', 'transformer-generation'], ['probability-total', 'probability-best', 'generation-first', 'generation-next', 'probability-meaning'], ['apply-model', 'apply-training'],
]
