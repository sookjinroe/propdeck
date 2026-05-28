import type { Chapter } from '../types';
import { buildTree, flattenTree, getChapterNumber, normalizeOrders, maturityScore } from '../lib/chapters';

interface Props {
  chapters: Chapter[]; activeChapterId: string | null; activeView: string;
  score: number; done: number; review: number; wip: number; total: number;
  onSelectView: (v: string) => void; onSelectChapter: (id: string) => void;
  onUpdateChapters: (chs: Chapter[]) => void;
}

const NAV_ITEMS = [
  { id: 'overview', icon: '≡', label: '목차 / 인텐트' },
  { id: 'fullview', icon: '◫', label: '전체 보기' },
  { id: 'ref', icon: '⊟', label: '참고 문서' },
];

export default function Sidebar({ chapters, activeChapterId, activeView, score, done, review, wip, total, onSelectView, onSelectChapter, onUpdateChapters }: Props) {
  const ordered = flattenTree(buildTree(chapters));
  const statusDot: Record<string, string> = {
    done: 'rgb(var(--forest))', review: 'rgb(var(--amber))', wip: 'rgb(var(--navy))', todo: 'rgb(var(--rule))'
  };

  return (
    <aside className="w-52 shrink-0 flex flex-col border-r overflow-hidden" style={{ background: 'rgb(var(--paper))', borderColor: 'rgb(var(--rule))' }}>
      {/* Nav */}
      <div className="border-b" style={{ borderColor: 'rgb(var(--rule))' }}>
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => onSelectView(item.id)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs transition-colors text-left"
            style={{ background: activeView === item.id ? 'rgb(var(--parchment))' : 'transparent',
              color: activeView === item.id ? 'rgb(var(--ink))' : 'rgb(var(--stone))',
              fontWeight: activeView === item.id ? 600 : 400,
              borderLeft: activeView === item.id ? '2px solid rgb(var(--rust))' : '2px solid transparent' }}>
            <span className="text-base w-4 text-center leading-none">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Maturity score */}
      {total > 0 && (
        <div className="px-4 py-3 border-b" style={{ borderColor: 'rgb(var(--rule))' }}>
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'rgb(var(--stone))' }}>완성도</span>
            <span className="font-serif text-base font-normal" style={{ color: 'rgb(var(--ink))' }}>{score}%</span>
          </div>
          <div className="h-0.5 w-full flex gap-px overflow-hidden" style={{ background: 'rgb(var(--rule))' }}>
            <div style={{ width: `${done/total*100}%`, background: 'rgb(var(--forest))' }} className="h-full" />
            <div style={{ width: `${review/total*100}%`, background: 'rgb(var(--amber))' }} className="h-full" />
            <div style={{ width: `${wip/total*100}%`, background: 'rgb(var(--navy))' }} className="h-full" />
          </div>
          <div className="flex gap-3 mt-1.5">
            {[['완', done, 'rgb(var(--forest))'], ['검', review, 'rgb(var(--amber))'], ['작', wip, 'rgb(var(--navy))']].map(([l, n, c]) => (
              <span key={l as string} className="text-[10px] flex items-center gap-0.5" style={{ color: 'rgb(var(--stone))' }}>
                <span className="w-1.5 h-1.5 rounded-sm" style={{ background: c as string }} />{l} {n}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Chapter list */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'rgb(var(--stone))' }}>챕터</span>
          <button onClick={() => { /* handled in overview */ }} className="text-xs" style={{ color: 'rgb(var(--stone))' }} title="목차/인텐트에서 추가">+</button>
        </div>
        {ordered.length === 0 && (
          <p className="px-4 py-3 text-xs italic" style={{ color: 'rgb(var(--stone))' }}>챕터 없음</p>
        )}
        {ordered.map(({ ch, depth }) => {
          const num = getChapterNumber(ch.id, chapters);
          const isActive = activeChapterId === ch.id;
          return (
            <button key={ch.id} onClick={() => onSelectChapter(ch.id)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors text-xs"
              style={{ paddingLeft: `${12 + depth * 12}px`,
                background: isActive ? 'rgb(var(--parchment))' : 'transparent',
                color: isActive ? 'rgb(var(--ink))' : 'rgb(var(--stone))',
                fontWeight: isActive ? 600 : 400,
                borderLeft: isActive ? '2px solid rgb(var(--rust))' : '2px solid transparent' }}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-px" style={{ background: statusDot[ch.status] }} />
              <span className="font-mono text-[10px] shrink-0 tabular-nums" style={{ color: 'rgb(var(--stone))' }}>{num}</span>
              <span className="truncate">{ch.name || '(미제목)'}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
