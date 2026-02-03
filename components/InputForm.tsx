"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { inputSchema, type InputForm } from "@/lib/schema";
import { MBTI_TYPES } from "@/lib/constants";

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

type Props = {
  onSubmit: (data: InputForm) => void;
};

export default function InputForm({ onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InputForm>({
    resolver: zodResolver(inputSchema),
    defaultValues: {
      personA: {
        name: "",
        mbti: "INTJ",
        birthYear: 1995,
        birthMonth: 1,
        birthDay: 1,
        birthHour: 12,
      },
      personB: {
        name: "",
        mbti: "ENFP",
        birthYear: 1995,
        birthMonth: 6,
        birthDay: 15,
        birthHour: 14,
      },
    },
  });

  const personAMonth = watch("personA.birthMonth");
  const personBMonth = watch("personB.birthMonth");
  const maxDayA = personAMonth ? (DAYS_IN_MONTH[personAMonth - 1] ?? 31) : 31;
  const maxDayB = personBMonth ? (DAYS_IN_MONTH[personBMonth - 1] ?? 31) : 31;

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto flex max-w-2xl flex-col gap-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid gap-8 sm:grid-cols-2">
        <PersonFields
          prefix="personA"
          label="첫 번째 사람"
          register={register}
          errors={errors}
          maxDay={maxDayA}
        />
        <PersonFields
          prefix="personB"
          label="두 번째 사람"
          register={register}
          errors={errors}
          maxDay={maxDayB}
        />
      </div>
      <motion.button
        type="submit"
        className="rounded-xl bg-violet-600 px-6 py-4 text-lg font-semibold text-white shadow-md transition-[box-shadow,background-color] hover:bg-violet-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        궁합 보기
      </motion.button>
    </motion.form>
  );
}

type PersonFieldsProps = {
  prefix: "personA" | "personB";
  label: string;
  register: ReturnType<typeof useForm<InputForm>>["register"];
  errors: ReturnType<typeof useForm<InputForm>>["formState"]["errors"];
  maxDay: number;
};

function PersonFields({
  prefix,
  label,
  register,
  errors,
  maxDay,
}: PersonFieldsProps) {
  const p = prefix as "personA" | "personB";
  const err = errors[p];

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-700 dark:bg-slate-900/50">
      <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-200">
        {label}
      </h3>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
            이름 (선택, 표시용)
          </label>
          <input
            {...register(`${prefix}.name`)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 transition-[border-color,box-shadow] hover:border-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500"
            placeholder="이름"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            MBTI
          </label>
          <select
            {...register(`${prefix}.mbti`)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-10 text-slate-800 transition-[border-color,box-shadow] hover:border-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500"
            aria-label="MBTI 선택"
          >
            {MBTI_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
              년
            </label>
            <input
              type="number"
              {...register(`${prefix}.birthYear`, { valueAsNumber: true })}
              min={1900}
              max={2100}
              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            />
            {err?.birthYear && (
              <p className="mt-0.5 text-xs text-red-500">
                {err.birthYear.message}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
              월
            </label>
            <input
              type="number"
              {...register(`${prefix}.birthMonth`, { valueAsNumber: true })}
              min={1}
              max={12}
              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
              일
            </label>
            <input
              type="number"
              {...register(`${prefix}.birthDay`, { valueAsNumber: true })}
              min={1}
              max={maxDay}
              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            />
            {err?.birthDay && (
              <p className="mt-0.5 text-xs text-red-500">
                {err.birthDay.message}
              </p>
            )}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
            태어난 시 (0~23)
          </label>
          <input
            type="number"
            {...register(`${prefix}.birthHour`, { valueAsNumber: true })}
            min={0}
            max={23}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 transition-[border-color,box-shadow] hover:border-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500"
          />
          {err?.birthHour && (
            <p className="mt-0.5 text-xs text-red-500">
              {err.birthHour.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
