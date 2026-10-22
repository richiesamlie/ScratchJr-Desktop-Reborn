import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { TABLES, parseDbIntent } from '../../src/lib/db-intents.ts';

describe('Browser SQL Intent Allowlist Parity (Finding F3)', () => {
    const browserClientPath = path.resolve(__dirname, '../../src/browserClient.js');
    const browserClientCode = fs.readFileSync(browserClientPath, 'utf8');

    it('mirrors TABLES schema definitions exactly from src/lib/db-intents.ts', () => {
        // Extract ALLOWED_TABLES object literal from browserClient.js
        const match = browserClientCode.match(/var ALLOWED_TABLES = (\{[\s\S]*?\n    \});/);
        expect(match, 'ALLOWED_TABLES must be defined in browserClient.js').not.toBeNull();

        // Safely parse the object literal
        const allowedTables = Function(`"use strict"; return (${match[1]});`)();

        expect(Object.keys(allowedTables).sort()).toEqual(Object.keys(TABLES).sort());

        for (const [table, cols] of Object.entries(TABLES)) {
            expect(allowedTables[table]).toBeDefined();
            expect(allowedTables[table].slice().sort()).toEqual(cols.slice().sort());
        }
    });

    it('enforces ALLOWED_WHERE_OPS set to [=, !=, IS NULL]', () => {
        const match = browserClientCode.match(/var ALLOWED_WHERE_OPS = (\[[\s\S]*?\]);/);
        expect(match, 'ALLOWED_WHERE_OPS must be defined in browserClient.js').not.toBeNull();

        const allowedOps = Function(`"use strict"; return (${match[1]});`)();
        expect(allowedOps).toEqual(['=', '!=', 'IS NULL']);
    });

    function getExecuteIntent() {
        const mockDb = {
            run: () => {},
            exec: () => [{ columns: ['name', 'thumbnail'], values: [['My Project', 'thumb.png']] }],
            getRowsModified: () => 1,
        };

        const defsMatch = browserClientCode.match(/var ALLOWED_TABLES = [\s\S]*?(?=function executeIntent)/);
        const execMatch = browserClientCode.match(/function executeIntent\(intent\) \{[\s\S]*?\n    \}/);

        const setupCode = `
            ${defsMatch[0]}
            function initDatabase() { return Promise.resolve(mockDb); }
            function flushDbSave() {}
            ${execMatch[0]}
            return executeIntent;
        `;

        return Function('mockDb', setupCode)(mockDb);
    }

    it('enforces strict validation parity between parseDbIntent and executeIntent', async () => {
        const executeIntent = getExecuteIntent();

        const parityCases = [
            // Valid intents
            { name: 'valid bare select', intent: { op: 'select', table: 'projects' }, valid: true },
            {
                name: 'valid complex select',
                intent: {
                    op: 'select',
                    table: 'projects',
                    items: ['name', 'thumbnail'],
                    where: [
                        { col: 'deleted', op: '=', value: 'NO' },
                        { col: 'gallery', op: 'IS NULL' },
                    ],
                    order: { col: 'ctime', dir: 'desc' },
                },
                valid: true,
            },
            {
                name: 'valid insert',
                intent: { op: 'insert', table: 'projects', row: { name: 'P1', version: 'v1' } },
                valid: true,
            },
            {
                name: 'valid update',
                intent: { op: 'update', table: 'projects', row: { name: 'P2' }, id: 10 },
                valid: true,
            },
            {
                name: 'valid delete',
                intent: { op: 'delete', table: 'projects', id: 10 },
                valid: true,
            },

            // Invalid table lookups
            { name: 'unknown table', intent: { op: 'select', table: 'sqlite_master' }, valid: false },
            { name: 'prototype pollution constructor table', intent: { op: 'select', table: 'constructor' }, valid: false },
            { name: 'prototype pollution __proto__ table', intent: { op: 'select', table: '__proto__' }, valid: false },
            { name: 'prototype pollution toString table', intent: { op: 'select', table: 'toString' }, valid: false },

            // Invalid ops
            { name: 'unsupported op drop', intent: { op: 'drop', table: 'projects' }, valid: false },
            { name: 'unsupported op pragma', intent: { op: 'pragma', table: 'projects' }, valid: false },

            // Invalid select shapes
            { name: 'unknown column in items', intent: { op: 'select', table: 'projects', items: ['secret'] }, valid: false },
            { name: 'unknown column in where', intent: { op: 'select', table: 'projects', where: [{ col: 'secret', op: '=', value: '1' }] }, valid: false },
            { name: 'disallowed where op LIKE', intent: { op: 'select', table: 'projects', where: [{ col: 'name', op: 'LIKE', value: '%a%' }] }, valid: false },
            { name: 'IS NULL with a value', intent: { op: 'select', table: 'projects', where: [{ col: 'gallery', op: 'IS NULL', value: 'x' }] }, valid: false },
            { name: 'unknown order column', intent: { op: 'select', table: 'projects', order: { col: 'secret', dir: 'asc' } }, valid: false },
            { name: 'invalid order direction', intent: { op: 'select', table: 'projects', order: { col: 'name', dir: 'sideways' } }, valid: false },
            { name: 'unexpected key on select', intent: { op: 'select', table: 'projects', extra: 123 }, valid: false },

            // Invalid write shapes
            { name: 'unexpected key on insert', intent: { op: 'insert', table: 'projects', row: { name: 'P' }, extra: 123 }, valid: false },
            { name: 'insert non-primitive value in row', intent: { op: 'insert', table: 'projects', row: { name: { nested: 'evil' } } }, valid: false },
            { name: 'insert without row', intent: { op: 'insert', table: 'projects' }, valid: false },
            { name: 'insert with empty row', intent: { op: 'insert', table: 'projects', row: {} }, valid: false },
            { name: 'update without id', intent: { op: 'update', table: 'projects', row: { name: 'P' } }, valid: false },
            { name: 'update with non-primitive id', intent: { op: 'update', table: 'projects', row: { name: 'P' }, id: { bad: true } }, valid: false },
            { name: 'update with where clause', intent: { op: 'update', table: 'projects', row: { name: 'P' }, id: 1, where: [{ col: 'name', op: '=', value: 'old' }] }, valid: false },
            { name: 'delete without id', intent: { op: 'delete', table: 'projects' }, valid: false },
            { name: 'delete with non-primitive id', intent: { op: 'delete', table: 'projects', id: [1, 2] }, valid: false },
            { name: 'delete with where clause', intent: { op: 'delete', table: 'projects', id: 1, where: [{ col: 'name', op: '=', value: 'old' }] }, valid: false },

            // Non-object intents
            { name: 'null intent', intent: null, valid: false },
            { name: 'string intent', intent: 'select * from projects', valid: false },
            { name: 'array intent', intent: [1, 2], valid: false },
        ];

        for (const tc of parityCases) {
            if (tc.valid) {
                expect(() => parseDbIntent(tc.intent), `db-intents should accept: ${tc.name}`).not.toThrow();
                await expect(executeIntent(tc.intent), `browserClient should accept: ${tc.name}`).resolves.toBeDefined();
            } else {
                expect(() => parseDbIntent(tc.intent), `db-intents should reject: ${tc.name}`).toThrow();
                await expect(executeIntent(tc.intent), `browserClient should reject: ${tc.name}`).rejects.toThrow();
            }
        }
    });
});
