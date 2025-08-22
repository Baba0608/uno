'use client';

import { useEffect, useState } from 'react';

import Header from './Header';
import Error from './Error';
import { fetchUser } from '../server/actions';
import { getAuth } from '../utils/auth';

interface User {
  id: number;
  username: string;
  coins: number;
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { userId } = await getAuth();
        if (!userId) {
          // TODO: ask user to login
          setError('User not found');
          setIsLoading(false);
          return;
        }

        const result = await fetchUser(userId);

        setUser(result.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user');
      }
      setIsLoading(false);
    };
    loadUser();
  }, []);

  // Show error if there's an error
  if (error) {
    return <Error error={error} />;
  }

  // Show loading if still loading
  if (isLoading) {
    return (
      <div className="w-screen h-screen bg-blue-900 flex flex-col justify-center items-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  // Don't show header on loading page if user is null
  if (!user) {
    return (
      <div className="w-screen h-screen bg-blue-900 flex flex-col justify-center items-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-blue-900 flex flex-col">
      <Header user={user} />
      <div className="flex-1 flex justify-center items-center">{children}</div>
    </div>
  );
}
