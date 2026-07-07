export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || '/api/v1',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || '/',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Enterprise AI Knowledge Hub',
  DEFAULT_THEME: import.meta.env.VITE_DEFAULT_THEME || 'system', // system | light | dark
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '140697691772-7elssk993d5t1k73lqspi9j0f218e1h3.apps.googleusercontent.com',
};
