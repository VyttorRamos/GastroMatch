const prisma = require("../config/prisma");

// Helper to generate a realistic EMV BR Code string for PIX Copy & Paste
function generatePixCode(orderId, total) {
  const amountStr = Number(total).toFixed(2);
  const randomKey = `00020126580014BR.GOV.BCB.PIX0136gastromatch-pix-${orderId}-${Date.now()}520400005303986540${amountStr.length}${amountStr}5802BR5910GASTROMATCH6012FLORIANOPOLIS62070503***6304`;
  return randomKey;
}

// Helper to generate a QR Code image URL via Google API or SVG data
function generateQrCodeUrl(pixCode) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixCode)}`;
}

async function create(req, res) {
  try {
    const { items, paymentMethod = "PIX", cardDetails = {} } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "O pedido precisa ter itens." });
    }

    // Determine user (authenticated or fallback demo user)
    let userId = req.user?.id;
    if (!userId) {
      const demoUser = await prisma.user.findFirst();
      userId = demoUser?.id || 1;
    }

    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const unitPrice = Number(item.price || item.recipe?.price || 29.9);
      const quantity = Math.max(1, Number(item.quantity || 1));
      total += unitPrice * quantity;
      
      let recipeId = Number(item.recipeId || item.recipe?.id);
      if (isNaN(recipeId) || recipeId <= 0) {
        const firstDbRecipe = await prisma.recipe.findFirst();
        recipeId = firstDbRecipe ? firstDbRecipe.id : 1;
      } else {
        const exists = await prisma.recipe.findUnique({ where: { id: recipeId } });
        if (!exists) {
          const firstDbRecipe = await prisma.recipe.findFirst();
          recipeId = firstDbRecipe ? firstDbRecipe.id : recipeId;
        }
      }

      orderItems.push({
        recipeId,
        quantity,
        unitPrice
      });
    }

    const isCreditCard = paymentMethod === "CREDIT_CARD";
    const initialStatus = isCreditCard ? "PAID" : "PENDING";

    const order = await prisma.order.create({
      data: {
        userId,
        total,
        status: initialStatus,
        items: { create: orderItems }
      },
      include: {
        items: { include: { recipe: true } }
      }
    });

    // Generate Payment Credentials
    let paymentPayload = {};

    if (paymentMethod === "PIX") {
      const pixCode = generatePixCode(order.id, total);
      paymentPayload = {
        method: "PIX",
        copyPasteCode: pixCode,
        qrCodeUrl: generateQrCodeUrl(pixCode),
        expiresInMinutes: 15
      };
    } else {
      const last4 = cardDetails.number ? cardDetails.number.slice(-4) : "4242";
      paymentPayload = {
        method: "CREDIT_CARD",
        brand: cardDetails.brand || "VISA",
        last4,
        authCode: `AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
        status: "APPROVED"
      };
    }

    res.status(201).json({
      order,
      payment: paymentPayload
    });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    res.status(500).json({ message: "Erro ao processar pedido no banco de dados." });
  }
}

async function confirmPayment(req, res) {
  try {
    const orderId = Number(req.params.id);
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return res.status(404).json({ message: "Pedido não encontrado." });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
      include: { items: { include: { recipe: true } } }
    });

    res.json({
      message: "Pagamento confirmado com sucesso no banco de dados!",
      order: updatedOrder
    });
  } catch (error) {
    console.error("Erro ao confirmar pagamento:", error);
    res.status(500).json({ message: "Erro ao confirmar pagamento." });
  }
}

async function getById(req, res) {
  try {
    const orderId = Number(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { recipe: true } } }
    });

    if (!order) {
      return res.status(404).json({ message: "Pedido não encontrado." });
    }

    res.json(order);
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    res.status(500).json({ message: "Erro ao buscar pedido." });
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

module.exports = { create, confirmPayment, getById, mine };