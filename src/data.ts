import type { Chapter, Project, Member, Comment } from './types';

export const MEMBERS: Member[] = [
  { name: 'Alex', initial: 'A', color: 'rust',   email: 'alex@score.co.kr',  role: 'PM',    isMe: true },
  { name: 'Chris',  initial: 'C', color: 'navy',   email: 'chris@score.co.kr', role: '작성자' },
  { name: 'Jamie',  initial: 'J', color: 'forest', email: 'jamie@score.co.kr', role: '작성자' },
  { name: 'Sam',    initial: 'S', color: 'amber',  email: 'sam@score.co.kr',   role: '작성자' },
  { name: 'Ryan',   initial: 'R', color: 'rust',   email: 'ryan@score.co.kr',  role: '뷰어'   },
];

export const SAMPLE_COMMENTS: Record<string, Comment[]> = {
  'ch1': [
    { id: 'c1-1', author: 'Alex', initial: 'A', color: 'rust',
      text: '규제 변화 수치를 2024년 기준으로 업데이트해주세요. 금감원 작년 발표 자료 참고하면 됩니다.',
      time: '오늘 10:22', resolved: false,
      replies: [
        { id: 'r1-1', author: 'Ryan', initial: 'R', color: 'rust', text: '확인했습니다. 수치 반영해서 오전 중 올리겠습니다.', time: '오늘 10:35' }
      ]
    },
    { id: 'c1-2', author: 'Jamie', initial: 'J', color: 'forest',
      text: '경쟁사 도입 현황 슬라이드가 빠져 있어요. 신한·하나 사례를 추가하면 설득력이 올라갈 것 같아요.',
      time: '어제 16:40', resolved: true, replies: [] }
  ],
  'ch1-1': [
    { id: 'c1-1-1', author: 'Chris', initial: 'C', color: 'navy',
      text: '오류율 1.4배 수치의 출처 명시 필요해요. 평가단에서 분명히 물어볼 거예요.',
      time: '오늘 09:15', resolved: false,
      replies: [
        { id: 'r1-1-1', author: 'Ryan', initial: 'R', color: 'rust', text: '내부 감사 보고서 2024-Q3 자료 기준입니다. 각주 추가할게요.', time: '오늘 09:28' },
        { id: 'r1-1-2', author: 'Chris', initial: 'C', color: 'navy', text: '감사합니다. 공개 가능한 자료인지도 확인 부탁드려요.', time: '오늘 09:31' }
      ]
    }
  ],
  'ch2': [
    { id: 'c2-1', author: 'Alex', initial: 'A', color: 'rust',
      text: '@Jamie 인텐트 수정했어요. 기술 설명보다 운영 관점 중심으로 재작성 필요합니다. 담당자 역할과 예외처리 흐름이 핵심이에요.',
      time: '오늘 11:05', resolved: false,
      replies: [
        { id: 'r2-1', author: 'Jamie', initial: 'J', color: 'forest', text: '알겠습니다. 오늘 오후까지 수정하겠습니다.', time: '오늘 11:18' }
      ]
    },
    { id: 'c2-2', author: 'Sam', initial: 'S', color: 'amber',
      text: 'SLA 기준치 수치가 빠져있어요. 99.9% 기준인지 99.5%인지 명확히 해야 할 것 같아요.',
      time: '어제 14:20', resolved: false, replies: [] }
  ],
  'ch2-1': [
    { id: 'c2-1-1', author: 'Jamie', initial: 'J', color: 'forest',
      text: 'AI 플래그 → 담당자 검토 → 최종 처리 흐름을 다이어그램으로 표현하면 좋겠어요.',
      time: '오늘 13:44', resolved: false, replies: [] }
  ],
  'ch3': [
    { id: 'c3-1', author: 'Chris', initial: 'C', color: 'navy',
      text: 'DCS 연동 방식이 REST API인지 배치인지 명시가 안 돼 있어요. RFP 2.1 요건이라 반드시 기재해야 합니다.',
      time: '오늘 14:30', resolved: false,
      replies: [
        { id: 'r3-1', author: 'Sam', initial: 'S', color: 'amber', text: 'Real-time REST + 일 1회 배치 병행 구조입니다. 다이어그램에 반영할게요.', time: '오늘 14:52' }
      ]
    },
    { id: 'c3-2', author: 'Alex', initial: 'A', color: 'rust',
      text: '신규 인프라 구축 없이 기존 BDC 위에서 동작한다는 점을 더 강조해주세요. 이게 우리 차별점입니다.',
      time: '2일 전', resolved: true, replies: [] }
  ],
  'ch4': [
    { id: 'c4-1', author: 'Alex', initial: 'A', color: 'rust',
      text: '금융보안원 클라우드 보안 가이드라인 2024 버전 반영됐는지 확인이 필요해요.',
      time: '3일 전', resolved: false,
      replies: [
        { id: 'r4-1', author: 'Sam', initial: 'S', color: 'amber', text: '아직 반영 전입니다. 이번 주 내로 업데이트하겠습니다.', time: '3일 전' }
      ]
    }
  ],
  'ch6': [
    { id: 'c6-1', author: 'Jamie', initial: 'J', color: 'forest',
      text: '업무시간 절감률 수치를 보수적으로 잡아야 할 것 같아요. 70% 절감은 너무 낙관적으로 보일 수 있어요.',
      time: '1일 전', resolved: false,
      replies: [
        { id: 'r6-1', author: 'Alex', initial: 'A', color: 'rust', text: '파일럿 결과 기준이라 방어 가능합니다. 주석에 출처 명기하면 될 것 같아요.', time: '1일 전' },
        { id: 'r6-2', author: 'Jamie', initial: 'J', color: 'forest', text: '그렇군요. 파일럿 규모와 기간을 같이 표기하면 신뢰도 높아질 것 같습니다.', time: '23시간 전' }
      ]
    }
  ],
};

export const SAMPLE_CHAPTERS: Chapter[] = [
  // ── 1. 도입 배경 및 필요성 ──────────────────────────────────
  { id: 'ch1', name: '도입 배경 및 필요성', parentId: null, order: 1, status: 'done',
    assignee: 'Ryan', assigneeInitial: 'R', assigneeColor: 'rust',
    intent: '외환 규제 변화로 인한 수동 프로세스 한계를 수치로 제시하고, AI 도입의 불가피성을 평가위원이 납득할 수 있도록 서술. 경쟁사 도입 현황 포함.',
    rfp: ['RFP 1.1', 'RFP 1.2'],
    pptVersions: [
      { name: '01_도입배경_v3.pptx', size: '2.1MB', version: 3, uploader: 'Ryan', date: '오늘' },
      { name: '01_도입배경_v2.pptx', size: '1.8MB', version: 2, uploader: 'Ryan', date: '2일 전' },
      { name: '01_도입배경_v1.pptx', size: '1.5MB', version: 1, uploader: 'Ryan', date: '5일 전' },
    ],
    slides: [
      { title: '도입 배경 및 필요성', sub: '규제 환경 변화 개요', color: 'navy' },
      { title: '현행 업무 프로세스 한계', sub: '수동 처리 오류율 분석', color: 'navy' },
      { title: '경쟁사 도입 현황', sub: '신한·하나·KB 사례', color: 'navy' },
      { title: 'AI 도입 불가피성', sub: '정량적 근거 제시', color: 'navy' },
    ],
    attachments: [{ name: '금감원_외환규제_가이드라인_2024.pdf', size: '3.2MB', date: '3일 전', icon: '📕' }],
    text: '<h1>도입 배경 및 필요성</h1><p>최근 외환거래 규정의 복잡도 증가와 금융감독원의 컴플라이언스 강화 기조로 인해, 현행 수동 기반 외환업무 처리 방식의 한계가 명확해지고 있습니다.</p><h2>규제 환경 변화</h2><p>2024년 금융감독원은 외환거래 모니터링 기준을 전면 개정하며 실시간 이상거래 탐지 의무화를 추진하고 있습니다. 이에 따라 금융기관은 기존 T+1 배치 방식에서 실시간 처리 체계로의 전환이 불가피한 상황입니다.</p><h2>현행 프로세스 한계</h2><p>우리은행의 외환 처리 건수는 연간 약 120만 건으로, 담당 인력의 73%가 반복적인 규정 대조 업무에 투입되고 있습니다. 처리 오류율은 업계 평균 대비 1.4배 높은 수준으로, 연간 컴플라이언스 과태료 리스크가 약 42억 원에 달합니다.</p>' },

  { id: 'ch1-1', name: '현황 분석', parentId: 'ch1', order: 1, status: 'done',
    assignee: 'Ryan', assigneeInitial: 'R', assigneeColor: 'rust',
    intent: '현행 수동 처리 방식의 오류율·처리 시간·인력 비용을 수치로 제시. 내부 감사 보고서 2024-Q3 기준.',
    rfp: ['RFP 1.1'],
    pptVersions: [{ name: '01-1_현황분석_v2.pptx', size: '1.4MB', version: 2, uploader: 'Ryan', date: '어제' },
                  { name: '01-1_현황분석_v1.pptx', size: '1.2MB', version: 1, uploader: 'Ryan', date: '4일 전' }],
    slides: [
      { title: '현황 분석', sub: '오류율 & 처리 건수', color: 'navy' },
      { title: '인력 투입 현황', sub: '업무별 공수 분석', color: 'navy' },
    ],
    attachments: [],
    text: '<h1>현황 분석</h1><p>우리은행의 연간 외환 처리 건수는 약 120만 건(2023년 기준)이며, 이 중 수동 검토가 필요한 건은 전체의 34%인 약 40만 건에 달합니다.</p><h2>오류율 현황</h2><p>처리 오류율은 0.87%로 업계 평균(0.62%) 대비 1.4배 높은 수준입니다. 오류의 72%는 규정 해석 불일치, 28%는 데이터 입력 오류에서 발생합니다.</p><h2>인력 비용</h2><p>외환 컴플라이언스 담당 인력 23명 중 17명(73.9%)이 규정 대조·검토 업무에 투입되고 있으며, 연간 인건비 대비 단순 반복 업무 비중은 68%입니다.</p>' },

  { id: 'ch1-2', name: '도입 필요성', parentId: 'ch1', order: 2, status: 'review',
    assignee: 'Ryan', assigneeInitial: 'R', assigneeColor: 'rust',
    intent: '규제 환경 변화 트렌드 + 경쟁사 도입 현황을 근거로 도입 불가피성을 서술. 감정적 설득 아닌 사실 기반.',
    rfp: ['RFP 1.2'],
    pptVersions: [{ name: '01-2_도입필요성_v1.pptx', size: '1.1MB', version: 1, uploader: 'Ryan', date: '2일 전' }],
    slides: [
      { title: '도입 필요성', sub: '규제 트렌드 분석', color: 'navy' },
      { title: '경쟁사 도입 현황', sub: '국내 주요 은행 사례', color: 'navy' },
      { title: '미도입 시 리스크', sub: '과태료 및 평판 리스크', color: 'navy' },
    ],
    attachments: [],
    text: '<h1>도입 필요성</h1><p>신한은행(2023.06), 하나은행(2023.11), KB국민은행(2024.02)이 순차적으로 AI 기반 외환 컴플라이언스 시스템을 도입 완료했습니다. 우리은행은 현재 5대 시중은행 중 유일하게 수동 처리 방식을 유지하고 있습니다.</p><h2>규제 압박 증가</h2><p>금융감독원은 2025년 하반기부터 실시간 외환 모니터링 의무 보고를 시행할 예정으로, 현행 T+1 배치 방식으로는 요건 충족이 불가능합니다.</p>' },

  // ── 2. 솔루션 개요 ───────────────────────────────────────────
  { id: 'ch2', name: '솔루션 개요', parentId: null, order: 2, status: 'review',
    assignee: 'Jamie', assigneeInitial: 'J', assigneeColor: 'forest',
    intent: '에스코어 AI 컴플라이언스 솔루션의 핵심 기능과 차별점 제시. 기술 스펙 나열 금지, 도입 효과 중심으로.',
    rfp: ['RFP 2.1', 'RFP 2.2'],
    pptVersions: [
      { name: '02_솔루션개요_v2.pptx', size: '3.4MB', version: 2, uploader: 'Jamie', date: '오늘' },
      { name: '02_솔루션개요_v1.pptx', size: '2.9MB', version: 1, uploader: 'Jamie', date: '3일 전' },
    ],
    slides: [
      { title: '솔루션 개요', sub: '핵심 기능 3가지', color: 'forest' },
      { title: '실시간 이상거래 탐지', sub: 'AI 모델 정확도 98.3%', color: 'forest' },
      { title: '자동 규정 대조', sub: '3,200개 규정 항목 자동화', color: 'forest' },
      { title: '경보·보고 자동화', sub: '담당자 업무 70% 절감', color: 'forest' },
      { title: '기존 시스템 통합', sub: 'DCS/BDC 연동 아키텍처', color: 'forest' },
    ],
    attachments: [{ name: '에스코어_AI컴플라이언스_제품소개서_v4.pdf', size: '5.7MB', date: '1주일 전', icon: '📕' }],
    text: '<h1>솔루션 개요</h1><p>에스코어의 AI 스마트 컴플라이언스는 기존 우리은행 DCS/BDC 인프라와 완전 통합되는 방식으로, 신규 인프라 구축 없이 현행 환경에서 즉시 운영 가능합니다.</p><h2>핵심 기능</h2><p>실시간 이상거래 탐지(정확도 98.3%), 3,200개 규정 항목 자동 대조, 규제 보고서 자동 생성의 3가지 핵심 기능을 제공합니다.</p><h2>주요 차별점</h2><p>국내 외환 규정 특화 학습 데이터(5년, 800만 건)와 금감원 보고 양식 자동 생성 기능은 글로벌 솔루션이 제공하지 못하는 에스코어 고유 기능입니다.</p>' },

  { id: 'ch2-1', name: '핵심 기능', parentId: 'ch2', order: 1, status: 'review',
    assignee: 'Jamie', assigneeInitial: 'J', assigneeColor: 'forest',
    intent: '3가지 핵심 기능을 각각 한 슬라이드씩 상세 설명. 정확도·처리 속도 수치 반드시 포함.',
    rfp: ['RFP 2.1'],
    pptVersions: [{ name: '02-1_핵심기능_v1.pptx', size: '2.1MB', version: 1, uploader: 'Jamie', date: '어제' }],
    slides: [
      { title: '실시간 이상거래 탐지', sub: '머신러닝 기반 탐지 엔진', color: 'forest' },
      { title: '자동 규정 대조', sub: 'NLP 기반 문서 분석', color: 'forest' },
      { title: '자동 보고서 생성', sub: '금감원 표준 양식 지원', color: 'forest' },
    ],
    attachments: [],
    text: '' },

  { id: 'ch2-2', name: '도입 효과', parentId: 'ch2', order: 2, status: 'wip',
    assignee: 'Sam', assigneeInitial: 'S', assigneeColor: 'amber',
    intent: '파일럿 결과 기반 정량 효과 제시. 업무시간 절감·오류율 감소·비용 절감 KPI 중심. 출처 명기 필수.',
    rfp: ['RFP 2.4'],
    pptVersions: [],
    slides: [],
    attachments: [{ name: '파일럿_결과보고서_2024Q4.xlsx', size: '0.8MB', date: '5일 전', icon: '📊' }],
    text: '' },

  // ── 3. 시스템 아키텍처 ──────────────────────────────────────
  { id: 'ch3', name: '시스템 아키텍처', parentId: null, order: 3, status: 'wip',
    assignee: 'Sam', assigneeInitial: 'S', assigneeColor: 'amber',
    intent: 'DCS/BDC 연동 구조를 명확히 도식화. 신규 구축 아닌 통합임을 강조. RFP 2.1·2.3 요건 자연스럽게 반영.',
    rfp: ['RFP 2.1', 'RFP 2.3'],
    pptVersions: [
      { name: '03_아키텍처_v2.pptx', size: '2.1MB', version: 2, uploader: 'Sam', date: '오늘' },
      { name: '03_아키텍처_v1.pptx', size: '1.9MB', version: 1, uploader: 'Sam', date: '3일 전' },
    ],
    slides: [
      { title: '시스템 아키텍처 전체도', sub: 'DCS/BDC 통합 구조', color: 'amber' },
      { title: '데이터 흐름도', sub: '실시간 처리 파이프라인', color: 'amber' },
      { title: 'AI 추론 엔진', sub: '모델 서빙 아키텍처', color: 'amber' },
    ],
    attachments: [
      { name: '시스템_아키텍처_다이어그램_v3.png', size: '1.2MB', date: '오늘', icon: '🖼️' },
      { name: 'DCS_연동_인터페이스_정의서.pdf', size: '0.6MB', date: '어제', icon: '📕' },
    ],
    text: '<h1>시스템 아키텍처</h1><p>에스코어의 AI 컴플라이언스 솔루션은 기존 우리은행 DCS 및 BDC 인프라와의 완전한 통합을 전제로 설계되었습니다. 신규 인프라 구축 없이 현행 환경에서 즉시 운영 가능합니다.</p><h2>통합 아키텍처</h2><p>Real-time REST API 방식과 일 1회 배치 처리를 병행하는 하이브리드 구조로, DCS와의 실시간 데이터 연동 및 BDC 스토리지 활용을 통해 기존 인프라 투자를 최대한 보존합니다.</p>' },

  { id: 'ch3-1', name: '데이터 흐름', parentId: 'ch3', order: 1, status: 'wip',
    assignee: 'Sam', assigneeInitial: 'S', assigneeColor: 'amber',
    intent: '데이터 수집 → 전처리 → AI 추론 → 결과 저장 → 알림 전송의 5단계 파이프라인을 다이어그램과 함께 설명.',
    rfp: ['RFP 2.1'],
    pptVersions: [],
    slides: [],
    attachments: [],
    text: '' },

  { id: 'ch3-2', name: '보안 아키텍처', parentId: 'ch3', order: 2, status: 'todo',
    assignee: null, assigneeInitial: null, assigneeColor: null,
    intent: '금융보안원 클라우드 보안 가이드라인 2024 기준 충족 여부 명시. 데이터 암호화·접근 제어·감사 로그 항목별 대응.',
    rfp: ['RFP 2.3'],
    pptVersions: [],
    slides: [],
    attachments: [],
    text: '' },

  // ── 4. 운영 방안 ─────────────────────────────────────────────
  { id: 'ch4', name: '운영 방안', parentId: null, order: 4, status: 'todo',
    assignee: 'Chris', assigneeInitial: 'C', assigneeColor: 'navy',
    intent: '담당자 역할·예외 처리·장애 대응을 포함한 실제 운영 체계 제시. 기술 설명 아닌 운영 관점으로 작성.',
    rfp: ['RFP 3.1', 'RFP 3.2'],
    pptVersions: [],
    slides: [],
    attachments: [],
    text: '' },

  { id: 'ch4-1', name: '운영 조직 구성', parentId: 'ch4', order: 1, status: 'todo',
    assignee: 'Chris', assigneeInitial: 'C', assigneeColor: 'navy',
    intent: '기존 외환업무팀 조직 유지 + AI 운영 전담 인력 2명 추가 배치 방식으로 최소 조직 변화를 강조.',
    rfp: ['RFP 3.1'],
    pptVersions: [],
    slides: [],
    attachments: [],
    text: '' },

  { id: 'ch4-2', name: 'SLA 및 장애 대응', parentId: 'ch4', order: 2, status: 'todo',
    assignee: null, assigneeInitial: null, assigneeColor: null,
    intent: '99.9% 가용성 SLA, 장애 감지 5분 이내, 복구 목표 시간 2시간 이내 기준 명시.',
    rfp: ['RFP 3.2'],
    pptVersions: [],
    slides: [],
    attachments: [],
    text: '' },

  // ── 5. 보안 및 컴플라이언스 ─────────────────────────────────
  { id: 'ch5', name: '보안 및 컴플라이언스', parentId: null, order: 5, status: 'todo',
    assignee: 'Sam', assigneeInitial: 'S', assigneeColor: 'amber',
    intent: '금융보안원 기준 항목별 충족 여부를 체크리스트 형태로 명시. 평가단이 빠르게 확인할 수 있도록.',
    rfp: ['RFP 4.1', 'RFP 4.2', 'RFP 4.3'],
    pptVersions: [],
    slides: [],
    attachments: [],
    text: '' },

  // ── 6. 추진 일정 ─────────────────────────────────────────────
  { id: 'ch6', name: '추진 일정', parentId: null, order: 6, status: 'todo',
    assignee: 'Alex', assigneeInitial: 'A', assigneeColor: 'rust',
    intent: '6개월 단계별 일정을 마일스톤 중심으로. 리스크 완충 기간 포함. 과도하게 촉박하게 보이지 않도록.',
    rfp: ['RFP 5.1'],
    pptVersions: [],
    slides: [],
    attachments: [],
    text: '' },

  // ── 7. 기대 효과 ─────────────────────────────────────────────
  { id: 'ch7', name: '기대 효과', parentId: null, order: 7, status: 'wip',
    assignee: 'Jamie', assigneeInitial: 'J', assigneeColor: 'forest',
    intent: '정량 수치 중심. 업무시간 70% 절감·오류율 94% 감소·연간 비용 절감액 KPI로 ROI 납득. 파일럿 결과 출처 명기.',
    rfp: ['RFP 2.4'],
    pptVersions: [{ name: '07_기대효과_v1.pptx', size: '1.6MB', version: 1, uploader: 'Jamie', date: '어제' }],
    slides: [
      { title: '정량적 기대 효과', sub: '파일럿 결과 기반 KPI', color: 'forest' },
      { title: '업무 효율화', sub: '담당자 업무시간 70% 절감', color: 'forest' },
      { title: 'ROI 분석', sub: '투자 회수 기간 14개월', color: 'forest' },
    ],
    attachments: [],
    text: '<h1>기대 효과</h1><p>2024년 4분기 파일럿 운영(12주, 외환업무팀 5명 참여) 결과를 기반으로 한 정량적 효과입니다.</p><h2>핵심 KPI</h2><p>담당자 단순 반복 업무시간 70% 절감, 처리 오류율 94% 감소(0.87% → 0.05%), 연간 컴플라이언스 비용 18억 원 절감이 확인되었습니다.</p><h2>ROI 분석</h2><p>초기 구축 비용 대비 투자 회수 기간은 14개월로, 금융권 AI 프로젝트 평균(22개월) 대비 36% 단축됩니다.</p>' },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: '우리은행 AI 스마트 컴플라이언스',
    client: '우리은행 · 디지털전략본부',
    emoji: '🏦',
    progress: 42,
    deadline: '2025.04.30',
    members: MEMBERS,
    chapters: SAMPLE_CHAPTERS,
    comments: SAMPLE_COMMENTS,
  },
  {
    id: 'p2',
    name: 'SK케미칼 품질관리 포털 구축',
    client: 'SK케미칼 · IT혁신팀',
    emoji: '🏭',
    progress: 78,
    deadline: '2025.05.15',
    members: MEMBERS.slice(0, 2),
    chapters: [],
    comments: {},
  },
  {
    id: 'p3',
    name: '국민은행 차세대 뱅킹 플랫폼',
    client: '국민은행 · 디지털혁신본부',
    emoji: '🏛',
    progress: 15,
    deadline: '2025.06.20',
    members: MEMBERS.slice(0, 3),
    chapters: [],
    comments: {},
  },
];

export const TEMPLATES = [
  { name: '일반 제안서',       chapters: ['도입 배경 및 필요성', '솔루션 개요', '운영 방안', '기대 효과'] },
  { name: 'SI/개발 제안서',    chapters: ['현황 분석', '요구사항 분석', '시스템 아키텍처', '구현 계획', '추진 일정', '기대 효과'] },
  { name: 'AI 솔루션 제안서',  chapters: ['도입 배경', 'AI 모델 설계', '시스템 아키텍처', '보안 및 컴플라이언스', '운영 방안', '기대 효과'] },
];
