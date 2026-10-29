const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");

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
    res.json(
      await prisma.chef.findMany({
        where: { status: "APPROVED" },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, email: true } },
          documents: true
        }
      })
    );
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

    res.json(chefs);
  } catch (error) {
    console.error("Erro ao listar solicitações de chefs:", error);
    res.status(500).json({ message: "Erro ao buscar solicitações de chefs." });
  }
}

async function updateStatus(req, res) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Status inválido. Use PENDING, APPROVED ou REJECTED." });
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

    res.json({
      message:
        status === "APPROVED"
          ? "Chef e documentos aprovados com sucesso!"
          : status === "REJECTED"
          ? "Solicitação do chef recusada."
          : "Status alterado para pendente.",
      chef: updatedChef
    });
  } catch (error) {
    console.error("Erro ao atualizar status do chef:", error);
    res.status(500).json({ message: "Erro ao atualizar status do chef." });
  }
}

module.exports = { create, apply, list, listAllForAdmin, updateStatus };
