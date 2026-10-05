import { useState, type ReactNode } from 'react'
import { Button } from '../../components/ui/Button'
import { WORDS } from './lesson11Data'
import OneHotVisualizer from './OneHotVisualizer'
import { createOneHot } from './textRepresentation'

export default function RepresentationWalkthrough({ selectedWord, children }: { selectedWord: string; children: ReactNode }) {
  const [stage, setStage] = useState(0)
  const vector = createOneHot(WORDS, selectedWord)
  const titles = ['단어의 위치 표현', '숫자 개수 비교', '점과 의미 관계']
  const descriptions = [
    `원-핫 예문에서 선택한 “${selectedWord}”는 인덱스 ${vector.indexOf(1)}의 칸이 1입니다. 길이 ${vector.length}의 같은 배열에서 단어와 위치를 연결합니다.`,
    `이 원-핫은 ${vector.length}개의 숫자, 옆의 교육용 임베딩은 가로·세로 좌표 두 개로 표현합니다. 서로 다른 예시를 비교하는 것이며 원-핫을 반드시 임베딩으로 변환하는 순서가 아닙니다.`,
    '의미 거리 그림의 단어 버튼을 누르면 그 좌표와 점이 함께 강조됩니다. 친구와 우정의 가까움, 냉장고의 먼 위치를 비교하세요. 가까워도 완전히 같은 뜻은 아니며 실제 관계는 학습 데이터에 따라 달라질 수 있습니다.',
  ]
  const panel = (active: boolean) => `min-w-0 rounded-2xl border-2 p-2 transition-colors duration-150 motion-reduce:transition-none ${active ? 'border-violet-600 bg-violet-50' : 'border-slate-200'}`
  return <section className="mt-6" aria-label="원-핫과 교육용 임베딩 비교 설명">
    <h3 className="font-black">두 표현 나란히 보기 · 서로 다른 예시</h3>
    <p className="mt-2 text-sm leading-6">원-핫의 예문 단어 목록과 의미 거리 그림의 친구·우정·사람·냉장고는 서로 다른 단어 집합입니다. 아래 두 패널 사이에 필수 변환 순서는 없습니다.</p>
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <div className={panel(stage <= 1)}><p className="p-2 text-sm font-black">① 예문 단어 · {vector.length}개의 숫자로 표현</p><OneHotVisualizer selectedWord={selectedWord} /></div>
      <div className={panel(stage >= 1)}><p className="p-2 text-sm font-black">② 의미 거리 비교용 단어 · 좌표 두 개로 표현</p>{children}</div>
    </div>
    <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6" aria-live="polite" aria-atomic="true"><strong>{stage + 1}/3 · {titles[stage]}: </strong>{descriptions[stage]}</p>
    <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label="숫자 표현 비교 설명 조작">
      <Button variant="secondary" disabled={stage === 0} onClick={() => setStage((value) => value - 1)} aria-label="표현 비교 이전 설명">이전</Button>
      <Button disabled={stage === titles.length - 1} onClick={() => setStage((value) => value + 1)} aria-label="표현 비교 다음 설명">다음</Button>
      <Button variant="secondary" onClick={() => setStage(0)} aria-label="표현 비교 설명 다시 보기">다시 보기</Button>
    </div>
    <p className="mt-2 text-xs leading-5 text-slate-500">설명 이동과 점 선택은 답안·활동 확인·완료 기록을 바꾸지 않습니다.</p>
  </section>
}
