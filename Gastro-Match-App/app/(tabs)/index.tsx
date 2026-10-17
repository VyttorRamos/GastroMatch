import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RecipeCard, screenStyles as s } from '../../components/recipe-card';
import { recipeService, Recipe } from '../../services/api';
import { useAuth } from '../../services/auth-context';
import { colors } from '../../constants/theme';

export default function HomeScreen() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [avatarFailed, setAvatarFailed] = useState(false);

  const load = useCallback(async (term = search) => {
    setLoadError('');
    try {
      const list = await recipeService.list(term);
      setRecipes(list);
      const saved = await recipeService.favorites().catch(() => []);
      setFavorites(saved.map(item => item.recipe.id));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Não foi possível carregar as receitas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => load(search), 250);
    return () => clearTimeout(timer);
  }, [search, load]);

  const categories = useMemo(() => ['Todas', ...new Set(recipes.map(item => item.category?.name).filter((name): name is string => Boolean(name)))], [recipes]);
  const visibleRecipes = category === 'Todas' ? recipes : recipes.filter(item => item.category?.name === category);
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'pessoa cozinheira';

  async function toggle(id: number) {
    const wasFavorite = favorites.includes(id);
    setFavorites(current => wasFavorite ? current.filter(item => item !== id) : [...current, id]);
    try { await recipeService.toggleFavorite(id); }
    catch (error) {
      setFavorites(current => wasFavorite ? [...current, id] : current.filter(item => item !== id));
      Alert.alert('Não foi possível salvar', error instanceof Error ? error.message : 'Tente novamente.');
    }
  }

  return <SafeAreaView style={s.page} edges={['top', 'left', 'right']}>
    <ScrollView contentContainerStyle={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#bc1909" />}>
      <View style={s.header}>
        <View><Image source={require('../../assets/images/gastromatch-logo.png')} style={styles.brandLogo} resizeMode="contain" accessibilityLabel="GastroMatch" /><Text style={s.caption}>Um prato cheio de boas ideias</Text></View>
        <View style={styles.avatar}>
          {user?.avatarUrl && !avatarFailed ? <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} contentFit="cover" onError={() => setAvatarFailed(true)} /> : <Ionicons name="restaurant-outline" size={19} color="#bc1909" />}
        </View>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroKicker}>BOM APETITE, {firstName.toLocaleUpperCase('pt-BR')}</Text>
        <Text style={styles.heroTitle}>O que vai dar{ '\n' }água na boca hoje?</Text>
        <Text style={styles.heroText}>Explore receitas especiais, salve suas favoritas e descubra novos sabores.</Text>
        <View style={styles.heroDecor}><Text style={{ fontSize: 38 }}>🍊</Text></View>
      </View>

      <View style={styles.search}>
        <Ionicons name="search-outline" size={19} color="#978b82" />
        <TextInput placeholder="Buscar uma receita..." placeholderTextColor="#a69a91" value={search} onChangeText={setSearch} style={styles.searchInput} returnKeyType="search" />
        {search ? <Pressable onPress={() => setSearch('')} accessibilityLabel="Limpar busca"><Ionicons name="close-circle" size={19} color="#91867d" /></Pressable> : null}
      </View>

      {categories.length > 1 && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
        {categories.map(item => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.categoryChip, category === item && styles.categoryChipActive]}><Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>{item}</Text></Pressable>)}
      </ScrollView>}

      <View style={styles.sectionHeading}><Text style={s.section}>{search ? 'Resultados da busca' : 'Receitas para você'}</Text>{!loading && recipes.length > 0 ? <Text style={styles.recipeCount}>{visibleRecipes.length}</Text> : null}</View>
      {loading ? <ActivityIndicator style={{ marginTop: 30 }} color="#bc1909" /> : loadError ? <View style={s.empty}><Ionicons name="cloud-offline-outline" size={32} color="#bc1909" /><Text style={s.emptyTitle}>Não conseguimos carregar</Text><Text style={s.emptyText}>{loadError}</Text><Pressable style={s.button} onPress={() => { setLoading(true); load(); }}><Text style={s.buttonText}>Tentar novamente</Text></Pressable></View> : visibleRecipes.length ? visibleRecipes.map(recipe => <View key={recipe.id} style={{ marginBottom: 16 }}><RecipeCard recipe={recipe} favorite={favorites.includes(recipe.id)} onFavorite={() => toggle(recipe.id)} /></View>) : <View style={s.empty}><Text style={{ fontSize: 32 }}>{search || category !== 'Todas' ? '🔎' : '🥣'}</Text><Text style={s.emptyTitle}>{search || category !== 'Todas' ? 'Nenhuma receita encontrada' : 'Estamos preparando o cardápio'}</Text><Text style={s.emptyText}>{search || category !== 'Todas' ? 'Tente outro termo ou escolha uma categoria diferente.' : 'As receitas publicadas pelos chefs no site aparecem aqui. Puxe a tela para baixo para atualizar.'}</Text>{category !== 'Todas' ? <Pressable style={s.button} onPress={() => setCategory('Todas')}><Text style={s.buttonText}>Ver todas as categorias</Text></Pressable> : null}</View>}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  brandLogo: { width: 138, height: 40 },
  avatar: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: colors.yellow, overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  hero: { backgroundColor: colors.yellow, borderRadius: 22, padding: 20, minHeight: 188, overflow: 'hidden', justifyContent: 'center' },
  heroKicker: { color: colors.red, fontSize: 9, fontWeight: '800', letterSpacing: 1.2, marginBottom: 9 },
  heroTitle: { color: colors.ink, fontSize: 27, lineHeight: 31, fontWeight: '800', letterSpacing: -0.8, maxWidth: 240 },
  heroText: { color: '#453b34', fontSize: 12, lineHeight: 18, maxWidth: 245, marginTop: 8 },
  heroDecor: { position: 'absolute', right: 16, bottom: 22, width: 70, height: 70, borderRadius: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.offWhite },
  search: { flexDirection: 'row', height: 52, alignItems: 'center', paddingHorizontal: 15, backgroundColor: colors.white, borderRadius: 14, borderWidth: 1, borderColor: colors.border, marginTop: 16, gap: 10 },
  searchInput: { flex: 1, color: '#28241f', fontSize: 14, paddingLeft: 2 },
  categories: { gap: 8, paddingTop: 14, paddingBottom: 2 },
  categoryChip: { borderRadius: 20, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.white },
  categoryChipActive: { backgroundColor: colors.red, borderColor: colors.red },
  categoryText: { color: '#5d534b', fontSize: 12, fontWeight: '700' },
  categoryTextActive: { color: colors.white },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  recipeCount: { color: colors.muted, fontSize: 12, fontWeight: '700', marginTop: 24 },
});
