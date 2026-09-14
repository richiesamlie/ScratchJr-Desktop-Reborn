# Issue #9 implementation plan and behavior

Scope: blocks guide, Random Wait, and Start on Touching Character. Background blocks, extra messages, drag controls, and keyboard mapping remain deferred. No reporter blocks or extension framework.

1. Trace block arguments, runtime scheduling, collision detection, serialization, and undo.
2. Implement `waitrandom` with the existing numeric field (0–50 tenths), sampling once per execution.
3. Implement `ontouchsprite` as a yellow start block with a picture/name picker. Store a same-page character ID; exclude the owner and text objects. Empty/missing targets never trigger. Reuse bump visibility, collision, and scheduling behavior.
4. Preserve references on rename and same-page copy. Clear references when deleting a character, and restore them through undo/redo. Cross-page copies require reselection. Keep palette defaults independent of duplicated blocks.
5. Document all four Reborn blocks with localization keys and English fallback text. New translations need review.
6. Verify runtime bounds, picker selection, missing targets, duplicate defaults, serialization, undo/redo, full unit suite, typecheck, lint, renderer/Web/Android asset builds, and Desktop/Web smoke paths.

## Compatibility

Existing project format remains unchanged: block tuples carry the new opcode and scalar argument. Older versions may silently skip unknown blocks, changing playback. New-block projects require a build supporting these opcodes. No bidirectional compatibility with official ScratchJr is claimed.

## Platforms

All feature code is in the shared renderer. No host adapter or IPC changes. Browser and Electron smoke tests do not establish Android device behavior; Android touch UI still needs device verification.

## Verification (2026-09-14)

- 225 tests passed across 26 files, including 16 issue #9 cases.
- TypeScript and ESLint passed.
- Renderer, main-process, Web/PWA, and Android asset builds passed.
- Web smoke passed, including real-image target collision, picker selection, and new block arguments surviving save/export/import. A separate CDP pointer click and screenshots verified the picker in a short viewport.
- Desktop smoke passed with isolated temporary project storage and zero renderer exceptions. Its main-process log also emitted `sql.js error: 0` messages; these were not diagnosed as part of this feature work.
- Android device execution and native APK packaging were not performed. Non-English locales currently use English fallbacks for new strings.
- Repository and companion Wiki documentation were edited locally. No version bump, commit, push, or issue comment was made.
