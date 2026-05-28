import { useState } from 'react';
import type { Comment } from '../types';

const INITIAL: Record<string, Comment[]> = {
  ch3: [
    { id: 'c1', author: 'Chris', initial: 'C', color: 'navy', text: '@Sam 인텐트 수정했어요. 통합 관점으로 재검토 부탁해요.', time: '10분 전', resolved: false,
      replies: [{ id: 'r1', author: 'Sam', initial: 'S', color: 'amber', text: '확인했어요. 수정 중이에요.', time: '5분 전' }] },
    { id: 'c2', author: 'Jamie', initial: 'J', color: 'forest', text: '아키텍처 다이어그램 첨부해주시면 좋겠어요', time: '어제', resolved: false, replies: [] },
  ]
};

export default function CommentPanel({ chapterId, initialComments }: { chapterId: string; initialComments?: Record<string, Comment[]> }) {
  const allComments = initialComments || INITIAL;
  const [comments, setComments] = useState<Comment[]>(allComments[chapterId] || []);
  const [newText, setNewText] = useState('');
  const [showResolved, setShowResolved] = useState(false);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  const unresolved = comments.filter(c => !c.resolved);
  const displayed = showResolved ? comments : unresolved;

  const resolve = (id: string) => setComments(prev => prev.map(c => c.id === id ? { ...c, resolved: !c.resolved } : c));
  const addComment = () => {
    if (!newText.trim()) return;
    setComments(prev => [{ id: 'c_'+Date.now(), author: 'Alex', initial: 'A', color: 'rust', text: newText.trim(), time: '방금', resolved: false, replies: [] }, ...prev]);
    setNewText('');
  };
  const addReply = (cId: string) => {
    const text = replyInputs[cId]?.trim();
    if (!text) return;
    setComments(prev => prev.map(c => c.id === cId ? { ...c, replies: [...c.replies, { id: 'r_'+Date.now(), author: 'Alex', initial: 'A', color: 'rust', text, time: '방금' }] } : c));
    setReplyInputs(prev => ({ ...prev, [cId]: '' }));
  };

  return (
    <div className="w-64 shrink-0 border-l flex flex-col overflow-hidden" style={{ background: 'rgb(var(--paper))', borderColor: 'rgb(var(--rule))' }}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b shrink-0" style={{ borderColor: 'rgb(var(--rule))' }}>
        <span className="text-xs font-semibold" style={{ color: 'rgb(var(--ink))' }}>코멘트</span>
        <span className="text-[10px] px-1.5 py-0.5 font-mono" style={{ background: 'rgb(var(--rust-bg))', color: 'rgb(var(--rust))', borderRadius: '2px' }}>{unresolved.length}</span>
      </div>
      {comments.filter(c => c.resolved).length > 0 && (
        <button onClick={() => setShowResolved(!showResolved)} className="px-4 py-1.5 text-[10px] border-b text-left" style={{ borderColor: 'rgb(var(--rule))', color: 'rgb(var(--stone))' }}>
          {showResolved ? '해결된 코멘트 숨기기' : `해결된 코멘트 보기 (${comments.filter(c=>c.resolved).length})`}
        </button>
      )}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {displayed.map(c => (
          <div key={c.id} className="border p-3 space-y-2 transition-opacity" style={{ borderColor: 'rgb(var(--rule))', opacity: c.resolved ? 0.5 : 1, borderRadius: 'var(--radius)' }}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center av-${c.color} shrink-0`}>{c.initial}</div>
                <div>
                  <span className="text-[10px] font-semibold" style={{ color: 'rgb(var(--ink))' }}>{c.author}</span>
                  <span className="text-[9px] ml-1" style={{ color: 'rgb(var(--stone))' }}>{c.time}</span>
                </div>
              </div>
              <button onClick={() => resolve(c.id)} className="text-[10px] px-1.5 py-0.5 border transition-colors shrink-0" title={c.resolved ? '해제' : '리졸브'}
                style={{ borderColor: c.resolved ? 'rgb(var(--forest))' : 'rgb(var(--rule))', color: c.resolved ? 'rgb(var(--forest))' : 'rgb(var(--stone))', borderRadius: '2px', background: c.resolved ? 'rgb(var(--forest-bg))' : 'transparent' }}>
                {c.resolved ? '✓' : '○'}
              </button>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'rgb(var(--ink))' }}>{c.text}</p>
            {c.replies.length > 0 && (
              <div className="border-l pl-2 space-y-1.5" style={{ borderColor: 'rgb(var(--rule))' }}>
                {c.replies.map(r => (
                  <div key={r.id} className="flex gap-1.5">
                    <div className={`w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center av-${r.color} shrink-0 mt-0.5`}>{r.initial}</div>
                    <div><span className="text-[10px] font-semibold mr-1" style={{ color: 'rgb(var(--ink))' }}>{r.author}</span><span className="text-[10px]" style={{ color: 'rgb(var(--ink))' }}>{r.text}</span></div>
                  </div>
                ))}
              </div>
            )}
            {!c.resolved && (
              <div className="flex gap-1">
                <input value={replyInputs[c.id] || ''} onChange={e => setReplyInputs(p => ({ ...p, [c.id]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addReply(c.id)}
                  placeholder="답글..." className="flex-1 text-xs bg-transparent border-b outline-none py-0.5"
                  style={{ borderColor: 'rgb(var(--rule))', color: 'rgb(var(--ink))' }} />
                <button onClick={() => addReply(c.id)} className="text-[10px] font-medium" style={{ color: 'rgb(var(--rust))' }}>↵</button>
              </div>
            )}
          </div>
        ))}
        {displayed.length === 0 && <p className="text-xs italic text-center py-8" style={{ color: 'rgb(var(--stone))' }}>코멘트 없음</p>}
      </div>
      <div className="p-3 border-t shrink-0" style={{ borderColor: 'rgb(var(--rule))' }}>
        <textarea value={newText} onChange={e => setNewText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addComment(); }}}
          placeholder="코멘트... @멘션 가능" rows={2}
          className="w-full text-xs bg-transparent border-b outline-none resize-none leading-relaxed"
          style={{ borderColor: 'rgb(var(--rule))', color: 'rgb(var(--ink))' }} />
        <div className="flex justify-between items-center mt-1.5">
          <span className="text-[10px]" style={{ color: 'rgb(var(--stone))' }}>Shift+Enter 줄바꿈</span>
          <button onClick={addComment} disabled={!newText.trim()} className="text-[10px] font-semibold disabled:opacity-30" style={{ color: 'rgb(var(--rust))' }}>등록</button>
        </div>
      </div>
    </div>
  );
}
