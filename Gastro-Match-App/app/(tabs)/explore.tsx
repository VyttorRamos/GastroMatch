import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, View } from 'react-native';
import { RecipeCard, screenStyles as s } from '../../components/recipe-card';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Recipe } from '../../services/api';
import { useFavorites } from '../../services/favorites-context';

export default function FavoritesScreen() {
  const { favorites, loading, refreshFavorites, toggleFavorite } = useFavorites();
  const [refreshing, setRefreshing] = useState(false);
  useFocusEffect(useCallback(() => {
    refreshFavorites().catch(error => Alert.alert('Não carregou', error instanceof Error ? error.message : 'Tente novamente.'));
  }, [refreshFavorites]));
  async function remove(recipe: Recipe) {
    try { await toggleFavorite(recipe); }
    catch (error) { Alert.alert('Ops!', error instanceof Error ? error.message : 'Não foi possível remover.'); }
  }
  async function refresh() {
    setRefreshing(true);
    try { await refreshFavorites(); }
    catch (error) { Alert.alert('Não carregou', error instanceof Error ? error.message : 'Tente novamente.'); }
    finally { setRefreshing(false); }
  }
  return <SafeAreaView style={s.page} edges={['top', 'left', 'right']}><ScrollView contentContainerStyle={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#bc1909" />}>
    <View style={s.header}><View><Text style={s.brand}>Minha cozinha</Text><Text style={s.caption}>Receitas guardadas com carinho</Text></View><Text style={{ fontSize: 24 }}>♡</Text></View>
    <Text style={s.heading}>Seus favoritos</Text><Text style={s.body}>Aquele cantinho para voltar às receitas que você amou.</Text>
    {loading && !favorites.length ? <ActivityIndicator style={{ marginTop: 30 }} color="#bc1909" /> : favorites.length ? favorites.map(entry => <View key={entry.recipe.id} style={{ marginBottom: 16 }}><RecipeCard recipe={entry.recipe} favorite onFavorite={() => remove(entry.recipe)} /></View>) : <View style={s.empty}><Text style={{ fontSize: 34 }}>💛</Text><Text style={s.emptyTitle}>Sua lista começa aqui</Text><Text style={s.emptyText}>Toque no coração de uma receita para guardá-la e encontrá-la rapidinho por aqui.</Text></View>}
  </ScrollView></SafeAreaView>;
}
