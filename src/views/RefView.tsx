export default function RefView() {
  const files = [
    { name: '우리은행_RFP_v2.1.pdf', meta: 'PDF · 2.4MB · 2025.03.12', tag: '기준 문서', icon: '📕' },
    { name: '신한은행_AI컴플라이언스_제안서.pdf', meta: 'PDF · 8.1MB · 2024.11.05', tag: '참고', icon: '📘' },
    { name: '하이UX_외환자동화_제안서.pdf', meta: 'PDF · 5.3MB · 2024.09.20', tag: '참고', icon: '📘' },
    { name: '외환업무_현황분석_내부자료.pdf', meta: 'PDF · 1.2MB · 2025.02.28', tag: '참고', icon: '📄' },
  ];
  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-64 border-r flex flex-col shrink-0" style={{ background: 'rgb(var(--paper))', borderColor: 'rgb(var(--rule))' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgb(var(--rule))' }}>
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgb(var(--stone))' }}>문서 목록</span>
          <button className="text-xs px-2.5 py-1 font-medium" style={{ background: 'rgb(var(--ink))', color: 'rgb(var(--parchment))', borderRadius: 'var(--radius)' }}>+ 업로드</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {files.map((f, i) => (
            <button key={i} className={`w-full text-left p-3 rounded transition-colors ${i===0?'bg-parchment':''} hover:bg-gray-50`}
              style={{ background: i===0 ? 'rgb(var(--parchment))' : 'transparent', borderRadius: 'var(--radius)' }}>
              <div className="flex items-start gap-2">
                <span className="text-base">{f.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: 'rgb(var(--ink))' }}>{f.name}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgb(var(--stone))' }}>{f.meta}</p>
                  <span className="text-[10px] font-medium" style={{ color: i===0 ? 'rgb(var(--rust))' : 'rgb(var(--stone))' }}>{f.tag}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 border-b shrink-0" style={{ borderColor: 'rgb(var(--rule))', background: 'rgb(var(--paper))' }}>
          <span className="text-sm font-semibold" style={{ color: 'rgb(var(--ink))' }}>우리은행_RFP_v2.1.pdf</span>
          <span className="text-xs" style={{ color: 'rgb(var(--stone))' }}>32페이지</span>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-xl mx-auto p-8 shadow-lg" style={{ background: 'rgb(var(--paper))' }}>
            <h3 className="font-serif text-base mb-1" style={{ color: 'rgb(var(--ink))' }}>외환업무 AI 자동화 및 스마트 컴플라이언스 시스템 구축</h3>
            <p className="text-xs mb-4" style={{ color: 'rgb(var(--stone))' }}>우리은행 디지털전략본부 · 2025년 3월</p>
            <div className="space-y-4 text-xs" style={{ color: 'rgb(var(--ink))' }}>
              <div>
                <p className="font-semibold mb-2 uppercase tracking-wider text-[10px]" style={{ color: 'rgb(var(--stone))' }}>2. 기능 요건</p>
                {[['2.1','기존 코어뱅킹 및 DCS와의 연동 인터페이스를 제공해야 한다.'],
                  ['2.3','기존 인프라의 추가 구축 없이 현행 BDC/DCS 환경에서 운영 가능해야 한다.'],
                  ['2.4','도입 후 1년 이내 정량적 성과를 제시해야 한다.']].map(([n,t]) => (
                  <div key={n} className="flex gap-3 py-2 border-b" style={{ borderColor: 'rgb(var(--rule))' }}>
                    <span className="font-mono text-[10px] shrink-0 mt-0.5" style={{ color: 'rgb(var(--rust))' }}>{n}</span>
                    <span className="leading-relaxed">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
