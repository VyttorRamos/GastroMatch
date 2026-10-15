import Icon from "./Icon";
import { useAuth } from "../services/AuthContext";

export default function Header({ search, setSearch, menuOpen, setMenuOpen, onAuth, cartCount = 0, onOpenCart, onOpenChefDashboard, onOpenOrders }) {
  const { user, logout } = useAuth();
  const isChefOrAdmin = user && (user.role === "CHEF" || user.role === "ADMIN" || Boolean(user.chef));
  const rawName = user?.chef?.displayName || user?.name || "Usuário";
  const firstName = rawName.replace(/^Chef\s+/i, "").trim().split(" ")[0] || "Chef";

  return (
    <header className="header">
      <div className="container header-inner">
        <a className="brand" href="/" aria-label="GastroMatch">
          <span className="brand-mark">GM</span>
          <span>GastroMatch</span>
        </a>

        <div className="search-box">
          <Icon name="search" size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Busque receitas, chefs, categorias..."
            aria-label="Buscar receitas"
          />
        </div>

        <nav className={`nav ${menuOpen ? "open" : ""}`}>
          <a href="#receitas" onClick={() => setMenuOpen(false)}>
            Explorar
          </a>

          <button
            className="chef-nav-highlight-btn"
            onClick={() => {
              onOpenChefDashboard();
              setMenuOpen(false);
            }}
          >
            <Icon name="chef" size={16} /> {isChefOrAdmin ? "Painel do Chef" : "Área do Chef"}
          </button>

          <button className="icon-button desktop-cart-btn" onClick={onOpenCart} aria-label="Sacola">
            <Icon name="bag" size={19} />
            <span className="cart-dot">{cartCount}</span>
          </button>

          {user ? (
            <div className="user-area">
              <button
                className="my-orders-header-btn"
                onClick={() => {
                  onOpenOrders();
                  setMenuOpen(false);
                }}
                title="Meus Pedidos"
              >
                <Icon name="bag" size={14} /> Meus Pedidos
              </button>
              <span className="user-name">
                {isChefOrAdmin && <span className="chef-inline-badge">CHEF</span>}
                Olá, {firstName}
              </span>
              <button
                className="button button-small"
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
              >
                Sair
              </button>
            </div>
          ) : (
            <button
              className="button button-small"
              onClick={() => {
                onAuth("login");
                setMenuOpen(false);
              }}
            >
              Entrar
            </button>
          )}
        </nav>

        <div className="header-mobile-actions">
          <button
            className="icon-button mobile-cart-btn"
            onClick={onOpenCart}
            aria-label="Abrir Sacola"
          >
            <Icon name="bag" size={20} />
            <span className="cart-dot">{cartCount}</span>
          </button>

          <button
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menu"
          >
            {menuOpen ? <Icon name="x" size={22} /> : <Icon name="menu" size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
