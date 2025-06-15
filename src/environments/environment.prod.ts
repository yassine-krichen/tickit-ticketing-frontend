// Extend the Window interface to include our environment configuration
declare const window: any;

export const environment = {
  production: (window && window.env && window.env.production) || true,
  apiUrl:
    (window && window.env && window.env.apiUrl) || 'http://localhost:8080',
};
