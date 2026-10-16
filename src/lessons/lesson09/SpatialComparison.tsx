import { useRef, useState } from 'react'
import { Button } from '../../components/ui/Button'
import type { Matrix } from './cnnMath'

export default function SpatialComparison({ image, onPixelSelect }: { image: Matrix; onPixelSelect?: (index: number) => void }) {
  const [scene, setScene] = useState(0)
  const titles = ['같은 이미지에서 시작', '행 순서대로 배열로 펼치기', '가까운 픽셀을 함께 살펴보기']
  const width = image[0].length
  const height = image.length
  const values = image.flat()
  const [selectedIndex, setSelectedIndex] = useState(width + 1)
  const [regionPosition, setRegionPosition] = useState(width)
  const arrayRef = useRef<HTMLDivElement>(null)
  const regionColumns = width - 1
  const regionCount = (height - 1) * regionColumns
  const startRow = Math.floor(regionPosition / regionColumns)
  const startColumn = regionPosition % regionColumns
  const startIndex = startRow * width + startColumn
  const nearby = [startIndex, startIndex + 1, startIndex + width, startIndex + width + 1]

  // Move only the array's own scroll area; selecting a pixel must not jump the page.
  const revealArrayIndex = (index: number) => {
    const container = arrayRef.current
    const cell = container?.querySelector<HTMLButtonElement>(`[data-array-index="${index}"]`)
    if (!container || !cell) return
    const offset = cell.getBoundingClientRect().left - container.getBoundingClientRect().left
    container.scrollTo({ left: container.scrollLeft + offset - (container.clientWidth - cell.offsetWidth) / 2, behavior: 'auto' })
  }
  const selectPixel = (index: number) => { setSelectedIndex(index); revealArrayIndex(index); onPixelSelect?.(index) }
  const moveRegion = (position: number) => {
    setRegionPosition(position)
    revealArrayIndex(Math.floor(position / regionColumns) * width + position % regionColumns)
  }
  const cellStyle = (index: number) => `min-h-14 min-w-11 rounded-lg border-2 px-1 py-2 text-center font-mono transition-colors duration-150 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 motion-reduce:transition-none ${index === selectedIndex ? 'border-orange-800 bg-orange-100 text-orange-950' : nearby.includes(index) ? 'border-violet-700 bg-violet-50 text-violet-950' : scene === 1 && index < width ? 'border-cyan-600 bg-cyan-50' : 'border-slate-200 bg-white'}`
  const pixelGrid = (region: boolean) => <div className="mx-auto grid w-full max-w-64 gap-1 rounded-xl border border-slate-300 bg-white p-2" style={{ gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))` }} role="group" aria-label={region ? 'CNN 이웃 영역 위치 선택' : '원본 픽셀 선택'}>
    {values.map((value, index) => <button key={index} type="button" aria-pressed={region ? nearby.includes(index) : index === selectedIndex} aria-label={`${region ? '이 칸을 시작점으로 영역 선택' : '원본 픽셀'} #${index}, ${Math.floor(index / width) + 1}행 ${index % width + 1}열, 값 ${value}${nearby.includes(index) ? ', 이웃 영역' : ''}${index === selectedIndex ? ', 선택 픽셀' : ''}`} onClick={() => {
      if (region) moveRegion(Math.min(Math.floor(index / width), height - 2) * regionColumns + Math.min(index % width, width - 2))
      else selectPixel(index)
    }} className={cellStyle(index)}><span className="block text-[11px] leading-4">{index === selectedIndex ? '●' : nearby.includes(index) ? '◆' : ''}#{index}</span><strong className="block text-base leading-5">{value}</strong></button>)}
  </div>

  return <section className="min-w-0 rounded-2xl border border-slate-200 p-4 sm:p-5" aria-label="같은 이미지의 배열과 이웃 영역 비교">
    <p className="text-sm font-bold">교육용 작은 이미지 · 숫자는 픽셀값, #번호는 배열 인덱스(0부터 시작)입니다.</p>
    <p className="mt-2 text-sm leading-6">● 주황: 선택 픽셀 · ◆ 보라: 같은 2×2 이웃 영역. 원본이나 배열의 값을 눌러 대응을 확인하세요.</p>
    <div className="mt-4 grid gap-5 lg:grid-cols-2">
      <div className="min-w-0 rounded-xl bg-slate-50 p-3 sm:p-4"><h3 className="mb-3 font-black">① 원본 {height}×{width} 이미지</h3>{pixelGrid(false)}<p className="mt-3 text-sm leading-6">행과 열로 놓인 같은 값입니다. 첫 행 다음에 두 번째 행이 이어지도록 ②에 펼칩니다.</p></div>
      <div className="min-w-0 rounded-xl bg-violet-50 p-3 sm:p-4 lg:col-span-2 lg:row-start-2"><h3 className="font-black">② 완전 연결 신경망에 넣을 한 줄 배열 · {values.length}개</h3>
        <p className="mt-2 text-sm leading-6">①의 첫 행 → 다음 행 순서. 좁은 화면에서도 한 줄을 유지합니다.</p>
        <div ref={arrayRef} tabIndex={0} role="region" aria-label="행 우선 1차원 배열 · 좌우 방향키로 이동, Home 시작, End 끝" onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return
          const container = event.currentTarget
          if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault()
            container.scrollTo({ left: event.key === 'Home' ? 0 : container.scrollWidth, behavior: 'auto' })
          } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault()
            container.scrollBy({ left: event.key === 'ArrowLeft' ? -52 : 52, behavior: 'auto' })
          }
        }} className="mt-3 max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-violet-300 bg-white p-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          <div className="flex w-max min-w-full flex-nowrap items-center gap-1" role="group" aria-label="행 우선 배열 값">
            <span className="shrink-0 px-1 text-4xl" aria-hidden="true">[</span>
            {values.map((value, index) => <button key={index} data-array-index={index} type="button" aria-pressed={selectedIndex === index} aria-label={`배열 #${index}, 값 ${value}${nearby.includes(index) ? ', 이웃 영역' : ''}`} onClick={() => selectPixel(index)} className={`w-11 shrink-0 ${cellStyle(index)}`}><span className="block text-[11px] leading-4">{index === selectedIndex ? '●' : nearby.includes(index) ? '◆' : ''}#{index}</span><strong className="block text-base leading-5">{value}</strong></button>)}
            <span className="shrink-0 px-1 text-4xl" aria-hidden="true">]</span>
          </div>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-600">배열 영역에 포커스를 두고 ←·→ 또는 Home·End로 양 끝을 봅니다. Tab으로 값에 이동한 뒤 Enter·Space로 선택할 수도 있습니다.</p>
        <p className="mt-3 rounded-lg bg-white p-3 text-sm leading-6" aria-live="polite">선택: {Math.floor(selectedIndex / width) + 1}행 {selectedIndex % width + 1}열 ↔ 배열 #{selectedIndex} · 값 {values[selectedIndex]}<br />2×2 이웃의 배열 위치: #{nearby.join(' · #')}</p>
        <p className="mt-3 text-sm leading-6">펼쳐도 픽셀값은 바뀌지 않습니다. 원본 크기와 행 우선 순서를 알면 이미지로 다시 구성할 수 있습니다. 완전 연결층의 각 뉴런은 이전 층의 모든 출력과 연결됩니다.</p>
      </div>
      <div className="min-w-0 rounded-xl bg-cyan-50 p-3 sm:p-4 lg:col-start-2 lg:row-start-1"><h3 className="mb-3 font-black">③ CNN이 살펴보는 2×2 이웃 영역</h3>{pixelGrid(true)}
        <p className="mt-3 text-sm font-bold" aria-live="polite">영역 {regionPosition + 1}/{regionCount} · 시작 {startRow + 1}행 {startColumn + 1}열</p>
        <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-label="CNN 이웃 영역 이동"><Button variant="secondary" disabled={regionPosition === 0} onClick={() => moveRegion(regionPosition - 1)}>이전 영역</Button><Button variant="secondary" disabled={regionPosition === regionCount - 1} onClick={() => moveRegion(regionPosition + 1)}>다음 영역</Button></div>
        <p className="mt-2 text-xs leading-5 text-slate-600">격자의 칸을 눌러 영역을 옮길 수도 있습니다. 가장자리에서는 2×2가 이미지 안에 들어오도록 시작점을 맞춥니다.</p>
        <p className="mt-3 text-sm leading-6">합성곱은 공간적으로 이웃한 영역에 필터를 적용합니다. 필터가 이동하며 여러 영역을 살펴봅니다. 지금은 영역의 대응만 비교하며 새 계산 문제를 풀지는 않습니다.</p>
      </div>
    </div>
    <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-6">완전 연결 신경망도 이미지 분류에 사용할 수 있습니다. CNN은 가로·세로 이웃 관계를 활용하기에 적합합니다. 어떤 방법이 더 좋은지는 데이터·구조·학습 조건을 함께 봐야 합니다.</p>
    <p className="mt-4 text-sm leading-6" aria-live="polite" aria-atomic="true"><strong>설명 {scene + 1}/3 · {titles[scene]}</strong><br />{scene === 0 ? '①과 ③은 같은 이미지이며 ②도 같은 픽셀값입니다. 값이 아니라 표현과 처리 방식의 차이를 비교합니다.' : scene === 1 ? `위쪽 첫 행의 값과 #0~#${width - 1}을 연결하세요. 다음 행의 값이 그 뒤에 이어집니다.` : `이미지에서 이웃한 #${nearby.join('·#')}을 한 줄 배열에서도 찾으세요. 행이 바뀌는 경계를 따라 펼쳐져, 네 값 사이에 다른 값이 놓일 수 있습니다.`}</p>
    <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label="배열과 이웃 관계 설명 조작"><Button variant="secondary" disabled={scene === 0} onClick={() => setScene(value => value - 1)}>이전</Button><Button disabled={scene === 2} onClick={() => setScene(value => value + 1)}>다음</Button><Button variant="secondary" onClick={() => setScene(0)}>다시 보기</Button></div>
    <p className="mt-2 text-xs leading-5 text-slate-600">픽셀 선택은 대응 활동으로 기록됩니다. 설명 이전·다음·다시 보기는 답안이나 완료 상태를 바꾸지 않습니다.</p>
  </section>
}
