import { relu, sigmoid, softmax } from '../lesson03/activationMath'
import { binaryCrossEntropy, categoricalCrossEntropy, mse } from '../lesson05/lossMath'

export type Pair = 'linear' | 'binary' | 'multi'
export interface Network {
  kind: Pair; x: number[]; y: number[]; eta: number
  w: number[][]; b: number[]; v: number[][]; bo: number[]
}
export const names: Record<Pair, string> = { linear: '선형 출력 + MSE', binary: '시그모이드 + BCE', multi: '소프트맥스 + CCE' }
export const pairs: Pair[] = ['linear', 'binary', 'multi']
export const examples: Record<Pair, Network> = {
  // ANN p.7의 h=2를 만드는 은닉층 x=2,w=1,b=0을 보완했습니다.
  linear: { kind: 'linear', x: [2], y: [2], eta: .05, w: [[1]], b: [0], v: [[.6]], bo: [.1] },
  // ANN pp.17–21 및 앱 역전파 pp.3–5의 공통 예제 그대로입니다.
  binary: { kind: 'binary', x: [1, 2], y: [1], eta: .1, w: [[1, 0], [-1, 0]], b: [0, 0], v: [[1, 1]], bo: [-1] },
  // ANN p.3의 은닉층과 p.5의 점수 [2,1,0]를 연결하도록 출력층을 보완했습니다.
  multi: { kind: 'multi', x: [1, 2], y: [1, 0, 0], eta: .1, w: [[1, 0], [0, 1]], b: [0, 0], v: [[1, .5], [0, .5], [0, 0]], bo: [0, 0, 0] },
}
export const sum = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0)
export const mean = (xs: readonly number[]) => sum(xs) / xs.length
// Display only: retain nonzero values even below the ordinary decimal precision.
// forward/backward/update continue using the original numbers, never this string.
export const fmt = (n: number) => n === 0 ? '0' : Math.abs(n) < .0001 ? n.toExponential(3) : String(Number(n.toFixed(6)))
export function forward(n: Network) {
  const a = n.w.map((row, j) => sum(row.map((w, i) => w * n.x[i])) + n.b[j])
  const h = a.map(relu)
  const z = n.v.map((row, k) => sum(row.map((v, j) => v * h[j])) + n.bo[k])
  const p = n.kind === 'linear' ? [...z] : n.kind === 'binary' ? z.map(sigmoid) : softmax(z)
  const loss = n.kind === 'linear' ? mse(n.y, p) : n.kind === 'binary' ? binaryCrossEntropy(n.y[0] as 0 | 1, p[0]) : categoricalCrossEntropy(n.y, p)
  return { a, h, z, p, loss }
}
export function backward(n: Network) {
  const f = forward(n)
  const dz = f.p.map((p, k) => (n.kind === 'linear' ? 2 : 1) * (p - n.y[k]))
  const dv = n.v.map((row, k) => row.map((_, j) => dz[k] * f.h[j]))
  const incoming = f.h.map((_, j) => dz.map((d, k) => d * n.v[k][j]))
  const da = f.a.map((a, j) => sum(incoming[j]) * (a > 0 ? 1 : 0))
  const dw = n.w.map((row, j) => row.map((_, i) => da[j] * n.x[i]))
  return { dz, dv, dbo: [...dz], incoming, da, dw, db: [...da] }
}
export function update(n: Network, g = backward(n), hidden = true): Network {
  // 같은 수정 전 값으로 계산한 모든 기울기를 반올림 없이 함께 적용합니다.
  return { ...n,
    w: n.w.map((row, j) => row.map((w, i) => hidden ? w - n.eta * g.dw[j][i] : w)),
    b: n.b.map((b, j) => hidden ? b - n.eta * g.db[j] : b),
    v: n.v.map((row, k) => row.map((v, j) => v - n.eta * g.dv[k][j])),
    bo: n.bo.map((b, k) => b - n.eta * g.dbo[k]),
  }
}
export function parameters(n: Network) {
  return [
    ...n.w.flatMap((row, j) => row.map((value, i) => ({ label: `w${j + 1}${i + 1}`, value }))),
    ...n.b.map((value, j) => ({ label: `b${j + 1}`, value })),
    ...n.v.flatMap((row, k) => row.map((value, j) => ({ label: n.v.length === 1 ? `v${j + 1}` : `v${k + 1}${j + 1}`, value }))),
    ...n.bo.map((value, k) => ({ label: n.bo.length === 1 ? 'bo' : `bo${k + 1}`, value })),
  ]
}
export const sourceNotes: Record<Pair, string> = {
  linear: 'ANN 자료 7쪽: h=2, v=0.6, bₒ=0.1, y=2, η=0.05. 통합 계산을 위해 x=2, w=1, b=0인 ReLU 은닉층을 보완했습니다. 출력층만 수정하는 원문 계산과 구분합니다.',
  binary: 'ANN 자료 17~21쪽 / 역전파 숫자 예제 3~5쪽의 입력·초기값·계산 순서를 그대로 사용합니다.',
  multi: 'ANN 자료 3쪽의 은닉층에서 h=[1,2]를 구하고, 5쪽의 z=[2,1,0]가 나오도록 아래 출력층 초기값을 보완했습니다. 학습률 0.1과 정답 고양이를 사용합니다. 확률 [0.7,0.2,0.1]은 별도 비교 예제입니다.',
}
