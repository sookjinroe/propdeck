import { useState, useCallback } from 'react';
import type { Project, Chapter } from '../types';
import { normalizeOrders } from '../lib/chapters';
import Sidebar from '../components/Sidebar';
import OverviewView from './OverviewView';
import EditorView from './EditorView';
import FullView from './FullView';
import RefView from './RefView';
import MembersPanel from '../components/MembersPanel';
import NotifDropdown from '../components/NotifDropdown';

type ViewId = 'overview' | 'fullview' | 'ref' | 'editor';

interface Props {
  project: Project;
  onBack: () => void;
  onUpdate: (p: Project) => void;
}

export default function Workspace({ project, onBack, onUpdate }: Props) {
  const [view, setView] = useState<ViewId>('overview');
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const chapters = project.chapters;

  const updateChapters = useCallback((chs: Chapter[]) => {
    onUpdate({ ...project, chapters: chs });
  }, [project, onUpdate]);

  const goToEditor = (id: string) => {
    setActiveChapterId(id);
    setView('editor');
  };

  const activeChapter = chapters.find(c => c.id === activeChapterId) ?? null;

  const doneCount = chapters.filter(c => c.status === 'done').length;
  const reviewCount = chapters.filter(c => c.status === 'review').length;
  const wipCount = chapters.filter(c => c.status === 'wip').length;
  const score = chapters.length
    ? Math.round((doneCount + reviewCount * 0.7 + wipCount * 0.3) / chapters.length * 100) : 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Workspace Header */}
      <header className="flex items-center gap-0 h-12 border-b shrink-0" style={{ background: 'rgb(var(--paper))', borderColor: 'rgb(var(--rule))' }}>
        <button onClick={onBack} className="flex items-center gap-2 px-4 h-full text-xs font-medium border-r hover:bg-gray-50 transition-colors shrink-0" style={{ borderColor: 'rgb(var(--rule))', color: 'rgb(var(--stone))' }}>
          ← 목록
        </button>
        <div className="flex items-center gap-2 px-4 flex-1 min-w-0">
          <span className="text-sm">{project.emoji}</span>
          <span className="text-sm font-semibold truncate" style={{ color: 'rgb(var(--ink))' }}>{project.name}</span>
          <span className="text-xs px-1.5 py-0.5 font-mono shrink-0" style={{ background: 'rgb(var(--parchment))', color: 'rgb(var(--stone))', borderRadius: 'var(--radius)' }}>{score}%</span>
        </div>
        <div className="flex items-center gap-1 px-3 shrink-0">
          <div className="flex -space-x-1 mr-2">
            {project.members.slice(0, 4).map((m, i) => (
              <div key={i} className={`w-6 h-6 rounded-full border-2 text-[9px] font-bold flex items-center justify-center av-${m.color}`} style={{ borderColor: 'rgb(var(--paper))' }}>{m.initial}</div>
            ))}
          </div>
          <button onClick={() => setShowMembers(true)} className="p-1.5 rounded hover:bg-gray-100 text-sm" style={{ color: 'rgb(var(--stone))' }} title="팀원 관리">👥</button>
          <div className="relative">
            <button onClick={() => setShowNotif(!showNotif)} className="p-1.5 rounded hover:bg-gray-100 text-sm relative" style={{ color: 'rgb(var(--stone))' }}>
              🔔
              <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full" style={{ background: 'rgb(var(--rust))' }} />
            </button>
            {showNotif && <NotifDropdown onClose={() => setShowNotif(false)} />}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          chapters={chapters}
          activeChapterId={activeChapterId}
          activeView={view}
          score={score}
          done={doneCount} review={reviewCount} wip={wipCount} total={chapters.length}
          onSelectView={v => setView(v as ViewId)}
          onSelectChapter={goToEditor}
          onUpdateChapters={updateChapters}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          {view === 'overview' && <OverviewView chapters={chapters} onUpdateChapters={updateChapters} onGoToEditor={goToEditor} />}
          {view === 'fullview' && <FullView chapters={chapters} onGoToEditor={goToEditor} />}
          {view === 'ref' && <RefView />}
          {view === 'editor' && activeChapter && (
            <EditorView chapter={activeChapter} chapters={chapters} onUpdateChapters={updateChapters} onBack={() => setView('overview')} initialComments={project.comments} />
          )}
          {view === 'editor' && !activeChapter && (
            <div className="flex-1 flex items-center justify-center" style={{ color: 'rgb(var(--stone))' }}>
              <div className="text-center"><p className="font-serif text-lg mb-1">챕터를 선택하세요</p><p className="text-sm">좌측 목록에서 챕터를 클릭하세요</p></div>
            </div>
          )}
        </main>
      </div>

      {showMembers && <MembersPanel members={project.members} onClose={() => setShowMembers(false)} />}
    </div>
  );
}
