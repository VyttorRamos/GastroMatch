const bcrypt = require("bcryptjs");
const prisma = require("../src/config/prisma");

async function main() {
  const passwordHash = await bcrypt.hash("123456", 12);

  await prisma.user.upsert({
    where: { email: "admin@gastromatch.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@gastromatch.com",
      passwordHash,
      role: "ADMIN",
      profile: { create: {} }
    }
  });

  const chefUser = await prisma.user.upsert({
    where: { email: "chef@gastromatch.com" },
    update: {},
    create: {
      name: "Chef GastroMatch",
      email: "chef@gastromatch.com",
      passwordHash,
      role: "CHEF",
      profile: { create: {} }
    }
  });

  await prisma.chef.upsert({
    where: { userId: chefUser.id },
    update: { status: "APPROVED" },
    create: {
      userId: chefUser.id,
      displayName: "Chef GastroMatch",
      description: "Chef de demonstração do projeto.",
      restaurant: "GastroMatch Kitchen",
      status: "APPROVED"
    }
  });

  for (const name of ["Massas", "Brasileira", "Japonesa", "Mexicana"]) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }

  console.log("Banco populado com sucesso!");
  console.log("Admin: admin@gastromatch.com / 123456");
  console.log("Chef: chef@gastromatch.com / 123456");
}

main()
  .catch(error => { console.error(error); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });