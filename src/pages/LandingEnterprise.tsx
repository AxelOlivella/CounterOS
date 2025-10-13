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

            {/* Tagline */}
            <p className="text-lg font-semibold text-secondary uppercase tracking-wider">
              Obsesionados con el food cost
            </p>

            {/* Main headline */}
            <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
              Reduce food cost <span className="text-success">1.5 puntos</span>
              <br />
              En 100 tiendas = <span className="text-secondary">$600K/año</span>
              <br />
              <span className="text-muted-foreground text-3xl md:text-4xl">Sin abrir 1 tienda nueva</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Visibilidad en <span className="font-bold text-foreground">tiempo real</span> de TODAS tus unidades.
              Identifica qué hacen diferente tus top performers. Replica best practices.
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

          {/* Math Box + Dashboard preview */}
          <div className="mt-16 space-y-6">
            {/* Simple Math Box */}
            <Card className="p-8 border-4 border-secondary/20 bg-gradient-to-br from-secondary/5 to-success/5 animate-scale-in" style={{ animationDelay: '200ms' }}>
              <div className="text-center space-y-4">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Tu cadena
                </p>
                <div className="space-y-3">
                  <div className="flex items-baseline justify-center gap-3">
                    <span className="text-5xl md:text-6xl font-bold">100</span>
                    <span className="text-xl text-muted-foreground">tiendas</span>
                  </div>
                  <div className="flex items-baseline justify-center gap-3">
                    <span className="text-5xl md:text-6xl font-bold">$40M</span>
                    <span className="text-xl text-muted-foreground">revenue anual</span>
                  </div>
                  <div className="flex items-baseline justify-center gap-3">
                    <span className="text-5xl md:text-6xl font-bold">30%</span>
                    <span className="text-xl text-muted-foreground">food cost actual</span>
                  </div>
                </div>

                <div className="h-px bg-border my-6" />

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-success uppercase tracking-wider">
                    Reducción 1.5 puntos
                  </p>
                  <div className="flex items-baseline justify-center gap-3">
                    <span className="text-6xl md:text-7xl font-bold text-success">
                      <AnimatedNumber value={600} decimals={0} />K
                    </span>
                    <span className="text-2xl text-muted-foreground">/año</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <p className="text-lg font-bold">
                    = EBITDA de 15 tiendas típicas
                  </p>
                  <p className="text-lg font-bold">
                    = Sin abrir 1 sola ubicación
                  </p>
                  <p className="text-lg font-bold text-success">
                    = $0 en capex
                  </p>
                </div>
              </div>
            </Card>

            {/* Dashboard preview */}
            <Card className="p-6 bg-card/50 backdrop-blur border-2 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Dashboard Corporativo - 100 Unidades</h3>
                  <Badge className="bg-success text-success-foreground">Live Data</Badge>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="p-4 border-2 border-success/20 bg-success/5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
                      <span className="text-sm font-semibold text-success">30 tiendas</span>
                    </div>
                    <p className="text-3xl font-bold">28-29%</p>
                    <p className="text-sm text-muted-foreground">Top performers</p>
                  </Card>

                  <Card className="p-4 border-2 border-warning/20 bg-warning/5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-3 w-3 rounded-full bg-warning animate-pulse" />
                      <span className="text-sm font-semibold text-warning">50 tiendas</span>
                    </div>
                    <p className="text-3xl font-bold">30-32%</p>
                    <p className="text-sm text-muted-foreground">En rango</p>
                  </Card>

                  <Card className="p-4 border-2 border-critical/20 bg-critical/5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-3 w-3 rounded-full bg-critical animate-pulse" />
                      <span className="text-sm font-semibold text-critical">20 tiendas</span>
                    </div>
                    <p className="text-3xl font-bold">33-36%</p>
                    <p className="text-sm text-muted-foreground">Requieren atención</p>
                  </Card>
                </div>

                <Card className="p-4 border-2 border-critical/20 bg-critical/5">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-critical flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-critical mb-1">
                        20 tiendas con lácteos +4pts vs top 10
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Impacto: $340K/mes • Causa: Porciones +25% vs estándar
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
            <p className="text-lg font-semibold text-secondary uppercase tracking-wider mb-4">
              Obsesionados con el food cost
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Variabilidad te cuesta millones
            </h2>
            <p className="text-xl text-muted-foreground">
              El problema no es tu promedio. Es que no sabes POR QUÉ algunas tiendas están en 36% y otras en 28%.
            </p>
          </div>

          {/* Problem Statement Card */}
          <Card className="p-8 mb-12 border-2">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Tu cadena (100 tiendas):</h3>
                <div className="space-y-3 text-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    <span>30 tiendas en <span className="font-bold text-success">28-29%</span> (excelente)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-warning" />
                    <span>50 tiendas en <span className="font-bold text-warning">30-32%</span> (OK)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-critical" />
                    <span>20 tiendas en <span className="font-bold text-critical">33-36%</span> (problema)</span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xl font-bold">Promedio: 30%</p>
                </div>
              </div>

              <div className="mt-6 p-6 bg-muted rounded-lg">
                <p className="text-center font-semibold text-lg mb-4">
                  Preguntas que NO puedes responder:
                </p>
                <div className="space-y-2 text-left">
                  <p className="text-muted-foreground">❌ ¿Por qué tienda 23 está en 36% y tienda 15 en 28%?</p>
                  <p className="text-muted-foreground">❌ ¿Qué hace diferente la tienda 15?</p>
                  <p className="text-muted-foreground">❌ ¿Cómo replico tienda 15 en tienda 23?</p>
                  <p className="text-muted-foreground">❌ ¿Cuándo empezó el problema?</p>
                </div>
                <p className="text-center font-bold mt-6 text-critical">
                  Sin visibilidad granular → Identificas después → Pierdes trimestre completo
                </p>
              </div>
            </div>
          </Card>

          {/* Solution card */}
          <Card className="p-8 border-2 border-success/20">
            <div className="text-center space-y-4">
              <Check className="h-16 w-16 text-success mx-auto" />
              <p className="text-2xl font-bold text-success">
                CounterOS responde todas estas preguntas
              </p>
              <p className="text-xl text-muted-foreground">
                En tiempo real. Para todas tus tiendas.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Value Props Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-lg font-semibold text-secondary uppercase tracking-wider mb-4">
              Obsesionados con visibilidad
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Visibilidad total. Acción específica.
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

      {/* ROI Section - Reframed */}
      <section className="py-20 bg-gradient-to-br from-success/5 to-secondary/5">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-lg font-semibold text-secondary uppercase tracking-wider mb-4">
              Obsesionados con resultados
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              1-2 puntos de reducción por tienda
            </h2>
          </div>

          <Card className="p-8 border-2 border-success/20 mb-8">
            <div className="text-center space-y-8">
              <div>
                <p className="text-lg text-muted-foreground mb-2">
                  Cadenas usando CounterOS:
                </p>
                <p className="text-5xl font-bold text-success mb-2">
                  -1.8 pts
                </p>
                <p className="text-sm text-muted-foreground">
                  Reducción promedio • 12 cadenas • 847 tiendas • $180M revenue monitoreado
                </p>
              </div>

              <div className="h-px bg-border" />

              <div className="space-y-4">
                <p className="text-xl font-bold">Para ti, esto significa:</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-success/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Reducción 1pt</p>
                    <p className="text-4xl font-bold text-success">$400K</p>
                    <p className="text-sm text-muted-foreground mt-1">/año en cadena $40M</p>
                  </div>
                  <div className="p-6 bg-success/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Reducción 2pts</p>
                    <p className="text-4xl font-bold text-success">$800K</p>
                    <p className="text-sm text-muted-foreground mt-1">/año en cadena $40M</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-muted/50">
            <div className="text-center space-y-4">
              <p className="text-2xl font-bold">Se paga solo</p>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Incluso si CounterOS costara $100K/año (spoiler: no cuesta eso),
                con $600K en savings anuales, tu ROI sería 6x. Payback en menos de 60 días.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Contacto para pricing específico
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 max-w-4xl text-center space-y-8">
          <p className="text-lg font-semibold uppercase tracking-wider opacity-90">
            Obsesionados con el food cost
          </p>
          <h2 className="text-3xl md:text-5xl font-bold">
            ¿Listo para reducir 1-2 puntos de food cost?
          </h2>
          <div className="text-2xl md:text-3xl font-bold space-y-2 opacity-95">
            <p>1-2 puntos</p>
            <p>100 tiendas</p>
            <p>$400K-800K/año</p>
            <p>$0 en capex</p>
          </div>
          
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
