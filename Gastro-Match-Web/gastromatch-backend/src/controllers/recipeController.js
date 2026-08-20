const prisma = require("../config/prisma");

async function list(req, res) {
  try {
    const { search, categoryId, difficulty } = req.query;
    const where = {
      isPublished: true,
      ...(categoryId ? { categoryId: Number(categoryId) } : {}),
      ...(difficulty ? { difficulty } : {}),
      ...(search ? {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } }
        ]
      } : {})
    };

    const recipes = await prisma.recipe.findMany({
      where,
      include: {
        category: true,
        chef: { select: { id: true, displayName: true, restaurant: true } },
        ingredients: { include: { ingredient: true } },
        _count: { select: { reviews: true, favorites: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao listar receitas." });
  }
}

async function getById(req, res) {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        category: true,
        chef: true,
        ingredients: { include: { ingredient: true } },
        reviews: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
          orderBy: { createdAt: "desc" }
        }
      }
    });
    if (!recipe) return res.status(404).json({ message: "Receita não encontrada." });
    res.json(recipe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar receita." });
  }
}

async function create(req, res) {
  try {
    const { title, description, instructions, imageUrl, videoUrl, price,
      prepTime, servings, difficulty = "EASY", categoryId, chefId } = req.body;

    if (!title || !description || !instructions || price === undefined || !prepTime || !servings)
      return res.status(400).json({ message: "Título, descrição, instruções, preço, tempo e porções são obrigatórios." });

    const recipe = await prisma.recipe.create({
      data: {
        title, description, instructions, imageUrl, videoUrl,
        price: Number(price), prepTime: Number(prepTime), servings: Number(servings),
        difficulty, categoryId: categoryId ? Number(categoryId) : null,
        chefId: chefId ? Number(chefId) : null, authorId: req.user.id
      }
    });
    res.status(201).json(recipe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar receita." });
  }
}

async function update(req, res) {
  try {
    const id = Number(req.params.id);
    const recipe = await prisma.recipe.findUnique({ where: { id } });
    if (!recipe) return res.status(404).json({ message: "Receita não encontrada." });
    if (recipe.authorId !== req.user.id && req.user.role !== "ADMIN")
      return res.status(403).json({ message: "Você não pode editar esta receita." });

    const allowed = ["title","description","instructions","imageUrl","videoUrl","price",
      "prepTime","servings","difficulty","categoryId","chefId","isPublished"];
    const data = {};
    for (const key of allowed) if (req.body[key] !== undefined) data[key] = req.body[key];

    if (data.price !== undefined) data.price = Number(data.price);
    if (data.prepTime !== undefined) data.prepTime = Number(data.prepTime);
    if (data.servings !== undefined) data.servings = Number(data.servings);
    if (data.categoryId !== undefined) data.categoryId = data.categoryId ? Number(data.categoryId) : null;
    if (data.chefId !== undefined) data.chefId = data.chefId ? Number(data.chefId) : null;

    res.json(await prisma.recipe.update({ where: { id }, data }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao atualizar receita." });
  }
}

async function remove(req, res) {
  try {
    const id = Number(req.params.id);
    const recipe = await prisma.recipe.findUnique({ where: { id } });
    if (!recipe) return res.status(404).json({ message: "Receita não encontrada." });
    if (recipe.authorId !== req.user.id && req.user.role !== "ADMIN")
      return res.status(403).json({ message: "Você não pode excluir esta receita." });

    await prisma.recipe.delete({ where: { id } });
    res.json({ message: "Receita excluída com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao excluir receita." });
  }
}

module.exports = { list, getById, create, update, remove };