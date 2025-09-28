import { useState, useEffect } from 'react';
import { StickyCTA } from '@/components/mobile/StickyCTA';
import { ListFormRow } from '@/components/mobile/ListFormRow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StoreSwitcher } from '@/components/ui/store-switcher';
import { useStoreSelection } from '@/hooks/useStoreSelection';
import { 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Copy,
  Calculator,
  TrendingUp,
  Calendar,
  Zap,
  Home,
  Users,
  Package
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { toast } from '@/hooks/use-toast';
import { formatCurrency, formatPercentage, PeriodData, calculatePnL } from '@/utils/calculations';

const DatosPage = () => {
  const { selectedStore, isConsolidatedView } = useStoreSelection();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [salesAmount, setSalesAmount] = useState('');
  const [uploadMode, setUploadMode] = useState<'amount' | 'csv'>('amount');
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Fixed costs state
  const [fixedCosts, setFixedCosts] = useState({
    rent: '',
    energy: '',
    payroll: '',
    other: ''
  });

  // Auto-calculated values (readonly)
  const autoCosts = {
    royalties_pct: 5.8,
    marketing_pct: 2.32,
    supervision_mxn: 8050
  };

  const salesMxn = parseFloat(salesAmount) || 0;
  const cogsMxn = salesMxn * 0.35; // 35% estimated COGS
  
  // Calculate P&L in real-time
  const periodData: PeriodData = {
    storeSlug: selectedStore?.code || 'demo',
    period: selectedMonth,
    sales_mxn: salesMxn,
    cogs_mxn: cogsMxn,
    fixed_costs: {
      rent: parseFloat(fixedCosts.rent) || 0,
      energy: parseFloat(fixedCosts.energy) || 0,
      payroll: parseFloat(fixedCosts.payroll) || 0,
      other: parseFloat(fixedCosts.other) || 0
    },
    auto_costs: autoCosts,
    meta_food_cost_target_pp: 32.0
  };

  const metrics = calculatePnL(periodData);

  // Auto-fill from previous month
  const duplicateLastMonth = () => {
    toast({
      title: "Datos del mes anterior copiados",
      description: "Se han prellenado los campos con los datos del mes anterior"
    });
    
    setSalesAmount('125000');
    setFixedCosts({
      rent: '25000',
      energy: '8500', 
      payroll: '35000',
      other: '5000'
    });
  };

  // Save data
  const handleSave = async () => {
    if (!salesAmount) {
      toast({
        title: "Error",
        description: "Por favor ingresa las ventas del mes",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaved(true);
    setLoading(false);
    
    toast({
      title: "Datos guardados correctamente",
      description: `P&L del mes ${selectedMonth} actualizado`
    });
  };

  // Update fixed cost
  const updateFixedCost = (category: keyof typeof fixedCosts, value: string) => {
    setFixedCosts(prev => ({
      ...prev,
      [category]: value
    }));
  };

  // Format month for display
  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('es-MX', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen">
      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="p-4 space-y-6 pb-32">
          {/* Step 1: Period Selection */}
          <div className="ios-list">
            <div className="ios-list-header">1. Período a Capturar</div>
            <div className="ios-list-item">
              <div className="flex items-center gap-3 w-full">
                <Calendar className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <Label htmlFor="month" className="text-sm font-medium">
                    Mes y año
                  </Label>
                  <Input
                    id="month"
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={duplicateLastMonth}
                  className="ml-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Step 2: Sales Input */}
          <div className="ios-list">
            <div className="ios-list-header">2. Ventas Totales</div>
            
            <div className="ios-list-item">
              <div className="flex items-center gap-3 w-full">
                <TrendingUp className="h-5 w-5 text-success" />
                <div className="flex-1">
                  <Label htmlFor="sales" className="text-sm font-medium">
                    Ventas del mes (MXN)
                  </Label>
                  <Input
                    id="sales"
                    type="number"
                    value={salesAmount}
                    onChange={(e) => setSalesAmount(e.target.value)}
                    placeholder="125,000"
                    className="mt-1 text-lg font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Fixed Costs - Only show if sales entered */}
          {salesMxn > 0 && (
            <div className="ios-list">
              <div className="ios-list-header">3. Gastos Fijos</div>
              
              <ListFormRow
                label="Renta"
                value={
                  <div className="flex items-center justify-between w-full">
                    <Input
                      type="number"
                      value={fixedCosts.rent}
                      onChange={(e) => updateFixedCost('rent', e.target.value)}
                      placeholder="25,000"
                      className="w-24 text-sm"
                    />
                    {fixedCosts.rent && (
                      <span className="text-xs text-muted-foreground">
                        {formatPercentage((parseFloat(fixedCosts.rent) / salesMxn) * 100)}
                      </span>
                    )}
                  </div>
                }
                rightElement={<Home className="h-4 w-4 text-muted-foreground" />}
                isEditable
              />

              <ListFormRow
                label="Energía y Servicios"
                value={
                  <div className="flex items-center justify-between w-full">
                    <Input
                      type="number"
                      value={fixedCosts.energy}
                      onChange={(e) => updateFixedCost('energy', e.target.value)}
                      placeholder="8,500"
                      className="w-24 text-sm"
                    />
                    {fixedCosts.energy && (
                      <span className="text-xs text-muted-foreground">
                        {formatPercentage((parseFloat(fixedCosts.energy) / salesMxn) * 100)}
                      </span>
                    )}
                  </div>
                }
                rightElement={<Zap className="h-4 w-4 text-muted-foreground" />}
                isEditable
              />

              <ListFormRow
                label="Nómina"
                value={
                  <div className="flex items-center justify-between w-full">
                    <Input
                      type="number"
                      value={fixedCosts.payroll}
                      onChange={(e) => updateFixedCost('payroll', e.target.value)}
                      placeholder="35,000"
                      className="w-24 text-sm"
                    />
                    {fixedCosts.payroll && (
                      <span className="text-xs text-muted-foreground">
                        {formatPercentage((parseFloat(fixedCosts.payroll) / salesMxn) * 100)}
                      </span>
                    )}
                  </div>
                }
                rightElement={<Users className="h-4 w-4 text-muted-foreground" />}
                isEditable
              />

              <ListFormRow
                label="Otros Gastos"
                value={
                  <div className="flex items-center justify-between w-full">
                    <Input
                      type="number"
                      value={fixedCosts.other}
                      onChange={(e) => updateFixedCost('other', e.target.value)}
                      placeholder="5,000"
                      className="w-24 text-sm"
                    />
                    {fixedCosts.other && (
                      <span className="text-xs text-muted-foreground">
                        {formatPercentage((parseFloat(fixedCosts.other) / salesMxn) * 100)}
                      </span>
                    )}
                  </div>
                }
                rightElement={<Package className="h-4 w-4 text-muted-foreground" />}
                isEditable
              />
            </div>
          )}

          {/* Step 4: Auto-calculated (Read-only) */}
          {salesMxn > 0 && (
            <div className="ios-list">
              <div className="ios-list-header">4. Gastos Automáticos</div>
              
              <ListFormRow
                label="COGS (Costo de Ventas)"
                value={
                  <div className="text-sm font-mono">
                    {formatCurrency(cogsMxn)} • {formatPercentage(35)}
                  </div>
                }
                rightElement={<Calculator className="h-4 w-4 text-success" />}
                isCalculated
              />

              <ListFormRow
                label="Regalías"
                value={
                  <div className="text-sm font-mono">
                    {formatCurrency((salesMxn * autoCosts.royalties_pct) / 100)} • {formatPercentage(autoCosts.royalties_pct)}
                  </div>
                }
                rightElement={<Calculator className="h-4 w-4 text-success" />}
                isCalculated
              />

              <ListFormRow
                label="Marketing"
                value={
                  <div className="text-sm font-mono">
                    {formatCurrency((salesMxn * autoCosts.marketing_pct) / 100)} • {formatPercentage(autoCosts.marketing_pct)}
                  </div>
                }
                rightElement={<Calculator className="h-4 w-4 text-success" />}
                isCalculated
              />

              <ListFormRow
                label="Supervisión"
                value={
                  <div className="text-sm font-mono">
                    {formatCurrency(autoCosts.supervision_mxn)} • {formatPercentage((autoCosts.supervision_mxn / salesMxn) * 100)}
                  </div>
                }
                rightElement={<Calculator className="h-4 w-4 text-success" />}
                isCalculated
              />
            </div>
          )}

          {/* P&L Preview */}
          {isSaved && salesMxn > 0 && (
            <div className="mobile-card border-success/50 bg-success/5 animate-slide-in">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-success" />
                <span className="text-lg font-bold text-success">P&L {formatMonth(selectedMonth)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="cost-metric cost-neutral">
                  <div className="text-xs text-muted-foreground">Ventas</div>
                  <div className="text-lg font-bold">{formatCurrency(salesMxn)}</div>
                </div>
                <div className="cost-metric cost-over">
                  <div className="text-xs text-muted-foreground">COGS</div>
                  <div className="text-lg font-bold">{formatCurrency(cogsMxn)}</div>
                </div>
              </div>
              
              <div className="cost-metric cost-saving">
                <div className="text-sm font-medium">EBITDA</div>
                <div className="text-2xl font-bold">{formatCurrency(metrics.ebitda_mxn)}</div>
                <div className="text-sm">{formatPercentage(metrics.ebitda_pct)}</div>
              </div>

              <div className="mt-3 p-3 bg-white/50 rounded-lg border">
                <div className="text-xs font-medium text-muted-foreground mb-1">Food Cost vs Meta</div>
                <div className={`text-sm font-bold ${
                  metrics.delta_vs_target_pp > 0 ? 'text-danger' : 'text-success'
                }`}>
                  {formatPercentage(metrics.food_cost_pct)} 
                  {metrics.delta_vs_target_pp > 0 ? ' (+' : ' ('}
                  {Math.abs(metrics.delta_vs_target_pp).toFixed(1)} pp vs meta)
                </div>
                <div className="text-xs text-muted-foreground">
                  Impacto: {formatCurrency(Math.abs(metrics.savings_or_loss_mxn))}/mes
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky CTA */}
        {salesMxn > 0 && !isSaved && (
          <StickyCTA
            onClick={handleSave}
            loading={loading}
            variant="success"
          >
            <CheckCircle className="inline h-5 w-5 mr-2" />
            Guardar y ver P&L
          </StickyCTA>
        )}

        {isSaved && (
          <StickyCTA
            onClick={() => {
              setIsSaved(false);
              setSalesAmount('');
              setFixedCosts({ rent: '', energy: '', payroll: '', other: '' });
              toast({
                title: "Listo para nuevo período",
                description: "Puedes capturar datos de otro mes"
              });
            }}
            variant="primary"
          >
            Capturar Nuevo Período
          </StickyCTA>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <AppLayout>
          <div className="container mx-auto max-w-4xl py-6 space-y-6">
            <div className="flex flex-col space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Cargar Datos</h1>
                  <p className="text-sm text-muted-foreground">
                    {isConsolidatedView 
                      ? 'Captura operativa simplificada - menos de 60 segundos'
                      : `Datos operativos - ${selectedStore?.name}`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop content would go here - simplified for now */}
            <Card>
              <CardHeader>
                <CardTitle>Período y Ventas</CardTitle>
                <CardDescription>
                  Selecciona el mes y captura las ventas totales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="desktop-month">Período</Label>
                    <Input
                      id="desktop-month"
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="desktop-sales">Ventas (MXN)</Label>
                    <Input
                      id="desktop-sales"
                      type="number"
                      value={salesAmount}
                      onChange={(e) => setSalesAmount(e.target.value)}
                      placeholder="125,000"
                    />
                  </div>
                </div>

                <Button onClick={duplicateLastMonth} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar mes anterior
                </Button>
              </CardContent>
            </Card>

            {salesMxn > 0 && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Gastos Fijos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Renta</Label>
                        <Input
                          type="number"
                          value={fixedCosts.rent}
                          onChange={(e) => updateFixedCost('rent', e.target.value)}
                          placeholder="25,000"
                        />
                      </div>
                      <div>
                        <Label>Energía</Label>
                        <Input
                          type="number"
                          value={fixedCosts.energy}
                          onChange={(e) => updateFixedCost('energy', e.target.value)}
                          placeholder="8,500"
                        />
                      </div>
                      <div>
                        <Label>Nómina</Label>
                        <Input
                          type="number"
                          value={fixedCosts.payroll}
                          onChange={(e) => updateFixedCost('payroll', e.target.value)}
                          placeholder="35,000"
                        />
                      </div>
                      <div>
                        <Label>Otros</Label>
                        <Input
                          type="number"
                          value={fixedCosts.other}
                          onChange={(e) => updateFixedCost('other', e.target.value)}
                          placeholder="5,000"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-center">
                  <Button
                    onClick={handleSave}
                    disabled={loading || isSaved}
                    size="lg"
                    className="px-8"
                  >
                    {loading ? (
                      <>Guardando...</>
                    ) : isSaved ? (
                      <>Datos Guardados</>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Guardar y ver P&L
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}

            {isSaved && salesMxn > 0 && (
              <Card className="border-success/50 bg-success/5">
                <CardHeader>
                  <CardTitle className="text-success">P&L {formatMonth(selectedMonth)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Ventas</div>
                      <div className="text-xl font-bold">{formatCurrency(salesMxn)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">COGS</div>
                      <div className="text-xl font-bold text-danger">-{formatCurrency(cogsMxn)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Food Cost %</div>
                      <div className={`text-xl font-bold ${
                        metrics.delta_vs_target_pp > 0 ? 'text-danger' : 'text-success'
                      }`}>
                        {formatPercentage(metrics.food_cost_pct)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">EBITDA</div>
                      <div className="text-xl font-bold text-success">{formatCurrency(metrics.ebitda_mxn)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </AppLayout>
      </div>
    </div>
  );
};

export default DatosPage;