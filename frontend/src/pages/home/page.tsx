import type React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import JobQueueSection from './sections/JobQueueSection'
import SequenceOverviewSection from './sections/SequenceOverviewSection'
import SequenceTableSection from './sections/SequenceTableSection'
import type { IStorageSyncStatus, SequenceFilter } from './interface'
import type { ISequenceItem, ISequenceRecord } from '@/types/sequence'
import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/response'
import { getResourceUrl } from '@/lib/resource-url'

const HomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<SequenceFilter>('All sequences')
  const [sequences, setSequences] = useState<ISequenceItem[]>([])
  const [storageSyncStatus, setStorageSyncStatus] = useState<IStorageSyncStatus | null>(null)
  const [activeStorageSyncId, setActiveStorageSyncId] = useState<string | null>(null)
  const isPollingStorageSync = useRef(false)

  const filteredSequences = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase()

    return sequences.filter((sequence) => {
      const isSearchMatch = sequence.id.toLowerCase().includes(normalizedSearchTerm)
      const isFilterMatch =
        activeFilter === 'All sequences' ||
        (activeFilter === 'Available' && sequence.status === 'Ready') ||
        (activeFilter === 'Processing' && sequence.status === 'Processing')

      return isSearchMatch && isFilterMatch
    })
  }, [activeFilter, searchTerm, sequences])

  const fetchSequences = useCallback(() => {
    apiClient
      .get<ApiResponse<ISequenceRecord[]>>('/sequence')
      .then(({ data }) => {
        if (data.success) {
          const sequenceItems = data.data.map(({ id, metadata_ }) => ({
            id,
            ...metadata_,
            preview: getResourceUrl(metadata_.preview),
          }))
          setSequences(sequenceItems)
        }
      })
      .catch(() => {
        // TODO: handle sequences fetch error
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const handleStartStorageSync = useCallback(() => {
    apiClient
      .post<ApiResponse<IStorageSyncStatus>>('/sync-storage')
      .then(({ data }) => {
        if (data.success) {
          setStorageSyncStatus(data.data)
          if (data.data.status === 'queued' || data.data.status === 'running') {
            setActiveStorageSyncId(data.data.sync_id)
          }
        }
      })
      .catch(() => {
        const failedStatus: IStorageSyncStatus = {
          sync_id: '',
          status: 'failed',
          stage: 'failed',
          completed: 0,
          total: 0,
          progress: 0,
          message: 'Could not start storage sync',
        }
        setStorageSyncStatus(failedStatus)
      })
  }, [])

  const handleCancelStorageSync = useCallback(() => {
    if (!activeStorageSyncId) {
      return
    }
    apiClient
      .post<ApiResponse<IStorageSyncStatus>>(`/sync-storage/${activeStorageSyncId}/cancel`)
      .then(({ data }) => {
        if (data.success) {
          setStorageSyncStatus(data.data)
          if (data.data.status === 'cancelled' || data.data.status === 'completed' || data.data.status === 'failed') {
            setActiveStorageSyncId(null)
          }
        }
      })
      .catch(() => {
        setStorageSyncStatus((previousStatus) => previousStatus
          ? { ...previousStatus, message: 'Could not cancel storage sync' }
          : previousStatus)
      })
  }, [activeStorageSyncId])

  const pollStorageSyncStatus = useCallback(async (syncId: string) => {
    if (isPollingStorageSync.current) {
      return
    }
    isPollingStorageSync.current = true
    try {
      const { data } = await apiClient.get<ApiResponse<IStorageSyncStatus>>(
        `/sync-storage/${syncId}`,
      )
      if (data.success) {
        setStorageSyncStatus(data.data)
        if (data.data.status === 'completed' || data.data.status === 'failed' || data.data.status === 'cancelled') {
          setActiveStorageSyncId(null)
          if (data.data.status === 'completed') {
            fetchSequences()
          }
        }
      }
    } catch {
      setStorageSyncStatus((previousStatus) => previousStatus
        ? { ...previousStatus, message: 'Could not retrieve sync progress' }
        : previousStatus)
    } finally {
      isPollingStorageSync.current = false
    }
  }, [fetchSequences])

  const fetchActiveStorageSync = useCallback(() => {
    apiClient
      .get<ApiResponse<IStorageSyncStatus | null>>('/sync-storage')
      .then(({ data }) => {
        if (data.success && data.data) {
          setStorageSyncStatus(data.data)
          setActiveStorageSyncId(data.data.sync_id)
        }
      })
      .catch(() => undefined)
  }, [])

  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }, [])

  const handleFilterChange = useCallback((filter: SequenceFilter) => {
    setActiveFilter(filter)
  }, [])

  const handleSegmentSubmitted = useCallback((sequenceId: string) => {
    setSequences((currentSequences) => currentSequences.map((sequence) =>
      sequence.id === sequenceId ? { ...sequence, status: 'Processing' } : sequence,
    ))
  }, [])

  const handleJobFinished = useCallback(() => {
    fetchSequences()
  }, [fetchSequences])

  useEffect(() => {
    fetchSequences()
    fetchActiveStorageSync()
  }, [fetchActiveStorageSync, fetchSequences])

  useEffect(() => {
    if (!activeStorageSyncId) {
      return
    }
    const intervalId = window.setInterval(() => {
      void pollStorageSyncStatus(activeStorageSyncId)
    }, 5000)
    return () => window.clearInterval(intervalId)
  }, [activeStorageSyncId, pollStorageSyncStatus])

  return (
    <main aria-busy={isLoading} className="mx-auto max-w-360 px-5 py-7 sm:px-8 sm:py-9 xl:px-10">
      <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-cyan-700">
            <span className="size-1.5 rounded-full bg-cyan-500" /> DATA EXPLORER
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[30px]">Sequence library</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Browse and prepare your driving sequences for panoramic semantic segmentation.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <JobQueueSection onJobFinished={handleJobFinished} />
        <SequenceTableSection
          activeFilter={activeFilter}
          isLoading={isLoading}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
          onSegmentSubmitted={handleSegmentSubmitted}
          searchTerm={searchTerm}
          sequences={filteredSequences}
        />
        <SequenceOverviewSection
          onCancelStorageSync={handleCancelStorageSync}
          onStartStorageSync={handleStartStorageSync}
          storageSyncStatus={storageSyncStatus}
        />
      </div>

      <footer className="flex flex-col justify-between gap-2 py-6 text-[10px] text-slate-400 sm:flex-row">
        <span>Panoramic Segmentation <span className="mx-1.5">·</span> KITTI-360 workspace</span>
        <span className="flex items-center gap-1.5">Local environment <span className="size-1.5 rounded-full bg-emerald-400" /></span>
      </footer>
    </main>
  )
}

export default HomePage
