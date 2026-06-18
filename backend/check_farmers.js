const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const farmers = await prisma.user.findMany({
    where: { role: 'FARMER' }
  });
  console.log(JSON.stringify(farmers, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
