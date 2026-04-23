export type EntryStatus = 'scheduled' | 'running' | 'finishing'
export type Priority = 'rush' | 'high' | 'standard'
export type RiskStatus = 'on-track' | 'at-risk' | 'late' | 'blocked'
export type MaterialState = 'ready' | 'po-coming' | 'short'

export interface DemoMachine {
  id: string
  name: string
  type: string
  accent: string
  workHours: number
  description: string
}

export interface DemoPart {
  id: string
  itemId: string
  description: string
  materialId: string
  materialName: string
  materialPerUnit: number
}

export interface DemoJob {
  id: string
  jobNumber: string
  partId: string
  quantity: number
  dueOffset: number
  priority: Priority
  note: string
}

export interface DemoEntrySeed {
  id: string
  jobId: string
  opNumber: number
  opLabel: string
  machineId: string
  durationDays: number
  status: EntryStatus
  startOffset: number
  endOffset: number
}

export interface DemoMaterial {
  id: string
  name: string
  onHand: number
  receipts: Array<{ offset: number; qty: number }>
}

export interface DemoData {
  machines: DemoMachine[]
  parts: DemoPart[]
  jobs: DemoJob[]
  entries: DemoEntrySeed[]
  materials: DemoMaterial[]
  initialOrderByMachine: Record<string, string[]>
  guidedEntryId: string
}

export interface ScheduledEntry extends DemoEntrySeed {
  startOffset: number
  endOffset: number
}

export interface MaterialResult {
  state: MaterialState
  needed: number
  availableAtStart: number
  shortfall: number
  etaOffset: number | null
}

export interface JobSummary {
  job: DemoJob
  part: DemoPart
  entries: ScheduledEntry[]
  startOffset: number
  finishOffset: number
  slackDays: number
  risk: RiskStatus
  material: MaterialResult
}

export interface DemoMetrics {
  onTrack: number
  atRisk: number
  late: number
  blocked: number
  avgUtilization: number
}

export interface DerivedSchedule {
  entries: ScheduledEntry[]
  entryMap: Map<string, ScheduledEntry>
  entriesByMachine: Record<string, ScheduledEntry[]>
  jobSummaries: JobSummary[]
  jobSummaryMap: Map<string, JobSummary>
  metrics: DemoMetrics
  utilizationByMachine: Record<string, number>
}

export interface JobImpact {
  jobNumber: string
  partItem: string
  deltaDays: number
  beforeRisk: RiskStatus
  afterRisk: RiskStatus
}

export interface DemoImpact {
  movedEntryId: string
  changedEntries: number
  cascadedEntries: number
  improvedJobs: JobImpact[]
  delayedJobs: JobImpact[]
  newlyLateJobs: JobImpact[]
  recoveredJobs: JobImpact[]
  message: string
}

export type MoveMode = 'up' | 'down' | 'top' | 'before' | 'end'

const BASE_DATE = new Date(2026, 3, 27)
const HORIZON_DAYS = 12

export const DEMO_DATA: DemoData = {
  guidedEntryId: 'entry-adapter-20',
  machines: [
    {
      id: 'saw-a',
      name: 'Saw Cell A',
      type: 'Saw',
      accent: '#0ea5e9',
      workHours: 8,
      description: 'Raw stock prep and first-pass blanks',
    },
    {
      id: 'mill-1',
      name: 'Mill 1',
      type: 'Vertical Mill',
      accent: '#6366f1',
      workHours: 8,
      description: 'Bottleneck mill for tight-tolerance housings',
    },
    {
      id: 'mill-2',
      name: 'Mill 2',
      type: 'Vertical Mill',
      accent: '#8b5cf6',
      workHours: 8,
      description: 'General milling and secondary ops',
    },
    {
      id: 'lathe-1',
      name: 'Lathe 1',
      type: 'Lathe',
      accent: '#14b8a6',
      workHours: 8,
      description: 'Precision turning and bores',
    },
    {
      id: 'lathe-2',
      name: 'Lathe 2',
      type: 'Lathe',
      accent: '#10b981',
      workHours: 8,
      description: 'Longer-cycle shafts and collars',
    },
    {
      id: 'grind-1',
      name: 'Grinder 1',
      type: 'Grind',
      accent: '#64748b',
      workHours: 8,
      description: 'Finish-grind and tight surface work',
    },
    {
      id: 'waterjet-1',
      name: 'Waterjet 1',
      type: 'Waterjet',
      accent: '#06b6d4',
      workHours: 8,
      description: 'Plate blanks and fast-start rush work',
    },
    {
      id: 'qc-1',
      name: 'Final QC',
      type: 'Inspection',
      accent: '#f59e0b',
      workHours: 8,
      description: 'Inspection, paperwork, and release',
    },
  ],
  parts: [
    {
      id: 'part-adapter',
      itemId: 'PX-410',
      description: 'Adapter ring',
      materialId: 'mat-aluminum',
      materialName: '6061-T6 aluminum bar',
      materialPerUnit: 3.2,
    },
    {
      id: 'part-valve',
      itemId: 'PX-226',
      description: 'Valve body',
      materialId: 'mat-aluminum',
      materialName: '6061-T6 aluminum bar',
      materialPerUnit: 2.4,
    },
    {
      id: 'part-housing',
      itemId: 'PX-315',
      description: 'Housing cap',
      materialId: 'mat-stainless',
      materialName: '303 stainless round',
      materialPerUnit: 1.8,
    },
    {
      id: 'part-collar',
      itemId: 'PX-128',
      description: 'Shaft collar',
      materialId: 'mat-steel',
      materialName: '4140 steel rod',
      materialPerUnit: 1.5,
    },
    {
      id: 'part-block',
      itemId: 'PX-562',
      description: 'Mount block',
      materialId: 'mat-aluminum',
      materialName: '6061-T6 aluminum bar',
      materialPerUnit: 2.1,
    },
    {
      id: 'part-link',
      itemId: 'PX-744',
      description: 'Link plate',
      materialId: 'mat-plate',
      materialName: '7075 aluminum plate',
      materialPerUnit: 1.2,
    },
    {
      id: 'part-knob',
      itemId: 'PX-091',
      description: 'Knob insert',
      materialId: 'mat-delrin',
      materialName: 'Delrin rod',
      materialPerUnit: 0.8,
    },
    {
      id: 'part-bracket',
      itemId: 'PX-278',
      description: 'Bracket rail',
      materialId: 'mat-stainless',
      materialName: '303 stainless round',
      materialPerUnit: 1.3,
    },
  ],
  jobs: [
    {
      id: 'job-adapter',
      jobNumber: 'J-2407',
      partId: 'part-adapter',
      quantity: 90,
      dueOffset: 8,
      priority: 'rush',
      note: 'Expedite order. The planner needs this through Mill 1 today.',
    },
    {
      id: 'job-valve',
      jobNumber: 'J-2388',
      partId: 'part-valve',
      quantity: 70,
      dueOffset: 10,
      priority: 'high',
      note: 'Running on the bottleneck mill; fixed anchor for the demo.',
    },
    {
      id: 'job-housing',
      jobNumber: 'J-2394',
      partId: 'part-housing',
      quantity: 120,
      dueOffset: 11,
      priority: 'standard',
      note: 'Standard replenishment with a narrow material window.',
    },
    {
      id: 'job-collar',
      jobNumber: 'J-2398',
      partId: 'part-collar',
      quantity: 160,
      dueOffset: 9,
      priority: 'high',
      note: 'Lathe 2 is already running this job; do not move the anchor.',
    },
    {
      id: 'job-block',
      jobNumber: 'J-2412',
      partId: 'part-block',
      quantity: 110,
      dueOffset: 12,
      priority: 'standard',
      note: 'Can absorb a small delay if the rush job needs the bottleneck.',
    },
    {
      id: 'job-link',
      jobNumber: 'J-2416',
      partId: 'part-link',
      quantity: 220,
      dueOffset: 7,
      priority: 'high',
      note: 'Waterjet work is already in progress.',
    },
    {
      id: 'job-knob',
      jobNumber: 'J-2421',
      partId: 'part-knob',
      quantity: 260,
      dueOffset: 13,
      priority: 'standard',
      note: 'Stable filler job for Lathe 2.',
    },
    {
      id: 'job-bracket',
      jobNumber: 'J-2427',
      partId: 'part-bracket',
      quantity: 140,
      dueOffset: 10,
      priority: 'standard',
      note: 'Inspection queue pressure is the risk.',
    },
  ],
  materials: [
    {
      id: 'mat-aluminum',
      name: '6061-T6 aluminum bar',
      onHand: 560,
      receipts: [{ offset: 6, qty: 280 }],
    },
    {
      id: 'mat-stainless',
      name: '303 stainless round',
      onHand: 190,
      receipts: [{ offset: 5, qty: 260 }],
    },
    {
      id: 'mat-steel',
      name: '4140 steel rod',
      onHand: 420,
      receipts: [{ offset: 9, qty: 120 }],
    },
    {
      id: 'mat-plate',
      name: '7075 aluminum plate',
      onHand: 170,
      receipts: [{ offset: 4, qty: 180 }],
    },
    {
      id: 'mat-delrin',
      name: 'Delrin rod',
      onHand: 120,
      receipts: [{ offset: 8, qty: 160 }],
    },
  ],
  entries: [
    makeEntry('entry-adapter-10', 'job-adapter', 10, 'Saw blank', 'saw-a', 1, 'scheduled', 1),
    makeEntry('entry-adapter-20', 'job-adapter', 20, 'Mill bore', 'mill-1', 2, 'scheduled', 7),
    makeEntry('entry-adapter-30', 'job-adapter', 30, 'Turn face', 'lathe-1', 2, 'scheduled', 9),
    makeEntry('entry-adapter-40', 'job-adapter', 40, 'Finish grind', 'grind-1', 1, 'scheduled', 11),
    makeEntry('entry-adapter-50', 'job-adapter', 50, 'Final inspect', 'qc-1', 1, 'scheduled', 12),

    makeEntry('entry-valve-20', 'job-valve', 20, 'Mill cavity', 'mill-1', 3, 'running', 0),
    makeEntry('entry-valve-30', 'job-valve', 30, 'Mill ports', 'mill-2', 2, 'scheduled', 4),
    makeEntry('entry-valve-40', 'job-valve', 40, 'Final inspect', 'qc-1', 1, 'scheduled', 7),

    makeEntry('entry-housing-10', 'job-housing', 10, 'Saw blank', 'saw-a', 1, 'scheduled', 0),
    makeEntry('entry-housing-20', 'job-housing', 20, 'Mill profile', 'mill-1', 2, 'scheduled', 3),
    makeEntry('entry-housing-30', 'job-housing', 30, 'Turn bore', 'lathe-1', 1, 'scheduled', 6),
    makeEntry('entry-housing-40', 'job-housing', 40, 'Final inspect', 'qc-1', 1, 'scheduled', 9),

    makeEntry('entry-collar-20', 'job-collar', 20, 'Turn OD', 'lathe-2', 3, 'running', 0),
    makeEntry('entry-collar-30', 'job-collar', 30, 'Finish grind', 'grind-1', 1, 'scheduled', 5),
    makeEntry('entry-collar-40', 'job-collar', 40, 'Final inspect', 'qc-1', 1, 'scheduled', 6),

    makeEntry('entry-block-10', 'job-block', 10, 'Saw blank', 'saw-a', 1, 'scheduled', 2),
    makeEntry('entry-block-20', 'job-block', 20, 'Mill pockets', 'mill-2', 3, 'scheduled', 6),
    makeEntry('entry-block-30', 'job-block', 30, 'Final inspect', 'qc-1', 1, 'scheduled', 11),

    makeEntry('entry-link-10', 'job-link', 10, 'Waterjet plate', 'waterjet-1', 2, 'running', 0),
    makeEntry('entry-link-20', 'job-link', 20, 'Deburr mill', 'mill-2', 2, 'scheduled', 2),
    makeEntry('entry-link-30', 'job-link', 30, 'Final inspect', 'qc-1', 1, 'scheduled', 5),

    makeEntry('entry-knob-10', 'job-knob', 10, 'Turn insert', 'lathe-2', 2, 'scheduled', 4),
    makeEntry('entry-knob-20', 'job-knob', 20, 'Final inspect', 'qc-1', 1, 'scheduled', 13),

    makeEntry('entry-bracket-10', 'job-bracket', 10, 'Waterjet rail', 'waterjet-1', 1, 'scheduled', 3),
    makeEntry('entry-bracket-20', 'job-bracket', 20, 'Mill slots', 'mill-1', 2, 'scheduled', 5),
    makeEntry('entry-bracket-30', 'job-bracket', 30, 'Final inspect', 'qc-1', 1, 'scheduled', 10),
  ],
  initialOrderByMachine: {
    'saw-a': ['entry-housing-10', 'entry-adapter-10', 'entry-block-10'],
    'mill-1': [
      'entry-valve-20',
      'entry-housing-20',
      'entry-bracket-20',
      'entry-adapter-20',
    ],
    'mill-2': ['entry-link-20', 'entry-valve-30', 'entry-block-20'],
    'lathe-1': ['entry-housing-30', 'entry-adapter-30'],
    'lathe-2': ['entry-collar-20', 'entry-knob-10'],
    'grind-1': ['entry-collar-30', 'entry-adapter-40'],
    'waterjet-1': ['entry-link-10', 'entry-bracket-10'],
    'qc-1': [
      'entry-link-30',
      'entry-collar-40',
      'entry-valve-40',
      'entry-housing-40',
      'entry-bracket-30',
      'entry-adapter-50',
      'entry-block-30',
      'entry-knob-20',
    ],
  },
}

function makeEntry(
  id: string,
  jobId: string,
  opNumber: number,
  opLabel: string,
  machineId: string,
  durationDays: number,
  status: EntryStatus,
  startOffset: number,
): DemoEntrySeed {
  return {
    id,
    jobId,
    opNumber,
    opLabel,
    machineId,
    durationDays,
    status,
    startOffset,
    endOffset: startOffset + durationDays - 1,
  }
}

export function isAnchor(entry: Pick<DemoEntrySeed, 'status'>): boolean {
  return entry.status === 'running' || entry.status === 'finishing'
}

export function cloneOrder(orderByMachine: Record<string, string[]>): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(orderByMachine).map(([machineId, ids]) => [machineId, [...ids]]),
  )
}

export function deriveSchedule(
  data: DemoData,
  orderByMachine: Record<string, string[]>,
): DerivedSchedule {
  const seedById = new Map(data.entries.map((entry) => [entry.id, entry]))
  const scheduledById = new Map<string, ScheduledEntry>(
    data.entries.map((entry) => [entry.id, { ...entry }]),
  )
  const entriesByJob = buildEntriesByJob(data.entries)

  for (let pass = 0; pass < data.entries.length + 4; pass += 1) {
    let changed = false

    for (const machine of data.machines) {
      const queue = orderByMachine[machine.id] ?? []
      let previousEnd = -1

      for (const entryId of queue) {
        const current = scheduledById.get(entryId)
        const seed = seedById.get(entryId)
        if (!current || !seed) continue

        if (isAnchor(seed)) {
          previousEnd = Math.max(previousEnd, seed.endOffset)
          continue
        }

        let nextStart = previousEnd + 1
        const priorOp = getPriorOperation(current, entriesByJob, scheduledById)
        if (priorOp) {
          nextStart = Math.max(nextStart, priorOp.endOffset + 1)
        }

        const nextEnd = nextStart + current.durationDays - 1
        if (current.startOffset !== nextStart || current.endOffset !== nextEnd) {
          scheduledById.set(entryId, {
            ...current,
            startOffset: nextStart,
            endOffset: nextEnd,
          })
          changed = true
        }
        previousEnd = nextEnd
      }
    }

    if (!changed) break
  }

  const entries = Array.from(scheduledById.values())
  const entryMap = new Map(entries.map((entry) => [entry.id, entry]))
  const entriesByMachine: Record<string, ScheduledEntry[]> = {}
  for (const machine of data.machines) {
    entriesByMachine[machine.id] = (orderByMachine[machine.id] ?? [])
      .map((id) => entryMap.get(id))
      .filter((entry): entry is ScheduledEntry => Boolean(entry))
  }

  const materialByJob = calculateMaterials(data, entries)
  const partById = new Map(data.parts.map((part) => [part.id, part]))
  const jobsById = new Map(data.jobs.map((job) => [job.id, job]))

  const jobSummaries = data.jobs.map((job) => {
    const part = partById.get(job.partId)
    if (!part) {
      throw new Error(`Missing part for ${job.jobNumber}`)
    }
    const jobEntries = entries
      .filter((entry) => entry.jobId === job.id)
      .sort((a, b) => a.opNumber - b.opNumber)
    const startOffset = Math.min(...jobEntries.map((entry) => entry.startOffset))
    const finishOffset = Math.max(...jobEntries.map((entry) => entry.endOffset))
    const material = materialByJob.get(job.id) ?? {
      state: 'ready' as const,
      needed: 0,
      availableAtStart: 0,
      shortfall: 0,
      etaOffset: null,
    }
    const slackDays = job.dueOffset - finishOffset
    const dateRisk = slackDays < 0 ? 'late' : slackDays <= 1 ? 'at-risk' : 'on-track'
    const risk: RiskStatus = material.state === 'short' ? 'blocked' : dateRisk

    return {
      job,
      part,
      entries: jobEntries,
      startOffset,
      finishOffset,
      slackDays,
      risk,
      material,
    }
  })

  const jobSummaryMap = new Map(jobSummaries.map((summary) => [summary.job.id, summary]))
  const utilizationByMachine = calculateUtilization(data.machines, entriesByMachine)
  const utilizationValues = Object.values(utilizationByMachine)
  const metrics = jobSummaries.reduce<DemoMetrics>(
    (acc, summary) => {
      if (summary.risk === 'blocked') acc.blocked += 1
      else if (summary.risk === 'late') acc.late += 1
      else if (summary.risk === 'at-risk') acc.atRisk += 1
      else acc.onTrack += 1
      return acc
    },
    {
      onTrack: 0,
      atRisk: 0,
      late: 0,
      blocked: 0,
      avgUtilization: Math.round(
        utilizationValues.reduce((sum, value) => sum + value, 0) /
          Math.max(1, utilizationValues.length),
      ),
    },
  )

  for (const entry of entries) {
    if (!jobsById.has(entry.jobId)) {
      throw new Error(`Missing job for ${entry.id}`)
    }
  }

  return {
    entries,
    entryMap,
    entriesByMachine,
    jobSummaries,
    jobSummaryMap,
    metrics,
    utilizationByMachine,
  }
}

export function reorderEntry(
  data: DemoData,
  orderByMachine: Record<string, string[]>,
  entryId: string,
  mode: MoveMode,
  targetEntryId?: string,
): Record<string, string[]> {
  const entry = data.entries.find((candidate) => candidate.id === entryId)
  if (!entry || isAnchor(entry)) return orderByMachine

  const machineId = entry.machineId
  const queue = orderByMachine[machineId] ?? []
  const currentIndex = queue.indexOf(entryId)
  if (currentIndex < 0) return orderByMachine

  const nextOrder = cloneOrder(orderByMachine)
  const nextQueue = [...queue]
  const anchorCount = nextQueue.filter((id) => {
    const candidate = data.entries.find((seed) => seed.id === id)
    return candidate ? isAnchor(candidate) : false
  }).length

  nextQueue.splice(currentIndex, 1)

  let targetIndex = currentIndex
  if (mode === 'top') targetIndex = anchorCount
  if (mode === 'up') targetIndex = Math.max(anchorCount, currentIndex - 1)
  if (mode === 'down') targetIndex = Math.min(nextQueue.length, currentIndex + 1)
  if (mode === 'end') targetIndex = nextQueue.length
  if (mode === 'before' && targetEntryId) {
    const targetSeed = data.entries.find((seed) => seed.id === targetEntryId)
    const targetIndexInQueue = nextQueue.indexOf(targetEntryId)
    if (!targetSeed || targetSeed.machineId !== machineId || targetIndexInQueue < 0) {
      return orderByMachine
    }
    targetIndex = isAnchor(targetSeed) ? anchorCount : Math.max(anchorCount, targetIndexInQueue)
  }

  nextQueue.splice(targetIndex, 0, entryId)
  nextOrder[machineId] = nextQueue
  return nextOrder
}

export function createImpact(
  before: DerivedSchedule,
  after: DerivedSchedule,
  movedEntryId: string,
): DemoImpact {
  const movedBefore = before.entryMap.get(movedEntryId)
  const movedAfter = after.entryMap.get(movedEntryId)
  const changedEntries = after.entries.filter((entry) => {
    const previous = before.entryMap.get(entry.id)
    return previous && (previous.startOffset !== entry.startOffset || previous.endOffset !== entry.endOffset)
  })
  const cascadedEntries = changedEntries.filter(
    (entry) =>
      movedBefore &&
      entry.jobId === movedBefore.jobId &&
      entry.opNumber > movedBefore.opNumber,
  ).length

  const improvedJobs: JobImpact[] = []
  const delayedJobs: JobImpact[] = []
  const newlyLateJobs: JobImpact[] = []
  const recoveredJobs: JobImpact[] = []

  for (const afterSummary of after.jobSummaries) {
    const beforeSummary = before.jobSummaryMap.get(afterSummary.job.id)
    if (!beforeSummary) continue
    const deltaDays = afterSummary.finishOffset - beforeSummary.finishOffset
    const impact: JobImpact = {
      jobNumber: afterSummary.job.jobNumber,
      partItem: afterSummary.part.itemId,
      deltaDays,
      beforeRisk: beforeSummary.risk,
      afterRisk: afterSummary.risk,
    }

    if (deltaDays < 0) improvedJobs.push(impact)
    if (deltaDays > 0) delayedJobs.push(impact)
    if (beforeSummary.risk !== 'late' && afterSummary.risk === 'late') newlyLateJobs.push(impact)
    if (beforeSummary.risk === 'late' && afterSummary.risk !== 'late') recoveredJobs.push(impact)
  }

  const movedEarlier =
    movedBefore && movedAfter ? Math.max(0, movedBefore.startOffset - movedAfter.startOffset) : 0
  const message =
    movedEarlier > 0
      ? `Moved ${movedEarlier} workday${movedEarlier === 1 ? '' : 's'} earlier. ${changedEntries.length} operation${changedEntries.length === 1 ? '' : 's'} resequenced.`
      : `${changedEntries.length} operation${changedEntries.length === 1 ? '' : 's'} resequenced.`

  return {
    movedEntryId,
    changedEntries: changedEntries.length,
    cascadedEntries,
    improvedJobs,
    delayedJobs,
    newlyLateJobs,
    recoveredJobs,
    message,
  }
}

export function formatDemoDate(offset: number): string {
  const date = addWorkdays(BASE_DATE, offset)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function formatDemoRange(startOffset: number, endOffset: number): string {
  if (startOffset === endOffset) return formatDemoDate(startOffset)
  return `${formatDemoDate(startOffset)}-${formatDemoDate(endOffset)}`
}

function buildEntriesByJob(entries: DemoEntrySeed[]): Map<string, DemoEntrySeed[]> {
  const map = new Map<string, DemoEntrySeed[]>()
  for (const entry of entries) {
    const list = map.get(entry.jobId) ?? []
    list.push(entry)
    map.set(entry.jobId, list)
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.opNumber - b.opNumber)
  }
  return map
}

function getPriorOperation(
  entry: ScheduledEntry,
  entriesByJob: Map<string, DemoEntrySeed[]>,
  scheduledById: Map<string, ScheduledEntry>,
): ScheduledEntry | null {
  const jobEntries = entriesByJob.get(entry.jobId) ?? []
  const currentIndex = jobEntries.findIndex((candidate) => candidate.id === entry.id)
  if (currentIndex <= 0) return null
  return scheduledById.get(jobEntries[currentIndex - 1].id) ?? null
}

function calculateMaterials(
  data: DemoData,
  entries: ScheduledEntry[],
): Map<string, MaterialResult> {
  const partById = new Map(data.parts.map((part) => [part.id, part]))
  const firstStartByJob = new Map<string, number>()
  for (const entry of entries) {
    const current = firstStartByJob.get(entry.jobId)
    if (current == null || entry.startOffset < current) {
      firstStartByJob.set(entry.jobId, entry.startOffset)
    }
  }

  const jobsByMaterial = new Map<string, DemoJob[]>()
  for (const job of data.jobs) {
    const part = partById.get(job.partId)
    if (!part) continue
    const list = jobsByMaterial.get(part.materialId) ?? []
    list.push(job)
    jobsByMaterial.set(part.materialId, list)
  }

  const materialResultByJob = new Map<string, MaterialResult>()
  for (const material of data.materials) {
    const jobs = (jobsByMaterial.get(material.id) ?? []).sort(
      (a, b) => (firstStartByJob.get(a.id) ?? 0) - (firstStartByJob.get(b.id) ?? 0),
    )
    const receipts = [...material.receipts].sort((a, b) => a.offset - b.offset)
    let receiptIndex = 0
    let available = material.onHand

    for (const job of jobs) {
      const part = partById.get(job.partId)
      if (!part) continue
      const startOffset = firstStartByJob.get(job.id) ?? 0
      while (receiptIndex < receipts.length && receipts[receiptIndex].offset <= startOffset) {
        available += receipts[receiptIndex].qty
        receiptIndex += 1
      }

      const needed = Math.ceil(job.quantity * part.materialPerUnit)
      if (available >= needed) {
        materialResultByJob.set(job.id, {
          state: 'ready',
          needed,
          availableAtStart: available,
          shortfall: 0,
          etaOffset: null,
        })
        available -= needed
        continue
      }

      const futureReceipt = receipts
        .slice(receiptIndex)
        .find((receipt) => receipt.offset <= job.dueOffset && available + receipt.qty >= needed)

      if (futureReceipt) {
        materialResultByJob.set(job.id, {
          state: 'po-coming',
          needed,
          availableAtStart: available,
          shortfall: needed - available,
          etaOffset: futureReceipt.offset,
        })
        available = 0
        continue
      }

      materialResultByJob.set(job.id, {
        state: 'short',
        needed,
        availableAtStart: available,
        shortfall: needed - available,
        etaOffset: null,
      })
      available = 0
    }
  }

  return materialResultByJob
}

function calculateUtilization(
  machines: DemoMachine[],
  entriesByMachine: Record<string, ScheduledEntry[]>,
): Record<string, number> {
  const result: Record<string, number> = {}
  for (const machine of machines) {
    const entries = entriesByMachine[machine.id] ?? []
    const loadDays = entries.reduce((sum, entry) => sum + entry.durationDays, 0)
    result[machine.id] = Math.min(100, Math.round((loadDays / HORIZON_DAYS) * 100))
  }
  return result
}

function addWorkdays(baseDate: Date, offset: number): Date {
  const date = new Date(baseDate)
  let remaining = offset
  while (remaining > 0) {
    date.setDate(date.getDate() + 1)
    const day = date.getDay()
    if (day !== 0 && day !== 6) {
      remaining -= 1
    }
  }
  return date
}
