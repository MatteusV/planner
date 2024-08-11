import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const requestParamsSchema = z.object({
  tripId: z.string().uuid(),
})

const requestBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
})

export async function POST(
  request: Request,
  { params }: { params: { tripId: string } },
) {
  const { tripId } = requestParamsSchema.parse(params)
  const { email, name } = requestBodySchema.parse(await request.json())

  const trip = await prisma.trip.findUnique({ where: { id: tripId } })

  if (!trip) {
    return NextResponse.json(
      { error: 'Viagem não foi encontrada.' },
      { status: 400 },
    )
  }

  const guestInTrip = await prisma.participant.findUnique({
    where: {
      email_trip_id: {
        email,
        trip_id: tripId,
      },
    },
  })

  if (!guestInTrip) {
    return NextResponse.json(
      { error: 'Você não foi convidado para a viagem.' },
      { status: 401 },
    )
  }

  if (guestInTrip.name !== name) {
    return NextResponse.json(
      { error: 'Você não foi convidado para a viagem.' },
      { status: 401 },
    )
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
