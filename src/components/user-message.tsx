import { formatRelativeTime } from '@/utils/format-relative-time'

interface UserMessageProps {
  content: string
  date: Date
}

export function UserMessage({ content, date }: UserMessageProps) {
  const { formattedDate } = formatRelativeTime({ date })
  return (
    <div className="flex items-center gap-1.5 justify-end pr-1.5">
      <div className="max-w-[50%] break-words">
        <p className="text-sm">{content}</p>
        <span className="text-[10px] text-zinc-400">{formattedDate}</span>
      </div>
    </div>
  )
}
