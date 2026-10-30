import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api');
const TOKEN_KEY = 'gastromatch_token';

async function readToken() {
  if (Platform.OS === 'web') return typeof localStorage === 'undefined' ? null : localStorage.getItem(TOKEN_KEY);
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function saveToken(token: string) {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

async function clearToken() {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await readToken();
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Não foi possível conectar ao GastroMatch. Confira sua conexão e o endereço da API.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Não foi possível concluir a solicitação.');
  return data as T;
}

export type User = { id: number; name: string; email: string; role?: string; avatarUrl?: string | null };
export type Recipe = {
  id: number; authorId?: number; title: string; description: string; instructions?: string; imageUrl?: string | null;
  videoUrl?: string | null; price: number | string; prepTime: number; servings: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'; category?: { name: string } | null;
  chef?: { displayName?: string; restaurant?: string | null } | null;
  ingredients?: { quantity: string; ingredient: { name: string } }[];
  _count?: { reviews?: number; favorites?: number };
};
export type Order = {
  id: number;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';
  items: { recipeId: number }[];
};
type LoginResponse = { token: string; user: User };
type Favorite = { id: number; recipe: Recipe };

export const authService = {
  async login(email: string, password: string) {
    const data = await request<LoginResponse>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    });
    await saveToken(data.token);
    return data;
  },
  async me() { return request<User>('/auth/me'); },
  async logout() { await clearToken(); },
};

export const recipeService = {
  list: (search = '') => request<Recipe[]>(`/recipes${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  get: (id: number) => request<Recipe>(`/recipes/${id}`),
  favorites: () => request<Favorite[]>('/favorites'),
  toggleFavorite: (id: number) => request<{ favorite: boolean }>(`/favorites/${id}`, { method: 'POST' }),
};

export const orderService = {
  mine: () => request<Order[]>('/orders'),
};
