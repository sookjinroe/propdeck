export default function NotifDropdown({ onClose }: { onClose: () => void }) {
  const items = [
    { type: '멘션', text: '@Alex — 3. 시스템 아키텍처', time: '10분 전' },
    { type: '리뷰 요청', text: '2. 운영 방안', time: '1시간 전' },
    { type: '인텐트 변경', text: '1. 도입 배경 및 필요성', time: '2시간 전' },
  ];
  return (
    <div className="absolute right-0 top-full mt-1 w-72 border shadow-lg z-50" style={{ background: 'rgb(var(--paper))', borderColor: 'rgb(var(--rule))', borderRadius: 'var(--radius)' }}
      onMouseLeave={onClose}>
      <div className="px-4 py-2.5 border-b text-xs font-semibold" style={{ borderColor: 'rgb(var(--rule))', color: 'rgb(var(--ink))' }}>알림 {items.length}</div>
      {items.map((n, i) => (
        <div key={i} className="flex gap-3 px-4 py-3 border-b hover:bg-gray-50 cursor-pointer" style={{ borderColor: 'rgb(var(--rule))' }}>
          <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: 'rgb(var(--rust))' }} />
          <div><p className="text-xs font-medium" style={{ color: 'rgb(var(--ink))' }}>{n.type} — {n.text}</p><p className="text-[10px] mt-0.5" style={{ color: 'rgb(var(--stone))' }}>{n.time}</p></div>
        </div>
      ))}
    </div>
  );
}
