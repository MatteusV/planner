import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const requestParamsSchema = z.object({
  tripId: z.string().uuid(),
})

export async function GET(
  request: Request,
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
      { error: 'Não foi possivel encontrar a viagem.' },
      { status: 400 },
    )
  }

  return NextResponse.json({ trip }, { status: 200 })
}
