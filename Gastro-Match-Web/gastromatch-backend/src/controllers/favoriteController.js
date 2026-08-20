const prisma = require("../config/prisma");

async function toggle(req, res) {
  try {
    const recipeId = Number(req.params.recipeId);
    const favorite = await prisma.favorite.findUnique({
      where: { userId_recipeId: { userId: req.user.id, recipeId } }
    });

    if (favorite) {
      await prisma.favorite.delete({ where: { id: favorite.id } });
      return res.json({ favorite: false });
    }

    await prisma.favorite.create({ data: { userId: req.user.id, recipeId } });
    res.json({ favorite: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao alterar favorito." });
  }
}

async function mine(req, res) {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: { recipe: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(favorites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao listar favoritos." });
  }
}

module.exports = { toggle, mine };