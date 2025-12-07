import React, { createContext, useContext, useState } from 'react';

export interface PizzaOptions {
  tipoPizza?: 'completa' | 'mitad' | 'mitadCadaPizza';
  mitadPizza1?: { id: number; name: string };
  mitadPizza2?: { id: number; name: string };
  tipoBase?: string;
  tamaño?: 'personal' | 'mediana' | 'grande';
  esPromocion?: boolean;
  porcentajeDescuento?: number;
  adicionales?: { id: string; name: string; price: number }[];
}

export interface PortionOptions {
  cantidad: number;
  esPromocion?: boolean;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  options?: PizzaOptions | PortionOptions;
  type?: 'pizza' | 'porcion' | 'bebida';
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, options?: PizzaOptions) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

import { useConfig } from '@/hooks/useConfig';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { config } = useConfig();

  const addItem = (item: Omit<CartItem, 'quantity'>, options?: PizzaOptions) => {
    // ... existing implementation
    setItems((prevItems) => {
      // Check if item with exact same options exists
      const existingItemIndex = prevItems.findIndex(i =>
        i.id === item.id && JSON.stringify(i.options) === JSON.stringify(options)
      );

      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += 1;
        return newItems;
      }
      return [...prevItems, { ...item, quantity: 1, options }];
    });
  };

  const removeItem = (index: number) => {
    setItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item, i) =>
        i === index ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  // Helpers for Promo Validation
  const isPromoValid = (promo: any) => {
    if (!promo || !promo.active) return false;
    const now = new Date();
    const day = now.getDay();
    // Use local time string for date comparison to avoid UTC issues
    const todayStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD format

    // Time validation helpers
    const currentHours = now.getHours().toString().padStart(2, '0');
    const currentMinutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHours}:${currentMinutes}`; // HH:MM

    if (promo.daysOfWeek && promo.daysOfWeek.length > 0 && !promo.daysOfWeek.includes(day)) return false;
    if (promo.startDate && promo.startDate > todayStr) return false;
    if (promo.endDate && promo.endDate < todayStr) return false;

    // Check Start Time
    if (promo.startHour && currentTime < promo.startHour) return false;
    // Check End Time
    if (promo.endHour && currentTime > promo.endHour) return false;

    return true;
  };

  // Calculate Total with Promotions
  const calculateTotal = () => {
    let currentTotal = 0;
    const personalPizzas: number[] = [];

    const isPromoActive = config?.settings?.promotions?.twoForOne?.active;
    const promoDay = config?.settings?.promotions?.twoForOne?.dayOfWeek;
    const today = new Date().getDay();

    const isPromoDayValid = isPromoActive && (today === promoDay);

    items.forEach(item => {
      // Check if it's a personal pizza eligible for 2x1
      const isPizza = item.options && 'tamaño' in item.options && item.options.tamaño === 'personal';

      if (isPizza && isPromoDayValid) {
        for (let i = 0; i < item.quantity; i++) {
          personalPizzas.push(item.price);
        }
      } else {
        currentTotal += item.price * item.quantity;
      }
    });

    // Apply 2x1 Logic
    if (personalPizzas.length > 0) {
      personalPizzas.sort((a, b) => b - a);
      for (let i = 0; i < personalPizzas.length; i++) {
        // Add every 2nd pizza (buy 1, get 1 free -> pay for 1st, 3rd, 5th...)
        // Actually definition is: Pay for the most expensive. 
        // If I have 2 pizzas: Pay #0. #1 is free.
        // If I have 3 pizzas: Pay #0, Pay #2 (since #1 was free? or pairs?). 
        // 2x1 usually means pairs. 3 pizzas = Pay 2, get 1 free? Or pay 2.
        // Logic: i%2 === 0 means we act on even indices (0, 2, 4). These are the "Buy" ones.
        if (i % 2 === 0) {
          currentTotal += personalPizzas[i];
        }
      }
    }

    // Apply Custom Percentage Discounts
    let maxDiscountPercent = 0;
    if (config?.settings?.promotions?.custom && Array.isArray(config.settings.promotions.custom)) {
      config.settings.promotions.custom.forEach((promo: any) => {
        if (promo.logic === 'discount' && isPromoValid(promo) && promo.discountPercent) {
          if (promo.discountPercent > maxDiscountPercent) maxDiscountPercent = promo.discountPercent;
        }
      });
    }

    if (maxDiscountPercent > 0) {
      currentTotal = currentTotal * (1 - (maxDiscountPercent / 100));
    }

    return Math.round(currentTotal);
  };

  const total = calculateTotal();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
