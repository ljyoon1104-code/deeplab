interface CaseItem { id: string; label: string; done: boolean }

/** Changes only the visible case. Answers remain in the parent activity state. */
export default function ActivityCaseNavigation({ label, items, selected, onSelect }: {
  label: string
  items: CaseItem[]
  selected: string
  onSelect: (id: string) => void
}) {
  return <nav aria-label={label} className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
    <p className="mb-2 text-sm font-bold">{label} · {items.filter(item => item.done).length}/{items.length} 해결</p>
    <div className="flex flex-wrap gap-2">{items.map(item => <button key={item.id} type="button" aria-pressed={selected === item.id} onClick={() => onSelect(item.id)} className={`min-h-11 rounded-lg border px-3 py-2 text-sm font-bold ${selected === item.id ? 'border-violet-700 bg-violet-100 text-violet-950' : 'border-slate-300 bg-white text-slate-800'}`}>{item.label} · {item.done ? '✓' : '○'}</button>)}</div>
  </nav>
}
