import { examples, forward, pairs, update, type Pair } from './network'

export const repeatChoices = [
  '관찰한 두 시점의 손실은 줄었지만, 새 자료의 예측 능력은 별도로 평가해야 합니다.',
  '관찰한 두 시점의 손실은 같지만, 새 자료의 예측 능력은 별도로 평가해야 합니다.',
  '관찰한 두 시점의 손실은 늘었으며, 수정 조건과 새 자료의 예측 능력을 따로 살펴봐야 합니다.',
  '손실이 줄었으므로 처음 보는 모든 자료도 정확히 예측합니다.',
  '가중치·편향은 그대로 두고 손실 숫자만 작게 바꾼 결과입니다.',
]
export interface RepeatObservation { kind: Pair; steps: number; conclusion: string }
export function repeatResult(kind: Pair, steps: number) {
  let previous = examples[kind], current = previous
  for (let i = 0; i < steps; i += 1) {
    previous = current
    current = update(current)
  }
  return { before: forward(previous), after: forward(current) }
}
export function validateRepeatObservation(value: string) {
  try {
    const observation = JSON.parse(value) as RepeatObservation
    if (!pairs.includes(observation.kind) || !Number.isInteger(observation.steps) || observation.steps < 1 || observation.steps > 30) return false
    const result = repeatResult(observation.kind, observation.steps)
    const expected = result.after.loss < result.before.loss ? 0 : result.after.loss === result.before.loss ? 1 : 2
    return observation.conclusion === repeatChoices[expected]
  } catch {
    return false
  }
}
