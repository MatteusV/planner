import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { tokenDecoded } from '@/@types/token-decoded'

const requestParamsSchema = z.object({
  tripId: z.string().uuid(),
})

const requestBodySchema = z.object({
  title: z.string(),
  url: z.string().url(),
  guestPayload: z
    .object({
      email: z.string().email(),
      name: z.string(),
    })
    .nullable(),
})

export async function POST(
  request: Request,
  { params }: { params: { tripId: string } },
) {
  const { tripId } = requestParamsSchema.parse(params)
  const { title, url, guestPayload } = requestBodySchema.parse(
    await request.json(),
  )

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

  if (guestPayload) {
    const link = await prisma.link.create({
      data: {
        title,
        url,
        owner_email: guestPayload.email,
        owner_name: guestPayload.name,
        trip_id: tripId,
      },
    })

    if (!link) {
      return NextResponse.json(
        { error: 'Não foi possivel criar o link' },
        { status: 500 },
      )
    }

    return NextResponse.json({ linkId: link.id }, { status: 201 })
  }

  const cookiesStore = cookies()
  const token = cookiesStore.get('@planner:userToken')

  if (!token) {
    return NextResponse.redirect('/')
  }

  const sign = jwt.decode(token.value) as tokenDecoded

  const user = await prisma.user.findFirst({
    where: {
      id: sign.userId,
    },
  })

  if (!user) {
    return NextResponse.json(
      { error: 'Usuário não encontrado.' },
      { status: 400 },
    )
  }

  const link = await prisma.link.create({
    data: {
      title,
      trip_id: trip.id,
      url,
      owner_email: user.email,
      owner_name: user.name,
    },
  })

  if (!link) {
    return NextResponse.json(
      { error: 'Não foi possivel criar o link' },
      { status: 500 },
    )
  }

  return NextResponse.json({ linkId: link.id }, { status: 201 })
}
