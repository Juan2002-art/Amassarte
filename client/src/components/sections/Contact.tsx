import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Contact() {

  return (
    <section id="contact" className="py-24" style={{ backgroundColor: '#1A3A3B' }}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 overflow-hidden rounded-3xl shadow-2xl">
          
          {/* Contact Info */}
          <div className="p-12 flex flex-col justify-center" style={{ backgroundColor: '#1A3A3B' }}>
            <h2 className="text-4xl font-bold mb-8" style={{ color: '#F5E8D0' }}>Visítanos</h2>
            
            <div className="space-y-8">
              <motion.div 
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="p-3 rounded-full" style={{ backgroundColor: '#2A5A5B' }}>
                  <MapPin className="w-6 h-6" style={{ color: '#FF8533' }} />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1" style={{ color: '#F5E8D0' }}>Dirección</h3>
                  <p style={{ color: '#F5E8D0' }}>Urb Emmanuel, Manzana H, Lote 6<br/>Cartagena, Bolívar, Colombia</p>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="p-3 rounded-full" style={{ backgroundColor: '#2A5A5B' }}>
                  <Phone className="w-6 h-6" style={{ color: '#FF8533' }} />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1" style={{ color: '#F5E8D0' }}>Llámanos</h3>
                  <a href="tel:+573006520811" style={{ color: '#F5E8D0' }} className="hover:text-orange-400 cursor-pointer transition-colors block">+57 300 6520811</a>
                  <a href="https://wa.me/573006520811?text=Hola%20amaSSarte%2C%20me%20gustaría%20hacer%20un%20pedido" target="_blank" rel="noopener noreferrer" style={{ color: '#F5E8D0' }} className="hover:text-orange-400 cursor-pointer transition-colors block">WhatsApp: +57 300 6520811</a>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="p-3 rounded-full" style={{ backgroundColor: '#2A5A5B' }}>
                  <Mail className="w-6 h-6" style={{ color: '#FF8533' }} />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1" style={{ color: '#F5E8D0' }}>Correo</h3>
                  <a href="mailto:amasartepizza@gmail.com" style={{ color: '#F5E8D0' }} className="hover:text-orange-400 cursor-pointer transition-colors">amasartepizza@gmail.com</a>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="p-3 rounded-full" style={{ backgroundColor: '#2A5A5B' }}>
                  <Clock className="w-6 h-6" style={{ color: '#FF8533' }} />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1" style={{ color: '#F5E8D0' }}>Horarios</h3>
                  <p style={{ color: '#F5E8D0' }}>Jueves a Domingo</p>
                  <p style={{ color: '#F5E8D0' }}>5:00 PM - 11:00 PM</p>
                </div>
              </motion.div>
            </div>

            <div className="mt-12 pt-8" style={{ borderTopColor: '#2A5A5B', borderTopWidth: '1px' }}>
              <h3 className="font-bold mb-4" style={{ color: '#F5E8D0' }}>Síguenos</h3>
              <div className="flex gap-4">
                <Button size="icon" variant="ghost" className="rounded-full transition-colors" style={{ color: '#F5E8D0' }}>
                  <Instagram size={24} />
                </Button>
                <Button size="icon" variant="ghost" className="rounded-full transition-colors" style={{ color: '#F5E8D0' }}>
                  <Facebook size={24} />
                </Button>
                <Button size="icon" variant="ghost" className="rounded-full transition-colors" style={{ color: '#F5E8D0' }}>
                  <Twitter size={24} />
                </Button>
              </div>
            </div>
          </div>

          {/* Map */}
          <motion.div 
            className="overflow-hidden rounded-lg"
            style={{ backgroundColor: '#2A5A5B' }}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.5684047644476!2d-75.50894632346949!3d10.39728989240885!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e9b8c2a2a2a2a2b%3A0x2a2a2a2a2a2a2a2a!2sUrbanizaci%C3%B3n%20Emmanuel%2C%20Cartagena!5e0!3m2!1ses!2sco!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '400px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación amaSSarte"
            ></iframe>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
