import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Store, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function EmptyOnboardingState() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <Card className="border-2 border-dashed">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">¡Bienvenido a CounterOS!</CardTitle>
          <CardDescription className="text-base">
            Para comenzar, necesitas completar la configuración inicial de tu cuenta
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Pasos */}
          <div className="grid gap-4">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">Registra tu primera tienda</h3>
                <p className="text-sm text-muted-foreground">
                  Agrega información básica: nombre, ubicación y meta de food cost
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">Sube tus archivos</h3>
                <p className="text-sm text-muted-foreground">
                  Facturas XML de compras y CSV de ventas del POS
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">¡Listo para usar!</h3>
                <p className="text-sm text-muted-foreground">
                  Visualiza tu food cost en tiempo real y optimiza tu rentabilidad
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/onboarding/welcome')}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Comenzar Setup Inicial
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.open('https://docs.counteros.com/onboarding', '_blank')}
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Ver Guía Paso a Paso
            </Button>
          </div>

          {/* Info adicional */}
          <div className="pt-4 border-t">
            <p className="text-sm text-center text-muted-foreground">
              El setup toma menos de 5 minutos. ¿Necesitas ayuda? 
              <a href="mailto:support@counteros.com" className="text-primary hover:underline ml-1">
                Contáctanos
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
