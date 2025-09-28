import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, TrendingUp, DollarSign, Package, Snowflake, Coffee, Fish, Utensils } from 'lucide-react';

export const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [currentModule, setCurrentModule] = useState('FroyoOS');
  const [currentTenant, setCurrentTenant] = useState('MoyoOS');
  
  // CounterOS Modules Configuration
  const modules = {
    FroyoOS: {
      icon: Snowflake,
      color: 'purple',
      bgGradient: 'from-purple-50 to-blue-50',
      tenants: ['MoyoOS', 'NutrisaOS'],
      stores: 755 // 92 + 663
    },
    CrepasOS: {
      icon: Utensils,
      color: 'amber',
      bgGradient: 'from-amber-50 to-orange-50',
      tenants: ['LaCrepeParisienneOS', 'LaDivinaCrepaOS'],
      stores: 41
    },
    SushiOS: {
      icon: Fish,
      color: 'red',
      bgGradient: 'from-red-50 to-pink-50',
      tenants: ['SushiRollOS', 'SushiIttoOS'],
      stores: 235 // 150 + 85
    },
    CoffeeOS: {
      icon: Coffee,
      color: 'brown',
      bgGradient: 'from-yellow-50 to-amber-50',
      tenants: ['CielitoQueridoOS'],
      stores: 93
    }
  };

  // Demo data for current tenant (Moyo)
  const metrics = {
    system: 'CounterOS',
    module: currentModule,
    tenant: 'Moyo - Portal Centro',
    foodCost: 36.9,
    sales: 485230,
    tickets: 1247,
    laborCost: 18.2,
    wastage: 4.2
  };

  const currentModuleConfig = modules[currentModule];
  const ModuleIcon = currentModuleConfig.icon;
  const totalStores = Object.values(modules).reduce((sum, module) => sum + module.stores, 0);

  return (
    <div className={`p-6 space-y-6 bg-gradient-to-br ${currentModuleConfig.bgGradient} min-h-screen`}>
      {/* Header with Module Selector */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span className="font-bold text-gray-700">CounterOS™</span>
              <span>›</span>
              <select 
                value={currentModule}
                onChange={(e) => setCurrentModule(e.target.value)}
                className="font-semibold text-purple-600 bg-transparent border border-gray-200 rounded px-2 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="FroyoOS">FroyoOS</option>
                <option value="CrepasOS">CrepasOS</option>
                <option value="SushiOS">SushiOS</option>
                <option value="CoffeeOS">CoffeeOS</option>
              </select>
              <span>›</span>
              <select 
                value={currentTenant}
                onChange={(e) => setCurrentTenant(e.target.value)}
                className="text-purple-700 bg-transparent border border-gray-200 rounded px-2 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {currentModuleConfig.tenants.map(tenant => (
                  <option key={tenant} value={tenant}>{tenant}</option>
                ))}
              </select>
            </div>
            
            {/* Main Title */}
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ModuleIcon className="h-8 w-8 text-purple-500" />
              Dashboard Operativo - {currentModule}
            </h1>
            <p className="text-gray-600 mt-1">Portal Centro, Hermosillo • {currentTenant}</p>
          </div>
          
          {/* Module Quick Switcher */}
          <div className="flex gap-2">
            {Object.entries(modules).map(([moduleName, config]) => {
              const Icon = config.icon;
              return (
                <button
                  key={moduleName}
                  onClick={() => setCurrentModule(moduleName)}
                  className={`p-3 rounded-lg transition-all ${
                    currentModule === moduleName 
                      ? 'bg-purple-100 text-purple-700 shadow-md'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  title={moduleName}
                >
                  <Icon className="h-5 w-5" />
                  <div className="text-xs mt-1">{config.stores}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Food Cost - CRITICAL */}
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

        {/* Sales */}
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

        {/* Tickets */}
        <Card className="bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              Tickets
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.tickets}</div>
            <p className="text-xs text-gray-500">Promedio: $389</p>
          </CardContent>
        </Card>

        {/* Labor Cost */}
        <Card className="bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              Labor Cost
              <Package className="h-4 w-4 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.laborCost}%</div>
            <p className="text-xs text-green-500">✓ En objetivo</p>
          </CardContent>
        </Card>

        {/* Wastage */}
        <Card className="bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              Merma
              <Snowflake className="h-4 w-4 text-orange-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.wastage}%</div>
            <p className="text-xs text-orange-500">Objetivo: &lt;3%</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alert */}
      <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-lg shadow">
        <div className="flex">
          <AlertCircle className="h-6 w-6 text-red-400 mt-1 flex-shrink-0" />
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-bold text-red-800">
              ALERTA CRÍTICA: Food Cost fuera de control
            </h3>
            <div className="mt-2 text-sm text-red-700 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="font-semibold">Actual vs Objetivo</p>
                <p>{metrics.foodCost}% vs 30%</p>
              </div>
              <div>
                <p className="font-semibold">Pérdida Diaria</p>
                <p>${Math.round(metrics.sales * 0.069).toLocaleString('es-MX')}</p>
              </div>
              <div>
                <p className="font-semibold">Pérdida Mensual Proyectada</p>
                <p>${Math.round(metrics.sales * 0.069 * 30).toLocaleString('es-MX')}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button variant="destructive" size="sm">
                Ver análisis detallado
              </Button>
              <Button variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                Descargar reporte
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Module-Specific Actions */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">Acciones Rápidas - {currentModule}</h3>
        <div className="grid gap-3 md:grid-cols-5">
          <button className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <Package className="h-5 w-5 text-purple-600 mx-auto mb-1" />
            <p className="text-xs">Subir Facturas</p>
          </button>
          <button className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <TrendingUp className="h-5 w-5 text-gray-600 mx-auto mb-1" />
            <p className="text-xs">Tendencias</p>
          </button>
          <button className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <DollarSign className="h-5 w-5 text-gray-600 mx-auto mb-1" />
            <p className="text-xs">P&L</p>
          </button>
          <button className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <ModuleIcon className="h-5 w-5 text-gray-600 mx-auto mb-1" />
            <p className="text-xs">Config {currentModule}</p>
          </button>
          <button className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <AlertCircle className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xs">Alertas</p>
          </button>
        </div>
      </div>

      {/* System Stats Bar */}
      <div className="bg-primary text-primary-foreground rounded-lg p-3 text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div className="flex flex-wrap gap-4">
          <span className="font-semibold">CounterOS™ v1.0.0</span>
          <span className="text-purple-400">{currentModule} Active</span>
          <span>{currentTenant} • Portal Centro</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <span>{totalStores} tiendas totales</span>
          <span>{Object.keys(modules).length} módulos activos</span>
          <span className="text-green-400 flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            Online
          </span>
        </div>
      </div>
    </div>
  );
};