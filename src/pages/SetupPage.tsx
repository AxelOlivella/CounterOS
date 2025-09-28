import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Store, User, Building } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function SetupPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    companyName: '',
    vertical: '',
  });

  const verticals = [
    { value: 'froyo', label: 'Yogurt Helado / Froyo' },
    { value: 'crepas', label: 'Crepería' },
    { value: 'sushi', label: 'Sushi' },
    { value: 'pizza', label: 'Pizzería' },
    { value: 'cafe', label: 'Café / Cafetería' },
    { value: 'other', label: 'Otro' }
  ];

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');

    try {
      const { error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            company_name: formData.companyName,
            vertical: formData.vertical
          }
        }
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      toast({
        title: "¡Cuenta creada!",
        description: "Tu demo está listo. Revisa tu email para confirmar tu cuenta.",
      });

      navigate('/onboarding');
    } catch (err) {
      setError('Error al crear la cuenta. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            {step === 1 ? <User className="h-6 w-6" /> : <Building className="h-6 w-6" />}
            Configurar CounterOS
          </CardTitle>
          <p className="text-muted-foreground">
            Paso {step} de 2: {step === 1 ? 'Tu cuenta' : 'Tu empresa'}
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tu nombre</Label>
                <Input
                  id="name"
                  placeholder="Nombre completo"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">Nombre de tu empresa</Label>
                <Input
                  id="company"
                  placeholder="Mi Restaurante S.A."
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de negocio</Label>
                <Select value={formData.vertical} onValueChange={(value) => setFormData({...formData, vertical: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu vertical" />
                  </SelectTrigger>
                  <SelectContent>
                    {verticals.map((vertical) => (
                      <SelectItem key={vertical.value} value={vertical.value}>
                        {vertical.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-6">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                Anterior
              </Button>
            )}
            {step < 2 ? (
              <Button onClick={handleNext} className="flex-1">
                Siguiente
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={loading} className="flex-1">
                {loading ? 'Creando...' : 'Crear Demo'}
              </Button>
            )}
          </div>

          <div className="text-center mt-4">
            <Link to="/" className="text-sm text-muted-foreground hover:underline">
              ← Volver al inicio
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SetupPage;