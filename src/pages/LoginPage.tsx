import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Authenticate user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Get user profile to determine tenant
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select(`
            *,
            tenants!inner(*)
          `)
          .eq('email', authData.user.email)
          .single();

        if (profileError) throw profileError;

        if (userProfile) {
          // Store tenant info in localStorage for quick access
          localStorage.setItem('tenant_info', JSON.stringify({
            id: userProfile.tenants.id,
            name: userProfile.tenants.name,
            theme: userProfile.tenants.theme
          }));

          // Redirect to dashboard
          navigate('/dashboard');
        } else {
          throw new Error('No se encontró información del usuario');
        }
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: 'Error de acceso',
        description: error.message || 'No se pudo iniciar sesión',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="w-full max-w-md">
        {/* Back to home */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary">CounterOS</CardTitle>
            <CardDescription className="text-lg">
              Accede a tu dashboard personalizado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Acceder'
                )}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-8 p-4 bg-muted rounded-lg">
              <h4 className="font-medium text-sm mb-3 text-center">Credenciales de Demo</h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-purple-600">Moyo:</span>
                  <span className="text-muted-foreground">demo@moyo.com / demo123</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-green-600">Nutrisa:</span>
                  <span className="text-muted-foreground">demo@nutrisa.com / demo123</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-orange-600">Crepas:</span>
                  <span className="text-muted-foreground">demo@crepas.com / demo123</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};