import { useState, useEffect } from "react";
import Icon from "./Icon";

export default function ApiKeyModal({ onClose, onSaveKey }) {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem("gastromatch_gemini_key") || "";
    setApiKey(existing);
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem("gastromatch_gemini_key", apiKey.trim());
    } else {
      localStorage.removeItem("gastromatch_gemini_key");
    }
    setSaved(true);
    if (onSaveKey) onSaveKey(apiKey.trim());
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleRemove = () => {
    localStorage.removeItem("gastromatch_gemini_key");
    setApiKey("");
    if (onSaveKey) onSaveKey("");
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content api-key-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar">
          <Icon name="x" size={20} />
        </button>

        <div className="modal-header-badge">
          <Icon name="sparkles" size={28} />
          <h2>Chave de API para a IA (Gemini)</h2>
          <p>
            Por padrão, o GastroMatch <strong>não consome seus tokens</strong>. Caso deseje utilizar o modelo oficial Gemini em tempo real para tirada de dúvidas culinárias personalizadas, você pode cadastrar sua chave gratuita abaixo.
          </p>
        </div>

        {saved ? (
          <div className="submitted-success">
            <div className="success-icon"><Icon name="check" size={32} /></div>
            <h3>Configuração Salva com Sucesso!</h3>
            <p>Sua chave de API foi armazenada com segurança no seu navegador.</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="api-key-form">
            <div className="input-field">
              <label>Sua Chave de API do Google Gemini</label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <small className="input-help">
                Sua chave fica salva apenas no seu navegador (localStorage) e não é enviada a servidores de terceiros.
              </small>
            </div>

            <div className="api-key-actions">
              {apiKey && (
                <button type="button" className="button button-outline button-danger" onClick={handleRemove}>
                  Remover Chave
                </button>
              )}
              <button type="submit" className="button button-orange">
                Salvar Chave
              </button>
            </div>

            <div className="get-key-link">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
              >
                Obter uma chave gratuita no Google AI Studio <Icon name="arrow" size={14} />
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
