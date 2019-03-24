declare namespace Slick {
    export class CellSelectionModel implements ISelectionModel {
        init(grid: Grid): void;
        destroy(): void;
        onSelectedRangesChanged: Slick.Event;
    }
}