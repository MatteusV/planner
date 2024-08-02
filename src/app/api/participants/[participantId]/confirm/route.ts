import { env } from '@/env'
import { prisma } from '@/lib/prisma'
import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const requestParamsSchema = z.object({
  participantId: z.string().uuid(),
})

export async function GET(
  _request: Request,
  { params }: { params: { participantId: string } },
) {
  const { participantId } = requestParamsSchema.parse(params)

  const participant = await prisma.participant.findUnique({
    where: {
      id: participantId,
    },
  })

  if (!participant) {
    return NextResponse.json(
      { error: 'Não foi possivel encontrar o participante.' },
      { status: 400 },
    )
  }

  if (participant.is_confirmed) {
    revalidateTag('get-unique-trip')
    return NextResponse.redirect(
      `${env.WEB_BASE_URL}/trips/${participant.trip_id}`,
    )
  }

  const participantUpdated = await prisma.participant.update({
    where: {
      id: participantId,
    },
    data: {
      is_confirmed: true,
    },
  })

  if (participantUpdated.is_confirmed === false) {
    return NextResponse.json(
      { error: 'Não foi possivel confirmar o participante no evento.' },
      { status: 500 },
    )
  }

  revalidateTag('get-unique-trip')
  return NextResponse.redirect(
    `${env.WEB_BASE_URL}/trips/${participant.trip_id}`,
  )
}
