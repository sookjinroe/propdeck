import { useState } from 'react';

interface RefFile {
  name: string;
  meta: string;
  tag: string;
  icon: string;
  pages: number;
  items: { num: string; text: string }[];
}

const FILES: RefFile[] = [
  {
    name: '우리은행_RFP_v2.1.pdf', meta: 'PDF · 2.4MB · 2025.03.12', tag: '기준 문서', icon: '📕', pages: 32,
    items: [
      { num: '2.1', text: '기존 코어뱅킹 및 DCS와의 연동 인터페이스를 제공해야 한다.' },
      { num: '2.3', text: '기존 인프라의 추가 구축 없이 현행 BDC/DCS 환경에서 운영 가능해야 한다.' },
      { num: '2.4', text: '도입 후 1년 이내 정량적 성과를 제시해야 한다.' },
      { num: '3.1', text: '실시간 모니터링 대시보드를 통한 이상거래 탐지 기능을 포함해야 한다.' },
      { num: '3.2', text: '금융감독원 외환거래 보고 양식과 완전 호환되어야 한다.' },
    ],
  },
  {
    name: '신한은행_AI컴플라이언스_제안서.pdf', meta: 'PDF · 8.1MB · 2024.11.05', tag: '참고', icon: '📘', pages: 64,
    items: [
      { num: '1.1', text: 'AI 기반 이상거래 탐지 정확도 98.7% 달성 사례.' },
      { num: '2.2', text: '자연어 처리 기반 규제 문서 자동 분류 시스템 구축.' },
    ],
  },
  {
    name: '하이UX_외환자동화_제안서.pdf', meta: 'PDF · 5.3MB · 2024.09.20', tag: '참고', icon: '📘', pages: 48,
    items: [
      { num: '1.0', text: 'RPA 기반 외환 보고 자동화로 처리 시간 85% 단축.' },
      { num: '2.0', text: '멀티채널 통합 인터페이스를 통한 운영 효율화.' },
    ],
  },
  {
    name: '외환업무_현황분석_내부자료.pdf', meta: 'PDF · 1.2MB · 2025.02.28', tag: '참고', icon: '📄', pages: 18,
    items: [
      { num: 'A', text: '현행 외환 처리 업무 흐름도 및 병목 구간 분석.' },
      { num: 'B', text: '담당자 인터뷰 기반 pain point 정리.' },
    ],
  },
];

export default function RefView() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const file = FILES[selectedIdx];

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* 파일 목록 */}
      <div className="w-64 border-r flex flex-col shrink-0" style={{ background: 'rgb(var(--paper))', borderColor: 'rgb(var(--rule))' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: 'rgb(var(--rule))' }}>
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgb(var(--stone))' }}>문서 목록</span>
          <button
            onClick={() => alert('파일 업로드는 Phase 2 (Firebase Storage 연동) 이후 지원 예정이에요.')}
            className="text-xs px-2.5 py-1 font-medium"
            style={{ background: 'rgb(var(--ink))', color: 'rgb(var(--parchment))', borderRadius: 'var(--radius)' }}>
            + 업로드
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {FILES.map((f, i) => (
            <button
              key={i}
              onClick={() => setSelectedIdx(i)}
              className="w-full text-left p-3 rounded transition-colors"
              style={{
                background: i === selectedIdx ? 'rgb(var(--parchment))' : 'transparent',
                borderRadius: 'var(--radius)',
              }}>
              <div className="flex items-start gap-2">
                <span className="text-base">{f.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: 'rgb(var(--ink))' }}>{f.name}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgb(var(--stone))' }}>{f.meta}</p>
                  <span className="text-[10px] font-medium" style={{ color: i === selectedIdx ? 'rgb(var(--rust))' : 'rgb(var(--stone))' }}>{f.tag}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 뷰어 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 border-b shrink-0" style={{ borderColor: 'rgb(var(--rule))', background: 'rgb(var(--paper))' }}>
          <span className="text-sm font-semibold" style={{ color: 'rgb(var(--ink))' }}>{file.name}</span>
          <span className="text-xs" style={{ color: 'rgb(var(--stone))' }}>{file.pages}페이지</span>
          <span className="ml-auto text-[10px] px-2 py-0.5 font-medium" style={{ background: 'rgb(var(--parchment))', color: 'rgb(var(--rust))', borderRadius: 'var(--radius)' }}>{file.tag}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-xl mx-auto p-8 shadow-lg" style={{ background: 'rgb(var(--paper))' }}>
            <h3 className="font-serif text-base mb-1" style={{ color: 'rgb(var(--ink))' }}>{file.name.replace('.pdf', '')}</h3>
            <p className="text-xs mb-4" style={{ color: 'rgb(var(--stone))' }}>{file.meta}</p>
            <div className="space-y-1 text-xs" style={{ color: 'rgb(var(--ink))' }}>
              <p className="font-semibold mb-3 uppercase tracking-wider text-[10px]" style={{ color: 'rgb(var(--stone))' }}>요건 항목</p>
              {file.items.map(({ num, text }) => (
                <div key={num} className="flex gap-3 py-2.5 border-b" style={{ borderColor: 'rgb(var(--rule))' }}>
                  <span className="font-mono text-[10px] shrink-0 mt-0.5" style={{ color: 'rgb(var(--rust))' }}>{num}</span>
                  <span className="leading-relaxed">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
