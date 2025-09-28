import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { updateSEOTags, seoConfigs, structuredDataTemplates } from '@/lib/seo';

interface UseSEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
}

export function useSEO(config?: UseSEOProps) {
  const location = useLocation();

  useEffect(() => {
    // Get default config based on route
    const routeKey = location.pathname.slice(1) || 'home';
    const defaultConfig = seoConfigs[routeKey as keyof typeof seoConfigs] || seoConfigs.home;

    // Merge with provided config
    const finalConfig = {
      ...defaultConfig,
      ...config,
      canonical: config?.canonical || `${window.location.origin}${location.pathname}`
    };

    // Add structured data
    const structuredData = structuredDataTemplates.organization(
      'CounterOS',
      window.location.origin
    );

    updateSEOTags({
      ...finalConfig,
      structuredData
    });
  }, [location.pathname, config]);
}

// Hook for dynamic page titles
export function usePageTitle(title: string, suffix = ' - CounterOS') {
  useEffect(() => {
    const fullTitle = title + suffix;
    document.title = fullTitle.length > 60 ? 
      fullTitle.substring(0, 57) + '...' : 
      fullTitle;
  }, [title, suffix]);
}