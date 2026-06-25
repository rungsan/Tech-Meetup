import { test, expect, request as pwRequest } from "@playwright/test";

// US-028 — survey company master: create → search → update → toggle → delete.
test("US-028: survey company lifecycle", async ({ baseURL }) => {
  const ctx = await pwRequest.newContext({ baseURL });
  await ctx.post("/api/auth/stub-login");

  const code = `SV${Date.now()}`;
  const create = await ctx.post("/api/v1/admin/survey-companies", {
    data: { name: "บริษัทตรวจสภาพ ทดสอบ", code, contactName: "คุณเอ", phone: "021234567" },
  });
  expect(create.status()).toBe(201);
  const sv = await create.json();

  // invalid email → 422
  const bad = await ctx.post("/api/v1/admin/survey-companies", {
    data: { name: "X", code: `${code}b`, email: "not-an-email" },
  });
  expect(bad.status()).toBe(422);

  // duplicate code → 409
  const dup = await ctx.post("/api/v1/admin/survey-companies", { data: { name: "Y", code } });
  expect(dup.status()).toBe(409);

  // search finds it
  const list = await (await ctx.get(`/api/v1/admin/survey-companies?q=${code}`)).json();
  expect(list.data.some((r: { id: string }) => r.id === sv.id)).toBe(true);

  // update + toggle
  const upd = await ctx.patch(`/api/v1/admin/survey-companies/${sv.id}`, { data: { status: "inactive" } });
  expect(upd.status()).toBe(200);

  // soft delete → gone from list
  const del = await ctx.delete(`/api/v1/admin/survey-companies/${sv.id}`);
  expect(del.status()).toBe(200);
  const after = await (await ctx.get(`/api/v1/admin/survey-companies?q=${code}`)).json();
  expect(after.data.some((r: { id: string }) => r.id === sv.id)).toBe(false);

  await ctx.dispose();
});
