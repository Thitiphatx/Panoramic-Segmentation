import type { MouseEventHandler } from 'react'
import type { ISequence, SequenceScene } from '@/types/sequence'

export type FrameSegmentationStatus = 'unsegmented' | 'segmented' | 'processing'

export interface IFrameRecord {
  frameIndex: number
  frameId: string
  status: FrameSegmentationStatus
  timestamp: string
  date?: string
  apiStatus?: string
  rawImageUrl?: string
  segmentedImageUrl?: string
  gps?: Record<string, number | string | undefined>
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
  imageUrl?: string
  segmentedImageUrl?: string
  segmentationOpacity: number
}

export interface IFrameViewerSectionProps {
  sequence: ISequence
  frame: IFrameRecord
  isPlaying: boolean
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
