interface UserCardProps {
  user: {
    id: number;
    username: string;
    coins: number;
    image: string;
  };
}

export default function UserCard(props: UserCardProps) {
  const { user } = props;

  // Truncate username if it's too long
  const displayUsername =
    user.username.length > 8
      ? user.username.substring(0, 8) + '...'
      : user.username;

  return (
    <div className="flex flex-col items-center gap-2 w-32 flex-shrink-0">
      {/* Player Avatar */}
      <div className="w-24 h-24 bg-white rounded-lg overflow-hidden border-2 border-blue-500 shadow-lg">
        <img
          src={user.image}
          alt={user.username}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Player Name Button */}
      <button
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors shadow-md w-full text-center"
        title={user.username} // Show full name on hover
      >
        {displayUsername}
      </button>
    </div>
  );
}
