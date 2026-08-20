const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const { createToken } = require("../utils/jwt");

const publicUser = user => ({
  id: user.id, name: user.name, email: user.email,
  role: user.role, avatarUrl: user.avatarUrl, createdAt: user.createdAt
});

async function register(req, res) {
  try {
    const { name, email, password, role = "USER" } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Nome, email e senha são obrigatórios." });
    if (password.length < 6)
      return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres." });
    if (!["USER", "CHEF"].includes(role))
      return res.status(400).json({ message: "Tipo de usuário inválido." });

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) return res.status(409).json({ message: "Email já cadastrado." });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name: name.trim(), email: normalizedEmail, passwordHash, role, profile: { create: {} } }
    });

    res.status(201).json({
      message: "Usuário criado com sucesso.",
      token: createToken(user),
      user: publicUser(user)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar usuário." });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email e senha são obrigatórios." });

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ message: "Email ou senha inválidos." });

    res.json({
      message: "Login realizado com sucesso.",
      token: createToken(user),
      user: publicUser(user)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao realizar login." });
  }
}

async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true, chef: true }
    });
    if (!user) return res.status(404).json({ message: "Usuário não encontrado." });
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar usuário." });
  }
}

module.exports = { register, login, me };