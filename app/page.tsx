"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PersonForm from "@/components/PersonForm";
import type { PersonInput } from "@/lib/schema";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateRoom = useCallback(
    async (person: PersonInput) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ person }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || "방 만들기 실패");
        }
        const { roomId, participantId, shareUrl } = data;
        router.push(`/room/${roomId}?me=${participantId}`);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50/60 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-8 sm:py-12">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 sm:text-3xl">
            MBTI × 사주 궁합
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            모임을 만들고 친구를 불러서 궁합을 한눈에 보세요.
          </p>
        </header>

        <section className="flex flex-1 flex-col items-center">
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-violet-100/80 px-4 py-2 text-sm text-violet-900 dark:bg-violet-900/40 dark:text-violet-100">
            <span aria-hidden>✨</span>
            <span>새 모임 만들기</span>
          </div>
          <PersonForm
            onSubmit={handleCreateRoom}
            submitLabel={loading ? "만드는 중…" : "모임 만들기"}
            title="내 정보를 입력해 주세요"
          />
          {error && (
            <motion.p
              className="mt-4 text-sm text-red-600 dark:text-red-400"
              role="alert"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}
        </section>

        <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          엔터테인먼트 목적이며 참고용으로만 이용해 주세요.
        </p>
      </div>
    </main>
  );
}
