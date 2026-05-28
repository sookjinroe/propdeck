import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { SlideThumbnail } from './SlideThumbnail'
import { cn } from '@/lib/utils'
import type { SlideData } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  chapterTitle: string
  slides: SlideData[]
  initialIndex?: number
}

export function SlideViewerDialog({ open, onClose, chapterTitle, slides, initialIndex = 0 }: Props) {
  const [idx, setIdx] = useState(initialIndex)
  const slide = slides[idx]
  if (!slide) return null

  const headColors = {
    blue: 'from-blue-600 to-blue-700',
    green: 'from-emerald-600 to-emerald-700',
    purple: 'from-violet-600 to-violet-700',
    dark: 'from-slate-800 to-slate-900',
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl p-0 gap-0 bg-slate-900 border-slate-700 overflow-hidden">
        {/* header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-700 bg-slate-800">
          <span className="text-sm font-semibold text-white">{chapterTitle}</span>
          <span className="text-xs text-slate-400">슬라이드 {idx + 1} / {slides.length}</span>
          <button onClick={onClose} className="ml-auto w-7 h-7 rounded-md bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* main slide */}
        <div className="p-5 flex flex-col gap-4">
          <div className="w-full aspect-video rounded-lg overflow-hidden flex flex-col shadow-2xl">
            <div className={cn('bg-gradient-to-br flex flex-col justify-end px-8 py-5', headColors[slide.color])} style={{ height: '30%' }}>
              <p className="text-xl font-bold text-white mb-1">{slide.title}</p>
              <p className="text-sm text-white/60">{slide.sub}</p>
            </div>
            <div className="flex-1 bg-white flex gap-6 px-8 py-5 items-center">
              <div className="flex-1 flex flex-col gap-2.5">
                {[88, 68, 80, 60, 74].map((w, i) => (
                  <div key={i} className={cn('h-2 rounded-full', i === 2 ? 'bg-blue-100' : 'bg-stone-100')} style={{ width: `${w}%` }} />
                ))}
              </div>
              <div className="w-32 flex items-end gap-1.5 h-24">
                {[60, 100, 40, 80, 55].map((h, i) => (
                  <div key={i} className={cn('flex-1 rounded-t', i % 2 === 0 ? 'bg-blue-100' : 'bg-blue-500')} style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>

          {/* nav */}
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0} className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white disabled:opacity-30">
              <ChevronLeft className="w-4 h-4 mr-1" /> 이전
            </Button>
            <span className="text-xs text-slate-400 min-w-12 text-center">{idx + 1} / {slides.length}</span>
            <Button variant="outline" size="sm" onClick={() => setIdx(Math.min(slides.length - 1, idx + 1))} disabled={idx === slides.length - 1} className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white disabled:opacity-30">
              다음 <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* strip */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {slides.map((s, i) => (
              <div key={i} onClick={() => setIdx(i)} className={cn('w-24 h-14 flex-shrink-0 rounded overflow-hidden flex flex-col border-2 cursor-pointer transition-all', i === idx ? 'border-blue-400 opacity-100' : 'border-slate-600 opacity-50 hover:opacity-75')}>
                <div className={cn('bg-gradient-to-br flex-shrink-0', headColors[s.color])} style={{ height: '40%' }}>
                  <p className="text-[5px] font-bold text-white px-1.5 pt-1 truncate">{s.title}</p>
                </div>
                <div className="flex-1 bg-white flex flex-col gap-0.5 justify-center px-1.5 py-1">
                  {[80, 60, 70].map((w, j) => <div key={j} className="h-0.5 bg-stone-200 rounded-full" style={{ width: `${w}%` }} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
