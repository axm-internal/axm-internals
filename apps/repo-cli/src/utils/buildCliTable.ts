import Table, { type TableOptions } from 'cli-table3';

type RowValue = string | number | boolean | null | undefined;
type RowRenderer<T> = RowValue | keyof T | ((obj: T) => RowValue);
type BuildCliTableParams<T = unknown> = {
    objs: T[];
    columns?: Record<string, RowRenderer<T>>;
    tableOptions?: Omit<TableOptions, 'head'>;
};

export const buildCliTable = <T = unknown>({ objs, columns, tableOptions }: BuildCliTableParams<T>) => {
    const headers = columns ? Object.keys(columns) : objs[0] ? Object.keys(objs[0]) : [];

    const table = new Table({ head: headers, ...tableOptions });

    for (const obj of objs) {
        const row = headers.map((header) => {
            const renderer = columns?.[header];
            if (renderer === undefined) {
                const value = (obj as Record<string, unknown>)[header];
                return value == null ? '' : String(value);
            }
            if (typeof renderer === 'function') return String(renderer(obj) ?? '');
            if (typeof renderer === 'string' && renderer in (obj as object)) {
                const value = (obj as Record<string, unknown>)[renderer];
                return value == null ? '' : String(value);
            }
            return renderer == null ? '' : String(renderer);
        });
        table.push(row);
    }

    return table;
};
