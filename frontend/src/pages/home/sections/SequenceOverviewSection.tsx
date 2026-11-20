import type React from 'react'
import { ChevronRight, Clock3, Database, MapPin, Video } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import SequenceThumbnail from './SequenceThumbnail'
import type { ISequenceOverviewSectionProps } from '../interface'
import SummaryCard from './SummaryCard'

const SequenceOverviewSection: React.FC<ISequenceOverviewSectionProps> = ({
  selectedSequence,
  totalFrames,
  readySequenceCount
}) => {
  return (
    <section aria-label="Sequence overview" className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total sequences" value="08" detail="KITTI-360 collection" />
        <SummaryCard label="Total frames" value={totalFrames.toLocaleString()} detail="Rectified stereo frames" />
        <SummaryCard label="Dataset size" value="31.1 GB" detail="Across 8 sequences" />
        <SummaryCard label="Ready to explore" value={`${readySequenceCount} / 8`} detail="Sequences indexed" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.025)] sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.15em] text-slate-400">
                <span className="size-1.5 rounded-full bg-cyan-500" /> SELECTED SEQUENCE
              </div>
              <h2 className="mt-2 break-all text-sm font-semibold text-slate-800">{selectedSequence.id}</h2>
              <p className="mt-1.5 text-xs text-slate-400">{selectedSequence.camera} <span className="mx-1">·</span> {selectedSequence.weather}</p>
            </div>
            <Button asChild className="h-9 w-fit cursor-pointer gap-2 rounded-lg border-slate-200 text-xs text-slate-600 hover:bg-slate-50" variant="outline">
              <Link to={`/sequences/${encodeURIComponent(selectedSequence.id)}`}>
                Open sequence <ChevronRight className="size-3.5" />
              </Link>
            </Button>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2.5">
            <SequenceThumbnail isLarge scene={selectedSequence.scene} />
            <SequenceThumbnail isLarge scene="overcast" />
            <SequenceThumbnail isLarge scene="sunset" />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5"><Video className="size-3.5 text-slate-400" /> {selectedSequence.frames.toLocaleString()} frames</span>
            <span className="flex items-center gap-1.5"><Clock3 className="size-3.5 text-slate-400" /> {selectedSequence.duration} duration</span>
            <span className="flex items-center gap-1.5"><MapPin className="size-3.5 text-slate-400" /> Stuttgart, Germany</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.025)] sm:p-6">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Database className="size-4 text-cyan-600" /> Dataset health</div>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700">Healthy</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-400">Local source · KITTI-360</p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Indexed drives</p>
              <p className="mt-1.5 text-xl font-semibold tracking-tight text-slate-800">08<span className="ml-1 text-xs font-normal text-slate-400">/ 8</span></p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Available frames</p>
              <p className="mt-1.5 text-xl font-semibold tracking-tight text-slate-800">{totalFrames.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-cyan-100 bg-cyan-50/60 px-3 py-2.5 text-[11px] leading-5 text-cyan-900/70">
            Sequence details and preview imagery are sample content.
          </div>
        </div>
      </div>
    </section>
  )
}


export default SequenceOverviewSection
