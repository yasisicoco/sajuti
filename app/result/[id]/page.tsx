import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import ResultView, { computeResult } from "@/components/ResultView";
import type { InputForm } from "@/lib/schema";

type Row = {
  id: string;
  person_a: InputForm["personA"];
  person_b: InputForm["personB"];
  mbti_score: number;
  saju_score: number;
  created_at?: string;
};

export default async function SharedResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-slate-600 dark:text-slate-400">
        공유 결과를 보려면 Supabase 환경 변수를 설정해 주세요.
      </div>
    );
  }

  const supabase = createClient(url, key);
  const { data: row, error } = await supabase
    .from("compatibility_results")
    .select("id, person_a, person_b, mbti_score, saju_score")
    .eq("id", id)
    .single();

  if (error || !row) notFound();

  const r = row as Row;
  const input: InputForm = {
    personA: r.person_a,
    personB: r.person_b,
  };
  const fullResult = computeResult(input);
  const resultForView = {
    ...fullResult,
    mbtiScore: r.mbti_score,
    sajuScore: r.saju_score,
    sajuHap: fullResult.sajuHap,
    sajuChung: fullResult.sajuChung,
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50/60 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 sm:text-4xl">
            MBTI × 사주 궁합
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            공유된 궁합 결과입니다.
          </p>
        </header>
        <a
          href="/"
          className="mb-6 inline-block text-sm font-medium text-violet-700 underline dark:text-violet-400"
        >
          ← 나도 궁합 보기
        </a>
        <ResultView result={resultForView} />
      </div>
    </main>
  );
}
