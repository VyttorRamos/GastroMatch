import { useState } from "react";
import Icon from "./Icon";

function formatPrice(val) {
  if (val === undefined || val === null) return "0,00";
  return Number(val).toFixed(2).replace(".", ",");
}

export default function CartDrawer({ isOpen, onClose, cartItems, onRemoveItem, onClearCart, onOpenPaymentModal }) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.totalPrice || Number(item.recipe?.price || item.price || 0)), 0);
  const total = subtotal;

  const handleCheckout = () => {
    onClose();
    if (onOpenPaymentModal) onOpenPaymentModal(total);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3><Icon name="bag" size={20} /> Sua Sacola GastroMatch</h3>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <Icon name="bag" size={40} />
              <p>Sua sacola está vazia.</p>
              <span className="empty-sub">Explore receitas e adicione kits para preparar em casa!</span>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item, idx) => (
                <div key={idx} className="cart-item">
                  <img
                    src={item.recipe?.imageUrl || item.recipe?.image || item.image || "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=900&q=80"}
                    alt={item.recipe?.title || item.title}
                  />
                  <div className="cart-item-info">
                    <h4>{item.recipe?.title || item.title}</h4>
                    <span className="cart-item-type">
                      {item.includeKit ? "Conteúdo Digital + Kit de Ingredientes" : "Acesso Digital à Receita & Aula"}
                    </span>
                    <span className="cart-item-price">R$ {formatPrice(item.totalPrice || item.recipe?.price || item.price)}</span>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => onRemoveItem(idx)}
                    title="Remover item"
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="drawer-footer">
            <div className="cart-summary">
              <div className="summary-row"><span>Subtotal</span><span>R$ {formatPrice(subtotal)}</span></div>
              <div className="summary-row total"><span>Total</span><span>R$ {formatPrice(total)}</span></div>
            </div>

            <button className="button button-orange button-full" onClick={handleCheckout}>
              Finalizar Pedido • R$ {formatPrice(total)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
