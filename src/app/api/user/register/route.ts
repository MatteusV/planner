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
        email: email.toLowerCase(),
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
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Email já cadastrado' },
          {
            status: 409,
          },
        )
      }
    }
    console.error(error)
    throw new Error(`${error}`)
  }
}
