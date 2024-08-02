import { prisma } from '@/lib/prisma'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const requestParamsSchema = z.object({
  participantId: z.string().uuid(),
})
export async function DELETE(
  _request: Request,
  { params }: { params: { participantId: string } },
) {
  const { participantId } = requestParamsSchema.parse(params)

  const participant = await prisma.participant.findUnique({
    where: {
      id: participantId,
    },
  })

  if (!participant) {
    return NextResponse.json(
      { error: 'Participante não foi encontrado.' },
      { status: 400 },
    )
  }

  try {
    await prisma.participant.delete({
      where: {
        id: participantId,
      },
    })

    revalidateTag('get-unique-trip')
    return NextResponse.json(
      { message: 'Participante excluído.' },
      { status: 200 },
    )
  } catch (error) {
    revalidateTag('get-unique-trip')

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return NextResponse.json(
          {
            error:
              'Não é possível excluir o participante devido a restrições de chave estrangeira.',
          },
          { status: 400 },
        )
      }

      console.error('Erro ao deletar participante:', error)
      return NextResponse.json(
        { error: 'Ocorreu um erro ao tentar deletar o participante.' },
        { status: 500 },
      )
    }
  }
}
