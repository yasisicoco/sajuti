/**
 * 기준 사람의 올해(현재 연도) 월별 운세
 * 사주 일주 오행 vs 해당 월의 기둥 오행 비교
 */

import type { SajuResult } from "./saju";
import { getSaju } from "./saju";
import { OHENG_NAMES } from "./constants";

/** 오행 상생: (a+1)%5 === b 이면 a가 b를 생 */
function isSangsaeng(a: number, b: number): boolean {
  return (a + 1) % 5 === b;
}
/** 오행 상극: (a+2)%5 === b */
function isSanggeuk(a: number, b: number): boolean {
  return (a + 2) % 5 === b;
}

/** 월별 주요 문구 타이틀 (예: ~로 애정운이 급상승!) */
const MONTH_TITLES: Record<number, string> = {
  1: "새해 기운으로 결심한 일이 술술 풀리는 달!",
  2: "인연 기운이 살아나 애정운·인복운이 급상승!",
  3: "꾸준함이 빛을 발해 성과운이 피어나는 달",
  4: "도전의 기운으로 새로운 기회가 찾아오는 달!",
  5: "한 번 숨 고르며 컨디션을 챙기면 후반이 밝아져요",
  6: "주변 도움이 커서 협력·인맥운이 빛나는 달",
  7: "감정이 올라올 수 있어 말 한 번 더 생각하는 달",
  8: "목표를 다시 세우면 추진력이 붙는 달!",
  9: "과정을 즐기면 결과도 따라오는 수확의 달",
  10: "정리와 마무리로 한 해를 마무리하기 좋은 달",
  11: "차분히 내일을 준비하면 다음 해가 더 밝아져요",
  12: "감사한 마음으로 한 해를 돌아보는 감성 충전의 달",
};

const MONTH_FLAVOR: Record<number, string> = {
  1: "새해의 에너지를 받아 결심한 일을 시작하기 좋은 때입니다.",
  2: "인연과 소통이 활발해질 수 있어 관계에 마음을 쓰면 좋습니다.",
  3: "꾸준히 쌓아온 일이 결실을 보기 시작할 수 있는 달입니다.",
  4: "새로운 기회가 찾아올 수 있으니 두려워하지 말고 도전해 보세요.",
  5: "중간 점검의 달. 무리하지 말고 컨디션을 챙기는 것이 좋습니다.",
  6: "주변의 도움이 있어 함께 일할 때 시너지가 나는 때입니다.",
  7: "감정이 올라올 수 있으니 말과 행동 전에 한 번 숨 고르세요.",
  8: "목표를 다시 확인하고 우선순위를 정리하기 좋은 달입니다.",
  9: "결과보다 과정을 즐기는 마음이 있으면 한결 수월해집니다.",
  10: "마무리와 정리가 필요한 일을 처리하기에 알맞은 때입니다.",
  11: "차분히 내일을 준비하는 달. 무리한 결정은 미루는 편이 좋습니다.",
  12: "한 해를 돌아보고 감사한 마음을 나누면 다음 해 에너지가 밝아집니다.",
};

export type MonthlyFortuneResult = { title: string; text: string };

/**
 * 해당 연도·월의 운세 (타이틀 + 본문). 사주 일주 오행 vs 그달 월주 오행 비교.
 */
export function getMonthlyFortune(
  personSaju: SajuResult,
  year: number,
  month: number,
): MonthlyFortuneResult {
  const monthSaju = getSaju(year, month, 15, 12);
  const personOheng = personSaju.day.ohengGan;
  const monthOhengGan = monthSaju.month.ohengGan;
  const monthOhengJi = monthSaju.month.ohengJi;

  let relation: string;
  if (personOheng === monthOhengGan || personOheng === monthOhengJi) {
    relation =
      `이번 달 월기(月氣)와 일주 오행(${OHENG_NAMES[personOheng]})이 잘 맞아 ` +
      "순탄하게 흘러갈 가능성이 높습니다. ";
  } else if (
    isSangsaeng(personOheng, monthOhengGan) ||
    isSangsaeng(personOheng, monthOhengJi)
  ) {
    relation =
      `일주 오행 ${OHENG_NAMES[personOheng]}과 이번 달 기운이 상생(相生)하여 ` +
      "도움이 되는 일이나 인연이 찾아올 수 있습니다. ";
  } else if (
    isSangsaeng(monthOhengGan, personOheng) ||
    isSangsaeng(monthOhengJi, personOheng)
  ) {
    relation =
      "이번 달 기운이 당신을 돋우는 상생 관계라, 하던 일을 이어가기 좋은 때입니다. ";
  } else if (
    isSanggeuk(personOheng, monthOhengGan) ||
    isSanggeuk(personOheng, monthOhengJi)
  ) {
    relation =
      `일주와 이번 달이 상극(相克)에 가까워 ` +
      "무리하지 말고 컨디션과 감정에 여유를 두는 것이 좋습니다. ";
  } else if (
    isSanggeuk(monthOhengGan, personOheng) ||
    isSanggeuk(monthOhengJi, personOheng)
  ) {
    relation =
      "이번 달 기운이 다소 맞서는 구간이라, 중요한 결정은 서두르지 말고 숙고하세요. ";
  } else {
    relation =
      "이번 달과 일주의 기운이 특별히 맞거나 맞서지 않아, 평소처럼 일상을 꾸려가시면 됩니다. ";
  }

  const flavor = MONTH_FLAVOR[month] ?? "차분히 하루하루를 보내시면 됩니다.";
  const title = MONTH_TITLES[month] ?? "차분히 하루하루를 보내시면 좋은 달";
  return { title, text: relation + flavor };
}

/** 현재 연도, 현재 월 (클라이언트에서 사용) */
export function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

/** 올해 현재 월 ~ 12월까지 월 번호 배열 */
export function getRemainingMonthsOfYear(): number[] {
  const { month } = getCurrentYearMonth();
  const out: number[] = [];
  for (let m = month; m <= 12; m++) out.push(m);
  return out;
}
