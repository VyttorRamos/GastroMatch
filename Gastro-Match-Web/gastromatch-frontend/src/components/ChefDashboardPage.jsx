import { useState, useEffect } from "react";
import Icon from "./Icon";
import { api } from "../services/api";
import {
  useAuth,
  getLocalChefAppByEmail,
  upsertLocalChefApplication
} from "../services/AuthContext";
import { formatCnpj, isValidCnpj, generateValidCnpj, isValidEmail } from "../utils/validators";

function formatPrice(val) {
  if (val === undefined || val === null) return "0,00";
  return Number(val).toFixed(2).replace(".", ",");
}

export default function ChefDashboardPage({ onBackToStore, onRecipeCreated, onOpenAdminDashboard }) {
  const { user, setUser, logout, login, showAlert } = useAuth();
  const [localAppState, setLocalAppState] = useState(() =>
    user?.email ? getLocalChefAppByEmail(user.email) : null
  );

  useEffect(() => {
    if (user?.email) {
      setLocalAppState(getLocalChefAppByEmail(user.email));
    } else {
      setLocalAppState(null);
    }
  }, [user]);

  const effectiveChefStatus = localAppState?.updatedAt
    ? localAppState.status
    : user?.chef?.status || localAppState?.status || "PENDING";

  const isLoggedChef = Boolean(
    user && (user.role === "CHEF" || Boolean(user.chef) || Boolean(localAppState))
  );

  const isChefOrAdmin = Boolean(
    user &&
      (user.role === "ADMIN" || (isLoggedChef && effectiveChefStatus === "APPROVED"))
  );

  // Document submission state for logged-in pending Chef
  const [docUploadForm, setDocUploadForm] = useState({
    restaurant: "",
    cnpj: "",
    city: "",
    docType: "Alvará Sanitário Vigente (Vigilância Municipal)",
    fileUrl: "",
    fileName: "",
    chefNote: ""
  });
  const [docSending, setDocSending] = useState(false);
  const [docSuccessMsg, setDocSuccessMsg] = useState("");
  const [docErrorMsg, setDocErrorMsg] = useState("");

  useEffect(() => {
    if (isLoggedChef) {
      const app = user?.email ? getLocalChefAppByEmail(user.email) : null;
      setDocUploadForm((prev) => ({
        ...prev,
        restaurant: app?.restaurant || user?.chef?.restaurant || prev.restaurant || "",
        cnpj: app?.cnpj || user?.chef?.cnpj || prev.cnpj || "",
        city: app?.user?.profile?.city || app?.city || prev.city || "Florianópolis - SC"
      }));
    }
  }, [isLoggedChef, user]);

  const [activeTab, setActiveTab] = useState("recipes"); // recipes, new, orders, metrics
  const [recipes, setRecipes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Portal Access & Onboarding State (when not authenticated as chef)
  const [accessTab, setAccessTab] = useState("login"); // "login" | "register"
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // New Restaurant Onboarding Form State
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    password: "",
    cnpj: "",
    restaurant: "",
    city: "",
    docType: "Alvará Sanitário Vigente (Vigilância Municipal)",
    fileUrl: "",
    fileName: "",
    termsAccepted: false
  });
  const [regSubmitted, setRegSubmitted] = useState(false);

  // Editing Recipe State
  const [editingRecipeId, setEditingRecipeId] = useState(null);

  // New Recipe Form State
  const [form, setForm] = useState({
    title: "",
    description: "",
    instructions: "",
    categoryId: "1",
    difficulty: "EASY",
    price: "29.90",
    prepTime: "40",
    servings: "2",
    imageUrl: "",
    videoUrl: "",
    hasKit: true,
    kitPrice: "44.90",
    kitStock: "15",
    kitDescription: "Insumos frescos selecionados e higienizados, temperos artesanais e receita impressa."
  });

  // Dynamic Ingredients List
  const [ingredientsList, setIngredientsList] = useState([
    { name: "Massa fresca artesanal", quantity: "300g" },
    { name: "Molho especial da casa", quantity: "200ml" },
    { name: "Queijo curado artesanal", quantity: "60g" }
  ]);
  const [newIngName, setNewIngName] = useState("");
  const [newIngQty, setNewIngQty] = useState("");

  useEffect(() => {
    if (isChefOrAdmin) {
      loadData();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      const [recData, catData, ordData] = await Promise.all([
        api.myRecipes().catch(() => []),
        api.categories().catch(() => []),
        api.orders().catch(() => [])
      ]);
      setRecipes(Array.isArray(recData) ? recData : []);
      setCategories(Array.isArray(catData) ? catData : []);
      setOrders(Array.isArray(ordData) ? ordData : []);
    } catch (err) {
      console.warn("Erro ao carregar dados do chef:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleAddIngredient(e) {
    e.preventDefault();
    if (!newIngName.trim()) return;
    const addedName = newIngName.trim();
    setIngredientsList((prev) => [
      ...prev,
      { name: addedName, quantity: newIngQty.trim() || "a gosto" }
    ]);
    setNewIngName("");
    setNewIngQty("");
    showAlert && showAlert(`Ingrediente "${addedName}" adicionado à ficha técnica!`, "success");
  }

  function handleRemoveIngredient(index) {
    setIngredientsList((prev) => prev.filter((_, idx) => idx !== index));
    showAlert && showAlert("Ingrediente removido da ficha técnica.", "info");
  }

  function handleStartEdit(recipe) {
    setEditingRecipeId(recipe.id);
    setForm({
      title: recipe.title || "",
      description: recipe.description || "",
      instructions: recipe.instructions || "",
      categoryId: recipe.categoryId ? String(recipe.categoryId) : "1",
      difficulty: recipe.difficulty || "EASY",
      price: String(recipe.price || "29.90"),
      prepTime: String(recipe.prepTime || "40"),
      servings: String(recipe.servings || "2"),
      imageUrl: recipe.imageUrl || "",
      videoUrl: recipe.videoUrl || "",
      hasKit: Boolean(recipe.hasKit),
      kitPrice: recipe.kitPrice ? String(recipe.kitPrice) : "44.90",
      kitStock: recipe.kitStock !== undefined && recipe.kitStock !== null ? String(recipe.kitStock) : "15",
      kitDescription: recipe.kitDescription || "Insumos frescos selecionados e higienizados, temperos artesanais e receita impressa."
    });

    if (recipe.ingredients && recipe.ingredients.length > 0) {
      setIngredientsList(
        recipe.ingredients.map((item) => ({
          name: item.ingredient?.name || item.name,
          quantity: item.quantity || "a gosto"
        }))
      );
    } else {
      setIngredientsList([]);
    }

    setActiveTab("new");
    window.scrollTo({ top: 300, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingRecipeId(null);
    setForm({
      title: "",
      description: "",
      instructions: "",
      categoryId: categories[0]?.id ? String(categories[0].id) : "1",
      difficulty: "EASY",
      price: "29.90",
      prepTime: "40",
      servings: "2",
      imageUrl: "",
      videoUrl: "",
      hasKit: true,
      kitPrice: "44.90",
      kitStock: "15",
      kitDescription: "Insumos frescos selecionados e higienizados, temperos artesanais e receita impressa."
    });
    setIngredientsList([]);
    setActiveTab("recipes");
  }

  async function handleSubmitRecipe(e) {
    e.preventDefault();
    setErrorMsg("");
    setFeedbackMsg("");

    if (!form.title || !form.description || !form.instructions) {
      setErrorMsg("Preencha o título, a descrição e o modo de preparo.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...form,
        categoryId: Number(form.categoryId),
        price: Number(form.price),
        prepTime: Number(form.prepTime),
        servings: Number(form.servings),
        hasKit: Boolean(form.hasKit),
        kitPrice: form.hasKit ? Number(form.kitPrice) : null,
        kitStock: form.hasKit ? Number(form.kitStock) : 0,
        kitDescription: form.hasKit ? form.kitDescription : null,
        ingredientsList
      };

      if (editingRecipeId) {
        await api.updateRecipe(editingRecipeId, payload);
        setFeedbackMsg("Receita e Kit atualizados com sucesso no catálogo!");
        showAlert && showAlert("Receita e Kit atualizados com sucesso!", "success");
      } else {
        await api.createRecipe(payload);
        setFeedbackMsg("Receita e Kit de Ingredientes publicados com sucesso no catálogo!");
        showAlert && showAlert("Nova receita publicada com sucesso no catálogo!", "success");
      }

      setEditingRecipeId(null);
      // Reset form
      setForm({
        title: "",
        description: "",
        instructions: "",
        categoryId: categories[0]?.id ? String(categories[0].id) : "1",
        difficulty: "EASY",
        price: "29.90",
        prepTime: "40",
        servings: "2",
        imageUrl: "",
        videoUrl: "",
        hasKit: true,
        kitPrice: "44.90",
        kitStock: "15",
        kitDescription: "Insumos frescos selecionados e higienizados, temperos artesanais e receita impressa."
      });
      setIngredientsList([]);

      // Reload dashboard recipes and notify parent
      await loadData();
      if (onRecipeCreated) onRecipeCreated();
      setActiveTab("recipes");
    } catch (err) {
      setErrorMsg(err.message || "Erro ao salvar receita.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteRecipe(id) {
    if (!confirm("Tem certeza que deseja remover esta receita do catálogo?")) return;
    try {
      await api.deleteRecipe(id);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      if (onRecipeCreated) onRecipeCreated();
      showAlert && showAlert("Receita removida do catálogo com sucesso.", "info");
    } catch (err) {
      showAlert && showAlert("Erro ao excluir receita: " + err.message, "error");
    }
  }

  async function handleQuickLogin(email, password) {
    setLoginError("");
    setLoginLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setLoginError(err.message || "Erro ao conectar conta de demonstração.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleChefLogin(e) {
    e.preventDefault();
    setLoginError("");
    if (!isValidEmail(loginEmail)) {
      setLoginError("Informe um endereço de e-mail válido.");
      return;
    }
    setLoginLoading(true);
    try {
      await login(loginEmail.trim(), loginPassword);
    } catch (err) {
      setLoginError(err.message || "E-mail ou senha incorretos.");
    } finally {
      setLoginLoading(false);
    }
  }

  function handleDocFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRegForm((prev) => ({
        ...prev,
        fileName: file.name,
        fileUrl: typeof reader.result === "string" ? reader.result : file.name
      }));
    };
    reader.readAsDataURL(file);
  }

  async function handleChefRegister(e) {
    e.preventDefault();
    setLoginError("");

    if (!isValidEmail(regForm.email)) {
      setLoginError("Por favor, informe um e-mail válido (ex: chef@restaurante.com.br).");
      return;
    }

    if (!isValidCnpj(regForm.cnpj)) {
      setLoginError("O CNPJ informado é inválido. Verifique os 14 dígitos verificadores.");
      return;
    }

    const docFileUrl =
      regForm.fileUrl ||
      `alvara_${(regForm.restaurant || "restaurante").toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf`;

    const normalizedEmail = regForm.email.trim().toLowerCase();

    const newEntry = {
      id: Date.now(),
      displayName: regForm.name,
      restaurant: regForm.restaurant,
      cnpj: regForm.cnpj,
      description: `Localização: ${regForm.city || "Brasil"}`,
      status: "PENDING",
      password: regForm.password || "123456",
      createdAt: new Date().toISOString(),
      user: {
        name: regForm.name,
        email: normalizedEmail,
        profile: { city: regForm.city }
      },
      documents: [
        {
          id: Date.now() + 1,
          type: regForm.docType,
          fileUrl: docFileUrl,
          fileName: regForm.fileName || docFileUrl,
          createdAt: new Date().toISOString()
        }
      ],
      _count: { recipes: 0 }
    };

    try {
      const res = await api.submitChefApplication({
        name: regForm.name,
        email: normalizedEmail,
        password: regForm.password || "123456",
        restaurant: regForm.restaurant,
        cnpj: regForm.cnpj,
        city: regForm.city,
        docType: regForm.docType,
        fileUrl: docFileUrl
      });
      if (res?.chef) {
        newEntry.id = res.chef.id;
      }
    } catch {
      // Salva localmente mesmo se a API estiver offline
    }

    try {
      const existing = JSON.parse(localStorage.getItem("gastromatch_chef_applications") || "[]");
      const filtered = (Array.isArray(existing) ? existing : []).filter(
        (item) => (item.user?.email || "").trim().toLowerCase() !== normalizedEmail
      );
      localStorage.setItem(
        "gastromatch_chef_applications",
        JSON.stringify([newEntry, ...filtered])
      );
    } catch {
      // ignore
    }

    setRegSubmitted(true);
  }

  function handleLoggedChefFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDocUploadForm((prev) => ({
        ...prev,
        fileName: file.name,
        fileUrl: typeof reader.result === "string" ? reader.result : file.name
      }));
      showAlert && showAlert(`Arquivo "${file.name}" selecionado com sucesso!`, "info");
    };
    reader.readAsDataURL(file);
  }

  async function handleLoggedChefSendDocument(e) {
    e.preventDefault();
    setDocErrorMsg("");
    setDocSuccessMsg("");

    if (!docUploadForm.restaurant.trim() || !docUploadForm.cnpj.trim()) {
      setDocErrorMsg("Informe o nome do restaurante e o CNPJ do estabelecimento.");
      return;
    }

    if (!isValidCnpj(docUploadForm.cnpj)) {
      setDocErrorMsg("O CNPJ informado é inválido. Verifique os 14 dígitos verificadores.");
      return;
    }

    setDocSending(true);
    const generatedFileUrl =
      docUploadForm.fileUrl ||
      `documento_${(docUploadForm.restaurant || "chef").toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}.pdf`;

    const newDocItem = {
      id: Date.now(),
      type: docUploadForm.docType,
      fileUrl: generatedFileUrl,
      fileName: docUploadForm.fileName || generatedFileUrl,
      chefNote: docUploadForm.chefNote.trim(),
      createdAt: new Date().toISOString()
    };

    const existingApp = user?.email ? getLocalChefAppByEmail(user.email) : null;
    const prevDocs =
      existingApp?.documents || user?.chef?.documents || [];

    let chefId = existingApp?.id || user?.chef?.id || Date.now();

    try {
      const res = await api.submitChefApplication({
        name: user.name,
        email: user.email,
        restaurant: docUploadForm.restaurant.trim(),
        cnpj: docUploadForm.cnpj.trim(),
        city: docUploadForm.city.trim(),
        docType: docUploadForm.docType,
        fileUrl: generatedFileUrl
      });
      if (res?.chef?.id) {
        chefId = res.chef.id;
      }
    } catch {
      // Fallback para persistência local
    }

    const updatedApp = {
      ...(existingApp || {}),
      id: chefId,
      displayName: user.name || existingApp?.displayName || "Chef Parceiro",
      restaurant: docUploadForm.restaurant.trim(),
      cnpj: docUploadForm.cnpj.trim(),
      city: docUploadForm.city.trim(),
      description: `Localização: ${docUploadForm.city.trim() || "Brasil"}${
        docUploadForm.chefNote.trim() ? ` • Obs do Chef: ${docUploadForm.chefNote.trim()}` : ""
      }`,
      status: "PENDING",
      hasPendencia: false,
      adminComment: existingApp?.adminComment || "",
      createdAt: existingApp?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: { city: docUploadForm.city.trim() }
      },
      documents: [newDocItem, ...prevDocs],
      _count: { recipes: 0 }
    };

    upsertLocalChefApplication(updatedApp);
    setLocalAppState(updatedApp);

    const updatedUser = {
      ...user,
      role: "CHEF",
      chef: updatedApp
    };
    setUser(updatedUser);
    localStorage.setItem("gastromatch_user", JSON.stringify(updatedUser));

    setDocUploadForm((prev) => ({
      ...prev,
      fileUrl: "",
      fileName: "",
      chefNote: ""
    }));
    setDocSending(false);
    setDocSuccessMsg(
      "Documento enviado com sucesso para o Administrador! Acompanhe o status abaixo."
    );
    showAlert &&
      showAlert("Documento enviado para análise do Administrador com sucesso!", "success");
  }

  // TELA DE ENVIO DE DOCUMENTOS & HOMOLOGAÇÃO (QUANDO O NOVO CHEF ENTRA E AINDA NÃO FOI LIBERADO PELO ADMIN)
  if (isLoggedChef && !isChefOrAdmin) {
    const currentApp = localAppState || user?.chef || {};
    const sentDocs = Array.isArray(currentApp.documents) ? currentApp.documents : [];
    const adminComment = currentApp.adminComment || "";
    const hasPendencia = Boolean(currentApp.hasPendencia || adminComment);

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
                  <span className="chef-page-portal-title">Homologação do Novo Chef</span>
                  <span className="chef-page-portal-sub">Envio de Documentos & Liberação pelo Administrador</span>
                </div>
              </div>
            </div>

            <div className="chef-navbar-user-controls">
              <div className="chef-header-profile-tag">
                <div className="chef-avatar-small">
                  <Icon name="chef" size={16} />
                </div>
                <div className="chef-header-texts">
                  <strong>{user.name}</strong>
                  <span>
                    {effectiveChefStatus === "REJECTED"
                      ? "Documentação Recusada"
                      : hasPendencia
                      ? "Com Pendência do Admin"
                      : "Aguardando Liberação"}
                  </span>
                </div>
              </div>

              {onOpenAdminDashboard && (
                <button
                  type="button"
                  className="button button-small button-outline"
                  onClick={onOpenAdminDashboard}
                >
                  <Icon name="shieldCheck" size={14} /> <span>Painel Admin</span>
                </button>
              )}

              <button
                className="button button-small button-outline chef-exit-btn"
                onClick={logout}
                title="Sair da conta"
              >
                <Icon name="x" size={14} /> <span>Sair</span>
              </button>
            </div>
          </div>
        </header>

        <main className="chef-page-main">
          <div className="container chef-access-max">
            {/* Banner de Status da Homologação */}
            <div className="chef-access-hero-card">
              <span className="chef-badge-pill-light live">
                <span className="live-dot"></span>{" "}
                {effectiveChefStatus === "REJECTED"
                  ? "Status: Cadastro Recusado • Reenvie a Documentação"
                  : hasPendencia
                  ? "Status: Pendência Apontada pelo Administrador"
                  : sentDocs.length > 0
                  ? "Status: Documentos Enviados • Aguardando Liberação do Admin"
                  : "Status: Pendente • Envie seus Documentos Abaixo"}
              </span>
              <h1>Olá, {user.name}! Envie seus documentos para liberação</h1>
              <p>
                Para garantir a segurança alimentar dos clientes, novos chefs precisam enviar a documentação
                sanitária e o CNPJ do restaurante. Assim que o <strong>Administrador</strong> conferir seus
                documentos e liberar seu cadastro, seu painel completo de publicação de receitas e venda de kits será desbloqueado!
              </p>
            </div>

            {/* Alerta de Comentário / Pendência do Administrador */}
            {adminComment && (
              <div
                style={{
                  background: effectiveChefStatus === "REJECTED" ? "#fef2f2" : "#fffbeb",
                  border: `2px solid ${effectiveChefStatus === "REJECTED" ? "#ef4444" : "#f59e0b"}`,
                  borderRadius: "16px",
                  padding: "20px 24px",
                  marginBottom: "24px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.05)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <Icon name="shieldCheck" size={22} />
                  <strong style={{ fontSize: "16px", color: effectiveChefStatus === "REJECTED" ? "#991b1b" : "#92400e" }}>
                    {effectiveChefStatus === "REJECTED"
                      ? "Motivo da Recusa / Parecer do Administrador:"
                      : "Comentário / Pendência Registrada pelo Administrador:"}
                  </strong>
                </div>
                <p style={{ margin: "0 0 10px", fontSize: "14.5px", color: "#1e293b", lineHeight: 1.55, fontWeight: 500 }}>
                  &ldquo;{adminComment}&rdquo;
                </p>
                <span style={{ fontSize: "12.5px", color: "#64748b" }}>
                  Utilize o formulário abaixo para enviar o documento complementar ou corrigir a pendência solicitada pelo Admin.
                </span>
              </div>
            )}

            {/* Card Principal de Envio de Documentos */}
            <div className="chef-access-body-card" style={{ marginBottom: "24px" }}>
              <div style={{ marginBottom: "20px" }}>
                <span className="section-kicker">Etapa Obrigatória de Credenciamento</span>
                <h2 style={{ margin: "4px 0 6px", fontSize: "22px" }}>Enviar Documentos para o Administrador</h2>
                <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                  Anexe seu Alvará Sanitário, Cartão CNPJ ou Certificado de Boas Práticas (ANVISA). Você pode enviar mais de um documento se necessário.
                </p>
              </div>

              {docErrorMsg && <div className="page-alert error">{docErrorMsg}</div>}
              {docSuccessMsg && (
                <div className="page-alert success" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="check" size={18} />
                  <span>{docSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleLoggedChefSendDocument} className="chef-screen-form">
                <div className="form-grid-2">
                  <div className="form-field">
                    <span>Nome Fantasia do Restaurante *</span>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Trattoria del Chef"
                      value={docUploadForm.restaurant}
                      onChange={(e) =>
                        setDocUploadForm({ ...docUploadForm, restaurant: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-field">
                    <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <span>CNPJ do Estabelecimento *</span>
                      <button
                        type="button"
                        onClick={() =>
                          setDocUploadForm({ ...docUploadForm, cnpj: generateValidCnpj() })
                        }
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          fontSize: "11.5px",
                          fontWeight: 700,
                          color: "#ea580c",
                          cursor: "pointer",
                          textDecoration: "underline"
                        }}
                      >
                        Gerar CNPJ válido
                      </button>
                    </span>
                    <input
                      type="text"
                      required
                      maxLength={18}
                      placeholder="00.000.000/0001-00"
                      value={docUploadForm.cnpj}
                      onChange={(e) =>
                        setDocUploadForm({ ...docUploadForm, cnpj: formatCnpj(e.target.value) })
                      }
                    />
                    {docUploadForm.cnpj.replace(/\D/g, "").length > 0 && (
                      <small
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: isValidCnpj(docUploadForm.cnpj) ? "#15803d" : "#dc2626",
                          marginTop: "4px",
                          display: "block"
                        }}
                      >
                        {isValidCnpj(docUploadForm.cnpj)
                          ? "✓ CNPJ válido verificado"
                          : docUploadForm.cnpj.replace(/\D/g, "").length < 14
                          ? `Digite os 14 dígitos (${docUploadForm.cnpj.replace(/\D/g, "").length}/14)`
                          : "✗ CNPJ inválido (dígitos verificadores incorretos)"}
                      </small>
                    )}
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <span>Cidade e Estado *</span>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Florianópolis - SC"
                      value={docUploadForm.city}
                      onChange={(e) =>
                        setDocUploadForm({ ...docUploadForm, city: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-field">
                    <span>Tipo de Documento *</span>
                    <select
                      value={docUploadForm.docType}
                      onChange={(e) =>
                        setDocUploadForm({ ...docUploadForm, docType: e.target.value })
                      }
                    >
                      <option>Alvará Sanitário Vigente (Vigilância Municipal)</option>
                      <option>Comprovante de Inscrição e Situação Cadastral (CNPJ)</option>
                      <option>Licença da Vigilância Sanitária Municipal</option>
                      <option>Certificado de Boas Práticas de Manipulação de Alimentos (ANVISA)</option>
                      <option>Documento de Identificação do Responsável Técnico (RG/CNH)</option>
                    </select>
                  </div>
                </div>

                <div className="form-upload-area">
                  <Icon name="fileText" size={26} />
                  <div className="upload-texts">
                    <strong>Selecionar Arquivo do Documento (PDF, JPG ou PNG) *</strong>
                    <p>
                      {docUploadForm.fileName
                        ? `✓ Arquivo selecionado: ${docUploadForm.fileName}`
                        : "Clique aqui para anexar o documento digitalizado para análise do Admin"}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleLoggedChefFileChange}
                  />
                </div>

                <div className="form-field">
                  <span>Observação / Mensagem para o Administrador (Opcional)</span>
                  <input
                    type="text"
                    placeholder="Ex: Segue alvará sanitário atualizado conforme solicitado..."
                    value={docUploadForm.chefNote}
                    onChange={(e) =>
                      setDocUploadForm({ ...docUploadForm, chefNote: e.target.value })
                    }
                  />
                </div>

                <div className="form-submit-row">
                  <button
                    type="submit"
                    disabled={docSending}
                    className="button button-orange button-large button-full"
                  >
                    <Icon name="fileText" size={17} />{" "}
                    {docSending
                      ? "Enviando Documento..."
                      : "Enviar Documento para Análise do Administrador"}
                  </button>
                </div>
              </form>
            </div>

            {/* Lista de Documentos Já Enviados pelo Chef */}
            <div className="chef-access-body-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px" }}>
                    Documentos Enviados por Você ({sentDocs.length})
                  </h3>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                    Todos os arquivos abaixo já estão visíveis para o Administrador avaliar no Painel Admin.
                  </p>
                </div>
                {onOpenAdminDashboard && (
                  <button
                    type="button"
                    className="button button-small button-outline"
                    onClick={onOpenAdminDashboard}
                  >
                    <Icon name="shieldCheck" size={15} /> Abrir Painel do Admin para Avaliar
                  </button>
                )}
              </div>

              {sentDocs.length === 0 ? (
                <div className="empty-state" style={{ margin: "10px auto", padding: "32px 20px" }}>
                  <div className="empty-state-icon-badge">
                    <Icon name="fileText" size={26} />
                  </div>
                  <h3>Nenhum documento enviado ainda</h3>
                  <p>
                    Preencha o formulário acima e anexe seu documento sanitário para que o Administrador possa analisar e liberar seu acesso.
                  </p>
                </div>
              ) : (
                <div className="admin-docs-grid">
                  {sentDocs.map((doc, idx) => (
                    <div key={doc.id || idx} className="admin-doc-item">
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
                              Nota enviada: &ldquo;{doc.chefNote}&rdquo;
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="admin-status-badge pending" style={{ fontSize: 11 }}>
                        Enviado em{" "}
                        {doc.createdAt
                          ? new Date(doc.createdAt).toLocaleDateString("pt-BR")
                          : "Hoje"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // TELA DEDICADA DE ACESSO / CREDENCIAMENTO DO CHEF (QUANDO NÃO AUTENTICADO)
  if (!isChefOrAdmin) {
    return (
      <div className="chef-page-layout">
        {/* Top Navbar */}
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
                  <span className="chef-page-portal-title">Portal do Chef</span>
                  <span className="chef-page-portal-sub">Acesso para Cozinhas & Parceiros GastroMatch</span>
                </div>
              </div>
            </div>

            <div className="chef-navbar-user-controls">
              <span className="chef-badge-pill-light verified">
                <Icon name="shieldCheck" size={13} /> <span>Vigilância Sanitária</span>
              </span>
            </div>
          </div>
        </header>

        <main className="chef-page-main">
          <div className="container chef-access-max">
            {/* Header Hero da Tela */}
            <div className="chef-access-hero-card">
              <span className="chef-badge-pill-light live">
                <span className="live-dot"></span> Programa de Homologação Gastronômica
              </span>
              <h1>Área do Chef & Credenciamento de Restaurante</h1>
              <p>
                Publique suas receitas autorais, ministre videoaulas didáticas e entregue
                kits de ingredientes frescos e porcionados diretamente aos clientes.
              </p>
            </div>

            {/* Abas na Própria Tela: Login ou Credenciamento (SEM NENHUM MODAL) */}
            <div className="chef-access-body-card">
              <div className="chef-access-tab-headers">
                <button
                  type="button"
                  className={`access-tab-toggle ${accessTab === "login" ? "active" : ""}`}
                  onClick={() => setAccessTab("login")}
                >
                  <Icon name="chef" size={17} /> Já sou Chef Parceiro (Login)
                </button>
                <button
                  type="button"
                  className={`access-tab-toggle ${accessTab === "register" ? "active" : ""}`}
                  onClick={() => setAccessTab("register")}
                >
                  <Icon name="fileText" size={17} /> Credenciar Novo Estabelecimento (Homologação)
                </button>
              </div>

              {loginError && <div className="page-alert error">{loginError}</div>}

              {accessTab === "login" && (
                <form onSubmit={handleChefLogin} className="chef-screen-form">
                  <div className="form-field">
                    <span>E-mail do Chef / Restaurante *</span>
                    <input
                      type="email"
                      required
                      placeholder="ex: seuemail@restaurante.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-field">
                    <span>Senha de Acesso *</span>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
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
                      {loginLoading ? "Autenticando..." : "Acessar Meu Painel"}
                    </button>
                  </div>
                </form>
              )}

              {accessTab === "register" && !regSubmitted && (
                <form onSubmit={handleChefRegister} className="chef-screen-form">
                  <div className="form-grid-2">
                    <div className="form-field">
                      <span>Nome Completo / Responsável Técnico *</span>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Chef Carlos Alberto"
                        value={regForm.name}
                        onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      />
                    </div>
                    <div className="form-field">
                      <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <span>CNPJ do Estabelecimento *</span>
                        <button
                          type="button"
                          onClick={() => setRegForm({ ...regForm, cnpj: generateValidCnpj() })}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            fontSize: "11.5px",
                            fontWeight: 700,
                            color: "#ea580c",
                            cursor: "pointer",
                            textDecoration: "underline"
                          }}
                        >
                          Gerar CNPJ válido
                        </button>
                      </span>
                      <input
                        type="text"
                        required
                        maxLength={18}
                        placeholder="00.000.000/0001-00"
                        value={regForm.cnpj}
                        onChange={(e) => setRegForm({ ...regForm, cnpj: formatCnpj(e.target.value) })}
                      />
                      {regForm.cnpj.replace(/\D/g, "").length > 0 && (
                        <small
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: isValidCnpj(regForm.cnpj) ? "#15803d" : "#dc2626",
                            marginTop: "4px",
                            display: "block"
                          }}
                        >
                          {isValidCnpj(regForm.cnpj)
                            ? "✓ CNPJ válido verificado"
                            : regForm.cnpj.replace(/\D/g, "").length < 14
                            ? `Digite os 14 dígitos (${regForm.cnpj.replace(/\D/g, "").length}/14)`
                            : "✗ CNPJ inválido (dígitos verificadores incorretos)"}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field">
                      <span>E-mail de Acesso do Chef *</span>
                      <input
                        type="email"
                        required
                        placeholder="Ex: chef@restaurante.com"
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      />
                      {regForm.email.trim().length > 0 && (
                        <small
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: isValidEmail(regForm.email) ? "#15803d" : "#dc2626",
                            marginTop: "4px",
                            display: "block"
                          }}
                        >
                          {isValidEmail(regForm.email)
                            ? "✓ Formato de e-mail válido"
                            : "✗ Informe um e-mail válido (ex: chef@restaurante.com)"}
                        </small>
                      )}
                    </div>
                    <div className="form-field">
                      <span>Senha de Acesso (mín. 6 dígitos) *</span>
                      <input
                        type="password"
                        minLength={6}
                        required
                        placeholder="••••••••"
                        value={regForm.password}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field">
                      <span>Nome Fantasia do Restaurante *</span>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Trattoria del Chef"
                        value={regForm.restaurant}
                        onChange={(e) => setRegForm({ ...regForm, restaurant: e.target.value })}
                      />
                    </div>
                    <div className="form-field">
                      <span>Cidade e Estado *</span>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Florianópolis - SC"
                        value={regForm.city}
                        onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <span>Documento de Conformidade Sanitária *</span>
                    <select
                      value={regForm.docType}
                      onChange={(e) => setRegForm({ ...regForm, docType: e.target.value })}
                    >
                      <option>Alvará Sanitário Vigente (Vigilância Municipal)</option>
                      <option>Licença da Vigilância Sanitária Municipal</option>
                      <option>Certificado de Boas Práticas de Manipulação de Alimentos</option>
                    </select>
                  </div>

                  <div className="form-upload-area">
                    <Icon name="fileText" size={26} />
                    <div className="upload-texts">
                      <strong>Cópia Digital do Alvará Sanitário / CNPJ</strong>
                      <p>
                        {regForm.fileName
                          ? `Arquivo anexado: ${regForm.fileName}`
                          : "Formatos aceitos: PDF, JPG ou PNG (tamanho máximo: 10MB)"}
                      </p>
                    </div>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleDocFileChange} />
                  </div>

                  <label className="checkbox-confirm-row">
                    <input
                      type="checkbox"
                      required
                      checked={regForm.termsAccepted}
                      onChange={(e) => setRegForm({ ...regForm, termsAccepted: e.target.checked })}
                    />
                    <span>
                      Declaro conformidade com as normas sanitárias vigentes (ANVISA/CVS) e aceito os Termos de Parceria GastroMatch.
                    </span>
                  </label>

                  <div className="form-submit-row">
                    <button type="submit" className="button button-orange button-large button-full">
                      Enviar Credenciais para Homologação
                    </button>
                  </div>
                </form>
              )}

              {accessTab === "register" && regSubmitted && (
                <div className="reg-success-box">
                  <div className="reg-success-icon">
                    <Icon name="shieldCheck" size={44} />
                  </div>
                  <h3>Credenciais e Documentos Enviados com Sucesso!</h3>
                  <p>
                    A solicitação do estabelecimento <strong>{regForm.restaurant || "seu restaurante"}</strong> e o documento{" "}
                    <strong>{regForm.docType}</strong> foram encaminhados para o <strong>Painel do Administrador</strong> com status <strong>PENDENTE</strong>.
                  </p>
                  <p style={{ fontSize: 13, color: "#92400e", background: "#fffbeb", border: "1px solid #f59e0b", padding: "10px 14px", borderRadius: 10, maxWidth: 520, margin: "8px auto" }}>
                    ⏳ <strong>Atenção:</strong> Seu login como Chef só será liberado após o Administrador aceitar seu cadastro no Painel do Administrador.
                  </p>
                  <div className="reg-success-cta-box" style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
                    <span>Você pode abrir o Painel do Administrador agora para aprovar este cadastro:</span>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                      {onOpenAdminDashboard && (
                        <button
                          type="button"
                          className="button button-orange"
                          onClick={onOpenAdminDashboard}
                        >
                          <Icon name="shieldCheck" size={16} /> Abrir Painel do Admin (Aprovar Documento)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const chefName = user?.chef?.displayName || user?.name || "Chef Parceiro";
  const restaurantName = user?.chef?.restaurant || "GastroMatch Kitchen";

  // Calculate Metrics
  const totalSales = orders.reduce((acc, o) => acc + (o.status === "PAID" ? Number(o.total || 0) : 0), 0);
  const totalOrdersCount = orders.length;
  const activeRecipesCount = recipes.length;
  const kitsActiveCount = recipes.filter((r) => r.hasKit).length;

  return (
    <div className="chef-page-layout">
      {/* Top Navbar Dedicada da Tela do Chef */}
      <header className="chef-page-navbar">
        <div className="container chef-navbar-inner">
          <div className="chef-navbar-brand-row">
            <button className="back-store-button" onClick={onBackToStore} title="Voltar à Vitrine">
              <Icon name="arrowLeft" size={17} /> <span>Voltar à Vitrine</span>
            </button>
            <div className="brand-divider"></div>
            <div className="chef-brand-identity">
              <img className="brand-mark-mini" src="/gastromatch-icon.png" alt="GastroMatch" />
              <div className="chef-brand-text-col">
                <span className="chef-page-portal-title">Portal do Chef</span>
                <span className="chef-page-portal-sub">Painel de Gestão Culinária & Vendas</span>
              </div>
            </div>
          </div>

          <div className="chef-navbar-user-controls">
            <div className="chef-header-profile-tag">
              <div className="chef-avatar-small">
                <Icon name="chef" size={18} />
              </div>
              <div className="chef-header-texts">
                <strong>{restaurantName}</strong>
                <span>{chefName}</span>
              </div>
            </div>
            <button className="button button-small button-outline chef-exit-btn" onClick={logout} title="Sair do painel do chef">
              <Icon name="x" size={14} /> <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal da Tela */}
      <main className="chef-page-main">
        <div className="container">
          {/* Card de Perfil & Status do Restaurante */}
          <section className="chef-profile-card">
            <div className="chef-profile-left">
              <div className="chef-profile-avatar-box">
                <Icon name="chef" size={32} />
              </div>
              <div className="chef-profile-info">
                <div className="chef-badges-row">
                  <span className="chef-badge-pill-light verified">
                    <Icon name="shieldCheck" size={14} /> Restaurante Homologado
                  </span>
                  <span className="chef-badge-pill-light live">
                    <span className="live-dot"></span> Cozinha Operacional
                  </span>
                </div>
                <h1 className="chef-profile-title">{restaurantName}</h1>
                <div className="chef-profile-meta">
                  <span>Chef Responsável: <strong>{chefName}</strong></span>
                  <span className="meta-bullet">•</span>
                  <span>E-mail: <strong>{user?.email}</strong></span>
                </div>
              </div>
            </div>

            {/* Resumo Rápido de Indicadores */}
            <div className="chef-quick-kpis">
              <div className="kpi-mini-card">
                <span className="kpi-mini-label">Receitas Ativas</span>
                <strong className="kpi-mini-value">{recipes.length}</strong>
              </div>
              <div className="kpi-mini-divider"></div>
              <div className="kpi-mini-card">
                <span className="kpi-mini-label">Kits Físicos</span>
                <strong className="kpi-mini-value">{kitsActiveCount}</strong>
              </div>
              <div className="kpi-mini-divider"></div>
              <div className="kpi-mini-card">
                <span className="kpi-mini-label">Vendas Totais</span>
                <strong className="kpi-mini-value orange">R$ {formatPrice(totalSales)}</strong>
              </div>
            </div>
          </section>

          {/* Barra de Navegação por Abas (Segmented Control Moderno) */}
          <nav className="chef-segmented-nav" aria-label="Navegação do Painel">
            <button
              type="button"
              className={`nav-tab-pill ${activeTab === "recipes" ? "active" : ""}`}
              onClick={() => setActiveTab("recipes")}
            >
              <Icon name="book" size={17} />
              <span>Minhas Receitas & Kits</span>
              <span className="tab-badge">{recipes.length}</span>
            </button>
            <button
              type="button"
              className={`nav-tab-pill tab-cta ${activeTab === "new" ? "active" : ""}`}
              onClick={() => setActiveTab("new")}
            >
              <Icon name="plus" size={17} />
              <span>Cadastrar Nova Receita & Kit</span>
            </button>
            <button
              type="button"
              className={`nav-tab-pill ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              <Icon name="bag" size={17} />
              <span>Vendas & Pedidos</span>
              <span className="tab-badge">{orders.length}</span>
            </button>
            <button
              type="button"
              className={`nav-tab-pill ${activeTab === "metrics" ? "active" : ""}`}
              onClick={() => setActiveTab("metrics")}
            >
              <Icon name="barChart" size={17} />
              <span>Métricas & Faturamento</span>
            </button>
          </nav>

          {/* Notificações e Alertas */}
          {feedbackMsg && <div className="page-alert success">{feedbackMsg}</div>}
          {errorMsg && <div className="page-alert error">{errorMsg}</div>}

          {/* ABA 1: MINHAS RECEITAS & KITS */}
          {activeTab === "recipes" && (
            <section className="page-section-container">
              <div className="section-header-row">
                <div>
                  <h2>Seu Catálogo Ativo no GastroMatch</h2>
                  <p>Gerencie receitas digitais e kits físicos de ingredientes disponíveis para compra.</p>
                </div>
                <button className="button button-orange" onClick={() => setActiveTab("new")}>
                  <Icon name="plus" size={16} /> Cadastrar Nova Receita
                </button>
              </div>

              {loading ? (
                <div className="page-loading-box">Carregando catálogo do chef...</div>
              ) : recipes.length === 0 ? (
                <div className="page-empty-box">
                  <Icon name="book" size={48} />
                  <h3>Você ainda não possui receitas publicadas</h3>
                  <p>Comece agora mesmo a compartilhar suas receitas e monetizar kits de ingredientes.</p>
                  <button className="button button-orange" onClick={() => setActiveTab("new")}>
                    Criar Minha Primeira Receita
                  </button>
                </div>
              ) : (
                <div className="chef-page-recipes-grid">
                  {recipes.map((r) => (
                    <div key={r.id} className="chef-page-card">
                      <div className="card-image-box">
                        <img
                          src={r.imageUrl || "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=600&q=80"}
                          alt={r.title}
                        />
                        <span className="card-cat-badge">{r.category?.name || "Gourmet"}</span>
                      </div>

                      <div className="card-body-box">
                        <div className="card-diff-tag">{r.difficulty} • {r.prepTime} min</div>
                        <h3>{r.title}</h3>
                        <p className="card-desc-snippet">{r.description}</p>

                        <div className="card-financial-box">
                          <div className="financial-row">
                            <span>Acesso Digital:</span>
                            <strong>R$ {formatPrice(r.price)}</strong>
                          </div>

                          {r.hasKit ? (
                            <div className="card-kit-highlight">
                              <div className="kit-highlight-title">
                                <Icon name="box" size={15} /> Kit de Ingredientes Ativo
                              </div>
                              <div className="kit-price-row">
                                <span className="kit-value">R$ {formatPrice(r.kitPrice)}</span>
                                <span className="kit-inventory">({r.kitStock} un. em estoque)</span>
                              </div>
                            </div>
                          ) : (
                            <div className="card-kit-disabled">
                              <span>Venda de Kit físico desabilitada</span>
                            </div>
                          )}
                        </div>

                        <div className="card-footer-actions">
                          <button
                            type="button"
                            className="button button-small button-outline edit-btn"
                            onClick={() => handleStartEdit(r)}
                          >
                            <Icon name="fileText" size={14} /> Editar
                          </button>
                          <button
                            type="button"
                            className="button button-small button-outline remove-btn"
                            onClick={() => handleDeleteRecipe(r.id)}
                          >
                            <Icon name="trash" size={14} /> Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ABA 2: PUBLICAR NOVA RECEITA & KIT */}
          {activeTab === "new" && (
            <section className="page-section-container">
              <div className="section-header-row">
                <div>
                  <h2>{editingRecipeId ? "Editar Receita & Kit" : "Publicar Receita & Disponibilizar Kit Físico"}</h2>
                  <p>
                    {editingRecipeId
                      ? "Atualize as informações, insumos do kit e modo de preparo desta receita."
                      : "Preencha os detalhes do prato, ingredientes e configure a venda de insumos para os clientes."}
                  </p>
                </div>
                {editingRecipeId && (
                  <button
                    type="button"
                    className="button button-small button-outline cancel-edit-btn"
                    onClick={handleCancelEdit}
                  >
                    <Icon name="x" size={14} /> Cancelar Edição
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmitRecipe} className="chef-page-form">
                {/* Bloco 1: Informações Gerais */}
                <div className="form-card-panel">
                  <h3>1. Detalhes Gerais da Receita</h3>
                  <div className="form-grid-2">
                    <label className="form-field">
                      <span>Título do Prato *</span>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Pappardelle ao Ragu de Cordeiro com Ervas Finas"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                      />
                    </label>

                    <label className="form-field">
                      <span>Categoria Gastronômica *</span>
                      <select
                        value={form.categoryId}
                        onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="form-field">
                    <span>Descrição Completa e História do Prato *</span>
                    <input
                      type="text"
                      required
                      placeholder="Explique o conceito, os diferenciais de sabor e a inspiração deste prato."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </label>

                  <div className="form-grid-4">
                    <label className="form-field">
                      <span>Tempo de Preparo (min) *</span>
                      <input
                        type="number"
                        min="5"
                        required
                        value={form.prepTime}
                        onChange={(e) => setForm({ ...form, prepTime: e.target.value })}
                      />
                    </label>

                    <label className="form-field">
                      <span>Rendimento (Porções) *</span>
                      <input
                        type="number"
                        min="1"
                        required
                        value={form.servings}
                        onChange={(e) => setForm({ ...form, servings: e.target.value })}
                      />
                    </label>

                    <label className="form-field">
                      <span>Nível de Dificuldade *</span>
                      <select
                        value={form.difficulty}
                        onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                      >
                        <option value="EASY">Fácil (Iniciante)</option>
                        <option value="MEDIUM">Médio (Intermediário)</option>
                        <option value="HARD">Difícil (Avançado)</option>
                      </select>
                    </label>

                    <label className="form-field">
                      <span>Preço Digital (R$) *</span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                      />
                    </label>
                  </div>

                  <div className="form-grid-2">
                    <label className="form-field">
                      <span>URL da Fotografia em Alta Definição</span>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={form.imageUrl}
                        onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      />
                    </label>

                    <label className="form-field">
                      <span>Link da Videoaula Didática (YouTube / Vimeo)</span>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={form.videoUrl}
                        onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                      />
                    </label>
                  </div>

                  <label className="form-field">
                    <span>Modo de Preparo Passo a Passo *</span>
                    <textarea
                      rows="5"
                      required
                      placeholder="1. Higienize e porcione os ingredientes.\n2. Inicie o refogado em fogo brando com o azeite aromatizado...\n3. Adicione o molho e reduza até adquirir ponto cremoso."
                      value={form.instructions}
                      onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                    />
                  </label>
                </div>

                {/* Bloco 2: Ingredientes */}
                <div className="form-card-panel">
                  <h3>2. Lista de Ingredientes & Medidas</h3>
                  <p className="panel-sub">Adicione todos os insumos que compõem o prato e suas respectivas proporções.</p>

                  <div className="page-add-ingredient-row">
                    <input
                      type="text"
                      placeholder="Nome do Insumo (ex: Vinho Tinto Seco Sangiovese)"
                      value={newIngName}
                      onChange={(e) => setNewIngName(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Quantidade (ex: 150ml)"
                      value={newIngQty}
                      onChange={(e) => setNewIngQty(e.target.value)}
                    />
                    <button
                      type="button"
                      className="button button-orange"
                      onClick={handleAddIngredient}
                    >
                      + Incluir Ingrediente
                    </button>
                  </div>

                  <div className="page-ingredient-chips">
                    {ingredientsList.map((ing, idx) => (
                      <span key={idx} className="ingredient-chip">
                        <strong>{ing.name}</strong> — {ing.quantity}
                        <button type="button" onClick={() => handleRemoveIngredient(idx)}>
                          <Icon name="x" size={13} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bloco 3: Kit Físico de Ingredientes à Venda */}
                <div className="form-card-panel kit-config-card">
                  <div className="kit-config-top">
                    <div>
                      <span className="kit-kicker-tag"><Icon name="box" size={14} /> Oportunidade de Monetização</span>
                      <h3>3. Venda de Kit de Ingredientes Físico</h3>
                      <p>Envie os ingredientes porcionados na medida certa para o cliente preparar este prato em casa.</p>
                    </div>

                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={form.hasKit}
                        onChange={(e) => setForm({ ...form, hasKit: e.target.checked })}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  {form.hasKit && (
                    <div className="kit-config-body">
                      <div className="form-grid-2">
                        <label className="form-field">
                          <span>Preço de Venda do Kit Físico (R$) *</span>
                          <input
                            type="number"
                            step="0.01"
                            required={form.hasKit}
                            value={form.kitPrice}
                            onChange={(e) => setForm({ ...form, kitPrice: e.target.value })}
                          />
                        </label>

                        <label className="form-field">
                          <span>Quantidade em Estoque (Unidades) *</span>
                          <input
                            type="number"
                            min="1"
                            required={form.hasKit}
                            value={form.kitStock}
                            onChange={(e) => setForm({ ...form, kitStock: e.target.value })}
                          />
                        </label>
                      </div>

                      <label className="form-field">
                        <span>O que está incluso no Kit? *</span>
                        <textarea
                          rows="3"
                          required={form.hasKit}
                          placeholder="Ex: Insumos embalados a vácuo, temperos secos porcionados, manteiga aromatizada e guia passo a passo impresso."
                          value={form.kitDescription}
                          onChange={(e) => setForm({ ...form, kitDescription: e.target.value })}
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Botão de Envio */}
                <div className="form-actions-submit">
                  <button
                    type="submit"
                    disabled={loading}
                    className="button button-orange button-large"
                  >
                    <Icon name="check" size={20} />{" "}
                    {loading
                      ? "Salvando..."
                      : editingRecipeId
                      ? "Salvar Alterações da Receita"
                      : "Publicar no Catálogo & Disponibilizar Kit"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* ABA 3: VENDAS & PEDIDOS */}
          {activeTab === "orders" && (
            <section className="page-section-container">
              <div className="section-header-row">
                <div>
                  <h2>Histórico de Vendas & Pedidos de Kits</h2>
                  <p>Acompanhe todos os pedidos realizados pelos consumidores para o seu restaurante.</p>
                </div>
                <span className="orders-total-badge">{orders.length} pedidos no total</span>
              </div>

              {orders.length === 0 ? (
                <div className="page-empty-box">
                  <Icon name="bag" size={48} />
                  <h3>Nenhum pedido registrado</h3>
                  <p>Assim que os clientes realizarem compras de suas receitas e kits, eles aparecerão aqui em tempo real.</p>
                </div>
              ) : (
                <div className="page-table-wrapper">
                  <table className="chef-full-table">
                    <thead>
                      <tr>
                        <th>Nº Pedido</th>
                        <th>Data</th>
                        <th>Itens e Kits Comprados</th>
                        <th>Valor Total</th>
                        <th>Forma de Pagamento</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((ord) => (
                        <tr key={ord.id}>
                          <td><strong>#{ord.id}</strong></td>
                          <td>{new Date(ord.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                          <td>
                            {ord.items?.map((it, i) => (
                              <div key={i} className="table-item-line">
                                <strong>{it.quantity}x</strong> {it.recipe?.title || `Receita #${it.recipeId}`}
                              </div>
                            ))}
                          </td>
                          <td><strong className="table-price">R$ {formatPrice(ord.total)}</strong></td>
                          <td>PIX / Digital</td>
                          <td>
                            <span className={`table-status-pill ${ord.status.toLowerCase()}`}>
                              {ord.status === "PAID" ? "Pagamento Confirmado ✓" : "Aguardando Pagamento"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* ABA 4: MÉTRICAS & FATURAMENTO */}
          {activeTab === "metrics" && (
            <section className="page-section-container">
              <div className="section-header-row">
                <div>
                  <h2>Indicadores e Desempenho do Restaurante</h2>
                  <p>Resultados acumulados de vendas digitais e entrega de kits de insumos.</p>
                </div>
              </div>

              <div className="page-metrics-grid">
                <div className="metric-panel orange">
                  <div className="metric-icon-bubble">
                    <Icon name="bag" size={28} />
                  </div>
                  <div className="metric-data">
                    <span className="metric-label">Faturamento Total Confirmado</span>
                    <h3 className="metric-number">R$ {formatPrice(totalSales)}</h3>
                    <small>Proveniente de pedidos compensados via PIX/Cartão</small>
                  </div>
                </div>

                <div className="metric-panel green">
                  <div className="metric-icon-bubble">
                    <Icon name="check" size={28} />
                  </div>
                  <div className="metric-data">
                    <span className="metric-label">Pedidos Concluídos</span>
                    <h3 className="metric-number">{totalOrdersCount}</h3>
                    <small>Fluxo de vendas integrado de ponta a ponta</small>
                  </div>
                </div>

                <div className="metric-panel blue">
                  <div className="metric-icon-bubble">
                    <Icon name="book" size={28} />
                  </div>
                  <div className="metric-data">
                    <span className="metric-label">Receitas Publicadas</span>
                    <h3 className="metric-number">{activeRecipesCount}</h3>
                    <small>Disponíveis para o público no GastroMatch</small>
                  </div>
                </div>

                <div className="metric-panel purple">
                  <div className="metric-icon-bubble">
                    <Icon name="box" size={28} />
                  </div>
                  <div className="metric-data">
                    <span className="metric-label">Kits de Ingredientes à Venda</span>
                    <h3 className="metric-number">{kitsActiveCount}</h3>
                    <small>Opções com entrega física habilitada</small>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
