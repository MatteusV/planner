import { Link2, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/button'
import { env } from '@/env'

interface Link {
  id: string
  title: string
  url: string
  trip_id: string
  owner_email: string
  owner_name: string
}

interface ImportantLinkProps {
  openCreateImportantLinkModal: () => void
}

interface Guest {
  email: string
  name: string
}

export function ImportantLinks({
  openCreateImportantLinkModal,
}: ImportantLinkProps) {
  const { tripId } = useParams()
  const [links, setLinks] = useState<Link[]>()
  const [guestPayload, setGuestPayload] = useState<Guest>()

  useEffect(() => {
    fetch(`/api/trips/${tripId}/links`, {
      method: 'GET',
    }).then(async (response) => {
      const responseJson = await response.json()
      setLinks(responseJson.links)
    })

    const guest = window.localStorage.getItem('guest')

    if (guest) {
      setGuestPayload(JSON.parse(guest))
    }
  }, [tripId])

  async function handleRemoveLink(linkId: string) {
    const { status } = await fetch(
      `${env.API_BASE_URL}/api/links/${linkId}/delete`,
      {
        method: 'delete',
      },
    )

    if (status !== 200) {
      toast.error('Erro ao deletar o link.')
      return
    }

    setLinks((prevLinks) => prevLinks?.filter((link) => link.id !== linkId))
  }

  return (
    <div className="space-y-6">
      <h2 className="font-semibold text-xl">Links importantes</h2>

      <div className="space-y-5">
        {links?.map((link) => (
          <div
            title={`${link.owner_email} criou esse link`}
            key={link.id}
            className="flex items-center justify-between  max-w-full min-w-full"
          >
            <div className="space-y-1.5">
              <span className="block font-medium text-zinc-100">
                {link.title}
              </span>
              <a
                href={link.url}
                target="_blank"
                className="block text-xs text-zinc-400 truncate hover:text-zinc-200"
                rel="noreferrer"
              >
                {link.url}
              </a>
            </div>

            <div className="flex gap-2.5">
              <Link2 className="text-zinc-400 size-5 shrink-0" />
              {guestPayload ? (
                <button
                  disabled={link.owner_email !== guestPayload?.email}
                  onClick={() => handleRemoveLink(link.id)}
                >
                  <Trash2
                    data-disabled={link.owner_email !== guestPayload?.email}
                    className="text-red-400 size-5 shrink-0 data-[disabled=true]:text-zinc-400"
                  />
                </button>
              ) : (
                <button onClick={() => handleRemoveLink(link.id)}>
                  <Trash2 className="text-red-400 size-5 shrink-0" />
                </button>
              )}
            </div>
          </div>
        ))}

        <Button
          onClick={openCreateImportantLinkModal}
          variant="secondary"
          size="full"
        >
          <Plus className="size-5" />
          Cadastrar novo link
        </Button>
      </div>
    </div>
  )
}
