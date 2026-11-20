import type React from 'react'
import { useCallback, useMemo, useState, type ChangeEvent, type MouseEvent } from 'react'
import {
  Activity,
  Bell,
  CircleHelp,
  Database,
  FolderOpen,
  Gauge,
  LayoutDashboard,
  Layers2,
  Settings2,
  Sparkles,
} from 'lucide-react'
import JobQueueSection from './sections/JobQueueSection'
import SequenceOverviewSection from './sections/SequenceOverviewSection'
import SequenceTableSection from './sections/SequenceTableSection'
import { sequences } from '@/data/sequences'
import type { SequenceFilter } from './interface'

const HomePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<SequenceFilter>('All sequences')
  const [selectedSequenceId, setSelectedSequenceId] = useState(sequences[0].id)

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
  }, [activeFilter, searchTerm])

  const selectedSequence = useMemo(
    () => sequences.find((sequence) => sequence.id === selectedSequenceId) ?? sequences[0],
    [selectedSequenceId],
  )

  const totalFrames = useMemo(
    () => sequences.reduce((total, sequence) => total + sequence.frames, 0),
    [],
  )

  const readySequenceCount = useMemo(
    () => sequences.filter((sequence) => sequence.status === 'Ready').length,
    [],
  )

  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }, [])

  const handleFilterChange = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setActiveFilter(event.currentTarget.value as SequenceFilter)
  }, [])

  const handleSelectSequence = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    const sequenceId = event.currentTarget.dataset.sequenceId

    if (sequenceId) {
      setSelectedSequenceId(sequenceId)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[248px] flex-col bg-[#111b2d] text-slate-300 lg:flex">
        <div className="flex h-[76px] items-center gap-3 border-b border-white/10 px-6">
          <div className="flex size-9 items-center justify-center rounded-xl bg-cyan-400 text-[#102035]">
            <Activity className="size-5" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-bold tracking-[0.12em] text-white">PANO</p>
            <p className="text-[10px] tracking-[0.16em] text-slate-400">SEGMENTATION LAB</p>
          </div>
        </div>

        <div className="px-4 pt-7">
          <p className="px-3 text-[10px] font-semibold tracking-[0.18em] text-slate-500">WORKSPACE</p>
          <nav aria-label="Main navigation" className="mt-3 space-y-1">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400">
              <LayoutDashboard className="size-4" /> Overview
            </div>
            <div aria-current="page" className="flex items-center gap-3 rounded-lg bg-cyan-400/10 px-3 py-2.5 text-sm font-medium text-cyan-300 ring-1 ring-inset ring-cyan-300/15">
              <FolderOpen className="size-4" /> Sequences
              <span className="ml-auto rounded-md bg-cyan-300/15 px-1.5 py-0.5 text-[10px]">08</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400">
              <Layers2 className="size-4" /> Models
            </div>
            <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400">
              <Gauge className="size-4" /> Jobs
            </div>
          </nav>
        </div>

        <div className="mt-auto border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-slate-700 text-cyan-200">
              <Database className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-200">KITTI-360</p>
              <p className="mt-0.5 truncate text-[10px] text-slate-500">Local dataset</p>
            </div>
            <span className="size-1.5 rounded-full bg-emerald-400" />
          </div>
          <div className="mt-3 flex items-center justify-between px-2 text-xs text-slate-500">
            <span className="flex items-center gap-2"><Settings2 className="size-3.5" /> Settings</span>
            <CircleHelp className="size-3.5" />
          </div>
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        <header className="flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white px-5 sm:px-8">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Workspace</span>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-slate-700">Sequences</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 sm:flex">
              <Sparkles className="size-3.5" /> Sample data
            </span>
            <button aria-label="Notifications" className="relative cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100" type="button">
              <Bell className="size-[18px]" />
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-cyan-500" />
            </button>
            <div className="flex size-8 items-center justify-center rounded-full bg-[#dcebf0] text-xs font-semibold text-[#315768]">TP</div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 sm:py-9 xl:px-10">
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
            <JobQueueSection />
            <SequenceTableSection
              activeFilter={activeFilter}
              availableSequenceCount={readySequenceCount}
              onFilterChange={handleFilterChange}
              onSearchChange={handleSearchChange}
              onSelectSequence={handleSelectSequence}
              searchTerm={searchTerm}
              selectedSequenceId={selectedSequenceId}
              sequences={filteredSequences}
              totalSequenceCount={sequences.length}
            />
            <SequenceOverviewSection
              readySequenceCount={readySequenceCount}
              selectedSequence={selectedSequence}
              totalFrames={totalFrames}
            />
          </div>

          <footer className="flex flex-col justify-between gap-2 py-6 text-[10px] text-slate-400 sm:flex-row">
            <span>Panoramic Segmentation <span className="mx-1.5">·</span> KITTI-360 workspace</span>
            <span className="flex items-center gap-1.5">Local environment <span className="size-1.5 rounded-full bg-emerald-400" /></span>
          </footer>
        </main>
      </div>
    </div>
  )
}

export default HomePage

