import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, TrendingUp, DollarSign, Package, Snowflake } from 'lucide-react';

export const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('MoyoOS');
  
  // Demo data for Moyo - Portal Centro
  const metrics = {
    system: 'CounterOS',
    subsystem: 'FroyoOS',
    tenant: 'MoyoOS - Portal Centro',
    foodCost: 36.9,
    sales: 485230,
    tickets: 1247,
    laborCost: 18.2,
    wastage: 4.2
  };

  // Theme colors for MoyoOS (frozen yogurt theme)
  const themeColors = {
    primary: 'purple',
    alert: 'red',
    success: 'green',
    info: 'blue'
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
      {/* Header with System Hierarchy */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <span className="font-semibold">CounterOS</span>
              <span>›</span>
              <span>FroyoOS</span>
              <span>›</span>
              <span className="text-purple-600">MoyoOS</span>
            </div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Snowflake className="h-8 w-8 text-purple-500" />
              Dashboard Operativo - Moyo
            </h1>
            <p className="text-gray-600 mt-1">Portal Centro, Hermosillo</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('es-MX', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Sistema: {metrics.system} v1.0
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Food Cost Card - ALERT */}
        <Card className="border-red-500 border-2 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              Food Cost
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.foodCost}%</div>
            <p className="text-xs text-red-500">⚠️ +6.9% sobre objetivo</p>
          </CardContent>
        </Card>

        {/* Sales Card */}
        <Card className="bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              Ventas Hoy
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${metrics.sales.toLocaleString('es-MX')}
            </div>
            <p className="text-xs text-gray-500">Meta: $450,000</p>
          </CardContent>
        </Card>

        {/* Tickets Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              Tickets
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.tickets}</div>
            <p className="text-xs text-gray-500">Ticket promedio: $389</p>
          </CardContent>
        </Card>

        {/* Labor Cost Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              Labor Cost
              <Package className="h-4 w-4 text-purple-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.laborCost}%</div>
            <p className="text-xs text-green-500">✓ En objetivo</p>
          </CardContent>
        </Card>

        {/* Wastage Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              Merma
              <Snowflake className="h-4 w-4 text-purple-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.wastage}%</div>
            <p className="text-xs text-orange-500">Objetivo: &lt;3%</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alert Banner */}
      <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-lg shadow">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-6 w-6 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-bold text-red-800">
              ALERTA CRÍTICA: Food Cost fuera de control
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>• Food Cost actual: {metrics.foodCost}% (Objetivo: 30%)</p>
              <p>• Pérdida diaria estimada: ${Math.round(metrics.sales * 0.069).toLocaleString('es-MX')} MXN</p>
              <p>• Pérdida mensual proyectada: ${Math.round(metrics.sales * 0.069 * 30).toLocaleString('es-MX')} MXN</p>
            </div>
            <div className="mt-4 flex gap-3">
              <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                Ver análisis detallado
              </button>
              <button className="px-3 py-1 border border-red-600 text-red-600 rounded text-sm hover:bg-red-50">
                Descargar reporte
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-xl transition-shadow cursor-pointer bg-white">
          <CardContent className="p-6 text-center">
            <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <Package className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-semibold">Subir Facturas</h3>
            <p className="text-sm text-gray-600">XML / CSV</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow cursor-pointer bg-white">
          <CardContent className="p-6 text-center">
            <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold">Tendencias</h3>
            <p className="text-sm text-gray-600">30 días</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow cursor-pointer bg-white">
          <CardContent className="p-6 text-center">
            <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold">P&L Mensual</h3>
            <p className="text-sm text-gray-600">Exportar</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow cursor-pointer bg-white">
          <CardContent className="p-6 text-center">
            <div className="bg-orange-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <Snowflake className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="font-semibold">Cambiar a Nutrisa</h3>
            <p className="text-sm text-gray-600">NutrisaOS</p>
          </CardContent>
        </Card>
      </div>

      {/* Footer with system info */}
      <div className="text-center text-xs text-gray-500 mt-8">
        CounterOS™ • FroyoOS Module • MoyoOS Theme Active • Portal Centro Branch
      </div>
    </div>
  );
};