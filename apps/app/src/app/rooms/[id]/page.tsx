'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchUser, fetchRoom } from '../../../server/actions';
import { getAuth } from '../../../utils/auth';
import Error from '../../../components/Error';
import UserCard from '../../../components/UserCard';

interface User {
  id: number;
  username: string;
  coins: number;
}

interface Room {
  id: number;
  code: string;
  isActive: boolean;
}

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { userId } = await getAuth();
        if (!userId) {
          setError('User not found');
          return;
        }

        const userResult = await fetchUser(userId);
        const roomResult = await fetchRoom(roomId);

        if (userResult.error) {
          setError(userResult.error);
        } else {
          setUser(userResult.data);
          setRoom(roomResult.data);
          setError(null);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user');
      }
    };
    loadUser();
  }, []);

  if (error) {
    return <Error error={error} />;
  }

  if (!user || !room) {
    return (
      <div className="w-screen h-screen bg-blue-900 flex flex-col justify-center items-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-blue-900 flex flex-col justify-center items-center">
      <div className="w-96 flex flex-col justify-center items-center gap-5">
        <div className="flex gap-5 w-full justify-end p-5 items-center">
          <p className="text-2xl text-white">Coins: {user?.coins}</p>
          <div className="text-white bg-red-500 rounded-full w-10 h-10 flex items-center justify-center text-2xl font-semibold">
            {user?.username?.[0]?.toUpperCase()}
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-4xl text-white font-bold mb-4">Room Created!</h1>
          <p className="text-xl text-white mb-2">Room ID: {room.code}</p>
          <p className="text-lg text-gray-300">
            Share this room code with others to join
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-2">
          <p className="text-white text-lg">Waiting for players to join...</p>
          <UserCard user={user} />
        </div>
      </div>
    </div>
  );
}
