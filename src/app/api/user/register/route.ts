'use server'

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { hash } from 'bcryptjs'

interface RequestBodyProps {
  email: string
  name: string
  password: string
}

export async function POST(request: NextRequest) {
  const requestBody = await request.text()

  try {
    const { email, name, password } = JSON.parse(
      requestBody,
    ) as RequestBodyProps

    const passwordHash = await hash(password, 6)

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: passwordHash,
      },
    })

    const token = jwt.sign(user.id, process.env.JWT_SECRET!)

    cookies().set('@planner:userToken', token, {
      expires: 1000 * 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return NextResponse.json({ token })
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      throw new Error('E-mail já foi cadastrado.')
    }
    throw new Error(`${error}`)
  }
}
