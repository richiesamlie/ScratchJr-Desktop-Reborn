// Renderer entry point: boots the app (page dispatch + close handshake),
// then re-exports appEntry for anything that wants loadPage directly.
import { bootApp } from './appEntry.js';

bootApp();

export * from './appEntry.js';
