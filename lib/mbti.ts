import type { MBTIType } from "./constants";

/**
 * 4자리 일치도 기반 MBTI 궁합 점수 (각 축 일치 +25점)
 * 보완 관계(반대 축)는 추가 가산 없이 기본 점수만 사용
 */
export function mbtiCompatibility(a: string, b: string): number {
  if (a.length !== 4 || b.length !== 4) return 50;
  let score = 0;
  for (let i = 0; i < 4; i++) {
    if (a[i] === b[i]) score += 25;
  }
  return Math.min(score, 100);
}

/**
 * MBTI 궁합 설명 텍스트 생성
 */
export function getMbtiDescription(
  score: number,
  mbtiA: string,
  mbtiB: string,
): string {
  if (score >= 90)
    return "네 가지 성향이 잘 맞아 소통과 가치관이 매우 잘 맞는 조합이에요.";
  if (score >= 75) return "세 가지 이상이 맞아 서로 이해하기 쉬운 편이에요.";
  if (score >= 50)
    return "일부는 비슷하고 일부는 다릅니다. 차이를 존중하면 좋은 관계가 될 수 있어요.";
  if (score >= 25) return "성향이 많이 다를 수 있어요. 대화와 타협이 중요해요.";
  return "완전히 다른 유형이라 처음엔 어색할 수 있지만, 보완 관계로 발전할 여지가 있어요.";
}

/**
 * MBTI 궁합 짧은 한 줄 (결과 카드용)
 */
export function getMbtiShortLabel(score: number): string {
  if (score >= 90) return "최고의 궁합";
  if (score >= 75) return "좋은 궁합";
  if (score >= 50) return "무난한 궁합";
  if (score >= 25) return "보완이 필요한 궁합";
  return "차이를 이해하는 궁합";
}

export type { MBTIType };
