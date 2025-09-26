import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, PieChart, Upload, Shield, Users, TrendingUp } from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Counter<span className="text-primary">OS</span>
          </h1>
          <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Control total de tu negocio
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Sistema integral de gestión para cadenas QSR. Controla ventas, costos, inventarios y P&L en tiempo real.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="px-8 py-4 text-lg">
                Acceder al Sistema
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Dashboard en Tiempo Real</h3>
              <p className="text-gray-600">
                Métricas instantáneas de ventas, food cost, transacciones y más. Todo centralizado en un solo lugar.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <PieChart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Análisis P&L</h3>
              <p className="text-gray-600">
                Estados de resultados detallados con análisis de rentabilidad por tienda y categoría.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Importación Automática</h3>
              <p className="text-gray-600">
                Sube datos de POS, facturas CFDI e inventarios. Procesamiento automático y validación inteligente.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Trusted by section */}
        <div className="text-center">
          <p className="text-gray-500 mb-8">Utilizado por las mejores marcas QSR</p>
          <div className="flex justify-center items-center gap-12 opacity-60">
            <div className="text-2xl font-bold text-purple-600">Moyo</div>
            <div className="text-2xl font-bold text-green-600">Nutrisa</div>
            <div className="text-2xl font-bold text-orange-600">Crepas</div>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para controlar tu negocio
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: TrendingUp, title: 'KPIs en Vivo', desc: 'Ventas, food cost, ticket promedio actualizados en tiempo real' },
              { icon: Shield, title: 'Multi-tenant', desc: 'Cada marca con su dashboard personalizado y datos aislados' },
              { icon: Users, title: 'Control por Tienda', desc: 'Monitorea el rendimiento individual de cada sucursal' },
              { icon: BarChart3, title: 'Reportes Avanzados', desc: 'Análisis profundos de rentabilidad y eficiencia operativa' },
              { icon: Upload, title: 'Integración CFDI', desc: 'Procesa facturas XML automáticamente desde el SAT' },
              { icon: PieChart, title: 'Food Cost Control', desc: 'Alertas automáticas cuando los costos se salen de objetivo' }
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para tomar el control total?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a las marcas que ya optimizan sus operaciones con CounterOS
          </p>
          <Link to="/login">
            <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
              Comenzar Ahora
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};