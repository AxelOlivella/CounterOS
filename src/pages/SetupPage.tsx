import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export const SetupPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();

  const createDemoUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-demo-users', {
        body: {}
      });

      if (error) throw error;

      setResults(data.results || []);
      toast({
        title: "Setup completado",
        description: "Los usuarios demo han sido configurados correctamente",
      });
    } catch (error: any) {
      console.error('Error creating demo users:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron crear los usuarios demo",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const manualInstructions = [
    { brand: 'Moyo', email: 'moyo@demo.com', password: 'demo123', color: 'hsl(var(--primary))' },
    { brand: 'Nutrisa', email: 'nutrisa@demo.com', password: 'demo123', color: 'hsl(var(--success))' },
    { brand: 'Crepas', email: 'crepas@demo.com', password: 'demo123', color: 'hsl(var(--warning))' }
  ];

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Setup CounterOS Multi-Tenant
          </h1>
          <p className="text-lg text-gray-600">
            Configuración inicial para el sistema multi-tenant con 3 marcas
          </p>
        </div>

        {/* Auto Setup */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Setup Automático</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Ejecuta la función para crear automáticamente las cuentas de usuario demo:
            </p>
            <Button 
              onClick={createDemoUsers}
              disabled={isLoading}
              className="mb-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando usuarios...
                </>
              ) : (
                'Crear Usuarios Demo'
              )}
            </Button>

            {results.length > 0 && (
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    {result.status === 'created' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : result.status === 'already_exists' ? (
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">
                      {result.email}: {result.status === 'created' ? 'Creado' : 
                       result.status === 'already_exists' ? 'Ya existe' : 'Error'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manual Instructions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Setup Manual (Alternativo)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Si el setup automático no funciona, puedes crear manualmente las cuentas en Supabase:
            </p>
            
            <div className="grid gap-4 md:grid-cols-3">
              {manualInstructions.map((brand, index) => (
                <Card key={index} className="border-2" style={{ borderColor: brand.color }}>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2" style={{ color: brand.color }}>
                      {brand.brand}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <div><strong>Email:</strong> {brand.email}</div>
                      <div><strong>Password:</strong> {brand.password}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Instrucciones:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Ve a tu dashboard de Supabase</li>
                <li>2. Sección Authentication → Users</li>
                <li>3. Click "Add user" para cada uno</li>
                <li>4. Usa los emails y passwords de arriba</li>
                <li>5. Marca "Auto Confirm User" para saltarte la verificación de email</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">✅ Completado:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Base de datos configurada</li>
                  <li>• 3 tenants creados (Moyo, Nutrisa, Crepas)</li>
                  <li>• Usuarios en tabla users</li>
                  <li>• Tiendas demo creadas</li>
                  <li>• Datos de ventas/compras demo</li>
                  <li>• Sistema multi-tenant funcional</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">🔄 Pendiente:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Crear cuentas Auth de Supabase</li>
                  <li>• Probar login con cada marca</li>
                  <li>• Verificar theming por tenant</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <a 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Ir al Sistema →
          </a>
        </div>
      </div>
    </div>
  );
};