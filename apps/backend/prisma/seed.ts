import { PrismaClient, CardType, CardColor } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const colors = [
    CardColor.RED,
    CardColor.BLUE,
    CardColor.GREEN,
    CardColor.YELLOW,
  ];

  // --- Number Cards ---
  for (const color of colors) {
    // 0 (only once per color)
    await prisma.card.create({
      data: { type: CardType.NUMBER, color, value: 0 },
    });

    // 1–9 (two copies each)
    for (let v = 1; v <= 9; v++) {
      await prisma.card.createMany({
        data: [
          { type: CardType.NUMBER, color, value: v },
          { type: CardType.NUMBER, color, value: v },
        ],
      });
    }
  }

  // --- Action Cards: Skip, Reverse, Draw Two ---
  for (const color of colors) {
    for (let i = 0; i < 2; i++) {
      await prisma.card.createMany({
        data: [
          { type: CardType.SKIP, color },
          { type: CardType.REVERSE, color },
          { type: CardType.DRAW_TWO, color },
        ],
      });
    }
  }

  // --- Wild Cards ---
  await prisma.card.createMany({
    data: [
      { type: CardType.WILD },
      { type: CardType.WILD },
      { type: CardType.WILD },
      { type: CardType.WILD },
      { type: CardType.WILD_DRAW_FOUR },
      { type: CardType.WILD_DRAW_FOUR },
      { type: CardType.WILD_DRAW_FOUR },
      { type: CardType.WILD_DRAW_FOUR },
    ],
  });

  console.log('UNO Deck seeded ✅');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
