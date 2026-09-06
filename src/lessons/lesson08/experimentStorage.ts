import type { ExperimentRecord } from './lesson08Types'

const STORAGE_KEY = 'deep-learning-lab:lesson08:experiments:v1'
const MAX_RECORDS = 5

function isRecord(value: unknown): value is ExperimentRecord {
  if (!value || typeof value !== 'object') return false
  const record = value as Partial<ExperimentRecord>
  const finite = (item: unknown) => typeof item === 'number' && Number.isFinite(item)

  return (
    typeof record.id === 'string' &&
    typeof record.datasetVersion === 'string' &&
    [500, 1000, 2000, 5000].includes(Number(record.trainSampleCount)) &&
    ['simple', 'textbook', 'wide'].includes(String(record.modelType)) &&
    [1, 3, 5].includes(Number(record.epochs)) &&
    record.batchSize === 32 &&
    finite(record.finalTrainLoss) &&
    finite(record.finalTrainAccuracy) &&
    (record.testAccuracy === null || finite(record.testAccuracy)) &&
    (record.testCorrect === null || finite(record.testCorrect)) &&
    (record.testWrong === null || finite(record.testWrong)) &&
    finite(record.durationMs) &&
    typeof record.timestamp === 'string'
  )
}

export function loadExperimentRecords(): ExperimentRecord[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(isRecord).slice(0, MAX_RECORDS) : []
  } catch {
    return []
  }
}

export function saveExperimentRecord(record: ExperimentRecord): ExperimentRecord[] {
  const records = loadExperimentRecords().filter((item) => item.id !== record.id)
  const next = [record, ...records].slice(0, MAX_RECORDS)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // 저장소가 제한되어도 현재 세션의 실험 결과는 계속 사용할 수 있습니다.
  }
  return next
}
