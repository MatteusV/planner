'use client'

import { AtSign, Eye, EyeOff, LockKeyhole, User } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '../../components/button'
import { api } from '@/lib/axios'
import { getCookie } from '../api/server-actions/get-cookie'

export function LoginModal() {
  const [showPassword, setShowPassword] = useState(false)
  const [valuePassword, setValuePassword] = useState('')
  const [showRegister, setShowRegister] = useState(true)

  async function handleRegisterUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const dataForm = new FormData(event.currentTarget)
    const email = dataForm.get('email')?.toString()
    const name = dataForm.get('name')?.toString()
    const password = dataForm.get('password')?.toString()

    if (!name || !email || !password) {
      return toast.error('Preencha todos os campos.')
    }

    const { status } = await api.post('/users', {
      email,
      name,
      password,
    })

    if (status !== 201) {
      return toast.error('Erro ao cadastrar sua conta.')
    }

    toast.success('Faça o login na sua conta.')
  }

  async function handleLoginUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const dataForm = new FormData(event.currentTarget)
    const email = dataForm.get('email')?.toString()
    const password = dataForm.get('password')?.toString()

    const { status } = await api.post('/auth', {
      email,
      password,
    })

    if (status === 409) {
      toast.error('Email ja foi cadastrado.')
    }

    if (status === 200) {
      const { tokenJwt } = await getCookie({ title: '@planner:tokenJwt' })

      if (!tokenJwt) {
        toast.error('Erro ao salvar os cookies.')
        // const { success } = await createCookie({
        //   title: '@planner:tokenJwt',
        //   content: data.token,
        // })

        // if (success) {
        //   toast.success('Login feito.')
        // } else {
        toast.error('Erro ao salvar o token.')
        // }
      }
      toast.success('Login feito.')

      setTimeout(() => window.location.reload(), 700)
    }
  }

  if (showRegister) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
        <div className="w-[640px] rounded-xl py-5 px-6 shadow-shape bg-zinc-900 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-lg font-semibold">Primeiro crie sua conta</h2>
            </div>

            <p className="text-sm text-zinc-400">
              Para continuar a utilizar o site precisamos que você{' '}
              <span className="font-semibold text-zinc-100">se registre</span>{' '}
              caso ja tenha uma conta faça o{' '}
              <button
                onClick={() => setShowRegister(false)}
                className="font-semibold text-zinc-100 hover:cursor-pointer underline"
              >
                LOGIN
              </button>
            </p>
          </div>

          <form onSubmit={handleRegisterUser} className="space-y-3">
            <div className="h-14 px-4 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-2">
              <User className="text-zinc-400 size-5" />
              <input
                type="text"
                name="name"
                placeholder="Seu nome"
                className="bg-transparent text-lg placeholder-zinc-400 outline-none flex-1"
              />
            </div>

            <div className="h-14 px-4 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-2">
              <AtSign className="text-zinc-400 size-5" />
              <input
                type="email"
                name="email"
                placeholder="Seu e-mail pessoal"
                className="bg-transparent text-lg placeholder-zinc-400 outline-none flex-1"
              />
            </div>

            <div className="h-14 px-4 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-2">
              <LockKeyhole className="text-zinc-400 size-5" />
              <input
                value={valuePassword}
                onChange={(event) => setValuePassword(event.target.value)}
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Sua senha"
                className="bg-transparent text-lg placeholder-zinc-400 outline-none flex-1"
              />
              {showPassword ? (
                <button onClick={() => setShowPassword(false)} type="button">
                  <Eye className="text-zinc-400 size-5" />
                </button>
              ) : (
                <button onClick={() => setShowPassword(true)} type="button">
                  <EyeOff className="text-zinc-400 size-5" />
                </button>
              )}
            </div>

            <Button type="submit" size="full">
              Registrar
            </Button>
          </form>
        </div>
      </div>
    )
  } else {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
        <div className="w-[640px] rounded-xl py-5 px-6 shadow-shape bg-zinc-900 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-lg font-semibold">Primeiro faça o login</h2>
            </div>

            <p className="text-sm text-zinc-400">
              Caso não tenha uma conta{' '}
              <button
                onClick={() => setShowRegister(true)}
                className="font-semibold text-zinc-100 hover:cursor-pointer underline"
              >
                se registre
              </button>
            </p>
          </div>

          <form onSubmit={handleLoginUser} className="space-y-3">
            <div className="h-14 px-4 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-2">
              <AtSign className="text-zinc-400 size-5" />
              <input
                type="email"
                name="email"
                placeholder="Seu e-mail pessoal"
                className="bg-transparent text-lg placeholder-zinc-400 outline-none flex-1"
              />
            </div>

            <div className="h-14 px-4 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-2">
              <LockKeyhole className="text-zinc-400 size-5" />
              <input
                value={valuePassword}
                onChange={(event) => setValuePassword(event.target.value)}
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Sua senha"
                className="bg-transparent text-lg placeholder-zinc-400 outline-none flex-1"
              />
              {showPassword ? (
                <button onClick={() => setShowPassword(false)} type="button">
                  <Eye className="text-zinc-400 size-5" />
                </button>
              ) : (
                <button onClick={() => setShowPassword(true)} type="button">
                  <EyeOff className="text-zinc-400 size-5" />
                </button>
              )}
            </div>

            <Button type="submit" size="full">
              Login
            </Button>
          </form>
        </div>
      </div>
    )
  }
}
