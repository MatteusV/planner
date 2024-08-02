import { getEmailClient } from '@/lib/mail'
import { prisma } from '@/lib/prisma'
import { formattedDate } from '@/utils/formatted-date'
import { z } from 'zod'
import nodemailer from 'nodemailer'
import { NextResponse } from 'next/server'
import { env } from '@/env'

const requestParamsSchema = z.object({
  tripId: z.string().uuid(),
})

const requestBodySchema = z.object({
  email: z.string().email(),
  name: z.string(),
})

export async function POST(
  request: Request,
  { params }: { params: { tripId: string } },
) {
  const { tripId } = requestParamsSchema.parse(params)

  const { email, name } = requestBodySchema.parse(await request.json())

  const trip = await prisma.trip.findUnique({
    where: {
      id: tripId,
    },
  })

  if (!trip) {
    throw new Error('Trip not found.')
  }

  const participant = await prisma.participant.create({
    data: {
      email,
      trip_id: tripId,
      name,
    },
  })

  const { formattedEndDate, formattedStartDate } = formattedDate({
    ends_at: trip.ends_at,
    starts_at: trip.starts_at,
  })

  const confirmationLink = `${env.API_BASE_URL}/participants/${participant.id}/confirm`

  const mail = await getEmailClient()

  const message = await mail.sendMail({
    from: {
      name: 'Equipe plann.er',
      address: 'oi@plann.er',
    },
    to: email,

    subject: `Confirme sua viagem para ${trip.destination}`,
    html: `
      <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
        <p>Você solicitou a criação de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>.</p>
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
  return NextResponse.json({ participantId: participant.id }, { status: 201 })
}