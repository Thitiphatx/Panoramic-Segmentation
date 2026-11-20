import type React from 'react'
import type { IStatusLegendProps } from '../interface'

const StatusLegend: React.FC<IStatusLegendProps> = ({ color, label }) => <span className="flex items-center gap-1.5"><span className={`size-2 rounded-full ${color}`} /> {label}</span>

export default StatusLegend
