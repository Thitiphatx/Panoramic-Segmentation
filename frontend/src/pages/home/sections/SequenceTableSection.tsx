import type React from 'react'
import { ArrowDownUp, ChevronDown, Filter, MapPin, Search } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import SequenceThumbnail from './SequenceThumbnail'
import type { ISequenceTableSectionProps, SequenceFilter } from '../interface'
import SequenceStatusBadge from './SequenceStatusBadge'

const filters: SequenceFilter[] = ['All sequences', 'Available', 'Processing']

const SequenceTableSection: React.FC<ISequenceTableSectionProps> = ({
  sequences,
  totalSequenceCount,
  availableSequenceCount,
  selectedSequenceId,
  searchTerm,
  activeFilter,
  onSearchChange,
  onFilterChange,
  onSelectSequence
}) => {
  return (
    <section aria-labelledby="sequence-table-heading" className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.025)]">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold text-slate-800" id="sequence-table-heading">All sequences</h2>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">{totalSequenceCount}</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Synced KITTI-360 drives ready for inspection</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block sm:w-[260px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10"
              onChange={onSearchChange}
              placeholder="Search sequences..."
              type="search"
              value={searchTerm}
            />
          </label>
          <Button className="h-10 cursor-pointer gap-2 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50" variant="outline">
            <Filter className="size-3.5" /> Filter <ChevronDown className="size-3.5 text-slate-400" />
          </Button>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-5 sm:px-6">
        {filters.map((filter) => {
          const isActive = filter === activeFilter

          return (
            <button
              aria-pressed={isActive}
              className={`relative -mb-px cursor-pointer whitespace-nowrap px-3 py-3 text-xs font-medium transition ${isActive ? 'border-b-2 border-cyan-600 text-cyan-700 hover:text-cyan-800' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
              key={filter}
              onClick={onFilterChange}
              type="button"
              value={filter}
            >
              {filter}
              {filter === 'Available' && <span className="ml-1.5 text-[10px] text-slate-400">{availableSequenceCount}</span>}
            </button>
          )
        })}
        <span className="ml-auto hidden items-center gap-1.5 text-[11px] text-slate-400 sm:flex">
          <ArrowDownUp className="size-3.5" /> Newest first
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/70 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              <th className="px-6 py-3.5">Sequence name</th>
              <th className="px-4 py-3.5">Frames</th>
              <th className="px-4 py-3.5">Duration</th>
              <th className="px-4 py-3.5">Storage</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-5 py-3.5"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sequences.map((sequence) => {
              const isSelected = sequence.id === selectedSequenceId

              return (
                <tr className={`transition hover:bg-slate-50/70 ${isSelected ? 'bg-cyan-50/35' : ''}`} key={sequence.id}>
                  <td className="px-6 py-3.5">
                    <Link
                      className="group flex cursor-pointer items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                      to={`/sequences/${encodeURIComponent(sequence.id)}`}
                    >
                      <SequenceThumbnail scene={sequence.scene} />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-700 group-hover:text-cyan-700">{sequence.id}</p>
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400"><MapPin className="size-3" /> Stuttgart, Germany <span className="mx-0.5">·</span> {sequence.date}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-xs font-medium tabular-nums text-slate-600">{sequence.frames.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-xs tabular-nums text-slate-500">{sequence.duration}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{sequence.storage}</td>
                  <td className="px-4 py-3.5"><SequenceStatusBadge status={sequence.status} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end">
                      <Button
                        className={`h-8 cursor-pointer rounded-lg px-3 text-xs hover:bg-slate-100 ${isSelected ? 'text-cyan-700' : 'text-slate-500'}`}
                        data-sequence-id={sequence.id}
                        onClick={onSelectSequence}
                        size="sm"
                        variant="ghost"
                      >
                        Preview
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {sequences.length === 0 && (
              <tr>
                <td className="px-6 py-14 text-center text-sm text-slate-400" colSpan={6}>
                  No sequences match “{searchTerm}”. Try a different name or filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-[11px] text-slate-400">Showing <span className="font-medium text-slate-600">{sequences.length}</span> of {totalSequenceCount} sequences</p>
        <div className="flex items-center gap-2 text-[11px] text-slate-400"><span className="size-1.5 rounded-full bg-emerald-400" /> Dataset synced just now</div>
      </div>
    </section>
  )
}


export default SequenceTableSection
