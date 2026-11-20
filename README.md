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

첫 화면은 UI 동작을 바로 확인할 수 있도록 시연 빌드를 표시합니다. 현재 UI 저장은 해당 브라우저의 `localStorage`에 기록되며, 다른 브라우저나 기기와 동기화되지 않습니다. Express/PostgreSQL API는 준비되어 있지만 현재 UI와 연결되어 있지 않습니다.

## GitHub Pages 배포

GitHub Pages에는 정적 UI만 배포됩니다. API 서버와 PostgreSQL은 GitHub Pages에서 실행되지 않으며, 배포된 UI의 빌드 저장은 브라우저별 `localStorage`를 사용합니다. 저장 데이터를 여러 기기에서 공유하려면 API와 데이터베이스를 별도로 호스팅하고 UI에 연결해야 합니다.

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

## PostgreSQL 연결 준비

1. `server/.env.example`을 `server/.env`로 복사하고 `DATABASE_URL`을 설정합니다.
2. `server/src/db/migrations/001_create_builds.sql`을 데이터베이스에 적용합니다.
3. API는 `/api/builds`에서 조회·저장·삭제 요청을 제공합니다. DB 미설정 시 해당 API는 명시적으로 `503`을 반환합니다.

## 현재 화면

- 보관함: 빌드 상세, 룬 구성, 스킬 순서, 라인 아이콘, 삭제 및 PNG 다운로드
- 룰렛: 챔피언·룬·라인 무작위 추첨, 오른쪽 결과 미리보기, 빌드 저장
- 다크 모드 및 좁은 화면 레이아웃

챔피언 초상화는 최신 CommunityDragon CDN 이미지에서 받은 로컬 정적 파일(`ui/public/champions/`)을 사용하므로 앱 표시 시 외부 이미지 서버를 호출하지 않습니다. 추천 스킬·아이템 데이터는 아직 임의로 채우지 않으며 비워 둡니다.
챔피언 로스터, 룬 경로, 선택지, 파편은 CommunityDragon의 최신 한국어 게임 데이터(`champion-summary.json`, `perkstyles.json`, `perks.json`)를 기준으로 관리합니다.
룬 경로·룬·파편 아이콘도 CommunityDragon 이미지에서 받은 로컬 정적 파일(`ui/public/runes/`)로 제공하며, 이름과 이미지 ID 연결은 `ui/src/data/runeIcons.json`에 있습니다.
라인 아이콘은 CommunityDragon의 최신 포지션 SVG를 `ui/public/lanes/`에 로컬로 포함해 사용합니다.
