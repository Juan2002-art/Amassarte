import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Leaf, Flame, Star, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCart, PizzaOptions } from '@/context/CartContext';
import { toast } from 'sonner';
import { useConfig } from '@/hooks/useConfig';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import margheritaImage from '@assets/generated_images/fresh_margherita_pizza_with_basil.png';
import pepperoniImage from '@assets/generated_images/crispy_pepperoni_pizza_with_cheese.png';
import quatroQuesosImage from '@assets/generated_images/gourmet_four_cheese_pizza.png';
import hawaianaImage from '@assets/generated_images/hawaiian_pizza_with_pineapple_ham.png';
import trufaImage from '@assets/generated_images/truffle_mushroom_gourmet_pizza.png';
import burratImage from '@assets/generated_images/burrata_prosciutto_artisanal_pizza.png';
import diabolaImage from '@assets/generated_images/spicy_diavola_hot_pizza.png';
import carboneraImage from '@assets/generated_images/carbonara_pizza_with_pancetta.png';
import capreseImage from '@assets/generated_images/caprese_pizza_with_fresh_ingredients.png';
import ruguelaImage from '@assets/generated_images/arugula_and_parmesan_pizza.png';
import bbqImage from '@assets/generated_images/bbq_smoked_meat_pizza.png';
import camaronesImage from '@assets/generated_images/garlic_shrimp_pizza.png';
import limonadaImage from '@assets/generated_images/fresh_homemade_lemonade.png';
import cervezaIPAImage from '@assets/generated_images/craft_ipa_beer_glass.png';
import vinoTintoImage from '@assets/generated_images/red_malbec_wine_glass.png';
import aguaImage from '@assets/generated_images/sparkling_mineral_water.png';
import refrescoImage from '@assets/generated_images/fresh_tropical_fruit_juice.png';
import vino_blancoImage from '@assets/generated_images/white_sauvignon_blanc_wine.png';
import cervezaImage from '@assets/generated_images/premium_lager_beer_glass.png';
import gasosaImage from '@assets/generated_images/premium_gourmet_soda.png';

// Format price in Colombian pesos
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const sizeLabels = {
  personal: 'Personal 30cm',
  grande: 'Grande 40cm',
};

// Image Map for when config has null images
const imageMap: Record<number, string> = {
  2: hawaianaImage,
  4: pepperoniImage,
  5: diabolaImage, // Salami using diavola
  7: capreseImage,
  13: limonadaImage,
  14: cervezaIPAImage,
  15: vinoTintoImage,
  16: aguaImage,
  17: refrescoImage,
  18: vino_blancoImage,
  20: gasosaImage
};

export function Menu() {
  const { config, isLoading } = useConfig();
  const [activeTab, setActiveTab] = useState('clasicas');
  const { addItem } = useCart();
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [mitadCadaPizza1, setMitadCadaPizza1] = useState<any>(null);
  const [mitadCadaPizza2, setMitadCadaPizza2] = useState<any>(null);
  const [baseType, setBaseType] = useState('tomate');
  const [selectedSize, setSelectedSize] = useState<'personal' | 'grande'>('personal');

  // Addons State
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
  const [addonsOpen, setAddonsOpen] = useState(false);

  // Get base options from config or use defaults
  const baseOptions = config?.baseTypes || [
    { value: 'tomate', label: 'Salsa de Tomate' },
    { value: 'blanca', label: 'Base Blanca (Crema)' },
    { value: 'barbeque', label: 'Base BBQ' },
  ];

  if (isLoading) {
    return <div className="py-24 text-center text-white">Cargando menú...</div>;
  }

  if (!config || !config.menu) {
    return <div className="py-24 text-center text-white">Error: No se pudo cargar la configuración del menú.</div>;
  }

  const menuItems = config.menu;
  // Combine keys that exist in menuItems
  const allPizzas = [
    ...(menuItems.clasicas || []),
    ...(menuItems.especiales || [])
  ];

  const categories = [
    { id: 'clasicas', label: 'Clásicas' },
    { id: 'especiales', label: 'Especiales' },
    ...(config.settings?.showDrinks ? [{ id: 'bebidas', label: 'Bebidas' }] : []),
    ...(config.settings?.showBakery ? [{ id: 'panaderia', label: 'Panadería' }] : [])
  ];

  const isMitadDeCadaPizza = selectedItem?.id === 50;

  const isPizza = (item: any) => {
    // Logic: if it has prices.personal and is in pizza categories
    return activeTab !== 'bebidas' && activeTab !== 'panaderia';
  };

  const isBeverage = (item: any) => activeTab === 'bebidas';
  const isBakeryItem = (item: any) => activeTab === 'panaderia';

  const handleItemClick = (item: any) => {
    if (isBeverage(item) || isBakeryItem(item)) {
      handleAddToCart({ ...item, price: item.prices.personal });
    } else if (isPizza(item)) {
      if (!item.available) return;
      setSelectedItem(item);
      setMitadCadaPizza1(null);
      setMitadCadaPizza2(null);

      // Inicializar con la primera base permitida para esta pizza
      const allowedBases = item.allowedBases && item.allowedBases.length > 0
        ? item.allowedBases
        : baseOptions.map(b => b.value);
      const firstAllowedBase = baseOptions.find(b => allowedBases.includes(b.value));
      setBaseType(firstAllowedBase?.value || baseOptions[0]?.value || 'tomate');

      // Si es "Mitad de cada una" (id 50), forzar tamaño grande
      setSelectedSize(item.id === 50 ? 'grande' : 'grande');
      setSelectedAddons([]); // Reset addons
      setAddonsOpen(false);
      setDialogOpen(true);
    }
  };

  const handleAddToCart = (item: any, options?: PizzaOptions) => {
    addItem({ id: item.id, name: item.name, price: item.price }, options);
    setAddedItems(new Set([...addedItems, item.id]));
    toast.success(`${item.name} agregada al pedido`);
    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }, 2000);
  };

  const handleConfirmPizza = () => {
    if (isMitadDeCadaPizza && (!mitadCadaPizza1 || !mitadCadaPizza2)) {
      toast.error('Por favor selecciona 2 pizzas para la mitad de cada una');
      return;
    }

    let priceWithSize = 0;
    let displayName = selectedItem.name;

    if (isMitadDeCadaPizza && mitadCadaPizza1 && mitadCadaPizza2) {
      const price1 = mitadCadaPizza1.prices[selectedSize];
      const price2 = mitadCadaPizza2.prices[selectedSize];
      priceWithSize = Math.round(price1 / 2 + price2 / 2);
      displayName = `Mitad ${mitadCadaPizza1.name} + Mitad ${mitadCadaPizza2.name}`;
    } else {
      priceWithSize = selectedItem.prices[selectedSize];
    }

    // Add Addons Price
    const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
    priceWithSize += addonsTotal;

    const itemWithPrice = { ...selectedItem, name: displayName, price: priceWithSize };

    const options: PizzaOptions = {
      tipoBase: baseType,
      tamaño: selectedSize,
      ...(isMitadDeCadaPizza && {
        tipoPizza: 'mitadCadaPizza',
        mitadPizza1: mitadCadaPizza1 ? { id: mitadCadaPizza1.id, name: mitadCadaPizza1.name } : undefined,
        mitadPizza2: mitadCadaPizza2 ? { id: mitadCadaPizza2.id, name: mitadCadaPizza2.name } : undefined,
      }),
      adicionales: selectedAddons
    };

    handleAddToCart(itemWithPrice, options);
    setDialogOpen(false);
    setSelectedItem(null);
  };

  const handleAddonToggle = (addon: any, checked: boolean) => {
    if (checked) {
      setSelectedAddons([...selectedAddons, addon]);
    } else {
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    }
  };

  return (
    <section id="menu" className="py-24" style={{ backgroundColor: '#1A3A3B' }}>
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#F5E8D0' }}>Nuestro Menú</h2>
          <p className="text-lg" style={{ color: '#F5E8D0' }}>
            Sabores auténticos creados con ingredientes frescos y mucho amor.
          </p>
        </div>

        <Tabs defaultValue="clasicas" className="w-full" onValueChange={setActiveTab}>
          <div className="flex justify-center mb-12 overflow-x-auto pb-2">
            <TabsList className="p-1 h-auto rounded-full" style={{ backgroundColor: '#2A5A5B' }}>
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="rounded-full px-8 py-3 text-base transition-all duration-300 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                  style={{ color: '#F5E8D0' }}
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {categories.map((cat) => (
            <TabsContent key={cat.id} value={cat.id} className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {menuItems[cat.id as keyof typeof menuItems]?.map((item: any) => (
                  <Card key={item.id} className={`group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col ${!item.available ? 'opacity-75 grayscale' : ''}`} style={{ backgroundColor: '#1A3A3B' }}>

                    {config.settings?.showImages !== false && (
                      <div className="relative h-56 overflow-hidden bg-gray-800">
                        <img
                          src={item.image || imageMap[item.id] || "https://placehold.co/600x400?text=Amasarte"}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          {item.tags?.includes('veg') && (
                            <Badge className="bg-green-500 hover:bg-green-600"><Leaf size={12} className="mr-1" /> Veg</Badge>
                          )}
                          {item.tags?.includes('spicy') && (
                            <Badge className="bg-red-500 hover:bg-red-600"><Flame size={12} className="mr-1" /> Hot</Badge>
                          )}
                          {item.tags?.includes('popular') && (
                            <Badge className="bg-amber-500 hover:bg-amber-600"><Star size={12} className="mr-1" /> Top</Badge>
                          )}
                        </div>
                        {!item.available && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <span className="text-white font-bold text-xl border-2 border-white px-4 py-2 transform -rotate-12">AGOTADO</span>
                          </div>
                        )}
                      </div>
                    )}

                    <CardHeader className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-xl font-bold" style={{ color: '#F5E8D0' }}>{item.name}</CardTitle>
                        <div className="flex flex-col items-end">
                          <span className="text-lg font-bold text-orange-400">
                            {item.prices.personal === 0 ? "Preguntar" : formatPrice(item.prices.personal)}
                          </span>
                          {item.prices.grande > 0 && item.prices.personal !== item.prices.grande && (
                            <span className="text-xs text-orange-300">
                              Grande: {formatPrice(item.prices.grande)}
                            </span>
                          )}
                        </div>
                      </div>
                      <CardDescription className="text-base line-clamp-2" style={{ color: '#F5E8D0' }}>{item.desc}</CardDescription>
                    </CardHeader>
                    <CardFooter className="mt-auto pt-4">
                      <Button
                        onClick={() => handleItemClick(item)}
                        disabled={!item.available}
                        className={`w-full rounded-full transition-colors ${addedItems.has(item.id) ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'} text-white`}
                      >
                        {addedItems.has(item.id) ? <Check size={18} className="mr-2" /> : <Plus size={18} className="mr-2" />}
                        {addedItems.has(item.id) ? 'Agregada' : (item.available ? 'Agregar al Pedido' : 'No Disponible')}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Pizza Customization Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between sticky top-0 bg-white md:bg-transparent md:sticky md:top-auto z-10">
            <DialogTitle>Personalizar {selectedItem?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Mitad de Cada Pizza Selection */}
            {isMitadDeCadaPizza && (
              <div className="p-4 rounded-lg space-y-4" style={{ backgroundColor: '#2A5A5B' }}>
                <p className="text-sm font-medium" style={{ color: '#FFFFFF' }}>🔴 SELECCIONA 2 PIZZAS DIFERENTES:</p>
                <div>
                  <Label className="text-base font-semibold mb-2 block" style={{ color: '#FFFF00' }}>Primera Pizza (Mitad)</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                    value={mitadCadaPizza1?.id || ''}
                    onChange={(e) => setMitadCadaPizza1(allPizzas.find(p => p.id === parseInt(e.target.value)))}
                  >
                    <option value="">Selecciona una pizza...</option>
                    {allPizzas.filter(p => p.id !== 50 && p.available).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-base font-semibold mb-2 block" style={{ color: '#FFFF00' }}>Segunda Pizza (Mitad)</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                    value={mitadCadaPizza2?.id || ''}
                    onChange={(e) => setMitadCadaPizza2(allPizzas.find(p => p.id === parseInt(e.target.value)))}
                  >
                    <option value="">Selecciona una pizza...</option>
                    {allPizzas.filter(p => p.id !== 50 && p.available).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div>
              <Label className="text-base font-semibold mb-3 block" style={{ color: '#F5E8D0' }}>Tamaño de Pizza</Label>
              {isMitadDeCadaPizza && (
                <p className="text-sm text-orange-300 mb-2">⚠️ Esta opción solo está disponible en tamaño grande</p>
              )}
              <RadioGroup value={selectedSize} onValueChange={(v: any) => setSelectedSize(v)}>
                <div className="space-y-3">
                  {(Object.entries(sizeLabels) as [keyof typeof sizeLabels, string][])
                    .filter(([size]) => !isMitadDeCadaPizza || size === 'grande') // Solo grande para mitad
                    .map(([size, label]) => {
                      // Price logic similar to before
                      let displayPrice = 0;
                      if (isMitadDeCadaPizza && mitadCadaPizza1 && mitadCadaPizza2) {
                        displayPrice = Math.round(mitadCadaPizza1.prices[size] / 2 + mitadCadaPizza2.prices[size] / 2);
                      } else {
                        displayPrice = selectedItem?.prices[size] || 0;
                      }
                      return (
                        <div key={size} className="flex items-center space-x-2 p-3 border rounded-lg transition-colors cursor-pointer" style={{ backgroundColor: '#2A5A5B', borderColor: '#FF8533', color: '#F5E8D0' }}
                          onClick={() => setSelectedSize(size)}
                        >
                          <RadioGroupItem value={size} id={size} />
                          <Label htmlFor={size} className="flex-1 cursor-pointer font-semibold">{label}</Label>
                          <span className="font-bold" style={{ color: '#FF8533' }}>{formatPrice(displayPrice)}</span>
                        </div>
                      );
                    })}
                </div>
              </RadioGroup>
            </div>

            {/* Base Selection */}
            <div>
              <Label className="text-base font-semibold mb-3 block" style={{ color: '#F5E8D0' }}>Tipo de Base</Label>
              <RadioGroup value={baseType} onValueChange={setBaseType}>
                {baseOptions
                  .filter(option => {
                    // Si la pizza tiene allowedBases definido, filtrar por eso
                    // Si no, mostrar todas las bases
                    if (selectedItem?.allowedBases && selectedItem.allowedBases.length > 0) {
                      return selectedItem.allowedBases.includes(option.value);
                    }
                    return true; // Por defecto mostrar todas
                  })
                  .map(option => (
                    <div key={option.value} className="flex items-center space-x-2 mb-3 px-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="text-base cursor-pointer hover:text-orange-300" style={{ color: '#F5E8D0' }}>{option.label}</Label>
                    </div>
                  ))}
              </RadioGroup>
            </div>

            {/* ADDITIONAL INGREDIENTS */}
            <div className="mt-6">
              <Collapsible open={addonsOpen} onOpenChange={setAddonsOpen} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full flex justify-between p-4 hover:bg-gray-50 h-auto">
                    <div className="flex flex-col items-start text-left">
                      <span className="font-bold text-lg text-gray-900">Adicionales</span>
                      <span className="text-sm text-gray-500">Agrega extra sabor a tu pizza (+$5.000 c/u)</span>
                    </div>
                    {addonsOpen ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 bg-white space-y-6 animate-in slide-in-from-top-2">
                  {config.addons && Object.keys(config.addons).map((categoryName) => (
                    <div key={categoryName}>
                      <h4 className="font-bold capitalize text-primary mb-3 border-b border-gray-100 pb-1 text-sm">{categoryName}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {config.addons[categoryName]
                          .filter((addon: any) => addon.available !== false)
                          .map((addon: any) => (
                            <div key={addon.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 transition-colors">
                              <Checkbox
                                id={`addon-${addon.id}`}
                                checked={selectedAddons.some(a => a.id === addon.id)}
                                onCheckedChange={(checked) => handleAddonToggle(addon, checked as boolean)}
                                className="border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <Label htmlFor={`addon-${addon.id}`} className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                                {addon.name}
                              </Label>
                              <span className="text-xs text-gray-400 font-mono tracking-tighter">
                                {formatPrice(addon.price)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
              {selectedAddons.length > 0 && (
                <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-100 flex justify-between items-center">
                  <span className="text-sm text-orange-800 font-medium">Extras seleccionados: ({selectedAddons.length})</span>
                  <span className="font-bold text-orange-600">
                    + {formatPrice(selectedAddons.reduce((sum, a) => sum + a.price, 0))}
                  </span>
                </div>
              )}
            </div>

            {/* Live Summary */}
            <div className="mt-8 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Pizza {sizeLabels[selectedSize]} {isMitadDeCadaPizza ? '(Mitad y Mitad)' : ''}</span>
                <span className="font-semibold">{formatPrice(isMitadDeCadaPizza && mitadCadaPizza1 && mitadCadaPizza2 ? Math.round(mitadCadaPizza1.prices[selectedSize] / 2 + mitadCadaPizza2.prices[selectedSize] / 2) : (selectedItem?.prices[selectedSize] || 0))}</span>
              </div>
              {selectedAddons.length > 0 && (
                <div className="flex justify-between items-center mb-2 text-sm text-green-600">
                  <span>+ {selectedAddons.length} Adicionales</span>
                  <span className="font-semibold">{formatPrice(selectedAddons.reduce((sum, a) => sum + a.price, 0))}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xl font-bold mt-4 text-black">
                <span>Total a Pagar</span>
                <span>
                  {(() => {
                    let base = 0;
                    if (isMitadDeCadaPizza && mitadCadaPizza1 && mitadCadaPizza2) {
                      base = Math.round(mitadCadaPizza1.prices[selectedSize] / 2 + mitadCadaPizza2.prices[selectedSize] / 2);
                    } else {
                      base = selectedItem?.prices[selectedSize] || 0;
                    }
                    const adds = selectedAddons.reduce((sum, a) => sum + a.price, 0);
                    return formatPrice(base + adds);
                  })()}
                </span>
              </div>
            </div>

          </div>

          <DialogFooter className="mt-6 flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto rounded-full h-12">Cancelar</Button>
            <Button onClick={handleConfirmPizza} className="bg-black text-white w-full sm:w-auto rounded-full h-12 font-bold text-lg hover:bg-gray-900">
              Agregar - {(() => {
                let base = 0;
                if (isMitadDeCadaPizza && mitadCadaPizza1 && mitadCadaPizza2) {
                  base = Math.round(mitadCadaPizza1.prices[selectedSize] / 2 + mitadCadaPizza2.prices[selectedSize] / 2);
                } else {
                  base = selectedItem?.prices[selectedSize] || 0;
                }
                const adds = selectedAddons.reduce((sum, a) => sum + a.price, 0);
                return formatPrice(base + adds);
              })()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
