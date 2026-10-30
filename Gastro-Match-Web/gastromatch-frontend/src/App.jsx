import { useEffect, useMemo, useState } from "react";
import Icon from "./components/Icon";
import Header from "./components/Header";
import RecipeCard, { getRecipeDisplayImage } from "./components/RecipeCard";
import Stats from "./components/Stats";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import RecipeModal from "./components/RecipeModal";
import CartDrawer from "./components/CartDrawer";
import ChefProfileModal from "./components/ChefProfileModal";
import PaymentModal from "./components/PaymentModal";
import FeaturedChefs from "./components/FeaturedChefs";
import Testimonials from "./components/Testimonials";
import ChefDashboardPage from "./components/ChefDashboardPage";
import AdminDashboardPage from "./components/AdminDashboardPage";
import CustomerOrdersModal from "./components/CustomerOrdersModal";
import PurchasedRecipesModal from "./components/PurchasedRecipesModal";
import RecipeLocationModal, { resolveChefLocation } from "./components/RecipeLocationModal";
import UserProfileModal from "./components/UserProfileModal";
import UserDashboardBanner from "./components/UserDashboardBanner";
import FavoritesModal from "./components/FavoritesModal";
import { AuthProvider, useAuth } from "./services/AuthContext";
import { api } from "./services/api";

function GastroMatchApp() {
  const { user, showAlert } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Todas");
  const [selectedDietary, setSelectedDietary] = useState("Todas");
  const [sortBy, setSortBy] = useState("relevancia");

  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);
  const [purchasedModalOpen, setPurchasedModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationTarget, setLocationTarget] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [favoritesModalOpen, setFavoritesModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState("store"); // "store" | "chef" | "admin"
  const [selectedChef, setSelectedChef] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentTotal, setPaymentTotal] = useState(0);
  const [toastMessage, setToastMessage] = useState("");
  const [userOrders, setUserOrders] = useState([]);

  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("gastromatch_favorites") || "[]");
    } catch {
      return [];
    }
  });

  const handleToggleFavorite = (recipeId) => {
    setFavoriteIds((prev) => {
      const exists = prev.includes(recipeId);
      const updated = exists ? prev.filter((id) => id !== recipeId) : [...prev, recipeId];
      localStorage.setItem("gastromatch_favorites", JSON.stringify(updated));
      const matched = recipes.find((r) => r.id === recipeId);
      const titleLabel = matched?.title ? `"${matched.title}"` : "Receita";
      showAlert &&
        showAlert(
          exists
            ? `${titleLabel} removida dos seus Favoritos.`
            : `${titleLabel} adicionada aos seus Favoritos!`,
          exists ? "info" : "success"
        );
      return updated;
    });
  };

  const [recipes, setRecipes] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [apiConnected, setApiConnected] = useState(false);

  const categories = useMemo(() => {
    const names = dbCategories.map((c) => c.name);
    return ["Todas", ...names, "Minhas Compras 🔓", "Favoritos ❤️"];
  }, [dbCategories]);

  const fetchDatabaseCatalog = () => {
    Promise.all([
      api.recipes(),
      api.chefs(),
      api.allReviews(),
      api.categories()
    ])
      .then(([recipesData, chefsData, reviewsData, categoriesData]) => {
        if (Array.isArray(recipesData)) {
          setRecipes(
            recipesData.map((rec) => ({
              ...rec,
              imageUrl: rec.imageUrl || getRecipeDisplayImage(rec)
            }))
          );
        }
        if (Array.isArray(chefsData)) {
          setChefs(chefsData);
        }
        if (Array.isArray(reviewsData)) {
          setReviews(reviewsData);
        }
        if (Array.isArray(categoriesData)) {
          setDbCategories(categoriesData);
        }
        setApiConnected(true);
      })
      .catch((error) => {
        console.warn("API indisponível:", error.message);
        setApiConnected(false);
      });
  };

  useEffect(() => {
    fetchDatabaseCatalog();
  }, []);

  useEffect(() => {
    if (!user) {
      setUserOrders([]);
      return;
    }

    api.orders()
      .then((apiList) => {
        setUserOrders(Array.isArray(apiList) ? apiList : []);
      })
      .catch(() => {
        setUserOrders([]);
      });
  }, [user]);

  const purchasedRecipes = useMemo(() => {
    if (!user) return [];
    const paidOrders = userOrders.filter(
      (ord) =>
        ord.status === "PAID" ||
        ord.status === "PROCESSING" ||
        ord.status === "SHIPPED" ||
        ord.status === "DELIVERED"
    );

    const seen = new Set();
    const list = [];

    paidOrders.forEach((ord) => {
      (ord.items || []).forEach((it) => {
        const rawRec = it.recipe || it;
        const recId = Number(it.recipeId || rawRec?.id);
        const catalogMatch = recipes.find(
          (r) =>
            (recId && Number(r.id) === recId) ||
            (rawRec?.title && r.title === rawRec.title)
        );
        const fullRecipe = catalogMatch ? { ...rawRec, ...catalogMatch } : rawRec;
        if (!fullRecipe || (!fullRecipe.id && !fullRecipe.title)) return;

        const key = fullRecipe.id ? `id:${fullRecipe.id}` : `title:${fullRecipe.title}`;
        if (seen.has(key)) return;
        seen.add(key);

        const loc = resolveChefLocation(fullRecipe);
        const unitPrice = Number(it.unitPrice ?? it.totalPrice ?? it.price ?? fullRecipe.price ?? 29.9);
        const basePrice = Number(fullRecipe.price || 29.9);

        list.push({
          recipe: fullRecipe,
          orderId: ord.id,
          purchasedAt: ord.createdAt,
          paidAmount: unitPrice,
          includeKit: Boolean(it.includeKit || unitPrice > basePrice + 1),
          originAddress: `${loc.restaurant} — ${loc.street}, ${loc.city}`
        });
      });
    });

    return list;
  }, [user, userOrders, recipes]);

  const isRecipePurchased = (recipe) => {
    if (!user || !recipe) return false;
    if (user.id && recipe.authorId && Number(user.id) === Number(recipe.authorId)) {
      return true;
    }
    return purchasedRecipes.some((entry) => {
      if (recipe.id && entry.recipe?.id) {
        return Number(entry.recipe.id) === Number(recipe.id);
      }
      return Boolean(recipe.title && entry.recipe?.title === recipe.title);
    });
  };

  const handleAddToCart = (item) => {
    if (!user) {
      setAuthOpen(true);
      showAlert && showAlert("Faça login na sua conta para comprar receitas!", "warning");
      return;
    }
    setCartItems((prev) => [...prev, item]);
    showAlert &&
      showAlert(
        `"${item.recipe?.title || item.title}" adicionado à sacola!`,
        "success"
      );
  };

  const handleBuyNow = (item) => {
    if (!user) {
      setAuthOpen(true);
      showAlert &&
        showAlert(
          "Faça login na sua conta para comprar e liberar a receita!",
          "warning"
        );
      return;
    }
    const price = item.totalPrice || Number(item.recipe?.price || item.price || 29.9);
    setCartItems([item]);
    setPaymentTotal(price);
    setPaymentModalOpen(true);
    showAlert &&
      showAlert(
        `Iniciando pagamento de "${item.recipe?.title || item.title}"...`,
        "info"
      );
  };

  const handleRemoveCartItem = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
    showAlert && showAlert("Item removido da sacola.", "info");
  };

  const recordPaidOrder = (completedOrder) => {
    if (!user) return;
    const normalizedItems =
      completedOrder?.cartItems?.length > 0
        ? completedOrder.cartItems.map((ci) => ({
            recipeId: ci.recipe?.id || ci.id,
            recipe: ci.recipe || ci,
            quantity: 1,
            unitPrice: ci.totalPrice || Number(ci.recipe?.price || ci.price || 29.9),
            includeKit: Boolean(ci.includeKit)
          }))
        : completedOrder?.items || [];

    const newOrder = {
      id: completedOrder?.id || Math.floor(1000 + Math.random() * 9000),
      status: "PAID",
      total: completedOrder?.total || paymentTotal,
      createdAt: completedOrder?.createdAt || new Date().toISOString(),
      items: normalizedItems
    };

    setUserOrders((prev) => {
      const filtered = prev.filter((o) => o.id !== newOrder.id);
      return [newOrder, ...filtered];
    });

    api.orders()
      .then((apiList) => {
        if (Array.isArray(apiList)) setUserOrders(apiList);
      })
      .catch(() => {});
  };

  const handlePaymentCompleted = (completedOrder) => {
    recordPaidOrder(completedOrder);
    setCartItems([]);
    showAlert &&
      showAlert(
        "Pagamento confirmado! Receita liberada em Minhas Receitas Compradas.",
        "success"
      );
  };

  const filteredRecipes = useMemo(() => {
    let result = [...recipes];

    // Search filter
    const term = search.trim().toLowerCase();
    if (term) {
      result = result.filter((recipe) =>
        `${recipe.title} ${recipe.chef?.displayName || recipe.chef?.restaurant || recipe.chef || ""} ${recipe.category || ""}`
          .toLowerCase()
          .includes(term)
      );
    }

    // Category filter
    if (selectedCategory === "Favoritos ❤️") {
      result = result.filter((recipe) => favoriteIds.includes(recipe.id));
    } else if (selectedCategory === "Minhas Compras 🔓") {
      result = result.filter((recipe) =>
        purchasedRecipes.some(
          (entry) =>
            (recipe.id && Number(entry.recipe?.id) === Number(recipe.id)) ||
            (recipe.title && entry.recipe?.title === recipe.title)
        )
      );
    } else if (selectedCategory !== "Todas") {
      result = result.filter((recipe) => {
        const catName = (recipe.category?.name || recipe.category || "").toLowerCase();
        const target = selectedCategory.toLowerCase();
        if (target === "sobremesas") {
          return catName === "sobremesas" || catName === "doce" || catName === "doces";
        }
        return catName === target;
      });
    }

    // Dietary filter
    if (selectedDietary !== "Todas") {
      const dietaryKeywords = {
        "Vegetariano": ["vegetariano", "cogumelo", "queijo", "massa", "legumes", "risoto", "carbonara"],
        "Vegano": ["vegano", "vegetal", "legumes", "shari", "cogumelo"],
        "Sem Glúten": ["sem glúten", "sem gluten", "arroz", "milho", "tacos", "feijoada", "sushi"],
        "Sem Lactose": ["sem lactose", "lac-free", "sushi", "tacos", "omakase"],
        "Low Carb": ["low carb", "fit", "salmão", "atum", "carne", "cogumelos"]
      }[selectedDietary] || [selectedDietary.toLowerCase()];

      result = result.filter((recipe) => {
        const text = `${recipe.title} ${recipe.description || ""} ${recipe.category?.name || recipe.category || ""}`.toLowerCase();
        return dietaryKeywords.some((kw) => text.includes(kw));
      });
    }

    // Difficulty filter
    if (selectedDifficulty !== "Todas") {
      result = result.filter((recipe) => {
        const diffMap = { EASY: "Fácil", MEDIUM: "Médio", HARD: "Difícil" };
        const d = diffMap[recipe.difficulty] || recipe.difficulty;
        return d === selectedDifficulty;
      });
    }

    // Sorting
    if (sortBy === "preco-menor") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "avaliacao") {
      result.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    }

    return result;
  }, [search, selectedCategory, selectedDifficulty, selectedDietary, sortBy, recipes, favoriteIds, purchasedRecipes]);

  const scrollToRecipes = () => {
    document.getElementById("receitas")?.scrollIntoView({ behavior: "smooth" });
  };

  if (currentView === "admin") {
    return (
      <AdminDashboardPage
        onBackToStore={() => {
          fetchDatabaseCatalog();
          setCurrentView("store");
        }}
        onChefStatusUpdated={fetchDatabaseCatalog}
      />
    );
  }

  if (currentView === "chef") {
    return (
      <ChefDashboardPage
        onBackToStore={() => {
          fetchDatabaseCatalog();
          setCurrentView("store");
        }}
        onRecipeCreated={fetchDatabaseCatalog}
        onOpenAdminDashboard={() => setCurrentView("admin")}
      />
    );
  }

  return (
    <div className="app">
      <Header
        search={search}
        setSearch={setSearch}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onAuth={() => setAuthOpen(true)}
        cartCount={cartItems.length}
        onOpenCart={() => setCartOpen(true)}
        onOpenChefDashboard={() => setCurrentView("chef")}
        onOpenAdminDashboard={() => setCurrentView("admin")}
        onOpenOrders={() => setOrdersModalOpen(true)}
        onOpenPurchasedRecipes={() => setPurchasedModalOpen(true)}
        onOpenRecipeLocation={() => {
          setLocationTarget(null);
          setLocationModalOpen(true);
        }}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenFavorites={() => setFavoritesModalOpen(true)}
        onFilterFavorites={() => {
          setSelectedRecipe(null);
          setSelectedCategory("Favoritos ❤️");
          setTimeout(scrollToRecipes, 50);
        }}
        onGoHome={() => setSelectedRecipe(null)}
      />

      {toastMessage && (
        <div className="toast-notification">
          <Icon name="check" size={16} />
          <span>{toastMessage}</span>
          <button onClick={() => setCartOpen(true)} className="toast-link">Ver Sacola</button>
        </div>
      )}

      {selectedRecipe ? (
        <main className="recipe-fullpage-main">
          <RecipeModal
            recipe={selectedRecipe}
            isPurchased={isRecipePurchased(selectedRecipe)}
            isFavorite={favoriteIds.includes(selectedRecipe.id)}
            onToggleFavorite={handleToggleFavorite}
            onClose={() => setSelectedRecipe(null)}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onRequireAuth={() => {
              setAuthOpen(true);
              setToastMessage("Entre na sua conta para comprar e desbloquear a receita!");
              setTimeout(() => setToastMessage(""), 3500);
            }}
            onOpenLocation={(entry) => {
              setLocationTarget(entry);
              setLocationModalOpen(true);
            }}
            onOpenPurchasedRecipes={() => setPurchasedModalOpen(true)}
          />
        </main>
      ) : (
      <main>
        <section className="hero-section">
          <div className="container">
            <div className="hero">
              <div className="hero-content">
                <span className="eyebrow"><Icon name="chef" size={16} /> Conexão & Experiência Gastronômica</span>
                <h1>Descubra sabores.<br /><span>Aprenda com quem entende.</span></h1>
                <p>Conecte-se com chefs e restaurantes autenticados, aprenda com videoaulas exclusivas e receba os kits de ingredientes frescos na sua casa.</p>
                <div className="hero-actions">
                  <button className="button button-light" onClick={scrollToRecipes}>
                    Explorar receitas <Icon name="arrow" size={18} />
                  </button>
                  <button className="button button-outline" onClick={() => setCurrentView("chef")}>
                    Área do Chef & Parceiros
                  </button>
                </div>
              </div>
              <div className="hero-image">
                <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=85" alt="Pessoa preparando uma receita" />
                <div className="floating-card">
                  <div className="floating-icon"><Icon name="shieldCheck" size={20} /></div>
                  <div><strong>100% Autêntico</strong><span>Chefs & Restaurantes Validados</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Stats recipes={recipes} chefs={chefs} reviews={reviews} />

        {user && (
          <UserDashboardBanner
            onOpenProfile={() => setProfileModalOpen(true)}
            onOpenOrders={() => setOrdersModalOpen(true)}
            onOpenPurchasedRecipes={() => setPurchasedModalOpen(true)}
            onOpenRecipeLocation={() => {
              setLocationTarget(null);
              setLocationModalOpen(true);
            }}
            onOpenFavorites={() => setFavoritesModalOpen(true)}
            onFilterFavorites={() => {
              setSelectedCategory("Favoritos ❤️");
              scrollToRecipes();
            }}
            favoriteCount={favoriteIds.length}
            ordersCount={userOrders.length}
            purchasedCount={purchasedRecipes.length}
          />
        )}

        {/* Featured Chefs Section */}
        <FeaturedChefs
          chefs={chefs}
          onOpenChefDashboard={() => setCurrentView("chef")}
          onSelectChef={(chef) => setSelectedChef(chef)}
        />

        <section id="receitas" className="recipes-section">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Catálogo & Experiências</span>
                <h2>Receitas e Aulas de Chefs</h2>
                <p>{apiConnected ? "Conectado à base de dados do GastroMatch." : "Explore receitas em destaque com videoaulas e kits de ingredientes."}</p>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="category-filters">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sub-Filters Controls */}
            <div className="filter-controls-bar">
              <div className="filter-group">
                <label><Icon name="filter" size={14} /> Dificuldade:</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  <option value="Todas">Todas as dificuldades</option>
                  <option value="Fácil">Fácil</option>
                  <option value="Médio">Médio</option>
                  <option value="Difícil">Difícil</option>
                </select>
              </div>

              <div className="filter-group">
                <label><Icon name="heart" size={14} /> Dieta / Restrição:</label>
                <select
                  value={selectedDietary}
                  onChange={(e) => setSelectedDietary(e.target.value)}
                >
                  <option value="Todas">Todas as dietas</option>
                  <option value="Vegetariano">Vegetariano</option>
                  <option value="Vegano">Vegano</option>
                  <option value="Sem Glúten">Sem Glúten</option>
                  <option value="Sem Lactose">Sem Lactose</option>
                  <option value="Low Carb">Low Carb / Fit</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Ordenar por:</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="relevancia">Mais Relevantes</option>
                  <option value="avaliacao">Melhores Avaliados</option>
                  <option value="preco-menor">Menor Preço</option>
                </select>
              </div>
            </div>

            {filteredRecipes.length > 0 ? (
              <div className="recipe-grid">
                {filteredRecipes.map((recipe, index) => (
                  <RecipeCard
                    key={recipe.id || recipe.title || index}
                    recipe={recipe}
                    onSelect={(rec) => setSelectedRecipe(rec)}
                    isFavorite={favoriteIds.includes(recipe.id)}
                    onToggleFavorite={handleToggleFavorite}
                    isPurchased={isRecipePurchased(recipe)}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon-badge">
                  <Icon
                    name={
                      selectedCategory === "Minhas Compras 🔓"
                        ? "lock"
                        : selectedCategory === "Favoritos ❤️"
                        ? "heart"
                        : "search"
                    }
                    size={28}
                  />
                </div>
                <h3>
                  {selectedCategory === "Minhas Compras 🔓"
                    ? "Você ainda não comprou nenhuma receita"
                    : selectedCategory === "Favoritos ❤️"
                    ? "Nenhuma receita salva nos favoritos"
                    : "Nenhuma receita encontrada"}
                </h3>
                <p>
                  {selectedCategory === "Minhas Compras 🔓"
                    ? "Escolha um prato no catálogo e conclua o pagamento para desbloquear o passo a passo completo, videoaula e localização."
                    : selectedCategory === "Favoritos ❤️"
                    ? "Clique no ícone de coração nos cards de receitas para salvá-las na sua lista pessoal."
                    : "Não encontramos pratos com essa combinação de filtros. Limpe os filtros para ver todo o catálogo."}
                </p>
                <button
                  type="button"
                  className="button button-orange empty-state-btn"
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("Todas");
                    setSelectedDifficulty("Todas");
                    setSelectedDietary("Todas");
                  }}
                >
                  <Icon name="utensils" size={16} />{" "}
                  {selectedCategory === "Minhas Compras 🔓" || selectedCategory === "Favoritos ❤️"
                    ? "Explorar Todas as Receitas"
                    : "Limpar Filtros"}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Chef Banner Section */}
        <section className="chef-banner-section">
          <div className="container">
            <div className="chef-banner-card">
              <div className="banner-content">
                <span className="banner-badge"><Icon name="shieldCheck" size={16} /> Para Chefs & Restaurantes</span>
                <h2>Monetize seu conhecimento culinário</h2>
                <p>Comercialize suas receitas exclusivas, transmita videoaulas e entregue kits de ingredientes frescos aos amantes de gastronomia na sua região.</p>

                <div className="banner-highlights">
                  <span><Icon name="check" size={16} /> Cadastro Gratuito</span>
                  <span><Icon name="check" size={16} /> Validação Sanitária</span>
                  <span><Icon name="check" size={16} /> Venda de Kits & Aulas</span>
                </div>

                <button className="button button-orange" onClick={() => setCurrentView("chef")}>
                  Acessar Portal do Chef <Icon name="arrow" size={18} />
                </button>
              </div>

              <div className="banner-image-box">
                <img
                  src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=80"
                  alt="Chef preparando prato profissional"
                />
                <div className="banner-floating-badge">
                  <Icon name="chef" size={20} />
                  <div>
                    <strong>Selo Chef Autenticado</strong>
                    <span>GastroMatch Verificado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="como-funciona" className="how-section">
          <div className="container">
            <div className="section-heading centered">
              <span className="section-kicker">Como funciona</span>
              <h2>Do chef para a sua cozinha</h2>
              <p>Uma experiência simples para encontrar, aprender e preparar.</p>
            </div>
            <div className="steps">
              <div className="step"><span>01</span><h3>Escolha</h3><p>Encontre receitas e aulas por categoria, tempo e dificuldade.</p></div>
              <div className="step"><span>02</span><h3>Aprenda</h3><p>Acesse o conteúdo do chef com videoaulas passo a passo.</p></div>
              <div className="step"><span>03</span><h3>Prepare com Kit</h3><p>Receba ingredientes pré-medidos diretamente do restaurante.</p></div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <Testimonials reviews={reviews} />

        <section className="cta-section">
          <div className="container">
            <div className="cta">
              <div>
                <span className="section-kicker">GastroMatch</span>
                <h2>Pronto para viver essa experiência?</h2>
                <p>Crie sua conta e descubra uma nova forma de viver a gastronomia.</p>
              </div>
              <button className="button button-orange" onClick={() => setAuthOpen(true)}>
                Criar conta gratuitamente <Icon name="arrow" size={18} />
              </button>
            </div>
          </div>
        </section>
      </main>
      )}

      <Footer />

      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onLoginSuccess={(loggedUser) => {
            if (loggedUser?.role === "ADMIN") {
              setCurrentView("admin");
            } else if (loggedUser?.role === "CHEF" || loggedUser?.chef) {
              setCurrentView("chef");
            }
          }}
        />
      )}
      {profileModalOpen && (
        <UserProfileModal onClose={() => setProfileModalOpen(false)} />
      )}
      {ordersModalOpen && (
        <CustomerOrdersModal
          orders={userOrders}
          onClose={() => setOrdersModalOpen(false)}
          onOpenRecipe={(rec) => setSelectedRecipe(rec)}
          onOpenLocation={(entry) => {
            setLocationTarget(entry);
            setLocationModalOpen(true);
          }}
          onOrderPaid={(updatedOrd) => {
            setUserOrders((prev) =>
              prev.map((o) => (o.id === updatedOrd.id ? { ...o, ...updatedOrd, status: "PAID" } : o))
            );
          }}
        />
      )}
      {purchasedModalOpen && (
        <PurchasedRecipesModal
          purchasedRecipes={purchasedRecipes}
          onClose={() => setPurchasedModalOpen(false)}
          onSelectRecipe={(rec) => setSelectedRecipe(rec)}
          onOpenLocation={(entry) => {
            setLocationTarget(entry);
            setLocationModalOpen(true);
          }}
        />
      )}
      {locationModalOpen && (
        <RecipeLocationModal
          purchasedRecipes={purchasedRecipes}
          initialSelection={locationTarget}
          onClose={() => {
            setLocationModalOpen(false);
            setLocationTarget(null);
          }}
          onOpenRecipe={(rec) => setSelectedRecipe(rec)}
        />
      )}
      {favoritesModalOpen && (
        <FavoritesModal
          favoriteIds={favoriteIds}
          recipes={recipes}
          onClose={() => setFavoritesModalOpen(false)}
          onSelectRecipe={(rec) => setSelectedRecipe(rec)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
      {selectedChef && (
        <ChefProfileModal
          chef={selectedChef}
          recipes={recipes}
          onClose={() => setSelectedChef(null)}
          onSelectRecipe={(rec) => {
            setSelectedChef(null);
            setSelectedRecipe(rec);
          }}
        />
      )}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => {
          setCartItems([]);
          showAlert && showAlert("Sua sacola foi esvaziada.", "info");
        }}
        onOpenPaymentModal={(total) => {
          if (!user) {
            setCartOpen(false);
            setAuthOpen(true);
            showAlert &&
              showAlert("Faça login para finalizar a compra da receita!", "warning");
            return;
          }
          setPaymentTotal(total);
          setPaymentModalOpen(true);
        }}
      />
      {paymentModalOpen && (
        <PaymentModal
          cartItems={cartItems}
          totalAmount={paymentTotal}
          onClose={() => setPaymentModalOpen(false)}
          onPaymentSuccess={handlePaymentCompleted}
          onOpenPurchasedRecipes={() => setPurchasedModalOpen(true)}
          onOpenRecipeLocation={() => {
            setLocationTarget(null);
            setLocationModalOpen(true);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GastroMatchApp />
    </AuthProvider>
  );
}
