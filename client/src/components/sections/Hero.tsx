import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown } from 'lucide-react';
import heroImage from '@assets/generated_images/artisanal_pizza_hero_image.png';

export function Hero() {
  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Artisanal Pizza"
          className="w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display font-extrabold text-5xl md:text-7xl lg:text-8xl mb-6 tracking-tight leading-tight"
        >
          Pizzas que <br className="md:hidden" />
          <span className="text-primary">Enamoran</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-sans text-lg md:text-2xl font-light text-gray-200 mb-10 max-w-2xl mx-auto"
        >
          La mejor pizza artesanal de Cartagena. Hecha con amor, masticada con placer.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button 
            size="lg" 
            className="rounded-full text-lg px-8 py-6 h-auto w-full sm:w-auto shadow-[0_0_20px_rgba(46,204,113,0.4)]"
            onClick={() => document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth' })}
            data-testid="button-order-hero"
          >
            Hacer Pedido Online
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full text-lg px-8 py-6 h-auto w-full sm:w-auto border-white text-white hover:bg-white/10 hover:text-white bg-transparent backdrop-blur-sm"
            onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
            data-testid="button-menu-hero"
          >
            Ver Menú
          </Button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white flex flex-col items-center gap-2"
      >
        <span className="text-xs font-medium tracking-widest uppercase opacity-70">Descubre más</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.div>
    </section>
  );
}
