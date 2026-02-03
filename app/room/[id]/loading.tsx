"use client";

import { motion } from "framer-motion";

export default function RoomLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          className="h-10 w-10 rounded-full border-2 border-violet-500 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          aria-hidden
        />
        <motion.p
          className="text-slate-500 dark:text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          방 정보를 불러오는 중…
        </motion.p>
      </div>
    </main>
  );
}
