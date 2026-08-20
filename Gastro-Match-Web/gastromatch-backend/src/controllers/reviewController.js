const prisma = require("../config/prisma");

async function list(req, res) {
  try {
    const reviews = await prisma.review.findMany({
      where: { recipeId: Number(req.params.recipeId) },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao listar avaliações." });
  }
}

async function createOrUpdate(req, res) {
  try {
    const recipeId = Number(req.params.recipeId);
    const { rating, comment } = req.body;
    if (!Number.isInteger(Number(rating)) || rating < 1 || rating > 5)
      return res.status(400).json({ message: "A avaliação deve ser de 1 a 5." });

    const review = await prisma.review.upsert({
      where: { userId_recipeId: { userId: req.user.id, recipeId } },
      update: { rating: Number(rating), comment },
      create: { userId: req.user.id, recipeId, rating: Number(rating), comment }
    });
    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao salvar avaliação." });
  }
}

module.exports = { list, createOrUpdate };