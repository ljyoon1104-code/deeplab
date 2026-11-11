import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, FlaskConical } from 'lucide-react'
import { BottomLessonNavigation } from '../../components/BottomLessonNavigation'
import { useProgress } from '../../hooks/useProgress'
import { pinnedHeaderOffset } from '../../lib/viewportLayout'
import { useMnistCourse, type CourseScene } from './CourseSession'
import { useLesson08Lab } from '../lesson08/Lesson08Context'
import { PreparationScenes } from './PreparationScenes'
import { TrainingScenes } from './TrainingScenes'

const SupplementalLessons = lazy(() => import('./SupplementalLessons'))
const scenes = [
  ['손글씨 인식 문제', '0~4분', '입력 사진·예측·실제 정답을 구별합니다.'],
  ['사진을 숫자로 준비', '4~12분', '같은 사진의 숫자를 연결하고 정규화 한 칸을 계산합니다.'],
  ['실제 신경망의 예측', '12~18분', '준비한 입력이 층을 거쳐 예측 확률이 되는 과정을 봅니다.'],
  ['실제 학습과 변화', '18~28분', '한 번 학습하고 실제 손실·정확도의 변화를 해석합니다.'],
  ['Test 평가', '28~36분', '별도 Test로 평가한 뒤 맞힌 수로 정확도를 계산합니다.'],
  ['오분류와 내 손글씨', '36~43분', '실제 관찰과 원인 추측을 구별하고 입력을 바꾸어 비교합니다.'],
  ['설명·정리·완료', '43~50분', '내 결과를 근거로 입력 준비부터 평가까지 연결합니다.'],
] as const
const requirementScenes: Record<string, CourseScene> = { normalization: 2, 'actual-training': 4, 'train-interpret': 4, accuracy: 5, 'error-analysis': 6, 'drawing-comparison': 6, 'final-explain': 7 }

export function MnistIntegratedLesson({ part }: { part: '07' | '08' }) {
  const course = useMnistCourse()
  const lab = useLesson08Lab()
  const { progress } = useProgress()
  const navigate = useNavigate()
  const heading = useRef<HTMLHeadingElement>(null)
  const [supplementOpened, setSupplementOpened] = useState(false)
  const [supplementMounted, setSupplementMounted] = useState(false)
  const previous = useRef<number | null>(null)
  const requestedScene = useRef<CourseScene | null>(null)
  const currentScene = useRef(course.record.scene)
  currentScene.current = course.record.scene
  // The original two URLs remain the front/back entrance to one session.
  const scene = course.record.scene
  useEffect(() => {
    const requested = requestedScene.current
    requestedScene.current = null
    if (requested && (requested <= 3 ? '07' : '08') === part) {
      course.setScene(requested)
    } else if ((currentScene.current <= 3 ? '07' : '08') !== part) {
      course.setScene(part === '07' ? 1 : 4)
    }
  }, [part, course.setScene])
  useEffect(() => {
    if (previous.current === scene) return
    const wasEntered = previous.current !== null
    previous.current = scene
    if (!wasEntered) return
    const title = heading.current
    if (!title) return
    title.style.scrollMarginTop = `${pinnedHeaderOffset() + 44}px`
    title.focus({ preventScroll: true })
    title.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }, [scene])
  const go = (next: number) => {
    const target = Math.max(1, Math.min(7, next)) as CourseScene
    requestedScene.current = target
    course.setScene(target)
    navigate(`/lesson/${target <= 3 ? '07' : '08'}`)
  }
  const done = course.requirements.filter((item) => item.ready).length

  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link className="inline-flex min-h-12 items-center gap-2 rounded-lg font-semibold focus-visible:outline-2 focus-visible:outline-indigo-600" to="/"><ArrowLeft size={18} />홈</Link>
        <p className="text-right text-sm font-bold">7·8차시 통합 실습 · {part === '07' ? '앞부분' : '뒷부분'}<br /><span className="font-normal text-slate-600">{course.record.completedAt ? '통합 완료 기록 있음' : `필수 활동 ${done}/${course.requirements.length}`}</span></p>
      </div>
    </header>
    <main className="mx-auto min-w-0 max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-start gap-3"><FlaskConical className="mt-1 shrink-0 text-indigo-600" /><div className="min-w-0"><h1 className="text-2xl font-black sm:text-3xl">50분 손글씨 인식 실습</h1><p className="mt-2 leading-6 text-slate-600">사진 준비부터 실제 학습·평가·내 손글씨 예측까지 이어집니다. 시간은 수업 목표이며, 기기별 실행 시간은 다를 수 있습니다.</p></div></div>
      <nav aria-label="통합 실습 장면" className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">{scenes.map(([title], i) => <button key={title} type="button" aria-current={scene === i + 1 ? 'step' : undefined} onClick={() => go(i + 1)} className={`min-h-12 rounded-xl border px-3 py-3 text-left text-sm font-bold focus-visible:outline-3 focus-visible:outline-indigo-600 ${scene === i + 1 ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>{i + 1}. {title}</button>)}</nav>
      <div className="mb-5 rounded-xl bg-indigo-50 p-4 text-sm leading-6">
        <p>장면은 자유롭게 이동할 수 있습니다. 이동이나 설명 관찰은 제출·완료와 별개이며, 학습 중 이동해도 현재 실행과 모델은 유지됩니다.</p>
        {lab.isBusy && <p role="status" className="mt-1 font-bold">실제 실행이 진행 중입니다. 장면 4에서 진행 상태와 취소를 확인할 수 있습니다.</p>}
        {course.record.completedAt && <p className="mt-1 font-bold">통합 완료 기록은 유지됩니다. 아래 조건은 현재 복습 답안과 연결된 실험 기준입니다.</p>}
      </div>
      <div className="mb-5"><p className="text-sm font-bold text-indigo-700">장면 {scene}/7 · 수업 목표 {scenes[scene - 1][1]}</p><h2 ref={heading} tabIndex={-1} id="mnist-course-title" className="mt-1 text-2xl font-black focus:outline-none">{scenes[scene - 1][0]}</h2><p className="mt-2 leading-7">{scenes[scene - 1][2]}</p></div>
      <div className="min-w-0">
        <div hidden={scene > 3}><PreparationScenes scene={scene} /></div>
        <TrainingScenes scene={scene} />
      </div>
      {course.record.completedAt && scene === 7 && <div role="status" className="mt-6 rounded-2xl border border-emerald-300 bg-emerald-50 p-5"><h3 className="flex items-center gap-2 text-xl font-bold text-emerald-800"><Check />통합 실습을 완료했습니다.</h3><p className="mt-2">답안·실험 결과와 완료 기록은 이 주소에 저장됩니다. 새로고침 후 실제 모델은 다시 학습해야 사용할 수 있으며, 저장된 결과는 그대로 확인할 수 있습니다.</p></div>}
      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-4" aria-labelledby="course-requirements"><h3 id="course-requirements" className="font-bold">필수 활동 · 완료한 활동도 다시 확인할 수 있습니다</h3><div className="mt-3 grid gap-2 sm:grid-cols-2">{course.requirements.map((item) => <button key={item.id} type="button" className="min-h-12 rounded-lg border border-slate-200 p-3 text-left text-sm focus-visible:outline-3 focus-visible:outline-indigo-600" onClick={() => go(requirementScenes[item.id] ?? 7)}>{item.ready ? '✓ 확인됨' : '○ 남음'} · {item.label}</button>)}</div></section>
      <BottomLessonNavigation currentStep={scene} onPrevious={() => go(scene - 1)} onNext={() => go(scene + 1)} canComplete={course.readyToComplete} lessonCompleted={Boolean(course.record.completedAt)} onComplete={() => course.complete()} />
      <details className="mt-6 rounded-2xl border border-slate-200 bg-white p-4" open={supplementOpened} onToggle={(event) => { const open = event.currentTarget.open; setSupplementOpened(open); if (open) setSupplementMounted(true) }}>
        <summary className="min-h-12 cursor-pointer font-bold leading-7">선택 탐구 · 기존 7·8차시의 자세한 풀이와 추가 실험</summary>
        <p className="my-4 text-sm leading-6 text-slate-600">기존 14 STEP의 계산·관찰·문항과 기록을 보존했습니다. 여기의 미완료 활동이나 두 번째 실험은 위 통합 완료를 막지 않습니다. 기존 완료 기록: 7차시 {progress['07'].completed ? '완료' : `${progress['07'].completedSteps.length}/7 STEP`}, 8차시 {progress['08'].completed ? '완료' : `${progress['08'].completedSteps.length}/7 STEP`}. 통합 기록과는 별도로 표시합니다.</p>
        {supplementMounted && <Suspense fallback={<p>보충 활동을 불러오는 중입니다.</p>}><SupplementalLessons /></Suspense>}
      </details>
    </main>
  </div>
}
