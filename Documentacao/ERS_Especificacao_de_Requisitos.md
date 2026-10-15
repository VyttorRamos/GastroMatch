# Especificação de Requisitos de Software (ERS) — GastroMatch

**Projeto:** Conexão e Experiência Gastronômica (GastroMatch)  
**Instituição:** SENAI Félix Guisard  
**Curso:** Desenvolvimento de Sistemas / Engenharia de Software  
**Docente Avaliador:** Prof. Wesley Fioreze  
**Versão:** 1.0 (MVP)  
**Data:** Outubro de 2026  

---

## 1. Introdução

### 1.1 Propósito
O propósito deste documento é especificar de forma detalhada e estruturada os requisitos funcionais, não funcionais e regras de negócio para a construção da plataforma **GastroMatch**, servindo de guia formal para desenvolvimento, validação e testes de aceitação.

### 1.2 Escopo do Produto
O GastroMatch é uma solução Web e Mobile voltada ao setor gastronômico, conectando amantes da culinária a chefs profissionais e restaurantes de renome. O sistema disponibiliza receitas exclusivas, videoaulas didáticas, aquisição de kits de ingredientes pré-porcionados e avaliação mútua de experiências.

### 1.3 Definições e Acrônimos
- **ERS:** Especificação de Requisitos de Software.
- **MVP:** Produto Mínimo Viável (*Minimum Viable Product*).
- **JWT:** *JSON Web Token* (padrão RFC 7519 para autenticação *stateless*).
- **ORM:** *Object-Relational Mapping* (mapeamento objeto-relacional via Prisma).
- **EMV / BR Code:** Padrão técnico regulatório do Banco Central do Brasil para PIX.
- **RF:** Requisito Funcional.
- **RNF:** Requisito Não Funcional.
- **RN:** Regra de Negócio.

---

## 2. Descrição Geral do Sistema

### 2.1 Perfis de Usuários
1. **Consumidor / Usuário Padrão (`USER`):** Explora o catálogo de receitas, realiza busca por categorias ou tempo de preparo, adiciona receitas e kits de ingredientes à sacola, efetua pagamento via PIX ou cartão e avalia os pratos preparados.
2. **Chef / Criador de Conteúdo (`CHEF`):** Publica receitas autorais com listas de ingredientes, define preços de acesso digital e kit físico, submete comprovação cadastral (CNPJ/alvará) e acompanha avaliações dos clientes.
3. **Administrador (`ADMIN`):** Modera chefs parceiros, aprova cadastros de novos criadores, supervisiona o catálogo e audita pedidos realizados.

### 2.2 Arquitetura em Alto Nível
```text
  [Front-end Web: React + Vite] <----> [API REST: Express + Node.js] <----> [PostgreSQL via Prisma ORM]
                                               ^
                                               |
                                     [App Mobile: Expo / React Native]
```

---

## 3. Requisitos Funcionais (RF)

| Código | Nome do Requisito | Descrição | Prioridade |
|:---:|---|---|:---:|
| **RF01** | Cadastro de Usuários | Permitir que o visitante crie uma conta fornecendo nome, e-mail e senha (mínimo 6 caracteres). | Alta |
| **RF02** | Autenticação (Login) | Autenticar usuários existentes validando email e hash da senha com bcrypt, retornando token JWT. | Alta |
| **RF03** | Controle de Sessão / Logout | Permitir encerramento de sessão com invalidação local do token JWT. | Alta |
| **RF04** | Recuperação de Perfil | Disponibilizar dados do usuário logado via endpoint `/api/auth/me`. | Alta |
| **RF05** | Catálogo de Receitas | Exibir listagem das receitas publicadas com foto, título, chef, categoria, tempo e preço. | Alta |
| **RF06** | Busca Textual de Receitas | Permitir filtragem de receitas em tempo real por termos no título ou na descrição. | Média |
| **RF07** | Filtragem por Categoria | Filtrar pratos por categorias gastronômicas (Massas, Brasileira, Japonesa, etc.). | Média |
| **RF08** | Detalhamento de Receita | Exibir modo de preparo passo a passo, rendimento, dificuldade e lista completa de ingredientes. | Alta |
| **RF09** | Estimativa de Frete | Permitir que o consumidor consulte valor e prazo de frete estimado para seu CEP. | Média |
| **RF10** | Gestão de Sacola (Carrinho) | Permitir adicionar, alterar quantidade e remover receitas e kits físicos da sacola. | Alta |
| **RF11** | Fechamento de Pedido (Checkout) | Gerar o registro do pedido consolidando itens, valores e método de pagamento. | Alta |
| **RF12** | Emissão de Cobrança PIX | Gerar chave EMV (BR Code) e imagem do QR Code para pagamentos instantâneos. | Alta |
| **RF13** | Pagamento via Cartão de Crédito | Permitir simulação de pagamento via cartão e autorização imediata do pedido. | Média |
| **RF14** | Confirmação de Pagamento | Atualizar status do pedido para `PAID` assim que a cobrança for compensada. | Alta |
| **RF15** | Histórico de Pedidos | Permitir que o cliente consulte seus pedidos anteriores e o status atual. | Média |
| **RF16** | Avaliação de Receitas | Permitir que usuários atribuam nota (1 a 5 estrelas) e comentário textual sobre a receita. | Média |
| **RF17** | Favoritos | Permitir que o usuário marque e desmarque receitas de sua preferência. | Baixa |
| **RF18** | Cadastro de Chef / Parceiro | Permitir submissão de solicitação de chef com restaurante, descrição e documentos. | Média |

---

## 4. Requisitos Não Funcionais (RNF)

| Código | Categoria | Descrição |
|:---:|---|---|
| **RNF01** | **Segurança** | As senhas devem ser obrigatoriamente criptografadas com `bcryptjs` utilizando salt rounds >= 12 antes de persistidas no banco. |
| **RNF02** | **Segurança** | A autenticação deve ser *stateless* baseada em JWT com expiração configurável (padrão 7 dias) e validação de assinatura via segredo de ambiente. |
| **RNF03** | **Performance** | As requisições de consulta ao catálogo de receitas devem responder em menos de 200 ms em condições normais de rede local. |
| **RNF04** | **Responsividade** | A interface Web deve se adaptar fluidamente a smartphones (>= 360px), tablets (>= 768px) e monitores desktop (>= 1024px). |
| **RNF05** | **Integridade** | O banco de dados relacional deve impor integridade referencial via chaves estrangeiras com ações `CASCADE` ou `RESTRICT` apropriadas. |
| **RNF06** | **Disponibilidade** | O serviço de backend deve conter endpoint de health check (`/api/health`) para monitoramento contínuo de liveness/readiness. |
| **RNF07** | **Usabilidade** | A interface deve apresentar feedback visual imediato para ações críticas (loaders em botões, alertas em toasts e confirmação de cópia de PIX). |
| **RNF08** | **Padronização** | A API deve seguir rigorosamente as convenções RESTful (utilização correta dos verbos HTTP GET, POST, PUT, DELETE e status codes 200, 201, 400, 401, 404, 500). |
| **RNF09** | **Compatibilidade** | O frontend deve ser compatível com as versões estáveis modernas dos principais navegadores (Google Chrome, Firefox, Safari, Microsoft Edge). |
| **RNF10** | **Portabilidade** | A suíte de testes deve rodar nativamente em qualquer ambiente Node.js LTS sem exigir ferramentas externas proprietárias. |

---

## 5. Regras de Negócio (RN)

- **RN01 - Unicidade de Identificação:** Não é permitido o cadastro de dois usuários com o mesmo endereço de e-mail no sistema.
- **RN02 - Validação de Perfil de Chef:** Apenas chefs com status `APPROVED` podem ter suas receitas listadas publicamente com selo de verificação no catálogo.
- **RN03 - Itens Mínimos do Pedido:** Um pedido não pode ser criado com lista vazia de itens ou com quantidade total inferior a 1.
- **RN04 - Ciclo de Vida do Pedido:** Um pedido gerado via PIX inicia no status `PENDING`. Somente após a confirmação do pagamento ele transita para `PAID`. Se for cancelado, transita para `CANCELED`.
- **RN05 - Integridade de Avaliação:** Um usuário só pode registrar uma única avaliação por receita (chave única composta `userId` + `recipeId`). Avaliações subsequentes atualizam a nota e o comentário existente.
- **RN06 - Exclusão de Receitas:** Uma receita que já possua itens associados em pedidos confirmados não pode sofrer deleção física em cascata (`onDelete: Restrict`), preservando o histórico contábil do cliente.

---

## 6. Matriz de Rastreabilidade

| Requisito Funcional | Tabela Prisma / PostgreSQL | Rota da API REST | Componente Frontend |
|---|---|---|---|
| **RF01, RF02, RF04** | `User`, `Profile` | `/api/auth/register`, `/api/auth/login`, `/api/auth/me` | `AuthModal.jsx`, `Header.jsx` |
| **RF05, RF06, RF07** | `Recipe`, `Category`, `Chef` | `/api/recipes`, `/api/categories` | `App.jsx`, `RecipeCard.jsx` |
| **RF08, RF09** | `Recipe`, `Ingredient`, `RecipeIngredient` | `/api/recipes/:id` | `RecipeModal.jsx` |
| **RF10** | *Estado local (Session/Memory)* | N/A | `CartDrawer.jsx` |
| **RF11, RF12, RF13, RF14**| `Order`, `OrderItem` | `/api/orders`, `/api/orders/:id/confirm-payment` | `PaymentModal.jsx`, `CartDrawer.jsx` |
| **RF16** | `Review` | `/api/reviews/recipe/:id` | `RecipeModal.jsx` |
| **RF17** | `Favorite` | `/api/favorites/:id` | `RecipeCard.jsx`, `Header.jsx` |
| **RF18** | `Chef`, `ChefDocument` | `/api/chefs/apply` | `ChefPartnerModal.jsx` |
