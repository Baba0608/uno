import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseRoomSocketProps {
  roomId: string;
  userId: string;
  onPlayerJoined?: (data: { userId: number; message: string }) => void;
  onRoomState?: (roomState: any) => void;
  onGameStarted?: (game: any) => void;
  onJoinGame?: (data: {
    gameId: string;
    message: string;
    redirectUrl: string;
  }) => void;
  onError?: (error: string) => void;
}

export const useRoomSocket = ({
  roomId,
  userId,
  onPlayerJoined,
  onRoomState,
  onGameStarted,
  onJoinGame,
  onError,
}: UseRoomSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Store callbacks in refs to prevent unnecessary re-renders
  const onPlayerJoinedRef = useRef(onPlayerJoined);
  const onRoomStateRef = useRef(onRoomState);
  const onGameStartedRef = useRef(onGameStarted);
  const onJoinGameRef = useRef(onJoinGame);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onPlayerJoinedRef.current = onPlayerJoined;
  }, [onPlayerJoined]);

  useEffect(() => {
    onRoomStateRef.current = onRoomState;
  }, [onRoomState]);

  useEffect(() => {
    onGameStartedRef.current = onGameStarted;
  }, [onGameStarted]);

  useEffect(() => {
    onJoinGameRef.current = onJoinGame;
  }, [onJoinGame]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket = io('http://localhost:8000/rooms', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      setIsConnected(true);

      // Join the room
      socket.emit('joinRoom', { roomId, userId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('roomState', (roomState: any) => {
      onRoomStateRef.current?.(roomState);
    });

    socket.on('playerJoined', (data: { userId: number; message: string }) => {
      onPlayerJoinedRef.current?.(data);
    });

    socket.on('gameStarted', (game: any) => {
      onGameStartedRef.current?.(game);
    });

    socket.on(
      'joinGame',
      (data: { gameId: string; message: string; redirectUrl: string }) => {
        onJoinGameRef.current?.(data);
      }
    );

    socket.on('error', (error: { message: string }) => {
      onErrorRef.current?.(error.message);
    });

    socketRef.current = socket;
  }, [roomId, userId]); // Only depend on roomId and userId

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connect,
    disconnect,
    socket: socketRef.current,
  };
};
