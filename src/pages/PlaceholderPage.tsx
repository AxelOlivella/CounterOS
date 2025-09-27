import { AppLayout } from '@/components/layout/AppLayout';

interface PlaceholderPageProps {
  title: string;
  message: string;
}

const PlaceholderPage = ({ title, message }: PlaceholderPageProps) => {
  return (
    <AppLayout>
      <div className="container mx-auto max-w-4xl py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {title}
          </h1>
          <p className="text-muted-foreground text-lg">
            {message}
          </p>
          <div className="mt-8 p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Esta funcionalidad estará disponible próximamente
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PlaceholderPage;