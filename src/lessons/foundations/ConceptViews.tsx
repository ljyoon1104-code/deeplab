import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { calculatePerceptronN } from '../lesson02/perceptronMath'
import { relu, sigmoid, softmax, stepActivation } from '../lesson03/activationMath'
import { binaryCrossEntropy, categoricalCrossEntropy } from '../lesson05/lossMath'
import { Box, CalculationTable, NetworkPicture } from './TeachingUI'
import { examples, fmt, names, pairs, sum } from './network'
import { LossFormula, OutputFormula } from './NetworkLab'
import { NetworkSymbols } from './NetworkSymbols'
import { MathExpression } from './MathExpression'
import type { Page } from './curriculum'

export function ConceptView({page}:{page:Page}) {
 if(page.view==='problem-types') return <div className="grid gap-3 md:grid-cols-3">{[
  {title:'연속적인 숫자 예측',example:'내일의 기온',result:'얼마나 높거나 낮을지 숫자로 답합니다.'},
  {title:'두 종류 중 하나 분류',example:'스팸·정상 메시지',result:'주어진 두 종류 중 하나로 답합니다.'},
  {title:'여러 종류 중 하나 분류',example:'고양이·강아지·새',result:'주어진 여러 종류 중 하나로 답합니다.'},
 ].map(item=><Box key={item.title} title={item.title}><p className="font-semibold">{item.example}</p><p>{item.result}</p></Box>)}</div>
 if(page.view==='output-types') return <div className="grid gap-3 md:grid-cols-3">{[
  {title:'출력층 · 선형 출력',formula:'ŷ=z',meaning:'기온·집값처럼 연속적인 수치를 예측합니다. 음수나 1보다 큰 값도 가능하며 확률이 아닙니다.'},
  {title:'출력층 · 시그모이드',formula:'출력 p: 클래스 1의 확률',meaning:'출력 뉴런 하나로 두 종류를 구분합니다. 다른 클래스인 0의 확률은 1−p입니다.'},
  {title:'출력층 · 소프트맥스',formula:'출력 pₖ: 클래스별 확률, 합 1',meaning:'여러 종류 중 하나를 고를 때 클래스마다 출력 뉴런을 둡니다. 모든 점수를 함께 비교해 확률을 만듭니다.'},
 ].map(item=><Box key={item.title} title={item.title}><p className="font-semibold">{item.formula}</p><p>{item.meaning}</p></Box>)}</div>
 if(page.view==='types') return <div className="grid gap-3 md:grid-cols-3">{pairs.map((p,i)=><Box key={p} title={names[p]}><p>{['수치 예측: 집값·기온','이진 분류: 정상(0)·스팸(1)','다중 분류: 고양이·강아지·새'][i]}</p><p>{['출력 ŷ: 연속적인 수치','출력 p: 클래스 1의 확률','출력 pₖ: 각 클래스의 확률, 합 1'][i]}</p><p>{['정답 y: 실제 수치','정답 y: 0 또는 1','정답 y: 정답 위치만 1인 원-핫'][i]}</p></Box>)}</div>
 if(page.view==='perceptron') return <><Perceptron/><Box title="독립 계산 · 아래 두 문항의 고정 조건"><p>입력 (2, 3) · 가중치 (0.5, −0.2) · 편향 −0.5</p><p>위 슬라이더와 별개의 조건입니다. 가중합을 계산한 뒤 계단 출력을 제출하세요.</p></Box></>
 if(page.view==='rule') return <Box title="정답과 계단 출력의 차이로 수정"><MathExpression formula={String.raw`w_i^{new}=w_i^{old}+\eta(y-\hat{y})x_i`} /><MathExpression formula={String.raw`b^{new}=b^{old}+\eta(y-\hat{y})`} /><p>정답과 출력이 같으면 y−ŷ=0이므로 이번에는 수정하지 않습니다.</p></Box>
 if(page.view==='xor') return <XorExample/>
 if(page.view==='activation') return <>{page.layerIntro&&<LayerIntro/>}<Activation kind={page.function!}/></>
 if(page.view==='structure') return <><NetworkPicture network={examples.binary} stage="hidden" reveal={false}/><NetworkSymbols network={examples.binary}/></>
 if(page.view==='bce-cases') return <><LossFormula kind="binary"/><CalculationTable rows={[{name:'y=1, p=0.8',formula:'−ln(p)',substitute:'−[1 ln(0.8)+0 ln(0.2)]',result:fmt(binaryCrossEntropy(1,.8))},{name:'y=0, p=0.8',formula:'−ln(1−p)',substitute:'−[0 ln(0.8)+1 ln(0.2)]',result:fmt(binaryCrossEntropy(0,.8))}]}/><Box title="CCE 안내 풀이 · 다음 STEP의 평균 계산으로 연결"><p>공통 신경망 예제와 별개로 y=[1,0,0], p=[0.7,0.2,0.1]을 사용합니다. 클래스 순서는 고양이·강아지·새입니다. 원-핫의 1은 정답 위치이지 예측 확률이 아닙니다.</p><LossFormula kind="multi"/><p>−[1×ln(0.7)+0×ln(0.2)+0×ln(0.1)] = −ln(0.7) ≈ <strong>{fmt(categoricalCrossEntropy([1,0,0],[.7,.2,.1]))}</strong></p><p>정답이 아닌 항은 0을 곱합니다. 이 값은 한 자료의 손실이며, 다음 STEP에서는 각 자료의 손실을 더해 자료 수로 나눕니다. 이 풀이는 별도로 제출하지 않습니다.</p></Box></>
 if(page.view==='loss-batch') return <><LossFormula kind="linear"/><CalculationTable rows={[{name:'집값 A',formula:'(ŷ−y)²',substitute:'(2−3)²',result:'1'},{name:'집값 B',formula:'(ŷ−y)²',substitute:'(4−5)²',result:'1'},{name:'집값 C',formula:'(ŷ−y)²',substitute:'(9−7)²',result:'4'}]}/><Box title="평균 계산용 값 · 표시는 반올림"><p>BCE: y=1인 세 자료의 p=0.8, 0.1, 0.5 → 손실 [{[.8,.1,.5].map(p=>fmt(binaryCrossEntropy(1,p))).join(', ')}]</p><p>CCE: 첫 자료 y=[1,0,0], p=[0.7,0.2,0.1]; 둘째 자료 y=[1,0,0], p=[0.9,0.05,0.05] → 손실 [{[.7,.9].map(p=>fmt(-Math.log(p))).join(', ')}]</p><p>평균 손실 = (각 자료의 손실 합) ÷ 자료 수. 교차 엔트로피 손실을 제곱하는 것이 아닙니다.</p></Box></>
 if(page.view==='coefficient') return <CoefficientComparison/>
 if(page.view==='chain') return <><CoefficientComparison/>
  <Box title="통합 계산에서 사용할 출력 점수 기울기">
   <p>데이터 하나에 대한 공식입니다. 유도 과정을 외우는 대신 출력·손실 조합에 맞는 공식을 골라 현재 예측과 정답을 대입하세요.</p>
   <table className="w-full table-fixed border-collapse text-left">
    <thead><tr className="border-b border-slate-300"><th className="p-2">출력·손실 조합</th><th className="p-2">점수 기울기</th></tr></thead>
    <tbody>
     <tr className="border-b border-slate-200"><th scope="row" className="p-2">선형 출력 + MSE</th><td className="p-2"><MathExpression formula={String.raw`\frac{\partial L}{\partial z}=2(\hat{y}-y)`} /></td></tr>
     <tr className="border-b border-slate-200"><th scope="row" className="p-2">시그모이드 + BCE</th><td className="p-2"><MathExpression formula={String.raw`\frac{\partial L}{\partial z}=p-y`} /></td></tr>
     <tr><th scope="row" className="p-2">소프트맥스 + CCE</th><td className="p-2"><MathExpression formula={String.raw`\frac{\partial L}{\partial z_k}=p_k-y_k`} /></td></tr>
    </tbody>
   </table>
  </Box>
  <Box title="시그모이드와 BCE의 미분 연결"><CalculationTable rows={[{name:'BCE, y=1',formula:<MathExpression formula={String.raw`\frac{\partial L}{\partial p}=-\frac{1}{p}`} />,substitute:<MathExpression formula={String.raw`-\frac{1}{0.5}=-2`} />,result:'−2'},{name:'BCE, y=0',formula:<MathExpression formula={String.raw`\frac{\partial L}{\partial p}=\frac{1}{1-p}`} />,substitute:<MathExpression formula={String.raw`\frac{1}{1-0.5}=2`} />,result:'2'},{name:'시그모이드',formula:<MathExpression formula={String.raw`\frac{\partial p}{\partial z}=p(1-p)`} />,substitute:<MathExpression formula="0.5(1-0.5)=0.25" />,result:'0.25'},{name:'가중합',formula:<MathExpression formula={String.raw`\frac{\partial z}{\partial w}=x`} />,substitute:<MathExpression formula="x=2" />,result:'2'}]}/><MathExpression formula={String.raw`\frac{\partial L}{\partial w}=\frac{\partial L}{\partial p}\frac{\partial p}{\partial z}\frac{\partial z}{\partial w}`} /></Box></>
 return null
}
function LayerIntro() {
 return <Box title="뉴런을 연결하면 층을 이룹니다">
  <p>뉴런은 입력에 가중치를 곱해 더하고 편향을 더한 뒤, 활성화 함수로 출력값을 만드는 계산 단위입니다. 층은 같은 처리 단계에 있는 뉴런들의 묶음입니다.</p>
  <figure>
   <ol className="grid gap-8 sm:grid-cols-3">{[
    {title:'입력층',role:'특징값을 전달합니다.',nodes:['입력','입력']},
    {title:'은닉층',role:'전달받은 값으로 중간 출력을 만듭니다.',nodes:['뉴런','뉴런']},
    {title:'출력층',role:'마지막 값을 예측 결과로 바꿉니다.',nodes:['뉴런']},
   ].map((layer,index)=><li key={layer.title} className="relative min-w-0 rounded-lg border border-slate-300 bg-white p-3 text-center">
    <h4 className="font-bold">{layer.title}</h4><div className="my-3 flex flex-wrap justify-center gap-2" aria-hidden="true">{layer.nodes.map((node,i)=><span key={i} className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-indigo-500 bg-indigo-50">{node}</span>)}</div><p>{layer.role}</p>
    {index<2&&<span aria-hidden="true" className="absolute -bottom-8 left-1/2 text-2xl sm:bottom-auto sm:-right-6 sm:left-auto sm:top-1/2"><span className="sm:hidden">↓</span><span className="hidden sm:inline">→</span></span>}
   </li>)}</ol>
   <figcaption className="mt-3">한 층의 출력은 다음 층의 입력이 됩니다. 활성화 함수는 뉴런이 어떤 값을 내보낼지 정합니다.</figcaption>
  </figure>
 </Box>
}
function CoefficientComparison() {
 return <Box title="선형 출력 ŷ=z의 기울기 공식"><CalculationTable rows={[{name:'제곱오차 · 데이터 하나의 MSE',formula:<MathExpression formula={String.raw`L=(\hat{y}-y)^2`} />,substitute:<MathExpression formula={String.raw`\frac{\partial L}{\partial z}=2(\hat{y}-y)`} />,result:'계수 2 유지'},{name:'반제곱오차',formula:<MathExpression formula={String.raw`L=\frac{1}{2}(\hat{y}-y)^2`} />,substitute:<MathExpression formula={String.raw`\frac{\partial L}{\partial z}=\hat{y}-y`} />,result:'계수 ½과 2가 곱해져 1'}]}/></Box>
}
function XorExample() {
 return <Box title="XOR · 같은 입력은 0, 다른 입력은 1">
  <figure>
   <svg className="mx-auto w-full max-w-sm" viewBox="0 0 320 280" role="img" aria-label="XOR의 네 점. 입력 0,0과 1,1의 정답은 0, 입력 0,1과 1,0의 정답은 1입니다.">
    <line x1="48" y1="222" x2="285" y2="222" stroke="#64748b" strokeWidth="2"/>
    <line x1="48" y1="222" x2="48" y2="32" stroke="#64748b" strokeWidth="2"/>
    <text x="281" y="248" fontSize="18">x₁</text><text x="17" y="31" fontSize="18">x₂</text>
    {[{x:80,y:190,first:0,second:0,value:0},{x:235,y:190,first:1,second:0,value:1},{x:80,y:65,first:0,second:1,value:1},{x:235,y:65,first:1,second:1,value:0}].map(point=><g key={`${point.first}-${point.second}`}>
     {point.value===0?<circle cx={point.x} cy={point.y} r="23" fill="#eef2ff" stroke="#4f46e5" strokeWidth="2"/>:<rect x={point.x-23} y={point.y-23} width="46" height="46" rx="5" fill="#fff7ed" stroke="#c2410c" strokeWidth="2"/>}
     <text x={point.x} y={point.y+7} textAnchor="middle" fontSize="21" fontWeight="bold">{point.value}</text>
     <text x={point.x} y={point.y+47} textAnchor="middle" fontSize="17">({point.first}, {point.second})</text>
    </g>)}
    <text x="80" y="263" textAnchor="middle" fontSize="17">입력 0</text><text x="235" y="263" textAnchor="middle" fontSize="17">입력 1</text>
   </svg>
   <figcaption className="mt-2">원은 정답 0, 네모는 정답 1입니다. 같은 정답의 점이 대각선으로 마주 보므로 직선 하나의 양쪽으로 두 종류를 모두 나눌 수 없습니다.</figcaption>
  </figure>
  <p>계단 출력을 쓰는 단층 퍼셉트론의 경계는 직선 하나입니다. 여러 뉴런과 층에 비선형 계산을 연결하면 이런 관계를 표현할 수 있습니다. 다음 차시에서 비선형 함수의 역할을 살펴봅니다.</p>
 </Box>
}
function Perceptron() {
 const [w1,setW1]=useState(.5),[w2,setW2]=useState(-.2),[b,setB]=useState(.1)
 const f=calculatePerceptronN({inputs:[2,3],weights:[w1,w2],bias:b})
 return <Box title="설명용 관찰 · 슬라이더로 계산 바꿔 보기">
  <div className="grid gap-4 sm:grid-cols-3">{([{label:'가중치 w₁',value:w1,set:setW1},{label:'가중치 w₂',value:w2,set:setW2},{label:'편향 b',value:b,set:setB}]).map(c=><label key={c.label} className="grid gap-2">{c.label}: {fmt(c.value)}<input aria-label={c.label} type="range" min="-1" max="1" step="0.1" value={c.value} onChange={e=>c.set(Number(e.target.value))}/></label>)}</div>
  <ol className="grid gap-2 sm:grid-cols-3"><li className="rounded border p-3">① 입력×가중치<br/>2×{fmt(w1)}={fmt(f.products[0])}<br/>3×{fmt(w2)}={fmt(f.products[1])}</li><li className="rounded border p-3">② 합산·편향<br/>{fmt(f.productSum)} + ({fmt(b)})<br/>z={fmt(f.z)}</li><li className="rounded border p-3">③ 계단 함수<br/>z≥0 → 1, z&lt;0 → 0<br/>출력 ŷ={f.output}</li></ol>
  <p aria-live="polite">현재 계산: z=2×({fmt(w1)})+3×({fmt(w2)})+({fmt(b)})={fmt(f.z)} → 출력 {f.output}</p><Button variant="secondary" onClick={()=>{setW1(.5);setW2(-.2);setB(.1)}}>초기값으로 되돌리기</Button>
 </Box>
}
function Activation({kind}:{kind:NonNullable<Page['function']>}) {
 const [z,setZ]=useState(kind==='sigmoid'?2:0),[scores,setScores]=useState([2,1,0])
 const fn=kind==='step'?stepActivation:kind==='relu'?relu:kind==='sigmoid'?sigmoid:(v:number)=>v
 if(kind==='softmax') {
  const p=softmax(scores),classes=['고양이','강아지','새']
  return <Box title="세 점수 → 클래스 확률">
   <OutputFormula kind="multi"/>
   <div className="grid gap-3 sm:grid-cols-3">{scores.map((v,k)=><label key={k}>{classes[k]} 점수 {v}<input className="w-full" type="range" min="-2" max="4" step=".5" value={v} onChange={e=>setScores(old=>old.map((x,i)=>i===k?Number(e.target.value):x))}/></label>)}</div>
   <figure className="min-w-0 rounded-xl border border-slate-300 bg-white p-3">
    <figcaption className="mb-3 font-bold">같은 클래스의 점수와 확률 비교</figcaption>
    <div className="grid min-w-0 gap-4 sm:grid-cols-3">{classes.map((name,k)=><div key={name} className="min-w-0 rounded-lg border p-3">
     <h4 className="font-bold">{name}</h4>
     <p>입력 점수 z = {fmt(scores[k])}</p>
     <div role="img" aria-label={`${name} 점수 ${fmt(scores[k])}. 범위 마이너스 2부터 4, 세로선은 0입니다.`} className="relative my-1 h-5 rounded bg-slate-100">
      <span className="absolute inset-y-0 bg-indigo-500" style={{left:`${(scores[k]<0?scores[k]+2:2)/6*100}%`,width:`${Math.abs(scores[k])/6*100}%`}}/>
      <span className="absolute inset-y-0 border-l-2 border-slate-700" style={{left:`${100/3}%`}}/>
     </div>
     <div aria-hidden="true" className="relative h-7"><span className="absolute left-0">−2</span><span className="absolute -translate-x-1/2" style={{left:`${100/3}%`}}>0</span><span className="absolute right-0">4</span></div>
     <p className="mt-2">출력 확률 p = {fmt(p[k])}<br/><strong>{(p[k]*100).toFixed(2)}%</strong></p>
     <div role="img" aria-label={`${name} 확률 ${(p[k]*100).toFixed(2)}퍼센트. 범위 0부터 100퍼센트입니다.`} className="my-1 h-5 rounded bg-slate-100"><div className="h-full rounded bg-emerald-600" style={{width:`${p[k]*100}%`}}/></div>
     <div aria-hidden="true" className="flex justify-between"><span>0%</span><span>100%</span></div>
    </div>)}</div>
    <p className="mt-3">점수는 확률이 아닙니다. 한 점수를 바꾸면 다른 클래스의 확률도 함께 달라집니다.</p>
   </figure>
   <CalculationTable rows={p.map((v,k)=>({name:classes[k],formula:<MathExpression formula={String.raw`p_k=\frac{e^{z_k}}{\sum_{r=1}^{C}e^{z_r}}`} />,substitute:<MathExpression formula={`\\frac{e^{${fmt(scores[k])}}}{${scores.map(score=>`e^{${fmt(score)}}`).join('+')}}\\approx\\frac{${fmt(Math.exp(scores[k]))}}{${fmt(sum(scores.map(Math.exp)))}}`} />,result:`${fmt(v)} (${(v*100).toFixed(2)}%)`}))}/>
   <p aria-live="polite">합={fmt(sum(p))}. 화면 반올림 때문에 표시된 개별 값의 합만 조금 다를 수 있습니다.</p>
  </Box>
 }
 const pts=Array.from({length:121},(_,i)=>{const x=-3+i/20;return `${170+x*44},${180-fn(x)*38}`}).join(' ')
 const inputSymbol=kind==='relu'?'a':'z', outputSymbol=kind==='relu'?'h':kind==='linear'?'ŷ':kind==='sigmoid'?'p':'출력'
 return <Box title={kind==='relu'?'은닉 가중합 a → ReLU 출력 h':'입력 z와 함수의 출력'}>
  {kind==='sigmoid'&&<p>관찰값은 슬라이더로 바꿉니다. 아래 독립 계산은 관찰값과 별개로 z=0을 사용합니다.</p>}
  <label className="grid gap-2">{kind==='relu'?'은닉 가중합':'가중합'} {inputSymbol}={z}
   <input className="min-h-11 w-full accent-indigo-600" aria-label={`${kind==='relu'?'은닉 ':''}가중합 ${inputSymbol} 조절`} type="range" min="-3" max="3" step=".1" value={z} onChange={e=>setZ(Number(e.target.value))}/>
  </label>
  <figure className="min-w-0">
   <div role="region" aria-label="함수 그래프 가로 스크롤" tabIndex={0} className="max-w-full overflow-x-auto rounded-lg border border-slate-200 bg-white focus-visible:outline-3 focus-visible:outline-indigo-600">
    <svg className="mx-auto w-full min-w-[350px] max-w-md" viewBox="0 0 350 330" role="img" aria-label={`${kind} 그래프. 가로축 ${inputSymbol}, 세로축 ${outputSymbol}. 현재 입력 ${z}, 출력 ${fmt(fn(z))}`}>
     <line x1="25" y1="180" x2="320" y2="180" stroke="#64748b"/><line x1="170" y1="25" x2="170" y2="305" stroke="#64748b"/>
     {kind==='step'?<><path d="M38,180 H170 M170,142 H302" fill="none" stroke="#4f46e5" strokeWidth="3"/><circle cx="170" cy="180" r="5" fill="white" stroke="#4f46e5" strokeWidth="2"/><circle cx="170" cy="142" r="5" fill="#4f46e5"/></>:<polyline points={pts} fill="none" stroke="#4f46e5" strokeWidth="3"/>}
     {[-2,-1,0,1,2].map(v=><g key={v}><text x={170+v*44} y="202" textAnchor="middle" fontSize="16">{v}</text>{v!==0&&<text x="147" y={185-v*38} fontSize="16">{v}</text>}</g>)}
     <text x="321" y="175" fontSize="18">{inputSymbol}</text><text x="178" y="24" fontSize="18">{outputSymbol}</text>
     <line x1={170+z*44} y1="180" x2={170+z*44} y2={180-fn(z)*38} stroke="#be123c" strokeDasharray="4 4"/>
     <circle cx={170+z*44} cy={180-fn(z)*38} r="6" fill="#be123c"/>
    </svg>
   </div>
   <figcaption className="mt-2">가로축은 넣는 값, 세로축은 나오는 값입니다. 점은 현재 관찰값을 나타냅니다.</figcaption>
  </figure>
  {kind==='sigmoid'?<OutputFormula kind="binary"/>:kind==='relu'?<div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 py-2">
   <MathExpression inline formula={String.raw`h=\operatorname{ReLU}(a)=\max(0,a)`}/>
   <MathExpression inline formula={String.raw`=\begin{cases}a&a>0\\0&a\le0\end{cases}`}/>
  </div>:<MathExpression formula={kind==='step'?String.raw`f(z)=\begin{cases}1&z\ge0\\0&z<0\end{cases}`:'g(z)=z'} />}
  <p aria-live="polite">{inputSymbol}={z} → {outputSymbol}{kind==='sigmoid'?'≈':'='}{fmt(fn(z))}{kind==='sigmoid'?` · 클래스 1 확률 약 ${(fn(z)*100).toFixed(2)}%`:kind==='linear'?' · 수치 예측이며 확률이 아닙니다.':kind==='relu'?z>0?' · 양수이므로 가중합 그대로 다음 층으로 보냅니다.':' · 0 이하이므로 다음 층으로 보내는 값은 0입니다.':' · 두 상태 중 하나입니다.'}</p>
  {kind==='relu'&&<p>이 식은 순전파에서 출력 h를 구하는 규칙입니다. 역전파에서 사용할 ReLU의 미분 규칙과는 구별합니다.</p>}
 </Box>
}
