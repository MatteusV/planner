import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { env } from '@/env'
import { tokenDecoded } from '@/@types/token-decoded'

export async function GET() {
  const cookieStore = cookies()

  const token = cookieStore.get('@planner:userToken')

  if (!token) {
    return NextResponse.redirect(`${env.WEB_BASE_URL}/`, {
      status: 301,
    })
  }

  const { userId } = jwt.decode(token.value) as tokenDecoded

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
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
    include: {
      participants: true,
    },
  })

  if (!trips) {
    return NextResponse.json({ user, trips: null }, { status: 200 })
  }

  return NextResponse.json({ user, trips }, { status: 200 })
}
