import { useState } from "react";
import Icon from "./Icon";
import { useAuth } from "../services/AuthContext";

function formatPrice(val) {
  if (val === undefined || val === null) return "0,00";
  return Number(val).toFixed(2).replace(".", ",");
}

export default function RecipeModal({ recipe, onClose, onAddToCart }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("preparo"); // preparo, ingredientes, kit, avaliacoes

  // Delivery state
  const [cep, setCep] = useState("");
  const [freteResult, setFreteResult] = useState(null);
  const [checkingFrete, setCheckingFrete] = useState(false);

  // Reviews state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [reviewsList, setReviewsList] = useState([
    { id: 1, name: "Lucas Melo", rating: 5, comment: "Excelente receita! O vídeo explica muito bem cada etapa do preparo.", date: "Há 2 dias" },
    { id: 2, name: "Ana Paula", rating: 5, comment: "Comprei o kit de ingredientes e chegou super fresco! Recomendo.", date: "Há 1 semana" }
  ]);
  const [includeKit, setIncludeKit] = useState(false);

  const chefName = recipe.chef?.displayName || recipe.chef?.restaurant || recipe.chef || "Chef GastroMatch";
  const image = recipe.imageUrl || recipe.image || "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=900&q=80";
  const kitPrice = recipe.kitPrice ? Number(recipe.kitPrice) : 34.90;
  const recipePrice = Number(recipe.price || 29.90);

  const handleCheckFrete = (e) => {
    e.preventDefault();
    if (!cep.trim()) return;
    setCheckingFrete(true);
    setTimeout(() => {
      setCheckingFrete(false);
      setFreteResult({
        available: true,
        distanciaKm: 4.2,
        tempoMin: 35,
        valorFrete: 9.90,
        restaurante: chefName
      });
    }, 600);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setReviewsList([
      {
        id: Date.now(),
        name: user ? user.name : "Você",
        rating: newRating,
        comment: newComment,
        date: "Agora mesmo"
      },
      ...reviewsList
    ]);
    setNewComment("");
  };

  const handleAdd = () => {
    onAddToCart({
      recipe,
      includeKit,
      totalPrice: includeKit ? recipePrice + kitPrice + (freteResult?.valorFrete || 0) : recipePrice
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content recipe-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar">
          <Icon name="x" size={20} />
        </button>

        <div className="recipe-modal-header">
          <div className="recipe-modal-media">
            <img src={image} alt={recipe.title} />
            <div className="media-badge">
              <Icon name="video" size={14} /> Videoaula HD Incluída
            </div>
          </div>
          <div className="recipe-modal-info">
            <div className="chef-verified-tag">
              <Icon name="shieldCheck" size={16} /> Chef Autenticado & Validação Sanitária
            </div>
            <h2>{recipe.title}</h2>
            <p className="chef-by">Por <strong>{chefName}</strong></p>

            <div className="recipe-badges">
              <span><Icon name="star" size={14} /> {recipe.rating || "4.9"} ({recipe.reviews || "12"})</span>
              <span><Icon name="clock" size={14} /> {recipe.time || `${recipe.prepTime || 40} min`}</span>
              <span>Dificuldade: {recipe.difficulty || "Médio"}</span>
            </div>

            <div className="recipe-price-box">
              <div>
                <span className="price-label">Receita Digital + Videoaula:</span>
                <span className="price-value">R$ {formatPrice(recipePrice)}</span>
              </div>
              <div className="kit-toggle-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={includeKit}
                    onChange={(e) => setIncludeKit(e.target.checked)}
                  />
                  <span>Adicionar Kit de Ingredientes Frescos (+ R$ {formatPrice(kitPrice)})</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="recipe-modal-tabs">
          <button
            className={activeTab === "preparo" ? "active" : ""}
            onClick={() => setActiveTab("preparo")}
          >
            Modo de Preparo
          </button>
          <button
            className={activeTab === "ingredientes" ? "active" : ""}
            onClick={() => setActiveTab("ingredientes")}
          >
            Ingredientes ({recipe.ingredients?.length || 6})
          </button>
          <button
            className={activeTab === "kit" ? "active" : ""}
            onClick={() => setActiveTab("kit")}
          >
            <Icon name="truck" size={15} /> Entrega de Kit
          </button>
          <button
            className={activeTab === "avaliacoes" ? "active" : ""}
            onClick={() => setActiveTab("avaliacoes")}
          >
            Avaliações ({reviewsList.length})
          </button>
        </div>

        <div className="recipe-modal-body">
          {activeTab === "preparo" && (
            <div className="tab-content">
              <h3>Passo a Passo & Videoaula</h3>
              <p className="tab-description">
                {recipe.instructions || recipe.description || "Aprenda as técnicas exclusivas do chef para acertar a textura, tempo de cozimento e finalização perfeita do prato."}
              </p>

              <div className="step-box">
                <h4><span className="step-num">1</span> Preparação da base</h4>
                <p>Higienize os ingredientes e prepare os cortes com precisão. Aqueça a frigideira em fogo médio.</p>
              </div>
              <div className="step-box">
                <h4><span className="step-num">2</span> Cocção e ponto correto</h4>
                <p>Adicione os temperos frescos na ordem recomendada pelo chef para extrair o máximo de sabor.</p>
              </div>
              <div className="step-box">
                <h4><span className="step-num">3</span> Montagem e Empratamento</h4>
                <p>Finalize com o toque do chef e sirva imediatamente enquanto estiver bem aquecido.</p>
              </div>
            </div>
          )}

          {activeTab === "ingredientes" && (
            <div className="tab-content">
              <h3>Lista de Ingredientes</h3>
              <p className="tab-description">Tudo medido nas proporções exatas recomendadas para 2 porções.</p>
              <ul className="ingredients-list">
                <li><Icon name="check" size={16} /> 300g de ingredientes selecionados</li>
                <li><Icon name="check" size={16} /> Ervas aromáticas frescas</li>
                <li><Icon name="check" size={16} /> Caldo artesanal preparado pelo restaurante</li>
                <li><Icon name="check" size={16} /> Especiarias e temperos pré-dosados</li>
              </ul>
            </div>
          )}

          {activeTab === "kit" && (
            <div className="tab-content">
              <h3>Verificar Raio de Entrega do Kit</h3>
              <p className="tab-description">
                Kits de ingredientes são montados pelo próprio restaurante parceiro e entregues frescos na sua casa dentro do raio de atendimento.
              </p>

              <form onSubmit={handleCheckFrete} className="frete-form">
                <div className="frete-input-group">
                  <Icon name="mapPin" size={18} />
                  <input
                    type="text"
                    placeholder="Digite seu CEP (ex: 88010-000)"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                  />
                  <button type="submit" className="button button-small" disabled={checkingFrete}>
                    {checkingFrete ? "Calculando..." : "Verificar Raio"}
                  </button>
                </div>
              </form>

              {freteResult && (
                <div className="frete-success-card">
                  <div className="frete-badge"><Icon name="check" size={16} /> Endereço Atendido!</div>
                  <p>Distância do Restaurante: <strong>{freteResult.distanciaKm} km</strong></p>
                  <p>Previsão de entrega: <strong>~{freteResult.tempoMin} minutos</strong></p>
                  <p>Taxa de entrega: <strong>R$ {formatPrice(freteResult.valorFrete)}</strong></p>
                </div>
              )}
            </div>
          )}

          {activeTab === "avaliacoes" && (
            <div className="tab-content">
              <h3>Avaliações & Comunidade Gastronômica</h3>
              <form onSubmit={handleAddComment} className="add-review-form">
                <div className="rating-select">
                  <span>Sua Nota:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${star <= newRating ? "active" : ""}`}
                      onClick={() => setNewRating(star)}
                    >
                      <Icon name="star" size={18} />
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Conte como foi sua experiência ao preparar esta receita..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                />
                <button type="submit" className="button button-small button-orange">Enviar Avaliação</button>
              </form>

              <div className="reviews-list">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="review-card">
                    <div className="review-header">
                      <strong>{rev.name}</strong>
                      <span className="review-date">{rev.date}</span>
                    </div>
                    <div className="review-stars">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Icon key={i} name="star" size={14} />
                      ))}
                    </div>
                    <p>{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="recipe-modal-footer">
          <div className="modal-total">
            <span>Total:</span>
            <strong>R$ {formatPrice(includeKit ? recipePrice + kitPrice + (freteResult?.valorFrete || 0) : recipePrice)}</strong>
          </div>
          <button className="button button-orange" onClick={handleAdd}>
            <Icon name="bag" size={18} /> Adicionar à Sacola
          </button>
        </div>
      </div>
    </div>
  );
}
