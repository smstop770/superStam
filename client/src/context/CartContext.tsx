import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';
import type { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD'; product: Product; quantity: number; selectedVariants: Record<string, string> }
  | { type: 'REMOVE'; productId: string; variantKey: string }
  | { type: 'UPDATE_QTY'; productId: string; variantKey: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'OPEN' }
  | { type: 'CLOSE' };

function variantKey(variants: Record<string, string>): string {
  return Object.entries(variants).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}:${v}`).join('|');
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const vk = variantKey(action.selectedVariants);
      const existing = state.items.findIndex((i) => i.product.id === action.product.id && variantKey(i.selectedVariants) === vk);
      if (existing >= 0) {
        const items = [...state.items];
        items[existing] = { ...items[existing], quantity: items[existing].quantity + action.quantity };
        return { ...state, items };
      }
      return { ...state, items: [...state.items, { product: action.product, quantity: action.quantity, selectedVariants: action.selectedVariants }] };
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter((i) => !(i.product.id === action.productId && variantKey(i.selectedVariants) === action.variantKey)) };
    case 'UPDATE_QTY': {
      if (action.quantity <= 0) return cartReducer(state, { type: 'REMOVE', productId: action.productId, variantKey: action.variantKey });
      return { ...state, items: state.items.map((i) => i.product.id === action.productId && variantKey(i.selectedVariants) === action.variantKey ? { ...i, quantity: action.quantity } : i) };
    }
    case 'CLEAR': return { ...state, items: [] };
    case 'OPEN': return { ...state, isOpen: true };
    case 'CLOSE': return { ...state, isOpen: false };
    default: return state;
  }
}

const STORAGE_KEY = 'super-stam-cart';

function loadCart(): CartItem[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity: number, variants: Record<string, string>) => void;
  removeItem: (productId: string, variantKey: string) => void;
  updateQty: (productId: string, variantKey: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  subtotal: number;
  itemVariantKey: (variants: Record<string, string>) => string;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: loadCart(), isOpen: false });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = state.items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items: state.items,
      isOpen: state.isOpen,
      addItem: (product, quantity, variants) => dispatch({ type: 'ADD', product, quantity, selectedVariants: variants }),
      removeItem: (productId, vk) => dispatch({ type: 'REMOVE', productId, variantKey: vk }),
      updateQty: (productId, vk, quantity) => dispatch({ type: 'UPDATE_QTY', productId, variantKey: vk, quantity }),
      clearCart: () => dispatch({ type: 'CLEAR' }),
      openCart: () => dispatch({ type: 'OPEN' }),
      closeCart: () => dispatch({ type: 'CLOSE' }),
      totalItems,
      subtotal,
      itemVariantKey: variantKey,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
