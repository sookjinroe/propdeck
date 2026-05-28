import { useState } from 'react';
import type { Chapter } from '../types';
import { buildTree, flattenTree, getChapterNumber } from '../lib/chapters';

interface Props {
  chapters: Chapter[];
  activeChapterId: string | null;
  activeView: string;
  score: number;
  done: number; review: number; wip: number; total: number;
  onSelectView: (v: string) => void;
  onSelectChapter: (id: string) => void;
  onUpdateChapters: (chs: Chapter[]) => void;
}

const NAV_ITEMS = [
  { id: 'overview', icon: '≡', label: '챕터 브리프' },
  { id: 'fullview', icon: '◫', label: '전체 보기' },
  { id: 'ref',      icon: '⊟', label: '참고 문서' },
];

const STATUS_DOT: Record<string, string> = {
  done:   'rgb(var(--forest))',
  review: 'rgb(var(--amber))',
  wip:    'rgb(var(--navy))',
  todo:   'rgb(var(--rule))',
};

export default function Sidebar({
  chapters, activeChapterId, activeView,
  score, done, review, wip, total,
  onSelectView, onSelectChapter,
}: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['ch1', 'ch2', 'ch3']));

  const tree = buildTree(chapters);

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const renderNodes = (nodes: ReturnType<typeof buildTree>, depth = 0): React.ReactNode => {
    return nodes.map(node => {
      const hasKids = node.children.length > 0;
      const isExpanded = expanded.has(node.id);
      const isActive = activeChapterId === node.id;
      const num = getChapterNumber(node.id, chapters);

      return (
        <div key={node.id}>
          <button
            onClick={() => onSelectChapter(node.id)}
            className="w-full flex items-center gap-1.5 py-1.5 text-left transition-colors group"
            style={{
              paddingLeft: `${12 + depth * 12}px`,
              paddingRight: '12px',
              background: isActive ? 'rgb(var(--parchment))' : 'transparent',
              color: isActive ? 'rgb(var(--ink))' : 'rgb(var(--stone))',
              fontWeight: isActive ? 600 : 400,
              borderLeft: isActive ? '2px solid rgb(var(--rust))' : '2px solid transparent',
            }}>
            {/* Expand toggle */}
            <span
              className="text-[9px] w-3 shrink-0 flex items-center justify-center transition-transform"
              style={{
                color: 'rgb(var(--stone))',
                transform: hasKids && isExpanded ? 'rotate(90deg)' : 'none',
                opacity: hasKids ? 1 : 0,
              }}
              onClick={e => { e.stopPropagation(); if (hasKids) toggle(node.id); }}>
              ▶
            </span>
            <span className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: STATUS_DOT[node.status] }} />
            <span className="font-mono text-[10px] tabular-nums shrink-0"
              style={{ color: 'rgb(var(--stone))', minWidth: '22px' }}>
              {num}
            </span>
            <span className="text-xs truncate flex-1">{node.name || '(미제목)'}</span>
          </button>

          {/* Children */}
          {hasKids && isExpanded && (
            <div style={{ borderLeft: '1px solid rgb(var(--rule))', marginLeft: `${16 + depth * 12}px` }}>
              {renderNodes(node.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <aside className="w-52 shrink-0 flex flex-col border-r overflow-hidden"
      style={{ background: 'rgb(var(--paper))', borderColor: 'rgb(var(--rule))' }}>

      {/* Nav items */}
      <div className="border-b" style={{ borderColor: 'rgb(var(--rule))' }}>
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => onSelectView(item.id)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs transition-colors text-left"
            style={{
              background: activeView === item.id ? 'rgb(var(--parchment))' : 'transparent',
              color: activeView === item.id ? 'rgb(var(--ink))' : 'rgb(var(--stone))',
              fontWeight: activeView === item.id ? 600 : 400,
              borderLeft: activeView === item.id ? '2px solid rgb(var(--rust))' : '2px solid transparent',
            }}>
            <span className="text-base w-4 text-center leading-none">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Maturity score */}
      {total > 0 && (
        <div className="px-4 py-3 border-b" style={{ borderColor: 'rgb(var(--rule))' }}>
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-[10px] font-semibold tracking-widest uppercase"
              style={{ color: 'rgb(var(--stone))' }}>완성도</span>
            <span className="font-serif text-base" style={{ color: 'rgb(var(--ink))' }}>{score}%</span>
          </div>
          <div className="h-0.5 w-full flex overflow-hidden" style={{ background: 'rgb(var(--rule))' }}>
            <div style={{ width: `${done / total * 100}%`, background: 'rgb(var(--forest))' }} className="h-full" />
            <div style={{ width: `${review / total * 100}%`, background: 'rgb(var(--amber))' }} className="h-full" />
            <div style={{ width: `${wip / total * 100}%`, background: 'rgb(var(--navy))' }} className="h-full" />
          </div>
          <div className="flex gap-3 mt-1.5">
            {[['완', done, 'rgb(var(--forest))'], ['검', review, 'rgb(var(--amber))'], ['작', wip, 'rgb(var(--navy))']].map(([l, n, c]) => (
              <span key={l as string} className="text-[10px] flex items-center gap-0.5"
                style={{ color: 'rgb(var(--stone))' }}>
                <span className="w-1.5 h-1.5 rounded-sm" style={{ background: c as string }} />
                {l} {n}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Chapter list with expand/collapse */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          <span className="text-[10px] font-semibold tracking-widest uppercase"
            style={{ color: 'rgb(var(--stone))' }}>챕터</span>
        </div>
        {chapters.length === 0
          ? <p className="px-4 py-3 text-xs italic" style={{ color: 'rgb(var(--stone))' }}>챕터 없음</p>
          : renderNodes(tree)
        }
      </div>
    </aside>
  );
}
