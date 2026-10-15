import Icon from "./Icon";

const chefsData = [
  {
    id: 1,
    name: "Chef Gabriel Camillo",
    specialty: "Culinária Italiana & Risotos",
    rating: "4.8",
    recipesCount: 14,
    avatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80",
    restaurant: "Trattoria Camillo"
  },
  {
    id: 2,
    name: "Chef Otavio de Deus",
    specialty: "Gastronomia Brasileira Gourmet",
    rating: "4.95",
    recipesCount: 22,
    avatar: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=400&q=80",
    restaurant: "Sabor & Tradição SC"
  },
  {
    id: 3,
    name: "Chef Yasmin Lobo",
    specialty: "Pâtisserie & Sobremesas Finas",
    rating: "4.9",
    recipesCount: 18,
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    restaurant: "Lobo Confeitaria"
  },
  {
    id: 4,
    name: "Chef Yuki Tanaka",
    specialty: "Culinária Japonesa & Omakase",
    rating: "4.85",
    recipesCount: 12,
    avatar: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=400&q=80",
    restaurant: "Yuki Fusion"
  }
];

export default function FeaturedChefs({ onOpenChefDashboard, onSelectChef }) {
  return (
    <section className="featured-chefs-section">
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Mestres da Gastronomia</span>
            <h2>Chefs & Restaurantes Autenticados</h2>
            <p>Conheça os especialistas validados que compartilham receitas e preparam os kits de ingredientes. Clique para ver o perfil.</p>
          </div>
          <button className="button button-outline button-small" onClick={onOpenChefDashboard}>
            Quero ser um Chef <Icon name="arrow" size={16} />
          </button>
        </div>

        <div className="chefs-grid">
          {chefsData.map((chef) => (
            <div
              key={chef.id}
              className="chef-card clickable-chef-card"
              onClick={() => onSelectChef && onSelectChef(chef)}
              title={`Ver perfil de ${chef.name}`}
            >
              <div className="chef-avatar-wrapper">
                <img src={chef.avatar} alt={chef.name} />
                <span className="verified-badge" title="Chef Validador GastroMatch">
                  <Icon name="check" size={12} />
                </span>
              </div>
              <div className="chef-details">
                <h3>{chef.name}</h3>
                <span className="chef-restaurant">{chef.restaurant}</span>
                <span className="chef-spec">{chef.specialty}</span>
                <div className="chef-stats">
                  <span><Icon name="star" size={14} /> {chef.rating}</span>
                  <span><Icon name="fileText" size={14} /> {chef.recipesCount} Receitas</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
