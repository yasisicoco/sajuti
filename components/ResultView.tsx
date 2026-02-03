"use client";

import { motion } from "framer-motion";
import type { InputForm } from "@/lib/schema";
import {
  mbtiCompatibility,
  getMbtiDescription,
  getMbtiShortLabel,
} from "@/lib/mbti";
import {
  getSaju,
  sajuCompatibility,
  getSajuDescription,
  getSajuShortLabel,
} from "@/lib/saju";

type ResultData = {
  input: InputForm;
  mbtiScore: number;
  sajuScore: number;
  sajuHap: number;
  sajuChung: number;
  sajuSangsaeng?: number;
  sajuSanggeuk?: number;
  sajuA: ReturnType<typeof getSaju>;
  sajuB: ReturnType<typeof getSaju>;
};

type Props = {
  result: ResultData;
  onShare?: () => void;
  shareUrl?: string | null;
};

export default function ResultView({ result, onShare, shareUrl }: Props) {
  const { input, mbtiScore, sajuScore, sajuHap, sajuChung } = result;
  const nameA = input.personA.name || "A";
  const nameB = input.personB.name || "B";

  return (
    <motion.div
      className="mx-auto max-w-2xl space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
          {nameA} × {nameB} 궁합 결과
        </h2>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          엔터테인먼트 목적이며 참고용으로만 이용해 주세요.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <ScoreCard
          title="MBTI 궁합"
          score={mbtiScore}
          label={getMbtiShortLabel(mbtiScore)}
          description={getMbtiDescription(
            mbtiScore,
            input.personA.mbti,
            input.personB.mbti,
          )}
          subText={`${input.personA.mbti} × ${input.personB.mbti}`}
        />
        <ScoreCard
          title="사주 혈합"
          score={sajuScore}
          label={getSajuShortLabel(sajuScore)}
          description={getSajuDescription(
            sajuScore,
            sajuHap,
            sajuChung,
            result.sajuSangsaeng,
            result.sajuSanggeuk,
          )}
          subText={
            result.sajuSangsaeng != null && result.sajuSanggeuk != null
              ? `합 ${sajuHap} · 충 ${sajuChung} · 상생 ${result.sajuSangsaeng} · 상극 ${result.sajuSanggeuk}`
              : `합 ${sajuHap} · 충 ${sajuChung}`
          }
        />
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-900/50 dark:bg-amber-950/30">
        <h3 className="mb-2 font-semibold text-amber-900 dark:text-amber-100">
          한 줄 요약
        </h3>
        <p className="text-stone-700 dark:text-stone-300">
          소통 강점: MBTI {mbtiScore >= 50 ? "보완·일치" : "차이"} 기반 이해.
          {sajuChung > 0
            ? " 주의: 사주상 충이 있어 갈등 시 대화로 풀어보세요."
            : " 사주도 무난한 편이에요."}
        </p>
      </div>

      {onShare && (
        <div className="flex flex-col items-center gap-2">
          <motion.button
            type="button"
            onClick={onShare}
            className="rounded-xl bg-stone-700 px-6 py-3 font-medium text-white transition hover:bg-stone-800 dark:bg-stone-600 dark:hover:bg-stone-500"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            결과 공유 링크 만들기
          </motion.button>
          {shareUrl && (
            <p className="text-sm text-stone-600 dark:text-stone-400">
              공유 링크:{" "}
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 underline dark:text-amber-400"
              >
                {shareUrl}
              </a>
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}

function ScoreCard({
  title,
  score,
  label,
  description,
  subText,
}: {
  title: string;
  score: number;
  label: string;
  description: string;
  subText?: string;
}) {
  const hue = score >= 70 ? 120 : score >= 50 ? 45 : 0;
  const color = `hsl(${hue}, 60%, 45%)`;

  return (
    <motion.div
      className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900/50"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.3 }}
    >
      <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-200">
        {title}
      </h3>
      {subText && (
        <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
          {subText}
        </p>
      )}
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-4xl font-bold tabular-nums" style={{ color }}>
          {score}
        </span>
        <span className="text-stone-500 dark:text-stone-400">/ 100</span>
      </div>
      <p className="mt-1 text-sm font-medium text-stone-600 dark:text-stone-300">
        {label}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
        {description}
      </p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay: 0.2, duration: 0.6 }}
        />
      </div>
    </motion.div>
  );
}

export function computeResult(input: InputForm): ResultData {
  const mbtiScore = mbtiCompatibility(input.personA.mbti, input.personB.mbti);
  const sajuA = getSaju(
    input.personA.birthYear,
    input.personA.birthMonth,
    input.personA.birthDay,
    input.personA.birthHour,
  );
  const sajuB = getSaju(
    input.personB.birthYear,
    input.personB.birthMonth,
    input.personB.birthDay,
    input.personB.birthHour,
  );
  const {
    score: sajuScore,
    hap: sajuHap,
    chung: sajuChung,
    sangsaeng: sajuSangsaeng,
    sanggeuk: sajuSanggeuk,
  } = sajuCompatibility(sajuA, sajuB);

  return {
    input,
    mbtiScore,
    sajuScore,
    sajuHap,
    sajuChung,
    sajuSangsaeng,
    sajuSanggeuk,
    sajuA,
    sajuB,
  };
}
