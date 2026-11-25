import type React from 'react'
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router'
import FrameGridSection from './sections/FrameGridSection'
import FrameViewerSection from './sections/FrameViewerSection'
import SequenceMetadataSection from './sections/SequenceMetadataSection'
import { sequences } from '@/data/sequences'
import type { FrameViewMode, IFrameRecord } from './interface'
import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/response'
import type { ISequenceFrameRecord } from '@/types/frame'
import type { ISequenceRecord, SequenceStatus } from '@/types/sequence'

const FRAME_PAGE_SIZE = 48
const PLAYBACK_INTERVAL_MS = 100

const SequenceDetailPage: React.FC = () => {
  const { sequenceId = '' } = useParams()
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0)
  const [frameViewMode, setFrameViewMode] = useState<FrameViewMode>('raw')
  const [isPlaying, setIsPlaying] = useState(false)
  const [framePage, setFramePage] = useState(1)
  const [frames, setFrames] = useState<IFrameRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [sequenceStatus, setSequenceStatus] = useState<SequenceStatus>('Ready')

  const sequence = useMemo(() => {
    const knownSequence = sequences.find((sequenceItem) => sequenceItem.id === sequenceId)
    if (knownSequence) {
      return { ...knownSequence, frames: frames.length, status: sequenceStatus }
    }
    if (frames.length === 0) {
      return undefined
    }
    return {
      id: sequenceId,
      date: '—',
      frames: frames.length,
      duration: '—',
      storage: '—',
      status: sequenceStatus,
      camera: 'Image 00 · Stereo pair',
      weather: '—',
      scene: 'city' as const,
    }
  }, [frames.length, sequenceId, sequenceStatus])

  const fetchFrames = useCallback(() => {
    setFetchError(null)
    apiClient
      .get<ApiResponse<ISequenceFrameRecord[]>>(`/sequence/${encodeURIComponent(sequenceId)}`)
      .then(({ data }) => {
        if (data.success) {
          const sequenceFrames = [...data.data]
            .sort((firstFrame, secondFrame) => firstFrame.id.localeCompare(secondFrame.id))
            .map((frame, frameIndex) => ({
            frameIndex,
            frameId: frame.id,
            status: frame.metadata_.status?.toLowerCase() === 'processing' ? 'processing' as const : frame.metadata_.path?.segmented ? 'segmented' as const : 'unsegmented' as const,
            apiStatus: frame.metadata_.status,
            date: frame.metadata_.date,
            timestamp: frame.metadata_.date ?? '—',
            gps: frame.metadata_.gps,
            rawImageUrl: frame.metadata_.path?.raw,
            segmentedImageUrl: frame.metadata_.path?.segmented || undefined,
            }))
          setFrames(sequenceFrames)
          setSelectedFrameIndex(0)
          setFramePage(1)
        } else {
          setFetchError(data.error)
        }
      })
      .catch(() => setFetchError('Could not load frames for this sequence'))
      .finally(() => setIsLoading(false))
  }, [sequenceId])

  const fetchSequenceStatus = useCallback(async () => {
    try {
      const { data } = await apiClient.get<ApiResponse<ISequenceRecord[]>>('/sequence')
      if (data.success) {
        const currentSequence = data.data.find((item) => item.id === sequenceId)
        if (currentSequence?.metadata_.status) {
          setSequenceStatus(currentSequence.metadata_.status)
        }
      }
    } catch {
      return
    }
  }, [sequenceId])

  useEffect(() => {
    void Promise.resolve().then(fetchFrames)
  }, [fetchFrames])

  useEffect(() => {
    void Promise.resolve().then(fetchSequenceStatus)
  }, [fetchSequenceStatus])

  useEffect(() => {
    if (sequenceStatus !== 'Processing') {
      return
    }
    const intervalId = window.setInterval(() => {
      fetchFrames()
      void fetchSequenceStatus()
    }, 5000)
    return () => window.clearInterval(intervalId)
  }, [fetchFrames, fetchSequenceStatus, sequenceStatus])

  const handleRetryFetchFrames = useCallback(() => {
    setIsLoading(true)
    fetchFrames()
  }, [fetchFrames])

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

  const advanceFrame = useCallback(() => {
    const nextFrameIndex = (selectedFrameIndex + 1) % frames.length
    setSelectedFrameIndex(nextFrameIndex)
    setFramePage(Math.floor(nextFrameIndex / FRAME_PAGE_SIZE) + 1)
  }, [frames.length, selectedFrameIndex])

  const handleTogglePlayback = useCallback(() => {
    setIsPlaying((currentlyPlaying) => !currentlyPlaying)
  }, [])

  useEffect(() => {
    if (!isPlaying || frames.length < 2) {
      return
    }

    const intervalId = window.setInterval(advanceFrame, PLAYBACK_INTERVAL_MS)
    return () => window.clearInterval(intervalId)
  }, [advanceFrame, frames.length, isPlaying])

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
    <main className="mx-auto max-w-375 space-y-5 px-4 py-5 sm:px-7 sm:py-7 xl:px-10">
      {isLoading ? (
        <section aria-live="polite" className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500">
          Loading sequence frames…
        </section>
      ) : fetchError ? (
        <section aria-live="polite" className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
          <h1 className="text-lg font-semibold text-slate-800">Could not load sequence frames</h1>
          <p className="mt-2 text-sm text-slate-500">{fetchError}</p>
          <button className="mt-5 cursor-pointer text-sm font-medium text-cyan-700 hover:text-cyan-800" onClick={handleRetryFetchFrames} type="button">Try again</button>
        </section>
      ) : sequence && selectedFrame ? (
        <>
          <SequenceMetadataSection sequence={sequence} />
          <FrameViewerSection
            frame={selectedFrame}
            isPlaying={isPlaying}
            onTogglePlayback={handleTogglePlayback}
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
            totalFrameCount={frames.length}
            totalPageCount={totalPageCount}
          />
        </>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
          <h1 className="text-lg font-semibold text-slate-800">Sequence not found</h1>
          <p className="mt-2 text-sm text-slate-500">No frames were found for this sequence.</p>
          <Link className="mt-5 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-cyan-700 hover:text-cyan-800" to="/">
            <ArrowLeft className="size-4" /> Return to sequence library
          </Link>
        </section>
      )}
    </main>
  )
}

export default SequenceDetailPage
