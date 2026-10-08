import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { TABLES } from '../../src/lib/db-intents.ts';

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

    it('validates tables, columns and ops against the allowlist', async () => {
        // Create an isolated runner of executeIntent using a mock db
        const mockDb = {
            run: () => {},
            exec: () => [{ columns: ['name', 'thumbnail'], values: [['My Project', 'thumb.png']] }],
            getRowsModified: () => 1,
        };

        const setupCode = `
            ${browserClientCode.match(/var ALLOWED_TABLES = [\s\S]*?\n    \};/)[0]}
            ${browserClientCode.match(/var ALLOWED_WHERE_OPS = [\s\S]*?;/)[0]}
            function initDatabase() { return Promise.resolve(mockDb); }
            function flushDbSave() {}
            ${browserClientCode.match(/function executeIntent\(intent\) \{[\s\S]*?\n    \}/)[0]}
            return executeIntent;
        `;

        const executeIntent = Function('mockDb', setupCode)(mockDb);

        // 1. Unknown table
        await expect(executeIntent({ op: 'select', table: 'sqlite_master' })).rejects.toThrow(/unknown table/i);

        // 2. Unknown column in insert
        await expect(executeIntent({ op: 'insert', table: 'projects', row: { evil_col: 1 } })).rejects.toThrow(/unknown column/i);

        // 3. Unknown column in select items
        await expect(executeIntent({ op: 'select', table: 'projects', items: ['password'] })).rejects.toThrow(/unknown column/i);

        // 4. Bad where operator
        await expect(executeIntent({
            op: 'select',
            table: 'projects',
            where: [{ col: 'deleted', op: 'LIKE', value: '%yes%' }]
        })).rejects.toThrow(/bad where op/i);

        // 5. Unknown where column
        await expect(executeIntent({
            op: 'delete',
            table: 'projects',
            where: [{ col: 'nonexistent', op: '=', value: 'foo' }]
        })).rejects.toThrow(/unknown where column/i);

        // 6. Bad order direction
        await expect(executeIntent({
            op: 'select',
            table: 'projects',
            order: { col: 'ctime', dir: 'DROP TABLE' }
        })).rejects.toThrow(/bad order dir/i);

        // 7. Valid query succeeds
        await expect(executeIntent({
            op: 'select',
            table: 'projects',
            items: ['name', 'thumbnail'],
            where: [{ col: 'deleted', op: '=', value: 'NO' }],
            order: { col: 'ctime', dir: 'DESC' }
        })).resolves.toBeDefined();
    });
});
