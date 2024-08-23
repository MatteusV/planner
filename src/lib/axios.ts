import Axios from 'axios'
import { setupCache } from 'axios-cache-interceptor'

const instance = Axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
})
const axios = setupCache(instance, {
  debug: console.log,
})

export const api = axios
