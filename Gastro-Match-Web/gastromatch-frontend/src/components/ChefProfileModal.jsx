import { useState } from "react";
import Icon from "./Icon";
import { getRecipeDisplayImage } from "./RecipeCard";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80";

function formatPrice(val) {
  if (val === undefined || val === null) return "0,00";
  return Number(val).toFixed(2).replace(".", ",");
}

export default function ChefProfileModal({ chef, recipes = [], onClose, onSelectRecipe }) {
  const [activeTab, setActiveTab] = useState("receitas");

  if (!chef) return null;

  const chefName = chef.displayName || chef.user?.name || chef.name || "Chef GastroMatch";
  const chefRestaurant = chef.restaurant || "Restaurante Parceiro";
  const chefSpecialty = (chef.description || "").split("•")[0].trim() || "Gastronomia Autoral";
  const chefAvatar = chef.user?.avatarUrl || chef.avatar || DEFAULT_AVATAR;
  const chefCity = chef.user?.profile?.city
    ? `${chef.user.profile.city}${chef.user.profile.state ? `, ${chef.user.profile.state}` : ""}`
    : "Florianópolis, SC";
  const chefCnpj = chef.cnpj || "Não informado";
  const primaryDoc = Array.isArray(chef.documents) && chef.documents.length > 0 ? chef.documents[0] : null;

  const chefRecipes = recipes.filter(
    (r) =>
      (chef.id && Number(r.chefId || r.chef?.id) === Number(chef.id)) ||
      (r.chef?.displayName &&
        r.chef.displayName.toLowerCase() === chefName.toLowerCase())
  );

  const rating = chef.rating ?? "5.0";
  const recipesCount = chef.recipesCount ?? chef._count?.recipes ?? chefRecipes.length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content chef-clean-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close clean-close" onClick={onClose} aria-label="Fechar">
          <Icon name="x" size={18} />
        </button>

        {/* Ultra Clean Header */}
        <div className="clean-chef-header">
          <div className="clean-chef-avatar-wrapper">
            <img src={chefAvatar} alt={chefName} />
            <span className="clean-verified-icon" title="Verificado GastroMatch">
              <Icon name="check" size={10} />
            </span>
          </div>

          <div className="clean-chef-meta">
            <div className="clean-chef-title-row">
              <h2>{chefName}</h2>
              <span className="clean-badge-green">
                <Icon name="shieldCheck" size={13} /> Autenticado
              </span>
            </div>
            <p className="clean-chef-sub">
              {chefRestaurant} • {chefSpecialty} • {chefCity}
            </p>
            <div className="clean-chef-metrics">
              <span>
                <Icon name="star" size={13} /> {rating} Avaliação
              </span>
              <span className="dot-sep">•</span>
              <span>
                <Icon name="fileText" size={13} /> {recipesCount}{" "}
                {recipesCount === 1 ? "Receita" : "Receitas"}
              </span>
              <span className="dot-sep">•</span>
              <span>
                <Icon name="truck" size={13} /> Entrega ~35min
              </span>
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
              {chefRecipes.length === 0 ? (
                <p style={{ color: "#64748b", textAlign: "center", padding: "24px 0" }}>
                  Este chef ainda não possui receitas publicadas na tabela Recipe.
                </p>
              ) : (
                chefRecipes.map((rec) => (
                  <div key={rec.id || rec.title} className="clean-recipe-card">
                    <div className="clean-recipe-img">
                      <img src={getRecipeDisplayImage(rec)} alt={rec.title} />
                    </div>

                    <div className="clean-recipe-info">
                      <div className="clean-recipe-top">
                        <span className="clean-cat-tag">
                          {rec.category?.name || rec.category || "Gourmet"}
                        </span>
                        <span className="clean-time-tag">
                          <Icon name="clock" size={13} /> {rec.prepTime ? `${rec.prepTime} min` : rec.time || "30 min"}
                        </span>
                      </div>

                      <h3>{rec.title}</h3>
                      <p>{rec.description}</p>

                      <div className="clean-recipe-bottom">
                        <div className="clean-price-box">
                          <span className="price-label">Kit + Videoaula HD</span>
                          <span className="price-value">R$ {formatPrice(rec.price)}</span>
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
                ))
              )}
            </div>
          )}

          {activeTab === "sobre" && (
            <div className="clean-about-content">
              <h4>Sobre o Restaurante</h4>
              <p className="about-text">
                {chef.description || (
                  <>
                    O <strong>{chefRestaurant}</strong> é um estabelecimento parceiro cadastrado no GastroMatch, devidamente regularizado perante órgãos de fiscalização sanitária.
                  </>
                )}
              </p>

              <div className="clean-info-grid">
                <div className="clean-info-item">
                  <span>Estabelecimento</span>
                  <strong>{chefRestaurant}</strong>
                </div>
                <div className="clean-info-item">
                  <span>CNPJ (Tabela Chef)</span>
                  <strong>{chefCnpj}</strong>
                </div>
                <div className="clean-info-item">
                  <span>Documento Sanitário (Tabela ChefDocument)</span>
                  <strong>
                    {primaryDoc
                      ? `${primaryDoc.type} (${primaryDoc.fileUrl})`
                      : "Homologado pela Vigilância Sanitária"}
                  </strong>
                </div>
                <div className="clean-info-item">
                  <span>Chef Responsável</span>
                  <strong>{chefName}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
