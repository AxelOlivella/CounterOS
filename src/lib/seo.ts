// SEO Utilities for CounterOS

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  structuredData?: object;
}

// Update document head with SEO metadata
export function updateSEOTags(config: SEOConfig) {
  // Title
  document.title = config.title.length > 60 ? 
    config.title.substring(0, 57) + '...' : 
    config.title;

  // Meta description
  const metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement;
  if (metaDescription) {
    metaDescription.content = config.description.length > 160 ?
      config.description.substring(0, 157) + '...' :
      config.description;
  }

  // Keywords
  if (config.keywords && config.keywords.length > 0) {
    const metaKeywords = document.querySelector('meta[name="keywords"]') as HTMLMetaElement;
    if (metaKeywords) {
      metaKeywords.content = config.keywords.join(', ');
    }
  }

  // Canonical URL
  if (config.canonical) {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = config.canonical;
  }

  // Open Graph
  updateOpenGraphTags(config);

  // Structured Data
  if (config.structuredData) {
    updateStructuredData(config.structuredData);
  }
}

// Update Open Graph meta tags
function updateOpenGraphTags(config: SEOConfig) {
  const ogTags = [
    { property: 'og:title', content: config.title },
    { property: 'og:description', content: config.description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: config.canonical || window.location.href }
  ];

  if (config.ogImage) {
    ogTags.push({ property: 'og:image', content: config.ogImage });
  }

  ogTags.forEach(tag => {
    let metaTag = document.querySelector(`meta[property="${tag.property}"]`) as HTMLMetaElement;
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('property', tag.property);
      document.head.appendChild(metaTag);
    }
    metaTag.content = tag.content;
  });
}

// Update structured data (JSON-LD)
function updateStructuredData(data: object) {
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

// Generate structured data for different page types
export const structuredDataTemplates = {
  organization: (name: string, url: string) => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": name,
    "url": url,
    "logo": `${url}/logo.png`,
    "description": "Plataforma de control de costos para restaurantes",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+52-1-800-COUNTER",
      "contactType": "customer service"
    }
  }),

  breadcrumbs: (items: Array<{ name: string; url: string }>) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }),

  software: (name: string, description: string) => ({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": name,
    "description": description,
    "applicationCategory": "Business Software",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "MXN"
    }
  })
};

// Page-specific SEO configurations
export const seoConfigs = {
  home: {
    title: "CounterOS - Control Total de Costos para Restaurantes",
    description: "Reduce costos operativos hasta 15% con CounterOS. Control automático de food cost, inventarios y P&L en tiempo real.",
    keywords: ["control costos restaurante", "food cost", "software restaurante", "pnl restaurante"]
  },

  tiendas: {
    title: "Gestión de Tiendas - CounterOS",
    description: "Administra todas tus ubicaciones desde un panel central. Monitoreo en tiempo real de métricas clave por tienda.",
    keywords: ["gestión tiendas", "multi ubicación", "dashboard restaurante"]
  },

  cargar: {
    title: "Cargar Datos - CounterOS",
    description: "Captura rápida de ventas y gastos en menos de 60 segundos. Genera automáticamente tu P&L mensual.",
    keywords: ["cargar datos restaurante", "pnl automatico", "ventas restaurante"]
  },

  alertas: {
    title: "Centro de Alertas - CounterOS", 
    description: "Recibe notificaciones automáticas cuando tus costos se desvían. Actúa rápido para proteger tu rentabilidad.",
    keywords: ["alertas costos", "notificaciones restaurante", "control automático"]
  }
};