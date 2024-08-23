import Axios from 'axios'
import { setupCache } from 'axios-cache-interceptor'

const instance = Axios.create({
  baseURL: 'https://planner-nest-production.up.railway.app',
  withCredentials: true,
})
const axios = setupCache(instance, {
  debug: console.log,
})

export const api = axios
