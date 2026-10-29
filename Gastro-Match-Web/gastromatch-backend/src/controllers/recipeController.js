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

    const seenTitles = new Set();
    const uniqueRecipes = recipes.filter((r) => {
      const key = (r.title || "").trim().toLowerCase();
      if (!key) return true;
      if (seenTitles.has(key)) return false;
      seenTitles.add(key);
      return true;
    });

    res.json(uniqueRecipes);
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
    const {
      title, description, instructions, imageUrl, videoUrl, price,
      prepTime, servings, difficulty = "EASY", categoryId, chefId,
      hasKit = false, kitPrice, kitStock = 10, kitDescription, ingredientsList
    } = req.body;

    if (!title || !description || !instructions || price === undefined || !prepTime || !servings) {
      return res.status(400).json({ message: "Título, descrição, instruções, preço, tempo e porções são obrigatórios." });
    }

    let resolvedChefId = chefId ? Number(chefId) : null;
    if (!resolvedChefId) {
      const chef = await prisma.chef.findUnique({ where: { userId: req.user.id } });
      if (chef) resolvedChefId = chef.id;
    }

    const recipe = await prisma.recipe.create({
      data: {
        title,
        description,
        instructions,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        price: Number(price),
        hasKit: Boolean(hasKit),
        kitPrice: hasKit && kitPrice ? Number(kitPrice) : null,
        kitStock: hasKit && kitStock !== undefined ? Number(kitStock) : 10,
        kitDescription: hasKit ? kitDescription : null,
        prepTime: Number(prepTime),
        servings: Number(servings),
        difficulty,
        categoryId: categoryId ? Number(categoryId) : null,
        chefId: resolvedChefId,
        authorId: req.user.id
      }
    });

    if (Array.isArray(ingredientsList) && ingredientsList.length > 0) {
      for (const item of ingredientsList) {
        if (!item.name || !item.name.trim()) continue;
        const ingName = item.name.trim();
        const ing = await prisma.ingredient.upsert({
          where: { name: ingName },
          update: {},
          create: { name: ingName }
        });
        await prisma.recipeIngredient.upsert({
          where: {
            recipeId_ingredientId: {
              recipeId: recipe.id,
              ingredientId: ing.id
            }
          },
          update: { quantity: item.quantity || "a gosto" },
          create: {
            recipeId: recipe.id,
            ingredientId: ing.id,
            quantity: item.quantity || "a gosto"
          }
        });
      }
    }

    const fullRecipe = await prisma.recipe.findUnique({
      where: { id: recipe.id },
      include: {
        category: true,
        chef: true,
        ingredients: { include: { ingredient: true } }
      }
    });

    res.status(201).json(fullRecipe);
  } catch (error) {
    console.error("Erro ao criar receita:", error);
    res.status(500).json({ message: "Erro ao criar receita." });
  }
}

async function mine(req, res) {
  try {
    const chef = await prisma.chef.findUnique({ where: { userId: req.user.id } });
    const recipes = await prisma.recipe.findMany({
      where: {
        OR: [
          { authorId: req.user.id },
          ...(chef ? [{ chefId: chef.id }] : [])
        ]
      },
      include: {
        category: true,
        chef: true,
        ingredients: { include: { ingredient: true } },
        _count: { select: { reviews: true, favorites: true, orderItems: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao listar receitas do chef." });
  }
}

async function update(req, res) {
  try {
    const id = Number(req.params.id);
    const recipe = await prisma.recipe.findUnique({ where: { id } });
    if (!recipe) return res.status(404).json({ message: "Receita não encontrada." });
    if (recipe.authorId !== req.user.id && req.user.role !== "ADMIN")
      return res.status(403).json({ message: "Você não pode editar esta receita." });

    const allowed = [
      "title", "description", "instructions", "imageUrl", "videoUrl", "price",
      "hasKit", "kitPrice", "kitStock", "kitDescription",
      "prepTime", "servings", "difficulty", "categoryId", "chefId", "isPublished"
    ];
    const data = {};
    for (const key of allowed) if (req.body[key] !== undefined) data[key] = req.body[key];

    if (data.price !== undefined) data.price = Number(data.price);
    if (data.kitPrice !== undefined) data.kitPrice = data.kitPrice ? Number(data.kitPrice) : null;
    if (data.kitStock !== undefined) data.kitStock = Number(data.kitStock);
    if (data.hasKit !== undefined) data.hasKit = Boolean(data.hasKit);
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

    await prisma.recipeIngredient.deleteMany({ where: { recipeId: id } });
    await prisma.review.deleteMany({ where: { recipeId: id } });
    await prisma.favorite.deleteMany({ where: { recipeId: id } });
    await prisma.recipe.delete({ where: { id } });
    res.json({ message: "Receita excluída com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao excluir receita." });
  }
}

module.exports = { list, getById, create, mine, update, remove };