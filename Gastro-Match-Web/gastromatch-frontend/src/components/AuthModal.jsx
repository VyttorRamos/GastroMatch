import { useState } from "react";
import Icon from "./Icon";
import { useAuth } from "../services/AuthContext";

export default function AuthModal({ onClose, onLoginSuccess }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  function handleRoleChange(newRole) {
    setRole(newRole);
    setError("");
    if (mode === "login") {
      if (newRole === "ADMIN") {
        setEmail("admin@gastromatch.com");
        setPassword("123456");
      } else if (newRole === "CHEF") {
        setEmail("gabriel@gastromatch.com");
        setPassword("123456");
      } else if (email === "admin@gastromatch.com" || email === "gabriel@gastromatch.com") {
        setEmail("");
        setPassword("");
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSending(true);

    try {
      let loggedUser;
      if (mode === "login") {
        loggedUser = await login(email, password, role);
      } else {
        loggedUser = await register(name, email, password, role);
      }
      if (onLoginSuccess) {
        onLoginSuccess(loggedUser);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function handleQuickAdminAccess() {
    setError("");
    setSending(true);
    try {
      const loggedUser = await login("admin@gastromatch.com", "123456", "ADMIN");
      if (onLoginSuccess) {
        onLoginSuccess(loggedUser);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="auth-overlay" onMouseDown={onClose}>
      <div className="auth-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose} aria-label="Fechar">
          <Icon name="x" size={20} />
        </button>

        <span className="section-kicker">GastroMatch</span>
        <h2>{mode === "login" ? "Entrar na sua conta" : "Criar sua conta"}</h2>
        <p className="auth-subtitle">
          {mode === "login"
            ? "Escolha seu perfil de acesso para entrar na plataforma."
            : "Comece a explorar o GastroMatch."}
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>
            Tipo de acesso
            <select value={role} onChange={(e) => handleRoleChange(e.target.value)}>
              <option value="USER">Cliente / Usuário</option>
              <option value="CHEF">Chef / Restaurante</option>
              <option value="ADMIN">Administrador (Admin - Aprovar Chefs)</option>
            </select>
          </label>

          {mode === "register" && (
            <label>
              Nome
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === "ADMIN" ? "Ex: Administrador GastroMatch" : "Seu nome completo"}
                required
              />
            </label>
          )}

          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === "ADMIN" ? "admin@gastromatch.com" : "seuemail@exemplo.com"}
              required
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
              required
            />
          </label>

          <button className="button button-orange auth-submit" disabled={sending}>
            {sending
              ? "Aguarde..."
              : mode === "login"
              ? role === "ADMIN"
                ? "Entrar como Administrador"
                : role === "CHEF"
                ? "Entrar como Chef"
                : "Entrar"
              : role === "ADMIN"
              ? "Criar conta de Administrador"
              : "Criar conta"}
          </button>
        </form>

        <button
          className="auth-switch"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
        >
          {mode === "login"
            ? "Ainda não tenho uma conta (Criar conta)"
            : "Já tenho uma conta (Fazer login)"}
        </button>
      </div>
    </div>
  );
}
