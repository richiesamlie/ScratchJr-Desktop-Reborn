import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';
import { TABLES, parseDbIntent } from '../../src/lib/db-intents.ts';

const require = createRequire(import.meta.url);
const { createBrowserClient } = require('../../src/browserClient.js');

describe('Browser SQL Intent Allowlist Parity (Finding F3)', () => {
    function createMockClient() {
        class MockDatabase {
            run() {}
            exec(sql) {
                if (String(sql).startsWith('SELECT last_insert_rowid()')) {
                    return [{ columns: ['id'], values: [[1]] }];
                }
                return [{ columns: ['name', 'thumbnail'], values: [['My Project', 'thumb.png']] }];
            }
            getRowsModified() { return 1; }
            export() { return new Uint8Array([1, 2, 3]); }
        }

        return createBrowserClient({
            idbGet: () => Promise.resolve(null),
            idbPut: () => Promise.resolve(undefined),
            idbDelete: () => Promise.resolve(undefined),
            initSqlJs: () => Promise.resolve({ Database: MockDatabase }),
            registerWindowListeners: false,
        });
    }

    it('mirrors TABLES schema definitions exactly from src/lib/db-intents.ts', () => {
        const client = createMockClient();

        expect(Object.keys(client.ALLOWED_TABLES).sort()).toEqual(Object.keys(TABLES).sort());

        for (const [table, cols] of Object.entries(TABLES)) {
            expect(client.ALLOWED_TABLES[table]).toBeDefined();
            expect(client.ALLOWED_TABLES[table].slice().sort()).toEqual(cols.slice().sort());
        }
    });

    it('enforces ALLOWED_WHERE_OPS set to [=, !=, IS NULL]', () => {
        const client = createMockClient();
        expect(client.ALLOWED_WHERE_OPS).toEqual(['=', '!=', 'IS NULL']);
    });

    it('enforces strict validation parity between parseDbIntent and executeIntent', async () => {
        const client = createMockClient();

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
                await expect(client.executeIntent(tc.intent), `browserClient should accept: ${tc.name}`).resolves.toBeDefined();
            } else {
                expect(() => parseDbIntent(tc.intent), `db-intents should reject: ${tc.name}`).toThrow();
                await expect(client.executeIntent(tc.intent), `browserClient should reject: ${tc.name}`).rejects.toThrow();
            }
        }
    });
});
