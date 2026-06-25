import { describe, it, expect } from "vitest";
import { createInspectionSchema, updateInspectionSchema, listInspectionQuerySchema } from "./schema";

const valid = {
  customerType: "individual" as const,
  customer: { name: "สมชาย ใจดี", mobile: "0812345678" },
  vehicle: {
    licensePlate: "กข1234",
    province: "10",
    isRedPlate: false,
    brandId: "b1",
    modelId: "m1",
    vehicleType: "non_ev" as const,
  },
  sourceId: "s1",
  businessDivId: "d1",
  coverageStartDate: "2026-07-01",
  appointmentStatus: "not_appointed" as const,
};

describe("createInspectionSchema (US-004 validation)", () => {
  it("accepts a valid single-vehicle individual job", () => {
    expect(createInspectionSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a license plate containing a dash or space", () => {
    const r = createInspectionSchema.safeParse({
      ...valid,
      vehicle: { ...valid.vehicle, licensePlate: "กข-1234" },
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.join(".") === "vehicle.licensePlate")).toBe(true);
    }
  });

  it("requires a name for an individual customer", () => {
    const r = createInspectionSchema.safeParse({
      ...valid,
      customer: { mobile: "0812345678" },
    });
    expect(r.success).toBe(false);
  });

  it("rejects an invalid mobile number", () => {
    const r = createInspectionSchema.safeParse({
      ...valid,
      customer: { name: "ก", mobile: "12" },
    });
    expect(r.success).toBe(false);
  });
});

describe("updateInspectionSchema (US-030 edit)", () => {
  it("accepts a partial patch", () => {
    expect(updateInspectionSchema.safeParse({ appointmentStatus: "appointed" }).success).toBe(true);
  });
  it("rejects an empty patch", () => {
    expect(updateInspectionSchema.safeParse({}).success).toBe(false);
  });
  it("rejects a dashed plate in a patch", () => {
    expect(updateInspectionSchema.safeParse({ vehicle: { licensePlate: "ก-1" } }).success).toBe(false);
  });
});

describe("listInspectionQuerySchema (US-017 search/paginate)", () => {
  it("defaults page/limit and coerces strings", () => {
    const r = listInspectionQuerySchema.safeParse({ q: "กข" });
    expect(r.success).toBe(true);
    if (r.success) expect([r.data.page, r.data.limit]).toEqual([1, 20]);
  });
  it("rejects a non-allowed limit", () => {
    expect(listInspectionQuerySchema.safeParse({ limit: "33" }).success).toBe(false);
  });
});
