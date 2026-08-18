const stats = [
  ["2.5K+", "Receitas disponíveis"],
  ["850+", "Chefs verificados"],
  ["45K+", "Usuários ativos"],
  ["4.8★", "Avaliação média"]
];

export default function Stats() {
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
