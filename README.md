# ARC — All Random Challenge

React 화면과 Express API를 별도 앱으로 실행하는 개발 시작점입니다.

## 요구 사항

- Node.js 20 이상
- PostgreSQL 14 이상 (DB 연동을 사용할 때)

## 실행

```powershell
npm install
npm install --prefix ui
npm install --prefix server
npm run dev
```

- UI: http://localhost:5173
- API 상태 확인: http://localhost:3001/api/health

첫 화면은 UI 동작을 바로 확인할 수 있도록 시연 빌드를 표시합니다. 현재 UI 저장은 이 브라우저의 `localStorage`에만 기록되며, PostgreSQL API 연결은 다음 통합 단계에서 진행합니다. “프로토타입 · 브라우저 임시 저장” 표시는 이 동작을 나타냅니다.

## PostgreSQL 연결 준비

1. `server/.env.example`을 `server/.env`로 복사하고 `DATABASE_URL`을 설정합니다.
2. `server/src/db/migrations/001_create_builds.sql`을 데이터베이스에 적용합니다.
3. API는 `/api/builds`에서 조회·저장·삭제 요청을 제공합니다. DB 미설정 시 해당 API는 명시적으로 `503`을 반환합니다.

## 현재 화면

- 보관함: 빌드 상세, 룬 구성, 스킬 순서, 라인 아이콘, 삭제 및 PNG 다운로드
- 룰렛: 챔피언 뽑기, 룬·파편 선택, 오른쪽 결과 미리보기, 빌드 저장
- 다크 모드 및 좁은 화면 레이아웃

챔피언 초상화는 Riot Data Dragon 이미지 URL을 사용합니다. 추천 스킬·아이템 데이터는 아직 임의로 채우지 않으며 비워 둡니다.
