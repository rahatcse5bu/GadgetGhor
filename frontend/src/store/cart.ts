'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartLine {
  kind: 'product' | 'bundle';
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  maxStock?: number;
}

interface CartState {
  lines: CartLine[];
  add: (line: Omit<CartLine, 'quantity'>, qty?: number) => void;
  remove: (kind: string, id: string) => void;
  setQty: (kind: string, id: string, qty: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (line, qty = 1) =>
        set((state) => {
          const existing = state.lines.find(
            (l) => l.kind === line.kind && l.id === line.id,
          );
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.kind === line.kind && l.id === line.id
                  ? {
                      ...l,
                      quantity: Math.min(
                        l.quantity + qty,
                        l.maxStock ?? 99,
                      ),
                    }
                  : l,
              ),
            };
          }
          return {
            lines: [
              ...state.lines,
              { ...line, quantity: Math.min(qty, line.maxStock ?? 99) },
            ],
          };
        }),
      remove: (kind, id) =>
        set((state) => ({
          lines: state.lines.filter((l) => !(l.kind === kind && l.id === id)),
        })),
      setQty: (kind, id, qty) =>
        set((state) => ({
          lines: state.lines
            .map((l) =>
              l.kind === kind && l.id === id
                ? { ...l, quantity: Math.max(1, Math.min(qty, l.maxStock ?? 99)) }
                : l,
            )
            .filter((l) => l.quantity > 0),
        })),
      clear: () => set({ lines: [] }),
      count: () => get().lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: () =>
        get().lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    }),
    { name: 'gg_cart' },
  ),
);
