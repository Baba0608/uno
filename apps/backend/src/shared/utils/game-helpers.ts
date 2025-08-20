export function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function validateRoomCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code);
}

export function isGameActive(endedAt: Date | null): boolean {
  return endedAt === null;
}
