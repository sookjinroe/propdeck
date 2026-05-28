import { cn } from '@/lib/utils'
import type { SlideData } from '@/types'

const headColors = {
  blue:   'from-blue-600 to-blue-700',
  green:  'from-emerald-600 to-emerald-700',
  purple: 'from-violet-600 to-violet-700',
  dark:   'from-slate-800 to-slate-900',
}

interface Props {
  slide: SlideData
  index: number
  total: number
  onClick?: () => void
  size?: 'sm' | 'lg'
  active?: boolean
}

export function SlideThumbnail({ slide, index, total, onClick, size = 'sm', active }: Props) {
  const isLg = size === 'lg'
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex-shrink-0 rounded-md overflow-hidden border-2 flex flex-col cursor-pointer transition-all',
        isLg ? 'w-full' : 'w-72 h-[162px]',
        active ? 'border-blue-500 shadow-lg shadow-blue-100' : 'border-stone-200 hover:border-blue-400 hover:shadow-md hover:shadow-blue-50',
        !isLg && '-translate-y-0 hover:-translate-y-0.5',
      )}
    >
      {/* slide header */}
      <div className={cn('bg-gradient-to-br flex flex-col justify-end px-3 py-2', headColors[slide.color], isLg ? 'h-[30%]' : 'h-[38%]')}>
        <p className={cn('font-bold text-white truncate', isLg ? 'text-sm' : 'text-[8px]')}>{slide.title}</p>
        <p className={cn('text-white/60 truncate', isLg ? 'text-xs' : 'text-[6.5px]')}>{slide.sub}</p>
      </div>
      {/* slide body */}
      <div className={cn('flex-1 bg-white flex gap-2 items-center', isLg ? 'px-5 py-3' : 'px-2 py-1.5')}>
        <div className="flex-1 flex flex-col gap-1.5 justify-center">
          {[85, 65, 78, 55].map((w, i) => (
            <div key={i} className={cn('rounded-full bg-stone-100', isLg ? 'h-2' : 'h-1')} style={{ width: `${w}%` }} />
          ))}
        </div>
        {/* mini chart */}
        <div className={cn('flex items-end gap-0.5', isLg ? 'w-16 h-12' : 'w-8 h-6')}>
          {[60, 100, 40, 80].map((h, i) => (
            <div key={i} className={cn('flex-1 rounded-t-sm', i % 2 === 0 ? 'bg-blue-100' : 'bg-blue-500')} style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
      {/* slide number */}
      {!isLg && (
        <div className="absolute bottom-1 right-1.5 text-[6px] text-stone-400 bg-white/80 px-1 rounded">
          {index + 1}/{total}
        </div>
      )}
    </div>
  )
}
