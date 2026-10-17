import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, View } from 'react-native';
import { RecipeCard, screenStyles as s } from '../../components/recipe-card';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';
import { recipeService, Recipe } from '../../services/api';

export default function FavoritesScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(async () => {
    try { setRecipes((await recipeService.favorites()).map(item => item.recipe)); }
    catch (error) { Alert.alert('Não carregou', error instanceof Error ? error.message : 'Tente novamente.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  async function remove(id: number) {
    setRecipes(current => current.filter(item => item.id !== id));
    try { await recipeService.toggleFavorite(id); }
    catch (error) { load(); Alert.alert('Ops!', error instanceof Error ? error.message : 'Não foi possível remover.'); }
  }
  return <SafeAreaView style={s.page} edges={['top', 'left', 'right']}><ScrollView contentContainerStyle={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#bc1909" />}>
    <View style={s.header}><View><Text style={s.brand}>Minha cozinha</Text><Text style={s.caption}>Receitas guardadas com carinho</Text></View><Text style={{ fontSize: 24 }}>♡</Text></View>
    <Text style={s.heading}>Seus favoritos</Text><Text style={s.body}>Aquele cantinho para voltar às receitas que você amou.</Text>
    {loading ? <ActivityIndicator style={{ marginTop: 30 }} color="#bc1909" /> : recipes.length ? recipes.map(recipe => <View key={recipe.id} style={{ marginBottom: 16 }}><RecipeCard recipe={recipe} favorite onFavorite={() => remove(recipe.id)} /></View>) : <View style={s.empty}><Text style={{ fontSize: 34 }}>💛</Text><Text style={s.emptyTitle}>Sua lista começa aqui</Text><Text style={s.emptyText}>Toque no coração de uma receita para guardá-la e encontrá-la rapidinho por aqui.</Text></View>}
  </ScrollView></SafeAreaView>;
}
