import Icon from "./Icon";
import { useAuth } from "../services/AuthContext";

export default function Header({ search, setSearch, menuOpen, setMenuOpen, onAuth, cartCount = 0, onOpenCart, onOpenChefModal }) {
  const { user, logout } = useAuth();

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
          <a href="#receitas">Explorar</a>
          <button className="text-nav-btn" onClick={onOpenChefModal}>
            Seja um Chef
          </button>

          <button className="icon-button" onClick={onOpenCart} aria-label="Sacola">
            <Icon name="bag" size={19} />
            <span className="cart-dot">{cartCount}</span>
          </button>

          {user ? (
            <div className="user-area">
              <span className="user-name">Olá, {user.name.split(" ")[0]}</span>
              <button className="button button-small" onClick={logout}>Sair</button>
            </div>
          ) : (
            <button className="button button-small" onClick={() => onAuth("login")}>
              Entrar
            </button>
          )}
        </nav>

        <button
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menu"
        >
          {menuOpen ? <Icon name="x" /> : <Icon name="menu" />}
        </button>
      </div>
    </header>
  );
}
