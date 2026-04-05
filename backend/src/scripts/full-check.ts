import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      stripeAccountId: true,
      stripeOnboardingComplete: true
    }
  })
  
  console.log('Users in DB:')
  console.log(JSON.stringify(users, null, 2))

  const paidReservations = await prisma.reservation.findMany({
    where: { isPaid: true },
    select: {
      id: true,
      coachId: true,
      totalPrice: true,
      coachEarning: true
    }
  })
  
  console.log('Paid Reservations in DB:')
  console.log(JSON.stringify(paidReservations, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
