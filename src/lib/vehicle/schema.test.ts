import { describe, it, expect } from "vitest";
import { brandCreateSchema, modelCreateSchema, importRowSchema } from "./schema";

describe("vehicle master schemas (US-031)", () => {
  it("brand requires a name and defaults status active", () => {
    const r = brandCreateSchema.safeParse({ name: "Honda" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.status).toBe("active");
  });
  it("brand rejects empty name", () => {
    expect(brandCreateSchema.safeParse({ name: "" }).success).toBe(false);
  });
  it("model requires brandId, name, vehicleType", () => {
    expect(modelCreateSchema.safeParse({ brandId: "b", name: "Civic", vehicleType: "ev" }).success).toBe(true);
  });
  it("model rejects invalid vehicleType", () => {
    expect(modelCreateSchema.safeParse({ brandId: "b", name: "x", vehicleType: "diesel" }).success).toBe(false);
  });
  it("import row validates vehicleType enum", () => {
    expect(importRowSchema.safeParse({ brand: "A", model: "B", vehicleType: "non_ev" }).success).toBe(true);
    expect(importRowSchema.safeParse({ brand: "A", model: "B", vehicleType: "x" }).success).toBe(false);
  });
});
