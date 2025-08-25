import { signOut } from 'next-auth/react';
import { fetchUser } from '../server/actions';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface HeaderProps {
  user: {
    id: string;
    username: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function Header(props: HeaderProps) {
  const { user } = props;
  const [userData, setUserData] = useState<any>(null);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  useEffect(() => {
    const getUser = async () => {
      const response = await fetchUser(user.id);
      setUserData(response.data);
    };
    getUser();
  }, [user]);

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full bg-blue-800 p-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="text-white bg-red-500 rounded-full w-10 h-10 flex items-center justify-center text-2xl font-semibold">
          <Image
            src={userData?.image}
            alt={userData?.username}
            className="w-full h-full object-cover rounded-full"
            width={40}
            height={40}
          />
        </div>
        <div className="flex flex-col">
          <p className="text-white text-lg font-semibold">
            {userData?.username}
          </p>
          <p className="text-gray-300 text-sm">Player</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full font-semibold">
          {userData?.coins} coins
        </div>
        <button
          onClick={handleSignOut}
          className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
