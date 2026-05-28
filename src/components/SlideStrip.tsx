import { useState } from 'react';
import type { SlideInfo } from '../types';

const COLOR_MAP = {
  rust:   { bg: 'rgb(var(--rust))',   light: 'rgb(var(--rust-bg))',   line: 'rgba(184,92,56,0.25)' },
  forest: { bg: 'rgb(var(--forest))', light: 'rgb(var(--forest-bg))', line: 'rgba(61,107,79,0.25)' },
  navy:   { bg: 'rgb(var(--navy))',   light: 'rgb(var(--navy-bg))',   line: 'rgba(28,78,138,0.25)' },
  amber:  { bg: 'rgb(var(--amber))',  light: 'rgb(var(--amber-bg))',  line: 'rgba(139,105,20,0.25)' },
};

interface Props {
  slides: SlideInfo[];
  chapterName: string;
  onUpload?: () => void;
}

export default function SlideStrip({ slides, chapterName, onUpload }: Props) {
  const [viewerIdx, setViewerIdx] = useState<number | null>(null);

  if (!slides.length) return (
    <button onClick={onUpload}
      className="w-full border-2 border-dashed py-8 text-xs transition-colors hover:opacity-70 text-center"
      style={{ borderColor: 'rgb(var(--rule))', color: 'rgb(var(--stone))', borderRadius: 'var(--radius)' }}>
      📎 PPT 업로드하기
    </button>
  );

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
        {slides.map((sl, i) => {
          const c = COLOR_MAP[sl.color] || COLOR_MAP.navy;
          return (
            <button key={i} onClick={() => setViewerIdx(i)}
              className="shrink-0 border overflow-hidden transition-transform hover:scale-105"
              style={{ width: '160px', borderColor: 'rgb(var(--rule))', borderRadius: 'var(--radius)', background: 'rgb(var(--paper))' }}>
              {/* Slide header */}
              <div className="px-3 py-2.5" style={{ background: c.bg }}>
                <div className="text-[10px] font-semibold leading-tight text-white truncate">{sl.title}</div>
                <div className="text-[9px] opacity-70 text-white truncate mt-0.5">{sl.sub}</div>
              </div>
              {/* Mock content lines */}
              <div className="p-2 space-y-1.5">
                {[88,68,76,82,60].map((w, j) => (
                  <div key={j} className="h-1.5 rounded-sm" style={{ width: `${w}%`, background: j % 2 === 0 ? c.line : 'rgb(var(--rule))' }} />
                ))}
              </div>
              {/* Slide number */}
              <div className="px-2 pb-1.5 text-right text-[9px]" style={{ color: 'rgb(var(--stone))' }}>{i+1} / {slides.length}</div>
            </button>
          );
        })}
      </div>

      {/* Slide viewer modal */}
      {viewerIdx !== null && (
        <SlideViewer slides={slides} initialIdx={viewerIdx} chapterName={chapterName} onClose={() => setViewerIdx(null)} />
      )}
    </>
  );
}

function SlideViewer({ slides, initialIdx, chapterName, onClose }: { slides: SlideInfo[]; initialIdx: number; chapterName: string; onClose: () => void }) {
  const [idx, setIdx] = useState(initialIdx);
  const sl = slides[idx];
  const c = COLOR_MAP[sl.color] || COLOR_MAP.navy;

  const prev = () => setIdx(i => Math.max(0, i - 1));
  const next = () => setIdx(i => Math.min(slides.length - 1, i + 1));

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prev();
    else if (e.key === 'ArrowRight') next();
    else if (e.key === 'Escape') onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: 'rgba(15,14,13,0.85)' }}
      onClick={onClose} onKeyDown={onKey} tabIndex={0} autoFocus>
      {/* Modal */}
      <div className="w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-white opacity-70">{chapterName}</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white opacity-50">{idx+1} / {slides.length}</span>
            <button onClick={onClose} className="text-white opacity-50 hover:opacity-100 text-lg">✕</button>
          </div>
        </div>

        {/* Slide */}
        <div className="border overflow-hidden shadow-2xl" style={{ borderColor: 'rgba(255,255,255,0.1)', borderRadius: 'calc(var(--radius) * 2)' }}>
          <div className="px-8 py-6" style={{ background: c.bg }}>
            <div className="text-white font-semibold text-lg leading-snug">{sl.title}</div>
            <div className="text-white opacity-70 text-sm mt-1">{sl.sub}</div>
          </div>
          <div className="p-8 space-y-3" style={{ background: 'rgb(var(--paper))' }}>
            {[88,72,64,80,56,76].map((w, j) => (
              <div key={j} className="h-2 rounded" style={{ width: `${w}%`, background: j % 3 === 0 ? c.line : 'rgb(var(--rule))' }} />
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <button onClick={prev} disabled={idx === 0} className="px-4 py-2 text-sm font-medium text-white rounded disabled:opacity-20 transition-opacity" style={{ background: 'rgba(255,255,255,0.1)' }}>← 이전</button>
          {/* Thumbnail strip */}
          <div className="flex gap-1.5 overflow-x-auto">
            {slides.map((s, i) => {
              const sc = COLOR_MAP[s.color] || COLOR_MAP.navy;
              return (
                <button key={i} onClick={() => setIdx(i)}
                  className="shrink-0 w-14 h-9 rounded overflow-hidden border-2 transition-all"
                  style={{ borderColor: i === idx ? 'white' : 'transparent', background: sc.bg }}>
                  <div className="w-full h-full flex items-center justify-center text-[8px] text-white font-medium opacity-80 px-1 truncate">{s.title}</div>
                </button>
              );
            })}
          </div>
          <button onClick={next} disabled={idx === slides.length-1} className="px-4 py-2 text-sm font-medium text-white rounded disabled:opacity-20 transition-opacity" style={{ background: 'rgba(255,255,255,0.1)' }}>다음 →</button>
        </div>
      </div>
    </div>
  );
}
