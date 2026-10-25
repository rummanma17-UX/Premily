import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^01[3-9]\d{8}$/, "Invalid Bangladeshi phone number (e.g. 01712345678)"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["CUSTOMER", "SELLER"]).default("CUSTOMER"),
});

export const loginSchema = z.object({
  // Can be email or Bangladeshi phone number
  identifier: z.string().min(1, "Phone number or email is required"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
