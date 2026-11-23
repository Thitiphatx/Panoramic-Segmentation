import type { ChangeEventHandler } from 'react'
import type { ISequenceItem, SequenceScene, SequenceStatus } from '@/types/sequence'

export type SequenceFilter = 'All sequences' | 'Available' | 'Processing'

export type JobStatus = 'Running' | 'Queued' | 'Completed' | 'Cancelled'
export type StorageSyncStatus = 'queued' | 'running' | 'cancelling' | 'completed' | 'cancelled' | 'failed'

export interface IStorageSyncStatus {
  sync_id: string
  status: StorageSyncStatus
  stage: string
  completed: number
  total: number
  progress: number
  message: string
  current_sequence?: string
  current_frame?: string
  error?: string
}

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
  isLoading: boolean
  sequences: ISequenceItem[]
  searchTerm: string
  activeFilter: SequenceFilter
  onSearchChange: ChangeEventHandler<HTMLInputElement>
  onFilterChange: (filter: SequenceFilter) => void
}

export interface ISequenceOverviewSectionProps {
  onCancelStorageSync: () => void
  onStartStorageSync: () => void
  storageSyncStatus: IStorageSyncStatus | null
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
