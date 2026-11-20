import type { ChangeEventHandler, MouseEventHandler } from 'react'
import type { ISequence, SequenceScene, SequenceStatus } from '@/types/sequence'

export type SequenceFilter = 'All sequences' | 'Available' | 'Processing'

export type JobStatus = 'Running' | 'Queued' | 'Completed' | 'Cancelled'

export interface IJob {
  id: string
  sequenceId: string
  scene: SequenceScene
  status: JobStatus
  progress: number
  model: string
}

export interface ISequenceThumbnailProps {
  scene: SequenceScene
  isLarge?: boolean
}

export interface ISequenceTableSectionProps {
  sequences: ISequence[]
  totalSequenceCount: number
  availableSequenceCount: number
  selectedSequenceId: string
  searchTerm: string
  activeFilter: SequenceFilter
  onSearchChange: ChangeEventHandler<HTMLInputElement>
  onFilterChange: MouseEventHandler<HTMLButtonElement>
  onSelectSequence: MouseEventHandler<HTMLButtonElement>
}

export interface ISequenceOverviewSectionProps {
  selectedSequence: ISequence
  totalFrames: number
  readySequenceCount: number
}

export interface IJobStatusBadgeProps {
  status: JobStatus
}

export interface ISequenceStatusBadgeProps {
  status: SequenceStatus
}

export interface ISummaryCardProps {
  label: string
  value: string
  detail: string
}
