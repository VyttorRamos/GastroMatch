require("dotenv").config();

const app = require("./app");
const prisma = require("./config/prisma");
const PORT = Number(process.env.PORT || 3000);

async function connectWithFallback() {
  const candidates = [
    { label: "Supabase Pooler (6543)", url: process.env.DATABASE_URL },
    { label: "Supabase Direct (5432)", url: process.env.DIRECT_URL },
    {
      label: "PostgreSQL Local (localhost:5432)",
      url: process.env.LOCAL_DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/gastromatch?schema=public"
    }
  ].filter((c) => Boolean(c.url));

  for (const candidate of candidates) {
    try {
      prisma.__setUrl(candidate.url);
      await prisma.$connect();
      console.log(`✔ Banco conectado com sucesso via: ${candidate.label}`);
      return;
    } catch (err) {
      console.warn(`⚠ Não foi possível conectar em ${candidate.label} (${err.errorCode || err.message.split("\n")[0]}). Tentando próximo...`);
      await prisma.$disconnect().catch(() => {});
    }
  }

  throw new Error("Nenhum banco de dados disponível.");
}

async function start() {
  try {
    await connectWithFallback();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`GastroMatch API rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Erro ao iniciar servidor:", error);
    process.exit(1);
  }
}

start();
