import type React from 'react'
import type { IMetadataFieldProps } from '../interface'

const MetadataItem: React.FC<IMetadataFieldProps> = ({ label, value }) => (
  <div><p className="text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400">{label}</p><p className="mt-1.5 text-xs font-medium tabular-nums text-slate-700">{value}</p></div>
)

export default MetadataItem
