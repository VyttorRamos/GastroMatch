export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <a className="brand brand-footer" href="/">
            <span className="brand-mark">GM</span>
            <span>GastroMatch</span>
          </a>
          <p>Conectando pessoas a chefs e restaurantes para experiências gastronômicas autênticas.</p>
        </div>

        <div>
          <h4>Navegação</h4>
          <a href="#receitas">Explorar</a>
          <a href="#receitas">Minhas receitas</a>
          <a href="#como-funciona">Como funciona</a>
        </div>

        <div>
          <h4>Para chefs</h4>
          <a href="/">Seja um chef</a>
          <a href="/">Guia de criadores</a>
        </div>

        <div>
          <h4>Legal</h4>
          <a href="/">Privacidade</a>
          <a href="/">Termos de uso</a>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© 2026 GastroMatch. Todos os direitos reservados.</span>
        <span>Feito para quem ama cozinhar.</span>
      </div>
    </footer>
  );
}
