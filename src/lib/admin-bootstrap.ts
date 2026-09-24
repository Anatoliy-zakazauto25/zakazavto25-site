import { z } from "zod";

const adminBootstrapSchema = z.object({ email: z.string().trim().email().transform((value) => value.toLowerCase()), password: z.string().min(12).regex(/[A-Za-z]/, "Пароль должен содержать букву").regex(/[0-9]/, "Пароль должен содержать цифру") });

export function validateAdminBootstrap(input: unknown) {
  return adminBootstrapSchema.safeParse(input);
}
