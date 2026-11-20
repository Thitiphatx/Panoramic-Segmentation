import type React from 'react'
import type { ISummaryCardProps } from '../interface'

const SummaryCard: React.FC<ISummaryCardProps> = ({ label, value, detail }) => (
  <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.025)] sm:p-5">
    <p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold tracking-tight text-slate-800">{value}</p><p className="mt-2 text-[11px] text-slate-400">{detail}</p>
  </div>
)

export default SummaryCard
