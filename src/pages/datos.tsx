import { AppLayout } from '@/components/layout/AppLayout';

const DatosPageStub = () => {
  return (
    <AppLayout>
      <div className="container mx-auto max-w-4xl py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Gestión de Datos
          </h1>
          <p className="text-muted-foreground text-lg">
            Stub auditoría - Vista de carga y gestión de datos
          </p>
          <div className="mt-8 p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Página stub creada durante auditoría funcional
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DatosPageStub;