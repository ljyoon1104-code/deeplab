// A deterministic, deliberately small teaching model; no external model is run.
export const EMBEDDING_WORDS = ['나는', '친구와', '함께'] as const
export const OUTPUT_WORDS = ['걸었다', '놀았다'] as const
export const TARGET_INDEX = 1
export const LEARNING_RATE = 0.1
export interface EmbeddingModel {
  embedding: readonly (readonly number[])[]
  weights: readonly (readonly number[])[]
  bias: readonly number[]
}
export const INITIAL_MODEL: EmbeddingModel = {
  embedding: [[0.1, -0.2], [0.2, 0], [-0.1, 0.3]],
  weights: [[0.4, -0.3], [-0.2, 0.5]],
  bias: [0.1, -0.1],
}
export function predictEmbedding(model: EmbeddingModel) {
  const input = model.embedding[0].map((_, col) => model.embedding.reduce((sum, row) => sum + row[col], 0) / model.embedding.length)
  const scores = model.bias.map((bias, candidate) => bias + input.reduce((sum, value, col) => sum + value * model.weights[col][candidate], 0))
  const max = Math.max(...scores)
  const exp = scores.map((value) => Math.exp(value - max))
  const total = exp.reduce((sum, value) => sum + value, 0)
  const probabilities = exp.map((value) => value / total)
  return { input, scores, probabilities, loss: max + Math.log(total) - scores[TARGET_INDEX], prediction: scores.indexOf(max) }
}
export function updateEmbeddingModel(model: EmbeddingModel) {
  const before = predictEmbedding(model)
  const scoreGradient = before.probabilities.map((value, index) => value - Number(index === TARGET_INDEX))
  const inputGradient = model.weights.map((row) => row.reduce((sum, weight, candidate) => sum + weight * scoreGradient[candidate], 0))
  const gradients = {
    embedding: model.embedding.map((row) => row.map((_, col) => inputGradient[col] / model.embedding.length)),
    weights: model.weights.map((row, col) => row.map((_, candidate) => before.input[col] * scoreGradient[candidate])),
    bias: scoreGradient,
  }
  const updated: EmbeddingModel = {
    embedding: model.embedding.map((row, r) => row.map((value, c) => value - LEARNING_RATE * gradients.embedding[r][c])),
    weights: model.weights.map((row, r) => row.map((value, c) => value - LEARNING_RATE * gradients.weights[r][c])),
    bias: model.bias.map((value, i) => value - LEARNING_RATE * gradients.bias[i]),
  }
  return { before, updated, after: predictEmbedding(updated), gradients }
}
// Calculated once, not every time an explanation or word is selected.
export const EMBEDDING_DEMO = updateEmbeddingModel(INITIAL_MODEL)
