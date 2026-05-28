# PropDeck 프로덕션 전환 작업 계획

> 현재 상태: React SPA 목업 (인메모리 상태, 단일 HTML 번들)  
> 목표: 실사용 가능한 S-Core 내부 협업 툴

---

## 현재 목업과 프로덕션의 차이

| 항목 | 현재 (목업) | 프로덕션 |
|------|------------|---------|
| 데이터 저장 | 브라우저 메모리 (새로고침 시 소멸) | Firestore 실시간 DB |
| 인증 | 없음 | Google SSO / 사내 IdP |
| 파일 업로드 | 선택 이벤트만 (저장 안 됨) | Firebase Storage (Spark 5GB 무료) |
| PPT 썸네일 | CSS mock | PPTXjs 브라우저 파싱 (무료) → Cloud Functions (선택) |
| 실시간 협업 | 없음 | Firestore onSnapshot (구독 수명주기 관리 필수) |
| 충돌 감지 | 없음 | 버전 기반 낙관적 락 (Phase 1에서 구현) |
| 알림 | UI만 | 이메일 / Slack webhook |
| 권한 관리 | UI만 | Firestore Security Rules |
| 배포 | 단일 HTML 파일 | Firebase Hosting |
| 백엔드 서버 | 없음 (SPA) | 없음 유지 (서버리스) |

---

## Phase 1 — 데이터 영속성 + 인증 + 충돌 감지 (필수, ~3주)

> **목표**: 새로고침해도 데이터가 유지되고, 로그인이 필요하며, 동시 편집 충돌이 처리됨

### 1-1. Firebase 프로젝트 설정
- Firebase 프로젝트 생성 (또는 기존 S-Core 프로젝트 활용)
- Firestore, Authentication, Storage 활성화
- `firebase-applet-config.json` 연동

### 1-2. 인증 (Firebase Auth)
- Google OAuth 로그인 (사내 Google Workspace 계정)
- 로그인/로그아웃 UI
- 인증된 사용자만 접근 가능하도록 라우팅 보호

```
src/
└── lib/
    ├── firebase.ts       # Firebase 초기화
    └── auth.ts           # useAuth hook
```

### 1-3. Firestore 데이터 모델

```
/projects/{projectId}
  name, client, emoji, ownerId, members[], createdAt

/projects/{projectId}/chapters/{chapterId}
  name, parentId, order, status, assigneeId, intent, rfp[], text, version

/projects/{projectId}/chapters/{chapterId}/comments/{commentId}
  userId, text, resolved, replies[], createdAt
```

### 1-4. 실시간 동기화 — onSnapshot 수명주기 관리 필수

현재 `useState`로 관리하는 상태를 Firestore `onSnapshot`으로 교체.

```typescript
// 현재
const [chapters, setChapters] = useState(SAMPLE_CHAPTERS);

// 변경 후
const chapters = useChapters(projectId); // onSnapshot hook
```

**⚠️ 구독 누수 방지**: onSnapshot은 반드시 `useEffect` cleanup에서 unsubscribe 호출.
패널(코멘트, 첨부, 히스토리)은 해당 챕터가 활성화된 동안만 구독, 챕터 전환 시 즉시 해제.
구독 수가 많을수록 Firestore 읽기 쿼터 소모가 빠름.

```typescript
useEffect(() => {
  const unsubscribe = onSnapshot(q, handler);
  return () => unsubscribe(); // 반드시 cleanup
}, [chapterId]);
```

영향 범위: `OverviewView`, `EditorView`, `CommentPanel`, `Sidebar`

### 1-5. 버전 기반 충돌 감지

참조 구현 있음 (AI Studio PPT Co-Authoring 프로젝트에서 검증된 패턴).
Firestore 연동 시점에 바로 적용 가능.

```typescript
// 편집 시작 시 현재 버전 스냅샷
const [editingBaseVersion, setEditingBaseVersion] = useState<number | null>(null);

// 저장 시 DB 최신 버전과 비교
const snap = await getDoc(chapterRef);
if (snap.data().version > editingBaseVersion) {
  setConflict({ dbVersion, dbTitle, dbContent }); // 충돌 UI 표시
  return;
}

// 충돌 없으면 version + 1로 저장
await updateDoc(chapterRef, { ...data, version: currentVersion + 1 });
```

충돌 발생 시 side-by-side diff UI로 "서버 버전 채택" vs "내 버전 저장" 선택.
WordDiff 컴포넌트(단어 단위 변경 하이라이트)도 참조 구현에서 포팅 가능.

### 1-6. Firestore Security Rules

```javascript
// 프로젝트 멤버만 읽기/쓰기
match /projects/{projectId} {
  allow read, write: if request.auth.uid in resource.data.memberIds;
}
```

---

## Phase 2 — 파일 처리 (~2주)

> **목표**: 실제 PPT 파일이 업로드되고 버전 관리됨  
> **플랜**: Spark 무료 플랜으로 가능 (Cloud Functions 미사용)

### 2-1. Firebase Storage 연동 (base64 Firestore 저장 금지)

파일은 반드시 Firebase Storage에 저장. Firestore 문서 내 base64 인라인 저장 금지.

이유:
- Firestore 문서 최대 크기 1MB → 파일 저장 시 읽기/쓰기 비용 급증
- Firebase Storage는 Spark 플랜에서 5GB 무료 제공
- 다운로드 URL만 Firestore에 저장하는 패턴이 표준

```
파일 업로드 → Firebase Storage gs://bucket/projects/{id}/chapters/{id}/ppt/{version}/
→ 다운로드 URL → Firestore pptVersions[].url 에 저장
```

### 2-2. PPT 썸네일 (단계적 접근)

현재 CSS mock → 실제 슬라이드 이미지. **Blaze 플랜 불필요.**

**Phase 2: 브라우저 파싱 (무료)**  
`PPTXjs` 라이브러리로 클라이언트에서 직접 슬라이드 렌더링.
서버 불필요, Spark 플랜에서 동작. 복잡한 애니메이션·특수 폰트는 부분적으로 깨질 수 있음.

```
PPTX 업로드 → Storage 저장
→ 클라이언트에서 PPTXjs로 파싱
→ Canvas로 슬라이드 렌더링 → 썸네일 표시
```

**향후 품질 개선이 필요할 때: Cloud Functions (Blaze 플랜)**
```
PPTX 업로드 트리거 → Cloud Function
→ LibreOffice headless PNG 변환
→ Storage thumbnails/ 저장 → Firestore thumbnailUrls[] 업데이트
```

`SlideInfo`에 `thumbnailUrl?: string` 추가. 있으면 이미지, 없으면 CSS mock fallback.

---

## Phase 3 — 실시간 협업 (~2주)

> **목표**: 여러 사용자가 동시에 작업할 때 충돌 없이 동작  
> 충돌 감지는 Phase 1에서 이미 구현됨. Phase 3은 presence/잠금 레이어 추가.

### 3-1. 온라인 상태 표시
- Firebase Realtime Database presence 활용
- 같은 챕터를 보고 있는 사용자 아바타 표시 (에디터 상단)

### 3-2. 편집 잠금 (낙관적 락)
- 에디터 진입 시 `editingBy: userId` Firestore에 기록
- 다른 사용자가 진입 시 "누군가 편집 중" 표시
- 5분 비활동 시 자동 잠금 해제

---

## Phase 4 — 알림 (~1주)

> **목표**: @멘션, 인텐트 변경, 리뷰 요청 시 실제 알림 발송

### 4-1. 인앱 알림
- Firestore `/users/{uid}/notifications/` 컬렉션
- 새 알림 뱃지 실시간 업데이트 (현재 하드코딩된 빨간 점)
- 알림 클릭 → 해당 챕터 에디터로 라우팅

### 4-2. 이메일 알림 (선택)
- Cloud Functions + SendGrid 또는 사내 SMTP
- @멘션, 리뷰 요청, 인텐트 변경 트리거

### 4-3. Slack 연동 (선택)
- Slack Incoming Webhook
- 채널별 알림 설정

---

## Phase 5 — 미완성 기능 완성 (~2주)

현재 목업에서 UI만 있는 기능들:

| 기능 | 현재 상태 | 작업 내용 |
|------|----------|---------|
| 멤버 초대 | 입력창만 | Firebase Auth 이메일 초대 |
| 역할 기반 권한 | 목업 동작, DB 미연동 | Firestore Security Rules 적용 |
| 챕터 담당자 변경 | 목업 동작, DB 미연동 | Firestore 업데이트 연결 |
| 마크다운 내보내기 | 텍스트 복사만 | .md 파일 다운로드 |
| 전체 문서 내보내기 | 없음 | PDF 또는 DOCX 내보내기 |
| 텍스트 버전 히스토리 | 후순위 | `/history` 서브컬렉션 |
| 챕터 순서 이동 | 목업 DnD 동작 | Firestore order 반영 |

---

## Phase 6 — 품질 및 배포 (~1주)

### 테스트
- Vitest + React Testing Library (단위 테스트)
- Playwright (e2e: 로그인, 챕터 생성, 저장 플로우)

### 에러 처리
- 네트워크 오류 toast 알림
- Firestore 오프라인 캐시 활성화 (오프라인 대응)

### 배포
```bash
# Firebase Hosting (순수 SPA, 서버 불필요)
firebase deploy --only hosting
```

### 모니터링
- Firebase Analytics (페이지 뷰, 기능 사용량)
- Sentry (에러 트래킹)

---

## 비용 정리

### 핵심 원칙
Spark 플랜은 한도 초과 시 **요금 청구 없이 서비스 차단**. 예상치 못한 비용 발생 구조 없음.
Blaze 플랜으로 업그레이드해야만 과금 시작.

### 단계별 예상 비용

| 단계 | 플랜 | 예상 비용 |
|------|------|---------|
| 데모 / 목업 배포 | Spark (무료) | **$0** |
| Phase 1~2 (영속성 + 파일) | Spark (무료) | **$0** |
| Phase 3~4 (실시간 협업 + 알림) | Spark 유지 또는 Blaze 전환 | **$0 ~ 월 $20** |
| PPT 고품질 썸네일 (선택) | Blaze 필수 | 변환당 $0.0004 수준 |

### Spark 무료 한도 (S-Core 소규모 팀 기준 충분)
- Firestore: 읽기 50K/일, 쓰기 20K/일, 저장 1GB
- Firebase Storage: **5GB** (파일 저장용)
- Hosting: 전송 10GB/월
- Auth: 50K MAU/월

### 비용 최소화 설계 결정
- 백엔드 서버 없음 (순수 SPA) → Cloud Run / 서버 비용 없음
- 파일은 Firebase Storage 저장, Firestore 문서에 URL만 기록 → 읽기 쿼터 절약
- onSnapshot은 활성 컴포넌트에만 구독, 반드시 cleanup → 불필요한 읽기 차단
- Cloud Functions 미사용 (Phase 3 이전) → Blaze 불필요

---

## 전체 일정 요약

| Phase | 내용 | 예상 기간 | 우선순위 |
|-------|------|---------|---------|
| 1 | 데이터 영속성 + 인증 + 충돌 감지 | 3주 | 🔴 필수 |
| 2 | 파일 처리 (Firebase Storage + PPTXjs) | 2주 | 🔴 필수 |
| 3 | 실시간 협업 (presence + 잠금) | 2주 | 🟡 중요 |
| 4 | 알림 | 1주 | 🟡 중요 |
| 5 | 미완성 기능 완성 | 2주 | 🟢 필요 |
| 6 | 품질 + 배포 | 1주 | 🔴 필수 |
| **합계** | | **~11주** | |

---

## 기술 스택 (프로덕션)

```
Frontend  React 19 + TypeScript + Vite + Tailwind v4
Database  Firestore (실시간 동기화, onSnapshot cleanup 필수)
Auth      Firebase Auth (Google OAuth)
Storage   Firebase Storage (파일 저장, Spark 5GB 무료)
Hosting   Firebase Hosting (SPA, 서버 없음)
Thumbnail PPTXjs (클라이언트, Phase 2) → LibreOffice headless (Cloud Functions, 선택)
충돌처리  버전 기반 낙관적 락 (Phase 1, 참조 구현 있음)
```

---

## Phase 1 시작 전 결정 사항

1. **Firebase 프로젝트**: 신규 생성 vs 기존 S-Core 인프라 활용
2. **인증 방식**: Google OAuth vs 사내 SSO (SAML)
3. **접근 범위**: 에스코어 내부만 vs 고객사 계정도 허용
4. **데이터 격리**: 프로젝트별 vs 회사별 (멀티테넌시)
