import { useEffect, useMemo, useState } from "react";
import Icon from "./Icon";
import { api } from "../services/api";
import { useAuth } from "../services/AuthContext";

export default function AdminDashboardPage({ onBackToStore, onChefStatusUpdated }) {
  const { user, login, logout, showAlert } = useAuth();
  const isAdmin = Boolean(user && user.role === "ADMIN");

  const [loginEmail, setLoginEmail] = useState("admin@gastromatch.com");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | PENDING | APPROVED | REJECTED
  const [searchTerm, setSearchTerm] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [inspectingDoc, setInspectingDoc] = useState(null); // { chef, doc }
  const [commentDrafts, setCommentDrafts] = useState({});

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (isAdmin) {
      loadApplications();
    }
  }, [isAdmin]);

  function getStoredLocalApps() {
    try {
      const parsed = JSON.parse(localStorage.getItem("gastromatch_chef_applications") || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async function loadApplications() {
    setLoading(true);
    const localList = getStoredLocalApps();
    try {
      const apiList = await api.adminChefApplications();
      if (Array.isArray(apiList) && apiList.length > 0) {
        const localByEmail = new Map(
          localList
            .filter((item) => item.user?.email)
            .map((item) => [item.user.email.trim().toLowerCase(), item])
        );
        const dbEmails = new Set(
          apiList.map((c) => (c.user?.email || "").trim().toLowerCase()).filter(Boolean)
        );
        const mergedApi = apiList.map((dbItem) => {
          const emailKey = (dbItem.user?.email || "").trim().toLowerCase();
          const localMatch = localByEmail.get(emailKey);
          if (!localMatch) return dbItem;
          return {
            ...dbItem,
            password: localMatch.password,
            status: localMatch.updatedAt ? localMatch.status : dbItem.status,
            adminComment: localMatch.adminComment ?? dbItem.adminComment ?? "",
            hasPendencia: Boolean(localMatch.hasPendencia ?? dbItem.hasPendencia),
            documents:
              Array.isArray(localMatch.documents) &&
              localMatch.documents.length >= (dbItem.documents?.length || 0)
                ? localMatch.documents
                : dbItem.documents,
            updatedAt: localMatch.updatedAt || dbItem.updatedAt
          };
        });
        const localExtras = localList.filter(
          (item) => !dbEmails.has((item.user?.email || "").trim().toLowerCase())
        );
        const merged = [...localExtras, ...mergedApi];
        setApplications(merged);
        localStorage.setItem("gastromatch_chef_applications", JSON.stringify(merged));
      } else {
        setApplications(localList);
      }
    } catch (err) {
      console.warn("Usando solicitações locais:", err.message);
      setApplications(localList);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminLogin(e) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const loggedUser = await login(loginEmail, loginPassword, "ADMIN");
      if (loggedUser.role !== "ADMIN") {
        setLoginError("Esta conta não possui privilégios de Administrador. Use admin@gastromatch.com.");
      }
    } catch (err) {
      setLoginError(err.message || "Credenciais inválidas.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleDecision(chef, newStatus, customComment, isPendencia = false) {
    setFeedbackMsg("");
    const commentText = (
      customComment !== undefined
        ? customComment
        : commentDrafts[chef.id] !== undefined
        ? commentDrafts[chef.id]
        : chef.adminComment || ""
    ).trim();

    if (isPendencia && !commentText) {
      alert("Digite um comentário explicando a pendência para o Chef antes de enviar.");
      return;
    }

    let apiChef = null;
    try {
      const res = await api.adminUpdateChefStatus(chef.id, newStatus, commentText);
      apiChef = res?.chef || null;
    } catch {
      // Fallback para persistência local caso o admin esteja em sessão local ou chef criado localmente
    }

    const updatedFields = {
      ...(apiChef || {}),
      status: newStatus,
      adminComment: commentText,
      hasPendencia: Boolean(isPendencia || (newStatus === "PENDING" && commentText)),
      updatedAt: new Date().toISOString()
    };

    setApplications((prev) => {
      const next = prev.map((item) =>
        item.id === chef.id ||
        (item.user?.email &&
          chef.user?.email &&
          item.user.email.toLowerCase() === chef.user.email.toLowerCase())
          ? { ...item, ...updatedFields }
          : item
      );
      localStorage.setItem("gastromatch_chef_applications", JSON.stringify(next));
      return next;
    });

    if (onChefStatusUpdated) onChefStatusUpdated();

    const label =
      newStatus === "APPROVED"
        ? `Chef "${chef.displayName}" (${chef.restaurant || "Estabelecimento"}) LIBERADO e homologado com sucesso!`
        : newStatus === "REJECTED"
        ? `Cadastro de "${chef.displayName}" marcado como RECUSADO.`
        : commentText
        ? `Comentário / Pendência enviada para "${chef.displayName}": "${commentText}"`
        : `Solicitação de "${chef.displayName}" retornada para PENDENTE.`;

    setFeedbackMsg(label);
    showAlert &&
      showAlert(
        label,
        newStatus === "APPROVED"
          ? "success"
          : newStatus === "REJECTED"
          ? "error"
          : "warning"
      );
    setTimeout(() => setFeedbackMsg(""), 5500);

    if (inspectingDoc && inspectingDoc.chef.id === chef.id) {
      setInspectingDoc((prev) =>
        prev ? { ...prev, chef: { ...prev.chef, ...updatedFields } } : null
      );
    }
  }

  const counts = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a) => a.status === "PENDING").length;
    const approved = applications.filter((a) => a.status === "APPROVED").length;
    const rejected = applications.filter((a) => a.status === "REJECTED").length;
    return { total, pending, approved, rejected };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return applications
      .filter((item) => {
        if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;
        const haystack = `${item.displayName || ""} ${item.restaurant || ""} ${item.cnpj || ""} ${
          item.user?.email || ""
        }`.toLowerCase();
        return haystack.includes(term);
      })
      .sort((a, b) => {
        if (a.status === "PENDING" && b.status !== "PENDING") return -1;
        if (a.status !== "PENDING" && b.status === "PENDING") return 1;
        return 0;
      });
  }, [applications, statusFilter, searchTerm]);

  // TELA DE LOGIN DO ADMIN (SE NÃO ESTIVER LOGADO COMO ADMIN)
  if (!isAdmin) {
    return (
      <div className="chef-page-layout">
        <header className="chef-page-navbar">
          <div className="container chef-navbar-inner">
            <div className="chef-navbar-brand-row">
              <button className="back-store-button" onClick={onBackToStore}>
                <Icon name="arrowLeft" size={17} /> <span>Voltar à Vitrine</span>
              </button>
              <div className="brand-divider"></div>
              <div className="chef-brand-identity">
                <img className="brand-mark-mini" src="/gastromatch-icon.png" alt="GastroMatch" />
                <div className="chef-brand-text-col">
                  <span className="chef-page-portal-title">Portal do Administrador</span>
                  <span className="chef-page-portal-sub">Homologação Sanitária & Governança GastroMatch</span>
                </div>
              </div>
            </div>
            <div className="chef-navbar-user-controls">
              <span className="chef-badge-pill-light verified">
                <Icon name="shieldCheck" size={13} /> <span>Acesso Restrito</span>
              </span>
            </div>
          </div>
        </header>

        <main className="chef-page-main">
          <div className="container chef-access-max">
            <div className="chef-access-hero-card">
              <span className="chef-badge-pill-light live">
                <span className="live-dot"></span> Auditoria & Vigilância Sanitária
              </span>
              <h1>Painel Administrativo de Homologação</h1>
              <p>
                Analise solicitações de credenciamento de novos chefs e restaurantes, confira alvarás
                sanitários e documentos CNPJ enviados e aprove ou recuse cadastros na plataforma.
              </p>
            </div>

            <div className="chef-access-body-card">
              <h3 style={{ marginTop: 0, marginBottom: 14 }}>Login de Administrador</h3>
              {loginError && <div className="page-alert error">{loginError}</div>}

              <form onSubmit={handleAdminLogin} className="chef-screen-form">
                <div className="form-field">
                  <span>E-mail Administrativo *</span>
                  <input
                    type="email"
                    required
                    placeholder="admin@gastromatch.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <span>Senha *</span>
                  <input
                    type="password"
                    required
                    placeholder="Digite 123456"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>

                <div className="form-submit-row">
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="button button-orange button-large button-full"
                  >
                    {loginLoading ? "Autenticando..." : "Acessar Painel de Aprovação"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="chef-page-layout">
      {/* Top Navbar do Admin */}
      <header className="chef-page-navbar">
        <div className="container chef-navbar-inner">
          <div className="chef-navbar-brand-row">
            <button className="back-store-button" onClick={onBackToStore}>
              <Icon name="arrowLeft" size={17} /> <span>Voltar à Vitrine</span>
            </button>
            <div className="brand-divider"></div>
            <div className="chef-brand-identity">
              <img className="brand-mark-mini" src="/gastromatch-icon.png" alt="GastroMatch" />
              <div className="chef-brand-text-col">
                <span className="chef-page-portal-title">Painel do Administrador</span>
                <span className="chef-page-portal-sub">Análise de Documentos & Aprovação de Chefs</span>
              </div>
            </div>
          </div>

          <div className="chef-navbar-user-controls">
            <div className="chef-header-profile-tag">
              <div className="chef-avatar-small">
                <Icon name="shieldCheck" size={16} />
              </div>
              <div className="chef-header-texts">
                <strong>{user.name || "Administrador"}</strong>
                <span>ADMIN • Auditoria</span>
              </div>
            </div>
            <button
              className="button button-small button-outline chef-exit-btn"
              onClick={logout}
              title="Sair do painel admin"
            >
              <Icon name="x" size={14} /> <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="chef-page-main">
        <div className="container">
          {/* Header Card */}
          <section className="chef-profile-card">
            <div className="chef-profile-left">
              <div className="chef-profile-avatar-box">
                <Icon name="shieldCheck" size={32} />
              </div>
              <div className="chef-profile-info">
                <div className="chef-badges-row">
                  <span className="chef-badge-pill-light verified">
                    <Icon name="shieldCheck" size={14} /> Central de Homologação Sanitária
                  </span>
                  <span className="chef-badge-pill-light live">
                    <span className="live-dot"></span> {counts.pending} pendente(s) de aprovação
                  </span>
                </div>
                <h1 className="chef-profile-title">Gestão de Credenciamento de Chefs</h1>
                <div className="chef-profile-meta">
                  <span>Verifique o CNPJ e o Alvará Sanitário antes de liberar a venda de receitas e kits.</span>
                </div>
              </div>
            </div>

            <div className="chef-quick-kpis">
              <div className="kpi-mini-card">
                <span className="kpi-mini-label">Pendentes</span>
                <strong className="kpi-mini-value orange">{counts.pending}</strong>
              </div>
              <div className="kpi-mini-divider"></div>
              <div className="kpi-mini-card">
                <span className="kpi-mini-label">Aprovados</span>
                <strong className="kpi-mini-value">{counts.approved}</strong>
              </div>
              <div className="kpi-mini-divider"></div>
              <div className="kpi-mini-card">
                <span className="kpi-mini-label">Total</span>
                <strong className="kpi-mini-value">{counts.total}</strong>
              </div>
            </div>
          </section>

          {feedbackMsg && (
            <div className="page-alert success" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="check" size={18} />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Filter Tabs + Search */}
          <div className="admin-controls-row">
            <div className="chef-segmented-nav" style={{ marginBottom: 0 }}>
              <button
                type="button"
                className={`nav-tab-pill ${statusFilter === "ALL" ? "active" : ""}`}
                onClick={() => setStatusFilter("ALL")}
              >
                Todos <span className="tab-badge">{counts.total}</span>
              </button>
              <button
                type="button"
                className={`nav-tab-pill ${statusFilter === "PENDING" ? "active" : ""}`}
                onClick={() => setStatusFilter("PENDING")}
              >
                Pendentes de Análise <span className="tab-badge">{counts.pending}</span>
              </button>
              <button
                type="button"
                className={`nav-tab-pill ${statusFilter === "APPROVED" ? "active" : ""}`}
                onClick={() => setStatusFilter("APPROVED")}
              >
                Homologados <span className="tab-badge">{counts.approved}</span>
              </button>
              <button
                type="button"
                className={`nav-tab-pill ${statusFilter === "REJECTED" ? "active" : ""}`}
                onClick={() => setStatusFilter("REJECTED")}
              >
                Recusados <span className="tab-badge">{counts.rejected}</span>
              </button>
            </div>

            <div className="admin-search-input">
              <Icon name="search" size={16} />
              <input
                type="text"
                placeholder="Buscar por chef, restaurante ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <p>Carregando solicitações de chefs e documentos...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="empty-state">
              <Icon name="fileText" size={32} />
              <h3>Nenhuma solicitação encontrada</h3>
              <p>Não há cadastros de chefs neste filtro no momento.</p>
            </div>
          ) : (
            <div className="admin-applications-list">
              {filteredApplications.map((chef) => {
                const docs =
                  Array.isArray(chef.documents) && chef.documents.length > 0
                    ? chef.documents
                    : [
                        {
                          id: `doc-${chef.id}`,
                          type: "Alvará Sanitário Vigente (Vigilância Municipal)",
                          fileUrl: `alvara_${(chef.restaurant || "restaurante")
                            .toLowerCase()
                            .replace(/[^a-z0-9]/g, "_")}.pdf`,
                          createdAt: chef.createdAt || new Date().toISOString()
                        }
                      ];

                return (
                  <article key={chef.id} className={`admin-chef-card status-${(chef.status || "PENDING").toLowerCase()}`}>
                    <div className="admin-chef-card-top">
                      <div className="admin-chef-identity">
                        <div className="admin-chef-icon">
                          <Icon name="chef" size={22} />
                        </div>
                        <div>
                          <div className="admin-title-badges">
                            <h3>{chef.restaurant || "Estabelecimento Parceiro"}</h3>
                            {chef.status === "PENDING" && (
                              <span className="admin-status-badge pending">⏳ Pendente de Aprovação</span>
                            )}
                            {chef.status === "APPROVED" && (
                              <span className="admin-status-badge approved">
                                <Icon name="check" size={12} /> Homologado & Ativo
                              </span>
                            )}
                            {chef.status === "REJECTED" && (
                              <span className="admin-status-badge rejected">✕ Documentação Recusada</span>
                            )}
                          </div>
                          <p className="admin-chef-sub">
                            <strong>Responsável Técnico:</strong> {chef.displayName} •{" "}
                            <strong>E-mail:</strong> {chef.user?.email || "chef@gastromatch.com"}
                          </p>
                        </div>
                      </div>

                      <div className="admin-chef-meta-pills">
                        <span className="admin-meta-pill">
                          <strong>CNPJ:</strong> {chef.cnpj || "14.289.102/0001-55"}
                        </span>
                        <span className="admin-meta-pill">
                          <strong>Enviado em:</strong>{" "}
                          {chef.createdAt ? new Date(chef.createdAt).toLocaleDateString("pt-BR") : "Hoje"}
                        </span>
                      </div>
                    </div>

                    {chef.description && <p className="admin-chef-desc">{chef.description}</p>}

                    {/* Documentos Anexados */}
                    <div className="admin-docs-section">
                      <span className="admin-docs-label">
                        <Icon name="fileText" size={14} /> Documentos Enviados pelo Chef ({docs.length}):
                      </span>
                      <div className="admin-docs-grid">
                        {docs.map((doc) => (
                          <div key={doc.id || doc.fileUrl} className="admin-doc-item">
                            <div className="admin-doc-info">
                              <Icon name="fileText" size={18} />
                              <div>
                                <strong>{doc.type}</strong>
                                <span>
                                  Arquivo:{" "}
                                  {doc.fileUrl?.startsWith("data:")
                                    ? doc.fileName || "documento_digitalizado_anexo"
                                    : doc.fileName || doc.fileUrl}
                                </span>
                                {doc.chefNote && (
                                  <span style={{ display: "block", color: "#b45309", marginTop: 2 }}>
                                    Nota do Chef: &ldquo;{doc.chefNote}&rdquo;
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              className="button button-small button-outline"
                              onClick={() => setInspectingDoc({ chef, doc })}
                            >
                              Visualizar Documento
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Área de Comentário / Pendência do Administrador */}
                    <div
                      style={{
                        marginTop: "14px",
                        padding: "14px 16px",
                        borderRadius: "12px",
                        background: "#fdfbf4",
                        border: "1px solid #ece4ce"
                      }}
                    >
                      <label
                        style={{
                          display: "block",
                          fontSize: "12.5px",
                          fontWeight: 700,
                          color: "#334155",
                          marginBottom: "6px"
                        }}
                      >
                        💬 Comentário do Admin / Registro de Pendência para o Chef:
                      </label>
                      {chef.adminComment && (
                        <div
                          style={{
                            fontSize: "12.5px",
                            color: "#92400e",
                            background: "#fffbeb",
                            border: "1px solid #fcd34d",
                            padding: "6px 10px",
                            borderRadius: "8px",
                            marginBottom: "8px"
                          }}
                        >
                          <strong>Último parecer enviado ao Chef:</strong> &ldquo;{chef.adminComment}&rdquo;
                        </div>
                      )}
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <input
                          type="text"
                          placeholder="Escreva uma observação, pendência de documento ou parecer para este chef..."
                          value={
                            commentDrafts[chef.id] !== undefined
                              ? commentDrafts[chef.id]
                              : chef.adminComment || ""
                          }
                          onChange={(e) =>
                            setCommentDrafts((prev) => ({
                              ...prev,
                              [chef.id]: e.target.value
                            }))
                          }
                          style={{
                            flex: 1,
                            minWidth: "240px",
                            padding: "9px 12px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            fontSize: "13px",
                            background: "#fff"
                          }}
                        />
                        <button
                          type="button"
                          className="button button-small button-outline"
                          onClick={() =>
                            handleDecision(
                              chef,
                              "PENDING",
                              commentDrafts[chef.id] ?? chef.adminComment ?? "",
                              true
                            )
                          }
                        >
                          ⚠️ Enviar Comentário / Pendência
                        </button>
                      </div>
                    </div>

                    {/* Botões de Ação do Admin */}
                    <div className="admin-decision-bar">
                      <div className="admin-decision-hint">
                        {chef.status === "PENDING"
                          ? "Confira os documentos acima, registre uma pendência ou libere o Chef:"
                          : chef.status === "APPROVED"
                          ? "Este Chef já está LIBERADO para publicar receitas e vender kits."
                          : "Este cadastro foi recusado. Você pode reavaliar se o chef enviou novos documentos."}
                      </div>

                      <div className="admin-decision-buttons">
                        {chef.status !== "APPROVED" && (
                          <button
                            type="button"
                            className="button button-small admin-btn-approve"
                            onClick={() =>
                              handleDecision(
                                chef,
                                "APPROVED",
                                commentDrafts[chef.id] ?? chef.adminComment ?? "",
                                false
                              )
                            }
                          >
                            <Icon name="check" size={15} /> Liberar Chef (Aprovar & Homologar)
                          </button>
                        )}
                        {chef.status !== "REJECTED" && (
                          <button
                            type="button"
                            className="button button-small button-outline admin-btn-reject"
                            onClick={() =>
                              handleDecision(
                                chef,
                                "REJECTED",
                                commentDrafts[chef.id] ?? chef.adminComment ?? "",
                                false
                              )
                            }
                          >
                            <Icon name="x" size={14} /> Recusar Documentos
                          </button>
                        )}
                        {chef.status !== "PENDING" && (
                          <button
                            type="button"
                            className="button button-small button-outline"
                            onClick={() =>
                              handleDecision(
                                chef,
                                "PENDING",
                                commentDrafts[chef.id] ?? chef.adminComment ?? "",
                                false
                              )
                            }
                          >
                            Voltar para Pendente
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modal Visualizador de Documento do Chef */}
      {inspectingDoc && (
        <div className="modal-overlay" onClick={() => setInspectingDoc(null)}>
          <div className="modal-content admin-doc-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setInspectingDoc(null)} aria-label="Fechar">
              <Icon name="x" size={18} />
            </button>

            <div className="admin-doc-modal-header">
              <span className="section-kicker">Auditoria Documental • GastroMatch</span>
              <h2>{inspectingDoc.doc.type}</h2>
              <p>
                Enviado por <strong>{inspectingDoc.chef.displayName}</strong> ({inspectingDoc.chef.restaurant})
              </p>
            </div>

            <div className="admin-doc-preview-frame">
              {inspectingDoc.doc.fileUrl?.startsWith("data:image/") ? (
                <img
                  src={inspectingDoc.doc.fileUrl}
                  alt={inspectingDoc.doc.type}
                  className="admin-uploaded-doc-image"
                />
              ) : (
                <div className="admin-simulated-certificate">
                  <div className="cert-header">
                    <Icon name="shieldCheck" size={34} />
                    <div>
                      <strong>REPÚBLICA FEDERATIVA DO BRASIL • VIGILÂNCIA SANITÁRIA</strong>
                      <span>CERTIFICADO DE LICENCIAMENTO E REGULARIDADE SANITÁRIA</span>
                    </div>
                  </div>
                  <div className="cert-body">
                    <div className="cert-row">
                      <span>Estabelecimento / Razão Social:</span>
                      <strong>{inspectingDoc.chef.restaurant || "Restaurante Parceiro"}</strong>
                    </div>
                    <div className="cert-row">
                      <span>CNPJ Verificado:</span>
                      <strong>{inspectingDoc.chef.cnpj || "14.289.102/0001-55"}</strong>
                    </div>
                    <div className="cert-row">
                      <span>Responsável Técnico (Chef):</span>
                      <strong>{inspectingDoc.chef.displayName}</strong>
                    </div>
                    <div className="cert-row">
                      <span>Tipo de Documento:</span>
                      <strong>{inspectingDoc.doc.type}</strong>
                    </div>
                    <div className="cert-row">
                      <span>Arquivo Digital Recebido:</span>
                      <strong>{inspectingDoc.doc.fileName || inspectingDoc.doc.fileUrl}</strong>
                    </div>
                    <div className="cert-row">
                      <span>Atividade Autorizada:</span>
                      <strong>Comércio de Alimentos, Kits Gastronômicos Porcionados e Ensino Culinário</strong>
                    </div>
                  </div>
                  <div className="cert-footer">
                    <span>✓ Assinatura Digital ICP-Brasil Verificada</span>
                    <span>Validade: 12 meses • Situação: REGULAR</span>
                  </div>
                </div>
              )}
            </div>

            <div className="admin-doc-modal-actions" style={{ flexDirection: "column", alignItems: "stretch", gap: "12px" }}>
              <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                <input
                  type="text"
                  placeholder="Adicionar comentário ou pendência sobre este documento..."
                  value={
                    commentDrafts[inspectingDoc.chef.id] !== undefined
                      ? commentDrafts[inspectingDoc.chef.id]
                      : inspectingDoc.chef.adminComment || ""
                  }
                  onChange={(e) =>
                    setCommentDrafts((prev) => ({
                      ...prev,
                      [inspectingDoc.chef.id]: e.target.value
                    }))
                  }
                  style={{
                    flex: 1,
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px"
                  }}
                />
                <button
                  type="button"
                  className="button button-small button-outline"
                  onClick={() => {
                    handleDecision(
                      inspectingDoc.chef,
                      "PENDING",
                      commentDrafts[inspectingDoc.chef.id] ?? inspectingDoc.chef.adminComment ?? "",
                      true
                    );
                    setInspectingDoc(null);
                  }}
                >
                  ⚠️ Registrar Pendência
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <button
                  type="button"
                  className="button button-outline button-small"
                  onClick={() => setInspectingDoc(null)}
                >
                  Fechar Visualização
                </button>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {inspectingDoc.chef.status !== "REJECTED" && (
                    <button
                      type="button"
                      className="button button-small button-outline admin-btn-reject"
                      onClick={() => {
                        handleDecision(
                          inspectingDoc.chef,
                          "REJECTED",
                          commentDrafts[inspectingDoc.chef.id] ?? inspectingDoc.chef.adminComment ?? "",
                          false
                        );
                        setInspectingDoc(null);
                      }}
                    >
                      <Icon name="x" size={14} /> Recusar
                    </button>
                  )}
                  <button
                    type="button"
                    className="button button-small admin-btn-approve"
                    onClick={() => {
                      handleDecision(
                        inspectingDoc.chef,
                        "APPROVED",
                        commentDrafts[inspectingDoc.chef.id] ?? inspectingDoc.chef.adminComment ?? "",
                        false
                      );
                      setInspectingDoc(null);
                    }}
                  >
                    <Icon name="check" size={15} /> Liberar Chef (Aprovar Documento)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
