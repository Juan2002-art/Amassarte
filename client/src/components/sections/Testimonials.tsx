import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sofía Martínez",
    text: "¡La mejor pizza que he probado en años! La masa es increíblemente ligera y los ingredientes se sienten súper frescos. Definitivamente volveré.",
    rating: 5,
    avatar: "SM"
  },
  {
    id: 2,
    name: "Carlos Ruiz",
    text: "El ambiente es acogedor y el servicio excelente. Recomiendo la pizza de Trufa y Hongos, es una experiencia religiosa.",
    rating: 5,
    avatar: "CR"
  },
  {
    id: 3,
    name: "Ana López",
    text: "Pedí a domicilio y llegó caliente y crujiente. Me encanta que tengan opciones vegetarianas tan creativas.",
    rating: 4,
    avatar: "AL"
  }
];

export function Testimonials() {
  return (
    <section className="py-24" style={{ backgroundColor: '#1A3A3B' }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4" style={{ color: '#F5E8D0' }}>Lo que dicen nuestros clientes</h2>
          <div className="w-20 h-1 mx-auto opacity-50 rounded-full" style={{ backgroundColor: '#F5E8D0' }}></div>
        </div>

        <Carousel className="w-full max-w-4xl mx-auto">
          <CarouselContent>
            {testimonials.map((item) => (
              <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/2 pl-6">
                <Card className="border-none h-full backdrop-blur-sm" style={{ backgroundColor: '#2A5A5B' }}>
                  <CardContent className="p-8 flex flex-col h-full">
                    <div className="flex gap-1 mb-4 text-yellow-300">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} fill={i < item.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <p className="text-lg font-medium mb-6 italic leading-relaxed flex-grow" style={{ color: '#F5E8D0' }}>
                      "{item.text}"
                    </p>
                    <div className="flex items-center gap-4 mt-auto">
                      <Avatar className="h-12 w-12 border-2" style={{ borderColor: '#F5E8D0' }}>
                        <AvatarFallback className="font-bold" style={{ backgroundColor: '#F5E8D0', color: '#1A3A3B' }}>
                          {item.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-lg" style={{ color: '#F5E8D0' }}>{item.name}</p>
                        <p className="text-sm" style={{ color: '#F5E8D0', opacity: 0.8 }}>Cliente Verificado</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="border-none" style={{ backgroundColor: '#2A5A5B', color: '#F5E8D0' }} />
          <CarouselNext className="bg-white/20 border-none text-white hover:bg-white hover:text-primary" />
        </Carousel>
      </div>
    </section>
  );
}
