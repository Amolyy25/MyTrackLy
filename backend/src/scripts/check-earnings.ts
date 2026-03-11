import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const coachEmail = 'meiller.amaury@gmail.com'
  const coach = await prisma.user.findUnique({ where: { email: coachEmail } })
  
  if (!coach) {
    console.log('Coach not found')
    return
  }

  const reservations = await prisma.reservation.findMany({
    where: {
      coachId: coach.id,
      isPaid: true
    },
    select: {
      id: true,
      totalPrice: true,
      coachEarning: true,
      platformFee: true,
      isPaid: true,
      startDateTime: true
    }
  })
  
  console.log(`Reservations for ${coachEmail}:`)
  console.log(JSON.stringify(reservations, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
