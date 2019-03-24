declare namespace Slick {

    /**
     * @see https://github.com/6pac/SlickGrid/wiki/Column-Options
     */
    export interface IColumnOptions {
        asyncPostRender?: (cellNode: any, row: number, dataContext: object, colDef: IColumnOptions) => void;
        behavior?: any;
        cannotTriggerInsert?: boolean;
        cssClass?: string;
        defaultSortAsc?: boolean;
        editor?: Slick.IEditor;
        field?: string;
        focusable?: boolean;
        formatter?: (row: number, cell: HTMLElement, value: any, columnDef: IColumnOptions, dataContext: object) => string | IFormatterResult;
        headerCssClass?: string;
        id?: string;
        maxWidth?: number;
        minWidth?: number;
        name?: string;
        rerenderOnResize?: boolean;
        resizable?: boolean;
        selectable?: boolean;
        sortable?: boolean;
        toolTip?: string;
        width?: number;
    }

    /**
     * @see https://github.com/6pac/SlickGrid/wiki/Grid-Options
     */
    export interface IGridOptions {
        asyncEditorLoading?: boolean;
        asyncEditorLoadDelay?: number;
        asyncPostRenderDelay?: number;
        autoEdit?: boolean;
        autoHeight?: boolean;
        cellFlashingCssClass?: string;
        cellHighlightCssClass?: string;
        dataItemColumnValueExtractor?: any;
        defaultColumnWidth?: number;
        defaultFormatter?: IFormatter;
        editable?: boolean;
        editCommandHandler?: any;
        editorFactory?: { getEditor(column: IColumnOptions): IEditor };
        editorLock?: Slick.EditorLock;
        enableAddRow?: boolean;
        enableAsyncPostRender?: boolean;
        /** @deprecated */
        enableCellRangeSelection?: any;
        enableCellNavigation?: boolean;
        enableColumnReorder?: boolean;
        /** @deprecated */
        enableRowReordering?: any;
        enableTextSelectionOnCells?: boolean;
        explicitInitialization?: boolean;
        forceFitColumns?: boolean;
        forceSyncScrolling?: boolean;
        formatterFactory?: { getFormatter(column: IColumnOptions): IFormatter };
        fullWidthRows?: boolean;
        headerRowHeight?: number;
        leaveSpaceForNewRows?: boolean;
        multiColumnSort?: boolean;
        multiSelect?: boolean;
        rowHeight?: number;
        selectedCellCssClass?: string;
        showHeaderRow?: boolean;
        syncColumnCellResize?: boolean;
        topPanelHeight?: number;
    }

    /**
     * @see https://github.com/6pac/SlickGrid/wiki/Handling-selection
     */
    export interface ISelectionModel {
        init(grid: Grid): void;
        destroy(): void;
        onSelectedRangesChanged: Slick.Event;
    }

    /**
     * @see https://github.com/6pac/SlickGrid/wiki/Slick.Grid#header-core
     */
    export class Grid {
        constructor(container: any, data: Data.IDataView, columns: IColumnOptions[], options: IGridOptions);

        init(): void;
        getData(): object[];
        getDataItem(index: number): object;
        setData(newData: object, scrollTop: boolean): void;
        getDataLength(): number;
        getOptions(): IGridOptions;
        getSelectedRows(): number[];
        getSelectionModel(): ISelectionModel;
        setOptions(options: IGridOptions): void;
        setSelectedRows(rowsArray: number[]): void;
        setSelectionModel(selectionModel: ISelectionModel): void;

        autosizeColumns(): void;
        getColumnIndex(id: string): number;
        getColumns(): IColumnOptions[];
        setColumns(columnDefinitions: IColumnOptions[]): void;
        setSortColumn(columnId: string, ascending: boolean): void;
        setSortColumns(cols: {columnId: string, sortAsc: boolean}[]): void;
        updateColumnHeader(columnId: string, title: string, toolTip: string): void;

        addCellCssStyles(key: any, hash: object): void;
        canCellBeActive(row: number, col: number): boolean;
        canCellBeSelected(row: number, col: number): boolean;
        editActiveCell(editor: IEditor): void;
        flashCell(row: number, cell: number, speed: number): void;
        getActiveCell(): { row: number, cell: number };
        getActiveCellNode(): HTMLElement;
        getActiveCellPosition(): { bottom: number, height: number, left: number, right: number, top: number, visible: boolean, width: number };
        getCellCssStyles(key: any): any;
        getCellEditor(): IEditor;
        getCellFromEvent(e: Event): { row: number, cell: number };;
        getCellFromPoint(x: number, y: number):  { row: number, cell: number };
        getCellNode(row: number, cell: number): HTMLElement;
        getCellNodeBox(row: number, cell: number): { bottom: number, height: number, left: number, right: number, top: number, visible: boolean, width: number };
        gotoCell(row: number, cell: number, forceEdit: boolean): void;

        invalidate(): void;
        invalidateAllRows(): void;
        invalidateRow(row: number): void;
        invalidateRows(rows: number[]): void;
        render(): void;
        updateRowCount(): void;

        onCellChange: Slick.Event & {
            subscribe: (e: Slick.Event, args: { row: number, cell: number, item: any }) => void;
        };
    }
}