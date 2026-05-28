import type { Member } from '../types';
export default function MembersPanel({ members, onClose, onUpdateMembers }: {
  members: Member[];
  onClose: () => void;
  onUpdateMembers?: (members: Member[]) => void;
}) {
  const updateRole = (name: string, role: Member['role']) => {
    onUpdateMembers?.(members.map(m => m.name === name ? { ...m, role } : m));
  };
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose} style={{ background: 'rgba(0,0,0,0.3)' }}>
      <div className="ml-auto w-80 h-full flex flex-col" style={{ background: 'rgb(var(--paper))' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgb(var(--rule))' }}>
          <span className="font-serif text-base" style={{ color: 'rgb(var(--ink))' }}>팀원 관리</span>
          <button onClick={onClose} style={{ color: 'rgb(var(--stone))' }}>✕</button>
        </div>
        <div className="p-4 border-b" style={{ borderColor: 'rgb(var(--rule))' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: 'rgb(var(--stone))' }}>이메일로 초대</p>
          <div className="flex gap-2">
            <input placeholder="이메일 주소" className="flex-1 text-xs border-b bg-transparent outline-none py-1" style={{ borderColor: 'rgb(var(--rule))', color: 'rgb(var(--ink))' }} />
            <button className="text-xs font-semibold px-3 py-1" style={{ background: 'rgb(var(--ink))', color: 'rgb(var(--parchment))', borderRadius: 'var(--radius)' }}>초대</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {members.map((m, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center av-${m.color}`}>{m.initial}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'rgb(var(--ink))' }}>{m.name}{m.isMe && <span className="text-xs ml-1" style={{ color: 'rgb(var(--stone))' }}>(나)</span>}</p>
                <p className="text-xs" style={{ color: 'rgb(var(--stone))' }}>{m.email}</p>
              </div>
              <select
                value={m.role}
                onChange={e => updateRole(m.name, e.target.value as Member['role'])}
                className="text-xs border bg-transparent px-1 py-0.5"
                style={{ borderColor: 'rgb(var(--rule))', color: 'rgb(var(--stone))', borderRadius: 'var(--radius)' }}>
                {(['PM','작성자','뷰어'] as const).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
