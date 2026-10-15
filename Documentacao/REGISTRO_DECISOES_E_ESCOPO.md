# Registro de Decisões Técnicas, Dificuldades e Mudanças de Escopo — GastroMatch

**Projeto:** Conexão e Experiência Gastronômica (GastroMatch)  
**Instituição:** SENAI Félix Guisard  
**Docente Avaliador:** Prof. Wesley Fioreze  
**Data:** Outubro de 2026  

---

## 1. Registro de Decisões Arquiteturais (ADRs — Architecture Decision Records)

### ADR-01: Separação de Camadas (Frontend SPA + Backend RESTful)
- **Contexto:** A plataforma GastroMatch foi concebida para atender tanto à aplicação Web quanto à futura expansão Mobile (React Native / Expo).
- **Decisão:** Adotar arquitetura desacoplada onde o backend disponibiliza uma API REST independente em Node.js / Express e o frontend opera como uma SPA (Single Page Application) em React com empacotamento Vite.
- **Consequências:**
  - *Positivas:* Independência total de deploy, facilidade para o aplicativo mobile consumir as mesmas rotas e escalabilidade isolada de cada camada.
  - *Mitigações:* Necessidade de configuração de cabeçalhos CORS (`cors`) no Express para autorizar origens como `http://localhost:5173`.

### ADR-02: PostgreSQL como SGBD e Prisma como ORM
- **Contexto:** A plataforma possui forte modelo de domínio relacional (Usuários possuem Perfis e Pedidos; Pedidos possuem Itens de Pedido; Receitas possuem Ingredientes e Categorias; Chefs possuem Documentos e Receitas).
- **Decisão:** Utilizar o banco de dados relacional **PostgreSQL** orquestrado pelo **Prisma ORM**.
- **Consequências:**
  - *Positivas:* Garantia estrita de integridade referencial via chaves estrangeiras com regras `CASCADE` e `RESTRICT`, schemas fortemente tipados, facilidade de versionamento de banco via `prisma db push` e consultas otimizadas com suporte nativo a relações.

### ADR-03: Autenticação Stateless via JSON Web Tokens (JWT)
- **Contexto:** A plataforma precisava de autenticação segura, sem dependência de sessões no servidor (session store em Redis ou memória), permitindo validação rápida das permissões de `USER`, `CHEF` e `ADMIN`.
- **Decisão:** Implementação de JWT com algoritmo `HS256`, expiração padrão de 7 dias e criptografia de senhas com `bcryptjs` (salt rounds 12).
- **Consequências:** Facilidade de consumo pelo frontend armazenando o token no `localStorage` e enviando-o via header `Authorization: Bearer <token>`.

### ADR-04: Implementação de Pagamento PIX com Padrão EMV (BR Code)
- **Contexto:** No ambiente acadêmico, a contratação de adquirentes bancários comerciais em produção (como Mercado Pago ou Stripe) geraria custos ou exigiria credenciais CNPJ ativas que poderiam expirar ou falhar durante avaliações.
- **Decisão:** Implementar um gerador algorítmico do código PIX Copia e Cola no padrão EMV BR Code oficial do Banco Central, acompanhado da renderização dinâmica do QR Code via API SVG.
- **Consequências:** A experiência de checkout é 100% fiel à realidade, permitindo testar o fluxo de ponta a ponta sem riscos de indisponibilidade bancária externa.

### ADR-05: Modelo Híbrido de Monetização para o Chef (Digital + Kit Físico)
- **Contexto:** Chefs e restaurantes precisam de múltiplas fontes de receita para tornar a parceria atrativa.
- **Decisão:** Permitir que o chef publique tanto o acesso à videoaula/receita digital quanto ative a venda do **Kit Físico de Ingredientes** pré-porcionados com controle de estoque e preço independente.

---

## 2. Registro de Dificuldades Técnicas e Soluções Adotadas

### Dificuldade 1: Integridade Referencial na Criação de Pedidos (Foreign Key Constraint)
- **Problema:** Quando o banco estava vazio, o front-end recorria a receitas mockadas com IDs artificiais (`101`, `102`...). Ao tentar criar um pedido, o banco PostgreSQL rejeitava a inserção do `OrderItem` com erro `ForeignKeyConstraintViolation`.
- **Solução Implementada:**
  1. Criação de um script de seed completo (`prisma/seed.js`) populando as 6 receitas reais no banco com IDs válidos e ingredientes associados.
  2. Implementação de camada defensiva no `orderController.js`, verificando a existência do `recipeId` no PostgreSQL antes da gravação do item e associando a uma receita existente caso necessário.

### Dificuldade 2: Concorrência e Rastreamento Indevido de `node_modules` no Git
- **Problema:** Em versões anteriores do repositório, arquivos binários da pasta `node_modules` do frontend foram acidentalmente adicionados ao rastreio do Git, gerando poluição no histórico e conflitos de permissões entre sistemas operacionais diferentes.
- **Solução Implementada:** Ajuste no arquivo `.gitignore` e limpeza do índice do Git (`git rm -r --cached`) preservando os arquivos físicos na máquina do desenvolvedor.

### Dificuldade 3: Associação Dinâmica de Ingredientes na Publicação de Receitas
- **Problema:** O modelo relacional do Prisma separa `Recipe` e `Ingredient` através da tabela pivô `RecipeIngredient`. Ao publicar uma receita pelo painel do chef, criar cada ingrediente manualmente e depois vincular na tabela intermediária gerava lentidão e múltiplos pontos de falha.
- **Solução Implementada:** Refatoração do `recipeController.create` para realizar o `upsert` atômico dos ingredientes a partir de um array (`ingredientsList: [{ name, quantity }]`), garantindo que ingredientes repetidos não sejam duplicados e que a relação seja criada em uma única operação.

---

## 3. Registro de Mudanças de Escopo (Trade-offs do MVP)

| Funcionalidade Originalmente Planejada | Adaptação / Escopo no MVP | Justificativa Técnica |
|---|---|---|
| **Gateway de Pagamento Comercial (Cartão)** | Simulação completa com autorização instantânea e persistência de status `PAID` no banco | Eliminação de dependência de chaves de API pagas ou aprovações financeiras para fins de apresentação e avaliação docente. |
| **Cálculo de Frete por Roteirização GPS em Tempo Real** | Cálculo de frete estimado com base na validação de CEP e raio de atendimento do restaurante | Foco no cumprimento do fluxo principal de e-commerce e compra do kit sem onerar a complexidade de APIs pagas de mapas (Google Maps Matrix). |
| **Entrega Física com Rastreamento de Motoboy** | Confirmação de pedido com estimativa de tempo e dados do restaurante parceiro | O rastreamento de entregadores físicos foge da proposta do MVP inicial de validação do produto gastronômico. |
| **Priorização da Plataforma Web** | Conclusão e refinamento total da aplicação Web antes da finalização do app mobile | Garantir que o fluxo completo de compra, portal do chef, banco de dados e testes estivessem 100% operacionais para a entrega de 29 de outubro. |
