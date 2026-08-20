const prisma = require("../config/prisma");

async function create(req, res) {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ message: "O pedido precisa ter itens." });

    const ids = items.map(item => Number(item.recipeId));
    const recipes = await prisma.recipe.findMany({
      where: { id: { in: ids }, isPublished: true }
    });

    let total = 0;
    const orderItems = items.map(item => {
      const recipe = recipes.find(r => r.id === Number(item.recipeId));
      if (!recipe) throw new Error("Receita inválida.");
      const quantity = Math.max(1, Number(item.quantity || 1));
      total += Number(recipe.price) * quantity;
      return { recipeId: recipe.id, quantity, unitPrice: recipe.price };
    });

    const order = await prisma.order.create({
      data: { userId: req.user.id, total, items: { create: orderItems } },
      include: { items: { include: { recipe: true } } }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar pedido." });
  }
}

async function mine(req, res) {
  try {
    res.json(await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { recipe: true } } },
      orderBy: { createdAt: "desc" }
    }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao listar pedidos." });
  }
}

module.exports = { create, mine };