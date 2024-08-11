import Image from 'next/image'
import { formatRelativeTime } from '@/utils/format-relative-time'

interface IncomingMessageProps {
  imageUrl?: string
  content: string
  userName?: string
  date: Date
}

export function IncomingMessage({
  content,
  imageUrl,
  userName,
  date,
}: IncomingMessageProps) {
  const { formattedDate } = formatRelativeTime({ date })
  return (
    <div className="flex items-center gap-1.5">
      <Image
        src={imageUrl ?? '/logo.svg'}
        alt="avatar do usuario"
        width={20}
        height={20}
        className="rounded-full border size-8"
      />
      <div>
        <span className="text-xs text-zinc-400">{userName}:</span>
        <p className="text-sm">{content}</p>
        <span className="text-[10px] text-zinc-400">{formattedDate}</span>
      </div>
    </div>
  )
}
