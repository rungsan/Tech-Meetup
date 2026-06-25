import { db } from "../db";
import type { SurveyCreate } from "./schema";

// US-028 — survey company master service (golden CRUD pattern, soft delete).

export async function listSurveyCompanies(q?: string) {
  return db.surveyCompany.findMany({
    where: {
      deletedAt: null,
      ...(q
        ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { code: { contains: q, mode: "insensitive" } }] }
        : {}),
    },
    orderBy: { name: "asc" },
  });
}

export async function createSurveyCompany(data: SurveyCreate) {
  return db.surveyCompany.create({
    data: { ...data, email: data.email || null },
  });
}

export async function updateSurveyCompany(id: string, data: Partial<SurveyCreate>) {
  const existing = await db.surveyCompany.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return null;
  return db.surveyCompany.update({
    where: { id },
    data: { ...data, ...(data.email !== undefined ? { email: data.email || null } : {}) },
  });
}

export async function softDeleteSurveyCompany(id: string) {
  const existing = await db.surveyCompany.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return null;
  return db.surveyCompany.update({ where: { id }, data: { deletedAt: new Date() } });
}
