"use client";

import { useState, useEffect, useMemo } from "react";
import { getMbtiDescriptionDetailed } from "@/lib/mbti-descriptions";
import { getSajuInterpretationDetailed } from "@/lib/saju-interpretation";
import { getSaju, sajuToPillarKey } from "@/lib/saju";
import type { CompatibilityResult } from "@/lib/compatibility";

type ParticipantLike = {
  mbti: string;
  birth_year: number;
  birth_month: number;
  birth_day: number;
  birth_hour: number;
};

export function useCompatibilityDescription(
  personA: ParticipantLike,
  personB: ParticipantLike,
  result: CompatibilityResult,
) {
  const sajuA = useMemo(
    () =>
      getSaju(
        personA.birth_year,
        personA.birth_month,
        personA.birth_day,
        personA.birth_hour,
      ),
    [
      personA.birth_year,
      personA.birth_month,
      personA.birth_day,
      personA.birth_hour,
    ],
  );
  const sajuB = useMemo(
    () =>
      getSaju(
        personB.birth_year,
        personB.birth_month,
        personB.birth_day,
        personB.birth_hour,
      ),
    [
      personB.birth_year,
      personB.birth_month,
      personB.birth_day,
      personB.birth_hour,
    ],
  );

  const pillarKeyA = useMemo(() => sajuToPillarKey(sajuA), [sajuA]);
  const pillarKeyB = useMemo(() => sajuToPillarKey(sajuB), [sajuB]);

  const localMbtiParagraphs = useMemo(
    () =>
      getMbtiDescriptionDetailed(personA.mbti, personB.mbti)
        .split("\n\n")
        .filter(Boolean),
    [personA.mbti, personB.mbti],
  );
  const localSajuParagraphs = useMemo(
    () =>
      getSajuInterpretationDetailed(sajuA, sajuB, {
        score: result.sajuScore,
        hap: result.sajuHap,
        chung: result.sajuChung,
        sangsaeng: result.sajuSangsaeng,
        sanggeuk: result.sajuSanggeuk,
      })
        .split("\n\n")
        .filter(Boolean),
    [
      sajuA,
      sajuB,
      result.sajuScore,
      result.sajuHap,
      result.sajuChung,
      result.sajuSangsaeng,
      result.sajuSanggeuk,
    ],
  );

  const [apiMbti, setApiMbti] = useState<string[] | null>(null);
  const [apiSaju, setApiSaju] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setApiMbti(null);
    setApiSaju(null);

    const body = {
      mbtiA: personA.mbti,
      mbtiB: personB.mbti,
      sajuPillarsA: pillarKeyA,
      sajuPillarsB: pillarKeyB,
      sajuScore: result.sajuScore,
      hap: result.sajuHap,
      chung: result.sajuChung,
      sangsaeng: result.sajuSangsaeng,
      sanggeuk: result.sajuSanggeuk,
    };

    fetch("/api/compatibility/describe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (
          data: {
            mbti?: { paragraphs: string[] };
            saju?: { paragraphs: string[] };
          } | null,
        ) => {
          if (cancelled) return;
          if (data?.mbti?.paragraphs) setApiMbti(data.mbti.paragraphs);
          if (data?.saju?.paragraphs) setApiSaju(data.saju.paragraphs);
        },
      )
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    personA.mbti,
    personB.mbti,
    pillarKeyA,
    pillarKeyB,
    result.sajuScore,
    result.sajuHap,
    result.sajuChung,
    result.sajuSangsaeng,
    result.sajuSanggeuk,
  ]);

  return {
    mbtiParagraphs: apiMbti ?? localMbtiParagraphs,
    sajuParagraphs: apiSaju ?? localSajuParagraphs,
    loading,
  };
}
