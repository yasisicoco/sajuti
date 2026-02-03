import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 bg-gradient-to-b from-violet-50/60 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">
        페이지를 찾을 수 없어요
      </h1>
      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        주소가 잘못되었거나 삭제된 페이지일 수 있어요.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-violet-500 px-6 py-3 font-semibold text-white transition hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
      >
        홈으로
      </Link>
    </main>
  );
}
