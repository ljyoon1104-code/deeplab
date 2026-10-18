import { WORDS, FREQUENCY_DOCUMENTS } from './lesson11Data'
import { countWords, createWordIndex, frequencyRatio, tokenizeText, validateOneHotVector } from './textRepresentation'
import { numericAnswer, type StudyTask } from './StudyActivity'

export const article = FREQUENCY_DOCUMENTS[1].text
export const articleTokens = tokenizeText(article)
export const articleCounts = countWords(article, ['요리', '음식', '맛'])
export const applicationText = '선수는 경기에서 승리하지 못했다. 선수는 아쉽다고 말했다.'
export const applicationTokens = tokenizeText(applicationText)
export const applicationIndex = createWordIndex(applicationTokens)
export const parseVector = (value: string) => value.trim().split(/[\s,]+/).filter(Boolean).map(Number)
const index = createWordIndex(WORDS)
const question = (id: string, prompt: string, options: string[], answer: string, hint: string, explanation: string): StudyTask => ({ id, prompt, options, answer, hint, explanation })
const number = (id: string, prompt: string, expected: number, hint: string, explanation: string, tolerance?: number): StudyTask => ({ id, prompt, validate: numericAnswer(expected, tolerance), hint, explanation })
export const lesson11Tasks: Record<string, StudyTask> = Object.fromEntries([
  question('embedding-lookup-v3', '행렬의 숫자를 한 번 수정한 뒤 인덱스 2인 “함께”의 벡터를 다시 가져오려면?', ['두 번째 열의 숫자를 위에서 아래로 가져온다.', '세 번째 행의 두 숫자를 왼쪽부터 가져온다.', '인덱스 2를 두 후보의 확률로 사용한다.'], '세 번째 행의 두 숫자를 왼쪽부터 가져온다.', '인덱스는 0부터 시작합니다. 행과 열 중 단어에 대응하는 쪽을 살펴보세요.', '인덱스 2는 세 번째 행입니다. 값이 바뀌어도 행에서 두 숫자를 순서대로 가져오는 방법은 같습니다.'),
  question('embedding-learning-v3', '이번 자료에 대한 예측 손실을 이용해 한 번 학습했습니다. 무엇이 바뀌고 무엇이 유지될까요?', ['임베딩 행렬의 숫자와 신경망 가중치·편향은 조정되고, 3행×2열 크기는 유지된다.', '학습 자료의 놀았다를 모델이 고른 걸었다로 바꾸고, 행렬은 유지한다.', '행렬의 0을 지워 열 수를 줄이고, 신경망의 다른 가중치는 고정한다.'], '임베딩 행렬의 숫자와 신경망 가중치·편향은 조정되고, 3행×2열 크기는 유지된다.', '비교 기준인 자료와 표의 크기는 그대로입니다. 예측에 사용한 어떤 숫자들을 조정했나요?', '손실을 역전파해 임베딩과 다른 가중치를 함께 조정합니다. 한 번 수정해 뜻을 모두 배우거나 항상 예측을 맞히는 것은 아닙니다.'),
  question('embedding-relation-v3', '짧은 벡터의 여러 칸을 활용하지만 단어들이 그림에 흩어져 있습니다. 올바른 설명은?', ['밀집 표현이 아니므로 모든 단어를 한 점에 모아야 한다.', '밀집 표현이면 뜻이 비슷한 단어는 자료와 관계없이 언제나 가까워진다.', '밀집 표현일 수 있으며, 일부 벡터의 유사성은 비슷한 문맥의 학습과 목적에 영향을 받는다.'], '밀집 표현일 수 있으며, 일부 벡터의 유사성은 비슷한 문맥의 학습과 목적에 영향을 받는다.', '숫자 칸을 활용하는 방식과 여러 문장에서 배운 관계를 구별하세요.', '밀집은 여러 숫자에 정보를 나누어 담는 방식입니다. 비슷한 문맥의 예측에 도움이 되는 표현을 배울 수 있지만 모든 단어가 모이거나 가까움이 보장되는 것은 아닙니다.'),
  // 이전 embedding-need/limit은 저장된 답안을 보존하기 위해 아래 정의에 남깁니다.
  // 의미가 달라진 현재 문항은 새 ID로 채점하며 STEP 필수 목록에도 새 ID만 사용합니다.
  question('embedding-dense-v2', '100개 단어를 길이 8의 벡터로 표현했습니다. 일부 칸은 0이고, 점들은 흩어져 있습니다. 밀집 표현일 수 있을까요?', ['아니요. 모든 점이 한곳에 모여야 합니다.', '네. 대부분의 칸에 정보를 나누어 담는다면 0이나 점의 위치만으로 배제할 수 없습니다.', '아니요. 학습 때마다 길이가 줄어야 합니다.'], '네. 대부분의 칸에 정보를 나누어 담는다면 0이나 점의 위치만으로 배제할 수 없습니다.', '밀집은 그림의 점 간격이 아니라 숫자 칸을 활용하는 방식입니다.', '벡터 길이 8은 모델 구성 때 정한 값입니다. 0을 포함할 수 있고 단어들이 한곳에 모일 필요도 없습니다.'),
  question('embedding-update-v2', '다음 단어 예측이 학습 자료와 다릅니다. 임베딩도 함께 학습하는 모델에서 할 일은?', ['정답 단어를 예측 단어로 바꾼다.', '벡터의 0을 지우며 길이를 줄인다.', '자료와의 오차를 이용해 모델과 벡터의 값을 조정하고 다시 예측한다.'], '자료와의 오차를 이용해 모델과 벡터의 값을 조정하고 다시 예측한다.', '비교 기준인 학습 자료는 그대로 두고, 예측에 사용한 숫자를 살펴보세요.', '정해 둔 칸 수는 유지하며 숫자를 조정합니다. 많은 문장에서 반복해야 쓰임이 반영됩니다.'),
  question('embedding-context-v2', '여러 문장에서 “의사에게 진료를 받았다”, “의사에게 치료를 받았다”처럼 비슷한 쓰임이 나타납니다. 진료와 치료의 벡터가 비슷해질 수 있는 이유는?', ['비슷한 주변 표현을 예측하는 데 비슷한 숫자 표현이 도움이 될 수 있어서', '두 단어의 뜻을 사람이 좌표축에 먼저 지정해서', '밀집 표현에서는 모든 단어가 같은 점으로 모여서'], '비슷한 주변 표현을 예측하는 데 비슷한 숫자 표현이 도움이 될 수 있어서', '의사에게 … 받았다라는 공통 문맥이 학습의 예측 과제에 주는 단서를 생각하세요.', '유사성은 여러 문장의 쓰임을 학습한 결과로 나타날 수 있습니다. 자료와 학습 목적이 달라지면 관계도 달라질 수 있습니다.'),
  question('service-input', '직접 쓴 “근처 맛집 추천해 줘.”를 받았다면, 건너뛸 수 있는 처리는?', ['언어 이해', '음성 인식', '답변 생성'], '음성 인식', '소리인지 이미 적힌 글인지 살펴보세요.', '이미 텍스트이므로 말소리를 글자로 바꾸는 음성 인식은 필요하지 않습니다.'),
  question('service-work', '요청 파악과 답변 작성은 각각 어떤 역할일까요?', ['둘 다 소리를 텍스트로 바꾸기', '요청 파악은 생성, 답변 작성은 이해', '요청 파악은 이해, 답변 작성은 생성'], '요청 파악은 이해, 답변 작성은 생성', '상대가 원하는 것을 알아내는 일과 새로운 문장을 쓰는 일을 구별하세요.', '한 서비스 안에서 언어 이해와 언어 생성이 함께 쓰입니다.'),
  number('index-forward', '“별처럼”의 인덱스를 입력하세요.', index.get('별처럼')!, '목록의 첫 단어는 0부터 시작합니다.', '인덱스 2는 세 번째 단어를 구별하는 번호입니다.'),
  question('index-backward', '인덱스 5로 다시 찾을 단어는?', [...WORDS], '해', '인덱스와 번째 칸은 1만큼 다릅니다.', '0부터 시작하므로 인덱스 5는 여섯 번째 단어인 해입니다.'),
  question('index-repeat', '같은 문장에 “좋은”이 또 나오면 목록과 번호는?', ['새 번호를 주어 더 중요한 단어로 만든다.', '같은 단어의 기존 번호 0을 다시 사용한다.'], '같은 단어의 기존 번호 0을 다시 사용한다.', '번호는 등장 횟수나 중요도가 아니라 식별에 사용합니다.', '중복 단어는 목록에 한 번 등록합니다. 큰 번호가 더 중요한 뜻은 아닙니다.'),
  { id: 'onehot-build', prompt: '“삶을”의 원-핫 벡터를 완성하세요. 0과 1을 공백으로 구분하세요.', validate: (value: string) => validateOneHotVector(parseVector(value), index.size, index.get('삶을')).valid, hint: (value: string) => validateOneHotVector(parseVector(value), index.size, index.get('삶을')).reason, explanation: '목록 길이만큼 칸을 만들고, 선택 단어의 인덱스에만 1을 넣습니다. 이 1은 정답 확률이나 중요도가 아닙니다.', placeholder: '여섯 값을 순서대로 입력' },
  question('onehot-error', '길이 6인 [0, 1, 0, 1, 0, 0]으로 한 단어를 나타내려 합니다. 무엇을 고쳐야 할까요?', ['길이만 늘린다.', '1을 모두 더 큰 수로 바꾼다.', '선택 단어 위치에만 1을 남긴다.'], '선택 단어 위치에만 1을 남긴다.', '한 단어를 고른다는 뜻과 1의 개수를 비교하세요.', '1이 두 개면 한 단어의 원-핫 규칙에 맞지 않습니다.'),
  question('embedding-need', '친구와 우정의 의미가 가깝다는 관계를 모델 입력에 담고 싶습니다. 어떤 설명이 맞을까요?', ['인덱스 차이가 작으면 뜻도 반드시 비슷합니다.', '학습으로 조정되는 임베딩 벡터에 관계를 반영할 수 있습니다.', '원-핫의 1을 2로 바꾸면 관계가 학습됩니다.'], '학습으로 조정되는 임베딩 벡터에 관계를 반영할 수 있습니다.', '단순한 구별 번호와 학습으로 달라지는 여러 숫자를 구분하세요.', '임베딩 값은 학습 자료에서 조정되며 신경망 입력으로 사용됩니다. 관계는 자료에 따라 달라질 수 있습니다.'),
  question('embedding-limit', '그림에서 친구와 우정이 가깝습니다. 여기서 알 수 있는 범위는?', ['교육용 예시의 관계이며, 두 단어가 언제나 같은 뜻이라는 보장은 없습니다.', '실제 모델이 모든 문장에서 두 단어를 같은 뜻으로 판정했습니다.', '두 좌표가 다음 단어의 확률입니다.'], '교육용 예시의 관계이며, 두 단어가 언제나 같은 뜻이라는 보장은 없습니다.', '이 좌표는 실제 모델의 출력이 아니라 설명용 가정입니다.', '2차원 그림은 관계를 설명하는 데 쓰는 예시입니다. 확률·중요도를 나타내는 두 숫자가 아닙니다.'),
  number('article-count', '독립 기사 자료에서 “요리”의 등장 횟수는?', articleCounts['요리'], '띄어쓰기 단위에서 요리와 정확히 같은 단어만 세세요.', '빈도는 문서 안에서 해당 단어가 등장한 횟수입니다.'),
  number('article-ratio', '전체 단어 중 “요리”의 비율을 백분율로 입력하세요. 단위: %', frequencyRatio(articleCounts['요리'], articleTokens.length) * 100, '분자는 요리 횟수, 분모는 전체 토큰 수입니다. 나눈 뒤 100을 곱하세요.', '이 비율은 단어가 차지하는 몫입니다. 음식 기사일 확률이나 모델 정확도가 아닙니다.', 0.05),
  question('article-topic', '어떤 주제로 분류할 수 있고, 그 근거는 무엇인가요?', ['스포츠 · 음식 관련 단어가 많아서', '음식·요리 · 요리, 음식, 맛이 등장해서', '음식·요리 · 문장의 순서를 모두 이해했으므로'], '음식·요리 · 요리, 음식, 맛이 등장해서', '주제와 그 주제를 뒷받침하는 단어를 함께 고르세요.', '관련 단어의 빈도로 간단한 주제를 추정할 수 있지만, 순서나 부정까지 이해한 것은 아닙니다.'),
  question('context-pear', '“배를 먹었다”와 “배를 탔다”에서 배의 뜻을 가르는 단서는?', ['배의 등장 횟수', '단어 목록에서 배의 번호', '먹었다와 탔다라는 주변 표현'], '먹었다와 탔다라는 주변 표현', '두 문장에서 바뀐 행동을 살펴보세요.', '먹었다는 과일, 탔다는 교통수단 해석의 단서입니다. 눈도 눈이 온다/눈이 아프다에서 뜻이 달라집니다.'),
  question('context-analysis', '“영수는 서울에 갔다”에서 누가 어디로 갔는지와 사람·장소를 찾으려면?', ['단어 사이 역할과 이름이 가리키는 대상을 살핀다.', '글자 수만 센다.', '가장 큰 인덱스를 주체로 정한다.'], '단어 사이 역할과 이름이 가리키는 대상을 살핀다.', '문장의 역할 관계와 사람·장소 구분을 함께 생각하세요.', '구문 분석은 역할 관계, 의미·개체명 분석은 뜻과 사람·장소 같은 대상을 살핍니다.'),
  question('context-negation', '“좋다”와 “좋지 않다”를 구별하려면?', ['좋다는 표현이 있는지만 센다.', '않다라는 부정 표현과 앞말의 관계를 함께 본다.'], '않다라는 부정 표현과 앞말의 관계를 함께 본다.', '않다가 전체 평가를 어떻게 바꾸는지 보세요.', '같은 핵심 단어가 있어도 부정·순서·문맥에 따라 해석이 달라집니다.'),
  number('apply-index', '새 글의 중복 없는 단어 목록에서 “선수는”의 인덱스는?', applicationIndex.get('선수는')!, '앞에서부터 등록하되 같은 단어는 한 번만 등록합니다.', '식별 번호는 0부터 시작합니다. 숫자로 바꿨다는 사실만으로 문장의 뜻을 이해한 것은 아닙니다.'),
  number('apply-count', '새 글에서 “선수는”의 빈도는?', countWords(applicationText, ['선수는'])['선수는'], '같은 토큰이 다시 나오는 위치를 찾아보세요.', '반복 횟수는 주제 단서이지만 경기 결과를 직접 알려 주지는 않습니다.'),
  question('apply-meaning', '새 글에서 승리 여부를 판단할 근거와 결론은?', ['승리라는 말이 있으니 이겼습니다.', '못했다와 아쉽다고라는 문맥으로 보아 이기지 못했습니다.', '선수는이 반복되므로 결과는 항상 승리입니다.'], '못했다와 아쉽다고라는 문맥으로 보아 이기지 못했습니다.', '승리하지 뒤에 오는 표현과 마지막 평가를 함께 보세요.', '숫자 표현은 계산을 위한 준비이고, 부정과 문맥을 함께 활용해야 의미를 판단할 수 있습니다.'),
].map((task) => [task.id, task]))
export const lesson11Groups = [
  ['service-input', 'service-work'], ['index-forward', 'index-backward', 'index-repeat'], ['onehot-build', 'onehot-error'], ['embedding-lookup-v3', 'embedding-learning-v3', 'embedding-relation-v3'], ['article-count', 'article-ratio', 'article-topic'], ['context-pear', 'context-analysis', 'context-negation'], ['apply-index', 'apply-count', 'apply-meaning'],
]
