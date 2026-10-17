import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { useAuth } from '../../services/auth-context';
import { colors } from '../../constants/theme';

export default function TabLayout() {
  const { user, loading } = useAuth();
  useEffect(() => { if (!loading && !user) router.replace('/'); }, [loading, user]);
  if (!user) return null;
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.red, tabBarInactiveTintColor: '#a69a91', tabBarStyle: { height: 64, paddingTop: 8, paddingBottom: 8, borderTopColor: colors.yellow, backgroundColor: colors.white }, tabBarLabelStyle: { fontSize: 11, fontWeight: '700' } }}>
    <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }} />
    <Tabs.Screen name="explore" options={{ title: 'Favoritos', tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" size={size} color={color} /> }} />
    <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }} />
  </Tabs>;
}
