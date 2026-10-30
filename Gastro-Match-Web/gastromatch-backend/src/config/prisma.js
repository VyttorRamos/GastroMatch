const { PrismaClient } = require("@prisma/client");

let activeClient = new PrismaClient();

function setPrismaUrl(url) {
  activeClient = new PrismaClient({
    datasources: { db: { url } }
  });
  return activeClient;
}

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
      setPrismaUrl(candidate.url);
      await activeClient.$connect();
      console.log(`✔ Banco conectado com sucesso via: ${candidate.label}`);
      return activeClient;
    } catch (err) {
      console.warn(
        `⚠ Não foi possível conectar em ${candidate.label} (${
          err.errorCode || (err.message && err.message.split("\n")[0]) || "erro"
        }). Tentando próximo...`
      );
      await activeClient.$disconnect().catch(() => {});
    }
  }

  throw new Error("Nenhum banco de dados disponível.");
}

const prismaProxy = new Proxy(
  {},
  {
    get(_target, prop) {
      if (prop === "__setUrl") return setPrismaUrl;
      if (prop === "__connectWithFallback") return connectWithFallback;
      const val = activeClient[prop];
      return typeof val === "function" ? val.bind(activeClient) : val;
    }
  }
);

module.exports = prismaProxy;
