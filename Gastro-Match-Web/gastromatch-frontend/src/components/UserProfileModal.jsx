import { useState, useEffect } from "react";
import Icon from "./Icon";
import { useAuth } from "../services/AuthContext";

const AVATAR_OPTIONS = [
  { id: "chef1", label: "Chef Tradicional", url: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=80" },
  { id: "chef2", label: "Chef Confeiteira", url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80" },
  { id: "gourmet", label: "Apreciador Gourmet", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
  { id: "pasticceria", label: "Sommelier", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
  { id: "artisan", label: "Cozinheiro Criativo", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
  { id: "asian", label: "Mestre Oriental", url: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=200&q=80" }
];

const DIETARY_OPTIONS = [
  "Vegetariano",
  "Vegano",
  "Sem Glúten",
  "Sem Lactose",
  "Sem Frutos do Mar",
  "Low Carb",
  "Fit / Saudável"
];

export default function UserProfileModal({ onClose }) {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("dados"); // dados, endereco, preferencias, seguranca

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Address
  const [zipCode, setZipCode] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // Preferences
  const [dietary, setDietary] = useState([]);
  const [skillLevel, setSkillLevel] = useState("Iniciante");

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchingCep, setSearchingCep] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.profile?.phone || "");
      setAvatarUrl(user.avatarUrl || "");
      setCity(user.profile?.city || "");
      setState(user.profile?.state || "");

      const prefs = user.profile?.preferences || {};
      if (Array.isArray(prefs.dietary)) setDietary(prefs.dietary);
      if (prefs.skillLevel) setSkillLevel(prefs.skillLevel);

      const addr = prefs.address || {};
      setZipCode(addr.zipCode || "");
      setStreet(addr.street || "");
      setNumber(addr.number || "");
      setComplement(addr.complement || "");
      setNeighborhood(addr.neighborhood || "");
      if (addr.city) setCity(addr.city);
      if (addr.state) setState(addr.state);
    }
  }, [user]);

  const handleToggleDietary = (item) => {
    setDietary((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  const handleSearchCep = async () => {
    const cleanCep = zipCode.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      setMessage({ type: "error", text: "Digite um CEP válido com 8 dígitos." });
      return;
    }

    setSearchingCep(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (data.erro) {
        setMessage({ type: "error", text: "CEP não encontrado. Preencha manualmente." });
      } else {
        setStreet(data.logradouro || "");
        setNeighborhood(data.bairro || "");
        setCity(data.localidade || "");
        setState(data.uf || "");
        setMessage({ type: "success", text: "Endereço localizado com sucesso!" });
      }
    } catch {
      setMessage({ type: "error", text: "Não foi possível consultar o CEP automaticamente." });
    } finally {
      setSearchingCep(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (newPassword) {
      if (newPassword.length < 6) {
        setMessage({ type: "error", text: "A nova senha deve ter no mínimo 6 dígitos." });
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage({ type: "error", text: "A confirmação da nova senha não confere." });
        return;
      }
      if (!currentPassword) {
        setMessage({ type: "error", text: "Informe a senha atual para confirmar a alteração." });
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        name,
        avatarUrl,
        phone,
        city,
        state,
        country: "Brasil",
        preferences: {
          dietary,
          skillLevel,
          address: {
            zipCode,
            street,
            number,
            complement,
            neighborhood,
            city,
            state
          }
        },
        ...(newPassword ? { currentPassword, newPassword } : {})
      };

      await updateProfile(payload);
      setMessage({ type: "success", text: "Perfil e preferências atualizados com sucesso!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Erro ao salvar perfil." });
    } finally {
      setLoading(false);
    }
  };

  const isChef = user?.role === "CHEF" || Boolean(user?.chef);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar">
          <Icon name="x" size={18} />
        </button>

        {/* Header do Perfil */}
        <div className="profile-modal-header">
          <div className="profile-avatar-display">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-fallback">
                {name ? name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
            <span className="profile-badge-role">
              {isChef ? "CHEF" : "CLIENTE"}
            </span>
          </div>

          <div className="profile-title-col">
            <h2>{name || "Meu Perfil"}</h2>
            <p className="profile-email-sub">{user?.email}</p>
            <div className="profile-tags-summary">
              {isChef ? (
                <span className="tag-pill orange"><Icon name="chef" size={13} /> Chef & Restaurante Parceiro</span>
              ) : (
                <span className="tag-pill green"><Icon name="shieldCheck" size={13} /> Consumidor GastroMatch</span>
              )}
              {city && state && (
                <span className="tag-pill gray"><Icon name="mapPin" size={13} /> {city}, {state}</span>
              )}
            </div>
          </div>
        </div>

        {/* Abas */}
        <div className="profile-modal-tabs">
          <button
            type="button"
            className={activeTab === "dados" ? "active" : ""}
            onClick={() => setActiveTab("dados")}
          >
            <Icon name="fileText" size={15} /> Dados Pessoais
          </button>
          <button
            type="button"
            className={activeTab === "endereco" ? "active" : ""}
            onClick={() => setActiveTab("endereco")}
          >
            <Icon name="mapPin" size={15} /> Endereço dos Kits
          </button>
          <button
            type="button"
            className={activeTab === "preferencias" ? "active" : ""}
            onClick={() => setActiveTab("preferencias")}
          >
            <Icon name="heart" size={15} /> Preferências & Dieta
          </button>
          <button
            type="button"
            className={activeTab === "seguranca" ? "active" : ""}
            onClick={() => setActiveTab("seguranca")}
          >
            <Icon name="shieldCheck" size={15} /> Segurança
          </button>
        </div>

        {/* Mensagem de Feedback */}
        {message.text && (
          <div className={`profile-alert ${message.type}`}>
            <Icon name={message.type === "success" ? "check" : "x"} size={16} />
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-modal-body">
          {/* ABA 1: DADOS PESSOAIS */}
          {activeTab === "dados" && (
            <div className="profile-tab-section">
              <div className="form-grid-2">
                <label className="form-field">
                  <span>Nome Completo *</span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                  />
                </label>

                <label className="form-field">
                  <span>Telefone / WhatsApp</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(48) 99999-9999"
                  />
                </label>
              </div>

              <label className="form-field">
                <span>E-mail da Conta (Não editável)</span>
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="input-disabled"
                />
              </label>

              <div className="avatar-picker-section">
                <span>Escolha seu Avatar Culinário ou informe uma URL:</span>
                <div className="avatar-options-grid">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      className={`avatar-option-btn ${avatarUrl === av.url ? "selected" : ""}`}
                      onClick={() => setAvatarUrl(av.url)}
                    >
                      <img src={av.url} alt={av.label} />
                      <small>{av.label}</small>
                    </button>
                  ))}
                </div>

                <div className="custom-avatar-input">
                  <input
                    type="url"
                    placeholder="Ou cole a URL da sua foto (ex: https://...)"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: ENDEREÇO DE ENTREGA */}
          {activeTab === "endereco" && (
            <div className="profile-tab-section">
              <p className="tab-helper-text">
                Cadastre seu endereço para que possamos calcular automaticamente o frete refrigerado e tempo de entrega dos kits de ingredientes frescos.
              </p>

              <div className="cep-search-row">
                <label className="form-field" style={{ flex: 1 }}>
                  <span>CEP</span>
                  <input
                    type="text"
                    placeholder="Ex: 88010-000"
                    maxLength={9}
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                  />
                </label>
                <button
                  type="button"
                  className="button button-small button-outline btn-search-cep"
                  disabled={searchingCep}
                  onClick={handleSearchCep}
                >
                  <Icon name="search" size={14} /> {searchingCep ? "Buscando..." : "Buscar CEP"}
                </button>
              </div>

              <div className="form-grid-3">
                <label className="form-field" style={{ gridColumn: "span 2" }}>
                  <span>Logradouro (Rua, Avenida)</span>
                  <input
                    type="text"
                    placeholder="Ex: Av. Beira Mar Norte"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                </label>

                <label className="form-field">
                  <span>Número</span>
                  <input
                    type="text"
                    placeholder="Ex: 1200"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                  />
                </label>
              </div>

              <div className="form-grid-3">
                <label className="form-field">
                  <span>Complemento</span>
                  <input
                    type="text"
                    placeholder="Apto 402, Bloco B"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                  />
                </label>

                <label className="form-field">
                  <span>Bairro</span>
                  <input
                    type="text"
                    placeholder="Ex: Centro"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                  />
                </label>

                <label className="form-field">
                  <span>Cidade / UF</span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input
                      type="text"
                      placeholder="Cidade"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{ flex: 3 }}
                    />
                    <input
                      type="text"
                      placeholder="UF"
                      maxLength={2}
                      value={state}
                      onChange={(e) => setState(e.target.value.toUpperCase())}
                      style={{ flex: 1, textAlign: "center" }}
                    />
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* ABA 3: PREFERÊNCIAS & DIETA */}
          {activeTab === "preferencias" && (
            <div className="profile-tab-section">
              <p className="tab-helper-text">
                Selecione suas preferências e restrições para destacarmos as receitas e kits ideais para o seu paladar e estilo de vida.
              </p>

              <div className="dietary-selector-block">
                <span>Restrições e Estilos Alimentares:</span>
                <div className="dietary-chips-grid">
                  {DIETARY_OPTIONS.map((opt) => {
                    const isSelected = dietary.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        className={`dietary-chip-btn ${isSelected ? "selected" : ""}`}
                        onClick={() => handleToggleDietary(opt)}
                      >
                        <Icon name={isSelected ? "check" : "heart"} size={14} />
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="skill-level-block">
                <span>Seu nível de experiência na cozinha:</span>
                <div className="skill-radios-row">
                  {["Iniciante", "Intermediário", "Avançado"].map((lvl) => (
                    <label key={lvl} className={`skill-card-radio ${skillLevel === lvl ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="skillLevel"
                        value={lvl}
                        checked={skillLevel === lvl}
                        onChange={(e) => setSkillLevel(e.target.value)}
                      />
                      <strong>{lvl}</strong>
                      <small>
                        {lvl === "Iniciante" && "Prefiro receitas simples com videoaulas guiadas."}
                        {lvl === "Intermediário" && "Já domino técnicas e gosto de testar sabores."}
                        {lvl === "Avançado" && "Procuro pratos autorais de alta gastronomia."}
                      </small>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ABA 4: SEGURANÇA */}
          {activeTab === "seguranca" && (
            <div className="profile-tab-section">
              <p className="tab-helper-text">
                Para alterar sua senha, preencha sua senha atual e escolha uma nova senha de no mínimo 6 dígitos.
              </p>

              <label className="form-field">
                <span>Senha Atual</span>
                <input
                  type="password"
                  placeholder="Sua senha atual"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </label>

              <div className="form-grid-2">
                <label className="form-field">
                  <span>Nova Senha</span>
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </label>

                <label className="form-field">
                  <span>Confirmar Nova Senha</span>
                  <input
                    type="password"
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Rodapé de Ações */}
          <div className="profile-modal-footer">
            <button type="button" className="button button-outline" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="button button-orange">
              <Icon name="check" size={17} /> {loading ? "Salvando..." : "Salvar Alterações do Perfil"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
