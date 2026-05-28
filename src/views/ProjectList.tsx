import { useState } from 'react';
import type { Project } from '../types';
import { MEMBERS, TEMPLATES } from '../data';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface Props {
  projects: Project[];
  onEnter: (p: Project) => void;
  onCreate: (p: Project) => void;
}

const EMOJIS = ['🏦','🏭','🏛','🏢','🏗','🤖','📊','💡','🎯','🔬'];

export default function ProjectList({ projects, onEnter, onCreate }: Props) {
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState('');
  const [client, setClient] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    const p: Project = {
      id: 'p_' + Date.now(), name: name.trim(),
      client: client.trim() || '고객사 미입력',
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      progress: 0, deadline: '—', members: [MEMBERS[0]], chapters: [], comments: {},
    };
    onCreate(p);
    setShowNew(false); setName(''); setClient('');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'rgb(var(--parchment))' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-10 py-5 border-b" style={{ borderColor: 'rgb(var(--rule))' }}>
        <div className="flex items-center gap-3">
          <span className="font-serif text-xl tracking-tight" style={{ color: 'rgb(var(--ink))' }}>PropDeck</span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-sm" style={{ background: 'rgb(var(--rust-bg))', color: 'rgb(var(--rust))' }}>Beta</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold av-rust">A</div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-10 py-10">
        {/* Title row */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-medium tracking-widest uppercase mb-1" style={{ color: 'rgb(var(--stone))' }}>제안 워크스페이스</p>
            <h1 className="font-serif text-3xl" style={{ color: 'rgb(var(--ink))' }}>내 프로젝트</h1>
          </div>
          <button onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: 'rgb(var(--ink))', color: 'rgb(var(--parchment))', borderRadius: 'var(--radius)' }}>
            + 새 프로젝트
          </button>
        </div>

        {/* Project grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <button key={p.id} onClick={() => onEnter(p)}
              className="text-left p-6 border transition-all hover:shadow-lg group"
              style={{ background: 'rgb(var(--paper))', borderColor: 'rgb(var(--rule))', borderRadius: 'var(--radius)' }}>
              <div className="flex items-start justify-between mb-4">
                <span className="text-2xl">{p.emoji}</span>
                <span className="text-xs font-mono" style={{ color: 'rgb(var(--stone))' }}>{p.progress}%</span>
              </div>
              <h3 className="font-semibold text-sm mb-1 leading-snug" style={{ color: 'rgb(var(--ink))' }}>{p.name}</h3>
              <p className="text-xs mb-4" style={{ color: 'rgb(var(--stone))' }}>{p.client}</p>
              {/* Progress bar */}
              <div className="h-px mb-4" style={{ background: 'rgb(var(--rule))' }}>
                <div className="h-full transition-all" style={{ width: `${p.progress}%`, background: 'rgb(var(--forest))' }} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-1">
                  {p.members.slice(0, 4).map((m, i) => (
                    <div key={i} className={`w-6 h-6 rounded-full border text-[9px] font-bold flex items-center justify-center av-${m.color}`}
                      style={{ borderColor: 'rgb(var(--paper))' }}>{m.initial}</div>
                  ))}
                </div>
                <span className="text-xs" style={{ color: 'rgb(var(--stone))' }}>마감 {p.deadline}</span>
              </div>
            </button>
          ))}
          {/* New project card */}
          <button onClick={() => setShowNew(true)}
            className="p-6 border-2 border-dashed transition-all hover:border-rust flex flex-col items-center justify-center gap-2 min-h-[160px]"
            style={{ borderColor: 'rgb(var(--rule))', borderRadius: 'var(--radius)' }}>
            <span className="text-2xl opacity-30">+</span>
            <span className="text-xs font-medium" style={{ color: 'rgb(var(--stone))' }}>새 프로젝트</span>
          </button>
        </div>
      </main>

      {/* New project dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent style={{ background: 'rgb(var(--paper))', borderColor: 'rgb(var(--rule))' }}>
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">새 프로젝트</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold tracking-widest uppercase mb-2 block" style={{ color: 'rgb(var(--stone))' }}>프로젝트명 *</label>
              <Input value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="예: 국민은행 차세대 뱅킹 플랫폼"
                className="border-0 border-b rounded-none bg-transparent px-0 focus-visible:ring-0"
                style={{ borderColor: 'rgb(var(--rule))' }} autoFocus />
            </div>
            <div>
              <label className="text-xs font-semibold tracking-widest uppercase mb-2 block" style={{ color: 'rgb(var(--stone))' }}>고객사 / 부서</label>
              <Input value={client} onChange={e => setClient(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="예: 국민은행 · 디지털혁신본부"
                className="border-0 border-b rounded-none bg-transparent px-0 focus-visible:ring-0"
                style={{ borderColor: 'rgb(var(--rule))' }} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm font-medium" style={{ color: 'rgb(var(--stone))' }}>취소</button>
              <button onClick={handleCreate} disabled={!name.trim()}
                className="px-5 py-2 text-sm font-semibold disabled:opacity-40 transition-opacity"
                style={{ background: 'rgb(var(--ink))', color: 'rgb(var(--parchment))', borderRadius: 'var(--radius)' }}>
                만들기
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
