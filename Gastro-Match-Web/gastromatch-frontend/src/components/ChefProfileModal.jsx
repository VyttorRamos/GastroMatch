import { useState } from "react";
import Icon from "./Icon";

export default function ChefProfileModal({ chef, recipes = [], onClose, onSelectRecipe }) {
  const [activeTab, setActiveTab] = useState("receitas");

  if (!chef) return null;

  let chefRecipes = recipes.filter(
    (r) =>
      `${r.chef?.displayName || r.chef?.restaurant || r.chef || ""}`
        .toLowerCase()
        .includes(chef.name.toLowerCase().replace("chef ", "")) ||
      chef.name.toLowerCase().includes(`${r.chef?.displayName || r.chef || ""}`.toLowerCase())
  );

  if (chefRecipes.length === 0) {
    chefRecipes = recipes.slice(0, 3);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content chef-clean-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close clean-close" onClick={onClose} aria-label="Fechar">
          <Icon name="x" size={18} />
        </button>

        {/* Ultra Clean Header */}
        <div className="clean-chef-header">
          <div className="clean-chef-avatar-wrapper">
            <img src={chef.avatar} alt={chef.name} />
            <span className="clean-verified-icon" title="Verificado GastroMatch">
              <Icon name="check" size={10} />
            </span>
          </div>

          <div className="clean-chef-meta">
            <div className="clean-chef-title-row">
              <h2>{chef.name}</h2>
              <span className="clean-badge-green"><Icon name="shieldCheck" size={13} /> Autenticado</span>
            </div>
            <p className="clean-chef-sub">
              {chef.restaurant} • {chef.specialty} • Florianópolis, SC
            </p>
            <div className="clean-chef-metrics">
              <span><Icon name="star" size={13} /> {chef.rating} Avaliação</span>
              <span className="dot-sep">•</span>
              <span><Icon name="fileText" size={13} /> {chef.recipesCount} Receitas</span>
              <span className="dot-sep">•</span>
              <span><Icon name="truck" size={13} /> Entrega ~35min</span>
            </div>
          </div>
        </div>

        {/* Clean Nav Tabs */}
        <div className="clean-modal-tabs">
          <button
            className={activeTab === "receitas" ? "active" : ""}
            onClick={() => setActiveTab("receitas")}
          >
            Receitas & Videoaulas ({chefRecipes.length})
          </button>
          <button
            className={activeTab === "sobre" ? "active" : ""}
            onClick={() => setActiveTab("sobre")}
          >
            Sobre & CNPJ
          </button>
        </div>

        {/* Modal Body */}
        <div className="clean-modal-body">
          {activeTab === "receitas" && (
            <div className="clean-recipes-stack">
              {chefRecipes.map((rec) => (
                <div key={rec.id || rec.title} className="clean-recipe-card">
                  <div className="clean-recipe-img">
                    <img src={rec.image} alt={rec.title} />
                  </div>

                  <div className="clean-recipe-info">
                    <div className="clean-recipe-top">
                      <span className="clean-cat-tag">{rec.category?.name || rec.category || "Gourmet"}</span>
                      <span className="clean-time-tag"><Icon name="clock" size={13} /> {rec.time || "30 min"}</span>
                    </div>

                    <h3>{rec.title}</h3>
                    <p>{rec.description}</p>

                    <div className="clean-recipe-bottom">
                      <div className="clean-price-box">
                        <span className="price-label">Kit + Videoaula HD</span>
                        <span className="price-value">R$ {rec.price || "29.90"}</span>
                      </div>

                      <button
                        className="button button-orange button-small"
                        onClick={() => {
                          onClose();
                          onSelectRecipe(rec);
                        }}
                      >
                        Ver Receita <Icon name="arrow" size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "sobre" && (
            <div className="clean-about-content">
              <h4>Sobre o Restaurante</h4>
              <p className="about-text">
                O <strong>{chef.restaurant}</strong> é um estabelecimento parceiro cadastrado no GastroMatch, devidamente regularizado perante órgãos de fiscalização sanitária.
              </p>

              <div className="clean-info-grid">
                <div className="clean-info-item">
                  <span>Razão Social</span>
                  <strong>{chef.restaurant} LTDA</strong>
                </div>
                <div className="clean-info-item">
                  <span>CNPJ</span>
                  <strong>12.345.678/0001-90</strong>
                </div>
                <div className="clean-info-item">
                  <span>Vigilância Sanitária</span>
                  <strong>Licença Nº 8842/2026 (Vigente)</strong>
                </div>
                <div className="clean-info-item">
                  <span>Chef Responsável</span>
                  <strong>{chef.name}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
