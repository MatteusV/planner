'use server'

import { cookies } from 'next/headers'

interface getCookieProps {
  title: string
}

export async function getCookie({ title }: getCookieProps) {
  const cookieStore = cookies()

  const tokenJwt = cookieStore.get(title)

  return { tokenJwt }
}
