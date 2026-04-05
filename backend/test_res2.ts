import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const res = await prisma.reservation.findUnique({ where: { id: 'ecff477d-6621-4862-aadf-92a5c4bf7845' }, select: { stripeSessionId: true } })
  console.log(res)
}
main().catch(console.error).finally(() => prisma.$disconnect())
