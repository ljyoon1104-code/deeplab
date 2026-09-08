export const lesson01StepTitles = [
  '관찰 정보는 모두 특징일까',
  '학습 흐름을 완성해 보자',
  '좋은 특징을 고르는 기준',
  '기계학습과 딥러닝 비교하기',
  '비교 문장을 근거로 분류하기',
  '문제에 맞는 방법 선택하기',
  '미니 AI 프로젝트 설계하기',
]

export const lesson01Objectives = [
  '데이터, 관찰 가능한 특징, 정답 라벨의 역할을 구분할 수 있다.',
  '기계학습과 딥러닝이 이미지를 학습하는 흐름을 비교할 수 있다.',
  '문제의 조건을 근거로 규칙 기반 방법, 기계학습, 딥러닝을 판단할 수 있다.',
  '새로운 데이터로 평가하는 간단한 AI 프로젝트를 설계할 수 있다.',
]

export type ObservationRole = 'feature' | 'unstable' | 'label'

export const observationRoles: { id: ObservationRole; label: string; description: string }[] = [
  { id: 'feature', label: '이미지에서 관찰 가능한 특징', description: '사진 속 모양·색·무늬처럼 입력 이미지에서 읽을 수 있는 정보' },
  { id: 'unstable', label: '불안정하거나 사용하면 안 되는 정보', description: '촬영 조건에 따라 바뀌거나 정답을 미리 알려 주는 정보' },
  { id: 'label', label: '학습 목표인 정답 라벨', description: '학습할 때만 알려 주는 정답 이름' },
]

export const observationCards: { id: string; label: string; answer: ObservationRole; explanation: string }[] = [
  { id: 'ears', label: '귀 모양', answer: 'feature', explanation: '사진에서 관찰할 수 있는 형태 정보입니다.' },
  { id: 'face', label: '얼굴 윤곽', answer: 'feature', explanation: '사진의 모양에서 얻는 특징입니다.' },
  { id: 'muzzle', label: '주둥이 형태', answer: 'feature', explanation: '사진에서 관찰 가능한 형태 정보입니다.' },
  { id: 'fur', label: '털의 무늬', answer: 'feature', explanation: '사진에 보이는 정보이지만, 하나만으로 정답을 정할 수는 없습니다.' },
  { id: 'background', label: '촬영 배경', answer: 'unstable', explanation: '장소가 바뀌면 쉽게 달라져서 동물 자체의 특징이 아닙니다.' },
  { id: 'filename', label: '파일 이름에 포함된 cat', answer: 'unstable', explanation: '정답을 몰래 알려 주는 정보입니다. 새 사진에서는 없거나 틀릴 수 있습니다.' },
  { id: 'answer', label: '실제 정답 라벨', answer: 'label', explanation: '학습할 때 모델의 예측과 비교하는 정답입니다.' },
]

export type FlowStageId = 'data' | 'feature' | 'model' | 'result'

export const flowStages: { id: FlowStageId; label: string; example: string }[] = [
  { id: 'data', label: '데이터', example: '여러 고양이·강아지 이미지' },
  { id: 'feature', label: '특징', example: '이미지에서 분류에 도움이 되는 정보' },
  { id: 'model', label: '모델', example: '데이터의 패턴을 학습하는 계산 구조' },
  { id: 'result', label: '결과', example: '고양이 또는 강아지 예측' },
]

export type FeatureGroup = 'helpful' | 'conditional' | 'risky'

export const featureGroups: { id: FeatureGroup; label: string; description: string }[] = [
  { id: 'helpful', label: '비교적 도움이 되는 특징', description: '대상의 모양에서 얻으며 여러 사진에서도 비교적 일관된 정보' },
  { id: 'conditional', label: '상황에 따라 도움이 될 수 있는 특징', description: '보조 단서가 될 수 있지만 하나만으로 결론 내리기 어려운 정보' },
  { id: 'risky', label: '배경·촬영 조건에 의존해 위험한 특징', description: '대상보다 사진이 찍힌 상황을 배울 위험이 있는 정보' },
]

export const featureCards: { id: string; label: string; answer: FeatureGroup }[] = [
  { id: 'ear-shape', label: '귀의 전체 모양', answer: 'helpful' },
  { id: 'face-outline', label: '얼굴 윤곽', answer: 'helpful' },
  { id: 'muzzle-shape', label: '주둥이 형태', answer: 'helpful' },
  { id: 'fur-pattern', label: '털의 무늬', answer: 'conditional' },
  { id: 'tail-position', label: '꼬리의 순간적인 위치', answer: 'conditional' },
  { id: 'wall-color', label: '사진 뒤 벽의 색', answer: 'risky' },
  { id: 'camera-filter', label: '카메라 필터 색감', answer: 'risky' },
]

export const comparisonCategories = [
  { id: 'ml', label: '기계학습에 더 가까움' },
  { id: 'dl', label: '딥러닝에 더 가까움' },
  { id: 'both', label: '둘 다 해당' },
] as const

export type ComparisonCategory = (typeof comparisonCategories)[number]['id']

export const comparisonCards: { id: string; text: string; answer: ComparisonCategory; explanation: string }[] = [
  { id: 'human-features', text: '사람이 사용할 특징을 직접 정해 모델에 제공한다.', answer: 'ml', explanation: '전통적인 기계학습에서는 사람이 특징을 설계하는 비중이 큽니다.' },
  { id: 'layered-representations', text: '여러 층이 데이터에서 유용한 표현을 학습한다.', answer: 'dl', explanation: '딥러닝 신경망은 여러 층에서 표현을 학습합니다.' },
  { id: 'data-quality', text: '학습 데이터의 품질이 성능에 영향을 준다.', answer: 'both', explanation: '어떤 방법이든 데이터가 치우치거나 틀리면 성능이 나빠질 수 있습니다.' },
  { id: 'new-evaluation', text: '학습 후 새로운 데이터로 평가해야 한다.', answer: 'both', explanation: '학습에 쓰지 않은 데이터로 확인해야 실제 사용 가능성을 판단할 수 있습니다.' },
  { id: 'simple-problem', text: '데이터가 적거나 문제가 단순하면 복잡한 모델이 항상 유리하지는 않다.', answer: 'both', explanation: '방법은 데이터와 문제 조건에 맞춰 선택해야 합니다.' },
  { id: 'bad-data', text: '딥러닝도 잘못된 데이터에서는 잘못된 패턴을 배울 수 있다.', answer: 'both', explanation: '딥러닝도 데이터의 한계를 자동으로 해결하지는 못합니다.' },
]

export type MethodChoice = 'rule' | 'ml' | 'dl'

export const methodChoices: { id: MethodChoice; label: string }[] = [
  { id: 'rule', label: '규칙 기반 방법' },
  { id: 'ml', label: '일반적인 기계학습' },
  { id: 'dl', label: '딥러닝' },
]

export const decisionCriteria = ['데이터 종류', '데이터 양', '패턴 복잡성', '결과를 설명해야 하는 정도', '필요한 계산 자원']

export const methodCases: {
  id: string
  title: string
  description: string
  answer: MethodChoice
  reasons: { id: string; label: string }[]
  reasonAnswer: string
}[] = [
  {
    id: 'table',
    title: '사례 A · 소규모 표 데이터',
    description: '행과 열로 정리된 소규모 표 데이터로 단순한 결과를 예측한다.',
    answer: 'ml',
    reasons: [
      { id: 'table-pattern', label: '표 형태의 입력에서 비교적 단순한 패턴을 찾는 문제이기 때문이다.' },
      { id: 'image-depth', label: '이미지가 많으므로 여러 층의 신경망이 반드시 필요하기 때문이다.' },
      { id: 'fixed-rule', label: '예외가 전혀 없으므로 규칙만 쓰면 되기 때문이다.' },
    ],
    reasonAnswer: 'table-pattern',
  },
  {
    id: 'images',
    title: '사례 B · 많은 이미지',
    description: '많은 이미지에서 복잡한 시각 패턴을 분류한다.',
    answer: 'dl',
    reasons: [
      { id: 'visual-patterns', label: '이미지의 복잡한 모양을 여러 층에서 표현으로 학습하기에 적절하기 때문이다.' },
      { id: 'no-data', label: '데이터가 없을수록 딥러닝이 더 잘 작동하기 때문이다.' },
      { id: 'always-best', label: '딥러닝은 모든 문제에서 가장 정확하기 때문이다.' },
    ],
    reasonAnswer: 'visual-patterns',
  },
  {
    id: 'fixed',
    title: '사례 C · 거의 예외 없는 처리',
    description: '조건이 완전히 정해져 있고 예외가 거의 없는 단순 자동 처리를 만든다.',
    answer: 'rule',
    reasons: [
      { id: 'clear-rules', label: '명확한 조건을 그대로 규칙으로 표현할 수 있기 때문이다.' },
      { id: 'must-learn', label: 'AI는 항상 학습 데이터를 사용해야 하기 때문이다.' },
      { id: 'largest-model', label: '가장 큰 모델이 가장 설명하기 쉽기 때문이다.' },
    ],
    reasonAnswer: 'clear-rules',
  },
]

export const projectOptions = {
  data: [
    { id: 'diverse-images', label: '조명·배경·각도가 다양한 종이·플라스틱·캔 이미지', correct: true },
    { id: 'one-image', label: '교실 바닥에서 찍은 종이 사진 한 장', correct: false },
    { id: 'names-only', label: '파일 이름만 모은 목록', correct: false },
  ],
  label: [
    { id: 'material-labels', label: '종이 / 플라스틱 / 캔', correct: true },
    { id: 'file-labels', label: '사진 파일의 저장 날짜', correct: false },
    { id: 'background-labels', label: '촬영한 벽의 색', correct: false },
  ],
  avoid: [
    { id: 'answer-name', label: '파일 이름에 들어 있는 정답 이름', correct: true },
    { id: 'shape', label: '물체의 모양', correct: false },
    { id: 'material-color', label: '물체 표면의 색과 질감', correct: false },
  ],
  method: [
    { id: 'project-dl', label: '딥러닝: 이미지의 다양한 시각 특징을 여러 층에서 학습', correct: true },
    { id: 'project-rule', label: '규칙 기반: 모든 물체는 정해진 모양 하나만 가진다고 가정', correct: false },
    { id: 'project-ml', label: '일반 기계학습: 사람이 정한 한 가지 특징만 사용', correct: false },
  ],
  evaluation: [
    { id: 'new-images', label: '학습에 사용하지 않은 새로운 이미지로 정확도를 확인한다.', correct: true },
    { id: 'training-images', label: '학습에 사용한 이미지만 다시 예측해 확인한다.', correct: false },
    { id: 'teacher-answer', label: '교사가 결과를 좋다고 말하면 평가를 끝낸다.', correct: false },
  ],
}

export const projectLimitations = [
  { id: 'light', label: '조명이 달라질 수 있다.' },
  { id: 'occlusion', label: '물체 일부가 가려질 수 있다.' },
  { id: 'background', label: '학습 데이터에 특정 배경만 있을 수 있다.' },
  { id: 'imbalance', label: '클래스별 데이터 수가 크게 다를 수 있다.' },
]

export const lesson01Quiz = [
  {
    id: 'data-label',
    question: '분리수거 이미지 분류에서 “종이·플라스틱·캔”은 무엇인가요?',
    options: [
      { id: 'input', label: '입력 데이터', correct: false },
      { id: 'label', label: '정답 라벨', correct: true },
      { id: 'feature', label: '촬영 배경 특징', correct: false },
    ],
    explanation: '이미지의 종류를 나타내는 정답 이름은 라벨입니다.',
  },
  {
    id: 'feature-role',
    question: '특징의 역할로 가장 알맞은 것은 무엇인가요?',
    options: [
      { id: 'clue', label: '데이터에서 분류에 도움이 되는 단서를 나타낸다.', correct: true },
      { id: 'answer', label: '모든 사진의 정답을 미리 알려 준다.', correct: false },
      { id: 'replace', label: '새로운 데이터 평가를 대신한다.', correct: false },
    ],
    explanation: '특징은 예측에 도움이 되는 정보이지, 정답을 몰래 알려 주는 정보가 아닙니다.',
  },
  {
    id: 'unstable-feature',
    question: '동물 분류에서 불안정한 특징으로 가장 주의할 정보는 무엇인가요?',
    options: [
      { id: 'face', label: '얼굴 윤곽', correct: false },
      { id: 'background', label: '촬영 배경의 색', correct: true },
      { id: 'muzzle', label: '주둥이 형태', correct: false },
    ],
    explanation: '배경은 동물 자체가 아니라 촬영 상황에 따라 달라질 수 있습니다.',
  },
  {
    id: 'difference',
    question: '기계학습과 딥러닝의 차이를 가장 잘 설명한 것은 무엇인가요?',
    options: [
      { id: 'features', label: '기계학습은 사람이 특징 설계에 더 관여하고, 딥러닝은 여러 층에서 표현을 학습한다.', correct: true },
      { id: 'data', label: '딥러닝만 데이터가 필요하다.', correct: false },
      { id: 'evaluation', label: '기계학습만 새로운 데이터로 평가한다.', correct: false },
    ],
    explanation: '두 방법 모두 데이터와 평가가 필요하지만, 특징을 다루는 방식에 차이가 있습니다.',
  },
  {
    id: 'common',
    question: '두 방법의 공통점으로 옳은 것은 무엇인가요?',
    options: [
      { id: 'always', label: '항상 같은 성능을 낸다.', correct: false },
      { id: 'quality', label: '학습 데이터의 품질이 결과에 영향을 준다.', correct: true },
      { id: 'human-none', label: '사람이 어떤 준비도 할 필요가 없다.', correct: false },
    ],
    explanation: '기계학습과 딥러닝 모두 데이터의 품질과 구성에 영향을 받습니다.',
  },
  {
    id: 'evaluation',
    question: '학습에 사용하지 않은 새 이미지로 평가하는 이유는 무엇인가요?',
    options: [
      { id: 'generalize', label: '처음 보는 상황에서도 잘 작동할 가능성을 확인하기 위해서', correct: true },
      { id: 'hide', label: '학습 결과를 숨기기 위해서', correct: false },
      { id: 'label-change', label: '정답 라벨을 바꾸기 위해서', correct: false },
    ],
    explanation: '새 데이터 평가는 모델이 학습한 사진만 외운 것은 아닌지 확인하게 해 줍니다.',
  },
]
