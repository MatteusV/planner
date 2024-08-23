'use server'

import { cookies } from 'next/headers'

interface getCookieProsp {
  title: string
}

export async function getCookie({ title }: getCookieProsp) {
  const cookieStore = cookies()

  const tokenJwt = cookieStore.get(title)

  return { tokenJwt }
}
