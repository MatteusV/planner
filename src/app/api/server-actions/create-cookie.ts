'use server'

import { cookies } from 'next/headers'

interface CreateCookieProps {
  title: string
  content: string
}

export async function createCookie({ content, title }: CreateCookieProps) {
  const cookieStore = cookies()
  cookieStore.set(title, content, {
    path: '/',
    sameSite: true,
  })

  const cookie = cookieStore.get(title)

  if (!cookie) {
    return { success: false }
  }
  return { success: true }
}
