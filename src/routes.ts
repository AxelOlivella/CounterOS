// Centralized routing configuration for CounterOS
// Mobile-first multi-tenant SaaS navigation

export const routes = {
  home: '/',
  stores: '/tiendas',
  store: (slug: string) => `/tiendas/${slug}`,
  upload: '/cargar',
  alerts: '/alertas',
  notFound: '/404',
} as const;

// Store slugs for consistent naming
export const STORES = [
  { name: 'Portal Centro', slug: 'portal-centro' },
  { name: 'Plaza Norte', slug: 'plaza-norte' },
  { name: 'Crepas OS', slug: 'crepas-os' },
] as const;

export type StoreSlug = typeof STORES[number]['slug'];

// Helper to get store name from slug
export const getStoreName = (slug: string): string => {
  const store = STORES.find(s => s.slug === slug);
  return store?.name || slug;
};

// Helper to validate store slug
export const isValidStoreSlug = (slug: string): slug is StoreSlug => {
  return STORES.some(s => s.slug === slug);
};