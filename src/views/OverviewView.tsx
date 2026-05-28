import { useState, useRef, useCallback } from 'react';
import type { Chapter, Member } from '../types';
import { buildTree, flattenTree, getChapterNumber, normalizeOrders } from '../lib/chapters';
import { TEMPLATES } from '../data';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Props {
  chapters: Chapter[];
  members: Member[];
  onUpdateChapters: (chs: Chapter[]) => void;
  onGoToEditor: (id: string) => void;
}

const STATUS_CYCLE = ['todo', 'wip', 'review', 'done'] as const;
const STATUS_LABELS: Record<string, string> = { done: '완료', review: '검토중', wip: '작성중', todo: '시작 전' };
const STATUS_COLORS: Record<string, string> = {
  done: 'rgb(var(--forest))', review: 'rgb(var(--amber))',
  wip: 'rgb(var(--navy))', todo: 'rgb(var(--stone))'
};

export default function OverviewView({ chapters, members, onUpdateChapters, onGoToEditor }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragSrcId, setDragSrcId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [showTemplate, setShowTemplate] = useState(false);
  const [selectedTmpl, setSelectedTmpl] = useState(0);
  const [assigneePickerId, setAssigneePickerId] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const focusInput = (id: string) => {
    setTimeout(() => {
      const inp = inputRefs.current[id];
      if (inp) { inp.focus(); const l = inp.value.length; inp.setSelectionRange(l, l); }
    }, 20);
  };

  const ordered = flattenTree(buildTree(chapters));
  const withIntent = chapters.filter(c => c.intent?.trim()).length;

  const updateChapter = useCallback((id: string, patch: Partial<Chapter>) => {
    onUpdateChapters(chapters.map(c => c.id === id ? { ...c, ...patch } : c));
  }, [chapters, onUpdateChapters]);

  const cycleStatus = useCallback((id: string) => {
    const ch = chapters.find(c => c.id === id);
    if (!ch) return;
    const idx = STATUS_CYCLE.indexOf(ch.status as any);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    updateChapter(id, { status: next });
  }, [chapters, updateChapter]);

  const assignMember = useCallback((chId: string, member: Member | null) => {
    updateChapter(chId, {
      assignee: member?.name ?? null,
      assigneeInitial: member?.initial ?? null,
      assigneeColor: member?.color ?? null,
    });
    setAssigneePickerId(null);
  }, [updateChapter]);

  const addBelow = useCallback((id: string) => {
    const ch = chapters.find(c => c.id === id)!;
    const newId = 'ch_' + Date.now();
    const idx = chapters.findIndex(c => c.id === id);
    const next: Chapter = {
      id: newId, name: '', parentId: ch.parentId, order: ch.order + 0.5,
      status: 'todo', assignee: null, assigneeInitial: null, assigneeColor: null,
      intent: '', rfp: [], pptVersions: [], slides: [], attachments: [], text: ''
    };
    const updated = [...chapters];
    updated.splice(idx + 1, 0, next);
    onUpdateChapters(normalizeOrders(updated));
    setSelectedId(newId);
    focusInput(newId);
  }, [chapters, onUpdateChapters]);

  const addFirst = useCallback(() => {
    const newId = 'ch_' + Date.now();
    const roots = chapters.filter(c => !c.parentId);
    const ch: Chapter = {
      id: newId, name: '', parentId: null, order: roots.length + 1,
      status: 'todo', assignee: null, assigneeInitial: null, assigneeColor: null,
      intent: '', rfp: [], pptVersions: [], slides: [], attachments: [], text: ''
    };
    onUpdateChapters(normalizeOrders([...chapters, ch]));
    setSelectedId(newId);
    focusInput(newId);
  }, [chapters, onUpdateChapters]);

  const indent = useCallback((id: string) => {
    const flat = flattenTree(buildTree(chapters));
    const idx = flat.findIndex(e => e.ch.id === id);
    if (idx <= 0) { focusInput(id); return; }
    const prev = flat[idx - 1];
    if (flat[idx].depth > prev.depth) { focusInput(id); return; }
    onUpdateChapters(normalizeOrders(chapters.map(c => c.id === id ? { ...c, parentId: prev.ch.id } : c)));
    setSelectedId(id); focusInput(id);
  }, [chapters, onUpdateChapters]);

  const outdent = useCallback((id: string) => {
    const ch = chapters.find(c => c.id === id)!;
    if (!ch.parentId) { focusInput(id); return; }
    const parent = chapters.find(c => c.id === ch.parentId);
    onUpdateChapters(normalizeOrders(chapters.map(c => c.id === id ? { ...c, parentId: parent?.parentId ?? null } : c)));
    setSelectedId(id); focusInput(id);
  }, [chapters, onUpdateChapters]);

  const deleteChapter = useCallback((id: string) => {
    const kids = chapters.filter(c => c.parentId === id);
    const name = chapters.find(c => c.id === id)?.name || '챕터';
    const msg = kids.length ? `"${name}" 및 하위 ${kids.length}개를 삭제할까요?` : `"${name}"를 삭제할까요?`;
    if (!confirm(msg)) return;
    const toDelete = new Set<string>();
    const collect = (cid: string) => { toDelete.add(cid); chapters.filter(c => c.parentId === cid).forEach(c => collect(c.id)); };
    collect(id);
    if (selectedId && toDelete.has(selectedId)) setSelectedId(null);
    onUpdateChapters(normalizeOrders(chapters.filter(c => !toDelete.has(c.id))));
  }, [chapters, onUpdateChapters, selectedId]);

  const onKeyDown = useCallback((e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') { e.preventDefault(); addBelow(id); }
    else if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); indent(id); }
    else if (e.key === 'Tab' && e.shiftKey) { e.preventDefault(); outdent(id); }
    else if (e.key === 'Escape') { e.preventDefault(); setSelectedId(null); (e.target as HTMLElement).blur(); }
  }, [addBelow, indent, outdent]);

  const onDragStart = (id: string) => setDragSrcId(id);
  const onDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOverId(id); };
  const onDragLeave = () => setDragOverId(null);
  const onDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault(); setDragOverId(null);
    if (!dragSrcId || dragSrcId === targetId) return;
    const tgt = chapters.find(c => c.id === targetId)!;
    const src = chapters.find(c => c.id === dragSrcId)!;
    const updated = chapters.filter(c => c.id !== dragSrcId);
    const tgtIdx = updated.findIndex(c => c.id === targetId);
    updated.splice(tgtIdx, 0, { ...src, parentId: tgt.parentId });
    onUpdateChapters(normalizeOrders(updated));
    setDragSrcId(null);
  };

  const applyTemplate = () => {
    const tmpl = TEMPLATES[selectedTmpl];
    onUpdateChapters(tmpl.chapters.map((name, i) => ({
      id: 'ch_t' + (i + 1), name, parentId: null, order: i + 1,
      status: 'todo' as const, assignee: null, assigneeInitial: null, assigneeColor: null,
      intent: '', rfp: [], pptVersions: [], slides: [], attachments: [], text: ''
    })));
    setShowTemplate(false);
    setTimeout(() => focusInput('ch_t1'), 30);
  };

  // Close assignee picker on outside click
  const handleTableClick = (e: React.MouseEvent) => {
    if (!(e.target as Element).closest('[data-assignee-picker]')) {
      setAssigneePickerId(null);
    }
  };

  if (chapters.length === 0) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-sm">
        <p className="text-5xl mb-5 opacity-20">≡</p>
        <h2 className="font-serif text-xl mb-2" style={{ color: 'rgb(var(--ink))' }}>아직 챕터가 없어요</h2>
        <p className="text-sm mb-6" style={{ color: 'rgb(var(--stone))' }}>제안서 구조를 직접 만들거나<br />템플릿으로 시작하세요</p>
        <div className="flex gap-3 justify-center">
          <button onClick={addFirst} className="px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ background: 'rgb(var(--ink))', color: 'rgb(var(--parchment))', borderRadius: 'var(--radius)' }}>
            + 챕터 추가
          </button>
          <button onClick={() => setShowTemplate(true)} className="px-5 py-2.5 text-sm font-medium border transition-colors hover:bg-gray-50"
            style={{ borderColor: 'rgb(var(--rule))', color: 'rgb(var(--ink))', borderRadius: 'var(--radius)' }}>
            템플릿으로 시작
          </button>
        </div>
        <TemplateDialog open={showTemplate} onClose={() => setShowTemplate(false)} selected={selectedTmpl} onSelect={setSelectedTmpl} onApply={applyTemplate} />
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* View bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b shrink-0"
        style={{ background: 'rgb(var(--paper))', borderColor: 'rgb(var(--rule))' }}>
        <div className="flex items-center gap-4">
          <h2 className="font-serif text-base" style={{ color: 'rgb(var(--ink))' }}>챕터 브리프</h2>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'rgb(var(--stone))' }}>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-sm inline-block" style={{ background: 'rgb(var(--forest))' }} />
              {withIntent} 인텐트 작성
            </span>
            {chapters.length - withIntent > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-sm inline-block" style={{ background: 'rgb(var(--rule))' }} />
                {chapters.length - withIntent} 미작성
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'rgb(var(--stone))' }}>인텐트 변경 시 코멘트로 작성자에게 알려주세요</span>
          <button onClick={() => setShowTemplate(true)} className="text-xs px-3 py-1 border transition-colors hover:bg-gray-50"
            style={{ borderColor: 'rgb(var(--rule))', color: 'rgb(var(--stone))', borderRadius: 'var(--radius)' }}>
            템플릿
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto" onClick={handleTableClick}>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-[10px] font-semibold tracking-widest uppercase"
              style={{ color: 'rgb(var(--stone))' }}>
              <th className="px-5 py-2.5 border-b font-semibold w-64" style={{ borderColor: 'rgb(var(--rule))' }}>챕터</th>
              <th className="px-4 py-2.5 border-b font-semibold" style={{ borderColor: 'rgb(var(--rule))' }}>인텐트</th>
              <th className="px-4 py-2.5 border-b font-semibold w-36" style={{ borderColor: 'rgb(var(--rule))' }}>담당자</th>
              <th className="px-4 py-2.5 border-b font-semibold w-24" style={{ borderColor: 'rgb(var(--rule))' }}>상태</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map(({ ch, depth }) => {
              const num = getChapterNumber(ch.id, chapters);
              const isSel = selectedId === ch.id;
              const isDragOver = dragOverId === ch.id;
              return (
                <tr key={ch.id}
                  draggable
                  onDragStart={() => onDragStart(ch.id)}
                  onDragOver={e => onDragOver(e, ch.id)}
                  onDragLeave={onDragLeave}
                  onDrop={e => onDrop(e, ch.id)}
                  onClick={() => { setSelectedId(ch.id); focusInput(ch.id); }}
                  className="group transition-colors cursor-pointer"
                  style={{
                    background: isSel ? 'rgb(var(--rust-bg))' : 'transparent',
                    borderTop: isDragOver ? '2px solid rgb(var(--rust))' : undefined,
                  }}>

                  {/* Chapter name */}
                  <td className="border-b" style={{ borderColor: 'rgb(var(--rule))' }}>
                    <div className="flex items-center gap-1.5 px-3 py-1.5" style={{ paddingLeft: `${12 + depth * 16}px` }}>
                      <span className="text-xs opacity-30 cursor-grab select-none group-hover:opacity-60 shrink-0">⠿</span>
                      <span className="font-mono text-[10px] tabular-nums shrink-0" style={{ color: 'rgb(var(--stone))', minWidth: '28px' }}>{num}</span>
                      <input
                        ref={el => { inputRefs.current[ch.id] = el; }}
                        defaultValue={ch.name}
                        placeholder="챕터 이름 입력"
                        onKeyDown={e => onKeyDown(e, ch.id)}
                        onFocus={() => setSelectedId(ch.id)}
                        onBlur={e => updateChapter(ch.id, { name: e.target.value || ch.name })}
                        onClick={e => e.stopPropagation()}
                        className="flex-1 bg-transparent border-none outline-none text-xs font-medium min-w-0 placeholder:text-stone-400"
                        style={{ color: 'rgb(var(--ink))' }}
                      />
                      <button onClick={e => { e.stopPropagation(); deleteChapter(ch.id); }}
                        className="opacity-0 group-hover:opacity-40 hover:!opacity-100 text-xs px-1 shrink-0 transition-opacity"
                        style={{ color: 'rgb(var(--stone))' }}>×</button>
                    </div>
                  </td>

                  {/* Intent */}
                  <td className="border-b px-4 py-1" style={{ borderColor: 'rgb(var(--rule))' }}>
                    <textarea
                      defaultValue={ch.intent}
                      placeholder="이 챕터의 목적, 커버 요건을 작성하세요"
                      rows={2}
                      onClick={e => e.stopPropagation()}
                      onFocus={() => setSelectedId(null)}
                      onBlur={e => updateChapter(ch.id, { intent: e.target.value })}
                      className="w-full bg-transparent border-none outline-none text-xs resize-none leading-relaxed placeholder:text-stone-300"
                      style={{ color: 'rgb(var(--ink))' }}
                    />
                  </td>

                  {/* Assignee — click to pick */}
                  <td className="border-b px-4 py-2" style={{ borderColor: 'rgb(var(--rule))' }}>
                    <div className="relative" data-assignee-picker>
                      <button
                        onClick={e => { e.stopPropagation(); setAssigneePickerId(assigneePickerId === ch.id ? null : ch.id); }}
                        className="flex items-center gap-1.5 group/av hover:opacity-70 transition-opacity">
                        {ch.assignee ? (
                          <>
                            <div className={`w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center av-${ch.assigneeColor}`}>{ch.assigneeInitial}</div>
                            <span className="text-xs" style={{ color: 'rgb(var(--ink))' }}>{ch.assignee}</span>
                          </>
                        ) : (
                          <span className="text-xs border border-dashed px-2 py-0.5 transition-colors"
                            style={{ borderColor: 'rgb(var(--rule))', color: 'rgb(var(--stone))', borderRadius: 'var(--radius)' }}>
                            할당
                          </span>
                        )}
                      </button>

                      {/* Assignee picker dropdown */}
                      {assigneePickerId === ch.id && (
                        <div className="absolute left-0 top-full mt-1 z-20 border shadow-lg py-1 min-w-[140px]"
                          style={{ background: 'rgb(var(--paper))', borderColor: 'rgb(var(--rule))', borderRadius: 'var(--radius)' }}
                          onClick={e => e.stopPropagation()}>
                          {members.map(m => (
                            <button key={m.name} onClick={() => assignMember(ch.id, m)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors text-left"
                              style={{ background: ch.assignee === m.name ? 'rgb(var(--rust-bg))' : undefined }}>
                              <div className={`w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center av-${m.color} shrink-0`}>{m.initial}</div>
                              <span style={{ color: 'rgb(var(--ink))' }}>{m.name}</span>
                              {m.isMe && <span className="text-[10px]" style={{ color: 'rgb(var(--stone))' }}>나</span>}
                              {ch.assignee === m.name && <span className="ml-auto text-[10px]" style={{ color: 'rgb(var(--rust))' }}>✓</span>}
                            </button>
                          ))}
                          <div className="border-t mx-2 my-1" style={{ borderColor: 'rgb(var(--rule))' }} />
                          <button onClick={() => assignMember(ch.id, null)}
                            className="w-full px-3 py-1.5 text-xs text-left hover:bg-gray-50 transition-colors"
                            style={{ color: 'rgb(var(--stone))' }}>
                            할당 해제
                          </button>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status — click to cycle */}
                  <td className="border-b px-4 py-2" style={{ borderColor: 'rgb(var(--rule))' }}>
                    <button
                      onClick={e => { e.stopPropagation(); cycleStatus(ch.id); }}
                      title="클릭해서 상태 변경"
                      className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-60">
                      <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0"
                        style={{ background: STATUS_COLORS[ch.status] }} />
                      <span style={{ color: STATUS_COLORS[ch.status] }}>{STATUS_LABELS[ch.status]}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Add row */}
        <div className="px-4 py-2 border-b flex items-center gap-3" style={{ borderColor: 'rgb(var(--rule))' }}>
          <button onClick={addFirst} className="text-xs font-medium transition-colors hover:opacity-70"
            style={{ color: 'rgb(var(--stone))' }}>
            + 챕터 추가
          </button>
          <span className="text-[10px]" style={{ color: 'rgb(var(--rule))' }}>·</span>
          <button onClick={() => setShowTemplate(true)} className="text-xs transition-colors hover:opacity-70"
            style={{ color: 'rgb(var(--stone))' }}>
            템플릿
          </button>
        </div>

        {/* Keyboard hints */}
        <div className="flex gap-4 px-5 py-2 text-[10px]" style={{ color: 'rgb(var(--stone))' }}>
          {[['Enter', '아래 추가'], ['Tab', '들여쓰기'], ['Shift+Tab', '내어쓰기'], ['Esc', '해제']].map(([k, v]) => (
            <span key={k} className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 border text-[9px] font-mono"
                style={{ borderColor: 'rgb(var(--rule))', borderRadius: '2px', background: 'rgb(var(--parchment))' }}>{k}</kbd>
              {v}
            </span>
          ))}
        </div>
      </div>

      <TemplateDialog open={showTemplate} onClose={() => setShowTemplate(false)} selected={selectedTmpl} onSelect={setSelectedTmpl} onApply={applyTemplate} />
    </div>
  );
}

function TemplateDialog({ open, onClose, selected, onSelect, onApply }: {
  open: boolean; onClose: () => void; selected: number; onSelect: (i: number) => void; onApply: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent style={{ background: 'rgb(var(--paper))', borderColor: 'rgb(var(--rule))' }}>
        <DialogHeader><DialogTitle className="font-serif text-xl">템플릿으로 시작</DialogTitle></DialogHeader>
        <div className="space-y-2 py-2">
          {TEMPLATES.map((t, i) => (
            <button key={i} onClick={() => onSelect(i)}
              className="w-full text-left p-3 border transition-colors"
              style={{ borderColor: selected === i ? 'rgb(var(--rust))' : 'rgb(var(--rule))',
                background: selected === i ? 'rgb(var(--rust-bg))' : 'transparent',
                borderRadius: 'var(--radius)' }}>
              <div className="text-sm font-semibold mb-1" style={{ color: 'rgb(var(--ink))' }}>{t.name}</div>
              <div className="text-xs" style={{ color: 'rgb(var(--stone))' }}>{t.chapters.join(' · ')}</div>
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm" style={{ color: 'rgb(var(--stone))' }}>취소</button>
          <button onClick={onApply} className="px-5 py-2 text-sm font-semibold"
            style={{ background: 'rgb(var(--ink))', color: 'rgb(var(--parchment))', borderRadius: 'var(--radius)' }}>
            적용
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
