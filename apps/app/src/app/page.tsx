'use client';

import axios from 'axios';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import Button from '../components/Button';
import Error from '../components/Error';

interface User {
  id: number;
  username: string;
  coins: number;
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api';

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/users/2`);
        console.log(response.data);
        setUser(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError(
          'Failed to fetch user data. Make sure the backend is running on http://localhost:8000'
        );
      }
    };
    fetchUser();
  }, []);

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
        <Button value="CREATE ROOM" />
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
