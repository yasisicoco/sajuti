"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import PersonForm from "@/components/PersonForm";
import type { PersonInput } from "@/lib/schema";

export default function JoinRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (person: PersonInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${roomId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ person }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "참여하기 실패");
      }
      const { roomUrl } = data;
      router.push(roomUrl);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50/60 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-8">
        <Link
          href={`/room/${roomId}`}
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          aria-label="방으로 돌아가기"
        >
          ← 방으로
        </Link>
        <div className="flex flex-1 flex-col items-center">
          <h1 className="mb-2 text-xl font-bold text-slate-900 dark:text-slate-100">
            나도 참여하기
          </h1>
          <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
            내 정보를 입력하면 이 방의 궁합에 참여할 수 있어요.
          </p>
          <PersonForm
            onSubmit={handleJoin}
            submitLabel={loading ? "참여 중…" : "참여하기"}
            title="내 정보"
          />
          {error && (
            <p
              className="mt-4 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
