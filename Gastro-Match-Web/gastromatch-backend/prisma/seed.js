require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("../src/config/prisma");

async function seedDatabase(options = {}) {
  if (!options.skipConnect) {
    await prisma.__connectWithFallback();
  }
  console.log("Iniciando sincronização de dados iniciais nas tabelas do banco...");
  const passwordHash = await bcrypt.hash("123456", 12);

  // 1. Categorias
  const categoriesData = [
    { name: "Massas", description: "Massas tradicionais e artesanais com molhos clássicos." },
    { name: "Brasileira", description: "Sabores autênticos da gastronomia brasileira." },
    { name: "Japonesa", description: "Técnicas milenares de sushi, sashimi e pratos quentes." },
    { name: "Mexicana", description: "Culinária rica em especiarias, tacos e molhos artesanais." },
    { name: "Sobremesas", description: "Doces finos, sobremesas clássicas e confeitaria gourmet." }
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { name: cat.name },
      update: { description: cat.description },
      create: cat
    });
    categories[cat.name] = record;
  }
  console.log(`✓ ${Object.keys(categories).length} categorias salvas na tabela Category.`);

  // 2. Usuário Administrador
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@gastromatch.com" },
    update: {},
    create: {
      name: "Administrador GastroMatch",
      email: "admin@gastromatch.com",
      passwordHash,
      role: "ADMIN",
      profile: {
        create: {
          city: "Florianópolis",
          state: "SC",
          phone: "(48) 99999-0001"
        }
      }
    }
  });

  // 3. Chefs Aprovados e Chefs Pendentes (Tabela User, Profile, Chef, ChefDocument)
  const chefsData = [
    {
      name: "Chef Gabriel Camillo",
      email: "gabriel@gastromatch.com",
      displayName: "Chef Gabriel Camillo",
      restaurant: "Ristorante Camillo",
      cnpj: "12.345.678/0001-90",
      city: "Florianópolis",
      state: "SC",
      avatarUrl: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80",
      description: "Culinária Italiana & Risotos • Especialista em culinária mediterrânea clássica.",
      status: "APPROVED",
      documents: [
        {
          type: "Alvará Sanitário Vigente (Vigilância Municipal)",
          fileUrl: "alvara_ristorante_camillo.pdf"
        }
      ]
    },
    {
      name: "Chef Otavio de Deus",
      email: "otavio@gastromatch.com",
      displayName: "Chef Otavio de Deus",
      restaurant: "Cantinho Brasileiro",
      cnpj: "33.741.852/0001-09",
      city: "Florianópolis",
      state: "SC",
      avatarUrl: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=400&q=80",
      description: "Gastronomia Brasileira Gourmet • Preservando e inovando a tradição dos pratos típicos.",
      status: "APPROVED",
      documents: [
        {
          type: "Alvará Sanitário Vigente (Vigilância Municipal)",
          fileUrl: "alvara_cantinho_brasileiro.pdf"
        }
      ]
    },
    {
      name: "Chef Yasmin Lobo",
      email: "yasmin@gastromatch.com",
      displayName: "Chef Yasmin Lobo",
      restaurant: "Ateliê Doce Lobo",
      cnpj: "28.910.445/0001-33",
      city: "Florianópolis",
      state: "SC",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
      description: "Pâtisserie & Sobremesas Finas • Confeiteira apaixonada por chocolates e doces finos.",
      status: "APPROVED",
      documents: [
        {
          type: "Licença da Vigilância Sanitária Municipal",
          fileUrl: "licenca_atelie_doce_lobo.pdf"
        }
      ]
    },
    {
      name: "Chef Yuki Tanaka",
      email: "yuki@gastromatch.com",
      displayName: "Chef Yuki Tanaka",
      restaurant: "Tanaka Sushi Bar",
      cnpj: "45.120.890/0001-11",
      city: "Florianópolis",
      state: "SC",
      avatarUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=400&q=80",
      description: "Culinária Japonesa & Omakase • Sushiman com mais de 15 anos de experiência tradicional.",
      status: "APPROVED",
      documents: [
        {
          type: "Alvará Sanitário Vigente (Vigilância Municipal)",
          fileUrl: "alvara_tanaka_sushi.pdf"
        }
      ]
    },
    {
      name: "Chef Marco",
      email: "marco@gastromatch.com",
      displayName: "Chef Marco",
      restaurant: "Trattoria Romana",
      cnpj: "18.602.311/0001-54",
      city: "Florianópolis",
      state: "SC",
      avatarUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=400&q=80",
      description: "Massas Artesanais • Mestre em massas frescas e tradição gastronômica de Roma.",
      status: "APPROVED",
      documents: [
        {
          type: "Alvará Sanitário Vigente (Vigilância Municipal)",
          fileUrl: "alvara_trattoria_romana.pdf"
        }
      ]
    },
    {
      name: "Chef Casa Mexicana",
      email: "mexicana@gastromatch.com",
      displayName: "Casa Mexicana",
      restaurant: "Taquería El Mariachi",
      cnpj: "51.409.223/0001-88",
      city: "Florianópolis",
      state: "SC",
      avatarUrl: "https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?auto=format&fit=crop&w=400&q=80",
      description: "Cozinha Mexicana Raiz • Temperos importados e tortillas feitas à mão.",
      status: "APPROVED",
      documents: [
        {
          type: "Alvará Sanitário Vigente (Vigilância Municipal)",
          fileUrl: "alvara_taqueria_mariachi.pdf"
        }
      ]
    },
    {
      name: "Chef Henrique Fogaça Silva",
      email: "henrique@fogobrasa.com.br",
      displayName: "Chef Henrique Fogaça Silva",
      restaurant: "Bistrô Fogo & Brasa",
      cnpj: "42.819.304/0001-72",
      city: "Florianópolis",
      state: "SC",
      avatarUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400&q=80",
      description: "Localização: Florianópolis - SC • Carnes Nobres & Defumados",
      status: "PENDING",
      documents: [
        {
          type: "Alvará Sanitário Vigente (Vigilância Municipal)",
          fileUrl: "alvara_sanitario_bistro_fogo_brasa_2026.pdf"
        },
        {
          type: "Comprovante de Inscrição e Situação Cadastral (CNPJ)",
          fileUrl: "cartao_cnpj_42819304000172.pdf"
        }
      ]
    },
    {
      name: "Chef Helena Rizzo Costa",
      email: "helena@manisul.com.br",
      displayName: "Chef Helena Rizzo Costa",
      restaurant: "Maní Contemporâneo Sul",
      cnpj: "19.503.721/0001-18",
      city: "Balneário Camboriú",
      state: "SC",
      avatarUrl: "https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?auto=format&fit=crop&w=400&q=80",
      description: "Localização: Balneário Camboriú - SC • Gastronomia Autoral Brasileira",
      status: "PENDING",
      documents: [
        {
          type: "Certificado de Boas Práticas de Manipulação de Alimentos (ANVISA)",
          fileUrl: "certificado_anvisa_mani_sul.pdf"
        }
      ]
    }
  ];

  const chefs = {};
  for (const c of chefsData) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {
        name: c.name,
        avatarUrl: c.avatarUrl,
        role: "CHEF"
      },
      create: {
        name: c.name,
        email: c.email,
        passwordHash,
        avatarUrl: c.avatarUrl,
        role: "CHEF",
        profile: { create: { city: c.city, state: c.state } }
      }
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: { city: c.city, state: c.state },
      create: { userId: user.id, city: c.city, state: c.state }
    });

    const chefRecord = await prisma.chef.upsert({
      where: { userId: user.id },
      update: {
        displayName: c.displayName,
        restaurant: c.restaurant,
        cnpj: c.cnpj,
        description: c.description
      },
      create: {
        userId: user.id,
        displayName: c.displayName,
        restaurant: c.restaurant,
        cnpj: c.cnpj,
        description: c.description,
        status: c.status
      }
    });

    // Garantir documentos na tabela ChefDocument
    const existingDocs = await prisma.chefDocument.findMany({
      where: { chefId: chefRecord.id }
    });
    if (existingDocs.length === 0 && Array.isArray(c.documents)) {
      for (const doc of c.documents) {
        await prisma.chefDocument.create({
          data: {
            chefId: chefRecord.id,
            type: doc.type,
            fileUrl: doc.fileUrl
          }
        });
      }
    }

    chefs[c.displayName] = { user, chef: chefRecord };
  }
  console.log(`✓ ${Object.keys(chefs).length} chefs e documentos sanitários salvos nas tabelas Chef e ChefDocument.`);

  // 4. Ingredientes
  const ingredientNames = [
    "Arroz arbóreo", "Funghi secchi", "Cogumelos paris frescos", "Manteiga trufada", "Vinho branco seco", "Caldo de legumes", "Cebola",
    "Espaguete de grano duro", "Guanciale artesanal", "Gemas de ovos caipiras", "Queijo Pecorino Romano", "Pimenta-do-reino moída na hora",
    "Arroz japonês (shari)", "Salmão fresco para sushi", "Atum fresco", "Alga nori", "Wasabi", "Vinagre de arroz (tempero Su)",
    "Carne de porco (lombo)", "Pasta de achiote", "Tortilhas de milho", "Abacaxi fresco em cubos", "Coentro fresco", "Cebola roxa", "Salsa verde",
    "Feijão preto", "Carne seca dessalgada", "Costelinha de porco", "Lombo defumado", "Paio", "Linguiça calabresa", "Farinha de mandioca", "Couve manteiga",
    "Chocolate amargo 70%", "Manteiga sem sal", "Ovos", "Açúcar cristal", "Farinha de trigo", "Sorvete de baunilha"
  ];

  const ingredients = {};
  for (const name of ingredientNames) {
    const ing = await prisma.ingredient.upsert({
      where: { name },
      update: {},
      create: { name }
    });
    ingredients[name] = ing;
  }
  console.log(`✓ ${Object.keys(ingredients).length} ingredientes salvos na tabela Ingredient.`);

  // 5. Receitas
  const recipesData = [
    {
      title: "Risoto de Cogumelos Selvagens",
      chefDisplayName: "Chef Gabriel Camillo",
      categoryName: "Massas",
      price: 29.90,
      prepTime: 45,
      servings: 2,
      difficulty: "MEDIUM",
      imageUrl: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=900&q=80",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      description: "Um clássico cremoso da gastronomia italiana preparado com funghi secchi, cogumelos frescos e manteiga trufada.",
      instructions: "1. Hidrate o funghi secchi em água morna por 20 min.\n2. Refogue a cebola no azeite e junte o arroz arbóreo.\n3. Deglaceie com vinho branco seco.\n4. Adicione o caldo de legumes quente concha a concha mexendo suavemente por 18 min.\n5. Finalize com a manteiga trufada e os cogumelos frescos salteados.",
      ingredientsList: [
        { name: "Arroz arbóreo", quantity: "200g" },
        { name: "Funghi secchi", quantity: "30g" },
        { name: "Cogumelos paris frescos", quantity: "150g" },
        { name: "Manteiga trufada", quantity: "40g" },
        { name: "Vinho branco seco", quantity: "100ml" },
        { name: "Caldo de legumes", quantity: "1 litro" },
        { name: "Cebola", quantity: "1 unidade picada" }
      ]
    },
    {
      title: "Pasta Carbonara Autêntica",
      chefDisplayName: "Chef Marco",
      categoryName: "Massas",
      price: 24.90,
      prepTime: 20,
      servings: 2,
      difficulty: "EASY",
      imageUrl: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      description: "A autêntica receita romana com guanciale artesanal, gemas de ovos caipiras e queijo Pecorino Romano.",
      instructions: "1. Corte o guanciale em cubos e doure em fogo baixo até ficar crocante.\n2. Misture as gemas com o pecorino ralado fino e pimenta-do-reino.\n3. Cozinhe a massa al dente.\n4. Desligue o fogo, misture a massa ao guanciale e verta as gemas com um pouco da água do cozimento emulsionando vigorosamente sem coagular.",
      ingredientsList: [
        { name: "Espaguete de grano duro", quantity: "250g" },
        { name: "Guanciale artesanal", quantity: "120g" },
        { name: "Gemas de ovos caipiras", quantity: "4 unidades" },
        { name: "Queijo Pecorino Romano", quantity: "80g ralado" },
        { name: "Pimenta-do-reino moída na hora", quantity: "a gosto" }
      ]
    },
    {
      title: "Sushi Assortido & Omakase",
      chefDisplayName: "Chef Yuki Tanaka",
      categoryName: "Japonesa",
      price: 39.90,
      prepTime: 60,
      servings: 2,
      difficulty: "HARD",
      imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      description: "Técnicas milenares de corte de salmão, atum e tempero Shari para criar nigiris e uramakis com perfeição.",
      instructions: "1. Lave e cozinhe o arroz japonês, temperando com o tempero Su morno.\n2. Execute os cortes clássicos no salmão e atum em ângulo de 45°.\n3. Modele os nigiris com arroz levemente arejado.\n4. Monte uramakis usando a alga nori e finalize com wasabi de verdade.",
      ingredientsList: [
        { name: "Arroz japonês (shari)", quantity: "300g preparado" },
        { name: "Salmão fresco para sushi", quantity: "200g em filé" },
        { name: "Atum fresco", quantity: "150g em filé" },
        { name: "Alga nori", quantity: "3 folhas" },
        { name: "Wasabi", quantity: "10g" },
        { name: "Vinagre de arroz (tempero Su)", quantity: "50ml" }
      ]
    },
    {
      title: "Tacos al Pastor & Molhos Artesanais",
      chefDisplayName: "Casa Mexicana",
      categoryName: "Mexicana",
      price: 22.90,
      prepTime: 35,
      servings: 4,
      difficulty: "MEDIUM",
      imageUrl: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=900&q=80",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      description: "Carne suína marinada em achiote e especiarias mexicanas, servida em tortilhas de milho com abacaxi e salsa verde.",
      instructions: "1. Marine o lombo fatiado fino na pasta de achiote com suco cítrico por 2 horas.\n2. Sele a carne em chapa bem quente até tostar as pontas.\n3. Grelhe o abacaxi em cubos.\n4. Aqueça as tortilhas e monte com carne, abacaxi, coentro fresco picado e salsa verde.",
      ingredientsList: [
        { name: "Carne de porco (lombo)", quantity: "500g fatiado fino" },
        { name: "Pasta de achiote", quantity: "50g" },
        { name: "Tortilhas de milho", quantity: "8 unidades" },
        { name: "Abacaxi fresco em cubos", quantity: "1 xícara" },
        { name: "Coentro fresco", quantity: "1/2 maço picado" },
        { name: "Salsa verde", quantity: "100ml" }
      ]
    },
    {
      title: "Feijoada Gourmet Completa",
      chefDisplayName: "Chef Otavio de Deus",
      categoryName: "Brasileira",
      price: 34.90,
      prepTime: 90,
      servings: 6,
      difficulty: "MEDIUM",
      imageUrl: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=900&q=80",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      description: "Feijoada tradicional dessalgada com carnes nobres, acompanhada de farofa de mandioca na manteiga de garrafa e couve crisp.",
      instructions: "1. Deixe o feijão de molho e dessalgue previamente as carnes nobres.\n2. Cozinhe o feijão com louro e as carnes aos poucos de acordo com o ponto de cozimento.\n3. Refogue com alho e cebola dourados.\n4. Apure o caldo até encorpar e sirva com couve refogada e farofa crocante.",
      ingredientsList: [
        { name: "Feijão preto", quantity: "500g" },
        { name: "Carne seca dessalgada", quantity: "250g" },
        { name: "Costelinha de porco", quantity: "300g" },
        { name: "Lombo defumado", quantity: "200g" },
        { name: "Paio", quantity: "150g em rodelas" },
        { name: "Linguiça calabresa", quantity: "150g em rodelas" },
        { name: "Farinha de mandioca", quantity: "200g" },
        { name: "Couve manteiga", quantity: "1 maço fatiado fino" }
      ]
    },
    {
      title: "Petit Gâteau com Calda Cremosa",
      chefDisplayName: "Chef Yasmin Lobo",
      categoryName: "Sobremesas",
      price: 19.90,
      prepTime: 25,
      servings: 2,
      difficulty: "EASY",
      imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      description: "Bolo de chocolate com centro quente derretido, servido com sorvete de baunilha e farofa de castanhas.",
      instructions: "1. Derreta o chocolate amargo 70% com a manteiga sem sal em banho-maria.\n2. Bata os ovos com o açúcar até formar um creme claro.\n3. Incorpore delicadamente a mistura de chocolate e a farinha peneirada.\n4. Distribua em forminhas untadas com cacau.\n5. Asse em forno pré-aquecido a 200°C por exatamente 8 minutos para manter o centro líquido.",
      ingredientsList: [
        { name: "Chocolate amargo 70%", quantity: "150g" },
        { name: "Manteiga sem sal", quantity: "100g" },
        { name: "Ovos", quantity: "2 unidades inteiras + 2 gemas" },
        { name: "Açúcar cristal", quantity: "60g" },
        { name: "Farinha de trigo", quantity: "40g" },
        { name: "Sorvete de baunilha", quantity: "2 bolas para servir" }
      ]
    }
  ];

  const createdRecipesByTitle = {};

  for (const r of recipesData) {
    const chefInfo = chefs[r.chefDisplayName];
    const category = categories[r.categoryName];

    let recipe = await prisma.recipe.findFirst({
      where: { title: r.title }
    });

    const kitPrice = Number((r.price + 15).toFixed(2));
    const kitDescription = "Insumos selecionados e embalados a vácuo, temperos frescos porcionados e guia de preparo impresso.";

    if (!recipe) {
      recipe = await prisma.recipe.create({
        data: {
          title: r.title,
          description: r.description,
          instructions: r.instructions,
          imageUrl: r.imageUrl,
          videoUrl: r.videoUrl,
          price: r.price,
          hasKit: true,
          kitPrice: kitPrice,
          kitStock: 15,
          kitDescription: kitDescription,
          prepTime: r.prepTime,
          servings: r.servings,
          difficulty: r.difficulty,
          isPublished: true,
          authorId: chefInfo.user.id,
          chefId: chefInfo.chef.id,
          categoryId: category.id
        }
      });
    } else {
      recipe = await prisma.recipe.update({
        where: { id: recipe.id },
        data: {
          description: r.description,
          instructions: r.instructions,
          imageUrl: r.imageUrl,
          videoUrl: r.videoUrl,
          price: r.price,
          hasKit: true,
          kitPrice: kitPrice,
          kitStock: 15,
          kitDescription: kitDescription,
          prepTime: r.prepTime,
          servings: r.servings,
          difficulty: r.difficulty,
          isPublished: true,
          chefId: chefInfo.chef.id,
          categoryId: category.id
        }
      });
    }

    createdRecipesByTitle[r.title] = recipe;

    for (const item of r.ingredientsList) {
      const ing = ingredients[item.name];
      if (ing) {
        await prisma.recipeIngredient.upsert({
          where: {
            recipeId_ingredientId: {
              recipeId: recipe.id,
              ingredientId: ing.id
            }
          },
          update: { quantity: item.quantity },
          create: {
            recipeId: recipe.id,
            ingredientId: ing.id,
            quantity: item.quantity
          }
        });
      }
    }
  }

  // 6. Clientes e Depoimentos Reais na tabela Review
  const communityReviewsData = [
    {
      name: "Mariana Costa",
      email: "mariana.costa@gastromatch.com",
      city: "Florianópolis",
      state: "SC",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      recipeTitle: "Risoto de Cogumelos Selvagens",
      rating: 5,
      comment: "O GastroMatch mudou meus jantares de fim de semana! Comprei o kit de Risoto do Chef Gabriel e assisti à videoaula. Parecia um prato de restaurante 5 estrelas!"
    },
    {
      name: "Rodrigo Almeida",
      email: "rodrigo.almeida@gastromatch.com",
      city: "Itajaí",
      state: "SC",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      recipeTitle: "Feijoada Gourmet Completa",
      rating: 5,
      comment: "Poder receber os ingredientes na porção exata direto do restaurante e aprender o passo a passo com o chef faz toda a diferença. Sem desperdício e com sabor perfeito."
    },
    {
      name: "Camila & Vinicius",
      email: "camila.vinicius@gastromatch.com",
      city: "São José",
      state: "SC",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
      recipeTitle: "Tacos al Pastor & Molhos Artesanais",
      rating: 5,
      comment: "Fizemos a noite dos Tacos al Pastor acompanhando a aula. O kit chegou super rápido dentro do nosso raio de entrega e foi uma experiência divertida e deliciosa!"
    },
    {
      name: "Lucas Ferreira",
      email: "lucas.ferreira@gastromatch.com",
      city: "Florianópolis",
      state: "SC",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      recipeTitle: "Pasta Carbonara Autêntica",
      rating: 5,
      comment: "O guanciale artesanal do kit e a explicação de como emulsionar as gemas sem talhar deixaram a Carbonara idêntica à de Roma!"
    },
    {
      name: "Beatriz Santos",
      email: "beatriz.santos@gastromatch.com",
      city: "Florianópolis",
      state: "SC",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
      recipeTitle: "Sushi Assortido & Omakase",
      rating: 5,
      comment: "Peixe super fresco e o arroz shari temperado na medida certa. A aula do Chef Yuki é impecável!"
    },
    {
      name: "Fernanda Lima",
      email: "fernanda.lima@gastromatch.com",
      city: "Biguaçu",
      state: "SC",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
      recipeTitle: "Petit Gâteau com Calda Cremosa",
      rating: 5,
      comment: "O ponto de forno explicado pela Chef Yasmin funcionou de primeira! O centro ficou perfeitamente derretido."
    }
  ];

  for (const rev of communityReviewsData) {
    const reviewer = await prisma.user.upsert({
      where: { email: rev.email },
      update: { name: rev.name, avatarUrl: rev.avatarUrl },
      create: {
        name: rev.name,
        email: rev.email,
        passwordHash,
        role: "USER",
        avatarUrl: rev.avatarUrl,
        profile: { create: { city: rev.city, state: rev.state } }
      }
    });

    await prisma.profile.upsert({
      where: { userId: reviewer.id },
      update: { city: rev.city, state: rev.state },
      create: { userId: reviewer.id, city: rev.city, state: rev.state }
    });

    const targetRecipe = createdRecipesByTitle[rev.recipeTitle];
    if (targetRecipe) {
      await prisma.review.upsert({
        where: {
          userId_recipeId: {
            userId: reviewer.id,
            recipeId: targetRecipe.id
          }
        },
        update: { rating: rev.rating, comment: rev.comment },
        create: {
          userId: reviewer.id,
          recipeId: targetRecipe.id,
          rating: rev.rating,
          comment: rev.comment
        }
      });
    }
  }

  const countsBeforeCleanup = await prisma.recipe.findMany({
    orderBy: { id: "asc" }
  });
  const seenRecipeTitles = new Map();
  for (const rec of countsBeforeCleanup) {
    const key = (rec.title || "").trim().toLowerCase();
    if (!key) continue;
    if (seenRecipeTitles.has(key)) {
      await prisma.recipeIngredient.deleteMany({ where: { recipeId: rec.id } });
      await prisma.review.deleteMany({ where: { recipeId: rec.id } });
      await prisma.favorite.deleteMany({ where: { recipeId: rec.id } });
      await prisma.orderItem.deleteMany({ where: { recipeId: rec.id } });
      await prisma.recipe.delete({ where: { id: rec.id } });
    } else {
      seenRecipeTitles.set(key, rec.id);
    }
  }

  const counts = {
    categories: await prisma.category.count(),
    chefs: await prisma.chef.count(),
    documents: await prisma.chefDocument.count(),
    recipes: await prisma.recipe.count(),
    ingredients: await prisma.ingredient.count(),
    reviews: await prisma.review.count()
  };
  console.log("✔ Tabelas sincronizadas no banco:", counts);
}

if (require.main === module) {
  seedDatabase()
    .catch((error) => {
      console.error("Erro ao popular banco de dados:", error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { seedDatabase };
