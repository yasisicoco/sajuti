"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import RoomView from "@/components/RoomView";
import type { RoomResponse } from "@/app/api/rooms/[id]/route";

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const meId = searchParams.get("me");

  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const retryRef = { current: false };

  const fetchRoom = useCallback(
    async (isRetry = false) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/rooms/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("방을 찾을 수 없어요.");
            if (!isRetry && !retryRef.current) {
              retryRef.current = true;
              setTimeout(() => fetchRoom(true), 2500);
            }
          } else setError("불러오기 실패.");
          return;
        }
        const data: RoomResponse = await res.json();
        setRoom(data);
      } catch {
        setError("네트워크 오류.");
        if (!isRetry && !retryRef.current) {
          retryRef.current = true;
          setTimeout(() => fetchRoom(true), 2500);
        }
      } finally {
        setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    fetchRoom(false);
  }, [fetchRoom]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <motion.p
          className="text-slate-500 dark:text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          불러오는 중…
        </motion.p>
      </main>
    );
  }

  if (error || !room) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 bg-slate-50 dark:bg-slate-950">
        <p
          className="text-center text-slate-600 dark:text-slate-400"
          role="alert"
        >
          {error ?? "방 정보를 불러올 수 없어요."}
        </p>
        <p className="text-center text-xs text-slate-500 dark:text-slate-500">
          방이 막 만들어졌다면 잠시 후 다시 시도해 주세요.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => fetchRoom(true)}
            disabled={loading}
            className="rounded-xl border-2 border-violet-500 bg-white px-6 py-3 font-semibold text-violet-600 transition hover:bg-violet-50 disabled:opacity-50 dark:border-violet-400 dark:bg-slate-900 dark:text-violet-400 dark:hover:bg-violet-950/50"
          >
            {loading ? "다시 불러오는 중…" : "다시 시도"}
          </button>
          <Link
            href="/"
            className="rounded-xl bg-violet-500 px-6 py-3 font-semibold text-white transition hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            홈으로
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-lg px-5 pt-6 pb-10 sm:px-4 sm:pb-8">
        <Link
          href="/"
          className="mb-4 inline-flex min-h-[44px] items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 sm:min-h-0"
          aria-label="홈으로 돌아가기"
        >
          ← 홈
        </Link>
        <RoomView room={room} meId={meId} />
      </div>
    </main>
  );
}
