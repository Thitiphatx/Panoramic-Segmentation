import type React from 'react'
import { Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { ISequenceOverviewSectionProps } from '../interface'

const SequenceOverviewSection: React.FC<ISequenceOverviewSectionProps> = ({
  onCancelStorageSync,
  onStartStorageSync,
  storageSyncStatus,
}) => {
  const isSyncActive = storageSyncStatus?.status === 'queued' ||
    storageSyncStatus?.status === 'running' ||
    storageSyncStatus?.status === 'cancelling'
  const canCancelSync = storageSyncStatus?.status === 'queued' ||
    storageSyncStatus?.status === 'running'

  return (
    <section aria-label="Database sync">
      <Card className="rounded-2xl border border-slate-200/80 bg-white p-0 shadow-[0_2px_10px_rgba(15,23,42,0.025)]">
        <CardHeader className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Database aria-hidden="true" className="size-4 text-cyan-700" /> Database sync
            </h2>
            <p className="mt-1.5 text-xs text-slate-400">
              Index sequences, frames, timestamps, and GPS metadata from storage.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canCancelSync && (
              <Button
                className="h-10 cursor-pointer rounded-lg border-slate-200 px-4 text-slate-600 hover:bg-slate-50"
                onClick={onCancelStorageSync}
                variant="outline"
              >
                Cancel sync
              </Button>
            )}
            <Button
              className="h-10 w-fit cursor-pointer rounded-lg bg-cyan-700 px-4 text-white hover:bg-cyan-800"
              disabled={isSyncActive}
              onClick={onStartStorageSync}
            >
              {storageSyncStatus?.status === 'cancelling'
                ? 'Cancelling…'
                : isSyncActive
                  ? 'Syncing…'
                  : 'Sync database'}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="border-t border-slate-100 px-5 py-4 sm:px-6">
          {storageSyncStatus ? (
            <div aria-live="polite" className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-medium text-slate-700">{storageSyncStatus.message}</span>
                <span className="tabular-nums text-slate-500">
                  {storageSyncStatus.completed.toLocaleString()} / {storageSyncStatus.total.toLocaleString()} frames
                  <span className="ml-2 text-slate-400">{storageSyncStatus.progress}%</span>
                </span>
              </div>
              <Progress
                aria-label="Database sync progress"
                className="h-2 bg-slate-100 [&_[data-slot=progress-indicator]]:bg-cyan-700"
                value={storageSyncStatus.progress}
              />
              {storageSyncStatus.current_sequence && (
                <p className="text-[11px] text-slate-400">
                  {storageSyncStatus.current_sequence}
                  {storageSyncStatus.current_frame ? ` · Frame ${storageSyncStatus.current_frame}` : ''}
                </p>
              )}
              {storageSyncStatus.error && (
                <p className="text-xs text-red-600">{storageSyncStatus.error}</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Start a sync to update the database from the current storage contents.
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  )
}

export default SequenceOverviewSection
