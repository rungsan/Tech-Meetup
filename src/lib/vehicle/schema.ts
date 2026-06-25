import { z } from "zod";

// US-031 — vehicle brand/model master management.
export const brandCreateSchema = z.object({
  name: z.string().trim().min(1, "กรุณาระบุยี่ห้อ"),
  status: z.enum(["active", "inactive"]).default("active"),
});
export const brandUpdateSchema = brandCreateSchema.partial().refine(
  (d) => Object.keys(d).length > 0,
  { message: "ไม่มีข้อมูลที่จะแก้ไข" },
);

export const modelCreateSchema = z.object({
  brandId: z.string().min(1, "กรุณาเลือกยี่ห้อ"),
  name: z.string().trim().min(1, "กรุณาระบุรุ่น"),
  vehicleType: z.enum(["non_ev", "ev"]),
  status: z.enum(["active", "inactive"]).default("active"),
});
export const modelUpdateSchema = modelCreateSchema
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: "ไม่มีข้อมูลที่จะแก้ไข" });

export const vehicleListQuerySchema = z.object({
  q: z.string().trim().optional(),
});

// CSV import row: brand,model,vehicleType  (vehicleType ∈ non_ev|ev)
export const importRowSchema = z.object({
  brand: z.string().trim().min(1),
  model: z.string().trim().min(1),
  vehicleType: z.enum(["non_ev", "ev"]),
});

export type BrandCreate = z.infer<typeof brandCreateSchema>;
export type ModelCreate = z.infer<typeof modelCreateSchema>;
