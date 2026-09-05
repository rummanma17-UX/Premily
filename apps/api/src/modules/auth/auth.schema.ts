import { z } from "zod";
export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  phone: z.string().regex(/^01[3-9]\d{8}$/, "Invalid Bangladeshi phone number"),
  password: z.string().min(8),
  role: z.enum(["CUSTOMER", "SELLER"]),
});

export type registerInput = z.infer<typeof registerSchema>;
