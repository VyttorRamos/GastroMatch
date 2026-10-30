import Icon from "./Icon";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80";

export default function FeaturedChefs({ chefs = [], onOpenChefDashboard, onSelectChef }) {
  return (
    <section className="featured-chefs-section">
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Mestres da Gastronomia</span>
            <h2>Chefs & Restaurantes Autenticados</h2>
            <p>
              Conheça os especialistas homologados no banco de dados que compartilham receitas e preparam os kits de ingredientes. Clique para ver o perfil.
            </p>
          </div>
          <button className="button button-outline button-small" onClick={onOpenChefDashboard}>
            Quero ser um Chef <Icon name="arrow" size={16} />
          </button>
        </div>

        <div className="chefs-grid">
          {chefs.map((chef) => {
            const name = chef.displayName || chef.user?.name || chef.name;
            const restaurant = chef.restaurant || "Restaurante Parceiro";
            const specialty = (chef.description || "").split("•")[0].trim() || "Gastronomia Autoral";
            const avatar = chef.user?.avatarUrl || chef.avatar || DEFAULT_AVATAR;
            const rating = chef.rating ?? "5.0";
            const recipesCount = chef.recipesCount ?? chef._count?.recipes ?? 0;

            return (
              <div
                key={chef.id}
                className="chef-card clickable-chef-card"
                onClick={() => onSelectChef && onSelectChef(chef)}
                title={`Ver perfil de ${name}`}
              >
                <div className="chef-avatar-wrapper">
                  <img src={avatar} alt={name} />
                  <span className="verified-badge" title="Chef Validador GastroMatch">
                    <Icon name="check" size={12} />
                  </span>
                </div>
                <div className="chef-details">
                  <h3>{name}</h3>
                  <span className="chef-restaurant">{restaurant}</span>
                  <span className="chef-spec">{specialty}</span>
                  <div className="chef-stats">
                    <span>
                      <Icon name="star" size={14} /> {rating}
                    </span>
                    <span>
                      <Icon name="fileText" size={14} /> {recipesCount}{" "}
                      {recipesCount === 1 ? "Receita" : "Receitas"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
