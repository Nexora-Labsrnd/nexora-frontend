import { writable, derived } from 'svelte/store';
import { fetchApi, type User, type AuthResponse } from '$lib/api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const TOKEN_KEY = 'nexora_access_token';

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    token: typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,
    isLoading: true,
    error: null,
  });

  return {
    subscribe,
    init: async () => {
      if (typeof window === 'undefined') return;
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        update((s) => ({ ...s, isLoading: false }));
        return;
      }

      try {
        const user = await fetchApi<User>('/api/v1/auth/verify', { method: 'GET' }, storedToken);
        update((s) => ({ ...s, user, token: storedToken, isLoading: false, error: null }));
      } catch (err: any) {
        console.warn('Session restoration failed:', err);
        localStorage.removeItem(TOKEN_KEY);
        update((s) => ({ ...s, user: null, token: null, isLoading: false, error: null }));
      }
    },
    login: async (username: string, password: string): Promise<boolean> => {
      update((s) => ({ ...s, isLoading: true, error: null }));
      try {
        const res = await fetchApi<AuthResponse>('/api/login', {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem(TOKEN_KEY, res.access_token);
          // Tells <WelcomeToast> to flash "Hello Dr. ..." once after sign-in.
          sessionStorage.setItem('nexora_show_welcome', '1');
        }

        update((s) => ({
          ...s,
          token: res.access_token,
          user: res.user,
          isLoading: false,
          error: null,
        }));
        return true;
      } catch (err: any) {
        update((s) => ({
          ...s,
          isLoading: false,
          error: err.message || 'Failed to authenticate',
        }));
        return false;
      }
    },
    register: async (data: {
      full_name: string;
      username: string;
      email: string;
      password: string;
      role: string;
    }): Promise<boolean> => {
      update((s) => ({ ...s, isLoading: true, error: null }));
      try {
        const res = await fetchApi<AuthResponse>('/api/v1/auth/register', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem(TOKEN_KEY, res.access_token);
          sessionStorage.setItem('nexora_show_welcome', '1');
        }
        update((s) => ({ ...s, token: res.access_token, user: res.user, isLoading: false, error: null }));
        return true;
      } catch (err: any) {
        update((s) => ({ ...s, isLoading: false, error: err.message || 'Could not create your account' }));
        return false;
      }
    },
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
      }
      set({
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });
    },
    clearError: () => {
      update((s) => ({ ...s, error: null }));
    },
  };
}

export const authStore = createAuthStore();

export const isAuthenticated = derived(authStore, ($auth) => !!$auth.token && !!$auth.user);
export const currentUser = derived(authStore, ($auth) => $auth.user);
export const userRole = derived(authStore, ($auth) => $auth.user?.role || 'guest');
