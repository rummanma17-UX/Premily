import { prisma } from "../src/lib/prisma.js";
import { BANGLADESH_DISTRICTS } from "../src/modules/shipping/shipping.service.js";

/** Safe reference-data seed only. It never creates demo marketplace records or deletes data. */
async function main() {
  for (const districtName of BANGLADESH_DISTRICTS) {
    await prisma.districtShipping.upsert({
      where: { districtName },
      update: {},
      create: {
        districtName,
        division: "Bangladesh",
        zone: districtName === "Dhaka" ? "INSIDE_DHAKA" : "OUTSIDE_DHAKA",
        baseCost: districtName === "Dhaka" ? 70 : 150,
        estimatedDaysMin: districtName === "Dhaka" ? 1 : 3,
        estimatedDaysMax: districtName === "Dhaka" ? 2 : 5,
      },
    });
  }
  console.log(`Ensured ${BANGLADESH_DISTRICTS.length} district reference records. No demo data was created or deleted.`);
}
main().catch((error) => {
  console.error("Reference-data seeding failed:", error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
