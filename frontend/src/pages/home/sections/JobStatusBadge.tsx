import type React from 'react'
import { Check, Clock3, LoaderCircle, X } from 'lucide-react'
import type { IJobStatusBadgeProps } from '../interface'

const JobStatusBadge: React.FC<IJobStatusBadgeProps> = ({ status }) => {
  const isRunning = status === 'Running'
  const isQueued = status === 'Queued'
  const isCompleted = status === 'Completed'
  const StatusIcon = isRunning ? LoaderCircle : isQueued ? Clock3 : isCompleted ? Check : X

  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${isRunning ? 'bg-cyan-50 text-cyan-700' : isQueued ? 'bg-amber-50 text-amber-700' : isCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}><StatusIcon className={`size-3 ${isRunning ? 'animate-spin' : ''}`} />{status}</span>
}

export default JobStatusBadge
