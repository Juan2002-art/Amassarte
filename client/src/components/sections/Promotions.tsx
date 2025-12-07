import { useState } from 'react';
import { motion } from 'framer-motion';
import { useConfig } from '@/hooks/useConfig';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { Gift, Flame, Star, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Helper to format price
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export function Promotions() {
  const { config } = useConfig();
  const { addItem, items } = useCart();
  const [addedPromos, setAddedPromos] = useState<Set<string>>(new Set());

  // Dialog State
  const [selectedPromo, setSelectedPromo] = useState<any>(null);
  const [selections, setSelections] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Check if user already has a promo in cart
  const hasPromoInCart = items.some((item: any) => item.esPromocion);

  const handlePromoClick = (promo: any) => {
    if (hasPromoInCart) {
      toast.error("Solo puedes agregar una promoción por pedido.");
      return;
    }

    if (promo.logic === '2x1' && promo.validItemIds?.length > 0) {
      // Init selections array
      const count = promo.itemsToSelect || 2;
      setSelections(new Array(count).fill(null));
      setSelectedPromo(promo);
      setIsDialogOpen(true);
    } else {
      // Simple add
      addPromoToCart(promo);
    }
  };

  const addPromoToCart = (promo: any, customItemName?: string, customPrice?: number) => {
    addItem({
      id: parseInt(promo.id) || Date.now(),
      name: customItemName || promo.title,
      price: customPrice !== undefined ? customPrice : (promo.price || 0),
    }, {
      esPromocion: true,
    });

    setAddedPromos(new Set([...addedPromos, promo.id]));
    toast.success(`¡${promo.title} agregada!`);
    setIsDialogOpen(false);
    setSelectedPromo(null);
    setSelections([]);

    setTimeout(() => {
      setAddedPromos(prev => {
        const newSet = new Set(prev);
        newSet.delete(promo.id);
        return newSet;
      });
    }, 2000);
  }

  const handleConfirmSelection = () => {
    if (selections.some(s => !s)) {
      toast.error("Debes seleccionar todas las pizzas");
      return;
    }

    // Logic for 2x1: Price is max of selection prices
    // Logic for Combo: Fixed price usually
    let finalPrice = selectedPromo.price;
    let nameDetail = "";

    if (selectedPromo.logic === '2x1') {
      // Calculate max price for 2x1 logic if price is not fixed
      // We assume "2x1" implies paying for the most expensive item, OR if a fixed price is set, use that.

      if (!selectedPromo.price || selectedPromo.price === 0) {
        const maxPrice = Math.max(...selections.map(s => s.prices?.personal || 0));
        finalPrice = maxPrice;
      }

      nameDetail = `(${selections.map(s => s.name).join(" + ")})`;
    }

    addPromoToCart(selectedPromo, `${selectedPromo.title} ${nameDetail}`, finalPrice);
  };

  const availablePizzas = selectedPromo ?
    [...(config?.menu?.clasicas || []), ...(config?.menu?.especiales || [])]
      .filter((p: any) => selectedPromo.validItemIds?.includes(p.id))
    : [];

  return (
    <>
      <section id="promotions" className="py-24" style={{ backgroundColor: '#1A3A3B' }}>
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Gift style={{ color: '#F5E8D0' }} size={32} />
              <h2 className="text-4xl md:text-5xl font-bold" style={{ color: '#F5E8D0' }}>Promociones</h2>
              <Flame style={{ color: '#F5E8D0' }} size={32} />
            </div>
            <p className="text-lg" style={{ color: '#F5E8D0' }}>
              Ofertas exclusivas para ti.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {config?.settings?.promotions?.custom?.filter((p: any) => {
              if (!p.active) return false;

              const today = new Date();
              const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)

              // Day Check
              if (p.daysOfWeek && p.daysOfWeek.length > 0 && !p.daysOfWeek.includes(dayOfWeek)) {
                return false;
              }

              // Date Range Check (Simple string comparison works for YYYY-MM-DD if in UTC, but safer to use Dates)
              // Let's strip time for simple comparison
              const todayStr = today.toISOString().split('T')[0];

              if (p.startDate && p.startDate > todayStr) return false;
              if (p.endDate && p.endDate < todayStr) return false;

              return true;
            })?.map((promo: any, index: number) => {
              const isBuyable = (promo.price && promo.price > 0) || promo.logic === '2x1';

              const cardStyle = promo.imageUrl ? {
                backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url(${promo.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: '#FFFFFF' // Force white text for contrast on images
              } : {
                backgroundColor: '#1A3A3B',
                color: '#F5E8D0'
              };

              return (
                <motion.div
                  key={promo.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="h-full"
                >
                  <Card
                    className="overflow-hidden border-2 border-orange-400 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col relative"
                    style={cardStyle}
                  >
                    {promo.badge && (
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 py-2 px-4">
                        <p className="text-sm font-bold text-center flex items-center justify-center gap-1" style={{ color: '#FFFFFF' }}>
                          <Star size={14} />
                          {promo.badge}
                          <Star size={14} />
                        </p>
                      </div>
                    )}

                    <CardHeader className="pt-4 pb-2">
                      <CardTitle className="text-2xl" style={{ color: promo.imageUrl ? '#FFFFFF' : '#F5E8D0' }}>{promo.title}</CardTitle>
                      <p className="text-sm mt-2" style={{ color: promo.imageUrl ? '#E5E7EB' : '#F5E8D0' }}>{promo.description}</p>
                    </CardHeader>

                    <CardContent className="flex-1">
                      {isBuyable ? (
                        <div className="space-y-2 mb-4">
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-orange-400">
                              {promo.price > 0 ? formatPrice(promo.price) : (promo.logic === '2x1' ? "Precio Variable" : "Gratis")}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 p-3 bg-[#2A5A5B] rounded-lg">
                          <p className="text-sm italic text-gray-200">Pregunta por esta promoción en tienda.</p>
                        </div>
                      )}

                      {promo.terms && (
                        <p className="text-xs p-2 rounded mt-4" style={{ backgroundColor: '#2A5A5B', color: '#F5E8D0' }}>
                          <strong>Condiciones:</strong> {promo.terms}
                        </p>
                      )}
                    </CardContent>

                    <CardFooter>
                      {isBuyable ? (
                        <Button
                          onClick={() => handlePromoClick(promo)}
                          disabled={hasPromoInCart && !addedPromos.has(promo.id)}
                          className={`w-full rounded-full font-semibold py-5 ${addedPromos.has(promo.id)
                            ? 'bg-green-600 hover:bg-green-700'
                            : (hasPromoInCart ? 'bg-gray-500 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600')
                            } text-white`}
                        >
                          {addedPromos.has(promo.id) ? (
                            <>
                              <Check size={18} className="mr-2" />
                              Agregada
                            </>
                          ) : (
                            hasPromoInCart ? 'Solo 1 Promo por Pedido' : 'Ordenar Ahora'
                          )}
                        </Button>
                      ) : (
                        <Button className="w-full rounded-full font-semibold py-5 bg-gray-600 hover:bg-gray-700 cursor-default text-white">
                          Disponible en Tienda
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              )
            })}

            {(!config?.settings?.promotions?.custom || config.settings.promotions.custom.length === 0) && (
              <div className="col-span-3 text-center py-10">
                <p className="text-gray-400 text-lg">Cargando promociones...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white text-gray-900 max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center border-b pb-2 text-gray-900">Selecciona tus Pizzas</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {selections.map((_, idx) => (
              <div key={idx} className="space-y-2">
                <Label className="font-bold text-gray-900">Opción {idx + 1}</Label>
                <Select
                  onValueChange={(val) => {
                    const pizza = availablePizzas.find((p: any) => p.name === val);
                    const newSelections = [...selections];
                    newSelections[idx] = pizza;
                    setSelections(newSelections);
                  }}
                >
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-12">
                    <SelectValue placeholder="Elige una pizza..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white max-h-60">
                    {availablePizzas.map((pizza: any) => (
                      <SelectItem key={pizza.id} value={pizza.name} className="text-gray-900 hover:bg-gray-100 py-3">
                        {pizza.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="text-gray-900 border-gray-300 w-full sm:w-auto">Cancelar</Button>
            <Button onClick={handleConfirmSelection} className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto font-bold"> Confirmar </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
