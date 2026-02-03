# Vercel 배포 시 NOT_FOUND(404) 해결

배포 후 `NOT_FOUND` 또는 404가 나올 때 아래를 순서대로 확인하세요.

---

## 1. 빌드가 성공했는지 확인

1. Vercel 대시보드 → 프로젝트 → **Deployments**
2. 최신 배포 클릭 → **Building** / **Ready** 상태 확인
3. **Building**에서 실패했다면 **View Build Logs**에서 에러 메시지 확인
   - `npm install` 실패, `next build` 실패 등이 있으면 먼저 해결

빌드가 실패한 상태면 사이트 접속 시 NOT_FOUND나 에러 페이지가 나올 수 있습니다.

---

## 2. 접속 URL 확인

- **반드시 루트 주소로 접속**: `https://프로젝트명.vercel.app/` (끝에 `/` 포함해도 됨)
- `/room/xxx`, `/result/xxx` 같은 **존재하지 않는 id**로 들어가면 404가 납니다. (이때는 앱의 커스텀 404 페이지가 보입니다.)
- Vercel이 보여주는 **NOT_FOUND** 문구가 "리소스를 찾을 수 없음"이라면, **배포(Deployment) 자체가 없거나 삭제된 경우**일 수 있습니다.  
  → 팀/프로젝트를 바꿀 때마다 URL이 달라지므로, **현재 프로젝트의 Production URL**을 다시 확인하세요.

---

## 3. Vercel 프로젝트 설정

1. **Settings** → **General**
   - **Framework Preset**: `Next.js` 로 설정
   - **Root Directory**: 이 저장소 루트가 프로젝트 루트면 **비워 두기**. (하위 폴더에 앱이 있으면 그 폴더 지정)
2. **Settings** → **Environment Variables**
   - 로컬에서 쓰는 값(`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` 등)이 **Production**에 설정돼 있는지 확인
   - 수정 후에는 **Redeploy** 한 번 해 주세요.

---

## 4. Node 버전 (필요 시)

Next.js 16 사용 시 Node 18 이상이 필요할 수 있습니다.

- **Settings** → **General** → **Node.js Version** 에서 `18.x` 또는 `20.x` 로 지정 후 재배포해 보세요.

---

## 5. 재배포

설정을 바꾼 뒤에는 **Deployments** 탭에서 최신 배포 옆 **⋯** → **Redeploy** 로 다시 배포한 다음,  
`https://프로젝트명.vercel.app/` 로 접속해 보세요.

---

## 요약 체크리스트

- [ ] Deployments에서 최신 배포가 **Ready** (빌드 성공)
- [ ] 접속 URL이 `https://프로젝트명.vercel.app/` (루트)
- [ ] Framework Preset = **Next.js**, Root Directory는 필요 시만 지정
- [ ] 환경 변수 설정 후 **Redeploy**
- [ ] 그래도 404면 Build Logs 에러 메시지 확인

이후에도 NOT_FOUND가 계속되면, Build Logs에 나온 에러 메시지를 알려주면 원인 파악에 도움이 됩니다.
