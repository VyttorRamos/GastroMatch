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

### MVP — obrigatórias

- [ ] Cadastro e login;
- [ ] Perfis de usuários e criadores;
- [ ] Validação de chef/restaurante;
- [ ] Catálogo e busca de receitas;
- [ ] Publicação e acesso às receitas;
- [ ] Venda de conteúdos digitais;
- [ ] Vídeos e materiais das receitas;
- [ ] Avaliações;
- [ ] Controle de acesso;
- [ ] Geolocalização dos kits;
- [ ] Gestão básica de pedidos;
- [ ] Proteção dos conteúdos.

### Desejáveis

- [ ] Assinatura mensal;
- [ ] Comunidade avançada;
- [ ] Recomendações personalizadas por IA;
- [ ] Integração com delivery;
- [ ] Notificações;
- [ ] Cupons;
- [ ] Analytics para restaurantes;
- [ ] Lista de compras automática;
- [ ] Recursos de Realidade Aumentada durante o preparo.

---

## 4. Fora do escopo do MVP

- Operação própria de delivery;
- Produção/fabricação dos alimentos;
- Gestão completa de estoque dos restaurantes;
- Marketplace de equipamentos gastronômicos;
- Expansão internacional;
- Atendimento médico/nutricional especializado.

---

## 5. Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend Web | React / Next.js |
| Aplicação Mobile | Flutter / React Native |
| Backend | Node.js / NestJS ou Java / Spring |
| Banco de dados | PostgreSQL |
| Autenticação | JWT |
| Armazenamento | Serviço de objetos |
| Vídeos | Cloud + CDN |
| Mapas | APIs de mapas/geolocalização |
| Pagamentos | Gateway de pagamento |
| Delivery | API/serviço externo |

---

## 6. Arquitetura planejada

```text
                    USUÁRIO
                       |
                       v
             +--------------------+
             | Frontend Web/Mobile|
             | React / React Native|
             +---------+----------+
                       |
                       v
             +--------------------+
             |        API         |
             | Node/Nest ou Java  |
             +---------+----------+
                       |
          +------------+------------+
          |            |            |
          v            v            v
     PostgreSQL     Storage      APIs externas
                    Vídeos/PDF   Pagamento
                                 Mapas
                                 Delivery
```

---

## 7. Estrutura atual do Frontend

```text
gastromatch-frontend/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── RecipeCard.jsx
│   │   ├── Stats.jsx
│   │   └── Footer.jsx
│   │
│   ├── pages/
│   │
│   ├── styles/
│   │   └── global.css
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

### Componentes principais

**Header**
- Logo;
- Busca;
- Navegação;
- Login;
- Sacola;
- Menu responsivo.

**RecipeCard**
- Imagem;
- Nome da receita;
- Chef/restaurante;
- Preço;
- Avaliação;
- Tempo;
- Dificuldade.

**Stats**
- Indicadores da plataforma.

**Footer**
- Navegação;
- Informações institucionais;
- Links legais.

---

## 8. Frontend inicial

A página inicial possui:

- Hero principal;
- Busca de receitas;
- Receitas em destaque;
- Estatísticas;
- Seção "Como funciona";
- Chamada para cadastro;
- Footer;
- Layout responsivo.

O frontend inicial funciona como base visual para a integração posterior com o backend.

---

## 9. Como executar

### Pré-requisitos

- Node.js;
- npm;
- Visual Studio Code, recomendado.

### Instalação

```bash
cd gastromatch-frontend
npm install
```

### Desenvolvimento

```bash
npm run dev
```

Depois acesse o endereço informado pelo Vite, normalmente:

```text
http://localhost:5173
```

> O projeto deve ser executado pelo Vite. Não abra o `index.html` diretamente no navegador.

### Produção

```bash
npm run build
```

### Pré-visualização da build

```bash
npm run preview
```

---

## 10. Banco de dados

O banco de dados planejado utiliza **PostgreSQL**.

Principais informações:

- Usuários e autenticação;
- Perfis de chefs e restaurantes;
- Documentos para validação;
- CNPJ e dados do estabelecimento;
- Receitas;
- Ingredientes e quantidades;
- Porções;
- Dificuldade e tempo;
- Vídeos e materiais digitais;
- Avaliações e comentários;
- Localização;
- Catálogo e estoque dos kits;
- Preços;
- Pedidos e pagamentos;
- Informações de entrega;
- Registros de conformidade sanitária.

---

## 11. Segurança

A plataforma deverá considerar:

- Autenticação com JWT;
- Criptografia;
- Controle de acesso;
- Proteção de conteúdos;
- Marca d'água;
- Mecanismos de proteção contra download;
- Validação de chefs e restaurantes;
- Proteção dos dados dos usuários.

---

## 12. Integrações

### Pagamentos
Processamento das compras de receitas, aulas e kits.

### Mapas e geolocalização
Verificação da disponibilidade de kits dentro do raio permitido.

### Delivery
Integração futura para entrega dos kits.

### Storage e CDN
Armazenamento e distribuição de vídeos e materiais digitais.

---

## 13. Riscos

- Fraude na validação de chefs/restaurantes;
- Pirataria de conteúdo;
- Vazamento de dados;
- Problemas de pagamento;
- Indisponibilidade de vídeos;
- Falhas de geolocalização;
- Problemas sanitários ou logísticos nos kits;
- Baixa adesão de restaurantes ou usuários.

---

## 14. Possíveis evoluções

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

## 15. Status do projeto

### Concluído no frontend inicial

- [x] Estrutura inicial do frontend;
- [x] Página inicial;
- [x] Header;
- [x] Busca de receitas;
- [x] Cards de receitas;
- [x] Estatísticas;
- [x] Seção "Como funciona";
- [x] CTA de cadastro;
- [x] Footer;
- [x] Responsividade inicial.

### Próximas etapas

- [ ] Backend;
- [ ] Banco de dados;
- [ ] Autenticação;
- [ ] Cadastro de chefs;
- [ ] Catálogo real;
- [ ] Página de detalhes da receita;
- [ ] Pagamentos;
- [ ] Kits de ingredientes;
- [ ] Integrações externas.

---

## 16. Equipe

**Projeto:** Conexão e Experiência Gastronômica (GastroMatch)

- Luis Otavio de Deus dos Santos
- Vyttor Gabriel Ramos Camillo
- Yasmin Siqueira Lobo

**Instituição:** SENAI — Tecnologia da Informação / Santa Catarina.

---

## 17. Referência da proposta

O projeto foi desenvolvido a partir da proposta **Conexão e Experiência Gastronômica (GastroMatch)**, que apresenta o problema, público, fluxo de utilização, requisitos, tecnologias, riscos e escopo do MVP.

---

## Licença

Projeto acadêmico em desenvolvimento. A definição de uma licença de software poderá ser realizada posteriormente conforme a finalidade do projeto.
