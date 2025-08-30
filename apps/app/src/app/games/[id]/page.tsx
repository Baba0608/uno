'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchGame } from '../../../server/actions';
import UnoCard from '../../../components/UnoCard';
import UserCard from '../../../components/UserCard';
import { useUser } from '../../../hooks/useUser';
import { useGameSocket } from '../../../hooks/useGameSocket';
import Error from '../../../components/Error';

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;
  const { user } = useUser();

  const [game, setGame] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Use the game socket hook
  const {
    gameState,
    isConnected,
    error: socketError,
    loading: socketLoading,
    currentPlayer,
    otherPlayers,
    currentPlayerCards,
    isMyTurn,
    playCard,
    drawCard,
  } = useGameSocket(gameId, user?.id || '');

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

  // Show socket error if there is one
  if (socketError) {
    return <Error error={socketError} />;
  }

  // Show loading while socket is connecting or game is loading
  if (socketLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-2xl">Loading game...</div>
      </div>
    );
  }

  // Show error if there is one
  if (error) {
    return <Error error={error} />;
  }

  // Show loading if game state is not yet available
  if (!gameState && !game) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-2xl">Waiting for game to start...</div>
      </div>
    );
  }

  // Use gameState from socket if available, otherwise fall back to fetched game
  const activeGame = gameState || game;
  const currentPlayerData =
    currentPlayer ||
    game?.players?.find((p: any) => p.user.id === parseInt(user?.id || '0'));

  // Get opposite players (excluding current player)
  const oppositePlayers =
    otherPlayers.length > 0
      ? otherPlayers
      : game?.players?.filter(
          (p: any) => p.user.id !== parseInt(user?.id || '0')
        ) || [];

  // Get current player's cards (from socket if available, otherwise from game)
  const playerCards =
    currentPlayerCards.length > 0
      ? currentPlayerCards
      : currentPlayerData?.cards ||
        Array.from({ length: 7 }).map((_, index) => ({
          id: index,
          type: 'NUMBER' as const,
          color: 'RED' as const,
          value: Math.floor(Math.random() * 10),
        }));

  return (
    <div className="w-full flex flex-col">
      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-yellow-600 text-white text-center py-2">
          Connecting to game server...
        </div>
      )}

      {/* Turn Indicator */}
      {gameState && (
        <div className="bg-blue-600 text-white text-center py-2">
          {isMyTurn
            ? "It's your turn!"
            : `Waiting for ${
                gameState.players.find(
                  (p) => p.id.toString() === gameState.currentPlayer
                )?.username || 'other player'
              }...`}
        </div>
      )}

      {/* Winner Announcement */}
      {gameState?.winner && (
        <div className="bg-green-600 text-white text-center py-4">
          <h2 className="text-xl font-bold">🎉 Game Over! 🎉</h2>
          <p className="text-lg">
            {
              gameState.players.find(
                (p) => p.id.toString() === gameState.winner
              )?.username
            }{' '}
            wins the game!
          </p>
        </div>
      )}

      {/* Main Game Area */}
      <div className="flex flex-col flex-1">
        {/* Opposite Players Row */}
        <div className="flex justify-center items-center py-8 px-4">
          <div className="flex gap-4 lg:gap-8 justify-center w-full">
            {oppositePlayers.map((player: any) => (
              <div key={player.id} className="flex flex-col items-center">
                <UserCard user={player.user || player} />
                <p className="text-white text-sm mt-2">
                  {player.cards ? `${player.cards.length} cards` : 'Ready'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Center Game Area */}
        <div className="flex justify-center items-center py-8 px-4">
          <div className="flex items-center gap-8 lg:gap-16">
            {/* Deck (Draw Pile) */}
            <div className="flex flex-col items-center">
              <button
                onClick={drawCard}
                disabled={!isMyTurn}
                className={`w-20 h-28 lg:w-24 lg:h-36 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center transition-all ${
                  isMyTurn
                    ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                <div className="w-10 h-14 lg:w-12 lg:h-18 bg-blue-800 rounded border-2 border-white"></div>
              </button>
              <p className="text-white text-xs lg:text-sm mt-2">
                Deck ({activeGame?.deck?.length || 0})
              </p>
              {isMyTurn && (
                <p className="text-green-400 text-xs mt-1">Click to draw</p>
              )}
            </div>

            {/* Discard Pile */}
            <div className="flex flex-col items-center">
              {activeGame?.discardPile && activeGame.discardPile.length > 0 ? (
                <div className="w-20 h-28 lg:w-24 lg:h-36">
                  <UnoCard
                    {...activeGame.discardPile[
                      activeGame.discardPile.length - 1
                    ]}
                  />
                </div>
              ) : (
                <div className="w-20 h-28 lg:w-24 lg:h-36 bg-gray-400 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center">
                  <span className="text-gray-600 text-sm lg:text-lg">
                    Empty
                  </span>
                </div>
              )}
              <p className="text-white text-xs lg:text-sm mt-2">
                Discard ({activeGame?.discardPile?.length || 0})
              </p>
            </div>
          </div>
        </div>

        {/* Current Player Cards */}
        <div className="flex flex-col py-8 px-4">
          <h2 className="text-lg lg:text-xl font-bold text-white mb-4 text-center">
            Your Cards ({playerCards.length})
          </h2>
          <div className="flex gap-2 lg:gap-4 justify-center flex-wrap">
            {playerCards.map((card: any, index: number) => (
              <div
                key={card.id || index}
                className={`cursor-pointer hover:scale-105 transition-transform ${
                  isMyTurn ? 'hover:shadow-lg' : 'opacity-75'
                }`}
                onClick={() => isMyTurn && playCard(card.id)}
              >
                <UnoCard
                  type={card.type}
                  color={card.color}
                  value={card.value}
                />
              </div>
            ))}
          </div>

          {!isMyTurn && (
            <p className="text-gray-400 text-center mt-4">
              Wait for your turn to play cards
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
