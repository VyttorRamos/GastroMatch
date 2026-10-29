const { PrismaClient } = require("@prisma/client");

let activeClient = new PrismaClient();

function setPrismaUrl(url) {
  activeClient = new PrismaClient({
    datasources: { db: { url } }
  });
  return activeClient;
}

const prismaProxy = new Proxy(
  {},
  {
    get(_target, prop) {
      if (prop === "__setUrl") return setPrismaUrl;
      const val = activeClient[prop];
      return typeof val === "function" ? val.bind(activeClient) : val;
    }
  }
);

module.exports = prismaProxy;
