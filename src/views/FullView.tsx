import type { Chapter } from '../types';
import { buildTree, flattenTree, getChapterNumber } from '../lib/chapters';
import SlideStrip from '../components/SlideStrip';

const STATUS_LABELS = { done: '완료', review: '검토중', wip: '작성중', todo: '시작 전' };
const STATUS_COLORS = {
  done: 'rgb(var(--forest))', review: 'rgb(var(--amber))',
  wip: 'rgb(var(--navy))', todo: 'rgb(var(--stone))'
};

export default function FullView({ chapters, onGoToEditor }: { chapters: Chapter[]; onGoToEditor: (id: string) => void }) {
  const ordered = flattenTree(buildTree(chapters));
  const withPpt = chapters.filter(c => c.pptVersions.length > 0).length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* View bar */}
      <div className="flex items-center gap-4 px-6 py-3 border-b shrink-0" style={{ background: 'rgb(var(--paper))', borderColor: 'rgb(var(--rule))' }}>
        <h2 className="font-serif text-base" style={{ color: 'rgb(var(--ink))' }}>전체 보기</h2>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'rgb(var(--stone))' }}>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 inline-block" style={{ background: 'rgb(var(--rust))' }} />PPT {withPpt}챕터</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 inline-block" style={{ background: 'rgb(var(--rule))' }} />미업로드 {chapters.length - withPpt}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {ordered.map(({ ch, depth }) => {
            const num = getChapterNumber(ch.id, chapters);
            const slides = ch.slides || [];
            const hasPpt = ch.pptVersions.length > 0;
            const latest = ch.pptVersions[0];

            return (
              <div key={ch.id} className="border overflow-hidden"
                style={{ marginLeft: `${depth * 24}px`, borderColor: 'rgb(var(--rule))', borderRadius: 'var(--radius)', background: 'rgb(var(--paper))' }}>

                {/* Chapter header */}
                <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'rgb(var(--rule))' }}>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] tabular-nums" style={{ color: 'rgb(var(--stone))' }}>{num}</span>
                    <span className="font-semibold text-sm" style={{ color: 'rgb(var(--ink))' }}>{ch.name}</span>
                    {hasPpt && latest && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5" style={{ background: 'rgb(var(--navy-bg))', color: 'rgb(var(--navy))', borderRadius: '2px' }}>
                        v{latest.version} · {latest.uploader}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs flex items-center gap-1.5" style={{ color: STATUS_COLORS[ch.status] }}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: STATUS_COLORS[ch.status] }} />
                      {STATUS_LABELS[ch.status]}
                    </span>
                    <button onClick={() => onGoToEditor(ch.id)}
                      className="text-xs font-medium transition-opacity hover:opacity-60"
                      style={{ color: 'rgb(var(--rust))' }}>편집 →</button>
                  </div>
                </div>

                {/* Body: slides left, text right */}
                <div className="flex divide-x" style={{ minHeight: '120px' }}>
                  {/* PPT slides column */}
                  <div className="w-3/5 p-4">
                    <p className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: 'rgb(var(--stone))' }}>
                      PPT 슬라이드 {hasPpt && slides.length > 0 && <span className="font-normal normal-case tracking-normal ml-1">{slides.length}장</span>}
                    </p>
                    <SlideStrip
                      slides={slides}
                      chapterName={ch.name}
                      onUpload={() => onGoToEditor(ch.id)}
                    />
                  </div>

                  {/* Text draft column */}
                  <div className="w-2/5 p-4">
                    <p className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: 'rgb(var(--stone))' }}>텍스트 초안</p>
                    {ch.text ? (
                      <div className="text-xs leading-relaxed line-clamp-5" style={{ color: 'rgb(var(--ink))' }}
                        dangerouslySetInnerHTML={{ __html: ch.text }} />
                    ) : (
                      <button onClick={() => onGoToEditor(ch.id)} className="text-xs italic transition-opacity hover:opacity-70" style={{ color: 'rgb(var(--stone))' }}>
                        아직 작성된 내용이 없습니다. 클릭해서 작성하기 →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {chapters.length === 0 && (
            <p className="text-center py-20 text-sm italic" style={{ color: 'rgb(var(--stone))' }}>챕터가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
