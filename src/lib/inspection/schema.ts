import { z } from "zod";

// US-004 create-inspection contract (D-003 validation rules).
export const createInspectionSchema = z
  .object({
    customerType: z.enum(["individual", "corporate"]),
    customer: z.object({
      name: z.string().trim().min(1).optional(),
      corporateName: z.string().trim().min(1).optional(),
      mobile: z.string().trim().regex(/^[0-9]{9,10}$/, "เบอร์มือถือไม่ถูกต้อง"),
    }),
    vehicle: z.object({
      // ทะเบียนห้ามมีขีดหรือเว้นวรรค (US-004 AC)
      licensePlate: z
        .string()
        .trim()
        .min(1, "กรุณาระบุทะเบียน")
        .regex(/^[^\s-]+$/, "ทะเบียนห้ามมีขีดหรือเว้นวรรค"),
      province: z.string().trim().min(1, "กรุณาระบุจังหวัด"),
      isRedPlate: z.boolean().default(false),
      brandId: z.string().min(1, "กรุณาเลือกยี่ห้อ"),
      modelId: z.string().min(1, "กรุณาเลือกรุ่น"),
      chassisNo: z.string().trim().optional(),
      vehicleType: z.enum(["non_ev", "ev"]),
    }),
    sourceId: z.string().min(1, "กรุณาเลือก Source"),
    businessDivId: z.string().min(1, "กรุณาเลือกฝ่ายธุรกิจ"),
    coverageStartDate: z.string().min(1, "กรุณาระบุวันเริ่มคุ้มครอง"),
    appointmentStatus: z.enum(["not_appointed", "appointed"]),
    notSurveyReason: z.string().trim().optional(),
    notifyEmails: z.string().trim().optional(), // ";"-separated
  })
  .refine((d) => (d.customerType === "individual" ? !!d.customer.name : !!d.customer.corporateName), {
    message: "กรุณาระบุชื่อลูกค้า/ชื่อนิติบุคคล",
    path: ["customer", "name"],
  });

export type CreateInspectionInput = z.infer<typeof createInspectionSchema>;

// US-030-style edit (skeleton subset): editable job + customer/vehicle basics.
export const updateInspectionSchema = z
  .object({
    appointmentStatus: z.enum(["not_appointed", "appointed"]).optional(),
    notSurveyReason: z.string().trim().optional(),
    customer: z
      .object({
        name: z.string().trim().min(1).optional(),
        mobile: z.string().trim().regex(/^[0-9]{9,10}$/, "เบอร์มือถือไม่ถูกต้อง").optional(),
      })
      .optional(),
    vehicle: z
      .object({
        licensePlate: z.string().trim().regex(/^[^\s-]+$/, "ทะเบียนห้ามมีขีดหรือเว้นวรรค").optional(),
        province: z.string().trim().min(1).optional(),
      })
      .optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: "ไม่มีข้อมูลที่จะแก้ไข" });

export type UpdateInspectionInput = z.infer<typeof updateInspectionSchema>;

// List/search/filter + pagination (US-017 pattern).
export const listInspectionQuerySchema = z.object({
  q: z.string().trim().optional(), // matches jobNo / license plate / customer name
  status: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().refine((n) => [10, 20, 50, 100].includes(n), "limit ต้องเป็น 10/20/50/100").default(20),
});

export type ListInspectionQuery = z.infer<typeof listInspectionQuerySchema>;
