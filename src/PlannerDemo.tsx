import { useCallback, useMemo, useState, type DragEvent, type ReactNode } from 'react'
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Database,
  Factory,
  Flag,
  Github,
  GripVertical,
  Layers3,
  MoveUp,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Zap,
} from 'lucide-react'
import {
  DEMO_DATA,
  cloneOrder,
  createImpact,
  deriveSchedule,
  formatDemoDate,
  formatDemoRange,
  isAnchor,
  reorderEntry,
  type DemoImpact,
  type DemoMachine,
  type DerivedSchedule,
  type JobImpact,
  type JobSummary,
  type MaterialState,
  type RiskStatus,
  type ScheduledEntry,
} from './demo-scheduler'

const SOURCE_REPO_URL = 'https://github.com/Moshik21/machine-cadence-scheduler-demo'

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function PlannerDemo() {
  const initialDerived = useMemo(
    () => deriveSchedule(DEMO_DATA, DEMO_DATA.initialOrderByMachine),
    [],
  )
  const [orderByMachine, setOrderByMachine] = useState(() =>
    cloneOrder(DEMO_DATA.initialOrderByMachine),
  )
  const [selectedEntryId, setSelectedEntryId] = useState(DEMO_DATA.guidedEntryId)
  const [draggedEntryId, setDraggedEntryId] = useState<string | null>(null)
  const [lastImpact, setLastImpact] = useState<DemoImpact | null>(null)

  const derived = useMemo(() => deriveSchedule(DEMO_DATA, orderByMachine), [orderByMachine])
  const machineById = useMemo(
    () => new Map(DEMO_DATA.machines.map((machine) => [machine.id, machine])),
    [],
  )
  const selectedEntry = derived.entryMap.get(selectedEntryId) ?? null
  const selectedSummary = selectedEntry ? derived.jobSummaryMap.get(selectedEntry.jobId) ?? null : null
  const guidedBefore = initialDerived.entryMap.get(DEMO_DATA.guidedEntryId)
  const guidedNow = derived.entryMap.get(DEMO_DATA.guidedEntryId)
  const guidedMoved =
    guidedBefore != null && guidedNow != null && guidedNow.startOffset < guidedBefore.startOffset

  const applyOrder = useCallback(
    (nextOrder: Record<string, string[]>, movedEntryId: string) => {
      if (nextOrder === orderByMachine) return
      const before = deriveSchedule(DEMO_DATA, orderByMachine)
      const after = deriveSchedule(DEMO_DATA, nextOrder)
      setOrderByMachine(nextOrder)
      setSelectedEntryId(movedEntryId)
      setLastImpact(createImpact(before, after, movedEntryId))
    },
    [orderByMachine],
  )

  const handleMove = useCallback(
    (entryId: string, mode: 'up' | 'down' | 'top' | 'before' | 'end', targetEntryId?: string) => {
      const nextOrder = reorderEntry(DEMO_DATA, orderByMachine, entryId, mode, targetEntryId)
      applyOrder(nextOrder, entryId)
    },
    [applyOrder, orderByMachine],
  )

  const resetDemo = useCallback(() => {
    setOrderByMachine(cloneOrder(DEMO_DATA.initialOrderByMachine))
    setSelectedEntryId(DEMO_DATA.guidedEntryId)
    setDraggedEntryId(null)
    setLastImpact(null)
  }, [])

  const replayScenario = useCallback(() => {
    const resetOrder = cloneOrder(DEMO_DATA.initialOrderByMachine)
    const before = deriveSchedule(DEMO_DATA, resetOrder)
    const nextOrder = reorderEntry(DEMO_DATA, resetOrder, DEMO_DATA.guidedEntryId, 'top')
    const after = deriveSchedule(DEMO_DATA, nextOrder)
    setOrderByMachine(nextOrder)
    setSelectedEntryId(DEMO_DATA.guidedEntryId)
    setDraggedEntryId(null)
    setLastImpact(createImpact(before, after, DEMO_DATA.guidedEntryId))
  }, [])

  const handleDragStart = useCallback((event: DragEvent<HTMLElement>, entry: ScheduledEntry) => {
    if (isAnchor(entry)) return
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', entry.id)
    setDraggedEntryId(entry.id)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedEntryId(null)
  }, [])

  const handleDropBefore = useCallback(
    (event: DragEvent<HTMLElement>, targetEntry: ScheduledEntry) => {
      event.preventDefault()
      const draggedId = event.dataTransfer.getData('text/plain') || draggedEntryId
      if (!draggedId || draggedId === targetEntry.id) return
      const draggedEntry = derived.entryMap.get(draggedId)
      if (!draggedEntry || draggedEntry.machineId !== targetEntry.machineId) return
      handleMove(draggedId, 'before', targetEntry.id)
      setDraggedEntryId(null)
    },
    [derived.entryMap, draggedEntryId, handleMove],
  )

  const handleDropEnd = useCallback(
    (event: DragEvent<HTMLElement>, machineId: string) => {
      event.preventDefault()
      const draggedId = event.dataTransfer.getData('text/plain') || draggedEntryId
      if (!draggedId) return
      const draggedEntry = derived.entryMap.get(draggedId)
      if (!draggedEntry || draggedEntry.machineId !== machineId) return
      handleMove(draggedId, 'end')
      setDraggedEntryId(null)
    },
    [derived.entryMap, draggedEntryId, handleMove],
  )

  return (
    <div className="min-h-screen overflow-x-hidden dawn-gradient text-gray-950 dark:text-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-200/60 bg-white/75 backdrop-blur-xl dark:border-gray-800/70 dark:bg-gray-950/75">
        <div className="mx-auto flex min-w-0 max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <a
              href={SOURCE_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200/70 bg-white/80 text-gray-600 shadow-dawn-sm transition-colors hover:text-cyan-700 dark:border-gray-800 dark:bg-gray-900/80 dark:text-gray-300 dark:hover:text-cyan-300"
              aria-label="Open source repository"
            >
              <Github className="h-4 w-4" />
            </a>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-400">
                Machine Cadence
              </div>
              <div className="text-sm font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                Synthetic planner demo
              </div>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
            <StatusPill
              icon={<ShieldCheck className="h-3.5 w-3.5" />}
              label="No real shop data"
              tone="cyan"
            />
            <a
              href={SOURCE_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-gray-300/70 bg-white/80 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-700 transition-all hover:-translate-y-px hover:bg-gray-50 hover:text-gray-950 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <Github className="h-3.5 w-3.5" />
              View source
            </a>
            <button
              type="button"
              onClick={replayScenario}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/70 bg-cyan-50 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-800 transition-all hover:-translate-y-px hover:bg-cyan-100 dark:border-cyan-800/70 dark:bg-cyan-950/40 dark:text-cyan-200 dark:hover:bg-cyan-950"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Replay scenario
            </button>
            <button
              type="button"
              onClick={resetDemo}
              className="inline-flex items-center gap-2 rounded-full border border-gray-300/70 bg-white/80 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-700 transition-all hover:-translate-y-px hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset demo
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto min-w-0 max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_0_6px_rgba(6,182,212,0.12)]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                Planner workspace
              </span>
            </div>
            <h1 className="mt-5 max-w-full break-words text-4xl font-semibold leading-[1.02] tracking-tight text-gray-950 dark:text-white sm:max-w-4xl sm:text-5xl lg:text-6xl">
              Resequence the bottleneck without breaking the rest of the shop.
            </h1>
            <p className="mt-5 max-w-full text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:max-w-3xl sm:text-lg">
              This is a synthetic, recruiter-safe version of the scheduling
              problem Machine Cadence handles: 8 machines, multi-operation
              jobs, anchored running work, queue-aware material pressure, and
              downstream cascade after a planner changes the sequence.
            </p>
          </div>

          <GuidedScenario
            guidedMoved={guidedMoved}
            impactReviewed={Boolean(lastImpact)}
            selectedRush={selectedEntryId === DEMO_DATA.guidedEntryId}
            onReplay={replayScenario}
          />
        </section>

        <section className="mt-8 grid min-w-0 gap-3 sm:grid-cols-2 md:grid-cols-4">
          <MetricTile
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="On track"
            value={derived.metrics.onTrack}
            tone="emerald"
          />
          <MetricTile
            icon={<TriangleAlert className="h-4 w-4" />}
            label="At risk"
            value={derived.metrics.atRisk}
            tone="amber"
          />
          <MetricTile
            icon={<Flag className="h-4 w-4" />}
            label="Late"
            value={derived.metrics.late}
            tone="rose"
          />
          <MetricTile
            icon={<Factory className="h-4 w-4" />}
            label="Avg load"
            value={`${derived.metrics.avgUtilization}%`}
            tone="violet"
          />
        </section>

        <section className="mt-8 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 space-y-5">
            <UtilizationStrip derived={derived} />

            <div className="grid min-w-0 gap-4 xl:grid-cols-2">
              {DEMO_DATA.machines.map((machine) => (
                <MachineLane
                  key={machine.id}
                  machine={machine}
                  entries={derived.entriesByMachine[machine.id] ?? []}
                  derived={derived}
                  machineById={machineById}
                  selectedEntryId={selectedEntryId}
                  draggedEntryId={draggedEntryId}
                  onSelect={setSelectedEntryId}
                  onMove={handleMove}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDropBefore={handleDropBefore}
                  onDropEnd={handleDropEnd}
                />
              ))}
            </div>
          </div>

          <aside className="min-w-0 space-y-5 lg:sticky lg:top-24 lg:self-start">
            <SelectedJobPanel
              selectedEntry={selectedEntry}
              selectedSummary={selectedSummary}
              machineById={machineById}
              onMoveTop={handleMove}
            />
            <ImpactPanel impact={lastImpact} />
            <SyntheticDataPanel />
          </aside>
        </section>
      </main>
    </div>
  )
}

function GuidedScenario({
  guidedMoved,
  impactReviewed,
  selectedRush,
  onReplay,
}: {
  guidedMoved: boolean
  impactReviewed: boolean
  selectedRush: boolean
  onReplay: () => void
}) {
  const items = [
    {
      label: 'Find the bottleneck: Mill 1 has a rush operation buried behind standard work.',
      done: selectedRush,
    },
    {
      label: 'Move J-2407 Op20 to the top of the movable Mill 1 queue.',
      done: guidedMoved,
    },
    {
      label: 'Review the cascade impact and downstream due-date changes.',
      done: impactReviewed,
    },
  ]

  return (
    <div className="min-w-0 rounded-dawn-xl border border-cyan-200/60 bg-white/80 p-5 shadow-dawn backdrop-blur-xl dark:border-cyan-900/50 dark:bg-gray-950/70">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-400">
            Guided scenario
          </div>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-gray-950 dark:text-white">
            Rush order triage
          </h2>
        </div>
        <button
          type="button"
          onClick={onReplay}
          className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-all hover:-translate-y-px hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100"
        >
          <Zap className="h-3.5 w-3.5" />
          Run
        </button>
      </div>

      <ol className="mt-5 space-y-3">
        {items.map((item, index) => (
          <li key={item.label} className="flex min-w-0 gap-3">
            <span
              className={cx(
                'mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                item.done
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
              )}
            >
              {item.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <span className="min-w-0 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {item.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function UtilizationStrip({ derived }: { derived: DerivedSchedule }) {
  return (
    <div className="rounded-dawn-xl border border-gray-200/60 bg-white/80 p-4 shadow-dawn backdrop-blur-xl dark:border-gray-800/70 dark:bg-gray-950/70">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
            Machine load
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Utilization reflects the synthetic 12-workday planning window.
          </p>
        </div>
        <StatusPill icon={<Layers3 className="h-3.5 w-3.5" />} label="8 machines" tone="gray" />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {DEMO_DATA.machines.map((machine) => {
          const load = derived.utilizationByMachine[machine.id] ?? 0
          return (
            <div key={machine.id} className="min-w-0">
              <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
                <span className="truncate font-semibold text-gray-700 dark:text-gray-300">
                  {machine.name}
                </span>
                <span className="tabular-nums text-gray-400">{load}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${load}%`, background: machine.accent }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MachineLane({
  machine,
  entries,
  derived,
  machineById,
  selectedEntryId,
  draggedEntryId,
  onSelect,
  onMove,
  onDragStart,
  onDragEnd,
  onDropBefore,
  onDropEnd,
}: {
  machine: DemoMachine
  entries: ScheduledEntry[]
  derived: DerivedSchedule
  machineById: Map<string, DemoMachine>
  selectedEntryId: string
  draggedEntryId: string | null
  onSelect: (entryId: string) => void
  onMove: (entryId: string, mode: 'up' | 'down' | 'top' | 'before' | 'end', targetEntryId?: string) => void
  onDragStart: (event: DragEvent<HTMLElement>, entry: ScheduledEntry) => void
  onDragEnd: () => void
  onDropBefore: (event: DragEvent<HTMLElement>, entry: ScheduledEntry) => void
  onDropEnd: (event: DragEvent<HTMLElement>, machineId: string) => void
}) {
  const runningEntry = entries.find((entry) => isAnchor(entry))
  const utilization = derived.utilizationByMachine[machine.id] ?? 0

  return (
    <section className="min-w-0 overflow-hidden rounded-dawn-xl border border-gray-200/60 bg-white/80 shadow-dawn backdrop-blur-xl dark:border-gray-800/70 dark:bg-gray-950/70">
      <div className="border-b border-gray-100/80 px-4 py-3 dark:border-gray-800">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: machine.accent }} />
              <h2 className="truncate text-base font-semibold tracking-tight text-gray-950 dark:text-white">
                {machine.name}
              </h2>
              {runningEntry && <StatusPill label="anchored" tone="emerald" />}
            </div>
            <p className="mt-1 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
              {machine.description}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold tabular-nums text-gray-950 dark:text-white">
              {utilization}%
            </div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400">load</div>
          </div>
        </div>
      </div>

      <div
        className="space-y-2 p-3"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => onDropEnd(event, machine.id)}
      >
        {entries.map((entry, index) => {
          const summary = derived.jobSummaryMap.get(entry.jobId)
          if (!summary) return null
          return (
            <OperationCard
              key={entry.id}
              entry={entry}
              summary={summary}
              rank={index + 1}
              machineById={machineById}
              selected={entry.id === selectedEntryId}
              dragging={entry.id === draggedEntryId}
              canMoveUp={!isAnchor(entry) && index > firstMovableIndex(entries)}
              canMoveDown={!isAnchor(entry) && index < entries.length - 1}
              onSelect={onSelect}
              onMove={onMove}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDropBefore={onDropBefore}
            />
          )
        })}
      </div>
    </section>
  )
}

function OperationCard({
  entry,
  summary,
  rank,
  machineById,
  selected,
  dragging,
  canMoveUp,
  canMoveDown,
  onSelect,
  onMove,
  onDragStart,
  onDragEnd,
  onDropBefore,
}: {
  entry: ScheduledEntry
  summary: JobSummary
  rank: number
  machineById: Map<string, DemoMachine>
  selected: boolean
  dragging: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  onSelect: (entryId: string) => void
  onMove: (entryId: string, mode: 'up' | 'down' | 'top') => void
  onDragStart: (event: DragEvent<HTMLElement>, entry: ScheduledEntry) => void
  onDragEnd: () => void
  onDropBefore: (event: DragEvent<HTMLElement>, entry: ScheduledEntry) => void
}) {
  const locked = isAnchor(entry)
  const machine = machineById.get(entry.machineId)
  const isGuided = entry.id === DEMO_DATA.guidedEntryId
  const operationLabel = `${summary.job.jobNumber} Op${entry.opNumber}`

  return (
    <article
      draggable={!locked}
      onDragStart={(event) => onDragStart(event, entry)}
      onDragEnd={onDragEnd}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => onDropBefore(event, entry)}
      onClick={() => onSelect(entry.id)}
      className={cx(
        'group relative min-w-0 cursor-pointer rounded-dawn-lg border bg-white/85 p-3 shadow-sm transition-all dark:bg-gray-900/70',
        selected
          ? 'border-cyan-400 ring-2 ring-cyan-400/20'
          : 'border-gray-200/70 hover:border-cyan-300/70 dark:border-gray-800 dark:hover:border-cyan-800',
        dragging && 'opacity-45',
        isGuided && 'shadow-[0_0_0_1px_rgba(6,182,212,0.35)]',
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={cx(
            'mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold tabular-nums',
            locked
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300',
          )}
        >
          {locked ? <Zap className="h-3.5 w-3.5" /> : rank}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-bold tracking-tight text-gray-950 dark:text-white">
              {summary.job.jobNumber}
            </span>
            <PriorityBadge priority={summary.job.priority} />
            <RiskBadge risk={summary.risk} />
            {locked && <StatusPill label="running" tone="emerald" />}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {summary.part.itemId}
            </span>
            <span>{entry.opLabel}</span>
            <span>Op {entry.opNumber}</span>
          </div>
          <div className="mt-3 grid gap-2 text-[11px] text-gray-500 dark:text-gray-400 sm:grid-cols-2">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDemoRange(entry.startOffset, entry.endOffset)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {entry.durationDays} workday{entry.durationDays === 1 ? '' : 's'}
            </span>
            <span className="inline-flex items-center gap-1">
              <Flag className="h-3.5 w-3.5" />
              Due {formatDemoDate(summary.job.dueOffset)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Database className="h-3.5 w-3.5" />
              {materialLabel(summary.material.state)}
            </span>
          </div>
        </div>

        <GripVertical
          className={cx(
            'mt-1 h-4 w-4 shrink-0 text-gray-300 transition-colors',
            locked ? 'opacity-20' : 'group-hover:text-gray-500 dark:group-hover:text-gray-300',
          )}
        />
      </div>

      <div className="mt-3 flex min-w-0 flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
        <span className="text-[10px] uppercase tracking-wider text-gray-400">
          {machine?.name ?? 'Machine'} queue
        </span>
        <div className="flex items-center gap-1.5">
          <IconButton
            label={`Move ${operationLabel} up`}
            disabled={!canMoveUp}
            onClick={() => onMove(entry.id, 'up')}
            icon={<ArrowUp className="h-3.5 w-3.5" />}
          />
          <IconButton
            label={`Move ${operationLabel} down`}
            disabled={!canMoveDown}
            onClick={() => onMove(entry.id, 'down')}
            icon={<ArrowDown className="h-3.5 w-3.5" />}
          />
          <button
            type="button"
            aria-label={`Move ${operationLabel} to top`}
            title={`Move ${operationLabel} to top`}
            disabled={locked}
            onClick={(event) => {
              event.stopPropagation()
              onMove(entry.id, 'top')
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-600 transition-colors hover:border-cyan-300 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-35 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:border-cyan-700 dark:hover:text-cyan-300"
          >
            <MoveUp className="h-3.5 w-3.5" />
            Top
          </button>
        </div>
      </div>
    </article>
  )
}

function SelectedJobPanel({
  selectedEntry,
  selectedSummary,
  machineById,
  onMoveTop,
}: {
  selectedEntry: ScheduledEntry | null
  selectedSummary: JobSummary | null
  machineById: Map<string, DemoMachine>
  onMoveTop: (entryId: string, mode: 'top') => void
}) {
  if (!selectedEntry || !selectedSummary) {
    return (
    <section className="min-w-0 rounded-dawn-xl border border-gray-200/60 bg-white/80 p-5 shadow-dawn dark:border-gray-800/70 dark:bg-gray-950/70">
        <h2 className="text-lg font-semibold">Select an operation</h2>
        <p className="mt-2 text-sm text-gray-500">Choose a queue row to inspect route and risk.</p>
      </section>
    )
  }

  const locked = isAnchor(selectedEntry)

  return (
    <section className="min-w-0 rounded-dawn-xl border border-gray-200/60 bg-white/80 p-5 shadow-dawn backdrop-blur-xl dark:border-gray-800/70 dark:bg-gray-950/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
            Selected job
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">
            {selectedSummary.job.jobNumber}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {selectedSummary.part.itemId} - {selectedSummary.part.description}
          </p>
        </div>
        <RiskBadge risk={selectedSummary.risk} size="md" />
      </div>

      <p className="mt-4 rounded-dawn-lg bg-gray-50 px-3 py-2 text-sm leading-relaxed text-gray-600 dark:bg-gray-900 dark:text-gray-300">
        {selectedSummary.job.note}
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <MiniFact label="Due" value={formatDemoDate(selectedSummary.job.dueOffset)} />
        <MiniFact label="Finish" value={formatDemoDate(selectedSummary.finishOffset)} />
        <MiniFact
          label="Slack"
          value={
            selectedSummary.slackDays >= 0
              ? `${selectedSummary.slackDays}d`
              : `${Math.abs(selectedSummary.slackDays)}d late`
          }
        />
      </div>

      <div className="mt-5">
        <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
          Operation route
        </div>
        <div className="space-y-2">
          {selectedSummary.entries.map((entry) => {
            const active = entry.id === selectedEntry.id
            const machine = machineById.get(entry.machineId)
            return (
              <div
                key={entry.id}
                className={cx(
                  'rounded-dawn-lg border px-3 py-2 text-sm',
                  active
                    ? 'border-cyan-300 bg-cyan-50 text-cyan-950 dark:border-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-100'
                    : 'border-gray-200 bg-white/60 text-gray-600 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-300',
                )}
              >
                <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                  <span className="min-w-0 font-semibold">
                    Op {entry.opNumber}: {entry.opLabel}
                  </span>
                  <span className="shrink-0 text-xs text-gray-500">{formatDemoRange(entry.startOffset, entry.endOffset)}</span>
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {machine?.name ?? 'Machine'} - {entry.durationDays} workday
                  {entry.durationDays === 1 ? '' : 's'}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-5 rounded-dawn-lg border border-gray-200/70 bg-gray-50/80 p-3 dark:border-gray-800 dark:bg-gray-900/70">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
              Material: {selectedSummary.part.materialName}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Needs {selectedSummary.material.needed}; available at start{' '}
              {selectedSummary.material.availableAtStart}
            </div>
          </div>
          <MaterialBadge state={selectedSummary.material.state} />
        </div>
      </div>

      <button
        type="button"
        disabled={locked}
        onClick={() => onMoveTop(selectedEntry.id, 'top')}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gray-900 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-all hover:-translate-y-px hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100"
      >
        <MoveUp className="h-4 w-4" />
        Move selected op to top
      </button>
    </section>
  )
}

function ImpactPanel({ impact }: { impact: DemoImpact | null }) {
  return (
    <section className="min-w-0 rounded-dawn-xl border border-gray-200/60 bg-white/80 p-5 shadow-dawn backdrop-blur-xl dark:border-gray-800/70 dark:bg-gray-950/70">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
            Cascade impact
          </div>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-gray-950 dark:text-white">
            {impact ? impact.message : 'No move applied yet'}
          </h2>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
          <Layers3 className="h-5 w-5" />
        </span>
      </div>

      {impact ? (
        <>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <MiniFact label="Changed" value={impact.changedEntries} />
            <MiniFact label="Cascaded" value={impact.cascadedEntries} />
            <MiniFact label="Recovered" value={impact.recoveredJobs.length} />
          </div>
          <ImpactList title="Improved jobs" items={impact.improvedJobs} empty="No job pulled earlier." />
          <ImpactList title="Delayed jobs" items={impact.delayedJobs} empty="No downstream delay." />
          {impact.newlyLateJobs.length > 0 && (
            <ImpactList title="New late risk" items={impact.newlyLateJobs} empty="" />
          )}
        </>
      ) : (
        <p className="mt-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          Move the rush operation on Mill 1. The demo will show which operations
          moved, which downstream steps cascaded, and whether any job crossed a
          due-date boundary.
        </p>
      )}
    </section>
  )
}

function ImpactList({ title, items, empty }: { title: string; items: JobImpact[]; empty: string }) {
  return (
    <div className="mt-4">
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
        {title}
      </div>
      {items.length === 0 ? (
        <p className="mt-2 text-xs text-gray-400">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {items.slice(0, 4).map((item) => (
            <li
              key={`${title}-${item.jobNumber}`}
              className="flex items-center justify-between gap-3 rounded-dawn-lg bg-gray-50 px-3 py-2 text-xs dark:bg-gray-900"
            >
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {item.jobNumber} / {item.partItem}
              </span>
              <span
                className={cx(
                  'font-mono font-bold tabular-nums',
                  item.deltaDays < 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400',
                )}
              >
                {formatDelta(item.deltaDays)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SyntheticDataPanel() {
  return (
    <section className="min-w-0 rounded-dawn-xl border border-cyan-200/60 bg-cyan-50/80 p-5 text-cyan-950 shadow-dawn backdrop-blur-xl dark:border-cyan-900/50 dark:bg-cyan-950/30 dark:text-cyan-100">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.18em]">Synthetic data boundary</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Jobs, parts, dates, material balances, and quantities are invented
            for this public demo. The behavior mirrors planner decisions without
            exposing real production records or customer data.
          </p>
        </div>
      </div>
    </section>
  )
}

function MetricTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode
  label: string
  value: number | string
  tone: 'emerald' | 'amber' | 'rose' | 'violet'
}) {
  const toneClass = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-900',
    amber: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/30 dark:border-amber-900',
    rose: 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950/30 dark:border-rose-900',
    violet: 'text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-300 dark:bg-violet-950/30 dark:border-violet-900',
  }[tone]

  return (
    <div className={cx('rounded-dawn-xl border p-4 shadow-dawn backdrop-blur-xl', toneClass)}>
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/75 dark:bg-gray-950/50">
          {icon}
        </span>
        <span className="text-3xl font-bold tabular-nums tracking-tight">{value}</span>
      </div>
      <div className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em] opacity-80">
        {label}
      </div>
    </div>
  )
}

function MiniFact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-dawn-lg border border-gray-200/70 bg-white/70 px-3 py-2 dark:border-gray-800 dark:bg-gray-900/70">
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">{label}</div>
      <div className="mt-1 text-sm font-semibold tabular-nums text-gray-950 dark:text-white">{value}</div>
    </div>
  )
}

function IconButton({
  label,
  icon,
  disabled,
  onClick,
}: {
  label: string
  icon: ReactNode
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-cyan-300 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-35 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:border-cyan-700 dark:hover:text-cyan-300"
    >
      {icon}
    </button>
  )
}

function StatusPill({
  icon,
  label,
  tone = 'gray',
}: {
  icon?: ReactNode
  label: string
  tone?: 'gray' | 'cyan' | 'emerald'
}) {
  const toneClass = {
    gray: 'border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300',
    cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-300',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
  }[tone]

  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]',
        toneClass,
      )}
    >
      {icon}
      {label}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: 'rush' | 'high' | 'standard' }) {
  const className = {
    rush: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300',
    high: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
    standard: 'border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400',
  }[priority]
  return (
    <span className={cx('rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', className)}>
      {priority}
    </span>
  )
}

function RiskBadge({ risk, size = 'sm' }: { risk: RiskStatus; size?: 'sm' | 'md' }) {
  const label = {
    'on-track': 'On track',
    'at-risk': 'At risk',
    late: 'Late',
    blocked: 'Material',
  }[risk]
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full border font-bold uppercase tracking-wide',
        size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[10px]',
        riskTone(risk),
      )}
    >
      {label}
    </span>
  )
}

function MaterialBadge({ state }: { state: MaterialState }) {
  return (
    <span
      className={cx(
        'inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
        materialTone(state),
      )}
    >
      {materialLabel(state)}
    </span>
  )
}

function firstMovableIndex(entries: ScheduledEntry[]): number {
  const index = entries.findIndex((entry) => !isAnchor(entry))
  return index < 0 ? entries.length : index
}

function formatDelta(deltaDays: number): string {
  if (deltaDays === 0) return 'same'
  if (deltaDays < 0) return `${Math.abs(deltaDays)}d earlier`
  return `${deltaDays}d later`
}

function materialLabel(state: MaterialState): string {
  if (state === 'ready') return 'On hand'
  if (state === 'po-coming') return 'PO coming'
  return 'Short'
}

function riskTone(risk: RiskStatus): string {
  if (risk === 'on-track') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
  }
  if (risk === 'at-risk') {
    return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
  }
  if (risk === 'blocked') {
    return 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300'
  }
  return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300'
}

function materialTone(state: MaterialState): string {
  if (state === 'ready') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
  }
  if (state === 'po-coming') {
    return 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300'
  }
  return 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300'
}
