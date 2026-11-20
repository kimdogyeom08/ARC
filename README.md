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
Copy-Item server\.env.example server\.env
npm run dev
```

- UI: http://localhost:5173
- API 상태 확인: http://localhost:3001/api/health

`server/.env`에서 API 포트는 `PORT`, PostgreSQL 포트는 `DB_PORT`로 설정합니다. `DATABASE_URL`에는 DB 호스트·계정·이름을 입력하고, `DB_PORT`는 URL의 포트를 덮어씁니다. `.env`는 Git에 커밋하지 마세요.

첫 화면은 UI 동작을 바로 확인할 수 있도록 시연 빌드를 표시합니다. API 주소가 설정되지 않은 UI는 해당 브라우저의 `localStorage`에 저장하며, API 주소가 설정되면 이름·비밀번호 계정으로 로그인해 사용자별 빌드를 서버에 저장합니다. 계정 이름은 중복될 수 없고 비밀번호는 8자 이상입니다. 이메일 및 비밀번호 재설정 기능은 제공하지 않습니다.

## GitHub Pages 배포

GitHub Pages에는 정적 UI만 배포됩니다. API 서버와 PostgreSQL은 별도로 호스팅해야 합니다. 계정별 저장을 활성화하려면 API를 배포한 뒤 GitHub 저장소의 **Settings → Secrets and variables → Actions → Variables**에 `VITE_API_BASE_URL`을 추가하고 API의 HTTPS 기본 주소를 값으로 설정합니다. 이후 Pages 워크플로를 다시 실행합니다.

1. 로컬에서 `npm run build`가 성공하는지 확인합니다.
2. GitHub에서 새 저장소를 만듭니다. 이 로컬 저장소와 연결할 때는 원격 저장소에 README나 초기 커밋을 추가하지 않는 편이 간단합니다.
3. 저장소가 아직 연결되지 않았다면 원격을 추가하고 `main` 브랜치를 올립니다.

   ```powershell
   git remote add origin https://github.com/<OWNER>/<REPOSITORY>.git
   git push -u origin main
   ```

4. GitHub 저장소의 **Settings → Pages → Build and deployment → Source**에서 **GitHub Actions**를 선택합니다.
5. `main`에 푸시하면 `.github/workflows/deploy-pages.yml`이 UI를 빌드하고 Pages에 배포합니다. 저장소의 **Actions** 탭에서 작업이 완료됐는지 확인합니다.
6. 사이트 주소는 `https://<OWNER>.github.io/<REPOSITORY>/` 형식입니다. 저장소 이름에 맞는 Vite 경로는 배포 워크플로가 설정합니다.

## 선택 사항: API 및 데이터베이스 배포 (Render + Neon)

1. Neon에서 PostgreSQL 프로젝트를 만들고 **Connect**에서 pooled connection string을 복사합니다. 이 문자열은 비밀번호가 포함된 비밀 값이므로 공개 저장소나 채팅에 올리지 마세요.
2. Render에서 **New → Blueprint**를 선택하고 이 저장소를 연결합니다. `render.yaml`이 API를 무료 웹 서비스로 설정하고, `AUTH_SECRET`을 생성하며, Neon 연결 문자열을 입력할 `DATABASE_URL` 항목을 요청합니다.
3. Neon SQL Editor에서 `server/src/db/migrations/001_create_builds.sql`을 먼저, `server/src/db/migrations/002_add_accounts_and_build_ownership.sql`을 다음으로 실행합니다.
4. Render 배포가 완료되면 `https://<Render 서비스 주소>/api/health`를 엽니다. JSON 응답의 `databaseConfigured`와 `authConfigured`가 모두 `true`인지 확인합니다.
5. GitHub 저장소의 **Settings → Secrets and variables → Actions → Variables**에 `VITE_API_BASE_URL`을 추가하고 Render 서비스의 기본 HTTPS 주소를 입력합니다(`/api`는 붙이지 않습니다). Pages 워크플로를 다시 실행합니다.
6. 공개 UI에서 계정을 만든 뒤 로그인하고, 빌드 저장·조회·삭제가 계정별로 분리되는지 확인합니다.

API 주소가 설정되지 않은 UI는 기존 브라우저별 저장 모드로 동작합니다.

새 계정 생성은 공개 사이트에서 누구나 할 수 있습니다. 비밀번호 원문은 저장하지 않으며, 기존 브라우저 `localStorage` 빌드는 계정에 자동 이전되지 않습니다.

## 현재 화면

- 보관함: 빌드 상세, 룬 구성, 스킬 순서, 라인 아이콘, 삭제 및 PNG 다운로드
- 룰렛: 챔피언·룬·라인 무작위 추첨, 오른쪽 결과 미리보기, 빌드 저장
- 다크 모드 및 좁은 화면 레이아웃

챔피언 초상화는 최신 CommunityDragon CDN 이미지에서 받은 로컬 정적 파일(`ui/public/champions/`)을 사용하므로 앱 표시 시 외부 이미지 서버를 호출하지 않습니다. 추천 스킬·아이템 데이터는 아직 임의로 채우지 않으며 비워 둡니다.
챔피언 로스터, 룬 경로, 선택지, 파편은 CommunityDragon의 최신 한국어 게임 데이터(`champion-summary.json`, `perkstyles.json`, `perks.json`)를 기준으로 관리합니다.
룬 경로·룬·파편 아이콘도 CommunityDragon 이미지에서 받은 로컬 정적 파일(`ui/public/runes/`)로 제공하며, 이름과 이미지 ID 연결은 `ui/src/data/runeIcons.json`에 있습니다.
라인 아이콘은 CommunityDragon의 최신 포지션 SVG를 `ui/public/lanes/`에 로컬로 포함해 사용합니다.
