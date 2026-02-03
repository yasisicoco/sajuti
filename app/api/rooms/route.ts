import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createRoomSchema } from "@/lib/schema";

export async function POST(request: NextRequest) {
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

  const parsed = createRoomSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = createClient(url, key);
  const { name, person } = parsed.data;

  const { data: room, error: roomErr } = await supabase
    .from("rooms")
    .insert({ name: name || null })
    .select("id")
    .single();

  if (roomErr || !room) {
    return NextResponse.json(
      { error: "Failed to create room", message: roomErr?.message },
      { status: 500 },
    );
  }

  const { data: participant, error: partErr } = await supabase
    .from("room_participants")
    .insert({
      room_id: room.id,
      is_creator: true,
      name: person.name || null,
      mbti: person.mbti,
      birth_year: person.birthYear,
      birth_month: person.birthMonth,
      birth_day: person.birthDay,
      birth_hour: person.birthHour,
    })
    .select("id")
    .single();

  if (partErr || !participant) {
    await supabase.from("rooms").delete().eq("id", room.id);
    return NextResponse.json(
      { error: "Failed to add participant", message: partErr?.message },
      { status: 500 },
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const shareUrl = `${baseUrl}/room/${room.id}`;
  const joinUrl = `${baseUrl}/room/${room.id}/join`;

  return NextResponse.json({
    roomId: room.id,
    participantId: participant.id,
    shareUrl,
    joinUrl,
  });
}
