import type React from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import type { ISequenceMetadataSectionProps } from '../interface'
import MetadataItem from './MetadataItem'

const SequenceMetadataSection: React.FC<ISequenceMetadataSectionProps> = ({ sequence }) => {
  return (
    <section aria-labelledby="sequence-metadata-heading" className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.025)] sm:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <Link className="mb-4 inline-flex cursor-pointer items-center gap-2 rounded-md text-xs font-medium text-slate-500 hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600" to="/">
            <ArrowLeft className="size-3.5" /> All sequences
          </Link>
          <p className="text-[10px] font-semibold tracking-[0.18em] text-cyan-700">SEQUENCE METADATA</p>
          <h1 className="mt-2 break-all text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl" id="sequence-metadata-heading">{sequence.id}</h1>
          <p className="mt-2 text-sm text-slate-500">KITTI-360 <span className="mx-1.5 text-slate-300">·</span> {sequence.date} <span className="mx-1.5 text-slate-300">·</span> Stuttgart, Germany</p>
        </div>
        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${sequence.status === 'Ready' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          <span className={`size-1.5 rounded-full ${sequence.status === 'Ready' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          {sequence.status}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-slate-100 pt-5 sm:grid-cols-3 xl:grid-cols-6">
        <MetadataItem label="Frame count" value={sequence.frames.toLocaleString()} />
        <MetadataItem label="Duration" value={sequence.duration} />
        <MetadataItem label="Storage" value={sequence.storage} />
        <MetadataItem label="Camera" value={sequence.camera ?? 'Image 00 · Stereo pair'} />
        <MetadataItem label="Conditions" value={sequence.weather ?? 'Clear · Daylight'} />
        <MetadataItem label="Source" value="Local KITTI-360" />
      </div>
    </section>
  )
}


export default SequenceMetadataSection
