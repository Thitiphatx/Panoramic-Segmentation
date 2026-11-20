import type React from 'react'
import type { ISequenceStatusBadgeProps } from '../interface'

const SequenceStatusBadge: React.FC<ISequenceStatusBadgeProps> = ({ status }) => {
  const isReady = status === 'Ready'
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${isReady ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}><span className={`size-1.5 rounded-full ${isReady ? 'bg-emerald-500' : 'bg-amber-500'}`} />{status}</span>
}

export default SequenceStatusBadge
