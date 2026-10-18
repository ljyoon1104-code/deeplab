import { useId, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import type { PerceptronCalculation } from './perceptronMath'

export function NeuronIntroduction() {
  return (
    <section className="mt-8 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 sm:p-5" aria-label="뉴런에서 인공신경망까지">
      <h3 className="text-xl font-black">한 뉴런의 정보 처리를 계산으로 표현하면?</h3>
      <p className="mt-3 leading-7">생물학적 뉴런은 정보를 받아 다음 뉴런으로 전달합니다. 이를 계산으로 단순화한 인공 뉴런이 퍼셉트론이며, 여러 인공 뉴런을 연결하면 인공신경망(ANN)이 됩니다.</p>
      <p className="mt-4 leading-7"><strong>가중치</strong>는 입력의 영향 크기와 방향을 조절합니다. <strong>편향</strong>은 곱셈 결과의 합에 더해 판단 기준을 옮깁니다. 이처럼 학습으로 조정하는 숫자를 <strong>파라미터</strong>라고 합니다.</p>
      <figure className="mt-4 rounded-xl border border-indigo-200 bg-white p-4">
        <figcaption className="font-black">퍼셉트론의 입력에서 출력까지</figcaption>
        <svg viewBox="0 0 300 295" className="mx-auto mt-3 w-full max-w-sm" role="img" aria-label="입력 x1과 x2가 각 연결의 가중치 w1, w2와 곱해져 합산되고, 편향 b를 더한 가중합 z가 활성화 함수를 거쳐 출력이 됩니다.">
          <path d="M65 49 L65 80 L150 124 M235 49 L235 80 L150 124 M150 166 V194 M150 237 V265" fill="none" stroke="#6366f1" strokeWidth="2" />
          {[65,235].map((x,index) => <g key={x}><circle cx={x} cy="28" r="25" fill="#cffafe" stroke="#0e7490" strokeWidth="2" /><text x={x} y="33" textAnchor="middle" fontSize="15">입력 x{index + 1}</text><rect x={x - 54} y="67" width="108" height="28" rx="6" fill="#eef2ff" stroke="#4338ca" /><text x={x} y="86" textAnchor="middle" fontSize="14">× 가중치 w{index + 1}</text></g>)}
          <rect x="68" y="117" width="164" height="53" rx="10" fill="#e0e7ff" stroke="#4338ca" strokeWidth="2" />
          <text x="150" y="139" textAnchor="middle" fontSize="14">곱의 합 + 편향 b</text><text x="150" y="159" textAnchor="middle" fontSize="16" fontWeight="bold">가중합 z</text>
          <rect x="68" y="195" width="164" height="42" rx="10" fill="#cffafe" stroke="#0e7490" /><text x="150" y="222" textAnchor="middle" fontSize="16">활성화 함수</text>
          <rect x="90" y="264" width="120" height="28" rx="10" fill="#d1fae5" stroke="#047857" /><text x="150" y="284" textAnchor="middle" fontSize="16">출력</text>
        </svg>
        <dl className="mt-4 grid gap-3 text-sm leading-6 sm:grid-cols-2">
          <div><dt className="font-black">입력 x · 가중치 w</dt><dd>받은 정보인 입력에 가중치를 곱합니다.</dd></div>
          <div><dt className="font-black">편향 b · 가중합 z</dt><dd>곱한 값들을 합산하고 편향을 더한 결과가 z입니다.</dd></div>
          <div><dt className="font-black">활성화 함수</dt><dd>가중합을 받아 출력으로 바꾸는 규칙입니다.</dd></div>
          <div><dt className="font-black">출력</dt><dd>활성화 함수를 적용한 최종 결과입니다.</dd></div>
        </dl>
        <p className="mt-3 text-sm leading-6">아래 카드 번호는 학생이 배열한 계산 순서입니다. 직접 값을 조절하는 활동은 계산 원리 관찰이며 자동 학습은 아닙니다.</p>
      </figure>
    </section>
  )
}

const stages = [
  { title: '① 입력값', detail: '모델이 받은 두 입력을 확인합니다. 아직 가중치를 곱하지 않았습니다.' },
  { title: '② 가중치와 곱셈', detail: '같은 번호의 입력과 가중치를 곱합니다. 입력이 음수이면 가중치를 키워도 곱한 값은 작아질 수 있습니다. 입력의 부호도 함께 보세요.' },
  { title: '③ 곱의 합', detail: '두 곱셈 결과를 모두 더합니다. 편향을 더하기 전의 값입니다.' },
  { title: '④ 편향과 가중합', detail: '곱의 합에 편향을 더하면 가중합 z가 됩니다. 편향을 각 입력에 곱하지 않습니다.' },
  { title: '⑤ 활성화 함수와 출력', detail: '계단 함수는 z가 음수이면 0, 0 이상이면 1을 출력합니다. 이 0과 1은 기준에 따른 판단 결과이지 확률 0%와 100%가 아닙니다.' },
] as const

export function PerceptronWalkthrough({ result }: { result: PerceptronCalculation }) {
  const [scene, setScene] = useState(0)
  const titleId = useId()
  const paint = (step: number) => scene === step ? '#4338ca' : '#64748b'
  const fill = (step: number) => scene === step ? '#e0e7ff' : '#ffffff'
  const highlight = 'transition-colors duration-150 motion-reduce:transition-none'
  return (
    <section className="mt-5 rounded-2xl border border-indigo-200 bg-white p-4" aria-label="퍼셉트론 완성 풀이 그림">
      <h4 className="text-lg font-black">두 입력이 어떻게 출력 {result.output}이 되나요?</h4>
      <p className="mt-2 leading-7">원은 입력값, 선의 w는 가중치, b는 편향입니다. 아래 계산 이름을 누르면 그림의 같은 위치가 강조됩니다. 모든 중간값은 처음부터 비교할 수 있습니다.</p>
      <div className="mt-4 grid min-w-0 gap-4 md:grid-cols-2">
        <svg viewBox="0 0 300 430" className="mx-auto w-full max-w-80" role="img" aria-labelledby={titleId}>
          <title id={titleId}>{'입력 ' + result.inputs.join(', ') + '에 가중치 ' + result.weights.join(', ') + '를 곱해 합 ' + result.productSum + ', 편향 ' + result.bias + '를 더한 가중합 ' + result.z + ', 계단 함수 출력 ' + result.output}</title>
          <path d="M65 65 L65 105 L150 165 M235 65 L235 105 L150 165 M150 195 V245 M150 280 V320 M150 355 V390" fill="none" stroke="#94a3b8" strokeWidth="2" />
          {result.inputs.map((input, index) => <g key={index}>
            <circle cx={index === 0 ? 65 : 235} cy="40" r="25" fill={fill(0)} stroke={paint(0)} strokeWidth={scene === 0 ? 3 : 1.5} className={highlight} />
            <text x={index === 0 ? 65 : 235} y="46" textAnchor="middle" fontSize="16">x{index + 1} = {input}</text>
            <rect x={index === 0 ? 8 : 178} y="88" width="114" height="42" rx="8" fill={fill(1)} stroke={paint(1)} strokeWidth={scene === 1 ? 3 : 1} className={highlight} />
            <text x={index === 0 ? 65 : 235} y="105" textAnchor="middle" fontSize="14">w{index + 1} = {result.weights[index]}</text>
            <text x={index === 0 ? 65 : 235} y="122" textAnchor="middle" fontSize="14">x{index + 1} × w{index + 1} = {result.products[index]}</text>
          </g>)}
          <rect x="64" y="159" width="172" height="40" rx="10" fill={fill(2)} stroke={paint(2)} strokeWidth={scene === 2 ? 3 : 1} className={highlight} />
          <text x="150" y="185" textAnchor="middle" fontSize="16">③ 곱의 합 = {result.productSum}</text>
          <path d="M74 226 L108 250" stroke={paint(3)} strokeWidth="2" />
          <text x="14" y="222" fontSize="15">b = {result.bias}</text>
          <rect x="65" y="242" width="170" height="44" rx="10" fill={fill(3)} stroke={paint(3)} strokeWidth={scene === 3 ? 3 : 1} className={highlight} />
          <text x="150" y="270" textAnchor="middle" fontSize="17">④ 가중합 z = {result.z}</text>
          <rect x="50" y="316" width="200" height="46" rx="10" fill={fill(4)} stroke={paint(4)} strokeWidth={scene === 4 ? 3 : 1} className={highlight} />
          <text x="150" y="335" textAnchor="middle" fontSize="15">⑤ 계단 함수</text>
          <text x="150" y="354" textAnchor="middle" fontSize="14">z &lt; 0 → 0 / z ≥ 0 → 1</text>
          <rect x="75" y="390" width="150" height="35" rx="10" fill={fill(4)} stroke={paint(4)} className={highlight} />
          <text x="150" y="414" textAnchor="middle" fontSize="17">출력 = {result.output}</text>
        </svg>
        <div className="min-w-0">
          <ol className="space-y-3">
            {stages.map((stage, index) => <li key={stage.title} aria-current={scene === index ? 'step' : undefined} className={'rounded-xl border-2 p-3 ' + highlight + (scene === index ? ' border-indigo-600 bg-indigo-50' : ' border-slate-200')}>
              <button type="button" onClick={() => setScene(index)} aria-pressed={scene === index} className="min-h-11 w-full rounded-lg text-left font-black focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">{stage.title}{scene === index ? ' · 현재 위치' : ' 살펴보기'}</button>
              <p className="mt-1 break-words font-mono leading-7">
                {index === 0 && result.inputs.map((value, i) => 'x' + (i + 1) + ' = ' + value).join(', ')}
                {index === 1 && result.products.map((value, i) => '(' + result.inputs[i] + ' × ' + result.weights[i] + ') = ' + value).join(', ')}
                {index === 2 && <>{result.products.join(' + ')} = {result.productSum}</>}
                {index === 3 && <>{result.productSum} + ({result.bias}) = {result.z}</>}
                {index === 4 && <>z = {result.z} → 출력 {result.output}</>}
              </p>
              <p className="mt-1 leading-7 text-slate-700">{stage.detail}</p>
            </li>)}
          </ol>
          <div className="mt-4 flex flex-wrap gap-2" aria-label="계산 위치 탐색">
            <Button variant="secondary" disabled={scene === 0} onClick={() => setScene((value) => value - 1)} aria-label="퍼셉트론 풀이 이전">이전 계산</Button>
            <Button disabled={scene === stages.length - 1} onClick={() => setScene((value) => value + 1)} aria-label="퍼셉트론 풀이 다음">{scene < 4 ? ['가중치 곱하기 보기', '두 곱 더하기 보기', '편향 더하기 보기', '계단 함수 적용 보기'][scene] : '출력까지 확인함'}</Button>
            <Button variant="secondary" onClick={() => setScene(0)} aria-label="퍼셉트론 풀이 다시 보기"><RotateCcw size={16} aria-hidden="true" />입력부터 보기</Button>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600" role="status">현재 강조: {stages[scene].title}. 설명 위치만 바뀌며 답안은 바뀌지 않습니다.</p>
        </div>
      </div>
    </section>
  )
}
