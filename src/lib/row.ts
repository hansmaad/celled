import { Cell, createCell } from './cell';
import { CSS_ROW } from './css';
import { CellValue, CellValueOptions } from './options';


export interface RowArgs {
    index: number;
    cells: (CellValue | CellValueOptions)[];
    updateValueCallback: (cell: Cell) => unknown;
}

export class Row {

    cells: Cell[] = [];
    index: number;

    private elem: HTMLElement;

    constructor(args: RowArgs) {
        this.index = args.index;
        this.cells = args.cells.map((cell, columnIndex) => createCell(this.index, columnIndex, cell, args.updateValueCallback));
    }

    element() {
        if (!this.elem) {
            const element = document.createElement('div');
            element.setAttribute('data-ri', String(this.index));
            element.className = CSS_ROW;
            this.elem = element;
            this.cells.forEach(cell => this.elem.appendChild(cell.element()));
        }
        return this.elem;
    }
}
