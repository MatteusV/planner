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

  const links = await prisma.link.findMany({
    where: {
      trip_id: tripId,
    },
  })

  if (!links) {
    return NextResponse.json(
      { error: 'Nenhum link foi encontrado.' },
      { status: 400 },
    )
  }
  return NextResponse.json({ links })
}
