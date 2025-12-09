import { Pizza } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-16" style={{ backgroundColor: '#1A3A3B' }}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Pizza className="h-8 w-8" style={{ color: '#FF8533' }} />
              <span className="font-display font-bold text-2xl tracking-tighter" style={{ color: '#F5E8D0' }}>AMASARTE</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-xl mb-6" style={{ color: '#F5E8D0' }}>Enlaces Rápidos</h3>
            <ul className="space-y-3">
              <li><a href="#hero" style={{ color: '#F5E8D0' }} className="hover:text-orange-400 transition-colors">Inicio</a></li>
              <li><a href="#menu" style={{ color: '#F5E8D0' }} className="hover:text-orange-400 transition-colors">Ver Menú</a></li>
              <li><a href="#orders" style={{ color: '#F5E8D0' }} className="hover:text-orange-400 transition-colors">Pedidos Online</a></li>
              <li><a href="/rastreo" style={{ color: '#F5E8D0' }} className="hover:text-orange-400 transition-colors">Rastrear Pedido</a></li>
              <li><a href="#contact" style={{ color: '#F5E8D0' }} className="hover:text-orange-400 transition-colors">Contacto y Ubicación</a></li>
              <li><div className="h-4"></div></li>
              <li><a href="/admin" style={{ color: '#F5E8D0', opacity: 0.6 }} className="hover:text-orange-400 transition-colors text-xs flex items-center gap-1">🔐 Acceso Admin</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm" style={{ borderTopColor: '#2A5A5B', borderTopWidth: '1px', color: '#F5E8D0' }}>
          <p>&copy; 2025 AMASARTE. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <span>Aceptamos:</span>
            <div className="flex gap-2">
              <div className="w-8 h-5 rounded" style={{ backgroundColor: '#2A5A5B' }}></div>
              <div className="w-8 h-5 rounded" style={{ backgroundColor: '#2A5A5B' }}></div>
              <div className="w-8 h-5 rounded" style={{ backgroundColor: '#2A5A5B' }}></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
