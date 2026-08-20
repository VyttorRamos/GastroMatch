const prisma = require("../config/prisma");

async function create(req, res) {
  try {
    const { displayName, description, restaurant, cnpj } = req.body;
    if (!displayName) return res.status(400).json({ message: "Nome de exibição é obrigatório." });

    const existing = await prisma.chef.findUnique({ where: { userId: req.user.id } });
    if (existing) return res.status(409).json({ message: "Você já possui um perfil de chef." });

    res.status(201).json(await prisma.chef.create({
      data: { userId: req.user.id, displayName, description, restaurant, cnpj }
    }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar perfil de chef." });
  }
}

async function list(req, res) {
  try {
    res.json(await prisma.chef.findMany({
      where: { status: "APPROVED" },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } }
    }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao listar chefs." });
  }
}

module.exports = { create, list };