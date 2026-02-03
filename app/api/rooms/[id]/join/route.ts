import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { joinRoomSchema } from "@/lib/schema";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: roomId } = await params;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
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

  const parsed = joinRoomSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = createClient(url, key);

  const { data: room } = await supabase
    .from("rooms")
    .select("id")
    .eq("id", roomId)
    .single();

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const { person } = parsed.data;

  const { data: participant, error } = await supabase
    .from("room_participants")
    .insert({
      room_id: roomId,
      is_creator: false,
      name: person.name || null,
      mbti: person.mbti,
      birth_year: person.birthYear,
      birth_month: person.birthMonth,
      birth_day: person.birthDay,
      birth_hour: person.birthHour,
    })
    .select("id")
    .single();

  if (error || !participant) {
    return NextResponse.json(
      { error: "Failed to join", message: error?.message },
      { status: 500 },
    );
  }

  const roomPath = `/room/${roomId}?me=${participant.id}`;

  return NextResponse.json({
    participantId: participant.id,
    roomPath,
  });
}
