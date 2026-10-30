import { useState } from "react";
import Icon from "./Icon";
import { useAuth } from "../services/AuthContext";
import { formatCnpj, isValidCnpj, generateValidCnpj, isValidEmail } from "../utils/validators";

export default function AuthModal({ onClose, onLoginSuccess }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [restaurant, setRestaurant] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [error, setError] = useState("");
  const [pendingChefNotice, setPendingChefNotice] = useState("");
  const [sending, setSending] = useState(false);

  const emailTrimmed = email.trim();
  const emailValid = emailTrimmed.length > 0 && isValidEmail(emailTrimmed);
  const cnpjDigits = cnpj.replace(/\D/g, "");
  const cnpjValid = cnpjDigits.length === 14 && isValidCnpj(cnpj);

  function handleRoleChange(newRole) {
    setRole(newRole);
    setError("");
    setPendingChefNotice("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setPendingChefNotice("");

    if (!isValidEmail(emailTrimmed)) {
      setError("Informe um endereço de e-mail válido (ex: nome@dominio.com).");
      return;
    }

    if (mode === "register" && role === "CHEF") {
      if (!isValidCnpj(cnpj)) {
        setError("O CNPJ informado é inválido. Verifique os 14 dígitos verificadores.");
        return;
      }
    }

    setSending(true);

    try {
      let loggedUser;
      if (mode === "login") {
        loggedUser = await login(emailTrimmed, password, role);
      } else {
        const registerRole = role === "ADMIN" ? "USER" : role;
        loggedUser = await register(name, emailTrimmed, password, registerRole, {
          restaurant,
          cnpj: formatCnpj(cnpj)
        });
      }
      if (onLoginSuccess && loggedUser) {
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
        {pendingChefNotice && (
          <div
            style={{
              background: "#fffbeb",
              border: "1px solid #f59e0b",
              color: "#92400e",
              padding: "12px 14px",
              borderRadius: "10px",
              fontSize: "13px",
              lineHeight: 1.45,
              marginBottom: "14px",
              fontWeight: 600
            }}
          >
            ⏳ {pendingChefNotice}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label>
            {mode === "login" ? "Tipo de acesso" : "Tipo de conta"}
            <select value={role} onChange={(e) => handleRoleChange(e.target.value)}>
              <option value="USER">Cliente / Usuário</option>
              <option value="CHEF">
                {mode === "register"
                  ? "Chef / Restaurante (Requer aprovação do Admin)"
                  : "Chef / Restaurante"}
              </option>
              {mode === "login" && (
                <option value="ADMIN">Administrador</option>
              )}
            </select>
          </label>

          {mode === "register" && (
            <label>
              Nome
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </label>
          )}

          {mode === "register" && role === "CHEF" && (
            <div className="auth-two-col">
              <label>
                Nome do Restaurante *
                <input
                  value={restaurant}
                  onChange={(e) => setRestaurant(e.target.value)}
                  placeholder="Ex: Trattoria del Chef"
                  required
                />
              </label>
              <label>
                <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                  <span>CNPJ do Estabelecimento *</span>
                  <button
                    type="button"
                    onClick={() => setCnpj(generateValidCnpj())}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#ea580c",
                      cursor: "pointer",
                      textDecoration: "underline"
                    }}
                    title="Preencher com um CNPJ válido para teste"
                  >
                    Gerar válido
                  </button>
                </span>
                <input
                  value={cnpj}
                  onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                  placeholder="00.000.000/0001-00"
                  maxLength={18}
                  required
                />
                {cnpjDigits.length > 0 && (
                  <small
                    style={{
                      fontSize: "11.5px",
                      fontWeight: 600,
                      color: cnpjValid ? "#15803d" : "#dc2626",
                      marginTop: "2px"
                    }}
                  >
                    {cnpjValid
                      ? "✓ CNPJ válido verificado"
                      : cnpjDigits.length < 14
                      ? `Digite os 14 números (${cnpjDigits.length}/14)`
                      : "✗ CNPJ inválido (dígitos verificadores incorretos)"}
                  </small>
                )}
              </label>
            </div>
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
            {emailTrimmed.length > 0 && (
              <small
                style={{
                  fontSize: "11.5px",
                  fontWeight: 600,
                  color: emailValid ? "#15803d" : "#dc2626",
                  marginTop: "2px"
                }}
              >
                {emailValid
                  ? "✓ Formato de e-mail válido"
                  : "✗ Informe um e-mail válido (ex: voce@dominio.com)"}
              </small>
            )}
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
              : role === "CHEF"
              ? "Enviar Cadastro para Aprovação do Admin"
              : "Criar conta"}
          </button>
        </form>

        {role !== "ADMIN" && (
          <button
            className="auth-switch"
            onClick={() => {
              const nextMode = mode === "login" ? "register" : "login";
              setMode(nextMode);
              if (nextMode === "register" && role === "ADMIN") {
                setRole("USER");
              }
              setError("");
              setPendingChefNotice("");
            }}
          >
            {mode === "login"
              ? "Ainda não tenho uma conta (Criar conta)"
              : "Já tenho uma conta (Fazer login)"}
          </button>
        )}
      </div>
    </div>
  );
}
