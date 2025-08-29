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

export async function createRoom() {
  try {
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

export async function joinRoom(roomCode: string) {
  try {
    const response = await Backend(`/rooms/join`, {
      method: 'POST',
      body: { code: roomCode },
    });
    console.log('response', response);
    return { data: response.data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: error.message || 'Failed to join room',
    };
  }
}

export async function startGame(roomId: number, entryFee: number) {
  try {
    const response = await Backend(`/games`, {
      method: 'POST',
      body: { roomId, entryFee },
    });
    return { data: response.data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: error.message || 'Failed to start game',
    };
  }
}

export async function fetchCards() {
  try {
    const response = await Backend('/cards');
    return { data: response.data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: error.message || 'Failed to fetch cards',
    };
  }
}

export async function fetchGame(gameId: string) {
  try {
    const response = await Backend(`/games/${gameId}`);
    return { data: response.data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: error.message || 'Failed to fetch game',
    };
  }
}
