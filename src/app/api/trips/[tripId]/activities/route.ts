import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dayjs } from '@/lib/dayjs'

const requestParamsSchema = z.object({
  tripId: z.string().uuid(),
})

export async function GET(
  request: Request,
  { params }: { params: { tripId: string } },
) {
  const { tripId } = requestParamsSchema.parse(params)

  const trip = await prisma.trip.findUnique({
    where: {
      id: tripId,
    },
    include: {
      activities: {
        orderBy: {
          occurs_at: 'asc',
        },
      },
    },
  })

  if (!trip) {
    throw new Error('Trip not found.')
  }

  const differenceInDaysBetweenTripStartAndEnd = dayjs(trip.ends_at).diff(
    trip.starts_at,
    'days',
  )

  const activities = Array.from({
    length: differenceInDaysBetweenTripStartAndEnd + 1,
  }).map((_value, index) => {
    const date = dayjs(trip.starts_at).add(index, 'days')

    return {
      date: date.toDate(),
      activities: trip.activities
        .map((activity) => ({
          ...activity,
          has_occurred: dayjs(activity.occurs_at).isBefore(dayjs()),
        }))
        .filter((activity) => {
          return dayjs(activity.occurs_at).isSame(date, 'day')
        }),
    }
  })

  return NextResponse.json({ activities })
}
