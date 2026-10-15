import { useState, useEffect } from "react";
import Icon from "./Icon";
import { api } from "../services/api";
import { useAuth } from "../services/AuthContext";

function formatPrice(val) {
  if (val === undefined || val === null) return "0,00";
  return Number(val).toFixed(2).replace(".", ",");
}

export default function ChefDashboardPage({ onBackToStore, onRecipeCreated }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("recipes"); // recipes, new, orders, metrics
  const [recipes, setRecipes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

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
    loadData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

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
    setIngredientsList((prev) => [
      ...prev,
      { name: newIngName.trim(), quantity: newIngQty.trim() || "a gosto" }
    ]);
    setNewIngName("");
    setNewIngQty("");
  }

  function handleRemoveIngredient(index) {
    setIngredientsList((prev) => prev.filter((_, idx) => idx !== index));
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

      await api.createRecipe(payload);
      setFeedbackMsg("Receita e Kit de Ingredientes publicados com sucesso no catálogo!");
      
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
      setErrorMsg(err.message || "Erro ao publicar receita.");
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
    } catch (err) {
      alert("Erro ao excluir receita: " + err.message);
    }
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
            <button className="back-store-button" onClick={onBackToStore}>
              <Icon name="arrowLeft" size={17} /> Voltar para a Loja
            </button>
            <div className="brand-divider"></div>
            <div className="chef-brand-identity">
              <span className="brand-mark-mini">GM</span>
              <span className="chef-page-portal-title">Painel do Chef & Restaurante</span>
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
            <button className="button button-small button-outline" onClick={logout}>
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal da Tela */}
      <main className="chef-page-main">
        <div className="container">
          {/* Hero Banner do Restaurante */}
          <section className="chef-banner-card">
            <div className="chef-banner-content">
              <div className="chef-banner-title-group">
                <span className="chef-badge-pill">
                  <Icon name="shieldCheck" size={14} /> Restaurante Homologado & Certificação Sanitária
                </span>
                <h1>{restaurantName}</h1>
                <p className="chef-banner-desc">
                  Chef Responsável: <strong>{chefName}</strong> | E-mail: <strong>{user?.email}</strong>
                </p>
              </div>
              <div className="chef-banner-actions">
                <button
                  className={`chef-cta-tab ${activeTab === "new" ? "active" : ""}`}
                  onClick={() => setActiveTab("new")}
                >
                  <Icon name="plus" size={18} /> Publicar Receita & Kit
                </button>
              </div>
            </div>

            {/* Menu de Abas da Página */}
            <div className="chef-page-tabs">
              <button
                className={`page-tab-item ${activeTab === "recipes" ? "active" : ""}`}
                onClick={() => setActiveTab("recipes")}
              >
                <Icon name="book" size={18} /> Minhas Receitas & Kits ({recipes.length})
              </button>
              <button
                className={`page-tab-item ${activeTab === "new" ? "active" : ""}`}
                onClick={() => setActiveTab("new")}
              >
                <Icon name="plus" size={18} /> Nova Receita & Kit
              </button>
              <button
                className={`page-tab-item ${activeTab === "orders" ? "active" : ""}`}
                onClick={() => setActiveTab("orders")}
              >
                <Icon name="bag" size={18} /> Vendas & Pedidos ({orders.length})
              </button>
              <button
                className={`page-tab-item ${activeTab === "metrics" ? "active" : ""}`}
                onClick={() => setActiveTab("metrics")}
              >
                <Icon name="barChart" size={18} /> Métricas & Faturamento
              </button>
            </div>
          </section>

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
                  <h2>Publicar Receita & Disponibilizar Kit Físico</h2>
                  <p>Preencha os detalhes do prato, ingredientes e configure a venda de insumos para os clientes.</p>
                </div>
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
                    <Icon name="check" size={20} /> {loading ? "Salvando..." : "Publicar no Catálogo & Disponibilizar Kit"}
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
