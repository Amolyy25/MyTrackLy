import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '../../.env') })

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27.acacia' as any
})

async function main() {
  const coachEmail = 'meiller.amaury@gmail.com'
  const user = await prisma.user.findUnique({ where: { email: coachEmail } })
  
  if (!user || !user.stripeAccountId) {
    console.log('Coach or Stripe ID not found')
    return
  }

  console.log(`Checking Stripe account status for ${user.stripeAccountId} (${coachEmail})...`)
  const account = await stripe.accounts.retrieve(user.stripeAccountId)
  
  console.log('Stripe Data:')
  console.log({
    details_submitted: account.details_submitted,
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
    requirements: account.requirements?.currently_due
  })

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeChargesEnabled: account.charges_enabled,
      stripePayoutsEnabled: account.payouts_enabled,
      stripeOnboardingComplete: account.details_submitted
    }
  })
  
  console.log('Updated DB Status:', {
    stripeOnboardingComplete: updated.stripeOnboardingComplete,
    stripeChargesEnabled: updated.stripeChargesEnabled
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())
