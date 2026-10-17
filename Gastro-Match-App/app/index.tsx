import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../services/auth-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';

const WEB_URL = process.env.EXPO_PUBLIC_WEB_REGISTER_URL || 'http://localhost:5173';

export default function LoginScreen() {
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);
  useEffect(() => { if (user) router.replace('/(tabs)'); }, [user]);

  async function handleLogin() {
    if (!email.trim() || !password) return Alert.alert('Faltou preencher', 'Informe seu e-mail e sua senha.');
    setBusy(true);
    try { await login(email.trim(), password); router.replace('/(tabs)'); }
    catch (error) { Alert.alert('Não foi possível entrar', error instanceof Error ? error.message : 'Tente novamente.'); }
    finally { setBusy(false); }
  }

  if (loading) return <View style={styles.loading}><ActivityIndicator color="#bc1909" /></View>;
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <View style={styles.brand}><Image source={require('../assets/images/gastromatch-logo.png')} style={styles.brandLogo} resizeMode="contain" accessibilityLabel="GastroMatch" /></View>
        <View style={styles.eyebrow}><Text style={styles.eyebrowText}>SUA PRÓXIMA DESCOBERTA COMEÇA AQUI</Text></View>
        <Text style={styles.title}>Tem sabor de{ '\n' }casa por aqui.</Text>
        <Text style={styles.subtitle}>Entre para descobrir receitas feitas por quem ama cozinhar.</Text>
        <Text style={styles.label}>E-mail</Text>
        <TextInput style={styles.input} placeholder="voce@email.com" placeholderTextColor="#a69a91" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} returnKeyType="next" />
        <Text style={styles.label}>Senha</Text>
        <TextInput style={styles.input} placeholder="Sua senha" placeholderTextColor="#a69a91" value={password} onChangeText={setPassword} secureTextEntry returnKeyType="go" onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 250)} onSubmitEditing={handleLogin} />
        <Pressable style={[styles.button, busy && { opacity: 0.7 }]} onPress={handleLogin} disabled={busy}>{busy ? <ActivityIndicator color="#fffEED" /> : <Text style={styles.buttonText}>Entrar na minha conta  →</Text>}</Pressable>
        <View style={styles.signup}><Text style={styles.signupText}>Ainda não tem conta? </Text><Pressable onPress={() => Linking.openURL(WEB_URL).catch(() => Alert.alert('Ops!', 'Não foi possível abrir o site.'))}><Text style={styles.link}>Cadastre-se pelo site</Text></Pressable></View>
        <Text style={styles.footnote}>Seu cadastro é feito no site GastroMatch. Depois, use sua conta para entrar por aqui!</Text>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export const authStyles = StyleSheet.create({});
const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: colors.offWhite }, page: { flex: 1, backgroundColor: colors.offWhite }, content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 32 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.offWhite }, brand: { alignItems: 'flex-start', marginBottom: 36 }, brandLogo: { width: 210, height: 60 }, eyebrow: { backgroundColor: colors.yellow, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 18 }, eyebrowText: { color: colors.red, fontWeight: '700', fontSize: 10, letterSpacing: 1 }, title: { fontSize: 38, lineHeight: 43, color: '#28241f', fontWeight: '800', letterSpacing: -1.4 }, subtitle: { color: '#746b63', fontSize: 15, lineHeight: 23, marginTop: 12, marginBottom: 24 }, label: { color: '#35302b', fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 12 }, input: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 14, minHeight: 54, paddingHorizontal: 16, color: '#28241f', fontSize: 15 }, button: { backgroundColor: colors.red, borderRadius: 14, minHeight: 56, alignItems: 'center', justifyContent: 'center', marginTop: 24 }, buttonText: { color: colors.white, fontSize: 15, fontWeight: '800' }, signup: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 }, signupText: { color: '#746b63' }, link: { color: colors.red, fontWeight: '800' }, footnote: { textAlign: 'center', color: '#968a80', fontSize: 12, lineHeight: 18, marginTop: 30, paddingHorizontal: 16 } });
