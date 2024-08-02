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

  const participants = await prisma.participant.findMany({
    where: {
      trip_id: tripId,
    },
  })

  if (!participants) {
    return NextResponse.json(
      { error: 'Nenhum participante foi encontrado.' },
      { status: 400 },
    )
  }
  return NextResponse.json({ participants })
}
