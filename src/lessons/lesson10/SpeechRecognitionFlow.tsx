import { ArrowDown, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import WaveformVisualizer from './WaveformVisualizer'

export const SPEECH_STAGES = ['말소리', '음성의 여러 특징 분석', '음소 등 말소리 단위 추정', '가능한 단어와 문장 판단', '텍스트'] as const

const stageDetails = [
  '마이크가 받는 것은 텍스트가 아니라 시간에 따라 변하는 소리 신호입니다.',
  '기본 과정의 주파수 분석: 높낮이와 시간 변화 등 여러 특징을 함께 살펴봅니다.',
  '기본 과정의 음소 추출: 분석한 특징에서 말소리의 작은 단위를 추정합니다.',
  '기본 과정의 텍스트 변환: 소리 단서와 앞뒤 문맥으로 가능한 후보를 비교합니다.',
  '텍스트 변환 결과입니다. 소음이나 낯선 발음 때문에 틀릴 수도 있습니다.',
] as const

export function SpeechConceptGuide() {
  const [stage, setStage] = useState(0)
  const basicStages = ['주파수 분석', '음소 추출', '텍스트 변환']
  const details = ['말소리 → 여러 음성 특징 분석', '말소리 단위 추정', '단어·문장 후보 판단 → 텍스트']
  return <section className="mt-5 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 sm:p-5" aria-label="말소리 예시와 기본 과정 설명">
    <h3 className="font-black text-cyan-950">① 교과서 기본 과정</h3>
    <p className="mt-3 text-sm leading-6">예: “문이 닫힙니다.”라는 말소리가 들어와 같은 내용의 글자로 바뀌는 과정을 생각해 봅시다. 아래는 개념 설명용이며 녹음·실제 음성 분석 결과가 아닙니다.</p>
    <div className="mt-4 flex flex-col gap-2 lg:flex-row">{basicStages.map((name, index) => <div key={name} className="contents"><div className={`min-w-0 flex-1 rounded-xl border-2 p-3 ${stage === index ? 'border-cyan-700 bg-white' : 'border-cyan-200'}`}><h4 className="font-black">{index + 1}. {name}{stage === index && ' · 현재'}</h4><p className="mt-2 text-sm leading-6">자세한 동작<br />{details[index]}</p></div>{index < 2 && <><ArrowDown className="mx-auto shrink-0 text-cyan-700 lg:hidden" aria-hidden="true" /><ArrowRight className="my-auto hidden shrink-0 text-cyan-700 lg:block" aria-hidden="true" /></>}</div>)}</div>
    <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label="말소리 설명 조작"><Button variant="secondary" disabled={stage === 0} onClick={() => setStage(value => value - 1)}>이전</Button><Button disabled={stage === 2} onClick={() => setStage(value => value + 1)}>다음</Button><Button variant="secondary" onClick={() => setStage(0)}>다시 보기</Button></div>
    <p className="mt-2 text-xs leading-5">번호와 테두리로 현재 설명을 표시합니다. 설명 이동은 답안·활동 기록·완료 상태를 바꾸지 않습니다.</p>
    <h3 className="mt-5 font-black text-cyan-950" aria-live="polite">② 과정 자세히 보기 · {stage + 1}/3 {basicStages[stage]}</h3>
    <div className="mt-3 rounded-xl bg-white p-4">
      {stage === 0 ? <>
        <h4 className="font-black">관찰할 부분: 같은 시간 동안 반복되는 진동</h4>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">{[{ label: '안내 A', cycles: 7 }, { label: '안내 B', cycles: 2 }].map(wave => <figure key={wave.label}><div className="relative"><WaveformVisualizer cycles={wave.cycles} label={`${wave.label} · 같은 시간에 ${wave.cycles}번 진동`} /></div><figcaption className="mt-2 text-sm font-bold">{wave.label} · 같은 시간 구간</figcaption></figure>)}</div>
        <p className="mt-3 rounded-lg border border-cyan-600 bg-cyan-50 p-3 text-sm leading-6"><strong>파형</strong>은 시간에 따라 변하는 소리 신호를 그린 모습입니다. <strong>주파수</strong>는 1초 동안 진동하는 횟수로, 소리의 높낮이와 관련됩니다. 같은 시간 구간에서 더 많이 진동하는 안내 A의 주파수가 높습니다. 주파수가 높다는 것과 소리가 크다는 것은 다릅니다.</p>
        <p className="mt-3 text-sm leading-6">이는 비교 방법을 보여 주는 단순 파형이며 “문이 닫힙니다.”를 녹음한 파형이 아닙니다. 그림의 시간 길이는 정하지 않았으므로 Hz 값은 표시하지 않습니다. 사람·환경에 따라 소리가 달라져 여러 특징을 함께 살펴봅니다.</p>
      </> : stage === 1 ? <>
        <h4 className="font-black">여러 특징 → 작은 말소리 단위 추정</h4><p className="mt-3 rounded-lg bg-violet-50 p-4 text-center font-bold">“문이 닫힙니다.”의 ‘문’ 소리<br />ㅁ · ㅜ · ㄴ</p>
        <p className="mt-3 text-sm leading-6"><strong>음소</strong>는 말뜻을 구별하는 작은 소리 단위입니다. 여기서 자음·모음 글자는 말소리를 설명하기 위한 표기입니다. 실제 신호가 글자 모양을 담고 있거나, 주파수 하나가 글자 하나에 일대일로 대응한다는 뜻은 아닙니다.</p>
      </> : <>
        <h4 className="font-black">말소리 단위 → 후보 판단 → 텍스트</h4><p className="mt-3 text-sm leading-6">추정한 말소리 단위로 단어·문장 후보를 살피고, 소리 단서와 앞뒤 문맥을 함께 고려합니다.</p><p className="mt-3 rounded-lg bg-emerald-50 p-4 text-center font-bold">안내 예의 결과 텍스트<br />“문이 닫힙니다.”</p><p className="mt-3 text-sm leading-6">다음 STEP에서는 같은 문장에서 일부 소리가 불분명한 경우를 판단합니다. 문맥만으로 불분명한 소리를 항상 복원할 수는 없습니다. 텍스트가 된 뒤의 의미·문맥 처리는 자연어 처리와 연결됩니다.</p>
      </>}
    </div>
  </section>
}

export default function SpeechRecognitionFlow({ viewed: initialViewed }: { viewed: readonly string[] }) {
  // 기존 열람 표시는 이어받되, 설명 조작은 이번 화면의 지역 상태만 바꿉니다.
  const [viewed, setViewed] = useState(() => [...initialViewed])
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-stretch" role="group" aria-label={`음성 인식 단계: ${SPEECH_STAGES.join('에서 다음으로: ')}`}>
      {SPEECH_STAGES.map((stage, index) => <div key={stage} className="contents"><button type="button" aria-pressed={viewed.includes(stage)} onClick={() => setViewed(current => [...new Set([...current, stage])])} className={`min-h-20 min-w-0 rounded-2xl border p-3 text-center text-sm font-black md:flex-1 ${viewed.includes(stage) ? 'border-cyan-600 bg-cyan-50 text-cyan-950' : 'border-slate-300 bg-white text-slate-700'}`}>{viewed.includes(stage) ? '✓ 확인함 · ' : ''}{index + 1}. {stage}{viewed.includes(stage) && <span className="mt-2 block text-left text-xs font-normal leading-5">{stageDetails[index]}</span>}</button>{index < SPEECH_STAGES.length - 1 ? <><ArrowDown className="mx-auto text-cyan-700 md:hidden" aria-hidden="true" /><ArrowRight className="my-auto hidden shrink-0 text-cyan-700 md:block" aria-hidden="true" /></> : null}</div>)}
    </div>
  )
}
