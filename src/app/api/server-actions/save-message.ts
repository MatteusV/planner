'use server'

import { prisma } from '@/lib/prisma'

interface saveMessageProps {
  message: {
    content: string
    ownerMessageName: string
    ownerMessageEmail: string
    userId?: string
    tripId: string
  }
}

export async function saveMessage({ message }: saveMessageProps) {
  if (!message.userId) {
    const participant = await prisma.participant.findUnique({
      where: {
        email_trip_id: {
          email: message.ownerMessageEmail,
          trip_id: message.tripId,
        },
      },
    })

    if (!participant) {
      return { participantNotFound: true }
    }

    const newMessage = await prisma.message.create({
      data: {
        content: message.content,
        participant_id: participant.id,
        trip_id: message.tripId,
      },
    })

    return { messageId: newMessage.id }
  }

  const user = await prisma.user.findUnique({
    where: {
      id: message.userId,
    },
  })

  if (!user) {
    return { userNotFound: true }
  }

  const newMessage = await prisma.message.create({
    data: {
      content: message.content,
      user_id: user.id,
      trip_id: message.tripId,
    },
  })

  return { messageId: newMessage.id }
}
