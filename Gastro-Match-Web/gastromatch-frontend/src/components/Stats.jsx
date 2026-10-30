export default function Stats({ recipes = [], chefs = [], reviews = [] }) {
  const recipesCount = recipes.length;
  const chefsCount = chefs.length;
  const reviewsCount = reviews.length;

  const avgRating =
    reviewsCount > 0
      ? (
          reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0) / reviewsCount
        ).toFixed(1)
      : "5.0";

  const stats = [
    [String(recipesCount), "Receitas disponíveis"],
    [String(chefsCount), "Chefs verificados"],
    [String(reviewsCount), "Avaliações registradas"],
    [`${avgRating}★`, "Avaliação média"]
  ];

  return (
    <section className="stats-section">
      <div className="container stats-grid">
        {stats.map(([value, label]) => (
          <div className="stat" key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
