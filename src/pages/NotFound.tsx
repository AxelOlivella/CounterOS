import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Log 404 for analytics - OBLIGATORY logging
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    
    // Optional: Send to analytics service
    // analytics.track('404_error', { path: location.pathname, timestamp: new Date().toISOString() });
  }, [location.pathname]);

  const handleGoHome = () => {
    navigate('/resumen', { replace: true });
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/resumen', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-border bg-card shadow-lg">
        <CardContent className="p-8 text-center">
          {/* Error Icon */}
          <div className="error-state-icon mx-auto mb-6">
            <AlertTriangle className="h-16 w-16 text-warning" />
          </div>

          {/* Error Content */}
          <h1 className="text-display font-bold text-foreground mb-4">
            404
          </h1>
          
          <h2 className="error-state-title mb-4">
            Página no encontrada
          </h2>
          
          <p className="error-state-description mb-8">
            La página que buscas no existe o fue movida. 
            Verifica la URL o regresa al panel principal.
          </p>

          {/* Debug Info - Only show pathname for context */}
          <div className="mb-6 p-3 bg-muted/50 rounded-lg border border-border">
            <p className="text-caption text-muted-foreground">
              Ruta solicitada: <code className="font-mono text-foreground">{location.pathname}</code>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleGoHome}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2"
              size="lg"
            >
              <Home className="h-4 w-4" />
              Ir al Panel Principal
            </Button>
            
            <Button 
              onClick={handleGoBack}
              variant="outline"
              className="w-full border-border hover:bg-muted gap-2"
              size="lg"
            >
              <ArrowLeft className="h-4 w-4" />
              Regresar
            </Button>
          </div>

          {/* Help Text */}
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-caption text-muted-foreground">
              ¿Necesitas ayuda? Contacta a{" "}
              <a 
                href="mailto:soporte@counteros.com"
                className="text-primary hover:text-primary/80 underline underline-offset-2"
              >
                soporte@counteros.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;