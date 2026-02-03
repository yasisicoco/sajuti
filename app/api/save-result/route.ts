import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const saveResultSchema = z.object({
  personA: z.object({
    name: z.string().max(20).optional(),
    mbti: z.string().length(4),
    birthYear: z.number(),
    birthMonth: z.number(),
    birthDay: z.number(),
    birthHour: z.number(),
  }),
  personB: z.object({
    name: z.string().max(20).optional(),
    mbti: z.string().length(4),
    birthYear: z.number(),
    birthMonth: z.number(),
    birthDay: z.number(),
    birthHour: z.number(),
  }),
  mbtiScore: z.number().min(0).max(100),
  sajuScore: z.number().min(0).max(100),
});

export type SaveResultBody = z.infer<typeof saveResultSchema>;

const saveResultResponseSchema = z.object({
  id: z.string().uuid(),
  shareUrl: z.string().url(),
});

export type SaveResultResponse = z.infer<typeof saveResultResponseSchema>;

export async function POST(request: NextRequest) {
  const env =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = saveResultSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: row, error } = await supabase
    .from("compatibility_results")
    .insert({
      person_a: parsed.data.personA,
      person_b: parsed.data.personB,
      mbti_score: parsed.data.mbtiScore,
      saju_score: parsed.data.sajuScore,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to save", message: error.message },
      { status: 500 },
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const shareUrl = `${baseUrl}/result/${row.id}`;
  const response: SaveResultResponse = { id: row.id, shareUrl };
  return NextResponse.json(response);
}
