import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';
import { recipeService, Recipe } from '../../services/api';

export default function RecipeDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    Promise.all([recipeService.get(Number(id)), recipeService.favorites()]).then(([item, saved]) => {
      if (active) { setRecipe(item); setFavorite(saved.some(entry => entry.recipe.id === Number(id))); }
    }).catch(error => Alert.alert('Não carregou a receita', error instanceof Error ? error.message : 'Tente novamente.')).finally(() => setLoading(false));
    return () => { active = false; };
  }, [id]);
  async function toggleFavorite() {
    if (!recipe) return;
    setFavorite(value => !value);
    try { await recipeService.toggleFavorite(recipe.id); }
    catch (error) { setFavorite(value => !value); Alert.alert('Ops!', error instanceof Error ? error.message : 'Não foi possível atualizar o favorito.'); }
  }
  if (loading) return <SafeAreaView style={styles.loading} edges={['top', 'left', 'right']}><ActivityIndicator color="#bc1909" /></SafeAreaView>;
  if (!recipe) return <SafeAreaView style={styles.loading} edges={['top', 'left', 'right']}><Text style={{ color: '#81766e' }}>Receita não encontrada.</Text><Pressable onPress={() => router.back()}><Text style={{ color: colors.red, marginTop: 12 }}>Voltar</Text></Pressable></SafeAreaView>;
  const instructions = recipe.instructions?.split(/\n+/).map(line => line.replace(/^\s*(\d+[.)\-:]\s*)/, '').trim()).filter(Boolean) || [];
  return <SafeAreaView style={styles.page} edges={['top', 'left', 'right']}><ScrollView>
    <View style={styles.hero}>{recipe.imageUrl ? <Image source={{ uri: recipe.imageUrl }} style={styles.image} contentFit="cover" /> : <View style={[styles.image, styles.placeholder]}><Text style={{ fontSize: 60 }}>🍲</Text></View>}
      <Pressable style={styles.back} onPress={() => router.back()}><Ionicons name="arrow-back" size={21} color="#33251e" /></Pressable><Pressable style={styles.heart} onPress={toggleFavorite}><Ionicons name={favorite ? 'heart' : 'heart-outline'} size={22} color={favorite ? colors.red : colors.ink} /></Pressable>
    </View>
    <View style={styles.content}><Text style={styles.chef}>{recipe.chef?.displayName || recipe.chef?.restaurant || 'Receita da comunidade'}</Text><Text style={styles.title}>{recipe.title}</Text><Text style={styles.description}>{recipe.description}</Text>
      <View style={styles.stats}><View><Text style={styles.statValue}>{recipe.prepTime} min</Text><Text style={styles.statLabel}>PREPARO</Text></View><View><Text style={styles.statValue}>{recipe.servings}</Text><Text style={styles.statLabel}>PORÇÕES</Text></View><View><Text style={styles.statValue}>{recipe.difficulty === 'EASY' ? 'Fácil' : recipe.difficulty === 'MEDIUM' ? 'Médio' : 'Avançado'}</Text><Text style={styles.statLabel}>NÍVEL</Text></View></View>
      <Text style={styles.section}>Ingredientes</Text>
      {recipe.ingredients?.length ? recipe.ingredients.map((item, index) => <View style={styles.ingredient} key={`${item.ingredient.name}-${index}`}><View style={styles.dot} /><Text style={styles.ingredientName}>{item.ingredient.name}</Text><Text style={styles.quantity}>{item.quantity}</Text></View>) : <Text style={styles.muted}>Os ingredientes ainda não foram informados.</Text>}
      <Text style={styles.section}>Modo de preparo</Text>
      {instructions.length ? instructions.map((step, index) => <View style={styles.step} key={`${index}-${step}`}><View style={styles.stepNumber}><Text style={styles.stepNumberText}>{String(index + 1).padStart(2, '0')}</Text></View><Text style={styles.stepText}>{step}</Text></View>) : <Text style={styles.muted}>O modo de preparo ainda não foi informado.</Text>}
      {recipe.videoUrl ? <Pressable style={styles.video} onPress={() => Linking.openURL(recipe.videoUrl!).catch(() => Alert.alert('Ops!', 'Não foi possível abrir o vídeo.'))}><Ionicons name="play-circle-outline" size={22} color="#bc1909" /><Text style={styles.videoText}>Assistir à videoaula</Text><Ionicons name="arrow-forward" size={16} color="#bc1909" /></Pressable> : null}
      <View style={{ height: 28 }} />
    </View>
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: colors.offWhite }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.offWhite }, hero: { height: 290, backgroundColor: colors.yellow }, image: { width: '100%', height: '100%' }, placeholder: { alignItems: 'center', justifyContent: 'center' }, back: { position: 'absolute', top: 16, left: 18, width: 42, height: 42, borderRadius: 24, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }, heart: { position: 'absolute', top: 16, right: 18, width: 42, height: 42, borderRadius: 24, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }, content: { paddingHorizontal: 21, paddingTop: 22 }, chef: { color: '#a05839', fontSize: 12, fontWeight: '800' }, title: { color: '#28241f', fontWeight: '800', fontSize: 30, letterSpacing: -0.8, marginTop: 7 }, description: { color: '#81766e', fontSize: 14, lineHeight: 22, marginTop: 8 }, stats: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: colors.offWhite, borderRadius: 16, paddingVertical: 17, marginTop: 19 }, statValue: { textAlign: 'center', fontSize: 15, color: colors.ink, fontWeight: '800' }, statLabel: { textAlign: 'center', color: '#998b80', fontSize: 9, fontWeight: '800', letterSpacing: 0.9, marginTop: 5 }, section: { color: '#28241f', fontSize: 19, fontWeight: '800', marginTop: 26, marginBottom: 13 }, ingredient: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 12, gap: 10 }, dot: { width: 7, height: 7, borderRadius: 5, backgroundColor: colors.orange }, ingredientName: { flex: 1, color: '#453b34', fontSize: 14 }, quantity: { color: '#91867d', fontSize: 12 }, step: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 }, stepNumber: { backgroundColor: colors.yellow, width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, stepNumberText: { color: colors.red, fontSize: 11, fontWeight: '800' }, stepText: { flex: 1, color: '#5d534b', fontSize: 14, lineHeight: 21, paddingTop: 5 }, muted: { color: '#91867d', fontSize: 13 }, video: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: 15, borderRadius: 14, marginTop: 22 }, videoText: { flex: 1, color: colors.red, fontWeight: '800', fontSize: 14 } });
