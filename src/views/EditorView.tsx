import { useState, useRef } from 'react';
import type { Chapter, Comment } from '../types';
import { getChapterNumber } from '../lib/chapters';
import CommentPanel from '../components/CommentPanel';
import PptCard from '../components/PptCard';
import AttachCard from '../components/AttachCard';

const STATUS_OPTS = [
  { id: 'todo', label: '시작 전' }, { id: 'wip', label: '작성중' },
  { id: 'review', label: '리뷰 요청' }, { id: 'done', label: '완료' },
] as const;

interface Props {
  chapter: Chapter; chapters: Chapter[];
  onUpdateChapters: (chs: Chapter[]) => void; onBack: () => void;
  initialComments?: Record<string, Comment[]>;
}

export default function EditorView({ chapter, chapters, onUpdateChapters, onBack, initialComments }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const num = getChapterNumber(chapter.id, chapters);

  const update = (patch: Partial<Chapter>) =>
    onUpdateChapters(chapters.map(c => c.id === chapter.id ? { ...c, ...patch } : c));

  const copyMarkdown = () => {
    const text = (editorRef.current?.innerText || chapter.text || '').trim();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };


  const saveEdit = () => {
    if (editorRef.current) update({ text: editorRef.current.innerHTML });
    setIsEditing(false);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left: intent + ppt */}
      <div className="w-52 shrink-0 border-r flex flex-col overflow-y-auto" style={{ background: 'rgb(var(--paper))', borderColor: 'rgb(var(--rule))' }}>
        {/* Intent */}
        <div className="p-4 border-b" style={{ borderColor: 'rgb(var(--rule))' }}>
          <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: 'rgb(var(--stone))' }}>챕터 인텐트</p>
          <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgb(var(--ink))' }}>{chapter.intent || <span className="italic" style={{ color: 'rgb(var(--stone))' }}>(인텐트 미작성)</span>}</p>
          {chapter.rfp.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {chapter.rfp.map(tag => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 font-mono" style={{ background: 'rgb(var(--navy-bg))', color: 'rgb(var(--navy))', borderRadius: '2px' }}>{tag}</span>
              ))}
            </div>
          )}
        </div>
        <PptCard chapter={chapter} onUpdate={p => update(p)} />
        <AttachCard chapter={chapter} onUpdate={p => update(p)} />
      </div>

      {/* Center: editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Editor top bar */}
        <div className="flex items-center gap-3 px-5 py-2.5 border-b shrink-0" style={{ background: 'rgb(var(--paper))', borderColor: 'rgb(var(--rule))' }}>
          <span className="font-mono text-xs tabular-nums" style={{ color: 'rgb(var(--stone))' }}>{num}</span>
          <span className="font-semibold text-sm flex-1 truncate" style={{ color: 'rgb(var(--ink))' }}>{chapter.name}</span>
          {/* Status selector */}
          <div className="flex border divide-x text-[10px] shrink-0" style={{ borderColor: 'rgb(var(--rule))', divideColor: 'rgb(var(--rule))', borderRadius: 'var(--radius)' }}>
            {STATUS_OPTS.map(opt => (
              <button key={opt.id} onClick={() => update({ status: opt.id })}
                className="px-2.5 py-1 font-medium transition-colors"
                style={{ background: chapter.status === opt.id ? 'rgb(var(--ink))' : 'transparent',
                  color: chapter.status === opt.id ? 'rgb(var(--parchment))' : 'rgb(var(--stone))' }}>
                {opt.label}
              </button>
            ))}
          </div>
          {/* Mode controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] px-2 py-1 font-medium" style={{ background: isEditing ? 'rgb(var(--rust-bg))' : 'rgb(var(--parchment))', color: isEditing ? 'rgb(var(--rust))' : 'rgb(var(--stone))', borderRadius: 'var(--radius)' }}>
              {isEditing ? '● 편집' : '읽기'}
            </span>
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="text-xs px-3 py-1 border" style={{ borderColor: 'rgb(var(--rule))', color: 'rgb(var(--stone))', borderRadius: 'var(--radius)' }}>취소</button>
                <button onClick={saveEdit} className="text-xs px-3 py-1 font-semibold" style={{ background: 'rgb(var(--ink))', color: 'rgb(var(--parchment))', borderRadius: 'var(--radius)' }}>저장</button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="text-xs px-3 py-1 font-semibold" style={{ background: 'rgb(var(--ink))', color: 'rgb(var(--parchment))', borderRadius: 'var(--radius)' }}>편집</button>
            )}
          </div>
        </div>

        {/* Format bar */}
        {isEditing && (
          <div className="flex items-center gap-1 px-4 py-1.5 border-b shrink-0" style={{ borderColor: 'rgb(var(--rule))' }}>
            {([['B','bold',700,'normal','none'],['I','italic',400,'italic','none'],['U','underline',400,'normal','underline']] as [string,string,number,string,string][]).map(([l,cmd,fw,fi,td]) => (
              <button key={cmd} onMouseDown={e => { e.preventDefault(); document.execCommand(cmd); }}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-sm"
                style={{ color: 'rgb(var(--ink))' }}>
                <span style={{ fontWeight: fw, fontStyle: fi, textDecoration: td }}>{l}</span>
              </button>
            ))}
            <span className="w-px h-4 mx-1" style={{ background: 'rgb(var(--rule))' }} />
            {([
              ['H1', 'h1', '1.2rem', 400, "'DM Serif Display', serif"],
              ['H2', 'h2', '0.85rem', 700, 'inherit'],
              ['¶',  'p',  '0.75rem', 400, 'inherit'],
            ] as [string, string, string, number, string][]).map(([l, tag, fs, fw, ff]) => (
              <button key={l} onMouseDown={e => { e.preventDefault(); document.execCommand('formatBlock', false, tag); }}
                className="px-2 h-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                style={{ color: 'rgb(var(--ink))', fontSize: fs, fontWeight: fw, fontFamily: ff }}>
                {l}
              </button>
            ))}
            <span className="w-px h-4 mx-1" style={{ background: 'rgb(var(--rule))' }} />
            <button onMouseDown={e => { e.preventDefault(); document.execCommand('insertUnorderedList'); }}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-sm"
              style={{ color: 'rgb(var(--ink))' }}>≡</button>
            <button onMouseDown={e => { e.preventDefault(); document.execCommand('insertOrderedList'); }}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-sm"
              style={{ color: 'rgb(var(--ink))' }}>1.</button>
            <div className="flex-1" />
            <button onClick={copyMarkdown}
              className="flex items-center gap-1 text-[10px] px-2 py-1 border transition-colors"
              style={{ borderColor: 'rgb(var(--rule))', color: copied ? 'rgb(var(--forest))' : 'rgb(var(--stone))', borderRadius: 'var(--radius)', background: copied ? 'rgb(var(--forest-bg))' : 'transparent' }}>
              {copied ? '✓ 복사됨' : '📋 마크다운'}
            </button>

          </div>
        )}
        {!isEditing && (
          <div className="flex justify-end px-4 py-1.5 border-b shrink-0" style={{ borderColor: 'rgb(var(--rule))' }}>
            <button onClick={copyMarkdown}
              className="flex items-center gap-1 text-[10px] px-2 py-1 border transition-colors"
              style={{ borderColor: 'rgb(var(--rule))', color: copied ? 'rgb(var(--forest))' : 'rgb(var(--stone))', borderRadius: 'var(--radius)', background: copied ? 'rgb(var(--forest-bg))' : 'transparent' }}>
              {copied ? '✓ 복사됨' : '📋 마크다운 복사'}
            </button>
          </div>
        )}

        {/* Editor canvas */}
        <div className="flex-1 overflow-y-auto p-6">
          <div
            ref={editorRef}
            contentEditable={isEditing}
            suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: chapter.text || '' }}
            className="max-w-2xl mx-auto min-h-64 text-sm leading-relaxed outline-none"
            style={{ color: 'rgb(var(--ink))', fontFamily: "'DM Sans', sans-serif" }}
            data-placeholder={!chapter.text ? '편집 버튼을 눌러 작성을 시작하세요...' : undefined}
          />
          {!chapter.text && !isEditing && (
            <div className="max-w-2xl mx-auto mt-4 text-sm italic" style={{ color: 'rgb(var(--stone))' }}>
              아직 작성된 내용이 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* Right: comments */}
      <CommentPanel chapterId={chapter.id} initialComments={initialComments} />
    </div>
  );
}
