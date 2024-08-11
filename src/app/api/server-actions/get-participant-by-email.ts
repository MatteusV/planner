'use server'

import { prisma } from '@/lib/prisma'

interface getParticipantByEmailProps {
  email: string
  tripId: string
  name: string
}

export async function getParticipantByEmail({
  email,
  name,
  tripId,
}: getParticipantByEmailProps) {
  const participant = await prisma.participant.findUnique({
    where: {
      email_trip_id: {
        email,
        trip_id: tripId,
      },
    },
    select: {
      id: true,
    },
  })

  if (!participant) {
    return { participantNotFound: true }
  }

  return { participantId: participant.id, email, name }
}
