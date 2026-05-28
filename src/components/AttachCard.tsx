import { useRef } from 'react';
import type { Chapter, Attachment } from '../types';

export default function AttachCard({ chapter, onUpdate }: { chapter: Chapter; onUpdate: (p: Partial<Chapter>) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const attachments = chapter.attachments;

  const handleFile = (file: File) => {
    const icon = file.type.startsWith('image/') ? '🖼️' : file.type.includes('pdf') ? '📕' : '📎';
    const a: Attachment = { name: file.name, size: (file.size/1024/1024).toFixed(1)+'MB', date: '방금', icon };
    onUpdate({ attachments: [a, ...attachments] });
  };

  return (
    <div className="px-4 py-3">
      <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: 'rgb(var(--stone))' }}>기타 첨부</p>
      {attachments.map((a, i) => (
        <div key={i} className="flex items-center gap-2 py-1.5 border-b text-xs" style={{ borderColor: 'rgb(var(--rule))' }}>
          <span>{a.icon}</span>
          <span className="flex-1 truncate" style={{ color: 'rgb(var(--ink))' }}>{a.name}</span>
          <span className="text-[10px] shrink-0" style={{ color: 'rgb(var(--stone))' }}>{a.size}</span>
        </div>
      ))}
      <button onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed py-2 text-xs mt-2 transition-colors hover:border-rust text-center"
        style={{ borderColor: 'rgb(var(--rule))', color: 'rgb(var(--stone))', borderRadius: 'var(--radius)' }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}>
        📎 파일 첨부
      </button>
      <input ref={fileRef} type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
    </div>
  );
}
