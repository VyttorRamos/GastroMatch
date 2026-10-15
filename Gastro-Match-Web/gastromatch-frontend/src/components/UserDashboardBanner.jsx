import Icon from "./Icon";
import { useAuth } from "../services/AuthContext";

export default function UserDashboardBanner({
  onOpenProfile,
  onOpenOrders,
  onFilterFavorites,
  favoriteCount = 0,
  ordersCount = 0
}) {
  const { user } = useAuth();

  if (!user) return null;

  const isChef = user.role === "CHEF" || Boolean(user.chef);
  const rawName = user.chef?.displayName || user.name || "Gourmet";
  const firstName = rawName.replace(/^Chef\s+/i, "").trim().split(" ")[0] || "Gourmet";
  const prefs = user.profile?.preferences || {};
  const dietaryTags = Array.isArray(prefs.dietary) ? prefs.dietary : [];
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
                onClick={onOpenProfile}
              >
                <Icon name="fileText" size={14} /> Editar Meu Perfil
              </button>
            </div>
          </div>

          {/* 3 KPI / Shortcut Cards */}
          <div className="user-kpi-grid">
            {/* Card 1: Meus Pedidos */}
            <div className="user-kpi-card" onClick={onOpenOrders}>
              <div className="kpi-icon-wrap orange">
                <Icon name="bag" size={22} />
              </div>
              <div className="kpi-content">
                <span className="kpi-title">Meus Pedidos & Kits</span>
                <span className="kpi-metric">{ordersCount} {ordersCount === 1 ? "pedido registrado" : "pedidos registrados"}</span>
                <span className="kpi-cta">Acompanhar status de entrega →</span>
              </div>
            </div>

            {/* Card 2: Favoritos */}
            <div className="user-kpi-card" onClick={onFilterFavorites}>
              <div className="kpi-icon-wrap red">
                <Icon name="heart" size={22} />
              </div>
              <div className="kpi-content">
                <span className="kpi-title">Receitas Favoritas</span>
                <span className="kpi-metric">{favoriteCount} {favoriteCount === 1 ? "prato salvo" : "pratos salvos"}</span>
                <span className="kpi-cta">Filtrar receitas salvas →</span>
              </div>
            </div>

            {/* Card 3: Preferências e Restrições */}
            <div className="user-kpi-card" onClick={onOpenProfile}>
              <div className="kpi-icon-wrap green">
                <Icon name="check" size={22} />
              </div>
              <div className="kpi-content">
                <span className="kpi-title">Preferências & Restrições</span>
                <div className="kpi-tags-row">
                  {dietaryTags.length > 0 ? (
                    dietaryTags.slice(0, 3).map((tag) => (
                      <span key={tag} className="kpi-diet-badge">{tag}</span>
                    ))
                  ) : (
                    <span className="kpi-diet-none">Nenhuma restrição marcada</span>
                  )}
                </div>
                <span className="kpi-cta">Personalizar dieta e endereço →</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
