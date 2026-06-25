// Seed minimal master data + an ABC admin user for the US-004 skeleton flow.
import { PrismaClient } from "./generated/client/index.js";

const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: "ABC_Admin" },
    update: {},
    create: { name: "ABC_Admin", system: "abc" },
  });

  await prisma.user.upsert({
    where: { email: "admin@abc.co.th" },
    update: {},
    create: {
      system: "abc",
      authProvider: "stub",
      email: "admin@abc.co.th",
      displayName: "ABC Admin (seed)",
      roleId: adminRole.id,
    },
  });

  const source = await prisma.source.upsert({
    where: { name: "สาขา A" },
    update: {},
    create: { name: "สาขา A" },
  });

  const division = await prisma.businessDivision.upsert({
    where: { name: "ฝ่ายรับประกันภัยรถยนต์" },
    update: {},
    create: { name: "ฝ่ายรับประกันภัยรถยนต์" },
  });

  const brand = await prisma.vehicleBrand.upsert({
    where: { name: "Toyota" },
    update: {},
    create: { name: "Toyota" },
  });

  await prisma.vehicleModel.upsert({
    where: { brandId_name: { brandId: brand.id, name: "Camry" } },
    update: {},
    create: { brandId: brand.id, name: "Camry", vehicleType: "non_ev" },
  });

  console.log("Seed complete:", {
    source: source.name,
    division: division.name,
    brand: brand.name,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
