import { getEmailClient } from '@/lib/mail'
import { prisma } from '@/lib/prisma'
import { decode } from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { redirect } from 'next/navigation'
import nodemailer from 'nodemailer'
import { formattedDate } from '@/utils/formatted-date'
import { env } from '@/env'
import { cookies } from 'next/headers'
import { tokenDecoded } from '@/@types/token-decoded'

const requestBodySchema = z.object({
  destination: z.string().min(4),
  starts_at: z.coerce.date(),
  ends_at: z.coerce.date(),
  emails_to_invite: z.array(
    z.object({
      email: z
        .string()
        .email()
        .transform((email) => email.toLocaleLowerCase()),
      name: z.string(),
    }),
  ),
})

export async function POST(request: Request) {
  const { destination, emails_to_invite, ends_at, starts_at } =
    requestBodySchema.parse(await request.json())

  const cookieStore = cookies()

  const token = cookieStore.get('@planner:userToken')

  if (!token) {
    return NextResponse.json(
      { message: 'Usuário não autorizado' },
      { status: 400 },
    )
  }

  const { userId } = decode(token.value) as tokenDecoded

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })

  if (!user) {
    redirect('/')
  }

  const trip = await prisma.trip.create({
    data: {
      user_id: user.id,
      destination,
      ends_at,
      starts_at,
      participants: {
        createMany: {
          data: [
            ...emails_to_invite.map((user) => {
              return { email: user.email, name: user.name }
            }),
          ],
        },
      },
    },
  })

  if (!trip) {
    return NextResponse.json(
      { message: 'Viagem não foi criada.' },
      { status: 400 },
    )
  }

  const { formattedEndDate, formattedStartDate } = formattedDate({
    ends_at: trip.ends_at,
    starts_at: trip.starts_at,
  })

  const confirmationLink = `${env.API_BASE_URL}/trips/${trip.id}/confirm`

  const mail = await getEmailClient()

  const message = await mail.sendMail({
    from: {
      name: 'Equipe plann.er',
      address: 'oi@plann.er',
    },
    to: {
      name: user!.name,
      address: user!.email,
    },

    subject: `Confirme sua viagem para ${destination}`,
    html: `
      <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
        <p>Você solicitou a criação de uma viagem para <strong>${destination}</strong> nas datas de <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>.</p>
        <p></p>
        <p>Para confirmar sua viagem, clique no link abaixo:</p>
        <p></p>
        <p>
          <a href="${confirmationLink}">Confirmar viagem</a>
        </p>
        <p></p>
        <p>Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.</p>
      </div>
    `.trim(),
  })

  console.log(nodemailer.getTestMessageUrl(message))

  return NextResponse.json({ tripId: trip.id }, { status: 201 })
}
