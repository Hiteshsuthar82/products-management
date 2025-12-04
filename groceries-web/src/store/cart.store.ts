import { create } from 'zustand';
import { Cart, CartItem } from '@/types';

interface CartState {
  cart: Cart | null;
  cartCount: number;
  setCart: (cart: Cart) => void;
  updateCartCount: (count: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  cartCount: 0,
  setCart: (cart) => set({ cart, cartCount: cart.totalItems }),
  updateCartCount: (count) => set({ cartCount: count }),
  clearCart: () => set({ cart: null, cartCount: 0 }),
}));

