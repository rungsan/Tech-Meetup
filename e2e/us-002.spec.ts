import { test, expect, request as pwRequest } from "@playwright/test";

// US-002 — dashboard summary (status counts + yearly volume + recent lists) + page render.
test("US-002: dashboard summary endpoint", async ({ baseURL }) => {
  const ctx = await pwRequest.newContext({ baseURL });
  await ctx.post("/api/auth/stub-login");

  // ensure at least one job exists
  const masters = await (await ctx.get("/api/v1/masters")).json();
  await ctx.post("/api/v1/inspections", {
    data: {
      customerType: "individual",
      customer: { name: "แดชบอร์ด ทดสอบ", mobile: "0890000003" },
      vehicle: {
        licensePlate: "ดบ1234",
        province: "10",
        isRedPlate: false,
        brandId: masters.brands[0].id,
        modelId: masters.models[0].id,
        vehicleType: "non_ev",
      },
      sourceId: masters.sources[0].id,
      businessDivId: masters.divisions[0].id,
      coverageStartDate: "2026-09-01",
      appointmentStatus: "not_appointed",
    },
  });

  const sum = await (await ctx.get("/api/v1/dashboard")).json();
  expect(typeof sum.statusCounts).toBe("object");
  expect(sum.statusCounts.new).toBeGreaterThanOrEqual(1);
  expect(Array.isArray(sum.yearly)).toBe(true);
  expect(Array.isArray(sum.recentAll)).toBe(true);

  await ctx.dispose();
});

test("US-002: dashboard page renders status cards", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /เข้าสู่ระบบ/ }).click();
  await page.waitForURL(/\/inspections\/new/);
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("งานเข้าใหม่")).toBeVisible();
});
