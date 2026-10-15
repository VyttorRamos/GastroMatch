import { useState, useEffect } from "react";
import Icon from "./Icon";
import { api } from "../services/api";
import { useAuth } from "../services/AuthContext";

function formatPrice(val) {
  if (val === undefined || val === null) return "0,00";
  return Number(val).toFixed(2).replace(".", ",");
}

export default function CustomerOrdersModal({ onClose, onOpenRecipe }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.orders()
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch((err) => console.warn("Erro ao buscar pedidos do cliente:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content customer-orders-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar">
          <Icon name="x" size={20} />
        </button>

        <div className="customer-orders-header">
          <div className="orders-icon-bubble">
            <Icon name="bag" size={24} />
          </div>
          <div>
            <h2>Meus Pedidos & Kits Comprados</h2>
            <p>Acompanhe suas compras de receitas digitais e o envio dos kits físicos de ingredientes.</p>
          </div>
        </div>

        <div className="customer-orders-body">
          {loading ? (
            <div className="orders-loading-state">
              <Icon name="clock" size={32} />
              <p>Buscando seu histórico no GastroMatch...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="orders-empty-state">
              <Icon name="bag" size={44} />
              <h3>Você ainda não possui pedidos</h3>
              <p>Navegue pelo nosso catálogo, escolha suas receitas preferidas e experimente pedir os kits físicos com entrega em casa!</p>
              <button className="button button-orange" onClick={onClose}>
                Explorar Cardápio GastroMatch
              </button>
            </div>
          ) : (
            <div className="customer-orders-list">
              {orders.map((ord) => (
                <div key={ord.id} className="customer-order-card">
                  <div className="order-card-top">
                    <div className="order-id-col">
                      <span className="order-kicker">Pedido #{ord.id}</span>
                      <span className="order-date">
                        {new Date(ord.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>

                    <div className="order-status-badge-wrap">
                      <span className={`customer-status-badge ${ord.status.toLowerCase()}`}>
                        {ord.status === "PAID" ? (
                          <>
                            <Icon name="check" size={14} /> Pagamento Confirmado (PIX)
                          </>
                        ) : (
                          <>
                            <Icon name="clock" size={14} /> Aguardando Pagamento
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="order-items-box">
                    {ord.items?.map((it, idx) => (
                      <div key={idx} className="order-item-row">
                        <div className="item-title-col">
                          <strong>{it.quantity}x {it.recipe?.title || `Receita #${it.recipeId}`}</strong>
                          <span className="item-sub-desc">
                            Acesso digital imediato com videoaula
                          </span>
                        </div>
                        <span className="item-price-val">R$ {formatPrice(it.price)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-tracking-preview">
                    <div className="tracking-step active">
                      <span className="step-dot"></span>
                      <span>Pedido Aprovado</span>
                    </div>
                    <div className="tracking-line active"></div>
                    <div className="tracking-step active">
                      <span className="step-dot"></span>
                      <span>Cozinha Selecionando Insumos</span>
                    </div>
                    <div className="tracking-line"></div>
                    <div className="tracking-step">
                      <span className="step-dot"></span>
                      <span>Em Rota de Entrega</span>
                    </div>
                  </div>

                  <div className="order-card-footer">
                    <span>Total do Pedido:</span>
                    <strong className="order-total-price">R$ {formatPrice(ord.total)}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
