'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import Button from '../components/Button';
import Error from '../components/Error';

import { fetchUser, createRoom } from '../server/actions';
import { getAuth } from '../utils/auth';

interface User {
  id: number;
  username: string;
  coins: number;
}

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { userId } = await getAuth();
        if (!userId) {
          // TODO: ask user to login
          setError('User not found');
          return;
        }

        const result = await fetchUser(userId);

        if (result.error) {
          setError(result.error);
        } else {
          setUser(result.data);
          setError(null);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user');
      }
    };
    loadUser();
  }, []);

  const handleCreateRoom = async () => {
    if (isCreatingRoom) return;

    setIsCreatingRoom(true);
    setError(null);

    try {
      const result = await createRoom();

      if (result.error) {
        setError(result.error);
      } else {
        // Redirect to the created room
        router.push(`/rooms/${result.data.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create room');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  if (error) {
    return <Error error={error} />;
  }

  if (!user)
    return (
      <div className="w-screen h-screen bg-blue-900 flex flex-col justify-center items-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );

  return (
    <div className="w-screen h-screen bg-blue-900 flex justify-center items-center">
      <div className="w-96 flex flex-col justify-center items-center gap-5">
        <div className="flex gap-5 w-full justify-end p-5 items-center">
          <p className="text-2xl text-white">Coins: {user?.coins}</p>

          <div className="text-white bg-red-500 rounded-full w-10 h-10 flex items-center justify-center text-2xl font-semibold">
            {user?.username?.[0]?.toUpperCase()}
          </div>
        </div>
        <div>
          <Image src="/logo.png" alt="Logo" width={300} height={300} />
        </div>
        <Button
          value={isCreatingRoom ? 'Creating...' : 'CREATE ROOM'}
          onClick={handleCreateRoom}
        />
        <Button value="JOIN ROOM" />
        <div className="flex flex-col items-center gap-2">
          <p className="text-2xl text-white">Room Code</p>
          <input
            type="text"
            className="text-xl bg-blue-700 px-3 py-2 text-white w-80 rounded-xl focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
