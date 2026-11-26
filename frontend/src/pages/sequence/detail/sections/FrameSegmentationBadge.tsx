import type React from 'react'
import type { IFrameSegmentationBadgeProps } from '../interface'

const FrameSegmentationBadge: React.FC<IFrameSegmentationBadgeProps> = ({ statusLabel, status }) => {
  const statusStyles = { segmented: 'bg-emerald-50 text-emerald-700', processing: 'bg-amber-50 text-amber-800', unsegmented: 'bg-slate-100 text-slate-500' }
  return <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${statusStyles[status]}`}>{statusLabel}</span>
}

export default FrameSegmentationBadge
