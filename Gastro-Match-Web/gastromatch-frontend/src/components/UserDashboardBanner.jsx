import Icon from "./Icon";
import { useAuth } from "../services/AuthContext";

export default function UserDashboardBanner({
  onOpenProfile,
  onOpenOrders,
  onOpenPurchasedRecipes,
  onOpenRecipeLocation,
  onOpenFavorites,
  onFilterFavorites,
  favoriteCount = 0,
  ordersCount = 0,
  purchasedCount = 0
}) {
  const { user } = useAuth();

  if (!user) return null;

  const isChef = user.role === "CHEF" || Boolean(user.chef);
  const rawName = user.chef?.displayName || user.name || "Gourmet";
  const firstName = rawName.replace(/^Chef\s+/i, "").trim().split(" ")[0] || "Gourmet";
  const prefs = user.profile?.preferences || {};
  const addressCity = user.profile?.city || prefs.address?.city;
  const addressState = user.profile?.state || prefs.address?.state;

  return (
    <section className="user-dashboard-banner">
      <div className="container">
        <div className="user-banner-card">
          {/* Top greeting row */}
          <div className="user-banner-top">
            <div className="user-profile-badge-row">
              <div className="user-avatar-circle" onClick={onOpenProfile} title="Ver meu perfil">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} />
                ) : (
                  <span>{firstName.charAt(0).toUpperCase()}</span>
                )}
              </div>

              <div className="user-banner-texts">
                <div className="user-welcome-title">
                  <h2>Bem-vindo(a) de volta, <span>{firstName}</span>!</h2>
                  <span className={`user-role-pill ${isChef ? "chef" : "client"}`}>
                    <Icon name={isChef ? "chef" : "shieldCheck"} size={13} />
                    {isChef ? "Chef & Restaurante" : "Cliente Gourmet"}
                  </span>
                </div>
                <p className="user-welcome-sub">
                  Sua central gastronômica personalizada no GastroMatch.
                  {addressCity && addressState ? (
                    <> Entrega padrão em <strong>{addressCity}, {addressState}</strong>.</>
                  ) : (
                    <> Complete seu perfil para agilizar o frete dos kits de insumos.</>
                  )}
                </p>
              </div>
            </div>

            <div className="user-banner-quick-actions">
              <button
                type="button"
                className="button button-small button-outline btn-edit-profile-hero"
                onClick={onOpenOrders}
              >
                <Icon name="bag" size={14} /> Histórico de Pedidos ({ordersCount})
              </button>
              <button
                type="button"
                className="button button-small button-outline btn-edit-profile-hero"
                onClick={onOpenProfile}
              >
                <Icon name="fileText" size={14} /> Editar Meu Perfil
              </button>
            </div>
          </div>

          {/* 3 KPI / Shortcut Cards */}
          <div className="user-kpi-grid">
            {/* Card 1: Minhas Receitas Compradas */}
            <div className="user-kpi-card" onClick={onOpenPurchasedRecipes}>
              <div className="kpi-icon-wrap green">
                <Icon name="unlock" size={22} />
              </div>
              <div className="kpi-content">
                <span className="kpi-title">Minhas Receitas Compradas</span>
                <span className="kpi-metric">
                  {purchasedCount} {purchasedCount === 1 ? "receita desbloqueada" : "receitas desbloqueadas"}
                </span>
                <span className="kpi-cta">Ver modo de preparo e aulas →</span>
              </div>
            </div>

            {/* Card 2: Localização das Receitas Compradas */}
            <div className="user-kpi-card" onClick={onOpenRecipeLocation}>
              <div className="kpi-icon-wrap orange">
                <Icon name="mapPin" size={22} />
              </div>
              <div className="kpi-content">
                <span className="kpi-title">Localização das Receitas</span>
                <span className="kpi-metric">
                  {purchasedCount > 0 ? "Rastreio & endereço do chef ativos" : "Compre uma receita para localizar"}
                </span>
                <span className="kpi-cta">Ver onde está a receita no mapa →</span>
              </div>
            </div>

            {/* Card 3: Favoritos */}
            <div className="user-kpi-card" onClick={onOpenFavorites || onFilterFavorites}>
              <div className="kpi-icon-wrap red">
                <Icon name="heart" size={22} />
              </div>
              <div className="kpi-content">
                <span className="kpi-title">Receitas Favoritas</span>
                <span className="kpi-metric">{favoriteCount} {favoriteCount === 1 ? "prato salvo" : "pratos salvos"}</span>
                <span className="kpi-cta">Ver lista de desejos →</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
