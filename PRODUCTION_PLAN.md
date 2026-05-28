# PropDeck 프로덕션 전환 작업 계획

> 현재 상태: React SPA 목업 (인메모리 상태, 단일 HTML 번들)  
> 목표: 실사용 가능한 S-Core 내부 협업 툴

---

## 현재 목업과 프로덕션의 차이

| 항목 | 현재 (목업) | 프로덕션 |
|------|------------|---------|
| 데이터 저장 | 브라우저 메모리 (새로고침 시 소멸) | Firestore 실시간 DB |
| 인증 | 없음 | Google SSO / 사내 IdP |
| 파일 업로드 | 선택 이벤트만 (저장 안 됨) | Firebase Storage |
| PPT 썸네일 | CSS mock | 서버사이드 PPTX → PNG 변환 |
| 실시간 협업 | 없음 | Firestore onSnapshot |
| 알림 | UI만 | 이메일 / Slack webhook |
| 권한 관리 | UI만 | Firestore Security Rules |
| 배포 | 단일 HTML 파일 | Firebase Hosting / Cloud Run |

---

## Phase 1 — 데이터 영속성 + 인증 (필수, ~3주)

> **목표**: 새로고침해도 데이터가 유지되고, 로그인이 필요한 상태

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

### 1-4. 실시간 동기화

현재 `useState`로 관리하는 상태를 Firestore `onSnapshot`으로 교체.

```typescript
// 현재
const [chapters, setChapters] = useState(SAMPLE_CHAPTERS);

// 변경 후
const chapters = useChapters(projectId); // onSnapshot hook
```

영향 범위: `OverviewView`, `EditorView`, `CommentPanel`, `Sidebar`

### 1-5. Firestore Security Rules

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

### 2-1. Firebase Storage 연동
- PPTX 파일 업로드 → `gs://bucket/projects/{id}/chapters/{id}/ppt/{version}/`
- 업로드 진행률 표시
- 다운로드 URL 생성 후 Firestore에 저장

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

### 3-1. 온라인 상태 표시
- Firebase Realtime Database presence 활용
- 같은 챕터를 보고 있는 사용자 아바타 표시 (에디터 상단)

### 3-2. 편집 잠금 (낙관적 락)
- 에디터 진입 시 `editingBy: userId` Firestore에 기록
- 다른 사용자가 진입 시 "누군가 편집 중" 표시
- 5분 비활동 시 자동 잠금 해제

### 3-3. 충돌 감지 (버전 기반)
- 저장 시 `version` 체크 (현재 후순위로 미뤄뒀던 기능)
- 충돌 감지 시 병합 UI 표시

---

## Phase 4 — 알림 (~1주)

> **목표**: @멘션, 인텐트 변경, 리뷰 요청 시 실제 알림 발송

### 4-1. 인앱 알림
- Firestore `/users/{uid}/notifications/` 컬렉션
- 새 알림 뱃지 실시간 업데이트 (현재 하드코딩된 빨간 점)

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
| 알림 클릭 → 챕터 이동 | UI만 | 클릭 시 해당 에디터로 라우팅 |
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
# Firebase Hosting
firebase deploy --only hosting

# 또는 Cloud Run (SSR 필요 시)
gcloud run deploy propdeck
```

### 모니터링
- Firebase Analytics (페이지 뷰, 기능 사용량)
- Crashlytics 또는 Sentry (에러 트래킹)

---

## 플랜별 비용 정리

### 데모 / 내부 테스트 단계
Firebase Spark 플랜(무료)으로 충분. 신용카드 등록 불필요.
- Hosting 10GB/월, Firestore 50K 읽기/일, Storage 1GB 이내면 $0

### Phase 1~2 (영속성 + 파일 처리)
Spark 플랜 유지 가능. PPTXjs 클라이언트 파싱 방식 사용 시 Cloud Functions 불필요.

### Phase 3 이후 (실시간 협업 + 알림)
Blaze 플랜 전환 권장. 단, Blaze도 Spark 무료 한도 포함.
소규모 내부 툴(DAU 50명 이하) 기준 **월 $5~20 예상**.

### Cloud Functions 도입 시점 (PPT 고품질 썸네일)
Blaze 플랜 필수. 변환 1회당 약 $0.0004 수준으로 실질 비용 미미.

---

## 전체 일정 요약

| Phase | 내용 | 예상 기간 | 우선순위 |
|-------|------|---------|---------|
| 1 | 데이터 영속성 + 인증 | 3주 | 🔴 필수 |
| 2 | 파일 처리 (PPT 업로드 + 썸네일) | 2주 | 🔴 필수 |
| 3 | 실시간 협업 | 2주 | 🟡 중요 |
| 4 | 알림 | 1주 | 🟡 중요 |
| 5 | 미완성 기능 완성 | 2주 | 🟢 필요 |
| 6 | 품질 + 배포 | 1주 | 🔴 필수 |
| **합계** | | **~11주** | |

---

## 기술 스택 (프로덕션)

```
Frontend  React 19 + TypeScript + Vite + Tailwind v4
Database  Firestore (실시간 동기화)
Auth      Firebase Auth (Google OAuth)
Storage   Firebase Storage (파일)
Functions Cloud Functions (PPT 변환, 알림)
Hosting   Firebase Hosting
Thumbnail PPTXjs (클라이언트, Phase 2) → LibreOffice headless (Cloud Functions, 선택 업그레이드)
```

---

## Phase 1 시작 전 결정 사항

1. **Firebase 프로젝트**: 신규 생성 vs 기존 S-Core 인프라 활용
2. **인증 방식**: Google OAuth vs 사내 SSO (SAML)
3. **접근 범위**: 에스코어 내부만 vs 고객사 계정도 허용
4. **데이터 격리**: 프로젝트별 vs 회사별 (멀티테넌시)
