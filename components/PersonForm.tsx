"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { personSchema, type PersonInput } from "@/lib/schema";
import { MBTI_TYPES } from "@/lib/constants";

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

type Props = {
  onSubmit: (data: PersonInput) => void;
  submitLabel?: string;
  title?: string;
};

export default function PersonForm({
  onSubmit,
  submitLabel = "다음",
  title = "내 정보",
}: Props) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PersonInput>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      name: "",
      mbti: "INTJ",
      birthYear: 1995,
      birthMonth: 1,
      birthDay: 1,
      birthHour: 12,
    },
  });

  const month = watch("birthMonth");
  const maxDay = month ? (DAYS_IN_MONTH[month - 1] ?? 31) : 31;

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full max-w-sm flex-col gap-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-100">
        {title}
      </h2>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-600 dark:text-stone-400">
            이름 (선택)
          </label>
          <input
            {...register("name")}
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200"
            placeholder="닉네임"
            autoComplete="name"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-600 dark:text-stone-400">
            MBTI
          </label>
          <select
            {...register("mbti")}
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200"
            aria-label="MBTI 선택"
          >
            {MBTI_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-600 dark:text-stone-400">
            생년월일·시 (양력)
          </label>
          <div className="grid grid-cols-4 gap-2">
            <input
              type="number"
              {...register("birthYear", { valueAsNumber: true })}
              min={1900}
              max={2100}
              placeholder="년"
              className="rounded-xl border border-stone-300 bg-white px-3 py-3 text-center text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200"
              aria-label="출생 연도"
            />
            <input
              type="number"
              {...register("birthMonth", { valueAsNumber: true })}
              min={1}
              max={12}
              placeholder="월"
              className="rounded-xl border border-stone-300 bg-white px-3 py-3 text-center text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200"
              aria-label="출생 월"
            />
            <input
              type="number"
              {...register("birthDay", { valueAsNumber: true })}
              min={1}
              max={maxDay}
              placeholder="일"
              className="rounded-xl border border-stone-300 bg-white px-3 py-3 text-center text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200"
              aria-label="출생 일"
            />
            <input
              type="number"
              {...register("birthHour", { valueAsNumber: true })}
              min={0}
              max={23}
              placeholder="시"
              className="rounded-xl border border-stone-300 bg-white px-3 py-3 text-center text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200"
              aria-label="출생 시"
            />
          </div>
          {(errors.birthYear ||
            errors.birthMonth ||
            errors.birthDay ||
            errors.birthHour) && (
            <p className="mt-1 text-xs text-red-500">
              {errors.birthYear?.message ||
                errors.birthMonth?.message ||
                errors.birthDay?.message ||
                errors.birthHour?.message}
            </p>
          )}
        </div>
      </div>
      <motion.button
        type="submit"
        className="min-h-[48px] w-full rounded-xl bg-amber-500 px-4 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-stone-900"
        whileTap={{ scale: 0.98 }}
        aria-label={submitLabel}
      >
        {submitLabel}
      </motion.button>
    </motion.form>
  );
}
