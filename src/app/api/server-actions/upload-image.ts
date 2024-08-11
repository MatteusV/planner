'use server'

import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { PrismaClientValidationError } from '@prisma/client/runtime/library'
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'

interface uploadImageProps {
  formData: FormData
  tripId: string
}

export async function uploadImage({ formData, tripId }: uploadImageProps) {
  const cookiesStore = cookies()

  const token = cookiesStore.get('@planner:userToken')

  if (!token) {
    return { notAuthorized: 'você não tem permissão para subir uma imagem.' }
  }

  const image = formData.get('image') as File
  const ext = image.name.split('.')[1]
  const newImageName = randomBytes(64).toString('hex')
  const imageName = `${newImageName}.${ext}`

  const { data, error } = await supabase.storage
    .from('pictures-trips')
    .upload(imageName, image, { contentType: 'image/*' })

  if (error) {
    return { error }
  }

  if (data) {
    const imageData = supabase.storage
      .from('pictures-trips')
      .getPublicUrl(data.path)

    try {
      await prisma.trip.update({
        where: {
          id: tripId,
        },
        data: {
          image_url: imageData.data.publicUrl,
          image_name: imageName,
        },
      })
      return { imageUrl: imageData.data.publicUrl }
    } catch (error) {
      await supabase.storage.from('pictures-trips').remove([data.path])
      if (error instanceof PrismaClientValidationError) {
        return { tripNotFound: true }
      }
      return { error }
    }
  }
}
