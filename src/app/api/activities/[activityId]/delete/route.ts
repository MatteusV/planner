import { prisma } from '@/lib/prisma'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const requestParamsSchema = z.object({
  activityId: z.string().uuid(),
})

export async function DELETE(
  _request: Request,
  { params }: { params: { activityId: string } },
) {
  const { activityId } = requestParamsSchema.parse(params)

  const activity = await prisma.activity.findUnique({
    where: {
      id: activityId,
    },
  })

  if (!activity) {
    return NextResponse.json(
      { error: 'Não foi possivel encontrar a atividade.' },
      { status: 400 },
    )
  }

  try {
    await prisma.activity.delete({
      where: {
        id: activity.id,
      },
    })

    return NextResponse.json(
      { message: 'A atividade foi deletado.' },
      { status: 200 },
    )
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return NextResponse.json(
          {
            error:
              'Não é possível excluir a atividade devido a restrições de chave estrangeira.',
          },
          { status: 400 },
        )
      }
      console.error('Erro ao deletar link:', error)
      return NextResponse.json(
        { error: 'Ocorreu um erro ao tentar deletar o link.' },
        { status: 500 },
      )
    }
  }
}
