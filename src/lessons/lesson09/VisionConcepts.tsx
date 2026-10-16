import { VISION_TASKS, type VisionTask } from './lesson09Data'
import PetSourceImage from './PetSourceImage'
import PetImageLab from './PetImageLab'

// 같은 교육용 장면을 네 작업에서 재사용합니다. 실제 모델의 출력이 아닙니다.
function PetScene({ task }: { task?: VisionTask }) {
  return <PetSourceImage task={task} />
}

export function VisionIntroduction({ active }: { active: boolean }) {
  return <section className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 sm:p-5" aria-label="이미지와 정답, 예측의 관계 설명">
    <h3 className="font-black">먼저 이해하기 · 사진을 본다는 것은?</h3>
    <p className="mt-2 text-sm leading-6">큰 고양이·작은 고양이·강아지가 함께 있는 생성 이미지입니다. <strong>① 픽셀</strong>은 이미지를 이루는 작은 칸입니다. 컬러 사진은 색상 값을 사용하고, 흑백에서는 각 칸의 값이 밝기를 나타냅니다. 칸의 배열은 위치를, 여러 칸의 관계는 윤곽이나 질감 같은 패턴을 나타냅니다.</p>
    <PetImageLab mode="pixels" active={active} />
    <p className="mt-2 text-sm leading-6">이번 분류 질문은 ‘동물이 있는 사진인가, 없는 사진인가?’입니다. 여러 동물이 함께 있으므로 이 사진에 반드시 고양이 또는 강아지라는 단일 정답만 있는 것은 아닙니다.</p>
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-violet-200 bg-white p-4"><strong>② 이미지 입력 → 인공신경망 → 모델 예측</strong><svg viewBox="0 0 260 110" className="mt-3 w-full max-w-xs" role="img" aria-label="여러 인공 뉴런이 연결되어 정보를 전달하는 설명용 인공신경망"><g stroke="#64748b" strokeWidth="2">{[25, 80].flatMap(y => [20, 55, 90].map(next => <path key={`${y}-${next}`} d={`M35 ${y} L130 ${next} L225 55`} />))}</g>{[[35, 25], [35, 80], [130, 20], [130, 55], [130, 90], [225, 55]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="13" fill="#ede9fe" stroke="#6d28d9" strokeWidth="2" />)}</svg><p className="text-sm leading-6"><strong>인공신경망</strong>은 여러 인공 뉴런을 연결해 정보를 처리하는 구조입니다. 원은 뉴런, 선은 정보가 전달되는 연결입니다. 모델은 입력에서 배운 패턴을 이용해 결과를 만듭니다.</p><p className="mt-2 rounded-lg bg-violet-50 p-3 text-sm"><strong>모델 예측은 모델이 입력을 보고 내놓는 결과</strong>입니다. 실제로 실행해야 알 수 있으며, 이 설명에서는 예측값을 만들어 표시하지 않습니다.</p></div>
      <div className="rounded-xl border-2 border-amber-300 bg-white p-4"><strong>③ 레이블 · 비교할 정답 정보</strong><p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm"><strong>이 질문의 교육용 레이블: ‘동물 있음’</strong> — 사람이 정한 분류 기준에 따라 붙이는 정답 정보입니다.</p><p className="mt-3 text-sm leading-6">레이블은 사진의 픽셀 자체도, 모델의 예측도 아닙니다. 학습·평가에서 실제 모델의 예측과 비교합니다. 이 화면에서는 학습된 모델을 실행하지 않습니다.</p></div>
    </div>
    <p className="mt-4 text-sm font-bold">이제 아래에서 픽셀 정보·관계에서 찾는 패턴·레이블·모델 예측을 구분해 보세요.</p>
  </section>
}

export function VisionTaskExamples() {
  const results: Record<VisionTask, string> = {
    classification: '정한 기준에 따른 이미지 전체의 종류: 동물 있음 (교육용 레이블, 모델 예측 아님)',
    localization: '지정한 대상 ① 큰 고양이의 종류 + 사각형 위치 하나',
    detection: '①·② 고양이, ③ 강아지 + 각각의 사각형 위치',
    segmentation: '①·② 고양이 영역, ③ 강아지 영역, 나머지 배경을 픽셀별로 구분',
  }
  return <section className="mb-6" aria-label="같은 이미지로 네 컴퓨터 비전 작업 비교">
    <h3 className="font-black">같은 장면, 서로 다른 질문과 결과</h3>
    <p className="mt-2 text-sm leading-6">같은 생성 이미지에 결과의 형식을 설명하는 주석을 붙였습니다. 상자·이름·분할 영역은 사람이 그린 교육용 주석이지 모델의 탐지·분할 결과가 아닙니다. 분할은 동물의 형태를 따라 경계를 간략화했습니다. 네 작업은 순서대로 거치는 네 단계가 아닙니다.</p>
    <div className="mt-4 grid gap-4 md:grid-cols-2">{(Object.keys(VISION_TASKS) as VisionTask[]).map(task => <figure key={task} className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4"><h4 className="mb-3 font-black">{VISION_TASKS[task].name}</h4><PetScene task={task} /><figcaption className="mt-3 text-sm leading-6"><p><strong>묻는 것:</strong> {task === 'classification' ? '이미지 전체를 동물이 있는 사진 / 없는 사진으로 나누면 어느 종류인가?' : task === 'localization' ? '지정한 큰 고양이 한 마리는 무엇이며 어디에 있는가?' : VISION_TASKS[task].question}</p><p className="mt-2"><strong>나오는 결과:</strong> {results[task]}</p></figcaption></figure>)}</div>
  </section>
}
