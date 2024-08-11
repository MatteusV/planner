import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { Inter } from 'next/font/google'

export const metadata: Metadata = {
  title: 'Plann.er',
  description: 'Site para criar, gerenciar e convidar amigos para viagens.',
}

const inter = Inter({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  style: ['normal'],
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-br">
      <body className={`${inter.className} bg-zinc-950 text-zinc-50`}>
        <Toaster theme="dark" />
        {children}
      </body>
    </html>
  )
}
