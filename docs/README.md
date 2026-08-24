# Documentation

- **[development.md](./development.md)** — how the project is built, tested, and released, plus the editor layout/limits map and known quirks
- **[engine.md](./engine.md)** — the editor engine architecture: module graph, runtime execution model (Runtime/Thread/Prims), file format flow, and how to extend the editor

> Note: `ipc-inventory.md` and the 2026-08 handoff documents were removed as
> outdated after the v1.7.0 architecture refactor. The authoritative IPC
> surface is `src/preload.ts` + the `ScratchJrBridge` type in
> `src/types/globals.d.ts`; database access goes through
> `src/lib/db-intents.ts` (structured intents, no renderer SQL).

## Quick orientation

- Renderer sources: `src/app/src/**/*.ts` (TypeScript, full strict mode)
- Editor/UI seam: `src/app/src/editor/engine/ports.ts` (typed EnginePorts)
- Element→model lookups: `src/app/src/editor/modelRegistry.ts` (no DOM expandos)
- Main process sources: `src/main.ts` + `src/main/*.ts`; compiled to `build/`
- Database intents & validation: `src/lib/db-intents.ts`
- Tests: `npm test` (vitest; `tests/unit/` — main-process + jsdom renderer harness)
- End-to-end harnesses: `npm run smoke`, `npm run interact`
- Package: `npm run make:zip` (builds the renderer bundle first — never skip that)
- Release: bump version → commit → tag `v*.*.*` → CI builds all targets and publishes
