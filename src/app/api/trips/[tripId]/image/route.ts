import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const requestParamsSchema = z.object({
  tripId: z.string().uuid(),
})

export async function GET(
  _request: Request,
  { params }: { params: { tripId: string } },
) {
  const { tripId } = requestParamsSchema.parse(params)

  const trip = await prisma.trip.findUnique({
    where: {
      id: tripId,
    },
  })

  if (!trip) {
    return NextResponse.json(
      { error: 'Viagem não foi encontrada.' },
      { status: 400 },
    )
  }

  if (trip.image_url === null) {
    return NextResponse.json({ imageUrl: null }, { status: 200 })
  }

  return NextResponse.json({ imageUrl: trip.image_url })
}
