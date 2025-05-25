import create from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  hasHydrated: boolean;
  isLogin: boolean;
  authorization: string | null;

  setHasHydrated: () => void;
  setAuthorization: (authorization: string | null) => void;
  setLogin: (isLogin: boolean) => void;

  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      hasHydrated: false,
      isLogin: false,
      authorization: null,

      setHasHydrated: () => set({ hasHydrated: true }),
      setLogin: isLogin => set({ isLogin }),
      setAuthorization: authorization => set({ authorization }),
      logout: () => set({ isLogin: false, authorization: null }),
    }),
    {
      name: "authorization",
      partialize: state => ({ authorization: state.authorization }),
      onRehydrateStorage: () => state => {
        state?.setHasHydrated();
      },
    }
  )
);

export default useAuthStore;
