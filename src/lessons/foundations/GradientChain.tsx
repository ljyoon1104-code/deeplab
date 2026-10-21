import { Box, CalculationTable, Question, type Answers, type Response, type Task } from './TeachingUI'
import { MathExpression } from './MathExpression'

/** The example conditions are distinct from the three full network exercises. */
export function GradientChain({ tasks, answers, change }: { tasks: Task[]; answers: Answers; change: (id: string, response: Response) => void }) {
  const question = (suffix: string) => {
    const task = tasks.find(item => item.id.endsWith(suffix))
    return task && <Question task={task} response={answers[task.id]} onChange={response => change(task.id, response)} />
  }
  return <div className="grid min-w-0 gap-5">
    <Box title="변화가 이어지는 길을 거슬러 계산합니다">
      <p>미분값은 한 값을 조금 늘릴 때 다음 값이 얼마나 변하는지를 나타냅니다. 손실까지 여러 계산을 거치면, 각 연결의 변화 비율을 <strong>곱해서</strong> 처음 값이 손실에 미치는 영향을 구합니다.</p>
      <ol className="grid gap-2 sm:grid-cols-4">
        {[
          ['① 가중치 w', '입력 x를 곱합니다.', 'w가 조금 변하면 점수 z도 변합니다.'],
          ['② 점수 z', '시그모이드로 바꿉니다.', 'z의 변화가 확률 p의 변화로 이어집니다.'],
          ['③ 확률 p', '실제 정답 y와 비교합니다.', 'p의 변화가 BCE 손실 L을 바꿉니다.'],
          ['④ 손실 L', '변화 비율을 역으로 연결합니다.', '∂L/∂w는 w를 조금 바꿀 때의 손실 변화입니다.'],
        ].map(([title, action, detail]) => <li key={title} className="rounded-lg border border-indigo-200 bg-white p-3"><strong>{title}</strong><p>{action}</p><p className="mt-2">{detail}</p></li>)}
      </ol>
      <MathExpression formula={String.raw`\frac{\partial L}{\partial w}=\frac{\partial L}{\partial p}\times\frac{\partial p}{\partial z}\times\frac{\partial z}{\partial w}`} />
      <p>∂L/∂w는 “w에 대한 손실의 기울기”라고 읽습니다. 한 경로에서는 변화 비율을 곱하고, 여러 경로가 같은 값에 영향을 주면 각 경로의 영향을 더합니다. 공식 유도 대신 아래에 제공한 비율을 연결해 보세요.</p>
    </Box>
    <Box title="시그모이드 + BCE · 같은 확률도 정답에 따라 방향이 달라집니다">
      <p>별도 연습 조건은 직접 입력 x=2, 확률 p=0.5입니다. 은닉층이 있는 뒤의 공통 신경망과는 다른 작은 예입니다.</p>
      <CalculationTable rows={[
        { name: <><span>손실 ← 확률 · y=1</span><MathExpression formula={String.raw`L=-\ln(p)`} /></>, formula: <MathExpression formula={String.raw`\frac{\partial L}{\partial p}=-\frac{1}{p}`} />, substitute: <MathExpression formula={String.raw`-\frac{1}{0.5}`} />, result: '−2' },
        { name: <><span>손실 ← 확률 · y=0</span><MathExpression formula={String.raw`L=-\ln(1-p)`} /></>, formula: <MathExpression formula={String.raw`\frac{\partial L}{\partial p}=\frac{1}{1-p}`} />, substitute: <MathExpression formula={String.raw`\frac{1}{1-0.5}`} />, result: '2' },
        { name: <><span>확률 ← 점수</span><MathExpression formula={String.raw`p=\sigma(z)`} /></>, formula: <MathExpression formula={String.raw`\frac{\partial p}{\partial z}=p(1-p)`} />, substitute: <MathExpression formula={String.raw`0.5(1-0.5)`} />, result: '0.25' },
        { name: <><span>점수 ← 가중치</span><MathExpression formula={String.raw`z=wx+b`} /></>, formula: <MathExpression formula={String.raw`\frac{\partial z}{\partial w}=x`} />, substitute: <MathExpression formula="2" />, result: '2' },
      ]} />
      <p>y=1이면 p를 키우는 방향, y=0이면 p를 줄이는 방향이 필요합니다. 같은 세 연결을 곱하되 손실 쪽 부호가 달라집니다.</p>
      <div className="grid gap-3 sm:grid-cols-2"><div><strong>y=1 · 세 변화 비율 연결</strong><MathExpression formula={String.raw`\frac{\partial L}{\partial w}=(-2)\times0.25\times2`} /></div><div><strong>y=0 · 세 변화 비율 연결</strong><MathExpression formula={String.raw`\frac{\partial L}{\partial w}=2\times0.25\times2`} /></div></div>
    </Box>
    {question('06-chain1')}
    {question('06-chain0')}
    <Box title="선형 출력 + MSE · 확률 변환 없이 연결합니다">
      <p>선형 출력은 점수가 그대로 예측값입니다. 한 자료의 MSE를 사용하며, 제곱을 미분해 계수 2가 생깁니다.</p>
      <MathExpression formula={String.raw`\hat{y}=z,\quad L=(\hat{y}-y)^2,\quad \frac{\partial L}{\partial z}=2(\hat{y}-y)`} />
      <p>별도 연습 조건 ŷ=2, y=3을 대입해 보세요. 다음 선형 신경망 실습도 이 MSE 정의를 사용합니다.</p>
    </Box>
    {question('05-factor')}
    <Box title="소프트맥스 + CCE · 각 출력의 영향을 연결합니다">
      <p>k는 출력 클래스 번호입니다. 점수 기울기에 그 연결의 입력을 곱하면 가중치의 기울기가 됩니다.</p>
      <MathExpression formula={String.raw`\frac{\partial L}{\partial z_k}=p_k-y_k,\quad \frac{\partial L}{\partial w_k}=(p_k-y_k)x`} />
      <p>별도 연습 조건 p=[0.7,0.2,0.1], y=[1,0,0], 직접 입력 x=2입니다. 첫 클래스의 가중치 기울기를 계산하세요. 뒤의 신경망 실습에서는 입력 x 대신 은닉 출력 h가 출력층에 들어갑니다.</p>
    </Box>
    {question('06-chainmulti')}
  </div>
}
