import { dayjs } from '@/lib/dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export function formatRelativeTime({ date }: { date: Date }) {
  const formattedDate = dayjs(date).fromNow()
  return { formattedDate }
}
