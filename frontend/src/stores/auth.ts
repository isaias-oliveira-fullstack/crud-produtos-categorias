import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authService } from "../services/authService";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<any>(authService.getCurrentUser());
  const token = ref<string | null>(null);
  const loading = ref(false);

  const isAuthenticated = computed(() => user.value !== null);
  const isAdmin = computed(() => user.value?.role === "ADMIN");
  const usersCount = computed(() => authService.getUsers().length);

  function setUser(u: any | null) {
    user.value = u;
  }

  async function login(email: string, password: string) {
    loading.value = true;
    return new Promise<{ ok: boolean; user?: any; error?: string }>((resolve) => {
      setTimeout(() => {
        try {
          const res = authService.login(email, password);
          if (!res.ok) {
            resolve({ ok: false, error: res.error });
            return;
          }
          user.value = res.user;
          token.value = "fake-token";
          resolve({ ok: true, user: res.user });
        } finally {
          loading.value = false;
        }
      }, 700);
    });
  }

  async function register(payload: { name: string; email: string; password: string; phone?: string; cpf?: string }) {
    loading.value = true;
    return new Promise<{ ok: boolean; user?: any; error?: string }>((resolve) => {
      setTimeout(() => {
        try {
          const res = authService.register(payload);
          if (!res.ok) {
            resolve({ ok: false, error: res.error });
            return;
          }
          // auto login
          authService.login(payload.email, payload.password);
          user.value = res.user;
          token.value = "fake-token";
          resolve({ ok: true, user: res.user });
        } finally {
          loading.value = false;
        }
      }, 800);
    });
  }

  function logout() {
    authService.logout();
    user.value = null;
    token.value = null;
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    usersCount,
    setUser,
    login,
    register,
    logout,
  };
});
