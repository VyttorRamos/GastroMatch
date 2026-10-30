const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const { isValidEmail, isValidCnpj } = require("../utils/validators");

async function create(req, res) {
  try {
    const { displayName, description, restaurant, cnpj, docType, fileUrl } = req.body;
    if (!displayName) return res.status(400).json({ message: "Nome de exibição é obrigatório." });

    const existing = await prisma.chef.findUnique({ where: { userId: req.user.id } });
    if (existing) return res.status(409).json({ message: "Você já possui um perfil de chef." });

    const chef = await prisma.chef.create({
      data: {
        userId: req.user.id,
        displayName,
        description,
        restaurant,
        cnpj,
        status: "PENDING",
        documents: docType
          ? {
              create: {
                type: docType,
                fileUrl: fileUrl || "documento-anexado.pdf"
              }
            }
          : undefined
      },
      include: { documents: true, user: { select: { id: true, name: true, email: true } } }
    });

    res.status(201).json(chef);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar perfil de chef." });
  }
}

async function apply(req, res) {
  try {
    const {
      name,
      email,
      password,
      restaurant,
      cnpj,
      city,
      description,
      docType = "Alvará Sanitário Vigente (Vigilância Municipal)",
      fileUrl = "alvara-sanitario.pdf"
    } = req.body;

    if (!name || !restaurant || !cnpj) {
      return res.status(400).json({ message: "Nome, restaurante e CNPJ são obrigatórios." });
    }
    if (!isValidCnpj(cnpj)) {
      return res.status(400).json({ message: "O CNPJ informado é inválido. Verifique os 14 dígitos." });
    }
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ message: "O endereço de e-mail informado é inválido." });
    }

    const normalizedEmail = (
      email || `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.${Date.now()}@gastromatch.com`
    )
      .trim()
      .toLowerCase();

    const passwordHash = await bcrypt.hash(password || "123456", 12);

    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { chef: true }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
          role: "CHEF",
          profile: {
            create: {
              city: city || "Florianópolis - SC",
              state: "SC"
            }
          }
        }
      });
    } else if (password) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: name.trim(),
          passwordHash,
          role: "CHEF"
        }
      });
    }

    const chef = await prisma.chef.upsert({
      where: { userId: user.id },
      update: {
        displayName: name.trim(),
        restaurant: restaurant.trim(),
        cnpj: cnpj.trim(),
        description: description || `Localização: ${city || "Brasil"}`,
        status: "PENDING",
        documents: {
          create: {
            type: docType,
            fileUrl
          }
        }
      },
      create: {
        userId: user.id,
        displayName: name.trim(),
        restaurant: restaurant.trim(),
        cnpj: cnpj.trim(),
        description: description || `Localização: ${city || "Brasil"}`,
        status: "PENDING",
        documents: {
          create: {
            type: docType,
            fileUrl
          }
        }
      },
      include: {
        documents: true,
        user: {
          select: { id: true, name: true, email: true, createdAt: true, profile: true }
        }
      }
    });

    res.status(201).json({
      message: "Solicitação de credenciamento enviada para análise do Administrador.",
      chef
    });
  } catch (error) {
    console.error("Erro ao registrar solicitação de chef:", error);
    res.status(500).json({ message: "Erro ao enviar solicitação de credenciamento." });
  }
}

async function list(req, res) {
  try {
    const chefs = await prisma.chef.findMany({
      where: { status: "APPROVED" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            email: true,
            profile: true
          }
        },
        documents: {
          orderBy: { createdAt: "desc" }
        },
        _count: {
          select: { recipes: true }
        },
        recipes: {
          where: { isPublished: true },
          select: {
            id: true,
            title: true,
            reviews: {
              select: { rating: true }
            }
          }
        }
      },
      orderBy: { id: "asc" }
    });

    const enriched = chefs.map((chef) => {
      const allRatings = (chef.recipes || []).flatMap((r) =>
        (r.reviews || []).map((rev) => Number(rev.rating))
      );
      const avgRating =
        allRatings.length > 0
          ? Number(
              (
                allRatings.reduce((acc, cur) => acc + cur, 0) / allRatings.length
              ).toFixed(1)
            )
          : null;

      return {
        ...chef,
        recipesCount: chef._count?.recipes ?? (chef.recipes ? chef.recipes.length : 0),
        rating: avgRating,
        reviewsCount: allRatings.length
      };
    });

    res.json(enriched);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao listar chefs." });
  }
}

async function listAllForAdmin(req, res) {
  try {
    const chefs = await prisma.chef.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
            createdAt: true,
            profile: true
          }
        },
        documents: {
          orderBy: { createdAt: "desc" }
        },
        _count: {
          select: { recipes: true }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    const enriched = chefs.map((c) => {
      const prefs =
        c.user?.profile?.preferences && typeof c.user.profile.preferences === "object"
          ? c.user.profile.preferences
          : {};
      return {
        ...c,
        adminComment: prefs.adminComment || "",
        hasPendencia: Boolean(prefs.hasPendencia)
      };
    });

    res.json(enriched);
  } catch (error) {
    console.error("Erro ao listar solicitações de chefs:", error);
    res.status(500).json({ message: "Erro ao buscar solicitações de chefs." });
  }
}

async function updateStatus(req, res) {
  try {
    const id = Number(req.params.id);
    const { status, adminComment = "" } = req.body;

    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Status inválido. Use PENDING, APPROVED ou REJECTED." });
    }

    const existingChef = await prisma.chef.findUnique({
      where: { id },
      include: { user: { include: { profile: true } } }
    });

    if (existingChef?.userId) {
      const prevPrefs =
        existingChef.user?.profile?.preferences &&
        typeof existingChef.user.profile.preferences === "object"
          ? existingChef.user.profile.preferences
          : {};
      const nextPrefs = {
        ...prevPrefs,
        adminComment: adminComment.trim(),
        hasPendencia: status === "PENDING" && Boolean(adminComment.trim())
      };

      await prisma.profile.upsert({
        where: { userId: existingChef.userId },
        create: {
          userId: existingChef.userId,
          preferences: nextPrefs
        },
        update: {
          preferences: nextPrefs
        }
      });
    }

    const updatedChef = await prisma.chef.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profile: true
          }
        },
        documents: {
          orderBy: { createdAt: "desc" }
        },
        _count: {
          select: { recipes: true }
        }
      }
    });

    const enrichedChef = {
      ...updatedChef,
      adminComment: adminComment.trim(),
      hasPendencia: status === "PENDING" && Boolean(adminComment.trim())
    };

    res.json({
      message:
        status === "APPROVED"
          ? "Chef e documentos aprovados e liberados com sucesso!"
          : status === "REJECTED"
          ? "Solicitação do chef recusada."
          : adminComment.trim()
          ? "Pendência / comentário registrado para o Chef."
          : "Status alterado para pendente.",
      chef: enrichedChef
    });
  } catch (error) {
    console.error("Erro ao atualizar status do chef:", error);
    res.status(500).json({ message: "Erro ao atualizar status do chef." });
  }
}

module.exports = { create, apply, list, listAllForAdmin, updateStatus };
