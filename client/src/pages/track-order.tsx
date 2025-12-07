import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, ArrowLeft, Package, Clock, Motorbike, CheckCircle, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export default function TrackOrder() {
    const [searchId, setSearchId] = useState("");
    const [searched, setSearched] = useState(false);
    const [, setLocation] = useLocation();

    const { data: orders, isLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const response = await fetch('/api/orders');
            if (!response.ok) throw new Error('Error al consultar pedidos');
            return response.json();
        }
    });

    const foundOrder = orders?.find((o: any) => o.id === searchId.trim());

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchId.trim()) return;
        setSearched(true);
    };

    const statusConfig: any = {
        'Pendiente': { icon: Package, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'Tu pedido ha sido recibido y está pendiente de confirmación.' },
        'En Preparación': { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', text: '¡Manos a la masa! Estamos preparando tu pedido.' },
        'Listo': { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', text: 'Tu pedido está listo y empacado.' },
        'En Camino': { icon: Motorbike, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', text: 'Tu pedido va en camino a tu dirección.' },
        'Entregado': { icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-300', text: '¡Disfruta tu comida! Pedido entregado.' },
        'Pedido Cancelado': { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', text: 'Este pedido ha sido cancelado.' }
    };

    const getStatusInfo = (status: string) => {
        return statusConfig[status] || statusConfig['Pendiente'];
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Button
                    variant="ghost"
                    onClick={() => setLocation('/')}
                    className="mb-6 hover:bg-gray-200 text-gray-700"
                >
                    <ArrowLeft size={16} className="mr-2" /> Volver al Inicio
                </Button>

                <Card className="shadow-xl border-none bg-white">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl font-extrabold text-black">Rastrear Pedido</CardTitle>
                        <CardDescription className="text-gray-600">
                            Ingresa el ID de tu pedido para ver el estado actual.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                            <Input
                                placeholder="Ej. PED-L5X..."
                                value={searchId}
                                onChange={(e) => {
                                    setSearchId(e.target.value);
                                    setSearched(false);
                                }}
                                className="font-mono text-center uppercase"
                            />
                            <Button type="submit" disabled={isLoading} className="bg-black hover:bg-gray-800 text-white">
                                {isLoading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                            </Button>
                        </form>

                        <AnimatePresence mode="wait">
                            {searched && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    {foundOrder ? (
                                        <div className={`rounded-xl border-2 p-6 text-center space-y-4 ${getStatusInfo(foundOrder.estado).bg} ${getStatusInfo(foundOrder.estado).border}`}>
                                            <div className={`mx-auto w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm ${getStatusInfo(foundOrder.estado).color}`}>
                                                {(() => {
                                                    const Icon = getStatusInfo(foundOrder.estado).icon;
                                                    return <Icon size={32} />;
                                                })()}
                                            </div>

                                            <div>
                                                <h3 className={`text-xl font-bold ${getStatusInfo(foundOrder.estado).color}`}>
                                                    {foundOrder.estado}
                                                </h3>
                                                <p className="text-sm text-gray-700 font-medium mt-1">
                                                    {getStatusInfo(foundOrder.estado).text}
                                                </p>
                                            </div>

                                            <div className="pt-4 border-t border-black/5 grid grid-cols-2 gap-4 text-left text-sm">
                                                <div className="text-black">
                                                    <span className="block text-[10px] text-gray-500 uppercase font-bold">Fecha</span>
                                                    {foundOrder.fecha}
                                                </div>
                                                <div className="text-black text-right">
                                                    <span className="block text-[10px] text-gray-500 uppercase font-bold">Total</span>
                                                    {foundOrder.total}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="text-5xl mb-4">🔍</div>
                                            <h3 className="text-lg font-bold text-gray-900">Pedido no encontrado</h3>
                                            <p className="text-gray-500 text-sm">Verifica que el ID esté escrito correctamente.</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
