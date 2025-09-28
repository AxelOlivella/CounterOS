// 404 Not Found Page
// Custom error page with clear navigation back to app

import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, MapPin } from 'lucide-react';
import { routes } from '@/routes';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Illustration */}
        <div className="w-24 h-24 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <MapPin className="h-12 w-12 text-navy-500" />
        </div>

        {/* Error Code */}
        <div className="text-6xl font-bold text-navy-600 mb-2">404</div>
        
        {/* Title */}
        <h1 className="text-xl-custom font-semibold text-navy-700 mb-3">
          Página no encontrada
        </h1>

        {/* Description */}
        <p className="text-body text-gray-600 mb-8 leading-relaxed">
          La página que buscas no existe o ha sido movida. 
          Verifica la URL o regresa al panel principal.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          {/* Primary Action */}
          <button
            onClick={() => navigate(routes.home)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent-500 text-white font-medium rounded-lg hover:bg-accent-600 transition-colors focus:outline-none focus:ring-4 focus:ring-accent-300"
          >
            <Home className="h-4 w-4" />
            Volver al Resumen
          </button>

          {/* Secondary Action */}
          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Página anterior
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-caption text-gray-500">
            ¿Necesitas ayuda? Contacta soporte o{' '}
            <button
              onClick={() => navigate(routes.stores)}
              className="text-accent-600 hover:text-accent-700 underline focus:outline-none"
            >
              explora tus tiendas
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}