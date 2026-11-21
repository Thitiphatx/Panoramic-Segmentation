import type React from 'react'
import { useCallback, useMemo, useState, type MouseEvent } from 'react'
import { Activity, ArrowLeft, Database } from 'lucide-react'
import { Link, useParams } from 'react-router'
import FrameGridSection from './sections/FrameGridSection'
import FrameViewerSection from './sections/FrameViewerSection'
import SequenceMetadataSection from './sections/SequenceMetadataSection'
import { sequences } from '@/data/sequences'
import type { FrameViewMode } from './interface'
import { createFrameRecord } from './data'

const FRAME_PAGE_SIZE = 48

const SequenceDetailPage: React.FC = () => {
  const { sequenceId = '' } = useParams()

  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0)
  const [frameViewMode, setFrameViewMode] = useState<FrameViewMode>('raw')
  const [framePage, setFramePage] = useState(1)

  const sequence = useMemo(
    () => sequences.find((sequenceItem) => sequenceItem.id === sequenceId),
    [sequenceId],
  )

  const frames = useMemo(() => {
    if (!sequence) {
      return []
    }

    return Array.from({ length: sequence.frames }, (_, frameIndex) => createFrameRecord(frameIndex))
  }, [sequence])

  const selectedFrame = useMemo(
    () => frames.find((frame) => frame.frameIndex === selectedFrameIndex) ?? frames[0],
    [frames, selectedFrameIndex],
  )

  const currentPageFrames = useMemo(
    () => frames.slice((framePage - 1) * FRAME_PAGE_SIZE, framePage * FRAME_PAGE_SIZE),
    [framePage, frames],
  )

  const totalPageCount = useMemo(
    () => Math.max(1, Math.ceil(frames.length / FRAME_PAGE_SIZE)),
    [frames.length],
  )

  const handleFrameViewModeChange = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setFrameViewMode(event.currentTarget.value as FrameViewMode)
  }, [])

  const handleSelectFrame = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    const frameIndex = Number(event.currentTarget.dataset.frameIndex)

    if (Number.isInteger(frameIndex) && frameIndex >= 0) {
      setSelectedFrameIndex(frameIndex)
      setFramePage(Math.floor(frameIndex / FRAME_PAGE_SIZE) + 1)
    }
  }, [])

  const handlePageChange = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    const nextPage = Number(event.currentTarget.value)

    if (Number.isInteger(nextPage) && nextPage >= 1 && nextPage <= totalPageCount) {
      setFramePage(nextPage)
      setSelectedFrameIndex((nextPage - 1) * FRAME_PAGE_SIZE)
    }
  }, [totalPageCount])

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <header className="flex h-16 items-center justify-between bg-[#111b2d] px-5 text-white sm:px-8">
        <Link className="flex cursor-pointer items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300" to="/">
          <span className="flex size-8 items-center justify-center rounded-lg bg-cyan-400 text-[#102035]"><Activity className="size-4" /></span>
          <span className="text-sm font-bold tracking-[0.12em]">PANO <span className="ml-1.5 font-normal tracking-normal text-slate-400">Segmentation Lab</span></span>
        </Link>
        <span className="flex items-center gap-2 text-[11px] text-slate-300"><Database className="size-3.5" /> Local KITTI-360 workspace</span>
      </header>

      <main className="mx-auto max-w-[1500px] space-y-5 px-4 py-5 sm:px-7 sm:py-7 xl:px-10">
        {sequence && selectedFrame ? (
          <>
            <SequenceMetadataSection sequence={sequence} />
            <FrameViewerSection
              frame={selectedFrame}
              onViewModeChange={handleFrameViewModeChange}
              sequence={sequence}
              viewMode={frameViewMode}
            />
            <FrameGridSection
              currentPage={framePage}
              frames={currentPageFrames}
              onPageChange={handlePageChange}
              onSelectFrame={handleSelectFrame}
              scene={sequence.scene ?? 'city'}
              selectedFrameIndex={selectedFrame.frameIndex}
              totalFrameCount={sequence.frames}
              totalPageCount={totalPageCount}
            />
          </>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
            <h1 className="text-lg font-semibold text-slate-800">Sequence not found</h1>
            <p className="mt-2 text-sm text-slate-500">This sequence is not available in the mock dataset.</p>
            <Link className="mt-5 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-cyan-700 hover:text-cyan-800" to="/">
              <ArrowLeft className="size-4" /> Return to sequence library
            </Link>
          </section>
        )}
      </main>
    </div>
  )
}

export default SequenceDetailPage
