const bcrypt = require("bcryptjs");
const prisma = require("../src/config/prisma");

async function main() {
  console.log("Iniciando seed completo do GastroMatch...");
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
  console.log(`✓ ${Object.keys(categories).length} categorias cadastradas.`);

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
          city: "São Paulo",
          state: "SP",
          phone: "(11) 99999-0001"
        }
      }
    }
  });

  // 3. Chefs e Usuários
  const chefsData = [
    {
      name: "Chef Gabriel Camillo",
      email: "gabriel@gastromatch.com",
      displayName: "Chef Gabriel Camillo",
      restaurant: "Ristorante Camillo",
      description: "Especialista em risotos e culinária mediterrânea clássica."
    },
    {
      name: "Chef Marco",
      email: "marco@gastromatch.com",
      displayName: "Chef Marco",
      restaurant: "Trattoria Romana",
      description: "Mestre em massas artesanais e tradição gastronômica de Roma."
    },
    {
      name: "Chef Yuki Tanaka",
      email: "yuki@gastromatch.com",
      displayName: "Chef Yuki Tanaka",
      restaurant: "Tanaka Sushi Bar",
      description: "Sushiman com mais de 15 anos de experiência em culinária japonesa tradicional."
    },
    {
      name: "Chef Casa Mexicana",
      email: "mexicana@gastromatch.com",
      displayName: "Casa Mexicana",
      restaurant: "Taquería El Mariachi",
      description: "Cozinha mexicana raiz com temperos importados e tortillas feitas à mão."
    },
    {
      name: "Chef Otavio de Deus",
      email: "otavio@gastromatch.com",
      displayName: "Chef Otavio de Deus",
      restaurant: "Cantinho Brasileiro",
      description: "Preservando e inovando a rica tradição dos pratos típicos brasileiros."
    },
    {
      name: "Chef Yasmin Lobo",
      email: "yasmin@gastromatch.com",
      displayName: "Chef Yasmin Lobo",
      restaurant: "Ateliê Doce Lobo",
      description: "Confeiteira formada na Le Cordon Bleu, apaixonada por chocolates e doces finos."
    }
  ];

  const chefs = {};
  for (const c of chefsData) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        name: c.name,
        email: c.email,
        passwordHash,
        role: "CHEF",
        profile: { create: { city: "São Paulo", state: "SP" } }
      }
    });

    const chefRecord = await prisma.chef.upsert({
      where: { userId: user.id },
      update: {
        displayName: c.displayName,
        restaurant: c.restaurant,
        description: c.description,
        status: "APPROVED"
      },
      create: {
        userId: user.id,
        displayName: c.displayName,
        restaurant: c.restaurant,
        description: c.description,
        status: "APPROVED"
      }
    });

    chefs[c.displayName] = { user, chef: chefRecord };
  }
  console.log(`✓ ${Object.keys(chefs).length} chefs cadastrados e aprovados.`);

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
  console.log(`✓ ${Object.keys(ingredients).length} ingredientes cadastrados.`);

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

  for (const r of recipesData) {
    const chefInfo = chefs[r.chefDisplayName];
    const category = categories[r.categoryName];

    // Check if recipe already exists by title
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

    // Associar ingredientes
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

    // Inserir avaliação de demonstração
    await prisma.review.upsert({
      where: {
        userId_recipeId: {
          userId: adminUser.id,
          recipeId: recipe.id
        }
      },
      update: { rating: 5, comment: "Receita sensacional! Muito bem explicada e sabor impecável." },
      create: {
        userId: adminUser.id,
        recipeId: recipe.id,
        rating: 5,
        comment: "Receita sensacional! Muito bem explicada e sabor impecável."
      }
    });
  }
  console.log(`✓ ${recipesData.length} receitas completas cadastradas com ingredientes e avaliações.`);

  console.log("\n=============================================");
  console.log("Banco populado com sucesso!");
  console.log("Contas de demonstração foram criadas somente se ainda não existiam (senha inicial: 123456).");
  console.log("=============================================");
}

main()
  .catch((error) => {
    console.error("Erro ao popular banco de dados:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
