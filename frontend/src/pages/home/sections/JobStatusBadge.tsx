import type React from 'react'
import { Check, Clock3, LoaderCircle, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { IJobStatusBadgeProps } from '../interface'

const JobStatusBadge: React.FC<IJobStatusBadgeProps> = ({ status }) => {
  const isRunning = status === 'Running'
  const isQueued = status === 'Queued'
  const isCompleted = status === 'Completed'
  const StatusIcon = isRunning ? LoaderCircle : isQueued ? Clock3 : isCompleted ? Check : X

  return (
    <Badge
      className={`h-auto border-0 px-2.5 py-1 text-[10px] font-medium gap-1.5 ${
        isRunning
          ? 'bg-cyan-50 text-cyan-700'
          : isQueued
            ? 'bg-amber-50 text-amber-700'
            : isCompleted
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-500'
      }`}
      variant="outline"
    >
      <StatusIcon className={`size-3 ${isRunning ? 'animate-spin' : ''}`} />
      {status}
    </Badge>
  )
}

export default JobStatusBadge
