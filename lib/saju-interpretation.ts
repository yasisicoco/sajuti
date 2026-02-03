/**
 * 사주 궁합 깊은 풀이 (천간·지지 합충, 오행 상생상극, 기둥별 해석)
 */

import type { SajuResult } from "./saju";
import { sajuCompatibility } from "./saju";

const PILLAR_LABELS = [
  "년주(뿌리·초년)",
  "월주(환경·청년)",
  "일주(나·배우자·중년)",
  "시주(말년·자녀)",
] as const;

function pairMatch(a: number, b: number, pairs: [number, number][]): boolean {
  const [x, y] = a < b ? [a, b] : [b, a];
  return pairs.some(([p, q]) => (p === x && q === y) || (p === y && q === x));
}

const CHEONGAN_PAIRS: [number, number][] = [
  [0, 5],
  [1, 6],
  [2, 7],
  [3, 8],
  [4, 9],
];
const JIJI_HAP: [number, number][] = [
  [0, 1],
  [2, 11],
  [3, 10],
  [4, 9],
  [5, 8],
  [6, 7],
];
const JIJI_CHUNG: [number, number][] = [
  [0, 6],
  [1, 7],
  [2, 8],
  [3, 9],
  [4, 10],
  [5, 11],
];

/** 어떤 기둥에서 천간 오합인지 */
function getGanHapPillars(saju1: SajuResult, saju2: SajuResult): number[] {
  const pillars = [
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
  const out: number[] = [];
  for (let i = 0; i < 4; i++) {
    if (pairMatch(pillars[i].gan, pillars2[i].gan, CHEONGAN_PAIRS)) out.push(i);
  }
  return out;
}

/** 어떤 기둥에서 지지 육합인지 */
function getJiHapPillars(saju1: SajuResult, saju2: SajuResult): number[] {
  const pillars = [
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
  const out: number[] = [];
  for (let i = 0; i < 4; i++) {
    if (pairMatch(pillars[i].ji, pillars2[i].ji, JIJI_HAP)) out.push(i);
  }
  return out;
}

/** 어떤 기둥에서 지지 육충인지 */
function getJiChungPillars(saju1: SajuResult, saju2: SajuResult): number[] {
  const pillars = [
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
  const out: number[] = [];
  for (let i = 0; i < 4; i++) {
    if (pairMatch(pillars[i].ji, pillars2[i].ji, JIJI_CHUNG)) out.push(i);
  }
  return out;
}

/**
 * 두 사주에 대한 깊은 풀이 문장 반환 (여러 문단)
 */
export function getSajuInterpretationDetailed(
  saju1: SajuResult,
  saju2: SajuResult,
  opts?: {
    score?: number;
    hap?: number;
    chung?: number;
    sangsaeng?: number;
    sanggeuk?: number;
  },
): string {
  const base = sajuCompatibility(saju1, saju2);
  const score = opts?.score ?? base.score;
  const hap = opts?.hap ?? base.hap;
  const chung = opts?.chung ?? base.chung;
  const sangsaeng = opts?.sangsaeng ?? base.sangsaeng;
  const sanggeuk = opts?.sanggeuk ?? base.sanggeuk;
  const ganHapPillars = getGanHapPillars(saju1, saju2);
  const jiHapPillars = getJiHapPillars(saju1, saju2);
  const jiChungPillars = getJiChungPillars(saju1, saju2);

  const paragraphs: string[] = [];

  // 1. 총평
  if (score >= 80) {
    paragraphs.push(
      "두 사주가 전반적으로 잘 맞는 편입니다. 천간·지지의 합(合)과 오행 상생이 많아 에너지가 서로 잘 통하고, 관계가 자연스럽게 이어질 가능성이 높습니다.",
    );
  } else if (score >= 60) {
    paragraphs.push(
      "전반적으로 무난한 궁합입니다. 합과 충·상극이 섞여 있어 서로 다른 부분이 있더라도 이해와 대화로 잘 풀어나갈 수 있는 조합입니다.",
    );
  } else if (score >= 40) {
    paragraphs.push(
      "사주상 차이가 있어 갈등이 생길 수 있는 부분이 있습니다. 충(沖)이나 상극이 있는 기둥에서는 의견이 엇갈리거나 감정이 부딪힐 수 있으니, 그때는 한발 물러서 대화하는 것이 좋습니다.",
    );
  } else {
    paragraphs.push(
      "천간·지지의 충과 오행 상극이 많아 처음엔 어색하거나 마찰이 있을 수 있습니다. 서로의 성향과 타이밍을 인정하고, 무리하지 않는 거리감을 유지하는 것이 관계를 오래 가져가는 데 도움이 됩니다.",
    );
  }

  // 2. 천간 오합 해석
  if (ganHapPillars.length > 0) {
    const pillarNames = ganHapPillars.map((i) => PILLAR_LABELS[i]).join(", ");
    paragraphs.push(
      `천간 오합(天干五合)이 ${pillarNames}에서 맞습니다. ` +
        "갑기·을경·병신·정임·무계는 서로 끌어당기는 관계로, 그 기둥이 담당하는 삶의 영역(뿌리·환경·자신·말년)에서 생각과 기운이 잘 맞고 협력하기 쉽습니다. " +
        "오합이 많은 만큼 처음 보는 느낌이 낯설지 않거나, 중요한 일에서 의견이 잘 맞는 경우가 많습니다.",
    );
  }

  // 3. 지지 육합 해석
  if (jiHapPillars.length > 0) {
    const pillarNames = jiHapPillars.map((i) => PILLAR_LABELS[i]).join(", ");
    paragraphs.push(
      `지지 육합(地支六合)이 ${pillarNames}에서 이뤄집니다. ` +
        "자축·인해·묘술·진유·사신·오미는 땅의 기운이 서로 감싸 안는 관계라, 그 기둥에 해당하는 시기나 영역에서 감정·환경이 잘 어울리고 편안함을 주는 편입니다. " +
        "육합이 있는 관계는 시간이 지날수록 친밀감이 쌓이기 쉽습니다.",
    );
  }

  // 4. 지지 육충 해석
  if (jiChungPillars.length > 0) {
    const pillarNames = jiChungPillars.map((i) => PILLAR_LABELS[i]).join(", ");
    paragraphs.push(
      `지지 육충(地支六沖)이 ${pillarNames}에 있습니다. ` +
        "자오·축미·인신·묘유·진술·사해는 반대 방향의 기운이라, 그 기둥이 담당하는 부분에서 의견 충돌, 스케줄 충돌, 감정의 팽팽함이 생길 수 있습니다. " +
        "충이 있다고 해서 관계가 나쁜 것은 아니며, 서로 다른 성향을 인정하고 말할 때는 말투와 타이밍을 조절하면 갈등을 줄일 수 있습니다.",
    );
  }

  // 5. 오행 상생 해석
  if (sangsaeng > 0) {
    paragraphs.push(
      `오행 상생(相生)이 ${sangsaeng}쌍 있습니다. 목→화→토→금→수→목으로 이어지는 상생은 한쪽이 다른 쪽을 돋우는 관계입니다. ` +
        "상생이 많을수록 함께 있을 때 에너지가 잘 순환하고, 한쪽이 지칠 때 다른 쪽이 보완해 주는 느낌을 받기 쉽습니다. " +
        "다만 한쪽만 주고받지 않도록, 서로 배려하는 말과 행동을 의식하면 관계가 더 오래갑니다.",
    );
  }

  // 6. 오행 상극 해석
  if (sanggeuk > 0) {
    paragraphs.push(
      `오행 상극(相克)이 ${sanggeuk}쌍 있습니다. 목극토·토극수·수극화·화극금·금극목은 서로 누르는 관계라, 그 부분에서 성격·스타일이 달라 마찰이 날 수 있습니다. ` +
        "상극이 있다고 해서 궁합이 나쁜 것은 아니며, 서로의 차이를 '다름'으로 인정하고, 논쟁이 붙었을 때는 감정이 올라가기 전에 잠시 멈추는 습관이 도움이 됩니다.",
    );
  }

  // 7. 일주(나·배우자) 특별 해석
  const dayJiChung = jiChungPillars.includes(2);
  const dayGanHap = ganHapPillars.includes(2);
  const dayJiHap = jiHapPillars.includes(2);
  if (dayJiChung) {
    paragraphs.push(
      "특히 일주(日柱)에서 충이 있으면, '나'와 '상대'의 기본 기운이 반대 방향에 가깝습니다. 처음엔 끌리다가도 가까워질수록 의견이 엇갈리는 구간이 있을 수 있으니, 중요한 결정은 감정이 가라앉은 뒤에 이야기하는 것이 좋습니다.",
    );
  }
  if (dayGanHap || dayJiHap) {
    paragraphs.push(
      "일주에서 천간 오합이나 지지 육합이 있으면, 서로를 '내 사람'처럼 느끼기 쉽고, 함께 있을 때 편안함을 주는 편입니다. 관계를 오래 이어가기에 유리한 조건입니다.",
    );
  }

  // 8. 마무리 조언
  if (score >= 60) {
    paragraphs.push(
      "전체적으로 두 사주는 무리 없이 어울릴 수 있는 편입니다. 작은 충이나 상극이 있어도 대화와 배려로 잘 풀어가시면 됩니다.",
    );
  } else {
    paragraphs.push(
      "충과 상극이 있는 부분은 서로의 성향 차이로 받아들이시고, 말과 행동에 여유를 두면 관계가 더 편해질 수 있습니다. 참고용으로만 활용해 주세요.",
    );
  }

  return paragraphs.join("\n\n");
}
