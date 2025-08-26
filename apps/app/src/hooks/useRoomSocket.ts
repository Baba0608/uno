import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseRoomSocketProps {
  roomId: string;
  userId: string;
  onPlayerJoined?: (data: { userId: number; message: string }) => void;
  onRoomState?: (roomState: any) => void;
  onError?: (error: string) => void;
}

export const useRoomSocket = ({
  roomId,
  userId,
  onPlayerJoined,
  onRoomState,
  onError,
}: UseRoomSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket = io('http://localhost:8000/rooms', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to room server');

      // Join the room
      socket.emit('joinRoom', { roomId, userId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from room server');
    });

    socket.on('roomState', (roomState: any) => {
      onRoomState?.(roomState);
    });

    socket.on('playerJoined', (data: { userId: number; message: string }) => {
      onPlayerJoined?.(data);
    });

    socket.on('error', (error: { message: string }) => {
      onError?.(error.message);
    });

    socketRef.current = socket;
  }, [roomId, userId, onPlayerJoined, onRoomState, onError]);

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
  };
};
