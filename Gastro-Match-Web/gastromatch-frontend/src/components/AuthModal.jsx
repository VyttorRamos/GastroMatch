import { useState } from "react";
import Icon from "./Icon";
import { useAuth } from "../services/AuthContext";

export default function AuthModal({ onClose }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSending(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password, role);
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
            ? "Acesse suas receitas, favoritos e pedidos."
            : "Comece a explorar o GastroMatch."}
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <label>
              Nome
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
          )}

          <label>
            E-mail
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>

          <label>
            Senha
            <input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>

          {mode === "register" && (
            <label>
              Quero entrar como
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="USER">Usuário</option>
                <option value="CHEF">Chef</option>
              </select>
            </label>
          )}

          <button className="button button-orange auth-submit" disabled={sending}>
            {sending ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button className="auth-switch" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
          {mode === "login" ? "Ainda não tenho uma conta" : "Já tenho uma conta"}
        </button>
      </div>
    </div>
  );
}
