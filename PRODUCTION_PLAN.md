# PropDeck 프로덕션 전환 계획

> 작업 인수인계용. 현재 상태와 각 Phase에서 해야 할 작업을 기술.

---

## 현재 상태 (목업)

- React 19 + TypeScript + Vite + Tailwind v4 SPA
- 단일 HTML 번들 (`bundle.html`) — Firebase Hosting 배포 가능
- 모든 데이터는 인메모리. 새로고침 시 초기화됨
- 인증 없음. 단일 사용자 목업
- 빌드: `pnpm run build` → `bash bundle-artifact.sh` → `bundle.html`

### 소스 구조

```
src/
├── App.tsx               # 프로젝트 목록 ↔ 워크스페이스 라우팅
├── types.ts              # Chapter, Project, Member, SlideInfo, Comment, Reply
├── data.ts               # SAMPLE_CHAPTERS, INITIAL_PROJECTS, MEMBERS, TEMPLATES
├── index.css             # 디자인 토큰 (--ink, --rust, --parchment 등)
├── lib/
│   ├── chapters.ts       # buildTree, flattenTree, getChapterNumber, maturityScore
│   └── utils.ts          # cn()
├── views/
│   ├── ProjectList.tsx
│   ├── Workspace.tsx     # 헤더 + 사이드바 + 뷰 라우팅
│   ├── OverviewView.tsx  # 챕터 브리프 테이블
│   ├── EditorView.tsx    # 텍스트 에디터 (contentEditable)
│   ├── FullView.tsx      # 전체 보기 + 슬라이드 스트립
│   └── RefView.tsx       # 참고 문서 뷰어 (하드코딩)
└── components/
    ├── Sidebar.tsx        # 챕터 트리 + 완성도 바
    ├── PptCard.tsx        # PPT 버전 관리 (드래그앤드롭, 목업)
    ├── AttachCard.tsx     # 기타 첨부
    ├── CommentPanel.tsx   # 코멘트 + 답글 + 리졸브
    ├── MembersPanel.tsx   # 팀원 관리
    ├── SlideStrip.tsx     # 슬라이드 썸네일 스트립
    └── NotifDropdown.tsx  # 알림 드롭다운
```

### 설계 결정 (변경 금지)

- 상태 관리: 전역 없음. `App → Workspace → views` prop drilling. Firestore 연동 시 `onSnapshot` hook으로 교체
- 챕터 계층: `parentId` 기반 트리. 번호는 `getChapterNumber()` 동적 계산
- 챕터 수정: 항상 `onUpdateChapters(Chapter[])` 전체 배열 교체
- 에디터: `contentEditable div` + `document.execCommand`. Firestore 연동 시 그대로 유지

---

## Phase 1 — 데이터 영속성 + 인증 (~3주)

### Firebase 설정

```bash
# 필요 서비스: Firestore, Authentication, Hosting
# Spark 플랜(무료)으로 시작 가능. 신용카드 불필요
```

```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
```

### Firestore 데이터 모델

```
/projects/{projectId}
  name, client, emoji, ownerId, memberIds[], createdAt

/projects/{projectId}/chapters/{chapterId}
  name, parentId, order, status, assigneeId, intent, rfp[], text, version

/projects/{projectId}/chapters/{chapterId}/comments/{commentId}
  userId, text, resolved, replies[], createdAt

/projects/{projectId}/chapters/{chapterId}/history/{historyId}
  userId, text, savedAt

/users/{uid}/notifications/{notifId}
  type, projectId, chapterId, fromUserId, read, createdAt
```

현재 `types.ts`의 타입 구조와 대응됨. `version: number` 필드가 충돌 감지에 사용됨.

### 인증

- Google OAuth (사내 Google Workspace 계정) 또는 SAML SSO
- 라우팅 보호: 미인증 시 로그인 화면으로 redirect

### onSnapshot 연동 시 유의사항

현재 `useState(SAMPLE_CHAPTERS)` → `useChapters(projectId)` hook으로 교체.
**반드시 `useEffect` cleanup에서 `unsubscribe()` 호출** (구독 누수 = Firestore 읽기 쿼터 낭비).

```typescript
useEffect(() => {
  const unsubscribe = onSnapshot(query, handler);
  return () => unsubscribe();
}, [projectId]);
```

코멘트, 히스토리 패널은 해당 챕터 활성 시에만 구독.

### 충돌 감지 (버전 기반 낙관적 락)

검증된 참조 구현 있음. 저장 시 DB 최신 버전 확인 후 충돌이면 side-by-side UI 표시.
서버 버전(읽기 전용) / 내 버전(편집 가능한 textarea) 나란히 표시. 차이 하이라이팅 없음. 둘 중 하나 선택하거나 내 버전을 수정 후 저장.

```typescript
const handleSave = async () => {
  const snap = await getDoc(chapterRef);
  if (snap.data().version > editingBaseVersion) {
    setConflict({ dbVersion, dbTitle, dbContent }); // UI에서 선택
    return;
  }
  await updateDoc(chapterRef, { ...data, version: current + 1 });
};
```

### Security Rules

```javascript
match /projects/{projectId} {
  allow read, write: if request.auth.uid in resource.data.memberIds;
}
```

### Phase 1에서 함께 완성할 목업 기능

| 항목 | 현재 상태 | 작업 |
|------|----------|------|
| 멤버 초대 | 입력창 UI만 | Firebase Auth 이메일 초대 연동 |
| 역할 기반 권한 | 목업 동작 | Security Rules 적용 |
| 챕터 담당자 | 목업 동작 | Firestore 업데이트 연결 |
| 챕터 순서 DnD | 목업 동작 | Firestore `order` 필드 반영 |
| 텍스트 버전 히스토리 | 없음 | `/history` 서브컬렉션 저장 |
| 알림 (코멘트·상태변경·담당자 지정) | 하드코딩 3개 | `/users/{uid}/notifications/` 구독 |

---

## Phase 2 — 파일 처리 (~2주)

### Firebase Storage (Spark 플랜 5GB 무료)

**Firestore 문서 내 base64 저장 금지.** 파일은 반드시 Storage에 저장, URL만 Firestore에 기록.

```
gs://bucket/projects/{id}/chapters/{id}/ppt/{version}/{filename}
gs://bucket/projects/{id}/refs/{filename}
```

현재 `PptCard.tsx`가 목업으로 파일 선택 이벤트만 처리. Storage 연동 시 실제 업로드 + URL 저장으로 교체.

### PPT 썸네일

Phase 2: `PPTXjs` 클라이언트 파싱 (무료, Spark 플랜).
향후 품질 개선 시: Cloud Functions + LibreOffice headless (Blaze 플랜 필요).

`SlideInfo` 타입에 `thumbnailUrl?: string` 추가. 없으면 현재 CSS mock fallback.

### Phase 2에서 함께 완성할 목업 기능

| 항목 | 현재 상태 | 작업 |
|------|----------|------|
| PPT 전체 머지 내보내기 | 버튼만 있음 (alert) | Storage 파일 머지 |
| RefView 파일 목록 | 하드코딩 | 실제 Storage 파일 목록 연동 |
| 알림 (파일 업로드) | 미구현 | Storage 업로드 완료 시 알림 이벤트 |

---

## 비용

Spark 플랜은 한도 초과 시 **요금 청구 없이 서비스 차단**. 예상치 못한 과금 없음.
Blaze로 직접 업그레이드해야만 과금 시작.

| 단계 | 예상 비용 |
|------|---------|
| 데모 ~ Phase 2 | $0 (Spark 무료) |
| PPT 고품질 썸네일 (선택) | Blaze 필요, 변환당 $0.0004 수준 |

---

## Phase 1 시작 전 확인 사항

1. Firebase 프로젝트: 신규 생성 vs 기존 S-Core 인프라 활용
2. 인증 방식: Google OAuth vs 사내 SSO (SAML)
3. 접근 범위: 에스코어 내부만 vs 고객사 계정 포함
4. 데이터 격리: 프로젝트별 vs 회사별 멀티테넌시
