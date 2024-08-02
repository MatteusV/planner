'use server'

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { compare } from 'bcryptjs'

interface RequestBodyProps {
  email: string
  password: string
}

export async function POST(request: NextRequest) {
  const requestBody = await request.json()

  const { email, password } = requestBody as RequestBodyProps

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  if (!user) {
    return NextResponse.json(
      { error: 'Email ou senha incorretas.' },
      { status: 401 },
    )
  }

  const passwordHashMatch = await compare(password, user.password)

  if (!passwordHashMatch) {
    return NextResponse.json(
      { error: 'Email ou senha incorretas.' },
      { status: 401 },
    )
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  })

  const cookieStore = cookies()

  cookieStore.set('@planner:userToken', token, {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  })

  return NextResponse.json({ token })
}
