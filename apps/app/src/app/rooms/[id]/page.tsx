'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchRoom } from '../../../server/actions';
import Error from '../../../components/Error';

interface Room {
  id: number;
  code: string;
  isActive: boolean;
}

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRoom = async () => {
      try {
        const roomResult = await fetchRoom(roomId);
        setRoom(roomResult.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch room');
      }
    };
    loadRoom();
  }, []);

  if (error) {
    return <Error error={error} />;
  }

  if (!room) {
    return (
      <div className="w-96 flex flex-col justify-center items-center gap-5">
        <div className="text-white text-2xl">Loading room...</div>
      </div>
    );
  }

  return (
    <div className="w-96 flex flex-col justify-center items-center gap-5">
      <div className="text-center">
        <h1 className="text-4xl text-white font-bold mb-4">Room Created!</h1>
        <p className="text-xl text-white mb-2">Room ID: {room.code}</p>
        <p className="text-lg text-gray-300">
          Share this room code with others to join
        </p>
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-2">
        <p className="text-white text-lg">Waiting for players to join...</p>
      </div>
    </div>
  );
}
