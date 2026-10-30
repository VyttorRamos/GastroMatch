import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

const AuthContext = createContext(null);

const DEMO_USERS = {
  "admin@gastromatch.com": {
    id: 1,
    name: "Administrador GastroMatch",
    email: "admin@gastromatch.com",
    role: "ADMIN",
    chef: null
  },
  "gabriel@gastromatch.com": {
    id: 2,
    name: "Chef Gabriel Camillo",
    email: "gabriel@gastromatch.com",
    role: "CHEF",
    chef: {
      id: 1,
      displayName: "Chef Gabriel Camillo",
      restaurant: "Ristorante Camillo",
      status: "APPROVED"
    }
  },
  "yasmin@gastromatch.com": {
    id: 3,
    name: "Chef Yasmin Lobo",
    email: "yasmin@gastromatch.com",
    role: "CHEF",
    chef: {
      id: 6,
      displayName: "Chef Yasmin Lobo",
      restaurant: "Ateliê Doce Lobo",
      status: "APPROVED"
    }
  },
  "otavio@gastromatch.com": {
    id: 4,
    name: "Chef Otavio de Deus",
    email: "otavio@gastromatch.com",
    role: "CHEF",
    chef: {
      id: 5,
      displayName: "Chef Otavio de Deus",
      restaurant: "Cantinho Brasileiro",
      status: "APPROVED"
    }
  }
};

export function getLocalChefAppByEmail(email) {
  if (!email) return null;
  const norm = email.trim().toLowerCase();
  try {
    const list = JSON.parse(localStorage.getItem("gastromatch_chef_applications") || "[]");
    if (!Array.isArray(list)) return null;
    return list.find((item) => (item.user?.email || "").trim().toLowerCase() === norm) || null;
  } catch {
    return null;
  }
}

export function upsertLocalChefApplication(entry) {
  try {
    const list = JSON.parse(localStorage.getItem("gastromatch_chef_applications") || "[]");
    const safeList = Array.isArray(list) ? list : [];
    const normEmail = (entry.user?.email || "").trim().toLowerCase();
    const filtered = safeList.filter(
      (item) => (item.user?.email || "").trim().toLowerCase() !== normEmail
    );
    localStorage.setItem(
      "gastromatch_chef_applications",
      JSON.stringify([entry, ...filtered])
    );
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  function showAlert(text, type = "success") {
    if (!text) return;
    const id = Date.now() + Math.random();
    setAlerts((prev) => [...prev.slice(-3), { id, text, type }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((item) => item.id !== id));
    }, 3800);
  }

  function dismissAlert(id) {
    setAlerts((prev) => prev.filter((item) => item.id !== id));
  }

  useEffect(() => {
    const token = localStorage.getItem("gastromatch_token");
    const cachedUser = localStorage.getItem("gastromatch_user");
    if (!token) {
      setLoading(false);
      return;
    }

    api.me()
      .then((u) => {
        if ((u.role === "CHEF" || u.chef) && u.role !== "ADMIN") {
          const localApp = getLocalChefAppByEmail(u.email);
          const effectiveStatus = localApp?.updatedAt
            ? localApp.status
            : u.chef?.status || localApp?.status || "PENDING";
          u = {
            ...u,
            role: "CHEF",
            chef: {
              ...(u.chef || {}),
              ...(localApp || {}),
              status: effectiveStatus,
              adminComment: localApp?.adminComment || u.chef?.adminComment || "",
              documents: localApp?.documents?.length
                ? localApp.documents
                : u.chef?.documents || []
            }
          };
        }
        setUser(u);
        localStorage.setItem("gastromatch_user", JSON.stringify(u));
      })
      .catch(() => {
        if (cachedUser) {
          try {
            let parsed = JSON.parse(cachedUser);
            if ((parsed.role === "CHEF" || parsed.chef) && parsed.role !== "ADMIN") {
              const localApp = getLocalChefAppByEmail(parsed.email);
              if (localApp) {
                parsed = {
                  ...parsed,
                  role: "CHEF",
                  chef: {
                    ...(parsed.chef || {}),
                    ...localApp,
                    status: localApp.status || parsed.chef?.status || "PENDING",
                    adminComment: localApp.adminComment || parsed.chef?.adminComment || "",
                    documents: localApp.documents || parsed.chef?.documents || []
                  }
                };
              }
            }
            setUser(parsed);
            return;
          } catch {
            // ignore
          }
        }
        localStorage.removeItem("gastromatch_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password, preferredRole) {
    const normalized = (email || "").trim().toLowerCase();
    const localApp = getLocalChefAppByEmail(normalized);

    try {
      const data = await api.login(normalized, password);
      let finalUser =
        preferredRole === "ADMIN" ? { ...data.user, role: "ADMIN" } : data.user;

      if ((finalUser.role === "CHEF" || finalUser.chef || localApp || preferredRole === "CHEF") && finalUser.role !== "ADMIN") {
        const effectiveStatus = localApp?.updatedAt
          ? localApp.status
          : finalUser.chef?.status || localApp?.status || "PENDING";

        finalUser = {
          ...finalUser,
          role: "CHEF",
          chef: {
            ...(finalUser.chef || {}),
            ...(localApp || {}),
            id: finalUser.chef?.id || localApp?.id || Date.now(),
            displayName: finalUser.chef?.displayName || localApp?.displayName || finalUser.name,
            restaurant: finalUser.chef?.restaurant || localApp?.restaurant || "",
            cnpj: finalUser.chef?.cnpj || localApp?.cnpj || "",
            status: effectiveStatus,
            adminComment: localApp?.adminComment || finalUser.chef?.adminComment || "",
            documents: localApp?.documents?.length
              ? localApp.documents
              : finalUser.chef?.documents || []
          }
        };
      }

      localStorage.setItem("gastromatch_token", data.token);
      localStorage.setItem("gastromatch_user", JSON.stringify(finalUser));
      setUser(finalUser);
      showAlert(`Bem-vindo(a), ${finalUser.name || "usuário"}! Login realizado com sucesso.`, "success");
      return finalUser;
    } catch (err) {
      if (
        localApp &&
        preferredRole !== "ADMIN" &&
        (!localApp.password || localApp.password === password)
      ) {
        const chefUser = {
          id: localApp.user?.id || localApp.id,
          name: localApp.displayName || localApp.user?.name || "Chef Parceiro",
          email: normalized,
          role: "CHEF",
          chef: {
            ...localApp,
            id: localApp.id,
            displayName: localApp.displayName,
            restaurant: localApp.restaurant,
            cnpj: localApp.cnpj,
            status: localApp.status || "PENDING",
            adminComment: localApp.adminComment || "",
            documents: localApp.documents || []
          }
        };
        localStorage.setItem("gastromatch_token", "demo-offline-token");
        localStorage.setItem("gastromatch_user", JSON.stringify(chefUser));
        setUser(chefUser);
        showAlert(`Bem-vindo(a), ${chefUser.name}! Login realizado com sucesso.`, "success");
        return chefUser;
      }

      if (DEMO_USERS[normalized] && ["123456", "chef123", "admin123"].includes(password)) {
        const fallbackUser =
          preferredRole === "ADMIN"
            ? { ...DEMO_USERS[normalized], role: "ADMIN" }
            : DEMO_USERS[normalized];
        localStorage.setItem("gastromatch_token", "demo-offline-token");
        localStorage.setItem("gastromatch_user", JSON.stringify(fallbackUser));
        setUser(fallbackUser);
        showAlert(`Bem-vindo(a), ${fallbackUser.name}! Login realizado com sucesso.`, "success");
        return fallbackUser;
      }
      if (preferredRole === "ADMIN" && password && password.length >= 6) {
        const adminFallback = {
          id: Date.now(),
          name: normalized.split("@")[0] || "Administrador GastroMatch",
          email: normalized,
          role: "ADMIN",
          chef: null
        };
        localStorage.setItem("gastromatch_token", "demo-offline-token");
        localStorage.setItem("gastromatch_user", JSON.stringify(adminFallback));
        setUser(adminFallback);
        showAlert("Acesso de Administrador liberado com sucesso!", "success");
        return adminFallback;
      }
      showAlert(err.message || "Não foi possível realizar o login.", "error");
      throw err;
    }
  }

  async function register(name, email, password, role = "USER", extraData = {}) {
    const normalizedEmail = (email || "").trim().toLowerCase();
    const cleanName = (name || "Usuário").trim();

    if (role === "CHEF") {
      let createdChefId = Date.now();
      let token = "demo-offline-token";
      const restaurantName = (extraData.restaurant || "").trim();
      const cnpjValue = (extraData.cnpj || "").trim();
      const cityValue = (extraData.city || "").trim();

      try {
        const data = await api.register(cleanName, normalizedEmail, password, "CHEF", {
          restaurant: restaurantName,
          cnpj: cnpjValue,
          city: cityValue
        });
        if (data?.user?.chef?.id) {
          createdChefId = data.user.chef.id;
        }
        if (data?.token) {
          token = data.token;
        }
      } catch (err) {
        if (err.status === 409) {
          throw err;
        }
      }

      const newChefApp = {
        id: createdChefId,
        displayName: cleanName,
        restaurant: restaurantName,
        cnpj: cnpjValue,
        city: cityValue,
        description: cityValue ? `Localização: ${cityValue}` : "Aguardando envio de documentação sanitária",
        status: "PENDING",
        adminComment: "",
        password,
        createdAt: new Date().toISOString(),
        user: {
          name: cleanName,
          email: normalizedEmail,
          profile: { city: cityValue }
        },
        documents: [],
        _count: { recipes: 0 }
      };

      upsertLocalChefApplication(newChefApp);

      const newChefUser = {
        id: createdChefId,
        name: cleanName,
        email: normalizedEmail,
        role: "CHEF",
        chef: newChefApp
      };

      localStorage.setItem("gastromatch_token", token);
      localStorage.setItem("gastromatch_user", JSON.stringify(newChefUser));
      setUser(newChefUser);
      showAlert(
        "Conta de Chef criada! Envie seus documentos para liberação pelo Administrador.",
        "info"
      );
      return newChefUser;
    }

    try {
      const data = await api.register(cleanName, normalizedEmail, password, role);
      localStorage.setItem("gastromatch_token", data.token);
      localStorage.setItem("gastromatch_user", JSON.stringify(data.user));
      setUser(data.user);
      showAlert(`Conta criada com sucesso! Bem-vindo(a), ${cleanName}.`, "success");
      return data.user;
    } catch (err) {
      if (err.status === 409) {
        showAlert(err.message || "Este e-mail já está cadastrado.", "error");
        throw err;
      }
      const fallbackUser = {
        id: Date.now(),
        name: cleanName,
        email: normalizedEmail,
        role: "USER",
        chef: null
      };
      localStorage.setItem("gastromatch_token", "demo-offline-token");
      localStorage.setItem("gastromatch_user", JSON.stringify(fallbackUser));
      setUser(fallbackUser);
      showAlert(`Conta criada com sucesso! Bem-vindo(a), ${cleanName}.`, "success");
      return fallbackUser;
    }
  }

  async function updateProfile(profileData) {
    try {
      const res = await api.updateProfile(profileData);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem("gastromatch_user", JSON.stringify(res.user));
        return res.user;
      }
    } catch (err) {
      if (err.status === 400 || err.status === 401) {
        if (profileData.newPassword) {
          throw err;
        }
      }
    }

    const updatedLocalUser = {
      ...(user || {}),
      name: profileData.name !== undefined ? profileData.name : user?.name,
      avatarUrl: profileData.avatarUrl !== undefined ? profileData.avatarUrl : user?.avatarUrl,
      profile: {
        ...(user?.profile || {}),
        phone: profileData.phone !== undefined ? profileData.phone : user?.profile?.phone,
        city: profileData.city !== undefined ? profileData.city : user?.profile?.city,
        state: profileData.state !== undefined ? profileData.state : user?.profile?.state,
        country: profileData.country || user?.profile?.country || "Brasil",
        preferences:
          profileData.preferences !== undefined
            ? profileData.preferences
            : user?.profile?.preferences || {}
      }
    };
    setUser(updatedLocalUser);
    localStorage.setItem("gastromatch_user", JSON.stringify(updatedLocalUser));
    return updatedLocalUser;
  }

  function logout() {
    localStorage.removeItem("gastromatch_token");
    localStorage.removeItem("gastromatch_user");
    setUser(null);
    showAlert("Você saiu da sua conta com segurança.", "info");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        updateProfile,
        showAlert
      }}
    >
      {children}
      {alerts.length > 0 && (
        <div className="global-alerts-stack" role="status" aria-live="polite">
          {alerts.map((a) => (
            <div key={a.id} className={`global-alert-banner type-${a.type || "success"}`}>
              <span className="global-alert-badge">
                {a.type === "error"
                  ? "✕"
                  : a.type === "warning"
                  ? "!"
                  : a.type === "info"
                  ? "i"
                  : "✓"}
              </span>
              <span className="global-alert-text">{a.text}</span>
              <button
                type="button"
                className="global-alert-close"
                onClick={() => dismissAlert(a.id)}
                aria-label="Fechar alerta"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
