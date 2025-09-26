import React, { useState, useEffect } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, Menu, BarChart3, Upload, PieChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const DashboardPage = () => {
  const { tenant, userProfile, signOut, brandName, primaryColor } = useTenant();
  const { toast } = useToast();
  
  const [ventasHoy, setVentasHoy] = useState('Cargando...');
  const [foodCost, setFoodCost] = useState('Cargando...');
  const [transacciones, setTransacciones] = useState('Cargando...');
  const [ticketPromedio, setTicketPromedio] = useState('Cargando...');
  const [colorFood, setColorFood] = useState('#22c55e');
  const [currentSection, setCurrentSection] = useState('dashboard');

  useEffect(() => {
    if (userProfile?.tenant_id) {
      cargarDatos();
    }
  }, [userProfile]);

  async function cargarDatos() {
    if (!userProfile?.tenant_id) return;

    try {
      // Obtener fecha de hoy
      const hoy = new Date().toISOString().split('T')[0];
      
      // Cargar ventas de hoy para este tenant
      const { data: ventasData, error: ventasError } = await supabase
        .from('daily_sales')
        .select('net_sales, transactions, gross_sales')
        .eq('date', hoy)
        .eq('tenant_id', userProfile.tenant_id);

      if (ventasError) throw ventasError;

      if (ventasData && ventasData.length > 0) {
        const totalVentas = ventasData.reduce((sum, v) => sum + (v.net_sales || 0), 0);
        const totalTransacciones = ventasData.reduce((sum, v) => sum + (v.transactions || 0), 0);
        
        setVentasHoy(`$${totalVentas.toLocaleString()}`);
        setTransacciones(totalTransacciones.toString());
        
        if (totalTransacciones > 0) {
          const ticket = (totalVentas / totalTransacciones).toFixed(0);
          setTicketPromedio(`$${ticket}`);
        }
      } else {
        // Si no hay datos de hoy, usar valores de demo específicos por marca
        const demoData = getDemoDataForTenant(tenant?.name || '');
        setVentasHoy(demoData.ventas);
        setTransacciones(demoData.transacciones);
        setTicketPromedio(demoData.ticket);
      }

      // Cargar compras del mes para calcular food cost
      const { data: comprasData, error: comprasError } = await supabase
        .from('purchases')
        .select('total')
        .eq('tenant_id', userProfile.tenant_id);

      if (comprasError) throw comprasError;

      if (comprasData && comprasData.length > 0 && ventasData && ventasData.length > 0) {
        const totalCompras = comprasData.reduce((sum, p) => sum + parseFloat(String(p.total || '0')), 0);
        const totalVentas = ventasData.reduce((sum, v) => sum + (v.net_sales || 0), 0);
        
        if (totalVentas > 0) {
          const foodCostCalc = ((totalCompras / totalVentas) * 100).toFixed(1);
          setFoodCost(`${foodCostCalc}%`);
          
          // Cambiar color si está alto
          if (parseFloat(foodCostCalc) > 30) {
            setColorFood('#ef4444');
          } else {
            setColorFood('#22c55e');
          }
        }
      } else {
        // Valor de demo por marca
        const demoData = getDemoDataForTenant(tenant?.name || '');
        setFoodCost(demoData.foodCost);
        setColorFood(demoData.foodCostColor);
      }

      toast({
        title: "Datos actualizados",
        description: "Dashboard actualizado correctamente",
      });

    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive"
      });
      
      // Usar datos demo en caso de error
      const demoData = getDemoDataForTenant(tenant?.name || '');
      setVentasHoy(demoData.ventas);
      setTransacciones(demoData.transacciones);
      setTicketPromedio(demoData.ticket);
      setFoodCost(demoData.foodCost);
      setColorFood(demoData.foodCostColor);
    }
  }

  function getDemoDataForTenant(tenantName: string) {
    const demoData = {
      'Moyo': {
        ventas: '$28,500',
        transacciones: '185',
        ticket: '$154',
        foodCost: '32.4%',
        foodCostColor: '#ef4444'
      },
      'Nutrisa': {
        ventas: '$22,800',
        transacciones: '142',
        ticket: '$160',
        foodCost: '28.2%',
        foodCostColor: '#22c55e'
      },
      'Crepas': {
        ventas: '$31,200',
        transacciones: '201',
        ticket: '$155',
        foodCost: '29.8%',
        foodCostColor: '#22c55e'
      }
    };
    
    return demoData[tenantName as keyof typeof demoData] || demoData['Moyo'];
  }

  const renderContent = () => {
    if (currentSection === 'upload') {
      return (
        <div className="text-center py-16">
          <Upload className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-4">Módulo de Upload</h2>
          <p className="text-muted-foreground mb-6">
            Funcionalidad de subida de datos integrada próximamente
          </p>
          <Button 
            onClick={() => window.open('/upload', '_blank')}
            className="inline-flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Abrir Upload en nueva ventana
          </Button>
        </div>
      );
    }

    if (currentSection === 'pnl') {
      return (
        <div className="text-center py-16">
          <PieChart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-4">Reportes P&L</h2>
          <p className="text-muted-foreground">
            Análisis de Profit & Loss próximamente
          </p>
        </div>
      );
    }

    // Dashboard main content
    return (
      <>
        {/* Cards de KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card Ventas */}
          <Card className="p-6 border-2">
            <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              💰 VENTAS HOY
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {ventasHoy}
            </div>
            <div className="text-sm text-green-600">
              ✅ En objetivo
            </div>
          </Card>

          {/* Card Food Cost */}
          <Card className="p-6 border-2">
            <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              🍕 FOOD COST
            </div>
            <div className="text-3xl font-bold mb-2" style={{ color: colorFood }}>
              {foodCost}
            </div>
            <div className="text-sm" style={{ color: colorFood }}>
              {parseFloat(foodCost) > 30 ? '⚠️ Por encima del objetivo' : '✅ En objetivo'}
            </div>
          </Card>

          {/* Card Transacciones */}
          <Card className="p-6 border-2">
            <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              🧾 TRANSACCIONES
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {transacciones}
            </div>
            <div className="text-sm text-muted-foreground">
              Tickets del día
            </div>
          </Card>

          {/* Card Ticket Promedio */}
          <Card className="p-6 border-2">
            <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              🎯 TICKET PROMEDIO
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {ticketPromedio}
            </div>
            <div className="text-sm text-muted-foreground">
              Por transacción
            </div>
          </Card>
        </div>

        {/* Alerta si food cost está alto */}
        {parseFloat(foodCost) > 30 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <div className="p-6">
              <div className="font-bold text-red-600 mb-2 flex items-center gap-2">
                ⚠️ Alerta: Food Cost Alto
              </div>
              <div className="text-red-700 text-sm">
                Tu food cost está en {foodCost}, el objetivo es mantenerlo por debajo del 30%.
                Revisa las compras recientes y ajusta porciones si es necesario.
              </div>
            </div>
          </Card>
        )}
      </>
    );
  };

  if (!tenant || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header 
        className="text-white p-6 shadow-lg"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              {tenant.name === 'Moyo' && '🍦'}
              {tenant.name === 'Nutrisa' && '🥗'}
              {tenant.name === 'Crepas' && '🥞'}
              {brandName}
            </h1>
            <p className="opacity-90 mt-1">
              Sucursal: {tenant.name} {userProfile.name && `• ${userProfile.name}`}
            </p>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={signOut}
            className="text-white hover:bg-white/20"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex gap-4">
          <Button
            variant={currentSection === 'dashboard' ? 'secondary' : 'ghost'}
            onClick={() => setCurrentSection('dashboard')}
            className={currentSection === 'dashboard' ? '' : 'text-white hover:bg-white/20'}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button
            variant={currentSection === 'upload' ? 'secondary' : 'ghost'}
            onClick={() => setCurrentSection('upload')}
            className={currentSection === 'upload' ? '' : 'text-white hover:bg-white/20'}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <Button
            variant={currentSection === 'pnl' ? 'secondary' : 'ghost'}
            onClick={() => setCurrentSection('pnl')}
            className={currentSection === 'pnl' ? '' : 'text-white hover:bg-white/20'}
          >
            <PieChart className="h-4 w-4 mr-2" />
            P&L
          </Button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {renderContent()}
        
        {currentSection === 'dashboard' && (
          <div className="flex justify-center">
            <Button 
              onClick={cargarDatos}
              size="lg"
              style={{ backgroundColor: primaryColor }}
              className="text-white hover:opacity-90"
            >
              🔄 Actualizar Datos
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};