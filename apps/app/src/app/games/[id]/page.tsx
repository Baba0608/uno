'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchGame } from '../../../server/actions';
import UnoCard from '../../../components/UnoCard';
import UserCard from '../../../components/UserCard';
import { useUser } from '../../../hooks/useUser';
import Error from '../../../components/Error';

// Types
interface Card {
  id: number;
  type: 'NUMBER' | 'SKIP' | 'REVERSE' | 'DRAW_TWO' | 'WILD' | 'WILD_DRAW_FOUR';
  color?: 'RED' | 'BLUE' | 'GREEN' | 'YELLOW';
  value?: number;
}

interface User {
  id: number;
  username: string;
  image: string;
  coins: number;
}

interface Player {
  id: number;
  joinedAt: string;
  isHost: boolean;
  isReady: boolean;
  userId: number;
  roomId: number;
  gameId?: number;
  user: User;
}

interface Game {
  id: number;
  startedAt: string;
  endedAt?: string;
  entryFee: number;
  reward: number;
  roomId: number;
  winnerId?: number;
  players: Player[];
  deck: Card[];
  discardPile: Card[];
  currentPlayerId?: number;
  currentPlayerCards?: Card[];
  playerCards?: { [playerId: number]: Card[] }; // Map of player ID to their cards
}

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;
  const { user } = useUser();

  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGame = async () => {
      try {
        setLoading(true);
        try {
          const { data, error } = await fetchGame(gameId);
          if (error) {
            setError(error);
          } else {
            setGame(data);
          }
        } catch (err: any) {
          setError(err.message || 'Failed to fetch game');
        }
      } finally {
        setLoading(false);
      }
    };

    if (gameId) {
      loadGame();
    }
  }, [gameId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-white text-2xl">Loading game...</div>
      </div>
    );
  }

  if (error) {
    return <Error error={error} />;
  }

  if (!game) {
    return <Error error="Game not found" />;
  }

  // Get current player
  const currentPlayer = game.players.find(
    (p) => p.user.id === parseInt(user?.id || '0')
  );

  // Get opposite players (excluding current player)
  const oppositePlayers = game.players.filter(
    (p) => p.user.id !== parseInt(user?.id || '0')
  );

  return (
    <div className="w-full flex flex-col">
      {/* Main Game Area */}
      <div className="flex flex-col flex-1">
        {/* Opposite Players Row */}
        <div className="flex justify-center items-center py-8 px-4">
          <div className="flex gap-4 lg:gap-8 justify-center w-full">
            {oppositePlayers.map((player) => (
              <UserCard key={player.id} user={player.user} />
            ))}
          </div>
        </div>

        {/* Center Game Area */}
        <div className="flex justify-center items-center py-8 px-4">
          <div className="flex items-center gap-8 lg:gap-16">
            {/* Deck (Draw Pile) */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-28 lg:w-24 lg:h-36 bg-blue-600 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center">
                <div className="w-10 h-14 lg:w-12 lg:h-18 bg-blue-800 rounded border-2 border-white"></div>
              </div>
              <p className="text-white text-xs lg:text-sm mt-2">
                Deck ({game.deck?.length || 0})
              </p>
            </div>

            {/* Discard Pile */}
            <div className="flex flex-col items-center">
              {game.discardPile && game.discardPile.length > 0 ? (
                <div className="w-20 h-28 lg:w-24 lg:h-36">
                  <UnoCard {...game.discardPile[game.discardPile.length - 1]} />
                </div>
              ) : (
                <div className="w-20 h-28 lg:w-24 lg:h-36 bg-gray-400 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center">
                  <span className="text-gray-600 text-sm lg:text-lg">
                    Empty
                  </span>
                </div>
              )}
              <p className="text-white text-xs lg:text-sm mt-2">
                Discard ({game.discardPile?.length || 0})
              </p>
            </div>
          </div>
        </div>

        {/* Current Player Cards */}
        <div className="flex flex-col py-8 px-4">
          <h2 className="text-lg lg:text-xl font-bold text-white mb-4 text-center">
            Your Cards (7)
          </h2>
          <div className="flex gap-2 lg:gap-4 justify-center flex-wrap">
            {Array.from({ length: 7 }).map((_, index) => {
              // Generate random card data
              const cardTypes = [
                'NUMBER',
                'SKIP',
                'REVERSE',
                'DRAW_TWO',
                'WILD',
                'WILD_DRAW_FOUR',
              ];
              const colors = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
              const randomType =
                cardTypes[Math.floor(Math.random() * cardTypes.length)];
              const randomColor =
                randomType === 'NUMBER'
                  ? colors[Math.floor(Math.random() * colors.length)]
                  : undefined;
              const randomValue =
                randomType === 'NUMBER'
                  ? Math.floor(Math.random() * 10)
                  : undefined;

              return (
                <div
                  key={index}
                  className="cursor-pointer hover:scale-105 transition-transform"
                >
                  <UnoCard
                    type={randomType as any}
                    color={randomColor as any}
                    value={randomValue}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
