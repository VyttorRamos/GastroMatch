const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("gastromatch_token");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Não foi possível concluir a solicitação.");
  }

  return data;
}

export const api = {
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),

  register: (name, email, password, role = "USER") =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role })
    }),

  me: () => request("/auth/me"),

  recipes: (search = "") =>
    request(`/recipes${search ? `?search=${encodeURIComponent(search)}` : ""}`),

  recipe: (id) => request(`/recipes/${id}`),

  categories: () => request("/categories"),

  favorites: () => request("/favorites"),

  toggleFavorite: (recipeId) =>
    request(`/favorites/${recipeId}`, { method: "POST" }),

  reviews: (recipeId) => request(`/reviews/recipe/${recipeId}`),

  createReview: (recipeId, rating, comment) =>
    request(`/reviews/recipe/${recipeId}`, {
      method: "POST",
      body: JSON.stringify({ rating, comment })
    }),

  orders: () => request("/orders"),

  createOrder: (items) =>
    request("/orders", {
      method: "POST",
      body: JSON.stringify({ items })
    })
};
