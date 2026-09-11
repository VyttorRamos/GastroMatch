import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Linking,
  ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { authService } from '../services/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.login(email, password);
      router.replace('/(tabs)'); 
    } catch (error: any) {
      Alert.alert('Falha no Login', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    const registerUrl = process.env.EXPO_PUBLIC_WEB_REGISTER_URL;
    if (registerUrl) {
      const supported = await Linking.canOpenURL(registerUrl);
      if (supported) {
        await Linking.openURL(registerUrl);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir a página de registro.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GastroMatch</Text>
      
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Ainda não tem conta? </Text>
        <TouchableOpacity onPress={handleRegister}>
          <Text style={styles.registerLink}>Cadastre-se no site</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 48,
    color: '#ff4757',
  },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#ff4757',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    color: '#666',
  },
  registerLink: {
    color: '#ff4757',
    fontWeight: 'bold',
  },
});