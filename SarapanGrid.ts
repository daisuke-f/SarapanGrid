
/// <reference types="papaparse" />

namespace Sarapan {
    export class Utils {
        /**
         * Merge two objects.
         * 
         * The properties in the second object is used only when the first object does't have them.
         * 
         * @see https://www.typescriptlang.org/docs/handbook/advanced-types.html#intersection-types
         * 
         * @param first 
         * @param second 
         */
        static extend<T, U>(first: T, second: U): T & U {
            let result = <T & U>{};
            for (let id in first) {
                (<any>result)[id] = (<any>first)[id];
            }
            for (let id in second) {
                if (!result.hasOwnProperty(id)) {
                    (<any>result)[id] = (<any>second)[id];
                }
            }
            return result;
        }

        static formatDate(date?: Date) {
            date = date==undefined ? new Date : date;

            // yyyyMMdd-HHmmss-fff
            return (
                date.getFullYear() + ("0" + (date.getMonth()+1)).slice(-2) + ("0" + date.getDate()).slice(-2) + "_" +
                ("0" + date.getHours()).slice(-2) + ("0" + date.getMinutes()).slice(-2) + ("0" + date.getSeconds()).slice(-2) + "_" +
                ("00" + date.getMilliseconds()).slice(-3)
            );
        }

        static wrapFormatterResult(ret :string|Slick.IFormatterResult): Slick.IFormatterResult {
            if(typeof(ret)=="object") {
                return ret;
            }
            return {
                addClasses: "",
                toolTip: "",
                text: ret==null ? "" : ret.toString()
            };
        }

        static isNullOrEmptyString(test: string|undefined) {
            return test==null || 0==test.length;
        }

        static sortNumberDescComparison(item1: number, item2: number) {
            return item2 - item1;
        }
    }

    export enum EditState {
        NotEdited = 0,
        Added = 1,
        Changed = 2,
        Deleted = 3
    }

    export interface Column extends Slick.IColumnOptions {
        /**
         * Whether the value in this field is one of the primary keys or not.
         */
        key?: boolean;
    }

    export interface GridOptions<T> extends Slick.IGridOptions {
        editStateLabelFunc: (state: EditState) => string;
        generateIdFunc: (data: T, grid: Grid<T>) => string;
        rowIdProperty: string;
        useRowNumColumn: boolean;
        useEditStatusColumn: boolean;
    }

    export interface MetadataStore<T> {
        [key: string]: {
            state: EditState,
            savedData: T,
            savedTime: Date
        }
    }

    export class Grid<T> {

        private _columns: Column[];
        private _options: GridOptions<T>;
        private _grid: Slick.Grid
        private _dataView: Slick.Data.DataView;
        private _metadata: MetadataStore<T>;
        private _objectUrl?: string;

        public static readonly DEFAULT_GRID_OPTIONS: GridOptions<any> = {
            autoEdit: false,
            editStateLabelFunc: (state: EditState) => {
                switch(state) {
                    case EditState.Added: return "追加";
                    case EditState.Changed: return "変更";
                    case EditState.Deleted: return "削除";
                }
                return "";
            },
            editable: true,
            enableColumnReorder : false,
            generateIdFunc: (data, grid) => {
                var keyFields = grid.getColumns().filter(col=>col.key);
                if(0<keyFields.length) {
                    var keyValues = keyFields.map(col=>data[<string>col.id]).filter(val=>val!=null&&0<val.toString());
                    if(0<keyValues.length) {
                        return keyValues.join("-");
                    }
                }
                return "AutoKey-" + Utils.formatDate() + "-" + Math.floor(Math.random()*1000);
            },
            rowIdProperty: "SarapanGrid-RowId",
            useRowNumColumn: true,
            useEditStatusColumn: true
        };

        constructor(container: any, columns: Column[], options: {}) {
            this._columns = columns;
            this._options = Utils.extend(options, Grid.DEFAULT_GRID_OPTIONS);

            if(0==this.getColumns().filter(col=>col.key).length) {
                throw new Error("columns must contain at least 1 key column.");
            }

            columns.forEach(col => {
                var list: Slick.IFormatter[] = [];
                if(col.formatter != null) list.push(col.formatter);
                list.push(<any>this.format.bind(this));
                col.formatter = this._createCompoundFormatter(list);
            })

            this._metadata = {};
            this._dataView = new Slick.Data.DataView();
            this._dataView.setItems([], this._options.rowIdProperty);
            this._grid = new Slick.Grid(container, this._dataView, this._columns, this._options);
            this._grid.setSelectionModel(new Slick.CellSelectionModel());

            this._initUI();
            this._initEvent();
        }

        public onRowCountChanged(e: Slick.EventData, args: { previous: number; current: number; dataView: DataView; callingOnRowsChanged: boolean; }): void {
            this._grid.updateRowCount();
            this._grid.render();
        }

        public onRowsChanged(e: Slick.EventData, args: { rows: number[], dataView: DataView, calledOnRowCountChanged: boolean }): void {
            this._grid.invalidateRows(args.rows);
            this._grid.render();
        }

        public onCellChange(e: Slick.EventData, args: { row: number, cell: number, item: any }): void {
            var meta = this._getMetadata(args.item);

            if(meta.state != EditState.Added) {
                if(this._isDataChanged(args.item)) {
                    meta.state = EditState.Changed;
                } else {
                    meta.state = EditState.NotEdited;
                }
            }
            this._grid.invalidateRow(args.row);
            this._grid.render();
        }

        private _getDataId(data: T): any {
            return data[<keyof T>this._options.rowIdProperty];
        }

        private _getMetadata(data: T) {
            return this._metadata[this._getDataId(data)];
        }

        private _initUI(): void {
            this._grid.getColumns().unshift({
                id: "SarapanGrid-EditStatus",
                field: undefined,
                name: "",
                cssClass: "slick-header-column",
                focusable: false,
                formatter: function(this: Grid<T>, row: number, cell: HTMLElement, value: any, columnDef: Slick.IColumnOptions, dataContext: any) {
                    return this._options.editStateLabelFunc.call(null, this._getMetadata(dataContext).state);
                }.bind(this),
                resizable: false,
                selectable: false
            });

            this._grid.getColumns().unshift({
                id: "SarapanGrid-Rownum",
                field: undefined,
                name: "",
                cssClass: "slick-header-column",
                focusable: false,
                formatter: function(this: Grid<T>, row: number, cell: HTMLElement, value: any, columnDef: Slick.IColumnOptions, dataContext: any) {
                    return Number(row+1).toString();
                }.bind(this),
                resizable: false,
                selectable: false
            });

            this._grid.setColumns(this._grid.getColumns());
        }

        private _initEvent(): void {
            this._dataView.onRowCountChanged.subscribe(this.onRowCountChanged.bind(this));
            this._dataView.onRowsChanged.subscribe(this.onRowsChanged.bind(this));
            this._grid.onCellChange.subscribe(this.onCellChange.bind(this));
        }

        public initData(data: T[]) {
            this.loadObjects(data, true);
        }

        public loadObjects(data: T[], initialize?: boolean): void {
            if(initialize) {
                this._metadata = {};
                this._dataView.setItems([], this._options.rowIdProperty);
            }

            this._dataView.beginUpdate();
            for(let i=0; i<data.length; i++) {
                let item: any = data[i];
                let id;
                if(this._getDataId(data[i]) && this._getDataId(data[i])!=null) {
                    id = this._getDataId(data[i]);
                } else {
                    id = this._options.generateIdFunc(data[i], this);
                    (<any>data[i])[this._options.rowIdProperty] = id;
                }

                var meta = this._metadata[id];

                if(meta) {
                    meta.state = this._isDataChanged(data[i]) ? EditState.Changed : meta.state;
                    this._dataView.updateItem(id, item);
                } else {
                    meta = {
                        state: initialize ? EditState.NotEdited : EditState.Added,
                        savedData: Utils.extend({}, data[i]),
                        savedTime: new Date()
                    }
                    this._metadata[id] = meta;
                    this._dataView.addItem(item);
                }
            }
            this._dataView.endUpdate();
            
            return;
        }

        public importFromFile(file: File, initialize?: boolean): void {
            Papa.parse(file, {
                complete: function(this: Grid<T>, results: Papa.ParseResult, file: File) {
                    this.loadObjects(results.data, initialize);
                }.bind(this),
                delimiter: "",
                error: function(errors, file) {
                    window.alert("Error");
                    console.debug(errors);
                },
                header: true
            });
        }

        public importFromUrl(url: string, initialize?: boolean) {
            var that = this;
            var xhr = new XMLHttpRequest();
            xhr.addEventListener('load', function(evt) {
                if(this.status==200) {
                    that.loadObjects(JSON.parse(this.responseText), initialize);
                } else {
                    window.alert("Error: " + this.status);
                    console.debug(this.responseText);
                }
            });
            xhr.addEventListener('error', function(this: XMLHttpRequest, evt: ProgressEvent) {
                window.alert("Error: " + this.readyState);
                console.debug(this.status + " " + this.statusText);
            }.bind(xhr));
            xhr.overrideMimeType("application/json");
            xhr.open('post', url);
            xhr.send();
        }

        public exportToObjectUrl(): string {
            var fields = this._columns.map(col=>col.field).filter(f=>!(Utils.isNullOrEmptyString(f)));
            var csvContents = Papa.unparse({fields:fields, data:this._dataView.getItems()});
            console.debug(csvContents);
            var blob = new Blob(["\ufeff", csvContents], { type:"text/csv" });

            if(this._objectUrl) {
                window.URL.revokeObjectURL(this._objectUrl);
            }
            this._objectUrl = URL.createObjectURL(blob);

            return this._objectUrl;
        }

        private _isDataChanged(data: T, propertyName?: keyof T): boolean {
            var save = this._getMetadata(data).savedData;

            if(propertyName) {
                return save[propertyName]!==data[propertyName];
            } else {
                for(var prop in save) {
                    if(save[prop]===data[prop]) continue;
                    return true;
                }
                return false;
            }
        }

        public addNewRow(): void {
            this.loadObjects([<any>{}]);
        }

        public deleteRows(rows: number[]): void {
            this._dataView.beginUpdate();
            rows = rows.sort(Utils.sortNumberDescComparison);
            rows.forEach(row => {
                let item: any = this._dataView.getItemByIdx(row);
                if(item==null) {
                    console.warn("deleteRows: invalid row (" + row + ")");
                    return;
                }

                let meta = this._getMetadata(item);
                if(meta.state == EditState.Added) {
                    this._dataView.deleteItem(this._getDataId(item));
                    delete this._metadata[this._getDataId(item)];
                } else {
                    meta.state = EditState.Deleted;
                    this._grid.invalidateRow(row);
                }
            });
            this._dataView.endUpdate();
            this._grid.render();
        }

        public revertRows(rows: number[]): void {
            this._dataView.beginUpdate();
            rows = rows.sort(Utils.sortNumberDescComparison);
            rows.forEach(row => {
                let item: any = this._dataView.getItemByIdx(row);
                if(item==null) {
                    console.warn("revertRows: invalid row (" + row + ")");
                    return;
                }

                let meta = this._getMetadata(item);
                if(meta.state == EditState.Added) {
                    this._dataView.deleteItem(this._getDataId(item));
                    delete this._metadata[this._getDataId(item)];
                } else {
                    this._dataView.updateItem(this._getDataId(item), Utils.extend({}, meta.savedData));
                    meta.state = EditState.NotEdited;
                }
            });
            this._dataView.endUpdate();
        }

        public getColumns(): Column[] {
            return this._columns;
        }

        public getDataItem(indexOrId: number|string): object {
            if(typeof(indexOrId) == "number") {
                return this._dataView.getItemByIdx(indexOrId);
            } else {
                return this._dataView.getItemById(indexOrId);
            }
        }

        public getOptions(): GridOptions<T> {
            return this._options;
        }

        public getSelectedRows(): number[] {
            return this._grid.getSelectedRows();
        }

        public format(row: number, cell: number, value: any, columnDef: Column, dataContext: T, ret: Slick.IFormatterResult): Slick.IFormatterResult {
            var meta = this._getMetadata(dataContext);
            var className = "";

            switch(meta.state) {
                case EditState.Added: className = "SarapanGrid-cell-added"; break;
                case EditState.Changed: className = this._isDataChanged(dataContext, <keyof T>columnDef.field) ? "SarapanGrid-cell-changed" : ""; break;
                case EditState.Deleted: className = "SarapanGrid-cell-deleted"; break;
            }

            ret.addClasses = ret.addClasses + " " + className;

            return ret;
        }

        private _createCompoundFormatter(formatterList: Slick.IFormatter[]): Slick.IFormatter {
            var formatter: Slick.IFormatter;

            formatter = function(row, cell, value, columnDef, dataContext) {
                var ret = Utils.wrapFormatterResult(value);

                formatterList.forEach(formatter=>{ ret =
                    (<(row: number, cell: HTMLElement, value: any, columnDef: Column, dataContext: any, ret: Slick.IFormatterResult) => Slick.IFormatterResult>
                    formatter).call(null, row, cell, value, <Slick.IColumnOptions>columnDef, dataContext, Utils.wrapFormatterResult(ret))
                })

                return ret;
            }

            return formatter;
        }
        
    }


}

