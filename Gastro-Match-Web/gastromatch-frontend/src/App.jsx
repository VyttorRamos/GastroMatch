import { useEffect, useMemo, useState } from "react";
import Icon from "./components/Icon";
import Header from "./components/Header";
import RecipeCard from "./components/RecipeCard";
import Stats from "./components/Stats";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import { AuthProvider } from "./services/AuthContext";
import { api } from "./services/api";

const fallbackRecipes = [
  {
    title: "Risoto de Cogumelos Selvagens", chef: "Sua Receita", price: "29.90",
    rating: "4.8", reviews: "234", time: "45 min", difficulty: "Médio",
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=900&q=80"
  },
  {
    title: "Pasta Carbonara Autêntica", chef: "Chef Marco", price: "24.90",
    rating: "4.9", reviews: "189", time: "20 min", difficulty: "Fácil",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80"
  },
  {
    title: "Sushi Assortido", chef: "Chef Yuki", price: "39.90",
    rating: "4.7", reviews: "312", time: "60 min", difficulty: "Difícil",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80"
  },
  {
    title: "Tacos al Pastor", chef: "Casa Mexicana", price: "22.90",
    rating: "4.8", reviews: "167", time: "35 min", difficulty: "Médio",
    image: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=900&q=80"
  }
];

function GastroMatchApp() {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [recipes, setRecipes] = useState(fallbackRecipes);
  const [apiConnected, setApiConnected] = useState(false);

  useEffect(() => {
    api.recipes()
      .then((data) => {
        setRecipes(Array.isArray(data) && data.length ? data : fallbackRecipes);
        setApiConnected(true);
      })
      .catch((error) => {
        console.warn("API indisponível:", error.message);
        setApiConnected(false);
      });
  }, []);

  const filteredRecipes = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return recipes;
    return recipes.filter((recipe) =>
      `${recipe.title} ${recipe.chef?.displayName || recipe.chef || ""}`
        .toLowerCase()
        .includes(term)
    );
  }, [search, recipes]);

  const scrollToRecipes = () => {
    document.getElementById("receitas")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="app">
      <Header
        search={search}
        setSearch={setSearch}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onAuth={() => setAuthOpen(true)}
      />

      <main>
        <section className="hero-section">
          <div className="container">
            <div className="hero">
              <div className="hero-content">
                <span className="eyebrow"><Icon name="chef" size={16} /> Experiências que cabem na sua cozinha</span>
                <h1>Descubra sabores.<br /><span>Aprenda com quem entende.</span></h1>
                <p>Conecte-se com chefs e restaurantes, encontre receitas autênticas e transforme cada preparo em uma experiência.</p>
                <div className="hero-actions">
                  <button className="button button-light" onClick={scrollToRecipes}>
                    Explorar receitas <Icon name="arrow" size={18} />
                  </button>
                  <button className="button button-outline" onClick={() => setAuthOpen(true)}>
                    Criar conta
                  </button>
                </div>
              </div>
              <div className="hero-image">
                <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=85" alt="Pessoa preparando uma receita" />
                <div className="floating-card">
                  <div className="floating-icon"><Icon name="star" size={18} stroke={1.8} /></div>
                  <div><strong>4.8/5</strong><span>Avaliação média</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Stats />

        <section id="receitas" className="recipes-section">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Para você</span>
                <h2>Receitas em destaque</h2>
                <p>{apiConnected ? "Dados carregados do seu backend." : "Explore algumas receitas de demonstração."}</p>
              </div>
              <button className="text-button" onClick={scrollToRecipes}>
                Ver todas <Icon name="arrow" size={16} />
              </button>
            </div>

            {filteredRecipes.length > 0 ? (
              <div className="recipe-grid">
                {filteredRecipes.map((recipe, index) => (
                  <RecipeCard key={recipe.id || recipe.title || index} recipe={recipe} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Icon name="search" size={28} />
                <h3>Nenhuma receita encontrada</h3>
                <p>Tente buscar por outro prato ou chef.</p>
              </div>
            )}
          </div>
        </section>

        <section id="como-funciona" className="how-section">
          <div className="container">
            <div className="section-heading centered">
              <span className="section-kicker">Como funciona</span>
              <h2>Do chef para a sua cozinha</h2>
              <p>Uma experiência simples para encontrar, aprender e preparar.</p>
            </div>
            <div className="steps">
              <div className="step"><span>01</span><h3>Escolha</h3><p>Encontre receitas e aulas por categoria, tempo e dificuldade.</p></div>
              <div className="step"><span>02</span><h3>Aprenda</h3><p>Acesse o conteúdo do chef e acompanhe o preparo passo a passo.</p></div>
              <div className="step"><span>03</span><h3>Prepare</h3><p>Compre o conteúdo e, quando disponível, o kit de ingredientes.</p></div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container">
            <div className="cta">
              <div>
                <span className="section-kicker">GastroMatch</span>
                <h2>Pronto para começar?</h2>
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
