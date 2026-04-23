# BunQueue - Project Overview

A generic, SQLite-backed job queue for Bun with TypeScript. Built for any workload—CPU-intensive tasks, I/O operations, or mixed processing—with safety and observability as first-class concerns.

## Project Goals

Create a Plainjob-inspired queue system with:
- **Universal workload support** — handles CPU-bound (transcoding, ML) and I/O-bound (downloads, APIs) tasks
- **Process isolation by default** — crash protection and resource containment
- **Type-safe configuration** — Zod schemas for queues, workers, and job payloads
- **Database-backed observability** — structured logging and progress tracking
- **Built-in dashboard** — real-time monitoring via Bun HTTP server
- **Bun-native performance** — optimized for `bun:sqlite` and modern TypeScript

---

## Architecture Decision: Concurrency Model

BunQueue must handle **unknown workloads safely**. A video transcoding job (CPU-heavy) and a file download (I/O-heavy) should coexist without blocking or crashing each other.

### Option 1: Async/Await (Main Thread) — Opt-in Only

**Best for:** Known I/O-bound tasks (HTTP requests, database queries, file system)

**Limitations:**
- CPU-intensive tasks block the event loop
- Single job crash kills the entire queue
- Memory leaks accumulate in main process

**Verdict:** ❌ **Not default** — too risky for agnostic queue

---

### Option 2: Worker Threads — Unsupported

**Best for:** Shared memory computation, browser-like environment

**Limitations:**
- No access to `bun:sqlite` or native modules
- Limited IPC capabilities
- Overhead without benefit over processes in Bun

**Verdict:** ❌ **Not implemented** — insufficient for database-backed queue

---

### Option 3: Process Spawn (Bun.spawn) — Default

**Best for:** Universal workload isolation, safety, resource containment

**Characteristics:**
- Full OS process isolation per job
- Crash protection — worker dies, queue continues
- Memory leak containment — process exits, resources freed
- CPU saturation doesn't stall other workers
- Full Bun API access in worker context
- stdout/stderr capture for database logging

**Trade-offs:**
- ~50ms spawn overhead per job
- Higher memory footprint than threads
- Requires IPC for parent-child communication

**Verdict:** ✅ **Default execution model**

---

## Execution Configuration

Users select execution mode per queue:

```typescript
// Default: process isolation (safe for any workload)
const transcodingQueue = defineQueue({
  name: 'video-transcoding',
  execution: 'process',  // Explicit default
  concurrency: 2,        // Limit CPU-heavy jobs
});

// Opt-in: async for known I/O workloads (performance)
const downloadQueue = defineQueue({
  name: 'downloads',
  execution: 'async',    // "I know this is I/O only"
  concurrency: 10,       // Higher concurrency safe
});
```

### Execution Mode Comparison

| Feature | `execution: 'process'` | `execution: 'async'` |
|---------|------------------------|----------------------|
| **Isolation** | Full OS process | None (main thread) |
| **Crash Impact** | Worker only | Entire queue |
| **Memory Leaks** | Contained | Cumulative |
| **Spawn Time** | ~50ms | 0ms |
| **Best For** | Unknown/CPU workloads | Known I/O workloads |
| **Default?** | ✅ Yes | No (opt-in) |

---

## Implementation Strategy

### Phase 1: Core Engine (Weeks 1-2)

**Database Schema**

```typescript
// jobs table — the queue
const jobsTable = sqliteTable('jobs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  queue: text('queue').notNull(),
  payload: text('payload').notNull(), // JSON string
  status: text('status', { enum: ['pending', 'running', 'completed', 'failed'] })
    .notNull()
    .default('pending'),
  priority: integer('priority').default(0),
  attempts: integer('attempts').default(0),
  maxAttempts: integer('max_attempts').default(3),
  execution: text('execution', { enum: ['process', 'async'] }).notNull(),
  runAt: integer('run_at'), // Unix timestamp for delayed jobs
  startedAt: integer('started_at'),
  completedAt: integer('completed_at'),
  createdAt: integer('created_at').default(sql`CURRENT_TIMESTAMP`),
  error: text('error'), // Error message if failed
  exitCode: integer('exit_code'), // For process execution
});

// logs table — structured process output
const logsTable = sqliteTable('logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  jobId: integer('job_id').notNull().references(() => jobsTable.id),
  level: text('level', { enum: ['debug', 'info', 'warn', 'error'] }).notNull(),
  message: text('message').notNull(),
  metadata: text('metadata'), // JSON for structured data
  timestamp: integer('timestamp').default(sql`CURRENT_TIMESTAMP`),
});

// workers table — active worker process tracking
const workersTable = sqliteTable('workers', {
  id: text('id').primaryKey(), // UUID
  queue: text('queue').notNull(),
  execution: text('execution', { enum: ['process', 'async'] }).notNull(),
  status: text('status', { enum: ['idle', 'busy', 'stopping'] }).notNull(),
  currentJobId: integer('current_job_id').references(() => jobsTable.id),
  pid: integer('pid'), // OS process ID when execution: 'process'
  startedAt: integer('started_at').default(sql`CURRENT_TIMESTAMP`),
  lastHeartbeat: integer('last_heartbeat'),
});
```

**Zod Configuration System**

```typescript
const executionModeSchema = z.enum(['process', 'async']).default('process');

const queueConfigSchema = z.object({
  name: z.string(),
  execution: executionModeSchema,
  concurrency: z.number().default(1),
  retryDelay: z.number().default(5000), // ms
  maxRetries: z.number().default(3),
  timeout: z.number().default(30000), // ms, kill hanging jobs
});

const processorSchema = z.function({
  input: [z.unknown()], // payload (validated separately)
  output: z.void(),
});

const workerConfigSchema = z.object({
  queue: z.string(),
  processor: processorSchema,
  schema: z.instanceof(z.ZodType).optional(), // Payload validation
});
```

**Core API**

```typescript
// Define queue with explicit execution mode
const queue = defineQueue({
  name: 'image-processing',
  execution: 'process', // Safe default
  concurrency: 4,
});

// Add job — execution inherited from queue
await queue.add('resize-image', { 
  input: 'photo.jpg', 
  width: 1920, 
  height: 1080 
});

// Worker processor
const worker = defineWorker('image-processing', async (job) => {
  const { input, width, height } = job.payload;
  
  // Heavy CPU work — safe in process isolation
  await sharp(input).resize(width, height).toFile('output.jpg');
  
  // Progress updates via IPC (automatic)
  await job.updateProgress(50);
  await job.log('info', `Resized ${input} to ${width}x${height}`);
});

// Start processing
worker.start();
```

### Phase 2: Process Management & Logging (Week 3)

**Process Spawn Implementation**

```typescript
// Spawn worker process for isolated execution
const proc = Bun.spawn(['bun', 'run', 'worker-runtime.ts', jobId], {
  stdout: 'pipe',
  stderr: 'pipe',
  env: { 
    BUNQUEUE_JOB_ID: jobId,
    BUNQUEUE_QUEUE: queueName,
  },
  onExit: (code) => {
    // Handle completion, update DB, cleanup
  },
});

// Stream logs to database
const decoder = new TextDecoder();
for await (const chunk of proc.stdout) {
  const line = decoder.decode(chunk);
  await db.insert(logsTable).values({
    jobId,
    level: 'info',
    message: line,
    timestamp: Date.now(),
  });
}
```

**IPC Communication**

```typescript
// Worker runtime (worker-runtime.ts)
const jobId = process.env.BUNQUEUE_JOB_ID;

// Load job from DB
const job = await loadJob(jobId);

// Execute user processor
try {
  await processor(job);
  process.exit(0);
} catch (error) {
  console.error(error);
  process.exit(1);
}
```

**Async Execution Path**

```typescript
// Direct execution for trusted I/O workloads
if (job.execution === 'async') {
  // Run in main thread — no spawn overhead
  await processor(job);
}
```

### Phase 3: Dashboard & Observability (Week 4)

**Bun HTTP Server**

```typescript
Bun.serve({
  port: 3000,
  routes: {
    '/api/queues': async () => Response.json(await getQueueStats()),
    '/api/jobs': async (req) => Response.json(await getJobs(req.query)),
    '/api/workers': async () => Response.json(await getWorkerStatus()),
    '/api/logs/:jobId': async (req) => Response.json(await getJobLogs(req.params.jobId)),
    '/api/retry/:jobId': { POST: (req) => retryJob(req.params.jobId) },
    '/': () => new Response(dashboardHTML, { headers: { 'Content-Type': 'text/html' } }),
  },
});
```

**Real-time Updates**

```typescript
// Server-Sent Events for live progress
Bun.serve({
  routes: {
    '/events': (req) => {
      const stream = new ReadableStream({
        start(controller) {
          // Subscribe to job updates
          eventBus.on('job:progress', (data) => {
            controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
          });
        },
      });
      return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } });
    },
  },
});
```

---

## Timeline Estimate

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Core Engine** | 2 weeks | Process spawn, async fallback, Zod schemas, basic queue operations |
| **Process Management** | 1 week | IPC protocol, log streaming, heartbeat monitoring, crash recovery |
| **Dashboard** | 1 week | HTTP server, REST API, web UI, real-time events |
| **Polish** | 1 week | Graceful shutdown, timeout handling, tests, documentation |
| **Total** | **5 weeks** | Production-ready MVP |

**Part-time (evenings/weekends):** 2-3 months

---

## Key Technical Decisions

1. **Process by Default**: `Bun.spawn()` for universal safety and isolation
2. **Async Opt-in**: `execution: 'async'` for known I/O workloads only
3. **SQLite with WAL**: Single-node durability with concurrent read/write
4. **Structured Logging**: Every job action logged to database, not console
5. **Zod Everywhere**: Runtime validation + TypeScript inference for all configs
6. **Dashboard First-Class**: Built-in monitoring, not an afterthought

---

## Comparison with Plainjob

| Feature | Plainjob | BunQueue |
|---------|----------|----------|
| **Runtime** | Bun/Node | Bun only |
| **Workload** | Assumes I/O | Universal (CPU + I/O) |
| **Isolation** | None | Process by default |
| **Execution** | In-process only | Configurable (process/async) |
| **Validation** | None | Zod schemas |
| **Logging** | Console | Database-backed structured |
| **Dashboard** | None | Built-in web UI |
| **Safety** | Crash kills queue | Crash contained to job |

---

## Next Steps

1. Define IPC protocol between parent and worker processes
2. Implement `Bun.spawn()` wrapper with log streaming
3. Build Zod schemas for queue/worker configuration
4. Create database schema with Drizzle
5. Implement `add()`, `process()`, and `complete()` lifecycle
6. Add heartbeat monitoring for stuck jobs
7. Build dashboard API and UI
8. Write tests for crash recovery scenarios

**Start with the core**: Get process spawning and IPC working end-to-end before adding the dashboard.