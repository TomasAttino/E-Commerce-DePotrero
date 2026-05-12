import { PrismaClient } from "../src/generated/prisma";
import { TEAMS } from "../src/data/mock";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting seed...");

  for (const teamData of TEAMS) {
    const team = await prisma.team.upsert({
      where: { slug: teamData.slug },
      update: {},
      create: {
        name: teamData.name,
        slug: teamData.slug,
        banner: teamData.banner,
        products: {
          create: teamData.products.map((product) => ({
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            sizes: JSON.stringify(product.sizes),
            colors: JSON.stringify(product.colors),
          })),
        },
      },
    });
    console.log(`Created/Updated team: ${team.name}`);
  }

  console.log("Seed finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
