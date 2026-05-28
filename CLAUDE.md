# PropDeck — 제안서 협업 워크스페이스

## 프로젝트 개요
제안서 공동 작성 툴. S-Core 내부 사용 케이스 기준으로 설계.
RFP 기반 제안서를 챕터별로 분담 작성하고, PPT + 텍스트를 한 곳에서 관리.

## 기술 스택
- React 19 + TypeScript + Vite
- Tailwind CSS v4
- shadcn/ui (Dialog, Input 등 일부 사용)
- 단일 HTML 번들로 배포 (`pnpm run build` → `bundle-artifact.sh`)

## 디자인 시스템
- **폰트**: DM Serif Display (헤더) + DM Sans (본문)
- **컬러**: 크림 배경(`--parchment`) + 따뜻한 블랙(`--ink`) + 테라코타(`--rust`) 액센트
- **원칙**: AI 블루 금지, 룰 라인 중심, 노이즈 텍스처 오버레이
- CSS 변수는 `src/index.css`의 `:root`에 정의

## 핵심 파일 구조
```
src/
├── types.ts          # 모든 타입 (Chapter, Project, SlideInfo 등)
├── data.ts           # 샘플 데이터, 템플릿 목록
├── lib/chapters.ts   # buildTree, flattenTree, getChapterNumber, normalizeOrders
├── views/
│   ├── ProjectList.tsx   # 프로젝트 목록 + 새 프로젝트 생성
│   ├── Workspace.tsx     # 헤더 + 사이드바 + 뷰 라우팅
│   ├── OverviewView.tsx  # 목차/인텐트 테이블 (Tab/Enter 키보드 편집)
│   ├── EditorView.tsx    # 에디터 (읽기/편집 모드, 포맷 바)
│   ├── FullView.tsx      # 전체 보기 (슬라이드 스트립 + 텍스트)
│   └── RefView.tsx       # 참고 문서
└── components/
    ├── Sidebar.tsx        # 챕터 트리 + 완성도 점수
    ├── SlideStrip.tsx     # 썸네일 스트립 + 뷰어 모달
    ├── PptCard.tsx        # PPT 버전 관리 (드래그앤드롭 업로드)
    ├── AttachCard.tsx     # 기타 첨부 파일
    ├── CommentPanel.tsx   # 코멘트 + 답글 + 리졸브
    ├── MembersPanel.tsx   # 팀원 관리 슬라이드 패널
    └── NotifDropdown.tsx  # 알림 드롭다운
```

## 상태 관리
- 전역 상태 없음. `App → Workspace → views` 로 prop drilling
- 챕터 수정: `onUpdateChapters(Chapter[])` 콜백으로 항상 전체 배열 교체
- 순서/계층 변경 후 반드시 `normalizeOrders()` 호출

## 챕터 계층 구조
- `parentId: null` = 루트 챕터
- `buildTree()` → 트리, `flattenTree()` → 순서대로 flat 배열
- 번호는 `getChapterNumber(id, chapters)`로 동적 계산 (이름에 숫자 포함 X)

## 에디터
- `contentEditable` div 사용 (Tiptap 미사용)
- `document.execCommand` 기반 포맷 (bold, italic, h1, h2, ul, ol)
- 읽기/편집 모드 분리. 저장 시 `innerHTML` → `chapter.text`

## PPT 파일
- 현재: CSS mock 썸네일 + `SlideInfo[]` 데이터
- 실제 서비스: 서버사이드 PPTX → PNG 변환 후 thumbnailUrl로 교체 예정

## 빌드
```bash
pnpm dev          # 로컬 개발 서버
pnpm run build    # dist/ 생성
bash /mnt/skills/examples/web-artifacts-builder/scripts/bundle-artifact.sh  # 단일 HTML 번들
```

## 미완성 / 후순위
- 챕터 순서 변경 버튼 (현재 DnD만)
- 텍스트 버전 히스토리
- 버전 충돌 감지
- 실제 PPT 썸네일 (서버사이드 변환)
- 챕터 담당자 변경 UI
