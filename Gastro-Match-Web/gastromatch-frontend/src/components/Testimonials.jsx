import Icon from "./Icon";

const DEFAULT_USER_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";

export default function Testimonials({ reviews = [] }) {
  const displayedReviews = reviews.filter((r) => Boolean(r.comment)).slice(0, 3);

  if (displayedReviews.length === 0) return null;

  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="section-heading centered">
          <span className="section-kicker">Comunidade & Experiências</span>
          <h2>O que dizem os amantes de culinária</h2>
          <p>Avaliações reais registradas na tabela Review pelos alunos e clientes do GastroMatch.</p>
        </div>

        <div className="testimonials-grid">
          {displayedReviews.map((item) => {
            const name = item.user?.name || "Cliente GastroMatch";
            const city = item.user?.profile?.city;
            const recipeTitle = item.recipe?.title;
            const subtitle = [
              recipeTitle ? `Avaliou: ${recipeTitle}` : "Cliente Verificado",
              city
            ]
              .filter(Boolean)
              .join(" • ");
            const avatar = item.user?.avatarUrl || DEFAULT_USER_AVATAR;
            const stars = Number(item.rating || 5);

            return (
              <div key={item.id} className="testimonial-card">
                <div className="testimonial-stars">
                  {Array.from({ length: stars }).map((_, idx) => (
                    <Icon key={idx} name="star" size={16} />
                  ))}
                </div>
                <p className="testimonial-quote">&ldquo;{item.comment}&rdquo;</p>
                <div className="testimonial-author">
                  <img src={avatar} alt={name} />
                  <div>
                    <strong>{name}</strong>
                    <span>{subtitle}</span>
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
