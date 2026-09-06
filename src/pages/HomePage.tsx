import { FlaskConical, Settings2 } from 'lucide-react'
import { LessonCard } from '../components/LessonCard'
import { ProgressBar } from '../components/ProgressBar'
import { ResetProgressDialog } from '../components/ResetProgressDialog'
import { SignalFlow } from '../components/SignalFlow'
import { lessonGroups, lessons } from '../data/lessons'
import { useProgress } from '../hooks/useProgress'

export function HomePage() {
  const { progress, summary } = useProgress()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <FlaskConical size={22} aria-hidden="true" />
            </span>
            <div>
              <p className="text-lg font-black tracking-tight text-slate-950">
                Deep Learning Lab
              </p>
              <p className="text-sm text-slate-600">신경망의 원리로 배우는 딥러닝</p>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.11),transparent_38%),radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.10),transparent_30%)]">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center lg:px-8">
            <div>
              <p className="text-sm font-bold tracking-[0.16em] text-indigo-600">
                고등학교 인공지능 기초
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
                Deep Learning Lab
              </h1>
              <p className="mt-4 text-lg leading-8 text-slate-600 sm:text-xl">
                신경망의 원리로 배우는 딥러닝
              </p>
              <div className="mt-8 max-w-2xl">
                <SignalFlow />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-35px_rgba(30,41,59,0.55)]">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600">전체 진행률</p>
                  <p className="mt-1 text-3xl font-black tabular-nums text-slate-950">
                    {summary.completedLessons}
                    <span className="mx-2 text-lg font-semibold text-slate-400">/</span>
                    {summary.totalLessons}
                    <span className="ml-2 text-sm font-semibold text-slate-600">차시 완료</span>
                  </p>
                </div>
              </div>
              <div className="mt-5">
                <ProgressBar
                  value={summary.percentage}
                  label="전체 차시 완료율"
                  showValue={false}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          {lessonGroups.map((group, groupIndex) => {
            const groupLessons = lessons.filter((lesson) => lesson.group === group.id)
            return (
              <section
                key={group.id}
                aria-labelledby={`group-${group.id}`}
                className={groupIndex === 0 ? '' : 'mt-14 border-t border-slate-200 pt-12'}
              >
                <div className="mb-6 max-w-3xl">
                  <p className="text-sm font-bold text-cyan-700">
                    영역 {String(groupIndex + 1).padStart(2, '0')}
                  </p>
                  <h2
                    id={`group-${group.id}`}
                    className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl"
                  >
                    {group.title}
                  </h2>
                  <p className="mt-2 leading-7 text-slate-600">{group.description}</p>
                </div>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {groupLessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      progress={progress[lesson.id]}
                    />
                  ))}
                </div>
              </section>
            )
          })}

          <section
            className="mt-14 flex flex-col gap-4 border-t border-slate-200 pt-8 sm:flex-row sm:items-center sm:justify-between"
            aria-labelledby="learning-settings-title"
          >
            <div>
              <div className="flex items-center gap-2 text-slate-900">
                <Settings2 size={18} aria-hidden="true" />
                <h2 id="learning-settings-title" className="font-bold">
                  학습 설정
                </h2>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                이 브라우저에 저장된 STEP 위치와 완료 기록을 관리합니다.
              </p>
            </div>
            <ResetProgressDialog />
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-slate-500 sm:px-6 lg:px-8">
          Deep Learning Lab · 학생용 고등학교 교육 웹앱
        </div>
      </footer>
    </div>
  )
}
