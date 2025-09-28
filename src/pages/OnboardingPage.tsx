import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Upload, BarChart3, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    {
      title: "¡Bienvenido a CounterOS!",
      description: "Tu sistema operativo para maximizar la rentabilidad",
      icon: <CheckCircle2 className="h-12 w-12 text-green-500" />,
      content: (
        <p className="text-muted-foreground text-center">
          CounterOS te ayuda a controlar costos, generar P&L automáticos 
          y recibir alertas inteligentes.
        </p>
      )
    },
    {
      title: "Carga tus datos",
      description: "Sube ventas y gastos para comenzar",
      icon: <Upload className="h-12 w-12 text-blue-500" />,
      content: (
        <ul className="text-sm space-y-2">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            CSV de ventas diarias (POS)
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            CSV de gastos mensuales
          </li>
        </ul>
      )
    },
    {
      title: "Analiza tus KPIs",
      description: "Monitorea food cost y P&L en tiempo real",
      icon: <BarChart3 className="h-12 w-12 text-purple-500" />,
      content: (
        <ul className="text-sm space-y-2">
          <li className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            Food cost vs. meta
          </li>
          <li className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            P&L automático
          </li>
        </ul>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/resumen');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          {steps[currentStep].icon}
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <p className="text-muted-foreground">{steps[currentStep].description}</p>
        </CardHeader>
        <CardContent>
          {steps[currentStep].content}

          <div className="flex justify-center space-x-2 mt-8 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/resumen')} className="flex-1">
              Saltar
            </Button>
            <Button onClick={handleNext} className="flex-1">
              {currentStep === steps.length - 1 ? 'Comenzar' : 'Siguiente'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OnboardingPage;