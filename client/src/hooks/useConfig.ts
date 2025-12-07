import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from 'sonner';

const defaultConfig = {
    settings: {
        showDrinks: true,
        showImages: true,
        siteActive: true,
        siteClosedMessage: "Estamos en mantenimiento, volvemos pronto.",
        promotions: {
            twoForOne: { active: false, dayOfWeek: 6 },
            freeDelivery: { active: false },
            custom: [
                {
                    id: "1765064983886",
                    title: "3 adicionales gratis",
                    description: "escoge 3 adicionales completamente gratis para tu pizza\n",
                    active: true
                },
                {
                    id: "1765067662702",
                    title: "2x1",
                    description: "Paga 1 lleva 2",
                    active: true,
                    logic: "2x1",
                    terms: "Solo una promo por cliente",
                    badge: "Promo de sabado",
                    validItemIds: [1, 5, 3, 50, 2, 6, 4]
                }
            ]
        }
    },
    zones: [
        { name: "20 de julio", price: 2000 },
        { name: "Sucre", price: 2000 },
        { name: "Vista hermosa", price: 2000 },
        { name: "Luis Carlos galán", price: 2000 },
        { name: "San Pedro mártir", price: 3000 },
        { name: "Campestre", price: 3000 },
        { name: "Caracoles", price: 4000 },
        { name: "Almirante", price: 4000 },
        { name: "Socorro", price: 5000 },
        { name: "Bocagrande", price: 7000 },
        { name: "Castillogrande", price: 8000 },
        { name: "Manga", price: 5000 },
        { name: "Pie de la Popa", price: 4000 },
        { name: "Crespo", price: 8000 },
        { name: "Zona Norte", price: 10000 },
        { name: "Turbaco", price: 15000 }
    ],
    addons: {
        salsas: [{ id: "s1", name: "Salsa napolitana", price: 5000 }, { id: "s2", name: "Bechamel", price: 5000 }],
        quesos: [{ id: "q1", name: "Queso mozzarella", price: 5000 }, { id: "q2", name: "Queso costeño", price: 5000 }],
        carnes: [{ id: "c1", name: "Jamón ahumado", price: 5000 }, { id: "c2", name: "Jamón serrano", price: 5000 }, { id: "c3", name: "Carne desmechada", price: 5000 }, { id: "c4", name: "Pollo desmechado", price: 5000 }, { id: "c5", name: "Chorizo", price: 5000 }, { id: "c6", name: "Pepperoni", price: 5000 }, { id: "c7", name: "Salami", price: 5000 }, { id: "c8", name: "Tocineta crocante", price: 5000 }],
        verduras: [{ id: "v1", name: "Tomate cherry", price: 5000 }, { id: "v2", name: "Pico de gallo", price: 5000 }, { id: "v3", name: "Chimichurri", price: 5000 }, { id: "v4", name: "Champiñones", price: 5000 }, { id: "v5", name: "Cebolla", price: 5000 }, { id: "v6", name: "Maíz", price: 5000 }, { id: "v7", name: "Pimentón", price: 5000 }],
        dulces: [{ id: "d1", name: "Plátano maduro", price: 5000 }, { id: "d2", name: "Piña caramelizada", price: 5000 }, { id: "d3", name: "Cebolla caramelizada", price: 5000 }]
    },
    menu: {
        clasicas: [
            { id: 1, name: "Jamón Tradición", desc: "Salsa napolitana, queso mozzarella, jamón ahumado", prices: { personal: 19000, grande: 33000 }, tags: [], available: true },
            { id: 2, name: "Hawaiana", desc: "Salsa napolitana, queso mozzarella, jamón ahumado, piña caramelizada", prices: { personal: 22000, grande: 36000 }, tags: ["popular"], available: true },
            { id: 3, name: "Pollo Champiñón", desc: "Salsa Bechamel, queso mozzarella, pollo desmechado, champiñones", prices: { personal: 26000, grande: 45000 }, tags: [], available: true },
            { id: 4, name: "Pepperoni", desc: "Salsa napolitana, queso mozzarella, pepperoni", prices: { personal: 24000, grande: 43000 }, tags: ["popular"], available: true },
            { id: 5, name: "Salami", desc: "Salsa napolitana, queso mozzarella, salami", prices: { personal: 25000, grande: 44000 }, tags: [], available: true },
            { id: 6, name: "Vegetariana", desc: "Salsa napolitana, queso mozzarella, cebolla, maíz, pimentón, champiñones, aceite de perejil", prices: { personal: 23000, grande: 39000 }, tags: ["veg"], available: true },
            { id: 50, name: "Mitad de Cada Una", desc: "Escoge 2 pizzas diferentes y lleva mitad de cada una.", prices: { personal: 0, grande: 0 }, tags: ["popular"], available: true }
        ],
        especiales: [
            { id: 7, name: "Mediterráneo cherry", desc: "Salsa napolitana, queso mozzarella, tomate cherry, jamón serrano, aceite de oliva achiotado", prices: { personal: 26000, grande: 45000 }, tags: ["gourmet"], available: true },
            { id: 8, name: "Plátano stracciato amaSSarte", desc: "Salsa napolitana, queso mozzarella, carne desmechada, plátano maduro, queso costeño, cebollín chino", prices: { personal: 27000, grande: 47000 }, tags: ["chef-choice"], available: true },
            { id: 9, name: "Pico de pollo", desc: "Salsa napolitana, queso mozzarella, pollo desmechado, pico e gallo", prices: { personal: 24000, grande: 43000 }, tags: [], available: true },
            { id: 10, name: "Pico di Manzo", desc: "Salsa napolitana, queso mozzarella, carne desmechada, pico e gallo", prices: { personal: 25000, grande: 45000 }, tags: ["gourmet"], available: true },
            { id: 11, name: "Crocancia picant-dulc", desc: "Salsa napolitana, queso mozzarella, pepperoni, tocineta crocante, cebolla dulce", prices: { personal: 26000, grande: 45000 }, tags: ["spicy"], available: true },
            { id: 12, name: "Chimichori amaSSarte", desc: "Salsa napolitana, queso mozzarella, chorizo, chimichurri", prices: { personal: 27000, grande: 47000 }, tags: [], available: true }
        ],
        bebidas: [
            { id: 13, name: "Limonada Casera", desc: "Limones frescos, menta y un toque de jengibre.", prices: { personal: 13000, grande: 13000 }, tags: [], available: true },
            { id: 14, name: "Cerveza Artesanal IPA", desc: "Cervecería local, notas cítricas.", prices: { personal: 14000, grande: 14000 }, tags: [], available: true },
            { id: 15, name: "Vino Tinto Malbec", desc: "Copa de la casa.", prices: { personal: 15000, grande: 15000 }, tags: [], available: true },
            { id: 16, name: "Agua Mineral con Gas", desc: "Refrescante y pura, con burbujas naturales.", prices: { personal: 8000, grande: 8000 }, tags: [], available: true },
            { id: 17, name: "Refresco Natural", desc: "Jugo fresco de frutas tropicales del día.", prices: { personal: 10000, grande: 10000 }, tags: [], available: true },
            { id: 18, name: "Vino Blanco Sauvignon Blanc", desc: "Copa de blanco, fresco y afrutado.", prices: { personal: 13000, grande: 13000 }, tags: [], available: true },
            { id: 19, name: "Cerveza Lager Premium", desc: "Cervecería clear, suave y refrescante.", prices: { personal: 12000, grande: 12000 }, tags: [], available: true },
            { id: 20, name: "Gaseosa Premium", desc: "Bebida carbonatada gourmet de importación.", prices: { personal: 9000, grande: 9000 }, tags: [], available: true }
        ]
    }
};

export function useConfig() {
    const queryClient = useQueryClient();

    const { data: config, isLoading, error } = useQuery({
        queryKey: ['config'],
        queryFn: async () => {
            try {
                const res = await fetch('/api/config');
                if (!res.ok) throw new Error('Failed to fetch config');
                return await res.json();
            } catch (e) {
                console.error("Config fetch error:", e);
                return null; // Return null to trigger fallback
            }
        },
    });

    const updateConfigMutation = useMutation({
        mutationFn: async (newConfig: any) => {
            const res = await fetch('/api/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newConfig),
            });
            if (!res.ok) throw new Error('Failed to update config');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['config'] });
            toast.success('Configuración guardada exitosamente');
        },
        onError: () => {
            toast.error('Error al guardar configuración');
        }
    });

    // Merge loaded config with default to ensure structure exists
    const finalConfig = config ? { ...defaultConfig, ...config, settings: { ...defaultConfig.settings, ...config.settings } } : defaultConfig;

    return {
        config: finalConfig,
        isLoading,
        error,
        updateConfig: updateConfigMutation.mutate,
        isUpdating: updateConfigMutation.isPending
    };
}
