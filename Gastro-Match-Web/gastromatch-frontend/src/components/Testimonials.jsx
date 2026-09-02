import Icon from "./Icon";

const testimonials = [
  {
    id: 1,
    name: "Mariana Costa",
    role: "Cozinheira Amadora • Florianópolis",
    text: "O GastroMatch mudou meus jantares de fim de semana! Comprei o kit de Risoto do Chef Gabriel e assisti à videoaula. Parecia um prato de restaurante 5 estrelas!",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 2,
    name: "Rodrigo Almeida",
    role: "Entusiasta de Gastronomia • Itajaí",
    text: "Poder receber os ingredientes na porção exata direto do restaurante e aprender o passo a passo com o chef faz toda a diferença. Sem desperdício e com sabor perfeito.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 3,
    name: "Camila & Vinicius",
    role: "Casal Gourmet • São José",
    text: "Fizemos a noite dos Tacos al Pastor acompanhando a aula. O kit chegou super rápido dentro do nosso raio de entrega e foi uma experiência divertida e deliciosa!",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80"
  }
];

export default function Testimonials() {
  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="section-heading centered">
          <span className="section-kicker">Comunidade & Experiências</span>
          <h2>O que dizem os amantes de culinária</h2>
          <p>Depoimentos de quem transformou a própria cozinha com os chefs do GastroMatch.</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((item) => (
            <div key={item.id} className="testimonial-card">
              <div className="testimonial-stars">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Icon key={s} name="star" size={16} />
                ))}
              </div>
              <p className="testimonial-quote">"{item.text}"</p>
              <div className="testimonial-author">
                <img src={item.avatar} alt={item.name} />
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
