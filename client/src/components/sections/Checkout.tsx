import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Trash2, Send, CheckCircle2, ShoppingCart } from 'lucide-react';
import { useConfig } from '@/hooks/useConfig';

// Format price in Colombian pesos
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export function Checkout() {
  const { items, total, clearCart, removeItem, updateQuantity } = useCart();
  const { config } = useConfig();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ orderId: string; timestamp: string } | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    zona: '',
    costoDomicilio: 0,
    tipoEntrega: 'domicilio',
    formaPago: 'efectivo',
    detallesAdicionales: '',
  });

  const zones = config?.zones || [];

  // Helper for Promo Validation (Duplicated from Cart to ensure consistency in view)
  const isPromoValid = (promo: any) => {
    if (!promo || !promo.active) return false;
    const now = new Date();
    const day = now.getDay();
    const todayStr = now.toLocaleDateString('en-CA');

    if (promo.daysOfWeek && promo.daysOfWeek.length > 0 && !promo.daysOfWeek.includes(day)) return false;
    if (promo.startDate && promo.startDate > todayStr) return false;
    if (promo.endDate && promo.endDate < todayStr) return false;
    return true;
  };

  // Calculate Delivery Cost and active items
  let finalDeliveryCost = formData.costoDomicilio;
  const freeDeliveryActive = config?.settings?.promotions?.freeDelivery?.active;

  if (freeDeliveryActive) finalDeliveryCost = 0;

  // Check custom delivery rules
  if (config?.settings?.promotions?.custom && Array.isArray(config.settings.promotions.custom)) {
    config.settings.promotions.custom.forEach((p: any) => {
      if (p.logic === 'limit_delivery' && isPromoValid(p)) {
        // Check if zone matches
        if (!p.validZoneIds || p.validZoneIds.length === 0 || (formData.zona && p.validZoneIds.includes(formData.zona))) {
          // Use the lowest price available
          const price = p.deliveryPrice ?? 0;
          if (price < finalDeliveryCost) {
            finalDeliveryCost = price;
          }
        }
      }
    })
  }

  const deliveryCost = formData.tipoEntrega === 'domicilio' ? finalDeliveryCost : 0;
  const isFreeDelivery = formData.tipoEntrega === 'domicilio' && finalDeliveryCost === 0 && formData.costoDomicilio > 0;

  // Active Gifts Logic
  const activeGifts: any[] = [];
  if (config?.settings?.promotions?.custom && Array.isArray(config.settings.promotions.custom)) {
    config.settings.promotions.custom.forEach((p: any) => {
      if (p.logic === 'gift' && isPromoValid(p)) {
        if (total >= (p.minOrderValue || 0)) {
          activeGifts.push(p);
        }
      }
    })
  }

  const rawTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = rawTotal - total;
  const finalTotal = total + deliveryCost;

  const scrollToMenu = () => {
    const menuElement = document.getElementById('menu');
    if (menuElement) {
      menuElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleZoneChange = (value: string) => {
    const selectedZone = zones.find((z: any) => z.name === value);
    setFormData(prev => ({
      ...prev,
      zona: value,
      costoDomicilio: selectedZone ? selectedZone.price : 0
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Por favor agrega items al pedido');
      return;
    }

    if (!formData.nombre || !formData.telefono) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    if (formData.tipoEntrega === 'domicilio') {
      if (!formData.direccion) {
        toast.error('Por favor ingresa tu dirección');
        return;
      }
      if (!formData.zona) {
        toast.error('Por favor selecciona tu zona de entrega');
        return;
      }
    }

    setLoading(true);

    try {
      const telefono = formData.telefono.startsWith('+57') ? formData.telefono : `+57${formData.telefono}`;

      const itemsDetails = items.map((item) => {
        let itemStr = `${item.quantity}x ${item.name}`;
        const opts = item.options as any;

        if (opts?.tipoPizza) {
          if (opts.tipoPizza === 'mitad') {
            itemStr += ` (Mitad: ${opts.mitadPizza1?.name} + ${opts.mitadPizza2?.name})`;
          }
        }

        // Base logic moved outside to ensure it runs for single pizzas too
        if (opts?.tipoBase) {
          const baseName = opts.tipoBase === 'tomate' ? 'Salsa de Tomate' :
            opts.tipoBase === 'blanca' ? 'Base Blanca' :
              opts.tipoBase === 'barbeque' ? 'Base BBQ' : opts.tipoBase;
          itemStr += ` [Base: ${baseName}]`;
        }
        if (opts?.adicionales && opts.adicionales.length > 0) {
          const addonsStr = opts.adicionales.map((a: any) => a.name).join(', ');
          itemStr += ` + Adicionales: ${addonsStr}`;
        }
        itemStr += ` (${formatPrice(item.price)})`;
        return itemStr;
      });

      // Add Gifts to Order Details
      activeGifts.forEach((gift: any) => {
        itemsDetails.push(`🎁 REGALO: ${gift.giftItemName || 'Producto Sorpresa'} (GRATIS)`);
      });

      const itemsString = itemsDetails.join(' || ');

      const orderData = {
        nombre: formData.nombre,
        telefono: telefono,
        direccion: formData.direccion || 'N/A',
        zona: formData.tipoEntrega === 'domicilio' ? formData.zona : undefined,
        costoDomicilio: deliveryCost,
        tipoEntrega: formData.tipoEntrega,
        formaPago: formData.formaPago,
        detallesAdicionales: formData.detallesAdicionales,
        items: itemsString,
        total: finalTotal.toFixed(0),
      };

      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Error al enviar el pedido');
      }

      const result = await response.json();
      const now = new Date();
      const timestamp = now.toLocaleTimeString('es-CO');

      // Show success notification
      setOrderSuccess({
        orderId: result.orderId,
        timestamp: timestamp,
      });

      toast.success(`¡Pedido creado! ID: ${result.orderId}`);
      clearCart();
      setFormData({
        nombre: '',
        telefono: '',
        direccion: '',
        zona: '',
        costoDomicilio: 0,
        tipoEntrega: 'domicilio',
        formaPago: 'efectivo',
        detallesAdicionales: '',
      });
    } catch (error) {
      toast.error('Error al enviar el pedido. Por favor, intenta de nuevo.');
      console.error('Order submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!config) return null;

  // --- CALCULATIONS MOVED TO TOP ---

  return (
    <>
      <Dialog open={!!orderSuccess} onOpenChange={(open) => !open && setOrderSuccess(null)}>
        <DialogContent className="sm:max-w-md border-2 border-green-500">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 size={64} className="text-green-500" />
            </div>
            <DialogTitle className="text-2xl font-bold text-green-600 text-center">
              ¡Pedido Confirmado!
            </DialogTitle>
          </DialogHeader>

          <DialogDescription className="hidden" />

          <div className="space-y-3">
            <div className="text-center text-gray-700">Tu pedido ha sido registrado correctamente.</div>
            <div className="bg-green-50 rounded-lg p-4 space-y-2 border border-green-100">
              <div className="text-sm text-green-800 font-bold mb-1">ID PARA RASTREO:</div>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={orderSuccess?.orderId}
                  className="font-mono text-lg font-bold bg-white border-green-300 text-center text-black selection:bg-green-200"
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="shrink-0 border-green-300 hover:bg-green-100 text-green-700"
                  onClick={() => {
                    navigator.clipboard.writeText(orderSuccess?.orderId || '');
                    toast.success('ID copiado al portapapeles');
                  }}
                  title="Copiar ID"
                >
                  <CheckCircle2 size={18} />
                </Button>
              </div>
              <div className="text-xs text-green-700 mt-1">
                Guarda este ID para consultar el estado de tu pedido.
              </div>
              <div className="text-sm text-gray-500 mt-2 border-t border-green-200 pt-2">
                Hora: {orderSuccess?.timestamp}
              </div>
            </div>
            <div className="text-sm text-gray-600 text-center">
              Pronto te contactaremos para confirmar los detalles de tu pedido.
            </div>
          </div>

          <Button
            onClick={() => setOrderSuccess(null)}
            className="w-full bg-green-600 hover:bg-green-700 rounded-full font-bold text-white shadow-md hover:shadow-lg transition-all"
          >
            Entendido
          </Button>
        </DialogContent>
      </Dialog>

      <section id="checkout" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">Tu Pedido</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Card className="sticky top-24 border-none shadow-lg">
                  <CardHeader>
                    <CardTitle>Resumen del Pedido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {items.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No hay items en tu pedido
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {items.map((item, index) => {
                          const opts = item.options as any;
                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex justify-between items-start p-3 bg-muted rounded-lg group"
                            >
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{item.name}</p>
                                {item.options && (
                                  <>
                                    {opts?.tipoPizza === 'mitadCadaPizza' && (
                                      <p className="text-xs text-blue-600 mt-1">
                                        Mitad: {opts.mitadPizza1?.name} + {opts.mitadPizza2?.name}
                                      </p>
                                    )}
                                    {opts?.tipoBase && (
                                      <p className="text-xs text-gray-600 mt-1">
                                        Base: {opts.tipoBase === 'tomate' ? 'Salsa de Tomate' : opts.tipoBase === 'blanca' ? 'Base Blanca' : opts.tipoBase === 'barbeque' ? 'Base BBQ' : opts.tipoBase}
                                      </p>
                                    )}
                                    {opts?.adicionales && opts.adicionales.length > 0 && (
                                      <div className="text-xs text-orange-600 mt-1 font-medium">
                                        + {opts.adicionales.map((a: any) => a.name).join(', ')}
                                      </div>
                                    )}
                                  </>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatPrice(item.price)} x {item.quantity}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <select
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateQuantity(index, parseInt(e.target.value))
                                  }
                                  className="w-12 px-1 py-1 border rounded text-xs"
                                >
                                  {[1, 2, 3, 4, 5].map((q) => (
                                    <option key={q} value={q}>
                                      {q}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => removeItem(index)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                                >
                                  <Trash2 size={14} className="text-red-500" />
                                </button>
                              </div>
                            </motion.div>
                          )
                        })}

                        {/* Display Active Gifts */}
                        {activeGifts.map((gift: any, idx: number) => (
                          <motion.div
                            key={`gift-${idx}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xl">🎁</span>
                              <div>
                                <p className="font-bold text-sm text-purple-800">REGALO: {gift.giftItemName || 'Producto Especial'}</p>
                                <p className="text-[10px] text-purple-600 uppercase tracking-wider font-bold">¡Por tu compra!</p>
                              </div>
                            </div>
                            <span className="text-sm font-bold text-green-600 bg-white px-2 py-1 rounded border border-green-200">GRATIS</span>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Cost Breakdown */}
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Subtotal Items:</span>
                        <span>{formatPrice(rawTotal)}</span>
                      </div>

                      {discount > 0 && (
                        <div className="flex justify-between items-center text-sm text-green-600 font-semibold">
                          <span>Descuento Promociones:</span>
                          <span>- {formatPrice(discount)}</span>
                        </div>
                      )}

                      {formData.tipoEntrega === 'domicilio' && (
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <span>Domicilio ({formData.zona || 'Por seleccionar'}):</span>
                          <span>
                            {isFreeDelivery ? (
                              <span className="text-green-600 font-bold">GRATIS</span>
                            ) : (
                              formatPrice(deliveryCost)
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col border-t pt-4 gap-4">
                    <div className="w-full flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-primary">{formatPrice(finalTotal)}</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={scrollToMenu}
                      className="w-full rounded-full"
                    >
                      <ShoppingCart size={16} className="mr-2" />
                      Volver al Menú
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </div>

            {/* Order Form */}
            <div className="lg:col-span-2">
              <motion.form
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="nombre" className="font-semibold mb-2 block">
                      Nombre Completo *
                    </Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      type="text"
                      placeholder="Tu nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      className="rounded-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefono" className="font-semibold mb-2 block">
                      Teléfono *
                    </Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      placeholder="+57 300 123 4567"
                      value={formData.telefono}
                      onChange={handleChange}
                      required
                      className="rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tipoEntrega" className="font-semibold mb-2 block">
                    Tipo de Entrega *
                  </Label>
                  <Select value={formData.tipoEntrega} onValueChange={(value) => handleSelectChange('tipoEntrega', value)}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="domicilio">Envío a Domicilio</SelectItem>
                      <SelectItem value="recoger">Recoger en Tienda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.tipoEntrega === 'domicilio' && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="zona" className="font-semibold mb-2 block">
                        Zona de Entrega (Cartagena) *
                      </Label>
                      <Select value={formData.zona} onValueChange={handleZoneChange}>
                        <SelectTrigger className="rounded-lg">
                          <SelectValue placeholder="Selecciona tu barrio/zona" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {zones.map((zone: any) => (
                            <SelectItem key={zone.name} value={zone.name}>
                              {zone.name} - {formatPrice(zone.price)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500 mt-2">
                        Si no encuentras tu barrio, elige el más cercano.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="direccion" className="font-semibold mb-2 block">
                        Dirección *
                      </Label>
                      <Textarea
                        id="direccion"
                        name="direccion"
                        placeholder="Calle, número, apartamento, referencias..."
                        value={formData.direccion}
                        onChange={handleChange}
                        required
                        rows={3}
                        className="rounded-lg resize-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="formaPago" className="font-semibold mb-2 block">
                    Forma de Pago *
                  </Label>
                  <Select value={formData.formaPago} onValueChange={(value) => handleSelectChange('formaPago', value)}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="detallesAdicionales" className="font-semibold mb-2 block">
                    Detalles Adicionales (Opcional)
                  </Label>
                  <Textarea
                    id="detallesAdicionales"
                    name="detallesAdicionales"
                    placeholder="Notas especiales, alergias, preferencias..."
                    value={formData.detallesAdicionales}
                    onChange={handleChange}
                    rows={3}
                    className="rounded-lg resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || items.length === 0}
                  className="w-full rounded-full bg-primary hover:bg-green-600 text-white font-semibold py-6 flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  {loading ? 'Procesando...' : `Confirmar Pedido - ${formatPrice(finalTotal)}`}
                </Button>
              </motion.form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
