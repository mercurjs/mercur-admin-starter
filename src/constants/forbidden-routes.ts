export const forbiddenRoutes = [
  '/products',
  '/products/:id',
  '/product-categories',
  '/product-categories',
  '/orders',
  '/orders/:id',
  '/customers',
  '/customers/:id',
  '/customers/groups',
  '/customers/groups/:id',
  '/discounts',
  '/discounts/new',
  '/discounts/:id',
  '/gift-cards',
  '/gift-cards/:id',
  '/gift-cards/manage',
  '/pricing',
  '/pricing/new',
  '/pricing/:id',
  '/inventory',
  '/collections',
  '/collections/:id',
  '/draft-orders',
  '/draft-orders/:id',
  '/login',
  '/sales-channels',
  '/publishable-api-keys',
  '/oauth',
  '/oauth/:app_name',
] as const;

export const isSettingsRoute = (route: string) => {
  return route.startsWith('/settings');
};

export const isForbiddenRoute = (route: any): boolean => {
  if (isSettingsRoute(route)) {
    return true;
  }

  return false;
};
