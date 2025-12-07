import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import ovenImage from '@assets/generated_images/wood_fired_oven.png';
import ingredientsImage from '@assets/generated_images/pizza_ingredients.png';
import pizzaHero from '@assets/generated_images/artisanal_pizza_hero_image.png';

const images = [
  { id: 1, src: ovenImage, alt: 'Horno de Leña', span: 'md:col-span-2 md:row-span-2' },
  { id: 2, src: ingredientsImage, alt: 'Ingredientes Frescos', span: 'md:col-span-1 md:row-span-1' },
  { id: 3, src: pizzaHero, alt: 'Pizza Artesanal', span: 'md:col-span-1 md:row-span-1' },
  { id: 4, src: ingredientsImage, alt: 'Preparación', span: 'md:col-span-1 md:row-span-1' },
  { id: 5, src: pizzaHero, alt: 'Detalle', span: 'md:col-span-1 md:row-span-1' },
];

export function Gallery() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <section id="gallery" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Galería</h2>
          <p className="text-muted-foreground">Un vistazo a nuestra cocina y pasión.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[250px]">
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              className={`relative rounded-2xl overflow-hidden cursor-pointer group ${image.span}`}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelectedId(image.id)}
              layoutId={`image-${image.id}`}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <p className="text-white font-bold text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  {image.alt}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <Dialog open={selectedId !== null} onOpenChange={() => setSelectedId(null)}>
          <DialogContent className="max-w-5xl p-0 bg-transparent border-none shadow-none overflow-hidden">
            {selectedId && (
              <div className="relative">
                <img
                  src={images.find(i => i.id === selectedId)?.src}
                  alt="Selected"
                  className="w-full h-auto rounded-lg max-h-[85vh] object-contain"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
