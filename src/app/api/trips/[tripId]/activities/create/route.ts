import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const requestParamsSchema = z.object({
  tripId: z.string().uuid(),
})

const requestBodySchema = z.object({
  title: z.string(),
  occurs_at: z.coerce.date(),
})

export async function POST(
  request: Request,
  { params }: { params: { tripId: string } },
) {
  const { tripId } = requestParamsSchema.parse(params)
  const { occurs_at, title } = requestBodySchema.parse(await request.json())

  const cookieStore = cookies()

  const userToken = cookieStore.get('@planner:userToken')

  if (!userToken) {
    return NextResponse.json(
      { error: 'Usuário não autorizado' },
      { status: 401 },
    )
  }

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

  const activity = await prisma.activity.create({
    data: {
      occurs_at,
      title,
      trip_id: tripId,
    },
  })

  if (!activity) {
    return NextResponse.json(
      { error: 'Não foi possivel criar a atividade.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ activityId: activity.id }, { status: 201 })
}
