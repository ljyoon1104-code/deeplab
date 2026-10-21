import { Box } from './TeachingUI'
import { MathExpression } from './MathExpression'
import { fmt, type Network } from './network'

export function NetworkSymbols({ network }: { network: Network }) {
  return <Box title="연결 번호와 식의 기호 읽기">
    <dl className="grid gap-3 sm:grid-cols-2">
      <div><dt className="font-bold">i · j · k</dt><dd>i는 입력 번호, j는 은닉 뉴런 번호, k는 출력 뉴런 번호입니다. 예를 들어 w₁₂는 입력 2에서 은닉 뉴런 1로 가는 연결입니다.</dd></div>
      <div><dt className="font-bold">w<sub>ji</sub> · v<sub>kj</sub></dt><dd>w는 입력 i → 은닉 j의 가중치, v는 은닉 j → 출력 k의 가중치입니다. 첫 번호는 받는 뉴런, 뒤 번호는 보내는 쪽입니다.</dd></div>
      <div><dt className="font-bold">b<sub>j</sub> · b<sub>ok</sub></dt><dd>b<sub>j</sub>는 은닉 j의 편향, b<sub>ok</sub>는 출력 k의 편향입니다. 편향에는 입력을 곱하지 않고 한 번 더합니다.</dd></div>
      <div><dt className="font-bold">Σ · I · H · C</dt><dd>Σ는 아래 번호부터 위 번호까지 더하라는 뜻입니다. I는 입력 수, H는 은닉 뉴런 수, C는 출력 뉴런 수이며 다중 분류에서는 클래스 수입니다. 이 그림은 I={network.x.length}, H={network.b.length}, C={network.bo.length}입니다. 출력이 하나이면 z₁을 z로 줄여 씁니다.</dd></div>
    </dl>
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="min-w-0 rounded-lg border bg-white p-3">
        <p className="font-bold">그림의 H1 · 들어오는 연결을 합산</p>
        <MathExpression formula={String.raw`a_j=\sum_{i=1}^{I}w_{ji}x_i+b_j`} />
        <MathExpression formula={`a_1=${network.w[0].map((_,i)=>`w_{1${i+1}}x_${i+1}`).join('+')}+b_1`} />
        <MathExpression formula={`a_1=${network.w[0].map((value,i)=>`(${fmt(value)})\\times(${fmt(network.x[i])})`).join('+')}+(${fmt(network.b[0])})`} />
        <MathExpression formula={String.raw`h_1=\mathrm{ReLU}(a_1)`} />
        <p>입력층은 값을 전달하고, 이를 받은 은닉 뉴런이 곱·합·편향·활성화를 계산합니다.</p>
      </div>
      <div className="min-w-0 rounded-lg border bg-white p-3">
        <p className="font-bold">그림의 출력 1 · h를 새 입력으로 사용</p>
        <MathExpression formula={String.raw`z_k=\sum_{j=1}^{H}v_{kj}h_j+b_{ok}`} />
        <MathExpression formula={`z_1=${network.v[0].map((_,j)=>`v_{1${j+1}}h_${j+1}`).join('+')}+b_{o1}`} />
        <MathExpression formula={`z_1=${network.v[0].map((value,j)=>`(${fmt(value)})h_${j+1}`).join('+')}+(${fmt(network.bo[0])})`} />
        <p>여기 들어가는 h는 이전 층에서 계산한 출력입니다.</p>
      </div>
    </div>
  </Box>
}
