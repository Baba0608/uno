'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchRoom, startGame } from '../../../server/actions';
import Error from '../../../components/Error';
import UserCard from '../../../components/UserCard';
import Button from '../../../components/Button';
import { useUser } from '../../../hooks/useUser';

interface Room {
  id: number;
  code: string;
  isActive: boolean;
  players: Player[];
}

interface User {
  id: number;
  username: string;
  image: string;
  coins: number;
}

interface Player {
  id: number;
  username: string;
  coins: number;
  image: string;
  user: User;
  isHost: boolean;
}

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const loadRoom = async () => {
      try {
        const roomResult = await fetchRoom(roomId);
        setRoom(roomResult.data);
        if (user) {
          setPlayer(
            roomResult.data.players.find(
              (player: Player) => player.user.id === parseInt(user.id)
            )
          );
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch room');
      }
    };
    loadRoom();
  }, []);

  const handleStartGame = async () => {
    if (!room) return;
    const { data, error } = await startGame(room.id, 100);
    if (error) {
      setError(error);
    }
    if (data) {
      router.push(`/games/${data.id}`);
    }
  };

  if (error) {
    return <Error error={error} />;
  }

  if (!room || !user) {
    return <div className="text-white text-2xl">Loading room...</div>;
  }

  return (
    <div>
      {/* Room Code Section */}
      <div className="rounded-lg p-4 mb-6 flex flex-col items-center">
        <div className="flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="font-medium text-white text-lg">Room Code</div>
            <div className="bg-blue-500 text-white text-2xl px-3 py-1 rounded font-mono font-bold">
              {room.code}
            </div>
          </div>
        </div>
        <p className="text-lg text-center text-white mt-2">
          Share this room code with friends and ask them to join
        </p>
      </div>

      {/* Game Info */}
      <div className="text-green-500 text-center mb-6">
        <p className="text-lg">Entry Amount : 100</p>
      </div>

      {/* Player Slots */}
      <div className="flex flex-wrap justify-center gap-6 mb-6 max-w-2xl mx-auto">
        {room.players.map((player: Player) => (
          <UserCard key={player.id} user={player.user} />
        ))}
      </div>

      {/* Game Start Info */}
      <div className="text-center mb-6">
        {player &&
          (player.isHost ? (
            // Current user is host - show start button only
            <div className="flex flex-col items-center gap-3">
              <Button value="Start Game" onClick={handleStartGame} />
            </div>
          ) : (
            // Current user is not host - show host name message
            <p className="text-green-500 text-lg">
              {room.players.find((p) => p.isHost)?.user.username} will start the
              game
            </p>
          ))}
      </div>
    </div>
  );
}
