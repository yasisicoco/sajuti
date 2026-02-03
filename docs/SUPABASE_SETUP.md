# Supabase 설정 순서 (이 프로젝트용)

프로젝트를 돌리려면 Supabase에서 아래 순서대로 진행하면 됩니다.

---

## 1. Supabase 프로젝트 만들기

1. [supabase.com](https://supabase.com) 접속 후 로그인
2. **New project** 클릭
3. **Organization** 선택 (없으면 먼저 생성)
4. 다음 입력:
   - **Name**: 예) `sajuti` (원하는 이름)
   - **Database Password**: 강한 비밀번호 입력 후 **꼭 저장** (나중에 DB 직접 접속할 때 씀)
   - **Region**: `Northeast Asia (Seoul)` 또는 가까운 지역
5. **Create new project** 클릭
6. 프로젝트가 생성될 때까지 1~2분 대기

---

## 2. 테이블·정책 생성 (SQL 실행)

1. 왼쪽 메뉴에서 **SQL Editor** 클릭
2. **New query** 클릭
3. 프로젝트 루트의 **`supabase/schema.sql`** 파일 내용 **전부 복사**
4. SQL Editor에 붙여넣기
5. **Run** (또는 Ctrl+Enter) 실행
6. 아래처럼 나오면 성공:
   - `Success. No rows returned` 또는
   - 에러 없이 실행 완료

생성되는 것:

- `compatibility_results` (예전 결과 공유 링크용)
- `rooms` (궁합 모임 방)
- `room_participants` (방 참여자)
- 각 테이블 RLS 정책

---

## 3. URL과 API 키 복사

1. 왼쪽 메뉴 **Project Settings** (톱니바퀴) 클릭
2. **API** 메뉴 클릭
3. 아래 두 개 복사해 두기:
   - **Project URL**  
     예: `https://xxxxxxxx.supabase.co`
   - **service_role key** (Secret 키)  
     **anon key가 아니라 `service_role` 키**  
     "Reveal" 눌러서 전체 복사

⚠️ `service_role` 키는 서버에서만 쓰고, 절대 프론트 코드나 공개 저장소에 넣지 마세요.

---

## 4. 로컬 환경 변수 설정

1. 프로젝트 루트에 **`.env.local`** 파일 생성 (없으면)
2. 아래처럼 넣고, `Project URL`과 `service_role` 값을 **본인 값으로** 바꿈:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....
```

3. (선택) Vercel 등에 배포할 때:
   - **NEXT_PUBLIC_APP_URL** = 배포된 사이트 주소  
     예: `https://sajuti.vercel.app`

---

## 5. 동작 확인

1. 터미널에서:
   ```bash
   npm install
   npm run dev
   ```
2. 브라우저에서 `http://localhost:3000` 접속
3. **새 모임 만들기** → 내 정보 입력 → **모임 만들기**
4. 방 페이지로 넘어가고, **친구 부르기** / **나도 참여** 버튼이 보이면 Supabase 연동 정상

---

## 요약 체크리스트

- [ ] Supabase에서 새 프로젝트 생성
- [ ] SQL Editor에서 `supabase/schema.sql` 전체 실행
- [ ] Project Settings → API에서 **Project URL**, **service_role key** 복사
- [ ] 프로젝트 루트 `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` 설정
- [ ] `npm run dev` 후 방 만들기·참여 테스트

이 순서대로 하면 이 프로젝트에서 Supabase 쪽 설정은 끝납니다.

---

## (선택) MBTI/사주 궁합 GPT 생성

- MBTI·사주 궁합 설명을 GPT로 생성하려면 **OpenAI API 키**가 필요합니다.
- [OpenAI API Keys](https://platform.openai.com/api-keys)에서 키 발급 후, `.env.local`에 다음을 추가하세요.
  ```bash
  OPENAI_API_KEY=sk-...
  ```
- 설정하지 않으면 기존 규칙 기반 설명이 그대로 사용됩니다.
- 한 번 생성된 조합(MBTI 쌍, 사주 쌍)은 Supabase `compatibility_cache` 테이블에 저장되어, 같은 조합은 다시 호출하지 않습니다.
- **Supabase**에서 `supabase/schema.sql`을 다시 실행해 두면 `compatibility_cache` 테이블이 생성됩니다.
