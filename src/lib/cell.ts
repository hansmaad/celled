import { CSS_CELL, CSS_READONLY, CSS_SELECTED, CSS_ACTIVE, CSS_EDITING, CSS_SELECT_CELL } from './css';
import { createElement, remove, setOptions } from './dom';
import { CellUpdateOptions, CellValue, CellValueOptions } from './options';

export type UpdateCallback = (cell: Cell) => unknown;

export interface Cell {

    readonly readonly: boolean;
    row: number;
    col: number;

    element(): HTMLElement;

    /**
     * Cleanup any resources, listeners...
     */
    destroy(): void;

    /**
     * The currently displayed value.
     */
    value(): string;

    /**
     * Show a new value.
     * This can be called on paste events, multi edit events and updates from external code.
     * It will never be called on the active cell that caused the update. However, it
     * can be called on the active cell when the update was triggered elsewhere.
     */
    set(value: CellValue | CellUpdateOptions): void;

    /**
     * Mark the cell as selected. This will apply css classes
     * to visualize the cell as a selected cell.
     */
    select(doSelect?: boolean): this;

    /**
     * Cell was selected with select(true).
     */
    selected(): boolean;

    /**
     * This will apply css classes to visualize the cell as a selected and active cell.
     * The active cell is the leading cell in a multi edit situation. It will contain
     * the editing control.
     * If doActivate is false, the editing control will be removed.
     */
    activate(doActivate?: boolean): this;

    /**
     * Start the editing process. The cell can use the passed input element to let
     * the user enter free text.
     */
    startEdit(input: HTMLInputElement, selectContent?: boolean);

    /**
     * This cell is ready to consume key events
     */
    takesKey(): boolean;

    /**
     * This cell is ready to consume mouse click events
     */
    takesMouse(): boolean;
}

/**
 * Create a new Cell instance matching the definitions in the value parameter.
 * @param callback  Can be used by the cell to notify value changes that are not
 *                  triggered from outside.
 */
export function createCell(row: number, col: number, value: CellValue | CellValueOptions, callback: UpdateCallback) {
    if (typeof value !== 'string' && typeof value !== 'number' && Array.isArray(value.options)) {
        return new SelectCell(row, col, value, callback);
    }
    return new InputCell(row, col, value);
}


class InputCell implements Cell {

    input: HTMLInputElement;  // If the cell is active, this is the assigned input element
    readonly = false;

    private isActive = false;
    private isSelected = false;
    private extraCss = '';
    private val: string;
    private elem: HTMLElement;

    constructor(public row: number, public col: number, value: CellValue | CellValueOptions) {
        if (isPlainValue(value)) {
            this.val = String(value);
        }
        else {
            this.readonly = value.readonly;
            this.val = String(value.value);
            this.extraCss = value.css;
        }
    }

    destroy() {
    }

    element(): HTMLElement {
        if (!this.elem) {
            const element = document.createElement('div');
            element.appendChild(valueElement(this.val));
            element.setAttribute('data-ci', String(this.col));
            this.elem = element;
            this.setCss();
        }
        return this.elem;
    }

    selected() {
        return this.isSelected;
    }

    select(doSelect = true) {
        this.isSelected = doSelect;
        this.setCss();
        return this;
    }

    activate(doActivate = true) {
        if (doActivate) {
            this.isActive = this.isSelected = true;
        }
        else {
            this.isActive = false;
            if (this.input) {
                const val = this.val = this.input.value;
                this.input.blur();
                remove(this.input);
                this.elem.innerHTML = '';
                this.elem.appendChild(valueElement(val));
                this.input = null;
            }
        }
        this.setCss();
        return this;
    }

    value() {
        return this.input ? this.input.value : this.val;
    }

    set(value: CellValue | CellUpdateOptions) {
        if (isPlainValue(value)) {
            this.setValue(value);
        }
        else {
            // Update properties only if it's set in value
            if (isDefined(value.value)) {
                this.setValue(value.value);
            }
            this.readonly = isDefined(value.readonly) ? value.readonly : this.readonly;
            this.extraCss = value.css;
            this.setCss();
        }
    }

    private setValue(value: CellValue) {
        const strValue = this.val = String(value);
        if (this.input) {
            this.input.value = strValue;
        }
        else if (this.elem) {
            this.elem.innerHTML = '';
            this.elem.appendChild(valueElement(value));
        }
    }

    private setCss() {
        const className = CSS_CELL +
            cssIf(this.readonly, CSS_READONLY) +
            cssIf(this.isActive, CSS_ACTIVE) +
            cssIf(this.isSelected, CSS_SELECTED) +
            cssIf(!!this.input, CSS_EDITING) +
            cssIf(!!this.extraCss, this.extraCss);
        if (this.elem) {
            this.elem.className = className;
        }
    }

    startEdit(input: HTMLInputElement, select = false) {
        if (this.readonly) {
            return;
        }
        const element = this.elem;
        this.input = input;
        input.value = element.textContent;
        if (select) {
            input.select();
        }
        input.style.width = element.offsetWidth - 2 + 'px';
        element.innerHTML = '';
        element.appendChild(input);
        input.focus();
        this.setCss();
    }

    takesKey(): boolean {
        return !!this.input;
    }

    takesMouse(): boolean {
        return this.takesKey();
    }
}

function valueElement(value: string|Number) {
    const valueSpan = document.createElement('span');
    valueSpan.appendChild(document.createTextNode(String(value)));
    return valueSpan;
}

class SelectCell implements Cell {

    selectElement: HTMLSelectElement;
    readonly = false;
    options: ReadonlyArray<CellValue> = null;

    private listener;
    private isSelected = false;
    private extraCss = '';
    private elem: HTMLElement;

    constructor(public row: number, public col: number, value: CellValueOptions, callback: UpdateCallback) {

        this.readonly = value.readonly;
        this.options = value.options;
        this.elem = createElement(`<div data-ci="${col}"></div>`);
        this.selectElement = createElement<HTMLSelectElement>(`<select><select>`);
        setOptions(this.selectElement, this.options);
        this.set('' + value.value);
        this.elem.appendChild(this.selectElement);
        this.listener = () => callback(this);
        this.selectElement.addEventListener('change', this.listener);
        this.extraCss = value.css;
        this.setCss();
    }

    destroy() {
        this.selectElement.removeEventListener('change', this.listener);
        this.listener = null;
    }

    element(): HTMLElement {
        return this.elem;
    }

    value(): string {
        return this.selectElement.value;
    }

    set(value: CellValue | CellUpdateOptions) {
        if (isPlainValue(value)) {
            this.setValue(value);
        }
        else {
            // Update properties only if it's set in value
            if (isDefined(value.value)) {
                this.setValue(value.value);
            }
            this.extraCss = value.css;
            this.setCss();
        }
    }

    private setValue(value: CellValue) {
        this.selectElement.value = value ? value.toString() : null;
    }

    private setCss() {
        const className = CSS_CELL + ' ' + CSS_SELECT_CELL +
            cssIf(this.readonly, CSS_READONLY) +
            cssIf(this.isSelected, CSS_SELECTED) +
            cssIf(!!this.extraCss, this.extraCss);
        this.elem.className = className;
    }

    select(doSelect = true) {
        this.isSelected = doSelect;
        this.setCss();
        return this;
    }

    selected(): boolean {
        return this.isSelected;
    }

    activate(doActivate?: boolean) {
        return this;
    }

    startEdit(input: HTMLInputElement, selectContent?: boolean) {
    }

    takesKey(): boolean {
        return false;
    }

    takesMouse(): boolean {
        return true;
    }
}

function isPlainValue(value: CellValue | CellUpdateOptions): value is CellValue {
    return typeof value === 'string' || typeof value === 'number';
}

function isDefined(value: any) {
    return typeof value !== 'undefined';
}


function cssIf(useValue: boolean, css: string) {
    return useValue ? ' ' + css : '';
}
