import Icon from "./Icon";

function formatPrice(value) {
  if (value === undefined || value === null) return "0,00";
  return Number(value).toFixed(2).replace(".", ",");
}

export default function RecipeCard({ recipe, onSelect, isFavorite = false, onToggleFavorite }) {
  const rating = recipe.rating ?? "—";
  const reviews = recipe.reviews ?? recipe._count?.reviews ?? 0;
  const time = recipe.time ?? `${recipe.prepTime ?? 0} min`;
  const difficultyMap = { EASY: "Fácil", MEDIUM: "Médio", HARD: "Difícil" };
  const difficulty = difficultyMap[recipe.difficulty] || recipe.difficulty || "—";
  const chef = recipe.chef?.displayName || recipe.chef?.restaurant || recipe.chef || "GastroMatch";
  const image = recipe.imageUrl || recipe.image;
  const hasKit = Boolean(recipe.hasKit);

  return (
    <article className="recipe-card" onClick={() => onSelect && onSelect(recipe)}>
      <div className="recipe-image">
        {image ? (
          <img src={image} alt={recipe.title} loading="lazy" />
        ) : (
          <div className="recipe-image-placeholder">GastroMatch</div>
        )}
        <span className="price">R$ {formatPrice(recipe.price)}</span>

        {hasKit && (
          <span className="card-has-kit-pill">
            <Icon name="box" size={12} /> Kit de Insumos
          </span>
        )}

        <button
          type="button"
          className={`card-heart-btn ${isFavorite ? "favorited" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite && onToggleFavorite(recipe.id);
          }}
          title={isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
          aria-label={isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
        >
          <Icon name="heart" size={16} />
        </button>
      </div>

      <div className="recipe-body">
        <span className="recipe-chef">{chef}</span>
        <h3>{recipe.title}</h3>

        <div className="recipe-meta">
          <span><Icon name="star" size={14} stroke={1.8} /> {rating} <small>({reviews})</small></span>
          <span><Icon name="clock" size={14} /> {time}</span>
          <span>{difficulty}</span>
        </div>

        <button className="recipe-button" onClick={(e) => { e.stopPropagation(); onSelect && onSelect(recipe); }}>
          Ver receita <Icon name="arrow" size={15} />
        </button>
      </div>
    </article>
  );
}
