/**
 * Structured database intents for ScratchJr Desktop.
 *
 * The renderer no longer sends SQL text over IPC. It sends one of four ops
 * against an allowlisted table; this module validates the shape and composes
 * fully parameterized SQL. Replaces the old keyword-denylist SQL validator:
 * there is no longer any renderer-supplied SQL text to sanitize.
 */

export type DbValue = string | number | boolean | null;

export interface DbClause {
    col: string;
    op: '=' | '!=' | 'IS NULL';
    value?: DbValue;
}

export interface DbIntent {
    op: 'select' | 'insert' | 'update' | 'delete';
    table: string;
    /** select only: columns to return; omitted means * */
    items?: string[];
    /** select only: WHERE conjunction */
    where?: DbClause[];
    /** select only */
    order?: { col: string; dir?: 'asc' | 'desc' };
    /** insert/update: column -> value */
    row?: Record<string, DbValue>;
    /** update/delete target row id */
    id?: DbValue;
}

// Columns mirror initTables()/runMigrations() in src/main/database.ts.
const TABLES: Record<string, readonly string[]> = {
    projects: [
        'id', 'ctime', 'mtime', 'altmd5', 'pos', 'name', 'json', 'thumbnail',
        'owner', 'gallery', 'deleted', 'version', 'isgift',
    ],
    usershapes: [
        'id', 'ctime', 'md5', 'altmd5', 'width', 'height', 'ext', 'name',
        'owner', 'scale', 'version',
    ],
    userbkgs: [
        'id', 'ctime', 'md5', 'altmd5', 'width', 'height', 'ext', 'owner', 'version',
    ],
};

const OPS = new Set(['select', 'insert', 'update', 'delete']);
const SELECT_KEYS = new Set(['op', 'table', 'items', 'where', 'order']);
const WRITE_KEYS = new Set(['op', 'table', 'row', 'id']);

function isPrimitive(v: unknown): v is DbValue {
    return v === null || typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';
}

function assertColumns(table: string, cols: readonly string[], what: string): void {
    for (const c of cols) {
        if (!TABLES[table].includes(c)) {
            throw new Error(`unknown ${what} column on ${table}: ${c}`);
        }
    }
}

function composeWhere(intent: DbIntent): { sql: string; values: DbValue[] } {
    const clauses = intent.where ?? [];
    const values: DbValue[] = [];
    const parts = clauses.map((cl) => {
        if (!cl || !TABLES[intent.table].includes(cl.col)) {
            throw new Error(`unknown where column on ${intent.table}: ${String(cl && cl.col)}`);
        }
        if (cl.op === 'IS NULL') {
            if ('value' in cl && cl.value !== undefined) throw new Error('IS NULL takes no value');
            return `${cl.col} IS NULL`;
        }
        if (cl.op !== '=' && cl.op !== '!=') throw new Error(`bad where op: ${String(cl.op)}`);
        if (!isPrimitive(cl.value)) throw new Error('where value must be a primitive');
        values.push(cl.value);
        return `${cl.col} ${cl.op} ?`;
    });
    return { sql: parts.length ? ` where ${parts.join(' AND ')}` : '', values };
}

/**
 * Validates a raw payload from the renderer and composes parameterized SQL.
 * Throws on any structural violation; the caller maps that to the
 * established -1 / '[]' failure protocol.
 */
export function parseDbIntent(raw: unknown): { sql: string; values: DbValue[]; kind: 'select' | 'write' } {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        throw new Error('invalid db intent');
    }
    const intent = raw as Record<string, unknown> & DbIntent;

    if (!OPS.has(intent.op)) throw new Error(`bad db op: ${String(intent.op)}`);
    if (typeof intent.table !== 'string' || !TABLES[intent.table]) {
        throw new Error(`unknown table: ${String(intent.table)}`);
    }

    if (intent.op === 'select') {
        for (const k of Object.keys(intent)) {
            if (!SELECT_KEYS.has(k)) throw new Error(`unexpected key on select: ${k}`);
        }
        let cols = '*';
        if (intent.items !== undefined) {
            if (!Array.isArray(intent.items)) throw new Error('items must be an array');
            assertColumns(intent.table, intent.items.map(String), 'items');
            cols = intent.items.join(', ');
        }
        const w = composeWhere(intent);
        let orderSql = '';
        if (intent.order !== undefined) {
            const o = intent.order as Record<string, unknown>;
            if (!o || !TABLES[intent.table].includes(String(o.col))) {
                throw new Error(`unknown order column on ${intent.table}`);
            }
            const dir = o.dir === undefined ? 'asc' : o.dir;
            if (dir !== 'asc' && dir !== 'desc') throw new Error('order dir must be asc|desc');
            orderSql = ` order by ${String(o.col)} ${dir}`;
        }
        return { sql: `select ${cols} from ${intent.table}${w.sql}${orderSql}`, values: w.values, kind: 'select' };
    }

    for (const k of Object.keys(intent)) {
        if (!WRITE_KEYS.has(k)) throw new Error(`unexpected key on ${intent.op}: ${k}`);
    }

    if (intent.op === 'insert') {
        const row = intent.row as Record<string, unknown> | undefined;
        if (!row || typeof row !== 'object') throw new Error('insert requires row');
        const keys = Object.keys(row);
        if (keys.length === 0) throw new Error('insert requires at least one column');
        assertColumns(intent.table, keys, 'insert');
        const values = keys.map((k) => {
            if (!isPrimitive(row[k])) throw new Error('insert values must be primitives');
            return row[k] as DbValue;
        });
        return {
            sql: `insert into ${intent.table} (${keys.join(', ')}) values (${keys.map(() => '?').join(', ')})`,
            values,
            kind: 'write',
        };
    }

    if (intent.op === 'update') {
        const row = intent.row as Record<string, unknown> | undefined;
        if (!row || typeof row !== 'object') throw new Error('update requires row');
        const keys = Object.keys(row);
        if (keys.length === 0) throw new Error('update requires at least one column');
        assertColumns(intent.table, keys, 'update');
        if (!isPrimitive(intent.id)) throw new Error('update requires id');
        const values = keys.map((k) => {
            if (!isPrimitive(row[k])) throw new Error('update values must be primitives');
            return row[k] as DbValue;
        });
        values.push(intent.id);
        return {
            sql: `update ${intent.table} set ${keys.map((k) => `${k} = ?`).join(', ')} where id = ?`,
            values,
            kind: 'write',
        };
    }

    // delete
    if (!isPrimitive(intent.id)) throw new Error('delete requires id');
    return { sql: `delete from ${intent.table} where id = ?`, values: [intent.id], kind: 'write' };
}
