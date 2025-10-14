import GlassCard from '@/components/ui/GlassCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BrandManagement from './BrandManagement';
import CreateCorporateForm from './CreateCorporateForm';
import BulkImportPanel from './BulkImportPanel';
import SetupWizard from './SetupWizard';

export default function AdminPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">🔧 Panel de Administración</h1>
        <p className="text-muted-foreground">
          Herramientas para onboardear clientes enterprise (100+ tiendas)
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="wizard">🪄 Setup Wizard</TabsTrigger>
          <TabsTrigger value="hierarchy">🏢 Jerarquía</TabsTrigger>
          <TabsTrigger value="import">📦 Importación</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">Arquitectura Enterprise</h2>
            <div className="space-y-4">
              <div className="p-4 bg-background/5 rounded-lg border border-border">
                <h3 className="font-medium mb-2">Estructura Jerárquica</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  CounterOS soporta la estructura real de grupos empresariales mexicanos:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-primary">1.</span>
                    <span className="font-medium">Corporate</span>
                    <span className="text-muted-foreground">→ Grupo económico</span>
                  </div>
                  <div className="flex items-center gap-2 pl-4">
                    <span className="text-primary">2.</span>
                    <span className="font-medium">Legal Entity</span>
                    <span className="text-muted-foreground">→ Razón social (RFC)</span>
                  </div>
                  <div className="flex items-center gap-2 pl-8">
                    <span className="text-primary">3.</span>
                    <span className="font-medium">Brand</span>
                    <span className="text-muted-foreground">→ Marca comercial (concepto)</span>
                  </div>
                  <div className="flex items-center gap-2 pl-12">
                    <span className="text-primary">4.</span>
                    <span className="font-medium">Store</span>
                    <span className="text-muted-foreground">→ Punto de venta</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-background/5 rounded-lg border border-border">
                <h3 className="font-medium mb-2">Ejemplo Real: Grupo MYT</h3>
                <div className="space-y-2 text-sm">
                  <div>📊 <strong>Grupo MYT</strong> (Corporate)</div>
                  <div className="pl-4">
                    📄 RFC: MYT123456 (Legal Entity)
                    <div className="pl-4 space-y-1">
                      <div>🏷️ Moshi Moshi (sushi) → 30 tiendas</div>
                      <div>🏷️ La Crêpe Parisienne (crepas) → 25 tiendas</div>
                    </div>
                  </div>
                  <div className="pl-4">
                    📄 RFC: MYT789012 (Legal Entity)
                    <div className="pl-4">
                      <div>🏷️ Toshi (café) → 15 tiendas</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                <h3 className="font-medium mb-2 text-accent">✅ Sistema Activado</h3>
                <p className="text-sm text-muted-foreground">
                  La arquitectura enterprise está completamente implementada y lista para usar.
                  Usa las pestañas de arriba para gestionar la jerarquía e importar datos.
                </p>
              </div>
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="wizard" className="mt-6">
          <GlassCard className="p-6">
            <SetupWizard />
          </GlassCard>
        </TabsContent>

        <TabsContent value="hierarchy" className="mt-6">
          <GlassCard className="p-6">
            <Tabs defaultValue="brands" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="brands">🏷️ Marcas</TabsTrigger>
                <TabsTrigger value="corporate">🏢 Corporativo</TabsTrigger>
              </TabsList>

              <TabsContent value="brands" className="mt-6">
                <BrandManagement />
              </TabsContent>

              <TabsContent value="corporate" className="mt-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Crear Nuevo Corporativo</h3>
                  <CreateCorporateForm />
                </div>
              </TabsContent>
            </Tabs>
          </GlassCard>
        </TabsContent>

        <TabsContent value="import" className="mt-6">
          <GlassCard className="p-6">
            <BulkImportPanel />
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
