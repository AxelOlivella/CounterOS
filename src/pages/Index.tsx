import { useTenant } from '@/contexts/TenantContext';
import { AuthPage } from '@/components/auth/AuthPage';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/components/pages/DashboardPage';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useTenant();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <AppLayout>
      <DashboardPage />
    </AppLayout>
  );
};

export default Index;
