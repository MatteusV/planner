import { getEmailClient } from '@/lib/mail'
import { prisma } from '@/lib/prisma'
import { formattedDate } from '@/utils/formatted-date'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import nodemailer from 'nodemailer'
import { env } from '@/env'

const requestParamsSchema = z.object({
  tripId: z.string().uuid(),
})

export async function GET(
  request: Request,
  { params }: { params: { tripId: string } },
) {
  const { tripId } = requestParamsSchema.parse(params)

  const trip = await prisma.trip.findUnique({
    where: {
      id: tripId,
    },
    include: {
      participants: {
        where: {
          is_owner: false,
        },
      },
    },
  })

  if (!trip) {
    return NextResponse.json(
      { error: 'Não encontramos a viagem.' },
      { status: 400 },
    )
  }

  if (trip.is_confirmed) {
    return NextResponse.json(
      { message: 'Viagem ja foi confirmada' },
      { status: 200 },
    )
  }

  await prisma.trip.update({
    where: {
      id: tripId,
    },
    data: {
      is_confirmed: true,
    },
  })

  const { formattedEndDate, formattedStartDate } = formattedDate({
    ends_at: trip.ends_at,
    starts_at: trip.starts_at,
  })

  const mail = await getEmailClient()

  await Promise.all(
    trip.participants.map(async (participant) => {
      const confirmationLink = `${env.API_BASE_URL}/participants/${participant.id}/confirm`
      const message = await mail.sendMail({
        from: {
          name: 'Equipe plann.er',
          address: 'oi@plann.er',
        },
        to: participant.email,
        subject: `Confirme sua presença na viagem para ${trip.destination} em ${formattedStartDate}`,
        html: `
        <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
          <p>Você foi convidado(a) para participar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>.</p>
          <p></p>
          <p>Para confirmar sua presença na viagem, clique no link abaixo:</p>
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
    }),
  )

  return NextResponse.redirect(`${env.WEB_BASE_URL}/trips/${tripId}`)
}
