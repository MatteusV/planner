import { env } from '@/env'
import { Axios } from 'axios'

export const api = new Axios({ baseURL: `${env.API_BASE_URL}` })
