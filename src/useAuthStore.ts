import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  hasHydrated: boolean;
  isLogin: boolean;
  authType: string | null;
  authorization: string | null;

  setHasHydrated: () => void;
  setAuthorization: (authType: string, authorization: string | null) => void;
  setLogin: (isLogin: boolean) => void;

  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      hasHydrated: false,
      isLogin: false,
      authorization: null,
      authType: null,
      setHasHydrated: () => set({ hasHydrated: true }),
      setLogin: isLogin => set({ isLogin }),
      setAuthorization: (authType, authorization) => set({ authType, authorization }),
      logout: () => set({ isLogin: false, authType: null, authorization: null }),
    }),
    {
      name: "authorization",
      partialize: state => ({ authType: state.authType, authorization: state.authorization }),
      onRehydrateStorage: () => state => {
        state?.setHasHydrated();
      },
    }
  )
);

export default useAuthStore;
