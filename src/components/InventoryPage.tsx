import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Search, 
  Plus, 
  FileDown,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Edit
} from 'lucide-react';

export const InventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const inventory = [
    {
      id: 1,
      code: 'YOG-BASE',
      name: 'Yogurt Natural Base',
      currentQty: 45.5,
      unit: 'kg',
      minLevel: 20,
      maxLevel: 100,
      lastCount: '2024-01-20',
      status: 'good',
      cost: 35.50
    },
    {
      id: 2,
      code: 'FRU-FRES',
      name: 'Fresas Congeladas',
      currentQty: 12.0,
      unit: 'kg',
      minLevel: 15,
      maxLevel: 50,
      lastCount: '2024-01-20',
      status: 'low',
      cost: 85.00
    },
    {
      id: 3,
      code: 'GRA-PREM',
      name: 'Granola Premium',
      currentQty: 28.5,
      unit: 'kg',
      minLevel: 10,
      maxLevel: 40,
      lastCount: '2024-01-19',
      status: 'good',
      cost: 125.00
    },
    {
      id: 4,
      code: 'MIE-ORG',
      name: 'Miel Orgánica',
      currentQty: 8.2,
      unit: 'L',
      minLevel: 5,
      maxLevel: 25,
      lastCount: '2024-01-18',
      status: 'good',
      cost: 180.00
    },
    {
      id: 5,
      code: 'CHO-COB',
      name: 'Chispas Chocolate',
      currentQty: 2.1,
      unit: 'kg',
      minLevel: 8,
      maxLevel: 30,
      lastCount: '2024-01-17',
      status: 'critical',
      cost: 95.00
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good':
        return <Badge className="bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20">Normal</Badge>;
      case 'low':
        return <Badge className="bg-[var(--warn)]/10 text-[var(--warn)] border-[var(--warn)]/20">Bajo</Badge>;
      case 'critical':
        return <Badge className="bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20">Crítico</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" />;
      case 'low':
        return <AlertTriangle className="w-4 h-4 text-[var(--warn)]" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-[var(--danger)]" />;
      default:
        return null;
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = inventory.reduce((sum, item) => sum + (item.currentQty * item.cost), 0);
  const lowStockItems = inventory.filter(item => item.status === 'low' || item.status === 'critical').length;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventario</h1>
          <p className="text-muted-foreground">
            Gestión de ingredientes y materias primas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileDown className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Importar CSV
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Conteo
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{inventory.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-[var(--warn)]" />
            <div>
              <p className="text-sm text-muted-foreground">Stock Bajo</p>
              <p className="text-2xl font-bold text-[var(--warn)]">{lowStockItems}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--accent)]/10 rounded-lg flex items-center justify-center">
              <span className="text-[var(--accent)] font-bold text-lg">$</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-[var(--accent)]" />
            <div>
              <p className="text-sm text-muted-foreground">Último Conteo</p>
              <p className="text-lg font-semibold">20 Ene</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nombre o código..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            Filtros
          </Button>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2">Estado</th>
                <th className="text-left py-3 px-2">Código</th>
                <th className="text-left py-3 px-2">Ingrediente</th>
                <th className="text-right py-3 px-2">Stock Actual</th>
                <th className="text-right py-3 px-2">Min/Max</th>
                <th className="text-right py-3 px-2">Costo Unit.</th>
                <th className="text-right py-3 px-2">Valor Total</th>
                <th className="text-center py-3 px-2">Último Conteo</th>
                <th className="text-center py-3 px-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      {getStatusBadge(item.status)}
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <code className="bg-muted px-2 py-1 rounded text-sm">
                      {item.code}
                    </code>
                  </td>
                  <td className="py-4 px-2 font-medium">
                    {item.name}
                  </td>
                  <td className="py-4 px-2 text-right">
                    <span className="font-semibold">{item.currentQty}</span>
                    <span className="text-muted-foreground ml-1">{item.unit}</span>
                  </td>
                  <td className="py-4 px-2 text-right text-sm text-muted-foreground">
                    {item.minLevel} - {item.maxLevel} {item.unit}
                  </td>
                  <td className="py-4 px-2 text-right">
                    ${item.cost}
                  </td>
                  <td className="py-4 px-2 text-right font-semibold">
                    ${(item.currentQty * item.cost).toFixed(2)}
                  </td>
                  <td className="py-4 px-2 text-center text-sm text-muted-foreground">
                    {item.lastCount}
                  </td>
                  <td className="py-4 px-2 text-center">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredInventory.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron ingredientes que coincidan con la búsqueda.
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[var(--warn)]" />
            Items con Stock Bajo
          </h3>
          <div className="space-y-2">
            {inventory.filter(item => item.status === 'low' || item.status === 'critical').map(item => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-sm text-muted-foreground">{item.currentQty} {item.unit}</span>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Acciones Rápidas</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Plus className="w-4 h-4 mr-2" />
              Registrar Entrada
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Package className="w-4 h-4 mr-2" />
              Nuevo Conteo Físico
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileDown className="w-4 h-4 mr-2" />
              Generar Reporte
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};