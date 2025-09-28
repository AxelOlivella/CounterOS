import { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface EnvGuardProps {
  children: ReactNode;
  requiredEnvVars?: string[];
}

const checkEnvVar = (varName: string): boolean => {
  return Boolean(import.meta.env[varName]);
};

export function EnvGuard({ children, requiredEnvVars = [] }: EnvGuardProps) {
  // Default required environment variables for CounterOS
  const defaultRequired = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  const varsToCheck = requiredEnvVars.length > 0 ? requiredEnvVars : defaultRequired;
  const missingVars = varsToCheck.filter(varName => !checkEnvVar(varName));

  if (missingVars.length > 0 && import.meta.env.DEV) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
          <h2 className="text-xl-custom mb-2">Configuración Faltante</h2>
          <p className="text-body text-muted-foreground mb-4">
            Las siguientes variables de entorno son requeridas:
          </p>
          <ul className="text-sm text-left bg-muted rounded-lg p-4 mb-6">
            {missingVars.map(varName => (
              <li key={varName} className="font-mono text-foreground">
                • {varName}
              </li>
            ))}
          </ul>
          <p className="text-caption text-muted-foreground">
            Configura estas variables en tu archivo .env para continuar.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}