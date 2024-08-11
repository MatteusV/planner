'use server'

import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

interface DeleteImageProps {
  tripId: string
}

export async function DeleteImage({ tripId }: DeleteImageProps) {
  const trip = await prisma.trip.findUnique({
    where: {
      id: tripId,
    },
  })

  if (!trip) {
    return { tripNotFound: true }
  }

  if (trip.image_name === null) {
    return { imageNameNotFound: true }
  }

  const { data, error } = await supabase.storage
    .from('pictures-trips')
    .remove([trip.image_name])

  if (error) {
    return { error: error.message }
  }

  console.log({ data })

  const tripUpdated = await prisma.trip.update({
    data: {
      image_name: null,
      image_url: null,
    },
    where: {
      id: tripId,
    },
  })

  if (tripUpdated.image_name === null && tripUpdated.image_url === null) {
    return { success: true }
  }

  return { error: 'Não foi possivel atualizar o banco de dados.' }
}
