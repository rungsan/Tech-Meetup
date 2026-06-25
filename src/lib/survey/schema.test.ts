import { describe, it, expect } from "vitest";
import { surveyCreateSchema, surveyUpdateSchema } from "./schema";

describe("survey company schemas (US-028)", () => {
  it("requires name and code", () => {
    expect(surveyCreateSchema.safeParse({ name: "SV A", code: "SVA" }).success).toBe(true);
    expect(surveyCreateSchema.safeParse({ name: "", code: "X" }).success).toBe(false);
    expect(surveyCreateSchema.safeParse({ name: "X" }).success).toBe(false);
  });
  it("rejects an invalid email but allows empty", () => {
    expect(surveyCreateSchema.safeParse({ name: "A", code: "A", email: "bad" }).success).toBe(false);
    expect(surveyCreateSchema.safeParse({ name: "A", code: "A", email: "" }).success).toBe(true);
  });
  it("update rejects an empty patch", () => {
    expect(surveyUpdateSchema.safeParse({}).success).toBe(false);
    expect(surveyUpdateSchema.safeParse({ status: "inactive" }).success).toBe(true);
  });
});
