import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const authService = {
  async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer login');
      }

      if (data.token) {
        await SecureStore.setItemAsync('jwt_token', data.token);
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  async logout() {
    await SecureStore.deleteItemAsync('jwt_token');
  }
};