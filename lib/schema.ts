import { z } from "zod";

const mbtiEnum = z.enum([
  "INTJ",
  "INTP",
  "ENTJ",
  "ENTP",
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP",
]);

export const personSchema = z.object({
  name: z.string().min(0).max(20).optional(),
  mbti: mbtiEnum,
  birthYear: z.number().min(1900).max(2100),
  birthMonth: z.number().min(1).max(12),
  birthDay: z.number().min(1).max(31),
  birthHour: z.number().min(0).max(23),
});

export const inputSchema = z.object({
  personA: personSchema,
  personB: personSchema,
});

export const createRoomSchema = z.object({
  name: z.string().max(30).optional(),
  person: personSchema,
});

export const joinRoomSchema = z.object({
  person: personSchema,
});

export type PersonInput = z.infer<typeof personSchema>;
export type InputForm = z.infer<typeof inputSchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
