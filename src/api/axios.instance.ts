import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

let accessToken: string | null = null;

export const tokenUtils = {
  get:   ()          => accessToken,
  set:   (t: string) => { accessToken = t; },
  clear: ()          => { accessToken = null; },
};

export const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout:         10_000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenUtils.get();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (t: string) => void;
  reject:  (e: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token!));
  failedQueue = [];
}

function isAuthUrl(url: string): boolean {
  return (
    url.includes('/auth/refresh')  ||
    url.includes('/auth/login')    ||
    url.includes('/auth/register') ||
    url.includes('/auth/logout')
  );
}

api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const url      = original?.url ?? '';

    if (isAuthUrl(url)) return Promise.reject(error);

    const is401      = error.response?.status === 401;
    const isNotRetry = !original._retry;

    if (is401 && isNotRetry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              original.headers.Authorization = `Bearer ${token}`;
              resolve(api(original));
            },
            reject,
          });
        });
      }

      original._retry = true;
      isRefreshing    = true;

      try {
        const { data } = await api.post<{ accessToken: string }>('/auth/refresh');
        tokenUtils.set(data.accessToken);
        processQueue(null, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenUtils.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);