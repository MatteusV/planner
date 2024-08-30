import Axios from 'axios'

export const api = Axios.create({
  baseURL: 'https://planner-nest-production.up.railway.app',
  // baseURL: 'http://localhost:3000',
  withCredentials: true,
})
