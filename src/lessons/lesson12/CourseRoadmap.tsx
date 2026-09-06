import { Link } from 'react-router-dom'
import { COURSE_ROADMAP } from './lesson12Data'

const tones = { cyan: 'border-cyan-200 bg-cyan-50', violet: 'border-violet-200 bg-violet-50', amber: 'border-amber-200 bg-amber-50' }

export default function CourseRoadmap() {
  return <div className="grid gap-4 lg:grid-cols-3">{COURSE_ROADMAP.map((group) => <section key={group.title} className={`rounded-2xl border p-5 ${tones[group.tone]}`}><h3 className="font-black">{group.title}</h3><div className="mt-4 grid gap-2">{group.lessons.map(([id, title]) => <Link key={id} to={`/lesson/${id}`} className="min-h-11 rounded-xl bg-white px-3 py-2 text-sm font-bold ring-1 ring-slate-200 hover:ring-indigo-400 focus-visible:outline-3 focus-visible:outline-indigo-600"><span className="mr-2 font-mono text-indigo-700">{id}</span>{title}</Link>)}</div></section>)}</div>
}

