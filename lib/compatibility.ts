/**
 * 두 참여자 간 궁합 계산 (방 내 관계 그래프/상세용)
 */

import type { RoomParticipant } from "@/app/api/rooms/[id]/route";
import { mbtiCompatibility } from "./mbti";
import { getSaju, sajuCompatibility } from "./saju";
import {
  combinedScore,
  getRelationshipTier,
  type RelationshipTier,
} from "./relationship";

export type CompatibilityResult = {
  mbtiScore: number;
  sajuScore: number;
  sajuHap: number;
  sajuChung: number;
  sajuSangsaeng: number;
  sajuSanggeuk: number;
  combinedScore: number;
  tier: RelationshipTier;
};

export function computeCompatibility(
  a:
    | RoomParticipant
    | {
        mbti: string;
        birth_year: number;
        birth_month: number;
        birth_day: number;
        birth_hour: number;
      },
  b:
    | RoomParticipant
    | {
        mbti: string;
        birth_year: number;
        birth_month: number;
        birth_day: number;
        birth_hour: number;
      },
): CompatibilityResult {
  const mbtiScore = mbtiCompatibility(a.mbti, b.mbti);
  const sajuA = getSaju(a.birth_year, a.birth_month, a.birth_day, a.birth_hour);
  const sajuB = getSaju(b.birth_year, b.birth_month, b.birth_day, b.birth_hour);
  const saju = sajuCompatibility(sajuA, sajuB);
  const combined = combinedScore(mbtiScore, saju.score);
  return {
    mbtiScore,
    sajuScore: saju.score,
    sajuHap: saju.hap,
    sajuChung: saju.chung,
    sajuSangsaeng: saju.sangsaeng,
    sajuSanggeuk: saju.sanggeuk,
    combinedScore: combined,
    tier: getRelationshipTier(combined),
  };
}
