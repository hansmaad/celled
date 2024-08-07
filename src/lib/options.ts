export type CellValue = string | number;

export interface CellValueOptions {
    readonly?: boolean;
    options?: readonly CellValue[];
    value: CellValue;
    css?: string;
}

export interface CellUpdateOptions extends Partial<Pick<CellValueOptions, 'readonly'|'css'|'value'>> {
}

export type RowOptions = (CellValue | CellValueOptions)[];

export interface ScrollOptions {
    /** Default: true */
    enabled?: boolean;
    /** Default: true */
    stickyHeader?: boolean;
    /** Default: true */
    virtualScroll?: boolean;
}

export type ColOptions = string | number | { name: string, width?: number|string };

export interface GridInputProperties {
    type: HTMLInputElement['type'];
}

export type GridInputOptions = HTMLInputElement | (() => HTMLInputElement) | GridInputProperties;

export interface GridOptions {
    cols: readonly ColOptions[];
    rows: RowOptions[];
    input?: GridInputOptions;
    canAddRows?: boolean;
    scroll?: ScrollOptions;
}
