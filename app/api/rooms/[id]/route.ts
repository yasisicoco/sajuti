import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export type RoomParticipant = {
  id: string;
  is_creator: boolean;
  name: string | null;
  mbti: string;
  birth_year: number;
  birth_month: number;
  birth_day: number;
  birth_hour: number;
  created_at: string;
};

export type RoomResponse = {
  id: string;
  name: string | null;
  created_at: string;
  participants: RoomParticipant[];
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 },
    );
  }

  const supabase = createClient(url, key);

  const { data: room, error: roomErr } = await supabase
    .from("rooms")
    .select("id, name, created_at")
    .eq("id", id)
    .single();

  if (roomErr || !room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const { data: participants, error: partErr } = await supabase
    .from("room_participants")
    .select(
      "id, is_creator, name, mbti, birth_year, birth_month, birth_day, birth_hour, created_at",
    )
    .eq("room_id", id)
    .order("created_at", { ascending: true });

  if (partErr) {
    return NextResponse.json(
      { error: "Failed to load participants" },
      { status: 500 },
    );
  }

  const response: RoomResponse = {
    id: room.id,
    name: room.name,
    created_at: room.created_at,
    participants: participants || [],
  };

  return NextResponse.json(response);
}
