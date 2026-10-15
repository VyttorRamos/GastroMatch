import { useEffect, useMemo, useState } from "react";
import Icon from "./components/Icon";
import Header from "./components/Header";
import RecipeCard from "./components/RecipeCard";
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
import CustomerOrdersModal from "./components/CustomerOrdersModal";
import { AuthProvider } from "./services/AuthContext";
import { api } from "./services/api";

const fallbackRecipes = [
  {
    id: 101,
    title: "Risoto de Cogumelos Selvagens", chef: { displayName: "Chef Gabriel Camillo" }, price: "29.90",
    rating: "4.8", reviews: "234", time: "45 min", difficulty: "Médio", category: "Massas",
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=900&q=80",
    description: "Um clássico cremoso da gastronomia italiana preparado com funghi secchi, cogumelos frescos e manteiga trufada.",
    instructions: "Refogue a cebola no azeite, junte o arroz arbóreo e deglace com vinho branco. Adicione o caldo de cogumelos quente aos poucos, mexendo constantemente por 18 minutos."
  },
  {
    id: 102,
    title: "Pasta Carbonara Autêntica", chef: { displayName: "Chef Marco" }, price: "24.90",
    rating: "4.9", reviews: "189", time: "20 min", difficulty: "Fácil", category: "Massas",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80",
    description: "A autêntica receita romana com guanciale artesanal, gemas de ovos caipiras e queijo Pecorino Romano.",
    instructions: "Dore o guanciale na própria gordura. Misture as gemas com o pecorino e pimenta do reino. Desligue o fogo e emulsione a massa com a mistura de gemas."
  },
  {
    id: 103,
    title: "Sushi Assortido & Omakase", chef: { displayName: "Chef Yuki Tanaka" }, price: "39.90",
    rating: "4.7", reviews: "312", time: "60 min", difficulty: "Difícil", category: "Japonesa",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80",
    description: "Técnicas milenares de corte de salmão, atum e tempero Shari para criar nigiris e uramakis com perfeição.",
    instructions: "Prepare o tempero Su para o arroz. Efetue o corte inclinado no filé de salmão e modele os nigiris com pressão sutil nos dedos."
  },
  {
    id: 104,
    title: "Tacos al Pastor & Molhos Artesanais", chef: { displayName: "Casa Mexicana" }, price: "22.90",
    rating: "4.8", reviews: "167", time: "35 min", difficulty: "Médio", category: "Mexicana",
    image: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=900&q=80",
    description: "Carne suína marinada em achiote e especiarias mexicanas, servida em tortilhas de milho com abacaxi e salsa verde.",
    instructions: "Marine a carne no achiote e suco de laranja amarga. Sele na chapa em alta temperatura para caramelizar os bordos."
  },
  {
    id: 105,
    title: "Feijoada Gourmet Completa", chef: { displayName: "Chef Otavio de Deus" }, price: "34.90",
    rating: "4.95", reviews: "410", time: "90 min", difficulty: "Médio", category: "Brasileira",
    image: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=900&q=80",
    description: "Feijoada tradicional dessalgada com carnes nobres, acompanhada de farofa de mandioca na manteiga de garrafa e couve crisp.",
    instructions: "Cozinhe o feijão preto com louro fresco. Adicione as carnes previamente dessalgadas e apure o caldo até encorpar."
  },
  {
    id: 106,
    title: "Petit Gâteau com Calda Cremosa", chef: { displayName: "Chef Yasmin Lobo" }, price: "19.90",
    rating: "4.9", reviews: "285", time: "25 min", difficulty: "Fácil", category: "Sobremesas",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80",
    description: "Bolo de chocolate com centro quente derretido, servido com sorvete de baunilha e farofa de castanhas.",
    instructions: "Derreta o chocolate 70% com a manteiga. Misture ovos e açúcar levemente. Asse a 200°C por exatamente 8 minutos."
  }
];

const categories = ["Todas", "Massas", "Brasileira", "Japonesa", "Mexicana", "Sobremesas", "Favoritos ❤️"];

function GastroMatchApp() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Todas");
  const [sortBy, setSortBy] = useState("relevancia");

  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState("store"); // "store" | "chef"
  const [selectedChef, setSelectedChef] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentTotal, setPaymentTotal] = useState(0);
  const [toastMessage, setToastMessage] = useState("");

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
      return updated;
    });
  };

  const [recipes, setRecipes] = useState(fallbackRecipes);
  const [apiConnected, setApiConnected] = useState(false);

  const fetchRecipes = () => {
    api.recipes()
      .then((data) => {
        if (Array.isArray(data) && data.length) {
          setRecipes(data);
        } else {
          setRecipes(fallbackRecipes);
        }
        setApiConnected(true);
      })
      .catch((error) => {
        console.warn("API indisponível:", error.message);
        setRecipes(fallbackRecipes);
        setApiConnected(false);
      });
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleAddToCart = (item) => {
    setCartItems((prev) => [...prev, item]);
    setToastMessage(`"${item.recipe?.title || item.title}" adicionado à sacola!`);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleRemoveCartItem = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePaymentCompleted = () => {
    setCartItems([]);
    setToastMessage("Pagamento confirmado com sucesso!");
    setTimeout(() => setToastMessage(""), 4000);
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
    } else if (selectedCategory !== "Todas") {
      result = result.filter((recipe) =>
        recipe.category === selectedCategory || recipe.category?.name === selectedCategory
      );
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
  }, [search, selectedCategory, selectedDifficulty, sortBy, recipes]);

  const scrollToRecipes = () => {
    document.getElementById("receitas")?.scrollIntoView({ behavior: "smooth" });
  };

  if (currentView === "chef") {
    return (
      <ChefDashboardPage
        onBackToStore={() => setCurrentView("store")}
        onRecipeCreated={fetchRecipes}
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
        onOpenOrders={() => setOrdersModalOpen(true)}
      />

      {toastMessage && (
        <div className="toast-notification">
          <Icon name="check" size={16} />
          <span>{toastMessage}</span>
          <button onClick={() => setCartOpen(true)} className="toast-link">Ver Sacola</button>
        </div>
      )}

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

        <Stats />

        {/* Featured Chefs Section */}
        <FeaturedChefs
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
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Icon name="search" size={32} />
                <h3>Nenhuma receita encontrada</h3>
                <p>Tente ajustar os filtros ou a busca.</p>
                <button className="button button-small button-outline" onClick={() => { setSearch(""); setSelectedCategory("Todas"); setSelectedDifficulty("Todas"); }}>
                  Limpar Filtros
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
        <Testimonials />

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

      <Footer />

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {ordersModalOpen && (
        <CustomerOrdersModal
          onClose={() => setOrdersModalOpen(false)}
          onOpenRecipe={(rec) => setSelectedRecipe(rec)}
        />
      )}
      {selectedChef && (
        <ChefProfileModal
          chef={selectedChef}
          recipes={recipes}
          onClose={() => setSelectedChef(null)}
          onSelectRecipe={(rec) => setSelectedRecipe(rec)}
        />
      )}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onAddToCart={handleAddToCart}
        />
      )}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCartItems([])}
        onOpenPaymentModal={(total) => {
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
