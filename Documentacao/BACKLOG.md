# Backlog do Produto e Sprints — GastroMatch

**Projeto:** Conexão e Experiência Gastronômica (GastroMatch)  
**Instituição:** SENAI Félix Guisard  
**Docente Avaliador:** Prof. Wesley Fioreze  
**Metodologia:** Ágil (Scrum / Kanban) com priorização MoSCoW  
**Data:** Outubro de 2026  

---

## 1. Estrutura de Épicos

| Código | Épico | Descrição |
|:---:|---|---|
| **EP01** | Autenticação & Gestão de Perfis | Cadastro, login com JWT, controle de acesso para Consumidores, Chefs e Administradores. |
| **EP02** | Catálogo & Descoberta Gastronômica | Vitrine de receitas autorais, filtros por categoria, busca textual e detalhamento do prato. |
| **EP03** | Portal do Chef & Venda de Kits | Painel exclusivo para o criador publicar receitas, precificar videoaulas e disponibilizar kits físicos de insumos. |
| **EP04** | Sacola, Checkout & Pagamentos | Gestão de itens na sacola, estimativa de frete por CEP, emissão de cobrança PIX (BR Code) e confirmação de pagamento. |
| **EP05** | Avaliações & Interação Social | Sistema de notas (1 a 5 estrelas), depoimentos de clientes e lista de receitas favoritas. |

---

## 2. Histórias de Usuário (User Stories) e Critérios de Aceitação

### Épico 01: Autenticação & Perfis

#### US01 — Cadastro de Usuário
- **Como** visitante da plataforma,
- **Quero** criar uma conta informando nome, e-mail e senha,
- **Para que** eu possa acessar conteúdos restritos e realizar compras de receitas e kits.
- **Critérios de Aceitação:**
  - O e-mail deve ser validado quanto ao formato e duplicidade.
  - A senha deve possuir no mínimo 6 caracteres e ser criptografada com `bcrypt`.
  - Retorno HTTP `201 Created` com token JWT para autenticação imediata.
- **Prioridade:** *Must Have* (Essencial) | **Status:** 🟢 Concluído no MVP

#### US02 — Login e Sessão Segura
- **Como** usuário cadastrado,
- **Quero** autenticar com e-mail e senha,
- **Para que** eu possa acessar meu perfil, pedidos e painel correspondente à minha função.
- **Critérios de Aceitação:**
  - Validação de credenciais e geração de token JWT assinado com chave secreta.
  - Se for Chef, disponibilizar acesso imediato às ferramentas de gestão.
- **Prioridade:** *Must Have* | **Status:** 🟢 Concluído no MVP

---

### Épico 02: Catálogo & Descoberta

#### US03 — Navegação e Filtro de Receitas
- **Como** apreciador da boa culinária,
- **Quero** navegar pelo catálogo de receitas e filtrar por categorias (Massas, Brasileira, Japonesa, etc.),
- **Para que** eu encontre pratos adequados ao meu gosto e ocasião.
- **Critérios de Aceitação:**
  - Exibição de cards responsivos com foto, chef, tempo de preparo e preço.
  - Filtro em tempo real sem recarregar a página.
- **Prioridade:** *Must Have* | **Status:** 🟢 Concluído no MVP

#### US04 — Detalhes e Modo de Preparo
- **Como** cozinheiro amador,
- **Quero** visualizar a lista de ingredientes e as instruções da receita,
- **Para que** eu possa planejar a execução do prato com precisão.
- **Critérios de Aceitação:**
  - Modal dinâmico apresentando ingredientes, rendimento e passo a passo.
  - Identificação de chef verificado e vídeo explicativo.
- **Prioridade:** *Must Have* | **Status:** 🟢 Concluído no MVP

---

### Épico 03: Portal do Chef & Venda de Kits

#### US05 — Publicação de Receitas Autorais
- **Como** chef parceiro ou proprietário de restaurante,
- **Quero** cadastrar novas receitas com foto, videoaula e ingredientes,
- **Para que** eu possa monetizar meu conhecimento gastronômico na plataforma.
- **Critérios de Aceitação:**
  - Formulário com título, categoria, dificuldade, tempo de preparo e porções.
  - Inclusão dinâmica de ingredientes com dosagens personalizadas.
  - Persistência imediata no PostgreSQL associada ao ID do chef autenticado.
- **Prioridade:** *Must Have* | **Status:** 🟢 Concluído no MVP

#### US06 — Venda de Kits Físicos de Ingredientes
- **Como** restaurante parceiro,
- **Quero** colocar à venda o kit físico de insumos pré-porcionados para uma receita,
- **Para que** os clientes possam preparar o prato em casa com os mesmos ingredientes usados na cozinha profissional.
- **Critérios de Aceitação:**
  - Switch para ativar venda de Kit Físico por receita.
  - Campos para definição do valor do kit (R$), estoque disponível e descrição dos insumos.
  - Disponibilização automática da opção de kit na tela de detalhes para os clientes.
- **Prioridade:** *Must Have* | **Status:** 🟢 Concluído no MVP

#### US07 — Métricas de Vendas do Chef
- **Como** chef parceiro,
- **Quero** acompanhar o total faturado, receitas ativas e pedidos recebidos,
- **Para que** eu tenha visibilidade do desempenho comercial dos meus conteúdos.
- **Critérios de Aceitação:**
  - Dashboard consolidando faturamento em pedidos `PAID`, quantidade de pedidos e kits ativos.
- **Prioridade:** *Should Have* | **Status:** 🟢 Concluído no MVP

---

### Épico 04: Sacola, Checkout & Pagamentos

#### US08 — Gerenciamento de Sacola
- **Como** consumidor,
- **Quero** adicionar receitas digitais e kits de ingredientes à sacola,
- **Para que** eu possa consolidar a compra em um único fechamento.
- **Critérios de Aceitação:**
  - Gaveta lateral (`CartDrawer`) com soma em tempo real e remoção de itens.
- **Prioridade:** *Must Have* | **Status:** 🟢 Concluído no MVP

#### US09 — Pagamento Instantâneo via PIX
- **Como** consumidor,
- **Quero** pagar meu pedido através de PIX Copia e Cola ou QR Code,
- **Para que** a aprovação da compra seja ágil e sem necessidade de cartão de crédito.
- **Critérios de Aceitação:**
  - Geração de código padrão EMV BR Code e QR Code renderizado.
  - Gravação do pedido no banco de dados com status `PENDING` e transição para `PAID` após confirmação.
- **Prioridade:** *Must Have* | **Status:** 🟢 Concluído no MVP

---

## 3. Matriz de Priorização (MoSCoW)

```text
+---------------------------------------------------------------------------------+
| MUST HAVE (Essencial para o MVP)                                                |
| - Cadastro e Login com JWT (US01, US02)                                         |
| - Catálogo e Busca de Receitas integrados ao PostgreSQL (US03, US04)            |
| - Portal do Chef: Publicação de Receitas e Venda de Kits de Ingredientes (US05, 06)|
| - Sacola de Compras e Checkout PIX com QR Code dinâmico (US08, US09)            |
+---------------------------------------------------------------------------------+
| SHOULD HAVE (Importante para a experiência)                                     |
| - Painel com métricas de faturamento do chef (US07)                            |
| - Histórico de pedidos recebidos com detalhamento de insumos                   |
| - Estimativa de frete por CEP de entrega                                        |
+---------------------------------------------------------------------------------+
| COULD HAVE (Desejável / Próximas Sprints)                                      |
| - Avaliações com upload de fotos do prato finalizado pelos usuários             |
| - Integração com gateway bancário de cartão em produção (Stripe / Asaas)       |
+---------------------------------------------------------------------------------+
| WON'T HAVE (Fora do escopo do MVP inicial)                                     |
| - Rastreamento de motoboy em tempo real por GPS                                 |
| - Realidade Aumentada (AR) para auxílio de cortes de faca                       |
+---------------------------------------------------------------------------------+
```
