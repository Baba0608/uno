import { Player, User } from '@prisma/client';

export interface PlayerWithUser extends Player {
  user: User;
}

export function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function calculateWinner(players: PlayerWithUser[]): User | null {
  if (players.length === 0) return null;

  // Simple random winner for now
  // You can implement your game logic here
  const randomIndex = Math.floor(Math.random() * players.length);
  return players[randomIndex].user;
}

export function calculateReward(entryFee: number, playerCount: number): number {
  // House takes 10% cut, rest goes to winner
  const totalPot = entryFee * playerCount;
  return Math.floor(totalPot * 0.9);
}

export function validateRoomCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code);
}

export function isGameActive(endedAt: Date | null): boolean {
  return endedAt === null;
}
