import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChevronDown, Filter, MoreHorizontal, Search } from 'lucide-react'
import type React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import type { ISequenceTableSectionProps, ISegmentModel, SequenceFilter } from '../interface'
import SequenceStatusBadge from './SequenceStatusBadge'
import { formatDuration } from '@/utils/formatter'
import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/response'

const filters: SequenceFilter[] = ['All sequences', 'Available', 'Processing']

const SequenceTableSection: React.FC<ISequenceTableSectionProps> = ({
  isLoading,
  sequences,
  searchTerm,
  activeFilter,
  onSearchChange,
  onFilterChange,
  onSegmentSubmitted,
}) => {
  const [models, setModels] = useState<ISegmentModel[]>([])
  const [selectedModelBySequence, setSelectedModelBySequence] = useState<Record<string, string>>({})
  const [isLoadingModels, setIsLoadingModels] = useState(true)
  const [submittingSequenceId, setSubmittingSequenceId] = useState<string | null>(null)
  const [segmentMessage, setSegmentMessage] = useState('')

  const filteredSequences = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase()

    return sequences.filter((sequence) => {
      const isSearchMatch = sequence.id.toLowerCase().includes(normalizedSearchTerm)
      const isFilterMatch = activeFilter === 'All sequences' ||
        (activeFilter === 'Available' && sequence.status === 'Ready') ||
        (activeFilter === 'Processing' && sequence.status === 'Processing')
      return isSearchMatch && isFilterMatch
    })
  }, [activeFilter, searchTerm, sequences])

  const fetchModels = useCallback(async () => {
    try {
      const { data } = await apiClient.get<ApiResponse<{ models: ISegmentModel[] }>>('/segment/models')
      if (data.success) {
        setModels(data.data.models)
      } else {
        setSegmentMessage(data.error || 'Could not load segmentation models')
      }
    } catch {
      setSegmentMessage('Could not load segmentation models. Check the API connection and try again.')
    } finally {
      setIsLoadingModels(false)
    }
  }, [])

  const handleSubmitSegment = useCallback(async (sequenceId: string, modelId: string) => {
    if (!modelId || submittingSequenceId) {
      return
    }

    setSubmittingSequenceId(sequenceId)
    setSegmentMessage('')
    try {
      const { data } = await apiClient.post<ApiResponse<{ job_id: string }>>('/segment/segment', {
        model_id: modelId,
        sequence_id: sequenceId,
      })
      if (!data.success) {
        setSegmentMessage(data.error || `Could not submit ${sequenceId} for segmentation`)
        return
      }
      setSegmentMessage(`Segmentation job submitted for ${sequenceId}`)
      onSegmentSubmitted(sequenceId)
    } catch {
      setSegmentMessage(`Could not submit ${sequenceId}. Check the API connection and try again.`)
    } finally {
      setSubmittingSequenceId(null)
    }
  }, [onSegmentSubmitted, submittingSequenceId])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void fetchModels(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [fetchModels])

  const totalSequenceCount = sequences.length
  return (
    <Card className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-0 shadow-[0_2px_10px_rgba(15,23,42,0.025)]">
      <CardHeader className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold text-slate-800" id="sequence-table-heading">All sequences</h2>
            <Badge className="border-0 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500" variant="secondary">
              {totalSequenceCount}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-400">Synced KITTI-360 drives ready for inspection</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block sm:w-[260px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="h-10 w-full rounded-lg border-slate-200 bg-white pl-9 pr-3 text-sm transition placeholder:text-slate-400 focus-visible:border-cyan-400 focus-visible:ring-4 focus-visible:ring-cyan-500/10"
              onChange={onSearchChange}
              placeholder="Search sequences..."
              type="search"
              value={searchTerm}
            />
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-10 cursor-pointer gap-2 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50" variant="outline">
                <Filter className="size-3.5" /> Filter <ChevronDown className="size-3.5 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filters.map((filter) => (
                <DropdownMenuItem
                  className={filter === activeFilter ? 'font-semibold text-cyan-700' : ''}
                  key={filter}
                  onClick={() => onFilterChange(filter)}
                >
                  {filter}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      {segmentMessage && (
        <p aria-live="polite" className="border-b border-slate-100 bg-slate-50 px-6 py-2.5 text-xs text-slate-600" role="status">
          {segmentMessage}
        </p>
      )}
      <CardContent className="overflow-x-auto p-0">
        <Table className="w-full min-w-[880px] border-collapse text-left">
          <TableHeader>
            <TableRow className="border-b border-slate-100 bg-slate-50/70 hover:bg-slate-50/70">
              <TableHead className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Sequence name</TableHead>
              <TableHead className="px-4 py-3.5 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Frames</TableHead>
              <TableHead className="px-4 py-3.5 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Duration</TableHead>
              <TableHead className="px-4 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Status</TableHead>
              <TableHead className="px-5 py-3.5 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100">
            {isLoading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell className="px-6 py-10" colSpan={5}>
                  <Empty className="w-full">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Spinner />
                      </EmptyMedia>
                      <EmptyTitle>Processing your request</EmptyTitle>
                      <EmptyDescription>
                        Please wait while we process your request. Do not refresh the page.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Button size="sm" variant="outline">
                        Cancel
                      </Button>
                    </EmptyContent>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : filteredSequences.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell className="px-6 py-14 text-center text-sm text-slate-400" colSpan={5}>
                  No sequences match “{searchTerm}”. Try a different name or filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredSequences.map((sequence) => {
                const isReady = sequence.status === 'Ready'
                const selectedModelId = selectedModelBySequence[sequence.id] || models[0]?.model_id || ''
                return (
                  <TableRow className="transition hover:bg-slate-50/70" key={sequence.id}>
                    <TableCell className="px-6 py-3.5">
                      <Link
                        className="group flex cursor-pointer items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                        to={`/sequences/${encodeURIComponent(sequence.id)}`}
                      >
                        <img alt="" className="h-11 w-16 rounded-xl object-cover" src={sequence.preview} />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-700 group-hover:text-cyan-700">{sequence.id}</p>
                          <p className="mt-1 text-[11px] text-slate-400">{sequence.date}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-right text-xs tabular-nums text-slate-600">
                      {sequence.frame.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-right text-xs tabular-nums text-slate-600">
                      {formatDuration(sequence.duration)}
                    </TableCell>
                    <TableCell className="px-4 py-3.5"><SequenceStatusBadge status={sequence.status} /></TableCell>
                    <TableCell className="px-5 py-3.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-label={`Actions for ${sequence.id}`}
                            className="size-8 cursor-pointer rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            disabled={isLoadingModels || models.length === 0 || submittingSequenceId === sequence.id}
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Segmentation model</DropdownMenuLabel>
                          <DropdownMenuRadioGroup
                            onValueChange={(modelId) => setSelectedModelBySequence((currentModels) => ({
                              ...currentModels,
                              [sequence.id]: modelId,
                            }))}
                            value={selectedModelId}
                          >
                            {models.map((model) => (
                              <DropdownMenuRadioItem className="cursor-pointer" key={model.model_id} value={model.model_id}>
                                {model.name}
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer font-medium text-cyan-700 focus:text-cyan-800"
                            disabled={!isReady || !selectedModelId || submittingSequenceId !== null}
                            onSelect={() => void handleSubmitSegment(sequence.id, selectedModelId)}
                            title={!isReady ? 'Only sequences with Ready status can be segmented' : undefined}
                          >
                            {submittingSequenceId === sequence.id ? 'Submitting…' : 'Segment'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t border-slate-100 p-0 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-[11px] text-slate-400">Showing <span className="font-medium text-slate-600">{filteredSequences.length}</span> of {totalSequenceCount} sequences</p>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="size-1.5 rounded-full bg-emerald-400" /> Dataset ready
        </div>
      </CardFooter>
    </Card>
  )
}

export default SequenceTableSection
