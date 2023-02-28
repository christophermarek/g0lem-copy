import { PrismaClient } from '@prisma/client';
import { defaultImageUrl } from '../src/utils/globals';
const prisma = new PrismaClient();

async function main() {}
main()
  .then(async () => {
    if (process.env.TEAM_PASSWORD) {
      // db defaults, should always exist
      if (!(await prisma.team.findUnique({ where: { name: 'g0lem' } }))) {
        await prisma.team.create({
          data: {
            name: 'g0lem',
            teamPassword: process.env.TEAM_PASSWORD,
            teamPicture: defaultImageUrl,
          },
        });
      }
    }


    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
