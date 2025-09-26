import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface UploadStats {
  todayFiles: number;
  todayRecords: number;
  recentErrors: number;
  successRate: number;
}

export const UploadStats = () => {
  const { userProfile } = useTenant();
  const [stats, setStats] = useState<UploadStats>({
    todayFiles: 0,
    todayRecords: 0,
    recentErrors: 0,
    successRate: 100
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.tenant_id) {
      fetchUploadStats();
    }
  }, [userProfile]);

  const fetchUploadStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's file uploads
      const { data: files, error: filesError } = await supabase
        .from('files')
        .select('*')
        .eq('tenant_id', userProfile!.tenant_id)
        .gte('uploaded_at', `${today}T00:00:00.000Z`)
        .lt('uploaded_at', `${today}T23:59:59.999Z`);

      if (filesError) throw filesError;

      // Calculate stats
      const todayFiles = files?.length || 0;
      const processedFiles = files?.filter(f => f.processed) || [];
      const errorFiles = files?.filter(f => f.error) || [];
      
      // Get record counts from recent sales/purchases
      const { data: salesData } = await supabase
        .from('daily_sales')
        .select('id')
        .eq('tenant_id', userProfile!.tenant_id)
        .gte('created_at', `${today}T00:00:00.000Z`);
        
      const { data: purchasesData } = await supabase
        .from('purchases')
        .select('id')
        .eq('tenant_id', userProfile!.tenant_id)
        .gte('created_at', `${today}T00:00:00.000Z`);

      const todayRecords = (salesData?.length || 0) + (purchasesData?.length || 0);
      const successRate = todayFiles > 0 ? ((processedFiles.length / todayFiles) * 100) : 100;

      setStats({
        todayFiles,
        todayRecords,
        recentErrors: errorFiles.length,
        successRate: Math.round(successRate)
      });

    } catch (error) {
      console.error('Error fetching upload stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas de Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Estadísticas de Upload
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
              <FileText className="h-5 w-5" />
              {stats.todayFiles}
            </div>
            <div className="text-sm text-muted-foreground">Archivos hoy</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
              <TrendingUp className="h-5 w-5" />
              {stats.todayRecords}
            </div>
            <div className="text-sm text-muted-foreground">Registros procesados</div>
          </div>
          
          <div>
            <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${
              stats.recentErrors > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {stats.recentErrors > 0 ? (
                <AlertCircle className="h-5 w-5" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              {stats.recentErrors}
            </div>
            <div className="text-sm text-muted-foreground">Errores recientes</div>
          </div>
          
          <div>
            <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${
              stats.successRate >= 90 ? 'text-green-600' : 
              stats.successRate >= 70 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              <TrendingUp className="h-5 w-5" />
              {stats.successRate}%
            </div>
            <div className="text-sm text-muted-foreground">Tasa de éxito</div>
          </div>
        </div>

        {stats.recentErrors > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Hay {stats.recentErrors} archivos con errores recientes</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};