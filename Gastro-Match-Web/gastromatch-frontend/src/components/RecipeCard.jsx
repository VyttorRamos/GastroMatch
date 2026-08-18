import Icon from "./Icon";

export default function RecipeCard({ recipe }) {
  return (
    <article className="recipe-card">
      <div className="recipe-image">
        <img src={recipe.image} alt={recipe.title} loading="lazy" />
        <span className="price">R$ {recipe.price}</span>
      </div>

      <div className="recipe-body">
        <span className="recipe-chef">{recipe.chef}</span>
        <h3>{recipe.title}</h3>

        <div className="recipe-meta">
          <span><Icon name="star" size={14} stroke={1.8} /> {recipe.rating} <small>({recipe.reviews})</small></span>
          <span><Icon name="clock" size={14} /> {recipe.time}</span>
          <span>{recipe.difficulty}</span>
        </div>

        <button className="recipe-button">
          Ver receita <Icon name="arrow" size={15} />
        </button>
      </div>
    </article>
  );
}
