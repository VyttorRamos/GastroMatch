import Icon from "./Icon";
import { getRecipeDisplayImage } from "./RecipeCard";

function formatPrice(val) {
  if (val === undefined || val === null) return "0,00";
  return Number(val).toFixed(2).replace(".", ",");
}

export default function PurchasedRecipesModal({
  purchasedRecipes = [],
  onClose,
  onSelectRecipe,
  onOpenLocation
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content purchased-recipes-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Fechar">
          <Icon name="x" size={20} />
        </button>

        <div className="purchased-modal-header">
          <div className="purchased-icon-bubble">
            <Icon name="unlock" size={24} />
          </div>
          <div>
            <span className="section-kicker">Biblioteca Pessoal do Cliente</span>
            <h2>Minhas Receitas Compradas</h2>
            <p>
              Acesse o modo de preparo completo, ficha técnica de ingredientes, videoaulas e localização das receitas que você adquiriu.
            </p>
          </div>
        </div>

        <div className="purchased-modal-body">
          {purchasedRecipes.length === 0 ? (
            <div className="orders-empty-state">
              <Icon name="lock" size={44} />
              <h3>Você ainda não comprou nenhuma receita</h3>
              <p>
                As receitas completas são exclusivas para clientes que efetuaram a compra. Escolha um prato no catálogo e conclua o pagamento para liberar o acesso imediato!
              </p>
              <button className="button button-orange" onClick={onClose}>
                Explorar Catálogo de Receitas
              </button>
            </div>
          ) : (
            <div className="purchased-recipes-grid">
              {purchasedRecipes.map((entry, idx) => {
                const rec = entry.recipe;
                const chefName =
                  rec.chef?.displayName ||
                  rec.chef?.restaurant ||
                  rec.chef ||
                  "Chef GastroMatch";
                const restaurantName =
                  rec.chef?.restaurant || `Restaurante ${chefName}`;
                const image = getRecipeDisplayImage(rec);

                return (
                  <div key={`${rec.id}-${idx}`} className="purchased-recipe-card">
                    <div className="purchased-card-media">
                      <img src={image} alt={rec.title} />
                      <span className="purchased-unlocked-badge">
                        <Icon name="check" size={13} /> Pago & Liberado
                      </span>
                      {entry.includeKit && (
                        <span className="purchased-kit-badge">
                          <Icon name="box" size={12} /> + Kit Físico
                        </span>
                      )}
                    </div>

                    <div className="purchased-card-content">
                      <div className="purchased-order-meta">
                        <span>Pedido #{entry.orderId}</span>
                        <span>•</span>
                        <span>
                          {entry.purchasedAt
                            ? new Date(entry.purchasedAt).toLocaleDateString("pt-BR")
                            : "Compra recente"}
                        </span>
                      </div>

                      <h4>{rec.title}</h4>
                      <p className="purchased-chef-line">
                        Por <strong>{chefName}</strong> ({restaurantName})
                      </p>

                      <div className="purchased-location-snippet">
                        <Icon name="mapPin" size={14} />
                        <span>
                          Origem: <strong>{entry.originAddress}</strong>
                        </span>
                      </div>

                      <div className="purchased-specs-row">
                        <span>
                          <Icon name="clock" size={13} />{" "}
                          {rec.time || `${rec.prepTime || 40} min`}
                        </span>
                        <span>
                          <Icon name="video" size={13} /> Videoaula + Passo a Passo
                        </span>
                        <span className="purchased-paid-amount">
                          Pago: R$ {formatPrice(entry.paidAmount || rec.price)}
                        </span>
                      </div>

                      <div className="purchased-card-actions">
                        <button
                          type="button"
                          className="button button-small button-orange"
                          onClick={() => {
                            onClose();
                            onSelectRecipe && onSelectRecipe(rec);
                          }}
                        >
                          <Icon name="book" size={15} /> Abrir Receita Completa
                        </button>

                        <button
                          type="button"
                          className="button button-small button-outline"
                          onClick={() => {
                            onClose();
                            onOpenLocation && onOpenLocation(entry);
                          }}
                        >
                          <Icon name="mapPin" size={15} /> Ver Localização
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
