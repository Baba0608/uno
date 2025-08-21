'use server';

import { Backend } from './backend';

export async function fetchUser(userId: string) {
  try {
    const response = await Backend(`/users/${userId}`);
    return { data: response.data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: error.message || 'Failed to fetch user',
    };
  }
}

export async function createUser(userData: any) {
  try {
    const response = await Backend('/users', {
      method: 'POST',
      body: userData,
    });
    return { data: response.data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: error.message || 'Failed to create user',
    };
  }
}

export async function updateUser(userId: string, userData: any) {
  try {
    const response = await Backend(`/users/${userId}`, {
      method: 'PATCH',
      body: userData,
    });
    return { data: response.data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: error.message || 'Failed to update user',
    };
  }
}
