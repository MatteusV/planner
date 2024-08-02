import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { tokenDecoded } from '@/@types/token-decoded'

const requestBodySchema = z.object({
  token: z.string(),
})

export async function POST(request: Request) {
  const { token } = requestBodySchema.parse(await request.json())
  const sign = jwt.decode(token) as tokenDecoded

  const user = await prisma.user.findUnique({
    where: {
      id: sign.userId,
    },
  })

  if (!user) {
    return NextResponse.json(
      {
        error: 'Não foi possivel encontrar nenhum usuário',
      },
      { status: 400 },
    )
  }

  const trips = await prisma.trip.findMany({
    where: {
      user_id: user.id,
    },
  })

  if (!trips) {
    return NextResponse.json({ user, trips: null }, { status: 200 })
  }

  return NextResponse.json({ user, trips }, { status: 200 })
}
