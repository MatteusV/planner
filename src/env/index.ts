import 'dotenv'
import { z } from 'zod'

const envSchema = z.object({
  API_BASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3001),
  WEB_BASE_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)
