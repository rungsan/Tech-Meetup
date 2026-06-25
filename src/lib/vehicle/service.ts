import { db } from "../db";
import { importRowSchema } from "./schema";

// US-031 — brand/model master service (golden CRUD pattern; no PII so logs/spans omitted for brevity).

export async function listVehicles(q?: string) {
  const brands = await db.vehicleBrand.findMany({
    where: q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { models: { some: { name: { contains: q, mode: "insensitive" } } } }] } : undefined,
    orderBy: { name: "asc" },
    include: { models: { orderBy: { name: "asc" } } },
  });
  return brands;
}

export async function createBrand(data: { name: string; status?: string }) {
  return db.vehicleBrand.create({ data: { name: data.name, status: data.status ?? "active" } });
}
export async function updateBrand(id: string, data: { name?: string; status?: string }) {
  const existing = await db.vehicleBrand.findUnique({ where: { id } });
  if (!existing) return null;
  return db.vehicleBrand.update({ where: { id }, data });
}
export async function deleteBrand(id: string) {
  const existing = await db.vehicleBrand.findUnique({ where: { id } });
  if (!existing) return null;
  // remove child models first (no FK orphan)
  await db.$transaction([
    db.vehicleModel.deleteMany({ where: { brandId: id } }),
    db.vehicleBrand.delete({ where: { id } }),
  ]);
  return existing;
}

export async function createModel(data: { brandId: string; name: string; vehicleType: string; status?: string }) {
  return db.vehicleModel.create({
    data: { brandId: data.brandId, name: data.name, vehicleType: data.vehicleType, status: data.status ?? "active" },
  });
}
export async function updateModel(id: string, data: { name?: string; vehicleType?: string; status?: string }) {
  const existing = await db.vehicleModel.findUnique({ where: { id } });
  if (!existing) return null;
  return db.vehicleModel.update({ where: { id }, data });
}
export async function deleteModel(id: string) {
  const existing = await db.vehicleModel.findUnique({ where: { id } });
  if (!existing) return null;
  return db.vehicleModel.delete({ where: { id } });
}

/** Export all brand/model rows as CSV (US-031 — Download Master). */
export async function exportCsv(): Promise<string> {
  const brands = await db.vehicleBrand.findMany({ orderBy: { name: "asc" }, include: { models: true } });
  const lines = ["brand,model,vehicleType,status"];
  for (const b of brands) {
    if (b.models.length === 0) lines.push(`${b.name},,,${b.status}`);
    for (const m of b.models) lines.push(`${b.name},${m.name},${m.vehicleType},${m.status}`);
  }
  return lines.join("\n");
}

/** Import brand/model rows from CSV (US-031 — นำเข้า Master). Validates each row. */
export async function importCsv(csv: string): Promise<{ imported: number; errors: string[] }> {
  const rows = csv.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const header = rows.shift();
  if (!header || !/brand.*model.*vehicletype/i.test(header)) {
    return { imported: 0, errors: ["Header ต้องเป็น: brand,model,vehicleType"] };
  }
  const errors: string[] = [];
  let imported = 0;
  for (let i = 0; i < rows.length; i++) {
    const [brand, model, vehicleType] = rows[i].split(",").map((c) => c?.trim());
    const parsed = importRowSchema.safeParse({ brand, model, vehicleType });
    if (!parsed.success) {
      errors.push(`แถว ${i + 2}: ข้อมูลไม่ถูกต้อง`);
      continue;
    }
    const b = await db.vehicleBrand.upsert({
      where: { name: brand }, update: {}, create: { name: brand },
    });
    await db.vehicleModel.upsert({
      where: { brandId_name: { brandId: b.id, name: model } },
      update: { vehicleType },
      create: { brandId: b.id, name: model, vehicleType },
    });
    imported++;
  }
  return { imported, errors };
}
