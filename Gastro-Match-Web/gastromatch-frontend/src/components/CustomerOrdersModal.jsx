import { useState, useEffect } from "react";
import Icon from "./Icon";
import { api } from "../services/api";

function formatPrice(val) {
  if (val === undefined || val === null) return "0,00";
  return Number(val).toFixed(2).replace(".", ",");
}

export default function CustomerOrdersModal({
  orders: propOrders = [],
  onClose,
  onOpenRecipe,
  onOpenLocation,
  onOrderPaid
}) {
  const [orders, setOrders] = useState(propOrders);
  const [loading, setLoading] = useState(propOrders.length === 0);

  useEffect(() => {
    api.orders()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setOrders(data);
        } else if (propOrders.length > 0) {
          setOrders(propOrders);
        }
      })
      .catch(() => {
        if (propOrders.length > 0) setOrders(propOrders);
      })
      .finally(() => setLoading(false));
  }, [propOrders]);

  const handleConfirmPending = async (orderId) => {
    try {
      const res = await api.confirmPayment(orderId);
      if (res?.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? res.order : o))
        );
        if (onOrderPaid) onOrderPaid(res.order);
      }
    } catch {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "PAID" } : o))
      );
    }
  };

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
              {orders.map((ord) => {
                const isPaid =
                  ord.status === "PAID" ||
                  ord.status === "PROCESSING" ||
                  ord.status === "SHIPPED" ||
                  ord.status === "DELIVERED";

                return (
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
                          {isPaid ? (
                            <>
                              <Icon name="check" size={14} /> Pagamento Confirmado
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
                      {ord.items?.map((it, idx) => {
                        const rec = it.recipe;
                        const itemPrice = it.unitPrice ?? it.totalPrice ?? it.price ?? rec?.price;
                        return (
                          <div key={idx} className="order-item-row">
                            <div className="item-title-col">
                              <strong>{it.quantity || 1}x {rec?.title || `Receita #${it.recipeId}`}</strong>
                              <span className="item-sub-desc">
                                {isPaid
                                  ? "✓ Receita e videoaula desbloqueadas na sua conta"
                                  : "Aguardando confirmação do pagamento para liberar receita"}
                              </span>
                            </div>
                            <div className="order-item-actions-col">
                              <span className="item-price-val">R$ {formatPrice(itemPrice)}</span>
                              {isPaid && rec && (
                                <div className="order-item-mini-btns">
                                  <button
                                    type="button"
                                    className="button button-small button-orange"
                                    onClick={() => {
                                      onClose();
                                      onOpenRecipe && onOpenRecipe(rec);
                                    }}
                                  >
                                    <Icon name="book" size={13} /> Ver Receita
                                  </button>
                                  <button
                                    type="button"
                                    className="button button-small button-outline"
                                    onClick={() => {
                                      onClose();
                                      onOpenLocation && onOpenLocation({ recipe: rec, orderId: ord.id });
                                    }}
                                  >
                                    <Icon name="mapPin" size={13} /> Localização
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {!isPaid && (
                      <div className="order-pending-pay-bar">
                        <span>Finalize o pagamento deste pedido para desbloquear a receita:</span>
                        <button
                          type="button"
                          className="button button-small button-orange"
                          onClick={() => handleConfirmPending(ord.id)}
                        >
                          <Icon name="check" size={14} /> Confirmar Pagamento PIX
                        </button>
                      </div>
                    )}

                    <div className="order-tracking-preview">
                      <div className={`tracking-step ${isPaid ? "active" : ""}`}>
                        <span className="step-dot"></span>
                        <span>Pedido Aprovado</span>
                      </div>
                      <div className={`tracking-line ${isPaid ? "active" : ""}`}></div>
                      <div className={`tracking-step ${isPaid ? "active" : ""}`}>
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
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
