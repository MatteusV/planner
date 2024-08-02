import { createInitials } from '../utils/create-initials'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

interface UsersInTripsProps {
  imageUrl?: string
  name: string
}

export function UsersInTrips({ name, imageUrl }: UsersInTripsProps) {
  const initial = createInitials(name ?? 'user guest')
  return (
    <Avatar className="w-8 h-8 border border-[#a3e635]">
      <AvatarImage src={imageUrl} />
      <AvatarFallback>{initial}</AvatarFallback>
    </Avatar>
  )
}
