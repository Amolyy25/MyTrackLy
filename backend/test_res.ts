import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const res = await prisma.reservation.findMany({ select: { id: true, status: true, isPaid: true, student: { select: { name: true } } } })
  console.log(res)
}
main().catch(console.error).finally(() => prisma.$disconnect())
