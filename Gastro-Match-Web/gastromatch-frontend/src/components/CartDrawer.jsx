import { useState } from "react";
import Icon from "./Icon";

function formatPrice(val) {
  if (val === undefined || val === null) return "0,00";
  return Number(val).toFixed(2).replace(".", ",");
}

export default function CartDrawer({ isOpen, onClose, cartItems, onRemoveItem, onClearCart }) {
  const [checkoutStep, setCheckoutStep] = useState("cart"); // cart, success
  const [paymentMethod, setPaymentMethod] = useState("pix");

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.totalPrice || Number(item.recipe.price || 0)), 0);
  const total = subtotal;

  const handleCheckout = () => {
    setCheckoutStep("success");
  };

  const handleFinish = () => {
    onClearCart();
    setCheckoutStep("cart");
    onClose();
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

        {checkoutStep === "cart" ? (
          <>
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
                        src={item.recipe.imageUrl || item.recipe.image || "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=900&q=80"}
                        alt={item.recipe.title}
                      />
                      <div className="cart-item-info">
                        <h4>{item.recipe.title}</h4>
                        <span className="cart-item-type">
                          {item.includeKit ? "Conteúdo Digital + Kit de Ingredientes" : "Acesso Digital à Receita & Aula"}
                        </span>
                        <span className="cart-item-price">R$ {formatPrice(item.totalPrice)}</span>
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
                <div className="checkout-payment-selector">
                  <span>Forma de Pagamento:</span>
                  <div className="payment-options">
                    <label className={paymentMethod === "pix" ? "selected" : ""}>
                      <input type="radio" name="pay" value="pix" checked={paymentMethod === "pix"} onChange={() => setPaymentMethod("pix")} />
                      <span>PIX (Acesso Imediato)</span>
                    </label>
                    <label className={paymentMethod === "card" ? "selected" : ""}>
                      <input type="radio" name="pay" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} />
                      <span>Cartão de Crédito</span>
                    </label>
                  </div>
                </div>

                <div className="cart-summary">
                  <div className="summary-row"><span>Subtotal</span><span>R$ {formatPrice(subtotal)}</span></div>
                  <div className="summary-row total"><span>Total</span><span>R$ {formatPrice(total)}</span></div>
                </div>

                <button className="button button-orange button-full" onClick={handleCheckout}>
                  Finalizar Pedido • R$ {formatPrice(total)}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="drawer-body checkout-success">
            <div className="success-icon"><Icon name="check" size={32} /></div>
            <h2>Pedido Confirmado!</h2>
            <p>Seu acesso às videoaulas foi liberado na sua conta.</p>
            {cartItems.some(i => i.includeKit) && (
              <div className="kit-delivery-alert">
                <Icon name="truck" size={18} />
                <span>O restaurante parceiro já está separando o seu kit de ingredientes!</span>
              </div>
            )}
            <button className="button button-orange" onClick={handleFinish}>
              Voltar para o GastroMatch
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
