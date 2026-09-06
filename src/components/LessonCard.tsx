import { Check, ChevronRight, Circle, Clock3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { LessonMetadata } from '../types/lesson'
import type { LessonProgress, LessonStatus } from '../types/progress'
import { ProgressBar } from './ProgressBar'
import { Card } from './ui/Card'

interface LessonCardProps {
  lesson: LessonMetadata
  progress: LessonProgress
}

const getStatus = (progress: LessonProgress): LessonStatus => {
  if (progress.completed) return '완료'
  if (progress.currentStep > 1 || progress.completedSteps.length > 0) {
    return '진행 중'
  }
  return '미완료'
}

const statusStyles: Record<LessonStatus, string> = {
  미완료: 'bg-slate-100 text-slate-700',
  '진행 중': 'bg-amber-100 text-amber-900',
  완료: 'bg-emerald-100 text-emerald-800',
}

const StatusIcon = ({ status }: { status: LessonStatus }) => {
  if (status === '완료') return <Check size={15} aria-hidden="true" />
  if (status === '진행 중') return <Clock3 size={15} aria-hidden="true" />
  return <Circle size={14} aria-hidden="true" />
}

export function LessonCard({ lesson, progress }: LessonCardProps) {
  const status = getStatus(progress)
  const actionLabel =
    status === '완료' ? '다시 보기' : status === '진행 중' ? '이어하기' : '시작하기'

  return (
    <Card
      as="article"
      className="group flex min-h-72 flex-col p-5 transition-transform duration-200 hover:-translate-y-1 hover:border-indigo-200 motion-reduce:transform-none motion-reduce:transition-none sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="text-3xl font-black tracking-tight text-indigo-600">
          {lesson.id}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[status]}`}
        >
          <StatusIcon status={status} />
          {status}
        </span>
      </div>

      <h3 className="mt-5 min-h-14 text-xl font-bold leading-snug tracking-tight text-slate-950">
        {lesson.title}
      </h3>
      <p className="mt-2 min-h-12 text-[0.95rem] leading-6 text-slate-600">
        {lesson.description}
      </p>

      <div className="mt-auto pt-6">
        <ProgressBar
          value={progress.progress}
          label="학습 진행률"
          size="sm"
        />
        <Link
          to={`/lesson/${lesson.id}`}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-between rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-700 transition-colors hover:bg-indigo-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          aria-label={`${lesson.id}차시 ${lesson.title} ${actionLabel}`}
        >
          <span>{actionLabel}</span>
          <ChevronRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </Card>
  )
}
