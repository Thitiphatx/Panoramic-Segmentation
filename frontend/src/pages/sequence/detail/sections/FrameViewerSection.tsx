import type React from 'react'
import { useCallback, useMemo, useState } from 'react'
import { Clock3, MapPin, Pause, Play, Video } from 'lucide-react'
import FrameArtwork from './FrameArtwork'
import type { IFrameViewerSectionProps } from '../interface'
import FrameSegmentationBadge from './FrameSegmentationBadge'
import MetadataItem from './MetadataItem'

const FrameViewerSection: React.FC<IFrameViewerSectionProps> = ({ sequence, frame, isPlaying, onTogglePlayback }) => {
  const [segmentationOpacity, setSegmentationOpacity] = useState(50)
  const isSegmentedPreviewAvailable = Boolean(frame.segmentedImageUrl)

  const handleOpacityChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSegmentationOpacity(Number(event.currentTarget.value))
  }, [])

  const segmentationLabel = useMemo(() => {
    if (frame.status === 'segmented') {
      return 'Segmentation ready'
    }

    if (frame.status === 'processing') {
      return 'Segmentation processing'
    }

    return 'Not segmented'
  }, [frame.status])

  return (
    <section aria-label="Full frame view and frame metadata" className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(260px,0.8fr)]">
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.025)]">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Full frame view</h2>
            <p className="mt-1 text-[11px] text-slate-400">Frame {frame.frameId} <span className="mx-1">·</span> {sequence.id}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              aria-label={isPlaying ? 'Pause playback' : 'Play sequence'}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
              onClick={onTogglePlayback}
              type="button"
            >
              {isPlaying ? <Pause aria-hidden="true" className="size-3.5" /> : <Play aria-hidden="true" className="size-3.5" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <label className="flex min-w-48 items-center gap-3 text-xs text-slate-500">
              <span className="whitespace-nowrap">Result opacity</span>
              <input
                aria-label="Segmentation result opacity"
                className="h-1.5 w-28 cursor-pointer accent-cyan-700 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!isSegmentedPreviewAvailable}
                max="100"
                min="0"
                onChange={handleOpacityChange}
                type="range"
                value={segmentationOpacity}
              />
              <span className="w-8 text-right tabular-nums">{segmentationOpacity}%</span>
            </label>
          </div>
        </div>

        <div className="relative aspect-[16/7] min-h-[230px] overflow-hidden bg-slate-800 sm:min-h-[300px]">
          <FrameArtwork
            frameNumber={frame.frameIndex}
            imageUrl={frame.rawImageUrl}
            scene={sequence.scene ?? 'city'}
            segmentedImageUrl={frame.segmentedImageUrl}
            segmentationOpacity={segmentationOpacity}
          />
          <span className="absolute left-4 top-4 rounded-md bg-slate-950/70 px-2.5 py-1.5 text-[10px] font-medium tracking-wide text-white">
            {isSegmentedPreviewAvailable ? 'RAW + SEGMENTATION' : 'RAW CAMERA'}
          </span>
          {!isSegmentedPreviewAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/35 p-6 text-center">
              <p className="max-w-sm rounded-lg bg-slate-950/75 px-4 py-3 text-sm font-medium text-white" role="status">
                {frame.status === 'processing' ? 'Segmentation is processing for this frame.' : 'No segmentation result is available for this frame yet.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <aside className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.025)] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.15em] text-slate-400">FRAME METADATA</p>
            <h2 className="mt-1.5 text-base font-semibold text-slate-800">{frame.frameId}</h2>
          </div>
          <FrameSegmentationBadge statusLabel={segmentationLabel} status={frame.status} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-y border-slate-100 py-4">
          <MetadataItem label="Frame index" value={frame.frameIndex.toLocaleString()} />
          <MetadataItem label="Capture date" value={frame.date ?? frame.timestamp} />
          <MetadataItem label="Latitude" value={String(frame.gps?.lat ?? '—')} />
          <MetadataItem label="Longitude" value={String(frame.gps?.lon ?? '—')} />
        </div>

        <div className="mt-4 space-y-3 text-xs text-slate-500">
          <p className="flex items-center gap-2"><Clock3 className="size-3.5 shrink-0 text-slate-400" /> API status: {frame.apiStatus ?? frame.status}</p>
          <p className="flex items-center gap-2"><MapPin className="size-3.5 shrink-0 text-slate-400" /> {frame.gps?.address || 'GPS coordinates from frame metadata'}</p>
          <p className="flex items-center gap-2"><Video className="size-3.5 text-slate-400" /> {sequence.camera}</p>
        </div>

        <details className="mt-4 border-t border-slate-100 pt-3">
          <summary className="cursor-pointer text-xs font-medium text-slate-600 hover:text-slate-900">All API metadata</summary>
          <dl className="mt-3 space-y-2 text-[11px]">
            {Object.entries(frame.gps ?? {}).map(([key, value]) => (
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-2" key={key}>
                <dt className="break-all text-slate-400">gps.{key}</dt>
                <dd className="break-all text-right font-medium tabular-nums text-slate-700">{value ?? '—'}</dd>
              </div>
            ))}
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-2"><dt className="text-slate-400">path.raw</dt><dd className="break-all text-right font-medium text-slate-700">{frame.rawImageUrl ?? '—'}</dd></div>
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-2"><dt className="text-slate-400">path.segmented</dt><dd className="break-all text-right font-medium text-slate-700">{frame.segmentedImageUrl ?? '—'}</dd></div>
          </dl>
        </details>
      </aside>
    </section>
  )
}



export default FrameViewerSection
