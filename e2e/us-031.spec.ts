import { test, expect, request as pwRequest } from "@playwright/test";

// US-031 — vehicle brand/model master: create → model → search → import → export → delete.
test("US-031: vehicle master lifecycle", async ({ baseURL }) => {
  const ctx = await pwRequest.newContext({ baseURL });
  await ctx.post("/api/auth/stub-login");

  const brandName = `Brand_${Date.now()}`;

  // create brand
  const cb = await ctx.post("/api/v1/admin/vehicle-brands", { data: { name: brandName } });
  expect(cb.status()).toBe(201);
  const brand = await cb.json();

  // create model under brand
  const cm = await ctx.post("/api/v1/admin/vehicle-models", {
    data: { brandId: brand.id, name: "ModelX", vehicleType: "ev" },
  });
  expect(cm.status()).toBe(201);

  // invalid vehicleType → 422
  const bad = await ctx.post("/api/v1/admin/vehicle-models", {
    data: { brandId: brand.id, name: "Y", vehicleType: "diesel" },
  });
  expect(bad.status()).toBe(422);

  // list + search finds the brand
  const list = await (await ctx.get(`/api/v1/admin/vehicle-brands?q=${brandName}`)).json();
  expect(list.data.some((b: { id: string }) => b.id === brand.id)).toBe(true);

  // toggle status
  const patched = await ctx.patch(`/api/v1/admin/vehicle-brands/${brand.id}`, { data: { status: "inactive" } });
  expect(patched.status()).toBe(200);

  // export CSV contains the brand
  const exp = await ctx.get("/api/v1/admin/vehicle-models/export");
  expect(exp.status()).toBe(200);
  expect(await exp.text()).toContain(brandName);

  // import CSV (new brand+model)
  const impBrand = `Imp_${Date.now()}`;
  const imp = await ctx.post("/api/v1/admin/vehicle-models/import", {
    headers: { "Content-Type": "text/csv" },
    data: `brand,model,vehicleType\n${impBrand},Alpha,non_ev`,
  });
  expect(imp.status()).toBe(200);
  expect((await imp.json()).imported).toBe(1);

  // delete brand (cascade models)
  const del = await ctx.delete(`/api/v1/admin/vehicle-brands/${brand.id}`);
  expect(del.status()).toBe(200);

  await ctx.dispose();
});
