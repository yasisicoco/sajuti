/**
 * 궁합 등급 (MBTI+사주 종합 점수 기준)
 * 90+ 완전 찰떡 / 70+ 찰떡 궁합 / 50+ 무난한 사이 / 30+ 가끔 삐걱 / 0+ 폭발 주의
 */

export type RelationshipTier =
  | "완전 찰떡"
  | "찰떡 궁합"
  | "무난한 사이"
  | "가끔 삐걱"
  | "폭발 주의";

const TIERS: { min: number; tier: RelationshipTier; color: string }[] = [
  { min: 90, tier: "완전 찰떡", color: "#2563eb" },
  { min: 70, tier: "찰떡 궁합", color: "#16a34a" },
  { min: 50, tier: "무난한 사이", color: "#ca8a04" },
  { min: 30, tier: "가끔 삐걱", color: "#ea580c" },
  { min: 0, tier: "폭발 주의", color: "#dc2626" },
];

export function getRelationshipTier(combinedScore: number): RelationshipTier {
  for (const { min, tier } of TIERS) {
    if (combinedScore >= min) return tier;
  }
  return "폭발 주의";
}

export function getTierColor(tier: RelationshipTier): string {
  return TIERS.find((t) => t.tier === tier)?.color ?? "#6b7280";
}

export function getTierColorByScore(score: number): string {
  return getTierColor(getRelationshipTier(score));
}

/** MBTI 50% + 사주 50% 종합 점수 (0~100) */
export function combinedScore(mbtiScore: number, sajuScore: number): number {
  return Math.round((mbtiScore + sajuScore) / 2);
}

export { TIERS as RELATIONSHIP_TIERS };
