export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const savedUrl = localStorage.getItem('zs_admin_api_url');
    if (savedUrl) return savedUrl;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};

export const setApiBaseUrl = (url: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('zs_admin_api_url', url);
  }
};

export const resetApiBaseUrl = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('zs_admin_api_url');
  }
};
