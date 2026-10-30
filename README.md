# GastroMatch

> **Conexão e Experiência Gastronômica**

O **GastroMatch** é uma plataforma Web e Mobile criada para conectar consumidores a chefs e restaurantes, oferecendo receitas, videoaulas e experiências gastronômicas digitais.

A proposta busca resolver dois problemas: chefs e restaurantes possuem conhecimento gastronômico de alto valor, mas encontram dificuldades para monetizá-lo digitalmente; consumidores, por outro lado, têm dificuldade para encontrar receitas autênticas, confiáveis e bem explicadas, além de ingredientes adequados para reproduzi-las em casa.

---

## 1. Sobre o projeto

### Público-alvo

- Cozinheiros amadores;
- Amantes da gastronomia;
- Pessoas interessadas em receitas e aulas;
- Chefs;
- Restaurantes e equipes de cozinha.

### Fluxo principal

1. O usuário cria uma conta e define suas preferências.
2. Pesquisa receitas ou aulas por categoria, dificuldade, restrições e tempo.
3. Visualiza os detalhes e o perfil do chef/restaurante.
4. Compra uma receita, aula ou assina um catálogo.
5. Acessa o tutorial e os materiais da receita.
6. Quando disponível e dentro do raio permitido, compra o kit de ingredientes.
7. Prepara a receita acompanhando o conteúdo.
8. Avalia a experiência, publica uma foto ou envia dúvidas ao restaurante.

---

## 2. Objetivos

### Objetivo geral

Desenvolver uma plataforma que conecte consumidores a chefs e restaurantes, permitindo a comercialização de receitas e videoaulas, interação com os criadores e compra de kits de ingredientes.

### Objetivos específicos

- Facilitar a descoberta de receitas confiáveis;
- Permitir que chefs e restaurantes monetizem seus conhecimentos;
- Oferecer conteúdos digitais de gastronomia;
- Criar uma experiência de compra integrada;
- Permitir avaliações e interação entre usuários e criadores;
- Utilizar recomendações e dados para melhorar a experiência futuramente.

---

## 3. Funcionalidades

### MVP

- [x] Cadastro e login;
- [x] Autenticação utilizando JWT;
- [x] Controle de acesso;
- [x] Perfis de usuários e criadores;
- [x] Catálogo de receitas;
- [x] Busca de receitas;
- [x] Categorias;
- [x] Avaliações;
- [x] Favoritos;
- [x] Gestão básica de pedidos;

### Arquitetura planejada

Futuramente, a arquitetura poderá ser expandida para:

```text
                         USUÁRIO
                            |
              +-------------+-------------+
              |                           |
              v                           v
       Frontend Web                Aplicação Mobile
        React/Vite                 React Native
              |                           |
              +-------------+-------------+
                            |
                            v
                     Backend / API
                            |
          +-----------------+-----------------+
          |                 |                 |
          v                 v                 v
      PostgreSQL         Storage          APIs externas
                         Vídeos/PDF       Pagamento
                                          Mapas
                                          Delivery
```

---

# 7. Estrutura do projeto

O projeto web está dentro de `Gastro-Match-Web` e possui frontend e backend separados. O banco PostgreSQL usado pelo backend está hospedado no Supabase.

```text
GastroMatch/
├── Gastro-Match-Web/
│   ├── gastromatch-frontend/
│   └── gastromatch-backend/
│       ├── prisma/
│       ├── scripts/configure-supabase.ps1
│       └── src/
├── Gastro-Match-App/
├── GastroMatch-AR/
└── Documentacao/
```

---

# 8. Frontend

O frontend inicial foi desenvolvido utilizando **React + Vite**, com foco em uma interface simples, responsiva e preparada para integração com a API.

### Página inicial

A página inicial possui:

- Hero principal;
- Busca de receitas;
- Receitas em destaque;
- Estatísticas;
- Seção "Como funciona";
- Chamada para cadastro;
- Footer;
- Layout responsivo.

### Componentes principais

#### Header

Responsável por:

- Logo;
- Campo de busca;
- Navegação;
- Login;
- Usuário autenticado;
- Logout;
- Sacola;
- Menu responsivo.

#### RecipeCard

Apresenta:

- Imagem;
- Nome da receita;
- Chef/restaurante;
- Preço;
- Avaliação;
- Número de avaliações;
- Tempo de preparo;
- Dificuldade.

#### Stats

Apresenta indicadores da plataforma.

#### Footer

Apresenta:

- Navegação;
- Informações institucionais;
- Links legais.

#### AuthModal

Responsável pela interface de:

- Login;
- Cadastro;
- Escolha do tipo de usuário;
- Tratamento de erros de autenticação.

---

# 9. Integração Frontend + Backend

O frontend já está conectado ao backend por meio de uma API REST.

A URL da API é configurada através da variável:

```env
VITE_API_URL=http://localhost:3000/api
```

### Autenticação

O fluxo de autenticação funciona da seguinte forma:

```text
Usuário
   |
   v
Tela de Login
   |
   v
POST /api/auth/login
   |
   v
Backend
   |
   v
Validação da senha
   |
   v
JWT
   |
   v
Frontend
   |
   v
localStorage
```

O token JWT é utilizado nas requisições que necessitam de autenticação.

### Funcionalidades integradas

- Login;
- Cadastro;
- Logout;
- Recuperação do usuário autenticado;
- JWT;
- Receitas;
- Busca;
- Favoritos;
- Avaliações;
- Pedidos.

---

# 10. Backend

O backend foi desenvolvido utilizando:

- Node.js;
- Express;
- Prisma;
- PostgreSQL;
- JWT;
- bcrypt.

O servidor disponibiliza uma API REST responsável pela comunicação entre o frontend e o banco de dados.

### Estrutura

```text
gastromatch-backend/
│
├── prisma/
│   ├── schema.prisma
│   └── seed.js
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   └── server.js
│
├── .env
├── package.json
└── README.md
```

### Servidor

O backend é executado atualmente em:

```text
http://localhost:3000
```

Ao iniciar corretamente, a API apresenta:

```text
GastroMatch API rodando em http://localhost:3000
```

---

# 11. Banco de dados

O banco utiliza **PostgreSQL hospedado no Supabase**, com o gerenciamento das tabelas realizado pelo **Prisma ORM**. O backend Express conecta-se diretamente ao banco usando as URLs de conexão do Supabase; a autenticação da aplicação continua sendo feita pela API GastroMatch com JWT.

O banco é responsável por armazenar informações como:

- Usuários;
- Autenticação;
- Perfis de chefs;
- Receitas;
- Categorias;
- Avaliações;
- Favoritos;
- Pedidos;
- Dados relacionados aos conteúdos gastronômicos.

### Prisma

O schema do banco está localizado em:

```text
gastromatch-backend/prisma/schema.prisma
```

Para sincronizar o schema com o banco Supabase (use com cuidado em ambientes compartilhados, pois `db push` altera a estrutura do banco):

```bash
npm run db:push
```

Para gerar o cliente Prisma:

```bash
npm run prisma:generate
```

---

# 12. Usuários de teste

O backend possui usuários de teste para facilitar o desenvolvimento.

### Administrador

```text
Email: admin@gastromatch.com
Senha: 123456
```

### Chef

```text
Email: chef@gastromatch.com
Senha: 123456
```

Esses usuários são utilizados apenas para testes durante o desenvolvimento.

---

# 13. Configuração do ambiente

## Pré-requisitos

- Node.js;
- npm;
- Conta/projeto ativo no Supabase;
- Visual Studio Code, recomendado.

---

# 14. Configuração do Backend

Entre na pasta do backend:

```bash
cd Gastro-Match-Web\gastromatch-backend
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env` usando `.env.example` como referência. Configure as URLs PostgreSQL fornecidas pelo Supabase em **Connect** (use o host e as credenciais do seu próprio projeto):

```text
.env
```

Exemplo de formato — substitua os valores pelos dados do painel Supabase e nunca envie o arquivo `.env` ao Git:

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:SENHA@HOST_DO_POOLER:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.PROJECT_REF:SENHA@HOST_DO_POOLER:5432/postgres"
JWT_SECRET="gastromatch-chave-secreta"
JWT_EXPIRES_IN="7d"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

`DATABASE_URL` usa o pooler de transação na porta `6543` para a conexão da aplicação; `DIRECT_URL` usa o pooler de sessão na porta `5432` para operações de schema. Copie o host e o usuário exatos mostrados em **Connect**. Se a senha tiver caracteres especiais, ela precisa estar codificada para URL.

O script abaixo solicita o host e a senha sem exibir a senha, grava as URLs no `.env`, gera o Prisma Client e sincroniza o schema. Use-o no PowerShell:

```powershell
cd Gastro-Match-Web\gastromatch-backend
.\scripts\configure-supabase.ps1
```

Se preferir configurar o `.env` manualmente, obtenha os dados em **Supabase > Connect** e depois execute os comandos abaixo.

Gere o Prisma Client:

```bash
npm run prisma:generate
```

Sincronize o banco:

```bash
npm run db:push
```

Execute o seed:

```bash
npm run db:seed
```

Inicie o servidor:

```bash
npm run dev
```

---

# 15. Configuração do Frontend

Entre na pasta do frontend:

```bash
cd Gastro-Match-Web\gastromatch-frontend
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo:

```text
.env
```

Com:

```env
VITE_API_URL=http://localhost:3000/api
```

Execute:

```bash
npm run dev
```

O frontend será disponibilizado normalmente em:

```text
http://localhost:5173
```

> O projeto deve ser executado pelo Vite. Não abra o `index.html` diretamente no navegador.

---

# 16. Executando o projeto completo

Para executar o GastroMatch localmente, são necessários dois terminais.

### Terminal 1 — Backend

```bash
cd Gastro-Match-Web\gastromatch-backend
npm run dev
```

Resultado esperado:

```text
GastroMatch API rodando em http://localhost:3000
```

### Terminal 2 — Frontend

```bash
cd Gastro-Match-Web\gastromatch-frontend
npm run dev
```

Depois acesse:

```text
http://localhost:5173
```

---

# 17. Produção

### Frontend

Gerar a build:

```bash
npm run build
```

Pré-visualizar:

```bash
npm run preview
```

### Backend

O backend poderá ser executado em um servidor ou serviço de nuvem, utilizando as variáveis de ambiente de produção.

---

# 18. Segurança

A plataforma considera mecanismos de segurança como:

- Autenticação com JWT;
- Senhas protegidas com bcrypt;
- Controle de acesso;
- Middleware de autenticação;
- Proteção das rotas privadas;
- Proteção dos dados dos usuários;
- Validação de informações recebidas pela API.

### Segurança planejada

Futuramente poderão ser adicionados:

- Marca d'água;
- Proteção avançada contra download;
- Validação de chefs e restaurantes;
- Rate limiting;
- Logs de segurança;
- Proteção avançada dos conteúdos;
- Monitoramento da aplicação.

---

# 19. Integrações planejadas

### Pagamentos

Processamento das compras de:

- Receitas;
- Videoaulas;
- Kits de ingredientes;
- Assinaturas.

### Mapas e geolocalização

Utilizados para verificar a disponibilidade dos kits dentro do raio permitido.

### Delivery

Integração futura para entrega dos kits.

### Storage e CDN

Armazenamento e distribuição de:

- Vídeos;
- PDFs;
- Imagens;
- Outros materiais digitais.

---

# 20. AWS Academy

A infraestrutura em nuvem continua em avaliação para hospedagem do frontend e backend. Atualmente, o PostgreSQL do projeto web está no Supabase; a AWS Academy pode ser usada em etapas futuras para hospedar os demais componentes.

A arquitetura planejada é:

```text
                    INTERNET
                       |
                       v
              +----------------+
              |    Frontend    |
              |      AWS       |
              +-------+--------+
                      |
                      v
              +----------------+
              |    Backend     |
              |      AWS       |
              +-------+--------+
                      |
          +-----------+-----------+
          |                       |
          v                       v
    PostgreSQL                Storage
    Supabase                AWS Cloud
          |
          v
    Dados do sistema
```

A implantação será realizada posteriormente utilizando os recursos disponíveis na AWS Academy.

---

# 21. Riscos

- Fraude na validação de chefs/restaurantes;
- Pirataria de conteúdo;
- Vazamento de dados;
- Problemas de pagamento;
- Indisponibilidade de vídeos;
- Falhas de geolocalização;
- Problemas sanitários ou logísticos nos kits;
- Baixa adesão de restaurantes ou usuários.

---

# 22. Possíveis evoluções

- Sistema de recomendação com IA;
- Aplicativo mobile;
- Chatbot para dúvidas;
- Comunidade gastronômica;
- Sistema de assinatura;
- Lista de compras automática;
- Cupons e promoções;
- Analytics para chefs e restaurantes;
- Notificações;
- Realidade Aumentada durante o preparo;
- Integração com serviços de delivery.

---

# 23. Status do projeto (Avaliação Acadêmica)

## Concluído no MVP

### Frontend Web
- Estrutura completa em React + Vite;
- Header com busca, sacola de compras e atalhos de autenticação;
- Catálogo de receitas integrado ao PostgreSQL;
- Modal de detalhes da receita com modo de preparo passo a passo e ingredientes;
- **Painel do Chef / Restaurante:**
  - Publicação de novas receitas autorais com foto e videoaula;
  - Inclusão dinâmica de ingredientes e dosagens;
  - **Venda de Kits de Ingredientes Físicos** com precificação e estoque;
  - Histórico de pedidos recebidos e métricas de faturamento;
- Sacola de compras com cálculo de frete por CEP;
- Modal de checkout com pagamento PIX (cópia e cola + QR Code oficial);
- Autenticação e atalhos de login de demonstração para chefs;
- Design 100% responsivo para mobile, tablets e desktops.

### Backend
- API RESTful em Express v5 + Node.js 22;
- Modelagem e persistência com Prisma ORM v6 e PostgreSQL no Supabase;
- Autenticação stateless via JWT com senhas criptografadas em bcrypt;
- Rotas de receitas, categorias, chefs, avaliações, favoritos e pedidos;
- Rotas do Chef (`/api/recipes/mine`, `/api/recipes` com suporte a kits);
- Endpoint de monitoramento `/api/health`;
- **Suíte de Testes de Integração:** 13 testes automatizados nativos (`npm test`), 100% aprovados.

### Documentação Acadêmica Entregue (`/Documentacao`)
- [ERS - Especificação de Requisitos de Software](file:///Users/yasminlobo/Documents/GitHub/GastroMatch/Documentacao/ERS_Especificacao_de_Requisitos.md)
- [Backlog do Produto e das Sprints](file:///Users/yasminlobo/Documents/GitHub/GastroMatch/Documentacao/BACKLOG.md)
- [Documentação da API REST](file:///Users/yasminlobo/Documents/GitHub/GastroMatch/Documentacao/DOCUMENTACAO_API.md)
- [Coleção Oficial do Postman](file:///Users/yasminlobo/Documents/GitHub/GastroMatch/Documentacao/GastroMatch_API.postman_collection.json)
- [Relatório de Testes e Evidências](file:///Users/yasminlobo/Documents/GitHub/GastroMatch/Documentacao/TESTES_E_EVIDENCIAS.md)
- [Registro de Decisões Técnicas, Dificuldades e Escopo](file:///Users/yasminlobo/Documents/GitHub/GastroMatch/Documentacao/REGISTRO_DECISOES_E_ESCOPO.md)
- Diagramas DER, Diagramas de Sequência (DS) e Protótipos.

---

# 24. Próximas etapas (Pós-MVP)

- Conexão com gateway de pagamento comercial em produção (ex: Asaas / Mercado Pago);
- Upload direto de mídia via bucket S3 / Cloud Storage;
- Finalização da aplicação mobile (Expo / React Native);
- Deploy em infraestrutura de nuvem (AWS Academy).

---

# 25. Equipe

**Projeto:** Conexão e Experiência Gastronômica (GastroMatch)

- Luis Otavio de Deus dos Santos;
- Vyttor Gabriel Ramos Camillo;
- Yasmin Siqueira Lobo.

**Instituição:** SENAI Félix Guisard

---

# 26. Referência da proposta

O projeto foi desenvolvido a partir da proposta **Conexão e Experiência Gastronômica (GastroMatch)**, que apresenta o problema, público-alvo, fluxo de utilização, requisitos, tecnologias, riscos e escopo do MVP.

---

# Licença

Projeto acadêmico em desenvolvimento.

A definição de uma licença de software poderá ser realizada posteriormente conforme a finalidade do projeto.
