import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { z } from "zod";

const describeBodySchema = z.object({
  mbtiA: z.string().length(4).optional(),
  mbtiB: z.string().length(4).optional(),
  sajuPillarsA: z.string().min(1).optional(),
  sajuPillarsB: z.string().min(1).optional(),
  sajuScore: z.number().min(0).max(100).optional(),
  hap: z.number().min(0).optional(),
  chung: z.number().min(0).optional(),
  sangsaeng: z.number().min(0).optional(),
  sanggeuk: z.number().min(0).optional(),
});

export type DescribeBody = z.infer<typeof describeBodySchema>;

const MBTI_TYPES = [
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

function buildMbtiCacheKey(a: string, b: string): string {
  const [x, y] = [a.toUpperCase(), b.toUpperCase()].sort();
  return `mbti:${x}-${y}`;
}

function buildSajuCacheKey(a: string, b: string): string {
  const [x, y] = [a, b].sort();
  return `saju:${x}_${y}`;
}

function formatSajuPillarsForPrompt(pillars: string): string {
  if (pillars.length < 8) return pillars;
  return `${pillars.slice(0, 2)}년 ${pillars.slice(2, 4)}월 ${pillars.slice(4, 6)}일 ${pillars.slice(6, 8)}시`;
}

async function getCached(
  supabase: ReturnType<typeof createClient>,
  cacheKey: string,
): Promise<{ paragraphs: string[] } | null> {
  const { data, error } = await supabase
    .from("compatibility_cache")
    .select("content")
    .eq("cache_key", cacheKey)
    .maybeSingle();
  if (error || !data?.content) return null;
  const content = data.content as { paragraphs?: string[] };
  if (Array.isArray(content?.paragraphs))
    return { paragraphs: content.paragraphs };
  return null;
}

async function setCached(
  supabase: ReturnType<typeof createClient>,
  cacheKey: string,
  type: "mbti" | "saju",
  content: { paragraphs: string[] },
): Promise<void> {
  await supabase
    .from("compatibility_cache")
    .upsert(
      { cache_key: cacheKey, type, content },
      { onConflict: "cache_key" },
    );
}

async function generateMbtiDescription(
  openai: OpenAI,
  mbtiA: string,
  mbtiB: string,
): Promise<{ paragraphs: string[] }> {
  const prompt = `당신은 MBTI 궁합을 재미있고 친근한 톤으로 설명하는 전문가입니다.
다음 두 MBTI 유형의 궁합을 분석해 주세요: ${mbtiA}, ${mbtiB}.

요구 사항:
1. 출력은 반드시 아래 JSON 형식 하나만 출력합니다. 다른 설명은 붙이지 마세요.
2. paragraphs 배열에는 다음 순서로 문단을 넣습니다:
   - 첫 번째: 한 줄 요약 (일치 개수 0~4에 따른 둘의 케미, 친근한 말투)
   - 두 번째: 【에너지】 E/I 축 (외향/내향)에 따른 설명
   - 세 번째: 【인식】 S/N 축 (감각/직관)에 따른 설명
   - 네 번째: 【판단】 T/F 축 (사고/감정)에 따른 설명
   - 다섯 번째: 【생활】 J/P 축 (판단/인식)에 따른 설명
3. 각 문단은 1~3문장으로, 한국어로만 작성합니다. 이모지나 마크다운 없이 평문만.
4. 말투는 "~해요", "~에요" 체로 통일합니다.

출력 형식 (JSON만):
{"paragraphs": ["첫 번째 문단 전체", "두 번째 문단 전체", "세 번째 문단 전체", "네 번째 문단 전체", "다섯 번째 문단 전체"]}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-2025-04-14",
    messages: [
      { role: "system", content: prompt },
      {
        role: "user",
        content: `${mbtiA}와 ${mbtiB} 궁합 설명을 생성해 주세요.`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.6,
    max_tokens: 800,
  });

  const raw = response.choices[0].message?.content;
  if (!raw) throw new Error("OpenAI MBTI 응답이 비어 있습니다.");
  const parsed = JSON.parse(raw) as { paragraphs?: string[] };
  if (!Array.isArray(parsed?.paragraphs))
    throw new Error("OpenAI MBTI 형식 오류");
  return { paragraphs: parsed.paragraphs };
}

async function generateSajuDescription(
  openai: OpenAI,
  sajuPillarsA: string,
  sajuPillarsB: string,
  ctx: {
    score: number;
    hap: number;
    chung: number;
    sangsaeng: number;
    sanggeuk: number;
  },
): Promise<{ paragraphs: string[] }> {
  const aStr = formatSajuPillarsForPrompt(sajuPillarsA);
  const bStr = formatSajuPillarsForPrompt(sajuPillarsB);
  const { score, hap, chung, sangsaeng, sanggeuk } = ctx;

  const prompt = `당신은 사주(四柱) 궁합을 쉽고 친근한 톤으로 설명하는 전문가입니다.
두 사람의 사주팔자와 궁합 지표가 아래와 같습니다.

사주 A: ${aStr}
사주 B: ${bStr}

궁합 지표: 총점 ${score}점, 천간·지지 합 ${hap}개, 충 ${chung}개, 오행 상생 ${sangsaeng}쌍, 오행 상극 ${sanggeuk}쌍.

요구 사항:
1. 출력은 반드시 아래 JSON 형식 하나만 출력합니다. 다른 설명은 붙이지 마세요.
2. paragraphs 배열에는 다음 순서로 문단을 넣습니다:
   - 첫 번째: 총평 (점수와 합/충/상생/상극을 반영한 한두 문장 요약)
   - (선택) 천간 오합·지지 육합/육충이 있으면 그 의미를 한 문단으로
   - (선택) 오행 상생·상극이 있으면 그 의미를 한 문단으로
   - (선택) 일주(日柱)가 관계에 미치는 영향이 있으면 한 문단으로
   - 마지막: 관계 유지 조언 한 문단
3. 각 문단은 1~3문장, 한국어만. 이모지·마크다운 없이 평문.
4. 말투는 "~해요", "~에요" 체로 통일합니다. 참고용으로만 활용해 달라고 안내합니다.

출력 형식 (JSON만):
{"paragraphs": ["문단1", "문단2", ...]}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-2025-04-14",
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: "위 사주 궁합 설명을 생성해 주세요." },
    ],
    response_format: { type: "json_object" },
    temperature: 0.6,
    max_tokens: 800,
  });

  const raw = response.choices[0].message?.content;
  if (!raw) throw new Error("OpenAI 사주 응답이 비어 있습니다.");
  const parsed = JSON.parse(raw) as { paragraphs?: string[] };
  if (!Array.isArray(parsed?.paragraphs))
    throw new Error("OpenAI 사주 형식 오류");
  return { paragraphs: parsed.paragraphs };
}

export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Supabase가 설정되지 않았습니다." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "JSON 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const parsed = describeBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "입력 검증 실패", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const {
    mbtiA,
    mbtiB,
    sajuPillarsA,
    sajuPillarsB,
    sajuScore = 50,
    hap = 0,
    chung = 0,
    sangsaeng = 0,
    sanggeuk = 0,
  } = parsed.data;

  const supabase = createClient(supabaseUrl, supabaseKey);
  const result: {
    mbti?: { paragraphs: string[] };
    saju?: { paragraphs: string[] };
  } = {};

  if (
    mbtiA &&
    mbtiB &&
    MBTI_TYPES.includes(mbtiA as (typeof MBTI_TYPES)[number]) &&
    MBTI_TYPES.includes(mbtiB as (typeof MBTI_TYPES)[number])
  ) {
    const mbtiKey = buildMbtiCacheKey(mbtiA, mbtiB);
    let mbtiData = await getCached(supabase, mbtiKey);
    if (!mbtiData && openaiKey) {
      try {
        const openai = new OpenAI({ apiKey: openaiKey });
        mbtiData = await generateMbtiDescription(openai, mbtiA, mbtiB);
        await setCached(supabase, mbtiKey, "mbti", mbtiData);
      } catch (e) {
        console.error("MBTI GPT 생성 실패:", e);
      }
    }
    if (mbtiData) result.mbti = mbtiData;
  }

  if (sajuPillarsA && sajuPillarsB) {
    const sajuKey = buildSajuCacheKey(sajuPillarsA, sajuPillarsB);
    let sajuData = await getCached(supabase, sajuKey);
    if (!sajuData && openaiKey) {
      try {
        const openai = new OpenAI({ apiKey: openaiKey });
        sajuData = await generateSajuDescription(
          openai,
          sajuPillarsA,
          sajuPillarsB,
          {
            score: sajuScore,
            hap,
            chung,
            sangsaeng,
            sanggeuk,
          },
        );
        await setCached(supabase, sajuKey, "saju", sajuData);
      } catch (e) {
        console.error("사주 GPT 생성 실패:", e);
      }
    }
    if (sajuData) result.saju = sajuData;
  }

  return NextResponse.json(result);
}
