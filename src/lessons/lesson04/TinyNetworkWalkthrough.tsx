import { useId, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import type { forwardTinyNetwork, TinyNetworkConfig } from './networkMath'

const scenes = [
  { title: '① H1에 들어오는 입력', detail: '입력층의 x1·x2가 H1에 전달됩니다. 연결 ①·②의 가중치를 각각 곱합니다.' },
  { title: '② H1의 가중합', detail: '연결 ①·②에서 구한 두 곱을 더하고 H1의 편향을 더합니다. 아래 z는 아직 활성화 함수를 거치지 않은 중간 계산값입니다.' },
  { title: '③ H1의 렐루 출력', detail: '가중합이 음수이면 0, 0 이상이면 그대로 보내는 렐루를 적용합니다. 이 중간 출력은 정답 번호나 확률이 아닙니다.' },
  { title: '④ 다음 층의 입력', detail: 'H1의 출력 a1이 연결 ⑤를 따라 출력층에 전달됩니다. 앞 뉴런의 출력이 다음 뉴런의 입력이 됩니다.' },
  { title: '⑤ H2에도 같은 원리 적용', detail: 'H2도 같은 입력을 받지만 연결 ③·④의 가중치와 자신의 편향으로 다르게 조합합니다. 서로 다른 중간 반응을 얻을 수 있도록 한 구조입니다.' },
  { title: '⑥ 출력층에서 종합', detail: 'a1·a2에 연결 ⑤·⑥의 가중치를 곱해 더하고 출력층 편향을 더합니다. 중간 반응들을 다시 조합한 가중합에 활성화 함수를 적용하세요.' },
] as const

// Only explanation navigation lives here. Answers and completion remain in the exercise.
export function TinyNetworkWalkthrough({ config, result, guided, revealAnswers }: {
  config: TinyNetworkConfig
  result: ReturnType<typeof forwardTinyNetwork>
  guided: boolean
  revealAnswers: boolean
}) {
  const [scene, setScene] = useState(0)
  const titleId = useId()
  const edges = [
    { n: '①', from: 'x1', to: 'H1', weight: config.hiddenWeights[0][0], path: 'M 65 89 L 50 170 L 50 252', tx: 50, ty: 186, active: scene < 3 },
    { n: '②', from: 'x2', to: 'H1', weight: config.hiddenWeights[0][1], path: 'M 215 89 L 80 170 L 80 252', tx: 108, ty: 153, active: scene < 3 },
    { n: '③', from: 'x1', to: 'H2', weight: config.hiddenWeights[1][0], path: 'M 65 89 L 200 170 L 200 252', tx: 172, ty: 153, active: scene === 4 },
    { n: '④', from: 'x2', to: 'H2', weight: config.hiddenWeights[1][1], path: 'M 215 89 L 230 170 L 230 252', tx: 230, ty: 186, active: scene === 4 },
    { n: '⑤', from: 'a1', to: '출력', weight: config.outputWeights[0], path: 'M 65 293 L 80 340 L 80 468 L 116 468', tx: 80, ty: 356, active: scene === 3 || scene === 5 },
    { n: '⑥', from: 'a2', to: '출력', weight: config.outputWeights[1], path: 'M 215 293 L 200 340 L 200 468 L 164 468', tx: 200, ty: 356, active: scene === 5 },
  ]
  const transition = 'transition-colors duration-150 motion-reduce:transition-none'
  const hiddenValue = (index: 0 | 1, field: 'z' | 'output') =>
    revealAnswers || (guided && index === 0) ? String(result.hidden[index][field]) : '?'
  const outputValue = revealAnswers || config.outputActivation === 'sigmoid'
    ? result.output.toFixed(config.outputActivation === 'sigmoid' ? 2 : 0)
    : '?'

  return (
    <section className="mt-5 min-w-0 rounded-2xl border border-indigo-200 bg-white p-4 sm:p-5" aria-label={guided ? '안내 신경망 계산 그림' : '독립 신경망 계산 그림'}>
      <h4 className="text-lg font-black">같은 번호의 선과 계산을 연결하세요</h4>
      <p className="mt-2 leading-7">같은 입력에서 출발해도 연결별 가중치와 뉴런별 편향은 다를 수 있습니다. 선의 번호와 곱셈을 맞춰 보고, 각 뉴런에서 편향을 더하는 위치를 찾으세요.</p>
      <p className="mt-2 text-sm leading-6 text-indigo-800">{guided ? 'H1은 완성 풀이입니다. H2와 출력층의 답은 전체 계산을 정답으로 제출하기 전까지 ?로 표시합니다.' : '독립 풀이입니다. 중간값은 전체 계산을 정답으로 제출하기 전까지 ?로 표시합니다. 시그모이드 최종 출력만 기존 활동처럼 제공합니다.'}</p>
      <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <svg viewBox="0 0 280 552" className="mx-auto block h-auto w-full max-w-80 self-start" role="img" aria-labelledby={titleId}>
          <title id={titleId}>입력 x1·x2에서 은닉 뉴런 H1·H2로 각각 연결되고, 두 은닉 출력 a1·a2가 출력 뉴런에 연결되는 2–2–1 신경망. 가중치와 계산값은 옆의 같은 번호 설명에서 확인합니다.</title>
          <rect x="5" y="5" width="270" height="100" rx="12" fill="#ecfeff" stroke="#0e7490" />
          <text x="140" y="28" textAnchor="middle" fontSize="16" fontWeight="bold">입력층 · 데이터 전달</text>
          <rect x="5" y="200" width="270" height="108" rx="12" fill="#eef2ff" stroke="#4338ca" />
          <text x="140" y="224" textAnchor="middle" fontSize="16" fontWeight="bold">은닉층 · 렐루</text>
          <rect x="5" y="400" width="270" height="147" rx="12" fill="#ecfdf5" stroke="#047857" />
          <text x="140" y="424" textAnchor="middle" fontSize="16" fontWeight="bold">출력층</text>
          {edges.map((edge) => <g key={edge.n}>
            <path d={edge.path} fill="none" stroke={guided && edge.active ? '#4338ca' : '#64748b'} strokeWidth={guided && edge.active ? 4 : 1.5} strokeLinejoin="round" className={transition} />
            <circle cx={edge.tx} cy={edge.ty} r="11" fill="white" stroke={guided && edge.active ? '#4338ca' : '#64748b'} />
            <text x={edge.tx} y={edge.ty + 5} textAnchor="middle" fontSize="16">{edge.n}</text>
          </g>)}
          {[65,215].map((x, index) => <g key={x}>
            <circle cx={x} cy="70" r="19" fill="white" stroke="#0e7490" strokeWidth="2" /><text x={x} y="75" textAnchor="middle" fontSize="15">x{index + 1}</text>
            <circle cx={x} cy="270" r="23" fill="white" stroke="#4338ca" strokeWidth="2" /><text x={x} y="275" textAnchor="middle" fontSize="15">H{index + 1}</text>
          </g>)}
          <circle cx="140" cy="468" r="24" fill="white" stroke="#047857" strokeWidth="2" /><text x="140" y="474" textAnchor="middle" fontSize="14">출력</text>
          <text x="140" y="526" textAnchor="middle" fontSize="16">{config.outputActivation === 'step' ? '계단 함수' : '시그모이드 함수'}</text>
        </svg>
        <div className="min-w-0">
          <p className={'rounded-xl border-2 bg-cyan-50 p-3 font-bold ' + transition + (guided && scene === 0 ? ' border-indigo-600' : ' border-transparent')}>입력: x1 = {config.inputs[0]}, x2 = {config.inputs[1]}</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2" aria-label="여섯 연결의 가중치">
            {edges.map((edge) => <li key={edge.n} className={'rounded-lg border-2 p-2 text-sm leading-6 ' + transition + (guided && edge.active ? ' border-indigo-600 bg-indigo-50' : ' border-slate-200')}>
              <strong>{edge.n} {edge.from} → {edge.to}</strong><br />가중치 {edge.weight}
            </li>)}
          </ul>
          <div className="mt-3 grid gap-3">
            {([0,1] as const).map((index) => <div key={index} className="rounded-xl border border-indigo-200 p-3 leading-7">
              <p className="font-black">H{index + 1} · 편향 {config.hiddenBiases[index]}</p>
              <p className={'break-words rounded border-2 p-1 ' + transition + (guided && ((index === 0 && scene === 1) || (index === 1 && scene === 4)) ? ' border-indigo-600 bg-indigo-50' : ' border-transparent')}>가중합: {config.inputs[0]} × ({config.hiddenWeights[index][0]}) + {config.inputs[1]} × ({config.hiddenWeights[index][1]}) + ({config.hiddenBiases[index]}) = <strong>{hiddenValue(index, 'z')}</strong></p>
              <p className={'rounded border-2 p-1 ' + transition + (guided && index === 0 && (scene === 2 || scene === 3) ? ' border-indigo-600 bg-indigo-50' : ' border-transparent')}>렐루 출력 a{index + 1} = <strong>{hiddenValue(index, 'output')}</strong> → 다음 층의 입력</p>
            </div>)}
            <div className={'rounded-xl border-2 p-3 leading-7 ' + transition + (guided && scene === 5 ? ' border-indigo-600 bg-indigo-50' : ' border-emerald-200')}>
              <p className="font-black">출력층 · 편향 {config.outputBias}</p>
              <p className="break-words">가중합: a1 × ({config.outputWeights[0]}) + a2 × ({config.outputWeights[1]}) + ({config.outputBias}) = <strong>{revealAnswers ? result.outputZ : '?'}</strong></p>
              <p>{config.outputActivation === 'step' ? '계단 함수' : '시그모이드'} 출력 = <strong>{outputValue}</strong></p>
            </div>
          </div>
        </div>
      </div>
      {guided && <>
        <p role="status" aria-live="polite" className="mt-4 min-h-24 rounded-xl bg-indigo-50 p-4 leading-7"><strong>{scenes[scene].title} · {scene + 1}/6</strong><br />{scenes[scene].detail}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" disabled={scene === 0} onClick={() => setScene((value) => value - 1)} aria-label="신경망 풀이 이전">이전</Button>
          <Button disabled={scene === scenes.length - 1} onClick={() => setScene((value) => value + 1)} aria-label="신경망 풀이 다음">다음</Button>
          <Button variant="secondary" onClick={() => setScene(0)} aria-label="신경망 풀이 다시 보기"><RotateCcw size={16} aria-hidden="true" />다시 보기</Button>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">설명은 각 단계에서 멈춥니다. 이전·다시 보기는 입력한 답이나 완료 기록을 바꾸지 않습니다.</p>
      </>}
    </section>
  )
}
