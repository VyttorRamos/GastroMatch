import { useState, useRef, useEffect } from "react";
import Icon from "./Icon";
import { useAuth } from "../services/AuthContext";

export default function Header({
  search,
  setSearch,
  menuOpen,
  setMenuOpen,
  onAuth,
  cartCount = 0,
  onOpenCart,
  onOpenChefDashboard,
  onOpenAdminDashboard,
  onOpenOrders,
  onOpenPurchasedRecipes,
  onOpenRecipeLocation,
  onOpenProfile,
  onOpenFavorites,
  onFilterFavorites,
  onGoHome
}) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isChefOrAdmin = user && (user.role === "CHEF" || user.role === "ADMIN" || Boolean(user.chef));
  const rawName = user?.chef?.displayName || user?.name || "Usuário";
  const firstName = rawName.replace(/^Chef\s+/i, "").trim().split(" ")[0] || "Chef";

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="container header-inner">
        <a
          className="brand"
          href="/"
          aria-label="GastroMatch"
          onClick={(e) => {
            if (onGoHome) {
              e.preventDefault();
              onGoHome();
            }
          }}
        >
          <img className="brand-logo" src="/gastromatch-logo.png" alt="GastroMatch" />
        </a>

        <div className="search-box">
          <Icon name="search" size={17} />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (onGoHome) onGoHome();
            }}
            placeholder="Busque receitas, chefs, categorias..."
            aria-label="Buscar receitas"
          />
        </div>

        <nav className={`nav ${menuOpen ? "open" : ""}`}>
          <a
            href="#receitas"
            onClick={() => {
              if (onGoHome) onGoHome();
              setMenuOpen(false);
            }}
          >
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

          {onOpenAdminDashboard && (
            <button
              className="admin-nav-highlight-btn"
              onClick={() => {
                onOpenAdminDashboard();
                setMenuOpen(false);
              }}
              title="Painel Administrativo de Aprovação de Chefs"
            >
              <Icon name="shieldCheck" size={15} /> Admin
            </button>
          )}

          <button className="icon-button desktop-cart-btn" onClick={onOpenCart} aria-label="Sacola">
            <Icon name="bag" size={19} />
            <span className="cart-dot">{cartCount}</span>
          </button>

          {user ? (
            <div className="user-area" ref={dropdownRef}>
              <button
                className="my-orders-header-btn"
                onClick={() => {
                  onOpenPurchasedRecipes && onOpenPurchasedRecipes();
                  setMenuOpen(false);
                }}
                title="Minhas Receitas Compradas"
              >
                <Icon name="unlock" size={14} /> Minhas Receitas
              </button>

              <button
                className="my-orders-header-btn header-loc-btn"
                onClick={() => {
                  onOpenRecipeLocation && onOpenRecipeLocation();
                  setMenuOpen(false);
                }}
                title="Localização das Receitas Compradas"
              >
                <Icon name="mapPin" size={14} /> Localização
              </button>

              {/* Botão de Perfil com Avatar e Dropdown */}
              <div className="user-dropdown-wrapper">
                <button
                  type="button"
                  className="user-profile-trigger-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  title="Abrir menu de perfil"
                >
                  <div className="user-mini-avatar">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={firstName} />
                    ) : (
                      <span>{firstName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="user-name">
                    {user.role === "ADMIN" ? (
                      <span className="chef-inline-badge">ADMIN</span>
                    ) : (
                      isChefOrAdmin && <span className="chef-inline-badge">CHEF</span>
                    )}
                    Olá, {firstName}
                  </span>
                  <span className="dropdown-caret">▼</span>
                </button>

                {dropdownOpen && (
                  <div className="user-popover-dropdown">
                    <div className="popover-user-meta">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                      <small className="popover-role-tag">
                        {user.role === "ADMIN"
                          ? "Administrador • Homologação"
                          : isChefOrAdmin
                          ? "Chef & Restaurante"
                          : "Cliente GastroMatch"}
                      </small>
                    </div>

                    <div className="popover-menu-links">
                      <button
                        type="button"
                        onClick={() => {
                          onOpenProfile && onOpenProfile();
                          setDropdownOpen(false);
                          setMenuOpen(false);
                        }}
                      >
                        <Icon name="fileText" size={15} /> Meu Perfil & Endereço
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onOpenPurchasedRecipes && onOpenPurchasedRecipes();
                          setDropdownOpen(false);
                          setMenuOpen(false);
                        }}
                      >
                        <Icon name="unlock" size={15} /> Minhas Receitas Compradas
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onOpenRecipeLocation && onOpenRecipeLocation();
                          setDropdownOpen(false);
                          setMenuOpen(false);
                        }}
                      >
                        <Icon name="mapPin" size={15} /> Localização das Receitas
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onOpenOrders && onOpenOrders();
                          setDropdownOpen(false);
                          setMenuOpen(false);
                        }}
                      >
                        <Icon name="bag" size={15} /> Meus Pedidos & Kits
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenFavorites) {
                            onOpenFavorites();
                          } else if (onFilterFavorites) {
                            onFilterFavorites();
                          }
                          setDropdownOpen(false);
                          setMenuOpen(false);
                        }}
                      >
                        <Icon name="heart" size={15} /> Minhas Receitas Favoritas
                      </button>

                      {isChefOrAdmin && (
                        <button
                          type="button"
                          className="popover-chef-link"
                          onClick={() => {
                            onOpenChefDashboard();
                            setDropdownOpen(false);
                            setMenuOpen(false);
                          }}
                        >
                          <Icon name="chef" size={15} /> Painel do Chef & Vendas
                        </button>
                      )}

                      {onOpenAdminDashboard && (
                        <button
                          type="button"
                          className="popover-chef-link"
                          onClick={() => {
                            onOpenAdminDashboard();
                            setDropdownOpen(false);
                            setMenuOpen(false);
                          }}
                        >
                          <Icon name="shieldCheck" size={15} /> Painel do Admin (Aprovar Chefs)
                        </button>
                      )}

                      <div className="popover-divider"></div>

                      <button
                        type="button"
                        className="popover-logout-btn"
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                          setMenuOpen(false);
                        }}
                      >
                        <Icon name="x" size={14} /> Sair da Conta
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
