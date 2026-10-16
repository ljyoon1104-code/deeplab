import { useState, type ReactNode } from 'react'
import { PET_IMAGE_URL } from './petImageProcessing'
import type { VisionTask } from './lesson09Data'

// Hand-traced simplified outlines on the supplied 1672×941 image; NOT model segmentation.
const animals = [
  { name: '① 큰 고양이', box: [18, 77, 515, 713], path: 'M281 85 Q315 83 351 130 L431 129 Q465 85 490 78 L490 173 Q525 228 507 295 L517 404 Q543 561 522 659 L493 733 L470 780 L418 788 L382 774 L348 791 L290 786 L266 770 L233 778 L189 762 Q127 777 105 749 Q17 756 19 718 Q23 684 90 678 Q68 565 112 451 L166 365 L218 312 L264 267 Q245 219 281 176 Q270 112 281 85Z' },
  { name: '② 작은 고양이', box: [719, 354, 344, 430], path: 'M784 361 Q805 360 829 393 L871 394 Q894 362 921 354 Q941 368 932 425 L948 478 L932 535 L945 620 L958 710 Q1005 706 1047 722 Q1073 734 1050 747 L933 753 L915 778 L867 780 L848 765 L813 782 L779 774 L746 766 Q710 752 722 698 L741 599 L770 528 Q750 465 780 427 Q773 383 784 361Z' },
  { name: '③ 강아지', box: [1169, 158, 495, 625], path: 'M1274 170 Q1342 144 1401 186 Q1452 209 1462 296 L1482 359 Q1474 394 1441 385 L1450 508 L1490 550 Q1534 566 1523 705 Q1582 709 1616 724 L1663 738 Q1641 754 1597 749 L1515 744 L1492 765 L1450 761 L1429 780 L1386 780 L1360 765 L1269 761 L1232 775 L1204 768 L1212 732 L1224 644 Q1207 556 1208 486 L1217 377 Q1167 386 1171 325 L1193 244 Q1206 207 1240 196Z' },
]

export default function PetSourceImage({ task, overlay, onSize }: { task?: VisionTask; overlay?: ReactNode; onSize?: (width: number, height: number) => void }) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  return <div className="min-w-0">
    <div className="relative">
      <img key={attempt} src={PET_IMAGE_URL} alt="밝은 배경에 앉은 큰 고양이, 작은 고양이, 강아지의 생성 이미지" className="block h-auto w-full rounded-lg" width={1672} height={941}
        onLoad={event => { setState('ready'); onSize?.(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight) }} onError={() => setState('error')} />
      {state === 'ready' && <svg viewBox="0 0 1672 941" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        {task === 'segmentation' && <rect width="1672" height="941" fill="#fbbf24" fillOpacity="0.18" />}
        {animals.map((animal, i) => <g key={animal.name}>
          {task === 'segmentation' && <path d={animal.path} fill={i < 2 ? '#8b5cf6' : '#06b6d4'} fillOpacity="0.48" stroke="#fff" strokeWidth="5" />}
          {(task === 'detection' || (task === 'localization' && i === 0)) && <rect x={animal.box[0]} y={animal.box[1]} width={animal.box[2]} height={animal.box[3]} fill="none" stroke={i < 2 ? '#6d28d9' : '#0369a1'} strokeWidth="8" />}
          {task && task !== 'classification' && (task !== 'localization' || i === 0) && <g><rect x={animal.box[0]} y={animal.box[1]} width="124" height="124" rx="12" fill="white" stroke="#0f172a" strokeWidth="3" /><text x={animal.box[0] + 62} y={animal.box[1] + 94} textAnchor="middle" fontSize="96" fontWeight="bold" fill="#0f172a">{i + 1}</text></g>}
        </g>)}
        {overlay}
      </svg>}
    </div>
    {state === 'loading' && <p role="status" className="mt-2 text-sm">이미지 불러오는 중…</p>}
    {state === 'error' && <div role="alert" className="mt-2 rounded-lg border border-rose-300 p-3 text-sm"><p>이미지를 불러오지 못했습니다.</p><button type="button" className="mt-2 min-h-11 rounded-lg border px-3 font-bold" onClick={() => { setState('loading'); setAttempt(value => value + 1) }}>이미지 다시 불러오기</button></div>}
    {task && task !== 'classification' && <p className="mt-2 text-sm leading-6">{task === 'localization' ? animals[0].name : animals.map(animal => animal.name).join(' · ')}{task === 'segmentation' ? ' · 나머지는 배경. 동물의 형태를 따라 경계를 간략화한 주석입니다.' : ' · 위치 상자와 번호는 교육용 주석입니다.'}</p>}
  </div>
}
