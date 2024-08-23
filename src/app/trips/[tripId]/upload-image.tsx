'use client'

import { Image as ImageIcon, LoaderCircle, Trash2 } from 'lucide-react'
import { ChangeEvent, useEffect, useState } from 'react'

import { Button } from '@/components/button'

import { toast } from 'sonner'
import Image from 'next/image'
import { api } from '@/lib/axios'

interface UploadImageProsp {
  tripId: string
  guestPayload: boolean
}

export function UploadImage({ tripId, guestPayload }: UploadImageProsp) {
  const [formIsSubmitting, setFormIsSubmitting] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [image, setImage] = useState<File | null>()
  const [imageFromDatabase, setImageFromDatabase] = useState<string | null>('')

  useEffect(() => {
    api(`/trips/${tripId}`).then(({ data, status }) => {
      const imageUrl = data.trip.image_url

      if (status === 200) {
        setImageFromDatabase(imageUrl)
      }
    })
  }, [tripId])

  async function handleAddImageTrip() {
    if (!image) {
      return
    }
    setFormIsSubmitting(true)

    const formData = new FormData()
    formData.append('image', image)
    const teste = formData.get('image')

    const { status, data } = await api.post(`/trips/${tripId}/image`, {
      teste,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (status !== 200) {
      toast.error('Erro ao fazer o upload da imagem')
    }

    if (status === 404) {
      toast.error('Erro ao achar a viagem.')
    }

    if (data.imageUrl) {
      toast.success('Imagem salva.')
    }

    setFormIsSubmitting(false)
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    setImageUrl(URL.createObjectURL(event.target!.files![0]))
    setImage(event.target!.files![0])
  }

  async function handleRemoveImageFromDatabase() {
    setImageFromDatabase('')

    // if (error) {
    //   toast.error(error)
    // }

    // if (imageNameNotFound) {
    //   toast.error('Não foi possivel encontrar o nome da imagem para deletar.')
    // }

    // if (success) {
    //   toast.success('Imagem deletada com sucesso.')
    // }

    // if (tripNotFound) {
    //   toast.error('Não foi possivel encontrar a viagem no banco de dados.')
    // }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Imagens</h2>

        <ImageIcon
          role="icon-image"
          aria-label="icon-image"
          className="size-5 rounded-xl"
        />
      </div>

      {imageFromDatabase ? (
        <div className="space-y-4">
          <div className="space-y-4">
            <Image
              width={300}
              height={300}
              src={imageFromDatabase}
              className="w-full"
              alt="foto da imagem da viagem."
            />
            <Button
              title="Excluir a imagem da viagem"
              onClick={handleRemoveImageFromDatabase}
              size="full"
              variant={guestPayload ? 'disabled' : 'secondary'}
            >
              <Trash2 className="text-red-500" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {imageUrl ? (
            <div className="space-y-4">
              <Image
                width={300}
                height={300}
                src={imageUrl}
                className="w-full"
                alt="foto da imagem que o usuario selecinou"
              />
              <Button
                onClick={() => {
                  setImage(null)
                  setImageUrl('')
                }}
                size="full"
                variant="secondary"
              >
                <Trash2 className="text-red-500" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-zinc-600 border-dashed rounded-lg cursor-pointer bg-zinc-900"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-zinc-500 dark:text-zinc-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-center text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">
                      Clica para selecionar a imagem
                    </span>{' '}
                    ou solta ela neste campo
                  </p>
                </div>
                <input
                  onChange={handleImageChange}
                  name="image-trip"
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                />
              </label>
            </div>
          )}

          {formIsSubmitting ? (
            <Button disabled variant="primary" size="full">
              <LoaderCircle className="animate-spin" />
            </Button>
          ) : (
            <Button onClick={handleAddImageTrip} variant="primary" size="full">
              Enviar
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
