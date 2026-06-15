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
  variant?: string; // selected variant label, if any
}

// A cart line is uniquely identified by product + chosen variant, so the same
// product in two variants (e.g. Black / White) are separate lines.
const sameLine = (a: { kind: string; id: string; variant?: string }, kind: string, id: string, variant?: string) =>
  a.kind === kind && a.id === id && (a.variant || '') === (variant || '');

interface CartState {
  lines: CartLine[];
  add: (line: Omit<CartLine, 'quantity'>, qty?: number) => void;
  remove: (kind: string, id: string, variant?: string) => void;
  setQty: (kind: string, id: string, qty: number, variant?: string) => void;
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
          const existing = state.lines.find((l) =>
            sameLine(l, line.kind, line.id, line.variant),
          );
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                sameLine(l, line.kind, line.id, line.variant)
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
      remove: (kind, id, variant) =>
        set((state) => ({
          lines: state.lines.filter((l) => !sameLine(l, kind, id, variant)),
        })),
      setQty: (kind, id, qty, variant) =>
        set((state) => ({
          lines: state.lines
            .map((l) =>
              sameLine(l, kind, id, variant)
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
