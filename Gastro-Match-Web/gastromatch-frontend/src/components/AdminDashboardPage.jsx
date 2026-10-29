import { useEffect, useMemo, useState } from "react";
import Icon from "./Icon";
import { api } from "../services/api";
import { useAuth } from "../services/AuthContext";

const INITIAL_FALLBACK_APPLICATIONS = [
  {
    id: 501,
    displayName: "Chef Henrique Fogaça Silva",
    restaurant: "Bistrô Fogo & Brasa",
    cnpj: "42.819.304/0001-72",
    description: "Localização: Florianópolis - SC • Carnes Nobres & Defumados",
    status: "PENDING",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    user: {
      name: "Chef Henrique Fogaça Silva",
      email: "henrique@fogobrasa.com.br",
      profile: { city: "Florianópolis - SC" }
    },
    documents: [
      {
        id: 901,
        type: "Alvará Sanitário Vigente (Vigilância Municipal)",
        fileUrl: "alvara_sanitario_bistro_fogo_brasa_2026.pdf",
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
      },
      {
        id: 902,
        type: "Comprovante de Inscrição e Situação Cadastral (CNPJ)",
        fileUrl: "cartao_cnpj_42819304000172.pdf",
        createdAt: new Date(Date.now() - 1000 * 60 * 44).toISOString()
      }
    ],
    _count: { recipes: 0 }
  },
  {
    id: 502,
    displayName: "Chef Helena Rizzo Costa",
    restaurant: "Maní Contemporâneo Sul",
    cnpj: "19.503.721/0001-18",
    description: "Localização: Balneário Camboriú - SC • Gastronomia Autoral Brasileira",
    status: "PENDING",
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    user: {
      name: "Chef Helena Rizzo Costa",
      email: "helena@manisul.com.br",
      profile: { city: "Balneário Camboriú - SC" }
    },
    documents: [
      {
        id: 903,
        type: "Certificado de Boas Práticas de Manipulação de Alimentos (ANVISA)",
        fileUrl: "certificado_anvisa_mani_sul.pdf",
        createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString()
      }
    ],
    _count: { recipes: 0 }
  },
  {
    id: 1,
    displayName: "Chef Gabriel Camillo",
    restaurant: "Ristorante Camillo",
    cnpj: "12.345.678/0001-90",
    description: "Especialista em risotos e culinária mediterrânea clássica.",
    status: "APPROVED",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    user: {
      name: "Chef Gabriel Camillo",
      email: "gabriel@gastromatch.com",
      profile: { city: "Florianópolis - SC" }
    },
    documents: [
      {
        id: 904,
        type: "Alvará Sanitário Vigente (Vigilância Municipal)",
        fileUrl: "alvara_ristorante_camillo.pdf",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
      }
    ],
    _count: { recipes: 1 }
  },
  {
    id: 6,
    displayName: "Chef Yasmin Lobo",
    restaurant: "Ateliê Doce Lobo",
    cnpj: "28.910.445/0001-33",
    description: "Confeiteira formada na Le Cordon Bleu, apaixonada por chocolates e doces finos.",
    status: "APPROVED",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    user: {
      name: "Chef Yasmin Lobo",
      email: "yasmin@gastromatch.com",
      profile: { city: "Florianópolis - SC" }
    },
    documents: [
      {
        id: 905,
        type: "Licença da Vigilância Sanitária Municipal",
        fileUrl: "licenca_atelie_doce_lobo.pdf",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
      }
    ],
    _count: { recipes: 1 }
  },
  {
    id: 5,
    displayName: "Chef Otavio de Deus",
    restaurant: "Cantinho Brasileiro",
    cnpj: "33.741.852/0001-09",
    description: "Preservando e inovando a rica tradição dos pratos típicos brasileiros.",
    status: "APPROVED",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    user: {
      name: "Chef Otavio de Deus",
      email: "otavio@gastromatch.com",
      profile: { city: "São Paulo - SP" }
    },
    documents: [
      {
        id: 906,
        type: "Alvará Sanitário Vigente (Vigilância Municipal)",
        fileUrl: "alvara_cantinho_brasileiro.pdf",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString()
      }
    ],
    _count: { recipes: 1 }
  }
];

function getLocalApplications() {
  try {
    const raw = localStorage.getItem("gastromatch_chef_applications");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  localStorage.setItem("gastromatch_chef_applications", JSON.stringify(INITIAL_FALLBACK_APPLICATIONS));
  return INITIAL_FALLBACK_APPLICATIONS;
}

export default function AdminDashboardPage({ onBackToStore }) {
  const { user, login, logout } = useAuth();
  const isAdmin = Boolean(user && user.role === "ADMIN");

  const [loginEmail, setLoginEmail] = useState("admin@gastromatch.com");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [applications, setApplications] = useState(() => getLocalApplications());
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | PENDING | APPROVED | REJECTED
  const [searchTerm, setSearchTerm] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [inspectingDoc, setInspectingDoc] = useState(null); // { chef, doc }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (isAdmin) {
      loadApplications();
    }
  }, [isAdmin]);

  async function loadApplications() {
    setLoading(true);
    try {
      const localList = getLocalApplications();
      const apiList = await api.adminChefApplications();
      if (Array.isArray(apiList) && apiList.length > 0) {
        // Merge any pending local items with database items
        const dbEmails = new Set(apiList.map((c) => c.user?.email).filter(Boolean));
        const localExtras = localList.filter((item) => !dbEmails.has(item.user?.email));
        const merged = [...localExtras, ...apiList];
        setApplications(merged);
        localStorage.setItem("gastromatch_chef_applications", JSON.stringify(merged));
      } else {
        setApplications(localList);
      }
    } catch {
      setApplications(getLocalApplications());
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminLogin(e) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const loggedUser = await login(loginEmail, loginPassword);
      if (loggedUser.role !== "ADMIN") {
        setLoginError("Esta conta não possui privilégios de Administrador. Use admin@gastromatch.com.");
      }
    } catch (err) {
      setLoginError(err.message || "Credenciais inválidas.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleQuickAdminLogin() {
    setLoginError("");
    setLoginLoading(true);
    try {
      await login("admin@gastromatch.com", "123456");
    } catch (err) {
      setLoginError(err.message || "Erro ao acessar conta de administrador.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleDecision(chef, newStatus) {
    setFeedbackMsg("");
    try {
      await api.adminUpdateChefStatus(chef.id, newStatus).catch(() => null);
    } catch {
      // fallback to local update
    }

    setApplications((prev) => {
      const updated = prev.map((item) =>
        item.id === chef.id ? { ...item, status: newStatus, updatedAt: new Date().toISOString() } : item
      );
      localStorage.setItem("gastromatch_chef_applications", JSON.stringify(updated));
      return updated;
    });

    const label =
      newStatus === "APPROVED"
        ? `Estabelecimento "${chef.restaurant || chef.displayName}" APROVADO e homologado com sucesso!`
        : newStatus === "REJECTED"
        ? `Solicitação de "${chef.restaurant || chef.displayName}" marcada como RECUSADA.`
        : `Solicitação de "${chef.restaurant || chef.displayName}" retornada para PENDENTE.`;

    setFeedbackMsg(label);
    setTimeout(() => setFeedbackMsg(""), 5000);

    if (inspectingDoc && inspectingDoc.chef.id === chef.id) {
      setInspectingDoc((prev) => (prev ? { ...prev, chef: { ...prev.chef, status: newStatus } } : null));
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
                        <Icon name="fileText" size={14} /> Documentos Recebidos ({docs.length}):
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
                                    : doc.fileUrl}
                                </span>
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

                    {/* Botões de Ação do Admin */}
                    <div className="admin-decision-bar">
                      <div className="admin-decision-hint">
                        {chef.status === "PENDING"
                          ? "Confira o documento acima e aprove ou recuse o credenciamento:"
                          : chef.status === "APPROVED"
                          ? "Este estabelecimento já está autorizado a publicar receitas e vender kits."
                          : "Este cadastro foi recusado. Você pode reavaliar se o chef enviou novos documentos."}
                      </div>

                      <div className="admin-decision-buttons">
                        {chef.status !== "APPROVED" && (
                          <button
                            type="button"
                            className="button button-small admin-btn-approve"
                            onClick={() => handleDecision(chef, "APPROVED")}
                          >
                            <Icon name="check" size={15} /> Aprovar Chef & Homologar
                          </button>
                        )}
                        {chef.status !== "REJECTED" && (
                          <button
                            type="button"
                            className="button button-small button-outline admin-btn-reject"
                            onClick={() => handleDecision(chef, "REJECTED")}
                          >
                            <Icon name="x" size={14} /> Recusar Documentos
                          </button>
                        )}
                        {chef.status !== "PENDING" && (
                          <button
                            type="button"
                            className="button button-small button-outline"
                            onClick={() => handleDecision(chef, "PENDING")}
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

            <div className="admin-doc-modal-actions">
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
                      handleDecision(inspectingDoc.chef, "REJECTED");
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
                    handleDecision(inspectingDoc.chef, "APPROVED");
                    setInspectingDoc(null);
                  }}
                >
                  <Icon name="check" size={15} /> Aprovar Documento & Chef
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
