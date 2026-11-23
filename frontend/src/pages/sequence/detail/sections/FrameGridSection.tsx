import type React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import FrameArtwork from './FrameArtwork'
import type { IFrameGridSectionProps } from '../interface'
import StatusLegend from './StatusLegend'

const FrameGridSection: React.FC<IFrameGridSectionProps> = ({
  frames,
  scene,
  totalFrameCount,
  currentPage,
  totalPageCount,
  selectedFrameIndex,
  onSelectFrame,
  onPageChange
}) => {
  const firstFrameNumber = frames[0]?.frameIndex ?? 0
  const lastFrameNumber = frames.at(-1)?.frameIndex ?? -1

  return (
    <section aria-labelledby="frame-grid-heading" className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.025)]">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold text-slate-800" id="frame-grid-heading">All frames</h2>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">{totalFrameCount.toLocaleString()}</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Select a frame to inspect it in the full frame view</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-slate-500">
          <StatusLegend color="bg-slate-300" label="Not segmented" />
          <StatusLegend color="bg-emerald-500" label="Segmented" />
          <StatusLegend color="bg-amber-400" label="Processing" />
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm border-2 border-blue-600" /> Selected</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:p-5 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
        {frames.map((frame) => {
          const isSelected = frame.frameIndex === selectedFrameIndex
          const isUnsegmented = frame.status === 'unsegmented'
          const isProcessing = frame.status === 'processing'

          return (
            <button
              aria-label={`Select frame ${frame.frameId}, ${frame.status}`}
              aria-pressed={isSelected}
              className={`group cursor-pointer overflow-hidden rounded-xl border-2 bg-white text-left transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isSelected ? 'border-blue-600 ring-2 ring-blue-100' : 'border-transparent'}`}
              data-frame-index={frame.frameIndex}
              key={frame.frameIndex}
              onClick={onSelectFrame}
              type="button"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
                <FrameArtwork frameNumber={frame.frameIndex} imageUrl={frame.rawImageUrl} isUnsegmented={isUnsegmented} scene={scene} viewMode="raw" />
                {isProcessing && <div className="absolute inset-0 bg-amber-300/55" />}
                {isProcessing && <span className="absolute left-1.5 top-1.5 rounded bg-amber-400 px-1.5 py-1 text-[9px] font-semibold text-amber-950">Processing</span>}
              </div>
              <div className="flex items-center justify-between gap-1 px-2 py-2">
                <span className={`truncate text-[10px] font-medium ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>{frame.frameId}</span>
                <span aria-label={frame.status} className={`size-1.5 shrink-0 rounded-full ${isUnsegmented ? 'bg-slate-300' : isProcessing ? 'bg-amber-400' : 'bg-emerald-500'}`} />
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-[11px] text-slate-500">
          Showing <span className="font-medium text-slate-700">{firstFrameNumber + 1}–{lastFrameNumber + 1}</span> of {totalFrameCount.toLocaleString()} frames
        </p>
        <div className="flex items-center gap-2">
          <Button
            aria-label="Previous frames"
            className="size-8 cursor-pointer border-slate-200 p-0 text-slate-600 hover:bg-slate-50"
            disabled={currentPage <= 1}
            onClick={onPageChange}
            type="button"
            value={currentPage - 1}
            variant="outline"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-24 text-center text-[11px] text-slate-500">Page {currentPage} of {totalPageCount}</span>
          <Button
            aria-label="Next frames"
            className="size-8 cursor-pointer border-slate-200 p-0 text-slate-600 hover:bg-slate-50"
            disabled={currentPage >= totalPageCount}
            onClick={onPageChange}
            type="button"
            value={currentPage + 1}
            variant="outline"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}


export default FrameGridSection
