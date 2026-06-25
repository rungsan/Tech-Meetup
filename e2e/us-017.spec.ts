import { test, expect, request as pwRequest } from "@playwright/test";

// US-017 (all list + search) + US-008 (assign to me) + US-007 (my work scope).
test("US-017/008/007: list, search, assign-to-me, my-work scope", async ({ baseURL }) => {
  const ctx = await pwRequest.newContext({ baseURL });
  await ctx.post("/api/auth/stub-login");

  const masters = await (await ctx.get("/api/v1/masters")).json();
  const created = await ctx.post("/api/v1/inspections", {
    data: {
      customerType: "individual",
      customer: { name: "ลิสต์ ทดสอบ", mobile: "0890000002" },
      vehicle: {
        licensePlate: "ลต1234",
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
  const { id, jobNo } = await created.json();

  // all list + search by jobNo
  const all = await (await ctx.get(`/api/v1/inspections?scope=all&q=${jobNo}`)).json();
  expect(all.data.some((j: { id: string }) => j.id === id)).toBe(true);

  // filter by status
  const byStatus = await (await ctx.get(`/api/v1/inspections?status=new`)).json();
  expect(byStatus.data.every((j: { status: string }) => j.status === "new")).toBe(true);

  // assign to me
  const assign = await ctx.post(`/api/v1/inspections/${id}/assign`);
  expect(assign.status()).toBe(200);

  // my-work scope now includes it
  const mine = await (await ctx.get(`/api/v1/inspections?scope=mine&q=${jobNo}`)).json();
  expect(mine.data.some((j: { id: string }) => j.id === id)).toBe(true);

  await ctx.dispose();
});

test("US-017: list page renders for an authenticated user", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /เข้าสู่ระบบ/ }).click();
  await page.waitForURL(/\/inspections\/new/);
  await page.goto("/inspections");
  await expect(page.getByText("งานทั้งหมดของทุกเจ้าหน้าที่")).toBeVisible();
});
