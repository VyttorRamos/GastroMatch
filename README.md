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

O projeto possui frontend e backend separados.

```text
GastroMatch/
│
├── gastromatch-frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── RecipeCard.jsx
│   │   │   ├── Stats.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── AuthModal.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── styles/
│   │   │   └── global.css
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env
│
├── gastromatch-backend/
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── server.js
│   │
│   ├── package.json
│   ├── .env
│   └── README.md
│
└── README.md
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

O banco utiliza **PostgreSQL**, com o gerenciamento das tabelas realizado pelo **Prisma ORM**.

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

Para sincronizar o schema com o banco:

```bash
npx prisma db push
```

Para gerar o cliente Prisma:

```bash
npx prisma generate
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
- PostgreSQL;
- Visual Studio Code, recomendado.

---

# 14. Configuração do Backend

Entre na pasta:

```bash
cd gastromatch-backend
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo:

```text
.env
```

Exemplo:

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/gastromatch?schema=public"
JWT_SECRET="gastromatch-chave-secreta"
JWT_EXPIRES_IN="7d"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

> A senha do PostgreSQL deve ser substituída pela senha definida durante a instalação do PostgreSQL.

Gere o Prisma Client:

```bash
npx prisma generate
```

Sincronize o banco:

```bash
npx prisma db push
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

Entre na pasta:

```bash
cd gastromatch-frontend
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
cd gastromatch-backend
npm run dev
```

Resultado esperado:

```text
GastroMatch API rodando em http://localhost:3000
```

### Terminal 2 — Frontend

```bash
cd gastromatch-frontend
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

A infraestrutura em nuvem faz parte das próximas etapas do projeto.

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
    PostgreSQL                 Storage
      AWS                     AWS Cloud
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

# 23. Status do projeto

## Concluído

### Frontend

- Estrutura inicial do frontend;
- Página inicial;
- Header;
- Busca de receitas;
- Cards de receitas;
- Estatísticas;
- Seção "Como funciona";
- CTA de cadastro;
- Footer;
- Responsividade inicial;
- Integração com API;
- Tela de login;
- Tela de cadastro;
- Logout;
- Persistência da autenticação.

### Backend

- Estrutura do servidor;
- API REST;
- Node.js + Express;
- Prisma;
- PostgreSQL;
- JWT;
- bcrypt;
- Cadastro;
- Login;
- Controle de autenticação;
- Usuário autenticado;
- Receitas;
- Categorias;
- Avaliações;
- Favoritos;
- Pedidos;
- Seed de dados para testes.

### Banco de dados

- PostgreSQL instalado;
- Banco GastroMatch criado;
- Prisma configurado;
- Schema definido;
- Integração com backend.

---

# 24. Próximas etapas

- Página completa de detalhes da receita;
- Validação de chefs/restaurantes;
- Publicação de receitas pelo chef;
- Sistema de compra de conteúdos;
- Vídeos e materiais digitais;
- Kits de ingredientes;
- Geolocalização;
- Gateway de pagamento;
- Storage para arquivos;
- Integração com delivery;
- Aplicação mobile;
- Deploy na AWS Academy;
- Monitoramento da aplicação;
- Testes automatizados.

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
