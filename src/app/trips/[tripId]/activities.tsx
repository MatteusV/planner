'use client'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CircleCheck, CircleX, Trash2 } from 'lucide-react'

interface ActivitiesProps {
  guestPayload?: { name: string; email: string }
  activities: {
    date: string
    activities: [
      {
        id: string
        title: string
        occurs_at: string
        has_occurred: false
      },
    ]
  }[]
}

export function Activities({ guestPayload, activities }: ActivitiesProps) {
  async function handleDeleteActivity(activityId: string) {
    console.log(activityId)
    // if (status === 200) {
    //   toast.success('Atividade deletada.')
    //   setTimeout(() => {
    //     window.location.reload()
    //   }, 800)
    // } else {
    //   toast.error('Não foi possivel deletar a atividade.')
    // }
  }

  if (!activities || activities.length === 0) {
    return <div>Carregando...</div>
  }

  return (
    <div className="space-y-8 overflow-y-scroll max-md:h-72 lg:h-[calc(80vh-50px)]">
      {activities.map(({ activities, date }) => {
        return (
          <div key={date} className="space-y-2.5">
            <div className="flex gap-2 items-baseline">
              <span className="text-xl text-zinc-300 font-semibold">
                Dia {format(date, 'd')}
              </span>
              <span className="text-xs text-zinc-500">
                {format(date, 'EEEE', { locale: ptBR })}
              </span>
            </div>
            {activities.length > 0 ? (
              <div className="space-y-1.5">
                {activities.map((activity) => {
                  return (
                    <div key={activity.id} className="space-y-2.5">
                      <div className="px-4 py-2.5 bg-zinc-900 rounded-xl shadow-shape flex items-center gap-3">
                        {activity.has_occurred ? (
                          <CircleCheck className="size-5 text-lime-300" />
                        ) : (
                          <CircleX className="size-5 text-zinc-500" />
                        )}
                        <span className="text-zinc-100">{activity.title}</span>
                        <span className="text-zinc-400 text-sm ml-auto">
                          {format(activity.occurs_at, 'HH:mm')}h
                        </span>
                        <button
                          onClick={() => handleDeleteActivity(activity.id)}
                          title={
                            activity.has_occurred || !!guestPayload
                              ? 'você não tem permissão para excluir a atividade.'
                              : 'excluir a atividade'
                          }
                          disabled={activity.has_occurred || !!guestPayload}
                        >
                          <Trash2
                            data-disabled={
                              activity.has_occurred || !!guestPayload
                            }
                            className="size-4 text-zinc-400 data-[disabled=true]:hidden hover:text-red-500 transition-all"
                          />
                        </button>
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
