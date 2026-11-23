import type { MouseEventHandler } from 'react'
import type { ISequence, SequenceScene } from '@/types/sequence'

export type FrameViewMode = 'raw' | 'segmented'

export type FrameSegmentationStatus = 'unsegmented' | 'segmented' | 'processing'

export interface IFrameRecord {
  frameIndex: number
  frameId: string
  status: FrameSegmentationStatus
  timestamp: string
  latitude: number
  longitude: number
  rawImageUrl?: string
}

export interface ISequenceMetadataSectionProps {
  sequence: ISequence
}

export interface IMetadataFieldProps {
  label: string
  value: string
}

export interface IFrameArtworkProps {
  scene: SequenceScene
  frameNumber: number
  viewMode: FrameViewMode
  isUnsegmented?: boolean
  imageUrl?: string
}

export interface IFrameViewerSectionProps {
  sequence: ISequence
  frame: IFrameRecord
  viewMode: FrameViewMode
  isPlaying: boolean
  onViewModeChange: MouseEventHandler<HTMLButtonElement>
  onTogglePlayback: () => void
}

export interface IFrameGridSectionProps {
  frames: IFrameRecord[]
  scene: SequenceScene
  totalFrameCount: number
  currentPage: number
  totalPageCount: number
  selectedFrameIndex: number
  onSelectFrame: MouseEventHandler<HTMLButtonElement>
  onPageChange: MouseEventHandler<HTMLButtonElement>
}

export interface IFrameSegmentationBadgeProps {
  statusLabel: string
  status: FrameSegmentationStatus
}

export interface IStatusLegendProps {
  color: string
  label: string
}
