'use client';

import { useParams } from 'next/navigation';

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;

  return <div>GamePage {gameId}</div>;
}
