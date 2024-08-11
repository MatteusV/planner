'use client'

import {
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  Drawer,
  DrawerDescription,
} from '@/components/ui/drawer'
import { Textarea } from '@/components/ui/textarea'
import { IncomingMessage } from '@/components/incoming-message'
import { socket } from '@/socket'
import { MessageCircleMore, Send } from 'lucide-react'
import { ChangeEvent, useEffect, useState } from 'react'
import { UserMessage } from '@/components/user-message'
import { getParticipantByEmail } from '@/app/api/server-actions/get-participant-by-email'
import { toast } from 'sonner'

interface Message {
  content: string
  ownerMessageName: string
  ownerMessageEmail: string
  userId?: string
  tripId: string
}

interface Guest {
  id: string
  name: string
  email: string
}

interface User {
  id: string
  name: string
  email: string
  password: string
  image_url: string | null
}

interface ModalChatProps {
  tripId: string
}

interface FetchMessage {
  id: string
  content: string
  trip_id: string
  user_id: string | null
  participant: { id: string; name: string } | null
  user: { id: string; name: string; image_url: string } | null
  created_at: Date
}

export function ModalChat({ tripId }: ModalChatProps) {
  const [newMessage, setNewMessage] = useState('')
  const [hasNewMessages, setHasNewMessages] = useState(false)
  const [messages, setMessages] = useState<FetchMessage[]>([])
  const [guestPayload, setGuestPayload] = useState<Guest | null>()
  const [user, setUser] = useState<User>()

  useEffect(() => {
    const guest = window.localStorage.getItem('guest')

    if (guest) {
      const guestJson = JSON.parse(guest)
      getParticipantByEmail({
        email: guestJson.email,
        name: guestJson.name,
        tripId,
      }).then((response) => {
        if (response.participantNotFound === true) {
          toast.error('Não foi possivel encontrar seus dados na viagem.')
        }

        if (response.participantId) {
          setGuestPayload({
            id: response.participantId,
            email: response.email,
            name: response.name,
          })
        }
      })
    } else {
      fetch('/api/user/token', {
        method: 'GET',
      }).then(async (response) => {
        const responseJson = await response.json()
        if (response.status === 200) setUser(responseJson.user)
      })
    }

    socket.emit('fetch messages', tripId)

    socket.on('get messages', (messagesFromServer: FetchMessage[]) => {
      const newMessages = messagesFromServer.filter(
        (msgFromServer) =>
          !messages.some((oldMsg) => oldMsg.id === msgFromServer.id),
      )

      if (newMessages.length > 0) {
        setMessages((prev) => [...prev, ...newMessages])
        setHasNewMessages(true)
      }
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('get messages')
    }
  }, [tripId, messages])

  function handleNewMessage(event: ChangeEvent<HTMLTextAreaElement>) {
    if (event.target.value.length === 0) {
      setNewMessage('')
    }

    setNewMessage(event.target.value)
  }

  function sendMessage() {
    if (newMessage) {
      let message: Message

      if (user) {
        message = {
          content: newMessage,
          ownerMessageName: user.name,
          ownerMessageEmail: user.email,
          userId: user.id,
          tripId,
        }

        setNewMessage('')
        socket.emit('new message', message)
      } else if (guestPayload) {
        message = {
          content: newMessage,
          ownerMessageName: guestPayload.name,
          ownerMessageEmail: guestPayload.email,
          tripId,
        }

        setNewMessage('')
        socket.emit('new message', message)
      }
    }
  }
  return (
    <div className="right-10 bottom-10 fixed">
      <Drawer>
        <DrawerTrigger onClick={() => setHasNewMessages(false)}>
          <MessageCircleMore className="size-10 text-emerald-400" />
          {hasNewMessages && (
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full notification-dot"></div>
          )}
        </DrawerTrigger>
        <DrawerDescription />

        <DrawerContent className="ml-auto w-[30%] max-sm:w-[100%] max-sm:h-[90%] max-md:w-[80%] h-[100%] bg-black">
          <DrawerHeader>
            <DrawerTitle className="text-center text-purple">Chat</DrawerTitle>
          </DrawerHeader>
          <div className="w-full p-2  mt-[0.94rem] h-max">
            <div className="space-y-4">
              {messages.map((message) => {
                if (
                  user?.id === message.user_id ||
                  guestPayload?.id === message.participant?.id
                ) {
                  return (
                    <UserMessage
                      date={message.created_at}
                      content={message.content}
                      key={message.id}
                    />
                  )
                }
                return (
                  <IncomingMessage
                    content={message.content}
                    userName={message.user?.name ?? message.participant?.name}
                    key={message.id}
                    date={message.created_at}
                    imageUrl={message.user?.image_url}
                  />
                )
              })}
            </div>
          </div>
          <DrawerFooter className="flex flex-row justify-between items-center">
            <Textarea
              value={newMessage}
              onChange={handleNewMessage}
              placeholder="Mensagem"
            />
            <button onClick={sendMessage} className="hover:cursor-pointer">
              <Send className="size-5 text-emerald-500 hover:text-emerald-400" />
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
