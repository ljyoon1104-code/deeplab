import { RotateCcw, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useProgress } from '../hooks/useProgress'
import { Button } from './ui/Button'

export function ResetProgressDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { resetProgress } = useProgress()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  const handleReset = () => {
    resetProgress()
    setIsOpen(false)
  }

  return (
    <>
      <Button variant="ghost" onClick={() => setIsOpen(true)}>
        <RotateCcw size={17} aria-hidden="true" />
        학습 기록 초기화
      </Button>

      <dialog
        ref={dialogRef}
        className="m-auto w-[min(92vw,28rem)] rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/35"
        onClose={() => setIsOpen(false)}
        aria-labelledby="reset-dialog-title"
      >
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-rose-600">기록 초기화</p>
              <h2 id="reset-dialog-title" className="mt-1 text-xl font-bold">
                모든 학습 기록을 지울까요?
              </h2>
            </div>
            <Button
              variant="ghost"
              className="min-h-11 min-w-11 px-2"
              onClick={() => setIsOpen(false)}
              aria-label="초기화 창 닫기"
            >
              <X size={20} aria-hidden="true" />
            </Button>
          </div>
          <p className="mt-4 leading-7 text-slate-600">
            저장된 STEP 위치와 완료 기록이 모두 삭제됩니다. 이 작업은 되돌릴 수
            없습니다.
          </p>
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              취소
            </Button>
            <Button variant="danger" onClick={handleReset}>
              <RotateCcw size={17} aria-hidden="true" />
              기록 초기화
            </Button>
          </div>
        </div>
      </dialog>
    </>
  )
}
