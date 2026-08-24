import { describe, it, expect } from 'vitest';
import { parseDbIntent } from '../../src/lib/db-intents.ts';

describe('parseDbIntent — select', () => {
    it('composes a bare select', () => {
        const r = parseDbIntent({ op: 'select', table: 'projects' });
        expect(r).toEqual({ sql: 'select * from projects', values: [], kind: 'select' });
    });

    it('composes items, where conjunction and order', () => {
        const r = parseDbIntent({
            op: 'select',
            table: 'projects',
            items: ['name', 'thumbnail'],
            where: [
                { col: 'deleted', op: '=', value: 'NO' },
                { col: 'id', op: '!=', value: 3 },
                { col: 'gallery', op: 'IS NULL' },
            ],
            order: { col: 'ctime', dir: 'desc' },
        });
        expect(r.sql).toBe('select name, thumbnail from projects'
            + ' where deleted = ? AND id != ? AND gallery IS NULL order by ctime desc');
        expect(r.values).toEqual(['NO', 3]);
    });

    it('rejects unknown tables, columns, ops, extra keys and bad values', () => {
        expect(() => parseDbIntent({ op: 'select', table: 'sqlite_master' })).toThrow();
        expect(() => parseDbIntent({ op: 'select', table: 'projects', items: ['password'] })).toThrow();
        expect(() => parseDbIntent({
            op: 'select', table: 'projects',
            where: [{ col: 'deleted', op: 'LIKE', value: 'x' }],
        })).toThrow();
        expect(() => parseDbIntent({ op: 'select', table: 'projects', bogus: 1 })).toThrow();
        expect(() => parseDbIntent({
            op: 'select', table: 'projects',
            where: [{ col: 'gallery', op: 'IS NULL', value: 'x' }],
        })).toThrow();
        expect(() => parseDbIntent({ op: 'select', table: 'projects', order: { col: 'ctime', dir: 'DROP' } })).toThrow();
        // injection-shaped identifiers never match the allowlists
        expect(() => parseDbIntent({
            op: 'select', table: 'projects',
            where: [{ col: "1=1); DROP TABLE PROJECTS--", op: '=', value: 1 }],
        })).toThrow();
    });
});

describe('parseDbIntent — insert', () => {
    it('composes a parameterized insert preserving column order', () => {
        const r = parseDbIntent({
            op: 'insert',
            table: 'userbkgs',
            row: { md5: 'a.md5', altmd5: 'b.png', version: 'iOSv01', width: '480', height: '360', ext: 'svg' },
        });
        expect(r.sql).toBe('insert into userbkgs (md5, altmd5, version, width, height, ext)'
            + ' values (?, ?, ?, ?, ?, ?)');
        expect(r.values).toEqual(['a.md5', 'b.png', 'iOSv01', '480', '360', 'svg']);
        expect(r.kind).toBe('write');
    });

    it('rejects unknown columns and empty/non-object rows', () => {
        expect(() => parseDbIntent({ op: 'insert', table: 'usershapes', row: { hacker: 1 } })).toThrow();
        expect(() => parseDbIntent({ op: 'insert', table: 'usershapes', row: {} })).toThrow();
        expect(() => parseDbIntent({ op: 'insert', table: 'usershapes', row: 'md5=x' })).toThrow();
        expect(() => parseDbIntent({ op: 'insert', table: 'usershapes', row: { md5: { $ne: null } } })).toThrow();
    });
});

describe('parseDbIntent — update/delete', () => {
    it('composes update by id with id bound last', () => {
        const r = parseDbIntent({
            op: 'update', table: 'projects',
            row: { deleted: 'YES', mtime: '123' }, id: '7',
        });
        expect(r.sql).toBe('update projects set deleted = ?, mtime = ? where id = ?');
        expect(r.values).toEqual(['YES', '123', '7']);
    });

    it('composes delete by id', () => {
        expect(parseDbIntent({ op: 'delete', table: 'projects', id: 5 }))
            .toEqual({ sql: 'delete from projects where id = ?', values: [5], kind: 'write' });
    });

    it('rejects update without row or id', () => {
        expect(() => parseDbIntent({ op: 'update', table: 'projects', row: { name: 'x' } })).toThrow();
        expect(() => parseDbIntent({ op: 'update', table: 'projects', row: {}, id: 1 })).toThrow();
        expect(() => parseDbIntent({ op: 'delete', table: 'projects' })).toThrow();
    });
});

describe('parseDbIntent — general shape', () => {
    it('rejects non-objects and unknown ops', () => {
        expect(() => parseDbIntent(null)).toThrow();
        expect(() => parseDbIntent('select 1')).toThrow();
        expect(() => parseDbIntent([])).toThrow();
        expect(() => parseDbIntent({ op: 'pragma', table: 'projects' })).toThrow();
    });

    it('accepts every column the renderer actually uses', () => {
        const used = {
            projects: ['id', 'name', 'version', 'deleted', 'mtime', 'isgift', 'json', 'thumbnail'],
            usershapes: ['md5', 'altmd5', 'scale', 'width', 'height', 'ext', 'name', 'version', 'ctime'],
            userbkgs: ['md5', 'altmd5', 'width', 'height', 'ext', 'version', 'ctime', 'owner'],
        };
        for (const [table, cols] of Object.entries(used)) {
            for (const col of cols) {
                const r = parseDbIntent({
                    op: 'select', table, where: [{ col, op: '=', value: 1 }],
                });
                expect(r.sql).toContain(` ${col} = ?`);
            }
        }
    });
});
