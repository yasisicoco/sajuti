/** MBTI 16가지 */
export const MBTI_TYPES = [
  "INTJ",
  "INTP",
  "ENTJ",
  "ENTP",
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP",
] as const;

export type MBTIType = (typeof MBTI_TYPES)[number];

/** 천간 10개 (인덱스 0~9) */
export const CHEONGAN = [
  "갑",
  "을",
  "병",
  "정",
  "무",
  "기",
  "경",
  "신",
  "임",
  "계",
] as const;

/** 지지 12개 (인덱스 0~11) */
export const JIJI = [
  "자",
  "축",
  "인",
  "묘",
  "진",
  "사",
  "오",
  "미",
  "신",
  "유",
  "술",
  "해",
] as const;

/** 천간 오행: 0목 1화 2토 3금 4수 */
export const CHEONGAN_OHENG = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4] as const;

/** 지지 오행 */
export const JIJI_OHENG = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4] as const;

/** 천간 오행 이름 */
export const OHENG_NAMES = ["목", "화", "토", "금", "수"] as const;
