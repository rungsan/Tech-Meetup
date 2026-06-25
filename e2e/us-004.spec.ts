import { test, expect } from "@playwright/test";

// US-004 walking-skeleton E2E: login (stub) → create inspection → read back.
test("US-004: create a single inspection end-to-end", async ({ page, context }) => {
  // protected route redirects to /login when unauthenticated
  await page.goto("/inspections/new");
  await expect(page).toHaveURL(/\/login/);

  // stub login
  await page.getByRole("button", { name: /เข้าสู่ระบบ/ }).click();
  await expect(page).toHaveURL(/\/inspections\/new/);

  // fill the form
  await page.getByLabel("ชื่อ-นามสกุล / ชื่อนิติบุคคล").fill("สมชาย ใจดี");
  await page.getByLabel("มือถือ").fill("0812345678");
  await page.getByLabel("ทะเบียน").fill("กข1234");
  await page.getByLabel("จังหวัด").fill("10");
  await page.getByLabel("ยี่ห้อ").selectOption({ label: "Toyota" });
  await page.getByLabel("รุ่น").selectOption({ label: "Camry" });
  await page.getByLabel("Source").selectOption({ label: "สาขา A" });
  await page.getByLabel("ฝ่ายธุรกิจ").selectOption({ label: "ฝ่ายรับประกันภัยรถยนต์" });
  await page.getByLabel("วันเริ่มคุ้มครอง").fill("2026-07-01");

  await page.getByRole("button", { name: "บันทึก" }).click();

  // redirected to detail; job number + history visible (read-back)
  await expect(page).toHaveURL(/\/inspections\/[a-z0-9]+$/);
  await expect(page.getByText(/CIS-\d{4}-\d{6}/)).toBeVisible();
  await expect(page.getByText("Job History")).toBeVisible();
  await expect(page.getByText("created")).toBeVisible();
});

test("US-004: license plate with dash is rejected (422 validation)", async ({ request }) => {
  await request.post("/api/auth/stub-login");
  // (request context shares cookies after the POST)
  const res = await request.post("/api/v1/inspections", {
    data: {
      customerType: "individual",
      customer: { name: "ก", mobile: "0812345678" },
      vehicle: {
        licensePlate: "กข-1234",
        province: "10",
        isRedPlate: false,
        brandId: "x",
        modelId: "y",
        vehicleType: "non_ev",
      },
      sourceId: "x",
      businessDivId: "y",
      coverageStartDate: "2026-07-01",
      appointmentStatus: "not_appointed",
    },
  });
  expect(res.status()).toBe(422);
  const body = await res.json();
  expect(body.error.code).toBe("VALIDATION_ERROR");
});
