(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.CellEd = {}));
})(this, (function (exports) { 'use strict';

    class EventEmitter {
        constructor() {
            this.handlers = {};
        }
        addHandler(event, handler) {
            const handlers = this.handlers;
            handlers[event] = handlers[event] || [];
            handlers[event].push(handler);
        }
        removeHandler(event, handler) {
            const allHandlers = this.handlers;
            const handlers = allHandlers[event];
            if (handlers && handler) {
                handlers.splice(handlers.indexOf(handler), 1);
            }
        }
        emit(event, args) {
            const handlers = this.handlers[event];
            if (handlers) {
                handlers.forEach(handler => {
                    try {
                        handler(args);
                    }
                    catch (_a) { }
                });
            }
        }
    }

    // ref: https://stackoverflow.com/a/14991797/498298
    // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.
    function parseCSV(str, delimiter) {
        const arr = [];
        let quote = false; // 'true' means we're inside a quoted field
        // Iterate over each character, keep track of current row and column (of the returned array)
        for (let row = 0, col = 0, i = 0; i < str.length; i++) {
            const currentChar = str[i];
            const nextChar = str[i + 1];
            arr[row] = arr[row] || []; // Create a new row if necessary
            arr[row][col] = arr[row][col] || ''; // Create a new column (start with empty string) if necessary
            // If the current character is a quotation mark, and we're inside a
            // quoted field, and the next character is also a quotation mark,
            // add a quotation mark to the current column and skip the next character
            if (currentChar === '"' && quote && nextChar === '"') {
                arr[row][col] += currentChar;
                ++i;
                continue;
            }
            // If it's just one quotation mark, begin/end quoted field
            if (currentChar === '"') {
                quote = !quote;
                continue;
            }
            // If it's a delimiter and we're not in a quoted field, move on to the next column
            if (currentChar === delimiter && !quote) {
                ++col;
                continue;
            }
            // If it's a newline (CRLF) and we're not in a quoted field, skip the next character
            // and move on to the next row and move to column 0 of that new row
            if (currentChar === '\r' && nextChar === '\n' && !quote) {
                ++row;
                col = 0;
                ++i;
                continue;
            }
            // If it's a newline (LF or CR) and we're not in a quoted field,
            // move on to the next row and move to column 0 of that new row
            if ((currentChar === '\n' || currentChar === '\r') && !quote) {
                ++row;
                col = 0;
                continue;
            }
            // Otherwise, append the current character to the current column
            arr[row][col] += currentChar;
        }
        return arr;
    }
    function writeCSV(values, separator, linebreak = '\n') {
        let content = '';
        values.forEach((row, ri) => {
            if (ri > 0) {
                content += linebreak;
            }
            row.forEach((cell, ci) => {
                cell = cell.replace(/"/g, '""');
                if (cell.search(/("|,|\n)/g) >= 0) {
                    cell = '"' + cell + '"';
                }
                if (ci > 0) {
                    content += separator;
                }
                content += cell;
            });
        });
        return content;
    }

    function query(elOrCss, cssSelector) {
        if (!cssSelector) {
            cssSelector = elOrCss;
            elOrCss = document;
        }
        return elOrCss.querySelector(cssSelector);
    }
    function queryAll(elOrCss, cssSelector) {
        if (!cssSelector) {
            cssSelector = elOrCss;
            elOrCss = document;
        }
        return [].slice.call(elOrCss.querySelectorAll(cssSelector));
    }
    function createElement(html) {
        const div = document.createElement('div');
        div.innerHTML = html.trim();
        return div.firstChild;
    }
    function on(element, event, listener) {
        element.addEventListener(event, listener);
        return offFunc(element, event, listener);
    }
    function off(element, event, listener) {
        element.removeEventListener(event, listener);
    }
    function offFunc(element, event, listener) {
        return () => element.removeEventListener(event, listener);
    }
    function remove(node) {
        if (node.parentNode) {
            node.parentElement.removeChild(node);
        }
    }
    function setOptions(selectElement, options) {
        for (let i = selectElement.options.length; i > 0; i--) {
            selectElement.remove(i);
        }
        for (const option of options) {
            const optionElement = document.createElement('option');
            optionElement.value = '' + option;
            optionElement.innerHTML = '' + option;
            selectElement.appendChild(optionElement);
        }
    }

    const CSS_PREFIX = 'ced';
    const CSS_CONTAINER = `${CSS_PREFIX}-grid-container`;
    const CSS_CONTAINER_SCROLL = `${CSS_PREFIX}-grid-container-scroll`;
    const CSS_GRID = `${CSS_PREFIX}-grid`;
    const CSS_ROW = `${CSS_PREFIX}-row`;
    const CSS_CELL = `${CSS_PREFIX}-cell`;
    const CSS_SELECT_CELL = `${CSS_PREFIX}-select-cell`;
    const CSS_HEAD = `${CSS_PREFIX}-head`;
    const CSS_HEAD_STICKY = `${CSS_PREFIX}-head-sticky`;
    const CSS_RESIZER = `${CSS_PREFIX}-resizer`;
    const CSS_EDITING = `${CSS_PREFIX}-editing`;
    const CSS_ACTIVE = `${CSS_PREFIX}-active`;
    const CSS_SELECTED = `${CSS_PREFIX}-selected`;
    const CSS_READONLY = `${CSS_PREFIX}-readonly`;

    /**
     * Create a new Cell instance matching the definitions in the value parameter.
     * @param callback  Can be used by the cell to notify value changes that are not
     *                  triggered from outside.
     */
    function createCell(row, col, value, callback) {
        if (typeof value !== 'string' && typeof value !== 'number' && Array.isArray(value.options)) {
            return new SelectCell(row, col, value, callback);
        }
        return new InputCell(row, col, value);
    }
    class InputCell {
        constructor(row, col, value) {
            this.row = row;
            this.col = col;
            this.readonly = false;
            this.isActive = false;
            this.isSelected = false;
            this.extraCss = '';
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
        element() {
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
                    this.input.blur();
                    remove(this.input);
                    this.elem.innerHTML = '';
                    this.elem.appendChild(valueElement(this.input.value));
                    this.input = null;
                }
            }
            this.setCss();
            return this;
        }
        value() {
            return this.input ? this.input.value : this.val;
        }
        set(value) {
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
        setValue(value) {
            this.val = String(value);
            if (this.input) {
                this.input.value = value.toString();
            }
            else if (this.elem) {
                this.elem.innerHTML = '';
                this.elem.appendChild(valueElement(value));
            }
        }
        setCss() {
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
        startEdit(input, select = false) {
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
        takesKey() {
            return !!this.input;
        }
        takesMouse() {
            return this.takesKey();
        }
    }
    function valueElement(value) {
        const valueSpan = document.createElement('span');
        valueSpan.appendChild(document.createTextNode(String(value)));
        return valueSpan;
    }
    class SelectCell {
        constructor(row, col, value, callback) {
            this.row = row;
            this.col = col;
            this.readonly = false;
            this.options = null;
            this.isSelected = false;
            this.extraCss = '';
            this.readonly = value.readonly;
            this.options = value.options;
            this.elem = createElement(`<div data-ci="${col}"></div>`);
            this.selectElement = createElement(`<select><select>`);
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
        element() {
            return this.elem;
        }
        value() {
            return this.selectElement.value;
        }
        set(value) {
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
        setValue(value) {
            this.selectElement.value = value ? value.toString() : null;
        }
        setCss() {
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
        selected() {
            return this.isSelected;
        }
        activate(doActivate) {
            return this;
        }
        startEdit(input, selectContent) {
        }
        takesKey() {
            return false;
        }
        takesMouse() {
            return true;
        }
    }
    function isPlainValue(value) {
        return typeof value === 'string' || typeof value === 'number';
    }
    function isDefined(value) {
        return typeof value !== 'undefined';
    }
    function cssIf(useValue, css) {
        return useValue ? ' ' + css : '';
    }

    class Row {
        constructor(args) {
            this.cells = [];
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

    class DefaultRenderer {
        constructor(options) {
            this.options = options;
        }
        rerender(rows) {
            const { grid, head } = this.options;
            grid.innerHTML = '';
            grid.appendChild(head);
            rows.forEach(r => {
                grid.appendChild(r.element());
            });
        }
        destroy() {
            this.options = null;
        }
    }
    class VirtualRenderer {
        constructor(options) {
            this.options = options;
        }
        rerender(rows) {
            const { grid, head, container, gridContainer } = this.options;
            if (this.onScroll) {
                container.removeEventListener('scroll', this.onScroll);
            }
            const itemPadding = 4;
            const current = {
                viewportHeight: undefined,
                itemCount: undefined,
                start: undefined,
                end: undefined, // last rendered item (including)
            };
            let rowHeight = 34; // just a guess
            grid.style.position = 'absolute';
            const update = (scrollTop) => {
                const itemCount = rows.length;
                const viewportHeight = container.offsetHeight;
                const totalContentHeight = itemCount * rowHeight;
                let startIndex = Math.floor(scrollTop / rowHeight) - itemPadding;
                if (startIndex % 2 > 0) {
                    // always start with an odd index to keep alternating styles consistent
                    startIndex -= 1;
                }
                startIndex = Math.max(0, startIndex);
                let visibleNodesCount = Math.ceil(viewportHeight / rowHeight) + 2 * itemPadding;
                visibleNodesCount = Math.min(itemCount - startIndex, visibleNodesCount);
                const endIndex = startIndex + visibleNodesCount - 1; // last rendered item (including)
                const maxOffsetY = Math.max(0, totalContentHeight - viewportHeight - itemPadding * rowHeight); // do not go beyond this
                const offsetY = Math.min(maxOffsetY, startIndex * rowHeight);
                // At the end of the list we will not rerender in order to avoid jumping scrollbar.
                const lastItemIndex = itemCount - 1;
                const lastWasAdded = current.end === lastItemIndex;
                const lastWillBeAdded = endIndex === lastItemIndex;
                const noMoreItemsAvailable = lastWasAdded && lastWillBeAdded;
                const newRangeDiffers = current.start !== startIndex || current.end !== endIndex;
                const heightChanged = viewportHeight !== current.viewportHeight;
                const itemCountChanged = itemCount !== current.itemCount;
                const shouldRerender = itemCountChanged || heightChanged || (newRangeDiffers && !noMoreItemsAvailable);
                // Render
                if (shouldRerender) {
                    const desiredRenderHeight = visibleNodesCount * rowHeight; // viewport + padding
                    current.start = startIndex;
                    current.end = endIndex;
                    current.viewportHeight = viewportHeight;
                    current.itemCount = itemCount;
                    grid.innerHTML = '';
                    grid.appendChild(head);
                    const headerHeight = grid.offsetHeight;
                    let renderedHeight = 0;
                    // First add items from start to end index at once
                    const fragment = document.createDocumentFragment();
                    let i = startIndex;
                    for (; i <= endIndex && i < rows.length; ++i) {
                        const row = rows[i];
                        fragment.appendChild(row.element());
                    }
                    grid.appendChild(fragment);
                    renderedHeight = grid.offsetHeight - headerHeight;
                    // Add items until we reached the desired height
                    for (; renderedHeight < desiredRenderHeight && i < rows.length; ++i) {
                        const row = rows[i];
                        const rowElement = row.element();
                        grid.appendChild(rowElement);
                        renderedHeight += rowElement.offsetHeight;
                    }
                    const numberOfRenderedItems = i - startIndex;
                    if (numberOfRenderedItems) {
                        rowHeight = renderedHeight / numberOfRenderedItems;
                    }
                    gridContainer.style.height = `${totalContentHeight}px`;
                    grid.style['top'] = `${offsetY}px`;
                }
            };
            const updateFunc = update;
            let animationFrame;
            this.onScroll = (e) => {
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                }
                animationFrame = requestAnimationFrame(() => {
                    updateFunc(e.target.scrollTop);
                });
            };
            container.addEventListener('scroll', this.onScroll);
            updateFunc(container.scrollTop);
        }
        destroy() {
            this.options.container.removeEventListener('scroll', this.onScroll);
            this.options = null;
            this.onScroll = null;
        }
    }

    class Grid {
        constructor(container, options) {
            this.rows = [];
            this.cells = []; // all cells in order from top to bottom and left to right. See flattenCells
            this.events = new EventEmitter();
            this.cleanups = [];
            this.container = typeof container === 'string' ? query(container) : container;
            if (options) {
                this.init(options);
            }
        }
        init(options) {
            this.destroy();
            options.scroll = getScrollOptions(options);
            this.options = options;
            const container = this.container;
            const rows = this.rows;
            container.innerHTML = '';
            rows.length = 0;
            if (options.input) {
                this.cellInput = typeof options.input === 'function' ? options.input() : options.input;
                remove(this.cellInput);
            }
            else {
                this.cellInput = createElement(`<input id="celled-cell-input" type="text" >`);
            }
            this.hiddenInput = createElement('<div id="celled-hidden-input" style="position:absolute; z-index:-1; left:2px; top: 2px;" contenteditable tabindex="0"></div>');
            if (options.scroll) {
                container.classList.add(CSS_CONTAINER_SCROLL);
            }
            const gridContainer = createElement(`<div class="${CSS_CONTAINER}"></div>`);
            const stickyHeader = options.scroll.stickyHeader;
            const headCss = `${CSS_ROW} ${CSS_HEAD} ${stickyHeader ? CSS_HEAD_STICKY : ''}`;
            const head = createElement(`<div class="${headCss}"></div>`);
            const grid = this.grid = createElement(`<div class="${CSS_GRID}"></div>`);
            container.appendChild(gridContainer);
            gridContainer.appendChild(this.hiddenInput);
            gridContainer.appendChild(grid);
            options.cols.forEach((c, index) => head.appendChild(this.createHeadCell(c, index)));
            const renderOptions = { container, gridContainer, grid, head };
            this.render = options.scroll.virtualScroll ? new VirtualRenderer(renderOptions) : new DefaultRenderer(renderOptions);
            // Listen to resize events on container element to reset column widths.
            // Otherwise the column widths will be wrong and layout of edit cells is messed up.
            const resizeObserver = new ResizeObserver(() => {
                this.resetColumnWidths();
            });
            resizeObserver.observe(container);
            this.cleanups.push(() => resizeObserver.disconnect());
            this.createRows();
            this.initMouse();
            this.initKeys();
            this.initClipboard();
            this.resetColumnWidths();
        }
        destroy() {
            if (this.render) {
                this.render.destroy();
                this.render = null;
            }
            this.cleanups.forEach(c => c());
            this.cleanups.length = 0;
            if (this.grid) {
                remove(this.grid);
            }
            this.cells.forEach(c => c.destroy());
            this.cells.length = 0;
            this.rows.length = 0;
            this.grid = null;
            this.hiddenInput = null;
            this.cellInput = null;
            this.events = new EventEmitter();
        }
        on(event, handler) {
            this.events.addHandler(event, handler);
        }
        update(rowIndex, colIndex, value, emit) {
            const row = this.rows[rowIndex];
            const cell = row.cells[colIndex];
            if (cell) {
                cell.set(value);
                this.updateValue(cell, emit);
            }
        }
        addRows(rows) {
            [].push.apply(this.options.rows, rows);
            rows.forEach(r => {
                const newRow = this.createAndAddRow(r);
                newRow.cells.forEach(c => this.emitInput(c));
            });
            this.flattenCells();
            this.renderRows();
        }
        addRow() {
            this.addRows([this.options.cols.map(c => '')]);
        }
        resetColumnWidths() {
            const allCells = queryAll(this.container, `${css(CSS_HEAD)} ${css(CSS_CELL)}`);
            allCells.forEach((c, i) => {
                const colOptions = this.options.cols[i];
                if (!c.style.width && typeof colOptions === 'object' && colOptions.width) {
                    const widthOption = colOptions.width;
                    const width = typeof widthOption === 'string' ? widthOption : `${widthOption}px`;
                    c.style.width = width;
                }
                else {
                    c.style.width = c.offsetWidth + 'px';
                }
            });
        }
        createHeadCell(colOptions, columnIndex) {
            const text = typeof colOptions === 'object' ? colOptions.name : colOptions;
            const column = createElement(`<div class="${CSS_CELL}" data-ci="${columnIndex}"><span>${text}</span></div>`);
            const resizer = createElement(`<div class="${CSS_RESIZER}"></div>`);
            column.appendChild(resizer);
            let downPosition = null;
            let nextColumn = null;
            let currentWidth = null;
            let currentNextWidth = null;
            let selection = null;
            const mousemove = (e) => {
                if (selection) {
                    let col = e.target;
                    while (col) {
                        const ciAttr = col.getAttribute('data-ci');
                        const ci = +ciAttr;
                        if (ciAttr !== null && !isNaN(ci)) {
                            const minCol = Math.min(columnIndex, ci);
                            const maxCol = Math.max(columnIndex, ci);
                            if (selection[0] !== minCol || selection[1] !== maxCol) {
                                selection = [minCol, maxCol];
                                this.cells.forEach(c => c.select(c.col >= minCol && c.col <= maxCol));
                                this.emitSelect();
                            }
                            break;
                        }
                        col = col.parentElement;
                    }
                }
                else {
                    // column resizing
                    const diff = e.pageX - downPosition;
                    if (nextColumn) {
                        nextColumn.style.width = (currentNextWidth - diff) + 'px';
                    }
                    column.style.width = (currentWidth + diff) + 'px';
                }
            };
            const mouseup = () => {
                downPosition = null;
                selection = null;
                off(document, 'mousemove', mousemove);
                off(document, 'mouseup', mouseup);
                this.resetColumnWidths();
            };
            const cleanupMousedown = on(column, 'mousedown', (e) => {
                if (e.target === resizer) {
                    // Resize columns
                    nextColumn = column.nextElementSibling;
                    downPosition = e.pageX;
                    currentWidth = column.offsetWidth;
                    currentNextWidth = nextColumn ? nextColumn.offsetWidth : null;
                }
                else if (this.rows.length) {
                    // Select column
                    const i = +column.getAttribute('data-ci');
                    selection = true;
                    this.cells.forEach(c => c.activate(false).select(c.col === i));
                    selection = [i, i];
                    this.focusHiddenInput();
                    this.activeCell = this.rows[0].cells[i];
                    this.emitSelect();
                }
                on(document, 'mouseup', mouseup);
                on(document, 'mousemove', mousemove);
                e.preventDefault();
            });
            this.cleanups.push(cleanupMousedown);
            return column;
        }
        focusHiddenInput() {
            // Focus the hidden input element to receive paste events.
            // Prevent scrolling up if input was blurred at the end of a long table.
            this.hiddenInput.focus({ preventScroll: true });
        }
        createAndAddRow(r) {
            const row = new Row({
                index: this.rows.length,
                cells: r,
                updateValueCallback: cell => this.emitInput(cell)
            });
            this.rows.push(row);
            return row;
        }
        createRows() {
            this.rows = [];
            this.options.rows.forEach(r => this.createAndAddRow(r));
            this.flattenCells();
            this.renderRows();
        }
        renderRows() {
            this.render.rerender(this.rows);
        }
        flattenCells() {
            this.cells = [];
            for (let i = 0, end = this.rows.length; i < end; ++i) {
                this.cells.push(...this.rows[i].cells);
            }
        }
        initMouse() {
            let downCellIndex;
            let downRowIndex;
            let selectionIdentifier = null;
            const rememberSelection = (r1, c1, r2, c2) => '' + r1 + c1 + r2 + c2;
            const findTargetCell = (cell, level = 0) => {
                if (!cell || !cell.parentElement) {
                    return;
                }
                const cellIndexAttr = cell.getAttribute('data-ci');
                if (cellIndexAttr === null && level < 2) {
                    return findTargetCell(cell.parentElement, level + 1);
                }
                const rowIndexAttr = cell.parentElement.getAttribute('data-ri');
                const cellIndex = +cellIndexAttr;
                const rowIndex = +rowIndexAttr;
                if (cellIndexAttr && rowIndexAttr && !isNaN(cellIndex) && !isNaN(rowIndex)) {
                    return this.rows[rowIndex].cells[cellIndex];
                }
            };
            const getTargetCell = (e) => {
                const cell = e.target;
                return findTargetCell(cell);
            };
            const mousemove = (moveEvent) => {
                const targetCell = getTargetCell(moveEvent);
                if (targetCell) {
                    const rowIndex = targetCell.row;
                    const cellIndex = targetCell.col;
                    const firstRow = Math.min(rowIndex, downRowIndex);
                    const lastRow = Math.max(rowIndex, downRowIndex);
                    const firstCol = Math.min(cellIndex, downCellIndex);
                    const lastCol = Math.max(cellIndex, downCellIndex);
                    const newSelectionIdentifier = rememberSelection(firstRow, firstCol, lastRow, lastCol);
                    if (selectionIdentifier !== newSelectionIdentifier) {
                        selectionIdentifier = newSelectionIdentifier;
                        this.unselect();
                        for (let ri = firstRow; ri <= lastRow; ++ri) {
                            for (let ci = firstCol; ci <= lastCol; ++ci) {
                                this.rows[ri].cells[ci].select();
                            }
                        }
                        this.emitSelect();
                    }
                }
            };
            const mouseup = () => {
                off(document, 'mousemove', mousemove);
                off(document, 'mouseup', mouseup);
            };
            let lastMouseDown = Date.now();
            const cleanupMousedown = on(this.grid, 'mousedown', (e) => {
                const cell = getTargetCell(e);
                if (cell) {
                    const timeSinceLast = Date.now() - lastMouseDown;
                    lastMouseDown = Date.now();
                    if (cell.takesMouse()) {
                        // The cell is already in edit mode. Do nothing and continue with default event handling
                        return;
                    }
                    else if (cell === this.activeCell && !cell.readonly && timeSinceLast < 300) {
                        // Double click on cell to start edit mode
                        // if (Array.isArray(cell.options)) {
                        //     cell.startSelect(this.cellSelect);
                        // }
                        cell.startEdit(this.cellInput);
                        this.emitFocus();
                    }
                    else {
                        const rowIndex = cell.row;
                        const cellIndex = cell.col;
                        downRowIndex = rowIndex;
                        downCellIndex = cellIndex;
                        selectionIdentifier = rememberSelection(rowIndex, cellIndex, rowIndex, cellIndex);
                        this.activate(cell);
                        on(document, 'mouseup', mouseup);
                        on(document, 'mousemove', mousemove);
                    }
                    e.preventDefault();
                }
            });
            this.cleanups.push(cleanupMousedown);
            const cleanupMouseup = on(document, 'mouseup', (e) => {
                if (this.activeCell) {
                    // Unselect all if was click outside of the grid.
                    for (let target = e.target; target; target = target.parentNode) {
                        if (target === this.container) {
                            return;
                        }
                    }
                    this.activeCell.activate(false);
                    if (this.unselect()) {
                        this.emitSelect();
                    }
                }
            });
            this.cleanups.push(cleanupMouseup);
        }
        activate(cell, doActivate = true) {
            if (this.activeCell) {
                this.activeCell.activate(false);
            }
            let selectionChanged = false;
            this.cells.forEach(c => {
                selectionChanged = c === cell ? (c.selected() !== doActivate) : (selectionChanged || c.selected());
                c.select(false);
            });
            this.activeCell = cell.select(doActivate).activate(doActivate);
            if (selectionChanged) {
                this.emitSelect();
            }
            this.focusHiddenInput();
        }
        moveActive(rowDelta, colDelta, addRows = false) {
            const activeCell = this.activeCell;
            if (activeCell) {
                const rows = this.rows;
                const rowIndex = activeCell.row + rowDelta;
                while (addRows && this.options.canAddRows && rowIndex >= rows.length) {
                    this.addRow();
                }
                const nextRow = rows[rowIndex];
                if (nextRow) {
                    const cell = nextRow.cells[activeCell.col + colDelta];
                    if (cell) {
                        this.activate(cell);
                    }
                }
            }
        }
        initKeys() {
            const hiddenInput = this.hiddenInput;
            const cellInput = this.cellInput;
            this.cleanups.push(on(hiddenInput, 'keydown', (e) => {
                e = e || window.event;
                const keyCode = e.keyCode;
                if (keyCode === 46) { // del
                    this.cells.forEach(cell => {
                        if (cell.selected()) {
                            this.setCell(cell, '');
                        }
                    });
                    e.preventDefault();
                }
                if (keyCode === 37) {
                    this.moveActive(0, -1);
                }
                if (keyCode === 38) {
                    this.moveActive(-1, 0);
                }
                if (keyCode === 39) {
                    this.moveActive(0, 1);
                }
                if (keyCode === 40) {
                    this.moveActive(1, 0);
                }
            }));
            const onInput = (e) => {
                const activeCell = this.activeCell;
                if (activeCell && !activeCell.readonly && activeCell.takesKey()) {
                    this.updateValue(activeCell, true);
                    this.cells.forEach(cell => {
                        if (cell.selected() && cell !== activeCell) {
                            this.setCell(cell, activeCell.value());
                        }
                    });
                }
            };
            this.cleanups.push(on(cellInput, 'input', onInput));
            this.cleanups.push(on(cellInput, 'keydown', (e) => {
                if (e.keyCode === 13) {
                    // ENTER, stop edit and move to next row
                    this.moveActive(0, 0);
                    this.moveActive(1, 0, true);
                    e.preventDefault();
                }
                if (e.keyCode === 27) {
                    // ESCAPE, stop edit but stay at same cell
                    this.moveActive(0, 0);
                    e.preventDefault();
                }
            }));
            this.cleanups.push(on(hiddenInput, 'keypress', (e) => {
                const activeCell = this.activeCell;
                if (activeCell && !activeCell.readonly && !activeCell.takesKey()) {
                    activeCell.startEdit(cellInput, true);
                    this.emitFocus();
                }
                else {
                    e.preventDefault();
                }
            }));
        }
        pasteCSV(csvText, separator, startRow, startCol) {
            const csv = parseCSV(csvText, separator);
            const activeCell = this.activeCell;
            if (isNaN(startRow) && !activeCell) {
                return;
            }
            startRow = isNaN(startRow) ? activeCell.row : startRow;
            startCol = isNaN(startCol) ? activeCell.col : startCol;
            csv.forEach((csvRow, csvRowIndex) => {
                let tableRow = this.rows[startRow + csvRowIndex];
                if (!tableRow && this.options.canAddRows) {
                    const prevRow = this.rows[startRow];
                    this.addRows([prevRow.cells.map(c => '')]);
                    tableRow = this.rows[startRow + csvRowIndex];
                }
                const tableCol = startCol;
                const isLastEmptyRow = csvRow.length === 1 && csvRow[0] === '';
                if (tableRow && !isLastEmptyRow) {
                    csvRow.forEach((csvCell, csvColIndex) => {
                        const cell = tableRow.cells[tableCol + csvColIndex];
                        if (cell && !cell.readonly) {
                            this.setCell(cell, csvCell);
                            cell.select();
                        }
                    });
                }
            });
        }
        initClipboard() {
            const cleanupPaste = on(this.hiddenInput, 'paste', (e) => {
                // Don't actually paste to hidden input
                e.preventDefault();
                const text = (e.clipboardData || window.clipboardData).getData('text');
                this.pasteCSV(text, '\t');
            });
            const cleanupCopy = on(this.hiddenInput, 'copy', (e) => {
                e.preventDefault();
                const csv = [];
                for (const row of this.rows) {
                    const selectedCells = row.cells.filter(cell => cell.selected());
                    if (selectedCells.length > 0) {
                        csv.push(selectedCells.map(cell => cell.value()));
                    }
                    else if (csv.length) {
                        // end of csv block reached
                        break;
                    }
                }
                const clipboard = (e.clipboardData || window.clipboardData);
                clipboard.setData('text/plain', writeCSV(csv, '\t'));
            });
            this.cleanups.push(cleanupPaste);
            this.cleanups.push(cleanupCopy);
        }
        setCell(cell, value) {
            if (!cell.readonly) {
                cell.set(value);
                this.updateValue(cell, true);
            }
        }
        unselect() {
            let selectionChanged = false;
            this.cells.forEach(c => {
                selectionChanged = selectionChanged || c.selected();
                c.select(false);
            });
            return selectionChanged;
        }
        updateValue(cell, emit) {
            const colIndex = cell.col;
            const rowOption = this.options.rows[cell.row];
            const cellValue = rowOption[colIndex];
            if (typeof cellValue === 'string' || typeof cellValue === 'number') {
                rowOption[colIndex] = cell.value();
            }
            else {
                cellValue.value = cell.value();
            }
            if (emit) {
                this.emitInput(cell);
            }
        }
        emitInput(cell) {
            this.events.emit('input', {
                grid: this,
                col: cell.col,
                row: cell.row,
                value: cell.value(),
            });
        }
        emitFocus() {
            const cell = this.activeCell;
            this.events.emit('focus', {
                grid: this,
                col: cell.col,
                row: cell.row,
                value: cell.value(),
            });
        }
        emitSelect() {
            this.events.emit('select', {
                grid: this,
                selection: this.cells.filter(c => c.selected()).map(c => ({
                    row: c.row,
                    col: c.col,
                })),
            });
        }
    }
    function css(className) {
        return '.' + className;
    }
    function trueOr(value) {
        return value === false ? false : true;
    }
    function getScrollOptions(options) {
        const scroll = options.scroll;
        if (!scroll) {
            return {};
        }
        return {
            enabled: trueOr(scroll.enabled),
            virtualScroll: trueOr(scroll.virtualScroll),
            stickyHeader: trueOr(scroll.stickyHeader),
        };
    }

    exports.Grid = Grid;

}));
//# sourceMappingURL=celled.js.map
