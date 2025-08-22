interface HeaderProps {
  user: {
    id: number;
    username: string;
    coins: number;
  };
}

export default function Header(props: HeaderProps) {
  const { user } = props;

  return (
    <div className="w-full bg-blue-800 p-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="text-white bg-red-500 rounded-full w-10 h-10 flex items-center justify-center text-2xl font-semibold">
          {user.username?.[0]?.toUpperCase()}
        </div>
        <div className="flex flex-col">
          <p className="text-white text-lg font-semibold">{user.username}</p>
          <p className="text-gray-300 text-sm">Player</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full font-semibold">
          {user.coins} coins
        </div>
      </div>
    </div>
  );
}
