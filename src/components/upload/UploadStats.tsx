import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface UploadStatsProps {
  refreshTrigger?: number;
}

export const UploadStats = ({ refreshTrigger }: UploadStatsProps) => {
  // Mock stats for demonstration
  const [stats] = useState({
    todayFiles: 5,
    todayRecords: 142,
    recentErrors: 1,
    successRate: 85,
  });

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