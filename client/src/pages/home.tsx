import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/sections/Hero';
import { Promotions } from '@/components/sections/Promotions';
import { Menu } from '@/components/sections/Menu';
import { Contact } from '@/components/sections/Contact';
import { Checkout } from '@/components/sections/Checkout';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { CartProvider, useCart } from '@/context/CartContext';
import { useState } from 'react';

function HomeContent() {
  const { itemCount, total } = useCart();

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary selection:text-white">
      <Navbar />

      <main>
        <Hero />
        <Promotions />
        <Menu />
        <Checkout />
        <Contact />
      </main>

      <Footer />

      {/* Floating Cart Summary */}
      {itemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-8 md:bottom-8 md:w-auto animate-in slide-in-from-bottom-4 fade-in duration-300">
          <Button
            size="lg"
            className="w-full md:w-auto rounded-full h-16 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] bg-[#0a0a0a] hover:bg-gray-900 text-white flex justify-between items-center px-2 pr-6 border border-white/10"
            onClick={() => document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 rounded-full h-12 w-12 flex items-center justify-center shrink-0 relative">
                <ShoppingBag size={20} className="text-white" />
                <span className="absolute -top-1 -right-1 bg-red-600 border border-[#0a0a0a] text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">{itemCount}</span>
              </div>
              <div className="flex flex-col items-start leading-none gap-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Pedido</span>
                <span className="text-xl font-bold text-white tracking-tight">
                  {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(total)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm font-bold text-orange-400 pl-4 border-l border-white/10 ml-4">
              Ver Carrito
            </div>
          </Button>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <CartProvider>
      <HomeContent />
    </CartProvider>
  );
}
