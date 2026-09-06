import type { CandidateFrequency } from './lesson12Data'

export interface CandidateProbability extends CandidateFrequency { probability: number }

export function frequenciesToProbabilities(candidates: readonly CandidateFrequency[]): CandidateProbability[] {
  if (candidates.length === 0) throw new Error('후보 단어가 하나 이상 필요합니다.')
  for (const candidate of candidates) {
    if (!Number.isFinite(candidate.count) || candidate.count < 0) throw new Error(`빈도는 0 이상의 유한한 수여야 합니다: ${candidate.word}`)
  }
  const total = candidates.reduce((sum, candidate) => sum + candidate.count, 0)
  if (!Number.isFinite(total) || total <= 0) throw new Error('후보 빈도의 합은 0보다 커야 합니다.')
  const result = candidates.map((candidate) => ({ ...candidate, probability: candidate.count / total }))
  const probabilitySum = result.reduce((sum, candidate) => sum + candidate.probability, 0)
  if (Math.abs(probabilitySum - 1) > 1e-12) throw new Error('계산된 후보 확률의 합이 1이 아닙니다.')
  return result
}

export function formatProbability(probability: number) {
  return `${(probability * 100).toFixed(1)}%`
}

