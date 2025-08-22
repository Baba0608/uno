'use server';

import { Backend } from './backend';
import { getServerSession } from 'next-auth';

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

export async function createRoom() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { data: null, error: 'Not authenticated' };
    }

    const response = await Backend('/rooms', {
      method: 'POST',
      body: {},
    });
    return { data: response.data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: error.message || 'Failed to create room',
    };
  }
}

export async function fetchRoom(roomId: string) {
  try {
    const response = await Backend(`/rooms/${roomId}`);
    return { data: response.data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: error.message || 'Failed to fetch room',
    };
  }
}
