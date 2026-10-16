import { useState, type ReactNode } from 'react'
import { Button } from '../../components/ui/Button'
import { WORDS } from './lesson11Data'
import { createOneHot } from './textRepresentation'

export default function RepresentationWalkthrough({ selectedWord, children }: { selectedWord: string; children: ReactNode }) {
  const [stage, setStage] = useState(0)
  const vector = createOneHot(WORDS, selectedWord)
  const titles = ['단어의 위치 표현', '숫자 개수 비교', '점과 의미 관계']
  const descriptions = [
    `앞 활동의 “${selectedWord}”는 길이 ${vector.length}의 원-핫이었습니다. 1의 위치는 단어를 구별하며, 번호 차이가 의미의 거리는 아닙니다.`,
    '단어 버튼을 누르면 원-핫의 네 칸과 임베딩의 두 숫자·점이 함께 바뀝니다. 같은 단어를 두 방법으로 비교해 보세요.',
    '친구·우정의 가까운 점과 냉장고의 먼 점을 비교하세요. 가까운 단어도 완전히 같은 뜻은 아닙니다.',
  ]
  return <section className="mt-6" aria-label="원-핫과 교육용 임베딩 비교 설명">
    <h3 className="font-black">같은 단어의 두 표현 · 과정 자세히 보기</h3>
    <p className="mt-2 text-sm leading-6">벡터는 여러 숫자를 순서대로 묶은 표현입니다. 원-핫은 대부분 0인 희소 표현으로 단어를 구별하지만 의미의 비슷함을 직접 담기 어렵습니다. 임베딩은 비교적 짧은 벡터에 정보를 담는 밀집 표현입니다.</p>
    <p className="mt-4 min-h-20 rounded-xl border-l-4 border-violet-600 bg-violet-50 p-4 text-sm leading-6" aria-live="polite" aria-atomic="true"><strong>{stage + 1}/3 · {titles[stage]}: </strong>{descriptions[stage]}</p>
    <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label="숫자 표현 비교 설명 조작">
      <Button variant="secondary" disabled={stage === 0} onClick={() => setStage((value) => value - 1)} aria-label="표현 비교 이전 설명">이전</Button>
      <Button disabled={stage === titles.length - 1} onClick={() => setStage((value) => value + 1)} aria-label="표현 비교 다음 설명">다음</Button>
      <Button variant="secondary" onClick={() => setStage(0)} aria-label="표현 비교 설명 다시 보기">다시 보기</Button>
    </div>
    <p className="mt-3 text-sm leading-6">실제 임베딩 값은 학습으로 조정되어 신경망 입력에 쓰입니다. 아래는 표현 방법의 비교이며, 원-핫을 반드시 임베딩으로 바꾸는 순서가 아닙니다.</p>
    <div className="mt-4">{children}</div>
  </section>
}
