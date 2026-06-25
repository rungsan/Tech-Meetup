import { test, expect, request as pwRequest } from "@playwright/test";

// Proves the full resource-lifecycle pattern (G2/H8): create → read → update → search → delete.
test("inspection lifecycle: create → update → search → soft-delete", async ({ baseURL }) => {
  const ctx = await pwRequest.newContext({ baseURL });
  await ctx.post("/api/auth/stub-login");

  const masters = await (await ctx.get("/api/v1/masters")).json();
  const payload = {
    customerType: "individual",
    customer: { name: "วิภาดา ทดสอบ", mobile: "0890000001" },
    vehicle: {
      licensePlate: "ทส9999",
      province: "10",
      isRedPlate: false,
      brandId: masters.brands[0].id,
      modelId: masters.models[0].id,
      vehicleType: "non_ev",
    },
    sourceId: masters.sources[0].id,
    businessDivId: masters.divisions[0].id,
    coverageStartDate: "2026-08-01",
    appointmentStatus: "not_appointed",
  };

  // create
  const created = await ctx.post("/api/v1/inspections", { data: payload });
  expect(created.status()).toBe(201);
  const { id, jobNo } = await created.json();

  // update (PATCH) + audit
  const patched = await ctx.patch(`/api/v1/inspections/${id}`, {
    data: { appointmentStatus: "appointed" },
  });
  expect(patched.status()).toBe(200);

  // search finds it by jobNo
  const search = await (await ctx.get(`/api/v1/inspections?q=${jobNo}`)).json();
  expect(search.data.some((j: { id: string }) => j.id === id)).toBe(true);

  // soft delete
  const del = await ctx.delete(`/api/v1/inspections/${id}`);
  expect(del.status()).toBe(200);

  // gone from read + search
  expect((await ctx.get(`/api/v1/inspections/${id}`)).status()).toBe(404);
  const after = await (await ctx.get(`/api/v1/inspections?q=${jobNo}`)).json();
  expect(after.data.some((j: { id: string }) => j.id === id)).toBe(false);

  await ctx.dispose();
});
