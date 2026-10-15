import { useState, useEffect } from "react";
import Icon from "./Icon";
import { api } from "../services/api";
import { useAuth } from "../services/AuthContext";

function formatPrice(val) {
  if (val === undefined || val === null) return "0,00";
  return Number(val).toFixed(2).replace(".", ",");
}

export default function ChefDashboardModal({ isOpen, onClose, onRecipeCreated }) {
  const { user } = useAuth();
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
    { name: "Molho da casa", quantity: "200ml" },
    { name: "Queijo ralado artesanal", quantity: "50g" }
  ]);
  const [newIngName, setNewIngName] = useState("");
  const [newIngQty, setNewIngQty] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

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
      setErrorMsg("Preencha título, descrição e modo de preparo.");
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
      setFeedbackMsg("Receita e Kit cadastrados com sucesso no catálogo!");
      
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
    if (!confirm("Tem certeza que deseja remover esta receita?")) return;
    try {
      await api.deleteRecipe(id);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      if (onRecipeCreated) onRecipeCreated();
    } catch (err) {
      alert("Erro ao excluir receita: " + err.message);
    }
  }

  if (!isOpen) return null;

  const chefName = user?.chef?.displayName || user?.name || "Chef Parceiro";
  const restaurantName = user?.chef?.restaurant || "GastroMatch Kitchen";

  // Calculate Metrics
  const totalSales = orders.reduce((acc, o) => acc + (o.status === "PAID" ? Number(o.total || 0) : 0), 0);
  const totalOrdersCount = orders.length;
  const activeRecipesCount = recipes.length;
  const kitsActiveCount = recipes.filter((r) => r.hasKit).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content chef-dashboard-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dashboard-header">
          <div className="chef-info-block">
            <div className="chef-avatar-badge">
              <Icon name="chef" size={24} />
            </div>
            <div>
              <div className="restaurant-badge-title">
                <h2>{restaurantName}</h2>
                <span className="verified-pill">
                  <Icon name="shieldCheck" size={13} /> Sanitário & Jurídico Verificado
                </span>
              </div>
              <p className="chef-sub">Responsável Técnico: <strong>{chefName}</strong> ({user?.email})</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">
            <Icon name="x" size={22} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === "recipes" ? "active" : ""}`}
            onClick={() => setActiveTab("recipes")}
          >
            <Icon name="book" size={16} /> Minhas Receitas & Kits ({recipes.length})
          </button>
          <button
            className={`tab-btn tab-btn-highlight ${activeTab === "new" ? "active" : ""}`}
            onClick={() => setActiveTab("new")}
          >
            <Icon name="plus" size={16} /> Nova Receita & Kit
          </button>
          <button
            className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <Icon name="bag" size={16} /> Vendas & Pedidos ({orders.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "metrics" ? "active" : ""}`}
            onClick={() => setActiveTab("metrics")}
          >
            <Icon name="star" size={16} /> Métricas
          </button>
        </div>

        {/* Feedback alerts */}
        {feedbackMsg && <div className="dashboard-alert success">{feedbackMsg}</div>}
        {errorMsg && <div className="dashboard-alert error">{errorMsg}</div>}

        {/* TAB 1: LIST RECIPES & KITS */}
        {activeTab === "recipes" && (
          <div className="dashboard-tab-content">
            <div className="tab-heading-row">
              <h3>Catálogo de Receitas e Kits de Ingredientes</h3>
              <button className="button button-small button-orange" onClick={() => setActiveTab("new")}>
                + Adicionar Nova Receita
              </button>
            </div>

            {loading ? (
              <p className="loading-state">Carregando receitas...</p>
            ) : recipes.length === 0 ? (
              <div className="empty-state">
                <Icon name="book" size={36} />
                <p>Você ainda não publicou nenhuma receita autoral.</p>
                <button className="button button-orange" onClick={() => setActiveTab("new")}>
                  Publicar Primeira Receita & Kit
                </button>
              </div>
            ) : (
              <div className="chef-recipes-grid">
                {recipes.map((r) => (
                  <div key={r.id} className="chef-recipe-card">
                    <img
                      src={r.imageUrl || "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=400&q=80"}
                      alt={r.title}
                    />
                    <div className="chef-recipe-info">
                      <div className="recipe-tag-row">
                        <span className="category-pill">{r.category?.name || "Gourmet"}</span>
                        <span className="diff-pill">{r.difficulty}</span>
                      </div>
                      <h4>{r.title}</h4>
                      <p className="recipe-desc-snippet">{r.description}</p>

                      <div className="pricing-box">
                        <div className="price-line">
                          <span>Acesso Digital:</span>
                          <strong>R$ {formatPrice(r.price)}</strong>
                        </div>
                        {r.hasKit ? (
                          <div className="kit-badge-box">
                            <span className="kit-icon-label">
                              <Icon name="bag" size={13} /> Kit Físico à Venda:
                            </span>
                            <strong className="kit-price">R$ {formatPrice(r.kitPrice)}</strong>
                            <small className="kit-stock">({r.kitStock} em estoque)</small>
                          </div>
                        ) : (
                          <div className="kit-badge-box disabled">
                            <span>Kit físico não habilitado</span>
                          </div>
                        )}
                      </div>

                      <div className="recipe-actions">
                        <button
                          className="button button-outline button-small remove-recipe-btn"
                          onClick={() => handleDeleteRecipe(r.id)}
                          title="Remover receita"
                        >
                          <Icon name="trash" size={14} /> Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PUBLISH NEW RECIPE & KIT */}
        {activeTab === "new" && (
          <div className="dashboard-tab-content">
            <form onSubmit={handleSubmitRecipe} className="chef-form">
              <div className="form-section-title">
                <h4>1. Informações Básicas da Receita</h4>
                <p>Detalhes do prato que serão exibidos aos clientes.</p>
              </div>

              <div className="form-row">
                <label className="form-group flex-2">
                  <span>Título da Receita *</span>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pappardelle ao Ragu de Cordeiro"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </label>

                <label className="form-group flex-1">
                  <span>Categoria *</span>
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

              <label className="form-group">
                <span>Descrição Sucinta *</span>
                <input
                  type="text"
                  required
                  placeholder="Breve história do prato e notas de sabor"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </label>

              <div className="form-row">
                <label className="form-group">
                  <span>Tempo de Preparo (min) *</span>
                  <input
                    type="number"
                    min="5"
                    required
                    value={form.prepTime}
                    onChange={(e) => setForm({ ...form, prepTime: e.target.value })}
                  />
                </label>

                <label className="form-group">
                  <span>Rendimento (porções) *</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.servings}
                    onChange={(e) => setForm({ ...form, servings: e.target.value })}
                  />
                </label>

                <label className="form-group">
                  <span>Dificuldade *</span>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  >
                    <option value="EASY">Fácil</option>
                    <option value="MEDIUM">Médio</option>
                    <option value="HARD">Difícil</option>
                  </select>
                </label>

                <label className="form-group">
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

              <div className="form-row">
                <label className="form-group flex-1">
                  <span>URL da Imagem de Capa</span>
                  <input
                    type="url"
                    placeholder="https://exemplo.com/foto.jpg"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  />
                </label>

                <label className="form-group flex-1">
                  <span>URL da Videoaula HD (YouTube / Vimeo)</span>
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  />
                </label>
              </div>

              <label className="form-group">
                <span>Modo de Preparo Passo a Passo *</span>
                <textarea
                  rows="4"
                  required
                  placeholder="1. Refogue os temperos...\n2. Adicione a massa cozida..."
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                />
              </label>

              {/* SEÇÃO 2: INGREDIENTES */}
              <div className="form-section-title">
                <h4>2. Lista de Ingredientes</h4>
                <p>Adicione os insumos necessários para reproduzir a receita.</p>
              </div>

              <div className="add-ingredient-box">
                <input
                  type="text"
                  placeholder="Nome do Ingrediente (ex: Vinho Tinto Seco)"
                  value={newIngName}
                  onChange={(e) => setNewIngName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Qtd (ex: 150ml)"
                  value={newIngQty}
                  onChange={(e) => setNewIngQty(e.target.value)}
                />
                <button
                  type="button"
                  className="button button-small button-orange"
                  onClick={handleAddIngredient}
                >
                  + Adicionar
                </button>
              </div>

              <div className="ingredients-tags">
                {ingredientsList.map((ing, idx) => (
                  <span key={idx} className="ingredient-tag">
                    {ing.name} ({ing.quantity})
                    <button type="button" onClick={() => handleRemoveIngredient(idx)}>
                      &times;
                    </button>
                  </span>
                ))}
              </div>

              {/* SEÇÃO 3: KIT DE INGREDIENTES FÍSICO */}
              <div className="form-section-title kit-section-highlight">
                <div className="kit-toggle-header">
                  <div>
                    <h4>3. Venda do Kit de Ingredientes Físico</h4>
                    <p>Permita que o cliente compre os ingredientes porcionados para receber em casa.</p>
                  </div>
                  <label className="switch-label">
                    <input
                      type="checkbox"
                      checked={form.hasKit}
                      onChange={(e) => setForm({ ...form, hasKit: e.target.checked })}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                {form.hasKit && (
                  <div className="kit-fields-expanded">
                    <div className="form-row">
                      <label className="form-group flex-1">
                        <span>Preço do Kit de Ingredientes (R$) *</span>
                        <input
                          type="number"
                          step="0.01"
                          required={form.hasKit}
                          value={form.kitPrice}
                          onChange={(e) => setForm({ ...form, kitPrice: e.target.value })}
                        />
                      </label>

                      <label className="form-group flex-1">
                        <span>Kits em Estoque *</span>
                        <input
                          type="number"
                          min="1"
                          required={form.hasKit}
                          value={form.kitStock}
                          onChange={(e) => setForm({ ...form, kitStock: e.target.value })}
                        />
                      </label>
                    </div>

                    <label className="form-group">
                      <span>O que acompanha o Kit Físico? *</span>
                      <textarea
                        rows="2"
                        required={form.hasKit}
                        placeholder="Ex: Carnes e queijos embalados a vácuo, temperos frescos e guia passo a passo impresso."
                        value={form.kitDescription}
                        onChange={(e) => setForm({ ...form, kitDescription: e.target.value })}
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="form-submit-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="button button-orange button-large"
                >
                  <Icon name="check" size={18} /> {loading ? "Salvando..." : "Publicar Receita & Colocar Kit à Venda"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: ORDERS */}
        {activeTab === "orders" && (
          <div className="dashboard-tab-content">
            <div className="tab-heading-row">
              <h3>Histórico de Pedidos Recebidos</h3>
              <span className="orders-count-tag">{orders.length} pedidos registrados</span>
            </div>

            {orders.length === 0 ? (
              <div className="empty-state">
                <Icon name="bag" size={36} />
                <p>Nenhum pedido recebido até o momento.</p>
              </div>
            ) : (
              <div className="orders-table-wrapper">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th># Pedido</th>
                      <th>Data</th>
                      <th>Itens / Kits</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord) => (
                      <tr key={ord.id}>
                        <td><strong>#{ord.id}</strong></td>
                        <td>{new Date(ord.createdAt).toLocaleDateString("pt-BR")}</td>
                        <td>
                          {ord.items?.map((item, i) => (
                            <div key={i} className="order-item-snippet">
                              {item.recipe?.title || `Receita #${item.recipeId}`} (x{item.quantity})
                            </div>
                          ))}
                        </td>
                        <td><strong>R$ {formatPrice(ord.total)}</strong></td>
                        <td>
                          <span className={`status-badge ${ord.status.toLowerCase()}`}>
                            {ord.status === "PAID" ? "Pago ✓" : "Pendente"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: METRICS */}
        {activeTab === "metrics" && (
          <div className="dashboard-tab-content">
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon-box orange">
                  <Icon name="bag" size={24} />
                </div>
                <div className="metric-info">
                  <span className="metric-title">Faturamento Total</span>
                  <h3 className="metric-value">R$ {formatPrice(totalSales)}</h3>
                  <small className="metric-sub">Em pedidos confirmados</small>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box green">
                  <Icon name="check" size={24} />
                </div>
                <div className="metric-info">
                  <span className="metric-title">Pedidos Concluídos</span>
                  <h3 className="metric-value">{totalOrdersCount}</h3>
                  <small className="metric-sub">Compras de receitas & kits</small>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box blue">
                  <Icon name="book" size={24} />
                </div>
                <div className="metric-info">
                  <span className="metric-title">Receitas Ativas</span>
                  <h3 className="metric-value">{activeRecipesCount}</h3>
                  <small className="metric-sub">No catálogo GastroMatch</small>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box purple">
                  <Icon name="star" size={24} />
                </div>
                <div className="metric-info">
                  <span className="metric-title">Kits Físicos à Venda</span>
                  <h3 className="metric-value">{kitsActiveCount}</h3>
                  <small className="metric-sub">Disponíveis para entrega</small>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
