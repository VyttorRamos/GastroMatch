import { useState } from "react";
import Icon from "./Icon";
import { useAuth } from "../services/AuthContext";

const CHEF_LOCATIONS = [
  {
    match: "Gabriel",
    restaurant: "Trattoria & Cozinha Autoral Camillo",
    street: "Rua Bocaiúva, 2140 - Centro",
    city: "Florianópolis - SC",
    zipCode: "88015-530",
    distance: "3,4 km",
    eta: "28 - 35 min",
    phone: "(48) 3224-8890",
    hours: "Terça a Domingo • 11h00 às 23h00",
    lat: -27.5878,
    lng: -48.5476
  },
  {
    match: "Marco",
    restaurant: "Osteria Romana Chef Marco",
    street: "Av. Beira Mar Norte, 1820 - Agronômica",
    city: "Florianópolis - SC",
    zipCode: "88025-201",
    distance: "4,1 km",
    eta: "30 - 40 min",
    phone: "(48) 3228-4410",
    hours: "Terça a Domingo • 11h30 às 23h30",
    lat: -27.5835,
    lng: -48.5425
  },
  {
    match: "Yuki",
    restaurant: "Omakase Sushi Bar & Izakaya",
    street: "Rua Alves de Brito, 350 - Centro",
    city: "Florianópolis - SC",
    zipCode: "88015-440",
    distance: "2,9 km",
    eta: "25 - 32 min",
    phone: "(48) 3304-9120",
    hours: "Quarta a Domingo • 18h00 às 23h30",
    lat: -27.5902,
    lng: -48.5451
  },
  {
    match: "Mexicana",
    restaurant: "Casa Mexicana Taqueria Artesanal",
    street: "Av. Madre Benvenuta, 1168 - Santa Mônica",
    city: "Florianópolis - SC",
    zipCode: "88035-000",
    distance: "5,3 km",
    eta: "35 - 45 min",
    phone: "(48) 3234-5560",
    hours: "Terça a Domingo • 12h00 às 23h00",
    lat: -27.5915,
    lng: -48.5142
  },
  {
    match: "Otavio",
    restaurant: "Atelier Brasileiro Chef Otavio de Deus",
    street: "Rua Cônego Bernardo, 101 - Trindade",
    city: "Florianópolis - SC",
    zipCode: "88036-570",
    distance: "4,6 km",
    eta: "32 - 40 min",
    phone: "(48) 3233-7781",
    hours: "Terça a Domingo • 11h00 às 22h00",
    lat: -27.5968,
    lng: -48.5221
  },
  {
    match: "Yasmin",
    restaurant: "Pâtisserie & Boulangerie Yasmin Lobo",
    street: "Rua Presidente Coutinho, 580 - Centro",
    city: "Florianópolis - SC",
    zipCode: "88015-230",
    distance: "2,5 km",
    eta: "20 - 30 min",
    phone: "(48) 3225-6090",
    hours: "Segunda a Sábado • 09h00 às 21h00",
    lat: -27.5924,
    lng: -48.5508
  }
];

export function resolveChefLocation(recipe) {
  const chefStr = `${recipe?.chef?.displayName || ""} ${recipe?.chef?.restaurant || ""} ${recipe?.chef || ""} ${recipe?.title || ""}`;
  const found = CHEF_LOCATIONS.find((loc) =>
    chefStr.toLowerCase().includes(loc.match.toLowerCase())
  );
  if (found) return found;
  return {
    restaurant: recipe?.chef?.restaurant || "Restaurante Parceiro GastroMatch",
    street: "Av. Rio Branco, 404 - Centro Gastronômico",
    city: "Florianópolis - SC",
    zipCode: "88015-200",
    distance: "3,8 km",
    eta: "30 - 38 min",
    phone: "(48) 3222-1000",
    hours: "Terça a Domingo • 11h00 às 23h00",
    lat: -27.5935,
    lng: -48.5532
  };
}

export default function RecipeLocationModal({
  purchasedRecipes = [],
  initialSelection = null,
  onClose,
  onOpenRecipe
}) {
  const { user } = useAuth();
  const [selectedIndex, setSelectedIndex] = useState(() => {
    if (!initialSelection || purchasedRecipes.length === 0) return 0;
    const idx = purchasedRecipes.findIndex(
      (item) =>
        Number(item.recipe?.id) === Number(initialSelection.recipe?.id || initialSelection.id)
    );
    return idx >= 0 ? idx : 0;
  });

  const currentEntry = purchasedRecipes[selectedIndex] || initialSelection;
  const currentRecipe = currentEntry?.recipe || currentEntry;
  const locationInfo = resolveChefLocation(currentRecipe);

  const userAddress = user?.profile?.preferences?.address;
  const customerDestination = userAddress?.street
    ? `${userAddress.street}, ${userAddress.number || "S/N"} - ${userAddress.neighborhood || "Centro"}, ${user?.profile?.city || "Florianópolis"}/${user?.profile?.state || "SC"}`
    : `${user?.profile?.city || "Florianópolis"} - ${user?.profile?.state || "SC"} (Endereço cadastrado na conta)`;

  const mapsQuery = encodeURIComponent(
    `${locationInfo.street}, ${locationInfo.city}`
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content recipe-location-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Fechar">
          <Icon name="x" size={20} />
        </button>

        <div className="location-modal-header">
          <div className="location-icon-bubble">
            <Icon name="mapPin" size={24} />
          </div>
          <div>
            <span className="section-kicker">Geolocalização & Rastreamento</span>
            <h2>Localização da Receita Comprada</h2>
            <p>
              Veja onde fica o restaurante/cozinha da sua receita e acompanhe o deslocamento do seu pedido no mapa.
            </p>
          </div>
        </div>

        <div className="location-modal-body">
          {purchasedRecipes.length === 0 && !currentRecipe ? (
            <div className="orders-empty-state">
              <Icon name="mapPin" size={44} />
              <h3>Nenhuma receita comprada para localizar</h3>
              <p>
                Assim que você adquirir uma receita ou kit no catálogo, a localização do restaurante do chef e o rastreamento de entrega aparecerão aqui.
              </p>
              <button className="button button-orange" onClick={onClose}>
                Explorar Receitas
              </button>
            </div>
          ) : (
            <>
              {/* Selector when the user has multiple purchased recipes */}
              {purchasedRecipes.length > 1 && (
                <div className="location-recipe-selector">
                  <span className="selector-label">Selecione a receita comprada:</span>
                  <div className="selector-pills-row">
                    {purchasedRecipes.map((entry, idx) => (
                      <button
                        key={`${entry.recipe?.id}-${idx}`}
                        type="button"
                        className={`location-recipe-pill ${selectedIndex === idx ? "active" : ""}`}
                        onClick={() => setSelectedIndex(idx)}
                      >
                        <Icon name="mapPin" size={14} />
                        <span>{entry.recipe?.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Visual Route & Interactive Map Box */}
              <div className="location-map-card">
                <div className="location-map-top-bar">
                  <div className="map-route-badge">
                    <span className="live-pulse-dot" />
                    <strong>Rastreamento Ativo • Pedido #{currentEntry?.orderId || "GM-1024"}</strong>
                  </div>
                  <span className="map-eta-pill">
                    <Icon name="truck" size={14} /> Tempo estimado: {locationInfo.eta} ({locationInfo.distance})
                  </span>
                </div>

                {/* Visual Route Diagram */}
                <div className="visual-route-banner">
                  <div className="route-point origin">
                    <div className="route-pin-icon chef">
                      <Icon name="store" size={18} />
                    </div>
                    <div>
                      <small>ORIGEM DA RECEITA (RESTAURANTE DO CHEF)</small>
                      <strong>{locationInfo.restaurant}</strong>
                      <span>{locationInfo.street} • {locationInfo.city}</span>
                    </div>
                  </div>

                  <div className="route-connector">
                    <div className="route-dashed-line" />
                    <div className="route-truck-badge">
                      <Icon name="truck" size={15} /> {locationInfo.distance}
                    </div>
                  </div>

                  <div className="route-point destination">
                    <div className="route-pin-icon client">
                      <Icon name="mapPin" size={18} />
                    </div>
                    <div>
                      <small>DESTINO DO CLIENTE</small>
                      <strong>{user?.name || "Cliente GastroMatch"}</strong>
                      <span>{customerDestination}</span>
                    </div>
                  </div>
                </div>

                {/* Embedded Map Preview */}
                <div className="embedded-map-frame">
                  <iframe
                    title={`Mapa de localização - ${currentRecipe?.title}`}
                    width="100%"
                    height="220"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${locationInfo.lng - 0.015}%2C${locationInfo.lat - 0.01}%2C${locationInfo.lng + 0.015}%2C${locationInfo.lat + 0.01}&layer=mapnik&marker=${locationInfo.lat}%2C${locationInfo.lng}`}
                  />
                </div>
              </div>

              {/* Delivery Tracking Steps */}
              <div className="location-tracking-card">
                <h3>
                  <Icon name="truck" size={18} /> Status de Entrega & Liberação da Receita
                </h3>
                <div className="location-timeline-grid">
                  <div className="loc-step completed">
                    <div className="loc-step-circle">
                      <Icon name="check" size={14} />
                    </div>
                    <div>
                      <strong>1. Pagamento Confirmado</strong>
                      <span>Receita digital e videoaula liberadas na sua conta</span>
                    </div>
                  </div>

                  <div className="loc-step completed">
                    <div className="loc-step-circle">
                      <Icon name="check" size={14} />
                    </div>
                    <div>
                      <strong>2. Cozinha do Chef Acionada</strong>
                      <span>Insumos validados em {locationInfo.restaurant}</span>
                    </div>
                  </div>

                  <div className="loc-step active">
                    <div className="loc-step-circle">
                      <Icon name="truck" size={14} />
                    </div>
                    <div>
                      <strong>3. Em Rota / Disponível na Localização</strong>
                      <span>Saindo de {locationInfo.street} em embalagem térmica</span>
                    </div>
                  </div>

                  <div className="loc-step">
                    <div className="loc-step-circle">
                      <Icon name="mapPin" size={14} />
                    </div>
                    <div>
                      <strong>4. Entrega no Destino</strong>
                      <span>Previsão de chegada em {locationInfo.eta}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chef Restaurant Address & Details Card */}
              <div className="location-details-grid">
                <div className="location-detail-box">
                  <span className="detail-kicker">
                    <Icon name="chef" size={14} /> Endereço Oficial da Receita
                  </span>
                  <h4>{locationInfo.restaurant}</h4>
                  <p className="detail-address-line">{locationInfo.street}</p>
                  <p className="detail-address-sub">
                    {locationInfo.city} • CEP {locationInfo.zipCode}
                  </p>
                  <div className="detail-meta-list">
                    <span>
                      <Icon name="clock" size={14} /> {locationInfo.hours}
                    </span>
                    <span>
                      <Icon name="shieldCheck" size={14} /> Cozinha Auditada & Certificada
                    </span>
                  </div>
                </div>

                <div className="location-detail-box actions-box">
                  <span className="detail-kicker">
                    <Icon name="navigation" size={14} /> Ações Rápidas da Compra
                  </span>
                  <h4>{currentRecipe?.title}</h4>
                  <p className="detail-address-sub">
                    Código de Localização: <strong>#LOC-{currentEntry?.orderId || currentRecipe?.id}</strong>
                  </p>

                  <div className="location-actions-stack">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button button-small button-outline button-full"
                    >
                      <Icon name="mapPin" size={15} /> Abrir Endereço no Google Maps
                    </a>

                    {currentRecipe && onOpenRecipe && (
                      <button
                        type="button"
                        className="button button-small button-orange button-full"
                        onClick={() => {
                          onClose();
                          onOpenRecipe(currentRecipe);
                        }}
                      >
                        <Icon name="book" size={15} /> Ver Modo de Preparo da Receita
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
