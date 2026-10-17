import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { screenStyles as s } from '../../components/recipe-card';
import { useAuth } from '../../services/auth-context';
import { colors } from '../../constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [avatarFailed, setAvatarFailed] = useState(false);
  async function signOut() { await logout(); router.replace('/'); }
  return <SafeAreaView style={s.page} edges={['top', 'left', 'right']}><ScrollView contentContainerStyle={s.scroll}>
    <View style={s.header}><View><Text style={s.brand}>Meu perfil</Text><Text style={s.caption}>Sua conta GastroMatch</Text></View><Ionicons name="person-circle-outline" size={30} color="#bc1909" /></View>
    <View style={styles.profile}><View style={styles.avatar}>{user?.avatarUrl && !avatarFailed ? <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} contentFit="cover" onError={() => setAvatarFailed(true)} /> : <Text style={styles.initial}>{user?.name?.trim().charAt(0).toUpperCase() || 'G'}</Text>}</View><Text style={styles.name}>{user?.name || 'Pessoa cozinheira'}</Text><Text style={styles.email}>{user?.email}</Text><View style={styles.badge}><Text style={styles.badgeText}>✦  COZINHA DE CASA</Text></View></View>
    <Text style={s.section}>Sua conta</Text>
    <View style={styles.menuItem}><Ionicons name="mail-outline" size={20} color="#bc1909" /><View style={{ flex: 1 }}><Text style={styles.itemTitle}>E-mail de acesso</Text><Text style={styles.itemSubtitle}>{user?.email}</Text></View></View>
    <View style={styles.menuItem}><Ionicons name="shield-checkmark-outline" size={20} color="#bc1909" /><View style={{ flex: 1 }}><Text style={styles.itemTitle}>Conta protegida</Text><Text style={styles.itemSubtitle}>Login conectado com segurança</Text></View></View>
    <Pressable style={s.button} onPress={() => Alert.alert('Sair da conta?', 'Você poderá entrar novamente com seu e-mail e senha.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Sair', style: 'destructive', onPress: signOut }])}><Text style={s.buttonText}>Sair da conta</Text></Pressable>
    <Text style={styles.note}>Feito com carinho para quem ama cozinhar. 🍊</Text>
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ profile: { alignItems: 'center', backgroundColor: colors.yellow, paddingVertical: 28, borderRadius: 20 }, avatar: { width: 86, height: 86, backgroundColor: colors.white, borderRadius: 44, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, avatarImage: { width: '100%', height: '100%' }, initial: { color: colors.red, fontSize: 28, fontWeight: '800' }, name: { fontSize: 20, fontWeight: '800', color: colors.ink, marginTop: 12 }, email: { fontSize: 13, color: '#453b34', marginTop: 4 }, badge: { backgroundColor: colors.offWhite, borderRadius: 16, marginTop: 12, paddingHorizontal: 10, paddingVertical: 6 }, badgeText: { color: colors.red, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 }, menuItem: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 16, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 14, marginBottom: 10 }, itemTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' }, itemSubtitle: { color: colors.muted, fontSize: 12, marginTop: 4 }, note: { textAlign: 'center', color: colors.muted, fontSize: 12, marginTop: 26 } });
