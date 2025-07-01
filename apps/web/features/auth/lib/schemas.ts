import { z } from "zod";

export const SignUpFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type SignUpFormData = z.infer<typeof SignUpFormSchema>;

export const LogInFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LogInFormData = z.infer<typeof LogInFormSchema>;
