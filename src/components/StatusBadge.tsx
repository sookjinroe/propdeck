import { cn } from '@/lib/utils'
import type { Status } from '@/types'

const config: Record<Status, { label: string; className: string }> = {
  todo:   { label: '시작 전', className: 'bg-stone-100 text-stone-400 border-stone-200' },
  wip:    { label: '작성중',  className: 'bg-blue-50 text-blue-600 border-blue-200' },
  review: { label: '검토중',  className: 'bg-amber-50 text-amber-600 border-amber-200' },
  done:   { label: '완료',    className: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
}

const dotColor: Record<Status, string> = {
  todo: 'bg-stone-300', wip: 'bg-blue-500', review: 'bg-amber-500', done: 'bg-emerald-500',
}

export function StatusBadge({ status }: { status: Status }) {
  const { label, className } = config[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border', className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', dotColor[status])} />
      {label}
    </span>
  )
}

export function StatusDot({ status }: { status: Status }) {
  return <span className={cn('w-2 h-2 rounded-full flex-shrink-0', dotColor[status])} />
}
