import UnoCard from '../../components/UnoCard';
import { fetchCards } from '../../server/actions';

type Card = {
  id: number;
  type: 'NUMBER' | 'SKIP' | 'REVERSE' | 'DRAW_TWO' | 'WILD' | 'WILD_DRAW_FOUR';
  color?: 'RED' | 'BLUE' | 'GREEN' | 'YELLOW';
  value?: number;
};

export default async function Cards() {
  const { data: cards, error } = await fetchCards();

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-wrap gap-4 p-4">
      {cards.map((card: Card) => (
        <UnoCard key={card.id} {...card} />
      ))}
    </div>
  );
}
