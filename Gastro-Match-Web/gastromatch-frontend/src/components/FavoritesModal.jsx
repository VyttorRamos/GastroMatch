import Icon from "./Icon";

function formatPrice(val) {
  if (val === undefined || val === null) return "0,00";
  return Number(val).toFixed(2).replace(".", ",");
}

export default function FavoritesModal({
  favoriteIds = [],
  recipes = [],
  onClose,
  onSelectRecipe,
  onToggleFavorite
}) {
  const favoriteRecipes = recipes.filter((r) => favoriteIds.includes(r.id));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content favorites-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar">
          <Icon name="x" size={18} />
        </button>

        <div className="favorites-modal-header">
          <div className="favorites-icon-wrap">
            <Icon name="heart" size={24} />
          </div>
          <div>
            <h2>Minhas Receitas Favoritas</h2>
            <p>
              {favoriteRecipes.length === 0
                ? "Você ainda não salvou nenhuma receita como favorita."
                : `Você possui ${favoriteRecipes.length} ${favoriteRecipes.length === 1 ? "receita salva" : "receitas salvas"} para preparar.`}
            </p>
          </div>
        </div>

        <div className="favorites-modal-body">
          {favoriteRecipes.length === 0 ? (
            <div className="favorites-empty-state">
              <div className="favorites-empty-icon">
                <Icon name="heart" size={48} />
              </div>
              <h3>Nenhum prato favoritado ainda</h3>
              <p>
                Quando você encontrar uma receita ou kit que gostar no catálogo, clique no ícone de coração ❤️ para salvar aqui e acessar facilmente a qualquer momento.
              </p>
              <button
                type="button"
                className="button button-orange"
                onClick={onClose}
              >
                Explorar Catálogo de Receitas
              </button>
            </div>
          ) : (
            <div className="favorites-grid-modal">
              {favoriteRecipes.map((recipe) => (
                <div key={recipe.id} className="fav-recipe-card">
                  <div className="fav-card-image-wrap">
                    <img
                      src={recipe.imageUrl || recipe.image || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80"}
                      alt={recipe.title}
                    />
                    <button
                      type="button"
                      className="fav-remove-heart-btn"
                      title="Remover dos favoritos"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(recipe.id);
                      }}
                    >
                      <Icon name="heart" size={16} />
                    </button>
                    {recipe.hasKit && (
                      <span className="fav-kit-badge">Kit Disponível</span>
                    )}
                  </div>

                  <div className="fav-card-content">
                    <div className="fav-card-tags">
                      <span className="fav-category-tag">{recipe.category?.name || recipe.category || "Gourmet"}</span>
                      <span className="fav-time-tag">
                        <Icon name="clock" size={12} /> {recipe.prepTime ? `${recipe.prepTime} min` : (recipe.time || "30 min")}
                      </span>
                    </div>

                    <h4>{recipe.title}</h4>
                    <p className="fav-chef-author">
                      Por <strong>{recipe.chef?.displayName || recipe.chef?.restaurant || recipe.chef || "Chef GastroMatch"}</strong>
                    </p>

                    <div className="fav-card-bottom">
                      <div className="fav-price-col">
                        <span>Acesso & Aula:</span>
                        <strong>R$ {formatPrice(recipe.price)}</strong>
                      </div>

                      <button
                        type="button"
                        className="button button-small button-orange"
                        onClick={() => {
                          onClose();
                          onSelectRecipe(recipe);
                        }}
                      >
                        Ver Receita <Icon name="arrow" size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
