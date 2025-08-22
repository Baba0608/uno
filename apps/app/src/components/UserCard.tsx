interface UserCardProps {
  user: {
    id: number;
    username: string;
    coins: number;
  };
}

export default function UserCard(props: UserCardProps) {
  const { user } = props;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="text-white bg-red-500 rounded-full w-10 h-10 flex items-center justify-center text-2xl font-semibold text-center">
        {user.username?.[0]?.toUpperCase()}
      </div>

      <div className="flex flex-col items-center justify-center gap-2">
        <p className="text-white text-lg">{user.username}</p>
        <p className="text-white text-lg">Coins: {user.coins}</p>
      </div>
    </div>
  );
}
