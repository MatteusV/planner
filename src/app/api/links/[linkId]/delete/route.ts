import { prisma } from '@/lib/prisma'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const requestParamsSchema = z.object({
  linkId: z.string().uuid(),
})

export async function DELETE(
  _request: Request,
  { params }: { params: { linkId: string } },
) {
  const { linkId } = requestParamsSchema.parse(params)

  const link = await prisma.link.findUnique({
    where: {
      id: linkId,
    },
  })

  if (!link) {
    return NextResponse.json(
      { error: 'Não foi possivel encontrar o link.' },
      { status: 400 },
    )
  }

  try {
    await prisma.link.delete({
      where: {
        id: link.id,
      },
    })

    revalidateTag('get-links')
    return NextResponse.json(
      { message: 'O link foi deletado.' },
      { status: 200 },
    )
  } catch (error) {
    revalidateTag('get-unique-trip')

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return NextResponse.json(
          {
            error:
              'Não é possível excluir o link devido a restrições de chave estrangeira.',
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
