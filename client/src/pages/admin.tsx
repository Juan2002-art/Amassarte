import { useState, useEffect } from "react";
import { useConfig } from "@/hooks/useConfig";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ExternalLink, RefreshCw, Save, Plus, Trash2, ChevronDown, Copy } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Admin() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [password, setPassword] = useState("");

    useEffect(() => {
        fetch('/api/check-auth')
            .then(res => res.json())
            .then(data => {
                if (data.authenticated) setIsAuthenticated(true);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            if (res.ok) {
                setIsAuthenticated(true);
                toast.success("Sesión iniciada");
            } else {
                toast.error("Contraseña incorrecta");
            }
        } catch (err) {
            toast.error("Error de conexión");
        }
    };

    const handleLogout = async () => {
        await fetch('/api/logout', { method: 'POST' });
        setIsAuthenticated(false);
        setPassword("");
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
                <div className="animate-pulse text-gray-500 font-bold">Cargando panel...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
                <Card className="w-full max-w-md mx-4 shadow-xl bg-white">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center text-black font-bold">Panel Administrativo</CardTitle>
                        <CardDescription className="text-center text-gray-800">Amasarte Pizzería</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-black font-bold">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Ingrese contraseña..."
                                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-black"
                                />
                            </div>
                            <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white font-bold h-12">Entrar</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <AdminDashboard onLogout={handleLogout} />;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
    const { config, updateConfig } = useConfig();
    const queryClient = useQueryClient();

    const { data: orders, isLoading: loadingOrders } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const res = await fetch('/api/orders');
            if (!res.ok) throw new Error('Failed to fetch orders');
            return res.json();
        },
        refetchInterval: 10000,
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            const res = await fetch(`/api/orders/${id}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error('Failed to update status');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success('Estado actualizado');
        },
        onError: () => toast.error('Error al actualizar estado')
    });

    if (!config) return <div className="p-8 text-center text-black font-bold bg-gray-50 h-screen">Cargando configuración...</div>;

    return (
        <div className="admin-page min-h-screen bg-gray-100 p-4 md:p-6 pb-24 font-sans text-gray-900">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-extrabold text-black">Panel de Administración</h1>
                <Button variant="outline" onClick={onLogout} className="text-red-700 border-red-300 hover:bg-red-50 w-full md:w-auto bg-white">
                    Cerrar Sesión
                </Button>
            </div>

            <Tabs defaultValue="pedidos" className="w-full">
                <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                    <TabsList className="mb-4 inline-flex h-auto w-auto min-w-full justify-start p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <TabsTrigger value="pedidos" className="px-4 py-2 text-gray-700 data-[state=active]:bg-gray-900 data-[state=active]:text-white">Pedidos</TabsTrigger>
                        <TabsTrigger value="menu" className="px-4 py-2 text-gray-700 data-[state=active]:bg-gray-900 data-[state=active]:text-white">Menú</TabsTrigger>
                        <TabsTrigger value="promociones" className="px-4 py-2 text-gray-700 data-[state=active]:bg-gray-900 data-[state=active]:text-white">Promociones</TabsTrigger>
                        <TabsTrigger value="zonas" className="px-4 py-2 text-gray-700 data-[state=active]:bg-gray-900 data-[state=active]:text-white">Zonas</TabsTrigger>
                        <TabsTrigger value="bases" className="px-4 py-2 text-gray-700 data-[state=active]:bg-gray-900 data-[state=active]:text-white">Tipos de Base</TabsTrigger>
                        <TabsTrigger value="adicionales" className="px-4 py-2 text-gray-700 data-[state=active]:bg-gray-900 data-[state=active]:text-white">Adicionales</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="pedidos">
                    <Card className="border-none shadow-md bg-white">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                            <div>
                                <CardTitle className="text-xl md:text-2xl text-black font-bold">Últimos Pedidos</CardTitle>
                                <CardDescription className="text-gray-800 font-medium">Sincronizado con Google Sheets</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => queryClient.invalidateQueries({ queryKey: ['orders'] })}>
                                <RefreshCw className={`h-5 w-5 text-gray-600 ${loadingOrders ? "animate-spin" : ""}`} />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0 md:p-6">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                                            <TableHead className="text-black font-extrabold whitespace-nowrap w-[40px]">#</TableHead>
                                            <TableHead className="text-black font-extrabold whitespace-nowrap">Ref</TableHead>
                                            <TableHead className="text-black font-extrabold whitespace-nowrap">Fecha</TableHead>
                                            <TableHead className="text-black font-extrabold whitespace-nowrap">Cliente</TableHead>
                                            <TableHead className="text-black font-extrabold whitespace-nowrap">Dirección</TableHead>
                                            <TableHead className="text-black font-extrabold whitespace-nowrap">Info</TableHead>
                                            <TableHead className="text-black font-extrabold whitespace-nowrap max-w-[200px]">Detalle</TableHead>
                                            <TableHead className="text-black font-extrabold whitespace-nowrap">Total</TableHead>
                                            <TableHead className="text-black font-extrabold whitespace-nowrap">Estado</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders?.map((order: any) => (
                                            <TableRow key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <TableCell className="font-mono text-[10px] font-bold text-gray-400">{order.localId}</TableCell>
                                                <TableCell className="font-mono text-xs font-bold text-black select-all cursor-pointer" title="Copiar">{order.id}</TableCell>
                                                <TableCell className="whitespace-nowrap text-black text-xs">
                                                    <div className="font-bold text-black">{order.fecha}</div>
                                                    <div className="text-black font-medium">{order.hora}</div>
                                                </TableCell>
                                                <TableCell className="text-black text-xs">
                                                    <div className="font-bold text-black uppercase">{order.nombre}</div>
                                                    <div className="text-black font-bold">{order.telefono}</div>
                                                    {order.zona && <span className="inline-block px-1.5 py-0.5 rounded bg-blue-100 text-blue-950 font-bold text-[10px] mt-1">{order.zona}</span>}
                                                </TableCell>
                                                <TableCell className="text-xs text-black font-medium max-w-[150px] truncate cursor-help" title={order.direccion}>
                                                    {order.direccion}
                                                </TableCell>
                                                <TableCell className="text-xs text-black">
                                                    <div className="font-bold text-black">{order.tipoEntrega}</div>
                                                    <div className="text-black font-bold">{order.formaPago}</div>
                                                </TableCell>
                                                <TableCell className="text-xs text-black max-w-[250px]">
                                                    <details className="group cursor-pointer">
                                                        <summary className="font-bold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[250px] list-none marker:text-transparent">
                                                            <span className="group-open:hidden">▶ {order.items.substring(0, 30)}...</span>
                                                            <span className="hidden group-open:inline">▼ Ocultar</span>
                                                        </summary>
                                                        <div className="whitespace-pre-wrap font-bold text-gray-900 text-xs mt-1 bg-gray-100 p-2 rounded border border-gray-200">
                                                            {order.items}
                                                        </div>
                                                    </details>
                                                    {order.detalles && <div className="text-orange-700 font-bold italic mt-1 line-clamp-1 text-[10px]" title={order.detalles}>Nota: {order.detalles}</div>}
                                                </TableCell>
                                                <TableCell className="font-bold text-black whitespace-nowrap text-sm">{order.total}</TableCell>
                                                <TableCell>
                                                    <Select
                                                        defaultValue={order.estado}
                                                        onValueChange={(val) => updateStatusMutation.mutate({ id: order.id, status: val })}
                                                    >
                                                        <SelectTrigger className="w-[130px] h-8 bg-white border-gray-400 text-black font-bold text-xs shadow-sm">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-white border-gray-400">
                                                            <SelectItem value="Pendiente" className="admin-select-item cursor-pointer">Pendiente</SelectItem>
                                                            <SelectItem value="En Preparación" className="admin-select-item cursor-pointer">En Preparación</SelectItem>
                                                            <SelectItem value="Listo" className="admin-select-item cursor-pointer">Listo</SelectItem>
                                                            <SelectItem value="En Camino" className="admin-select-item cursor-pointer">En Camino</SelectItem>
                                                            <SelectItem value="Entregado" className="admin-select-item cursor-pointer">Entregado</SelectItem>
                                                            <SelectItem value="Pedido Cancelado" className="admin-select-item-cancel cursor-pointer">Pedido Cancelado</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="menu">
                    <MenuEditor config={config} updateConfig={updateConfig} />
                </TabsContent>

                <TabsContent value="promociones">
                    <PromosEditor config={config} updateConfig={updateConfig} />
                </TabsContent>

                <TabsContent value="zonas">
                    <ZonesEditor config={config} updateConfig={updateConfig} />
                </TabsContent>

                <TabsContent value="bases">
                    <BaseTypesEditor config={config} updateConfig={updateConfig} />
                </TabsContent>

                <TabsContent value="adicionales">
                    <AddonsEditor config={config} updateConfig={updateConfig} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

// EDITOR COMPONENTS - Styles simplified and enforced for readability

function MenuEditor({ config, updateConfig }: { config: any, updateConfig: any }) {
    const [localConfig, setLocalConfig] = useState(config);
    useEffect(() => setLocalConfig(config), [config]);

    const updateMenu = (newMenu: any) => {
        const newConfig = { ...localConfig, menu: newMenu };
        setLocalConfig(newConfig);
    };

    const handleUpdateItem = (category: string, id: number, field: string, value: any) => {
        const newMenu = JSON.parse(JSON.stringify(localConfig.menu));
        const idx = newMenu[category].findIndex((p: any) => p.id === id);
        if (idx >= 0) {
            newMenu[category][idx][field] = value;
            updateMenu(newMenu);
        }
    };

    const handlePriceChange = (category: string, id: number, size: string, price: number) => {
        const newMenu = JSON.parse(JSON.stringify(localConfig.menu));
        const idx = newMenu[category].findIndex((p: any) => p.id === id);
        if (idx >= 0) {
            newMenu[category][idx].prices[size] = price;
            updateMenu(newMenu);
        }
    };

    const toggleAvailability = (category: string, id: number) => {
        const newMenu = JSON.parse(JSON.stringify(localConfig.menu));
        const idx = newMenu[category].findIndex((p: any) => p.id === id);
        if (idx >= 0) {
            newMenu[category][idx].available = !newMenu[category][idx].available;
            updateMenu(newMenu);
        }
    };

    const addItem = (category: string) => {
        const newMenu = JSON.parse(JSON.stringify(localConfig.menu));
        const newItem = {
            id: Date.now(),
            name: "Nuevo Producto",
            desc: "Descripción...",
            prices: { personal: 10000, grande: 0 },
            available: true,
            image: "",
            tags: []
        };
        if (!newMenu[category]) newMenu[category] = [];
        newMenu[category].push(newItem);
        updateMenu(newMenu);
    };

    const deleteItem = (category: string, id: number) => {
        if (!window.confirm("¿Eliminar este producto?")) return;
        const newMenu = JSON.parse(JSON.stringify(localConfig.menu));
        newMenu[category] = newMenu[category].filter((i: any) => i.id !== id);
        updateMenu(newMenu);
    };

    const toggleDrinksSection = () => {
        setLocalConfig({
            ...localConfig,
            settings: { ...localConfig.settings, showDrinks: !localConfig.settings.showDrinks }
        });
    };

    return (
        <div className="space-y-6 pb-20">
            <Card className="bg-white text-gray-900 border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="text-black font-bold">Configuración Global</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex items-center space-x-4">
                        <Switch
                            checked={localConfig.settings.showDrinks}
                            onCheckedChange={toggleDrinksSection}
                            id="show-drinks"
                            className="data-[state=checked]:bg-green-600"
                        />
                        <Label htmlFor="show-drinks" className="text-black font-bold cursor-pointer">Mostrar Sección de Bebidas en el Menú</Label>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Switch
                            checked={localConfig.settings?.showBakery !== false}
                            onCheckedChange={() => setLocalConfig({
                                ...localConfig,
                                settings: { ...localConfig.settings, showBakery: !localConfig.settings?.showBakery }
                            })}
                            id="show-bakery"
                            className="data-[state=checked]:bg-amber-600"
                        />
                        <Label htmlFor="show-bakery" className="text-black font-bold cursor-pointer">Mostrar Sección de Panadería en el Menú</Label>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Switch
                            checked={localConfig.settings?.showImages !== false}
                            onCheckedChange={() => setLocalConfig({
                                ...localConfig,
                                settings: { ...localConfig.settings, showImages: !localConfig.settings.showImages }
                            })}
                            id="show-images"
                            className="data-[state=checked]:bg-blue-600"
                        />
                        <Label htmlFor="show-images" className="text-black font-bold cursor-pointer">Mostrar Imágenes de los Productos</Label>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mt-2">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                                <Switch
                                    checked={localConfig.settings?.siteActive !== false}
                                    onCheckedChange={() => setLocalConfig({
                                        ...localConfig,
                                        settings: { ...localConfig.settings, siteActive: localConfig.settings?.siteActive === false }
                                    })}
                                    id="site-active"
                                    className="data-[state=checked]:bg-black"
                                />
                                <div className="flex flex-col">
                                    <Label htmlFor="site-active" className="text-black font-extrabold text-lg cursor-pointer">
                                        {localConfig.settings?.siteActive !== false ? '🟢 TIENDA ABIERTA' : '🔴 TIENDA CERRADA'}
                                    </Label>
                                    <span className="text-xs text-gray-500">
                                        {localConfig.settings?.siteActive !== false
                                            ? 'La página web está visible para los clientes.'
                                            : 'Se muestra la pantalla de mantenimiento.'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {localConfig.settings?.siteActive === false && (
                            <div className="bg-red-50 p-4 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-2">
                                <Label className="text-red-800 font-bold mb-2 block">Mensaje de Cierre (Personalizado)</Label>
                                <Textarea
                                    value={localConfig.settings?.siteClosedMessage || ''}
                                    onChange={(e) => setLocalConfig({
                                        ...localConfig,
                                        settings: { ...localConfig.settings, siteClosedMessage: e.target.value }
                                    })}
                                    className="bg-white border-red-200 text-red-900 font-medium"
                                    placeholder="Ej: Hola! Hoy descansamos. Nos vemos el jueves con la mejor energía."
                                />
                            </div>
                        )}

                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <Label className="text-black font-bold mb-2 block">Tiempo Estimado de Entrega</Label>
                            <Input
                                value={localConfig.settings?.estimatedDeliveryTime || ''}
                                onChange={(e) => setLocalConfig({
                                    ...localConfig,
                                    settings: { ...localConfig.settings, estimatedDeliveryTime: e.target.value }
                                })}
                                className="bg-white border-gray-300 text-black font-medium"
                                placeholder="Ej: 45 - 60 minutos"
                            />
                            <p className="text-xs text-gray-500 mt-1">Este tiempo se mostrará al cliente al seleccionar su barrio y en el rastreo de pedido.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {['clasicas', 'especiales', 'bebidas', 'panaderia'].map(category => (
                <Card key={category} className="bg-white border-none shadow-sm">
                    <CardHeader className="bg-gray-100/50 border-b flex flex-row justify-between items-center">
                        <CardTitle className="capitalize text-xl font-bold text-black">{category}</CardTitle>
                        <Button size="sm" onClick={() => addItem(category)} className="bg-black text-white hover:bg-gray-800">
                            <Plus size={16} className="mr-2" /> Agregar Producto
                        </Button>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        <div className="grid gap-4">
                            {localConfig.menu[category]?.map((item: any) => (
                                <div key={item.id} className="flex flex-col md:flex-row p-4 border rounded-lg bg-white shadow-sm gap-4 items-start">
                                    <div className="flex-1 w-full space-y-3">
                                        <div className="flex gap-2">
                                            <div className="w-1/2">
                                                <Label className="text-xs text-black font-bold">Nombre</Label>
                                                <Input
                                                    value={item.name}
                                                    onChange={(e) => handleUpdateItem(category, item.id, 'name', e.target.value)}
                                                    className="font-bold text-black border-gray-300"
                                                />
                                            </div>
                                            <div className="w-1/2">
                                                <Label className="text-xs text-black font-bold">URL Imagen</Label>
                                                <Input
                                                    value={item.image || ''}
                                                    onChange={(e) => handleUpdateItem(category, item.id, 'image', e.target.value)}
                                                    placeholder="https://..."
                                                    className="text-xs border-gray-300"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-black font-bold">Descripción</Label>
                                            <Textarea
                                                value={item.desc}
                                                onChange={(e) => handleUpdateItem(category, item.id, 'desc', e.target.value)}
                                                className="min-h-[60px] border-gray-300 text-sm"
                                            />
                                        </div>

                                        {/* Tipos de Base Permitidos - Solo para pizzas */}
                                        {category !== 'bebidas' && category !== 'panaderia' && (
                                            <div className="border-t pt-3 mt-2">
                                                <Label className="text-xs text-black font-bold mb-2 block">Tipos de Base Permitidos</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {(localConfig.baseTypes || [
                                                        { value: 'tomate', label: 'Salsa de Tomate' },
                                                        { value: 'blanca', label: 'Base Blanca (Crema)' },
                                                        { value: 'barbeque', label: 'Base BBQ' }
                                                    ]).map((base: any) => {
                                                        const isChecked = item.allowedBases?.includes(base.value) ?? true; // Por defecto todas permitidas
                                                        return (
                                                            <div key={base.value} className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded border border-gray-200">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={(e) => {
                                                                        const currentBases = item.allowedBases || (localConfig.baseTypes || []).map((b: any) => b.value);
                                                                        const newBases = e.target.checked
                                                                            ? [...currentBases, base.value]
                                                                            : currentBases.filter((b: string) => b !== base.value);
                                                                        handleUpdateItem(category, item.id, 'allowedBases', newBases);
                                                                    }}
                                                                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                                                                />
                                                                <span className="text-xs text-gray-700">{base.label}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <p className="text-[10px] text-gray-400 mt-1">El cliente solo podrá elegir las bases marcadas para esta pizza</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-3 min-w-[200px]">
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <Label className="text-[10px] font-bold uppercase text-black">Precio {(category === 'bebidas' || category === 'panaderia') ? '' : 'Pers'}</Label>
                                                <Input
                                                    type="number"
                                                    value={item.prices.personal}
                                                    onChange={(e) => handlePriceChange(category, item.id, 'personal', parseInt(e.target.value))}
                                                    className="h-9 bg-gray-50 font-mono"
                                                />
                                            </div>
                                            {category !== 'bebidas' && category !== 'panaderia' && (
                                                <div className="flex-1">
                                                    <Label className="text-[10px] font-bold uppercase text-black">Grande</Label>
                                                    <Input
                                                        type="number"
                                                        value={item.prices.grande}
                                                        onChange={(e) => handlePriceChange(category, item.id, 'grande', parseInt(e.target.value))}
                                                        className="h-9 bg-gray-50 font-mono"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={item.available}
                                                    onCheckedChange={() => toggleAvailability(category, item.id)}
                                                    className="data-[state=checked]:bg-green-600"
                                                />
                                                <span className={`text-xs font-bold ${item.available ? 'text-green-600' : 'text-red-500'}`}>
                                                    {item.available ? 'Disponible' : 'Agotado'}
                                                </span>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => deleteItem(category, item.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8">
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}

            <FixedSaveButton onClick={() => updateConfig(localConfig)} hasChanges={JSON.stringify(config) !== JSON.stringify(localConfig)} />
        </div>
    );
}

function PromosEditor({ config, updateConfig }: { config: any, updateConfig: any }) {
    const [localConfig, setLocalConfig] = useState(config);

    // Initialize custom promos if missing
    useEffect(() => {
        if (!config?.settings?.promotions) return;

        if (!config.settings.promotions.custom) {
            const newConfig = { ...config };
            newConfig.settings.promotions.custom = [];
            setLocalConfig(newConfig);
        } else {
            setLocalConfig(config);
        }
    }, [config]);

    const handlePromoChange = (key: string, field: string, value: any) => {
        const newSettings = JSON.parse(JSON.stringify(localConfig.settings));
        if (!newSettings.promotions[key]) newSettings.promotions[key] = {};
        newSettings.promotions[key][field] = value;
        setLocalConfig({ ...localConfig, settings: newSettings });
    };

    const addCustomPromo = () => {
        const newSettings = JSON.parse(JSON.stringify(localConfig.settings));
        if (!newSettings.promotions.custom) newSettings.promotions.custom = [];
        newSettings.promotions.custom.push({
            id: Date.now().toString(),
            title: "Nueva Oferta",
            description: "Descripción de la oferta",
            active: true
        });
        setLocalConfig({ ...localConfig, settings: newSettings });
    };

    const addPromoFromTemplate = (templateData: any) => {
        const newSettings = JSON.parse(JSON.stringify(localConfig.settings));
        if (!newSettings.promotions.custom) newSettings.promotions.custom = [];
        newSettings.promotions.custom.push({
            ...templateData,
            id: Date.now().toString(),
        });
        setLocalConfig({ ...localConfig, settings: newSettings });
        toast.success("Promoción creada desde plantilla");
    };

    const PROMO_TEMPLATES = [
        {
            name: "Envío Gratis (Completo)",
            icon: "🚚",
            data: {
                title: "Envío Gratis",
                description: "Te regalamos el domicilio en tu compra.",
                badge: "¡GRATIS!",
                logic: 'limit_delivery',
                deliveryPrice: 0,
                validZoneIds: [], // Empty for all zones
                active: true,
                terms: "Válido para todas las zonas."
            }
        },
        {
            name: "2x1 en Pizzas (Martes)",
            icon: "🍕",
            data: {
                title: "Martes de 2x1",
                description: "Compra 2 pizzas y paga solo la de mayor valor.",
                badge: "2x1",
                logic: '2x1',
                itemsToSelect: 2,

                // daysOfWeek: [2], // COMENTADO: Para que aparezca siempre por defecto
                validSizes: ['personal', 'grande'],
                active: true,
                terms: "Aplica en pizzas personales y grandes."
            }
        },
        {
            name: "Regalo: Coca Cola 1.5L",
            icon: "🥤",
            data: {
                title: "Gaseosa Gratis",
                description: "Lleva una Coca Cola 1.5L por compras superiores a $60.000.",
                badge: "REGALO",
                logic: 'gift',
                minOrderValue: 60000,
                giftItemName: "Coca Cola 1.5L",
                active: true,
                terms: "Una por pedido."
            }
        },
        {
            name: "Descuento 10%",
            icon: "🏷️",
            data: {
                title: "10% de Descuento",
                description: "Aprovecha un 10% de descuento en todo el menú.",
                badge: "-10%",
                logic: 'discount',
                price: 10, // Assuming price field is used for percentage in discount logic, need to verify
                active: true,
                terms: "Descuento aplicado al subtotal."
            }
        }
    ];

    const updateCustomPromo = (idx: number, field: string, value: any) => {
        const newSettings = JSON.parse(JSON.stringify(localConfig.settings));
        newSettings.promotions.custom[idx][field] = value;
        setLocalConfig({ ...localConfig, settings: newSettings });
    };

    const removeCustomPromo = (idx: number) => {
        const newSettings = JSON.parse(JSON.stringify(localConfig.settings));
        newSettings.promotions.custom.splice(idx, 1);
        setLocalConfig({ ...localConfig, settings: newSettings });
    };

    if (!localConfig?.settings?.promotions) return <div className="p-4 text-red-500">Error: Configuración de promociones no disponible.</div>;

    return (
        <Card className="shadow-md bg-white text-gray-900 border-none mb-24">
            <CardHeader>
                <CardTitle className="text-black font-bold">Configuración de Promociones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* 2x1 */}
                <PromoCard
                    title="2x1 en Pizzas Personales"
                    desc="El sistema cobra solo la pizza más cara por cada par de personales."
                    active={localConfig.settings?.promotions?.twoForOne?.active}
                    onToggle={(val) => handlePromoChange('twoForOne', 'active', val)}
                >
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <Label className="text-black font-bold whitespace-nowrap">Día activo:</Label>
                        <Select
                            value={localConfig.settings?.promotions?.twoForOne?.dayOfWeek?.toString() || ""}
                            onValueChange={(val) => handlePromoChange('twoForOne', 'dayOfWeek', parseInt(val))}
                        >
                            <SelectTrigger className="w-full sm:w-[150px] bg-white border-gray-300 text-black">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white text-black">
                                {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((day, i) => (
                                    <SelectItem key={i} value={i.toString()} className="text-black hover:bg-gray-100">{day}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </PromoCard>

                {/* Free Delivery */}
                <PromoCard
                    title="Domicilios Gratis"
                    desc="El costo de envío será $0 para todas las zonas."
                    active={localConfig.settings?.promotions?.freeDelivery?.active}
                    onToggle={(val) => handlePromoChange('freeDelivery', 'active', val)}
                />

                {/* Custom Promos */}
                {/* Custom Promos */}
                <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-black">Campañas Personalizadas</h3>
                        <div className="flex gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="border-dashed border-gray-400">
                                        <Copy size={16} className="mr-2" /> Usar Plantilla
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-white border-black">
                                    <DropdownMenuLabel>Selecciona una plantilla</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {PROMO_TEMPLATES.map((tmpl, i) => (
                                        <DropdownMenuItem key={i} onClick={() => addPromoFromTemplate(tmpl.data)} className="cursor-pointer hover:bg-gray-100">
                                            <span className="mr-2">{tmpl.icon}</span> {tmpl.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button onClick={addCustomPromo} size="sm" className="bg-black text-white hover:bg-gray-800">
                                <Plus size={16} className="mr-2" /> Crear Nueva
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {Array.isArray(localConfig.settings.promotions.custom) && localConfig.settings.promotions.custom.map((promo: any, idx: number) => (
                            <div key={promo.id || idx} className="p-4 border rounded-lg bg-gray-50 shadow-sm hover:shadow-md transition-all">
                                <div className="flex flex-col gap-4">
                                    <div className="flex-1 grid gap-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-xs text-black font-bold">Título</Label>
                                                <Input
                                                    value={promo.title || ''}
                                                    onChange={(e) => updateCustomPromo(idx, 'title', e.target.value)}
                                                    className="bg-white border-gray-300 text-black font-bold"
                                                    placeholder="Ej: Combo Familiar"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-black font-bold">Etiqueta (Badge)</Label>
                                                <Input
                                                    value={promo.badge || ''}
                                                    onChange={(e) => updateCustomPromo(idx, 'badge', e.target.value)}
                                                    className="bg-white border-gray-300 text-black"
                                                    placeholder="Ej: ¡NUEVO!"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-xs text-black font-bold">Descripción</Label>
                                            <Textarea
                                                value={promo.description || ''}
                                                onChange={(e) => updateCustomPromo(idx, 'description', e.target.value)}
                                                className="bg-white border-gray-300 text-black"
                                                placeholder="Describe la promoción..."
                                                rows={2}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-xs text-black font-bold">Precio Promocional (Opcional)</Label>
                                                <div className="relative">
                                                    <span className="absolute left-2 top-2 text-black font-bold">$</span>
                                                    <Input
                                                        type="number"
                                                        value={promo.price || ''}
                                                        onChange={(e) => updateCustomPromo(idx, 'price', e.target.value ? parseInt(e.target.value) : undefined)}
                                                        className="bg-white border-gray-300 text-black pl-6"
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-gray-400">Si dejas 0, será solo informativo.</p>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-gray-500">Términos / Detalles</Label>
                                                <Input
                                                    value={promo.terms || ''}
                                                    onChange={(e) => updateCustomPromo(idx, 'terms', e.target.value)}
                                                    className="bg-white border-gray-300 text-black"
                                                    placeholder="Ej: Válido solo martes"
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-orange-50 p-3 rounded-md mt-2 space-y-3 border border-orange-100">
                                            <Label className="text-orange-900 font-bold text-xs uppercase flex items-center gap-2">
                                                📅 Disponibilidad (Días y Horas)
                                            </Label>

                                            <div className="flex flex-col gap-2">
                                                <span className="text-[10px] text-gray-500 font-medium">Días Hábiles (Azul = Activo)</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((d, i) => {
                                                        const jsDay = i;
                                                        const hasDays = Array.isArray(promo.daysOfWeek);
                                                        const isSelected = hasDays ? promo.daysOfWeek.includes(jsDay) : true;

                                                        const toggleDay = () => {
                                                            const currentDays = hasDays ? [...promo.daysOfWeek] : [0, 1, 2, 3, 4, 5, 6];
                                                            const newDays = currentDays.includes(jsDay)
                                                                ? currentDays.filter((d: number) => d !== jsDay)
                                                                : [...currentDays, jsDay];
                                                            updateCustomPromo(idx, 'daysOfWeek', newDays);
                                                        };

                                                        return (
                                                            <div
                                                                key={i}
                                                                onClick={toggleDay}
                                                                className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer text-xs font-bold transition-all ${isSelected
                                                                    ? 'bg-blue-600 text-white shadow-sm scale-110'
                                                                    : 'bg-white text-gray-400 border border-gray-200 hover:border-blue-300'
                                                                    }`}
                                                                title={['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][i]}
                                                            >
                                                                {d}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] text-gray-500 font-bold uppercase">Hora Inicio (24h)</Label>
                                                    <Input
                                                        type="time"
                                                        value={promo.startHour || ''}
                                                        onChange={(e) => updateCustomPromo(idx, 'startHour', e.target.value)}
                                                        className="h-8 w-32 bg-white border-orange-200 text-xs font-bold"
                                                    />
                                                </div>
                                                <div className="text-gray-300">-</div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] text-gray-500 font-bold uppercase">Hora Fin (24h)</Label>
                                                    <Input
                                                        type="time"
                                                        value={promo.endHour || ''}
                                                        onChange={(e) => updateCustomPromo(idx, 'endHour', e.target.value)}
                                                        className="h-8 w-32 bg-white border-orange-200 text-xs font-bold"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-100 p-3 rounded-md mt-2">
                                            <div className="space-y-1">
                                                <Label className="text-xs text-gray-500 font-bold">Tipo de Regla</Label>
                                                <Select
                                                    value={promo.logic || 'simple'}
                                                    onValueChange={(val) => {
                                                        const newSettings = JSON.parse(JSON.stringify(localConfig.settings));
                                                        newSettings.promotions.custom[idx].logic = val;
                                                        if (val === 'limit_delivery') {
                                                            newSettings.promotions.custom[idx].deliveryPrice = 0;
                                                        }
                                                        setLocalConfig({ ...localConfig, settings: newSettings });
                                                    }}
                                                >
                                                    <SelectTrigger className="bg-white border-gray-300 h-8 text-black">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="simple">Simple (Solo Botón)</SelectItem>
                                                        <SelectItem value="2x1">2x1 / Selección</SelectItem>
                                                        <SelectItem value="limit_delivery">Domicilio Gratis</SelectItem>
                                                        <SelectItem value="gift">Regalo (Producto)</SelectItem>
                                                        <SelectItem value="discount">Descuento (%)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {promo.logic === '2x1' && (
                                                <div className="space-y-2">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-gray-500 font-bold">Cant. a Escoger</Label>
                                                        <Input
                                                            type="number"
                                                            value={promo.itemsToSelect || 2}
                                                            onChange={(e) => updateCustomPromo(idx, 'itemsToSelect', parseInt(e.target.value))}
                                                            className="bg-white border-gray-300 h-8 text-black"
                                                        />
                                                    </div>
                                                    <div className="space-y-1 border-t pt-2">
                                                        <Label className="text-xs text-gray-500 font-bold mb-1 block">Tamaños Permitidos</Label>
                                                        <div className="flex gap-4">
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!promo.validSizes || promo.validSizes.includes('personal')}
                                                                    onChange={(e) => {
                                                                        const current = promo.validSizes || ['personal', 'grande'];
                                                                        let newSizes;
                                                                        if (e.target.checked) newSizes = [...current, 'personal'];
                                                                        else newSizes = current.filter((s: string) => s !== 'personal');
                                                                        updateCustomPromo(idx, 'validSizes', newSizes);
                                                                    }}
                                                                    className="rounded border-gray-300 text-black focus:ring-black"
                                                                />
                                                                <span className="text-xs text-black">Personal</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!promo.validSizes || promo.validSizes.includes('grande')}
                                                                    onChange={(e) => {
                                                                        const current = promo.validSizes || ['personal', 'grande'];
                                                                        let newSizes;
                                                                        if (e.target.checked) newSizes = [...current, 'grande'];
                                                                        else newSizes = current.filter((s: string) => s !== 'grande');
                                                                        updateCustomPromo(idx, 'validSizes', newSizes);
                                                                    }}
                                                                    className="rounded border-gray-300 text-black focus:ring-black"
                                                                />
                                                                <span className="text-xs text-black">Grande</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {promo.logic === 'limit_delivery' && (
                                                <div className="col-span-1 md:col-span-2 space-y-2 border-t pt-2 mt-1">
                                                    <div className="flex justify-between items-center gap-2">
                                                        <Label className="text-xs text-gray-500 font-bold">Costo envío</Label>
                                                        <div className="px-3 py-1.5 bg-green-100 text-green-800 rounded text-xs font-bold border border-green-200 shadow-sm">
                                                            🚀 GRATIS ($0)
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] text-gray-400">Zonas Válidas (Deja vacío = Todas)</Label>
                                                        <div className="h-32 overflow-y-auto border border-gray-200 rounded p-2 bg-white grid grid-cols-2 gap-1">
                                                            {localConfig.zones?.map((z: any, zIdx: number) => {
                                                                const isChecked = promo.validZoneIds?.includes(z.name);
                                                                return (
                                                                    <div key={zIdx} className="flex items-center gap-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isChecked || false}
                                                                            onChange={(e) => {
                                                                                const current = promo.validZoneIds || [];
                                                                                let newZones;
                                                                                if (e.target.checked) newZones = [...current, z.name];
                                                                                else newZones = current.filter((n: string) => n !== z.name);
                                                                                updateCustomPromo(idx, 'validZoneIds', newZones);
                                                                            }}
                                                                            className="rounded border-gray-300 w-3 h-3 text-black focus:ring-black"
                                                                        />
                                                                        <span className="text-xs text-gray-700 truncate">{z.name}</span>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {promo.logic === 'gift' && (
                                                <div className="col-span-1 md:col-span-2 space-y-2 border-t pt-2 mt-1">
                                                    <Label className="text-xs text-gray-500 font-bold">Producto de Regalo</Label>
                                                    <Select
                                                        value={promo.giftItemId?.toString() || ''}
                                                        onValueChange={(val) => {
                                                            updateCustomPromo(idx, 'giftItemId', val);
                                                            const allGifts = [...(localConfig?.menu?.bebidas || [])];
                                                            const found = allGifts.find((g: any) => g.id.toString() === val);
                                                            if (found) updateCustomPromo(idx, 'giftItemName', found.name);
                                                        }}
                                                    >
                                                        <SelectTrigger className="bg-white border-gray-300 text-black h-9"><SelectValue placeholder="Selecciona bebida..." /></SelectTrigger>
                                                        <SelectContent className="max-h-40">
                                                            {localConfig?.menu?.bebidas?.map((b: any) => (
                                                                <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}

                                            {promo.logic === 'discount' && (
                                                <div className="col-span-1 md:col-span-2 space-y-2 border-t pt-2 mt-1">
                                                    <Label className="text-xs text-gray-500 font-bold">Porcentaje de Descuento (%)</Label>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            max={100}
                                                            min={1}
                                                            value={promo.discountPercent || ''}
                                                            onChange={(e) => updateCustomPromo(idx, 'discountPercent', parseInt(e.target.value))}
                                                            className="bg-white border-gray-300 text-black h-9 pl-4"
                                                            placeholder="Ej: 15"
                                                        />
                                                        <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {promo.logic === '2x1' && (
                                            <div className="space-y-2 border border-gray-200 p-3 rounded bg-white max-h-40 overflow-y-auto">
                                                <Label className="text-xs text-gray-500 font-bold block mb-2">Pizzas Válidas (Selecciona)</Label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[...(localConfig?.menu?.clasicas || []), ...(localConfig?.menu?.especiales || [])].map((pizza: any) => {
                                                        const isSelected = promo.validItemIds?.includes(pizza.id);
                                                        return (
                                                            <div key={pizza.id} className="flex items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={(e) => {
                                                                        const currentIds = promo.validItemIds || [];
                                                                        let newIds;
                                                                        if (e.target.checked) newIds = [...currentIds, pizza.id];
                                                                        else newIds = currentIds.filter((id: any) => id !== pizza.id);
                                                                        updateCustomPromo(idx, 'validItemIds', newIds);
                                                                    }}
                                                                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                                                                />
                                                                <span className="text-xs text-gray-700 truncate" title={pizza.name}>{pizza.name}</span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        <details className="mt-2 group">
                                            <summary className="cursor-pointer text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center select-none">
                                                <span>⚙️ Opciones Avanzadas (Días, Horario, Imagen)</span>
                                                <ChevronDown size={14} className="ml-1 transition-transform group-open:rotate-180" />
                                            </summary>
                                            <div className="pt-3 space-y-3 pl-2 border-l-2 border-gray-200 mt-2">

                                                <div className="space-y-1">
                                                    <Label className="text-xs text-gray-500">Días Activos (Vacio = Todos)</Label>
                                                    <div className="flex flex-wrap gap-1">
                                                        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((d, i) => {
                                                            const isActive = promo.daysOfWeek?.includes(i);
                                                            return (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => {
                                                                        const currentDays = promo.daysOfWeek || [];
                                                                        let newDays;
                                                                        if (isActive) newDays = currentDays.filter((day: number) => day !== i);
                                                                        else newDays = [...currentDays, i];
                                                                        updateCustomPromo(idx, 'daysOfWeek', newDays);
                                                                    }}
                                                                    className={`text-[10px] px-2 py-1 rounded border ${isActive ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-300'}`}
                                                                >
                                                                    {d}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-gray-500">Fecha Inicio</Label>
                                                        <Input
                                                            type="date"
                                                            value={promo.startDate || ''}
                                                            onChange={(e) => updateCustomPromo(idx, 'startDate', e.target.value)}
                                                            className="bg-white border-gray-300 h-8 text-xs text-black"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-gray-500">Fecha Fin</Label>
                                                        <Input
                                                            type="date"
                                                            value={promo.endDate || ''}
                                                            onChange={(e) => updateCustomPromo(idx, 'endDate', e.target.value)}
                                                            className="bg-white border-gray-300 h-8 text-xs text-black"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <Label className="text-xs text-gray-500">URL Imagen de Fondo (Opcional)</Label>
                                                    <Input
                                                        value={promo.imageUrl || ''}
                                                        onChange={(e) => updateCustomPromo(idx, 'imageUrl', e.target.value)}
                                                        className="bg-white border-gray-300 h-8 text-black"
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            </div>
                                        </details>
                                    </div>

                                    {/* Botones de control al final */}
                                    <div className="flex justify-between items-center gap-4 pt-4 border-t border-gray-200 mt-2">
                                        <div className="flex items-center gap-3">
                                            <Switch
                                                checked={promo.active}
                                                onCheckedChange={(val) => updateCustomPromo(idx, 'active', val)}
                                                className="data-[state=checked]:bg-green-600"
                                            />
                                            <span className="text-sm font-bold text-gray-700">{promo.active ? '✅ Activa' : '❌ Inactiva'}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeCustomPromo(idx)}
                                            className="text-red-500 hover:bg-red-100 hover:text-red-600 h-9 px-3"
                                        >
                                            <Trash2 size={16} className="mr-1" />
                                            Borrar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!localConfig.settings.promotions.custom || !Array.isArray(localConfig.settings.promotions.custom) || localConfig.settings.promotions.custom.length === 0) && (
                            <div className="text-center py-8 bg-white rounded-lg border border-dashed border-gray-300">
                                <p className="text-gray-500 mb-2">No has creado promociones personalizadas.</p>
                                <Button onClick={addCustomPromo} variant="outline" size="sm">Crear mi primera promo</Button>
                            </div>
                        )}
                    </div>
                </div>

            </CardContent>
            <FixedSaveButton onClick={() => updateConfig(localConfig)} />
        </Card>
    );
}

function PromoCard({ title, desc, active, onToggle, children }: any) {
    return (
        <div className={`p-5 border rounded-xl shadow-sm transition-all ${active ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                <div>
                    <h3 className="text-lg font-bold text-black">{title}</h3>
                    <p className="text-sm text-gray-900 font-medium mt-1">{desc}</p>
                </div>
                <div className="flex items-center gap-3 self-start sm:self-center">
                    <span className={`text-sm font-bold ${active ? "text-green-700" : "text-gray-400"}`}>
                        {active ? "ACTIVADO" : "DESACTIVADO"}
                    </span>
                    <Switch
                        checked={active}
                        onCheckedChange={onToggle}
                        className="data-[state=checked]:bg-green-600"
                    />
                </div>
            </div>
            {children && <div className="pt-2 border-t border-gray-200/50 mt-2">{children}</div>}
        </div>
    )
}

function ZonesEditor({ config, updateConfig }: { config: any, updateConfig: any }) {
    const [localConfig, setLocalConfig] = useState(config);
    useEffect(() => setLocalConfig(config), [config]);

    const handlePriceChange = (index: number, newPrice: number) => {
        const newZones = [...localConfig.zones];
        newZones[index].price = newPrice;
        setLocalConfig({ ...localConfig, zones: newZones });
    };

    const handleNameChange = (index: number, newName: string) => {
        const newZones = [...localConfig.zones];
        newZones[index].name = newName;
        setLocalConfig({ ...localConfig, zones: newZones });
    };

    const handleAddZone = () => {
        const newZones = [...localConfig.zones, { name: "Nueva Zona", price: 3000 }];
        setLocalConfig({ ...localConfig, zones: newZones });
    };

    const handleDeleteZone = (index: number) => {
        const newZones = [...localConfig.zones];
        newZones.splice(index, 1);
        setLocalConfig({ ...localConfig, zones: newZones });
    };

    return (
        <Card className="shadow-md bg-white text-gray-900 border-none mb-24">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-black font-bold">Tarifas por Barrio</CardTitle>
                    <CardDescription className="text-gray-800 font-medium">Gestiona tus zonas de cobertura y precios.</CardDescription>
                </div>
                <Button onClick={handleAddZone} size="sm" className="bg-black text-white hover:bg-gray-800">
                    <Plus size={16} className="mr-2" /> Agregar Zona
                </Button>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {localConfig.zones.map((zone: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white shadow-sm hover:border-black transition-colors group">
                            <Input
                                value={zone.name}
                                onChange={(e) => handleNameChange(index, e.target.value)}
                                className="border-none shadow-none focus-visible:ring-0 font-medium text-sm text-gray-900 p-0 h-auto bg-transparent w-full mr-2"
                                placeholder="Nombre del barrio"
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-black font-bold text-sm">$</span>
                                <Input
                                    type="number"
                                    className="w-20 h-9 text-right bg-white border border-gray-300 font-bold text-black rounded text-sm"
                                    value={zone.price}
                                    onChange={(e) => handlePriceChange(index, parseInt(e.target.value))}
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteZone(index)}
                                    className="h-8 w-8 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
            <FixedSaveButton onClick={() => updateConfig(localConfig)} />
        </Card>
    );
}

function BaseTypesEditor({ config, updateConfig }: { config: any, updateConfig: any }) {
    const [localConfig, setLocalConfig] = useState(config);
    useEffect(() => setLocalConfig(config), [config]);

    // Initialize baseTypes if missing
    useEffect(() => {
        if (!localConfig.baseTypes) {
            setLocalConfig({
                ...localConfig,
                baseTypes: [
                    { value: 'tomate', label: 'Salsa de Tomate' },
                    { value: 'blanca', label: 'Base Blanca (Crema)' },
                    { value: 'barbeque', label: 'Base BBQ' }
                ]
            });
        }
    }, []);

    const handleLabelChange = (index: number, newLabel: string) => {
        const newBaseTypes = [...(localConfig.baseTypes || [])];
        newBaseTypes[index].label = newLabel;
        setLocalConfig({ ...localConfig, baseTypes: newBaseTypes });
    };

    const handleValueChange = (index: number, newValue: string) => {
        const newBaseTypes = [...(localConfig.baseTypes || [])];
        newBaseTypes[index].value = newValue.toLowerCase().replace(/\s+/g, '_');
        setLocalConfig({ ...localConfig, baseTypes: newBaseTypes });
    };

    const handleAddBase = () => {
        const newBaseTypes = [...(localConfig.baseTypes || []), { value: 'nueva_base', label: 'Nueva Base' }];
        setLocalConfig({ ...localConfig, baseTypes: newBaseTypes });
    };

    const handleDeleteBase = (index: number) => {
        if (!window.confirm('¿Eliminar este tipo de base?')) return;
        const newBaseTypes = [...(localConfig.baseTypes || [])];
        newBaseTypes.splice(index, 1);
        setLocalConfig({ ...localConfig, baseTypes: newBaseTypes });
    };

    return (
        <Card className="shadow-md bg-white text-gray-900 border-none mb-24">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-black font-bold">Tipos de Base / Salsas</CardTitle>
                    <CardDescription className="text-gray-800 font-medium">Gestiona los tipos de base disponibles para las pizzas.</CardDescription>
                </div>
                <Button onClick={handleAddBase} size="sm" className="bg-black text-white hover:bg-gray-800">
                    <Plus size={16} className="mr-2" /> Agregar Base
                </Button>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-4">
                    {(localConfig.baseTypes || []).map((base: any, index: number) => (
                        <div key={index} className="flex flex-col md:flex-row items-start md:items-center gap-3 p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:border-black transition-colors group">
                            <div className="flex-1 w-full md:w-auto space-y-2">
                                <div>
                                    <Label className="text-xs text-gray-500 font-bold">Nombre (visible para clientes)</Label>
                                    <Input
                                        value={base.label}
                                        onChange={(e) => handleLabelChange(index, e.target.value)}
                                        className="font-medium text-sm text-gray-900 border-gray-300"
                                        placeholder="Ej: Salsa Napolitana"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-400 font-bold">ID (interno, sin espacios)</Label>
                                    <Input
                                        value={base.value}
                                        onChange={(e) => handleValueChange(index, e.target.value)}
                                        className="font-mono text-xs text-gray-600 border-gray-200 bg-gray-50"
                                        placeholder="ej: napolitana"
                                    />
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteBase(index)}
                                className="h-9 w-9 text-gray-400 hover:text-red-500 hover:bg-red-50 self-end md:self-center"
                            >
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    ))}
                </div>
                {(!localConfig.baseTypes || localConfig.baseTypes.length === 0) && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500 mb-2">No hay tipos de base configurados.</p>
                        <Button onClick={handleAddBase} variant="outline" size="sm">Crear primer tipo de base</Button>
                    </div>
                )}
            </CardContent>
            <FixedSaveButton onClick={() => updateConfig(localConfig)} hasChanges={JSON.stringify(config) !== JSON.stringify(localConfig)} />
        </Card>
    );
}

function AddonsEditor({ config, updateConfig }: { config: any, updateConfig: any }) {
    const [localConfig, setLocalConfig] = useState(config);
    useEffect(() => setLocalConfig(config), [config]);

    const updateAddons = (newAddons: any) => {
        setLocalConfig({ ...localConfig, addons: newAddons });
    };

    const handleUpdateItem = (cat: string, index: number, field: string, value: any) => {
        const newAddons = JSON.parse(JSON.stringify(localConfig.addons));
        newAddons[cat][index][field] = value;
        updateAddons(newAddons);
    };

    const deleteItem = (cat: string, index: number) => {
        if (!window.confirm("¿Eliminar este adicional?")) return;
        const newAddons = JSON.parse(JSON.stringify(localConfig.addons));
        newAddons[cat].splice(index, 1);
        updateAddons(newAddons);
    };

    const addItem = (cat: string) => {
        const newAddons = JSON.parse(JSON.stringify(localConfig.addons));
        newAddons[cat].push({ id: Date.now().toString(), name: "Nuevo Adicional", price: 5000, available: true });
        updateAddons(newAddons);
    };

    return (
        <Card className="shadow-md bg-white text-gray-900 border-none mb-24">
            <CardHeader>
                <CardTitle className="text-black font-bold">Editor de Adicionales</CardTitle>
                <CardDescription className="text-gray-800 font-medium">Gestiona los ingredientes extra disponibles para cada categoría.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {Object.keys(localConfig.addons).map((cat) => (
                        <div key={cat} className="space-y-3">
                            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                <h3 className="font-bold capitalize text-lg text-black">{cat}</h3>
                                <Button onClick={() => addItem(cat)} size="sm" variant="outline" className="text-xs h-8 bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                                    <Plus className="w-3 h-3 mr-1" /> Agregar {cat}
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {localConfig.addons[cat].map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white gap-2 shadow-sm">
                                        <div className="flex-1 space-y-1">
                                            <Input
                                                value={item.name}
                                                onChange={(e) => handleUpdateItem(cat, idx, 'name', e.target.value)}
                                                className="h-8 text-sm border-gray-100 bg-gray-50 focus:bg-white text-black"
                                                placeholder="Nombre"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm font-bold text-gray-500">$</span>
                                                <Input
                                                    type="number"
                                                    className="w-20 h-8 text-right bg-white border border-gray-200 text-black font-bold rounded text-sm focus:border-black"
                                                    value={item.price}
                                                    onChange={(e) => handleUpdateItem(cat, idx, 'price', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                            <Switch
                                                checked={item.available !== false}
                                                onCheckedChange={(checked) => handleUpdateItem(cat, idx, 'available', checked)}
                                                className="scale-75 data-[state=checked]:bg-green-600"
                                                title={item.available !== false ? "Disponible" : "No disponible"}
                                            />
                                            <Button
                                                size="sm" variant="ghost"
                                                className="h-8 w-8 text-red-400 hover:text-red-700 hover:bg-red-50 p-0"
                                                onClick={() => deleteItem(cat, idx)}
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {localConfig.addons[cat].length === 0 && (
                                    <div className="col-span-full text-center py-4 text-gray-400 text-sm italic">
                                        No hay adicionales en esta categoría.
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
            <FixedSaveButton onClick={() => updateConfig(localConfig)} />
        </Card>
    )
}

function FixedSaveButton({ onClick, hasChanges = true }: { onClick: () => void, hasChanges?: boolean }) {
    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 flex justify-end">
            <Button
                onClick={onClick}
                disabled={!hasChanges}
                className={`w-full md:w-auto font-bold h-12 px-8 rounded-full shadow-lg transition-all ${hasChanges ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
            >
                <Save className="mr-2 h-5 w-5" />
                {hasChanges ? 'Guardar Cambios' : 'Sin Cambios'}
            </Button>
        </div>
    )
}
