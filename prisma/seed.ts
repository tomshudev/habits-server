import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const client = await prisma.user.create({
    data: {
      email: 'tomshudev@gmail.com',
      name: 'tom',
    },
  })

  await prisma.habit.create({
    data: {
      userId: client.id,
      category: 'SPORT',
      definition: {
        days: ['sunday', 'tuesday'],
        hours: [9],
      },
      startDate: new Date().getTime(),
      description: 'Running',
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
