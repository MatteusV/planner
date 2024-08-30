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
import { MessageCircleMore, Send } from 'lucide-react'
import { ChangeEvent, useEffect, useState } from 'react'
import { UserMessage } from '@/components/user-message'
import { api } from '@/lib/axios'
import { io } from 'socket.io-client'
import { getCookie } from '@/app/server-actions/get-cookie'

interface Message {
  content: string
  participant_id?: string
  user_id?: string
  trip_id: string
}

interface Guest {
  id: string
  name: string
  email: string
  is_confirmed: boolean
  is_owner: boolean
  trip_id: string
}

interface User {
  id: string
  name: string
  email: string
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
  participant?: { id: string; name: string } | null
  user?: { id: string; name: string; image_url: string } | null
  created_at: Date
}

const socket = io('ws://planner-nest-production.up.railway.app')

export function ModalChat({ tripId }: ModalChatProps) {
  const [newMessage, setNewMessage] = useState('')
  const [hasNewMessages, setHasNewMessages] = useState(false)
  const [messages, setMessages] = useState<FetchMessage[]>([])
  const [guestPayload, setGuestPayload] = useState<Guest>()
  const [user, setUser] = useState<User>()

  useEffect(() => {
    async function getTokenJwt() {
      const { tokenJwt } = await getCookie({ title: '@planner:tokenJwt' })

      if (tokenJwt) {
        const { data, status } = await api.get('auth/profile')
        if (status === 200) {
          setUser(data.user)
        }
      }
    }

    const guest = window.localStorage.getItem('guest')
    if (guest) {
      setGuestPayload(JSON.parse(guest))
    } else {
      getTokenJwt()
    }

    socket.emit('findAllMessages', tripId)
    socket.on('messages', (receivedMessages) => {
      setMessages(receivedMessages)
    })
    socket.on('newMessage', (newMessage) => {
      setMessages((prevMessages) => {
        if (prevMessages.length > 0) {
          return [...prevMessages, newMessage]
        } else {
          return newMessage
        }
      })
    })
  }, [tripId])

  function handleNewMessage(event: ChangeEvent<HTMLTextAreaElement>) {
    if (event.target.value.length === 0) {
      setNewMessage('')
    }

    setNewMessage(event.target.value)
  }

  function sendMessage() {
    if (newMessage) {
      if (user) {
        const message: Message = {
          content: newMessage,
          trip_id: tripId,
          user_id: user.id,
        }
        socket.emit('createMessage', message)
      } else {
        const message: Message = {
          content: newMessage,
          trip_id: tripId,
          participant_id: guestPayload?.id,
        }
        console.log({ guestPayload, message })
        socket.emit('createMessage', message)
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
