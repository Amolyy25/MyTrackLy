import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const coaches = await prisma.user.findMany({
    where: { role: 'coach' },
    select: {
      id: true,
      email: true,
      stripeAccountId: true,
      stripeOnboardingComplete: true,
      stripeChargesEnabled: true
    }
  })
  console.log(JSON.stringify(coaches, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
