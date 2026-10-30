import Icon from "./Icon";

function formatPrice(value) {
  if (value === undefined || value === null) return "0,00";
  return Number(value).toFixed(2).replace(".", ",");
}

export function getRecipeDisplayImage(recipe) {
  if (recipe?.imageUrl) return recipe.imageUrl;
  if (recipe?.image) return recipe.image;
  const text = `${recipe?.title || ""} ${recipe?.category?.name || recipe?.category || ""}`.toLowerCase();
  if (text.includes("pappardelle") || text.includes("ragu") || text.includes("cordeiro") || text.includes("massa")) {
    return "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80";
  }
  if (text.includes("sushi") || text.includes("japonesa") || text.includes("omakase")) {
    return "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80";
  }
  if (text.includes("doce") || text.includes("sobremesa") || text.includes("chocolate") || text.includes("gateau")) {
    return "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80";
  }
  return "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=900&q=80";
}

export default function RecipeCard({
  recipe,
  onSelect,
  isFavorite = false,
  onToggleFavorite,
  isPurchased = false
}) {
  const rating = recipe.rating ?? "5.0";
  const reviews =
    recipe.reviewsCount ??
    recipe._count?.reviews ??
    (Array.isArray(recipe.reviews) ? recipe.reviews.length : recipe.reviews ?? 0);
  const time = recipe.time ?? `${recipe.prepTime ?? 40} min`;
  const difficultyMap = { EASY: "Fácil", MEDIUM: "Médio", HARD: "Difícil" };
  const difficulty = difficultyMap[recipe.difficulty] || recipe.difficulty || "Médio";
  const chef = recipe.chef?.displayName || recipe.chef?.restaurant || recipe.chef || "GastroMatch";
  const image = getRecipeDisplayImage(recipe);
  const hasKit = Boolean(recipe.hasKit);

  return (
    <article className={`recipe-card ${isPurchased ? "recipe-card-purchased" : ""}`} onClick={() => onSelect && onSelect(recipe)}>
      <div className="recipe-image">
        <img src={image} alt={recipe.title} loading="lazy" />
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
        <div className="recipe-body-top-row">
          <span className="recipe-chef">{chef}</span>
          {isPurchased ? (
            <span className="card-access-pill unlocked">
              <Icon name="check" size={11} /> Liberada
            </span>
          ) : (
            <span className="card-access-pill locked">
              <Icon name="lock" size={11} /> Exclusiva
            </span>
          )}
        </div>

        <h3>{recipe.title}</h3>

        <div className="recipe-meta">
          <span><Icon name="star" size={14} stroke={1.8} /> {rating} <small>({reviews})</small></span>
          <span><Icon name="clock" size={14} /> {time}</span>
          <span>{difficulty}</span>
        </div>

        <button className="recipe-button" onClick={(e) => { e.stopPropagation(); onSelect && onSelect(recipe); }}>
          {isPurchased ? (
            <>Acessar receita <Icon name="unlock" size={14} /></>
          ) : (
            <>Comprar & acessar <Icon name="arrow" size={15} /></>
          )}
        </button>
      </div>
    </article>
  );
}
