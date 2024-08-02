'use client'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CircleCheck, CircleX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface Activity {
  date: string
  activities: {
    id: string
    title: string
    occurs_at: string
    has_occurred: boolean
  }[]
}

export function Activities() {
  const { tripId } = useParams()
  const [activities, setActivities] = useState<Activity[]>([])
  useEffect(() => {
    fetch(`/api/trips/${tripId}/activities`, {
      method: 'GET',
    }).then(async (response) => {
      const responseJson = await response.json()
      setActivities(responseJson.activities)
    })
  }, [tripId])

  return (
    <div className="space-y-8 overflow-y-scroll h-[calc(80vh-50px)]">
      {activities.length > 0 &&
        activities.map((category) => {
          return (
            <div key={category.date} className="space-y-2.5">
              <div className="flex gap-2 items-baseline">
                <span className="text-xl text-zinc-300 font-semibold">
                  Dia {format(category.date, 'd')}
                </span>
                <span className="text-xs text-zinc-500">
                  {format(category.date, 'EEEE', { locale: ptBR })}
                </span>
              </div>
              {category.activities.length > 0 ? (
                <div className="space-y-1.5">
                  {category.activities.map((activity) => {
                    return (
                      <div key={activity.id} className="space-y-2.5">
                        <div className="px-4 py-2.5 bg-zinc-900 rounded-xl shadow-shape flex items-center gap-3">
                          {activity.has_occurred ? (
                            <CircleCheck className="size-5 text-lime-300" />
                          ) : (
                            <CircleX className="size-5 text-zinc-500" />
                          )}
                          <span className="text-zinc-100">
                            {activity.title}
                          </span>
                          <span className="text-zinc-400 text-sm ml-auto">
                            {format(activity.occurs_at, 'HH:mm')}h
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-zinc-500 text-sm">
                  Nenhuma atividade cadastrada nessa data.
                </p>
              )}
            </div>
          )
        })}
    </div>
  )
}
