require("dotenv").config();

const app = require("./app");
const prisma = require("./config/prisma");
const PORT = Number(process.env.PORT || 3000);

async function start() {
  try {
    await prisma.$connect();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`GastroMatch API rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Erro ao iniciar servidor:", error);
    process.exit(1);
  }
}

start();