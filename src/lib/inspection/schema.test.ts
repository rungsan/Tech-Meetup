import { describe, it, expect } from "vitest";
import { createInspectionSchema } from "./schema";

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
