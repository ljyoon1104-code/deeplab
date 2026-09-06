export function createWordIndex(words: readonly string[]) {
  return new Map(words.map((word, index) => [word, index]))
}

export function createOneHot(words: readonly string[], selectedWord: string) {
  const index = words.indexOf(selectedWord)
  if (index < 0) throw new Error(`단어 목록에 없는 단어입니다: ${selectedWord}`)
  return words.map((_, position) => position === index ? 1 : 0)
}

export function countWords(text: string, vocabulary: readonly string[]) {
  const tokens = text.split(/\s+/).filter(Boolean)
  return Object.fromEntries(vocabulary.map((word) => [word, tokens.filter((token) => token === word).length]))
}

