declare namespace Slick.Data {
    export interface IDataView {
        getLength(): number;
        getItem(index: number): object;
        getItemMetadata(index: number): object;
    }

    export class DataView implements IDataView {
        getLength(): number;
        getItem(index: number): object;
        getItemMetadata(index: number): object;

        getItems(): object[];
        getItemById(id: string): object;
        getIdxById(id: string): number;
        getRowById(id: string): any;
        getItemByIdx(idx: number): object;
        mapIdsToRows(idArray: string[]): any[];
        mapRowsToIds(rowArray: any[]): string[];

        setItems(data: object, objectIdProperty?: string): void;

        onRowCountChanged: Slick.Event & {
            subscribe: (e: Slick.EventData, args: { previous: number; current: number; dataView: DataView; callingOnRowsChanged: boolean; }) => void;
        };
        onRowsChanged: Slick.Event & {
            subscribe: (e: Slick.EventData, args: { rows: number[], dataView: DataView, calledOnRowCountChanged: boolean; }) => void;
        };
        onRowsOrCountChanged: Slick.Event;
        onPagingInfoChanged: Slick.Event;

        beginUpdate(): void;
        endUpdate(): void;
        addItem(item: object): void;
        deleteItem(id: string): void;
        updateItem(id: string, item: object): void
    }
}