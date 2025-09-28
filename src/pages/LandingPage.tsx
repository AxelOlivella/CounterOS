import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BarChart3, Calculator, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-display mb-6">CounterOS</h1>
          <p className="text-xl-custom text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sistema operativo multi-tenant para restaurantes. Obsesionado con tu rentabilidad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/login')} className="mobile-button">
              Iniciar Sesión <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/setup')} className="mobile-button">
              Comenzar Demo
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Food Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body text-muted-foreground">
                Cálculo automático del costo de alimentos basado en recetas y ventas reales.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                P&L Automático
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body text-muted-foreground">
                Estado de resultados generado automáticamente con tus datos operativos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Control en Tiempo Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body text-muted-foreground">
                Alertas inteligentes cuando tus costos se salen del objetivo.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;