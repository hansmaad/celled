import { Cell, createCell } from './cell';
import { CSS_ROW } from './css';
import { CellValue, CellValueOptions } from './options';

export class Row {
    element: HTMLElement;
    cells: Cell[] = [];

    constructor(public index: number) {
        const element = document.createElement('div');
        element.setAttribute('data-ri', String(index));
        element.className = CSS_ROW;
        this.element = element;

    }

    addCells(cells: Array<CellValue | CellValueOptions>, updateValueCallback: (cell: Cell) => unknown) {
        cells.forEach((c, columnIndex) => {
            const cell = createCell(this.index, columnIndex, c, updateValueCallback);
            this.cells.push(cell);
            this.element.appendChild(cell.element);
        });
    }
}
