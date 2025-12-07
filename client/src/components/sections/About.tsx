import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import chefImage from '@assets/generated_images/pizza_chef_portrait.png';

export function About() {
  return (
    <section id="about" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="h-px w-12 bg-primary"></span>
              <span className="text-primary font-bold uppercase tracking-widest text-sm">Nuestra Historia</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Más que una pizzería, <br />
              <span className="text-secondary">una tradición familiar</span>
            </h2>
            <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
              <p>
                En AMASARTE, creemos que la pizza es un lienzo en blanco donde el arte y el sabor se encuentran. Fundada en 2015, nuestra pizzería nació del sueño de traer el auténtico sabor napolitano a tu mesa, fusionándolo con ingredientes locales de la más alta calidad.
              </p>
              <p>
                Nuestra filosofía es simple: <strong>Respeto por el proceso.</strong> Cada masa se fermenta durante 48 horas para lograr esa textura ligera y crujiente que nos caracteriza. No usamos atajos, solo pasión y harina de primera.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-10 border-t pt-8">
              <div>
                <h3 className="text-3xl font-bold text-primary">10+</h3>
                <p className="text-sm text-muted-foreground font-medium">Años de Experiencia</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-primary">50k+</h3>
                <p className="text-sm text-muted-foreground font-medium">Pizzas Horneadas</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-primary">4.9</h3>
                <p className="text-sm text-muted-foreground font-medium">Calificación Promedio</p>
              </div>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-secondary/10 rounded-3xl transform rotate-3 z-0"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl z-10 aspect-[4/5] lg:aspect-square">
              <img
                src={chefImage}
                alt="Maestro Pizzero Marco"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8 text-white">
                <p className="font-display font-bold text-xl">Marco Rossi</p>
                <p className="text-primary font-medium">Maestro Pizzero</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
