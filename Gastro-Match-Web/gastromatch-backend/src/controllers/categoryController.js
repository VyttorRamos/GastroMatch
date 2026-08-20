const prisma = require("../config/prisma");

async function list(req, res) {
  try {
    res.json(await prisma.category.findMany({ orderBy: { name: "asc" } }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao listar categorias." });
  }
}

async function create(req, res) {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Nome é obrigatório." });
    res.status(201).json(await prisma.category.create({ data: { name, description } }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar categoria." });
  }
}

module.exports = { list, create };