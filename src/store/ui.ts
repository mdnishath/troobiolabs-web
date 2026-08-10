import { create } from "zustand";

interface UiState {
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toast: string | null;
  showToast: (msg: string) => void;
  hideToast: () => void;
}

export const useUi = create<UiState>((set) => ({
  cartOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  toast: null,
  showToast: (msg) => set({ toast: msg }),
  hideToast: () => set({ toast: null }),
}));
