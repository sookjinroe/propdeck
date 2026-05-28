import { useState, useRef } from 'react';
import type { Chapter, PptVersion } from '../types';

export default function PptCard({ chapter, onUpdate }: { chapter: Chapter; onUpdate: (p: Partial<Chapter>) => void }) {
  const [showHistory, setShowHistory] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const versions = chapter.pptVersions;
  const latest = versions[0];

  const handleFile = (file: File) => {
    if (!file.name.match(/\.(pptx?|key)$/i)) return;
    const nextVer = versions.length ? versions[0].version + 1 : 1;
    const newVer: PptVersion = { name: file.name, size: (file.size/1024/1024).toFixed(1)+'MB', version: nextVer, uploader: 'Alex', date: '방금' };
    onUpdate({ pptVersions: [newVer, ...versions] });
  };

  return (
    <div className="border-b" style={{ borderColor: 'rgb(var(--rule))' }}
      onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={e => { e.preventDefault(); setIsDragOver(false); handleFile(e.dataTransfer.files[0]); }}>
      <div className="px-4 py-3" style={{ background: isDragOver ? 'rgb(var(--rust-bg))' : 'transparent' }}>
        <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: 'rgb(var(--stone))' }}>PPT 파일</p>
        {latest ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">📊</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: 'rgb(var(--ink))' }}>{latest.name}</p>
                <p className="text-[10px]" style={{ color: 'rgb(var(--stone))' }}>{latest.size} · {latest.date} · {latest.uploader}</p>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 shrink-0" style={{ background: 'rgb(var(--navy-bg))', color: 'rgb(var(--navy))', borderRadius: '2px' }}>v{latest.version}</span>
            </div>
            {versions.length > 1 && (
              <>
                <button onClick={() => setShowHistory(!showHistory)} className="text-[10px] flex items-center gap-1" style={{ color: 'rgb(var(--stone))' }}>
                  {showHistory ? '▲' : '▼'} 이전 버전 ({versions.length - 1}개)
                </button>
                {showHistory && versions.slice(1).map(v => (
                  <div key={v.version} className="flex items-center gap-2 pl-2 border-l text-[10px]" style={{ borderColor: 'rgb(var(--rule))' }}>
                    <span className="font-mono" style={{ color: 'rgb(var(--stone))' }}>v{v.version}</span>
                    <span className="flex-1 truncate" style={{ color: 'rgb(var(--stone))' }}>{v.name}</span>
                    <span style={{ color: 'rgb(var(--stone))' }}>{v.size}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        ) : (
          <p className="text-xs italic mb-2" style={{ color: 'rgb(var(--stone))' }}>아직 업로드 없음</p>
        )}
        <button onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed py-2 text-xs mt-2 transition-colors"
          style={{ borderColor: isDragOver ? 'rgb(var(--rust))' : 'rgb(var(--rule))', color: 'rgb(var(--stone))', borderRadius: 'var(--radius)' }}>
          {isDragOver ? '여기에 드롭' : latest ? '📎 새 버전 업로드' : '📎 PPT 업로드'}
        </button>
        <input ref={fileRef} type="file" accept=".pptx,.ppt,.key" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
      </div>
    </div>
  );
}
