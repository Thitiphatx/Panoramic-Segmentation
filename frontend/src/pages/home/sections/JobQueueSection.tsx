import type React from 'react'
import { Clock3, X } from 'lucide-react'
import { useCallback, useMemo, useState, type MouseEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import SequenceThumbnail from './SequenceThumbnail'
import type { IJob } from '../interface'
import JobStatusBadge from './JobStatusBadge'

const initialJobs: IJob[] = [
  {
    id: 'JOB-0184',
    sequenceId: '2013_05_28_drive_0003_sync',
    scene: 'sunset',
    status: 'Running',
    progress: 67,
    model: 'SegFormer · B0',
  },
  {
    id: 'JOB-0185',
    sequenceId: '2013_05_28_drive_0005_sync',
    scene: 'overcast',
    status: 'Queued',
    progress: 0,
    model: 'SegFormer · B0',
  },
  {
    id: 'JOB-0183',
    sequenceId: '2013_05_28_drive_0000_sync',
    scene: 'city',
    status: 'Completed',
    progress: 100,
    model: 'SegFormer · B0',
  },
]

const JobQueueSection: React.FC = () => {
  const [jobs, setJobs] = useState(initialJobs)
  const [notice, setNotice] = useState('')

  const activeJobCount = useMemo(
    () => jobs.filter((job) => job.status === 'Running' || job.status === 'Queued').length,
    [jobs],
  )

  const handleJobAction = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    const jobId = event.currentTarget.dataset.jobId
    const selectedJob = jobs.find((job) => job.id === jobId)

    if (!selectedJob) {
      return
    }

    if (selectedJob.status === 'Completed') {
      setNotice(`Output preview for ${selectedJob.sequenceId} is sample content.`)
      return
    }

    setJobs((currentJobs) => currentJobs.map((job) =>
      job.id === jobId ? { ...job, status: 'Cancelled' } : job,
    ))
    setNotice(`Job ${selectedJob.id} cancelled in this mockup.`)
  }, [jobs])

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
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="size-1.5 rounded-full bg-cyan-500" /> Updating locally
        </div>
      </CardHeader>

      {notice && (
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-2.5 text-xs text-slate-500 sm:px-6">
          <span>{notice}</span>
          <Button
            aria-label="Dismiss job message"
            className="size-6 p-0 hover:bg-slate-200"
            onClick={() => setNotice('')}
            size="icon"
            variant="ghost"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      )}

      <CardContent className="divide-y divide-slate-100 p-0">
        {jobs.map((job) => (
          <article className="grid gap-4 px-5 py-4 sm:grid-cols-[minmax(240px,1.3fr)_minmax(140px,0.8fr)_minmax(160px,1fr)_auto] sm:items-center sm:px-6" key={job.id}>
            <div className="flex min-w-0 items-center gap-3">
              <SequenceThumbnail scene={job.scene} />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-700">{job.sequenceId}</p>
                <p className="mt-1 text-[11px] text-slate-400">{job.id} <span className="mx-1">·</span> {job.model}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:block">
              <div className="flex items-center gap-1.5 sm:mb-2">
                <JobStatusBadge status={job.status} />
                <span className="text-[11px] text-slate-400 sm:hidden">{job.progress}%</span>
              </div>
              {job.status === 'Queued' && <p className="hidden text-[11px] text-slate-400 sm:block">Waiting for a worker</p>}
            </div>

            <div className="flex items-center gap-3">
              <Progress
                className={`h-1.5 flex-1 bg-slate-100 ${
                  job.status === 'Completed'
                    ? '[&>[data-slot=progress-indicator]]:bg-emerald-500'
                    : job.status === 'Cancelled'
                      ? '[&>[data-slot=progress-indicator]]:bg-slate-300'
                      : '[&>[data-slot=progress-indicator]]:bg-cyan-600'
                }`}
                value={job.progress}
              />
              <span className="w-9 text-right text-[11px] font-medium tabular-nums text-slate-500">{job.progress}%</span>
            </div>

            <div className="flex justify-end">
              <Button
                className="h-8 cursor-pointer rounded-lg px-3 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                data-job-id={job.id}
                disabled={job.status === 'Cancelled'}
                onClick={handleJobAction}
                size="sm"
                variant="ghost"
              >
                {job.status === 'Completed' ? 'View output' : job.status === 'Cancelled' ? 'Cancelled' : 'Cancel'}
              </Button>
            </div>
          </article>
        ))}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-slate-100 p-0 px-5 py-3 text-[11px] text-slate-400 sm:px-6">
        <span>{jobs.length} recent jobs</span>
        <span className="flex items-center gap-1.5"><Clock3 className="size-3.5" /> Queue order</span>
      </CardFooter>
    </Card>
  )
}

export default JobQueueSection
