'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Button from '../components/Button';
import { createRoom } from '../server/actions';
import Error from '../components/Error';

export default function Index() {
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCreateRoom = async () => {
    if (isCreatingRoom) return;

    setIsCreatingRoom(true);

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

  return (
    <>
      <div className="w-96 flex flex-col justify-center items-center gap-5">
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
    </>
  );
}
