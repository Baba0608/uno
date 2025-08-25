import clsx from 'clsx';
import { RefreshCw } from 'lucide-react';

type CardProps = {
  type: 'NUMBER' | 'SKIP' | 'REVERSE' | 'DRAW_TWO' | 'WILD' | 'WILD_DRAW_FOUR';
  color?: 'RED' | 'BLUE' | 'GREEN' | 'YELLOW';
  value?: number;
};

const colorMap = {
  RED: 'bg-red-500',
  BLUE: 'bg-blue-500',
  GREEN: 'bg-green-500',
  YELLOW: 'bg-yellow-400',
};

export default function UnoCard({ type, color, value }: CardProps) {
  const bgColor = color ? colorMap[color] : 'bg-black';

  const renderContent = () => {
    if (type === 'NUMBER') {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <span className="absolute top-2 left-2 text-lg">{value}</span>
          <span className="absolute bottom-2 right-2 text-lg">{value}</span>
          <span className="text-6xl transform -rotate-12 opacity-90">
            {value}
          </span>
        </div>
      );
    }

    if (type === 'SKIP') return <span className="text-5xl">🚫</span>;

    if (type === 'REVERSE') return <RefreshCw size={48} />;

    if (type === 'DRAW_TWO') {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <span className="absolute top-2 left-2 text-lg">+2</span>
          <span className="absolute bottom-2 right-2 text-lg">+2</span>
          <span className="text-5xl font-bold">+2</span>
        </div>
      );
    }

    if (type === 'WILD') {
      return (
        <div className="flex flex-wrap w-12 h-12 rounded-full overflow-hidden">
          <div className="w-1/2 h-1/2 bg-red-500"></div>
          <div className="w-1/2 h-1/2 bg-blue-500"></div>
          <div className="w-1/2 h-1/2 bg-green-500"></div>
          <div className="w-1/2 h-1/2 bg-yellow-400"></div>
        </div>
      );
    }

    if (type === 'WILD_DRAW_FOUR') {
      return (
        <div className="flex flex-col items-center gap-1">
          <div className="flex flex-wrap w-12 h-12 rounded-full overflow-hidden">
            <div className="w-1/2 h-1/2 bg-red-500"></div>
            <div className="w-1/2 h-1/2 bg-blue-500"></div>
            <div className="w-1/2 h-1/2 bg-green-500"></div>
            <div className="w-1/2 h-1/2 bg-yellow-400"></div>
          </div>
          <span className="text-3xl font-bold">+4</span>
        </div>
      );
    }

    // this won't happen
    return <span className="text-5xl">#</span>;
  };

  return (
    <div
      className={clsx(
        'relative w-24 h-36 rounded-2xl shadow-lg border-4 border-white flex items-center justify-center text-white font-bold select-none',
        bgColor
      )}
    >
      {renderContent()}
    </div>
  );
}
