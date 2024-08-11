'use server'

import { prisma } from '@/lib/prisma'

export async function fetchMessages({ tripId }: { tripId: string }) {
  const messages = await prisma.message.findMany({
    where: {
      trip_id: tripId,
    },
    include: {
      participant: {
        select: {
          id: true,
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          image_url: true,
        },
      },
    },
  })

  return { messages }
}
