import type React from 'react'
import { Badge } from '@/components/ui/badge'
import type { ISequenceStatusBadgeProps } from '../interface'

const SequenceStatusBadge: React.FC<ISequenceStatusBadgeProps> = ({ status }) => {
  const isReady = status === 'Ready'

  return (
    <Badge
      className={`h-auto border-0 px-2.5 py-1 text-[10px] font-medium gap-1.5 ${
        isReady ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
      }`}
      variant="outline"
    >
      <span className={`size-1.5 rounded-full ${isReady ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      {status}
    </Badge>
  )
}

export default SequenceStatusBadge
