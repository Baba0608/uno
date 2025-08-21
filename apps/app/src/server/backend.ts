'use server';

import { getAuthHeaders } from '../utils/auth';

// Types for better type safety
interface BackendOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

export async function Backend(url: string, options: BackendOptions = {}) {
  const baseURL = `${process.env.NEXT_PUBLIC_BACKEND_URL}`;

  // Prepare headers
  const headers: Record<string, string> = {
    ...(options.headers || {}),
  };

  // Set content type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json;charset=utf-8';
  }

  // Handle authentication
  const authHeaders = await getAuthHeaders();
  Object.assign(headers, authHeaders);

  // Prepare request body
  let body: string | FormData | undefined;
  if (options.body) {
    if (options.body instanceof FormData) {
      body = options.body;
    } else {
      body = JSON.stringify(options.body);
    }
  }

  try {
    const response = await fetch(`${baseURL}${url}`, {
      method: options.method || 'GET',
      headers,
      body,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json().catch(() => null);
    return { data, status: response.status, statusText: response.statusText };
  } catch (error: any) {
    if (error.message) {
      throw error;
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
}
