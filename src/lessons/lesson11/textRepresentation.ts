/** 띄어쓰기 기준의 교육용 토큰화. 화면의 예문·계산·채점이 모두 이 결과를 사용한다. */
export function tokenizeText(text: string) {
  return text.trim().split(/\s+/).filter(Boolean)
}

export function createWordIndex(words: readonly string[]) {
  const uniqueWords = [...new Set(words)]
  return new Map(uniqueWords.map((word, index) => [word, index]))
}

export function createOneHot(words: readonly string[], selectedWord: string) {
  const index = createWordIndex(words).get(selectedWord) ?? -1
  if (index < 0) throw new Error(`단어 목록에 없는 단어입니다: ${selectedWord}`)
  return [...new Set(words)].map((_, position) => position === index ? 1 : 0)
}

export function countWords(text: string, vocabulary: readonly string[]) {
  const tokens = tokenizeText(text)
  return Object.fromEntries(vocabulary.map((word) => [word, tokens.filter((token) => token === word).length]))
}

export function frequencyRatio(count: number, totalTokens: number) {
  if (!Number.isFinite(count) || !Number.isFinite(totalTokens) || totalTokens <= 0) return 0
  return count / totalTokens
}

export function validateOneHotVector(vector: readonly number[], vocabularySize: number, expectedIndex?: number) {
  if (vector.length !== vocabularySize) return { valid: false, reason: '벡터 길이가 단어 목록 크기와 다릅니다.' }
  if (vector.some((value) => !Number.isInteger(value) || (value !== 0 && value !== 1))) return { valid: false, reason: '원-핫 벡터의 값은 0 또는 1이어야 합니다.' }
  const onePositions = vector.flatMap((value, index) => value === 1 ? [index] : [])
  if (onePositions.length !== 1) return { valid: false, reason: '값 1은 정확히 하나여야 합니다.' }
  if (expectedIndex !== undefined && onePositions[0] !== expectedIndex) return { valid: false, reason: '값 1의 위치가 선택한 단어의 인덱스와 다릅니다.' }
  return { valid: true, reason: '길이와 1의 위치가 올바른 원-핫 벡터입니다.' }
}
