import type React from 'react'
import { Clock3, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/response'
import type { IJob, IJobQueueSectionProps, IJobRecord } from '../interface'
import JobStatusBadge from './JobStatusBadge'

const toJob = (record: IJobRecord): IJob => {
  const completed = Number(record.completed ?? 0)
  const total = Number(record.total ?? 0)
  const parsedProgress = Number(record.progress)

  return {
    id: record.job_id,
    sequenceId: record.sequence_id,
    status: record.status === 'pending'
      ? 'Queued'
      : record.status === 'processing'
        ? 'Running'
        : record.status === 'completed'
          ? 'Completed'
          : record.status === 'failed'
            ? 'Failed'
            : 'Cancelled',
    progress: Number.isFinite(parsedProgress)
      ? parsedProgress
      : total > 0
        ? Math.round((completed / total) * 100)
        : 0,
    model: record.model_id,
    error: record.error,
  }
}

const JobQueueSection: React.FC<IJobQueueSectionProps> = ({ onJobFinished }) => {
  const [jobs, setJobs] = useState<IJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActionPending, setIsActionPending] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const handledTerminalJobs = useRef(new Set<string>())

  const activeJobCount = useMemo(
    () => jobs.filter((job) => job.status === 'Running' || job.status === 'Queued').length,
    [jobs],
  )

  const fetchJobs = useCallback(async () => {
    try {
      const { data } = await apiClient.get<ApiResponse<{ jobs: IJobRecord[] }>>('/job')
      if (data.success) {
        const fetchedJobs = data.data.jobs.map(toJob)
        data.data.jobs.forEach((job) => {
          if ((job.status === 'completed' || job.status === 'failed') && !handledTerminalJobs.current.has(job.job_id)) {
            handledTerminalJobs.current.add(job.job_id)
            onJobFinished(job.sequence_id, job.status === 'completed')
          }
        })
        setJobs(fetchedJobs.filter((job) => job.status !== 'Completed' && job.status !== 'Cancelled'))
        setNotice('')
      } else {
        setNotice(data.error || 'Could not load jobs')
      }
    } catch {
      setNotice('Could not load jobs. Check the API connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }, [onJobFinished])

  const handleJobAction = useCallback(async (event: MouseEvent<HTMLButtonElement>) => {
    const jobId = event.currentTarget.dataset.jobId
    if (!jobId) {
      return
    }

    setIsActionPending(jobId)
    try {
      await apiClient.delete(`/job/${jobId}`)
      await fetchJobs()
      setNotice('')
    } catch {
      setNotice(`Could not cancel job ${jobId}. Refresh the queue and try again.`)
    } finally {
      setIsActionPending(null)
    }
  }, [fetchJobs])

  useEffect(() => {
    const initialFetchId = window.setTimeout(() => void fetchJobs(), 0)
    const intervalId = window.setInterval(() => void fetchJobs(), 5000)
    return () => {
      window.clearTimeout(initialFetchId)
      window.clearInterval(intervalId)
    }
  }, [fetchJobs])

  return (
    <Card className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-0 shadow-[0_2px_10px_rgba(15,23,42,0.025)]">
      <CardHeader className="flex flex-col justify-between gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold text-slate-800" id="job-queue-heading">Job queue</h2>
            <Badge className="border-0 bg-cyan-50 px-2 py-0.5 text-[11px] font-medium text-cyan-700" variant="outline">
              {activeJobCount} active
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-400">Track segmentation jobs and their latest progress</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400" aria-live="polite">
          <span className={`size-1.5 rounded-full ${isLoading ? 'bg-amber-400' : 'bg-cyan-500'}`} />
          {isLoading ? 'Loading jobs' : 'Refreshes every 5 seconds'}
        </div>
      </CardHeader>

      {notice && (
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-2.5 text-xs text-slate-500 sm:px-6" role="status">
          <span>{notice}</span>
          <Button aria-label="Dismiss job message" className="size-6 cursor-pointer p-0 hover:bg-slate-200" onClick={() => setNotice('')} size="icon" variant="ghost">
            <X className="size-3.5" />
          </Button>
        </div>
      )}

      <CardContent className="divide-y divide-slate-100 p-0">
        {jobs.map((job) => (
          <article className="grid gap-4 px-5 py-4 sm:grid-cols-[minmax(240px,1.3fr)_minmax(140px,0.8fr)_minmax(160px,1fr)_auto] sm:items-center sm:px-6" key={job.id}>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-700">{job.sequenceId}</p>
              <p className="mt-1 truncate text-[11px] text-slate-400">{job.id} <span className="mx-1">·</span> {job.model}</p>
              {job.status === 'Failed' && job.error && <p className="mt-1 truncate text-[11px] text-rose-600" title={job.error}>{job.error}</p>}
              {job.status === 'Queued' && <p className="mt-1 text-[11px] text-slate-400">Waiting for a worker</p>}
            </div>

            <div><JobStatusBadge status={job.status} /></div>

            <div className="flex items-center gap-3">
              <Progress
                className={`h-1.5 flex-1 bg-slate-100 ${
                  job.status === 'Completed'
                    ? '[&>[data-slot=progress-indicator]]:bg-emerald-500'
                    : job.status === 'Cancelled' || job.status === 'Failed'
                      ? '[&>[data-slot=progress-indicator]]:bg-slate-300'
                      : '[&>[data-slot=progress-indicator]]:bg-cyan-600'
                }`}
                value={job.progress}
              />
              <span className="w-9 text-right text-[11px] font-medium tabular-nums text-slate-500">{job.progress}%</span>
            </div>

            <div className="flex justify-end">
              {job.status === 'Running' || job.status === 'Queued' || job.status === 'Failed' ? (
                <Button
                  className="h-8 cursor-pointer rounded-lg px-3 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  data-job-id={job.id}
                  disabled={isActionPending === job.id}
                  onClick={handleJobAction}
                  size="sm"
                  variant="ghost"
                >
                  {isActionPending === job.id ? 'Cancelling…' : 'Cancel'}
                </Button>
              ) : null}
            </div>
          </article>
        ))}
        {!isLoading && jobs.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-500 sm:px-6">{notice ? 'Jobs are unavailable right now.' : 'No segmentation jobs yet.'}</p>
        )}
        {isLoading && jobs.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-400 sm:px-6">Loading jobs…</p>}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-slate-100 p-0 px-5 py-3 text-[11px] text-slate-400 sm:px-6">
        <span>{jobs.length} recent jobs</span>
        <span className="flex items-center gap-1.5"><Clock3 className="size-3.5" /> Queue order</span>
      </CardFooter>
    </Card>
  )
}

export default JobQueueSection
