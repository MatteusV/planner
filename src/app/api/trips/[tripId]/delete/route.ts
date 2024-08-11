import { prisma } from '@/lib/prisma'
import { PrismaClientValidationError } from '@prisma/client/runtime/library'
import { revalidateTag } from 'next/cache'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const requestParamsSchema = z.object({
  tripId: z.string().uuid(),
})

export async function DELETE(
  _request: Request,
  { params }: { params: { tripId: string } },
) {
  const { tripId } = requestParamsSchema.parse(params)

  const cookieStore = cookies()

  const userToken = cookieStore.get('@planner:userToken')

  if (!userToken) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    await prisma.$transaction([
      prisma.participant.deleteMany({
        where: {
          trip_id: tripId,
        },
      }),
      prisma.message.deleteMany({
        where: {
          trip_id: tripId,
        },
      }),
      prisma.link.deleteMany({
        where: {
          trip_id: tripId,
        },
      }),
      prisma.activity.deleteMany({
        where: {
          trip_id: tripId,
        },
      }),
      prisma.trip.delete({
        where: {
          id: tripId,
        },
      }),
    ])

    revalidateTag('get-unique-trip')
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    revalidateTag('get-unique-trip')

    if (error instanceof PrismaClientValidationError) {
      return NextResponse.json(
        {
          error: 'Não foi possivel encontrar nenhuma viagem.',
        },
        { status: 200 },
      )
    }

    return NextResponse.json({ error }, { status: 500 })
  }
}
