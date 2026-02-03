/**
 * 양력 생년월일시 → 사주팔자(년주, 월주, 일주, 시주) 계산
 * 절기/입춘 기준 없이 단순 양력 기준 MVP 룰셋
 */

import {
  CHEONGAN,
  JIJI,
  CHEONGAN_OHENG,
  JIJI_OHENG,
  OHENG_NAMES,
} from "./constants";

export type Pillar = { gan: number; ji: number }; // 0~9, 0~11

/** Julian Day Number (Gregorian) */
function gregorianToJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/** 六十干支 인덱스(0~59) → 천간(0~9), 지지(0~11) */
function sexagenaryToPillar(index: number): Pillar {
  const i = ((index % 60) + 60) % 60;
  return { gan: i % 10, ji: i % 12 };
}

/**
 * 년주: (year - 4) % 60 (양력 기준 단순화)
 */
function getYearPillar(year: number): Pillar {
  const idx = (((year - 4) % 60) + 60) % 60;
  return sexagenaryToPillar(idx);
}

/**
 * 월주: 寅月=1월 기준, 月干 = (年干*2 + 月) % 10, 月支 = (月 + 1) % 12 (寅=2)
 */
function getMonthPillar(year: number, month: number): Pillar {
  const yearP = getYearPillar(year);
  const monthBranch = (month + 1) % 12; // 寅=2 → month 1 → (1+1)%12=2
  const monthStem = (yearP.gan * 2 + month) % 10;
  return { gan: monthStem, ji: monthBranch };
}

/**
 * 일주: JD 기준 六十干支. (JDN + 10) % 60 (일부 만세력 기준)
 */
function getDayPillar(year: number, month: number, day: number): Pillar {
  const jdn = gregorianToJDN(year, month, day);
  const idx = (((jdn + 10) % 60) + 60) % 60;
  return sexagenaryToPillar(idx);
}

/**
 * 시주: 子=23~1, 丑=1~3, ..., 時干 = (日干*2 + 時支) % 10
 */
function getHourPillar(dayGan: number, hour: number): Pillar {
  const hourBranch = hour === 0 ? 0 : Math.floor(((hour + 1) % 24) / 2);
  const hourStem = (dayGan * 2 + hourBranch) % 10;
  return { gan: hourStem, ji: hourBranch };
}

export interface SajuPillar {
  gan: number;
  ji: number;
  ganName: string;
  jiName: string;
  ohengGan: number;
  ohengJi: number;
}

export interface SajuResult {
  year: SajuPillar;
  month: SajuPillar;
  day: SajuPillar;
  hour: SajuPillar;
  raw: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar };
}

export function getSaju(
  year: number,
  month: number,
  day: number,
  hour: number,
): SajuResult {
  const y = getYearPillar(year);
  const m = getMonthPillar(year, month);
  const d = getDayPillar(year, month, day);
  const h = getHourPillar(d.gan, hour);

  const toSaju = (p: Pillar): SajuPillar => ({
    gan: p.gan,
    ji: p.ji,
    ganName: CHEONGAN[p.gan],
    jiName: JIJI[p.ji],
    ohengGan: CHEONGAN_OHENG[p.gan],
    ohengJi: JIJI_OHENG[p.ji],
  });

  return {
    year: toSaju(y),
    month: toSaju(m),
    day: toSaju(d),
    hour: toSaju(h),
    raw: { year: y, month: m, day: d, hour: h },
  };
}

// --- 합충 점수 ---

/** 천간 오합: (0,5)(1,6)(2,7)(3,8)(4,9) */
const CHEONGAN_PAIRS: [number, number][] = [
  [0, 5],
  [1, 6],
  [2, 7],
  [3, 8],
  [4, 9],
];

/** 지지 육합: 子丑 寅亥 卯戌 辰酉 巳申 午未 */
const JIJI_HAP: [number, number][] = [
  [0, 1],
  [2, 11],
  [3, 10],
  [4, 9],
  [5, 8],
  [6, 7],
];

/** 지지 육충: 子午 丑未 寅申 卯酉 辰戌 巳亥 */
const JIJI_CHUNG: [number, number][] = [
  [0, 6],
  [1, 7],
  [2, 8],
  [3, 9],
  [4, 10],
  [5, 11],
];

function pairMatch(a: number, b: number, pairs: [number, number][]): boolean {
  const [x, y] = a < b ? [a, b] : [b, a];
  return pairs.some(([p, q]) => (p === x && q === y) || (p === y && q === x));
}

/** 두 팔자 간 합/충 개수 (년월일시 4기둥 × 천간/지지) */
function countHapChung(
  saju1: SajuResult,
  saju2: SajuResult,
): { hap: number; chung: number } {
  let hap = 0;
  let chung = 0;
  const pillars1 = [
    saju1.raw.year,
    saju1.raw.month,
    saju1.raw.day,
    saju1.raw.hour,
  ];
  const pillars2 = [
    saju2.raw.year,
    saju2.raw.month,
    saju2.raw.day,
    saju2.raw.hour,
  ];

  for (let i = 0; i < 4; i++) {
    const p1 = pillars1[i];
    const p2 = pillars2[i];
    if (pairMatch(p1.gan, p2.gan, CHEONGAN_PAIRS)) hap += 1;
    if (pairMatch(p1.ji, p2.ji, JIJI_HAP)) hap += 1;
    if (pairMatch(p1.ji, p2.ji, JIJI_CHUNG)) chung += 1;
  }

  return { hap, chung };
}

/** 오행 상생: 木→火→土→金→水→木. (a+1)%5 === b 이면 a가 b를 생 */
function isSangsaeng(a: number, b: number): boolean {
  return (a + 1) % 5 === b;
}
/** 오행 상극: 木克土(0克2), 土克水(2克4), 水克火(4克1), 火克金(1克3), 金克木(3克0). (a+2)%5 === b 이면 a가 b를 극 */
function isSanggeuk(a: number, b: number): boolean {
  return (a + 2) % 5 === b;
}

/** 년월일시 기둥의 천간·지지 오행 8쌍 비교 → 상생/상극 개수 */
export function countOhengSangsaengSanggeuk(
  saju1: SajuResult,
  saju2: SajuResult,
): { sangsaeng: number; sanggeuk: number } {
  const ohengs1 = [
    saju1.year.ohengGan,
    saju1.year.ohengJi,
    saju1.month.ohengGan,
    saju1.month.ohengJi,
    saju1.day.ohengGan,
    saju1.day.ohengJi,
    saju1.hour.ohengGan,
    saju1.hour.ohengJi,
  ];
  const ohengs2 = [
    saju2.year.ohengGan,
    saju2.year.ohengJi,
    saju2.month.ohengGan,
    saju2.month.ohengJi,
    saju2.day.ohengGan,
    saju2.day.ohengJi,
    saju2.hour.ohengGan,
    saju2.hour.ohengJi,
  ];
  let sangsaeng = 0;
  let sanggeuk = 0;
  for (let i = 0; i < 8; i++) {
    const a = ohengs1[i];
    const b = ohengs2[i];
    if (isSangsaeng(a, b) || isSangsaeng(b, a)) sangsaeng += 1;
    if (isSanggeuk(a, b) || isSanggeuk(b, a)) sanggeuk += 1;
  }
  return { sangsaeng, sanggeuk };
}

/**
 * 사주 혈합 점수: 합 +10, 충 -10, 상생 +5, 상극 -5, 0~100으로 정규화
 */
export function sajuCompatibility(
  saju1: SajuResult,
  saju2: SajuResult,
): {
  score: number;
  hap: number;
  chung: number;
  sangsaeng: number;
  sanggeuk: number;
} {
  const { hap, chung } = countHapChung(saju1, saju2);
  const { sangsaeng, sanggeuk } = countOhengSangsaengSanggeuk(saju1, saju2);
  const rawScore = 50 + hap * 10 - chung * 10 + sangsaeng * 5 - sanggeuk * 5;
  const score = Math.max(0, Math.min(100, rawScore));
  return { score, hap, chung, sangsaeng, sanggeuk };
}

export function getSajuDescription(
  score: number,
  hap: number,
  chung: number,
  sangsaeng = 0,
  sanggeuk = 0,
): string {
  const parts: string[] = [];
  if (sangsaeng > 0)
    parts.push(`오행 상생 ${sangsaeng}쌍으로 에너지가 잘 이어져요.`);
  if (sanggeuk > 0)
    parts.push(`상극 ${sanggeuk}쌍이 있어 갈등 시 여유를 갖는 게 좋아요.`);
  if (hap > 0) parts.push(`천간·지지 합이 있어 기본 궁합은 무난해요.`);
  if (chung > 0) parts.push(`충이 있어 가끔 마찰이 있을 수 있어요.`);
  if (score >= 80)
    return parts.length
      ? parts.join(" ")
      : "천간·지지와 오행이 잘 맞아 에너지가 잘 통하는 조합이에요.";
  if (score >= 60)
    return parts.length
      ? parts.join(" ")
      : "합이 충보다 많아 기본적으로 궁합이 무난해요.";
  if (score >= 40)
    return parts.length
      ? parts.join(" ")
      : "합과 충이 섞여 있어, 갈등이 생기면 대화로 풀어보세요.";
  if (chung >= 2 || sanggeuk >= 2)
    return parts.length
      ? parts.join(" ")
      : "충·상극이 있어 갈등 시 이해와 대화가 중요해요.";
  return parts.length
    ? parts.join(" ")
    : "사주상 차이가 있어 서로 다른 면을 인정하면 관계에 도움이 돼요.";
}

export function getSajuShortLabel(score: number): string {
  if (score >= 80) return "사주 혈합 좋음";
  if (score >= 60) return "사주 무난";
  if (score >= 40) return "사주 보통";
  return "사주 주의";
}

/** 사주 결과를 캐시 키용 8글자 문자열로 (갑자병인정묘무진) */
export function sajuToPillarKey(saju: SajuResult): string {
  return [
    saju.year.ganName + saju.year.jiName,
    saju.month.ganName + saju.month.jiName,
    saju.day.ganName + saju.day.jiName,
    saju.hour.ganName + saju.hour.jiName,
  ].join("");
}

export { OHENG_NAMES };
