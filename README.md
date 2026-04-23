# Machine Cadence Scheduler Demo

Synthetic machine-shop planner demo showing queue resequencing, anchored running jobs, downstream cascade, due-date risk, utilization, and queue-aware material readiness.

This repository is intended as a public-safe portfolio artifact. It demonstrates manufacturing workflow thinking and AI-assisted implementation, not a copy of any employer system.

## Public Data Boundary

- No real employer production data.
- No customer records, part records, work orders, purchase orders, screenshots, exports, or proprietary identifiers.
- No Supabase, ERP, WMS, MRP, auth, API, or credential integration.
- All machines, jobs, materials, quantities, dates, and part numbers are invented fixture data.
- The scheduling behavior is a simplified standalone model built for demonstration.

## What The Demo Shows

- 8 synthetic machines with queue lanes.
- Multi-operation jobs that move through different machines.
- Running operations that stay fixed as anchors.
- Reordering a bottleneck operation and recalculating the affected queue.
- Downstream operation cascade after a prior operation moves.
- Due-date status changes: on track, at risk, late, and material blocked.
- Queue-aware material readiness where earlier jobs consume available stock before later jobs.

## Run Locally

```bash
npm install
npm run dev
```

The dev server will print a local URL, usually `http://localhost:5173`.

## Build

```bash
npm run build
```

## Before Publishing

- Review all copy for public-safe language.
- Choose a license if you want reuse rights defined.
- Confirm the GitHub profile link is correct.
- Keep this repository separate from any private or production application code.
