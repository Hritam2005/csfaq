export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || '/api/v1',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || '/',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Enterprise AI Knowledge Hub',
  DEFAULT_THEME: import.meta.env.VITE_DEFAULT_THEME || 'system', // system | light | dark

  // Query Triage microservice.
  // In dev we call the backend directly on port 5001 so CORS handling and
  // cookies behave predictably. In production both can share the same
  // gateway/reverse proxy, in which case override with VITE_TRIAGE_URL.
  TRIAGE_URL:
    import.meta.env.VITE_TRIAGE_URL || 'http://localhost:5001/api/v1',
  TRIAGE_SOCKET_URL:
    import.meta.env.VITE_TRIAGE_SOCKET_URL || 'http://localhost:5001',
  TRIAGE_PROGRAM_ID: import.meta.env.VITE_TRIAGE_PROGRAM_ID || 'prog_cs_2026',
};
