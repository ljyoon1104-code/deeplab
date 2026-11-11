import type { MnistSample } from '../lesson07/mnistTypes'
import type { DrawingPrediction, TestPrediction, TrainingResult } from '../lesson08/lesson08Types'

export const LEGACY_COURSE_STORAGE_KEY = 'deep-learning-lab:mnist-integrated:20261112:v1'
export const COURSE_STORAGE_KEY = 'deep-learning-lab:mnist-integrated:20261112:v2'
// Experiment history belongs to the runtime, not to a particular question revision.
export const COURSE_EXPERIMENT_STORAGE_KEY = `${LEGACY_COURSE_STORAGE_KEY}:experiments`
const LEGACY_ANSWER_IDS = ['normalization', 'train-interpret', 'accuracy', 'error-evidence', 'error-hypothesis', 'drawing-comparison', 'final-explain'] as const
export const ANSWER_IDS = [...LEGACY_ANSWER_IDS, 'input-understanding-v2', 'train-interpret-v2', 'test-interpret-v2', 'final-explain-v2'] as const
export type AnswerId = (typeof ANSWER_IDS)[number]
export type CourseScene = 1 | 2 | 3 | 4 | 5 | 6 | 7
export interface CourseAnswer { value: string; submitted: boolean; evidenceKey?: string }
export interface NormalizationTarget { sampleId: string; index: number; value: number }
export interface CourseEvaluation {
  recordId: string
  sampleCount: number
  correct: number
  wrong: number
  accuracy: number
  representative: TestPrediction | null
}
export type CourseDrawing = DrawingPrediction & { recordId: string }
export interface CourseRecord {
  version: 2
  scene: CourseScene
  sampleId: string | null
  pixelIndex: number
  normalizationTarget: NormalizationTarget | null
  answers: Record<AnswerId, CourseAnswer>
  training: TrainingResult | null
  evaluation: CourseEvaluation | null
  drawings: CourseDrawing[]
  completedAt: string | null
  legacyCompletedAt: string | null
}
export interface CourseRequirement { id: string; label: string; ready: boolean }

const isObject = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const unit = (value: unknown): value is number => finite(value) && value >= 0 && value <= 1
const integer = (value: unknown, min: number, max: number): value is number => finite(value) && Number.isInteger(value) && value >= min && value <= max
const nonempty = (value: unknown): value is string => typeof value === 'string' && value.length > 0
const validPixels = (value: unknown): value is number[] => Array.isArray(value) && value.length === 784 && value.every((pixel) => integer(pixel, 0, 255))
const validProbabilities = (value: unknown): value is number[] => Array.isArray(value) && value.length === 10 && value.every(unit) && Math.abs(value.reduce((sum, item) => sum + item, 0) - 1) < 0.001

function validPrediction(value: unknown): value is TestPrediction {
  if (!isObject(value) || !isObject(value.sample)) return false
  const sample = value.sample
  if (!nonempty(sample.id) || !integer(sample.label, 0, 9) || !validPixels(sample.pixels)) return false
  const confidence = value.confidence
  return value.actualLabel === sample.label && integer(value.predictedLabel, 0, 9) && validProbabilities(value.probabilities) && unit(confidence) && Math.abs(confidence - value.probabilities[value.predictedLabel]) < 1e-6 && value.probabilities.every((p) => p <= confidence + 1e-6)
}

function validTraining(value: unknown): value is TrainingResult {
  if (!isObject(value) || !isObject(value.config) || !Array.isArray(value.history)) return false
  const config = value.config
  if (!nonempty(value.recordId) || !nonempty(config.datasetVersion) || !finite(config.datasetSize) || ![500, 1000, 2000, 5000].includes(config.datasetSize) || !finite(config.epochs) || ![1, 3, 5].includes(config.epochs) || typeof config.modelType !== 'string' || !['simple', 'textbook', 'wide'].includes(config.modelType) || config.batchSize !== 32) return false
  if (value.completedEpochs !== config.epochs || value.history.length !== config.epochs || !finite(value.durationMs) || value.durationMs < 0 || !nonempty(value.backend)) return false
  if (!value.history.every((metric, index) => isObject(metric) && metric.epoch === index + 1 && finite(metric.loss) && metric.loss >= 0 && unit(metric.accuracy))) return false
  const last = value.history.at(-1)
  return Boolean(last && value.finalLoss === last.loss && value.finalAccuracy === last.accuracy)
}

function validEvaluation(value: unknown, recordId?: string): value is CourseEvaluation {
  if (!recordId || !isObject(value) || value.recordId !== recordId || value.sampleCount !== 500 || !integer(value.correct, 0, 500) || value.wrong !== 500 - value.correct || !unit(value.accuracy)) return false
  if (Math.abs(value.accuracy - value.correct / 500) > 1e-9) return false
  if (!validPrediction(value.representative)) return false
  return value.wrong === 0 ? value.representative.actualLabel === value.representative.predictedLabel : value.representative.actualLabel !== value.representative.predictedLabel
}

function validDrawing(value: unknown, recordId?: string): value is CourseDrawing {
  if (!recordId || !isObject(value) || value.recordId !== recordId || value.inputCount !== 784 || !unit(value.inputMin) || !unit(value.inputMax) || value.inputMin > value.inputMax || !validPixels(value.previewPixels)) return false
  return integer(value.predictedLabel, 0, 9) && validProbabilities(value.probabilities) && unit(value.confidence) && Math.abs(value.confidence - value.probabilities[value.predictedLabel]) < 1e-6
}

function readLegacySample(): string | null {
  try { return localStorage.getItem('deep-learning-lab:lesson07:sample-id') } catch { return null }
}

export function newCourseRecord(): CourseRecord {
  return {
    version: 2, scene: 1, sampleId: readLegacySample(), pixelIndex: 0,
    normalizationTarget: null,
    answers: Object.fromEntries(ANSWER_IDS.map((id) => [id, { value: '', submitted: false }])) as Record<AnswerId, CourseAnswer>,
    training: null, evaluation: null, drawings: [], completedAt: null, legacyCompletedAt: null,
  }
}

export function validateCourseRecord(value: unknown): CourseRecord {
  const result = newCourseRecord()
  if (!isObject(value) || (value.version !== 1 && value.version !== 2)) return result
  const isLegacy = value.version === 1
  if (integer(value.scene, 1, 7)) result.scene = value.scene as CourseScene
  if (nonempty(value.sampleId)) result.sampleId = value.sampleId
  if (integer(value.pixelIndex, 0, 783)) result.pixelIndex = value.pixelIndex
  const target = value.normalizationTarget
  if (isObject(target) && nonempty(target.sampleId) && target.sampleId === result.sampleId && integer(target.index, 0, 783) && integer(target.value, 1, 254)) {
    result.normalizationTarget = { sampleId: target.sampleId, index: target.index, value: target.value }
  }
  if (isObject(value.answers)) {
    // Old calculations and unchanged observations remain available. New judgments
    // have different IDs and never inherit a previous question's correct state.
    for (const id of isLegacy ? LEGACY_ANSWER_IDS : ANSWER_IDS) {
      const answer = value.answers[id]
      if (isObject(answer) && typeof answer.value === 'string') {
        result.answers[id] = { value: answer.value.slice(0, 20000), submitted: answer.submitted === true, ...(typeof answer.evidenceKey === 'string' ? { evidenceKey: answer.evidenceKey.slice(0, 2000) } : {}) }
      }
    }
  }
  if (validTraining(value.training)) result.training = value.training
  if (validEvaluation(value.evaluation, result.training?.recordId)) result.evaluation = value.evaluation
  if (Array.isArray(value.drawings)) {
    result.drawings = value.drawings.filter((item) => validDrawing(item, result.training?.recordId)).reduce<CourseDrawing[]>((items, item) => appendDrawing(items, item), [])
  }
  if (typeof value.completedAt === 'string' && Number.isFinite(Date.parse(value.completedAt))) {
    if (isLegacy) result.legacyCompletedAt = value.completedAt
    else result.completedAt = value.completedAt
  }
  if (!isLegacy && typeof value.legacyCompletedAt === 'string' && Number.isFinite(Date.parse(value.legacyCompletedAt))) result.legacyCompletedAt = value.legacyCompletedAt
  return result
}

export function loadCourseRecord(restoreLegacy = true): CourseRecord {
  try {
    const stored = localStorage.getItem(COURSE_STORAGE_KEY)
    if (stored) return validateCourseRecord(JSON.parse(stored))
    // Read the former record without rewriting or removing it. A reset never
    // falls back to that record, even if a storage operation was unavailable.
    const previous = restoreLegacy ? localStorage.getItem(LEGACY_COURSE_STORAGE_KEY) : null
    return previous ? validateCourseRecord(JSON.parse(previous)) : newCourseRecord()
  } catch { return newCourseRecord() }
}

export function saveCourseRecord(record: CourseRecord) {
  try { localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(record)) } catch { /* The current session remains usable when storage is unavailable. */ }
}

export function chooseNormalizationTarget(sample: MnistSample): NormalizationTarget | null {
  let index = -1
  sample.pixels.forEach((value, candidate) => {
    if (value > 0 && value < 255 && (index < 0 || Math.abs(value - 128) < Math.abs(sample.pixels[index] - 128))) index = candidate
  })
  return index < 0 ? null : { sampleId: sample.id, index, value: sample.pixels[index] }
}

export function sameDrawing(a: Pick<CourseDrawing, 'previewPixels'>, b: Pick<CourseDrawing, 'previewPixels'>) {
  return a.previewPixels.length === b.previewPixels.length && a.previewPixels.every((pixel, index) => pixel === b.previewPixels[index])
}

export function appendDrawing(drawings: CourseDrawing[], drawing: CourseDrawing) {
  return [...drawings.filter((item) => item.recordId === drawing.recordId && !sameDrawing(item, drawing)), drawing].slice(-2)
}

function pixelKey(pixels: number[]) {
  // Keys identify the captured input. Full arrays remain available for exact distinctness checks.
  let hash = 2166136261
  for (const pixel of pixels) hash = Math.imul(hash ^ pixel, 16777619)
  return (hash >>> 0).toString(36)
}

export function evidenceKey(record: CourseRecord, id: AnswerId): string | undefined {
  const trainId = record.training?.recordId
  const target = record.normalizationTarget
  const evaluation = record.evaluation
  const evaluated = trainId && evaluation && evaluation.recordId === trainId ? evaluation : null
  const norm = target ? `${target.sampleId}:${target.index}:${target.value}` : undefined
  const evalKey = evaluated ? `${trainId}:${evaluated.correct}/${evaluated.sampleCount}` : undefined
  const sample = evaluated?.representative
  const errorKey = evalKey && sample ? `${evalKey}:${sample.sample.id}:${sample.actualLabel}:${sample.predictedLabel}` : undefined
  const drawingKey = record.drawings.length === 2 && record.drawings.every((item) => item.recordId === trainId) && !sameDrawing(record.drawings[0], record.drawings[1]) ? `${trainId}:${record.drawings.map((item) => `${pixelKey(item.previewPixels)}:${item.predictedLabel}`).join(':')}` : undefined
  const inputKey = record.sampleId ? `input:${record.sampleId}` : undefined
  if (id === 'normalization') return norm
  if (id === 'input-understanding-v2') return inputKey
  if (id === 'train-interpret' || id === 'train-interpret-v2') return trainId
  if (id === 'accuracy' || id === 'test-interpret-v2') return evalKey
  if (id === 'error-evidence' || id === 'error-hypothesis') return errorKey
  if (id === 'drawing-comparison') return drawingKey
  if (id === 'final-explain-v2') return inputKey && errorKey && drawingKey ? `${inputKey}|${errorKey}|${drawingKey}` : undefined
  return norm && errorKey && drawingKey ? `${norm}|${errorKey}|${drawingKey}` : undefined
}

function parseAnswer(value: string): Record<string, unknown> | null {
  try { const parsed: unknown = JSON.parse(value); return isObject(parsed) ? parsed : null } catch { return null }
}
function direction(first: number, last: number) { return Math.abs(last - first) <= 1e-9 ? 'same' : last < first ? 'down' : 'up' }
function reasonLength(value: unknown, length: number) { return typeof value === 'string' && value.trim().length >= length }

export function answerReady(record: CourseRecord, id: AnswerId): boolean {
  const answer = record.answers[id]
  const key = evidenceKey(record, id)
  if (!answer?.submitted || !key || answer.evidenceKey !== key || !answer.value.trim()) return false
  if (id === 'normalization') return Math.abs(Number(answer.value) - record.normalizationTarget!.value / 255) <= 0.002
  if (id === 'accuracy') return Math.abs(Number(answer.value) - record.evaluation!.correct / record.evaluation!.sampleCount * 100) <= 0.02
  if (id === 'error-evidence') return answer.value === (record.evaluation!.wrong > 0 ? 'different' : 'all-correct')
  const parsed = parseAnswer(answer.value)
  if (!parsed) return false
  if (id === 'input-understanding-v2') return parsed.representation === 'same-image-order' && parsed.pair === 'same-sample' && parsed.scale === 'brightness-not-probability'
  if (id === 'train-interpret' || id === 'train-interpret-v2') {
    const history = record.training!.history
    const first = history[0]
    const last = history.at(-1)!
    return parsed.loss === direction(first.loss, last.loss) && parsed.accuracy === direction(first.accuracy, last.accuracy) && parsed.meaning === (id === 'train-interpret-v2' ? 'weights-biases' : 'train-not-test')
  }
  if (id === 'test-interpret-v2') {
    // Students compare the percentages actually displayed, not invisible
    // floating-point differences. The stored metrics retain full precision.
    const difference = Number((record.evaluation!.accuracy * 100).toFixed(2)) - Number((record.training!.finalAccuracy * 100).toFixed(2))
    const comparison = difference === 0 ? 'same' : difference < 0 ? 'lower' : 'higher'
    return parsed.role === 'held-out' && parsed.comparison === comparison && parsed.meaning === 'probability-not-accuracy'
  }
  if (id === 'error-hypothesis') return ['shape', 'coverage', 'uncertain'].includes(String(parsed.cause)) && parsed.certainty === 'hypothesis' && reasonLength(parsed.reason, 4)
  if (id === 'drawing-comparison') return parsed.change === (record.drawings[0].predictedLabel === record.drawings[1].predictedLabel ? 'same' : 'different') && parsed.meaning === 'input-not-guarantee' && reasonLength(parsed.reason, 4)
  // The structured judgment is graded. Text length only checks that an
  // explanation was submitted; its reasoning is for student/teacher review.
  return JSON.stringify(parsed.order) === JSON.stringify(['input', 'predict', 'loss', 'update', 'test']) && (id !== 'final-explain-v2' || parsed.transfer === 'loss-updates-not-test') && reasonLength(parsed.reason, 10)
}

export function courseRequirements(record: CourseRecord): CourseRequirement[] {
  return [
    { id: 'input-understanding-v2', label: '입력 준비의 변화와 이유 이해', ready: answerReady(record, 'input-understanding-v2') },
    { id: 'actual-training', label: '실제 모델 학습 완료', ready: Boolean(record.training) },
    { id: 'train-interpret-v2', label: '학습 지표 변화와 값 수정 이유 해석', ready: answerReady(record, 'train-interpret-v2') },
    { id: 'test-interpret-v2', label: 'Test 평가의 목적과 결과 해석', ready: answerReady(record, 'test-interpret-v2') },
    { id: 'error-analysis', label: 'Test 관찰과 원인 가설 구별', ready: answerReady(record, 'error-evidence') && answerReady(record, 'error-hypothesis') },
    { id: 'drawing-comparison', label: '다른 두 입력의 예측 비교', ready: answerReady(record, 'drawing-comparison') },
    { id: 'final-explain-v2', label: '입력부터 평가까지 연결 설명', ready: answerReady(record, 'final-explain-v2') },
  ]
}
