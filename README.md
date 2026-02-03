# MBTI × 사주 궁합

두 사람의 **MBTI**와 **생년월일시**(양력)를 입력하면 MBTI 궁합(유사도 기반)과 사주 혈합(천간·지지 합/충) 점수와 설명을 보여주는 엔터테인먼트용 궁합 사이트입니다.

- **MBTI**: 4자리 일치도 기반 0~100점 (각 축 일치 +25점)
- **사주**: 양력 기준 년·월·일·시주 계산 후 천간 오합·지지 육합/육충으로 점수화
- **이름**: 표시용만 사용, 궁합 계산에는 미사용 (프라이버시 최소)

## 기술 스택

- **Frontend**: Next.js 15 (App Router), Tailwind CSS, React Hook Form, Framer Motion, Zod
- **Backend**: Next.js API Routes
- **DB**: Supabase (PostgreSQL) – 결과 저장/공유 링크용, RLS 적용

## 환경 변수

`.env.example`을 참고해 `.env.local`에 설정하세요.

- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`: Supabase 프로젝트에서 발급
- `NEXT_PUBLIC_APP_URL`: (선택) 공유 링크 도메인. 미설정 시 요청 origin 사용

Supabase 미설정 시에도 궁합 계산·결과 보기는 가능하고, **결과 공유 링크 만들기**만 동작하지 않습니다.

## Supabase 스키마

Supabase 대시보드 SQL Editor에서 `supabase/schema.sql` 내용을 실행해 `compatibility_results` 테이블과 RLS 정책을 생성하세요.

## Getting Started

의존성 설치 후 개발 서버 실행:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 두 사람 정보를 입력한 뒤 **궁합 보기**를 누르면 결과가 표시됩니다. **결과 공유 링크 만들기**로 Supabase에 저장 후 `/result/[id]` 링크를 공유할 수 있습니다.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
