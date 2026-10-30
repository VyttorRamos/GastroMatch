import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../services/auth-context';
import { FavoritesProvider } from '../services/favorites-context';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';

export default function RootLayout() {
  return <SafeAreaProvider><AuthProvider><FavoritesProvider><StatusBar style="dark" backgroundColor={colors.offWhite} /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.offWhite } }} /></FavoritesProvider></AuthProvider></SafeAreaProvider>;
}
