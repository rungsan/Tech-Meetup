import { z } from "zod";

// US-028 — survey company master management.
export const surveyCreateSchema = z.object({
  name: z.string().trim().min(1, "กรุณาระบุชื่อบริษัท"),
  code: z.string().trim().min(1, "กรุณาระบุรหัสบริษัท"),
  contactName: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().email("อีเมลไม่ถูกต้อง").optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const surveyUpdateSchema = surveyCreateSchema
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: "ไม่มีข้อมูลที่จะแก้ไข" });

export const surveyListQuerySchema = z.object({
  q: z.string().trim().optional(),
});

export type SurveyCreate = z.infer<typeof surveyCreateSchema>;
