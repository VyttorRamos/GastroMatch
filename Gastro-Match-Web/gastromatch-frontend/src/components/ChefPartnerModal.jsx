import { useState } from "react";
import Icon from "./Icon";
import { formatCnpj, isValidCnpj, generateValidCnpj } from "../utils/validators";

export default function ChefPartnerModal({ onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    restaurant: "",
    city: "",
    docType: "Alvará Sanitário",
    termsAccepted: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!isValidCnpj(formData.cnpj)) {
      setError("O CNPJ informado é inválido. Verifique os 14 dígitos verificadores.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content chef-partner-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar">
          <Icon name="x" size={20} />
        </button>

        {!submitted ? (
          <>
            <div className="modal-header-badge">
              <Icon name="chef" size={24} />
              <h2>Seja um Chef / Restaurante Parceiro</h2>
              <p>Monetize seu conhecimento gastronômico e venda receitas e kits de ingredientes no GastroMatch.</p>
            </div>

            <form onSubmit={handleSubmit} className="partner-form">
              {error && <div className="auth-error" style={{ marginBottom: 12 }}>{error}</div>}
              <div className="form-grid">
                <div className="input-field">
                  <label>Nome Completo / Responsável Técnico</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Chef Carlos Alberto"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="input-field">
                  <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>CNPJ do Estabelecimento</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, cnpj: generateValidCnpj() })}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#ea580c",
                        cursor: "pointer",
                        textDecoration: "underline"
                      }}
                    >
                      Gerar válido
                    </button>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={18}
                    placeholder="00.000.000/0001-00"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: formatCnpj(e.target.value) })}
                  />
                  {formData.cnpj.replace(/\D/g, "").length > 0 && (
                    <small
                      style={{
                        fontSize: "11.5px",
                        fontWeight: 600,
                        color: isValidCnpj(formData.cnpj) ? "#15803d" : "#dc2626",
                        marginTop: 2
                      }}
                    >
                      {isValidCnpj(formData.cnpj)
                        ? "✓ CNPJ válido"
                        : "✗ CNPJ inválido"}
                    </small>
                  )}
                </div>

                <div className="input-field">
                  <label>Nome do Restaurante / Marca</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Trattoria del Chef"
                    value={formData.restaurant}
                    onChange={(e) => setFormData({ ...formData, restaurant: e.target.value })}
                  />
                </div>

                <div className="input-field">
                  <label>Cidade / Estado</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Florianópolis - SC"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div className="input-field full-width">
                  <label>Documento de Conformidade Sanitária</label>
                  <select
                    value={formData.docType}
                    onChange={(e) => setFormData({ ...formData, docType: e.target.value })}
                  >
                    <option>Alvará Sanitário Vigente</option>
                    <option>Licença da Vigilância Sanitária Municipal</option>
                    <option>Certificado de Boas Práticas de Manipulação de Alimentos</option>
                  </select>
                </div>

                <div className="input-field full-width file-upload-box">
                  <Icon name="fileText" size={24} />
                  <span>Anexar Cópia do Documento / CNPJ (PDF, JPG ou PNG)</span>
                  <input type="file" accept=".pdf,.jpg,.png" />
                </div>
              </div>

              <div className="terms-check">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    required
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                  />
                  <span>Declaro conformidade com as normas sanitárias vigentes e aceito os Termos de Parceiro GastroMatch.</span>
                </label>
              </div>

              <button type="submit" className="button button-orange button-full">
                Enviar Credenciais para Validação
              </button>
            </form>
          </>
        ) : (
          <div className="submitted-success">
            <div className="success-icon"><Icon name="shieldCheck" size={36} /></div>
            <h2>Cadastro Enviado com Sucesso!</h2>
            <p>
              Sua solicitação e documentos do estabelecimento foram encaminhados para a equipe de validação técnica e sanitária do GastroMatch.
            </p>
            <p className="sub-note">Prazo de análise: até 24 horas úteis.</p>
            <button className="button button-orange" onClick={onClose}>
              Voltar ao Início
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
