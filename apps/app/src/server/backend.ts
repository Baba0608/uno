'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '../app/api/auth/[...nextauth]/route';

// Types for better type safety
interface BackendOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

export async function Backend(url: string, options: BackendOptions = {}) {
  const baseURL =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api';

  // Prepare headers
  const headers: Record<string, string> = {
    ...(options.headers || {}),
  };

  // Set content type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json;charset=utf-8';
  }

  // Handle authentication with NextAuth session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Please sign in to continue');
  }

  if (session?.user?.id && session?.user?.apiToken) {
    headers['x-user-id'] = session.user.id;
    headers['Authorization'] = `Bearer ${session.user.apiToken}`;
  }

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

      // If token is expired, try to refresh the session
      if (
        response.status === 401 &&
        errorData.message?.includes('Invalid token')
      ) {
        // Force session refresh by updating the session
        // This will regenerate the API token
        const newSession = await getServerSession(authOptions);
        if (
          newSession?.user?.apiToken &&
          newSession.user.apiToken !== session.user.apiToken
        ) {
          // Retry the request with the new token
          headers['Authorization'] = `Bearer ${newSession.user.apiToken}`;
          const retryResponse = await fetch(`${baseURL}${url}`, {
            method: options.method || 'GET',
            headers,
            body,
          });

          if (retryResponse.ok) {
            const retryData = await retryResponse.json().catch(() => null);
            return {
              data: retryData,
              status: retryResponse.status,
              statusText: retryResponse.statusText,
            };
          }
        }
      }

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
