"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { RoomResponse, RoomParticipant } from "@/app/api/rooms/[id]/route";
import {
  computeCompatibility,
  type CompatibilityResult,
} from "@/lib/compatibility";
import { getTierColor, RELATIONSHIP_TIERS } from "@/lib/relationship";
import { getSaju } from "@/lib/saju";
import {
  getMonthlyFortune,
  getRemainingMonthsOfYear,
  getCurrentYearMonth,
} from "@/lib/fortune";
import RelationshipGraph from "@/components/RelationshipGraph";
import { useCompatibilityDescription } from "@/hooks/useCompatibilityDescription";

type Props = {
  room: RoomResponse;
  meId?: string | null;
};

function displayName(p: RoomParticipant): string {
  return p.name?.trim() || p.mbti || "참여자";
}

/** 사주 결과를 "갑자년 병인월 정묘일 무진시" 형태로 */
function formatSajuPillars(p: RoomParticipant): string {
  const saju = getSaju(p.birth_year, p.birth_month, p.birth_day, p.birth_hour);
  return `${saju.year.ganName}${saju.year.jiName}년 ${saju.month.ganName}${saju.month.jiName}월 ${saju.day.ganName}${saju.day.jiName}일 ${saju.hour.ganName}${saju.hour.jiName}시`;
}

/** 한 쌍의 MBTI·사주 궁합 설명 (캐시/GPT 연동) */
function PairDescriptionContent({
  personA,
  personB,
  result,
}: {
  personA: RoomParticipant;
  personB: RoomParticipant;
  result: CompatibilityResult;
}) {
  const { mbtiParagraphs, sajuParagraphs, loading } =
    useCompatibilityDescription(personA, personB, result);
  return (
    <>
      <div>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          MBTI ({result.mbtiScore}점)
          {loading && (
            <span className="ml-1.5 text-xs text-slate-400">· 생성 중</span>
          )}
        </span>
        <div className="mt-1 space-y-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {mbtiParagraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          사주 ({result.sajuScore}점)
          {loading && (
            <span className="ml-1.5 text-xs text-slate-400">· 생성 중</span>
          )}
        </span>
        <div className="space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {sajuParagraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>
    </>
  );
}

export default function RoomView({ room, meId }: Props) {
  const [referenceId, setReferenceId] = useState<string | null>(
    room.participants.find((p) => p.is_creator)?.id ??
      room.participants[0]?.id ??
      null,
  );
  const [showFortune, setShowFortune] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [detailPair, setDetailPair] = useState<{
    a: RoomParticipant;
    b: RoomParticipant;
    result: ReturnType<typeof computeCompatibility>;
  } | null>(null);

  const reference = referenceId
    ? room.participants.find((p) => p.id === referenceId)
    : (room.participants[0] ?? null);
  const others = reference
    ? room.participants.filter((p) => p.id !== reference.id)
    : [];

  const openDetail = useCallback((a: RoomParticipant, b: RoomParticipant) => {
    setDetailPair({
      a,
      b,
      result: computeCompatibility(a, b),
    });
  }, []);

  const referenceSaju = useMemo(() => {
    if (!reference) return null;
    return getSaju(
      reference.birth_year,
      reference.birth_month,
      reference.birth_day,
      reference.birth_hour,
    );
  }, [reference]);

  const referenceRelations = useMemo(() => {
    if (!reference) return [];
    return others.map((other) => ({
      other,
      result: computeCompatibility(reference, other),
    }));
  }, [reference, others]);

  const joinPath = `/room/${room.id}/join`;
  const roomPath = `/room/${room.id}`;

  const handleShare = useCallback(async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${roomPath}`
        : roomPath;
    if (
      navigator.share &&
      /mobile|android|iphone|ipad/i.test(navigator.userAgent)
    ) {
      try {
        await navigator.share({
          title: room.name || "궁합 모임",
          text: "우리 궁합 한번 볼래?",
          url,
        });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      alert("방 링크가 복사되었어요.");
    } catch {
      prompt("아래 링크를 복사해 보내세요.", url);
    }
  }, [roomPath, room.name]);

  const handleShareJoin = useCallback(async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${joinPath}`
        : joinPath;
    if (navigator.share) {
      try {
        await navigator.share({
          title: room.name || "궁합 모임",
          text: "우리 궁합 방이야! 링크 들어와서 참여해줘.",
          url,
        });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      alert(
        "참여 링크가 복사되었어요. 친구에게 보내면 친구가 참여할 수 있어요.",
      );
    } catch {
      prompt("참여 링크를 복사해 보내세요.", url);
    }
  }, [joinPath, room.name]);

  return (
    <div className="flex min-h-[60vh] flex-col gap-5 pb-28 sm:gap-6 sm:pb-24">
      {/* 헤더: 방 이름, N명 참여, 버튼 */}
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg font-bold leading-tight text-slate-900 dark:text-slate-100 sm:text-xl">
            {room.name || "궁합 모임"}
          </h1>
          <span className="shrink-0 rounded-full bg-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 dark:bg-slate-600 dark:text-slate-300">
            {room.participants.length}명 참여
          </span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
          <button
            type="button"
            onClick={handleShareJoin}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            aria-label="공유하기 - 방 참여 링크 공유"
          >
            <span aria-hidden>📤</span>
            공유하기
          </button>
          <a
            href={joinPath}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            aria-label="나도 참여 - 참여 페이지로 이동"
          >
            <span aria-hidden>👤</span>
            나도 참여
          </a>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          방을 만든 사람이든 참여한 사람이든, 공유하기로 링크를 보내면 친구를
          초대할 수 있어요.
        </p>
      </header>

      {/* 관계 그래프: 노드 + 선으로 서로의 관계 한눈에 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/50 sm:p-5">
        <p className="mb-3 text-center text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          연결된 선을 누르면 두 사람 궁합을 볼 수 있어요
        </p>
        <RelationshipGraph
          participants={room.participants}
          onSelectPair={openDetail}
          selectedTier={selectedTier}
        />
        {room.participants.length > 1 && (
          <p className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">
            아래 등급을 누르면 해당 관계만 강조돼요
          </p>
        )}
        {room.participants.length > 1 && (
          <div className="mt-3 flex flex-wrap justify-center gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
            {RELATIONSHIP_TIERS.map(({ tier, color }) => (
              <button
                key={tier}
                type="button"
                onClick={() =>
                  setSelectedTier((prev) => (prev === tier ? null : tier))
                }
                className={`flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 sm:min-h-0 sm:min-w-0 sm:rounded-lg sm:px-2.5 sm:py-1.5 sm:text-xs ${
                  selectedTier === tier
                    ? "shadow-sm"
                    : "border-transparent hover:bg-slate-100 hover:shadow-sm dark:hover:bg-slate-800"
                }`}
                style={
                  selectedTier === tier
                    ? {
                        backgroundColor: `${color}18`,
                        borderColor: color,
                      }
                    : undefined
                }
                aria-pressed={selectedTier === tier}
                aria-label={`${tier} 관계만 보기`}
              >
                <span
                  className="h-2 w-4 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                  aria-hidden
                />
                {tier}
              </button>
            ))}
          </div>
        )}
        {room.participants.length === 1 && (
          <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
            위 공유하기로 링크를 보내면 친구가 참여할 수 있어요.
          </p>
        )}

        {/* 기준이 되는 사람 선택 + 그 사람의 사주 & 관계 (그림 블록 아래) */}
        {room.participants.length >= 1 && (
          <div className="mt-6 space-y-5 border-t border-slate-200 pt-6 dark:border-slate-700 sm:space-y-4">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              기준이 되는 사람 (누구를 기준으로 볼까요?)
            </p>
            <div className="flex flex-wrap gap-2">
              {room.participants.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setReferenceId(p.id)}
                  className={`min-h-[44px] rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 sm:min-h-0 sm:rounded-lg sm:px-3 sm:py-2 ${
                    referenceId === p.id
                      ? "bg-violet-500 text-white shadow-md ring-2 ring-violet-500/30"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-sm dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                  }`}
                  aria-pressed={referenceId === p.id}
                  aria-label={`${displayName(p)} 기준으로 보기`}
                >
                  {displayName(p)}
                  {p.is_creator && " (방장)"}
                </button>
              ))}
            </div>

            {reference && (
              <>
                {/* 기준 사람의 사주 */}
                <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800/80 sm:p-4">
                  <h3 className="mb-2 text-base font-semibold text-slate-700 dark:text-slate-300 sm:text-sm">
                    {displayName(reference)}의 사주
                  </h3>
                  <p className="text-base font-medium leading-relaxed tabular-nums text-slate-800 dark:text-slate-100 sm:text-sm">
                    {formatSajuPillars(reference)}
                  </p>
                </div>

                {/* 기준 사람의 올해 운세 (버튼 누르면 월별 카드 나열) */}
                <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800/80">
                  <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {displayName(reference)}의 올해 운세
                  </h3>
                  {!showFortune ? (
                    <button
                      type="button"
                      onClick={() => setShowFortune(true)}
                      className="w-full rounded-lg border-2 border-dashed border-violet-400 bg-violet-50/80 py-4 text-sm font-medium text-violet-800 transition-[border-color,background-color,box-shadow] hover:border-violet-500 hover:bg-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-violet-600 dark:bg-violet-950/50 dark:text-violet-200 dark:hover:bg-violet-900/50"
                      aria-expanded="false"
                      aria-label="올해 운세 보기"
                    >
                      올해 운세 보기 ({getCurrentYearMonth().year}년{" "}
                      {getCurrentYearMonth().month}월 ~ 12월)
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowFortune(false)}
                        className="mb-3 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                        aria-label="올해 운세 접기"
                      >
                        접기 ▲
                      </button>
                      <ul className="space-y-3">
                        {referenceSaju &&
                          (() => {
                            const { year } = getCurrentYearMonth();
                            return getRemainingMonthsOfYear().map((month) => {
                              const fortune = getMonthlyFortune(
                                referenceSaju,
                                year,
                                month,
                              );
                              return (
                                <li
                                  key={month}
                                  className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-600 dark:bg-slate-800"
                                >
                                  <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                                    {year}년 {month}월
                                  </span>
                                  <p className="mb-2 text-sm font-semibold text-violet-700 dark:text-violet-400">
                                    {fortune.title}
                                  </p>
                                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                    {fortune.text}
                                  </p>
                                </li>
                              );
                            });
                          })()}
                      </ul>
                    </>
                  )}
                </div>

                {/* 그 사람과 다른 사람들의 관계 - 쭉 나열 (누르지 않아도 전부 표시) */}
                {others.length > 0 && (
                  <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800/80 sm:p-4">
                    <h3 className="mb-3 text-base font-semibold text-slate-700 dark:text-slate-300 sm:text-sm">
                      {displayName(reference)}와 다른 사람들의 관계
                    </h3>
                    <ul className="space-y-4">
                      {referenceRelations.map(({ other, result }) => (
                        <li
                          key={other.id}
                          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-600 dark:bg-slate-800 sm:rounded-lg sm:p-4"
                        >
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-base font-semibold text-slate-800 dark:text-slate-100 sm:text-sm">
                              {displayName(reference)} × {displayName(other)}
                            </span>
                            <span
                              className="shrink-0 text-sm font-semibold"
                              style={{ color: getTierColor(result.tier) }}
                            >
                              {result.tier} · {result.combinedScore}점
                            </span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <PairDescriptionContent
                              personA={reference}
                              personB={other}
                              result={result}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </section>

      {/* 하단 CTA: 나도 참여하기 */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 p-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
        <p className="mb-2 text-center text-sm text-slate-600 dark:text-slate-400">
          {room.participants.length}명과의 궁합이 궁금하다면?
        </p>
        <a
          href={joinPath}
          className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-slate-800 px-4 py-3 text-base font-semibold text-white shadow-md transition-[box-shadow,background-color] hover:bg-slate-900 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-500 dark:bg-slate-700 dark:hover:bg-slate-600"
          aria-label="나도 참여하기"
        >
          나도 참여하기
        </a>
      </div>

      {/* 상세 모달 */}
      <AnimatePresence>
        {detailPair && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetailPair(null)}
            aria-modal="true"
            role="dialog"
            aria-labelledby="detail-title"
          >
            <motion.div
              className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl dark:bg-slate-900 sm:rounded-2xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2
                  id="detail-title"
                  className="text-lg font-bold text-slate-900 dark:text-slate-100"
                >
                  {displayName(detailPair.a)} × {displayName(detailPair.b)} 궁합
                </h2>
                <button
                  type="button"
                  onClick={() => setDetailPair(null)}
                  className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                  aria-label="닫기"
                >
                  ✕
                </button>
              </div>
              <div
                className="mb-4 rounded-xl px-4 py-3 text-center font-semibold"
                style={{
                  backgroundColor: `${getTierColor(detailPair.result.tier)}20`,
                  color: getTierColor(detailPair.result.tier),
                }}
              >
                {detailPair.result.tier} · 종합{" "}
                {detailPair.result.combinedScore}점
              </div>
              <div className="space-y-4 text-sm">
                <PairDescriptionContent
                  personA={detailPair.a}
                  personB={detailPair.b}
                  result={detailPair.result}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
