import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Menu, X, ShoppingBag, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: 'Inicio', href: '#hero' },
    { name: 'Rastrear Pedido', href: '/rastreo' },
    { name: 'Contacto', href: '#contact' },
  ];

  const handleNavClick = (href: string) => {
    if (href.startsWith('/')) {
      window.location.href = href;
      return;
    }

    // Smooth scroll for anchors
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-6'
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="font-display font-bold text-2xl md:text-3xl tracking-tighter text-primary cursor-pointer flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          ama<span style={{ fontWeight: 'bold', fontSize: '0.9em', color: isScrolled ? '#1A3A3B' : '#F5E8D0' }}>SS</span>arte
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link.href)}
              className="text-sm font-medium transition-colors"
              style={{
                color: isScrolled ? '#FF8533' : '#FFFFFF',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = isScrolled ? '#FFB366' : '#00FF00';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = isScrolled ? '#FF8533' : '#FFFFFF';
              }}
            >
              {link.name}
            </button>
          ))}
          <Button
            variant={isScrolled ? "default" : "secondary"}
            className="rounded-full font-semibold"
            onClick={() => handleNavClick('#checkout')}
            data-testid="button-order-navbar-desktop"
          >
            Hacer Pedido
          </Button>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} style={{ color: '#FF8533' }} /> : <Menu size={28} color={isScrolled ? '#FF8533' : '#FFFFFF'} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white shadow-lg p-6 md:hidden flex flex-col gap-4 border-t"
          >
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className="text-left text-lg font-semibold py-2 border-b border-gray-100"
                style={{ color: '#FF8533' }}
              >
                {link.name}
              </button>
            ))}
            <Button
              className="w-full rounded-full mt-2"
              size="lg"
              onClick={() => handleNavClick('#checkout')}
              data-testid="button-order-navbar-mobile"
            >
              Hacer Pedido Online
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
