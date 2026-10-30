import { useState, useEffect } from "react";
import Icon from "./Icon";
import { useAuth } from "../services/AuthContext";
import { api } from "../services/api";
import { resolveChefLocation } from "./RecipeLocationModal";
import { getRecipeDisplayImage } from "./RecipeCard";

function formatPrice(val) {
  if (val === undefined || val === null) return "0,00";
  return Number(val).toFixed(2).replace(".", ",");
}

export default function RecipeModal({
  recipe,
  isPurchased = false,
  isFavorite = false,
  onToggleFavorite,
  onClose,
  onAddToCart,
  onBuyNow,
  onRequireAuth,
  onOpenLocation,
  onOpenPurchasedRecipes
}) {
  const { user, showAlert } = useAuth();
  const [activeTab, setActiveTab] = useState("preparo"); // preparo, ingredientes, localizacao, kit, avaliacoes

  // Delivery state
  const [cep, setCep] = useState("");
  const [freteResult, setFreteResult] = useState(null);
  const [checkingFrete, setCheckingFrete] = useState(false);

  // Reviews state (carregado diretamente da tabela Review no banco)
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [reviewsList, setReviewsList] = useState(() =>
    Array.isArray(recipe?.reviews)
      ? recipe.reviews.map((r) => ({
          id: r.id,
          name: r.user?.name || "Cliente GastroMatch",
          rating: r.rating,
          comment: r.comment,
          date: r.createdAt ? new Date(r.createdAt).toLocaleDateString("pt-BR") : "Recente"
        }))
      : []
  );
  const [includeKit, setIncludeKit] = useState(false);

  const hasAccess = Boolean(user && isPurchased);
  const locationInfo = resolveChefLocation(recipe);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [recipe?.id, recipe?.title]);

  useEffect(() => {
    if (recipe?.id) {
      api.reviews(recipe.id)
        .then((data) => {
          if (Array.isArray(data)) {
            setReviewsList(
              data.map((r) => ({
                id: r.id,
                name: r.user?.name || "Cliente GastroMatch",
                rating: r.rating,
                comment: r.comment,
                date: r.createdAt ? new Date(r.createdAt).toLocaleDateString("pt-BR") : "Recente"
              }))
            );
          }
        })
        .catch(() => {});
    }
  }, [recipe?.id]);

  const chefName = recipe.chef?.displayName || recipe.chef?.restaurant || recipe.chef || "Chef GastroMatch";
  const categoryName = recipe.category?.name || recipe.category || "Gastronomia Autoral";
  const difficultyMap = { EASY: "Fácil", MEDIUM: "Médio", HARD: "Difícil" };
  const difficultyLabel = difficultyMap[recipe.difficulty] || recipe.difficulty || "Médio";
  const image = getRecipeDisplayImage(recipe);
  const kitPrice = recipe.kitPrice ? Number(recipe.kitPrice) : 34.90;
  const recipePrice = Number(recipe.price || 29.90);
  const currentTotal = includeKit
    ? recipePrice + kitPrice + (freteResult?.valorFrete || 0)
    : recipePrice;

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
      showAlert && showAlert("Frete e tempo de entrega calculados para o seu CEP!", "success");
    }, 600);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const optReview = {
      id: Date.now(),
      name: user ? user.name : "Você",
      rating: newRating,
      comment: newComment,
      date: "Hoje"
    };

    setReviewsList((prev) => [optReview, ...prev]);
    const commentToSend = newComment;
    const ratingToSend = newRating;
    setNewComment("");
    showAlert && showAlert("Sua avaliação foi publicada com sucesso!", "success");

    if (user && recipe?.id) {
      try {
        await api.createReview(recipe.id, ratingToSend, commentToSend);
      } catch (err) {
        console.warn("Erro ao salvar avaliação:", err);
      }
    }
  };

  const handleAdd = () => {
    if (!user) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    onAddToCart({
      recipe,
      includeKit,
      totalPrice: currentTotal
    });
  };

  const handleInstantBuy = () => {
    if (!user) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    const item = {
      recipe,
      includeKit,
      totalPrice: currentTotal
    };
    if (onBuyNow) {
      onBuyNow(item);
    } else {
      onAddToCart(item);
    }
  };

  const renderPaywall = (sectionLabel) => (
    <div className="recipe-paywall-card">
      <div className="paywall-icon-circle">
        <Icon name="lock" size={28} />
      </div>

      {!user ? (
        <>
          <span className="paywall-kicker">Acesso Restrito • Login + Compra Obrigatórios</span>
          <h4>Faça login e adquira esta receita para acessar {sectionLabel}</h4>
          <p>
            No GastroMatch, o conteúdo autoral completo do chef (modo de preparo detalhado, medidas exatas de ingredientes, videoaula em HD e localização da receita) é liberado exclusivamente para usuários logados que efetuaram o pagamento da receita.
          </p>
          <div className="paywall-benefits-row">
            <span><Icon name="check" size={14} /> Passo a Passo Completo</span>
            <span><Icon name="check" size={14} /> Ficha Técnica de Ingredientes</span>
            <span><Icon name="check" size={14} /> Videoaula + Localização</span>
          </div>
          <div className="paywall-actions">
            <button
              type="button"
              className="button button-orange"
              onClick={() => onRequireAuth && onRequireAuth()}
            >
              <Icon name="lock" size={16} /> Entrar na Minha Conta para Comprar
            </button>
          </div>
        </>
      ) : (
        <>
          <span className="paywall-kicker">Conteúdo Bloqueado • Pagamento Necessário</span>
          <h4>Compre esta receita para desbloquear {sectionLabel}</h4>
          <p>
            Olá, <strong>{user.name}</strong>! Você ainda não comprou <strong>{recipe.title}</strong>. Efetue o pagamento de <strong>R$ {formatPrice(currentTotal)}</strong> para liberar imediatamente o acesso vitalício à receita completa, videoaula e localização do restaurante do chef.
          </p>
          <div className="paywall-benefits-row">
            <span><Icon name="check" size={14} /> Liberação Imediata após Pagamento</span>
            <span><Icon name="check" size={14} /> Acesso em &quot;Minhas Receitas Compradas&quot;</span>
            <span><Icon name="check" size={14} /> Rastreio & Localização da Receita</span>
          </div>
          <div className="paywall-actions">
            <button
              type="button"
              className="button button-orange"
              onClick={handleInstantBuy}
            >
              <Icon name="unlock" size={16} /> Pagar e Liberar Receita Agora • R$ {formatPrice(currentTotal)}
            </button>
            <button
              type="button"
              className="button button-outline"
              onClick={handleAdd}
            >
              <Icon name="bag" size={16} /> Adicionar à Sacola
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <section className="recipe-fullpage-section">
      <div className="container">
        {/* Top Breadcrumb & Back Bar */}
        <div className="recipe-fullpage-topbar">
          <button type="button" className="recipe-back-btn" onClick={onClose}>
            <Icon name="arrowLeft" size={18} /> Voltar para o Catálogo de Receitas
          </button>

          <div className="recipe-topbar-right">
            <span className="recipe-category-crumb">{categoryName}</span>
            {onToggleFavorite && (
              <button
                type="button"
                className={`recipe-fav-pill-btn ${isFavorite ? "active" : ""}`}
                onClick={() => onToggleFavorite(recipe.id)}
              >
                <Icon name="heart" size={15} /> {isFavorite ? "Salva nos Favoritos" : "Favoritar"}
              </button>
            )}
          </div>
        </div>

        {/* Full-Page Grid: Main Content + Sticky Sidebar */}
        <div className="recipe-fullpage-layout">
          {/* Hero Dish Card */}
          <div className="recipe-fullpage-hero-card">
              <div className="recipe-fullpage-media">
                <img src={image} alt={recipe.title} />
                <div className={`media-badge ${hasAccess ? "unlocked" : "locked"}`}>
                  {hasAccess ? (
                    <>
                      <Icon name="unlock" size={14} /> Receita Comprada & Desbloqueada
                    </>
                  ) : (
                    <>
                      <Icon name="lock" size={14} /> Conteúdo Exclusivo • Requer Compra
                    </>
                  )}
                </div>
              </div>

              <div className="recipe-fullpage-hero-body">
                <div className="recipe-header-tags-row">
                  <div className="chef-verified-tag">
                    <Icon name="shieldCheck" size={16} /> Chef Autenticado & Validação Sanitária
                  </div>
                  {hasAccess && (
                    <div className="recipe-purchased-header-tag">
                      <Icon name="check" size={14} /> Acesso Liberado na Sua Conta
                    </div>
                  )}
                </div>

                <h1>{recipe.title}</h1>
                <p className="chef-by">
                  Criada por <strong>{chefName}</strong> • {locationInfo.restaurant}
                </p>

                <p className="recipe-fullpage-lead">
                  {recipe.description || "Aprenda as técnicas exclusivas do chef para acertar a textura, tempo de cozimento e finalização perfeita do prato."}
                </p>

                <div className="recipe-fullpage-stats-bar">
                  <div className="fp-stat-item">
                    <Icon name="star" size={18} />
                    <div>
                      <strong>
                        {recipe.rating || "5.0"} (
                        {recipe.reviewsCount ??
                          recipe._count?.reviews ??
                          reviewsList.length}
                        )
                      </strong>
                      <span>Avaliação</span>
                    </div>
                  </div>
                  <div className="fp-stat-item">
                    <Icon name="clock" size={18} />
                    <div>
                      <strong>{recipe.time || `${recipe.prepTime || 40} min`}</strong>
                      <span>Tempo de Preparo</span>
                    </div>
                  </div>
                  <div className="fp-stat-item">
                    <Icon name="chef" size={18} />
                    <div>
                      <strong>{difficultyLabel}</strong>
                      <span>Dificuldade</span>
                    </div>
                  </div>
                  <div className="fp-stat-item">
                    <Icon name="store" size={18} />
                    <div>
                      <strong>{recipe.servings || 2} porções</strong>
                      <span>Rendimento</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          <div className="recipe-fullpage-tabs-section">
            {/* Navigation Tabs */}
            <div className="recipe-fullpage-tabs">
              <button
                type="button"
                className={activeTab === "preparo" ? "active" : ""}
                onClick={() => setActiveTab("preparo")}
              >
                <Icon name={hasAccess ? "unlock" : "lock"} size={15} /> Modo de Preparo & Videoaula
              </button>
              <button
                type="button"
                className={activeTab === "ingredientes" ? "active" : ""}
                onClick={() => setActiveTab("ingredientes")}
              >
                <Icon name={hasAccess ? "unlock" : "lock"} size={15} /> Ingredientes ({recipe.ingredients?.length || 6})
              </button>
              <button
                type="button"
                className={activeTab === "localizacao" ? "active" : ""}
                onClick={() => setActiveTab("localizacao")}
              >
                <Icon name="mapPin" size={15} /> Localização da Receita
              </button>
              <button
                type="button"
                className={activeTab === "kit" ? "active" : ""}
                onClick={() => setActiveTab("kit")}
              >
                <Icon name="truck" size={15} /> Entrega de Kit Físico
              </button>
              <button
                type="button"
                className={activeTab === "avaliacoes" ? "active" : ""}
                onClick={() => setActiveTab("avaliacoes")}
              >
                <Icon name="star" size={15} /> Avaliações ({reviewsList.length})
              </button>
            </div>

            {/* Tab Content Area */}
            <div className="recipe-fullpage-content-box">
              {activeTab === "preparo" && (
                <div className="tab-content">
                  <h3>Passo a Passo Completo & Videoaula do Chef</h3>
                  {hasAccess ? (
                    <>
                      {recipe.instructions && (
                        <p className="tab-description">{recipe.instructions}</p>
                      )}

                      {recipe.videoUrl && (
                        <div className="videoaula-card-box">
                          <div className="videoaula-header">
                            <Icon name="video" size={18} />
                            <span>Videoaula Prática do Chef • Acesso Liberado</span>
                          </div>
                          <a
                            href={recipe.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="button button-small button-orange"
                          >
                            <Icon name="play" size={16} /> Assistir Videoaula Exclusiva
                          </a>
                        </div>
                      )}

                    </>
                  ) : (
                    renderPaywall("o Modo de Preparo e a Videoaula")
                  )}
                </div>
              )}

              {activeTab === "ingredientes" && (
                <div className="tab-content">
                  <h3>Ficha Técnica de Ingredientes</h3>
                  {hasAccess ? (
                    <>
                      <p className="tab-description">
                        Insumos frescos e medidas recomendadas para {recipe.servings || 2} porções com qualidade de restaurante:
                      </p>
                      <ul className="ingredients-list">
                        {recipe.ingredients && recipe.ingredients.length > 0 ? (
                          recipe.ingredients.map((item, idx) => (
                            <li key={item.id || idx} className="ingredient-row-card">
                              <div className="ing-left">
                                <span className="ing-check-badge">
                                  <Icon name="check" size={14} />
                                </span>
                                <strong className="ing-name">{item.ingredient?.name || item.name}</strong>
                              </div>
                              {item.quantity && <span className="ing-qty-badge">{item.quantity}</span>}
                            </li>
                          ))
                        ) : (
                          <>
                            <li className="ingredient-row-card">
                              <div className="ing-left">
                                <span className="ing-check-badge"><Icon name="check" size={14} /></span>
                                <strong className="ing-name">Insumos frescos selecionados</strong>
                              </div>
                              <span className="ing-qty-badge">Porção artesanal</span>
                            </li>
                            <li className="ingredient-row-card">
                              <div className="ing-left">
                                <span className="ing-check-badge"><Icon name="check" size={14} /></span>
                                <strong className="ing-name">Temperos e especiarias do chef</strong>
                              </div>
                              <span className="ing-qty-badge">Pré-dosados</span>
                            </li>
                            <li className="ingredient-row-card">
                              <div className="ing-left">
                                <span className="ing-check-badge"><Icon name="check" size={14} /></span>
                                <strong className="ing-name">Molho e caldo da casa</strong>
                              </div>
                              <span className="ing-qty-badge">Redução artesanal</span>
                            </li>
                          </>
                        )}
                      </ul>
                    </>
                  ) : (
                    renderPaywall("a Lista Completa de Ingredientes e Quantidades")
                  )}
                </div>
              )}

              {activeTab === "localizacao" && (
                <div className="tab-content">
                  <h3>Localização da Receita & Rastreamento</h3>
                  {hasAccess ? (
                    <div className="fp-location-unlocked-box">
                      <div className="visual-route-banner" style={{ borderRadius: 12, border: "1px solid #ece4ce", marginBottom: 16 }}>
                        <div className="route-point origin">
                          <div className="route-pin-icon chef">
                            <Icon name="store" size={18} />
                          </div>
                          <div>
                            <small>RESTAURANTE DE ORIGEM DA RECEITA</small>
                            <strong>{locationInfo.restaurant}</strong>
                            <span>{locationInfo.street} • {locationInfo.city} (CEP {locationInfo.zipCode})</span>
                          </div>
                        </div>

                        <div className="route-connector">
                          <div className="route-truck-badge">
                            <Icon name="truck" size={15} /> {locationInfo.distance} ({locationInfo.eta})
                          </div>
                        </div>

                        <div className="route-point destination">
                          <div className="route-pin-icon client">
                            <Icon name="mapPin" size={18} />
                          </div>
                          <div>
                            <small>SEU ENDEREÇO DE ENTREGA</small>
                            <strong>{user?.name}</strong>
                            <span>{user?.profile?.city || "Florianópolis"} - {user?.profile?.state || "SC"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="embedded-map-frame" style={{ borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
                        <iframe
                          title={`Mapa - ${recipe.title}`}
                          width="100%"
                          height="240"
                          style={{ border: 0 }}
                          loading="lazy"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${locationInfo.lng - 0.015}%2C${locationInfo.lat - 0.01}%2C${locationInfo.lng + 0.015}%2C${locationInfo.lat + 0.01}&layer=mapnik&marker=${locationInfo.lat}%2C${locationInfo.lng}`}
                        />
                      </div>

                      {onOpenLocation && (
                        <button
                          type="button"
                          className="button button-orange"
                          onClick={() => onOpenLocation({ recipe })}
                        >
                          <Icon name="mapPin" size={16} /> Abrir Painel Completo de Rastreamento & Localização
                        </button>
                      )}
                    </div>
                  ) : (
                    renderPaywall("a Localização Oficial e o Rastreamento da Receita")
                  )}
                </div>
              )}

              {activeTab === "kit" && (
                <div className="tab-content">
                  <h3>Kit Físico de Ingredientes Frescos</h3>
                  <p className="tab-description">
                    {recipe.kitDescription || "Kits de ingredientes são montados pelo próprio restaurante parceiro e entregues frescos na sua casa dentro do raio de atendimento."}
                  </p>

                  <div className="kit-summary-box">
                    <div className="kit-summary-item">
                      <span>Valor do Kit:</span>
                      <strong>R$ {formatPrice(kitPrice)}</strong>
                    </div>
                    <div className="kit-summary-item">
                      <span>Estoque do Restaurante:</span>
                      <strong>{recipe.kitStock || 15} unidades</strong>
                    </div>
                    <div className="kit-summary-item">
                      <span>Conservação:</span>
                      <strong>Embalagem Térmica / Vácuo</strong>
                    </div>
                  </div>

                  <h4 className="frete-subhead"><Icon name="truck" size={16} /> Simular Entrega por CEP</h4>
                  <form onSubmit={handleCheckFrete} className="frete-form">
                    <div className="frete-input-group">
                      <Icon name="mapPin" size={18} />
                      <input
                        type="text"
                        placeholder="Digite seu CEP (ex: 12000-000)"
                        value={cep}
                        onChange={(e) => setCep(e.target.value)}
                      />
                      <button type="submit" className="button button-small" disabled={checkingFrete}>
                        {checkingFrete ? "Calculando..." : "Calcular Frete"}
                      </button>
                    </div>
                  </form>

                  {freteResult && (
                    <div className="frete-success-card">
                      <div className="frete-badge"><Icon name="check" size={16} /> Endereço Atendido!</div>
                      <p>Distância do Restaurante: <strong>{freteResult.distanciaKm} km</strong></p>
                      <p>Previsão de entrega: <strong>~{freteResult.tempoMin} minutos (Entrega Expressa)</strong></p>
                      <p>Taxa de entrega refrigerada: <strong>R$ {formatPrice(freteResult.valorFrete)}</strong></p>
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
          </div>

          {/* Right Column: Sticky Purchase / Access Sidebar */}
          <aside className="recipe-fullpage-sidebar">
            <div className="recipe-sidebar-card">
              {hasAccess ? (
                <>
                  <div className="sidebar-unlocked-badge">
                    <Icon name="unlock" size={18} />
                    <div>
                      <strong>Receita Adquirida!</strong>
                      <span>Acesso vitalício liberado para {user?.name}</span>
                    </div>
                  </div>

                  <div className="sidebar-location-preview">
                    <span className="detail-kicker">
                      <Icon name="mapPin" size={13} /> Origem da Receita
                    </span>
                    <strong>{locationInfo.restaurant}</strong>
                    <p>{locationInfo.street} • {locationInfo.city}</p>
                    <small>Tempo estimado do kit: {locationInfo.eta}</small>
                  </div>

                  <div className="sidebar-actions-stack">
                    {onOpenLocation && (
                      <button
                        type="button"
                        className="button button-orange button-full"
                        onClick={() => onOpenLocation({ recipe })}
                      >
                        <Icon name="mapPin" size={16} /> Ver Localização & Rastreio
                      </button>
                    )}

                    {onOpenPurchasedRecipes && (
                      <button
                        type="button"
                        className="button button-outline button-full"
                        onClick={onOpenPurchasedRecipes}
                      >
                        <Icon name="book" size={16} /> Minhas Receitas Compradas
                      </button>
                    )}

                    <button
                      type="button"
                      className="button button-small button-outline button-full"
                      onClick={handleAdd}
                    >
                      <Icon name="bag" size={15} /> Pedir Kit de Ingredientes Novamente
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="sidebar-kicker">Acesso à Receita & Aula</span>
                  <div className="sidebar-price-row">
                    <span>Receita Digital + Videoaula</span>
                    <strong>R$ {formatPrice(recipePrice)}</strong>
                  </div>

                  {recipe.hasKit !== false && (
                    <label className="sidebar-kit-toggle">
                      <input
                        type="checkbox"
                        checked={includeKit}
                        onChange={(e) => setIncludeKit(e.target.checked)}
                      />
                      <div>
                        <strong>+ Kit Físico de Ingredientes</strong>
                        <span>Insumos frescos porcionados pelo chef (+ R$ {formatPrice(kitPrice)})</span>
                      </div>
                    </label>
                  )}

                  <div className="sidebar-total-box">
                    <span>Total a pagar:</span>
                    <strong>R$ {formatPrice(currentTotal)}</strong>
                  </div>

                  <ul className="sidebar-perks-list">
                    <li><Icon name="check" size={14} /> Libera o Modo de Preparo passo a passo</li>
                    <li><Icon name="check" size={14} /> Libera a Ficha Técnica de Ingredientes</li>
                    <li><Icon name="check" size={14} /> Libera Videoaula HD e Localização da Receita</li>
                  </ul>

                  <div className="sidebar-actions-stack">
                    {!user ? (
                      <button
                        type="button"
                        className="button button-orange button-full"
                        onClick={() => onRequireAuth && onRequireAuth()}
                      >
                        <Icon name="lock" size={16} /> Fazer Login para Comprar
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="button button-orange button-full"
                          onClick={handleInstantBuy}
                        >
                          <Icon name="unlock" size={16} /> Comprar & Liberar Receita Agora
                        </button>
                        <button
                          type="button"
                          className="button button-outline button-full"
                          onClick={handleAdd}
                        >
                          <Icon name="bag" size={16} /> Adicionar à Sacola
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
