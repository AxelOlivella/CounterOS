import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { Check, ArrowRight, TrendingDown, MapPin, AlertCircle, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export function LandingEnterprise() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20 md:py-32">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center space-y-8 animate-fade-in">
            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              <Badge variant="outline" className="text-xs font-semibold">
                ✓ Multi-tenant
              </Badge>
              <Badge variant="outline" className="text-xs font-semibold">
                ✓ Enterprise Security
              </Badge>
              <Badge variant="outline" className="text-xs font-semibold">
                ✓ API Integrations
              </Badge>
              <Badge variant="outline" className="text-xs font-semibold">
                ✓ 99.9% Uptime SLA
              </Badge>
            </div>

            {/* Main headline */}
            <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
              ¿Por qué 20 de tus tiendas tienen
              <br />
              <span className="text-critical">food cost de 35%</span>
              <br />
              y otras 20 tienen <span className="text-success">26%</span>?
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              CounterOS te da visibilidad en <span className="font-bold text-foreground">tiempo real</span> de TODAS tus unidades.
              Identifica qué hacen diferente las top performers. Replica best practices.
              Reduce variabilidad a <span className="font-bold text-success">±1pt</span>.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button 
                size="lg" 
                className="mobile-button text-lg px-8 py-6"
                onClick={() => navigate('/login')}
              >
                Schedule Executive Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="mobile-button text-lg px-8 py-6"
              >
                Download Case Study
              </Button>
            </div>
          </div>

          {/* Dashboard preview mockup */}
          <div className="mt-16 animate-scale-in" style={{ animationDelay: '200ms' }}>
            <Card className="p-6 bg-card/50 backdrop-blur border-2">
              <div className="space-y-6">
                {/* Mock dashboard header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Dashboard Corporativo - 80 Unidades</h3>
                  <Badge className="bg-success text-success-foreground">Live Data</Badge>
                </div>

                {/* Mock map visualization */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="p-4 border-2 border-success/20 bg-success/5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
                      <span className="text-sm font-semibold text-success">20 tiendas</span>
                    </div>
                    <p className="text-3xl font-bold">26-28%</p>
                    <p className="text-sm text-muted-foreground">Top performers</p>
                  </Card>

                  <Card className="p-4 border-2 border-warning/20 bg-warning/5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-3 w-3 rounded-full bg-warning animate-pulse" />
                      <span className="text-sm font-semibold text-warning">40 tiendas</span>
                    </div>
                    <p className="text-3xl font-bold">29-31%</p>
                    <p className="text-sm text-muted-foreground">En rango aceptable</p>
                  </Card>

                  <Card className="p-4 border-2 border-critical/20 bg-critical/5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-3 w-3 rounded-full bg-critical animate-pulse" />
                      <span className="text-sm font-semibold text-critical">20 tiendas</span>
                    </div>
                    <p className="text-3xl font-bold">33-38%</p>
                    <p className="text-sm text-muted-foreground">Requieren atención</p>
                  </Card>
                </div>

                {/* Alert example */}
                <Card className="p-4 border-2 border-critical/20 bg-critical/5">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-critical flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-critical mb-1">
                        20 tiendas con lácteos +4pts vs benchmark
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Impacto: $340K/mes • Causa probable: Porciones inconsistentes
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              La variabilidad de food cost te cuesta millones
            </h2>
            <p className="text-xl text-muted-foreground">
              El problema no es tu food cost promedio. Es la variabilidad.
            </p>
          </div>

          {/* ROI Calculator */}
          <Card className="p-8 border-2 border-critical/20 bg-critical/5 mb-12">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Escenario típico: Cadena 80 unidades QSR</h3>
                <div className="flex items-baseline justify-center gap-2 mb-1">
                  <span className="text-sm text-muted-foreground">Revenue anual:</span>
                  <span className="text-4xl font-bold">$400M</span>
                </div>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-sm text-muted-foreground">Food cost target:</span>
                  <span className="text-3xl font-bold">28%</span>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Cost breakdown */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 bg-card">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-warning">40 tiendas +2pts</span>
                      <Badge variant="outline" className="text-warning border-warning">
                        $200M revenue
                      </Badge>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-warning">$4M</span>
                      <span className="text-muted-foreground">/año</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      $200M × 2% overhead = $4M perdido
                    </p>
                  </div>
                </Card>

                <Card className="p-6 bg-card">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-critical">20 tiendas +7pts</span>
                      <Badge variant="outline" className="text-critical border-critical">
                        $100M revenue
                      </Badge>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-critical">$7M</span>
                      <span className="text-muted-foreground">/año</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      $100M × 7% overhead = $7M perdido
                    </p>
                  </div>
                </Card>
              </div>

              {/* Total impact */}
              <div className="text-center pt-6 border-t-2 border-critical">
                <p className="text-sm text-muted-foreground mb-2">COSTO TOTAL DE VARIABILIDAD</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-6xl md:text-7xl font-bold text-critical">
                    <AnimatedNumber value={11} decimals={0} />M
                  </span>
                  <span className="text-2xl text-muted-foreground">/año</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Y ni siquiera sabes por qué está pasando
                </p>
              </div>
            </div>
          </Card>

          {/* Questions you can't answer */}
          <Card className="p-8">
            <h3 className="text-2xl font-bold mb-6">
              Preguntas que NO puedes responder hoy:
            </h3>
            
            <div className="space-y-4">
              {[
                '¿Por qué tienda 23 está en 38% y tienda 15 en 26%?',
                '¿Qué hace diferente la tienda 15?',
                '¿Cómo replico tienda 15 en tienda 23?',
                '¿Cuándo empezó el problema en tienda 23?',
                '¿Es el gerente, el proveedor, las porciones, o robo?'
              ].map((question, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-lg border border-critical/20 bg-critical/5",
                    "animate-fade-in",
                    `animate-stagger-${Math.min(idx + 1, 3)}`
                  )}
                >
                  <AlertCircle className="h-5 w-5 text-critical flex-shrink-0 mt-0.5" />
                  <p className="font-medium">{question}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-muted rounded-lg">
              <p className="text-center font-semibold text-lg">
                Sin visibilidad granular → Identificas <span className="text-critical">después</span> → Pierdes trimestre completo → No sabes qué replicar
              </p>
            </div>

            <div className="mt-8 text-center">
              <div className="inline-block p-6 bg-success/10 rounded-lg border-2 border-success/20">
                <Check className="h-12 w-12 text-success mx-auto mb-3" />
                <p className="text-xl font-bold text-success">
                  CounterOS responde todas estas preguntas
                </p>
                <p className="text-muted-foreground mt-2">
                  En tiempo real. Para todas tus tiendas.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Value Props Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              3 capacidades que transforman tu operación
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* 1. Real-time visibility */}
            <Card className="p-8 border-2 hover:shadow-xl transition-all duration-300">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                <MapPin className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                1. Visibilidad en tiempo real
              </h3>
              <p className="text-muted-foreground mb-6">
                Dashboard consolidado de TODAS tus unidades. Color-coded por performance. 
                Drill-down ilimitado: región → ciudad → tienda → categoría → ingrediente.
              </p>
              <ul className="space-y-3">
                {[
                  'Food cost por tienda actualizado cada hora',
                  'Alertas automáticas cuando una tienda se desvía',
                  'Comparativas Top 10 vs Bottom 10'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* 2. Root cause analysis */}
            <Card className="p-8 border-2 hover:shadow-xl transition-all duration-300 border-secondary/50">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                2. Diagnóstico quirúrgico
              </h3>
              <p className="text-muted-foreground mb-6">
                No solo te dice QUÉ está mal. Te dice POR QUÉ está mal y QUÉ HACER.
                AI-powered root cause analysis.
              </p>
              <ul className="space-y-3">
                {[
                  'Variancia teórica vs real (detecta robo/merma)',
                  'Análisis granular por ingrediente',
                  'Acciones específicas recomendadas'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* 3. Benchmarking */}
            <Card className="p-8 border-2 hover:shadow-xl transition-all duration-300">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                <TrendingDown className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                3. Benchmarking interno
              </h3>
              <p className="text-muted-foreground mb-6">
                Identifica qué hacen diferente tus top performers. 
                Replica best practices en tiendas con problemas.
              </p>
              <ul className="space-y-3">
                {[
                  'Top performers por categoría y concepto',
                  'Playbooks automáticos de mejora',
                  'Track improvement over time'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-20 bg-gradient-to-br from-success/5 to-secondary/5">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">
            ROI típico en cadena de 100 unidades
          </h2>

          <Card className="p-8 border-2 border-success/20">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Reducción de variabilidad</p>
                <p className="text-5xl font-bold text-success">-3pts</p>
                <p className="text-sm text-muted-foreground mt-1">promedio en tiendas problema</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Ahorro anual</p>
                <p className="text-5xl font-bold text-success">$6-8M</p>
                <p className="text-sm text-muted-foreground mt-1">en cadena $500M revenue</p>
              </div>
            </div>

            <div className="p-6 bg-success/10 rounded-lg">
              <p className="text-2xl font-bold mb-2">
                Payback period: <span className="text-success">2-3 meses</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Implementación completa en 30 días
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 max-w-4xl text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold">
            ¿Listo para reducir tu variabilidad?
          </h2>
          <p className="text-xl opacity-90">
            Schedule una demo ejecutiva de 30 minutos. Te mostraremos cómo CounterOS 
            puede reducir tu variabilidad de food cost en 50% en los próximos 90 días.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg"
              variant="secondary"
              className="mobile-button text-lg px-8 py-6"
              onClick={() => navigate('/login')}
            >
              Schedule Executive Demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="mobile-button text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              Contact Sales
            </Button>
          </div>

          <div className="pt-8 text-sm opacity-75">
            <p>Trusted by leading F&B chains across Mexico</p>
          </div>
        </div>
      </section>
    </div>
  );
}
